# Custom Validation Rules

## When to Use

When basic Zod field validators (`.min()`, `.max()`, `.email()`, etc.) are not enough. Use `.refine()` for cross-field checks, `.superRefine()` for complex multi-error logic, and `.transform()` for data normalization before it reaches your handler.

## .refine() -- Cross-Field Validation

Use `.refine()` when you need to validate a relationship between two or more fields. It runs after all field-level validations pass.

### Password confirmation (existing project pattern)

From `/validators/auth.ts`:

```typescript
import { z } from "zod";

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
```

Key points:
- `.refine()` is chained after `.object()`, not on individual fields
- The `path` option specifies which field should display the error in a form
- The callback receives the full parsed object

### Date range validation

```typescript
export const dateRangeSchema = z
  .object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  })
  .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  });
```

### Conditional required field

```typescript
export const contactSchema = z
  .object({
    contactMethod: z.enum(["email", "phone"]),
    email: z.string().email().optional(),
    phone: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.contactMethod === "email") return !!data.email;
      if (data.contactMethod === "phone") return !!data.phone;
      return true;
    },
    {
      message: "Please provide the selected contact method",
      path: ["email"], // Points to one field; see .superRefine() for dynamic paths
    }
  );
```

### Multiple .refine() calls

Chain multiple `.refine()` calls for independent checks. Each runs only if the previous one passes.

```typescript
export const eventSchema = z
  .object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    maxAttendees: z.number().int().positive(),
    currentAttendees: z.number().int().nonnegative(),
  })
  .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  })
  .refine((data) => data.currentAttendees <= data.maxAttendees, {
    message: "Current attendees cannot exceed maximum",
    path: ["currentAttendees"],
  });
```

## .superRefine() -- Complex Multi-Error Validation

Use `.superRefine()` when you need to add multiple errors or dynamically choose which field to attach errors to. Unlike `.refine()`, you control the error reporting directly via `ctx.addIssue()`.

### Multiple errors from one check

```typescript
export const registrationSchema = z
  .object({
    username: z.string().min(3).max(30),
    password: z.string(),
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password.length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password must be at least 8 characters",
        path: ["password"],
      });
    }
    if (!/[A-Z]/.test(data.password)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password must contain at least 1 uppercase letter",
        path: ["password"],
      });
    }
    if (!/[0-9]/.test(data.password)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password must contain at least 1 number",
        path: ["password"],
      });
    }
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords don't match",
        path: ["confirmPassword"],
      });
    }
  });
```

### Dynamic path based on input

```typescript
export const transferSchema = z
  .object({
    type: z.enum(["email", "phone", "wallet"]),
    email: z.string().optional(),
    phone: z.string().optional(),
    walletAddress: z.string().optional(),
    amount: z.number().positive(),
  })
  .superRefine((data, ctx) => {
    const fieldMap = {
      email: { field: "email", value: data.email },
      phone: { field: "phone", value: data.phone },
      wallet: { field: "walletAddress", value: data.walletAddress },
    };

    const required = fieldMap[data.type];
    if (!required.value || required.value.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${data.type} is required for this transfer type`,
        path: [required.field],
      });
    }
  });
```

## .transform() -- Data Normalization

Use `.transform()` to modify data after validation. The transformed value is what reaches your handler or component. The output type changes to reflect the transformation.

### Normalize strings

```typescript
export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100)
    .trim(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100)
    .transform((val) => val.toLowerCase().replace(/\s+/g, "-")),
  email: z
    .string()
    .email("Invalid email")
    .transform((val) => val.toLowerCase()),
});
```

### Parse numeric strings

Useful when GET query params arrive as strings but you need numbers:

```typescript
export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .default("1")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1)),
  pageSize: z
    .string()
    .optional()
    .default("20")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(100)),
});
```

The `.pipe()` after `.transform()` validates the transformed value with another Zod schema.

### Add computed fields

```typescript
export const createUserSchema = z
  .object({
    firstName: z.string().min(1).trim(),
    lastName: z.string().min(1).trim(),
    email: z.string().email(),
  })
  .transform((data) => ({
    ...data,
    fullName: `${data.firstName} ${data.lastName}`,
    email: data.email.toLowerCase(),
  }));

