# AlignUI AI Template - Key Patterns

Extracted from DeepWiki documentation of the AlignUI AI Chat Template. Focus on PRACTICAL patterns for replication.

## 1. Project Structure

### Route Groups Pattern
```
app/
├── (auth)/                    # Authentication flow (no URL prefix)
│   ├── layout.tsx             # AuthLayout with decorative elements
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── reset-password/page.tsx
│
├── (dashboard)/               # Authenticated app (no URL prefix)
│   ├── layout.tsx             # DashboardLayout with MainSidebar
│   ├── page.tsx               # Home / New chat
│   ├── chat/[id]/
│   │   └── page.tsx           # Chat conversation
│   └── projects/
│       ├── page.tsx           # Projects list
│       └── [id]/page.tsx      # Project detail
│
├── layout.tsx                 # Root: ThemeProvider + Font
└── globals.css                # AlignUI design tokens
```

### Component Organization
```
components/
├── layout/                    # Persistent UI components
│   ├── main-sidebar.tsx
│   ├── chat-header.tsx
│   └── chat-input.tsx
│
├── modals/                    # Overlay dialogs
│   ├── create-project-modal.tsx
│   ├── upload-files-modal.tsx
│   └── set-instructions-modal.tsx
│
└── ui/                        # AlignUI primitives (DO NOT MODIFY)
    ├── button.tsx
    ├── input.tsx
    └── ...
```

## 2. Layout Hierarchy

### Root Layout (app/layout.tsx)
```tsx
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Dashboard Layout (app/(dashboard)/layout.tsx)
```tsx
"use client";
import { useRef } from "react";
import MainSidebar, { MainSidebarRef } from "@/components/layout/main-sidebar";
import { SidebarProvider } from "@/contexts/sidebar-context";

export default function DashboardLayout({ children }) {
  const sidebarRef = useRef<MainSidebarRef>(null);

  const handleMenuClick = () => {
    sidebarRef.current?.toggleMobileSidebar();
  };

  return (
    <SidebarProvider onMenuClick={handleMenuClick}>
      <div className="flex h-full">
        <MainSidebar ref={sidebarRef} />
        <main className="flex-1">{children}</main>
      </div>
    </SidebarProvider>
  );
}
```

## 3. Main Sidebar Pattern

### Imperative API with ForwardRef
```tsx
export interface MainSidebarRef {
  toggleMobileSidebar: () => void;
}

const MainSidebar = forwardRef<MainSidebarRef, {}>((props, ref) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Expose methods
  useImperativeHandle(ref, () => ({
    toggleMobileSidebar,
  }));

  // Auto-close on navigation
  const pathname = usePathname();
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  return (
    <aside className={cn(
      "fixed z-60 h-full transition-all duration-300 lg:relative lg:z-50",
      "w-full lg:w-[272px]",
      isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      isSidebarCollapsed && "lg:w-18" // Collapsed mode: 72px
    )}>
      {/* Content */}
    </aside>
  );
});
```

### Sidebar Data Structure
```typescript
const sidebarData = {
  user: {
    name: "John Doe",
    email: "john@example.com",
    avatar: "/avatar.jpg",
    isPro: true,
    profileMenu: [
      { id: "settings", label: "Settings", icon: RiSettings2Line, href: "/settings" },
      { id: "logout", label: "Log out", icon: RiLoginBoxLine, href: "/login", variant: "danger" }
    ]
  },
  sections: [
    {
      id: "main-nav",
      items: [
        { id: "new-chat", label: "New Chat", icon: RiChatNewLine, href: "/" },
        { id: "projects", label: "Projects", icon: RiFolderLine, href: "/projects" }
      ]
    },
    {
      id: "history",
      label: "History",
      isHistorySection: true,
      subsections: [
        {
          id: "recents",
          label: "Recents",
          items: [
            { id: "1", title: "Chat title", href: "/chat/1", date: "Today" }
          ]
        }
      ]
    }
  ]
};
```

### Search Overlay Pattern
```tsx
const [isSearchActive, setIsSearchActive] = useState(false);
const [searchQuery, setSearchQuery] = useState("");

