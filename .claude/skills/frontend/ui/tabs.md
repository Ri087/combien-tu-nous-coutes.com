# AlignUI Tab Components

## When to Use

Use **TabMenuHorizontal** for top-level page navigation or section switching with a horizontal tab bar and animated underline indicator. Ideal for dashboard sections, settings pages, and content categories.

Use **TabMenuVertical** for sidebar-style navigation or stacked section switching. Ideal for settings panels, account pages, and nested navigation.

Use **SegmentedControl** for toggle-style switching between 2-4 options with a floating background indicator. Ideal for view mode toggling (grid/list), filter switching, and compact option selectors.

## Import Patterns

```tsx
// Horizontal tabs
import * as TabMenu from '@/components/ui/tab-menu-horizontal';

// Vertical tabs
import * as TabMenuVertical from '@/components/ui/tab-menu-vertical';

// Segmented control
import * as SegmentedControl from '@/components/ui/segmented-control';
```

**Note:** All tab components are `'use client'` components.

---

## TabMenuHorizontal

### Parts

| Part | Description |
|------|-------------|
| `TabMenu.Root` | Radix Tabs root. Forces `orientation="horizontal"`. Full width. |
| `TabMenu.List` | Tab list with bottom border, animated underline, and horizontal scroll. |
| `TabMenu.Trigger` | Individual tab button. `h-12`, label text, active state styling. |
| `TabMenu.Icon` | Polymorphic icon inside a trigger. Colors to primary when active. |
| `TabMenu.ArrowIcon` | Arrow/chevron icon inside a trigger (for expandable sections). |
| `TabMenu.Content` | Tab content panel. Renders when its tab is active. |

### Props on Root

| Prop | Values | Default | Description |
|------|--------|---------|-------------|
| `value` | `string` | -- | Controlled active tab value |
| `defaultValue` | `string` | -- | Uncontrolled default active tab |
| `onValueChange` | `(value: string) => void` | -- | Callback when active tab changes |

### Props on List

| Prop | Values | Default | Description |
|------|--------|---------|-------------|
| `wrapperClassName` | `string` | -- | Classes on the outer scroll container |

### Complete Usage Examples

```tsx
'use client';

import * as TabMenu from '@/components/ui/tab-menu-horizontal';
import { RiDashboardLine, RiSettings4Line, RiTeamLine } from '@remixicon/react';

// Basic horizontal tabs
<TabMenu.Root defaultValue="overview">
  <TabMenu.List>
    <TabMenu.Trigger value="overview">Overview</TabMenu.Trigger>
    <TabMenu.Trigger value="members">Members</TabMenu.Trigger>
    <TabMenu.Trigger value="settings">Settings</TabMenu.Trigger>
  </TabMenu.List>

  <TabMenu.Content value="overview">
    <div className="py-6">Overview content here.</div>
  </TabMenu.Content>
  <TabMenu.Content value="members">
    <div className="py-6">Members content here.</div>
  </TabMenu.Content>
  <TabMenu.Content value="settings">
    <div className="py-6">Settings content here.</div>
  </TabMenu.Content>
</TabMenu.Root>

// Tabs with icons
<TabMenu.Root defaultValue="dashboard">
  <TabMenu.List>
    <TabMenu.Trigger value="dashboard">
      <TabMenu.Icon as={RiDashboardLine} />
      Dashboard
    </TabMenu.Trigger>
    <TabMenu.Trigger value="team">
      <TabMenu.Icon as={RiTeamLine} />
      Team
    </TabMenu.Trigger>
    <TabMenu.Trigger value="settings">
      <TabMenu.Icon as={RiSettings4Line} />
      Settings
    </TabMenu.Trigger>
  </TabMenu.List>

  <TabMenu.Content value="dashboard">
    <div className="py-6">{/* Dashboard content */}</div>
  </TabMenu.Content>
  <TabMenu.Content value="team">
    <div className="py-6">{/* Team content */}</div>
  </TabMenu.Content>
  <TabMenu.Content value="settings">
    <div className="py-6">{/* Settings content */}</div>
  </TabMenu.Content>
</TabMenu.Root>

// Controlled tabs
function ControlledTabs() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <TabMenu.Root value={activeTab} onValueChange={setActiveTab}>
      <TabMenu.List>
        <TabMenu.Trigger value="overview">Overview</TabMenu.Trigger>
        <TabMenu.Trigger value="analytics">Analytics</TabMenu.Trigger>
        <TabMenu.Trigger value="reports">Reports</TabMenu.Trigger>
      </TabMenu.List>

      <TabMenu.Content value="overview">
        <div className="py-6">Overview</div>
      </TabMenu.Content>
      <TabMenu.Content value="analytics">
        <div className="py-6">Analytics</div>
      </TabMenu.Content>
      <TabMenu.Content value="reports">
        <div className="py-6">Reports</div>
      </TabMenu.Content>
    </TabMenu.Root>
  );
}

// Many tabs (scrollable)
<TabMenu.Root defaultValue="tab1">
  <TabMenu.List>
    <TabMenu.Trigger value="tab1">Overview</TabMenu.Trigger>
    <TabMenu.Trigger value="tab2">Analytics</TabMenu.Trigger>
    <TabMenu.Trigger value="tab3">Members</TabMenu.Trigger>
    <TabMenu.Trigger value="tab4">Settings</TabMenu.Trigger>
    <TabMenu.Trigger value="tab5">Billing</TabMenu.Trigger>
    <TabMenu.Trigger value="tab6">Integrations</TabMenu.Trigger>
    <TabMenu.Trigger value="tab7">API Keys</TabMenu.Trigger>
  </TabMenu.List>
  {/* Content panels */}
</TabMenu.Root>
```

