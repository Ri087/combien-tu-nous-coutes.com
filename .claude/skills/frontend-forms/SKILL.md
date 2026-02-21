---
name: frontend-forms
description: |
  React Hook Form + Zod form development guide. Use when creating forms, validating form input, using form wrapper components (FormInput, FormSelect, FormPassword, etc.), handling form submission, displaying errors, resetting forms, implementing file uploads, or rich text editors in forms.
---

# React Hook Form + Zod Form Development

This skill covers the complete form development workflow using React Hook Form with Zod validation. It includes creating forms with the standard pattern, using pre-built form wrapper components (FormInput, FormSelect, FormPassword, etc.), handling submission with oRPC mutations, displaying validation errors, resetting form state, implementing file uploads, and integrating rich text editors.

## Reference Files

- **create-form.md** -- How to create a new form with React Hook Form, Zod resolver, and the standard boilerplate
- **form-validation.md** -- How to wire up Zod schemas for client-side validation with `zodResolver`
- **form-components.md** -- Reference for pre-built form components: FormInput, FormSelect, FormPassword, FormTextarea, etc.
- **form-submission.md** -- How to handle form submission with oRPC mutations and loading states
- **form-errors.md** -- How to display field-level and form-level validation errors
- **form-reset.md** -- How to reset form state after successful submission or on cancel
- **form-file-upload.md** -- How to implement file upload fields within forms
- **form-rich-text.md** -- How to integrate a Tiptap rich text editor as a form field

## Key Rules

1. **Always use `zodResolver` with a shared Zod schema** from `/validators/`. Never duplicate validation logic between client and server.
2. **Always use pre-built form components** (FormInput, FormSelect, etc.) instead of raw AlignUI inputs with manual `register()`.
3. **Always handle the loading state** during form submission by disabling the submit button and showing a spinner.
4. **Always display validation errors** using the form component error props, not custom error rendering.
5. **Always use `useForm` with explicit type parameter** derived from the Zod schema via `z.infer`.

## Related Skills

- **validation-skills** -- Zod schemas shared between forms and API routes
- **frontend-ui** -- AlignUI components that the form components wrap
- **frontend-state** -- TanStack Query mutations used for form submission
- **backend-orpc** -- API endpoints that receive form data
