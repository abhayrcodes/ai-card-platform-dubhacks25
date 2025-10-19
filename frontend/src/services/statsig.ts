import { StatsigClient } from '@statsig/js-client';

// Initialize Statsig client
let statsigClient: StatsigClient | null = null;
let isInitializing = false;

export const initializeStatsig = async (userId?: string) => {
  // Prevent multiple initializations
  if (statsigClient || isInitializing) {
    console.log('Statsig already initialized or initializing');
    return;
  }

  isInitializing = true;
  
  try {
    // Get Statsig client key from environment variables
    const clientKey = import.meta.env.VITE_STATSIG_CLIENT_KEY;
    
    statsigClient = new StatsigClient(clientKey, {
      userID: userId || 'anonymous',
      // Add any user properties you want to track
      custom: {
        platform: 'web',
        app_version: '0.0.1'
      }
    });

    await statsigClient.initializeAsync();
    console.log('Statsig initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Statsig:', error);
    statsigClient = null;
  } finally {
    isInitializing = false;
  }
};

// Event tracking functions
export const trackEvent = (eventName: string, metadata?: Record<string, any>) => {
  if (!statsigClient) {
    console.warn('Statsig not initialized, skipping event:', eventName);
    return;
  }

  try {
    statsigClient.logEvent(eventName, undefined, metadata);
    console.log(`✅ Tracked event: ${eventName}`, metadata);
    
    // Force flush events to ensure they're sent to Statsig servers
    // This is helpful for debugging - in production you might want to batch events
    setTimeout(() => {
      if (statsigClient) {
        statsigClient.flush();
        console.log(`📤 Flushed events to Statsig servers`);
      }
    }, 100);
  } catch (error) {
    console.error('❌ Failed to track event:', eventName, error);
  }
};

// Specific event tracking functions for your app
export const trackPageView = (pageName: string) => {
  trackEvent('page_view', { page: pageName });
};

export const trackCardCreationStarted = () => {
  trackEvent('card_creation_started');
};

export const trackCardGenerationCompleted = (success: boolean, cardName?: string) => {
  trackEvent('card_generation_completed', { 
    success,
    card_name: cardName 
  });
};

export const trackCardSavedToCollection = (cardName: string, cardId: string) => {
  trackEvent('card_saved_to_collection', { 
    card_name: cardName,
    card_id: cardId 
  });
};

export const trackCardCreationAbandoned = (step: string) => {
  trackEvent('card_creation_abandoned', { 
    abandonment_step: step 
  });
};

export const trackNavigationClick = (from: string, to: string) => {
  trackEvent('navigation_click', { 
    from_page: from,
    to_page: to 
  });
};

export const trackFormFieldCompleted = (fieldName: string) => {
  trackEvent('form_field_completed', { 
    field_name: fieldName 
  });
};

// Cleanup function
export const shutdownStatsig = () => {
  if (statsigClient) {
    statsigClient.shutdown();
    statsigClient = null;
  }
};
