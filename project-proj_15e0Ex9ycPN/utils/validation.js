function validateEmail(email) {
    try {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    } catch (error) {
        reportError(error);
        return false;
    }
}

function validatePhone(phone) {
    try {
        const phoneRegex = /^[0-9]{10}$/;
        return phoneRegex.test(phone);
    } catch (error) {
        reportError(error);
        return false;
    }
}

function validateTcNo(tcNo) {
    try {
        // Remove any spaces or non-digit characters
        tcNo = tcNo.replace(/[^0-9]/g, '');
        
        if (tcNo.length !== 11) return false;
        
        // First digit cannot be 0
        if (tcNo[0] === '0') return false;

        // Calculate checksum
        let oddSum = 0;
        let evenSum = 0;
        let total = 0;
        
        for (let i = 0; i < 9; i++) {
            const digit = parseInt(tcNo[i]);
            if (i % 2 === 0) {
                oddSum += digit;
            } else {
                evenSum += digit;
            }
            total += digit;
        }

        const digit10 = (oddSum * 7 - evenSum) % 10;
        const digit11 = (total + digit10) % 10;

        return parseInt(tcNo[9]) === digit10 && parseInt(tcNo[10]) === digit11;
    } catch (error) {
        reportError(error);
        return false;
    }
}

function validateSerialNumber(serialNumber) {
    try {
        return serialNumber.length >= 5 && /^[A-Za-z0-9]+$/.test(serialNumber);
    } catch (error) {
        reportError(error);
        return false;
    }
}

function validateRequired(value) {
    try {
        return value !== null && value !== undefined && value.trim() !== '';
    } catch (error) {
        reportError(error);
        return false;
    }
}
