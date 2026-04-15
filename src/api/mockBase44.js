import { mockData } from './mockData';

export const mockBase44 = {
  entities: {
    Booking: {
      list: async (sortBy, limit) => {
        let items = [...mockData.bookings.list()];
        if (sortBy === '-created_date') {
          items.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        }
        return items.slice(0, limit || 20);
      },
      create: async (data) => mockData.bookings.create(data),
      update: async (id, data) => mockData.bookings.update(id, data),
      filter: async (query) => mockData.bookings.filter(query),
    },
    SupplyChainBlock: {
      list: async (sortBy, limit) => {
        let items = [...mockData.blocks.list()];
        if (sortBy === '-created_date') {
          items.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        }
        return items.slice(0, limit || 20);
      },
      create: async (data) => mockData.blocks.create(data),
      filter: async (query) => mockData.blocks.filter(query),
    },
    Subsidy: {
      list: async (sortBy, limit) => {
        let items = [...mockData.subsidies.list()];
        if (sortBy === '-created_date') {
          items.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        }
        return items.slice(0, limit || 20);
      },
      create: async (data) => mockData.subsidies.create(data),
    }
  },
  auth: {
    me: async () => ({ id: 'mock-user-1', name: 'Demo User', email: 'demo@gaschain.com' }),
    logout: () => { localStorage.clear(); window.location.reload(); },
    redirectToLogin: () => console.log('Mock login redirect'),
  }
};
