function Dashboard() {
    const [stats, setStats] = React.useState({
        pending: 0,
        diagnosing: 0,
        repairing: 0,
        waiting_part: 0,
        completed: 0,
        delivered: 0,
        cancelled: 0
    });
    const [filteredStatus, setFilteredStatus] = React.useState(null);
    const [editingDevice, setEditingDevice] = React.useState(null);
    const [financialStats, setFinancialStats] = React.useState({
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0
    });
    const [loading, setLoading] = React.useState(true);
    const [dateRange, setDateRange] = React.useState('month');
    const [hideFinancials, setHideFinancials] = React.useState(false);

    React.useEffect(() => {
        loadStats();
        loadFinancialStats();

        const interval = setInterval(() => {
            loadStats();
            loadFinancialStats();
        }, 60000);
        return () => clearInterval(interval);
    }, [dateRange]);

    const loadStats = async () => {
        try {
            setLoading(true);
            const devices = await api.devices.list({ dateRange });
            const stats = devices.reduce((acc, device) => {
                const status = device.deviceStatus || device.status;
                acc[status] = (acc[status] || 0) + 1;
                return acc;
            }, { pending: 0, diagnosing: 0, repairing: 0, waiting_part: 0, completed: 0, delivered: 0, cancelled: 0 });
            setStats(stats);
            setLoading(false);
        } catch (error) {
            reportError(error);
            setLoading(false);
        }
    };

    const loadFinancialStats = async () => {
        try {
            const data = await api.reports.financial({ dateRange });
            setFinancialStats({
                totalRevenue: data.totalRevenue || 0,
                totalExpenses: data.totalExpenses || 0,
                netProfit: data.netProfit || 0
            });
        } catch (error) {
            reportError(error);
        }
    };

    const handleStatusClick = (status) => {
        setFilteredStatus(status);
    };

    const handleDeviceEdit = (device) => {
        setEditingDevice(device);
    };

    const handleEditComplete = () => {
        setEditingDevice(null);
        loadStats();
        loadFinancialStats();
    };

    const formatMoney = (value) => {
        if (hideFinancials) return '***';
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    };

    const getTotalDevices = () => {
        return Object.values(stats).reduce((sum, count) => sum + count, 0);
    };

    const getActiveDevices = () => {
        return stats.pending + stats.diagnosing + stats.repairing + stats.waiting_part + stats.completed;
    };

    if (editingDevice) {
        return (
            <DeviceForm 
                device={editingDevice}
                onSubmit={handleEditComplete}
                onCancel={() => setEditingDevice(null)}
            />
        );
    }

    return (
        <div className="space-y-6 dashboard-container" data-name="dashboard-container">
            <div className="dashboard-header">
                <div className="flex items-center">
                    <h2 className="text-2xl font-bold text-white">Servis Takip Paneli</h2>
                    <span className="ml-2 text-sm bg-blue-500 text-white px-2 py-1 rounded-full">
                        {dateRange === 'week' ? 'Haftalık' : dateRange === 'month' ? 'Aylık' : 'Yıllık'}
                    </span>
                </div>
                
                <div className="flex items-center space-x-4">
                    <select 
                        className="bg-dark-300 border-none text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        data-name="date-range-select"
                    >
                        <option value="week">Bu Hafta</option>
                        <option value="month">Bu Ay</option>
                        <option value="year">Bu Yıl</option>
                    </select>
                </div>
            </div>

            <div className="dashboard-summary">
                <div 
                    className="summary-card bg-gradient-to-br from-blue-500 to-blue-700 cursor-pointer"
                    onClick={() => handleStatusClick(null)}
                >
                    <div className="summary-icon">
                        <i className="fas fa-laptop"></i>
                    </div>
                    <div className="summary-data">
                        <div className="summary-value">{getTotalDevices()}</div>
                        <div className="summary-label">Toplam Cihaz</div>
                    </div>
                </div>

                <div 
                    className="summary-card bg-gradient-to-br from-green-500 to-green-700 cursor-pointer"
                    onClick={() => handleStatusClick('active')}
                >
                    <div className="summary-icon">
                        <i className="fas fa-tools"></i>
                    </div>
                    <div className="summary-data">
                        <div className="summary-value">{getActiveDevices()}</div>
                        <div className="summary-label">Aktif Servis</div>
                    </div>
                </div>

                <div 
                    className="summary-card bg-gradient-to-br from-purple-500 to-purple-700 cursor-pointer"
                    onClick={() => handleStatusClick('delivered')}
                >
                    <div className="summary-icon">
                        <i className="fas fa-box"></i>
                    </div>
                    <div className="summary-data">
                        <div className="summary-value">{stats.delivered}</div>
                        <div className="summary-label">Teslim Edilen</div>
                    </div>
                </div>

                <div 
                    className="summary-card bg-gradient-to-br from-yellow-500 to-yellow-700 cursor-pointer"
                    onClick={() => setHideFinancials(!hideFinancials)}
                >
                    <div className="summary-icon">
                        <i className={`fas ${hideFinancials ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </div>
                    <div className="summary-data">
                        <div className="summary-value">{formatMoney(financialStats.totalRevenue)}</div>
                        <div className="summary-label">Toplam Gelir</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="modern-card h-full">
                        <div className="card-header">
                            <h3 className="card-title">
                                <i className="fas fa-chart-pie mr-2"></i>
                                Servis Durumu
                            </h3>
                        </div>
                        <div className="card-body">
                            <div className="h-[300px]">
                                <Charts type="status" data={stats} hideValues={hideFinancials} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modern-card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <i className="fas fa-tasks mr-2"></i>
                            Durum Dağılımı
                        </h3>
                    </div>
                    <div className="card-body">
                        <div className="status-tiles">
                            {STATUS_OPTIONS.map(status => {
                                const count = stats[status.value] || 0;
                                let colorClass = '';
                                
                                switch(status.value) {
                                    case 'pending': colorClass = 'status-pending'; break;
                                    case 'diagnosing': colorClass = 'status-diagnosing'; break;
                                    case 'repairing': colorClass = 'status-repairing'; break;
                                    case 'waiting_part': colorClass = 'status-waiting'; break;
                                    case 'completed': colorClass = 'status-completed'; break;
                                    case 'delivered': colorClass = 'status-delivered'; break;
                                    case 'cancelled': colorClass = 'status-cancelled'; break;
                                    default: colorClass = '';
                                }
                                
                                return (
                                    <div 
                                        key={status.value}
                                        className={`status-tile ${colorClass} cursor-pointer`}
                                        onClick={() => handleStatusClick(status.value)}
                                        data-name={`status-tile-${status.value}`}
                                    >
                                        <div className="status-tile-count">{count}</div>
                                        <div className="status-tile-label">{status.label}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 modern-card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <i className="fas fa-list-alt mr-2"></i>
                            {filteredStatus ? 'Filtrelenmiş Cihazlar' : 'Son İşlemler'}
                        </h3>
                    </div>
                    <div className="card-body p-0">
                        <RecentDevices 
                            filteredStatus={filteredStatus}
                            onEdit={handleDeviceEdit}
                            onUpdate={loadStats}
                            hideFinancials={hideFinancials}
                        />
                    </div>
                </div>

                <div className="modern-card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <i className="fas fa-money-check-alt mr-2"></i>
                            Finansal Özet
                        </h3>
                    </div>
                    <div className="card-body">
                        <div className="financial-summary">
                            <div className="financial-item">
                                <div className="financial-label">Toplam Gelir</div>
                                <div className="financial-value text-green-500">
                                    {formatMoney(financialStats.totalRevenue)}
                                </div>
                            </div>
                            
                            <div className="financial-item">
                                <div className="financial-label">Toplam Gider</div>
                                <div className="financial-value text-red-500">
                                    {formatMoney(financialStats.totalExpenses)}
                                </div>
                            </div>
                            
                            <div className="financial-item total">
                                <div className="financial-label">Net Kar</div>
                                <div className="financial-value text-blue-500">
                                    {formatMoney(financialStats.netProfit)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
