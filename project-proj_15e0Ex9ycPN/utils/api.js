// Initialize the API object first
window.api = {
    devices: {
        list: async (params = {}) => {
            try {
                await new Promise(resolve => setTimeout(resolve, 500));
                let devices = window.storageUtils.getItem('devices', []);
                
                // Filter by specific status
                if (params.status) {
                    if (Array.isArray(params.status)) {
                        devices = devices.filter(d => params.status.includes(d.deviceStatus));
                    } else {
                        devices = devices.filter(d => d.deviceStatus === params.status);
                    }
                }

                // Filter by customer ID
                if (params.customerId) {
                    devices = devices.filter(d => d.customerId === params.customerId);
                }

                // Filter by search keyword
                if (params.keyword) {
                    const searchTerm = params.keyword.toLowerCase();
                    devices = devices.filter(d => 
                        d.registrationNumber?.toLowerCase().includes(searchTerm) ||
                        d.customerName?.toLowerCase().includes(searchTerm) ||
                        d.brand?.toLowerCase().includes(searchTerm) ||
                        d.model?.toLowerCase().includes(searchTerm) ||
                        d.serialNumber?.toLowerCase().includes(searchTerm)
                    );
                }

                // Filter by remaining payment
                if (params.remainingPayment) {
                    devices = devices.filter(d => (d.remainingPayment || 0) > 0);
                }

                // Filter by expenses
                if (params.expenses) {
                    const expenses = window.storageUtils.getItem('expenses', []);
                    return expenses;
                }

                // Filter by date range
                if (params.dateRange) {
                    const now = new Date();
                    let startDate;
                    
                    switch (params.dateRange) {
                        case 'day':
                            startDate = new Date(now.setHours(0, 0, 0, 0));
                            break;
                        case 'week':
                            startDate = new Date(now);
                            startDate.setDate(now.getDate() - 7);
                            break;
                        case 'month':
                            startDate = new Date(now);
                            startDate.setMonth(now.getMonth() - 1);
                            break;
                        case 'year':
                            startDate = new Date(now);
                            startDate.setFullYear(now.getFullYear() - 1);
                            break;
                        default:
                            startDate = new Date(0); // Beginning of time
                    }
                    
                    devices = devices.filter(d => new Date(d.createdAt) >= startDate);
                }

                // Filter by date from
                if (params.dateFrom) {
                    devices = devices.filter(d => new Date(d.createdAt) >= new Date(params.dateFrom));
                }

                // Filter by date to
                if (params.dateTo) {
                    devices = devices.filter(d => new Date(d.createdAt) <= new Date(params.dateTo));
                }

                // Sort by date descending by default
                devices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                return devices;
            } catch (error) {
                console.error('Devices list error:', error);
                return [];
            }
        },

        create: async (deviceData) => {
            try {
                await new Promise(resolve => setTimeout(resolve, 500));
                const devices = window.storageUtils.getItem('devices', []);
                
                const newDevice = {
                    id: Math.random().toString(36).substr(2, 9),
                    registrationNumber: `SRV${String(devices.length + 1).padStart(4, '0')}`,
                    createdAt: new Date().toISOString(),
                    ...deviceData,
                    remainingPayment: Number(deviceData.totalCost || 0) - Number(deviceData.advancePayment || 0)
                };

                devices.push(newDevice);
                window.storageUtils.setItem('devices', devices);

                // Update customer's device count
                if (deviceData.customerId) {
                    const customers = window.storageUtils.getItem('customers', []);
                    const customerIndex = customers.findIndex(c => c.id === deviceData.customerId);
                    if (customerIndex !== -1) {
                        customers[customerIndex].deviceCount = (customers[customerIndex].deviceCount || 0) + 1;
                        customers[customerIndex].lastServiceDate = new Date().toISOString();
                        window.storageUtils.setItem('customers', customers);
                    }
                }

                return newDevice;
            } catch (error) {
                console.error('Device create error:', error);
                throw error;
            }
        },

        update: async (deviceId, deviceData) => {
            try {
                await new Promise(resolve => setTimeout(resolve, 500));
                const devices = window.storageUtils.getItem('devices', []);
                
                const index = devices.findIndex(d => d.id === deviceId);
                if (index === -1) throw new Error('Device not found');

                devices[index] = {
                    ...devices[index],
                    ...deviceData,
                    updatedAt: new Date().toISOString(),
                    remainingPayment: Number(deviceData.totalCost || 0) - Number(deviceData.advancePayment || 0)
                };

                window.storageUtils.setItem('devices', devices);
                return devices[index];
            } catch (error) {
                console.error('Device update error:', error);
                throw error;
            }
        },

        delete: async (deviceId) => {
            try {
                await new Promise(resolve => setTimeout(resolve, 500));
                const devices = window.storageUtils.getItem('devices', []);
                
                const index = devices.findIndex(d => d.id === deviceId);
                if (index === -1) throw new Error('Device not found');

                const device = devices[index];
                devices.splice(index, 1);
                window.storageUtils.setItem('devices', devices);

                // Update customer's device count
                if (device.customerId) {
                    const customers = window.storageUtils.getItem('customers', []);
                    const customerIndex = customers.findIndex(c => c.id === device.customerId);
                    if (customerIndex !== -1) {
                        customers[customerIndex].deviceCount = Math.max(0, (customers[customerIndex].deviceCount || 1) - 1);
                        window.storageUtils.setItem('customers', customers);
                    }
                }
            } catch (error) {
                console.error('Device delete error:', error);
                throw error;
            }
        },

        get: async (deviceId) => {
            try {
                await new Promise(resolve => setTimeout(resolve, 500));
                const devices = window.storageUtils.getItem('devices', []);
                const device = devices.find(d => d.id === deviceId);
                
                if (!device) throw new Error('Device not found');
                return device;
            } catch (error) {
                console.error('Device get error:', error);
                throw error;
            }
        }
    },

    customers: {
        list: async (params = {}) => {
            try {
                await new Promise(resolve => setTimeout(resolve, 500));
                let customers = window.storageUtils.getItem('customers', []);
                
                if (params.keyword) {
                    const searchTerm = params.keyword.toLowerCase();
                    customers = customers.filter(c => 
                        c.name?.toLowerCase().includes(searchTerm) ||
                        c.phone?.toLowerCase().includes(searchTerm) ||
                        c.email?.toLowerCase().includes(searchTerm) ||
                        c.tcNo?.toLowerCase().includes(searchTerm)
                    );
                }

                // Sort by date descending by default
                customers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                return customers;
            } catch (error) {
                console.error('Customers list error:', error);
                return [];
            }
        },

        create: async (customerData) => {
            try {
                await new Promise(resolve => setTimeout(resolve, 500));
                const customers = window.storageUtils.getItem('customers', []);
                
                const newCustomer = {
                    id: Math.random().toString(36).substr(2, 9),
                    deviceCount: 0,
                    createdAt: new Date().toISOString(),
                    ...customerData
                };

                customers.push(newCustomer);
                window.storageUtils.setItem('customers', customers);

                return newCustomer;
            } catch (error) {
                console.error('Customer create error:', error);
                throw error;
            }
        },

        update: async (customerId, customerData) => {
            try {
                await new Promise(resolve => setTimeout(resolve, 500));
                const customers = window.storageUtils.getItem('customers', []);
                
                const index = customers.findIndex(c => c.id === customerId);
                if (index === -1) throw new Error('Customer not found');

                customers[index] = {
                    ...customers[index],
                    ...customerData,
                    updatedAt: new Date().toISOString()
                };

                window.storageUtils.setItem('customers', customers);
                return customers[index];
            } catch (error) {
                console.error('Customer update error:', error);
                throw error;
            }
        },

        delete: async (customerId) => {
            try {
                await new Promise(resolve => setTimeout(resolve, 500));
                const customers = window.storageUtils.getItem('customers', []);
                
                const index = customers.findIndex(c => c.id === customerId);
                if (index === -1) throw new Error('Customer not found');

                // Check if customer has devices
                const devices = window.storageUtils.getItem('devices', []);
                const hasDevices = devices.some(d => d.customerId === customerId);
                
                if (hasDevices) {
                    throw new Error('Cannot delete customer with devices');
                }

                customers.splice(index, 1);
                window.storageUtils.setItem('customers', customers);
            } catch (error) {
                console.error('Customer delete error:', error);
                throw error;
            }
        },

        get: async (customerId) => {
            try {
                await new Promise(resolve => setTimeout(resolve, 500));
                const customers = window.storageUtils.getItem('customers', []);
                const customer = customers.find(c => c.id === customerId);
                
                if (!customer) throw new Error('Customer not found');
                return customer;
            } catch (error) {
                console.error('Customer get error:', error);
                throw error;
            }
        }
    },

    expenses: {
        list: async (params = {}) => {
            try {
                await new Promise(resolve => setTimeout(resolve, 500));
                let expenses = window.storageUtils.getItem('expenses', []);
                
                if (params.dateRange) {
                    const now = new Date();
                    let startDate;
                    
                    switch (params.dateRange) {
                        case 'day':
                            startDate = new Date(now.setHours(0, 0, 0, 0));
                            break;
                        case 'week':
                            startDate = new Date(now);
                            startDate.setDate(now.getDate() - 7);
                            break;
                        case 'month':
                            startDate = new Date(now);
                            startDate.setMonth(now.getMonth() - 1);
                            break;
                        case 'year':
                            startDate = new Date(now);
                            startDate.setFullYear(now.getFullYear() - 1);
                            break;
                        default:
                            startDate = new Date(0); // Beginning of time
                    }
                    
                    expenses = expenses.filter(e => new Date(e.date) >= startDate);
                }

                if (params.type) {
                    expenses = expenses.filter(e => e.type === params.type);
                }

                if (params.status) {
                    expenses = expenses.filter(e => e.status === params.status);
                }

                // Sort by date descending by default
                expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

                return expenses;
            } catch (error) {
                console.error('Expenses list error:', error);
                return [];
            }
        },

        create: async (expenseData) => {
            try {
                await new Promise(resolve => setTimeout(resolve, 500));
                const expenses = window.storageUtils.getItem('expenses', []);
                
                const newExpense = {
                    id: Math.random().toString(36).substr(2, 9),
                    createdAt: new Date().toISOString(),
                    ...expenseData
                };

                expenses.push(newExpense);
                window.storageUtils.setItem('expenses', expenses);

                return newExpense;
            } catch (error) {
                console.error('Expense create error:', error);
                throw error;
            }
        },

        update: async (expenseId, expenseData) => {
            try {
                await new Promise(resolve => setTimeout(resolve, 500));
                const expenses = window.storageUtils.getItem('expenses', []);
                
                const index = expenses.findIndex(e => e.id === expenseId);
                if (index === -1) throw new Error('Expense not found');

                expenses[index] = {
                    ...expenses[index],
                    ...expenseData,
                    updatedAt: new Date().toISOString()
                };

                window.storageUtils.setItem('expenses', expenses);
                return expenses[index];
            } catch (error) {
                console.error('Expense update error:', error);
                throw error;
            }
        },

        delete: async (expenseId) => {
            try {
                await new Promise(resolve => setTimeout(resolve, 500));
                const expenses = window.storageUtils.getItem('expenses', []);
                
                const index = expenses.findIndex(e => e.id === expenseId);
                if (index === -1) throw new Error('Expense not found');

                expenses.splice(index, 1);
                window.storageUtils.setItem('expenses', expenses);
            } catch (error) {
                console.error('Expense delete error:', error);
                throw error;
            }
        }
    },

    reports: {
        generate: async (dateRange = 'month') => {
            try {
                await new Promise(resolve => setTimeout(resolve, 500));
                const devices = await api.devices.list({ dateRange });
                
                // Count devices by status
                const byStatus = devices.reduce((acc, device) => {
                    const status = device.deviceStatus || 'pending';
                    acc[status] = (acc[status] || 0) + 1;
                    return acc;
                }, {});
                
                // Calculate average repair time
                const completedDevices = devices.filter(d => 
                    d.deviceStatus === 'completed' || d.deviceStatus === 'delivered'
                );
                
                let totalDays = 0;
                completedDevices.forEach(device => {
                    const start = new Date(device.createdAt);
                    const end = device.updatedAt ? new Date(device.updatedAt) : new Date();
                    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
                    totalDays += days;
                });
                
                const averageRepairTime = completedDevices.length > 0 
                    ? Math.round(totalDays / completedDevices.length) 
                    : 0;
                
                // Count top issues
                const issuesCounts = {};
                devices.forEach(device => {
                    if (Array.isArray(device.diagnosis)) {
                        device.diagnosis.forEach(issue => {
                            issuesCounts[issue] = (issuesCounts[issue] || 0) + 1;
                        });
                    }
                });
                
                const topIssues = Object.entries(issuesCounts)
                    .map(([name, count]) => {
                        // Map diagnosis code to label
                        const diagnosisOption = DIAGNOSIS_OPTIONS.find(opt => opt.value === name);
                        return {
                            name: diagnosisOption ? diagnosisOption.label : name,
                            count
                        };
                    })
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);
                
                // Generate monthly services data
                const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                              'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
                
                const monthlyServices = [];
                const now = new Date();
                const currentYear = now.getFullYear();
                
                for (let i = 0; i < 12; i++) {
                    const month = (now.getMonth() - i + 12) % 12;
                    const year = currentYear - Math.floor((i - now.getMonth()) / 12);
                    
                    const count = devices.filter(device => {
                        const date = new Date(device.createdAt);
                        return date.getMonth() === month && date.getFullYear() === year;
                    }).length;
                    
                    monthlyServices.push({
                        month: months[month],
                        year,
                        count
                    });
                }
                
                return {
                    totalDevices: devices.length,
                    byStatus,
                    averageRepairTime,
                    topIssues,
                    monthlyServices: monthlyServices.reverse()
                };
            } catch (error) {
                console.error('Report generation error:', error);
                throw error;
            }
        },
        
        financial: async ({ dateRange = 'month' } = {}) => {
            try {
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Get devices and expenses for the date range
                const devices = await api.devices.list({ dateRange });
                const expenses = await api.expenses.list({ dateRange });
                
                // Calculate revenue
                const totalRevenue = devices
                    .filter(d => d.deviceStatus === 'delivered')
                    .reduce((sum, device) => sum + (Number(device.totalCost) || 0), 0);
                
                // Calculate expenses
                const totalExpenses = expenses.reduce((sum, expense) => 
                    sum + (Number(expense.amount) || 0), 0);
                
                // Calculate net profit
                const netProfit = totalRevenue - totalExpenses;
                
                // Calculate expected revenue
                const expectedRevenue = devices
                    .filter(d => d.deviceStatus !== 'delivered' && d.deviceStatus !== 'cancelled')
                    .reduce((sum, device) => sum + (Number(device.totalCost) || 0), 0);
                
                // Calculate pending payments
                const pendingPayments = devices
                    .filter(d => d.deviceStatus === 'delivered')
                    .reduce((sum, device) => sum + (Number(device.remainingPayment) || 0), 0);
                
                // Count delivered devices
                const deliveredDevices = devices.filter(d => d.deviceStatus === 'delivered').length;
                
                // Generate monthly stats
                const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                              'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
                
                const monthlyStats = [];
                const now = new Date();
                const currentYear = now.getFullYear();
                
                for (let i = 0; i < 12; i++) {
                    const month = (now.getMonth() - i + 12) % 12;
                    const year = currentYear - Math.floor((i - now.getMonth()) / 12);
                    
                    const monthlyRevenue = devices
                        .filter(device => {
                            const date = new Date(device.createdAt);
                            return date.getMonth() === month && 
                                   date.getFullYear() === year &&
                                   device.deviceStatus === 'delivered';
                        })
                        .reduce((sum, device) => sum + (Number(device.totalCost) || 0), 0);
                    
                    const monthlyExpense = expenses
                        .filter(expense => {
                            const date = new Date(expense.date);
                            return date.getMonth() === month && date.getFullYear() === year;
                        })
                        .reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
                    
                    monthlyStats.push({
                        month: months[month],
                        year,
                        amount: monthlyRevenue,
                        expense: monthlyExpense,
                        profit: monthlyRevenue - monthlyExpense
                    });
                }
                
                return {
                    totalRevenue,
                    totalExpenses,
                    netProfit,
                    expectedRevenue,
                    pendingPayments,
                    deliveredDevices,
                    totalDevices: devices.length,
                    monthlyStats: monthlyStats.reverse()
                };
            } catch (error) {
                console.error('Financial report error:', error);
                throw error;
            }
        },
        
        testEmailSettings: async (email, emailConfig) => {
            try {
                return await window.emailService.sendTestEmail(email, emailConfig);
            } catch (error) {
                console.error('Test email error:', error);
                throw error;
            }
        }
    },
    
    settings: {
        get: async () => {
            try {
                await new Promise(resolve => setTimeout(resolve, 500));
                return window.storageUtils.getItem('settings', {
                    companyName: 'Laptop Servis Yönetimi',
                    logo: null,
                    address: '',
                    phone: '',
                    email: '',
                    theme: 'dark'
                });
            } catch (error) {
                console.error('Settings get error:', error);
                throw error;
            }
        },
        
        update: async (settingsData) => {
            try {
                await new Promise(resolve => setTimeout(resolve, 500));
                window.storageUtils.setItem('settings', settingsData);
                return settingsData;
            } catch (error) {
                console.error('Settings update error:', error);
                throw error;
            }
        },
        
        getEmailConfig: async () => {
            try {
                await new Promise(resolve => setTimeout(resolve, 500));
                return window.storageUtils.getItem('emailConfig', {
                    server: '',
                    port: '',
                    username: '',
                    password: '',
                    secure: true
                });
            } catch (error) {
                console.error('Email config get error:', error);
                throw error;
            }
        },
        
        saveEmailConfig: async (emailConfig) => {
            try {
                await new Promise(resolve => setTimeout(resolve, 500));
                window.storageUtils.setItem('emailConfig', emailConfig);
                return emailConfig;
            } catch (error) {
                console.error('Email config save error:', error);
                throw error;
            }
        }
    }
};
