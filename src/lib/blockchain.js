// Simple blockchain hash utility for immutable ledger
export function generateHash(data) {
  const str = JSON.stringify(data) + Date.now() + Math.random();
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const suffix = Math.random().toString(16).slice(2, 50);
  return `0x${hex}${suffix}`;
}

export function generateBlockHash(previousHash, eventData, nonce = 0) {
  const blockData = `${previousHash}${JSON.stringify(eventData)}${nonce}${Date.now()}`;
  let hash = 0;
  for (let i = 0; i < blockData.length; i++) {
    hash = ((hash << 5) - hash) + blockData.charCodeAt(i);
    hash = hash & hash;
  }
  const hex = Math.abs(hash).toString(16).padStart(16, '0');
  const extra = Math.random().toString(16).slice(2, 50);
  return `0x${hex}${extra}`;
}

export function generateBookingId() {
  const prefix = 'LPG';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export const CYLINDER_PRICES = {
  '14.2kg_domestic': 903,
  '19kg_commercial': 1850,
  '5kg_portable': 435,
  '47.5kg_industrial': 3650,
};

export const CYLINDER_LABELS = {
  '14.2kg_domestic': '14.2 KG Domestic',
  '19kg_commercial': '19 KG Commercial',
  '5kg_portable': '5 KG Portable',
  '47.5kg_industrial': '47.5 KG Industrial',
};

export const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  dispatched: 'bg-indigo-100 text-indigo-800',
  in_transit: 'bg-purple-100 text-purple-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
};

export const EVENT_LABELS = {
  booking_created: 'Booking Created',
  payment_verified: 'Payment Verified',
  cylinder_assigned: 'Cylinder Assigned',
  quality_check: 'Quality Check Passed',
  dispatched: 'Dispatched from Warehouse',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  subsidy_credited: 'Subsidy Credited',
};
