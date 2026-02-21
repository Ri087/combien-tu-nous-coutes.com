# Skill: Form Error Display

## When to Use

Use this skill whenever you need to display validation errors in forms. This covers field-level errors (under individual inputs), global/form-level errors (banner messages), and programmatic error setting from server responses.

## Prerequisites

- `FormMessage` and `FormGlobalMessage` are available from `@/components/ui/form`
- Form wrapper components from `/components/form/` handle field-level errors automatically
- Remix Icons are available from `@remixicon/react`

## Error Display Components

### FormMessage (Field-Level)

Small inline error text shown below an input field.

```tsx
import { FormMessage } from "@/components/ui/form";

// Renders only when children is truthy (returns null otherwise)
<FormMessage>{form.formState.errors.email?.message}</FormMessage>

// With explicit variant (default is "error")
<FormMessage variant="error">{errorMessage}</FormMessage>
<FormMessage variant="success">{successMessage}</FormMessage>
<FormMessage variant="warning">{warningMessage}</FormMessage>
<FormMessage variant="info">{infoMessage}</FormMessage>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Error message text; component returns `null` if falsy |
| `variant` | `"error" \| "success" \| "warning" \| "info"` | `"error"` | Visual style |
| `Icon` | `React.ElementType` | `RiErrorWarningFill` | Icon component |
| `className` | `string` | - | Additional CSS classes |

### FormGlobalMessage (Form-Level)

Banner-style message for form-wide errors or success messages. Displayed prominently above the submit button.

```tsx
import { RiErrorWarningFill, RiCheckboxCircleFill, RiMailCheckFill } from "@remixicon/react";
import { FormGlobalMessage } from "@/components/ui/form";

// Error banner
<FormGlobalMessage Icon={RiErrorWarningFill} variant="error">
  {error}
</FormGlobalMessage>

// Success banner
<FormGlobalMessage Icon={RiCheckboxCircleFill} variant="success">
  Your changes have been saved.
</FormGlobalMessage>

// Info banner
<FormGlobalMessage Icon={RiMailCheckFill} variant="info">
  Check your email for a confirmation link.
</FormGlobalMessage>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Message text; component returns `null` if falsy |
| `variant` | `"error" \| "success" \| "warning" \| "info"` | `"success"` | Visual style |
| `Icon` | `React.ElementType` | `RiErrorWarningFill` | Icon component |
| `className` | `string` | - | Additional CSS classes |

**Visual styles:**
- `error`: Red background (`bg-error-lighter`), red ring, red text
- `success`: Green background (`bg-success-lighter`), green ring, green text
- `warning`: Yellow background (`bg-warning-lighter`), yellow ring
- `info`: Blue background (`bg-information-lighter`), blue ring

## Step-by-Step Instructions

### Step 1: Field-Level Errors (Automatic)

When using form wrapper components (`FormInput`, `FormSelect`, etc.), field-level errors are handled automatically. The `FormField` base component renders `FormMessage` whenever `fieldState.error` exists.

```tsx
// This is all you need -- errors show automatically
<FormInput
  control={form.control}
  label="Email"
  name="email"
  placeholder="hello@example.com"
  required
/>
```

The `FormField` component renders:
```tsx
{error && <FormMessage>{error?.message?.toString()}</FormMessage>}
```

### Step 2: Field-Level Errors (Manual with register)

When using `register()` directly with AlignUI components, display errors manually:

```tsx
<div className="flex flex-col gap-1">
  <Label.Root htmlFor="email">
    Email <Label.Asterisk />
  </Label.Root>
  <Input.Root hasError={!!formState.errors.email}>
    <Input.Wrapper>
      <Input.Icon as={RiMailLine} />
      <Input.Input
        {...register("email")}
        id="email"
        placeholder="hello@example.com"
        type="email"
      />
    </Input.Wrapper>
  </Input.Root>
  <FormMessage>{formState.errors.email?.message}</FormMessage>
</div>
```

