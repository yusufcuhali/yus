function CustomerForm({ customer, onSubmit, onCancel }) {
    const [formData, setFormData] = React.useState(customer ? { ...customer } : {
        name: '',
        tcNo: '',
        phone: '',
        email: '',
        address: ''
    });
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [success, setSuccess] = React.useState(false);
    const [deviceCount, setDeviceCount] = React.useState(0);

    React.useEffect(() => {
        if (customer?.id) {
            loadCustomerDevices(customer.id);
        }
    }, [customer]);

    const loadCustomerDevices = async (customerId) => {
        try {
            const devices = await api.devices.list({ customerId });
            setDeviceCount(devices.length);
        } catch (error) {
            console.error('Error loading customer devices:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        // Reset error
        setError(null);

        // Validate required fields
        if (!formData.name || !formData.phone || !formData.tcNo) {
            setError('Ad Soyad, Telefon ve TC No alanları zorunludur');
            return false;
        }
        
        // Validate TC Number
        if (!validateTcNo(formData.tcNo)) {
            setError('Geçerli bir TC Kimlik numarası giriniz');
            return false;
        }
        
        // Validate phone
        if (!validatePhone(formData.phone)) {
            setError('Geçerli bir telefon numarası giriniz (10 haneli)');
            return false;
        }
        
        // Validate email if provided
        if (formData.email && !validateEmail(formData.email)) {
            setError('Geçerli bir e-posta adresi giriniz');
            return false;
        }
        
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!validateForm()) return;

            setLoading(true);
            
            let result;
            if (customer) {
                result = await api.customers.update(customer.id, formData);
                
                // Notify customer update
                window.notificationService.notify({
                    type: 'info',
                    title: 'Müşteri Güncellendi',
                    message: `${formData.name} müşteri kaydı güncellendi.`,
                    data: { customerId: customer.id }
                });
            } else {
                result = await api.customers.create(formData);
                
                // Notify new customer creation
                window.notificationService.notify({
                    type: 'success',
                    title: 'Yeni Müşteri Kaydı',
                    message: `${formData.name} müşteri kaydı başarıyla oluşturuldu.`,
                    data: { customerId: result.id }
                });
            }
            
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                if (onSubmit) onSubmit(result);
            }, 1500);
        } catch (error) {
            console.error('Customer form error:', error);
            setError('Müşteri kaydedilirken bir hata oluştu');
            
            // Notify error
            window.notificationService.notify({
                type: 'error',
                title: 'Hata',
                message: 'Müşteri kaydı yapılırken bir hata oluştu.'
            });
        } finally {
            setLoading(false);
        }
    };

    const formatPhoneNumber = (value) => {
        // Format phone number as user types: 5XX XXX XX XX
        const cleaned = value.replace(/\D/g, '');
        let formatted = cleaned;
        
        if (cleaned.length > 3) {
            formatted = `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
        }
        if (cleaned.length > 6) {
            formatted = `${formatted.slice(0, 7)} ${formatted.slice(7)}`;
        }
        if (cleaned.length > 8) {
            formatted = `${formatted.slice(0, 10)} ${formatted.slice(10)}`;
        }
        
        return formatted.slice(0, 13);
    };

    const handlePhoneChange = (e) => {
        const formattedPhone = formatPhoneNumber(e.target.value);
        setFormData(prev => ({
            ...prev,
            phone: formattedPhone
        }));
    };

    const handleTcNoChange = (e) => {
        // Only allow numbers and limit to 11 digits
        const value = e.target.value.replace(/\D/g, '').slice(0, 11);
        setFormData(prev => ({
            ...prev,
            tcNo: value
        }));
    };

    return (
        <div className="bg-dark-200 p-6 rounded-lg" data-name="customer-form">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                    {customer ? 'Müşteri Düzenle' : 'Yeni Müşteri'}
                </h2>
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="text-gray-400 hover:text-white"
                        type="button"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    <div className="flex">
                        <i className="fas fa-exclamation-circle mr-2"></i>
                        <span>{error}</span>
                    </div>
                </div>
            )}
            
            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                    <div className="flex">
                        <i className="fas fa-check-circle mr-2"></i>
                        <span>
                            {customer ? 'Müşteri başarıyla güncellendi' : 'Müşteri başarıyla kaydedildi'}
                        </span>
                    </div>
                </div>
            )}

            {customer && deviceCount > 0 && (
                <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6">
                    <div className="flex">
                        <i className="fas fa-info-circle mr-2"></i>
                        <span>Bu müşteriye ait {deviceCount} adet cihaz kaydı bulunmaktadır.</span>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                        <label className="block text-white mb-2">
                            <i className="fas fa-user mr-2 text-blue-500"></i>
                            Ad Soyad <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full bg-dark-300 text-white p-3 rounded border border-dark-400 focus:border-blue-500 focus:outline-none"
                            placeholder="Müşteri adı soyadı"
                            required
                            data-name="customer-name-input"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="block text-white mb-2">
                            <i className="fas fa-id-card mr-2 text-blue-500"></i>
                            TC Kimlik No <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="tcNo"
                            value={formData.tcNo}
                            onChange={handleTcNoChange}
                            className="w-full bg-dark-300 text-white p-3 rounded border border-dark-400 focus:border-blue-500 focus:outline-none"
                            placeholder="11 haneli TC kimlik numarası"
                            required
                            maxLength="11"
                            data-name="customer-tcno-input"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="block text-white mb-2">
                            <i className="fas fa-phone mr-2 text-blue-500"></i>
                            Telefon <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handlePhoneChange}
                            className="w-full bg-dark-300 text-white p-3 rounded border border-dark-400 focus:border-blue-500 focus:outline-none"
                            placeholder="5XX XXX XX XX"
                            required
                            data-name="customer-phone-input"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="block text-white mb-2">
                            <i className="fas fa-envelope mr-2 text-blue-500"></i>
                            E-posta
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-dark-300 text-white p-3 rounded border border-dark-400 focus:border-blue-500 focus:outline-none"
                            placeholder="ornek@email.com"
                            data-name="customer-email-input"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="block text-white mb-2">
                        <i className="fas fa-map-marker-alt mr-2 text-blue-500"></i>
                        Adres
                    </label>
                    <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full bg-dark-300 text-white p-3 rounded border border-dark-400 focus:border-blue-500 focus:outline-none"
                        rows="3"
                        placeholder="Müşteri adresi"
                        data-name="customer-address-input"
                    />
                </div>

                <div className="flex justify-end space-x-4">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="bg-gray-600 text-white px-6 py-3 rounded hover:bg-gray-700 transition duration-200"
                            disabled={loading}
                            data-name="cancel-button"
                        >
                            <i className="fas fa-times mr-2"></i>
                            İptal
                        </button>
                    )}
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition duration-200 flex items-center"
                        disabled={loading}
                        data-name="submit-button"
                    >
                        {loading ? (
                            <>
                                <i className="fas fa-spinner fa-spin mr-2"></i>
                                Kaydediliyor...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-save mr-2"></i>
                                {customer ? 'Güncelle' : 'Kaydet'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
