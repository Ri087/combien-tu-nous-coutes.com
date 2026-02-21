# Skill: How to Type Component Props

## When to Use

Use this skill whenever you create or modify a React component that accepts props. Proper typing ensures type safety, IDE autocompletion, and prevents runtime errors.

## Basic Props Interface

Define an `interface` for component props. Name it `{ComponentName}Props`.

```tsx
interface ProjectCardProps {
  name: string;
  description?: string;  // Optional prop
  status: "active" | "archived";  // Union type
  onEdit: (id: string) => void;  // Callback
}

export function ProjectCard({ name, description, status, onEdit }: ProjectCardProps) {
  return (
    <div>
      <h3>{name}</h3>
      {description && <p>{description}</p>}
    </div>
  );
}
```

## Interface vs Type

Use `interface` for component props. It provides better error messages and is the convention in this codebase.

```tsx
// PREFERRED -- interface
interface ProjectCardProps {
  name: string;
  status: string;
}

// ACCEPTABLE -- type alias (use only when intersection types are needed)
type ProjectCardProps = BaseCardProps & {
  projectId: string;
};
```

## Extending HTML Element Props

When your component wraps a native HTML element and should accept all its standard attributes, extend `React.ComponentProps`.

### Pattern: ComponentProps (for components without forwardRef)

```tsx
import type React from "react";
import { cn } from "@/lib/utils/cn";

interface CardProps extends React.ComponentProps<"div"> {
  variant?: "default" | "elevated";
}

export function Card({ variant = "default", className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4",
        variant === "elevated" && "shadow-complex",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

This is the pattern used by the `Logo` component in the codebase:

```tsx
// components/logo.tsx
import type React from "react";
import { cn } from "@/lib/utils/cn";

function Logo({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      className={cn("h-8 w-auto", className)}
      fill="currentColor"
      viewBox="0 0 389 237"
      {...props}
    >
      {/* paths */}
    </svg>
  );
}

export { Logo };
```

### Common HTML Elements to Extend

```tsx
React.ComponentProps<"div">      // For wrapper/container components
React.ComponentProps<"button">   // For custom button components
React.ComponentProps<"input">    // For custom input components
React.ComponentProps<"a">        // For custom link components
React.ComponentProps<"svg">      // For icon/svg components
React.ComponentProps<"form">     // For form wrapper components
React.ComponentProps<"img">      // For image components
React.ComponentProps<"ul">       // For list components
React.ComponentProps<"table">    // For table wrapper components
```

### Pattern: ComponentPropsWithRef (for components with forwardRef)

```tsx
import type React from "react";

interface CustomInputProps extends React.ComponentPropsWithRef<"input"> {
  hasError?: boolean;
}
```

## Children Typing

### Explicit `children` Prop

```tsx
interface LayoutProps {
  children: React.ReactNode;  // Accepts anything renderable
}

export function Layout({ children }: LayoutProps) {
  return <div className="p-6">{children}</div>;
}
```

### ReactNode vs ReactElement

```tsx
// React.ReactNode -- accepts everything: string, number, null, undefined, JSX
interface WrapperProps {
  children: React.ReactNode;
}

// React.ReactElement -- accepts ONLY JSX elements (no strings/numbers)
interface StrictWrapperProps {
  children: React.ReactElement;
}
```

Always prefer `React.ReactNode` unless you have a specific reason to restrict to elements only.

### Children as a Slot Pattern

```tsx
interface PageSectionProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;  // Optional slot
  children: React.ReactNode;  // Main content
}

export function PageSection({ title, description, actions, children }: PageSectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-label-lg text-text-strong-950">{title}</h2>
          {description && <p className="text-paragraph-sm text-text-sub-600">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
```

## Callback Props

Type callbacks with explicit parameter and return types.

```tsx
interface ProjectListProps {
  // Simple callback
  onRefresh: () => void;

  // Callback with parameter
  onSelect: (projectId: string) => void;

  // Callback with multiple parameters
  onSort: (field: string, direction: "asc" | "desc") => void;

  // Async callback
  onDelete: (projectId: string) => Promise<void>;

  // Optional callback
  onHover?: (projectId: string) => void;
}
```

## Render Prop / Function as Child

```tsx
interface DataListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

export function DataList<T>({ items, renderItem, keyExtractor }: DataListProps<T>) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((item, index) => (
        <div key={keyExtractor(item)}>{renderItem(item, index)}</div>
      ))}
    </div>
  );
}
```

## Generic Props

Use generics when the component works with different data types.

```tsx
interface SelectFieldProps<T extends string> {
  value: T;
  options: Array<{ label: string; value: T }>;
  onChange: (value: T) => void;
}

