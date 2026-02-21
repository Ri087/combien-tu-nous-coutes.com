# Icons (Remix Icon)

## When to use

- Action buttons (add, edit, delete, search)
- Navigation items
- Status indicators
- Form field decorations
- Empty states
- Any UI element that benefits from a visual icon

## Import

```tsx
import { RiIconName } from '@remixicon/react';
```

All icons come from `@remixicon/react` (Remix Icon v4.6.0). They are SVG-based React components.

## Naming Convention

Icons follow the pattern: `Ri` + `Name` + `Style`

Styles:
- `Line` -- Outlined/stroke style (default, use this most of the time)
- `Fill` -- Solid/filled style (use for active states, emphasis)

Examples:
- `RiAddLine` / `RiAddFill`
- `RiDeleteBinLine` / `RiDeleteBinFill`
- `RiHomeLine` / `RiHomeFill`

## Basic Usage

```tsx
import { RiSearchLine } from '@remixicon/react';

<RiSearchLine className="size-5 text-text-sub-600" />
```

## Sizes

Use Tailwind `size-*` classes (which set both width and height):

| Class | Pixels | When to use |
|-------|--------|------------|
| `size-3` | 12px | Tiny indicators, badges |
| `size-3.5` | 14px | Compact UI, inline text |
| `size-4` | 16px | Small buttons, form inputs, hints |
| `size-5` | 20px | Default -- buttons, navigation, most UI |
| `size-6` | 24px | Large buttons, empty states, headers |
| `size-8` | 32px | Hero sections, large empty states |
| `size-10` | 40px | Feature highlights |

```tsx
<RiSearchLine className="size-4" />  {/* Small */}
<RiSearchLine className="size-5" />  {/* Default */}
<RiSearchLine className="size-6" />  {/* Large */}
```

## Color

Icons inherit `currentColor` by default. Control color with Tailwind text classes:

```tsx
{/* Inherit from parent */}
<RiCheckLine className="size-5" />

{/* Explicit color */}
<RiCheckLine className="size-5 text-text-strong-950" />
<RiCheckLine className="size-5 text-text-sub-600" />
<RiCheckLine className="size-5 text-text-soft-400" />
<RiCheckLine className="size-5 text-success-base" />
<RiCheckLine className="size-5 text-error-base" />
<RiCheckLine className="size-5 text-primary-base" />
```

## Usage with AlignUI Components

### Button.Icon

```tsx
import * as Button from '@/components/ui/button';
import { RiAddLine } from '@remixicon/react';

{/* Icon + text button */}
<Button.Root variant="primary" size="md" mode="filled">
  <Button.Icon as={RiAddLine} />
  <span>Add Item</span>
</Button.Root>

{/* Icon-only button */}
<Button.Root variant="neutral" size="sm" mode="ghost">
  <Button.Icon as={RiMoreLine} />
</Button.Root>

{/* Trailing icon */}
<Button.Root variant="primary" size="md" mode="filled">
  <span>Next</span>
  <Button.Icon as={RiArrowRightLine} />
</Button.Root>
```

### Accordion.Icon

```tsx
import * as Accordion from '@/components/ui/accordion';
import { RiSettings3Line } from '@remixicon/react';

<Accordion.Trigger>
  <Accordion.Icon as={RiSettings3Line} />
  Settings
  <Accordion.Arrow />
</Accordion.Trigger>
```

### Hint.Icon

```tsx
import * as Hint from '@/components/ui/hint';
import { RiInformationLine } from '@remixicon/react';

<Hint.Root>
  <Hint.Icon as={RiInformationLine} />
  This field is required
</Hint.Root>
```

### Input with icon

```tsx
import * as Input from '@/components/ui/input';
import { RiSearchLine, RiEyeLine } from '@remixicon/react';

<Input.Root>
  <Input.Wrapper>
    <Input.Icon as={RiSearchLine} />
    <Input.Input placeholder="Search..." />
  </Input.Wrapper>
</Input.Root>
```

