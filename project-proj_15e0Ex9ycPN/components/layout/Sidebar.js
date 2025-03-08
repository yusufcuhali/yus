function Sidebar({ activePage, onNavigate }) {
    const [currentTime, setCurrentTime] = React.useState(new Date());
    const [menuItems] = React.useState([
        { id: 'dashboard', icon: 'fa-home', label: 'Anasayfa' },
        { id: 'customers', icon: 'fa-users', label: 'Müşteriler' },
        { id: 'device-register', icon: 'fa-laptop', label: 'Cihaz Kayıt' },
        { id: 'device-search', icon: 'fa-search', label: 'Cihaz Arama' },
        { id: 'expenses', icon: 'fa-money-bill', label: 'Giderler' },
        { id: 'reports', icon: 'fa-chart-bar', label: 'Raporlar' },
        { id: 'settings', icon: 'fa-cog', label: 'Ayarlar' }
    ]);

    React.useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatDate = (date) => {
        const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
        const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                       'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
        
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}, ${days[date.getDay()]}`;
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('tr-TR', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit'
        });
    };

    return (
        <aside className="sidebar" data-name="main-sidebar">
            <div className="p-4 border-b border-dark-300">
                <div className="text-center">
                    <div className="text-3xl font-bold mb-2 text-blue-500" data-name="clock">
                        {formatTime(currentTime)}
                    </div>
                    <div className="text-sm text-gray-400" data-name="date">
                        {formatDate(currentTime)}
                    </div>
                </div>
            </div>
            <div className="py-4">
                {menuItems.map(item => (
                    <div 
                        key={item.id}
                        className={`px-4 py-3 cursor-pointer hover:bg-gray-700 ${
                            activePage === item.id ? 'bg-gray-700' : ''
                        }`}
                        onClick={() => onNavigate(item.id)}
                        data-name={`sidebar-${item.id}`}
                    >
                        <i className={`fas ${item.icon} mr-3`}></i>
                        {item.label}
                    </div>
                ))}
            </div>
        </aside>
    );
}
