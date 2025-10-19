# Statsig Integration Troubleshooting Guide

## Current Status
✅ **Statsig SDK installed** - @statsig/js-client  
✅ **Events being tracked** - Console shows "✅ Tracked event: page_view"  
✅ **Client initializing** - Console shows "Statsig initialized successfully"  
❌ **Events not appearing in dashboard** - Need to debug

## Common Issues & Solutions

### 1. Invalid Client Key
**Symptoms**: Events tracked locally but not appearing in Statsig dashboard
**Solution**: 
- Verify your client key in `src/services/statsig.ts`
- Get the correct key from [Statsig Console](https://console.statsig.com/) → Project Settings → Keys & Environments
- Make sure you're using the **Client-Side SDK Key**, not the Server Secret Key

### 2. Network/CORS Issues
**Check**: Open browser DevTools → Network tab → Look for failed requests to Statsig servers
**Solution**: Statsig should handle CORS automatically, but check for any blocked requests

### 3. Environment/Project Mismatch
**Check**: Ensure you're looking at the correct project and environment in Statsig dashboard
**Solution**: 
- Verify project name matches what you expect
- Check if you're in the right environment (Development/Staging/Production)

### 4. Event Batching Delay
**Issue**: Statsig batches events and may not show them immediately
**Solution**: 
- Wait 5-10 minutes for events to appear
- We've added `flush()` calls to force immediate sending
- Check console for "📤 Flushed events to Statsig servers" messages

## Debugging Steps

### Step 1: Verify Console Output
Open browser DevTools → Console and look for:
```
✅ Tracked event: page_view {page: "landing"}
📤 Flushed events to Statsig servers
```

### Step 2: Check Network Requests
1. Open DevTools → Network tab
2. Filter by "statsig" or "api"
3. Navigate around the app to trigger events
4. Look for POST requests to Statsig endpoints
5. Check if requests are successful (200 status)

### Step 3: Verify Client Key Format
Your client key should look like: `client-abcd1234efgh5678ijkl9012mnop3456qrst7890`
- Must start with `client-`
- Should be exactly 52 characters total

### Step 4: Test with Simple Event
Add this to browser console to test:
```javascript
// Test if Statsig is working
window.testStatsig = () => {
  const { trackEvent } = window;
  trackEvent('test_event', { test: true });
};
```

### Step 5: Check Statsig Dashboard
1. Go to [Statsig Console](https://console.statsig.com/)
2. Navigate to Metrics → Events
3. Look for your events: `page_view`, `card_creation_started`, etc.
4. Try different time ranges (last hour, last day)

## Current Events Being Tracked

| Event Name | Trigger | Metadata |
|------------|---------|----------|
| `page_view` | Route changes | `{page: string}` |
| `card_creation_started` | First form interaction | None |
| `form_field_completed` | Form field completion | `{field_name: string}` |
| `card_generation_completed` | AI generation result | `{success: boolean, card_name?: string}` |
| `card_saved_to_collection` | Card saved successfully | `{card_name: string, card_id: string}` |
| `navigation_click` | Navigation link clicks | `{from_page: string, to_page: string}` |

## Testing Checklist

- [ ] Replace placeholder client key with real key
- [ ] Check browser console for event tracking messages
- [ ] Check Network tab for Statsig API calls
- [ ] Wait 5-10 minutes for events to appear in dashboard
- [ ] Verify correct project/environment in Statsig console
- [ ] Test with multiple different events (navigation, form interactions)

## If Events Still Don't Appear

1. **Double-check the client key** - This is the most common issue
2. **Try a different browser** - Rule out browser-specific issues
3. **Check Statsig status** - Visit [Statsig Status Page](https://status.statsig.com/)
4. **Contact Statsig support** - They can help debug server-side issues

## Production Considerations

Once working, consider these optimizations:
- Remove the automatic `flush()` calls (let Statsig batch events naturally)
- Add error boundaries around tracking calls
- Implement retry logic for failed events
- Add user identification when users log in
