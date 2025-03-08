function ReportSettings() {
    const [settings, setSettings] = React.useState({
        daily: {
            enabled: false,
            time: '18:00',
            email: '',
            lastSent: null
        },
        weekly: {
            enabled: false,
            day: 'monday',
            time: '18:00',
            email: '',
            lastSent: null
        },
        monthly: {
            enabled: false,
            day: 1,
            time: '18:00',
            email: '',
            lastSent: null
        },
        emailConfig: {
            server: '',
            port: '',
            username: '',
            password: '',
            secure: true
        }
    });
    
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [success, setSuccess] = React.useState(null);

    React.useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const savedSettings = localStorage.getItem('reportSettings');
            const emailConfig = await api.settings.getEmailConfig();
            
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                setSettings(prev => ({
                    ...parsed,
                    emailConfig: emailConfig || prev.emailConfig
                }));
            } else if (emailConfig) {
                setSettings(prev => ({
                    ...prev,
                    emailConfig
                }));
            }
        } catch (error) {
            reportError(error);
            setError('Ayarlar yüklenirken bir hata oluştu');
        }
    };

    const handleSettingChange = (period, field, value) => {
        setSettings(prev => ({
            ...prev,
            [period]: {
                ...prev[period],
                [field]: value
            }
        }));
    };

    const handleEmailConfigChange = (field, value) => {
        setSettings(prev => ({
            ...prev,
            emailConfig: {
                ...prev.emailConfig,
                [field]: value
            }
        }));
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            setError(null);

            // Save email config separately
            await api.settings.saveEmailConfig(settings.emailConfig);

            // Save report settings
            localStorage.setItem('reportSettings', JSON.stringify(settings));
            
            setSuccess('Ayarlar başarıyla kaydedildi');
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            reportError(error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleTestEmail = async (period) => {
        try {
            setLoading(true);
            setError(null);
            
            const periodSettings = settings[period];
            if (!periodSettings.email) {
                throw new Error('E-posta adresi gereklidir');
            }

            await api.reports.testEmailSettings(
                periodSettings.email,
                settings.emailConfig
            );

            setSuccess(`Test e-postası ${periodSettings.email} adresine gönderildi`);
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            reportError(error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    {success}
                </div>
            )}

            <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">E-posta Sunucu Ayarları</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-white mb-2">SMTP Sunucu</label>
                        <input
                            type="text"
                            value={settings.emailConfig.server}
                            onChange={(e) => handleEmailConfigChange('server', e.target.value)}
                            className="w-full bg-dark-300 text-white p-2 rounded"
                            placeholder="örn: smtp.gmail.com"
                        />
                    </div>
                    <div>
                        <label className="block text-white mb-2">Port</label>
                        <input
                            type="text"
                            value={settings.emailConfig.port}
                            onChange={(e) => handleEmailConfigChange('port', e.target.value)}
                            className="w-full bg-dark-300 text-white p-2 rounded"
                            placeholder="örn: 587"
                        />
                    </div>
                    <div>
                        <label className="block text-white mb-2">Kullanıcı Adı</label>
                        <input
                            type="text"
                            value={settings.emailConfig.username}
                            onChange={(e) => handleEmailConfigChange('username', e.target.value)}
                            className="w-full bg-dark-300 text-white p-2 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-white mb-2">Şifre</label>
                        <input
                            type="password"
                            value={settings.emailConfig.password}
                            onChange={(e) => handleEmailConfigChange('password', e.target.value)}
                            className="w-full bg-dark-300 text-white p-2 rounded"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">Otomatik Rapor Ayarları</h3>
                
                {/* Daily Reports */}
                <div className="bg-dark-300 p-4 rounded">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-medium">Günlük Rapor</h4>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={settings.daily.enabled}
                                onChange={(e) => handleSettingChange('daily', 'enabled', e.target.checked)}
                                className="mr-2"
                            />
                            <span className="text-white">Aktif</span>
                        </label>
                    </div>
                    {settings.daily.enabled && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-white mb-2">Gönderim Saati</label>
                                <input
                                    type="time"
                                    value={settings.daily.time}
                                    onChange={(e) => handleSettingChange('daily', 'time', e.target.value)}
                                    className="w-full bg-dark-400 text-white p-2 rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-white mb-2">E-posta Adresi</label>
                                <input
                                    type="email"
                                    value={settings.daily.email}
                                    onChange={(e) => handleSettingChange('daily', 'email', e.target.value)}
                                    className="w-full bg-dark-400 text-white p-2 rounded"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Weekly Reports */}
                <div className="bg-dark-300 p-4 rounded">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-medium">Haftalık Rapor</h4>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={settings.weekly.enabled}
                                onChange={(e) => handleSettingChange('weekly', 'enabled', e.target.checked)}
                                className="mr-2"
                            />
                            <span className="text-white">Aktif</span>
                        </label>
                    </div>
                    {settings.weekly.enabled && (
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-white mb-2">Gün</label>
                                <select
                                    value={settings.weekly.day}
                                    onChange={(e) => handleSettingChange('weekly', 'day', e.target.value)}
                                    className="w-full bg-dark-400 text-white p-2 rounded"
                                >
                                    <option value="monday">Pazartesi</option>
                                    <option value="tuesday">Salı</option>
                                    <option value="wednesday">Çarşamba</option>
                                    <option value="thursday">Perşembe</option>
                                    <option value="friday">Cuma</option>
                                    <option value="saturday">Cumartesi</option>
                                    <option value="sunday">Pazar</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-white mb-2">Saat</label>
                                <input
                                    type="time"
                                    value={settings.weekly.time}
                                    onChange={(e) => handleSettingChange('weekly', 'time', e.target.value)}
                                    className="w-full bg-dark-400 text-white p-2 rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-white mb-2">E-posta</label>
                                <input
                                    type="email"
                                    value={settings.weekly.email}
                                    onChange={(e) => handleSettingChange('weekly', 'email', e.target.value)}
                                    className="w-full bg-dark-400 text-white p-2 rounded"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Monthly Reports */}
                <div className="bg-dark-300 p-4 rounded">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-medium">Aylık Rapor</h4>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={settings.monthly.enabled}
                                onChange={(e) => handleSettingChange('monthly', 'enabled', e.target.checked)}
                                className="mr-2"
                            />
                            <span className="text-white">Aktif</span>
                        </label>
                    </div>
                    {settings.monthly.enabled && (
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-white mb-2">Gün</label>
                                <select
                                    value={settings.monthly.day}
                                    onChange={(e) => handleSettingChange('monthly', 'day', Number(e.target.value))}
                                    className="w-full bg-dark-400 text-white p-2 rounded"
                                >
                                    {Array.from({ length: 31 }, (_, i) => (
                                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-white mb-2">Saat</label>
                                <input
                                    type="time"
                                    value={settings.monthly.time}
                                    onChange={(e) => handleSettingChange('monthly', 'time', e.target.value)}
                                    className="w-full bg-dark-400 text-white p-2 rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-white mb-2">E-posta</label>
                                <input
                                    type="email"
                                    value={settings.monthly.email}
                                    onChange={(e) => handleSettingChange('monthly', 'email', e.target.value)}
                                    className="w-full bg-dark-400 text-white p-2 rounded"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end space-x-4">
                <button
                    type="button"
                    onClick={() => handleTestEmail('daily')}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    disabled={loading}
                >
                    Test E-postası Gönder
                </button>
                <button
                    type="button"
                    onClick={handleSave}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    disabled={loading}
                >
                    {loading ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
            </div>
        </div>
    );
}
