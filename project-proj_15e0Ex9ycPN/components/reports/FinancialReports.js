function FinancialReports({ dateRange, hideFinancials }) {
    const [reports, setReports] = React.useState({
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        monthlyStats: [],
        expectedRevenue: 0,
        pendingPayments: 0,
        deliveredDevices: 0,
        totalDevices: 0
    });
    
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [showDeviceList, setShowDeviceList] = React.useState(false);
    const [deviceListType, setDeviceListType] = React.useState(null);
    const [devices, setDevices] = React.useState([]);
    const [deviceListTitle, setDeviceListTitle] = React.useState('');

    React.useEffect(() => {
        loadFinancialStats();
    }, [dateRange]);

    const loadFinancialStats = async () => {
        try {
            setLoading(true);
            const data = await api.reports.financial({ dateRange });
            setReports({
                totalRevenue: data.totalRevenue || 0,
                totalExpenses: data.totalExpenses || 0,
                netProfit: data.netProfit || 0,
                monthlyStats: data.monthlyStats || [],
                expectedRevenue: data.expectedRevenue || 0,
                pendingPayments: data.pendingPayments || 0,
                deliveredDevices: data.deliveredDevices || 0,
                totalDevices: data.totalDevices || 0
            });
            setLoading(false);
        } catch (error) {
            reportError(error);
            setError('Finansal veriler yüklenirken bir hata oluştu');
            setLoading(false);
        }
    };

    const formatMoney = (value) => {
        if (hideFinancials) return '***';
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value || 0);
    };

    const loadDevices = async (type) => {
        try {
            setDeviceListType(type);
            let title = '';
            let params = {};

            switch (type) {
                case 'delivered':
                    title = 'Teslim Edilen Cihazlar';
                    params.status = 'delivered';
                    break;
                case 'pending':
                    title = 'Bekleyen Cihazlar';
                    params.status = ['pending', 'diagnosing', 'repairing', 'waiting_part'];
                    break;
                case 'remainingPayment':
                    title = 'Ödemesi Bekleyen Cihazlar';
                    params.remainingPayment = true;
                    break;
                case 'profit':
                    title = 'Gider Detayları';
                    params.expenses = true;
                    break;
                default:
                    return;
            }

            const data = await api.devices.list(params);
            setDevices(data);
            setDeviceListTitle(title);
            setShowDeviceList(true);
        } catch (error) {
            reportError(error);
            setError('Cihaz listesi yüklenirken bir hata oluştu');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <i className="fas fa-spinner fa-spin fa-2x mb-3 text-blue-500"></i>
                    <p className="text-gray-400">Finansal raporlar yükleniyor...</p>
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
        <div className="space-y-6" data-name="financial-reports">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div 
                    className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    onClick={() => loadDevices('delivered')}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-white text-lg font-semibold mb-1">Gerçekleşen Gelir</h3>
                            <p className="text-white text-opacity-70 text-sm">Teslim edilen cihazlardan</p>
                        </div>
                        <div className="bg-white bg-opacity-20 rounded-full p-3">
                            <i className="fas fa-money-bill-wave text-white text-xl"></i>
                        </div>
                    </div>
                    <div className="mt-4">
                        <span className="text-3xl font-bold text-white">{formatMoney(reports.totalRevenue)}</span>
                        <div className="text-white text-opacity-70 mt-2 flex items-center">
                            <i className="fas fa-box mr-1"></i>
                            <span>{reports.deliveredDevices} teslim edilen cihaz</span>
                        </div>
                    </div>
                </div>
                
                <div 
                    className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    onClick={() => loadDevices('pending')}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-white text-lg font-semibold mb-1">Beklenen Gelir</h3>
                            <p className="text-white text-opacity-70 text-sm">İşlemdeki cihazlardan</p>
                        </div>
                        <div className="bg-white bg-opacity-20 rounded-full p-3">
                            <i className="fas fa-clock text-white text-xl"></i>
                        </div>
                    </div>
                    <div className="mt-4">
                        <span className="text-3xl font-bold text-white">{formatMoney(reports.expectedRevenue)}</span>
                        <div className="text-white text-opacity-70 mt-2 flex items-center">
                            <i className="fas fa-tools mr-1"></i>
                            <span>{reports.totalDevices - reports.deliveredDevices} bekleyen cihaz</span>
                        </div>
                    </div>
                </div>

                <div 
                    className="bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-xl p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    onClick={() => loadDevices('remainingPayment')}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-white text-lg font-semibold mb-1">Tahsil Edilecek</h3>
                            <p className="text-white text-opacity-70 text-sm">Kalan ödemeler</p>
                        </div>
                        <div className="bg-white bg-opacity-20 rounded-full p-3">
                            <i className="fas fa-hand-holding-usd text-white text-xl"></i>
                        </div>
                    </div>
                    <div className="mt-4">
                        <span className="text-3xl font-bold text-white">{formatMoney(reports.pendingPayments)}</span>
                        <div className="text-white text-opacity-70 mt-2">
                            Teslim edilen cihazlardan kalan
                        </div>
                    </div>
                </div>
                
                <div 
                    className="bg-gradient-to-br from-red-500 to-red-700 rounded-xl p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    onClick={() => loadDevices('profit')}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-white text-lg font-semibold mb-1">Giderler</h3>
                            <p className="text-white text-opacity-70 text-sm">Toplam harcamalar</p>
                        </div>
                        <div className="bg-white bg-opacity-20 rounded-full p-3">
                            <i className="fas fa-file-invoice-dollar text-white text-xl"></i>
                        </div>
                    </div>
                    <div className="mt-4">
                        <span className="text-3xl font-bold text-white">{formatMoney(reports.totalExpenses)}</span>
                        <div className="text-white text-opacity-70 mt-2">
                            Dönem içindeki tüm giderler
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-dark-200 rounded-xl p-6 shadow-md" style={{height: "400px"}}>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <i className="fas fa-chart-line text-blue-500 mr-2"></i>
                        Aylık Gelir Grafiği
                    </h3>
                    <div className="h-[320px] w-full overflow-hidden">
                        <Charts type="revenue" data={reports.monthlyStats} hideValues={hideFinancials} />
                    </div>
                </div>
                
                <div className="bg-dark-200 rounded-xl p-6 shadow-md">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <i className="fas fa-calculator text-green-500 mr-2"></i>
                        Finansal Özet
                    </h3>
                    <div className="space-y-4">
                        <div className="bg-dark-300 rounded-lg p-4">
                            <div className="text-gray-400 text-sm">Toplam Gelir</div>
                            <div className="text-xl font-semibold text-green-500">{formatMoney(reports.totalRevenue)}</div>
                        </div>
                        
                        <div className="bg-dark-300 rounded-lg p-4">
                            <div className="text-gray-400 text-sm">Toplam Gider</div>
                            <div className="text-xl font-semibold text-red-500">{formatMoney(reports.totalExpenses)}</div>
                        </div>
                        
                        <div className="bg-dark-300 rounded-lg p-4 border-l-4 border-blue-500">
                            <div className="text-gray-400 text-sm">Net Kar</div>
                            <div className="text-xl font-semibold text-blue-500">{formatMoney(reports.netProfit)}</div>
                        </div>
                        
                        <div className="bg-dark-300 rounded-lg p-4">
                            <div className="text-gray-400 text-sm">Kar Marjı</div>
                            <div className="text-xl font-semibold text-purple-500">
                                {reports.totalRevenue > 0 ? 
                                    `%${((reports.netProfit / reports.totalRevenue) * 100).toFixed(1)}` : 
                                    '%0'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showDeviceList && (
                <div className="bg-dark-200 rounded-xl p-6 shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-white flex items-center">
                            <i className="fas fa-list-ul text-yellow-500 mr-2"></i>
                            {deviceListTitle}
                        </h3>
                        <button 
                            onClick={() => setShowDeviceList(false)} 
                            className="text-gray-400 hover:text-white"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    
                    {devices.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <i className="fas fa-search text-4xl mb-3"></i>
                            <p>Bu kategoride cihaz bulunamadı</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-dark-300">
                                    <tr>
                                        <th className="text-left p-3 rounded-l-lg">Kayıt No</th>
                                        <th className="text-left p-3">Müşteri</th>
                                        <th className="text-left p-3">Cihaz</th>
                                        <th className="text-left p-3">Durum</th>
                                        <th className="text-right p-3 rounded-r-lg">Tutar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {devices.map((device, index) => (
                                        <tr key={device.id} className={index % 2 === 0 ? 'bg-dark-300 bg-opacity-30' : ''}>
                                            <td className="p-3">{device.registrationNumber}</td>
                                            <td className="p-3">{device.customerName}</td>
                                            <td className="p-3">{device.brand} {device.model}</td>
                                            <td className="p-3">
                                                {STATUS_OPTIONS.find(s => s.value === device.deviceStatus)?.label || device.deviceStatus}
                                            </td>
                                            <td className="p-3 text-right">
                                                {deviceListType === 'profit' ? 
                                                    formatMoney(device.amount) : 
                                                    formatMoney(device.totalCost)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-dark-300">
                                    <tr>
                                        <td colSpan="4" className="p-3 font-semibold text-right">Toplam:</td>
                                        <td className="p-3 text-right font-semibold">
                                            {deviceListType === 'profit' ? 
                                                formatMoney(devices.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)) : 
                                                formatMoney(devices.reduce((sum, item) => sum + (Number(item.totalCost) || 0), 0))}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-dark-200 rounded-xl p-6 shadow-md" style={{height: "400px"}}>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <i className="fas fa-chart-pie text-purple-500 mr-2"></i>
                        Gider Dağılımı
                    </h3>
                    <div className="h-[320px] w-full overflow-hidden">
                        <Charts type="expenses" />
                    </div>
                </div>
                
                <div className="bg-dark-200 rounded-xl p-6 shadow-md">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <i className="fas fa-chart-bar text-yellow-500 mr-2"></i>
                        Gelir Analizi
                    </h3>
                    <div className="space-y-4">
                        <div className="bg-dark-300 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-400">Toplam Cihaz</span>
                                <span className="font-semibold">{reports.totalDevices}</span>
                            </div>
                            <div className="w-full bg-dark-400 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{width: '100%'}}></div>
                            </div>
                        </div>
                        
                        <div className="bg-dark-300 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-400">Teslim Edilen</span>
                                <span className="font-semibold">{reports.deliveredDevices}</span>
                            </div>
                            <div className="w-full bg-dark-400 rounded-full h-2">
                                <div 
                                    className="bg-green-500 h-2 rounded-full" 
                                    style={{
                                        width: reports.totalDevices > 0 ? 
                                            `${(reports.deliveredDevices / reports.totalDevices) * 100}%` : '0%'
                                    }}
                                ></div>
                            </div>
                        </div>
                        
                        <div className="bg-dark-300 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-400">Cihaz Başı Ortalama Gelir</span>
                                <span className="font-semibold">
                                    {formatMoney(
                                        reports.deliveredDevices > 0 ? 
                                        reports.totalRevenue / reports.deliveredDevices : 0
                                    )}
                                </span>
                            </div>
                        </div>
                        
                        <div className="bg-dark-300 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-400">Tahsilat Oranı</span>
                                <span className="font-semibold">
                                    {reports.totalRevenue > 0 ? 
                                        `%${(((reports.totalRevenue - reports.pendingPayments) / reports.totalRevenue) * 100).toFixed(1)}` : 
                                        '%0'}
                                </span>
                            </div>
                            <div className="w-full bg-dark-400 rounded-full h-2">
                                <div 
                                    className="bg-yellow-500 h-2 rounded-full" 
                                    style={{
                                        width: reports.totalRevenue > 0 ? 
                                            `${((reports.totalRevenue - reports.pendingPayments) / reports.totalRevenue) * 100}%` : '0%'
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
