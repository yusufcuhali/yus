function formatCurrency(value) {
    try {
        const numValue = Number(value) || 0;
        return new Intl.NumberFormat('tr-TR', { 
            style: 'currency', 
            currency: 'TRY',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(numValue);
    } catch (error) {
        reportError(error);
        return '₺0,00';
    }
}

function formatNumber(value) {
    try {
        const numValue = Number(value) || 0;
        return new Intl.NumberFormat('tr-TR').format(numValue);
    } catch (error) {
        reportError(error);
        return '0';
    }
}

function formatPercentage(value) {
    try {
        const numValue = Number(value) || 0;
        return new Intl.NumberFormat('tr-TR', {
            style: 'percent',
            minimumFractionDigits: 0,
            maximumFractionDigits: 1
        }).format(numValue / 100);
    } catch (error) {
        reportError(error);
        return '%0';
    }
}
