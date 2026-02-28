# HarveLogix AI - Design System Documentation

## Overview

This document describes the design system for HarveLogix AI dashboard, inspired by India's Digital India and AI for Bharat initiatives. The system provides a cohesive, accessible, and modern interface for agricultural decision support.

---

## 🎨 Color Palette

### Philosophy
- **Trust & Governance**: Deep Blue (#2457A7) - Primary color for main actions and navigation
- **Growth & Agriculture**: Forest Green (#1E8A43) - Secondary color for growth metrics
- **Energy & Action**: Vivid Orange (#F36D20) - Accent color for urgent actions
- **Accessibility**: Neutral greys and white for readability and inclusivity

### Primary Colors

```
Primary Blue (Trust)
  50: #E8F0F8
  100: #D1E1F1
  200: #A3C3E3
  300: #75A5D5
  400: #4787C7
  500: #2457A7 ← Main
  600: #1D4285
  700: #163363
  800: #0F2241
  900: #081120
```

```
Secondary Green (Growth)
  50: #E8F5E9
  100: #C8E6C9
  200: #A5D6A7
  300: #81C784
  400: #66BB6A
  500: #1E8A43 ← Main
  600: #1B7A3A
  700: #186A31
  800: #155A28
  900: #0F3A1F
```

```
Accent Orange (Action)
  50: #FEF3E8
  100: #FDE7D1
  200: #FBCFA3
  300: #F9B775
  400: #F79F47
  500: #F36D20 ← Main
  600: #E05A1A
  700: #C94714
  800: #B2340E
  900: #8B2608
```

### Semantic Colors

- **Success**: #28A745 (Green) - Positive actions, healthy status
- **Warning**: #FFC107 (Amber) - Caution, degraded status
- **Error**: #DC3545 (Red) - Critical issues, errors
- **Info**: #17A2B8 (Cyan) - Informational messages

### Neutral Palette

```
  0: #FFFFFF (White)
  50: #F9FAFB
  100: #F3F4F6
  200: #E5E7EB
  300: #D1D5DB
  400: #9CA3AF
  500: #6B7280
  600: #4B5563
  700: #374151
  800: #1F2937
  900: #111827 (Near Black)
```

### Usage Guidelines

| Element | Color | Reason |
|---------|-------|--------|
| Primary buttons | Primary Blue | Trust, main actions |
| Navigation | Primary Blue | Consistency, hierarchy |
| Success states | Success Green | Positive feedback |
| Warnings | Warning Amber | Attention needed |
| Errors | Error Red | Critical attention |
| Backgrounds | Neutral 50-100 | Accessibility, readability |
| Text | Neutral 700-900 | Contrast, legibility |

---

## 📝 Typography

### Font Family
**Noto Sans** - Primary font for all text

**Why Noto Sans?**
- Excellent support for Indic scripts (Hindi, Tamil, Kannada, Telugu, Marathi, Bengali)
- Clean, modern, highly legible
- Aligns with Indian government digital design guidelines
- Fallback: System fonts (-apple-system, BlinkMacSystemFont, Segoe UI)

### Type Scale

```
H1: 40px (2.5rem) | Bold | Line-height: 1.2
H2: 32px (2rem) | Bold | Line-height: 1.3
H3: 24px (1.5rem) | Semibold | Line-height: 1.4
H4: 20px (1.25rem) | Semibold | Line-height: 1.4
H5: 16px (1rem) | Semibold | Line-height: 1.5
H6: 14px (0.875rem) | Semibold | Line-height: 1.5

Body Large: 16px | Regular | Line-height: 1.6
Body Regular: 15px | Regular | Line-height: 1.6
Body Small: 14px | Regular | Line-height: 1.5

Label Large: 14px | Medium | Line-height: 1.5
Label Regular: 13px | Medium | Line-height: 1.5
Label Small: 12px | Medium | Line-height: 1.4

Caption: 12px | Regular | Line-height: 1.4
```

### Font Weights
- **400**: Regular (body text)
- **500**: Medium (labels, emphasis)
- **600**: Semibold (subheadings, strong emphasis)
- **700**: Bold (headings, primary emphasis)

### Usage Examples

```jsx
// Heading
<h1 className="text-h1">Page Title</h1>

// Body text
<p className="text-body-regular">Regular paragraph text</p>

// Label
<label className="text-label">Form Label</label>

// Caption
<span className="text-caption">Small helper text</span>
```

---

## 📐 Spacing System

Base unit: **8px** (Tailwind default)

```
xs: 4px (0.25rem)
sm: 8px (0.5rem)
md: 16px (1rem)
lg: 24px (1.5rem)
xl: 32px (2rem)
2xl: 40px (2.5rem)
3xl: 48px (3rem)
4xl: 64px (4rem)
```

### Component Spacing

```
Card padding: 24px (1.5rem)
Card gap: 16px (1rem)

Button padding: 10px vertical, 16px horizontal
Button gap: 8px

Input padding: 12px
Input gap: 8px

Section padding: 32px (2rem)
Section gap: 24px (1.5rem)
```

### Usage Examples

```jsx
// Card with consistent spacing
<div className="p-6 space-y-4">
  <h2>Title</h2>
  <p>Content</p>
</div>

// Grid with gap
<div className="grid grid-cols-3 gap-6">
  {/* items */}
</div>

// Flex with spacing
<div className="flex items-center gap-3">
  {/* items */}
</div>
```

---

## 🎭 Shadows & Elevation

Elevation-based shadow system for depth and hierarchy:

```
None: none
Small: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
Medium: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
Large: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
XL: 0 20px 25px -5px rgba(0, 0, 0, 0.1)

Hover: 0 8px 12px -2px rgba(36, 87, 167, 0.15)
Focus: 0 0 0 3px rgba(36, 87, 167, 0.1)
```

### Usage

```jsx
// Card with shadow
<div className="shadow-md hover:shadow-lg">Card</div>

// Button with hover shadow
<button className="shadow-sm hover:shadow-md">Button</button>
```

---

## 🔲 Border Radius

```
sm: 4px (0.25rem)
md: 8px (0.5rem)
lg: 12px (0.75rem)
xl: 16px (1rem)
2xl: 24px (1.5rem)
full: 9999px (circular)
```

### Usage Guidelines

| Element | Radius | Reason |
|---------|--------|--------|
| Buttons | md (8px) | Friendly, modern |
| Cards | lg (12px) | Prominent, readable |
| Inputs | md (8px) | Consistent with buttons |
| Badges | full (circular) | Distinctive, compact |
| Modals | xl (16px) | Large, prominent |

---

## 🎬 Transitions & Animations

```
Fast: 150ms ease-in-out
Base: 200ms ease-in-out
Slow: 300ms ease-in-out
```

### Common Animations

```jsx
// Fade in
<div className="transition-opacity duration-200">Content</div>

// Hover effect
<button className="hover:shadow-lg transition-shadow duration-200">
  Button
</button>

// Color transition
<div className="hover:bg-primary-600 transition-colors duration-200">
  Hover me
</div>
```

---

## 🧩 Component Patterns

### Card Component

```jsx
import { Card, CardHeader, CardBody, CardFooter } from './components/Card'

<Card>
  <CardHeader>
    <h2>Title</h2>
  </CardHeader>
  <CardBody>
    <p>Content</p>
  </CardBody>
  <CardFooter>
    <button>Action</button>
  </CardFooter>
</Card>
```

### Metric Card Component

```jsx
import { MetricCard } from './components/Card'
import { Users } from 'lucide-react'

<MetricCard
  icon={Users}
  label="Total Farmers"
  value="45,230"
  change="+12.5%"
  changeType="positive"
  color="primary"
/>
```

### Status Badge Component

```jsx
import { StatusBadge } from './components/Card'

<StatusBadge status="healthy" label="Operational" />
<StatusBadge status="degraded" label="Degraded" />
<StatusBadge status="critical" label="Critical" />
```

---

## ♿ Accessibility

### Color Contrast
- All text meets WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- Semantic colors are not the only indicator (always include text/icons)

### Focus States
- All interactive elements have visible focus states
- Focus outline: 2px solid primary blue with 2px offset

### Keyboard Navigation
- All components are keyboard accessible
- Tab order follows visual hierarchy
- Escape key closes modals/dropdowns

### Screen Readers
- Semantic HTML (buttons, links, headings)
- ARIA labels for icons and complex components
- Form labels properly associated with inputs

### Bilingual Support
- Design accommodates Indic scripts (Hindi, Tamil, etc.)
- Line-height increased for script compatibility
- Text expansion considered (20-30% for translations)

---

## 🚀 Adding New Components

### Step 1: Define Colors
```tsx
// In theme/colors.ts
export const colors = {
  myComponent: {
    background: '#...',
    text: '#...',
    border: '#...',
  }
}
```

### Step 2: Create Component
```jsx
// In components/MyComponent.jsx
import { colors } from '../theme/colors'

export function MyComponent() {
  return (
    <div className="bg-primary text-white rounded-lg p-6">
      {/* content */}
    </div>
  )
}
```

### Step 3: Use Tailwind Classes
```jsx
// Apply theme tokens via Tailwind
<div className="bg-primary-500 text-neutral-900 rounded-lg shadow-md">
  {/* content */}
</div>
```

### Step 4: Document
```jsx
/**
 * MyComponent
 * 
 * Purpose: Brief description
 * 
 * Props:
 * - prop1: description
 * - prop2: description
 * 
 * Usage:
 * <MyComponent prop1="value" />
 */
```

---

## 📱 Responsive Design

### Breakpoints (Tailwind)
```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### Mobile-First Approach
```jsx
// Mobile first
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* 1 column on mobile, 2 on tablet, 3 on desktop */}
</div>
```

### Responsive Typography
```jsx
// Smaller on mobile, larger on desktop
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  Responsive Heading
</h1>
```

---

## 🎯 Best Practices

1. **Use Theme Tokens**: Always use defined colors, spacing, and typography
2. **Maintain Consistency**: Follow established patterns for similar components
3. **Accessibility First**: Ensure all components are accessible
4. **Mobile Responsive**: Design mobile-first, enhance for larger screens
5. **Performance**: Minimize CSS, use Tailwind's purging
6. **Documentation**: Document new components and patterns
7. **Testing**: Test components across browsers and devices
8. **Bilingual Ready**: Design with Indic script support in mind

---

## 📚 Resources

- **Tailwind CSS**: https://tailwindcss.com/
- **Noto Sans Font**: https://fonts.google.com/noto
- **WCAG Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **India Digital Design**: https://www.indiastack.org/
- **Lucide Icons**: https://lucide.dev/

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-28 | Initial design system |

---

**Made with ❤️ for Indian Agriculture | Viksit Bharat 2047**
