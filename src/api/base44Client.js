import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import { mockBase44 } from './mockBase44';
import { mockData } from './mockData';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

// Initialize mock data
if (appId === 'test-app-id' || !appId) {
  mockData.initialize();
}

//Create a client with authentication required
const realClient = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: '',
  requiresAuth: false,
  appBaseUrl
});

console.log('Base44 Client Initialized with App ID:', appId, 'Using Mock:', (appId === 'test-app-id' || !appId));
export const base44 = (appId === 'test-app-id' || !appId) ? mockBase44 : realClient;

