// Initialize mock data
window.MOCK_DEVICES = [
    {
        id: '1',
        registrationNumber: 'SRV001',
        customerName: 'Ahmet Yılmaz',
        customerId: 'cust1',
        customerPhone: '5551234567',
        customerEmail: 'ahmet@example.com',
        brand: 'Dell',
        model: 'Latitude 5510',
        deviceStatus: 'pending',
        totalCost: 1500,
        advancePayment: 500,
        expenses: 200,
        createdAt: '2024-01-15T10:00:00Z'
    },
    {
        id: '2',
        registrationNumber: 'SRV002',
        customerName: 'Mehmet Demir',
        customerId: 'cust2',
        customerPhone: '5559876543',
        customerEmail: 'mehmet@example.com',
        brand: 'HP',
        model: 'EliteBook 840',
        deviceStatus: 'completed',
        totalCost: 2000,
        advancePayment: 1000,
        expenses: 300,
        createdAt: '2024-01-16T09:30:00Z'
    }
];

window.MOCK_CUSTOMERS = [
    {
        id: 'cust1',
        name: 'Ahmet Yılmaz',
        tcNo: '12345678901',
        phone: '5551234567',
        email: 'ahmet@example.com',
        address: 'İstanbul',
        createdAt: '2024-01-15T10:00:00Z'
    },
    {
        id: 'cust2',
        name: 'Mehmet Demir',
        tcNo: '98765432109',
        phone: '5559876543',
        email: 'mehmet@example.com',
        address: 'Ankara',
        createdAt: '2024-01-16T09:30:00Z'
    }
];

window.MOCK_EXPENSES = [
    {
        id: '1',
        type: 'electricity',
        amount: 500,
        date: '2024-01-15',
        description: 'Ocak ayı elektrik faturası',
        status: 'paid',
        createdAt: '2024-01-15T10:00:00Z'
    },
    {
        id: '2',
        type: 'internet',
        amount: 300,
        date: '2024-01-16',
        description: 'Ocak ayı internet faturası',
        status: 'unpaid',
        createdAt: '2024-01-16T09:30:00Z'
    }
];

// Initialize mock data function
window.initializeMockData = () => {
    // Make sure storageUtils is available
    if (!window.storageUtils) {
        console.error('Storage utils not initialized');
        return;
    }

    // Initialize devices if not exists
    if (!window.storageUtils.getItem('devices')) {
        window.storageUtils.setItem('devices', window.MOCK_DEVICES);
    }

    // Initialize customers if not exists
    if (!window.storageUtils.getItem('customers')) {
        window.storageUtils.setItem('customers', window.MOCK_CUSTOMERS);
    }

    // Initialize expenses if not exists
    if (!window.storageUtils.getItem('expenses')) {
        window.storageUtils.setItem('expenses', window.MOCK_EXPENSES);
    }

    console.log('Mock data initialized successfully');
};

// Initialize mock data when the script loads
document.addEventListener('DOMContentLoaded', () => {
    window.initializeMockData();
});
