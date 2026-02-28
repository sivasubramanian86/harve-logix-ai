# Implementation Plan: Analytics Dashboard Upgrade

## Overview

This implementation plan transforms the HarveLogixAI dashboard into an enterprise-grade analytics console. The approach follows an incremental strategy: establish the foundation (i18n and theming infrastructure), build the data abstraction layer, implement core pages and components, integrate AI insights, and finally wire everything together with comprehensive testing.

Each task builds on previous work, ensuring no orphaned code. Testing is integrated throughout to catch issues early. Optional test tasks are marked with "*" to allow for MVP-focused development.

## Tasks

- [x] 1. Set up i18n infrastructure and language support
  - [x] 1.1 Install react-i18next and i18next dependencies
    - Add react-i18next, i18next, i18next-browser-languagedetector to package.json
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [x] 1.2 Create i18n configuration and locale files
    - Create src/i18n/config.ts with i18next initialization
    - Create locale JSON files for all 8 languages (en, hi, ta, te, ml, kn, gu, mr)
    - Include all UI strings from requirements (navigation, labels, metrics, insights)
    - _Requirements: 1.1, 1.2, 1.6_
  
  - [x] 1.3 Create I18nProvider context component
    - Wrap app with I18nProvider at root level
    - Implement language persistence to localStorage
    - Provide useTranslation hook to all components
    - _Requirements: 1.2, 1.3_
  
  - [ ]* 1.4 Write property tests for language persistence
    - **Property 1: Language Persistence**
    - **Validates: Requirements 1.2, 1.3**
    - Test that selected language persists across page reloads
  
  - [ ]* 1.5 Write property tests for language consistency
    - **Property 3: Language Consistency Across Pages**
    - **Validates: Requirements 1.5**
    - Test that language remains consistent when navigating between pages

- [x] 2. Set up theme system with light/dark mode support
  - [x] 2.1 Create theme configuration and CSS variables
    - Create src/theme/themeConfig.ts with light and dark theme definitions
    - Define CSS variables for colors, spacing, typography
    - Create src/theme/variables.css with CSS variable declarations
    - _Requirements: 2.1, 2.4, 2.5, 2.6_
  
  - [x] 2.2 Create ThemeProvider context component
    - Implement theme state management with React Context
    - Detect system preference on first load (prefers-color-scheme)
    - Persist theme selection to localStorage
    - Update CSS variables when theme changes
    - _Requirements: 2.1, 2.2, 2.3, 2.8_
  
  - [x] 2.3 Add theme toggle button to Navbar
    - Create sun/moon icon toggle in Navbar component
    - Wire to ThemeProvider to switch themes
    - Ensure smooth transition without page reload
    - _Requirements: 2.2, 2.7_
  
  - [ ]* 2.4 Write property tests for theme persistence
    - **Property 2: Theme Persistence**
    - **Validates: Requirements 2.2, 2.3**
    - Test that selected theme persists across page reloads
  
  - [ ]* 2.5 Write property tests for theme consistency
    - **Property 6: Theme Color Consistency**
    - **Validates: Requirements 2.2, 2.4, 2.5, 2.7**
    - Test that all components update colors when theme changes

- [x] 3. Create data service abstraction layer
  - [x] 3.1 Create DataService interface and implementation
    - Create src/services/dataService.ts with DataService interface
    - Implement methods: getOverviewMetrics, getFarmers, getFarmerDetails, getGovernmentMetrics, getSystemHealth, getAiInsightsForFarmer
    - Add environment-based configuration for demo vs live mode
    - _Requirements: 7.1, 7.2_
  
  - [x] 3.2 Implement demo data fixtures
    - Create src/data/fixtures/ directory with demo data for all views
    - Create fixtures for overview metrics, farmers, government metrics, system health, AI insights
    - Ensure fixtures match data model interfaces
    - _Requirements: 7.1, 7.2_
  
  - [x] 3.3 Implement API failure fallback logic
    - Add try-catch to DataService methods
    - Implement fallback to demo data on API failure
    - Add error logging and user-friendly error messages
    - _Requirements: 7.3, 11.1, 11.2_
  
  - [x] 3.4 Create DataModeProvider context
    - Track current data mode (demo vs live) in context
    - Provide useDataMode hook to components
    - Update mode when fallback occurs
    - _Requirements: 7.1, 7.2_
  
  - [ ]* 3.5 Write property tests for data service
    - **Property 24: Data Service Source Determination**
    - **Validates: Requirements 7.1, 7.2**
    - Test that data service correctly determines source based on configuration
  
  - [ ]* 3.6 Write property tests for API fallback
    - **Property 25: API Failure Fallback**
    - **Validates: Requirements 7.3, 7.4, 7.5**
    - Test that failed API calls fall back to demo data with badge