## Common Icons Reference

### Navigation

| Icon | Import | Use |
|------|--------|-----|
| Home | `RiHomeLine` | Dashboard/home link |
| Arrow Left | `RiArrowLeftLine` | Back navigation |
| Arrow Right | `RiArrowRightLine` | Forward/next |
| Arrow Left S | `RiArrowLeftSLine` | Chevron left (pagination, breadcrumb) |
| Arrow Right S | `RiArrowRightSLine` | Chevron right |
| Arrow Down S | `RiArrowDownSLine` | Dropdown indicator |
| Arrow Up S | `RiArrowUpSLine` | Collapse indicator |
| Menu | `RiMenuLine` | Hamburger menu |
| Close | `RiCloseLine` | Close/dismiss |
| More | `RiMoreLine` | More options (horizontal dots) |
| More Vertical | `RiMore2Line` | More options (vertical dots) |

### Actions

| Icon | Import | Use |
|------|--------|-----|
| Add | `RiAddLine` | Create new |
| Delete | `RiDeleteBinLine` | Delete/remove |
| Edit | `RiEditLine` | Edit/modify |
| Pencil | `RiPencilLine` | Edit (alternate) |
| Search | `RiSearchLine` | Search |
| Filter | `RiFilterLine` | Filter/sort |
| Download | `RiDownloadLine` | Download |
| Upload | `RiUploadLine` | Upload |
| Share | `RiShareLine` | Share |
| Copy | `RiFileCopyLine` | Copy to clipboard |
| Refresh | `RiRefreshLine` | Refresh/reload |
| Settings | `RiSettings3Line` | Settings/config |
| Logout | `RiLogoutBoxRLine` | Sign out |

### Status and Feedback

| Icon | Import | Use |
|------|--------|-----|
| Check | `RiCheckLine` | Success/done |
| Checkbox Circle | `RiCheckboxCircleFill` | Success notification |
| Close Circle | `RiCloseCircleLine` | Error/failed |
| Error Warning | `RiErrorWarningFill` | Error notification |
| Alert | `RiAlertFill` | Warning notification |
| Information | `RiInformationFill` | Info notification |
| Information Line | `RiInformationLine` | Info hint |
| Magic | `RiMagicFill` | Feature/AI |
| Eye | `RiEyeLine` | Show/visible |
| Eye Off | `RiEyeOffLine` | Hide/invisible |
| Loader | `RiLoader4Line` | Loading (add `animate-spin`) |

### Communication

| Icon | Import | Use |
|------|--------|-----|
| Mail | `RiMailLine` | Email |
| Lock | `RiLockLine` | Password/security |
| User | `RiUserLine` | User/profile |
| Notification | `RiNotification3Line` | Notifications |
| Calendar | `RiCalendarLine` | Date/calendar |
| Time | `RiTimeLine` | Time |
| Link | `RiLinkLine` | URL/link |
| Image | `RiImageLine` | Image/photo |
| File | `RiFileTextLine` | Document/file |
| Folder | `RiFolderLine` | Folder/category |

## Animated Icons

```tsx
{/* Spinning loader */}
<RiLoader4Line className="size-5 animate-spin text-text-sub-600" />

{/* Pulse indicator */}
<RiCheckboxCircleFill className="size-5 animate-pulse text-success-base" />
```

## Rules

- ALWAYS import from `@remixicon/react`
- ALWAYS use `className="size-5"` as the default size
- Use `Line` style for most cases, `Fill` style for active/selected states
- Use AlignUI color tokens for icon colors (`text-text-sub-600`, not `text-gray-500`)
- When using icons inside AlignUI components, use the polymorphic `as` prop (e.g., `<Button.Icon as={RiAddLine} />`)
- DO NOT set `width` and `height` attributes -- use Tailwind `size-*` classes instead
- Icons inherit `currentColor` so they automatically match the parent text color

## Related Skills

- `tooltip.md` -- Tooltips for icon-only buttons
- `design-tokens.md` -- Color tokens for icon styling
