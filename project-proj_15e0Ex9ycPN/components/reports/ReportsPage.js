function ReportsPage() {
    const [activeTab, setActiveTab] = React.useState('financial');
    const [dateRange, setDateRange] = React.useState('month');
    const [hideFinancials, setHideFinancials] = React.useState(false);
    const [isRefreshing, setIsRefreshing] = React.useState(false);

    const handleRefresh = async () => {
        try {
            setIsRefreshing(true);
            // Just a visual delay to show the refresh is happening
            await new Promise(resolve => setTimeout(resolve, 1000));
            setIsRefreshing(false);
        } catch (error) {
            reportError(error);
            setIsRefreshing(false);
        }
    };

    return (
        <div className="reports-container space-y-6" data-name="reports-page">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Raporlar</h1>
                    <p className="text-gray-400 mt-1">
                        <i className="fas fa-chart-line mr-2"></i>
                        Servis ve finansal verilerin analizi
                    </p>
                </div>
                
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setHideFinancials(!hideFinancials)}
                        className="bg-dark-300 text-white p-2 rounded hover:bg-dark-400"
                        title={hideFinancials ? "Finansal değerleri göster" : "Finansal değerleri gizle"}
                        data-name="toggle-financials"
                    >
                        <i className={`fas ${hideFinancials ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                    </button>
                    
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="bg-dark-300 text-white p-2 rounded border-none focus:ring-2 focus:ring-blue-500"
                        data-name="date-range-select"
                    >
                        <option value="day">Bugün</option>
                        <option value="week">Bu Hafta</option>
                        <option value="month">Bu Ay</option>
                        <option value="year">Bu Yıl</option>
                    </select>
                    
                    <button 
                        onClick={handleRefresh}
                        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
                        disabled={isRefreshing}
                        data-name="refresh-button"
                    >
                        <i className={`fas fa-sync-alt ${isRefreshing ? 'fa-spin' : ''}`}></i>
                    </button>
                </div>
            </div>
            
            <div className="bg-dark-200 rounded-lg shadow-md overflow-hidden">
                <div className="border-b border-dark-300">
                    <div className="flex">
                        <button
                            className={`px-6 py-3 text-sm font-medium ${
                                activeTab === 'financial' 
                                    ? 'text-blue-500 border-b-2 border-blue-500' 
                                    : 'text-gray-400 hover:text-gray-300'
                            }`}
                            onClick={() => setActiveTab('financial')}
                            data-name="financial-tab"
                        >
                            <i className="fas fa-money-bill-wave mr-2"></i>
                            Finansal Raporlar
                        </button>
                        <button
                            className={`px-6 py-3 text-sm font-medium ${
                                activeTab === 'service' 
                                    ? 'text-blue-500 border-b-2 border-blue-500' 
                                    : 'text-gray-400 hover:text-gray-300'
                            }`}
                            onClick={() => setActiveTab('service')}
                            data-name="service-tab"
                        >
                            <i className="fas fa-tools mr-2"></i>
                            Servis Raporları
                        </button>
                    </div>
                </div>
                
                <div className="p-6">
                    {activeTab === 'financial' ? (
                        <FinancialReports dateRange={dateRange} hideFinancials={hideFinancials} />
                    ) : (
                        <ServiceReports dateRange={dateRange} />
                    )}
                </div>
            </div>
        </div>
    );
}