// Filter history items
const allHistoryItems = sidebarData.sections
  .find(s => s.isHistorySection)
  ?.subsections?.flatMap(sub => sub.items) || [];

const filteredHistoryItems = searchQuery.trim()
  ? allHistoryItems.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  : allHistoryItems;

// Search overlay (shows when isSearchActive)
{isSearchActive && (
  <div data-search-overlay className="absolute top-[72px] left-0 w-full bg-bg-white-0 z-50">
    {filteredHistoryItems.map(item => (
      <Link key={item.id} href={item.href}>
        {/* Render with highlighting */}
      </Link>
    ))}
  </div>
)}

// Click-outside handler
useEffect(() => {
  const handleClickOutside = (e: MouseEvent) => {
    const overlay = document.querySelector("[data-search-overlay]");
    const input = document.querySelector('input[placeholder="Search..."]');
    if (!overlay?.contains(e.target) && !input?.contains(e.target)) {
      setIsSearchActive(false);
    }
  };

  if (isSearchActive) {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }
}, [isSearchActive]);
```

## 4. Chat Components

### ChatInput - Multi-modal Input
```tsx
interface ChatInputProps {
  className?: string;
  placeholder?: string;
  bottomText?: boolean;
}

export default function ChatInput({ placeholder = "How can I help you today?", bottomText }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<FileObject[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();

  // Drag-and-drop handlers
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setUploadedImages(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      } else {
        const fileExt = file.name.split(".").pop()?.toUpperCase() || "FILE";
        setUploadedFiles(prev => [...prev, {
          id: Date.now() + Math.random(),
          name: file.name,
          type: fileExt
        }]);
      }
    });
  };

  // Paste handler for images
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              setUploadedImages(prev => [...prev, e.target?.result as string]);
            };
            reader.readAsDataURL(file);
          }
        }
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, []);

  // Submit handler
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!message.trim() && uploadedImages.length === 0 && uploadedFiles.length === 0) {
      return;
    }

    // Navigate to chat page (would normally send message to API)
    router.push("/chat/1");

    // Clear state
    setMessage("");
    setUploadedImages([]);
    setUploadedFiles([]);
  };

  return (
    <div className="w-full max-w-175 mx-auto">
      {/* Upload previews */}
      {(uploadedImages.length > 0 || uploadedFiles.length > 0) && (
        <div className="flex gap-2 mb-2">
          {uploadedImages.map((img, idx) => (
            <div key={idx} className="relative">
              <Image src={img} alt="" width={96} height={96} className="rounded-2xl" />
              <button onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== idx))}>
                <RiCloseLine />
              </button>
            </div>
          ))}
          {uploadedFiles.map(file => (
            <div key={file.id} className="flex items-center gap-2 p-2 bg-bg-weak-50 rounded-2xl">
              <RiAttachment2 />
              <div>
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-text-sub-600">{file.type}</p>
              </div>
              <button onClick={() => setUploadedFiles(prev => prev.filter(f => f.id !== file.id))}>
                <RiCloseLine />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input container */}
      <div
        className={cn(
          "bg-bg-white-0 border border-stroke-soft-200 rounded-[20px] p-4",
          isDragging && "bg-bg-weak-50"
        )}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <div
          contentEditable
          onInput={(e) => setMessage(e.currentTarget.innerText)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          className="min-h-[40px] outline-none text-sm"
          data-placeholder={placeholder}
        />

        <div className="flex items-center justify-between mt-2">
          {/* Attachment button */}
          <Button.Root variant="neutral" size="sm">
            <Button.Icon as={RiAddLine} />
          </Button.Root>

          {/* Submit button */}
          <Button.Root
            variant={message.trim() ? "primary" : "neutral"}
            size="sm"
            onClick={handleSubmit}
            disabled={!message.trim() && uploadedImages.length === 0 && uploadedFiles.length === 0}
          >
            <Button.Icon as={RiArrowUpLine} />
          </Button.Root>
        </div>
      </div>
    </div>
  );
}
```

### ChatHeader - Responsive Header with Popovers
```tsx
interface ChatHeaderProps {
  title?: string;
  subtitle?: string;
  showDropdown?: boolean;
  className?: string;
  onMenuClick?: () => void;
}

export default function ChatHeader({ title = "New Chat", subtitle, onMenuClick }: ChatHeaderProps) {
  const [isDesktop, setIsDesktop] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { onMenuClick: contextMenuClick } = useSidebar();

  const handleMenuClick = onMenuClick || contextMenuClick;

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Desktop render
  if (isDesktop) {
    return (
      <div className="absolute top-0 left-0 right-0 h-[60px] flex items-center justify-between px-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1">
          <span className="text-text-sub-600 text-sm">{title}</span>
          {subtitle && (
            <>
              <span className="text-text-soft-400">/</span>
              <span className="text-text-strong-950 text-sm">{subtitle}</span>
            </>
          )}
        </div>

        {/* Dropdown menu */}
        <Popover.Root open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <Popover.Trigger asChild>
            <Button.Root variant="neutral" mode="ghost" size="sm">
              <span>Actions</span>
              <Button.Icon as={RiArrowDownSLine} className={cn(isDropdownOpen && "rotate-180")} />
            </Button.Root>
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content side="bottom" sideOffset={10} align="end">
              <div className="bg-bg-white-0 rounded-2xl shadow-complex p-2">
                <Button.Root variant="neutral" mode="ghost" className="w-full justify-start">
                  <Button.Icon as={RiPushpinLine} />
                  <span>Pin chat</span>
                </Button.Root>
                <Button.Root variant="neutral" mode="ghost" className="w-full justify-start">
                  <Button.Icon as={RiDeleteBinLine} />
                  <span>Delete</span>
                </Button.Root>
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
    );
  }

  // Mobile render
  return (
    <div className="fixed top-0 left-0 right-0 h-[60px] flex items-center justify-between px-4 bg-bg-white-0 border-b">
      <Button.Root variant="neutral" mode="ghost" size="sm" onClick={handleMenuClick}>
        <Button.Icon as={RiMenuLine} />
      </Button.Root>

      <span className="text-text-strong-950 font-medium">{title}</span>

      <Button.Root variant="neutral" mode="ghost" size="sm">
        <Button.Icon as={RiMore2Line} />
      </Button.Root>
    </div>
  );
}
```

## 5. Modal Pattern

### Base Modal Structure
```tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function Modal({ isOpen, onClose, onSubmit }: ModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [formData, setFormData] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Animation on open
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(false);
      setTimeout(() => setIsAnimating(true), 10);
    }
  }, [isOpen]);

  // Close with animation
  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setFormData("");
      inputRef.current?.blur();
      onClose();
    }, 400); // Match transition duration
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.trim()) return;

    onSubmit(formData.trim());
    setFormData("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-end lg:items-center justify-center transition-all duration-400",
        isAnimating ? "bg-overlay-gray" : "bg-transparent"
      )}
      onClick={handleClose}
    >
      <div
        className={cn(
          "bg-bg-white-0 w-full lg:max-w-137 rounded-t-3xl lg:rounded-[28px] transition-all duration-400 ease-out",
          isAnimating
            ? "translate-y-0 lg:opacity-100"
            : "translate-y-full lg:translate-y-0 lg:opacity-0"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-xl font-semibold">Modal Title</h2>
          <Button.Root variant="neutral" mode="ghost" size="sm" onClick={handleClose}>
            <Button.Icon as={RiCloseLine} />
          </Button.Root>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5">
          <Input.Root size="md">
            <Input.Wrapper>
              <Input.Input
                ref={inputRef}
                value={formData}
                onChange={(e) => setFormData(e.target.value)}
                placeholder="Enter value..."
              />
            </Input.Wrapper>
          </Input.Root>

          {/* Info box */}
          <div className="mt-4 p-3 bg-bg-weak-50 rounded-2xl flex gap-3">
            <Image src="/icon-info.svg" alt="" width={20} height={20} />
            <div>
              <h3 className="text-sm font-medium">Info Title</h3>
              <p className="text-xs text-text-sub-600">Description text here.</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-5 justify-end">
            <Button.Root variant="neutral" mode="stroke" onClick={handleClose}>
              Cancel
            </Button.Root>
            <Button.Root variant="primary" type="submit" disabled={!formData.trim()}>
              Submit
            </Button.Root>
          </div>
        </form>
      </div>
    </div>
  );
}
```

## 6. AlignUI Component Composition

### Button Pattern
```tsx
// Basic button
<Button.Root variant="primary" size="md" mode="filled">
  <span>Click me</span>
