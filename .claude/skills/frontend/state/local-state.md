# Skill: Local React State Patterns

## Purpose

Complete guide to managing local component state with `useState` and `useReducer` in this codebase. Covers when to use each, common patterns, and how local state fits into the broader state management strategy.

## State Management Hierarchy

This codebase does NOT use a global state library (no Zustand, Redux, etc.). Instead, follow this hierarchy:

| State Type | Tool | When to Use |
|------------|------|-------------|
| Server data | TanStack Query + oRPC | API data, cached entities (see `tanstack-query.md`) |
| URL state | nuqs | Filters, pagination, tabs, search (see `url-state-management.md`) |
| Shared client state | React Context | Theme, sidebar open/close, feature flags (see `context-patterns.md`) |
| Component state | `useState` / `useReducer` | Form inputs, modals, toggles, UI-only state |

**Always start with the simplest option** -- most state belongs in `useState`. Only escalate when needed.

## Pattern 1: Simple Toggle (useState)

```tsx
"use client";

import { useState } from "react";

export function ProjectCard({ project }: { project: Project }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-stroke-soft-200 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-label-md text-text-strong-950">{project.name}</h3>
        <Button.Root
          variant="neutral"
          mode="ghost"
          size="small"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Collapse" : "Expand"}
        </Button.Root>
      </div>

      {isExpanded && (
        <p className="mt-2 text-paragraph-sm text-text-sub-600">
          {project.description}
        </p>
      )}
    </div>
  );
}
```

## Pattern 2: Modal Open/Close (useState)

```tsx
"use client";

import { useState } from "react";

export function ProjectActions() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <>
      <Button.Root
        variant="primary"
        size="medium"
        onClick={() => setIsCreateModalOpen(true)}
      >
        <Button.Icon as={RiAddLine} />
        New Project
      </Button.Root>

      {isCreateModalOpen && (
        <CreateProjectModal onClose={() => setIsCreateModalOpen(false)} />
      )}
    </>
  );
}
```

## Pattern 3: Form Input State (useState)

For simple forms not requiring validation, use `useState` directly. For forms with validation, use React Hook Form instead (see the forms skill).

```tsx
"use client";

import { useState } from "react";
import * as Input from "@/components/ui/input";

export function QuickSearch({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input.Root>
        <Input.Wrapper>
          <Input.Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Quick search..."
          />
        </Input.Wrapper>
      </Input.Root>
    </form>
  );
}
```

## Pattern 4: Loading State (useState)

Track async operation state locally when not using TanStack Query mutations.

```tsx
"use client";

import { useState } from "react";
import { StaggeredFadeLoader } from "@/components/staggered-fade-loader";
import * as FancyButton from "@/components/ui/fancy-button";

export function ExportButton({ projectId }: { projectId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/export/${projectId}`);
      if (!response.ok) throw new Error("Export failed");
      // Handle download...
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <FancyButton.Root
        variant="primary"
        size="medium"
        disabled={isLoading}
        onClick={handleExport}
      >
        {isLoading && <StaggeredFadeLoader variant="muted" />}
        {isLoading ? "Exporting..." : "Export"}
      </FancyButton.Root>
      {error && (
        <p className="mt-1 text-paragraph-sm text-error-base">{error}</p>
      )}
    </div>
  );
}
```

## Pattern 5: Multi-Select State (useState with Set/Array)

```tsx
"use client";

import { useState, useCallback } from "react";

export function ProjectBulkActions({ projects }: { projects: Project[] }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(projects.map((p) => p.id)));
  }, [projects]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Button.Root variant="neutral" mode="ghost" size="small" onClick={selectAll}>
          Select All
        </Button.Root>
        {selectedIds.size > 0 && (
          <>
            <span className="text-paragraph-sm text-text-sub-600">
              {selectedIds.size} selected
            </span>
            <Button.Root variant="neutral" mode="ghost" size="small" onClick={clearSelection}>
              Clear
            </Button.Root>
          </>
        )}
      </div>

      {projects.map((project) => (
        <ProjectRow
          key={project.id}
          project={project}
          isSelected={selectedIds.has(project.id)}
          onToggle={() => toggleSelection(project.id)}
        />
      ))}
    </div>
  );
}
```

## Pattern 6: Complex State with useReducer

Use `useReducer` when state has multiple related values that change together, or when the next state depends on the previous state in complex ways.

```tsx
"use client";

