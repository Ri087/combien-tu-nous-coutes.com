# Notification and Toast

## When to use

- **Toast (Sonner)**: Quick feedback messages (success, error, info) that auto-dismiss. Best for: form submissions, API responses, simple confirmations.
- **Notification (Radix Toast)**: Rich, styled notifications with icons, actions, and swipe-to-dismiss. Best for: important alerts, action-required messages, feature announcements.

Choose Toast for simple messages. Choose Notification for rich, branded alerts.

## Toast (Sonner) -- Recommended for most cases

### Import

```tsx
import { toast } from 'sonner';
```

### Setup

The `Toaster` component is already configured in `app/providers.tsx` with:
- `position="top-center"`
- `richColors` enabled
- `expand` enabled
- Custom AlignUI styling applied automatically

You do NOT need to add `<Toaster />` again.

### Usage

```tsx
'use client';

import { toast } from 'sonner';

// Success
toast.success('Project created successfully');

// Error
toast.error('Failed to save changes');

// Warning
toast.warning('Your session is about to expire');

// Info
toast.info('New update available');

// Loading
toast.loading('Saving...');

// Default (neutral)
toast('Something happened');

// Promise-based (shows loading, then success/error)
toast.promise(saveData(), {
  loading: 'Saving...',
  success: 'Saved successfully!',
  error: 'Failed to save',
});
```

### Toast with description

```tsx
toast.success('Project created', {
  description: 'Your new project "Dashboard" has been created.',
});
```

### Toast with action

```tsx
toast('File deleted', {
  action: {
    label: 'Undo',
    onClick: () => restoreFile(),
  },
});
```

### Toast with custom duration

```tsx
toast.success('Saved!', {
  duration: 5000, // 5 seconds (default is 4000)
});
```

### Dismiss a toast

```tsx
const toastId = toast.loading('Processing...');

// Later:
toast.dismiss(toastId);

// Or replace it:
toast.success('Done!', { id: toastId });
```

## Notification (Radix-based) -- For rich alerts

### Import

```tsx
import { useNotification, notification } from '@/hooks/use-notification';
```

### Setup

The `NotificationProvider` is already in `app/providers.tsx`. You do NOT need to add it.

### Usage with hook

```tsx
'use client';

import { useNotification } from '@/hooks/use-notification';

function MyComponent() {
  const { notification } = useNotification();

  const handleClick = () => {
    notification({
      status: 'success',
      variant: 'filled',
      title: 'Project created',
      description: 'Your new project has been successfully created.',
    });
  };

  return <button onClick={handleClick}>Create</button>;
}
```

### Usage with standalone function

```tsx
import { notification } from '@/hooks/use-notification';

// Can be called outside of React components
notification({
  status: 'error',
  variant: 'stroke',
  title: 'Upload failed',
  description: 'The file exceeds the maximum size limit.',
});
```

### Notification Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `status` | `'success' \| 'warning' \| 'error' \| 'information' \| 'feature'` | Required | Determines icon and color |
| `variant` | `'filled' \| 'light' \| 'lighter' \| 'stroke'` | `'filled'` | Visual style |
| `title` | `string` | -- | Bold title text |
| `description` | `React.ReactNode` | -- | Description text or JSX |
| `action` | `React.ReactNode` | -- | Action buttons |
| `disableDismiss` | `boolean` | `false` | Hide the close button |

### Status Icons (auto-assigned)

| Status | Icon |
|--------|------|
| `success` | `RiCheckboxCircleFill` |
| `warning` | `RiAlertFill` |
| `error` | `RiErrorWarningFill` |
| `information` | `RiInformationFill` |
| `feature` | `RiMagicFill` |

### Variant Styles

| Variant | Description |
|---------|------------|
| `filled` | Solid color background matching status, white text |
| `light` | Medium-intensity background, dark text |
| `lighter` | Subtle background, dark text |
| `stroke` | White background with border, colored icon |

### Notification with action buttons

```tsx
import * as Button from '@/components/ui/button';

notification({
  status: 'information',
  variant: 'stroke',
  title: 'New version available',
  description: 'Version 2.0 is ready to install.',
  action: (
    <>
      <Button.Root variant="primary" size="sm" mode="filled">
        <span>Update now</span>
      </Button.Root>
      <Button.Root variant="neutral" size="sm" mode="ghost">
        <span>Later</span>
      </Button.Root>
    </>
  ),
});
```

### Dismiss and update

```tsx
const { notification, dismiss } = useNotification();

const { id, dismiss: dismissThis, update } = notification({
  status: 'information',
  title: 'Processing...',
});

// Later, update it:
update({ title: 'Almost done...' });

// Or dismiss it:
dismissThis();

// Or dismiss all:
dismiss();
```

## Common Patterns

### After form submission (Toast)

```tsx
const onSubmit = async (data: FormData) => {
  try {
    await createProject(data);
    toast.success('Project created successfully');
  } catch (error) {
    toast.error('Failed to create project');
  }
};
```

### After mutation with React Query (Toast)

```tsx
const mutation = useMutation({
  mutationFn: createProject,
  onSuccess: () => {
    toast.success('Project created');
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  },
  onError: () => {
    toast.error('Failed to create project');
  },
});
```

### Important system alert (Notification)

```tsx
notification({
  status: 'warning',
  variant: 'lighter',
  title: 'Subscription expiring',
  description: 'Your plan expires in 3 days. Upgrade now to avoid service interruption.',
  disableDismiss: true,
  action: (
    <Button.Root variant="primary" size="sm" mode="filled">
      <span>Upgrade</span>
    </Button.Root>
  ),
});
```

## Rules

- Use `toast` (Sonner) for 90% of feedback messages -- it is simpler and sufficient
- Use `notification` (Radix-based) only for rich, branded alerts with actions or when you need the AlignUI Alert styling
- DO NOT import or render `<Toaster />` or `<NotificationProvider />` -- they are already in `providers.tsx`
- Toast messages should be concise (under 10 words ideally)
- Notification titles should be short; use description for details
- Always provide a `status` for Notifications so the correct icon and color are applied
- Requires `'use client'` directive in any component that calls `toast()` or `notification()`

## Related Skills

- `icons.md` -- Icons used in notification statuses
- `design-tokens.md` -- Semantic color tokens (success, error, warning, information)
