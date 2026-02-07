# AlignUI Finance Template - UI Patterns Extract

> Extracted from DeepWiki analysis of template-finance-alignui
> Focus: Widget patterns, financial UI components, dashboard layouts

## 1. Widget System Architecture

### WidgetBox Container Pattern

**Base Structure**: All widgets use `WidgetBox` component with consistent parts:

```tsx
<WidgetBox.Root>
  <WidgetBox.Header>
    <WidgetBox.HeaderIcon>
      <RiIcon />
    </WidgetBox.HeaderIcon>
    Widget Title
  </WidgetBox.Header>

  {/* Widget Content */}

</WidgetBox.Root>
```

**Key Features**:
- Standardized padding, borders, responsive behavior
- Icon + Title pattern in header
- Optional action buttons (Select, Button)
- Empty state variants for each widget

### Widget Categories

| Widget Type | Purpose | Key Components |
|-------------|---------|----------------|
| `WidgetMyCards` | Card management | SegmentedControl, CardSwitch, animations |
| `WidgetTotalBalance` | Balance display | Currency select, trend charts |
| `WidgetBudgetOverview` | Budget tracking | Stacked bar chart, period select |
| `WidgetTransactionsTable` | Transaction list | TanStack Table, pagination |
| `WidgetQuickTransfer` | Money transfer | Contact carousel, currency input |
| `WidgetSpendingSummary` | Spend breakdown | Pie chart, category list |

## 2. Dashboard Layout Pattern

**Responsive Grid System**:

```tsx
// app/(main)/(home)/page.tsx pattern
<div className="grid max-w-md grid-cols-1 gap-6 lg:max-w-3xl lg:grid-cols-2 min-[1400px]:grid-cols-3">
  {/* Full-width widgets */}
  <div className="[grid-column:1/-1]">
    <WidgetMyCards />
  </div>

  {/* 2-row span on large screens */}
  <div className="lg:row-span-2">
    <WidgetComponent />
  </div>

  {/* Nested grid for grouped widgets */}
  <div className="grid gap-6">
    <WidgetTotalBalance />
    <WidgetTotalExpenses />
  </div>
</div>
```

**Breakpoints**:
- Mobile: `grid-cols-1` (max-w-md)
- Tablet: `lg:grid-cols-2` (max-w-3xl)
- Desktop: `min-[1400px]:grid-cols-3` (max-w-[1360px])

## 3. Card Component Patterns

### Card Widget with Tabs

```tsx
// WidgetMyCards pattern
const [cardType, setCardType] = useState<'virtual' | 'physical'>('virtual');

<WidgetBox.Root>
  <WidgetBox.Header>
    <SegmentedControl.Root value={cardType} onValueChange={setCardType}>
      <SegmentedControl.Trigger value="virtual">Virtual</SegmentedControl.Trigger>
      <SegmentedControl.Trigger value="physical">Physical</SegmentedControl.Trigger>
    </SegmentedControl.Root>
  </WidgetBox.Header>

  <CardSwitchContainer type={cardType}>
    {/* Card display with animations */}
  </CardSwitchContainer>

  {/* Recent transactions */}
</WidgetBox.Root>
```

### Card Detail Drawer

**State Management** (Jotai atoms):
```tsx
const myCardDetailDataAtom = atom<CardData | null>(null);
const myCardDetailModalOpenAtom = atom(false);

// Usage in component
const [cardData, setCardData] = useAtom(myCardDetailDataAtom);
const [isOpen, setIsOpen] = useAtom(myCardDetailModalOpenAtom);

// Open drawer
setCardData(selectedCard);
setIsOpen(true);
```

**Drawer Structure**:
- Card visual with gradients
- Card details (number, expiry, CVC)
- Spending limits with currency formatting
- Action buttons (Freeze, Top Up, etc.)
- Recent transactions list with animations

## 4. Transaction Patterns

### Transaction Table (TanStack Table)

