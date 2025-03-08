function CustomerList() {
    const [customers, setCustomers] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [selectedCustomer, setSelectedCustomer] = React.useState(null);
    const [showAddForm, setShowAddForm] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [showDeviceForm, setShowDeviceForm] = React.useState(false);
    const [selectedCustomerForDevice, setSelectedCustomerForDevice] = React.useState(null);

    React.useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        try {
            const data = await api.customers.list();
            setCustomers(data || []);
            setLoading(false);
        } catch (error) {
            reportError(error);
            setError('Müşteriler yüklenirken bir hata oluştu');
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleNewDevice = (customer) => {
        setSelectedCustomerForDevice(customer);
        setShowDeviceForm(true);
    };

    const filteredCustomers = React.useMemo(() => {
        if (!searchQuery.trim()) return customers;
        
        const query = searchQuery.toLowerCase().trim();
        return customers.filter(customer => {
            const name = (customer.name || '').toLowerCase();
            const phone = (customer.phone || '').toLowerCase();
            const email = (customer.email || '').toLowerCase();
            const tcNo = (customer.tcNo || '').toLowerCase();
            
            return name.includes(query) || 
                   phone.includes(query) || 
                   email.includes(query) || 
                   tcNo.includes(query);
        });
    }, [customers, searchQuery]);

    if (showDeviceForm && selectedCustomerForDevice) {
        return (
            <DeviceForm 
                customer={selectedCustomerForDevice}
                onSubmit={() => {
                    setShowDeviceForm(false);
                    setSelectedCustomerForDevice(null);
                    loadCustomers();
                }}
                onCancel={() => {
                    setShowDeviceForm(false);
                    setSelectedCustomerForDevice(null);
                }}
            />
        );
    }

    if (showAddForm) {
        return (
            <CustomerForm 
                onSubmit={() => {
                    setShowAddForm(false);
                    loadCustomers();
                }}
                onCancel={() => setShowAddForm(false)}
            />
        );
    }

    if (selectedCustomer) {
        return (
            <CustomerDetail 
                customer={selectedCustomer}
                onBack={() => setSelectedCustomer(null)}
                onUpdate={loadCustomers}
            />
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center text-gray-400">
                    <i className="fas fa-spinner fa-spin fa-2x mb-2"></i>
                    <p>Yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <div className="flex items-center">
                    <i className="fas fa-exclamation-circle mr-2"></i>
                    <span>{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6" data-name="customer-list">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Müşteriler</h2>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    data-name="add-customer-button"
                >
                    <i className="fas fa-plus mr-2"></i>
                    Yeni Müşteri
                </button>
            </div>

            <div className="bg-dark-200 p-4 rounded">
                <div className="mb-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Müşteri ara..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="w-full bg-dark-300 text-white p-3 pl-10 rounded"
                            data-name="customer-search-input"
                        />
                        <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                </div>

                {filteredCustomers.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        {searchQuery ? 'Aranan kriterlere uygun müşteri bulunamadı' : 'Henüz müşteri kaydı bulunmuyor'}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-white">
                            <thead className="bg-dark-300">
                                <tr>
                                    <th className="p-3 text-left">Müşteri</th>
                                    <th className="p-3 text-left">İletişim</th>
                                    <th className="p-3 text-left">Toplam Cihaz</th>
                                    <th className="p-3 text-left">Son İşlem</th>
                                    <th className="p-3 text-left">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCustomers.map(customer => (
                                    <tr 
                                        key={customer.id} 
                                        className="border-t border-dark-300 hover:bg-dark-300 transition-colors"
                                        data-name={`customer-row-${customer.id}`}
                                    >
                                        <td className="p-3">
                                            <div className="font-medium">{customer.name}</div>
                                            <div className="text-sm text-gray-400">{customer.tcNo}</div>
                                        </td>
                                        <td className="p-3">
                                            <div>{customer.phone}</div>
                                            <div className="text-sm text-gray-400">{customer.email || '-'}</div>
                                        </td>
                                        <td className="p-3">
                                            {customer.deviceCount || 0} cihaz
                                        </td>
                                        <td className="p-3">
                                            {customer.lastServiceDate ? 
                                                new Date(customer.lastServiceDate).toLocaleDateString('tr-TR') :
                                                '-'
                                            }
                                        </td>
                                        <td className="p-3">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => setSelectedCustomer(customer)}
                                                    className="text-blue-500 hover:text-blue-700"
                                                    title="Detay"
                                                    data-name={`view-customer-${customer.id}`}
                                                >
                                                    <i className="fas fa-eye"></i>
                                                </button>
                                                <button
                                                    onClick={() => handleNewDevice(customer)}
                                                    className="text-green-500 hover:text-green-700"
                                                    title="Yeni Cihaz"
                                                    data-name={`new-device-${customer.id}`}
                                                >
                                                    <i className="fas fa-laptop"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
