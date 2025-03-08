function ForgotPassword() {
    const [email, setEmail] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [success, setSuccess] = React.useState(false);
    const [step, setStep] = React.useState('request'); // request, verify, reset
    const [verificationCode, setVerificationCode] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');

    const handleRequestReset = async (e) => {
        e.preventDefault();
        try {
            if (!validateEmail(email)) {
                setError('Geçerli bir e-posta adresi giriniz');
                return;
            }

            setLoading(true);
            await resetPassword(email);
            setSuccess(true);
            setError(null);
            setStep('verify');
        } catch (error) {
            reportError(error);
            setError('Şifre sıfırlama işlemi başarısız oldu');
            setSuccess(false);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            // API call to verify the code
            await verifyResetCode(email, verificationCode);
            setError(null);
            setStep('reset');
        } catch (error) {
            reportError(error);
            setError('Doğrulama kodu geçersiz');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            if (newPassword !== confirmPassword) {
                setError('Şifreler eşleşmiyor');
                return;
            }

            if (newPassword.length < 8) {
                setError('Şifre en az 8 karakter olmalıdır');
                return;
            }

            setLoading(true);
            // API call to set new password
            await setNewPassword(email, verificationCode, newPassword);
            setSuccess(true);
            setError(null);
            // Redirect to login after 3 seconds
            setTimeout(() => {
                window.location.href = '/login';
            }, 3000);
        } catch (error) {
            reportError(error);
            setError('Şifre güncelleme işlemi başarısız oldu');
        } finally {
            setLoading(false);
        }
    };

    const renderRequestForm = () => (
        <form onSubmit={handleRequestReset} className="space-y-4" data-name="reset-request-form">
            <div className="form-group">
                <label className="form-label">E-posta Adresi</label>
                <input
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@email.com"
                    required
                    data-name="email-input"
                />
            </div>

            <button
                type="submit"
                className="form-button w-full"
                disabled={loading}
                data-name="submit-button"
            >
                {loading ? 'İşleniyor...' : 'Şifre Sıfırlama Bağlantısı Gönder'}
            </button>
        </form>
    );

    const renderVerificationForm = () => (
        <form onSubmit={handleVerifyCode} className="space-y-4" data-name="verification-form">
            <div className="form-group">
                <label className="form-label">Doğrulama Kodu</label>
                <input
                    type="text"
                    className="form-input"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="6 haneli kodu giriniz"
                    required
                    maxLength="6"
                    data-name="verification-code-input"
                />
                <p className="form-help-text">
                    E-posta adresinize gönderilen 6 haneli doğrulama kodunu giriniz
                </p>
            </div>

            <button
                type="submit"
                className="form-button w-full"
                disabled={loading}
                data-name="verify-button"
            >
                {loading ? 'Doğrulanıyor...' : 'Doğrula'}
            </button>
        </form>
    );

    const renderResetForm = () => (
        <form onSubmit={handleResetPassword} className="space-y-4" data-name="new-password-form">
            <div className="form-group">
                <label className="form-label">Yeni Şifre</label>
                <input
                    type="password"
                    className="form-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Yeni şifrenizi giriniz"
                    required
                    minLength="8"
                    data-name="new-password-input"
                />
            </div>

            <div className="form-group">
                <label className="form-label">Şifre Tekrar</label>
                <input
                    type="password"
                    className="form-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Şifrenizi tekrar giriniz"
                    required
                    minLength="8"
                    data-name="confirm-password-input"
                />
            </div>

            <button
                type="submit"
                className="form-button w-full"
                disabled={loading}
                data-name="reset-button"
            >
                {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
            </button>
        </form>
    );

    return (
        <div className="login-container" data-name="forgot-password-container">
            <div className="login-form">
                <h2 className="text-2xl font-bold mb-6 text-center">Şifremi Unuttum</h2>
                
                {error && (
                    <div className="form-error-message" role="alert" data-name="error-message">
                        {error}
                    </div>
                )}

                {success && step === 'request' && (
                    <div className="form-success" role="alert" data-name="success-message">
                        Doğrulama kodu e-posta adresinize gönderildi.
                    </div>
                )}

                {success && step === 'reset' && (
                    <div className="form-success" role="alert" data-name="success-message">
                        Şifreniz başarıyla güncellendi. Giriş sayfasına yönlendiriliyorsunuz...
                    </div>
                )}

                {step === 'request' && renderRequestForm()}
                {step === 'verify' && renderVerificationForm()}
                {step === 'reset' && renderResetForm()}

                <div className="mt-4 text-center">
                    <a 
                        href="/login" 
                        className="form-link"
                        data-name="back-to-login-link"
                    >
                        Giriş sayfasına dön
                    </a>
                </div>
            </div>
        </div>
    );
}
