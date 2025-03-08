function DeviceSection({ formData, handleChange }) {
    const [photoPreview, setPhotoPreview] = React.useState(formData.devicePhoto || null);
    
    // Watch for device status changes to set delivery date
    React.useEffect(() => {
        if (formData.deviceStatus === 'delivered' && !formData.deliveryDate) {
            handleChange({
                target: {
                    name: 'deliveryDate',
                    value: new Date().toISOString().split('T')[0]
                }
            });
        }
    }, [formData.deviceStatus]);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleChange({
                    target: {
                        name: 'devicePhoto',
                        value: reader.result
                    }
                });
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removePhoto = () => {
        handleChange({
            target: {
                name: 'devicePhoto',
                value: null
            }
        });
        setPhotoPreview(null);
    };

    return (
        <div className="bg-dark-300 p-6 rounded-lg shadow-inner">
            <h3 className="text-xl font-semibold mb-6 text-white flex items-center">
                <i className="fas fa-laptop mr-2 text-green-500"></i>
                Cihaz Bilgileri
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                    <label className="block text-white mb-2 font-medium">
                        <i className="fas fa-tag mr-2 text-green-500"></i>
                        Marka <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="brand"
                        value={formData.brand}
                        onChange={handleChange}
                        className="w-full bg-dark-400 text-white p-3 rounded-lg border border-dark-500 focus:border-blue-500 focus:outline-none"
                        required
                        data-name="device-brand-select"
                    >
                        <option value="">Seçiniz</option>
                        {BRAND_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                
                {formData.brand === 'custom' && (
                    <div className="form-group">
                        <label className="block text-white mb-2 font-medium">
                            <i className="fas fa-pen mr-2 text-green-500"></i>
                            Diğer Marka <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="customBrand"
                            value={formData.customBrand || ''}
                            onChange={handleChange}
                            className="w-full bg-dark-400 text-white p-3 rounded-lg border border-dark-500 focus:border-blue-500 focus:outline-none"
                            placeholder="Marka adını giriniz"
                            required
                            data-name="custom-brand-input"
                        />
                    </div>
                )}
                
                <div className="form-group">
                    <label className="block text-white mb-2 font-medium">
                        <i className="fas fa-info-circle mr-2 text-green-500"></i>
                        Model <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="model"
                        value={formData.model || ''}
                        onChange={handleChange}
                        className="w-full bg-dark-400 text-white p-3 rounded-lg border border-dark-500 focus:border-blue-500 focus:outline-none"
                        placeholder="Cihaz modeli"
                        required
                        data-name="device-model-input"
                    />
                </div>
                
                <div className="form-group">
                    <label className="block text-white mb-2 font-medium">
                        <i className="fas fa-barcode mr-2 text-green-500"></i>
                        Seri No
                    </label>
                    <input
                        type="text"
                        name="serialNumber"
                        value={formData.serialNumber || ''}
                        onChange={handleChange}
                        className="w-full bg-dark-400 text-white p-3 rounded-lg border border-dark-500 focus:border-blue-500 focus:outline-none"
                        placeholder="Cihaz seri numarası"
                        data-name="device-serial-input"
                    />
                </div>

                <div className="form-group">
                    <label className="block text-white mb-2 font-medium">
                        <i className="fas fa-calendar-check mr-2 text-green-500"></i>
                        Giriş Tarihi <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        name="entryDate"
                        value={formData.entryDate || new Date().toISOString().split('T')[0]}
                        onChange={handleChange}
                        className="w-full bg-dark-400 text-white p-3 rounded-lg border border-dark-500 focus:border-blue-500 focus:outline-none"
                        required
                        data-name="device-entry-date"
                    />
                </div>

                <div className="form-group">
                    <label className="block text-white mb-2 font-medium">
                        <i className="fas fa-calendar-alt mr-2 text-green-500"></i>
                        Teslim Tarihi
                    </label>
                    <input
                        type="date"
                        name="deliveryDate"
                        value={formData.deliveryDate || ''}
                        onChange={handleChange}
                        className="w-full bg-dark-400 text-white p-3 rounded-lg border border-dark-500 focus:border-blue-500 focus:outline-none"
                        disabled={formData.deviceStatus !== 'delivered'}
                        data-name="device-delivery-date"
                    />
                    {formData.deviceStatus !== 'delivered' && (
                        <p className="text-sm text-gray-400 mt-1">
                            <i className="fas fa-info-circle mr-1"></i>
                            Teslim tarihi, cihaz teslim edildi durumuna geçince otomatik oluşturulacak
                        </p>
                    )}
                </div>
                
                <div className="form-group">
                    <label className="block text-white mb-2 font-medium">
                        <i className="fas fa-tasks mr-2 text-green-500"></i>
                        Cihaz Durumu
                    </label>
                    <select
                        name="deviceStatus"
                        value={formData.deviceStatus}
                        onChange={handleChange}
                        className="w-full bg-dark-400 text-white p-3 rounded-lg border border-dark-500 focus:border-blue-500 focus:outline-none"
                        data-name="device-status-select"
                    >
                        {STATUS_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="mt-6">
                <label className="block text-white mb-2 font-medium">
                    <i className="fas fa-camera mr-2 text-green-500"></i>
                    Cihaz Fotoğrafı
                </label>
                
                <div className="bg-dark-400 p-4 rounded-lg border border-dashed border-dark-500">
                    {photoPreview ? (
                        <div className="relative">
                            <img 
                                src={photoPreview} 
                                alt="Cihaz Fotoğrafı" 
                                className="max-w-full h-auto max-h-64 mx-auto rounded-lg"
                                data-name="device-photo-preview"
                            />
                            <button
                                type="button"
                                onClick={removePhoto}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                                data-name="remove-photo-button"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="mb-4">
                                <i className="fas fa-camera text-gray-400 text-4xl"></i>
                            </div>
                            <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 inline-block">
                                <i className="fas fa-upload mr-2"></i>
                                Fotoğraf Yükle
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={handlePhotoChange}
                                    data-name="device-photo-input"
                                />
                            </label>
                            <p className="text-gray-400 mt-2 text-sm">
                                Cihazın mevcut durumunu belgelemek için bir fotoğraf ekleyin
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
