import { generateHash, generateBlockHash, generateBookingId } from "@/lib/blockchain";

const STORAGE_KEYS = {
  BOOKINGS: 'gaschain_mock_bookings_v2',
  BLOCKS: 'gaschain_mock_blocks_v2',
  SUBSIDIES: 'gaschain_mock_subsidies_v2'
};

const getStorage = (key, defaultValue = []) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const setStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const mockData = {
  bookings: {
    list: () => getStorage(STORAGE_KEYS.BOOKINGS),
    create: (data) => {
      const bookings = getStorage(STORAGE_KEYS.BOOKINGS);
      const newBooking = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString(),
      };
      bookings.unshift(newBooking);
      setStorage(STORAGE_KEYS.BOOKINGS, bookings);
      return newBooking;
    },
    update: (id, updates) => {
      const bookings = getStorage(STORAGE_KEYS.BOOKINGS);
      const index = bookings.findIndex(b => b.id === id);
      if (index !== -1) {
        bookings[index] = { ...bookings[index], ...updates, updated_date: new Date().toISOString() };
        setStorage(STORAGE_KEYS.BOOKINGS, bookings);
        return bookings[index];
      }
      return null;
    },
    filter: (query) => {
      const bookings = getStorage(STORAGE_KEYS.BOOKINGS);
      return bookings.filter(b => Object.entries(query).every(([k, v]) => b[k] === v));
    }
  },
  blocks: {
    list: () => getStorage(STORAGE_KEYS.BLOCKS),
    create: (data) => {
      const blocks = getStorage(STORAGE_KEYS.BLOCKS);
      const newBlock = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        created_date: new Date().toISOString(),
      };
      blocks.unshift(newBlock);
      setStorage(STORAGE_KEYS.BLOCKS, blocks);
      return newBlock;
    },
    filter: (query) => {
      const blocks = getStorage(STORAGE_KEYS.BLOCKS);
      return blocks.filter(b => Object.entries(query).every(([k, v]) => b[k] === v));
    }
  },
  subsidies: {
    list: () => getStorage(STORAGE_KEYS.SUBSIDIES),
    create: (data) => {
      const subsidies = getStorage(STORAGE_KEYS.SUBSIDIES);
      const newSubsidy = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        created_date: new Date().toISOString(),
      };
      subsidies.unshift(newSubsidy);
      setStorage(STORAGE_KEYS.SUBSIDIES, subsidies);
      return newSubsidy;
    }
  },
  initialize: () => {
    // Add some initial data if empty
    if (getStorage(STORAGE_KEYS.BOOKINGS).length === 0) {
      const bId = generateBookingId();
      const bHash = generateHash({ bookingId: bId });

      // --- Delivered booking ---
      const deliveredBooking = {
        id: '1',
        booking_id: bId,
        customer_name: 'John Doe',
        customer_phone: '9876543210',
        customer_address: '123 Gas Lane, Energy City, Maharashtra',
        cylinder_type: '14.2kg_domestic',
        quantity: 1,
        status: 'delivered',
        payment_method: 'online',
        total_amount: 903,
        subsidy_applied: 200,
        final_amount: 703,
        block_hash: bHash,
        created_date: new Date(Date.now() - 3600000).toISOString(),
        updated_date: new Date().toISOString(),
      };

      // --- Active order 1: PENDING ---
      const bId2 = generateBookingId();
      const bHash2 = generateHash({ bookingId: bId2 });
      const pendingBooking = {
        id: '2',
        booking_id: bId2,
        customer_name: 'Priya Sharma',
        customer_phone: '9123456780',
        customer_address: 'Flat 204, Rose Apts, Andheri West, Mumbai, Maharashtra - 400058',
        cylinder_type: '14.2kg_domestic',
        quantity: 2,
        status: 'pending',
        payment_method: 'freighter',
        total_amount: 1806,
        subsidy_applied: 400,
        final_amount: 1406,
        block_hash: bHash2,
        metadata: JSON.stringify({ network: "Stellar Testnet", priceXLM: "140.6" }),
        created_date: new Date(Date.now() - 300000).toISOString(),
        updated_date: new Date(Date.now() - 300000).toISOString(),
      };

      // --- Active order 2: CONFIRMED ---
      const bId3 = generateBookingId();
      const bHash3 = generateHash({ bookingId: bId3 });
      const confirmedBooking = {
        id: '3',
        booking_id: bId3,
        customer_name: 'Rahul Verma',
        customer_phone: '9988776655',
        customer_address: 'B-12, Sector 62, Noida, Uttar Pradesh - 201301',
        cylinder_type: '19kg_commercial',
        quantity: 1,
        status: 'confirmed',
        payment_method: 'online',
        total_amount: 1850,
        subsidy_applied: 0,
        final_amount: 1850,
        block_hash: bHash3,
        distributor_name: 'GasChain Central Depot',
        created_date: new Date(Date.now() - 1800000).toISOString(),
        updated_date: new Date(Date.now() - 900000).toISOString(),
      };

      // --- Active order 3: DISPATCHED ---
      const bId4 = generateBookingId();
      const bHash4 = generateHash({ bookingId: bId4 });
      const dispatchedBooking = {
        id: '4',
        booking_id: bId4,
        customer_name: 'Anita Desai',
        customer_phone: '8877665544',
        customer_address: '45, MG Road, Indiranagar, Bengaluru, Karnataka - 560038',
        cylinder_type: '5kg_portable',
        quantity: 3,
        status: 'dispatched',
        payment_method: 'online',
        total_amount: 1305,
        subsidy_applied: 0,
        final_amount: 1305,
        block_hash: bHash4,
        distributor_name: 'South Zone Distributor',
        created_date: new Date(Date.now() - 5400000).toISOString(),
        updated_date: new Date(Date.now() - 1200000).toISOString(),
      };

      // --- Active order 4: IN TRANSIT ---
      const bId5 = generateBookingId();
      const bHash5 = generateHash({ bookingId: bId5 });
      const inTransitBooking = {
        id: '5',
        booking_id: bId5,
        customer_name: 'Vikram Patel',
        customer_phone: '7766554433',
        customer_address: '21, SG Highway, Bodakdev, Ahmedabad, Gujarat - 380054',
        cylinder_type: '47.5kg_industrial',
        quantity: 1,
        status: 'in_transit',
        payment_method: 'freighter',
        total_amount: 3650,
        subsidy_applied: 0,
        final_amount: 3650,
        block_hash: bHash5,
        distributor_name: 'West Zone Distributor',
        metadata: JSON.stringify({ network: "Stellar Testnet", priceXLM: "365.0", txHash: "0xabc123def456" }),
        created_date: new Date(Date.now() - 7200000).toISOString(),
        updated_date: new Date(Date.now() - 600000).toISOString(),
      };

      // --- Blockchain blocks for all bookings ---
      const deliveredBlock = {
        id: 'b1',
        block_index: 1,
        block_hash: bHash,
        previous_hash: '0x0000000000000000',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        booking_id: bId,
        event_type: 'delivered',
        event_data: JSON.stringify({ status: 'delivered' }),
        location: '123 Gas Lane',
        verified_by: 'System Node',
        created_date: new Date(Date.now() - 3600000).toISOString(),
      };

      const pendingBlock = {
        id: 'b2',
        block_index: 2,
        block_hash: bHash2,
        previous_hash: bHash,
        timestamp: new Date(Date.now() - 300000).toISOString(),
        booking_id: bId2,
        event_type: 'booking_created',
        event_data: JSON.stringify({ customer: 'Priya Sharma', xlm_payment: true }),
        location: 'Stellar Node (Testnet)',
        verified_by: 'Freighter',
        created_date: new Date(Date.now() - 300000).toISOString(),
      };

      const confirmedBlock = {
        id: 'b3',
        block_index: 3,
        block_hash: bHash3,
        previous_hash: bHash2,
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        booking_id: bId3,
        event_type: 'booking_created',
        event_data: JSON.stringify({ customer: 'Rahul Verma', method: 'online' }),
        location: 'Public Node (India)',
        verified_by: 'System',
        created_date: new Date(Date.now() - 1800000).toISOString(),
      };

      const confirmedBlock2 = {
        id: 'b3b',
        block_index: 4,
        block_hash: generateBlockHash(bHash3, { event: 'cylinder_assigned' }),
        previous_hash: bHash3,
        timestamp: new Date(Date.now() - 900000).toISOString(),
        booking_id: bId3,
        event_type: 'cylinder_assigned',
        event_data: JSON.stringify({ status: 'confirmed' }),
        location: 'Distribution Center',
        verified_by: 'Admin Node',
        created_date: new Date(Date.now() - 900000).toISOString(),
      };

      const dispatchedBlock = {
        id: 'b4',
        block_index: 5,
        block_hash: bHash4,
        previous_hash: bHash3,
        timestamp: new Date(Date.now() - 5400000).toISOString(),
        booking_id: bId4,
        event_type: 'dispatched',
        event_data: JSON.stringify({ status: 'dispatched' }),
        location: 'South Zone Warehouse, Bengaluru',
        verified_by: 'Admin Node',
        created_date: new Date(Date.now() - 1200000).toISOString(),
      };

      const inTransitBlock = {
        id: 'b5',
        block_index: 6,
        block_hash: bHash5,
        previous_hash: bHash4,
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        booking_id: bId5,
        event_type: 'in_transit',
        event_data: JSON.stringify({ status: 'in_transit', vehicle: 'GJ-01-AB-1234' }),
        location: 'En Route — Ahmedabad Highway',
        verified_by: 'GPS Tracker Node',
        created_date: new Date(Date.now() - 600000).toISOString(),
      };

      // --- Subsidies ---
      const subsidy1 = {
        id: 's1',
        subsidy_type: 'ujjwala',
        scheme: 'Ujjwala Yojana',
        amount: 200,
        status: 'credited',
        booking_id: bId,
        beneficiary_name: 'John Doe',
        created_date: new Date(Date.now() - 1800000).toISOString(),
      };

      const subsidy2 = {
        id: 's2',
        subsidy_type: 'ujjwala',
        scheme: 'Ujjwala Yojana',
        amount: 400,
        status: 'pending',
        booking_id: bId2,
        beneficiary_name: 'Priya Sharma',
        created_date: new Date(Date.now() - 200000).toISOString(),
      };

      setStorage(STORAGE_KEYS.BOOKINGS, [
        inTransitBooking, dispatchedBooking, confirmedBooking, pendingBooking, deliveredBooking
      ]);
      setStorage(STORAGE_KEYS.BLOCKS, [
        inTransitBlock, dispatchedBlock, confirmedBlock2, confirmedBlock, pendingBlock, deliveredBlock
      ]);
      setStorage(STORAGE_KEYS.SUBSIDIES, [subsidy2, subsidy1]);
    }
  }
};
