window.Settings = function Settings() {
    const [activeTab, setActiveTab] = React.useState('general');

    return (
        <div className="space-y-6" data-name="settings-page">
            <h2 className="text-2xl font-bold text-white">Ayarlar</h2>

            <div className="flex space-x-4 border-b border-dark-300">
                <button
                    className={`px-4 py-2 ${activeTab === 'general' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
                    onClick={() => setActiveTab('general')}
                >
                    Genel Ayarlar
                </button>
                <button
                    className={`px-4 py-2 ${activeTab === 'reports' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
                    onClick={() => setActiveTab('reports')}
                >
                    Rapor Ayarları
                </button>
            </div>

            <div className="bg-dark-200 p-6 rounded-lg">
                {activeTab === 'general' && <GeneralSettingsTab />}
                {activeTab === 'reports' && <ReportSettingsTab />}
            </div>
        </div>
    );
}