</Button.Root>

// With icon
<Button.Root variant="neutral" size="sm" mode="ghost">
  <Button.Icon as={RiSettings2Line} className="size-5" />
  <span>Settings</span>
</Button.Root>

// Icon only
<Button.Root variant="neutral" size="sm" mode="ghost" className="p-2">
  <Button.Icon as={RiCloseLine} className="size-5 text-text-soft-400" />
</Button.Root>

// Variants: primary, neutral, success, warning, danger
// Modes: filled, stroke, ghost
// Sizes: sm, md, lg
```

### Input Pattern
```tsx
// Basic input
<Input.Root size="md">
  <Input.Wrapper>
    <Input.Input
      placeholder="Enter text..."
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  </Input.Wrapper>
</Input.Root>

// With label
<Label.Root htmlFor="email">
  <Label.Content>Email</Label.Content>
</Label.Root>
<Input.Root size="md">
  <Input.Wrapper>
    <Input.Input id="email" type="email" />
  </Input.Wrapper>
</Input.Root>

// With left icon
<Input.Root size="md">
  <Input.Wrapper>
    <Input.LeftIcon>
      <RiSearchLine className="size-5 text-text-soft-400" />
    </Input.LeftIcon>
    <Input.Input placeholder="Search..." />
  </Input.Wrapper>
