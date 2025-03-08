function ExpenseForm() {
    const [expenses, setExpenses] = React.useState([]);
    const [newExpense, setNewExpense] = React.useState({
        type: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        status: 'unpaid'
    });
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [success, setSuccess] = React.useState(false);

    React.useEffect(() => {
        loadExpenses();
    }, []);

    const loadExpenses = async () => {
        try {
            const data = await api.expenses.list();
            setExpenses(data);
            setLoading(false);
        } catch (error) {
            reportError(error);
            setError('Giderler yüklenirken bir hata oluştu');
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await api.expenses.create(newExpense);
            await loadExpenses();
            setNewExpense({
                type: '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                description: '',
                status: 'unpaid'
            });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            reportError(error);
            setError('Gider kaydedilirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (expenseId, newStatus) => {
        try {
            await api.expenses.update(expenseId, { status: newStatus });
            await loadExpenses();
        } catch (error) {
            reportError(error);
            alert('Durum güncellenirken bir hata oluştu');
        }
    };

    const formatMoney = (value) => {
        try {
            return `₺${Number(value).toFixed(2)}`;
        } catch (error) {
            reportError(error);
            return '₺0.00';
        }
    };

    return (
        <div className="space-y-6" data-name="expense-form">
            <h3 className="text-xl font-semibold mb-4 text-white">Gider Yönetimi</h3>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    Gider başarıyla kaydedildi
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-dark-300 p-4 rounded">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-white mb-2">Gider Türü</label>
                        <select
                            value={newExpense.type}
                            onChange={(e) => setNewExpense({...newExpense, type: e.target.value})}
                            className="form-select bg-dark-300 text-white w-full"
                            required
                        >
                            <option value="">Seçiniz</option>
                            {EXPENSE_TYPES.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-white mb-2">Tutar</label>
                        <input
                            type="number"
                            value={newExpense.amount}
                            onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                            className="form-input bg-dark-300 text-white w-full"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-white mb-2">Tarih</label>
                        <input
                            type="date"
                            value={newExpense.date}
                            onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                            className="form-input bg-dark-300 text-white w-full"
                            required
                        />
                    </div>
                </div>
                <div className="mt-4">
                    <label className="block text-white mb-2">Açıklama</label>
                    <textarea
                        value={newExpense.description}
                        onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                        className="form-textarea bg-dark-300 text-white w-full"
                        rows="3"
                    />
                </div>
                <button
                    type="submit"
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    disabled={loading}
                >
                    {loading ? 'Kaydediliyor...' : 'Gider Ekle'}
                </button>
            </form>

            <div className="bg-dark-300 p-4 rounded">
                <h4 className="text-lg font-semibold mb-4 text-white">Gider Listesi</h4>
                <div className="overflow-x-auto">
                    <table className="w-full text-white">
                        <thead className="bg-dark-400">
                            <tr>
                                <th className="p-2 text-left">Tarih</th>
                                <th className="p-2 text-left">Tür</th>
                                <th className="p-2 text-left">Tutar</th>
                                <th className="p-2 text-left">Açıklama</th>
                                <th className="p-2 text-left">Durum</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.map(expense => (
                                <tr key={expense.id} className="border-t border-dark-400">
                                    <td className="p-2">
                                        {new Date(expense.date).toLocaleDateString('tr-TR')}
                                    </td>
                                    <td className="p-2">
                                        {EXPENSE_TYPES.find(t => t.value === expense.type)?.label}
                                    </td>
                                    <td className="p-2">{formatMoney(expense.amount)}</td>
                                    <td className="p-2">{expense.description}</td>
                                    <td className="p-2">
                                        <select
                                            value={expense.status}
                                            onChange={(e) => handleStatusChange(expense.id, e.target.value)}
                                            className="bg-dark-300 text-white rounded p-1"
                                        >
                                            <option value="unpaid">Ödenmedi</option>
                                            <option value="paid">Ödendi</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
