# Skill: How to Use forwardRef

## When to Use

Use `forwardRef` when a component needs to expose a DOM element reference to its parent. This is required for:

1. **Components used with third-party libraries** that need DOM access (e.g., Radix UI, floating-ui, focus management)
2. **Custom input components** that need to be focused programmatically
3. **Animation targets** that need DOM measurement or manipulation
4. **Scroll containers** that need programmatic scrolling
5. **Components that wrap native HTML elements** and should behave as transparent wrappers

## When NOT to Use forwardRef

Do NOT use forwardRef when:

- The component never needs to expose its DOM element to parents
- The component manages its own internal refs without exposing them
- The component does not wrap a single native HTML element

Most feature components (cards, lists, modals, pages) do NOT need forwardRef.

## Basic Syntax (React 19+)

In React 19 (used with Next.js 16), `ref` is a regular prop. You do not need `React.forwardRef` -- just accept `ref` as a prop.

```tsx
"use client";

import type React from "react";

import { cn } from "@/lib/utils/cn";

interface CustomInputProps extends React.ComponentPropsWithRef<"input"> {
  hasError?: boolean;
}

export function CustomInput({ hasError, className, ref, ...props }: CustomInputProps) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-lg border px-3 text-paragraph-sm",
        "border-stroke-soft-200 bg-bg-white-0 text-text-strong-950",
        "placeholder:text-text-soft-400",
        "focus:outline-none focus:ring-2 focus:ring-primary-base",
        hasError && "border-error-base",
        className
      )}
      {...props}
    />
  );
}
```

**Usage:**

```tsx
"use client";

import { useRef } from "react";
import { CustomInput } from "./custom-input";

export function SearchForm() {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFocus() {
    inputRef.current?.focus();
  }

  return (
    <div>
      <CustomInput ref={inputRef} placeholder="Search..." />
      <button onClick={handleFocus}>Focus input</button>
    </div>
  );
}
```

## Legacy Syntax (React.forwardRef)

If you encounter existing code using `React.forwardRef`, this is the pattern. It still works but the React 19 approach above is preferred for new code.

```tsx
"use client";

import * as React from "react";

import { cn } from "@/lib/utils/cn";

interface CustomInputProps extends React.ComponentPropsWithoutRef<"input"> {
  hasError?: boolean;
}

const CustomInput = React.forwardRef<HTMLInputElement, CustomInputProps>(
  ({ hasError, className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-10 w-full rounded-lg border px-3",
          hasError && "border-error-base",
          className
        )}
        {...props}
      />
    );
  }
);

CustomInput.displayName = "CustomInput";

export { CustomInput };
```

Key differences from the React 19 pattern:
- Uses `React.forwardRef<ElementType, PropsType>` wrapper
- `ref` comes as a second argument to the render function, not in props
- Uses `ComponentPropsWithoutRef` (ref is handled by forwardRef)
- Requires `displayName` for DevTools

## Typing the Ref

### For Standard HTML Elements

```tsx
// Input element
React.ComponentPropsWithRef<"input">   // ref?: React.Ref<HTMLInputElement>

// Div element
React.ComponentPropsWithRef<"div">     // ref?: React.Ref<HTMLDivElement>

// Button element
React.ComponentPropsWithRef<"button">  // ref?: React.Ref<HTMLButtonElement>

// Anchor element
React.ComponentPropsWithRef<"a">       // ref?: React.Ref<HTMLAnchorElement>

// Form element
React.ComponentPropsWithRef<"form">    // ref?: React.Ref<HTMLFormElement>

// Textarea element
React.ComponentPropsWithRef<"textarea"> // ref?: React.Ref<HTMLTextAreaElement>
```

### For Custom Ref Types (useImperativeHandle)

When you want to expose a custom API instead of the raw DOM element:

```tsx
"use client";

import { useImperativeHandle, useRef } from "react";
import type React from "react";

interface ScrollableListHandle {
  scrollToTop: () => void;
  scrollToBottom: () => void;
  scrollToItem: (index: number) => void;
}

interface ScrollableListProps {
  ref?: React.Ref<ScrollableListHandle>;
  items: Array<{ id: string; label: string }>;
}

export function ScrollableList({ ref, items }: ScrollableListProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    scrollToTop: () => {
      containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    },
    scrollToBottom: () => {
      const el = containerRef.current;
      el?.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    },
    scrollToItem: (index: number) => {
      const child = containerRef.current?.children[index];
      child?.scrollIntoView({ behavior: "smooth" });
    },
  }));

  return (
    <div ref={containerRef} className="h-96 overflow-y-auto">
      {items.map((item) => (
        <div key={item.id} className="p-3 border-b border-stroke-soft-200">
          {item.label}
        </div>
      ))}
    </div>
  );
}
```

