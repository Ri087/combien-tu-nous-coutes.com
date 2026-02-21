# Testing - Verification Guide

> This boilerplate does not include a test framework (no Jest, Vitest, or Playwright).
> Testing is done through build verification, manual browser testing, and systematic edge case checking.

## Primary Verification: Build

The **build command is the primary test**. It catches the majority of issues:

```bash
pnpm build
```

What `pnpm build` catches:
- TypeScript type errors
- Missing imports and exports
- Server/client component boundary violations
- Invalid route configurations
- Missing `"use client"` directives
- Unused variables (via strict mode)
- Type mismatches between components

What `pnpm build` does NOT catch:
- Runtime logic errors (wrong calculation, wrong filter)
- UI layout issues (visual bugs)
- User interaction bugs (click handlers not working)
- API integration issues (wrong data sent/received)
- Database query errors (wrong WHERE clause)
- Race conditions and timing issues

---

## Secondary Verification: Lint + TypeScript

```bash
pnpm checks
```

Run this before `pnpm build` for faster feedback. It catches:
- Lint errors (Biome rules)
- Type errors (TypeScript strict mode)
- Unused imports and variables
- Formatting issues (auto-fixed with `--write`)

---

## Manual Browser Testing

When the build passes, verify the feature works correctly in the browser.

### Setup

```bash
pnpm dev
```

Then open `http://localhost:3000` in the browser.

### Testing Checklist

#### Page loads correctly
- [ ] Navigate to the new page URL
- [ ] Page renders without errors (no white screen)
- [ ] No errors in the browser console (F12 > Console)
- [ ] Loading states display correctly
- [ ] Data fetches and displays correctly

#### CRUD operations (if applicable)
- [ ] **Create**: Fill the form and submit. New item appears in the list.
- [ ] **Read**: List displays all items. Individual items show correct data.
- [ ] **Update**: Edit an item. Changes persist after page refresh.
- [ ] **Delete**: Delete an item. It disappears from the list.

#### Form validation
- [ ] Submit an empty form -- validation errors should appear
- [ ] Submit with invalid data -- specific error messages should show
- [ ] Submit with valid data -- form should succeed
- [ ] After successful submit -- form should reset and list should update

#### Navigation
- [ ] Links to the new page work from the sidebar/navigation
- [ ] Back button works correctly
- [ ] Direct URL access works (e.g., `/projects`)
- [ ] Page is protected (redirects to sign-in if not logged in)

#### Responsive design
- [ ] Page looks correct on desktop (1440px+)
- [ ] Page looks correct on tablet (768px-1024px)
- [ ] Page looks correct on mobile (375px-768px)

---

## Edge Cases to Check

### Data edge cases

| Scenario | What to verify |
|----------|---------------|
| Empty state | No items exist -- empty state message displays correctly |
| Single item | Only one item -- list renders correctly (no plural issues) |
| Many items | 50+ items -- performance is acceptable, scrolling works |
| Long text | Item name is 255 characters -- text truncates or wraps correctly |
| Special characters | Name contains `<script>`, quotes, emojis -- renders safely |
| Unicode | Non-ASCII characters in names -- displays correctly |

### User edge cases

| Scenario | What to verify |
|----------|---------------|
| Not logged in | Redirects to sign-in page |
| Session expired | Handles gracefully (redirects, shows message) |
| Different user | Cannot see other users' data |

### Network edge cases

| Scenario | What to verify |
|----------|---------------|
| Slow network | Loading states display while waiting |
| API error | Error message displays, app does not crash |
| Double submit | Button is disabled while submitting, no duplicate entries |

### Form edge cases

| Scenario | What to verify |
|----------|---------------|
| Whitespace-only input | Validation catches it (`.min(1)` with `.trim()`) |
| Maximum length input | Does not exceed database column limit |
| Rapid submit | Does not create duplicates |
| Navigate away | No unsaved changes warning (unless implemented) |

---

## Database Verification

If you modified the schema, verify the database is in sync:

```bash
# Push schema to database
pnpm db:push

# Open Drizzle Studio to inspect data
pnpm db:studio
```

In Drizzle Studio (`https://local.drizzle.studio`):
- [ ] New tables appear
- [ ] Columns have correct types
- [ ] Foreign keys reference correct tables
- [ ] Data inserts correctly via the app

---

## API Verification

To test oRPC endpoints directly, use the browser console:

```javascript
// In the browser console (must be logged in)
// Test a GET endpoint
fetch('/api/rpc/[feature]/list', { method: 'GET' })
  .then(r => r.json())
  .then(console.log);

// Test a POST endpoint
fetch('/api/rpc/[feature]/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Test' }),
})
  .then(r => r.json())
  .then(console.log);
```

---

## When Something Fails

1. **Build fails**: Read the error, fix the code, re-run `pnpm build`
2. **Page does not load**: Check browser console for errors, check that the page file exports a default component
3. **Data does not load**: Check that the oRPC router is registered in `_app.ts`, check that `.route({ method: "GET" })` is present for read operations
4. **Form does not submit**: Check browser console for errors, check that the mutation function matches the oRPC endpoint
5. **Data does not persist**: Check that `pnpm db:push` was run, check the database with `pnpm db:studio`

---

## Summary

The testing workflow for this codebase is:

1. `pnpm checks` -- fast lint + type check
2. `pnpm build` -- full production build (primary test)
3. `pnpm dev` -- manual browser testing for runtime behavior
4. Edge case review -- systematic check of data, user, and network edge cases