```tsx
// Column definition pattern
const columns: ColumnDef<TransactionTableData>[] = [
  {
    accessorKey: 'toFrom',
    header: 'To/From',
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar src={row.original.toFrom.icon} />
        <span>{row.original.toFrom.name}</span>
      </div>
    )
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => (
      <span className={cn(
        row.original.amount.type === 'enter' ? 'text-success-base' : 'text-error-base'
      )}>
        {row.original.amount.type === 'enter' ? '+' : '-'}
        {formatCurrency(row.original.amount.value)}
      </span>
    )
  }
];
```

**Features**:
- Multi-column sorting
- Row selection with checkboxes
- Custom pagination component
- Drawer integration for details

### Transaction Item Component

```tsx
// Reusable transaction display
<TransactionItem
  icon={transaction.icon}
  iconType={transaction.iconType} // 'rent' | 'tax' | 'phone' | 'utilities'
  name={transaction.name}
  description={transaction.description}
  amount={transaction.amount}
  date={transaction.date}
  onClick={() => openDetail(transaction)}
/>
```

**Type-specific styling**:
- Rent: orange background
- Tax: red background
- Phone: blue background
- Utilities: green background

### Transaction Detail Drawer

**State**: `transactionDetailModalOpenAtom` (Jotai)

**Content**:
- Transaction amount (color-coded)
- Recipient info with avatar
- Payment method with icon
- Transaction ID, date/time
- Fees and bank description
- Action buttons (Repeat, Share)

## 5. Chart Patterns

### Chart Container System

```tsx
// Base chart wrapper
<ChartContainer config={chartConfig}>
  {/* Recharts components */}
</ChartContainer>
```

**Config pattern**:
```tsx
const chartConfig = {
  income: {
    label: 'Income',
    color: 'hsl(var(--information-base))'
  },
  expenses: {
    label: 'Expenses',
    color: 'hsl(var(--verified-base))'
  }
} satisfies ChartConfig;
```

### Stacked Bar Chart

```tsx
// BudgetOverviewChart pattern
<ChartContainer config={chartConfig}>
  <ResponsiveContainer>
    <BarChart data={chartData} barCategoryGap={responsiveGap}>
      <XAxis dataKey="month" />
      <YAxis tickFormatter={compactFormat} />
      <Bar dataKey="income" fill="var(--color-income)" />
      <Bar dataKey="expenses" fill="var(--color-expenses)" />
      <Bar dataKey="scheduled" fill="var(--color-scheduled)" />
    </BarChart>
  </ResponsiveContainer>
</ChartContainer>
```

**Responsive gaps**:
- lg: 12px
- md: 4px
- sm: 2px

### Pie Chart (Semicircle)

```tsx
// SpendingSummaryPieChart pattern
const CIRCLE_SIZE = 248;
const INNER_RADIUS = 99;
const OUTER_RADIUS = 124;

<PieChart width={CIRCLE_SIZE} height={CIRCLE_SIZE / 2}>
  <Pie
    data={chartData}
    cx={CIRCLE_SIZE / 2}
    cy={CIRCLE_SIZE / 2}
    startAngle={180}
    endAngle={0}
    innerRadius={INNER_RADIUS}
    outerRadius={OUTER_RADIUS}
    paddingAngle={2}
  />
</PieChart>
```

### Step Line Chart (Custom)

```tsx
// ChartStepLine with curved corners
<ChartStepLine
  data={chartData}
  categories={['cat1', 'cat2']}
  index="month"
  config={chartConfig}
  className="h-[180px]"
/>
```

**Features**:
- D3.js path manipulation
- Curved corners (d3-curve-circlecorners)
- Intelligent gap placement
- ResizeObserver/MutationObserver for updates
- Custom tooltip positioning

## 6. Empty State Patterns

### Empty State Component Structure

