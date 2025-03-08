function LoginForm({ onLogin }) {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [rememberMe, setRememberMe] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [currentTime, setCurrentTime] = React.useState(new Date());

    React.useEffect(() => {
        // Check for remembered user
        const remembered = localStorage.getItem('rememberedUser');
        if (remembered) {
            const { username } = JSON.parse(remembered);
            setUsername(username);
            setRememberMe(true);
        }

        // Update clock
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');

            // Mock login delay
            await new Promise(resolve => setTimeout(resolve, 500));

            // Find user in mock data
            const user = window.MOCK_USERS.find(u => 
                u.username === username && u.password === password
            );

            if (!user) {
                throw new Error('Geçersiz kullanıcı adı veya şifre');
            }

            // Create mock token
            const token = btoa(JSON.stringify({
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role,
                exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
            }));

            if (rememberMe) {
                localStorage.setItem('rememberedUser', JSON.stringify({ username }));
            } else {
                localStorage.removeItem('rememberedUser');
            }

            localStorage.setItem('token', token);
            
            // Initialize mock data
            window.initializeMockData();

            onLogin({
                token,
                user: {
                    name: user.name,
                    role: user.role
                }
            });
        } catch (error) {
            setError('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
        const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                       'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
        
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}, ${days[date.getDay()]}`;
    };

    return (
        <div className="login-container" data-name="login-form">
            <div className="login-content">
                <div className="login-header">
                    <div className="company-name">Laptop Servis Yönetimi</div>
                    <div className="clock-display">
                        <div className="time">{currentTime.toLocaleTimeString('tr-TR')}</div>
                        <div className="date">{formatDate(currentTime)}</div>
                    </div>
                </div>

                {error && (
                    <div className="error-message" role="alert">
                        <i className="fas fa-exclamation-circle mr-2"></i>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label className="form-label">
                            <i className="fas fa-user mr-2"></i>
                            Kullanıcı Adı
                        </label>
                        <input
                            type="text"
                            className="form-input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="Kullanıcı adınız"
                            data-name="username-input"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <i className="fas fa-lock mr-2"></i>
                            Şifre
                        </label>
                        <input
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Şifreniz"
                            data-name="password-input"
                        />
                    </div>

                    <div className="form-options">
                        <label className="remember-me">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                data-name="remember-me-checkbox"
                            />
                            Beni Hatırla
                        </label>
                        <a href="#/forgot-password" className="forgot-password">
                            Şifremi Unuttum
                        </a>
                    </div>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                        data-name="login-button"
                    >
                        {loading ? (
                            <div className="loading-spinner">
                                <i className="fas fa-spinner fa-spin"></i>
                                Giriş Yapılıyor...
                            </div>
                        ) : (
                            <div>
                                <i className="fas fa-sign-in-alt mr-2"></i>
                                Giriş Yap
                            </div>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
