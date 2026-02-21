---
name: frontend-ui
description: |
  AlignUI design system component reference. Use when implementing UI with buttons, inputs, selects, modals, drawers, tables, badges, alerts, avatars, tabs, dropdowns, tooltips, accordions, notifications, icons, pagination, skeletons, dividers. Also covers design tokens, typography, spacing/layout, and dark mode.
---

# AlignUI Design System Reference

This skill is the complete reference for the AlignUI design system used in this project. All UI should be built using these pre-built components from `/components/ui/`. Never create custom components for standard UI elements when an AlignUI component exists. This skill covers every available component, design tokens, typography scale, spacing and layout utilities, and dark mode support.

## Reference Files

- **button.md** -- Button component variants (solid, outlined, ghost), sizes, loading states, and icon buttons
- **input.md** -- Text input component with labels, hints, error states, and prefix/suffix slots
- **select.md** -- Select/dropdown component for single and multi-value selection
- **modal.md** -- Modal dialog component for confirmations, forms, and content overlays
- **drawer.md** -- Slide-out drawer component for side panels and mobile navigation
- **table.md** -- Data table component with sorting, pagination, and row selection
- **badge.md** -- Badge and tag components for status indicators and labels
- **alert.md** -- Alert component for success, warning, error, and info messages
- **avatar.md** -- Avatar component for user profile images with fallback initials
- **tabs.md** -- Tab navigation component for switching between content panels
- **dropdown.md** -- Dropdown menu component for contextual actions and navigation
- **tooltip.md** -- Tooltip component for hover hints and additional context
- **accordion.md** -- Collapsible accordion component for expandable content sections
- **notification.md** -- Toast notification component for transient feedback messages
- **icons.md** -- Icon system reference and how to use icons from the icon library
- **pagination.md** -- Pagination component for navigating multi-page content
- **skeleton.md** -- Skeleton loader component for content loading placeholders
- **divider.md** -- Divider component for visual separation of content sections
- **design-tokens.md** -- Color palette, border radius, shadow, and other design token values
- **typography.md** -- Typography scale, font sizes, weights, and text component usage
- **spacing-layout.md** -- Spacing scale, layout utilities, and responsive grid patterns
- **dark-mode.md** -- Dark mode implementation, theme switching, and color token usage

## Key Rules

1. **Always use AlignUI components from `/components/ui/`.** Never create custom buttons, inputs, modals, etc. when an AlignUI equivalent exists.
2. **Never modify files in `/components/ui/`.** This is the design system and must remain untouched.
3. **Use design tokens for colors and spacing.** Never hardcode color hex values or arbitrary spacing values.
4. **Check available components first** by reading this skill before creating any new UI element.
5. **Follow the component API exactly.** Each component has specific props documented in its reference file.

## Related Skills

- **frontend-components** -- General component patterns for wrapping and composing UI components
- **frontend-forms** -- Form-specific components that build on AlignUI inputs and selects
- **frontend-pages** -- Page layouts that use AlignUI components for structure
- **backend-email** -- Email components that share visual consistency with the UI system