```tsx
// Widget empty state variant
export function WidgetMyCardsEmpty() {
  return (
    <WidgetBox.Root>
      <WidgetBox.Header>
        <WidgetBox.HeaderIcon>
          <RiWallet3Line />
        </WidgetBox.HeaderIcon>
        My Cards
      </WidgetBox.Header>

      <div className="flex flex-col items-center justify-center py-12">
        {/* SVG Illustration */}
        <EmptyStateIllustration />

        <h3 className="text-label-md mt-6">No cards yet</h3>
        <p className="text-paragraph-sm text-text-sub mt-2">
          Add a card to get started
        </p>

        <Button className="mt-6" variant="primary">
          <RiAddLine />
          Add Card
        </Button>
      </div>
    </WidgetBox.Root>
  );
}
```

**Pattern**:
1. Same `WidgetBox.Root` + Header structure
2. Centered content with illustration
3. Title (text-label-md)
4. Description (text-paragraph-sm text-text-sub)
5. Primary action button

## 7. Sidebar & Navigation

### Sidebar Structure

```tsx
// Collapsible sidebar with keyboard shortcut
const [collapsed, setCollapsed] = useCollapsedState();

useHotkeys('ctrl+b', () => setCollapsed(!collapsed));

<aside className={cn(
  "fixed left-0 top-0 h-screen transition-all",
  collapsed ? "w-20" : "w-[272px]"
)}>
  <SidebarHeader collapsed={collapsed} />

  <nav>
    {navigationLinks.map(link => (
      <NavItem
        key={link.href}
        icon={link.icon}
        label={link.label}
        href={link.href}
        collapsed={collapsed}
      />
    ))}
  </nav>

  <SettingsAndSupport collapsed={collapsed} />
  <UserProfile collapsed={collapsed} />
</aside>
```

**Features**:
- Fixed positioning (272px → 80px)
- Keyboard shortcut (Ctrl+B)
- `data-hide-collapsed` attribute for content hiding
- Transition animations

### Mobile Menu

```tsx
// Full-screen dialog with tabs
const [open, setOpen] = useState(false);

<Dialog.Root open={open} onOpenChange={setOpen}>
  <Dialog.Trigger>Menu</Dialog.Trigger>

  <Dialog.Content className="h-screen w-screen">
    <TabMenuHorizontal.Root defaultValue="main">
      <TabMenuHorizontal.List>
        <TabMenuHorizontal.Trigger value="main">Main</TabMenuHorizontal.Trigger>
        <TabMenuHorizontal.Trigger value="favorites">Favorites</TabMenuHorizontal.Trigger>
      </TabMenuHorizontal.List>

      <TabMenuHorizontal.Content value="main">
        {/* Navigation links */}
      </TabMenuHorizontal.Content>
    </TabMenuHorizontal.Root>
  </Dialog.Content>
</Dialog.Root>
```

**Auto-close triggers**:
- Pathname change
- Breakpoint reaches `lg` (1024px+)
- User closes explicitly

## 8. Settings Page Pattern

### Two-Tier Layout

```tsx
// app/settings/layout.tsx
<div className="lg:grid lg:grid-cols-[auto,minmax(0,1fr)]">
  <Sidebar defaultCollapsed />

  <div className="lg:grid lg:grid-cols-[272px,minmax(0,1fr)]">
    <SettingsVerticalMenu />

    <div className="p-6">
      {children}
    </div>
  </div>
</div>
```

**Navigation hierarchy**:
1. Primary nav: Collapsed sidebar
2. Secondary nav: Settings vertical menu
3. Content: Settings pages

### Settings Menu (Vertical Tabs)

```tsx
<TabMenuVertical.Root value={pathname}>
  <TabMenuVertical.List>
    <TabMenuVertical.Trigger value="/settings/account" asChild>
      <Link href="/settings/account">
        <RiUserLine />
        Account
      </Link>
    </TabMenuVertical.Trigger>
  </TabMenuVertical.List>
</TabMenuVertical.Root>
```

