function Header({ user, onLogout }) {
    const [companyInfo, setCompanyInfo] = React.useState({
        name: 'Laptop Servis Yönetimi',
        logo: null
    });
    const [showNotifications, setShowNotifications] = React.useState(false);
    const [unreadCount, setUnreadCount] = React.useState(0);
    const notificationRef = React.useRef(null);

    React.useEffect(() => {
        loadCompanyInfo();

        // Subscribe to notifications
        const unsubscribe = window.notificationService.subscribe(() => {
            setUnreadCount(window.notificationService.getUnreadCount());
        });

        // Initial unread count
        setUnreadCount(window.notificationService.getUnreadCount());

        // Request notification permission
        window.notificationService.requestNotificationPermission();

        // Handle clicks outside notification panel
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            unsubscribe();
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const loadCompanyInfo = async () => {
        try {
            const settings = await api.settings.get();
            if (settings) {
                setCompanyInfo({
                    name: settings.companyName || 'Laptop Servis Yönetimi',
                    logo: settings.logo
                });
            }
        } catch (error) {
            console.error('Error loading company info:', error);
        }
    };

    return (
        <header className="header flex justify-between items-center p-4 bg-dark-200" data-name="main-header">
            <div className="flex items-center" data-name="logo-container">
                {companyInfo.logo ? (
                    <img 
                        src={companyInfo.logo} 
                        alt="Firma Logo" 
                        className="h-8 w-auto mr-2"
                        data-name="company-logo"
                    />
                ) : (
                    <i className="fas fa-laptop mr-2"></i>
                )}
                <h1 className="text-xl font-bold" data-name="company-name">
                    {companyInfo.name}
                </h1>
            </div>

            <div className="flex items-center space-x-4" data-name="header-actions">
                <div className="relative" ref={notificationRef}>
                    <button
                        className="relative p-2 text-gray-400 hover:text-white"
                        onClick={() => setShowNotifications(!showNotifications)}
                        data-name="notification-button"
                    >
                        <i className="fas fa-bell text-xl"></i>
                        {unreadCount > 0 && (
                            <span className="absolute top-0 right-0 -mt-1 -mr-1 px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                    {showNotifications && (
                        <NotificationList onClose={() => setShowNotifications(false)} />
                    )}
                </div>

                <div className="flex items-center" data-name="user-menu">
                    <span className="mr-2 text-gray-300" data-name="user-name">{user.name}</span>
                    <button 
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        onClick={onLogout}
                        data-name="logout-button"
                    >
                        <i className="fas fa-sign-out-alt mr-2"></i>
                        Çıkış
                    </button>
                </div>
            </div>
        </header>
    );
}
