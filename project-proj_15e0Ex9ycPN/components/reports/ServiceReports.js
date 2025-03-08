function ServiceReports({ dateRange }) {
    const [reports, setReports] = React.useState({
        totalServices: 0,
        averageRepairTime: 0,
        successRate: 0,
        servicesByStatus: [],
        servicesByType: [],
        monthlyServices: []
    });
    
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [selectedStatus, setSelectedStatus] = React.useState(null);
    const [deviceList, setDeviceList] = React.useState([]);
    const [showDeviceList, setShowDeviceList] = React.useState(false);
    const [deviceListTitle, setDeviceListTitle] = React.useState('');

    React.useEffect(() => {
        loadReports();
        // Set up auto-refresh every 5 minutes
        const interval = setInterval(loadReports, 300000);
        return () => clearInterval(interval);
    }, [dateRange]);

    const loadReports = async () => {
        try {
            setLoading(true);
            const data = await api.reports.generate(dateRange);
            
            // Process status data
            const statusData = {};
            if (data && data.byStatus) {
                Object.entries(data.byStatus).forEach(([key, value]) => {
                    statusData[key] = value;
                });
            }
            
            setReports({
                totalServices: Number(data?.totalDevices || 0),
                averageRepairTime: Number(data?.averageRepairTime || 0),
                successRate: calculateSuccessRate(statusData),
                servicesByStatus: Object.entries(statusData).map(([status, count]) => ({
                    status,
                    label: STATUS_OPTIONS.find(opt => opt.value === status)?.label || status,
                    count: Number(count || 0)
                })),
                servicesByType: Array.isArray(data?.topIssues) ? data.topIssues : [
                    { name: 'Ekran', count: 15 },
                    { name: 'Batarya', count: 12 },
                    { name: 'Klavye', count: 8 },
                    { name: 'Anakart', count: 6 },
                    { name: 'Diğer', count: 10 }
                ],
                monthlyServices: Array.isArray(data?.monthlyServices) ? data.monthlyServices : []
            });
            setLoading(false);
        } catch (error) {
            reportError(error);
            setError('Raporlar yüklenirken bir hata oluştu');
            setLoading(false);
        }
    };

    const calculateSuccessRate = (byStatus) => {
        if (!byStatus || typeof byStatus !== 'object') return 0;
        const completed = Number(byStatus?.completed || 0) + Number(byStatus?.delivered || 0);
        const total = Object.values(byStatus).reduce((sum, count) => sum + Number(count || 0), 0);
        return total > 0 ? Math.round((completed / total) * 100) : 0;
    };
    
    const handleStatusClick = async (status) => {
        try {
            setSelectedStatus(status);
            setDeviceListTitle(STATUS_OPTIONS.find(s => s.value === status)?.label || status);
            
            // Fetch devices with this status
            const devices = await api.devices.list({ status });
            setDeviceList(devices);
            setShowDeviceList(true);
        } catch (error) {
            reportError(error);
            console.error('Error fetching devices by status:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <i className="fas fa-spinner fa-spin fa-2x mb-3 text-blue-500"></i>
                    <p className="text-gray-400">Servis raporları yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
                <div className="flex items-center">
                    <i className="fas fa-exclamation-triangle text-xl mr-3"></i>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6" data-name="service-reports">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-white text-lg font-semibold mb-1">Toplam Servis</h3>
                            <p className="text-white text-opacity-70 text-sm">Toplam cihaz sayısı</p>
                        </div>
                        <div className="bg-white bg-opacity-20 rounded-full p-3">
                            <i className="fas fa-laptop text-white text-xl"></i>
                        </div>
                    </div>
                    <div className="mt-4">
                        <span className="text-4xl font-bold text-white">{reports.totalServices}</span>
                        <span className="text-white text-opacity-70 ml-2">cihaz</span>
                    </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-white text-lg font-semibold mb-1">Ortalama Süre</h3>
                            <p className="text-white text-opacity-70 text-sm">Tamir süresi</p>
                        </div>
                        <div className="bg-white bg-opacity-20 rounded-full p-3">
                            <i className="fas fa-clock text-white text-xl"></i>
                        </div>
                    </div>
                    <div className="mt-4">
                        <span className="text-4xl font-bold text-white">{reports.averageRepairTime}</span>
                        <span className="text-white text-opacity-70 ml-2">gün</span>
                    </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-white text-lg font-semibold mb-1">Başarı Oranı</h3>
                            <p className="text-white text-opacity-70 text-sm">Tamamlama yüzdesi</p>
                        </div>
                        <div className="bg-white bg-opacity-20 rounded-full p-3">
                            <i className="fas fa-check-circle text-white text-xl"></i>
                        </div>
                    </div>
                    <div className="mt-4">
                        <span className="text-4xl font-bold text-white">%{reports.successRate}</span>
                        <div className="w-full bg-white bg-opacity-20 rounded-full h-2 mt-2">
                            <div 
                                className="bg-white h-2 rounded-full" 
                                style={{ width: `${reports.successRate}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-dark-200 rounded-xl p-6 shadow-md h-[400px]">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <i className="fas fa-chart-pie text-blue-500 mr-2"></i>
                        Durum Dağılımı
                    </h3>
                    <div className="h-[300px] w-full">
                        <Charts 
                            type="status" 
                            data={reports.servicesByStatus.map(item => ({
                                status: item.label,
                                count: item.count
                            }))} 
                        />
                    </div>
                </div>
                
                <div className="bg-dark-200 rounded-xl p-6 shadow-md h-[400px]">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <i className="fas fa-tools text-green-500 mr-2"></i>
                        En Sık Karşılaşılan Sorunlar
                    </h3>
                    <div className="h-[300px] w-full">
                        <Charts type="issues" data={reports.servicesByType} />
                    </div>
                </div>
            </div>

            <div className="bg-dark-200 rounded-xl p-6 shadow-md">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <i className="fas fa-clipboard-list text-yellow-500 mr-2"></i>
                    Servis Durumu Özeti
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {STATUS_OPTIONS.map(status => {
                        const statusItem = reports.servicesByStatus.find(s => s.status === status.value);
                        const count = statusItem ? statusItem.count : 0;
                        
                        let bgColor;
                        switch(status.value) {
                            case 'pending': bgColor = 'bg-yellow-500'; break;
                            case 'diagnosing': bgColor = 'bg-blue-500'; break;
                            case 'repairing': bgColor = 'bg-indigo-500'; break;
                            case 'waiting_part': bgColor = 'bg-orange-500'; break;
                            case 'completed': bgColor = 'bg-green-500'; break;
                            case 'delivered': bgColor = 'bg-purple-500'; break;
                            case 'cancelled': bgColor = 'bg-red-500'; break;
                            default: bgColor = 'bg-gray-500';
                        }
                        
                        return (
                            <div 
                                key={status.value} 
                                className="bg-dark-300 rounded-lg p-4 flex items-center cursor-pointer hover:bg-dark-400 transition-colors"
                                onClick={() => handleStatusClick(status.value)}
                            >
                                <div className={`${bgColor} h-10 w-10 rounded-lg flex items-center justify-center mr-3`}>
                                    <i className="fas fa-laptop text-white"></i>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-sm">{status.label}</div>
                                    <div className="text-xl font-semibold text-white">{count}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {showDeviceList && (
                <div className="bg-dark-200 rounded-xl p-6 shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-white flex items-center">
                            <i className="fas fa-list-ul text-yellow-500 mr-2"></i>
                            {deviceListTitle} Cihazlar
                        </h3>
                        <button 
                            onClick={() => setShowDeviceList(false)} 
                            className="text-gray-400 hover:text-white"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    
                    {deviceList.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <i className="fas fa-search text-4xl mb-3"></i>
                            <p>Bu durumda cihaz bulunamadı</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-dark-300">
                                    <tr>
                                        <th className="text-left p-3 rounded-l-lg">Kayıt No</th>
                                        <th className="text-left p-3">Müşteri</th>
                                        <th className="text-left p-3">Cihaz</th>
                                        <th className="text-left p-3">Giriş Tarihi</th>
                                        <th className="text-left p-3 rounded-r-lg">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {deviceList.map((device, index) => (
                                        <tr key={device.id} className={index % 2 === 0 ? 'bg-dark-300 bg-opacity-30' : ''}>
                                            <td className="p-3">{device.registrationNumber}</td>
                                            <td className="p-3">{device.customerName}</td>
                                            <td className="p-3">{device.brand} {device.model}</td>
                                            <td className="p-3">
                                                {new Date(device.createdAt).toLocaleDateString('tr-TR')}
                                            </td>
                                            <td className="p-3">
                                                <button className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600">
                                                    <i className="fas fa-eye mr-1"></i> Detay
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
