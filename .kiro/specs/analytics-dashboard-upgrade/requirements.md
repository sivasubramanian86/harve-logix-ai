# Requirements Document: Analytics Dashboard Upgrade

## Introduction

The HarveLogixAI dashboard is being upgraded from a basic interface to an enterprise-grade analytics console serving both farmers and government officials. This upgrade introduces multi-language support (8 Indian languages), light/dark theming, comprehensive metrics visualization, AI-powered insights, and a flexible data abstraction layer supporting both demo and live data modes.

## Glossary

- **Dashboard**: The React-based web interface for HarveLogixAI
- **i18n**: Internationalization - the process of adapting software for multiple languages
- **Theme**: A collection of design tokens (colors, spacing, typography) defining visual appearance
- **Hero KPIs**: Key Performance Indicators prominently displayed on the overview page
- **Data Service**: Abstraction layer providing metrics and insights data
- **Demo Data**: Fixture data used for demonstration and fallback scenarios
- **Live Data**: Real data from backend APIs and AI systems
- **AI Insights**: Contextual recommendations and analysis from the Bedrock AI system
- **WOW Features**: Visually highlighted metrics showing system impact (waste reduction, income uplift, water savings)
- **System Health**: Monitoring metrics for agent performance and infrastructure
- **Farmer**: End user who uses the system for agricultural decisions
- **Government Official**: User who monitors regional/state-level agricultural metrics
- **Processor**: Agricultural commodity processor in the supply chain

## Requirements

### Requirement 1: Multi-Language Support

**User Story:** As a farmer or government official in India, I want the dashboard to be available in my native language, so that I can understand and use the system effectively without language barriers.

#### Acceptance Criteria

1. WHEN the dashboard loads for the first time, THE Dashboard SHALL display content in English by default
2. WHEN a user selects a language from the language switcher, THE Dashboard SHALL display all UI text in the selected language
3. WHEN a user selects a language, THE Dashboard SHALL persist the selection to localStorage and restore it on subsequent visits
4. WHEN the dashboard displays text in Hindi, Tamil, Telugu, Malayalam, Kannada, Gujarati, or Marathi, THE Dashboard SHALL render all Indian script characters correctly using Noto Sans font
5. WHEN a user navigates between pages, THE Dashboard SHALL maintain the selected language across all pages
6. WHEN new content is added to the dashboard, THE Dashboard SHALL require translations for all 8 supported languages before deployment
7. WHERE a translation is missing for a language, THE Dashboard SHALL fall back to English for that specific text

### Requirement 2: Light and Dark Theme Support

**User Story:** As a user, I want to choose between light and dark themes, so that I can use the dashboard comfortably in different lighting conditions and according to my preference.

#### Acceptance Criteria

1. WHEN the dashboard loads for the first time, THE Dashboard SHALL detect the system theme preference (light or dark) and apply it automatically
2. WHEN a user clicks the theme toggle button, THE Dashboard SHALL switch between light and dark themes smoothly
3. WHEN a user switches themes, THE Dashboard SHALL persist the selection to localStorage and restore it on subsequent visits
4. WHEN the dashboard is in light theme, THE Dashboard SHALL apply light background colors, dark text, and appropriate contrast ratios for readability
5. WHEN the dashboard is in dark theme, THE Dashboard SHALL apply dark background colors, light text, and appropriate contrast ratios for readability
6. WHEN a component is rendered, THE Component SHALL use CSS variables for all colors, spacing, and typography instead of hard-coded values
7. WHEN the theme changes, THE Dashboard SHALL update all components immediately without requiring a page reload
8. WHEN a user has not set a theme preference, THE Dashboard SHALL respect the system preference (prefers-color-scheme media query)

### Requirement 3: Overview Page with Hero KPIs

**User Story:** As a government official, I want to see key performance indicators at a glance, so that I can quickly understand the system's impact and performance.

#### Acceptance Criteria

1. WHEN the Overview page loads, THE Dashboard SHALL display five hero KPI cards showing: farmers onboarded, processors connected, waste reduction (₹), income uplift (₹/acre), and water saved (litres)
2. WHEN a hero KPI is displayed, THE Dashboard SHALL show the metric value, a descriptive label, and a trend indicator (up/down/neutral)
3. WHEN a hero KPI has a positive trend, THE Dashboard SHALL display a green up arrow and positive percentage change
4. WHEN a hero KPI has a negative trend, THE Dashboard SHALL display a red down arrow and negative percentage change
5. WHEN the Overview page loads, THE Dashboard SHALL display a state/region breakdown showing key metrics for each state
6. WHEN the Overview page loads, THE Dashboard SHALL display a "Today's Agent Activity" timeline showing recent AI decisions with timestamps and outcomes
7. WHEN a user hovers over a timeline entry, THE Dashboard SHALL display additional details about the decision

### Requirement 4: Farmers Page with Searchable Table and Details

**User Story:** As a government official, I want to view all farmers in the system with their details and past decisions, so that I can monitor adoption and understand individual farmer outcomes.

#### Acceptance Criteria

1. WHEN the Farmers page loads, THE Dashboard SHALL display a table of all farmers with columns: name, location, crops, last decision date, and status
2. WHEN a user types in the search field, THE Dashboard SHALL filter the farmers table by name or location in real-time
3. WHEN a user clicks on a farmer row, THE Dashboard SHALL display a detail panel showing: farmer profile, past AI decisions, decision outcomes, and AI insights
4. WHEN a detail panel is displayed, THE Dashboard SHALL show a list of past decisions with dates, recommendations, and outcomes
5. WHEN a detail panel is displayed, THE Dashboard SHALL show AI insights specific to that farmer including crop protection, weather-aware harvesting, and storage risk recommendations
6. WHEN the Farmers page loads, THE Dashboard SHALL display the data in the selected language