export function SelectField<T extends string>({
  value,
  options,
  onChange,
}: SelectFieldProps<T>) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as T)}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
```

### Generic Props with React Hook Form (from codebase)

The form components use advanced generics to ensure type safety with React Hook Form:

```tsx
import type { ControllerProps, FieldPath, FieldValues } from "react-hook-form";

interface FormInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<ControllerProps<TFieldValues, TName>, "render"> {
  label?: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  icon?: React.ElementType;
  disabled?: boolean;
}

export function FormInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ name, control, label, ...rest }: FormInputProps<TFieldValues, TName>) {
  // ...
}
```

## Icon Props

Use `React.ElementType` for icon components passed as props.

```tsx
interface MenuItemProps {
  icon: React.ElementType;  // A component type (not an instance)
  label: string;
  onClick: () => void;
}

export function MenuItem({ icon: Icon, label, onClick }: MenuItemProps) {
  return (
    <button onClick={onClick} className="flex items-center gap-2">
      <Icon className="size-5 text-text-sub-600" />
      <span>{label}</span>
    </button>
  );
}

// Usage
import { RiSettingsLine } from "@remixicon/react";
<MenuItem icon={RiSettingsLine} label="Settings" onClick={handleSettings} />
```

## Discriminated Unions

Use discriminated unions when a component has different shapes depending on a prop.

```tsx
interface BaseNotificationProps {
  title: string;
  timestamp: string;
}

interface InfoNotificationProps extends BaseNotificationProps {
  type: "info";
  message: string;
}

interface ActionNotificationProps extends BaseNotificationProps {
  type: "action";
  actionLabel: string;
  onAction: () => void;
}

type NotificationProps = InfoNotificationProps | ActionNotificationProps;

export function Notification(props: NotificationProps) {
  if (props.type === "info") {
    return <p>{props.message}</p>;  // TypeScript knows `message` exists here
  }
  return <button onClick={props.onAction}>{props.actionLabel}</button>;  // TypeScript knows `onAction` exists here
}
```

## Variant Props with `tv()` (Tailwind Variants)

When building components with visual variants, use `VariantProps` from `tv()`.

```tsx
import { tv, type VariantProps } from "@/lib/utils/tv";

const cardVariants = tv({
  base: "rounded-xl border p-4",
  variants: {
    variant: {
      default: "border-stroke-soft-200 bg-bg-white-0",
      elevated: "border-stroke-soft-200 bg-bg-white-0 shadow-complex",
      outlined: "border-stroke-soft-200 bg-transparent",
    },
    size: {
      sm: "p-3",
      md: "p-4",
      lg: "p-6",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

interface CardProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof cardVariants> {
  // Additional custom props if needed
}

export function Card({ variant, size, className, children, ...props }: CardProps) {
  return (
    <div className={cardVariants({ variant, size, class: className })} {...props}>
      {children}
    </div>
  );
}
```

## Omit and Pick for Selective Extension

```tsx
// Omit props you want to override
interface CustomButtonProps extends Omit<React.ComponentProps<"button">, "type" | "onClick"> {
  variant: "primary" | "secondary";
  onPress: () => void;  // Custom click handler
}

// Pick only specific props
interface TitleProps extends Pick<React.ComponentProps<"h1">, "className" | "id"> {
  text: string;
  level: 1 | 2 | 3;
}
```

## Common Anti-Patterns to Avoid

```tsx
// WRONG: Using `any`
interface BadProps {
  data: any;
  callback: any;
}

// WRONG: Using overly broad types when specific types are known
interface BadProps {
  status: string;  // Should be "active" | "archived"
  size: number;    // Should be "sm" | "md" | "lg"
}

// WRONG: Not typing optional props
interface BadProps {
  name: string;
  description;  // Missing type annotation
}

// WRONG: Using object instead of specific shape
interface BadProps {
  project: object;  // Use the actual Project type
}
```

## Checklist

- [ ] Props interface named `{ComponentName}Props`
- [ ] `interface` used (not `type`) unless intersection is needed
- [ ] Optional props marked with `?`
- [ ] No `any` types -- use `unknown` if truly unknown
- [ ] Union types used for constrained string/number values
- [ ] `React.ComponentProps<"element">` used when wrapping HTML elements
- [ ] `React.ReactNode` used for children and slot props
- [ ] `React.ElementType` used for icon/component props
- [ ] Callbacks typed with explicit parameters and return types
- [ ] `className?: string` included if the component accepts custom classes
