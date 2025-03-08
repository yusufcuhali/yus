function CustomerDetail({ customer, onBack, onUpdate }) {
    const [devices, setDevices] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [showEditForm, setShowEditForm] = React.useState(false);
    const [showDeviceForm, setShowDeviceForm] = React.useState(false);
    const [selectedDevice, setSelectedDevice] = React.useState(null);
    const [showServiceForm, setShowServiceForm] = React.useState(false);
    const [stats, setStats] = React.useState({
        totalRevenue: 0,
        totalPaid: 0,
        remainingBalance: 0
    });

    React.useEffect(() => {
        loadCustomerDevices();
    }, [customer.id]);

    const loadCustomerDevices = async () => {
        try {
            const data = await api.devices.list({ customerId: customer.id });
            setDevices(data);

            // Calculate financial stats
            const totalRevenue = data.reduce((sum, device) => sum + (Number(device.totalCost) || 0), 0);
            const totalPaid = data.reduce((sum, device) => sum + (Number(device.advancePayment) || 0), 0);
            const remainingBalance = totalRevenue - totalPaid;

            setStats({
                totalRevenue,
                totalPaid,
                remainingBalance
            });

            setLoading(false);
        } catch (error) {
            reportError(error);
            setError('Cihazlar yüklenirken bir hata oluştu');
            setLoading(false);
        }
    };

    const handleEditDevice = (device) => {
        setSelectedDevice(device);
        setShowDeviceForm(true);
    };

    const handleServiceForm = (device) => {
        setSelectedDevice(device);
        setShowServiceForm(true);
    };

    const handleDeleteDevice = async (device) => {
        if (window.confirm(`"${device.registrationNumber}" numaralı cihaz kaydını silmek istediğinizden emin misiniz?`)) {
            try {
                await api.devices.delete(device.id);
                window.notificationService.notify({
                    type: 'success',
                    title: 'Cihaz Silindi',
                    message: `${device.registrationNumber} numaralı cihaz başarıyla silindi.`
                });
                loadCustomerDevices();
            } catch (error) {
                reportError(error);
                window.notificationService.notify({
                    type: 'error',
                    title: 'Hata',
                    message: 'Cihaz silinirken bir hata oluştu.'
                });
            }
        }
    };

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
        }).format(amount);
    };

    if (showServiceForm && selectedDevice) {
        return (
            <ServiceForm
                device={selectedDevice}
                onClose={() => {
                    setShowServiceForm(false);
                    setSelectedDevice(null);
                    loadCustomerDevices();
                }}
            />
        );
    }

    if (showDeviceForm) {
        return (
            <DeviceForm
                device={selectedDevice}
                customer={customer}
                onSubmit={() => {
                    setShowDeviceForm(false);
                    setSelectedDevice(null);
                    loadCustomerDevices();
                }}
                onCancel={() => {
                    setShowDeviceForm(false);
                    setSelectedDevice(null);
                }}
            />
        );
    }

    if (showEditForm) {
        return (
            <CustomerForm
                customer={customer}
                onSubmit={() => {
                    setShowEditForm(false);
                    if (onUpdate) onUpdate();
                }}
                onCancel={() => setShowEditForm(false)}
            />
        );
    }

    return (
        <div className="space-y-6" data-name="customer-detail">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={onBack}
                        className="text-gray-400 hover:text-white"
                    >
                        <i className="fas fa-arrow-left"></i>
                    </button>
                    <h2 className="text-2xl font-bold text-white">{customer.name}</h2>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setShowDeviceForm(true)}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                        <i className="fas fa-plus mr-2"></i>
                        Yeni Cihaz
                    </button>
                    <button
                        onClick={() => setShowEditForm(true)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        <i className="fas fa-edit mr-2"></i>
                        Düzenle
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-dark-200 p-4 rounded">
                    <h3 className="text-lg font-semibold mb-4 text-white">Müşteri Bilgileri</h3>
                    <div className="space-y-2">
                        <div>
                            <span className="text-gray-400">TC No:</span>
                            <span className="ml-2 text-white">{customer.tcNo}</span>
                        </div>
                        <div>
                            <span className="text-gray-400">Telefon:</span>
                            <span className="ml-2 text-white">{customer.phone}</span>
                        </div>
                        <div>
                            <span className="text-gray-400">E-posta:</span>
                            <span className="ml-2 text-white">{customer.email || '-'}</span>
                        </div>
                        <div>
                            <span className="text-gray-400">Adres:</span>
                            <p className="mt-1 text-white">{customer.address || '-'}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-dark-200 p-4 rounded">
                    <h3 className="text-lg font-semibold mb-4 text-white">Finansal Özet</h3>
                    <div className="space-y-4">
                        <div className="bg-dark-300 p-4 rounded">
                            <div className="text-sm text-gray-400">Toplam Tutar</div>
                            <div className="text-xl font-bold text-green-500">
                                {formatMoney(stats.totalRevenue)}
                            </div>
                        </div>
                        <div className="bg-dark-300 p-4 rounded">
                            <div className="text-sm text-gray-400">Ödenen Tutar</div>
                            <div className="text-xl font-bold text-blue-500">
                                {formatMoney(stats.totalPaid)}
                            </div>
                        </div>
                        <div className="bg-dark-300 p-4 rounded">
                            <div className="text-sm text-gray-400">Kalan Bakiye</div>
                            <div className="text-xl font-bold text-red-500">
                                {formatMoney(stats.remainingBalance)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-dark-200 p-4 rounded">
                <h3 className="text-lg font-semibold mb-4 text-white">Cihazlar</h3>

                {loading ? (
                    <div className="text-center py-4">
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Yükleniyor...
                    </div>
                ) : error ? (
                    <div className="text-red-500 text-center py-4">
                        <i className="fas fa-exclamation-circle mr-2"></i>
                        {error}
                    </div>
                ) : devices.length === 0 ? (
                    <div className="text-gray-400 text-center py-8">
                        Henüz cihaz kaydı bulunmuyor
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-white">
                            <thead className="bg-dark-300">
                                <tr>
                                    <th className="p-2 text-left">Kayıt No</th>
                                    <th className="p-2 text-left">Cihaz</th>
                                    <th className="p-2 text-left">Durum</th>
                                    <th className="p-2 text-left">Toplam Tutar</th>
                                    <th className="p-2 text-left">Kalan</th>
                                    <th className="p-2 text-left">Tarih</th>
                                    <th className="p-2 text-left">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                {devices.map(device => (
                                    <tr key={device.id} className="border-t border-dark-300">
                                        <td className="p-2">{device.registrationNumber}</td>
                                        <td className="p-2">{device.brand} {device.model}</td>
                                        <td className="p-2">
                                            {STATUS_OPTIONS.find(s => s.value === device.deviceStatus)?.label}
                                        </td>
                                        <td className="p-2">{formatMoney(device.totalCost)}</td>
                                        <td className="p-2">{formatMoney(device.totalCost - device.advancePayment)}</td>
                                        <td className="p-2">
                                            {new Date(device.createdAt).toLocaleDateString('tr-TR')}
                                        </td>
                                        <td className="p-2">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleEditDevice(device)}
                                                    className="text-blue-500 hover:text-blue-700"
                                                    title="Düzenle"
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button
                                                    onClick={() => handleServiceForm(device)}
                                                    className="text-green-500 hover:text-green-700"
                                                    title="Servis Formu"
                                                >
                                                    <i className="fas fa-file-alt"></i>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteDevice(device)}
                                                    className="text-red-500 hover:text-red-700"
                                                    title="Sil"
                                                >
                                                    <i className="fas fa-trash"></i>
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
