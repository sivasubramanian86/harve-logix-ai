# Design Document: Analytics Dashboard Upgrade

## Overview

The Analytics Dashboard Upgrade transforms HarveLogixAI from a basic interface into an enterprise-grade analytics console. The design introduces three major systems: internationalization (i18n) for 8 Indian languages, a theme system supporting light/dark modes, and a data service abstraction layer enabling seamless switching between demo and live data.

The architecture maintains backward compatibility with existing APIs while introducing new components for metrics visualization, AI insights, and system health monitoring. All components use CSS variables for theming and i18n keys for text, enabling dynamic language and theme switching without page reloads.

## Architecture

### High-Level System Design

```
┌─────────────────────────────────────────────────────────────┐
│                    React Application                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Context Providers (Root Level)               │   │
│  │  ├─ I18nProvider (react-i18next)                     │   │
│  │  ├─ ThemeProvider (React Context + CSS Variables)   │   │
│  │  └─ DataModeProvider (demo vs live)                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                   │
│  ┌────────────────────────┴────────────────────────────┐    │
│  │         Layout & Navigation                         │    │
│  │  ├─ Navbar (language switcher, theme toggle)        │    │
│  │  ├─ Sidebar (navigation with i18n labels)           │    │
│  │  └─ Main Content Area                               │    │
│  └────────────────────────────────────────────────────┘    │
│                           │                                   │
│  ┌────────────────────────┴────────────────────────────┐    │
│  │         Page Components                             │    │
│  │  ├─ Overview (Hero KPIs, Activity Timeline)         │    │
│  │  ├─ Farmers (Searchable Table, Detail Panel)        │    │
│  │  ├─ Government View (Analytics Charts)              │    │
│  │  ├─ System Health (Infrastructure Metrics)          │    │
│  │  └─ Other Pages (Processors, Agents)                │    │
│  └────────────────────────────────────────────────────┘    │
│                           │                                   │
│  ┌────────────────────────┴────────────────────────────┐    │
│  │         Shared Components                           │    │
│  │  ├─ MetricCard (with theme & i18n)                  │    │
│  │  ├─ AiInsightsPanel (insights + WOW features)       │    │
│  │  ├─ DataBadge (demo vs live indicator)              │    │
│  │  └─ Charts (Recharts with theme support)            │    │
│  └────────────────────────────────────────────────────┘    │
│                           │                                   │
│  ┌────────────────────────┴────────────────────────────┐    │
│  │         Services Layer                              │    │
│  │  ├─ DataService (abstraction layer)                 │    │
│  │  ├─ i18nService (language management)               │    │
│  │  ├─ ThemeService (theme persistence)                │    │
│  │  └─ ApiClient (axios with error handling)           │    │
│  └────────────────────────────────────────────────────┘    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Initialization**: App loads, providers initialize with persisted preferences
2. **Language Selection**: User selects language → i18n updates → all components re-render with new text
3. **Theme Toggle**: User toggles theme → CSS variables update → all components reflect new colors
4. **Data Fetching**: Components request data → DataService determines source (live/demo) → data flows to components
5. **API Failure**: Live API fails → DataService falls back to demo data → badge updates to show "Demo data"

## Components and Interfaces

### 1. Context Providers

#### I18nProvider
- Wraps entire app with react-i18next
- Manages language state and persistence
- Provides useTranslation hook to all components
- Supports 8 languages: English, Hindi, Tamil, Telugu, Malayalam, Kannada, Gujarati, Marathi

#### ThemeProvider
- Manages light/dark theme state
- Persists theme preference to localStorage
- Detects system preference on first load (prefers-color-scheme)
- Updates CSS variables on theme change
- Provides useTheme hook for component access

#### DataModeProvider
- Manages demo vs live data mode
- Provides useDataMode hook
- Tracks data source for each request
- Enables graceful fallback on API failures

### 2. Navigation Components

#### Navbar
- Language switcher dropdown (8 languages)
- Theme toggle button (sun/moon icon)
- Data mode badge (Demo/Live indicator)
- Responsive design for mobile/tablet/desktop
- All labels use i18n keys

#### Sidebar
- Navigation items: Overview, Farmers, Processors, Agents, Government View, System Health
- Active item highlighting
- Collapsible on mobile
- All labels use i18n keys
- Icons from lucide-react

### 3. Page Components

#### Overview Page
- Hero KPI Cards (5 metrics with trends)
- State/Region Breakdown Table
- Today's Agent Activity Timeline
- All data from DataService
- Responsive grid layout

#### Farmers Page
- Searchable/filterable table
- Columns: name, location, crops, last decision, status
- Detail panel on row click
- Past decisions list with outcomes
- AI insights specific to farmer
- Pagination support

#### Government View Page
- Waste Reduction by State (chart)
- Income Uplift by State (chart)
- Adoption Rate by State (chart)
- Water Savings by State (chart)
- Trend badges for each metric
- Hover tooltips with exact values

#### System Health Page
- Agent Latency metric (ms)
- Error Rates metric (%)
- Bedrock API Call Volume
- EventBridge Health Status
- Status badges (success/warning/error)
- Auto-refresh every 30 seconds

### 4. Shared Components

#### MetricCard
```typescript
interface MetricCardProps {
  icon: React.ComponentType
  label: string // i18n key
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  color?: 'primary' | 'success' | 'warning' | 'error'
  theme?: 'light' | 'dark'
}
```

#### AiInsightsPanel
```typescript
interface AiInsightsPanelProps {
  farmerId?: string
  insights: Insight[]
  wowFeatures: WowFeature[]
  isLoading?: boolean
}

