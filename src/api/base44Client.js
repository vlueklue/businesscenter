// Mock base44 client - returns empty data for all operations
// This allows the UI to render without actual API calls
// Replace with Google services integration later

const createMockEntity = (entityName) => ({
  list: async (sort, limit) => {
    console.log(`Mock ${entityName}.list() called`);
    return [];
  },
  filter: async (filters, sort, limit) => {
    console.log(`Mock ${entityName}.filter() called`);
    return [];
  },
  create: async (data) => {
    console.log(`Mock ${entityName}.create() called with:`, data);
    return { id: Math.random().toString(36).substr(2, 9), ...data };
  },
  update: async (id, data) => {
    console.log(`Mock ${entityName}.update() called for id:`, id);
    return { id, ...data };
  },
  delete: async (id) => {
    console.log(`Mock ${entityName}.delete() called for id:`, id);
    return { success: true };
  },
  get: async (id) => {
    console.log(`Mock ${entityName}.get() called for id:`, id);
    return null;
  }
});

export const base44 = {
  entities: {
    User: createMockEntity('User'),
    Resource: createMockEntity('Resource'),
    DownloadEvent: createMockEntity('DownloadEvent'),
    Booking: createMockEntity('Booking'),
    ActivityEvent: createMockEntity('ActivityEvent'),
    Video: createMockEntity('Video'),
    Deal: createMockEntity('Deal'),
    Event: createMockEntity('Event'),
    Idea: createMockEntity('Idea'),
  }
};
