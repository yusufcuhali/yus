function DeviceForm({ device, customer, onSubmit, onCancel }) {
    const [currentTime, setCurrentTime] = React.useState(new Date());
    const [formData, setFormData] = React.useState(device ? { ...device } : {
        customerName: customer?.name || '',
        customerPhone: customer?.phone || '',
        customerEmail: customer?.email || '',
        tcNo: customer?.tcNo || '',
        customerId: customer?.id || '',
        brand: '',
        customBrand: '',
        model: '',
        serialNumber: '',
        customerComplaint: '',
        diagnosis: [],
        customDiagnosis: '',
        totalCost: 0,
        advancePayment: 0,
        remainingPayment: 0,
        deviceStatus: 'pending',
        createdAt: new Date().toISOString(),
        devicePhoto: null
    });

    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [success, setSuccess] = React.useState(false);
    const [isNewCustomer, setIsNewCustomer] = React.useState(!customer);
    const [selectedCustomer, setSelectedCustomer] = React.useState(customer);
    const [customerSearchQuery, setCustomerSearchQuery] = React.useState('');
    const [showCustomerSearch, setShowCustomerSearch] = React.useState(false);
    const [filteredCustomers, setFilteredCustomers] = React.useState([]);
    const [searchLoading, setSearchLoading] = React.useState(false);

    // Update current time every second
    React.useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

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

    const formatDateTime = (date) => {
        return date.toLocaleString('tr-TR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePhoneChange = (value) => {
        const cleaned = value.replace(/\D/g, '').slice(0, 10);
        setFormData(prev => ({
            ...prev,
            customerPhone: cleaned
        }));
    };

    const handleTcNoChange = (e) => {
        // Only allow numbers and limit to 11 digits
        const cleaned = e.target.value.replace(/\D/g, '').slice(0, 11);
        setFormData(prev => ({
            ...prev,
            tcNo: cleaned
        }));
    };

    const handleCustomerSelect = (customer) => {
        setSelectedCustomer(customer);
        setFormData(prev => ({
            ...prev,
            customerName: customer.name,
            customerPhone: customer.phone,
            customerEmail: customer.email || '',
            tcNo: customer.tcNo,
            customerId: customer.id
        }));
        setShowCustomerSearch(false);
    };

    const validateForm = () => {
        if (!formData.customerName || !formData.customerPhone) {
            setError('Müşteri bilgileri eksik');
            return false;
        }

        if (!formData.brand || !formData.model) {
            setError('Cihaz bilgileri eksik');
            return false;
        }

        if (!formData.customerComplaint) {
            setError('Müşteri şikayeti girilmedi');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Create new customer if needed
            if (isNewCustomer && !formData.customerId) {
                const newCustomer = await api.customers.create({
                    name: formData.customerName,
                    phone: formData.customerPhone,
                    email: formData.customerEmail,
                    tcNo: formData.tcNo
                });
                formData.customerId = newCustomer.id;
            }

            // Save device
            const deviceData = {
                ...formData,
                createdAt: currentTime.toISOString()
            };

            const result = device ? 
                await api.devices.update(device.id, deviceData) :
                await api.devices.create(deviceData);

            setSuccess(true);
            
            // Show notification
            window.notificationService.notify({
                type: 'success',
                title: device ? 'Cihaz Güncellendi' : 'Yeni Cihaz Kaydı',
                message: `${result.brand} ${result.model} cihazı başarıyla ${device ? 'güncellendi' : 'kaydedildi'}.`
            });

            setTimeout(() => {
                if (onSubmit) onSubmit(result);
            }, 1500);

        } catch (error) {
            reportError(error);
            setError('Kayıt işlemi başarısız oldu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6" data-name="device-form">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">
                    {device ? 'Cihaz Düzenle' : 'Yeni Cihaz Kaydı'}
                </h2>
                <div className="flex items-center space-x-4">
                    <div className="text-gray-400">
                        <i className="fas fa-clock mr-2"></i>
                        {formatDateTime(currentTime)}
                    </div>
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                        >
                            <i className="fas fa-times mr-2"></i>
                            İptal
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <i className="fas fa-exclamation-circle mr-2"></i>
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    <i className="fas fa-check-circle mr-2"></i>
                    {device ? 'Cihaz başarıyla güncellendi' : 'Cihaz başarıyla kaydedildi'}
                </div>
            )}

            <div className="bg-dark-300 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-6 text-white flex items-center">
                    <i className="fas fa-user-circle mr-2 text-blue-500"></i>
                    Müşteri Bilgileri
                </h3>

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
                    >
                        <i className="fas fa-search mr-2"></i>
                        Mevcut Müşteri
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setIsNewCustomer(true);
                            setShowCustomerSearch(false);
                            setSelectedCustomer(null);
                        }}
                        className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-200 ${
                            isNewCustomer 
                                ? 'bg-blue-600 text-white shadow-lg' 
                                : 'bg-dark-400 text-gray-300 hover:bg-dark-500'
                        }`}
                    >
                        <i className="fas fa-plus mr-2"></i>
                        Yeni Müşteri
                    </button>
                </div>

                {!isNewCustomer && showCustomerSearch && (
                    <div className="mb-6">
                        <label className="block text-white mb-2 font-medium">
                            <i className="fas fa-search mr-2 text-blue-500"></i>
                            Müşteri Ara
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={customerSearchQuery}
                                onChange={(e) => setCustomerSearchQuery(e.target.value)}
                                className="w-full bg-dark-400 text-white p-3 rounded-lg border border-dark-500 focus:border-blue-500 focus:outline-none pl-10"
                                placeholder="İsim, telefon veya TC no ile ara..."
                            />
                            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>

                            {filteredCustomers.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-dark-300 border border-dark-500 rounded-lg shadow-lg max-h-60 overflow-auto">
                                    {filteredCustomers.map(customer => (
                                        <div
                                            key={customer.id}
                                            className="p-3 hover:bg-dark-400 cursor-pointer border-b border-dark-500 last:border-0"
                                            onClick={() => handleCustomerSelect(customer)}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            className="w-full bg-dark-400 text-white p-3 rounded"
                            required
                            disabled={!isNewCustomer && selectedCustomer}
                        />
                    </div>
                    <div className="form-group">
                        <label className="block text-white mb-2 font-medium">
                            <i className="fas fa-id-card mr-2 text-blue-500"></i>
                            TC Kimlik No <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.tcNo}
                            onChange={handleTcNoChange}
                            className="w-full bg-dark-400 text-white p-3 rounded"
                            required
                            maxLength="11"
                            disabled={!isNewCustomer && selectedCustomer}
                        />
                    </div>
                    <div className="form-group">
                        <label className="block text-white mb-2 font-medium">
                            <i className="fas fa-phone mr-2 text-blue-500"></i>
                            Telefon <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.customerPhone}
                            onChange={(e) => handlePhoneChange(e.target.value)}
                            className="w-full bg-dark-400 text-white p-3 rounded"
                            required
                            maxLength="10"
                            disabled={!isNewCustomer && selectedCustomer}
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
                            className="w-full bg-dark-400 text-white p-3 rounded"
                            disabled={!isNewCustomer && selectedCustomer}
                        />
                    </div>
                </div>
            </div>

            <DeviceSection 
                formData={formData}
                handleChange={handleChange}
            />

            <ProblemSection 
                formData={formData}
                handleChange={handleChange}
            />

            <div className="flex justify-end space-x-4">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
                    >
                        <i className="fas fa-times mr-2"></i>
                        İptal
                    </button>
                )}
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                    disabled={loading}
                >
                    {loading ? (
                        <div className="flex items-center">
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            {device ? 'Güncelleniyor...' : 'Kaydediliyor...'}
                        </div>
                    ) : (
                        <div className="flex items-center">
                            <i className="fas fa-save mr-2"></i>
                            {device ? 'Güncelle' : 'Kaydet'}
                        </div>
                    )}
                </button>
            </div>
        </form>
    );
}
