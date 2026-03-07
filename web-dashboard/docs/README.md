# HarveLogixAI Web Dashboard

The HarveLogixAI Web Dashboard is a premium, real-time analytical interface for farmers, processors, and government officials.

## Architecture Overiew
- **UI Framework**: React.js with Vite for high-performance rendering.
- **Design System**: "Forest to Tech" glassmorphism theme with custom CSS variables.
- **State Management**: Context-based (Theme, Internationalization, DataMode).
- **Icons**: Lucide-React for clean, vector-based iconography.
- **Navigation**: React Router with protected layouts and dynamic sidebars.

## Module Structure

```
web-dashboard/
├── src/
│   ├── components/          # Reusable UI Architecture
│   │   ├── MetricCard.jsx   # Data visualization card
│   │   ├── Sidebar.jsx      # Navigation & i18n switcher
│   │   └── Layout.jsx       # Theme-aware wrapper
│   ├── pages/               # Functional Views
│   │   ├── OverviewUpgraded.jsx # Main KPI dashboard
│   │   ├── AiScannerUpgraded.jsx # Multimodal capture
│   │   ├── Settings.jsx     # User controls (Theme/Lang)
│   │   └── Faq.jsx          # Searchable guidance
│   ├── context/             # Global State Management
│   │   ├── ThemeProvider.jsx # Dark/Light mode logic
│   │   └── I18nProvider.jsx  # Regional language engine
│   ├── theme/               # Design System
│   │   └── variables.css    # HSL color tokens & gradients
│   └── i18n/                # Localization Bundles
│       └── locales/         # Hindi, Gujarati, Tamil, etc.
├── docs/                    # Dashboard-specific documentation
└── vite.config.js           # Build & Dev configuration
```

## Key Features
- **Overview Dashboard**: Real-time KPI cards and agent activity timelines.
- **AI Scanner**: Multimodal (Vision/Voice) analysis using Amazon Nova.
- **Farmers Profile**: In-depth analytics and actionable recommendations from Bedrock.
- **Processors Hub**: Direct buyer matching and supply chain optimization.
- **Settings & FAQ**: Comprehensive user controls and searchable technical guidance.

## Getting Started
1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Access: `http://localhost:3000`

## Implementation Details
- **Premium Styling**: Gaps, glassmorphism, pulse animations, and gradient headers.
- **Regional Languages**: 8+ Indian languages supported via a custom JSON i18n engine.
- **Data Mode**: Switch between live AWS-driven data and local simulation for demos.
- **Components**: Atomic design with reusable `MetricCard`, `DataBadge`, and `AiInsightsPanel`.

---
*Viksit Bharat 2047 | Powered by HarveLogixAI*
