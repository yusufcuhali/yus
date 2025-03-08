function App() {
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);
    const [currentPage, setCurrentPage] = React.useState('dashboard');
    const [user, setUser] = React.useState(null);

    React.useEffect(() => {
        // Initialize mock data
        window.initializeMockData();

        // Check if user is already logged in
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const userData = JSON.parse(atob(token));
                if (userData.exp > Date.now()) {
                    setUser({ name: userData.name, role: userData.role });
                    setIsAuthenticated(true);
                } else {
                    localStorage.removeItem('token');
                }
            } catch (error) {
                reportError(error);
                localStorage.removeItem('token');
            }
        }
    }, []);

    const handleLogin = (data) => {
        try {
            setUser(data.user);
            setIsAuthenticated(true);
        } catch (error) {
            reportError(error);
        }
    };

    const handleLogout = () => {
        try {
            localStorage.removeItem('token');
            setUser(null);
            setIsAuthenticated(false);
        } catch (error) {
            reportError(error);
        }
    };

    return (
        <div className="app-container" data-name="app-container">
            {!isAuthenticated ? (
                <LoginForm onLogin={handleLogin} />
            ) : (
                <React.Fragment>
                    <Sidebar 
                        activePage={currentPage} 
                        onNavigate={setCurrentPage} 
                    />
                    <div className="main-content" data-name="main-content">
                        <Header user={user} onLogout={handleLogout} />
                        {currentPage === 'dashboard' && <Dashboard />}
                        {currentPage === 'customers' && <CustomerList />}
                        {currentPage === 'device-register' && <DeviceForm />}
                        {currentPage === 'device-search' && <DeviceSearch />}
                        {currentPage === 'expenses' && <ExpensesPage />}
                        {currentPage === 'reports' && (
                            <div>
                                <FinancialReports />
                                <ServiceReports />
                            </div>
                        )}
                        {currentPage === 'settings' && <Settings />}
                    </div>
                </React.Fragment>
            )}
        </div>
    );
}

// Wait for DOM to be ready
window.addEventListener('DOMContentLoaded', () => {
    const appRoot = ReactDOM.createRoot(document.getElementById('root'));
    appRoot.render(<App />);
});
