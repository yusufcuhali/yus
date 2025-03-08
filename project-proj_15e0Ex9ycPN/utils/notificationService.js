window.notificationService = {
    _notifications: [],
    _subscribers: [],
    _checkInterval: null,

    init() {
        // Load saved notifications from storage
        try {
            const saved = window.storageUtils.getItem('notifications', []);
            this._notifications = saved || [];
        } catch (error) {
            console.error('Error loading notifications:', error);
            this._notifications = [];
        }

        // Start checking for stale devices
        this._checkInterval = setInterval(this.checkStaleDevices.bind(this), 3600000); // Check every hour
        
        // Initial check
        setTimeout(() => this.checkStaleDevices(), 5000);
    },

    subscribe(callback) {
        this._subscribers.push(callback);
        return () => {
            this._subscribers = this._subscribers.filter(cb => cb !== callback);
        };
    },

    notify(notification) {
        const newNotification = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            read: false,
            ...notification
        };

        this._notifications.unshift(newNotification);
        this._notifications = this._notifications.slice(0, 100); // Keep last 100 notifications
        
        // Notify subscribers
        this._subscribers.forEach(callback => callback(this._notifications));

        // Save to storage
        window.storageUtils.setItem('notifications', this._notifications);

        // Show browser notification if supported
        this.showBrowserNotification(notification);

        return newNotification;
    },

    markAsRead(notificationId) {
        this._notifications = this._notifications.map(n => 
            n.id === notificationId ? { ...n, read: true } : n
        );
        this._subscribers.forEach(callback => callback(this._notifications));
        window.storageUtils.setItem('notifications', this._notifications);
    },

    markAllAsRead() {
        this._notifications = this._notifications.map(n => ({ ...n, read: true }));
        this._subscribers.forEach(callback => callback(this._notifications));
        window.storageUtils.setItem('notifications', this._notifications);
    },

    getUnreadCount() {
        return this._notifications.filter(n => !n.read).length;
    },

    getNotifications(limit = 50) {
        return this._notifications.slice(0, limit);
    },

    async checkStaleDevices() {
        try {
            const devices = await api.devices.list();
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

            devices.forEach(device => {
                const lastUpdate = new Date(device.updatedAt || device.createdAt);
                if (lastUpdate < twoDaysAgo && 
                    device.deviceStatus !== 'completed' && 
                    device.deviceStatus !== 'delivered' &&
                    device.deviceStatus !== 'cancelled') {
                    
                    // Check if we already notified about this device recently
                    const recentNotification = this._notifications.find(n => 
                        n.data?.deviceId === device.id && 
                        n.type === 'warning' &&
                        new Date(n.timestamp) > twoDaysAgo
                    );

                    if (!recentNotification) {
                        this.notify({
                            type: 'warning',
                            title: 'Bekleyen Cihaz Hatırlatması',
                            message: `${device.brand} ${device.model} (${device.registrationNumber}) cihazının durumu 2 gündür güncellenmedi.`,
                            data: { deviceId: device.id }
                        });
                    }
                }
            });
        } catch (error) {
            console.error('Error checking stale devices:', error);
        }
    },

    showBrowserNotification(notification) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notification.title, {
                body: notification.message,
                icon: '/favicon.ico'
            });
        }
    },

    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }
};

// Initialize notification service
window.notificationService.init();
