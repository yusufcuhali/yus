function NotificationList({ onClose }) {
    const [notifications, setNotifications] = React.useState([]);
    
    React.useEffect(() => {
        const unsubscribe = window.notificationService.subscribe(setNotifications);
        setNotifications(window.notificationService.getNotifications());
        return unsubscribe;
    }, []);

    const handleMarkAsRead = (notificationId) => {
        window.notificationService.markAsRead(notificationId);
    };

    const handleMarkAllAsRead = () => {
        window.notificationService.markAllAsRead();
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) { // less than 1 minute
            return 'Az önce';
        } else if (diff < 3600000) { // less than 1 hour
            const minutes = Math.floor(diff / 60000);
            return `${minutes} dakika önce`;
        } else if (diff < 86400000) { // less than 1 day
            const hours = Math.floor(diff / 3600000);
            return `${hours} saat önce`;
        } else {
            return date.toLocaleDateString('tr-TR');
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'success': return 'fa-check-circle text-green-500';
            case 'warning': return 'fa-exclamation-triangle text-yellow-500';
            case 'error': return 'fa-times-circle text-red-500';
            case 'info': return 'fa-info-circle text-blue-500';
            default: return 'fa-bell text-gray-500';
        }
    };

    return (
        <div className="absolute right-0 mt-2 w-96 bg-dark-200 rounded-lg shadow-lg z-50" data-name="notification-list">
            <div className="p-4 border-b border-dark-300">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Bildirimler</h3>
                    <div className="flex space-x-2">
                        <button
                            onClick={handleMarkAllAsRead}
                            className="text-sm text-blue-400 hover:text-blue-500"
                        >
                            Tümünü Okundu İşaretle
                        </button>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-300"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-400">
                        Bildirim bulunmuyor
                    </div>
                ) : (
                    notifications.map(notification => (
                        <div
                            key={notification.id}
                            className={`p-4 border-b border-dark-300 hover:bg-dark-300 cursor-pointer ${
                                notification.read ? 'opacity-60' : ''
                            }`}
                            onClick={() => handleMarkAsRead(notification.id)}
                        >
                            <div className="flex items-start">
                                <div className="flex-shrink-0 mt-1">
                                    <i className={`fas ${getNotificationIcon(notification.type)} text-lg`}></i>
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-medium text-white">
                                        {notification.title}
                                    </p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formatTime(notification.timestamp)}
                                    </p>
                                </div>
                                {!notification.read && (
                                    <div className="ml-3 flex-shrink-0">
                                        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