</Input.Root>
```

### Popover Pattern
```tsx
const [isOpen, setIsOpen] = useState(false);

<Popover.Root open={isOpen} onOpenChange={setIsOpen}>
  <Popover.Trigger asChild>
    <Button.Root variant="neutral">
      <span>Open menu</span>
      <Button.Icon as={RiArrowDownSLine} className={cn(isOpen && "rotate-180")} />
    </Button.Root>
  </Popover.Trigger>

  <Popover.Portal>
    <Popover.Content
      side="bottom"
      sideOffset={10}
      align="end"
      className="z-50"
    >
      <div className="bg-bg-white-0 rounded-2xl shadow-complex p-2 w-[200px]">
        <Button.Root variant="neutral" mode="ghost" className="w-full justify-start">
          <Button.Icon as={RiSettings2Line} />
          <span>Settings</span>
        </Button.Root>
        <Button.Root variant="neutral" mode="ghost" className="w-full justify-start">
          <Button.Icon as={RiLogoutBoxLine} />
          <span>Logout</span>
        </Button.Root>
      </div>
    </Popover.Content>
  </Popover.Portal>
</Popover.Root>
```

## 7. Key Design Tokens

### Color System
```css
/* Text colors */
text-text-strong-950    /* Primary text */
text-text-sub-600       /* Secondary text */
text-text-soft-400      /* Tertiary/placeholder text */

/* Background colors */
bg-bg-white-0           /* Base background */
bg-bg-weak-50           /* Light gray background */
bg-bg-soft-200          /* Medium gray background */
bg-bg-strong-950        /* Dark background (buttons, active states) */

/* Border colors */
border-stroke-soft-200  /* Default borders */