---

## TabMenuVertical

### Parts

| Part | Description |
|------|-------------|
| `TabMenuVertical.Root` | Radix Tabs root. Forces `orientation="vertical"`. |
| `TabMenuVertical.List` | Vertical tab list with `space-y-2` gap. |
| `TabMenuVertical.Trigger` | Tab button. Full width, left-aligned, grid layout. Active gets `bg-bg-weak-50`. |
| `TabMenuVertical.Icon` | Polymorphic icon. Colors to primary when active. |
| `TabMenuVertical.ArrowIcon` | Arrow icon that scales in on active state. |
| `TabMenuVertical.Content` | Tab content panel. |

### Usage Examples

```tsx
'use client';

import * as TabMenuVertical from '@/components/ui/tab-menu-vertical';
import {
  RiUserLine,
  RiLockLine,
  RiNotificationLine,
  RiArrowRightSLine,
} from '@remixicon/react';

// Basic vertical tabs (settings page)
<div className="flex gap-6">
  <TabMenuVertical.Root defaultValue="profile" className="flex gap-6">
    <TabMenuVertical.List className="w-[200px] shrink-0">
      <TabMenuVertical.Trigger value="profile">
        <TabMenuVertical.Icon as={RiUserLine} />
        Profile
        <TabMenuVertical.ArrowIcon as={RiArrowRightSLine} />
      </TabMenuVertical.Trigger>
      <TabMenuVertical.Trigger value="security">
        <TabMenuVertical.Icon as={RiLockLine} />
        Security
        <TabMenuVertical.ArrowIcon as={RiArrowRightSLine} />
      </TabMenuVertical.Trigger>
      <TabMenuVertical.Trigger value="notifications">
        <TabMenuVertical.Icon as={RiNotificationLine} />
        Notifications
        <TabMenuVertical.ArrowIcon as={RiArrowRightSLine} />
      </TabMenuVertical.Trigger>
    </TabMenuVertical.List>

    <div className="flex-1">
      <TabMenuVertical.Content value="profile">
        <div>Profile settings content</div>
      </TabMenuVertical.Content>
      <TabMenuVertical.Content value="security">
        <div>Security settings content</div>
      </TabMenuVertical.Content>
      <TabMenuVertical.Content value="notifications">
        <div>Notification settings content</div>
      </TabMenuVertical.Content>
    </div>
  </TabMenuVertical.Root>
</div>

// Simple vertical tabs without icons
<TabMenuVertical.Root defaultValue="general">
  <TabMenuVertical.List className="w-[180px]">
    <TabMenuVertical.Trigger value="general">General</TabMenuVertical.Trigger>
    <TabMenuVertical.Trigger value="billing">Billing</TabMenuVertical.Trigger>
    <TabMenuVertical.Trigger value="team">Team</TabMenuVertical.Trigger>
  </TabMenuVertical.List>

  <TabMenuVertical.Content value="general">General</TabMenuVertical.Content>
  <TabMenuVertical.Content value="billing">Billing</TabMenuVertical.Content>
  <TabMenuVertical.Content value="team">Team</TabMenuVertical.Content>
</TabMenuVertical.Root>
```

