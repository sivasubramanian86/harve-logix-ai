# HarveLogix AI - Design System & UI Guidelines

## Overview

The HarveLogix AI dashboard has been designed with India's **Digital India** and **AI for Bharat** initiatives in mind. This document covers the design system, UI guidelines, and component patterns.

For detailed design system documentation, see [web-dashboard/docs/DESIGN_SYSTEM.md](../web-dashboard/docs/DESIGN_SYSTEM.md).

---

## 🎨 Design Philosophy

### Core Principles

1. **Trust & Governance** - Deep Blue (#2457A7) for primary actions
2. **Growth & Agriculture** - Forest Green (#1E8A43) for growth metrics
3. **Energy & Action** - Vivid Orange (#F36D20) for urgent actions
4. **Accessibility** - WCAG compliant, bilingual-ready
5. **Inclusivity** - Designed for all users, all devices

### Visual Identity

- **Color Palette**: India Digital (Blue, Green, Orange)
- **Typography**: Noto Sans (supports Indic scripts)
- **Spacing**: 8px base unit system
- **Shadows**: Elevation-based depth
- **Responsiveness**: Mobile-first approach

---

## 🎯 Design System Components

### Color Palette

**Primary Colors**
- Primary Blue: #2457A7 (Trust, governance)
- Secondary Green: #1E8A43 (Growth, agriculture)
- Accent Orange: #F36D20 (Energy, action)

**Semantic Colors**
- Success: #28A745 (Positive states)
- Warning: #FFC107 (Caution)
- Error: #DC3545 (Critical issues)
- Info: #17A2B8 (Information)

**Neutral Palette**
- White: #FFFFFF
- Light: #F9FAFB
- Medium: #E5E7EB
- Dark: #374151
- Black: #111827

### Typography

**Font Family**: Noto Sans
- Excellent support for Indic scripts
- Clean, modern, highly legible
- Aligns with Indian government guidelines

**Type Scale**
- H1: 40px | Bold
- H2: 32px | Bold
- H3: 24px | Semibold
- Body: 15px | Regular
- Caption: 12px | Regular

### Spacing System

Base unit: 8px

```
xs: 4px    | Tight spacing
sm: 8px    | Small spacing
md: 16px   | Medium spacing
lg: 24px   | Large spacing
xl: 32px   | Extra large
```

### Shadows & Elevation

```
Small: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
Medium: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
Large: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
XL: 0 20px 25px -5px rgba(0, 0, 0, 0.1)
```

---

## 🧩 Component Patterns

### Card Component

```jsx
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

### Metric Card

```jsx
<MetricCard
  icon={Users}
  label="Total Farmers"
  value="45,230"
  change="+12.5%"
  changeType="positive"
  color="primary"
/>
```

### Status Badge

```jsx
<StatusBadge status="healthy" label="Operational" />
<StatusBadge status="degraded" label="Degraded" />
<StatusBadge status="critical" label="Critical" />
```

---

## 📱 Layout Structure

### Navigation

**Left Sidebar** (Collapsible)
- Logo & branding
- Organized menu sections
- Active state indicators
- Responsive collapse

**Top Navigation Bar**
- Menu toggle
- Logo area
- Environment badge
- Notifications
- User profile dropdown

### Page Layouts

**Overview (Home)**
- Hero KPI section (5 metrics)
- Two-column layout (regional + activity)

**Agents**
- 6 agent cards with status
- Performance summary

**Farmers**
- Income distribution
- Regional metrics
- Scheme enrollment

**Processors**
- Utilization rates
- Supply matches
- Performance metrics

**Government View**
- Impact dashboard
- Waste reduction trends
- Income uplift

---

## ♿ Accessibility

### WCAG Compliance

- **Color Contrast**: AA standard (4.5:1 for normal text)
- **Focus States**: Visible on all interactive elements
- **Keyboard Navigation**: Full support
- **Screen Readers**: Semantic HTML + ARIA labels

### Bilingual Support

- Designed for Indic scripts (Hindi, Tamil, Kannada, Telugu, Marathi, Bengali)
- Increased line-height for script compatibility
- Text expansion considered (20-30% for translations)

### Best Practices

- Use semantic HTML
- Provide ARIA labels for icons
- Ensure keyboard accessibility
- Test with screen readers
- Maintain color contrast

---

## 📐 Responsive Design

### Breakpoints

```
Mobile:  < 640px
Tablet:  640px - 1024px
Desktop: > 1024px
```

### Mobile-First Approach

```jsx
// 1 column on mobile, 2 on tablet, 3 on desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* items */}
</div>
```

---

## 🎨 Design Tokens

### Using Theme Tokens

```jsx
// Colors
className="bg-primary text-white"
className="bg-secondary-500 text-neutral-900"

// Spacing
className="p-6 space-y-4"
className="gap-3"

// Typography
className="text-h2 font-bold"
className="text-body-regular"

// Shadows
className="shadow-md hover:shadow-lg"
```

---

## 🚀 Adding New Components

### Step 1: Define in Theme
```tsx
// src/theme/colors.ts
export const colors = {
  myComponent: {
    background: '#...',
    text: '#...',
  }
}
```

### Step 2: Create Component
```jsx
// src/components/MyComponent.jsx
export function MyComponent() {
  return (
    <div className="bg-primary text-white rounded-lg p-6">
      {/* content */}
    </div>
  )
}
```

### Step 3: Use in Pages
```jsx
import { MyComponent } from '../components/MyComponent'

export function MyPage() {
  return <MyComponent />
}
```

---

## 🎯 Best Practices

1. **Use Theme Tokens**: Always use defined colors, spacing, typography
2. **Maintain Consistency**: Follow established patterns
3. **Accessibility First**: Ensure WCAG compliance
4. **Mobile Responsive**: Design mobile-first
5. **Performance**: Minimize CSS, use Tailwind purging
6. **Documentation**: Document new components
7. **Testing**: Test across browsers and devices
8. **Bilingual Ready**: Design with Indic scripts in mind

---

## 📚 Resources

- **Tailwind CSS**: https://tailwindcss.com/
- **Noto Sans Font**: https://fonts.google.com/noto
- **WCAG Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **India Digital**: https://www.indiastack.org/
- **Lucide Icons**: https://lucide.dev/

---

## 📖 Related Documentation

- **Design System Details**: [web-dashboard/DESIGN_SYSTEM.md](../web-dashboard/DESIGN_SYSTEM.md)
- **Frontend README**: [web-dashboard/README.md](../web-dashboard/README.md)
- **Design Revamp**: [web-dashboard/DESIGN_REVAMP.md](../web-dashboard/DESIGN_REVAMP.md)

---

**Made with ❤️ for Indian Agriculture | Viksit Bharat 2047**