interface Insight {
  type: 'crop_protection' | 'weather' | 'storage' | 'supply' | 'water' | 'quality'
  title: string // i18n key
  description: string // i18n key
  confidence: 'high' | 'medium' | 'low'
  impact?: string
}

interface WowFeature {
  metric: string
  value: number | string
  unit: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ComponentType
}
```

#### DataBadge
```typescript
interface DataBadgeProps {
  mode: 'demo' | 'live'
  timestamp?: Date
}
```

### 5. Data Service

#### DataService Interface
```typescript
interface DataService {
  getOverviewMetrics(): Promise<OverviewMetrics>
  getFarmers(filters?: FarmerFilters): Promise<Farmer[]>
  getFarmerDetails(farmerId: string): Promise<FarmerDetails>
  getGovernmentMetrics(): Promise<GovernmentMetrics>
  getSystemHealth(): Promise<SystemHealth>
  getAiInsightsForFarmer(farmerId: string): Promise<AiInsight[]>
}

interface OverviewMetrics {
  farmersOnboarded: number
  processorsConnected: number
  wasteReductionRupees: number
  incomeUpliftPerAcre: number
  waterSavedLitres: number
  trends: MetricTrend[]
  timestamp: Date
  source: 'live' | 'demo'
}

interface MetricTrend {
  metric: string
  change: number
  direction: 'up' | 'down' | 'neutral'
}
```

## Data Models

### Core Data Structures

```typescript
// Farmer
interface Farmer {
  id: string
  name: string
  location: string
  crops: string[]
  lastDecisionDate: Date
  status: 'active' | 'inactive'
  region: string
}

// Decision
interface Decision {
  id: string
  farmerId: string
  date: Date
  recommendation: string
  outcome: 'positive' | 'neutral' | 'negative'
  impact: string
}

// Government Metrics
interface GovernmentMetrics {
  wasteReductionByState: StateMetric[]
  incomeUpliftByState: StateMetric[]
  adoptionByState: StateMetric[]
  waterSavingsByState: StateMetric[]
}

interface StateMetric {
  state: string
  value: number
  trend: number
  direction: 'up' | 'down' | 'neutral'
}

// System Health
interface SystemHealth {
  agentLatency: number // ms
  errorRate: number // %
  bedrockCallVolume: number
  eventBridgeStatus: 'healthy' | 'degraded' | 'critical'
  lastUpdated: Date
}
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.



### Prework Analysis

Before writing correctness properties, I'll analyze each acceptance criterion for testability:

**Requirement 1: Multi-Language Support**
- 1.1 Default language: Example test (verify English on first load)
- 1.2 Language switcher: Property (for all languages, switching should update all text)
- 1.3 Persistence: Property (language selection should persist across sessions)
- 1.4 Script rendering: Property (all Indic scripts should render correctly)
- 1.5 Language consistency: Property (selected language should apply to all pages)
- 1.6 Translation requirement: No (deployment process, not testable)
- 1.7 Fallback to English: Property (missing translations should fall back to English)

