# AlignUI Avatar Components

## When to Use

Use **Avatar** for representing users, companies, or entities with images, initials, or placeholder icons. Common in: user profiles, comment threads, team lists, table cells, navigation headers, and activity feeds.

Use **AvatarGroup** for displaying multiple overlapping avatars (e.g., team members, collaborators).

Use **AvatarGroupCompact** for a compact pill-shaped avatar cluster with an overflow count.

## Import Patterns

```tsx
import * as Avatar from '@/components/ui/avatar';
import * as AvatarGroup from '@/components/ui/avatar-group';
import * as AvatarGroupCompact from '@/components/ui/avatar-group-compact';
```

---

## Avatar

### Parts

| Part | Description |
|------|-------------|
| `Avatar.Root` | Container. Rounded circle with size and color variants. Shows placeholder if no children. |
| `Avatar.Image` | The `<img>` element for the avatar photo. Supports `asChild`. |
| `Avatar.Indicator` | Positioned overlay container at bottom-right or top-right. For status dots, brand logos, etc. |
| `Avatar.Status` | Status dot indicator (online, offline, busy, away). Place inside Indicator. |
| `Avatar.BrandLogo` | Small circular brand logo image. Place inside Indicator. |
| `Avatar.Notification` | Red notification dot. Place inside Indicator. |

### Props

#### Root Props

| Prop | Values | Default | Description |
|------|--------|---------|-------------|
| `size` | `'80'` \| `'72'` \| `'64'` \| `'56'` \| `'48'` \| `'40'` \| `'32'` \| `'24'` \| `'20'` | `'80'` | Avatar diameter in pixels |
| `color` | `'gray'` \| `'yellow'` \| `'blue'` \| `'sky'` \| `'purple'` \| `'red'` | `'gray'` | Background color for initials/placeholder |
| `placeholderType` | `'user'` \| `'company'` | `'user'` | Placeholder icon when no children |
| `asChild` | `boolean` | `false` | Render as child element |

#### Indicator Props

| Prop | Values | Default | Description |
|------|--------|---------|-------------|
| `position` | `'top'` \| `'bottom'` | `'bottom'` | Vertical position |

#### Status Props

| Prop | Values | Default | Description |
|------|--------|---------|-------------|
| `status` | `'online'` \| `'offline'` \| `'busy'` \| `'away'` | `'online'` | Status type |

### Complete Usage Examples

```tsx
import * as Avatar from '@/components/ui/avatar';

// Avatar with image
<Avatar.Root size="48">
  <Avatar.Image src="/users/john.jpg" alt="John Doe" />
</Avatar.Root>

// Avatar with initials (colored background)
<Avatar.Root size="40" color="blue">
  JD
</Avatar.Root>

// Avatar with placeholder (no children = automatic placeholder)
<Avatar.Root size="40" />

// Company placeholder
<Avatar.Root size="40" placeholderType="company" />

// Avatar with online status indicator
<Avatar.Root size="48">
  <Avatar.Image src="/users/john.jpg" alt="John Doe" />
  <Avatar.Indicator position="bottom">
    <Avatar.Status status="online" />
  </Avatar.Indicator>
</Avatar.Root>

// Avatar with offline status
<Avatar.Root size="48" color="gray">
  JD
  <Avatar.Indicator position="bottom">
    <Avatar.Status status="offline" />
  </Avatar.Indicator>
</Avatar.Root>

// Avatar with busy status
<Avatar.Root size="48">
  <Avatar.Image src="/users/jane.jpg" alt="Jane" />
  <Avatar.Indicator position="bottom">
    <Avatar.Status status="busy" />
  </Avatar.Indicator>
</Avatar.Root>

// Avatar with away status
<Avatar.Root size="48">
  <Avatar.Image src="/users/jane.jpg" alt="Jane" />
  <Avatar.Indicator position="bottom">
    <Avatar.Status status="away" />
  </Avatar.Indicator>
</Avatar.Root>

// Avatar with brand logo
<Avatar.Root size="64">
  <Avatar.Image src="/users/john.jpg" alt="John Doe" />
  <Avatar.Indicator position="bottom">
    <Avatar.BrandLogo src="/brands/slack.png" alt="Slack" />
  </Avatar.Indicator>
</Avatar.Root>

// Avatar with notification dot
<Avatar.Root size="48">
  <Avatar.Image src="/users/john.jpg" alt="John Doe" />
  <Avatar.Indicator position="top">
    <Avatar.Notification />
  </Avatar.Indicator>
</Avatar.Root>

// All sizes
<Avatar.Root size="80"><Avatar.Image src="/user.jpg" alt="User" /></Avatar.Root>
<Avatar.Root size="72"><Avatar.Image src="/user.jpg" alt="User" /></Avatar.Root>
<Avatar.Root size="64"><Avatar.Image src="/user.jpg" alt="User" /></Avatar.Root>
<Avatar.Root size="56"><Avatar.Image src="/user.jpg" alt="User" /></Avatar.Root>
<Avatar.Root size="48"><Avatar.Image src="/user.jpg" alt="User" /></Avatar.Root>
<Avatar.Root size="40"><Avatar.Image src="/user.jpg" alt="User" /></Avatar.Root>
<Avatar.Root size="32"><Avatar.Image src="/user.jpg" alt="User" /></Avatar.Root>
<Avatar.Root size="24"><Avatar.Image src="/user.jpg" alt="User" /></Avatar.Root>
<Avatar.Root size="20"><Avatar.Image src="/user.jpg" alt="User" /></Avatar.Root>

// All colors (initials)
<Avatar.Root size="40" color="gray">AB</Avatar.Root>
<Avatar.Root size="40" color="yellow">CD</Avatar.Root>
<Avatar.Root size="40" color="blue">EF</Avatar.Root>
<Avatar.Root size="40" color="sky">GH</Avatar.Root>
<Avatar.Root size="40" color="purple">IJ</Avatar.Root>
<Avatar.Root size="40" color="red">KL</Avatar.Root>
```

