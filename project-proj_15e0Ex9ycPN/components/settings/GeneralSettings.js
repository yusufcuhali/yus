function GeneralSettings() {
    const [settings, setSettings] = React.useState({
        companyName: '',
        logo: null,
        address: '',
        phone: '',
        email: '',
        theme: 'dark'
    });
    
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [success, setSuccess] = React.useState(false);
    const [logoPreview, setLogoPreview] = React.useState(null);

    React.useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const data = await api.settings.get();
            setSettings(data);
            if (data.logo) {
                setLogoPreview(data.logo);
            }
            setLoading(false);
        } catch (error) {
            reportError(error);
            setError('Ayarlar yüklenirken bir hata oluştu');
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSettings(prev => ({ ...prev, logo: reader.result }));
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await api.settings.update(settings);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            reportError(error);
            setError('Ayarlar kaydedilirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Yükleniyor...</div>;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    Ayarlar başarıyla kaydedildi
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label className="block text-white mb-2">Firma Adı</label>
                    <input
                        type="text"
                        name="companyName"
                        value={settings.companyName}
                        onChange={handleChange}
                        className="w-full bg-dark-300 text-white p-2 rounded"
                    />
                </div>

                <div>
                    <label className="block text-white mb-2">Firma Logosu</label>
                    <div className="flex items-center space-x-4">
                        {logoPreview && (
                            <div className="w-20 h-20 bg-dark-300 rounded flex items-center justify-center">
                                <img 
                                    src={logoPreview} 
                                    alt="Logo" 
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoChange}
                            className="bg-dark-300 text-white p-2 rounded"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-white mb-2">Adres</label>
                    <textarea
                        name="address"
                        value={settings.address}
                        onChange={handleChange}
                        className="w-full bg-dark-300 text-white p-2 rounded"
                        rows="3"
                    />
                </div>

                <div>
                    <label className="block text-white mb-2">Telefon</label>
                    <input
                        type="tel"
                        name="phone"
                        value={settings.phone}
                        onChange={handleChange}
                        className="w-full bg-dark-300 text-white p-2 rounded"
                    />
                </div>

                <div>
                    <label className="block text-white mb-2">E-posta</label>
                    <input
                        type="email"
                        name="email"
                        value={settings.email}
                        onChange={handleChange}
                        className="w-full bg-dark-300 text-white p-2 rounded"
                    />
                </div>

                <div>
                    <label className="block text-white mb-2">Tema</label>
                    <select
                        name="theme"
                        value={settings.theme}
                        onChange={handleChange}
                        className="w-full bg-dark-300 text-white p-2 rounded"
                    >
                        <option value="dark">Koyu</option>
                        <option value="light">Açık</option>
                    </select>
                </div>
            </div>

            <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                disabled={loading}
            >
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
        </form>
    );
}