---

## SegmentedControl

### Parts

| Part | Description |
|------|-------------|
| `SegmentedControl.Root` | Radix Tabs root. |
| `SegmentedControl.List` | Grid container with `bg-bg-weak-50` background, `p-1` padding, and floating white bg indicator. |
| `SegmentedControl.Trigger` | Compact trigger button. `h-7`, centered text. Active gets strong text color. |
| `SegmentedControl.Content` | Tab content panel. |

### Props on List

| Prop | Values | Default | Description |
|------|--------|---------|-------------|
| `floatingBgClassName` | `string` | -- | Additional classes on the floating background indicator |

### Usage Examples

```tsx
'use client';

import * as SegmentedControl from '@/components/ui/segmented-control';

// Basic segmented control (2 options)
<SegmentedControl.Root defaultValue="grid">
  <SegmentedControl.List>
    <SegmentedControl.Trigger value="grid">Grid</SegmentedControl.Trigger>
    <SegmentedControl.Trigger value="list">List</SegmentedControl.Trigger>
  </SegmentedControl.List>

  <SegmentedControl.Content value="grid">
    <div className="pt-4">{/* Grid view */}</div>
  </SegmentedControl.Content>
  <SegmentedControl.Content value="list">
    <div className="pt-4">{/* List view */}</div>
  </SegmentedControl.Content>
</SegmentedControl.Root>

// Three options
<SegmentedControl.Root defaultValue="all">
  <SegmentedControl.List>
    <SegmentedControl.Trigger value="all">All</SegmentedControl.Trigger>
    <SegmentedControl.Trigger value="active">Active</SegmentedControl.Trigger>
    <SegmentedControl.Trigger value="archived">Archived</SegmentedControl.Trigger>
  </SegmentedControl.List>
  {/* Content panels */}
</SegmentedControl.Root>

// Controlled segmented control
function ViewToggle() {
  const [view, setView] = useState('grid');

  return (
    <SegmentedControl.Root value={view} onValueChange={setView}>
      <SegmentedControl.List className="w-[200px]">
        <SegmentedControl.Trigger value="grid">Grid</SegmentedControl.Trigger>
        <SegmentedControl.Trigger value="list">List</SegmentedControl.Trigger>
      </SegmentedControl.List>
    </SegmentedControl.Root>
  );
}

// Four options
<SegmentedControl.Root defaultValue="day">
  <SegmentedControl.List className="w-[300px]">
    <SegmentedControl.Trigger value="day">Day</SegmentedControl.Trigger>
    <SegmentedControl.Trigger value="week">Week</SegmentedControl.Trigger>
    <SegmentedControl.Trigger value="month">Month</SegmentedControl.Trigger>
    <SegmentedControl.Trigger value="year">Year</SegmentedControl.Trigger>
  </SegmentedControl.List>
</SegmentedControl.Root>
```

---

## Common Patterns

### Settings page layout (horizontal tabs)

```tsx
<div className="space-y-6">
  <div>
    <h1 className="text-title-h5 text-text-strong-950">Settings</h1>
    <p className="text-paragraph-sm text-text-sub-600">Manage your account settings.</p>
  </div>

  <TabMenu.Root defaultValue="general">
    <TabMenu.List>
      <TabMenu.Trigger value="general">General</TabMenu.Trigger>
      <TabMenu.Trigger value="billing">Billing</TabMenu.Trigger>
      <TabMenu.Trigger value="team">Team</TabMenu.Trigger>
      <TabMenu.Trigger value="integrations">Integrations</TabMenu.Trigger>
    </TabMenu.List>

    <TabMenu.Content value="general">
      <div className="py-6">{/* General settings */}</div>
    </TabMenu.Content>
    {/* Other content panels */}
  </TabMenu.Root>
</div>
```

