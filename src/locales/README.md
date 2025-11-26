# Internationalization (i18n) Setup

This project supports English (en) and Japanese (ja) languages using Next.js Pages Router i18n.

## How to Use

### In Components

Use the `useTranslation` hook to access translations:

```tsx
import { useTranslation } from "~/hooks/useTranslation";

export default function MyComponent() {
  const { t, locale } = useTranslation();

  return (
    <div>
      <h1>{t("home.title")}</h1>
      <p>{t("common.loading")}</p>
      <p>{t("common.welcome", { name: "John" })}</p>
    </div>
  );
}
```

### Translation Paths

Translations are organized in nested objects. Use dot notation to access them:

- `common.loading` → "Loading..." (en) / "読み込み中..." (ja)
- `home.title` → "Daycare Management" (en) / "保育園管理" (ja)
- `common.welcome` → "Welcome, {name}" (en) / "{name}さん、ようこそ" (ja)

### Adding New Translations

1. Add the English translation to `src/locales/en.json`
2. Add the Japanese translation to `src/locales/ja.json`
3. Use the same nested structure in both files

### Language Switcher

Use the `LanguageSwitcher` component to allow users to switch languages:

```tsx
import { LanguageSwitcher } from "~/components/shared/LanguageSwitcher";

export default function Header() {
  return (
    <header>
      <LanguageSwitcher />
    </header>
  );
}
```

### URL Structure

With i18n enabled, URLs automatically include the locale:

- English: `/en/dashboard` or `/dashboard` (default)
- Japanese: `/ja/dashboard`

The locale is automatically detected from the browser's language preferences.
