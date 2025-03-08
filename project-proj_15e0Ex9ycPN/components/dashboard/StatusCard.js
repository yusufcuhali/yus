function StatusCard({ title, count, icon, color, onStatusClick }) {
    const [displayCount, setDisplayCount] = React.useState(0);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDisplayCount(count);
        }, 100);
        return () => clearTimeout(timer);
    }, [count]);

    const getStatusColor = () => {
        switch (color) {
            case 'blue': return 'from-blue-500 to-blue-600';
            case 'green': return 'from-green-500 to-green-600';
            case 'purple': return 'from-purple-500 to-purple-600';
            case 'red': return 'from-red-500 to-red-600';
            case 'yellow': return 'from-yellow-500 to-yellow-600';
            case 'orange': return 'from-orange-500 to-orange-600';
            default: return 'from-gray-500 to-gray-600';
        }
    };

    return (
        <div 
            onClick={onStatusClick}
            className={`status-card bg-gradient-to-br ${getStatusColor()} transform transition-all duration-300 hover:scale-105 cursor-pointer`}
            data-name={`status-card-${title}`}
        >
            <div className="status-icon">
                <i className={`fas ${icon} text-2xl`}></i>
            </div>
            <div className="text-4xl font-bold text-white mt-2 animate-count">
                {displayCount}
            </div>
            <div className="text-white mt-2 text-sm">
                {title}
            </div>
        </div>
    );
}
