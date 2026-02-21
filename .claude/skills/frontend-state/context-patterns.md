# Skill: React Context Patterns

## Purpose

Complete guide to creating and consuming React Context in this codebase. Covers when to use Context, provider patterns, typing, and integration with the existing provider hierarchy.

## When to Use Context

This codebase does NOT use a global state library. React Context fills the gap for state that:
- Is needed by many components across the component tree
- Does not belong in the URL (not a filter/search/pagination value)
- Is not server data (server data belongs in TanStack Query)
- Changes infrequently (Context re-renders all consumers on every change)

**Good use cases:**
- Sidebar open/close state
- Feature flags
- Current workspace/organization context
- Onboarding wizard state shared across steps
- Modal/sheet state shared between trigger and content

**Bad use cases (use something else):**
- Server data -- use TanStack Query
- URL-persistent state -- use nuqs
- Frequently updating values (mouse position, timers) -- use refs or local state
- Simple parent-to-child data flow -- use props

## Existing Providers in This Codebase

The provider hierarchy is defined in `/app/providers.tsx`:

```
ORPCQueryClientProvider (TanStack Query)
  ThemeProvider (next-themes)
    NuqsAdapter (URL state)
      TooltipProvider (AlignUI tooltips)
        {children}
    NotificationProvider
    Toaster (sonner)
```

New feature-specific providers should be placed INSIDE feature pages, not in the global `providers.tsx`.

## Pattern 1: Basic Context with Provider

```tsx
// /app/(application)/projects/_context/project-context.tsx
"use client";

import { createContext, useContext, useState, useCallback } from "react";

// 1. Define the context type
type ProjectContextValue = {
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  isDetailPanelOpen: boolean;
  openDetailPanel: (projectId: string) => void;
  closeDetailPanel: () => void;
};

// 2. Create context with undefined default
const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

// 3. Create the provider component
export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);

  const openDetailPanel = useCallback((projectId: string) => {
    setSelectedProjectId(projectId);
    setIsDetailPanelOpen(true);
  }, []);

  const closeDetailPanel = useCallback(() => {
    setIsDetailPanelOpen(false);
    setSelectedProjectId(null);
  }, []);

  return (
    <ProjectContext.Provider
      value={{
        selectedProjectId,
        setSelectedProjectId,
        isDetailPanelOpen,
        openDetailPanel,
        closeDetailPanel,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

// 4. Create a typed consumer hook with error boundary
export function useProjectContext() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProjectContext must be used within a ProjectProvider");
  }
  return context;
}
```

## Pattern 2: Using the Context in Components

```tsx
// /app/(application)/projects/page.tsx (Server Component)
import { ProjectProvider } from "./_context/project-context";
import { ProjectList } from "./_components/project-list";
import { ProjectDetailPanel } from "./_components/project-detail-panel";

export default function ProjectsPage() {
  return (
    <ProjectProvider>
      <div className="flex h-full">
        <ProjectList />
        <ProjectDetailPanel />
      </div>
    </ProjectProvider>
  );
}
```

```tsx
// /app/(application)/projects/_components/project-list.tsx
"use client";

import { useProjectContext } from "../_context/project-context";

export function ProjectList() {
  const { openDetailPanel, selectedProjectId } = useProjectContext();

  return (
    <div className="flex-1">
      {projects.map((project) => (
        <div
          key={project.id}
          className={cn(
            "cursor-pointer rounded-lg border border-stroke-soft-200 p-4",
            selectedProjectId === project.id && "border-primary-base bg-bg-weak-50"
          )}
          onClick={() => openDetailPanel(project.id)}
        >
          <h3 className="text-label-md text-text-strong-950">{project.name}</h3>
        </div>
      ))}
    </div>
  );
}
```

```tsx
// /app/(application)/projects/_components/project-detail-panel.tsx
"use client";

import { useProjectContext } from "../_context/project-context";

export function ProjectDetailPanel() {
  const { isDetailPanelOpen, selectedProjectId, closeDetailPanel } =
    useProjectContext();

  if (!isDetailPanelOpen || !selectedProjectId) return null;

  return (
    <div className="w-[400px] border-l border-stroke-soft-200 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-title-h6 text-text-strong-950">Project Detail</h2>
        <Button.Root variant="neutral" mode="ghost" size="small" onClick={closeDetailPanel}>
          <Button.Icon as={RiCloseLine} />
        </Button.Root>
      </div>
      {/* Detail content using selectedProjectId */}
    </div>
  );
}
```

## Pattern 3: Context with useReducer (Complex State)

For contexts with multiple actions and complex state transitions.

