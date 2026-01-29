import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "693aebf32c384e4ad36dbe88", 
  requiresAuth: true // Ensure authentication is required for all operations
});
