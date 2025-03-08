function GoogleDriveSettings() {
    const [apiKey, setApiKey] = React.useState('');
    const [clientId, setClientId] = React.useState('');
    const [isInitialized, setIsInitialized] = React.useState(false);
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);
    const [syncEnabled, setSyncEnabled] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [success, setSuccess] = React.useState(null);
    const [lastSync, setLastSync] = React.useState(null);

    React.useEffect(() => {
        // Google Drive API durumunu kontrol et
        checkGoogleDriveStatus();
        
        // Senkronizasyon tercihini kontrol et
        const syncPref = window.storageUtils.syncEnabled;
        setSyncEnabled(syncPref);
        
        // Son senkronizasyon tarihini kontrol et
        const lastSyncTime = localStorage.getItem('lastSyncTime');
        if (lastSyncTime) {
            setLastSync(new Date(parseInt(lastSyncTime)));
        }
        
        // Google Drive oturum değişikliklerini dinle
        document.addEventListener('googleDriveAuthChanged', handleAuthChange);
        
        return () => {
            document.removeEventListener('googleDriveAuthChanged', handleAuthChange);
        };
    }, []);

    // Google Drive API durumunu kontrol et
    const checkGoogleDriveStatus = () => {
        const driveStorage = window.googleDriveStorage;
        
        if (driveStorage) {
            // API anahtarlarını al
            const savedApiKey = localStorage.getItem('googleDriveApiKey');
            const savedClientId = localStorage.getItem('googleDriveClientId');
            
            if (savedApiKey && savedClientId) {
                setApiKey(savedApiKey);
                setClientId(savedClientId);
            }
            
            // API durumunu kontrol et
            setIsInitialized(driveStorage.config.isInitialized);
            setIsAuthenticated(driveStorage.config.isAuthenticated);
        }
    };

    // Oturum değişikliği olayını işle
    const handleAuthChange = (event) => {
        const { isSignedIn } = event.detail;
        setIsAuthenticated(isSignedIn);
    };

    // API anahtarlarını kaydet
    const saveApiKeys = async () => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(null);
            
            // API anahtarlarını kontrol et
            if (!apiKey || !clientId) {
                setError('API anahtarı ve Client ID gereklidir');
                setLoading(false);
                return;
            }
            
            // API anahtarlarını kaydet
            localStorage.setItem('googleDriveApiKey', apiKey);
            localStorage.setItem('googleDriveClientId', clientId);
            
            // Google Drive API'yi başlat
            const result = await window.googleDriveStorage.init(apiKey, clientId);
            
            if (result) {
                setIsInitialized(true);
                setSuccess('Google Drive API başarıyla başlatıldı');
            } else {
                setError('Google Drive API başlatılamadı');
            }
        } catch (error) {
            reportError(error);
            setError('Google Drive API başlatılırken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    // Google Drive'a giriş yap
    const handleSignIn = async () => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(null);
            
            // Google Drive'a giriş yap
            const result = await window.googleDriveStorage.signIn();
            
            if (result) {
                setIsAuthenticated(true);
                setSuccess('Google Drive\'a başarıyla giriş yapıldı');
            } else {
                setError('Google Drive\'a giriş yapılamadı');
            }
        } catch (error) {
            reportError(error);
            setError('Google Drive\'a giriş yapılırken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    // Google Drive'dan çıkış yap
    const handleSignOut = async () => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(null);
            
            // Google Drive'dan çıkış yap
            const result = await window.googleDriveStorage.signOut();
            
            if (result) {
                setIsAuthenticated(false);
                setSuccess('Google Drive\'dan başarıyla çıkış yapıldı');
            } else {
                setError('Google Drive\'dan çıkış yapılamadı');
            }
        } catch (error) {
            reportError(error);
            setError('Google Drive\'dan çıkış yapılırken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    // Senkronizasyon tercihini değiştir
    const handleSyncToggle = (enabled) => {
        setSyncEnabled(enabled);
        window.storageUtils.setSyncEnabled(enabled);
    };

    // Verileri senkronize et
    const handleSync = async () => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(null);
            
            // Senkronizasyon yönünü seç
            let syncResult;
            
            if (window.confirm('Google Drive\'dan verileri indirmek istiyor musunuz? İptal\'e basarsanız, yerel veriler Google Drive\'a yüklenecektir.')) {
                // Google Drive'dan verileri indir
                syncResult = await window.storageUtils.syncFromGoogleDrive();
                if (syncResult) {
                    setSuccess('Veriler Google Drive\'dan başarıyla indirildi');
                } else {
                    setError('Veriler Google Drive\'dan indirilemedi');
                }
            } else {
                // Verileri Google Drive'a yükle
                syncResult = await window.storageUtils.syncToGoogleDrive();
                if (syncResult) {
                    setSuccess('Veriler Google Drive\'a başarıyla yüklendi');
                } else {
                    setError('Veriler Google Drive\'a yüklenemedi');
                }
            }
            
            // Son senkronizasyon zamanını güncelle
            if (syncResult) {
                const now = Date.now();
                localStorage.setItem('lastSyncTime', now.toString());
                setLastSync(new Date(now));
            }
        } catch (error) {
            reportError(error);
            setError('Senkronizasyon sırasında bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    // Google Drive API anahtarları nasıl alınır bilgisini göster
    const showApiKeyHelp = () => {
        window.open('https://developers.google.com/drive/api/v3/quickstart/js', '_blank');
    };

    return (
        <div className="space-y-6" data-name="google-drive-settings">
            <h3 className="text-xl font-semibold text-white mb-4">Google Drive Entegrasyonu</h3>
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <i className="fas fa-exclamation-circle mr-2"></i>
                    {error}
                </div>
            )}
            
            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    <i className="fas fa-check-circle mr-2"></i>
                    {success}
                </div>
            )}
            
            <div className="bg-dark-300 p-4 rounded">
                <h4 className="text-lg font-medium text-white mb-4">API Anahtarları</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-white mb-2">API Anahtarı</label>
                        <input
                            type="text"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="w-full bg-dark-400 text-white p-2 rounded"
                            placeholder="Google Drive API anahtarı"
                        />
                    </div>
                    <div>
                        <label className="block text-white mb-2">Client ID</label>
                        <input
                            type="text"
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                            className="w-full bg-dark-400 text-white p-2 rounded"
                            placeholder="Google Drive Client ID"
                        />
                    </div>
                </div>
                
                <div className="flex items-center justify-between">
                    <button
                        onClick={showApiKeyHelp}
                        className="text-blue-400 hover:text-blue-500"
                    >
                        <i className="fas fa-question-circle mr-1"></i>
                        API anahtarı nasıl alınır?
                    </button>
                    
                    <button
                        onClick={saveApiKeys}
                        disabled={loading || !apiKey || !clientId}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-500"
                    >
                        {loading ? (
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                        ) : (
                            <i className="fas fa-save mr-2"></i>
                        )}
                        API Anahtarlarını Kaydet
                    </button>
                </div>
            </div>
            
            <div className="bg-dark-300 p-4 rounded">
                <h4 className="text-lg font-medium text-white mb-4">Google Drive Bağlantısı</h4>
                
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <div className="font-medium text-white">
                            {isAuthenticated ? (
                                <span className="text-green-500">
                                    <i className="fas fa-check-circle mr-2"></i>
                                    Google Drive'a bağlı
                                </span>
                            ) : (
                                <span className="text-red-500">
                                    <i className="fas fa-times-circle mr-2"></i>
                                    Google Drive'a bağlı değil
                                </span>
                            )}
                        </div>
                        <div className="text-sm text-gray-400 mt-1">
                            {isAuthenticated ? 
                                'Verileriniz Google Drive ile senkronize edilebilir' : 
                                'Senkronizasyon için Google Drive\'a giriş yapın'
                            }
                        </div>
                    </div>
                    
                    <button
                        onClick={isAuthenticated ? handleSignOut : handleSignIn}
                        disabled={loading || !isInitialized}
                        className={`px-4 py-2 rounded ${
                            isAuthenticated ? 
                                'bg-red-500 hover:bg-red-600' : 
                                'bg-green-500 hover:bg-green-600'
                        } text-white disabled:bg-gray-500`}
                    >
                        {loading ? (
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                        ) : isAuthenticated ? (
                            <i className="fas fa-sign-out-alt mr-2"></i>
                        ) : (
                            <i className="fas fa-sign-in-alt mr-2"></i>
                        )}
                        {isAuthenticated ? 'Çıkış Yap' : 'Giriş Yap'}
                    </button>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <div className="font-medium text-white">Otomatik Senkronizasyon</div>
                        <div className="text-sm text-gray-400 mt-1">
                            Değişiklikler otomatik olarak Google Drive'a kaydedilsin
                        </div>
                    </div>
                    
                    <label className="flex items-center cursor-pointer">
                        <div className="relative">
                            <input
                                type="checkbox"
                                className="sr-only"
                                checked={syncEnabled}
                                onChange={(e) => handleSyncToggle(e.target.checked)}
                                disabled={!isAuthenticated}
                            />
                            <div className={`block w-14 h-8 rounded-full ${
                                syncEnabled ? 'bg-blue-500' : 'bg-gray-600'
                            }`}></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${
                                syncEnabled ? 'transform translate-x-6' : ''
                            }`}></div>
                        </div>
                    </label>
                </div>
                
                <div className="flex items-center justify-between">
                    <div>
                        <div className="font-medium text-white">Manuel Senkronizasyon</div>
                        <div className="text-sm text-gray-400 mt-1">
                            {lastSync ? (
                                `Son senkronizasyon: ${lastSync.toLocaleString('tr-TR')}`
                            ) : (
                                'Henüz senkronizasyon yapılmadı'
                            )}
                        </div>
                    </div>
                    
                    <button
                        onClick={handleSync}
                        disabled={loading || !isAuthenticated}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-500"
                    >
                        {loading ? (
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                        ) : (
                            <i className="fas fa-sync-alt mr-2"></i>
                        )}
                        Şimdi Senkronize Et
                    </button>
                </div>
            </div>
            
            <div className="bg-dark-300 p-4 rounded">
                <h4 className="text-lg font-medium text-white mb-4">Kullanım Bilgileri</h4>
                
                <div className="text-gray-300">
                    <p className="mb-2">
                        <i className="fas fa-info-circle mr-2 text-blue-500"></i>
                        Google Drive entegrasyonu ile uygulama verileriniz ve cihaz fotoğraflarınız Google Drive hesabınızda güvenle saklanabilir.
                    </p>
                    <p className="mb-2">
                        <i className="fas fa-check-circle mr-2 text-green-500"></i>
                        Otomatik senkronizasyon aktifken, tüm değişiklikler anında Google Drive'a kaydedilir.
                    </p>
                    <p>
                        <i className="fas fa-exclamation-triangle mr-2 text-yellow-500"></i>
                        Google Drive'dan veri indirme işlemi yerel verilerin üzerine yazacaktır. Dikkatli olun!
                    </p>
                </div>
            </div>
        </div>
    );
}
