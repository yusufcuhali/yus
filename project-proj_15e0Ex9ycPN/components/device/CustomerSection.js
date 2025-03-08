function CustomerSection({ 
    formData, 
    isNewCustomer, 
    selectedCustomer,
    customerSearchQuery,
    showCustomerSearch,
    handleChange,
    handlePhoneChange,
    handleTcNoChange,
    handleCustomerSelect,
    setShowCustomerSearch,
    setIsNewCustomer,
    setCustomerSearchQuery
}) {
    const [filteredCustomers, setFilteredCustomers] = React.useState([]);
    const [searchLoading, setSearchLoading] = React.useState(false);

    React.useEffect(() => {
        if (customerSearchQuery && showCustomerSearch) {
            searchCustomers();
        }
    }, [customerSearchQuery]);

    const searchCustomers = async () => {
        try {
            setSearchLoading(true);
            const data = await api.customers.list({ keyword: customerSearchQuery });
            setFilteredCustomers(data || []);
        } catch (error) {
            console.error('Customer search error:', error);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleNewCustomer = () => {
        setIsNewCustomer(true);
        setShowCustomerSearch(false);
        setCustomerSearchQuery('');
    };

    return (
        <div className="bg-dark-300 p-6 rounded-lg shadow-inner">
            <h3 className="text-xl font-semibold mb-6 text-white flex items-center">
                <i className="fas fa-user-circle mr-2 text-blue-500"></i>
                Müşteri Bilgileri
            </h3>
            
            <div className="space-y-6">
                <div className="flex space-x-4 mb-6">
                    <button
                        type="button"
                        onClick={() => {
                            setShowCustomerSearch(true);
                            setIsNewCustomer(false);
                        }}
                        className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-200 ${
                            !isNewCustomer 
                                ? 'bg-blue-600 text-white shadow-lg' 
                                : 'bg-dark-400 text-gray-300 hover:bg-dark-500'
                        }`}
                        data-name="existing-customer-button"
                    >
                        <i className="fas fa-search mr-2"></i>
                        Mevcut Müşteri
                    </button>
                    <button
                        type="button"
                        onClick={handleNewCustomer}
                        className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-200 ${
                            isNewCustomer 
                                ? 'bg-blue-600 text-white shadow-lg' 
                                : 'bg-dark-400 text-gray-300 hover:bg-dark-500'
                        }`}
                        data-name="new-customer-button"
                    >
                        <i className="fas fa-plus mr-2"></i>
                        Yeni Müşteri
                    </button>
                </div>

                {!isNewCustomer && (
                    <div className="mb-6">
                        <label className="block text-white mb-2 font-medium">
                            <i className="fas fa-search mr-2 text-blue-500"></i>
                            Müşteri Ara
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={customerSearchQuery}
                                onChange={(e) => {
                                    setCustomerSearchQuery(e.target.value);
                                    setShowCustomerSearch(true);
                                }}
                                onFocus={() => setShowCustomerSearch(true)}
                                className="w-full bg-dark-400 text-white p-3 rounded-lg border border-dark-500 focus:border-blue-500 focus:outline-none pl-10"
                                placeholder="İsim, telefon veya TC no ile ara..."
                                data-name="customer-search-input"
                            />
                            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                            
                            {showCustomerSearch && filteredCustomers && filteredCustomers.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-dark-300 border border-dark-500 rounded-lg shadow-lg max-h-60 overflow-auto">
                                    {filteredCustomers.map(customer => (
                                        <div
                                            key={customer.id}
                                            className="p-3 hover:bg-dark-400 cursor-pointer border-b border-dark-500 last:border-0"
                                            onClick={() => handleCustomerSelect(customer)}
                                            data-name={`customer-result-${customer.id}`}
                                        >
                                            <div className="font-medium text-white">{customer.name}</div>
                                            <div className="text-sm text-gray-400 flex justify-between mt-1">
                                                <span><i className="fas fa-phone mr-1"></i> {customer.phone}</span>
                                                <span><i className="fas fa-id-card mr-1"></i> {customer.tcNo}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${isNewCustomer ? 'opacity-100' : 'opacity-70'}`}>
                    <div className="form-group">
                        <label className="block text-white mb-2 font-medium">
                            <i className="fas fa-user mr-2 text-blue-500"></i>
                            Ad Soyad <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="customerName"
                            value={formData.customerName}
                            onChange={handleChange}
                            className="w-full bg-dark-400 text-white p-3 rounded-lg border border-dark-500 focus:border-blue-500 focus:outline-none"
                            placeholder="Müşteri adı soyadı"
                            required
                            disabled={!isNewCustomer && selectedCustomer}
                            data-name="customer-name-input"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="block text-white mb-2 font-medium">
                            <i className="fas fa-id-card mr-2 text-blue-500"></i>
                            TC Kimlik No <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="tcNo"
                            value={formData.tcNo}
                            onChange={handleTcNoChange}
                            className="w-full bg-dark-400 text-white p-3 rounded-lg border border-dark-500 focus:border-blue-500 focus:outline-none"
                            placeholder="11 haneli TC kimlik numarası"
                            required
                            disabled={!isNewCustomer && selectedCustomer}
                            maxLength="11"
                            data-name="customer-tcno-input"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="block text-white mb-2 font-medium">
                            <i className="fas fa-phone mr-2 text-blue-500"></i>
                            Telefon <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            name="customerPhone"
                            value={formData.customerPhone}
                            onChange={handlePhoneChange}
                            className="w-full bg-dark-400 text-white p-3 rounded-lg border border-dark-500 focus:border-blue-500 focus:outline-none"
                            placeholder="5XX XXX XX XX"
                            required
                            disabled={!isNewCustomer && selectedCustomer}
                            data-name="customer-phone-input"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="block text-white mb-2 font-medium">
                            <i className="fas fa-envelope mr-2 text-blue-500"></i>
                            E-posta
                        </label>
                        <input
                            type="email"
                            name="customerEmail"
                            value={formData.customerEmail}
                            onChange={handleChange}
                            className="w-full bg-dark-400 text-white p-3 rounded-lg border border-dark-500 focus:border-blue-500 focus:outline-none"
                            placeholder="ornek@email.com"
                            disabled={!isNewCustomer && selectedCustomer}
                            data-name="customer-email-input"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