---

## AvatarGroup (Overlapping)

### Parts

| Part | Description |
|------|-------------|
| `AvatarGroup.Root` | Flex container with negative spacing for overlap effect. |
| `AvatarGroup.Overflow` | Circular overflow count indicator (e.g., "+5"). |

### Props on Root

| Prop | Values | Default | Description |
|------|--------|---------|-------------|
| `size` | Same as Avatar size values | `'80'` | Size of all avatars in the group |

### Usage Examples

```tsx
import * as Avatar from '@/components/ui/avatar';
import * as AvatarGroup from '@/components/ui/avatar-group';

// Basic avatar group
<AvatarGroup.Root size="40">
  <Avatar.Root>
    <Avatar.Image src="/users/1.jpg" alt="User 1" />
  </Avatar.Root>
  <Avatar.Root>
    <Avatar.Image src="/users/2.jpg" alt="User 2" />
  </Avatar.Root>
  <Avatar.Root>
    <Avatar.Image src="/users/3.jpg" alt="User 3" />
  </Avatar.Root>
</AvatarGroup.Root>

// With overflow count
<AvatarGroup.Root size="32">
  <Avatar.Root>
    <Avatar.Image src="/users/1.jpg" alt="User 1" />
  </Avatar.Root>
  <Avatar.Root>
    <Avatar.Image src="/users/2.jpg" alt="User 2" />
  </Avatar.Root>
  <Avatar.Root>
    <Avatar.Image src="/users/3.jpg" alt="User 3" />
  </Avatar.Root>
  <AvatarGroup.Overflow>+5</AvatarGroup.Overflow>
</AvatarGroup.Root>

// With initials
<AvatarGroup.Root size="40">
  <Avatar.Root color="blue">JD</Avatar.Root>
  <Avatar.Root color="purple">AS</Avatar.Root>
  <Avatar.Root color="red">MK</Avatar.Root>
  <AvatarGroup.Overflow>+2</AvatarGroup.Overflow>
</AvatarGroup.Root>
```

---

## AvatarGroupCompact (Pill-Shaped)

### Parts

| Part | Description |
|------|-------------|
| `AvatarGroupCompact.Root` | Pill-shaped container with white bg and shadow. |
| `AvatarGroupCompact.Stack` | Inner flex with negative spacing for overlapping avatars. |
| `AvatarGroupCompact.Overflow` | Text overflow count (e.g., "+3 more"). |

### Props on Root

| Prop | Values | Default | Description |
|------|--------|---------|-------------|
| `size` | `'40'` \| `'32'` \| `'24'` | `'40'` | Size of avatars in the compact group |
| `variant` | `'default'` \| `'stroke'` | `'default'` | Visual style (stroke adds border ring) |

### Usage Examples

