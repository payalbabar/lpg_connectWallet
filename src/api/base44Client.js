import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import { mockBase44 } from './mockBase44';
import { mockData } from './mockData';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

// Initialize mock data
const isMock = appId === 'test-app-id' || !appId;

if (isMock) {
  mockData.initialize();
}

// Only initialize the real client if not in mock mode to avoid 500 errors in console
const realClient = isMock ? null : createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: '',
  requiresAuth: false,
  appBaseUrl
});

console.log('Base44 Client Initialized with App ID:', appId, 'Using Mock:', isMock);
export const base44 = isMock ? mockBase44 : realClient;