**Requirement 2: Light and Dark Theme**
- 2.1 System preference detection: Example test (verify system preference on first load)
- 2.2 Theme toggle: Property (toggling should switch themes for all components)
- 2.3 Persistence: Property (theme selection should persist across sessions)
- 2.4 Light theme colors: Property (light theme should use light backgrounds and dark text)
- 2.5 Dark theme colors: Property (dark theme should use dark backgrounds and light text)
- 2.6 CSS variables: Property (all colors should use CSS variables, not hard-coded)
- 2.7 Smooth transition: Property (theme change should update without page reload)
- 2.8 System preference fallback: Property (system preference should apply when no user preference set)

**Requirement 3: Overview Page KPIs**
- 3.1 Hero KPI display: Example test (verify 5 KPI cards render)
- 3.2 KPI values and trends: Property (all KPIs should display value, label, and trend)
- 3.3 Positive trend indicator: Property (positive trends should show green up arrow)
- 3.4 Negative trend indicator: Property (negative trends should show red down arrow)
- 3.5 State breakdown: Example test (verify state breakdown table renders)
- 3.6 Activity timeline: Example test (verify timeline renders with recent decisions)
- 3.7 Timeline hover details: Property (hovering over timeline entry should show details)

**Requirement 4: Farmers Page**
- 4.1 Table display: Example test (verify table renders with farmer data)
- 4.2 Search filtering: Property (search should filter farmers by name/location)
- 4.3 Detail panel: Example test (clicking farmer should open detail panel)
- 4.4 Past decisions: Property (detail panel should show all past decisions)
- 4.5 AI insights: Property (detail panel should show farmer-specific insights)
- 4.6 Language support: Property (farmers page should display in selected language)

**Requirement 5: Government View**
- 5.1 Charts display: Example test (verify all 4 charts render)
- 5.2 Trend badges: Property (each metric should show trend badge)
- 5.3 Hover tooltips: Property (hovering over chart point should show exact value)
- 5.4 Language and theme: Property (government view should respect language and theme)

**Requirement 6: System Health**
- 6.1 Metrics display: Example test (verify all metrics render)
- 6.2 Threshold warnings: Property (metrics exceeding threshold should show warning badge)
- 6.3 Normal range success: Property (metrics in normal range should show success badge)
- 6.4 Auto-refresh: Property (metrics should refresh every 30 seconds)

**Requirement 7: Data Service**
- 7.1 Demo vs live determination: Property (data service should correctly determine data source)
- 7.2 Data return: Property (data service should return data from appropriate source)
- 7.3 API failure fallback: Property (failed live API should fall back to demo data)
- 7.4 Demo data badge: Property (demo data should display "Demo data" badge)
- 7.5 Live data badge: Property (live data should display "Live data" badge)
- 7.6 Metadata inclusion: Property (data should include source and timestamp metadata)

**Requirement 8: AI Insights Panel**
- 8.1 Insights display: Example test (verify insights render for all types)
- 8.2 Confidence levels: Property (all insights should show confidence level)
- 8.3 Explanation: Property (insights should show explanation and impact)
- 8.4 Click for details: Property (clicking insight should show detailed reasoning)
- 8.5 WOW features: Property (WOW features should be highlighted in panel)

**Requirement 9: WOW Features**
- 9.1 Visual highlighting: Property (WOW features should use distinctive styling)
- 9.2 Metric display: Property (WOW features should show metric, value, trend, impact)
- 9.3 Hover context: Property (hovering over WOW feature should show historical trend)

**Requirement 10: Navigation**
- 10.1 Nav bar display: Example test (verify nav bar renders with all sections)
- 10.2 Navigation: Property (clicking nav item should navigate to section)
- 10.3 Active highlighting: Property (active nav item should be highlighted)
- 10.4 Language consistency: Property (nav labels should use selected language)

**Requirement 11: Data Consistency**
- 11.1 Cache fallback: Property (failed API should use cached data if available)
- 11.2 Demo fallback: Property (failed API with no cache should use demo data)
- 11.3 Error message: Property (API failure should display error message and badge)
- 11.4 Auto-refresh: Property (when data source becomes available, should refresh)
- 11.5 Timestamp: Property (data should show last update timestamp)

**Requirement 12: Backward Compatibility**
- 12.1 API endpoints: Property (dashboard should use existing endpoints)
- 12.2 No API changes: No (backend requirement, not testable in dashboard)
- 12.3 Data structure compatibility: Property (dashboard should work with existing data structures)

### Property Reflection

After analyzing all criteria, I've identified redundancies:

- Language persistence (1.3) and theme persistence (2.3) are similar patterns → can be combined into one "Preference Persistence" property
- Light theme colors (2.4) and dark theme colors (2.5) are inverse operations → can be combined into one "Theme Color Consistency" property
- Demo data badge (7.4) and live data badge (7.5) are inverse operations → can be combined into one "Data Source Badge" property
- Positive trend (3.3) and negative trend (3.4) are inverse operations → can be combined into one "Trend Indicator" property

After consolidation, I have 28 unique testable properties covering all functional requirements.

## Correctness Properties

### Property 1: Language Persistence
*For any* selected language from the 8 supported languages, when a user selects it and navigates away, the dashboard should restore that language on the next visit.
**Validates: Requirements 1.2, 1.3**

### Property 2: Theme Persistence
*For any* theme selection (light or dark), when a user selects it and navigates away, the dashboard should restore that theme on the next visit.
**Validates: Requirements 2.2, 2.3**

### Property 3: Language Consistency Across Pages
*For any* selected language, when a user navigates between pages, all UI text should remain in the selected language.
**Validates: Requirements 1.5**

### Property 4: Indic Script Rendering
*For any* text in Hindi, Tamil, Telugu, Malayalam, Kannada, Gujarati, or Marathi, the dashboard should render all characters correctly using Noto Sans font.
**Validates: Requirements 1.4**

### Property 5: English Fallback for Missing Translations
*For any* missing translation in a supported language, the dashboard should display the English version of that text.
**Validates: Requirements 1.7**

### Property 6: Theme Color Consistency
*For any* component in the dashboard, when the theme changes, all colors should update to match the new theme (light or dark) without requiring a page reload.
**Validates: Requirements 2.2, 2.4, 2.5, 2.7**

### Property 7: CSS Variables Usage
*For any* component in the dashboard, all colors should be defined using CSS variables, not hard-coded color values.
**Validates: Requirements 2.6**

### Property 8: System Preference Detection
*For any* first-time user with no stored theme preference, the dashboard should detect and apply the system theme preference (prefers-color-scheme).
**Validates: Requirements 2.1, 2.8**

### Property 9: Hero KPI Display
*For any* overview page load, the dashboard should display exactly five hero KPI cards with values, labels, and trend indicators.
**Validates: Requirements 3.1, 3.2**

### Property 10: Trend Indicator Accuracy
*For any* metric with a trend, the dashboard should display the correct indicator (green up arrow for positive, red down arrow for negative, neutral for no change) with the correct percentage value.
**Validates: Requirements 3.3, 3.4**

### Property 11: State Breakdown Display
*For any* overview page load, the dashboard should display a state/region breakdown table with key metrics for each state.
**Validates: Requirements 3.5**

### Property 12: Activity Timeline Display
*For any* overview page load, the dashboard should display a "Today's Agent Activity" timeline with recent AI decisions and timestamps.
**Validates: Requirements 3.6**

### Property 13: Timeline Hover Details
*For any* timeline entry, when a user hovers over it, the dashboard should display additional details about the decision.
**Validates: Requirements 3.7**

### Property 14: Farmers Table Search
*For any* search query, the farmers table should filter results to only show farmers whose name or location contains the search query (case-insensitive).
**Validates: Requirements 4.2**

### Property 15: Farmer Detail Panel
*For any* farmer in the table, when clicked, the dashboard should display a detail panel with farmer profile, past decisions, and AI insights.
**Validates: Requirements 4.3, 4.4, 4.5**

### Property 16: Farmers Page Language Support
*For any* selected language, the farmers page should display all content in that language.
**Validates: Requirements 4.6**

### Property 17: Government View Charts
*For any* government view page load, the dashboard should display four charts: waste reduction by state, income uplift by state, adoption rate by state, and water savings by state.
**Validates: Requirements 5.1**

### Property 18: Trend Badges
*For any* metric in the government view, the dashboard should display a trend badge indicating whether the metric is improving or declining.
**Validates: Requirements 5.2**

### Property 19: Chart Hover Tooltips
*For any* chart data point, when a user hovers over it, the dashboard should display the exact value and percentage change.
**Validates: Requirements 5.3**

### Property 20: Government View Theme and Language
*For any* selected language and theme, the government view should display all content in that language and theme.
**Validates: Requirements 5.4**

### Property 21: System Health Metrics Display
*For any* system health page load, the dashboard should display metrics for agent latency, error rates, Bedrock API call volume, and EventBridge health status.
**Validates: Requirements 6.1**

### Property 22: Threshold-Based Status Badges
*For any* metric that exceeds a defined threshold, the dashboard should display a warning or error badge with appropriate color coding.
**Validates: Requirements 6.2, 6.3**

