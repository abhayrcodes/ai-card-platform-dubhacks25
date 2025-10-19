# Statsig Event Tracking Implementation

## Overview
This implementation adds basic event tracking to the AI Trading Cards application using Statsig. It tracks key user interactions to provide insights into user behavior and conversion funnel performance.

## Events Being Tracked

### 1. Page Views
- **Event**: `page_view`
- **Metadata**: `{ page: string }`
- **Triggered**: Automatically on route changes
- **Purpose**: Track which pages users visit most

### 2. Card Creation Started
- **Event**: `card_creation_started`
- **Triggered**: When user first interacts with any form field on create card page
- **Purpose**: Track how many users begin the card creation process

### 3. Form Field Completion
- **Event**: `form_field_completed`
- **Metadata**: `{ field_name: string }`
- **Triggered**: When user completes any form field (name, artist, venue, date)
- **Purpose**: Track which fields users complete and identify drop-off points

### 4. Card Generation Completed
- **Event**: `card_generation_completed`
- **Metadata**: `{ success: boolean, card_name?: string }`
- **Triggered**: After AI card generation attempt (success or failure)
- **Purpose**: Track success rate of card generation and identify issues

### 5. Card Saved to Collection
- **Event**: `card_saved_to_collection`
- **Metadata**: `{ card_name: string, card_id: string }`
- **Triggered**: When user successfully saves generated card to their collection
- **Purpose**: Track final conversion - completed card creation flow

### 6. Navigation Clicks
- **Event**: `navigation_click`
- **Metadata**: `{ from_page: string, to_page: string }`
- **Triggered**: When user clicks navigation links
- **Purpose**: Track user navigation patterns

## Setup Instructions

### 1. Get Statsig Client Key
1. Sign up at [https://console.statsig.com/](https://console.statsig.com/)
2. Create a new project
3. Get your Client-Side SDK Key from the project settings
4. Replace `'client-YOUR_STATSIG_CLIENT_KEY_HERE'` in `src/services/statsig.ts`

### 2. Configuration
The Statsig client is configured with:
- User ID (anonymous by default, can be updated when user logs in)
- Platform: 'web'
- App version: '0.0.1'

### 3. Files Modified
- `src/services/statsig.ts` - Statsig service and event tracking functions
- `src/App.tsx` - Statsig initialization and page view tracking
- `src/routes/CreateCard.tsx` - Card creation flow event tracking
- `src/components/TopNav.tsx` - Navigation click tracking

## Key Metrics to Monitor

### Conversion Funnel
1. **Page Views** → Create Card page visits
2. **Card Creation Started** → Users who begin form
3. **Form Field Completion** → Field completion rates
4. **Card Generation Completed** → AI generation success rate
5. **Card Saved to Collection** → Final conversion

### Drop-off Analysis
- Compare `card_creation_started` vs `card_generation_completed`
- Compare `card_generation_completed` vs `card_saved_to_collection`
- Analyze which form fields have lowest completion rates

### User Behavior
- Most visited pages
- Navigation patterns
- Time between events (can be added with timestamps)

## Next Steps for Enhancement

1. **User Identification**: Update user ID when users log in
2. **A/B Testing**: Use Statsig feature gates for UI experiments
3. **Error Tracking**: Add more detailed error event tracking
4. **Performance Metrics**: Track loading times and API response times
5. **Abandonment Tracking**: Add `card_creation_abandoned` events with specific steps

## Testing
Events will be logged to the browser console for debugging. Check the Statsig dashboard for event data after implementation.