### Requirement 5: Government View with Analytics Charts

**User Story:** As a government official, I want to see regional analytics and trends, so that I can monitor agricultural impact across states and make informed policy decisions.

#### Acceptance Criteria

1. WHEN the Government View page loads, THE Dashboard SHALL display charts showing: waste reduction by state, income uplift by state, adoption rate by state, and water savings by state
2. WHEN a chart is displayed, THE Dashboard SHALL show trend badges indicating whether each metric is improving or declining
3. WHEN a user hovers over a chart data point, THE Dashboard SHALL display the exact value and percentage change
4. WHEN the Government View page loads, THE Dashboard SHALL display all metrics in the selected language and theme

### Requirement 6: System Health Monitoring

**User Story:** As a system administrator, I want to monitor the health and performance of the AI system, so that I can identify and resolve issues quickly.

#### Acceptance Criteria

1. WHEN the System Health page loads, THE Dashboard SHALL display metrics for: agent latency (ms), error rates (%), Bedrock API call volume, and EventBridge health status
2. WHEN a metric exceeds a threshold, THE Dashboard SHALL display a warning or error badge with appropriate color coding
3. WHEN a metric is within normal range, THE Dashboard SHALL display a success badge with green color
4. WHEN the System Health page loads, THE Dashboard SHALL refresh metrics every 30 seconds to show current status

### Requirement 7: Data Service Abstraction Layer

**User Story:** As a developer, I want a flexible data service that can switch between demo and live data, so that I can develop and test features without depending on live APIs.

#### Acceptance Criteria

1. WHEN the dashboard initializes, THE Data_Service SHALL determine whether to use demo or live data based on environment configuration
2. WHEN a component requests metrics data, THE Data_Service SHALL return data from the appropriate source (demo or live)
3. IF a live API call fails, THE Data_Service SHALL automatically fall back to demo data and display a "Demo data" badge
4. WHEN demo data is being used, THE Dashboard SHALL display a "Demo data" badge in the UI
5. WHEN live data is being used, THE Dashboard SHALL display a "Live data" badge in the UI
6. WHEN the Data_Service provides data, THE Data_Service SHALL include metadata indicating the data source and timestamp

### Requirement 8: AI Insights Panel Component

**User Story:** As a farmer or government official, I want to see AI-powered insights and recommendations, so that I can understand the reasoning behind system suggestions and make better decisions.

#### Acceptance Criteria

1. WHEN the AI Insights Panel is displayed, THE Dashboard SHALL show insights for: crop protection, weather-aware harvesting, storage risk, supply/demand matching, water optimization, and quality premiums
2. WHEN an insight is displayed, THE Dashboard SHALL show a confidence level (high/medium/low) indicating the reliability of the recommendation
3. WHEN an insight is displayed, THE Dashboard SHALL show a brief explanation of the recommendation and its potential impact
4. WHEN a user clicks on an insight, THE Dashboard SHALL display detailed reasoning and supporting data
5. WHEN the AI Insights Panel is displayed, THE Dashboard SHALL highlight WOW features showing: waste reduction %, income uplift, water saved, and processor matches

### Requirement 9: WOW Features Highlighting

**User Story:** As a user, I want to see the most impactful metrics highlighted throughout the dashboard, so that I can quickly understand the system's value and impact.

#### Acceptance Criteria

1. WHEN the dashboard displays metrics, THE Dashboard SHALL visually highlight WOW features using badges, icons, and callout cards
2. WHEN a WOW feature is displayed, THE Dashboard SHALL show: metric name, current value, trend, and impact description
3. WHEN a WOW feature card is displayed, THE Dashboard SHALL use distinctive colors and icons to draw attention
4. WHEN a user hovers over a WOW feature, THE Dashboard SHALL display additional context and historical trend

### Requirement 10: Navigation Structure

**User Story:** As a user, I want clear navigation to all dashboard sections, so that I can easily access the information I need.

#### Acceptance Criteria

1. WHEN the dashboard loads, THE Dashboard SHALL display a left navigation bar with sections: Overview, Farmers, Processors, Agents, Government View, and System Health
2. WHEN a user clicks a navigation item, THE Dashboard SHALL navigate to that section and highlight the active item
3. WHEN the dashboard displays navigation, THE Navigation SHALL maintain the selected language and theme across all sections
4. WHEN the dashboard displays navigation, THE Navigation SHALL display all labels in the selected language

### Requirement 11: Data Consistency and Fallback

**User Story:** As a system operator, I want the dashboard to gracefully handle API failures and data unavailability, so that the system remains usable even when some data sources are temporarily unavailable.

#### Acceptance Criteria

1. WHEN a live API call fails, THE Dashboard SHALL display the last cached data if available
2. WHEN a live API call fails and no cache exists, THE Dashboard SHALL fall back to demo data
3. WHEN demo data is being displayed due to API failure, THE Dashboard SHALL display an error message and "Demo data" badge
4. WHEN a data source becomes available again, THE Dashboard SHALL automatically refresh and display live data
5. WHEN the dashboard displays data, THE Dashboard SHALL show a timestamp indicating when the data was last updated

### Requirement 12: Backward Compatibility

**User Story:** As a backend developer, I want the dashboard upgrade to not break existing APIs, so that I can continue operating the system without disruption.

#### Acceptance Criteria

1. WHEN the dashboard makes API calls, THE Dashboard SHALL use the same endpoints and request/response formats as the current system
2. WHEN the dashboard initializes, THE Dashboard SHALL not require any changes to existing backend APIs
3. WHEN the dashboard displays data, THE Dashboard SHALL maintain compatibility with existing data structures
