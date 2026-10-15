---
name: HackMate AI Design System
version: "1.0.0"
description: "Dark, premium developer-dashboard aesthetic for HackMate AI hackathon mentor platform"
colors:
  background-main: "#0B1020"
  background-sidebar: "#0A0F1C"
  background-card: "#151D31"
  surface-elevated: "#1B2640"
  primary: "#6366F1"
  primary-hover: "#4F46E5"
  primary-light: "#818CF8"
  secondary: "#22D3EE"
  secondary-hover: "#06B6D4"
  secondary-light: "#67E8F9"
  success: "#34D399"
  warning: "#FBBF24"
  error: "#FB7185"
  text-primary: "#F1F5F9"
  text-secondary: "#94A3B8"
  text-muted: "#64748B"
  border: "#29354D"
  border-light: "#384766"
typography:
  h1:
    fontFamily: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
    fontSize: 2.25rem
    fontWeight: "700"
    lineHeight: "1.2"
    letterSpacing: "-0.025em"
  h2:
    fontFamily: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
    fontSize: 1.5rem
    fontWeight: "600"
    lineHeight: "1.3"
    letterSpacing: "-0.02em"
  h3:
    fontFamily: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
    fontSize: 1.125rem
    fontWeight: "600"
    lineHeight: "1.4"
  body-lg:
    fontFamily: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
    fontSize: 1rem
    lineHeight: "1.5"
  body-md:
    fontFamily: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
    fontSize: 0.875rem
    lineHeight: "1.5"
  body-sm:
    fontFamily: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
    fontSize: 0.75rem
    lineHeight: "1.4"
  mono:
    fontFamily: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace
    fontSize: 0.8125rem
    lineHeight: "1.4"
rounded:
  none: 0px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
components:
  card:
    backgroundColor: "{colors.background-card}"
    borderColor: "{colors.border}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "10px 18px"
  button-secondary:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.text-primary}"
    borderColor: "{colors.border}"
    rounded: "{rounded.md}"
    padding: "10px 18px"
  badge-ai:
    backgroundColor: "rgba(34, 211, 238, 0.1)"
    textColor: "{colors.secondary}"
    borderColor: "rgba(34, 211, 238, 0.25)"
    rounded: "{rounded.full}"
    padding: "3px 10px"
---

## Overview

HackMate AI embodies a focused, dark developer-first product experience engineered specifically for high-intensity hackathons. The visual language balances maximum information density with calm clarity, eliminating cognitive overload when teams are racing against the clock.

The aesthetic evokes high-end developer infrastructure tools (Linear, Raycast, Vercel, JetBrains) rather than playful consumer apps or noisy marketing pages. Every element emphasizes speed, legibility, tactile precision, and structured execution.

## Colors

The color palette is deliberately calibrated for long coding nights with zero visual fatigue and crisp WCAG AA+ contrast ratios.

- **Main Background (`#0B1020`):** Deep twilight obsidian base layer for the entire application.
- **Sidebar Background (`#0A0F1C`):** Ultra-dark charcoal anchor that frames navigation without competing with workspace cards.
- **Card Background (`#151D31`):** Subtly illuminated slate for containers, panels, and interactive cards.
- **Elevated Surface (`#1B2640`):** Raised layer for modals, popovers, dropdowns, and hover states.
- **Primary Accent Indigo (`#6366F1`):** Primary driver for user actions, active navigation states, primary buttons, and progress milestones.
- **Secondary Accent Electric Cyan (`#22D3EE`):** AI mentor insights, intelligence recommendations, prompt pills, and smart suggestions.
- **Success (`#34D399`):** Completed tasks, verified deliverables, passing criteria, and positive health metrics.
- **Warning (`#FBBF24`):** Approaching deadlines, scope warnings, and critical time markers.
- **Error (`#FB7185`):** Overdue tasks, blockers, technical risks, and critical constraints.
- **Borders (`#29354D`):** Crisp structural boundaries providing visual separation without high contrast harshness.
- **Text Primary (`#F1F5F9`) & Secondary (`#94A3B8`):** High contrast white-slate for reading comfort across varied ambient environments.

## Typography

Typography prioritizes functional hierarchy and rapid scanning under time pressure.

- **Headlines (H1, H2, H3):** Set in clean, geometric Inter with tight letter-spacing (`-0.025em`) for authoritative, modern presence.
- **Body Text:** Inter with balanced line-heights (`1.4`–`1.5`) for rapid comprehension of complex problem analyses.
- **Monospace:** `JetBrains Mono` / system monospace for time codes, tech badges, countdowns, and code dependencies.
- **Uppercase micro-labels:** 11px uppercase with `0.05em` letter-spacing for category pills, statuses, and metadata.

## Layout

The layout is anchored on an 8px grid system with a responsive 12-column desktop grid.

- **Sidebar:** Fixed 260px desktop width, collapsible on tablets, bottom sheet / drawer on mobile.
- **Top Navigation:** 64px height with contextual breadcrumbs, live deadline countdown badge, and quick action bar.
- **Main Container:** Max-width 1600px with generous 24px–32px padding, scaling gracefully down to mobile.
- **Card Spacing:** 16px gap on mobile, 24px gap on desktop for rhythmic breathing room.

## Elevation & Depth

HackMate AI favors structural border contrast over blurry, excessive drop shadows.

- **Level 0 (Base):** Flat `#0B1020`.
- **Level 1 (Card):** `#151D31` with `1px solid #29354D` and subtle shadow `0 2px 8px rgba(0,0,0,0.3)`.
- **Level 2 (Hover / Elevated):** `#1B2640` with `1px solid #384766` and shadow `0 6px 20px rgba(0,0,0,0.4)`.
- **Level 3 (Modal / Flyout):** `#1B2640` with backdrop-filter blur `12px` and border glow highlight.

## Shapes

- **Base Radius:** 8px (`rounded-md` / `rounded-lg`) on cards and interactive buttons for a modern, tactile feel.
- **Small Elements:** 4px–6px on checkboxes, input fields, and tags.
- **Pills / Status Chips:** Full pill radius (`9999px`) for quick visual differentiation.

## Components

- **Buttons:** Tactile, distinct states (default, hover, active, disabled) with subtle transform micro-interactions (`translate-y-[-1px]`).
- **Cards:** Crisp border headers, distinct content compartments, clear metadata footers.
- **Status Chips:** Distinct background tints (10-15% opacity) with solid matching text color and border.
- **Countdown Banner:** Live pulsating indicator when approaching deadlines.
- **AI Recommendation Badges:** Electric cyan subtle glow badge communicating intelligent mentor suggestions.

## Do's and Don'ts

### Do:
- Use Indigo (`#6366F1`) for primary actions and Cyan (`#22D3EE`) exclusively for AI guidance.
- Keep border colors consistent (`#29354D` base, `#384766` on hover).
- Maintain 8px-based spacing rhythm.
- Present dense hackathon data with clear typographic hierarchy and digestible bullet points.
- Show realistic, student-friendly explanations with actionable guidance.

### Don't:
- Don't use heavy rainbow gradients or neon glows that induce eye strain.
- Don't use light backgrounds; keep the dark developer aesthetic cohesive throughout.
- Don't leave buttons without interactive feedback or dead links.
- Don't hide critical hackathon deadlines or MVP scope blockers.
- Don't recommend overly complex enterprise architectures for short hackathons.