- [x] 4. Create shared components with theme and i18n support
  - [x] 4.1 Create MetricCard component
    - Build reusable MetricCard with icon, label, value, trend, color
    - Use i18n keys for labels
    - Use CSS variables for colors
    - Support all theme variants
    - _Requirements: 3.2, 3.3, 3.4_
  
  - [x] 4.2 Create DataBadge component
    - Build DataBadge showing "Demo data" or "Live data"
    - Include timestamp of last update
    - Use appropriate colors for each mode
    - _Requirements: 7.4, 7.5, 11.5_
  
  - [x] 4.3 Create AiInsightsPanel component
    - Build panel displaying AI insights with confidence levels
    - Show insights for all 6 categories (crop protection, weather, storage, supply, water, quality)
    - Include explanation and impact for each insight
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [x] 4.4 Create WOW Features component
    - Build component highlighting waste reduction, income uplift, water saved, processor matches
    - Use distinctive styling (badges, icons, callout cards)
    - Show metric, value, trend, impact
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [ ]* 4.5 Write unit tests for shared components
    - Test MetricCard rendering with different props
    - Test DataBadge display for demo and live modes
    - Test AiInsightsPanel with various insights
    - Test WOW Features highlighting
    - _Requirements: 3.2, 7.4, 8.1, 9.1_

- [x] 5. Implement Overview page with hero KPIs
  - [x] 5.1 Create Overview page component structure
    - Create src/pages/OverviewUpgraded.jsx
    - Set up layout with hero KPIs section, state breakdown, activity timeline
    - Wire to DataService for metrics
    - _Requirements: 3.1, 3.5, 3.6_
  
  - [x] 5.2 Implement hero KPI cards
    - Display 5 hero KPI cards (farmers, processors, waste reduction, income uplift, water saved)
    - Use MetricCard component for each KPI
    - Display trend indicators (up/down/neutral) with correct colors
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [x] 5.3 Implement state/region breakdown table
    - Create table showing key metrics by state
    - Include columns for state, farmers, processors, waste reduction, income uplift
    - Support sorting and filtering
    - _Requirements: 3.5_
  
  - [x] 5.4 Implement Today's Agent Activity timeline
    - Create timeline component showing recent AI decisions
    - Display decision date, recommendation, outcome
    - Implement hover to show additional details
    - _Requirements: 3.6, 3.7_
  
  - [ ]* 5.5 Write property tests for Overview page
    - **Property 9: Hero KPI Display**
    - **Validates: Requirements 3.1, 3.2**
    - Test that exactly 5 KPI cards render with correct data
  
  - [ ]* 5.6 Write property tests for trend indicators
    - **Property 10: Trend Indicator Accuracy**
    - **Validates: Requirements 3.3, 3.4**
    - Test that positive/negative trends show correct indicators

- [x] 6. Implement Farmers page with search and details
  - [x] 6.1 Create Farmers page component
    - Create src/pages/FarmersUpgraded.jsx
    - Set up layout with search bar, farmers table, detail panel
    - Wire to DataService for farmer data
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [x] 6.2 Implement searchable farmers table
    - Create table with columns: name, location, crops, last decision, status
    - Implement real-time search filtering by name/location
    - Support pagination for large datasets
    - _Requirements: 4.1, 4.2_
  
  - [x] 6.3 Implement farmer detail panel
    - Create detail panel showing farmer profile, past decisions, AI insights
    - Display past decisions with dates, recommendations, outcomes
    - Show farmer-specific AI insights
    - _Requirements: 4.3, 4.4, 4.5_
  
  - [ ]* 6.4 Write property tests for search functionality
    - **Property 14: Farmers Table Search**
    - **Validates: Requirements 4.2**
    - Test that search filters farmers by name/location correctly
  
  - [ ]* 6.5 Write property tests for detail panel
    - **Property 15: Farmer Detail Panel**
    - **Validates: Requirements 4.3, 4.4, 4.5**
    - Test that detail panel displays all required information

