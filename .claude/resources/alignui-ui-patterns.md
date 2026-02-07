# AlignUI Marketing Template - UI Patterns & Component Composition

Extracted from DeepWiki analysis of marketing-template-alignui repository.

## 1. Sidebar Navigation Structure

### Navigation Data Structure
```tsx
type NavigationLink = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  disabled?: boolean;
};

export const navigationLinks: NavigationLink[] = [
  { icon: RiLayoutGridLine, label: 'Overview', href: '/' },
  { icon: RiBarChartBoxLine, label: 'Analytics', href: '/analytics' },
  { icon: RiShoppingBag2Line, label: 'Products', href: '/products' },
  { icon: RiHistoryLine, label: 'Orders', href: '/orders' },
];
```

### Responsive Sidebar Pattern
```tsx
// Desktop sidebar - hidden on mobile
<aside className='hidden w-64 shrink-0 flex-col gap-4 border-r border-stroke-soft-200 p-4 lg:flex'>
  {/* Sidebar content */}
</aside>

// Mobile dropdown - hidden on desktop
<div className='p-4 pb-0 lg:hidden'>
  {/* Mobile navigation */}
</div>
```

**Key Files:**
- `components/sidebar.tsx` - Main sidebar component
- `app/(main)/layout.tsx` - Layout with sidebar integration

---

## 2. Layout Architecture

### Layout Hierarchy
```
app/layout.tsx (Root Layout)
├── app/(auth)/layout.tsx (Auth Layout - login, register)
└── app/(main)/layout.tsx (Main Layout - authenticated pages)
    ├── Sidebar (desktop) / HeaderMobile (mobile)
    ├── Header (user button, notifications)
    └── Content Area
```

### Main Layout Pattern
```tsx
// app/(main)/layout.tsx structure
<div className="flex h-screen">
  {/* Desktop Sidebar */}
  <Sidebar className="hidden lg:flex" />

  <div className="flex-1 flex flex-col">
    {/* Mobile Header */}
    <HeaderMobile className="lg:hidden" />

    {/* Main Content */}
    <main className="flex-1 overflow-auto">
      {children}
    </main>
  </div>
</div>
```

**Key Components:**
- `components/sidebar.tsx`
- `components/header-mobile.tsx`
- `components/user-button.tsx`
- `components/company-switch.tsx`

---

## 3. Dashboard Widget Patterns