### Property 23: System Health Auto-Refresh
*For any* system health page, the dashboard should refresh metrics every 30 seconds to show current status.
**Validates: Requirements 6.4**

### Property 24: Data Service Source Determination
*For any* data request, the data service should correctly determine whether to use demo or live data based on environment configuration and API availability.
**Validates: Requirements 7.1, 7.2**

### Property 25: API Failure Fallback
*For any* failed live API call, the data service should automatically fall back to demo data and display a "Demo data" badge.
**Validates: Requirements 7.3, 7.4, 7.5**

### Property 26: Data Metadata Inclusion
*For any* data returned by the data service, it should include metadata indicating the source (demo or live) and timestamp.
**Validates: Requirements 7.6**

### Property 27: AI Insights Display
*For any* farmer, the AI Insights Panel should display insights for all relevant categories (crop protection, weather, storage, supply, water, quality) with confidence levels and explanations.
**Validates: Requirements 8.1, 8.2, 8.3**

### Property 28: WOW Features Highlighting
*For any* WOW feature displayed in the dashboard, it should use distinctive styling (badges, icons, callout cards) and show metric name, value, trend, and impact description.
**Validates: Requirements 9.1, 9.2, 9.3**

### Property 29: Navigation Structure
*For any* dashboard page, the left navigation bar should display all sections (Overview, Farmers, Processors, Agents, Government View, System Health) with the active item highlighted.
**Validates: Requirements 10.1, 10.2, 10.3**

### Property 30: Navigation Language Support
*For any* selected language, all navigation labels should display in that language.
**Validates: Requirements 10.4**

### Property 31: Data Cache Fallback
*For any* failed live API call with cached data available, the dashboard should display the cached data instead of demo data.
**Validates: Requirements 11.1, 11.2**

### Property 32: Data Timestamp Display
*For any* data displayed in the dashboard, it should show a timestamp indicating when the data was last updated.
**Validates: Requirements 11.5**

### Property 33: API Endpoint Compatibility
*For any* data request, the dashboard should use the same endpoints and request/response formats as the current system.
**Validates: Requirements 12.1, 12.3**

## Error Handling

### Language and Theme Errors
- If i18n initialization fails, display English with console warning
- If theme CSS variables fail to load, fall back to inline styles
- If localStorage is unavailable, use session storage or memory

### Data Service Errors
- If live API fails, log error and fall back to demo data
- If demo data is corrupted, display error message and disable that section
- If data parsing fails, display error message with retry button

### Component Errors
- Use error boundaries to catch component rendering errors
- Display user-friendly error messages
- Provide retry mechanisms for failed data loads

### API Errors
- Handle 4xx errors (validation, not found) with user-friendly messages
- Handle 5xx errors (server) with retry logic and fallback to demo data
- Handle network errors with offline indicator and demo data fallback

## Testing Strategy

### Unit Testing
- Test individual components with mocked data
- Test language switching with different languages
- Test theme switching with CSS variable verification
- Test data service with mocked API responses
- Test error boundaries and error handling
- Test localStorage persistence
- Test search and filter functionality
- Test data transformations and formatting

### Property-Based Testing
- **Property 1-2**: Language and theme persistence (round-trip: set → navigate → verify)
- **Property 3-8**: Language and theme consistency (for all languages/themes, verify behavior)
- **Property 9-13**: Overview page metrics (verify all KPIs render with correct data)
- **Property 14-16**: Farmers page functionality (search, detail panel, language support)
- **Property 17-20**: Government view (charts, trends, tooltips, language/theme)
- **Property 21-23**: System health (metrics display, thresholds, auto-refresh)
- **Property 24-26**: Data service abstraction (source determination, fallback, metadata)
- **Property 27-28**: AI insights and WOW features (display, highlighting, confidence)
- **Property 29-30**: Navigation (structure, language support)
- **Property 31-33**: Data consistency and compatibility (caching, timestamps, API compatibility)

### Test Configuration
- Minimum 100 iterations per property test
- Use fast-check or similar library for property generation
- Tag each test with: **Feature: analytics-dashboard-upgrade, Property {number}: {property_text}**
- Test with multiple languages and themes
- Test with demo and live data modes
- Test with various screen sizes (mobile, tablet, desktop)

### Integration Testing
- Test language switching with all pages
- Test theme switching with all components
- Test data service fallback scenarios
- Test navigation between pages
- Test data refresh and caching
- Test error scenarios and recovery

