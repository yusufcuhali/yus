window.storageUtils = {
    // Depolama türleri
    storageType: {
        LOCAL: 'local',
        GOOGLE_DRIVE: 'google_drive'
    },
    
    // Aktif depolama türü
    activeStorage: 'local',
    
    // Google Drive senkronizasyonu aktif mi?
    syncEnabled: false,
    
    // Başlatma fonksiyonu
    init() {
        try {
            // Local Storage kullanılabilir mi kontrol et
            const isLocalStorageAvailable = this.testLocalStorage();
            
            // Local Storage kullanılamıyorsa hata fırlat
            if (!isLocalStorageAvailable) {
                console.error('LocalStorage kullanılamıyor');
                return false;
            }
            
            // Depolama türünü kontrol et
            const savedStorageType = localStorage.getItem('preferredStorageType');
            if (savedStorageType) {
                this.activeStorage = savedStorageType;
            }
            
            // Senkronizasyon tercihini kontrol et
            const syncPref = localStorage.getItem('syncEnabled');
            if (syncPref !== null) {
                this.syncEnabled = syncPref === 'true';
            }
            
            return true;
        } catch (error) {
            console.error('Storage başlatılamadı:', error);
            return false;
        }
    },
    
    // Local Storage testi
    testLocalStorage() {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
        } catch (error) {
            console.error('LocalStorage test hatası:', error);
            return false;
        }
    },
    
    // Depolama türünü değiştir
    setStorageType(type) {
        if (type in this.storageType) {
            this.activeStorage = type;
            localStorage.setItem('preferredStorageType', type);
            return true;
        }
        return false;
    },
    
    // Senkronizasyon tercihini değiştir
    setSyncEnabled(enabled) {
        this.syncEnabled = enabled;
        localStorage.setItem('syncEnabled', enabled);
    },
    
    // Veri kaydet
    setItem(key, value) {
        try {
            // Değer boş ise sil
            if (value === undefined || value === null) {
                this.removeItem(key);
                return false;
            }

            // Değeri JSON'a dönüştür
            const stringValue = JSON.stringify(value);
            
            // Local Storage'a kaydet
            localStorage.setItem(key, stringValue);
            
            // Google Drive senkronizasyonu aktif ise
            if (this.syncEnabled && this.activeStorage === this.storageType.GOOGLE_DRIVE) {
                // Senkronizasyonu başlat
                this.syncToGoogleDrive();
            }
            
            return true;
        } catch (error) {
            console.error('Storage setItem hatası:', error);
            return false;
        }
    },
    
    // Veri getir
    getItem(key, defaultValue = null) {
        try {
            // Local Storage'dan getir
            const item = localStorage.getItem(key);
            if (item === null) return defaultValue;
            return JSON.parse(item);
        } catch (error) {
            console.error('Storage getItem hatası:', error);
            return defaultValue;
        }
    },
    
    // Veri sil
    removeItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage removeItem hatası:', error);
            return false;
        }
    },
    
    // Tüm verileri sil
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Storage clear hatası:', error);
            return false;
        }
    },
    
    // Google Drive ile senkronize et
    async syncToGoogleDrive() {
        try {
            // Google Drive API başlatılmış mı kontrol et
            if (!window.googleDriveStorage || !window.googleDriveStorage.config.isInitialized) {
                console.error('Google Drive API başlatılmadı');
                return false;
            }
            
            // Google Drive'a giriş yapılmış mı kontrol et
            if (!window.googleDriveStorage.config.isAuthenticated) {
                console.error('Google Drive\'a giriş yapılmadı');
                return false;
            }
            
            // Verileri senkronize et
            await window.googleDriveStorage.syncData();
            
            return true;
        } catch (error) {
            console.error('Google Drive senkronizasyon hatası:', error);
            return false;
        }
    },
    
    // Google Drive'dan verileri al
    async syncFromGoogleDrive() {
        try {
            // Google Drive API başlatılmış mı kontrol et
            if (!window.googleDriveStorage || !window.googleDriveStorage.config.isInitialized) {
                console.error('Google Drive API başlatılmadı');
                return false;
            }
            
            // Google Drive'a giriş yapılmış mı kontrol et
            if (!window.googleDriveStorage.config.isAuthenticated) {
                console.error('Google Drive\'a giriş yapılmadı');
                return false;
            }
            
            // Verileri indir
            await window.googleDriveStorage.downloadAppData();
            
            return true;
        } catch (error) {
            console.error('Google Drive\'dan veri alma hatası:', error);
            return false;
        }
    },
    
    // Cihaz fotoğrafını yükle
    async uploadDevicePhoto(deviceId, photoBase64) {
        try {
            // Google Drive senkronizasyonu aktif değilse veya giriş yapılmamışsa
            if (!this.syncEnabled || this.activeStorage !== this.storageType.GOOGLE_DRIVE ||
                !window.googleDriveStorage.config.isAuthenticated) {
                // Fotoğrafı Base64 olarak kaydet
                return { id: null, dataUrl: photoBase64 };
            }
            
            // Fotoğrafı Google Drive'a yükle
            const result = await window.googleDriveStorage.uploadDevicePhoto(deviceId, photoBase64);
            
            // Sonucu döndür
            return {
                id: result.id,
                name: result.name,
                viewLink: result.webViewLink,
                downloadLink: result.webContentLink
            };
        } catch (error) {
            console.error('Cihaz fotoğrafı yükleme hatası:', error);
            // Hata durumunda Base64 olarak kaydet
            return { id: null, dataUrl: photoBase64 };
        }
    }
};

// Storage utils başlat
window.storageUtils.init();
