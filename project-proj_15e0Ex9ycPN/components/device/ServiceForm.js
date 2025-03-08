function ServiceForm({ device, onClose }) {
    const [formData, setFormData] = React.useState({
        registrationNumber: device.registrationNumber,
        customerName: device.customerName,
        customerPhone: device.customerPhone,
        brand: device.brand,
        model: device.model,
        serialNumber: device.serialNumber,
        customerComplaint: device.customerComplaint,
        diagnosis: device.diagnosis || [],
        deviceStatus: device.deviceStatus,
        totalCost: device.totalCost || 0,
        advancePayment: device.advancePayment || 0,
        remainingPayment: device.remainingPayment || 0
    });

    const printRef = React.useRef();

    const handlePrint = () => {
        try {
            const printContent = document.getElementById('service-form-print');
            const originalContent = document.body.innerHTML;
            
            document.body.innerHTML = printContent.innerHTML;
            window.print();
            document.body.innerHTML = originalContent;
            
            // Re-render the component after printing
            window.location.reload();
        } catch (error) {
            reportError(error);
            alert('Yazdırma işlemi başlatılırken bir hata oluştu');
        }
    };

    return (
        <div className="space-y-6" data-name="service-form">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Servis Formu</h2>
                <div className="space-x-4">
                    <button
                        onClick={handlePrint}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                        <i className="fas fa-print mr-2"></i>
                        Yazdır
                    </button>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        >
                            <i className="fas fa-times mr-2"></i>
                            Kapat
                        </button>
                    )}
                </div>
            </div>

            <div id="service-form-print" ref={printRef} className="bg-white text-black p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Servis Formu</h1>
                    <div className="text-xl">#{formData.registrationNumber}</div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="text-lg font-bold mb-4 border-b pb-2">Müşteri Bilgileri</h3>
                        <div className="space-y-2">
                            <div>
                                <span className="font-semibold">Ad Soyad:</span>
                                <span className="ml-2">{formData.customerName}</span>
                            </div>
                            <div>
                                <span className="font-semibold">Telefon:</span>
                                <span className="ml-2">{formData.customerPhone}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold mb-4 border-b pb-2">Cihaz Bilgileri</h3>
                        <div className="space-y-2">
                            <div>
                                <span className="font-semibold">Marka/Model:</span>
                                <span className="ml-2">{formData.brand} {formData.model}</span>
                            </div>
                            <div>
                                <span className="font-semibold">Seri No:</span>
                                <span className="ml-2">{formData.serialNumber || '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="text-lg font-bold mb-4 border-b pb-2">Arıza Bilgileri</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="font-semibold mb-2">Müşteri Şikayeti:</div>
                            <div className="border p-3 rounded">
                                {formData.customerComplaint || '-'}
                            </div>
                        </div>
                        <div>
                            <div className="font-semibold mb-2">Tespit Edilen Arızalar:</div>
                            <div className="border p-3 rounded">
                                {formData.diagnosis.length > 0 ? (
                                    <ul className="list-disc list-inside">
                                        {formData.diagnosis.map((diag, index) => (
                                            <li key={index}>
                                                {DIAGNOSIS_OPTIONS.find(opt => opt.value === diag)?.label || diag}
                                            </li>
                                        ))}
                                    </ul>
                                ) : '-'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="text-lg font-bold mb-4 border-b pb-2">Ücret Bilgileri</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <div className="font-semibold">Toplam Ücret:</div>
                            <div>₺{formData.totalCost}</div>
                        </div>
                        <div>
                            <div className="font-semibold">Alınan Ücret:</div>
                            <div>₺{formData.advancePayment}</div>
                        </div>
                        <div>
                            <div className="font-semibold">Kalan Ücret:</div>
                            <div>₺{formData.remainingPayment}</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mt-12">
                    <div className="text-center">
                        <div className="font-semibold mb-16">Teslim Eden</div>
                        <div className="border-t border-gray-400 pt-2">
                            İmza
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="font-semibold mb-16">Teslim Alan</div>
                        <div className="border-t border-gray-400 pt-2">
                            İmza
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-sm text-gray-500 text-center">
                    <div>Bu form {new Date().toLocaleString('tr-TR')} tarihinde oluşturulmuştur.</div>
                </div>
            </div>
        </div>
    );
}