- [x] 7. Implement Government View with analytics charts
  - [x] 7.1 Create Government View page component
    - Create src/pages/GovernmentViewUpgraded.jsx
    - Set up layout with 4 chart sections
    - Wire to DataService for government metrics
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [x] 7.2 Implement waste reduction by state chart
    - Create chart using Recharts showing waste reduction by state
    - Add trend badges for each state
    - Implement hover tooltips with exact values
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [x] 7.3 Implement income uplift by state chart
    - Create chart showing income uplift per acre by state
    - Add trend badges and hover tooltips
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [x] 7.4 Implement adoption rate and water savings charts
    - Create adoption rate by state chart
    - Create water savings by state chart
    - Add trend badges and hover tooltips to both
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [ ]* 7.5 Write property tests for charts
    - **Property 17: Government View Charts**
    - **Validates: Requirements 5.1**
    - Test that all 4 charts render with correct data

- [x] 8. Implement System Health monitoring page
  - [x] 8.1 Create System Health page component
    - Create src/pages/SystemHealthUpgraded.jsx
    - Set up layout with 4 metric cards
    - Wire to DataService for system health metrics
    - Implement 30-second auto-refresh
    - _Requirements: 6.1, 6.4_
  
  - [x] 8.2 Implement metric cards with status badges
    - Create cards for agent latency, error rates, Bedrock call volume, EventBridge status
    - Implement threshold-based status badges (success/warning/error)
    - Use appropriate colors for each status
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [ ]* 8.3 Write property tests for system health
    - **Property 21: System Health Metrics Display**
    - **Validates: Requirements 6.1**
    - Test that all metrics render with correct data

- [x] 9. Update Navbar with language switcher and theme toggle
  - [x] 9.1 Add language switcher dropdown to Navbar
    - Create dropdown with all 8 languages
    - Wire to I18nProvider to change language
    - Show current language selection
    - _Requirements: 1.2, 1.3_
  
  - [x] 9.2 Add theme toggle button to Navbar
    - Create sun/moon icon toggle button
    - Wire to ThemeProvider to switch themes
    - Show current theme selection
    - _Requirements: 2.2, 2.3_
  
  - [x] 9.3 Add DataBadge to Navbar
    - Display current data mode (Demo/Live) with timestamp
    - Update when data source changes
    - _Requirements: 7.4, 7.5_

- [x] 10. Update Sidebar navigation with i18n support
  - [x] 10.1 Refactor Sidebar with i18n keys
    - Update all navigation labels to use i18n keys
    - Ensure labels update when language changes
    - _Requirements: 10.1, 10.4_
  
  - [x] 10.2 Add new navigation items
    - Add Government View section
    - Add System Health section
    - Ensure all sections are properly routed
    - _Requirements: 10.1_

- [x] 11. Integrate AI Insights throughout dashboard
  - [x] 11.1 Add AiInsightsPanel to Farmers detail panel
    - Display farmer-specific insights in detail panel
    - Show all 6 insight categories
    - Include confidence levels and explanations
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [x] 11.2 Add WOW Features to Overview page
    - Display WOW features prominently on overview
    - Show waste reduction %, income uplift, water saved, processor matches
    - Use distinctive styling and icons
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [x] 11.3 Add WOW Features to Government View
    - Display WOW features in government view
    - Show regional impact metrics
    - _Requirements: 9.1, 9.2, 9.3_

- [x] 12. Implement data caching and error recovery
  - [x] 12.1 Add caching layer to DataService
    - Implement in-memory cache for API responses
    - Cache data with timestamp
    - Return cached data on API failure if available
    - _Requirements: 11.1, 11.2_
  
  - [x] 12.2 Implement error messages and recovery
    - Display user-friendly error messages on API failure
    - Show "Demo data" badge when using fallback
    - Implement retry button for failed requests
    - _Requirements: 11.3, 11.4_
  
  - [x] 12.3 Implement auto-refresh on recovery
    - Monitor API availability
    - Automatically refresh to live data when API recovers
    - Update data badges accordingly
    - _Requirements: 11.4_