### Analytics Widget System
```tsx
// Widget component structure
export function WidgetSupportAnalytics() {
  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <h3>Analytics Title</h3>
        <Select /> {/* Period selector */}
      </div>

      {/* Chart/Data Visualization */}
      <ResponsiveContainer>
        <LineChart data={data}>
          {/* Chart components */}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

### Chart Libraries Used
- **recharts** - LineChart, ResponsiveContainer
- **d3-scale** - scaleLinear for custom scales
- **date-fns** - format, getWeek for date handling

**Key Widget Files:**
- `components/widgets/marketing-channels.tsx`
- `components/widgets/widget-support-analytics.tsx`
- `components/chart-category-bar.tsx`
- `components/legend-dot.tsx`

**Analytics Pages:**
- `app/(main)/analytics/summary.tsx`
- `app/(main)/analytics/total-sales.tsx`
- `app/(main)/analytics/total-sales-chart.tsx`

---

## 4. Data Table & List Patterns

### Table Component Structure
```tsx
// Table composition using AlignUI components
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableCell>Column 1</TableCell>
      <TableCell>Column 2</TableCell>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map(item => (
      <TableRow key={item.id}>
        <TableCell>{item.name}</TableCell>
        <TableCell>{item.value}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Product Card Pattern
```tsx
// Feature component using base UI components
export function ProductCard({ product }) {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      {/* Product image */}
      <img src={product.image} />

      {/* Product details with base components */}
      <div className="space-y-2">
        <h3>{product.name}</h3>
        <Badge variant="outline">{product.category}</Badge>
        <StatusBadge status={product.status} />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="ghost">Edit</Button>
        <Button variant="outline">Delete</Button>
      </div>
    </div>
  );
}
```

**Key Files:**
- `components/ui/table.tsx` - Table base components
- `app/(main)/products/product-card.tsx` - Product display
- `app/(main)/products/edit-product-drawer.tsx` - Edit UI

---

## 5. Form Component Patterns

### Form Structure with Validation
```tsx
// Multi-step form pattern (from add-product flow)
export function StepAddProductDetails() {
  const [name, setName] = useAtom(productNameAtom);
  const [category, setCategory] = useAtom(productCategoryAtom);

  return (
    <div className="space-y-4">
      <InputRoot>
        <InputLabel>Product Name</InputLabel>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          hasError={!name}
        />
      </InputRoot>

      <SelectRoot value={category} onValueChange={setCategory}>
        <SelectTrigger>
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="electronics">Electronics</SelectItem>
          <SelectItem value="clothing">Clothing</SelectItem>
        </SelectContent>
      </SelectRoot>
    </div>
  );
}
```

### Input Component Variants
```tsx
// Standard Input
import { Input, InputRoot, InputLabel } from '@/components/ui/input';

// Custom styled variants
import { CustomInput } from '@/components/custom-input';
import { EditableInput } from '@/components/editable-input';

// Specialized inputs
import { DigitInput } from '@/components/ui/digit-input';
import { Textarea } from '@/components/ui/textarea';
```

**Form Component Files:**
- `components/ui/input.tsx` - Base input system
- `components/ui/select.tsx` - Base select system
- `components/ui/button.tsx` - Button variants
- `components/custom-input.tsx` - Custom styled input
- `components/custom-select.tsx` - Custom styled select
- `components/ui/textarea.tsx` - Textarea component

**Form Feature Examples:**
- `app/add-product/step-add-product-details.tsx`
- `app/add-product/step-set-product-price.tsx`
- `app/add-product/step-add-stock-status.tsx`

---

## 6. Component Composition Patterns

### Base UI Component Usage
**ALWAYS use components from `/components/ui/` - DO NOT create custom base components**

```tsx
// ✅ CORRECT - Use AlignUI components
import { Button } from '@/components/ui/button';
import { Input, InputRoot } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarRoot } from '@/components/ui/avatar';

// ❌ WRONG - Don't create custom base components
<button className="...">Click</button>
<input className="..." />
```

### Variant System (tailwind-variants)
```tsx
// All components use tv() for styling variants
import { tv, type VariantProps } from 'tailwind-variants';

const buttonVariants = tv({
  base: 'inline-flex items-center justify-center rounded-lg',
  variants: {
    variant: {
      primary: 'bg-primary text-white',
      outline: 'border border-stroke',
      ghost: 'hover:bg-bg-weak-50',
    },
    size: {
      small: 'h-9 px-3 text-sm',
      medium: 'h-10 px-4 text-base',
      large: 'h-11 px-6 text-base',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'medium',
  },
});

type ButtonProps = VariantProps<typeof buttonVariants> & ComponentProps<'button'>;
```

### Polymorphic Components (asChild pattern)
```tsx
// Components support polymorphic rendering via asChild
import { Slot } from '@radix-ui/react-slot';

<Button asChild>
  <Link href="/products">View Products</Link>
</Button>

// Renders as: <a href="/products" class="button-styles">View Products</a>
```

### Slot-Based Composition
```tsx
// Complex components use slots for sub-elements
<InputRoot size="medium" hasError={error}>
  <InputLabel>Email</InputLabel>
  <Input type="email" />
  <InputIcon><MailIcon /></InputIcon>
  <InputAffix>@example.com</InputAffix>
</InputRoot>

<SelectRoot>
  <SelectTrigger>
    <SelectValue />
    <SelectIcon />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
  </SelectContent>
</SelectRoot>
```

---

## 7. State Management Patterns

### Jotai Atoms for Form State
```tsx
import { atom } from 'jotai';

// Product creation atoms
export const productNameAtom = atom('');
export const productCategoryAtom = atom('');
export const productPriceAtom = atom(0);
export const productStockAtom = atom('in-stock');

// Settings modal atom
export const settingsModalOpenAtom = atom(false);

// Usage in components
const [name, setName] = useAtom(productNameAtom);
const setSettingsOpen = useSetAtom(settingsModalOpenAtom);
```

### Modal State Management
```tsx
// Global modal state with Jotai
const settingsModalOpenAtom = atom<boolean>(false);

// Trigger from anywhere
const setSettingsModalOpen = useSetAtom(settingsModalOpenAtom);
<Button onClick={() => setSettingsModalOpen(true)}>Settings</Button>

// Modal component
const [isOpen, setIsOpen] = useAtom(settingsModalOpenAtom);
<Modal open={isOpen} onOpenChange={setIsOpen}>
  {/* Modal content */}
</Modal>
```

---

## 8. Feature-First Organization

### Feature Component Structure
```
/app/(main)/products/
  page.tsx                     # Page component
  _components/
    product-list.tsx           # Feature-specific components
    product-card.tsx
    product-filters.tsx
  _hooks/
    use-products.ts            # Feature-specific hooks
    use-product-filters.ts
```

### Multi-Step Flow Pattern
```
/app/add-product/
  page.tsx                     # Main page with stepper
  sidebar.tsx                  # Step navigation sidebar
  store-steps.tsx              # Step state management
  step-add-product-details.tsx # Step 1
  step-set-product-price.tsx   # Step 2
  step-add-product-images.tsx  # Step 3
  step-add-stock-status.tsx    # Step 4
  step-summary.tsx             # Step 5 (summary)
```

---

## 9. Display Component Patterns

### Badge System
```tsx
import { Badge, BadgeRoot, BadgeIcon, BadgeDot } from '@/components/ui/badge';

// Simple badge
<Badge variant="outline" color="blue">New</Badge>

// Badge with icon
<BadgeRoot>
  <BadgeIcon><CheckIcon /></BadgeIcon>
  Verified
</BadgeRoot>

// Badge with dot
<BadgeRoot>
  <BadgeDot />
  In Stock
</BadgeRoot>
```

### Avatar Components
```tsx
import { Avatar, AvatarRoot, AvatarImage, AvatarIndicator } from '@/components/ui/avatar';

// Simple avatar
<AvatarRoot size="medium">
  <AvatarImage src="/user.jpg" alt="User" />
</AvatarRoot>

// Avatar with status
<AvatarRoot>
  <AvatarImage src="/user.jpg" />
  <AvatarIndicator>
    <AvatarStatus status="online" />
  </AvatarIndicator>
</AvatarRoot>

// Avatar group
<AvatarGroupRoot>
  <AvatarRoot><AvatarImage src="/user1.jpg" /></AvatarRoot>
  <AvatarRoot><AvatarImage src="/user2.jpg" /></AvatarRoot>
  <AvatarGroupOverflow>+3</AvatarGroupOverflow>
</AvatarGroupRoot>
```

### Status Badge
```tsx
import { StatusBadge } from '@/components/ui/status-badge';

<StatusBadge status="success">Active</StatusBadge>
<StatusBadge status="warning">Pending</StatusBadge>
<StatusBadge status="error">Failed</StatusBadge>
```

---

## 10. Stepper Components (Multi-Step Flows)

### Horizontal Stepper
```tsx
import {
  HorizontalStepperRoot,
  HorizontalStepperItem,
  HorizontalStepperItemIndicator,
  HorizontalStepperSeparatorIcon,
} from '@/components/ui/horizontal-stepper';

<HorizontalStepperRoot>
  <HorizontalStepperItem state="completed">
    <HorizontalStepperItemIndicator />
    Step 1
  </HorizontalStepperItem>

  <HorizontalStepperSeparatorIcon />

  <HorizontalStepperItem state="active">
    <HorizontalStepperItemIndicator />
    Step 2
  </HorizontalStepperItem>

  <HorizontalStepperSeparatorIcon />

  <HorizontalStepperItem state="default">
    <HorizontalStepperItemIndicator />
    Step 3
  </HorizontalStepperItem>
</HorizontalStepperRoot>
```

### Vertical Stepper
```tsx
import {
  VerticalStepperRoot,
  VerticalStepperItem,
  VerticalStepperItemIndicator,
} from '@/components/ui/vertical-stepper';

<VerticalStepperRoot>
  <VerticalStepperItem state="completed">
    <VerticalStepperItemIndicator />
    <div>
      <h3>Details</h3>
      <p>Add product information</p>
    </div>
  </VerticalStepperItem>

  <VerticalStepperItem state="active">
    <VerticalStepperItemIndicator />
    <div>
      <h3>Pricing</h3>
      <p>Set product price</p>
    </div>
  </VerticalStepperItem>
</VerticalStepperRoot>
```

---

## Key Takeaways

1. **Component Layering**: Base UI components → Custom variants → Feature components
2. **Responsive Design**: Desktop sidebar + Mobile dropdown pattern
3. **State Management**: Jotai atoms for form/modal state
4. **Styling**: tailwind-variants (tv) for all component variants
5. **Composition**: Slot-based architecture with asChild support
6. **Feature-First**: Organize by feature, not file type
7. **Radix Primitives**: All interactive components built on Radix UI
8. **Type Safety**: Full TypeScript with VariantProps types

**DO NOT modify** `/components/ui/` - use these base components to build features.