### Sidebar + content layout (vertical tabs)

```tsx
<TabMenuVertical.Root defaultValue="profile" className="flex gap-8">
  <TabMenuVertical.List className="w-[220px] shrink-0">
    <TabMenuVertical.Trigger value="profile">
      <TabMenuVertical.Icon as={RiUserLine} />
      Profile
    </TabMenuVertical.Trigger>
    <TabMenuVertical.Trigger value="security">
      <TabMenuVertical.Icon as={RiLockLine} />
      Security
    </TabMenuVertical.Trigger>
  </TabMenuVertical.List>

  <div className="flex-1">
    <TabMenuVertical.Content value="profile">
      {/* Profile form */}
    </TabMenuVertical.Content>
    <TabMenuVertical.Content value="security">
      {/* Security form */}
    </TabMenuVertical.Content>
  </div>
</TabMenuVertical.Root>
```

### View toggle with content

```tsx
<div className="space-y-4">
  <div className="flex items-center justify-between">
    <h2 className="text-label-lg text-text-strong-950">Projects</h2>
    <SegmentedControl.Root defaultValue="grid">
      <SegmentedControl.List className="w-[160px]">
        <SegmentedControl.Trigger value="grid">Grid</SegmentedControl.Trigger>
        <SegmentedControl.Trigger value="list">List</SegmentedControl.Trigger>
      </SegmentedControl.List>

      <SegmentedControl.Content value="grid">
        <div className="grid grid-cols-3 gap-4 pt-4">
          {/* Grid cards */}
        </div>
      </SegmentedControl.Content>
      <SegmentedControl.Content value="list">
        <div className="pt-4">
          {/* List/table view */}
        </div>
      </SegmentedControl.Content>
    </SegmentedControl.Root>
  </div>
</div>
```

### Tab menu with URL sync (Next.js)

```tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import * as TabMenu from '@/components/ui/tab-menu-horizontal';

function UrlSyncedTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', value);
    router.push(`?${params.toString()}`);
  };

  return (
    <TabMenu.Root value={activeTab} onValueChange={handleTabChange}>
      <TabMenu.List>
        <TabMenu.Trigger value="overview">Overview</TabMenu.Trigger>
        <TabMenu.Trigger value="analytics">Analytics</TabMenu.Trigger>
        <TabMenu.Trigger value="settings">Settings</TabMenu.Trigger>
      </TabMenu.List>

      <TabMenu.Content value="overview">{/* ... */}</TabMenu.Content>
      <TabMenu.Content value="analytics">{/* ... */}</TabMenu.Content>
      <TabMenu.Content value="settings">{/* ... */}</TabMenu.Content>
    </TabMenu.Root>
  );
}
```

## Rules

1. NEVER create custom tab components. Always use AlignUI tab components.
2. NEVER modify files in `/components/ui/`.
3. Choose the right component:
   - **TabMenuHorizontal** for page-level section tabs
   - **TabMenuVertical** for sidebar-style settings navigation
   - **SegmentedControl** for compact toggle switches (2-4 options)
4. All tab components require `'use client'` directive.
5. Each `Trigger` must have a unique `value` that matches a corresponding `Content` value.
6. TabMenuHorizontal List auto-scrolls horizontally when tabs overflow.
7. SegmentedControl uses equal-width columns (`auto-cols-fr`). Best with 2-4 options.
8. Use `TabMenu.Icon` inside triggers, not raw icon components.
9. For URL-synced tabs, use controlled `value` + `onValueChange` with Next.js router.
10. The animated underline (horizontal) and floating background (segmented) are automatic.

## Related Skills

- `button.md` -- Tabs vs buttons for navigation
- `dropdown.md` -- For more than 5-7 options, consider dropdown instead of tabs
