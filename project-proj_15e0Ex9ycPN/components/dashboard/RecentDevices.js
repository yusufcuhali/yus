function RecentDevices({ filteredStatus, onEdit, onUpdate }) {
    const [devices, setDevices] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [showServiceForm, setShowServiceForm] = React.useState(false);
    const [selectedDevice, setSelectedDevice] = React.useState(null);

    const loadDevices = async () => {
        try {
            const params = {};
            if (filteredStatus) {
                params.status = filteredStatus;
            }
            const data = await api.devices.list(params);
            setDevices(data || []);
            setLoading(false);
        } catch (error) {
            reportError(error);
            setError('Cihazlar yüklenirken bir hata oluştu');
            setLoading(false);
        }
    };

    React.useEffect(() => {
        loadDevices();
        const interval = setInterval(loadDevices, 60000);
        return () => clearInterval(interval);
    }, [filteredStatus]);

    const handleStatusChange = async (device, newStatus) => {
        try {
            await api.devices.update(device.id, { ...device, deviceStatus: newStatus });
            
            window.notificationService.notify({
                type: 'info',
                title: 'Durum Güncellendi',
                message: `${device.brand} ${device.model} cihazının durumu "${STATUS_OPTIONS.find(opt => opt.value === newStatus)?.label}" olarak güncellendi.`,
                data: { deviceId: device.id }
            });
            
            await loadDevices();
            if (onUpdate) onUpdate();
        } catch (error) {
            reportError(error);
            alert('Durum güncellenirken bir hata oluştu');
        }
    };

    const handleDelete = async (device) => {
        if (window.confirm(`"${device.registrationNumber}" numaralı cihaz kaydını silmek istediğinizden emin misiniz?`)) {
            try {
                await api.devices.delete(device.id);
                await loadDevices();
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

    const getStatusClass = (status) => {
        switch(status) {
            case 'pending': return 'bg-yellow-500';
            case 'diagnosing': return 'bg-blue-500';
            case 'repairing': return 'bg-indigo-500';
            case 'waiting_part': return 'bg-orange-500';
            case 'completed': return 'bg-green-500';
            case 'delivered': return 'bg-purple-500';
            case 'cancelled': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    if (showServiceForm && selectedDevice) {
        return (
            <ServiceForm 
                device={selectedDevice}
                onClose={() => {
                    setShowServiceForm(false);
                    setSelectedDevice(null);
                    loadDevices();
                }}
            />
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-400">
                <div className="text-center">
                    <i className="fas fa-spinner fa-spin fa-2x mb-3"></i>
                    <p>Yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64 text-red-400">
                <div className="text-center">
                    <i className="fas fa-exclamation-triangle fa-2x mb-3"></i>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (devices.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-400">
                <div className="text-center">
                    <i className="fas fa-laptop fa-2x mb-3"></i>
                    <p>{filteredStatus ? 'Bu durumda cihaz bulunmuyor' : 'Henüz cihaz kaydı bulunmuyor'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-white modern-table">
                <thead>
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
                        <tr key={device.id} className="border-t border-dark-300 hover:bg-dark-300 transition-colors">
                            <td className="p-3">{device.registrationNumber}</td>
                            <td className="p-3">{device.customerName}</td>
                            <td className="p-3">{device.brand} {device.model}</td>
                            <td className="p-3">
                                <div className="flex items-center">
                                    <span className={`w-3 h-3 rounded-full mr-2 ${getStatusClass(device.deviceStatus)}`}></span>
                                    <select
                                        value={device.deviceStatus}
                                        onChange={(e) => handleStatusChange(device, e.target.value)}
                                        className="bg-dark-300 text-white rounded p-1 border border-dark-400"
                                    >
                                        {STATUS_OPTIONS.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </td>
                            <td className="p-3">
                                {new Date(device.createdAt).toLocaleDateString('tr-TR')}
                            </td>
                            <td className="p-3">
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => onEdit(device)}
                                        className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                        title="Düzenle"
                                    >
                                        <i className="fas fa-edit"></i>
                                    </button>
                                    <button
                                        onClick={() => handleServiceForm(device)}
                                        className="p-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                                        title="Servis Formu"
                                    >
                                        <i className="fas fa-file-alt"></i>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(device)}
                                        className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
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
    );
}