```tsx
// /app/(application)/onboarding/_context/onboarding-context.tsx
"use client";

import { createContext, useContext, useReducer, useCallback } from "react";

// State type
type OnboardingState = {
  currentStep: number;
  totalSteps: number;
  data: {
    companyName: string;
    industry: string;
    teamSize: string;
  };
  completedSteps: Set<number>;
};

// Action types
type OnboardingAction =
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "GO_TO_STEP"; step: number }
  | { type: "SET_DATA"; field: keyof OnboardingState["data"]; value: string }
  | { type: "MARK_COMPLETE"; step: number };

// Reducer
function onboardingReducer(
  state: OnboardingState,
  action: OnboardingAction
): OnboardingState {
  switch (action.type) {
    case "NEXT_STEP":
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, state.totalSteps - 1),
      };
    case "PREV_STEP":
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 0),
      };
    case "GO_TO_STEP":
      return { ...state, currentStep: action.step };
    case "SET_DATA":
      return {
        ...state,
        data: { ...state.data, [action.field]: action.value },
      };
    case "MARK_COMPLETE": {
      const completedSteps = new Set(state.completedSteps);
      completedSteps.add(action.step);
      return { ...state, completedSteps };
    }
    default:
      return state;
  }
}

// Context type (expose state + convenience methods, not raw dispatch)
type OnboardingContextValue = {
  state: OnboardingState;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  setField: (field: keyof OnboardingState["data"], value: string) => void;
  markComplete: (step: number) => void;
};

const OnboardingContext = createContext<OnboardingContextValue | undefined>(
  undefined
);

const initialState: OnboardingState = {
  currentStep: 0,
  totalSteps: 3,
  data: {
    companyName: "",
    industry: "",
    teamSize: "",
  },
  completedSteps: new Set(),
};

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(onboardingReducer, initialState);

  const nextStep = useCallback(() => dispatch({ type: "NEXT_STEP" }), []);
  const prevStep = useCallback(() => dispatch({ type: "PREV_STEP" }), []);
  const goToStep = useCallback(
    (step: number) => dispatch({ type: "GO_TO_STEP", step }),
    []
  );
  const setField = useCallback(
    (field: keyof OnboardingState["data"], value: string) =>
      dispatch({ type: "SET_DATA", field, value }),
    []
  );
  const markComplete = useCallback(
    (step: number) => dispatch({ type: "MARK_COMPLETE", step }),
    []
  );

  return (
    <OnboardingContext.Provider
      value={{ state, nextStep, prevStep, goToStep, setField, markComplete }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}
```

## Pattern 4: Sidebar/Layout Context

A common pattern for sidebar open/close state shared between the sidebar and the toggle button.

```tsx
// /app/(application)/_context/sidebar-context.tsx
"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";

type SidebarContextValue = {
  isOpen: boolean;
  isCollapsed: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
  toggleCollapse: () => void;
};

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false); // Mobile
  const [isCollapsed, setIsCollapsed] = useState(false); // Desktop
  const pathname = usePathname();

  // Auto-close on mobile when navigating
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggleCollapse = useCallback(
    () => setIsCollapsed((prev) => !prev),
    []
  );

  return (
    <SidebarContext.Provider
      value={{ isOpen, isCollapsed, toggle, open, close, toggleCollapse }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
```

## Pattern 5: Context with External Data

When context needs to be initialized with server data or props.

```tsx
// /app/(application)/workspace/_context/workspace-context.tsx
"use client";

import { createContext, useContext } from "react";

type Workspace = {
  id: string;
  name: string;
  role: "owner" | "admin" | "member";
};

type WorkspaceContextValue = {
  workspace: Workspace;
};

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(
  undefined
);

// Provider receives data from server component via props
export function WorkspaceProvider({
  workspace,
  children,
}: {
  workspace: Workspace;
  children: React.ReactNode;
}) {
  return (
    <WorkspaceContext.Provider value={{ workspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
```

Usage from a server component:

```tsx
// /app/(application)/workspace/[id]/layout.tsx
import { WorkspaceProvider } from "./_context/workspace-context";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Fetch workspace data on the server...
  const workspace = await getWorkspace(id);

  return (
    <WorkspaceProvider workspace={workspace}>
      {children}
    </WorkspaceProvider>
  );
}
```

## File Structure Convention

```
/app/(application)/[feature]/
  _context/
    [feature]-context.tsx     # Context + Provider + hook
  _components/
    ...                       # Components that consume the context
  page.tsx                    # Wraps content with Provider
```

## Rules

- ALWAYS create a typed consumer hook (`useFeatureContext`) that throws if used outside the provider
- ALWAYS use `undefined` as the default context value (not `null` or a fake default object)
- ALWAYS place feature-specific providers in `_context/` folders inside the feature directory
- NEVER add feature-specific providers to the global `/app/providers.tsx` -- only app-wide concerns go there
- NEVER store server data in Context -- use TanStack Query instead
- NEVER use Context for state that should persist in the URL -- use nuqs instead
- PREFER `useCallback` for functions passed through context to prevent unnecessary re-renders
- PREFER exposing convenience methods (e.g., `openDetailPanel`) over raw dispatch/setState
- USE `useReducer` inside context when state has 3+ related fields or complex transitions
- USE props instead of Context when data only flows 1-2 levels deep
- REMEMBER that all consumers re-render when any context value changes -- keep context values minimal