// The inferred type includes fullName:
// { firstName: string; lastName: string; email: string; fullName: string }
```

### Strip fields before sending to DB

```typescript
export const createAccountSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: "You must accept the terms" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .transform(({ confirmPassword, acceptTerms, ...rest }) => rest);

// Output type: { email: string; password: string }
// confirmPassword and acceptTerms are stripped
```

## Conditional Validation with .discriminatedUnion()

Use `z.discriminatedUnion()` when the shape of the object depends on a discriminator field. This gives better error messages and performance than `.refine()`.

```typescript
export const notificationSettingsSchema = z.discriminatedUnion("channel", [
  z.object({
    channel: z.literal("email"),
    emailAddress: z.string().email("Invalid email"),
    frequency: z.enum(["instant", "daily", "weekly"]),
  }),
  z.object({
    channel: z.literal("sms"),
    phoneNumber: z.string().min(10, "Invalid phone number"),
  }),
  z.object({
    channel: z.literal("push"),
    deviceToken: z.string().min(1, "Device token required"),
  }),
]);

export type NotificationSettings = z.infer<typeof notificationSettingsSchema>;
```

## Combining Refinements

Refinements chain in order. Each step runs only if the previous step passed.

```typescript
export const orderSchema = z
  .object({
    items: z.array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
        price: z.number().positive(),
      })
    ).min(1, "Cart cannot be empty"),
    couponCode: z.string().optional(),
    shippingAddress: z.object({
      street: z.string().min(1),
      city: z.string().min(1),
      zip: z.string().min(1),
    }),
  })
  // First: cross-field validation
  .refine(
    (data) => {
      const total = data.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      return total > 0;
    },
    { message: "Order total must be greater than zero", path: ["items"] }
  )
  // Then: transform the data
  .transform((data) => ({
    ...data,
    total: data.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    itemCount: data.items.reduce((sum, i) => sum + i.quantity, 0),
  }));
```

## Type Inference with Refinements and Transforms

When using `.transform()`, the input and output types differ. Use `z.input<>` and `z.output<>` (or `z.infer<>`) to distinguish:

```typescript
const schema = z
  .object({ name: z.string(), age: z.string() })
  .transform((data) => ({ ...data, age: parseInt(data.age, 10) }));

type SchemaInput = z.input<typeof schema>;
// { name: string; age: string }

type SchemaOutput = z.infer<typeof schema>;
// { name: string; age: number }
```

- Use `z.input<>` for form default values and form field types
- Use `z.infer<>` (or `z.output<>`) for what reaches the handler

## Rules

- ALWAYS use `.refine()` for simple cross-field checks with a single error
- ALWAYS use `.superRefine()` when you need multiple errors or dynamic paths
- ALWAYS provide a `path` array in refinement options to attach errors to the correct form field
- ALWAYS use `z.ZodIssueCode.custom` as the code in `ctx.addIssue()`
- ALWAYS chain `.refine()` AFTER `.object()`, not on individual fields
- NEVER use `.refine()` for single-field validation that Zod methods can handle (use `.min()`, `.regex()`, etc.)
- NEVER forget that `.transform()` changes the output type -- update `z.infer<>` usage accordingly
- Use `.pipe()` after `.transform()` to validate the transformed value
- Use `z.discriminatedUnion()` instead of `.refine()` when validation depends on a type discriminator field
- Keep refinement logic readable -- extract complex checks into named functions if they grow large

## Related Skills

- See `create-validator.md` for basic Zod schema creation
- See `shared-schemas.md` for composing schemas with `.extend()` and `.merge()`
- See `drizzle-zod.md` for adding refinements on top of generated schemas
- See `organization.md` for where to place validator files