**Usage:**

```tsx
"use client";

import { useRef } from "react";
import { ScrollableList, type ScrollableListHandle } from "./scrollable-list";

export function ItemBrowser() {
  const listRef = useRef<ScrollableListHandle>(null);

  return (
    <div>
      <button onClick={() => listRef.current?.scrollToTop()}>
        Back to top
      </button>
      <ScrollableList ref={listRef} items={items} />
    </div>
  );
}
```

## Combining forwardRef with AlignUI Components

When building a custom component that wraps an AlignUI component and needs ref forwarding:

```tsx
"use client";

import type React from "react";
import { RiSearchLine } from "@remixicon/react";

import * as Input from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

interface SearchInputProps {
  ref?: React.Ref<HTMLInputElement>;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ ref, value, onChange, placeholder, className }: SearchInputProps) {
  return (
    <div className={cn("w-full", className)}>
      <Input.Root size="medium">
        <Input.Wrapper>
          <Input.Icon as={RiSearchLine} />
          <Input.Input
            ref={ref}
            placeholder={placeholder ?? "Search..."}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </Input.Wrapper>
      </Input.Root>
    </div>
  );
}
```

## Merging Refs

When a component needs both an internal ref and a forwarded ref, merge them:

```tsx
"use client";

import { useRef, useEffect, useCallback } from "react";
import type React from "react";

interface AutoResizeTextareaProps extends React.ComponentPropsWithRef<"textarea"> {
  maxHeight?: number;
}

export function AutoResizeTextarea({ ref, maxHeight = 300, ...props }: AutoResizeTextareaProps) {
  const internalRef = useRef<HTMLTextAreaElement>(null);

  // Merge the forwarded ref with the internal ref
  const mergedRef = useCallback(
    (node: HTMLTextAreaElement | null) => {
      internalRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
      }
    },
    [ref]
  );

  useEffect(() => {
    const textarea = internalRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  }, [props.value, maxHeight]);

  return (
    <textarea
      ref={mergedRef}
      className="w-full resize-none rounded-lg border border-stroke-soft-200 p-3"
      {...props}
    />
  );
}
```

## Practical Examples from This Codebase

### Example: Focusable Card Component

```tsx
"use client";

import type React from "react";
import { cn } from "@/lib/utils/cn";

interface FocusableCardProps extends React.ComponentPropsWithRef<"div"> {
  isSelected?: boolean;
}

export function FocusableCard({
  ref,
  isSelected,
  className,
  children,
  ...props
}: FocusableCardProps) {
  return (
    <div
      ref={ref}
      tabIndex={0}
      role="button"
      className={cn(
        "rounded-xl border p-4 outline-none transition",
        "border-stroke-soft-200 bg-bg-white-0",
        "hover:shadow-complex focus-visible:ring-2 focus-visible:ring-primary-base",
        isSelected && "border-primary-base ring-1 ring-primary-base",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

## Decision Tree

```
Does the component need to expose a DOM ref to parents?
  NO  -> Do NOT use forwardRef. Use a simple function component.
  YES -> Does it need a custom imperative API?
    NO  -> Use React 19 ref prop with ComponentPropsWithRef
    YES -> Use useImperativeHandle with a custom handle type
```

## Checklist

- [ ] Component genuinely needs ref forwarding (not added "just in case")
- [ ] Using React 19 `ref` prop pattern (preferred) or `React.forwardRef` (legacy)
- [ ] Ref type matches the underlying DOM element (`HTMLInputElement`, `HTMLDivElement`, etc.)
- [ ] `ComponentPropsWithRef` used when extending HTML element props
- [ ] `useImperativeHandle` used only when exposing a custom API (not raw DOM)
- [ ] `displayName` set if using the legacy `React.forwardRef` pattern
- [ ] Component is a Client Component (`"use client"`) since refs require client-side rendering
- [ ] All remaining HTML props spread onto the target element with `{...props}`