/* Semantic colors */
text-green-600          /* Accent/active states */
bg-green-alpha-10       /* Subtle green background */
text-error-base         /* Error states */
bg-overlay-gray         /* Modal overlay */
```

### Spacing & Sizing
```css
/* Common sizes */
w-[272px]    /* Sidebar expanded width */
w-18         /* Sidebar collapsed width (72px) */
w-175        /* Content max-width (700px) */
max-w-137    /* Modal max-width (548px) */

/* Heights */
h-[60px]     /* Header height */

/* Shadows */
shadow-complex      /* Elevated elements */
shadow-complex-2    /* Higher elevation */
shadow-gray-shadow  /* Subtle shadow */
```

## 8. State Management Patterns

### Local State for UI
```tsx
// UI toggles
const [isOpen, setIsOpen] = useState(false);
const [isAnimating, setIsAnimating] = useState(false);

// Form state
const [inputValue, setInputValue] = useState("");
const [errors, setErrors] = useState<Record<string, string>>({});

// File uploads
const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

// Refs for DOM access
const inputRef = useRef<HTMLInputElement>(null);
const containerRef = useRef<HTMLDivElement>(null);
```

### Context for Shared State
```tsx
// contexts/sidebar-context.tsx
const SidebarContext = createContext<{ onMenuClick?: () => void }>({});

export function SidebarProvider({ onMenuClick, children }) {
  return (
    <SidebarContext.Provider value={{ onMenuClick }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
```

### Responsive State
```tsx
const [isDesktop, setIsDesktop] = useState(true);

useEffect(() => {
  const checkSize = () => setIsDesktop(window.innerWidth >= 1024);
  checkSize();
  window.addEventListener("resize", checkSize);
  return () => window.removeEventListener("resize", checkSize);
}, []);

// Conditional render based on screen size
return isDesktop ? <DesktopLayout /> : <MobileLayout />;
```

## 9. Animation Patterns

### Modal Animation
```tsx
// Two-stage animation for smooth transitions
useEffect(() => {
  if (isOpen) {
    setIsAnimating(false);
    setTimeout(() => setIsAnimating(true), 10);
  }
}, [isOpen]);

// Close with reverse animation
const handleClose = () => {
  setIsAnimating(false);
  setTimeout(() => {
    onClose();
  }, 400); // Match transition duration
};

// Classes
className={cn(
  "transition-all duration-400 ease-out",
  isAnimating ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
)}
```

### Dropdown Rotation
```tsx
<Button.Icon
  as={RiArrowDownSLine}
  className={cn(
    "transition-transform duration-400",
    isOpen && "rotate-180"
  )}
/>
```

## 10. Accessibility Patterns

### Keyboard Navigation
```tsx
// Enter to submit, Shift+Enter for newline
onKeyDown={(e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleSubmit();
  }
}}
```

### Focus Management
```tsx
// Auto-focus input when modal opens
useEffect(() => {
  if (isOpen) {
    inputRef.current?.focus();
  }
}, [isOpen]);

// Click container to focus input
const handleContainerClick = (e) => {
  if (!e.target.closest("button")) {
    inputRef.current?.focus();
  }
};
```

### ARIA Attributes
```tsx
<button
  aria-label="Close modal"
  aria-expanded={isOpen}
  onClick={handleClose}
>
  <RiCloseLine />
</button>
```

---

## Quick Reference: Common Tasks

### Add a new route
1. Create page in `app/(dashboard)/[route]/page.tsx`
2. Add navigation item to sidebar data
3. Update active state detection

### Create a modal
1. Copy modal pattern from section 5
2. Add props interface
3. Implement animation states
4. Add form validation

### Add file upload
1. Use drag-and-drop handlers from ChatInput
2. Handle different file types (images vs docs)
3. Show previews with remove buttons

### Make component responsive
1. Use `useEffect` to detect screen size
2. Return different JSX for mobile/desktop
3. Use Tailwind `lg:` prefix for desktop-only styles
