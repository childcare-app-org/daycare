# Address Autocomplete & Distance-Based Hospital Sorting

## Implementation Complete! 🎉

This document describes the new features that have been added to the daycare system.

## Features Added

### 1. **Address Autocomplete with Mapbox**

- Reusable `AddressAutocomplete` component that provides real-time address suggestions
- Automatically captures latitude and longitude coordinates for addresses
- Used in:
  - Hospital creation/editing forms
  - Parent profile forms (when implemented)

### 2. **Distance-Based Hospital Sorting**

- When registering a visit, hospitals are automatically sorted by distance
- Distance calculation priority:
  1. **First priority**: User's current browser location (via GPS)
  2. **Fallback**: Parent's home address from their profile
- Displays distance in kilometers next to each hospital in the dropdown
- Shows clear status messages about which location is being used

### 3. **Geolocation Utilities**

- Distance calculation using the Haversine formula
- Browser geolocation support with fallback
- Formatting for human-readable distances (e.g., "2.5 km" or "850 m")

## Setup Instructions

### Step 1: Update Your `.env` File

You mentioned you created a `MAPBOX_KEY` in your `.env` file. Please update it to use the correct format:

```bash
# In your .env file, change:
# MAPBOX_KEY=your_mapbox_token_here

# To:
NEXT_PUBLIC_MAPBOX_KEY=your_mapbox_token_here
```

**Why `NEXT_PUBLIC_`?**
This prefix is required for environment variables that need to be accessed in the browser (client-side). The Mapbox API calls happen in the browser, so the key needs to be publicly accessible.

### Step 2: Run Database Migration

Apply the schema changes to add latitude and longitude fields:

```bash
npm run db:push
```

This will add `latitude` and `longitude` columns to both the `hospitals` and `parents` tables.

### Step 3: Start the Development Server

```bash
npm run dev
```

## Database Schema Changes

### `hospitals` Table

- Added: `latitude` (numeric, optional)
- Added: `longitude` (numeric, optional)

### `parents` Table

- Added: `latitude` (numeric, optional)
- Added: `longitude` (numeric, optional)

## New Files Created

1. **`src/components/forms/AddressAutocomplete.tsx`**
   - Reusable address autocomplete component
   - Integrates with Mapbox Geocoding API
   - Debounced search for performance

2. **`src/utils/geolocation.ts`**
   - `getCurrentLocation()` - Gets browser location
   - `calculateDistance()` - Haversine formula for distance
   - `formatDistance()` - Human-readable distance formatting
   - `sortByDistance()` - Generic distance-based sorting utility

3. **`drizzle/0003_add_coordinates.sql`**
   - Database migration for lat/lng columns

## Modified Files

### Forms

- **`HospitalForm.tsx`** - Now uses AddressAutocomplete
- **`RegisterVisitForm.tsx`** - Implements distance-based sorting with real-time location

### Backend (tRPC Routers)

- **`hospital.ts`** - Updated to handle lat/lng in create/update/getAllPublic
- **`patient.ts`** - Updated updateParent to accept lat/lng, added getMyProfile query

### Configuration

- **`env.js`** - Added NEXT_PUBLIC_MAPBOX_KEY validation
- **`schema.ts`** - Added lat/lng fields to hospitals and parents tables

## How It Works

### Hospital Creation Flow

1. Admin starts typing an address in the HospitalForm
2. AddressAutocomplete component queries Mapbox API
3. Admin selects an address from suggestions
4. Coordinates are automatically captured and stored in the database

### Visit Registration Flow

1. Parent opens "Register for Visit" dialog
2. System attempts to get current GPS location
3. If GPS unavailable, falls back to parent's home address
4. All hospitals are sorted by distance from the reference location
5. Dropdown shows hospitals in order with distance displayed
6. Parent selects nearest hospital and submits

## Testing the Features

### Test Address Autocomplete

1. Log in as Admin
2. Go to create/edit hospital
3. Start typing an address in the Address field
4. You should see suggestions appear after typing 3+ characters
5. Select a suggestion - the full address will be saved with coordinates

### Test Distance-Based Sorting

1. Create a few hospitals with different addresses
2. Log in as a Parent
3. Click "Register for Visit" for a child
4. Browser will ask for location permission (you can allow or deny)
5. Check the hospital dropdown:
   - Should show hospitals sorted by distance
   - Each hospital should display distance (e.g., "Hospital A - $50/day (2.3 km)")
   - Status message shows if using current location or home address

## Troubleshooting

### "Invalid environment variables" error

- Make sure your `.env` file has `NEXT_PUBLIC_MAPBOX_KEY` (with the `NEXT_PUBLIC_` prefix)
- Restart your dev server after changing `.env`

### Address suggestions not appearing

- Check that your Mapbox API key is valid
- Open browser DevTools Console to see any API errors
- Verify you're typing at least 3 characters

### Hospitals not sorting by distance

- Ensure hospitals have been created/updated with the new address autocomplete
- Old hospitals without coordinates will appear at the bottom of the list
- Check browser console for geolocation errors

### Location permission denied

- The system will automatically fall back to the parent's home address
- If parent also has no coordinates, hospitals will appear unsorted

## Next Steps

### Optional Enhancements

1. **Add parent profile form** - Create a form for parents to update their home address with the AddressAutocomplete component
2. **Show map view** - Display hospitals on a map with Mapbox
3. **Distance radius filter** - Allow filtering hospitals within X kilometers
4. **Route directions** - Add "Get Directions" links to hospitals

## API Reference

### AddressAutocomplete Component Props

```typescript
interface AddressAutocompleteProps {
  id?: string; // Input field ID
  label?: string; // Label text
  value: string; // Current address value
  onChange: (data: AddressData) => void; // Callback with address + coords
  required?: boolean; // Whether field is required
  placeholder?: string; // Placeholder text
  helperText?: string; // Helper text below input
}

interface AddressData {
  address: string; // Full formatted address
  latitude: number; // Geographic latitude
  longitude: number; // Geographic longitude
}
```

## Support

If you encounter any issues or have questions:

1. Check browser console for errors
2. Verify environment variables are set correctly
3. Ensure database migrations have been applied
4. Check that Mapbox API key has appropriate permissions (geocoding API)
