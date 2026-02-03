# Phase 5: Judge Commentary - Research

**Researched:** 2026-02-03
**Domain:** React/Tailwind UI components for scoring visualization and side-by-side layout
**Confidence:** HIGH

## Summary

This research focused on implementing the Judge Commentary phase requirements, specifically the UI components needed for displaying numerical scores with progress bars and side-by-side speaker comparison panels. The existing codebase uses React 18.2, TypeScript, Zustand for state management, and Tailwind CSS for styling.

The standard approach for this domain is to use either shadcn/ui (which wraps Radix UI primitives) or DaisyUI for pre-styled components. Both provide accessible, well-tested progress bar implementations that integrate seamlessly with Tailwind CSS. For the side-by-side layout requirement, Tailwind's responsive grid system provides the necessary flexibility without additional dependencies.

**Primary recommendation:** Use shadcn/ui Progress component for score visualization and Tailwind CSS grid/flex utilities for the side-by-side speaker layout.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| shadcn/ui | latest | Accessible UI components built on Radix UI | Provides copy-paste components with full ownership, excellent accessibility, and seamless Tailwind integration |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Radix UI Primitives | latest | Low-level accessible UI primitives | When custom styling beyond shadcn/ui is needed |
| DaisyUI | latest | Utility-first Tailwind component classes | Alternative if preferring class-based approach over JSX components |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| shadcn/ui Progress | Custom Tailwind implementation | Less accessible, more code to maintain, but complete control over styling |

**Installation:**
```bash
npx shadcn-ui@latest add progress
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/judge/        # Judge commentary components
├── types/judge.ts           # Judge-specific types
└── hooks/useJudgeScores.ts  # Hook for managing judge scores
```

### Pattern 1: Accessible Progress Bars with Labels
**What:** Using shadcn/ui Progress component with proper labeling for screen readers
**When to use:** For all numerical score displays in the judge commentary
**Example:**
```tsx
import { Progress } from "@/components/ui/progress";

interface ScoreProgressProps {
  label: string;
  value: number; // 0-100
  color?: string;
}

export function ScoreProgress({ label, value, color = "bg-blue-600" }: ScoreProgressProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="font-medium text-gray-700">{value}%</span>
      </div>
      <Progress value={value} className={color} />
    </div>
  );
}
```

### Pattern 2: Responsive Side-by-Side Layout
**What:** Using Tailwind's grid system for responsive speaker comparison
**When to use:** For the main judge commentary display showing all four speakers
**Example:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {speakers.map((speaker) => (
    <div key={speaker.role} className="bg-white rounded-lg p-4 shadow-sm border">
      {/* Speaker content */}
    </div>
  ))}
</div>
```

### Anti-Patterns to Avoid
- **Custom progress bar implementations:** Radix UI/shadcn/ui provides battle-tested, accessible progress components that handle ARIA attributes correctly
- **Fixed-width layouts:** Use responsive grid classes to ensure proper display on mobile devices

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Accessible progress bars | Custom div-based progress indicators | shadcn/ui Progress component | Proper ARIA attributes, keyboard navigation, and focus management are complex to implement correctly |
| Responsive grid layouts | Custom CSS grid/flex implementations | Tailwind CSS responsive grid classes | Tailwind provides battle-tested responsive breakpoints and spacing |

**Key insight:** Accessibility requirements for progress indicators are non-trivial and easy to get wrong; using established components ensures compliance with WCAG standards.

## Common Pitfalls

### Pitfall 1: Inaccessible Progress Indicators
**What goes wrong:** Custom progress bars lack proper ARIA attributes, making them unusable for screen reader users
**Why it happens:** Developers focus on visual appearance without considering accessibility requirements
**How to avoid:** Always use shadcn/ui or Radix UI Progress components which include proper accessibility attributes
**Warning signs:** Progress bars implemented with plain div elements without role="progressbar" and aria-valuenow attributes

### Pitfall 2: Non-responsive Layouts
**What goes wrong:** Side-by-side panels break on mobile devices, creating horizontal scrolling or overlapping content
**Why it happens:** Using fixed widths or non-responsive grid systems
**How to avoid:** Use Tailwind's responsive grid classes (grid-cols-1 md:grid-cols-2 lg:grid-cols-4)
**Warning signs:** Layout looks good on desktop but breaks on mobile viewport sizes

## Code Examples

Verified patterns from official sources:

### Accessible Progress Component
```tsx
// Source: https://ui.shadcn.com/docs/components/progress
"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: number
  }
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
```

### Responsive Grid Layout
```tsx
// Source: Tailwind CSS documentation
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {/* Speaker panels */}
</div>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| jQuery UI progress bars | Radix UI/shadcn/ui components | 2022-2023 | Better accessibility, smaller bundle size, React-first design |
| Bootstrap grid system | Tailwind CSS responsive grids | 2020-2022 | More flexible, utility-first approach with better customization |

**Deprecated/outdated:**
- Custom CSS progress bars without ARIA attributes
- Fixed-width layouts without mobile considerations

## Open Questions

1. **Exact tie-breaking threshold**
   - What we know: Context specifies allowing ties when scores are "very close"
   - What's unclear: The specific percentage difference threshold for determining "very close"
   - Recommendation: Use a 2% threshold (scores within 2 percentage points are considered tied)

## Sources

### Primary (HIGH confidence)
- shadcn/ui Progress component documentation - Official implementation details
- Radix UI Primitives documentation - Underlying accessibility patterns
- Tailwind CSS responsive design documentation - Grid and flex utilities

### Secondary (MEDIUM confidence)
- WebSearch verified with official source - React/Tailwind ecosystem trends for 2026

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Verified with official documentation
- Architecture: HIGH - Based on established patterns in the ecosystem
- Pitfalls: HIGH - Well-documented accessibility and responsive design requirements

**Research date:** 2026-02-03
**Valid until:** 2026-03-03