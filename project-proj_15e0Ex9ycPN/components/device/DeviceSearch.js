function DeviceSearch() {
    const [searchParams, setSearchParams] = React.useState({
        keyword: '',
        status: '',
        dateFrom: '',
        dateTo: '',
        sortBy: 'createdAt'
    });
    
    const [devices, setDevices] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [showServiceForm, setShowServiceForm] = React.useState(false);
    const [selectedDevice, setSelectedDevice] = React.useState(null);
    const [editingDevice, setEditingDevice] = React.useState(null);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        try {
            setLoading(true);
            const data = await api.devices.list(searchParams);
            setDevices(data);
            setError(null);
        } catch (error) {
            reportError(error);
            setError('Cihazlar aranırken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        handleSearch();
    }, []);

    const handleParamChange = (e) => {
        const { name, value } = e.target;
        setSearchParams(prev => ({ ...prev, [name]: value }));
    };

    const handleEdit = (device) => {
        setEditingDevice(device);
    };

    const handleDelete = async (device) => {
        if (window.confirm(`"${device.registrationNumber}" numaralı cihaz kaydını silmek istediğinizden emin misiniz?`)) {
            try {
                await api.devices.delete(device.id);
                handleSearch();
                window.notificationService.notify({
                    type: 'success',
                    title: 'Cihaz Silindi',
                    message: `${device.registrationNumber} numaralı cihaz başarıyla silindi.`
                });
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

    const handleServiceForm = (device) => {
        setSelectedDevice(device);
        setShowServiceForm(true);
    };

    const handleStatusChange = async (device, newStatus) => {
        try {
            await api.devices.update(device.id, { ...device, deviceStatus: newStatus });
            handleSearch();
            window.notificationService.notify({
                type: 'success',
                title: 'Durum Güncellendi',
                message: `${device.registrationNumber} numaralı cihazın durumu güncellendi.`
            });
        } catch (error) {
            reportError(error);
            window.notificationService.notify({
                type: 'error',
                title: 'Hata',
                message: 'Durum güncellenirken bir hata oluştu.'
            });
        }
    };

    if (showServiceForm && selectedDevice) {
        return (
            <ServiceForm 
                device={selectedDevice} 
                onClose={() => {
                    setShowServiceForm(false);
                    setSelectedDevice(null);
                    handleSearch();
                }} 
            />
        );
    }

    if (editingDevice) {
        return (
            <DeviceForm 
                device={editingDevice}
                onSubmit={() => {
                    setEditingDevice(null);
                    handleSearch();
                }}
                onCancel={() => setEditingDevice(null)}
            />
        );
    }

    return (
        <div className="space-y-6" data-name="device-search">
            <h2 className="text-2xl font-bold text-white">Cihaz Arama</h2>

            <div className="bg-dark-200 p-4 rounded">
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-white mb-2">Arama</label>
                        <input
                            type="text"
                            name="keyword"
                            value={searchParams.keyword}
                            onChange={handleParamChange}
                            className="w-full bg-dark-300 text-white p-2 rounded"
                            placeholder="Kayıt no, müşteri adı..."
                        />
                    </div>
                    <div>
                        <label className="block text-white mb-2">Durum</label>
                        <select
                            name="status"
                            value={searchParams.status}
                            onChange={handleParamChange}
                            className="w-full bg-dark-300 text-white p-2 rounded"
                        >
                            <option value="">Tümü</option>
                            {STATUS_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-white mb-2">Başlangıç Tarihi</label>
                        <input
                            type="date"
                            name="dateFrom"
                            value={searchParams.dateFrom}
                            onChange={handleParamChange}
                            className="w-full bg-dark-300 text-white p-2 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-white mb-2">Bitiş Tarihi</label>
                        <input
                            type="date"
                            name="dateTo"
                            value={searchParams.dateTo}
                            onChange={handleParamChange}
                            className="w-full bg-dark-300 text-white p-2 rounded"
                        />
                    </div>
                    <div className="md:col-span-4 flex justify-end">
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            disabled={loading}
                        >
                            {loading ? (
                                <span><i className="fas fa-spinner fa-spin mr-2"></i>Aranıyor...</span>
                            ) : (
                                <span><i className="fas fa-search mr-2"></i>Ara</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <i className="fas fa-exclamation-circle mr-2"></i>
                    {error}
                </div>
            ) : devices.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                    {searchParams.keyword || searchParams.status ? 
                        'Arama kriterlerine uygun cihaz bulunamadı' : 
                        'Henüz cihaz kaydı bulunmuyor'}
                </div>
            ) : (
                <div className="bg-dark-200 p-4 rounded overflow-x-auto">
                    <table className="w-full text-white">
                        <thead className="bg-dark-300">
                            <tr>
                                <th className="p-3 text-left">Kayıt No</th>
                                <th className="p-3 text-left">Müşteri</th>
                                <th className="p-3 text-left">Cihaz</th>
                                <th className="p-3 text-left">Durum</th>
                                <th className="p-3 text-left">Tarih</th>
                                <th className="p-3 text-left">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {devices.map(device => (
                                <tr key={device.id} className="border-t border-dark-300">
                                    <td className="p-3">{device.registrationNumber}</td>
                                    <td className="p-3">
                                        <div>{device.customerName}</div>
                                        <div className="text-sm text-gray-400">{device.customerPhone}</div>
                                    </td>
                                    <td className="p-3">{device.brand} {device.model}</td>
                                    <td className="p-3">
                                        <select
                                            value={device.deviceStatus}
                                            onChange={(e) => handleStatusChange(device, e.target.value)}
                                            className="bg-dark-300 text-white p-1 rounded"
                                        >
                                            {STATUS_OPTIONS.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="p-3">
                                        {new Date(device.createdAt).toLocaleDateString('tr-TR')}
                                    </td>
                                    <td className="p-3">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEdit(device)}
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
                                                onClick={() => handleDelete(device)}
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
    );
}