Key points:
- Pass `hasError={!!formState.errors.fieldName}` to `Input.Root` for red border styling
- Render `<FormMessage>` below the input with the error message
- `FormMessage` auto-hides when `children` is falsy

### Step 3: Global Form Errors

Use a `useState` for form-level errors and display with `FormGlobalMessage`:

```tsx
const [error, setError] = useState<string | null>(null);

const onSubmit = form.handleSubmit(async (data) => {
  setError(null); // Clear previous error

  try {
    await saveData(data);
  } catch (err) {
    setError("An error occurred. Please try again.");
  }
});

// In JSX, placed above the submit button:
<FormGlobalMessage Icon={RiErrorWarningFill} variant="error">
  {error}
</FormGlobalMessage>
```

### Step 4: Server-Side Errors with setError

Map server errors to specific form fields using `form.setError()`:

```tsx
const onSubmit = form.handleSubmit(async (data) => {
  const { error } = await authClient.forgetPassword.emailOtp({
    email: data.email,
  });

  if (error) {
    // Target a specific field
    form.setError("email", {
      message: error.message,
    });
    return;
  }

  setSuccess(true);
});
```

For multiple field errors from a server response:

```tsx
const onSubmit = form.handleSubmit(async (data) => {
  try {
    await orpc.users.update(data);
  } catch (err) {
    if (err instanceof ValidationError && err.fieldErrors) {
      // Set error on each field
      for (const [field, message] of Object.entries(err.fieldErrors)) {
        form.setError(field as keyof FormValues, { message });
      }
    } else {
      // Fall back to global error
      setError("An unexpected error occurred");
    }
  }
});
```

### Step 5: Clearing Errors

```tsx
// Clear a specific field error
form.clearErrors("email");

// Clear multiple field errors
form.clearErrors(["email", "password"]);

// Clear ALL errors
form.clearErrors();
```

Errors are also automatically cleared when:
- The user modifies a field (if `mode: "onChange"` or `mode: "onBlur"` is set)
- The form is reset with `form.reset()`
- A successful submission occurs

### Step 6: Combining Error and Success Messages

A common pattern is to show either an error or a success message:

```tsx
const [error, setError] = useState<string | null>(null);
const [success, setSuccess] = useState(false);

// In JSX:
{success && (
  <FormGlobalMessage Icon={RiCheckboxCircleFill} variant="success">
    Check your email for a password reset link.
  </FormGlobalMessage>
)}

{error && !success && (
  <FormGlobalMessage Icon={RiErrorWarningFill} variant="error">
    {error}
  </FormGlobalMessage>
)}
```

Or with mutually exclusive display from URL parameters:

```tsx
const [{ message, error: errorQuery }] = useQueryStates(messageParsers);

<FormGlobalMessage Icon={RiErrorWarningFill} variant="error">
  {error}
</FormGlobalMessage>

{message && !error && (
  <FormGlobalMessage Icon={RiCheckboxCircleFill} variant="success">
    {message}
  </FormGlobalMessage>
)}
```

## Common Icon Choices

```tsx
import {
  RiErrorWarningFill,     // Error messages
  RiCheckboxCircleFill,   // Success messages
  RiMailCheckFill,         // Email-related success
  RiInformationFill,      // Info / hint messages
  RiAlertFill,             // Warning messages
} from "@remixicon/react";
```

## Critical Rules

1. **Always clear errors at the start of submission** -- `setError(null)` prevents stale errors
2. **FormMessage returns null when children is falsy** -- safe to always render it
3. **FormGlobalMessage returns null when children is falsy** -- safe to always render it
4. **Use `hasError` prop on `Input.Root`** -- provides the red border styling for error state
5. **Place FormGlobalMessage above the submit button** -- follows the established pattern
6. **Use `form.setError()` for server field errors** -- maps them to the correct input
7. **Never show raw error objects** -- always extract `.message` or provide a user-friendly string
8. **Prefer specific field errors over global errors** -- guide the user to the exact problem
