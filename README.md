# Daycare Management System

A comprehensive hospital daycare management system built with the T3 Stack (Next.js, tRPC, Drizzle ORM, NextAuth). This application enables hospitals to manage sick-child daycare services, allowing parents to register visits, track their children's care in real-time, and access visit history.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Features](#features)
- [User Roles](#user-roles)
- [API Structure](#api-structure)
- [Internationalization](#internationalization)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Development](#development)
- [Database Migrations](#database-migrations)
- [Environment Variables](#environment-variables)

## Overview

This is a full-stack daycare management system designed for hospitals to provide sick-child daycare services. The system supports three main user roles (Admin, Nurse, Parent) with role-based access control and real-time care tracking.

### Key Capabilities

- **Hospital Management**: Admins can create and manage hospital locations with capacity and pricing
- **Staff Management**: Admins can register nurses and assign them to hospitals
- **Patient Management**: Nurses and parents can register children and their medical information
- **Visit Management**: Parents can register visits with location-based access codes, nurses can track care
- **Real-time Logging**: Nurses can log events (meals, medication, temperature, activities) during visits
- **AI Visit Summaries**: Automatically generates daily summaries using AI based on logged events
- **Visit History**: Parents can view complete visit history and care timelines
- **Multi-language Support**: English and Japanese translations
- **Image Management**: S3-backed secure photo storage for child profiles

## Tech Stack

### Core Framework

- **Next.js 15.2.3** - React framework with App Router
- **React 19.0.0** - UI library
- **TypeScript 5.8.2** - Type safety

### Backend & API

- **tRPC 11.0.0** - End-to-end typesafe APIs
- **NextAuth.js 5.0.0-beta.29** - Authentication with Google OAuth
- **Drizzle ORM 0.41.0** - TypeScript ORM for PostgreSQL
- **PostgreSQL** - Database (via `postgres` package)
- **Zod 3.25.76** - Schema validation

### UI & Styling

- **Tailwind CSS 4.0.15** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Framer Motion 12.23.24** - Animation library
- **Recharts 3.5.0** - Chart library for temperature graphs
- **Lucide React** - Icon library

### Internationalization

- **next-intl 4.5.5** - Internationalization framework
- Supports: English (en), Japanese (ja)

### Additional Libraries

- **React Hook Form 7.65.0** - Form management
- **@tanstack/react-query 5.69.0** - Data fetching and caching
- **openai 4.28.0** - AI summary generation
- **@aws-sdk/client-s3** - AWS S3 integration for image storage
- **@aws-sdk/s3-request-presigner** - Secure upload URL generation
- **@react-google-maps/api** - Google Maps integration
- **use-places-autocomplete** - Address autocomplete
- **node-timezone** - Timezone calculations for access codes

## Architecture

### Application Structure

```
┌─────────────────────────────────────────┐
│         Next.js Pages Router           │
│  (index.tsx, dashboard.tsx, etc.)       │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         React Components                │
│  (Dashboards, Forms, Visit Views)       │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         tRPC Client                     │
│  (Type-safe API calls)                  │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         tRPC Server                     │
│  (Routers: visit, patient, hospital)   │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Drizzle ORM                      │
│  (Database queries)                     │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         PostgreSQL Database             │
└─────────────────────────────────────────┘
```

### Authentication Flow

1. User signs in with Google OAuth via NextAuth
2. NextAuth callback checks if user email matches:
   - Nurse record → Sets role to "nurse" and links userId
   - Parent record → Sets role to "parent" and links userId
   - New user → Creates parent record and sets role to "parent"
3. Session includes user role for authorization

### Access Code System

- **Location-based**: Generated from hospital ID, coordinates, and local date
- **Time-sensitive**: Changes daily based on hospital's timezone
- **4-digit code**: SHA-256 hash converted to 4-digit number
- Parents must provide code when creating visits
- Nurses can view current code for their hospital

## Database Schema

### Core Tables

#### `daycare_user`

- Authentication users (NextAuth)
- Fields: `id`, `name`, `email`, `emailVerified`, `image`, `role`
- Roles: `admin`, `nurse`, `parent` (nullable, set on first sign-in)

#### `daycare_hospital`

- Hospital locations
- Fields: `id`, `name`, `address`, `latitude`, `longitude`, `capacity`, `pricing`
- Default capacity: 20 children

#### `daycare_nurse`

- Nurse profiles linked to hospitals
- Fields: `id`, `name`, `email`, `hospitalId`, `userId` (linked after sign-in)
- Email must be unique for automatic linking

#### `daycare_parent`

- Parent/guardian profiles
- Fields: `id`, `name`, `email`, `phoneNumber`, `homeAddress`, `latitude`, `longitude`, `userId`
- Auto-created on first sign-in if not exists

#### `daycare_child`

- Child/patient profiles
- Fields: `id`, `name`, `pronunciation` (optional), `gender` (Male/Female), `birthdate`, `allergies`, `preexistingConditions`, `familyDoctorName`, `familyDoctorPhone`

#### `daycare_parent_child_relation`

- Links parents to children
- Fields: `id`, `parentId`, `childId`, `relationshipType`

#### `daycare_visit`

- Daycare visit records
- Fields: `id`, `parentId`, `childId`, `hospitalId`, `dropOffTime`, `pickupTime`, `status`, `healthCheck` (JSONB), `reason`, `notes`
- Status: `active`, `completed`, `cancelled`
- Reason: Optional text field for visit reason (e.g., "Fever, Asthma/Rash")

#### `daycare_log`

- Care event logs during visits
- Fields: `id`, `visitId`, `nurseId`, `timestamp`, `eventType`, `eventData` (JSONB), `notes`, `customMemo`
- Event types: `Pee`, `Poo`, `Puke`, `Eat`, `Drink`, `Medication`, `Sleep`, `Play`, `Tantrum`, `Temperature`, `Note`
- Cascade deletes when visit is deleted

### Relationships

- Hospital → Nurses (one-to-many)
- Hospital → Visits (one-to-many)
- Parent → Children (many-to-many via `parent_child_relation`)
- Parent → Visits (one-to-many)
- Child → Visits (one-to-many)
- Visit → Logs (one-to-many, cascade delete)
- Nurse → Logs (one-to-many)

## Features

### Admin Features

- Create, update, delete hospitals
- Register nurses and assign to hospitals
- View all hospitals and their details
- Manage hospital capacity and pricing

### Nurse Features

- View active visits at their assigned hospital
- View today's completed visits
- View child information with reason for visit and expandable visit history
- Create new visits (for new or returning patients) with:
  - Reason for visit (quick-select pills: Fever, Asthma/Rash, Infectious Disease, Undiagnosed + custom text)
  - Pickup time and notes
- Register new patients (parent + child)
- Log care events during visits:
  - Output events (Pee, Poo, Puke) with tags
  - Intake events (Eat, Drink, Medication) with tags
  - Activity events (Sleep, Play, Tantrum) with tags
  - Temperature readings
  - General notes
- Update visit information
- Complete visits with AI-assisted summary generation
- View visit details with timeline, health checks, and nurse notes
- Print completed visit reports (streamlined layout with summary)
- Generate and view access code for their hospital

### Parent Features

- Register children with medical information
- View all their children with reason for visit displayed
- Register visits at hospitals (with access code) including:
  - Reason for visit (quick-select pills + custom text)
  - Pickup time and notes
- View active visits for their children
- View visit history for each child
- View detailed visit information with:
  - Care timeline with all logged events
  - Temperature chart
  - Health check information
  - Visit duration and notes

## User Roles

### Admin

- **Access**: Full system access
- **Can**: Manage hospitals, register nurses, view all data
- **Restrictions**: None

### Nurse

- **Access**: Hospital-specific data
- **Can**:
  - View/manage visits at their assigned hospital
  - Create visits and register new patients
  - Log care events
  - Generate access codes
- **Restrictions**: Only sees data for their assigned hospital

### Parent

- **Access**: Own children and visits
- **Can**:
  - Manage their children's profiles
  - Register visits (with access code)
  - View visit history and care timelines
- **Restrictions**: Only sees their own children and visits

## API Structure

### tRPC Routers

All API endpoints are type-safe via tRPC. Routers are located in `src/server/api/routers/`:

#### `hospital.ts`

- `create` (admin) - Create hospital
- `getAll` (admin) - Get all hospitals
- `getAllPublic` (protected) - Get hospitals for selection
- `getById` (admin) - Get hospital by ID
- `update` (admin) - Update hospital
- `delete` (admin) - Delete hospital
- `getAccessCode` (nurse) - Get current access code
- `validateAccessCode` (protected) - Validate access code

#### `visit.ts`

- `create` (protected) - Create visit (role-based logic)
- `getMyHospitalActiveVisits` (nurse) - Get active visits at nurse's hospital
- `getMyHospitalTodaysCompletedVisits` (nurse) - Get today's completed visits
- `getById` (nurse) - Get visit details (nurse view)
- `getMyChildrenActiveVisits` (parent) - Get active visits for parent's children
- `getChildVisitHistory` (protected) - Get visit history for a child (parent sees all, nurse sees their hospital only)
- `getByIdForParent` (parent) - Get visit details with logs (parent view)
- `update` (nurse) - Update visit
- `delete` (nurse) - Delete visit

#### `patient.ts`

- `searchChildren` (nurse) - Search children by name
- `searchParents` (nurse) - Search parents by name/phone
- `createParent` (protected) - Create parent (nurse/admin only)
- `createChild` (protected) - Create child
- `updateParent` (parent) - Update own parent profile
- `getMyProfile` (parent) - Get own parent profile
- `getChildrenByParentId` (protected) - Get children by parent (nurse/admin only)
- `getMyChildren` (parent) - Get own children
- `updateChild` (parent) - Update own child
- `deleteChild` (parent) - Delete own child

#### `logs.ts`

- `create` (nurse) - Create log entry for visit
- `getByVisit` (nurse) - Get logs for a visit

#### `nurse.ts`

- Nurse management endpoints (admin only)

#### `user.ts`

- User management endpoints

#### `post.ts`

- Example/placeholder router

### Procedure Types

- `publicProcedure` - No authentication required
- `protectedProcedure` - Requires authentication
- `adminProcedure` - Requires admin role
- `nurseProcedure` - Requires nurse role
- `parentProcedure` - Requires parent role

## Internationalization

The application supports English and Japanese. All user-facing text uses `next-intl`.

### Translation Files

- `src/locales/en.json` - English translations
- `src/locales/ja.json` - Japanese translations

### Translation Sections

- `common.*` - Shared UI elements (buttons, actions)
- `home.*` - Home page content
- `dashboard.*` - Dashboard pages (admin, nurse, parent)
- `visit.*` - Visit-related content
- `forms.*` - Form labels and placeholders
- `hospital.*` - Hospital management
- `eventTypes.*` - Event type names
- `tags.*` - Tag names for events
- `healthCheck.*` - Health check labels
- `eventCategories.*` - Event categories
- `timeline.*` - Timeline text

### Usage in Components

```tsx
import { useTranslations } from "next-intl";

export default function MyComponent() {
  const t = useTranslations();

  return <h1>{t("common.loading")}</h1>;
}
```

### Helper Functions

For dynamic event types and tags, use helpers from `src/utils/translations.ts`:

```tsx
import { getTranslatedEventType, getTranslatedTag } from "~/utils/translations";

const translatedType = getTranslatedEventType(t, eventType);
const translatedTag = getTranslatedTag(t, tag);
```

See `.cursorrules` for detailed i18n guidelines.

## Project Structure

```
daycare/
├── src/
│   ├── app/                    # Next.js App Router (if used)
│   │   └── api/
│   │       └── auth/
│   │           └── [...nextauth]/
│   │               └── route.ts
│   ├── components/
│   │   ├── dashboards/         # Role-specific dashboards
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── NurseDashboard.tsx
│   │   │   └── ParentDashboard.tsx
│   │   ├── forms/              # Form components
│   │   │   ├── ChildForm.tsx
│   │   │   ├── HospitalForm.tsx
│   │   │   ├── IntakeVisitDetails.tsx  # Reason/pickup/notes for visits
│   │   │   ├── NurseForm.tsx
│   │   │   ├── VisitForm.tsx
│   │   │   └── RegisterVisitForm.tsx
│   │   ├── parent/             # Child/visit display components (shared)
│   │   │   ├── ChildrenList.tsx
│   │   │   ├── ChildItem.tsx       # Reusable for parent & nurse views
│   │   │   └── ChildVisitHistory.tsx  # Expandable visit history
│   │   ├── visit/              # Visit-related components
│   │   │   ├── VisitTimelineView.tsx
│   │   │   ├── VisitHeader.tsx
│   │   │   ├── VisitQuickAddGrid.tsx
│   │   │   ├── TemperatureChart.tsx
│   │   │   ├── SIDSTimeline.tsx    # SIDS check display component
│   │   │   └── eventTypes.ts
│   │   ├── shared/             # Shared components
│   │   │   ├── DashboardHeader.tsx
│   │   │   ├── SearchComponent.tsx
│   │   │   └── LanguageSwitcher.tsx
│   │   └── ui/                 # UI primitives (shadcn/ui)
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       └── ...
│   ├── hooks/                  # Custom React hooks
│   │   └── useHospitalLocation.ts
│   ├── lib/                    # Utility libraries
│   │   ├── access-code.ts     # Access code generation/validation
│   │   └── utils.ts
│   ├── locales/                # Translation files
│   │   ├── en.json
│   │   └── ja.json
│   ├── pages/                  # Next.js Pages Router
│   │   ├── _app.tsx
│   │   ├── index.tsx           # Home page
│   │   ├── dashboard.tsx       # Main dashboard
│   │   ├── hospital/
│   │   │   └── [id].tsx        # Hospital detail page
│   │   ├── visit/
│   │   │   ├── [id].tsx        # Visit detail (nurse)
│   │   │   ├── [id]/
│   │   │   │   └── print.tsx   # Printable visit report (nurse)
│   │   │   └── parent/
│   │   │       └── [id].tsx    # Visit detail (parent)
│   │   └── api/
│   │       └── trpc/
│   │           └── [trpc].ts   # tRPC API endpoint
│   ├── server/
│   │   ├── api/
│   │   │   ├── routers/        # tRPC routers
│   │   │   │   ├── hospital.ts
│   │   │   │   ├── visit.ts
│   │   │   │   ├── patient.ts
│   │   │   │   ├── logs.ts
│   │   │   │   └── ...
│   │   │   ├── root.ts         # Root router
│   │   │   └── trpc.ts         # tRPC setup
│   │   ├── auth/
│   │   │   ├── config.ts       # NextAuth configuration
│   │   │   └── index.ts
│   │   └── db/
│   │       ├── schema.ts       # Drizzle schema
│   │       └── index.ts        # Database connection
│   ├── styles/
│   │   └── globals.css         # Global styles
│   ├── types/
│   │   └── i18n.ts             # i18n type definitions
│   └── utils/
│       ├── api.ts              # tRPC client setup
│       ├── geolocation.ts     # Geolocation utilities
│       └── translations.ts     # Translation helpers
├── drizzle/                    # Database migrations
│   ├── 0000_chubby_molten_man.sql
│   ├── 0001_rename_kid_to_child.sql
│   ├── 0002_add_user_role.sql
│   ├── 0003_add_coordinates.sql
│   ├── 0004_add_cascade_delete_logs.sql
│   ├── 0005_add_health_check.sql
│   ├── 0006_replace_age_with_birthdate.sql
│   ├── 0007_add_pronunciation_and_gender.sql
│   ├── 0008_add_cascade_delete_children.sql
│   └── 0009_add_visit_reason.sql
├── public/                      # Static assets
├── .cursorrules                 # Cursor IDE rules
├── drizzle.config.ts            # Drizzle configuration
├── next.config.js               # Next.js configuration
├── package.json
├── tsconfig.json
└── README.md
```

## Setup & Installation

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Google OAuth credentials (for authentication)
- (Optional) Google Maps API key (for address autocomplete)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd daycare
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration (see [Environment Variables](#environment-variables))

4. **Set up the database**

   ```bash
   # Run migrations
   npm run db:migrate

   # Or push schema directly (development)
   npm run db:push
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open the application**
   Navigate to `http://localhost:3000`

## Development

### Available Scripts

- `npm run dev` - Start development server with Turbo
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run typecheck` - Run TypeScript type checking
- `npm run format:check` - Check code formatting
- `npm run format:write` - Format code with Prettier
- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema changes to database (dev)
- `npm run db:studio` - Open Drizzle Studio (database GUI)

### Development Workflow

1. **Making Schema Changes**
   - Edit `src/server/db/schema.ts`
   - Run `npm run db:generate` to create migration
   - Review generated SQL in `drizzle/` directory
   - Run `npm run db:migrate` to apply migration

2. **Adding New Features**
   - Create tRPC procedures in appropriate router
   - Add translations to both `en.json` and `ja.json`
   - Create React components in `src/components/`
   - Add pages in `src/pages/` if needed

3. **Testing Authentication**
   - Use Google OAuth for sign-in
   - First-time users are auto-assigned "parent" role
   - To create admin/nurse: manually set role in database or create nurse record with matching email

### Code Style

- TypeScript strict mode enabled
- ESLint for linting
- Prettier for formatting
- Tailwind CSS for styling
- All user-facing text must be translated

## Database Migrations

Migrations are managed with Drizzle Kit. Migration files are stored in `drizzle/` directory.

### Creating Migrations

```bash
# After modifying schema.ts
npm run db:generate
```

### Applying Migrations

```bash
# Apply all pending migrations
npm run db:migrate
```

### Viewing Database

```bash
# Open Drizzle Studio
npm run db:studio
```

## Environment Variables

Required environment variables (defined in `src/env.js`):

### Server Variables

- `AUTH_SECRET` - NextAuth secret (required in production)
- `AUTH_GOOGLE_ID` - Google OAuth client ID
- `AUTH_GOOGLE_SECRET` - Google OAuth client secret
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Environment (development/test/production)
- `OPENAI_API_KEY` - OpenAI API Key for summary generation
- `AWS_REGION` - AWS Region (e.g., us-east-1)
- `AWS_ACCESS_KEY_ID` - AWS Access Key ID
- `AWS_SECRET_ACCESS_KEY` - AWS Secret Access Key
- `AWS_S3_BUCKET_NAME` - S3 Bucket Name
- `AWS_CLOUDFRONT_URL` - (Optional) CloudFront Distribution URL for image CDN

### Client Variables

- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - (Optional) Google Maps API key for address autocomplete

### Example `.env` file

```env
AUTH_SECRET=your-secret-here
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
DATABASE_URL=postgresql://user:password@localhost:5432/daycare
NODE_ENV=development
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-maps-api-key
OPENAI_API_KEY=sk-your-openai-key
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET_NAME=your-bucket-name
AWS_CLOUDFRONT_URL=https://your-distribution.cloudfront.net
```

## Additional Notes

### Access Code Algorithm

Access codes are generated using:

- Hospital ID
- Hospital coordinates (latitude, longitude)
- Hospital's local date (timezone-aware)

The code changes daily and is location-specific, ensuring parents must be physically present or have the current code from the hospital.

### Event Types

The system supports various event types organized by category:

- **Output**: Pee, Poo, Puke
- **Intake**: Eat, Drink, Medication
- **Activity**: Sleep, Play, Tantrum
- **Other**: Temperature, Note, SIDS

Each event type can have associated tags for more detailed logging.

### SIDS Checks

SIDS (Sudden Infant Death Syndrome) checks are handled specially:

- **Auto-logging**: Clicking the SIDS button immediately logs without opening a modal
- **Separate display**: SIDS logs are shown in a dedicated card, not in the main timeline
- **Consistent styling**: Uses same white card with gray border styling as other sections
- **Compact header**: Shows "SIDS Checks (count)" with "x minutes ago" for active visits
- **Expandable**: Click to see full list with timestamps and nurse names
- **Conditional**: Only shows when there's at least one SIDS check logged
- **Nurse-only**: Not displayed in parent view
- **Print support**: Automatically expanded in print view

### Health Checks

Health checks are stored as JSONB in the `visits` table, allowing flexible health indicator tracking (cough, mood, appetite, etc.).

### Visit Reasons

When creating a visit, users can specify a reason using:

- **Quick-select pills**: Fever, Asthma/Rash, Infectious Disease, Undiagnosed
- **Custom text field**: For other reasons not covered by pills
- **Multi-select**: Multiple pills can be selected and combined with custom text

The combined reason is stored as a comma-separated string (e.g., "Fever, Asthma/Rash, stomach pain").

### AI Summaries

When completing a visit, the system uses OpenAI to generate a short, friendly summary of the day's events.
It takes into account:

- Child's age and name
- Health check data (mood, appetite, etc.) mapped to human-readable text
- All logged events (meals, naps, diaper changes)
- The user's locale (generates in English or Japanese accordingly)

### Visit Completion Workflow

The visit completion process is designed to be efficient and informative:

1.  **Summary Generation**: Nurse clicks "Complete Visit" and can use AI to generate a summary based on the day's logs and health data.
2.  **Status Update**: Visit status changes to `completed`, locking editable fields (health check, logs).
3.  **Visual Indicators**: A "Completed" badge appears in the header, and the summary note is displayed in a dedicated section below the child's details.
4.  **Print Redirection**: Upon completion, the system automatically redirects to the print view for easy report generation.

### Image Storage

Images (child profiles) are stored in AWS S3 and served via CloudFront CDN.

- **Direct Upload**: Browser uploads directly to S3 using presigned URLs
- **Secure**: Uses server-side authentication to generate upload signatures
- **Optimized**: Served via CDN for fast global access
- **UI**: Modern drag-and-drop interface with camera support

---

For detailed information about internationalization, see `.cursorrules`.