- [x] 13. Ensure backward compatibility and API consistency
  - [x] 13.1 Verify API endpoint compatibility
    - Ensure all DataService methods use existing backend endpoints
    - Verify request/response formats match current system
    - Test with existing backend without modifications
    - _Requirements: 12.1, 12.3_
  
  - [x] 13.2 Test data structure compatibility
    - Verify all data models work with existing API responses
    - Handle any data transformation needed
    - Ensure no breaking changes to existing functionality
    - _Requirements: 12.3_

- [x] 14. Checkpoint - Ensure all core features work
  - Verify i18n switching works across all pages
  - Verify theme switching works across all components
  - Verify data service switches between demo and live correctly
  - Verify all pages render with correct data
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 15. Write comprehensive property-based tests
  - [ ]* 15.1 Write property tests for i18n
    - **Property 1: Language Persistence**
    - **Property 3: Language Consistency Across Pages**
    - **Property 4: Indic Script Rendering**
    - **Property 5: English Fallback for Missing Translations**
    - **Validates: Requirements 1.2, 1.3, 1.4, 1.5, 1.7**
  
  - [ ]* 15.2 Write property tests for theming
    - **Property 2: Theme Persistence**
    - **Property 6: Theme Color Consistency**
    - **Property 7: CSS Variables Usage**
    - **Property 8: System Preference Detection**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8**
  
  - [ ]* 15.3 Write property tests for data service
    - **Property 24: Data Service Source Determination**
    - **Property 25: API Failure Fallback**
    - **Property 26: Data Metadata Inclusion**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6**
  
  - [ ]* 15.4 Write property tests for pages and components
    - **Property 9: Hero KPI Display**
    - **Property 10: Trend Indicator Accuracy**
    - **Property 14: Farmers Table Search**
    - **Property 17: Government View Charts**
    - **Property 21: System Health Metrics Display**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 4.2, 5.1, 6.1**
  
  - [ ]* 15.5 Write property tests for AI insights and WOW features
    - **Property 27: AI Insights Display**
    - **Property 28: WOW Features Highlighting**
    - **Validates: Requirements 8.1, 8.2, 8.3, 9.1, 9.2, 9.3**

- [ ] 16. Write unit tests for edge cases and error scenarios
  - [ ]* 16.1 Write unit tests for i18n edge cases
    - Test missing translations
    - Test invalid language codes
    - Test localStorage unavailability
  
  - [ ]* 16.2 Write unit tests for theme edge cases
    - Test system preference detection
    - Test localStorage unavailability
    - Test CSS variable loading failures
  
  - [ ]* 16.3 Write unit tests for data service errors
    - Test API timeout scenarios
    - Test malformed API responses
    - Test network errors
    - Test cache corruption
  
  - [ ]* 16.4 Write unit tests for component errors
    - Test rendering with missing data
    - Test rendering with invalid data
    - Test error boundaries

- [ ] 17. Integration testing
  - [ ]* 17.1 Test language switching across all pages
    - Switch language and verify all pages update
    - Verify persistence across page navigation
  
  - [ ]* 17.2 Test theme switching across all components
    - Switch theme and verify all components update
    - Verify persistence across page navigation
  
  - [ ]* 17.3 Test data service fallback scenarios
    - Simulate API failures and verify fallback
    - Verify recovery when API becomes available
  
  - [ ]* 17.4 Test end-to-end user flows
    - Test complete user journey through dashboard
    - Test with different languages and themes
    - Test with demo and live data

- [ ] 18. Final checkpoint - Ensure all tests pass
  - Run all unit tests and verify passing
  - Run all property-based tests (100+ iterations each)
  - Run all integration tests
  - Verify no console errors or warnings
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 19. Documentation and code cleanup
  - [ ]* 19.1 Document new components and services
    - Add JSDoc comments to all new components
    - Document DataService interface and methods
    - Document i18n and theme setup
  
  - [ ]* 19.2 Update README with new features
    - Document language support
    - Document theme system
    - Document data service abstraction
  
  - [ ]* 19.3 Code cleanup and optimization
    - Remove unused code
    - Optimize component rendering
    - Ensure consistent code style

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints (14 and 18) ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- All components use i18n keys and CSS variables for flexibility
- DataService abstraction enables seamless demo/live switching
- No breaking changes to existing backend APIs
