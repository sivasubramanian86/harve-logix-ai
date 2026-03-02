# HarveLogix AI - Frontend Documentation

Complete documentation for the HarveLogix AI web dashboard.

## 📚 Documentation Structure

### Getting Started
- **[README.md](./README.md)** - Frontend setup and development
- **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** - Design system & components
- **[DESIGN_REVAMP.md](./DESIGN_REVAMP.md)** - Design revamp overview

### Architecture
- **[../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)** - System architecture overview

### Design
- **[../docs/DESIGN.md](../docs/DESIGN.md)** - Design guidelines

---

## 🚀 Quick Start

### Installation

```bash
cd web-dashboard
npm install
npm run dev
```

### Building

```bash
npm run build
npm run preview
```

---

## 🎨 Design System

### Color Palette

**Primary Colors**
- Primary Blue: #2457A7 (Trust, governance)
- Secondary Green: #1E8A43 (Growth, agriculture)
- Accent Orange: #F36D20 (Energy, action)

**Semantic Colors**
- Success: #28A745
- Warning: #FFC107
- Error: #DC3545
- Info: #17A2B8

### Typography

**Font**: Noto Sans (supports Indic scripts)

**Type Scale**
- H1: 40px | Bold
- H2: 32px | Bold
- H3: 24px | Semibold
- Body: 15px | Regular
- Caption: 12px | Regular

### Spacing

Base unit: 8px

```
xs: 4px    | sm: 8px    | md: 16px
lg: 24px   | xl: 32px   | 2xl: 40px
```

---

## 🧩 Components

### Card Components

```jsx
import { Card, CardHeader, CardBody, CardFooter } from './components/Card'

<Card>
  <CardHeader>Title</CardHeader>
  <CardBody>Content</CardBody>
  <CardFooter>Actions</CardFooter>
</Card>
```

### Metric Card

```jsx
import { MetricCard } from './components/Card'
import { Users } from 'lucide-react'

<MetricCard
  icon={Users}
  label="Total Farmers"
  value="45,230"
  change="+12.5%"
  color="primary"
/>
```

### Status Badge

```jsx
import { StatusBadge } from './components/Card'

<StatusBadge status="healthy" label="Operational" />
```

### Layout

```jsx
import Layout from './components/Layout'

<Layout>
  {/* pages */}
</Layout>
```

---

## 📄 Pages

### Overview (Home)
- Hero KPI section (5 metrics)
- Regional metrics cards
- Income growth chart
- Agent activity timeline

### Agents
- 6 agent cards with status
- Agent metrics (accuracy, decisions, income)
- Performance summary

### Farmers
- Income distribution
- Regional income growth
- Government scheme enrollment

### Processors
- Processor utilization
- Weekly supply matches
- Processor performance table

### Government View
- Impact dashboard
- Waste reduction trends
- Farmer income uplift
- State comparison

### System Health
- System status
- Agent health
- Performance metrics

---

## 🎯 Theme System

### Theme Files

```
src/theme/
├── colors.ts          # Color palette
├── typography.ts      # Font sizes & weights
├── spacing.ts         # Spacing scale
├── shadows.ts         # Shadow system
└── index.ts           # Unified export
```

### Using Theme Tokens

```jsx
// Colors
className="bg-primary text-white"
className="bg-secondary-500"

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

## 📱 Responsive Design

### Breakpoints

```
Mobile:  < 640px
Tablet:  640px - 1024px
Desktop: > 1024px
```

### Mobile-First

```jsx
// 1 column on mobile, 2 on tablet, 3 on desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* items */}
</div>
```

---

## ♿ Accessibility

### WCAG Compliance

- Color contrast: AA standard (4.5:1)
- Focus states: Visible on all interactive elements
- Keyboard navigation: Full support
- Screen readers: Semantic HTML + ARIA labels

### Bilingual Support

- Designed for Indic scripts
- Increased line-height for compatibility
- Text expansion considered (20-30%)

---

## 🧪 Testing

### Unit Tests

```bash
npm test
```

### Coverage

```bash
npm run test:coverage
```

---

## 📁 Project Structure

```
web-dashboard/
├── src/
│   ├── App.jsx                 # Main app
│   ├── main.jsx                # Entry point
│   ├── index.css               # Global styles
│   ├── components/
│   │   ├── Layout.jsx
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   └── Card.jsx
│   ├── pages/
│   │   ├── Overview.jsx
│   │   ├── Agents.jsx
│   │   ├── FarmerWelfare.jsx
│   │   ├── SupplyChain.jsx
│   │   └── Analytics.jsx
│   └── theme/
│       ├── colors.ts
│       ├── typography.ts
│       ├── spacing.ts
│       ├── shadows.ts
│       └── index.ts
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── README.md
├── DESIGN_SYSTEM.md
├── DESIGN_REVAMP.md
└── DOCUMENTATION.md
```

---

## 🔧 Configuration

### Vite Config

```js
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
```

### Tailwind Config

```js
// tailwind.config.js
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { /* ... */ },
        secondary: { /* ... */ },
        accent: { /* ... */ },
      }
    }
  }
}
```

---

## 🚀 Adding New Pages

### Step 1: Create Page Component

```jsx
// src/pages/MyPage.jsx
import { Card, CardHeader, CardBody } from '../components/Card'

export default function MyPage() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-h1">My Page</h1>
      <Card>
        <CardHeader>Title</CardHeader>
        <CardBody>Content</CardBody>
      </Card>
    </div>
  )
}
```

### Step 2: Add Route

```jsx
// src/App.jsx
import MyPage from './pages/MyPage'

<Route path="/my-page" element={<MyPage />} />
```

### Step 3: Add Navigation

```jsx
// src/components/Sidebar.jsx
{ icon: MyIcon, label: 'My Page', path: '/my-page' }
```

---

## 🎨 Adding New Components

### Step 1: Create Component

```jsx
// src/components/MyComponent.jsx
export function MyComponent({ prop1, prop2 }) {
  return (
    <div className="bg-primary text-white rounded-lg p-6">
      {/* content */}
    </div>
  )
}
```

### Step 2: Export from Index

```jsx
// src/components/index.js
export { MyComponent } from './MyComponent'
```

### Step 3: Use in Pages

```jsx
import { MyComponent } from '../components'

<MyComponent prop1="value" />
```

---

## 📊 Performance

### Optimization Tips

1. **Code Splitting**: Routes are automatically code-split
2. **Image Optimization**: Use optimized images
3. **Lazy Loading**: Components load on demand
4. **Caching**: Browser caching enabled

### Build Optimization

```bash
npm run build
# Analyzes bundle size
```

---

## 🔐 Security

- Input validation
- XSS protection via React
- CSRF tokens ready
- Secure headers configured

---

## 📖 Related Documentation

- **Frontend README**: [README.md](./README.md)
- **Design System**: [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
- **Design Revamp**: [DESIGN_REVAMP.md](./DESIGN_REVAMP.md)
- **Design Guidelines**: [../docs/DESIGN.md](../docs/DESIGN.md)
- **API Reference**: [../docs/API.md](../docs/API.md)

---

**Made with ❤️ for Indian Agriculture | Viksit Bharat 2047**
