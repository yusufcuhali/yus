// Google Drive Storage API
window.googleDriveStorage = {
    // API anahtarları ve kimlik doğrulama bilgileri
    config: {
        apiKey: null,
        clientId: null,
        scopes: ['https://www.googleapis.com/auth/drive.file'],
        appFolder: 'LaptopServisYonetim',
        isInitialized: false,
        isAuthenticated: false
    },

    // Google Drive API'yi başlat
    init: async function(apiKey, clientId) {
        try {
            // API anahtarlarını kaydet
            this.config.apiKey = apiKey;
            this.config.clientId = clientId;

            // Eğer API anahtarları yoksa hata fırlat
            if (!apiKey || !clientId) {
                console.error('Google Drive API anahtarları eksik');
                return false;
            }

            // Google API'yi yükle
            await this.loadGoogleApi();
            
            // Google Drive API'yi yükle
            await this.loadGoogleDriveApi();

            this.config.isInitialized = true;
            console.log('Google Drive API başarıyla başlatıldı');
            
            // Oturum durumunu kontrol et
            return await this.checkAuthStatus();
        } catch (error) {
            console.error('Google Drive API başlatılamadı:', error);
            return false;
        }
    },

    // Google API'yi dinamik olarak yükle
    loadGoogleApi: function() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = () => {
                gapi.load('client:auth2', resolve);
            };
            script.onerror = reject;
            document.body.appendChild(script);
        });
    },

    // Google Drive API'yi yükle
    loadGoogleDriveApi: async function() {
        try {
            await gapi.client.init({
                apiKey: this.config.apiKey,
                clientId: this.config.clientId,
                discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
                scope: this.config.scopes.join(' ')
            });
            return true;
        } catch (error) {
            console.error('Google Drive API yüklenemedi:', error);
            throw error;
        }
    },

    // Oturum durumunu kontrol et
    checkAuthStatus: async function() {
        try {
            if (!this.config.isInitialized) {
                console.error('Google Drive API başlatılmadı');
                return false;
            }

            const isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
            this.config.isAuthenticated = isSignedIn;
            
            // Oturum durumu değişikliklerini dinle
            gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateAuthStatus.bind(this));
            
            return isSignedIn;
        } catch (error) {
            console.error('Oturum durumu kontrol edilemedi:', error);
            return false;
        }
    },

    // Oturum durumunu güncelle
    updateAuthStatus: function(isSignedIn) {
        this.config.isAuthenticated = isSignedIn;
        console.log('Oturum durumu değişti:', isSignedIn ? 'Giriş yapıldı' : 'Çıkış yapıldı');
        
        // Oturum durumu değişikliğinde olay yayınla
        const event = new CustomEvent('googleDriveAuthChanged', { detail: { isSignedIn } });
        document.dispatchEvent(event);
    },

    // Google Drive'a giriş yap
    signIn: async function() {
        try {
            if (!this.config.isInitialized) {
                await this.init(this.config.apiKey, this.config.clientId);
            }
            
            await gapi.auth2.getAuthInstance().signIn();
            this.config.isAuthenticated = true;
            
            // Uygulama klasörünün varlığını kontrol et
            await this.checkAppFolder();
            
            return true;
        } catch (error) {
            console.error('Google Drive\'a giriş yapılamadı:', error);
            return false;
        }
    },

    // Google Drive'dan çıkış yap
    signOut: async function() {
        try {
            await gapi.auth2.getAuthInstance().signOut();
            this.config.isAuthenticated = false;
            return true;
        } catch (error) {
            console.error('Google Drive\'dan çıkış yapılamadı:', error);
            return false;
        }
    },

    // Uygulama klasörünü kontrol et ve yoksa oluştur
    checkAppFolder: async function() {
        try {
            const folderName = this.config.appFolder;
            
            // Klasör var mı kontrol et
            const folderExists = await this.findFolder(folderName);
            
            // Klasör yoksa oluştur
            if (!folderExists) {
                await this.createFolder(folderName);
                console.log(`'${folderName}' klasörü oluşturuldu`);
            } else {
                console.log(`'${folderName}' klasörü zaten var`);
            }
            
            return true;
        } catch (error) {
            console.error('Uygulama klasörü kontrol edilemedi:', error);
            return false;
        }
    },

    // Klasör ara
    findFolder: async function(folderName, parentId = 'root') {
        try {
            const response = await gapi.client.drive.files.list({
                q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`,
                fields: 'files(id, name)'
            });
            
            const folders = response.result.files;
            return folders.length > 0 ? folders[0] : null;
        } catch (error) {
            console.error('Klasör aranırken hata oluştu:', error);
            return null;
        }
    },

    // Klasör oluştur
    createFolder: async function(folderName, parentId = 'root') {
        try {
            const fileMetadata = {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [parentId]
            };
            
            const response = await gapi.client.drive.files.create({
                resource: fileMetadata,
                fields: 'id, name'
            });
            
            return response.result;
        } catch (error) {
            console.error('Klasör oluşturulurken hata oluştu:', error);
            throw error;
        }
    },

    // Alt klasör oluştur veya bul
    getSubfolder: async function(folderName) {
        try {
            // Ana klasörü bul
            const appFolder = await this.findFolder(this.config.appFolder);
            if (!appFolder) {
                await this.checkAppFolder();
                return await this.getSubfolder(folderName);
            }
            
            // Alt klasörü ara
            let subfolder = await this.findFolder(folderName, appFolder.id);
            
            // Alt klasör yoksa oluştur
            if (!subfolder) {
                subfolder = await this.createFolder(folderName, appFolder.id);
            }
            
            return subfolder;
        } catch (error) {
            console.error('Alt klasör oluşturulamadı:', error);
            throw error;
        }
    },

    // Dosya yükle
    uploadFile: async function(file, folderName) {
        try {
            if (!this.config.isAuthenticated) {
                console.error('Google Drive\'a giriş yapılmadı');
                return null;
            }
            
            // Dosya içeriğini al
            const content = await this.readFileAsArrayBuffer(file);
            
            // Hedef klasörü bul veya oluştur
            const folder = await this.getSubfolder(folderName);
            
            // Dosya meta verisi
            const fileMetadata = {
                name: file.name,
                parents: [folder.id]
            };
            
            // Dosya yükle
            const response = await gapi.client.request({
                path: '/upload/drive/v3/files',
                method: 'POST',
                params: {
                    uploadType: 'multipart',
                    fields: 'id,name,webViewLink,webContentLink'
                },
                headers: {
                    'Content-Type': 'multipart/related; boundary=boundary'
                },
                body: this.createMultipartBody(fileMetadata, content, file.type)
            });
            
            return response.result;
        } catch (error) {
            console.error('Dosya yüklenirken hata oluştu:', error);
            throw error;
        }
    },

    // Base64 veriyi dosya olarak yükle
    uploadBase64: async function(base64Data, fileName, mimeType, folderName) {
        try {
            if (!this.config.isAuthenticated) {
                console.error('Google Drive\'a giriş yapılmadı');
                return null;
            }
            
            // Base64'ten ArrayBuffer'a dönüştür
            const content = this.base64ToArrayBuffer(base64Data);
            
            // Hedef klasörü bul veya oluştur
            const folder = await this.getSubfolder(folderName);
            
            // Dosya meta verisi
            const fileMetadata = {
                name: fileName,
                parents: [folder.id]
            };
            
            // Dosya yükle
            const response = await gapi.client.request({
                path: '/upload/drive/v3/files',
                method: 'POST',
                params: {
                    uploadType: 'multipart',
                    fields: 'id,name,webViewLink,webContentLink'
                },
                headers: {
                    'Content-Type': 'multipart/related; boundary=boundary'
                },
                body: this.createMultipartBody(fileMetadata, content, mimeType)
            });
            
            return response.result;
        } catch (error) {
            console.error('Base64 veri yüklenirken hata oluştu:', error);
            throw error;
        }
    },

    // JSON veriyi dosya olarak yükle
    uploadJSON: async function(jsonData, fileName, folderName) {
        try {
            const jsonString = JSON.stringify(jsonData);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const file = new File([blob], fileName, { type: 'application/json' });
            
            return await this.uploadFile(file, folderName);
        } catch (error) {
            console.error('JSON veri yüklenirken hata oluştu:', error);
            throw error;
        }
    },

    // Dosya indir
    downloadFile: async function(fileId) {
        try {
            const response = await gapi.client.drive.files.get({
                fileId: fileId,
                alt: 'media'
            });
            
            return response.body;
        } catch (error) {
            console.error('Dosya indirilirken hata oluştu:', error);
            throw error;
        }
    },

    // JSON dosyasını indir ve parse et
    downloadJSON: async function(fileId) {
        try {
            const jsonString = await this.downloadFile(fileId);
            return JSON.parse(jsonString);
        } catch (error) {
            console.error('JSON dosyası indirilirken hata oluştu:', error);
            throw error;
        }
    },

    // Dosya listele
    listFiles: async function(folderName, fileType = null) {
        try {
            // Klasörü bul
            const folder = await this.getSubfolder(folderName);
            
            let query = `'${folder.id}' in parents and trashed=false`;
            
            // Dosya türü belirtilmişse filtreleme yap
            if (fileType) {
                query += ` and mimeType contains '${fileType}'`;
            }
            
            const response = await gapi.client.drive.files.list({
                q: query,
                fields: 'files(id, name, mimeType, webViewLink, webContentLink)',
                orderBy: 'name'
            });
            
            return response.result.files;
        } catch (error) {
            console.error('Dosyalar listelenirken hata oluştu:', error);
            throw error;
        }
    },

    // Dosya sil
    deleteFile: async function(fileId) {
        try {
            await gapi.client.drive.files.delete({
                fileId: fileId
            });
            
            return true;
        } catch (error) {
            console.error('Dosya silinirken hata oluştu:', error);
            throw error;
        }
    },

    // Dosyayı ArrayBuffer olarak oku
    readFileAsArrayBuffer: function(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    },

    // Base64 veriyi ArrayBuffer'a dönüştür
    base64ToArrayBuffer: function(base64) {
        // Base64 veriden veri URL'sini kaldır
        const base64Data = base64.split(',')[1] || base64;
        
        // Base64'ü binary string'e dönüştür
        const binaryString = window.atob(base64Data);
        
        // ArrayBuffer oluştur
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        return bytes.buffer;
    },

    // Multipart request body oluştur
    createMultipartBody: function(metadata, content, contentType) {
        const boundary = 'boundary';
        const delimiter = `\r\n--${boundary}\r\n`;
        const closeDelimiter = `\r\n--${boundary}--`;
        
        const metadataPart = delimiter +
            'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
            JSON.stringify(metadata);
        
        const contentPart = delimiter +
            `Content-Type: ${contentType}\r\n\r\n`;
        
        // ArrayBuffer'ları birleştir
        const metadataBytes = new TextEncoder().encode(metadataPart);
        const contentPartBytes = new TextEncoder().encode(contentPart);
        const closeDelimiterBytes = new TextEncoder().encode(closeDelimiter);
        
        const bodyLength = metadataBytes.byteLength + contentPartBytes.byteLength + content.byteLength + closeDelimiterBytes.byteLength;
        const body = new Uint8Array(bodyLength);
        
        let offset = 0;
        body.set(metadataBytes, offset);
        offset += metadataBytes.byteLength;
        body.set(contentPartBytes, offset);
        offset += contentPartBytes.byteLength;
        body.set(new Uint8Array(content), offset);
        offset += content.byteLength;
        body.set(closeDelimiterBytes, offset);
        
        return body;
    },

    // Verileri senkronize et
    syncData: async function() {
        try {
            // Verileri Google Drive'a yükle
            await this.uploadAppData();
            
            return true;
        } catch (error) {
            console.error('Veriler senkronize edilirken hata oluştu:', error);
            throw error;
        }
    },

    // Uygulama verilerini yükle
    uploadAppData: async function() {
        try {
            // Müşterileri yükle
            const customers = window.storageUtils.getItem('customers', []);
            await this.uploadJSON(customers, 'customers.json', 'data');
            
            // Cihazları yükle
            const devices = window.storageUtils.getItem('devices', []);
            await this.uploadJSON(devices, 'devices.json', 'data');
            
            // Giderleri yükle
            const expenses = window.storageUtils.getItem('expenses', []);
            await this.uploadJSON(expenses, 'expenses.json', 'data');
            
            // Ayarları yükle
            const settings = window.storageUtils.getItem('settings', {});
            await this.uploadJSON(settings, 'settings.json', 'data');
            
            // E-posta ayarlarını yükle
            const emailConfig = window.storageUtils.getItem('emailConfig', {});
            await this.uploadJSON(emailConfig, 'emailConfig.json', 'data');
            
            return true;
        } catch (error) {
            console.error('Uygulama verileri yüklenirken hata oluştu:', error);
            throw error;
        }
    },

    // Uygulama verilerini indir
    downloadAppData: async function() {
        try {
            // Veri klasöründeki dosyaları listele
            const files = await this.listFiles('data', 'application/json');
            
            // Her dosyayı işle
            for (const file of files) {
                const jsonData = await this.downloadJSON(file.id);
                
                // Dosya adına göre veriyi kaydet
                switch (file.name) {
                    case 'customers.json':
                        window.storageUtils.setItem('customers', jsonData);
                        break;
                    case 'devices.json':
                        window.storageUtils.setItem('devices', jsonData);
                        break;
                    case 'expenses.json':
                        window.storageUtils.setItem('expenses', jsonData);
                        break;
                    case 'settings.json':
                        window.storageUtils.setItem('settings', jsonData);
                        break;
                    case 'emailConfig.json':
                        window.storageUtils.setItem('emailConfig', jsonData);
                        break;
                }
            }
            
            return true;
        } catch (error) {
            console.error('Uygulama verileri indirilirken hata oluştu:', error);
            throw error;
        }
    },

    // Cihaz fotoğrafını yükle
    uploadDevicePhoto: async function(deviceId, photoBase64) {
        try {
            // Dosya adı oluştur
            const fileName = `device_${deviceId}_${Date.now()}.jpg`;
            
            // Fotoğrafı yükle
            const result = await this.uploadBase64(
                photoBase64,
                fileName,
                'image/jpeg',
                'photos'
            );
            
            return result;
        } catch (error) {
            console.error('Cihaz fotoğrafı yüklenirken hata oluştu:', error);
            throw error;
        }
    }
};
