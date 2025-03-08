const STATUS_OPTIONS = [
    { value: 'pending', label: 'Beklemede' },
    { value: 'diagnosing', label: 'Teşhis Aşamasında' },
    { value: 'repairing', label: 'Tamirde' },
    { value: 'waiting_part', label: 'Parça Bekliyor' },
    { value: 'completed', label: 'Tamamlandı' },
    { value: 'delivered', label: 'Teslim Edildi' },
    { value: 'cancelled', label: 'İptal Edildi' }
];

const BRAND_OPTIONS = [
    { value: 'apple', label: 'Apple' },
    { value: 'dell', label: 'Dell' },
    { value: 'hp', label: 'HP' },
    { value: 'lenovo', label: 'Lenovo' },
    { value: 'asus', label: 'Asus' },
    { value: 'acer', label: 'Acer' },
    { value: 'toshiba', label: 'Toshiba' },
    { value: 'msi', label: 'MSI' },
    { value: 'custom', label: 'Diğer' }
];

const DIAGNOSIS_OPTIONS = [
    { value: 'display', label: 'Ekran Arızası' },
    { value: 'battery', label: 'Batarya Sorunu' },
    { value: 'keyboard', label: 'Klavye Arızası' },
    { value: 'motherboard', label: 'Anakart Arızası' },
    { value: 'software', label: 'Yazılım Sorunu' },
    { value: 'custom', label: 'Diğer' }
];

const EXPENSE_TYPES = [
    { value: 'electricity', label: 'Elektrik' },
    { value: 'internet', label: 'İnternet' },
    { value: 'rent', label: 'Kira' },
    { value: 'maintenance', label: 'Aidat' },
    { value: 'supplies', label: 'Sarf Malzemesi' },
    { value: 'market', label: 'Market' },
    { value: 'other', label: 'Diğer' }
];
