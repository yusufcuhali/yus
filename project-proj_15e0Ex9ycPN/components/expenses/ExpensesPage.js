function ExpensesPage() {
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
    const [editingExpense, setEditingExpense] = React.useState(null);

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
            if (editingExpense) {
                await api.expenses.update(editingExpense.id, { ...editingExpense, ...newExpense });
            } else {
                await api.expenses.create(newExpense);
            }
            await loadExpenses();
            setNewExpense({
                type: '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                description: '',
                status: 'unpaid'
            });
            setEditingExpense(null);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            reportError(error);
            setError('Gider kaydedilirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (expense) => {
        setEditingExpense(expense);
        setNewExpense({
            type: expense.type,
            amount: expense.amount,
            date: expense.date,
            description: expense.description,
            status: expense.status
        });
    };

    const handleDelete = async (expenseId) => {
        if (!window.confirm('Bu gideri silmek istediğinizden emin misiniz?')) {
            return;
        }
        try {
            await api.expenses.delete(expenseId);
            await loadExpenses();
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            reportError(error);
            setError('Gider silinirken bir hata oluştu');
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

    if (loading && !expenses.length) {
        return <div className="text-center py-8">Yükleniyor...</div>;
    }

    return (
        <div className="space-y-6" data-name="expenses-page">
            <h2 className="text-2xl font-bold text-white">Gider Yönetimi</h2>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    {editingExpense ? 'Gider güncellendi' : 'Gider kaydedildi'}
                </div>
            )}

            <div className="bg-dark-200 p-6 rounded-lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-white mb-2">Gider Türü</label>
                            <select
                                value={newExpense.type}
                                onChange={(e) => setNewExpense({...newExpense, type: e.target.value})}
                                className="w-full bg-dark-300 text-white p-2 rounded"
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
                                step="0.01"
                                value={newExpense.amount}
                                onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                                className="w-full bg-dark-300 text-white p-2 rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-white mb-2">Tarih</label>
                            <input
                                type="date"
                                value={newExpense.date}
                                onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                                className="w-full bg-dark-300 text-white p-2 rounded"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-white mb-2">Açıklama</label>
                        <textarea
                            value={newExpense.description}
                            onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                            className="w-full bg-dark-300 text-white p-2 rounded"
                            rows="3"
                        />
                    </div>

                    <div>
                        <label className="block text-white mb-2">Durum</label>
                        <select
                            value={newExpense.status}
                            onChange={(e) => setNewExpense({...newExpense, status: e.target.value})}
                            className="w-full bg-dark-300 text-white p-2 rounded"
                        >
                            <option value="unpaid">Ödenmedi</option>
                            <option value="paid">Ödendi</option>
                        </select>
                    </div>

                    <div className="flex justify-end space-x-4">
                        {editingExpense && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingExpense(null);
                                    setNewExpense({
                                        type: '',
                                        amount: '',
                                        date: new Date().toISOString().split('T')[0],
                                        description: '',
                                        status: 'unpaid'
                                    });
                                }}
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                            >
                                İptal
                            </button>
                        )}
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            disabled={loading}
                        >
                            {loading ? 'Kaydediliyor...' : (editingExpense ? 'Güncelle' : 'Kaydet')}
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-dark-200 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 text-white">Gider Listesi</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-white">
                        <thead className="bg-dark-300">
                            <tr>
                                <th className="p-2 text-left">Tarih</th>
                                <th className="p-2 text-left">Tür</th>
                                <th className="p-2 text-left">Tutar</th>
                                <th className="p-2 text-left">Açıklama</th>
                                <th className="p-2 text-left">Durum</th>
                                <th className="p-2 text-left">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.map(expense => (
                                <tr key={expense.id} className="border-t border-dark-300">
                                    <td className="p-2">
                                        {new Date(expense.date).toLocaleDateString('tr-TR')}
                                    </td>
                                    <td className="p-2">
                                        {EXPENSE_TYPES.find(t => t.value === expense.type)?.label}
                                    </td>
                                    <td className="p-2">{formatMoney(expense.amount)}</td>
                                    <td className="p-2">{expense.description}</td>
                                    <td className="p-2">
                                        {expense.status === 'paid' ? 'Ödendi' : 'Ödenmedi'}
                                    </td>
                                    <td className="p-2">
                                        <button
                                            onClick={() => handleEdit(expense)}
                                            className="text-blue-500 hover:text-blue-700 mr-2"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(expense.id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
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
