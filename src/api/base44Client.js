import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "693aecf585525968f0a5f49c", 
  requiresAuth: true // Ensure authentication is required for all operations
});
