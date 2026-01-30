// This is a neutral API client that mimics the Base44 SDK interface
// It currently uses localStorage for persistence to give you full control.
// You can later replace the internal implementation with Supabase or any other backend.

const MOCK_STORAGE_KEY = 'companyhub_mock_data';

const getInitialData = () => ({
    Event: [],
    Policy: [],
    Executive: [],
    Announcement: [],
    Ticket: [],
    TimeOffRequest: [],
    Attendance: [],
    Expense: [],
    Message: [],
    UserList: [
        { id: 'user_1', full_name: 'Demo User', email: 'user@example.com', role: 'admin', department: 'Software Engineering' },
        { id: 'user_2', full_name: 'Alice HR', email: 'alice@company.com', role: 'user', department: 'Human Resources' },
        { id: 'user_3', full_name: 'Bob Tech', email: 'bob@company.com', role: 'user', department: 'IT Support' },
        { id: 'user_4', full_name: 'Carol Sales', email: 'carol@company.com', role: 'user', department: 'Sales' }
    ],
    User: {
        id: 'user_1',
        full_name: 'Demo User',
        email: 'user@example.com',
        role: 'admin', // Set to 'admin' by default for development
        department: 'Software Engineering'
    }
});

const loadData = () => {
    const data = localStorage.getItem(MOCK_STORAGE_KEY);
    return data ? JSON.parse(data) : getInitialData();
};

const saveData = (data) => {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(data));
};

const createEntityService = (entityName) => ({
    list: async (params = {}) => {
        const data = loadData();
        let list = data[entityName] || [];

        // Simple filter implementation
        if (params.where) {
            list = list.filter(item => {
                return Object.entries(params.where).every(([key, value]) => item[key] === value);
            });
        }

        return list;
    },

    get: async (id) => {
        const data = loadData();
        return (data[entityName] || []).find(item => item.id === id);
    },

    create: async (payload) => {
        const data = loadData();
        const newItem = {
            ...payload,
            id: Math.random().toString(36).substr(2, 9),
            created_at: Date.now(),
            updated_at: Date.now()
        };
        data[entityName] = [...(data[entityName] || []), newItem];
        saveData(data);
        return newItem;
    },

    update: async (id, payload) => {
        const data = loadData();
        const list = data[entityName] || [];
        const index = list.findIndex(item => item.id === id);
        if (index === -1) throw new Error(`${entityName} not found`);

        const updatedItem = {
            ...list[index],
            ...payload,
            updated_at: Date.now()
        };

        list[index] = updatedItem;
        data[entityName] = list;
        saveData(data);
        return updatedItem;
    },

    delete: async (id) => {
        const data = loadData();
        data[entityName] = (data[entityName] || []).filter(item => item.id !== id);
        saveData(data);
        return { success: true };
    }
});

export const apiClient = {
    entities: {
        Event: createEntityService('Event'),
        Policy: createEntityService('Policy'),
        Executive: createEntityService('Executive'),
        Announcement: createEntityService('Announcement'),
        Ticket: createEntityService('Ticket'),
        TimeOffRequest: createEntityService('TimeOffRequest'),
        Attendance: createEntityService('Attendance'),
        Expense: createEntityService('Expense'),
        Message: createEntityService('Message'),
        User: createEntityService('UserList'),
    },
    auth: {
        me: async () => {
            const data = loadData();
            if (!data.User) return null;
            return data.User;
        },
        login: async (email, password) => {
            const data = loadData();
            data.User = getInitialData().User;
            saveData(data);
            return data.User;
        },
        logout: async () => {
            const data = loadData();
            data.User = null;
            saveData(data);
        }
    },
    integrations: {
        Core: {
            InvokeLLM: async (prompt) => {
                console.log("Mock LLM Invoke:", prompt);
                return { response: "This is a mock response from the neutral API layer." };
            },
            SendEmail: async (data) => {
                console.log("Mock Email Send:", data);
                return { success: true };
            },
            UploadFile: async (file) => {
                console.log("Mock File Upload:", file.name);
                return { url: URL.createObjectURL(file) };
            },
            GenerateImage: async (prompt) => {
                console.log("Mock Image Generate:", prompt);
                return { url: "https://via.placeholder.com/512" };
            },
            ExtractDataFromUploadedFile: async (file) => {
                console.log("Mock Data Extraction from file:", file.name);
                return { data: {} };
            },
            CreateFileSignedUrl: async (path) => {
                return { url: path };
            },
            UploadPrivateFile: async (file) => {
                console.log("Mock Private File Upload:", file.name);
                return { url: URL.createObjectURL(file) };
            }
        }
    }
};