```tsx
import * as Avatar from '@/components/ui/avatar';
import * as AvatarGroupCompact from '@/components/ui/avatar-group-compact';

// Basic compact group
<AvatarGroupCompact.Root size="32">
  <AvatarGroupCompact.Stack>
    <Avatar.Root>
      <Avatar.Image src="/users/1.jpg" alt="User 1" />
    </Avatar.Root>
    <Avatar.Root>
      <Avatar.Image src="/users/2.jpg" alt="User 2" />
    </Avatar.Root>
    <Avatar.Root>
      <Avatar.Image src="/users/3.jpg" alt="User 3" />
    </Avatar.Root>
  </AvatarGroupCompact.Stack>
  <AvatarGroupCompact.Overflow>+3</AvatarGroupCompact.Overflow>
</AvatarGroupCompact.Root>

// Stroke variant
<AvatarGroupCompact.Root size="24" variant="stroke">
  <AvatarGroupCompact.Stack>
    <Avatar.Root color="blue">A</Avatar.Root>
    <Avatar.Root color="purple">B</Avatar.Root>
  </AvatarGroupCompact.Stack>
  <AvatarGroupCompact.Overflow>+5</AvatarGroupCompact.Overflow>
</AvatarGroupCompact.Root>
```

---

## Common Patterns

### User info row (avatar + name + email)

```tsx
<div className="flex items-center gap-3">
  <Avatar.Root size="40" color="blue">
    <Avatar.Image src={user.avatar} alt={user.name} />
  </Avatar.Root>
  <div>
    <p className="text-label-sm text-text-strong-950">{user.name}</p>
    <p className="text-paragraph-xs text-text-sub-600">{user.email}</p>
  </div>
</div>
```

### Avatar in table cell

```tsx
<Table.Cell>
  <div className="flex items-center gap-3">
    <Avatar.Root size="32">
      <Avatar.Image src={row.avatar} alt={row.name} />
    </Avatar.Root>
    <span className="text-label-sm text-text-strong-950">{row.name}</span>
  </div>
</Table.Cell>
```

### Avatar with fallback initials

```tsx
function UserAvatar({ user }: { user: { name: string; avatar?: string } }) {
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Avatar.Root size="40" color="blue">
      {user.avatar ? (
        <Avatar.Image src={user.avatar} alt={user.name} />
      ) : (
        initials
      )}
    </Avatar.Root>
  );
}
```

### Team members list with online status

```tsx
<div className="space-y-3">
  {members.map((member) => (
    <div key={member.id} className="flex items-center gap-3">
      <Avatar.Root size="40">
        <Avatar.Image src={member.avatar} alt={member.name} />
        <Avatar.Indicator position="bottom">
          <Avatar.Status status={member.isOnline ? 'online' : 'offline'} />
        </Avatar.Indicator>
      </Avatar.Root>
      <div>
        <p className="text-label-sm text-text-strong-950">{member.name}</p>
        <p className="text-paragraph-xs text-text-sub-600">{member.role}</p>
      </div>
    </div>
  ))}
</div>
```

### Avatar group in card header

```tsx
<div className="flex items-center justify-between">
  <h3 className="text-label-md text-text-strong-950">Team</h3>
  <AvatarGroup.Root size="24">
    {team.slice(0, 3).map((member) => (
      <Avatar.Root key={member.id}>
        <Avatar.Image src={member.avatar} alt={member.name} />
      </Avatar.Root>
    ))}
    {team.length > 3 && (
      <AvatarGroup.Overflow>+{team.length - 3}</AvatarGroup.Overflow>
    )}
  </AvatarGroup.Root>
</div>
```

## Rules

1. NEVER create custom avatar elements. Always use AlignUI Avatar.
2. NEVER modify files in `/components/ui/`.
3. Always use namespace imports: `import * as Avatar from '@/components/ui/avatar'`.
4. Always provide an `alt` attribute on `Avatar.Image` for accessibility.
5. Use `size` as a string number: `"40"`, not `40`. These are design tokens, not pixel values.
6. Use `color` prop for initials-based avatars to differentiate users visually.
7. Place `Avatar.Status`, `Avatar.BrandLogo`, or `Avatar.Notification` inside `Avatar.Indicator`.
8. Use `AvatarGroup` for standard overlapping avatars. Use `AvatarGroupCompact` for pill-shaped clusters.
9. For tables and lists, `size="32"` or `size="40"` are the most common sizes.
10. When no image is available and no children are provided, Avatar automatically renders a placeholder icon.

## Related Skills

- `table.md` -- Avatars in table cells
- `badge.md` -- Badges alongside avatars
- `dropdown.md` -- Avatar as dropdown trigger (user menu)