import { useReducer } from "react";

type WizardState = {
  step: number;
  data: {
    name: string;
    description: string;
    template: string;
  };
  errors: Record<string, string>;
};

type WizardAction =
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "SET_FIELD"; field: string; value: string }
  | { type: "SET_ERRORS"; errors: Record<string, string> }
  | { type: "RESET" };

const initialState: WizardState = {
  step: 0,
  data: {
    name: "",
    description: "",
    template: "",
  },
  errors: {},
};

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "NEXT_STEP":
      return { ...state, step: state.step + 1, errors: {} };
    case "PREV_STEP":
      return { ...state, step: Math.max(0, state.step - 1), errors: {} };
    case "SET_FIELD":
      return {
        ...state,
        data: { ...state.data, [action.field]: action.value },
        errors: { ...state.errors, [action.field]: "" },
      };
    case "SET_ERRORS":
      return { ...state, errors: action.errors };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

export function CreateProjectWizard({ onClose }: { onClose: () => void }) {
  const [state, dispatch] = useReducer(wizardReducer, initialState);

  const handleNext = () => {
    // Validate current step...
    dispatch({ type: "NEXT_STEP" });
  };

  return (
    <div>
      {state.step === 0 && (
        <StepName
          value={state.data.name}
          error={state.errors.name}
          onChange={(value) => dispatch({ type: "SET_FIELD", field: "name", value })}
        />
      )}
      {state.step === 1 && (
        <StepTemplate
          value={state.data.template}
          onChange={(value) => dispatch({ type: "SET_FIELD", field: "template", value })}
        />
      )}

      <div className="flex justify-between mt-4">
        <Button.Root
          variant="neutral"
          mode="stroke"
          size="medium"
          disabled={state.step === 0}
          onClick={() => dispatch({ type: "PREV_STEP" })}
        >
          Back
        </Button.Root>
        <Button.Root variant="primary" size="medium" onClick={handleNext}>
          {state.step === 1 ? "Create" : "Next"}
        </Button.Root>
      </div>
    </div>
  );
}
```

## Pattern 7: Lifting State Up

When sibling components need to share state, lift it to their common parent.

```tsx
"use client";

import { useState } from "react";

// Parent owns the state
export function ProjectPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  return (
    <div className="flex gap-6">
      {/* Sidebar: sets the selected project */}
      <ProjectSidebar
        selectedId={selectedProjectId}
        onSelect={setSelectedProjectId}
      />

      {/* Detail: reads the selected project */}
      <ProjectDetail projectId={selectedProjectId} />
    </div>
  );
}

// Child A: writes state
function ProjectSidebar({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  // ...render project list, call onSelect on click
}

// Child B: reads state
function ProjectDetail({ projectId }: { projectId: string | null }) {
  if (!projectId) return <EmptyState />;
  // ...render project detail
}
```

## Decision Guide: useState vs useReducer

| Criteria | useState | useReducer |
|----------|----------|------------|
| 1-3 independent values | Yes | Overkill |
| Multiple related values changing together | Gets messy | Yes |
| Next state depends on complex logic | Use functional updates | Yes |
| State transitions are well-defined (wizard, stepper) | No | Yes |
| Need to pass dispatch to deep children | No | Yes |
| Simple toggles, inputs, modals | Yes | No |

## Decision Guide: Local State vs Other Options

| Question | If Yes | If No |
|----------|--------|-------|
| Is it server data? | TanStack Query | Continue |
| Should it persist in URL? | nuqs | Continue |
| Do many unrelated components need it? | React Context | Continue |
| Is it UI-only state for this component? | useState / useReducer | Reconsider |

## Rules

- ALWAYS start with `useState` -- only upgrade to `useReducer` when state logic becomes complex
- ALWAYS use functional updates when next state depends on previous state: `setState(prev => prev + 1)`
- ALWAYS initialize state with proper types -- never use `any`
- PREFER derived state (compute from existing state/props) over additional `useState` calls
- PREFER URL state (nuqs) over `useState` for filters, search, pagination, tabs
- DO NOT store server data in `useState` -- use TanStack Query instead
- DO NOT create `useReducer` for simple boolean toggles or single-value state
- DO NOT lift state higher than necessary -- keep it as close to usage as possible
- REMEMBER that `useState` setter identity is stable -- safe to pass as prop without `useCallback`