## 9. Key Design Tokens

### Typography Classes

```
title-h1 to title-h6    → Headings (3.5rem → 1.25rem)
label-xl to label-xs    → Labels (1.5rem → 0.75rem, weight 500)
paragraph-xl to paragraph-xs → Body text (1.5rem → 0.75rem, weight 400)
subheading-md to subheading-2xs → Subheadings
```

### Semantic Colors

```
Primary: primary-base, primary-dark, primary-darker
Background: bg-white-0 → bg-strong-950
Text: text-white-0 → text-strong-950
Stroke: stroke-white-0 → stroke-strong-950

States: error, success, warning, information, away, feature
Each with: -dark, -base, -light, -lighter
```

### Spacing & Sizing

**Border radius**: 2px to 24px scale
**Shadows**: 18 predefined shadow levels
**Max width**: 1360px (dashboard content)

## 10. State Management Pattern

### Jotai Atoms

```tsx
// Define atoms
const myCardDetailDataAtom = atom<CardData | null>(null);
const myCardDetailModalOpenAtom = atom(false);
const filteredCardTypeAtom = atom<'all' | 'virtual' | 'physical'>('all');

// Use in components
const [cardData, setCardData] = useAtom(myCardDetailDataAtom);
const [isOpen, setIsOpen] = useAtom(myCardDetailModalOpenAtom);
const [filterType] = useAtom(filteredCardTypeAtom);
```

**Common atoms**:
- `myCardDetailDataAtom` → Selected card data
- `myCardDetailModalOpenAtom` → Card drawer state
- `transactionDetailModalOpenAtom` → Transaction drawer state
- `filteredCardTypeAtom` → Card type filter
- `filteredTransactionTypeAtom` → Transaction filter

## 11. Animation Pattern (Framer Motion)

```tsx
// Stagger children animation
<motion.div
  initial="hidden"
  animate="show"
  variants={{
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }}
>
  {items.map(item => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
    >
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

## 12. Form Patterns

### Filter Component

```tsx
// Standard filter bar pattern
<div className="flex items-center justify-between gap-4">
  <div className="flex items-center gap-2">
    <SegmentedControl.Root value={filter} onValueChange={setFilter}>
      <SegmentedControl.Trigger value="all">All</SegmentedControl.Trigger>
      <SegmentedControl.Trigger value="income">Income</SegmentedControl.Trigger>
      <SegmentedControl.Trigger value="expenses">Expenses</SegmentedControl.Trigger>
    </SegmentedControl.Root>
  </div>

  <div className="flex items-center gap-2">
    <Input.Root>
      <Input.SearchIcon />
      <Input.Input placeholder="Search..." />
      <Input.Shortcut keys={['⌘', 'K']} />
    </Input.Root>

    <Button variant="secondary">
      <RiFilterLine />
      Filters
    </Button>
  </div>
</div>
```

---

## Summary: Key Takeaways

1. **Widget-first architecture**: Everything is a WidgetBox with consistent structure
2. **Responsive grid**: Mobile-first with 1→2→3 column progression
3. **State via Jotai**: Atoms for modal/drawer state and filters
4. **Empty states**: Every widget has empty variant with illustration
5. **TanStack Table**: Standard for data tables with sorting/pagination
6. **Chart system**: Recharts + ChartContainer with HSL color tokens
7. **Drawer pattern**: Details shown in side drawers (cards, transactions)
8. **Tabs**: SegmentedControl for inline, TabMenu for full navigation
9. **Typography**: Predefined text-* classes for consistency
10. **Animation**: Framer Motion for list stagger and transitions

**File paths** (for reference):
- `/components/widgets/*` → All widget components
- `/components/ui/*` → Core UI library (AlignUI)
- `/app/(main)/(home)/page.tsx` → Dashboard layout
- `/components/chart*.tsx` → Chart components
- `/components/transaction*.tsx` → Transaction components
