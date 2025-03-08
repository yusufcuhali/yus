function ProblemSection({ formData, handleChange }) {
    const handleDiagnosisChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        handleChange({
            target: {
                name: 'diagnosis',
                value: selectedOptions
            }
        });
    };

    const handlePaymentChange = (e) => {
        const { name, value } = e.target;
        const numValue = value === '' ? 0 : parseFloat(value);
        
        if (name === 'totalCost') {
            const advancePayment = parseFloat(formData.advancePayment) || 0;
            handleChange({
                target: {
                    name: 'totalCost',
                    value: numValue
                }
            });
            handleChange({
                target: {
                    name: 'remainingPayment',
                    value: Math.max(0, numValue - advancePayment)
                }
            });
        } else if (name === 'advancePayment') {
            const totalCost = parseFloat(formData.totalCost) || 0;
            if (numValue <= totalCost) {
                handleChange({
                    target: {
                        name: 'advancePayment',
                        value: numValue
                    }
                });
                handleChange({
                    target: {
                        name: 'remainingPayment',
                        value: Math.max(0, totalCost - numValue)
                    }
                });
            }
        }
    };

    return (
        <div className="bg-dark-300 p-6 rounded-lg shadow-inner">
            <h3 className="text-xl font-semibold mb-6 text-white flex items-center">
                <i className="fas fa-tools mr-2 text-yellow-500"></i>
                Arıza ve Ücret Bilgileri
            </h3>
            
            <div className="space-y-6">
                <div className="form-group">
                    <label className="block text-white mb-2 font-medium">
                        <i className="fas fa-comment-alt mr-2 text-yellow-500"></i>
                        Müşteri Şikayeti <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        name="customerComplaint"
                        value={formData.customerComplaint || ''}
                        onChange={handleChange}
                        className="w-full bg-dark-400 text-white p-3 rounded-lg border border-dark-500 focus:border-blue-500 focus:outline-none"
                        rows="3"
                        placeholder="Müşterinin bildirdiği sorun"
                        required
                        data-name="customer-complaint-textarea"
                    />
                </div>
                
                <div className="form-group">
                    <label className="block text-white mb-2 font-medium">
                        <i className="fas fa-stethoscope mr-2 text-yellow-500"></i>
                        Tespit Edilen Arızalar
                    </label>
                    <select
                        multiple
                        name="diagnosis"
                        value={formData.diagnosis || []}
                        onChange={handleDiagnosisChange}
                        className="w-full bg-dark-400 text-white p-3 rounded-lg border border-dark-500 focus:border-blue-500 focus:outline-none"
                        size="4"
                        data-name="diagnosis-select"
                    >
                        {DIAGNOSIS_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <p className="text-gray-400 text-sm mt-1">
                        <i className="fas fa-info-circle mr-1"></i>
                        Birden fazla seçim için CTRL tuşunu basılı tutun
                    </p>
                </div>
                
                {formData.diagnosis?.includes('custom') && (
                    <div className="form-group">
                        <label className="block text-white mb-2 font-medium">
                            <i className="fas fa-pen-alt mr-2 text-yellow-500"></i>
                            Diğer Arıza
                        </label>
                        <input
                            type="text"
                            name="customDiagnosis"
                            value={formData.customDiagnosis || ''}
                            onChange={handleChange}
                            className="w-full bg-dark-400 text-white p-3 rounded-lg border border-dark-500 focus:border-blue-500 focus:outline-none"
                            placeholder="Diğer arıza açıklaması"
                            data-name="custom-diagnosis-input"
                        />
                    </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="form-group">
                        <label className="block text-white mb-2 font-medium">
                            <i className="fas fa-money-bill mr-2 text-yellow-500"></i>
                            Toplam Ücret
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                name="totalCost"
                                value={formData.totalCost || ''}
                                onChange={handlePaymentChange}
                                min="0"
                                step="0.01"
                                className="w-full bg-dark-400 text-white p-3 rounded-lg border border-dark-500 focus:border-blue-500 focus:outline-none pl-8"
                                data-name="total-cost-input"
                            />
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">₺</span>
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label className="block text-white mb-2 font-medium">
                            <i className="fas fa-hand-holding-usd mr-2 text-yellow-500"></i>
                            Alınan Ücret
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                name="advancePayment"
                                value={formData.advancePayment || ''}
                                onChange={handlePaymentChange}
                                min="0"
                                max={formData.totalCost || 0}
                                step="0.01"
                                className="w-full bg-dark-400 text-white p-3 rounded-lg border border-dark-500 focus:border-blue-500 focus:outline-none pl-8"
                                data-name="advance-payment-input"
                            />
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">₺</span>
                            {parseFloat(formData.advancePayment) > parseFloat(formData.totalCost) && (
                                <p className="text-red-500 text-sm mt-1">
                                    Alınan ücret toplam ücretten fazla olamaz
                                </p>
                            )}
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label className="block text-white mb-2 font-medium">
                            <i className="fas fa-calculator mr-2 text-yellow-500"></i>
                            Kalan Ücret
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                name="remainingPayment"
                                value={formData.remainingPayment || ''}
                                readOnly
                                className="w-full bg-dark-400 text-white p-3 rounded-lg border border-dark-500 pl-8 cursor-not-allowed"
                                data-name="remaining-payment-input"
                            />
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">₺</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
