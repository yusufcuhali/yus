window.emailService = {
    _emailStorage: [],
    
    _formatEmailPreview: (emailData) => {
        const separator = '-'.repeat(50);
        return `
${separator}
📧 E-POSTA ÖNİZLEME
${separator}
Alıcı: ${emailData.to}
Konu: ${emailData.subject}
Tarih: ${new Date(emailData.sentAt).toLocaleString('tr-TR')}
${separator}
${emailData.content.replace(/<[^>]*>/g, '')}
${separator}
`;
    },

    sendTestEmail: async (email, emailConfig) => {
        try {
            if (!email || !email.includes('@')) {
                throw new Error('Geçersiz e-posta adresi');
            }

            if (!emailConfig || !emailConfig.server || !emailConfig.port || 
                !emailConfig.username || !emailConfig.password) {
                throw new Error('E-posta sunucu ayarları eksik');
            }

            const emailData = {
                to: email,
                subject: 'Servis Yönetimi - Test E-postası',
                sentAt: new Date().toISOString(),
                content: `
                    <h2>Servis Yönetimi Test E-postası</h2>
                    <p>Bu bir test e-postasıdır. E-posta ayarlarınız başarıyla yapılandırıldı.</p>
                    <hr>
                    <h3>Sunucu Ayarları:</h3>
                    <ul>
                        <li>SMTP Sunucu: ${emailConfig.server}</li>
                        <li>Port: ${emailConfig.port}</li>
                        <li>Kullanıcı: ${emailConfig.username}</li>
                        <li>SSL/TLS: ${emailConfig.secure ? 'Evet' : 'Hayır'}</li>
                    </ul>
                    <hr>
                    <p style="color: #666; font-size: 12px;">
                        Bu e-posta otomatik olarak gönderilmiştir.<br>
                        Gönderim Tarihi: ${new Date().toLocaleString('tr-TR')}
                    </p>
                `
            };

            window.emailService._emailStorage.push(emailData);
            
            // Format and log email preview
            console.log(window.emailService._formatEmailPreview(emailData));

            // Show alert with email preview
            alert(`E-posta Önizleme:\n\nAlıcı: ${email}\nKonu: ${emailData.subject}\n\nNot: Gerçek e-posta gönderimi önizleme modunda devre dışıdır. Lütfen konsolu kontrol ediniz.`);

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            return { 
                success: true, 
                message: `Test e-postası önizlemesi konsola yazdırıldı. (Önizleme modu)`,
                preview: window.emailService._formatEmailPreview(emailData)
            };
        } catch (error) {
            console.error('Email sending failed:', error);
            throw error;
        }
    },

    sendReport: async (email, report, emailConfig) => {
        try {
            if (!email || !email.includes('@')) {
                throw new Error('Geçersiz e-posta adresi');
            }

            if (!emailConfig || !emailConfig.server || !emailConfig.port || 
                !emailConfig.username || !emailConfig.password) {
                throw new Error('E-posta sunucu ayarları eksik');
            }

            const reportDate = new Date().toLocaleDateString('tr-TR');
            const emailData = {
                to: email,
                subject: `Servis Raporu - ${reportDate}`,
                sentAt: new Date().toISOString(),
                content: `
                    <h2>Servis Raporu - ${reportDate}</h2>
                    <div style="margin-bottom: 20px;">
                        <h3>Finansal Özet</h3>
                        <ul>
                            <li>Toplam Gelir: ₺${report.data.totalRevenue?.toLocaleString('tr-TR') || '0'}</li>
                            <li>Toplam Gider: ₺${report.data.totalExpenses?.toLocaleString('tr-TR') || '0'}</li>
                            <li>Net Kar: ₺${report.data.netProfit?.toLocaleString('tr-TR') || '0'}</li>
                        </ul>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <h3>Cihaz Durumları</h3>
                        <ul>
                            ${Object.entries(report.data.byStatus || {}).map(([status, count]) => `
                                <li>${STATUS_OPTIONS.find(opt => opt.value === status)?.label || status}: ${count}</li>
                            `).join('')}
                        </ul>
                    </div>
                    <hr>
                    <p style="color: #666; font-size: 12px;">
                        Bu rapor otomatik olarak oluşturulmuştur.<br>
                        Oluşturulma Tarihi: ${reportDate}<br>
                        Gönderim Tarihi: ${new Date().toLocaleString('tr-TR')}
                    </p>
                `
            };

            window.emailService._emailStorage.push(emailData);
            
            // Format and log email preview
            console.log(window.emailService._formatEmailPreview(emailData));

            // Show alert with email preview
            alert(`Rapor E-postası Önizleme:\n\nAlıcı: ${email}\nKonu: ${emailData.subject}\n\nNot: Gerçek e-posta gönderimi önizleme modunda devre dışıdır. Lütfen konsolu kontrol ediniz.`);

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            return { 
                success: true, 
                message: `Rapor e-postası önizlemesi konsola yazdırıldı. (Önizleme modu)`,
                preview: window.emailService._formatEmailPreview(emailData)
            };
        } catch (error) {
            console.error('Report sending failed:', error);
            throw error;
        }
    },

    generateReportContent: async (type, dateRange) => {
        try {
            let report = {
                type,
                dateRange,
                generatedAt: new Date().toISOString(),
                data: {}
            };

            switch (type) {
                case 'daily':
                    const dailyStats = await api.reports.financial({ dateRange: 'day' });
                    report.data = {
                        ...dailyStats,
                        devices: await api.devices.list({ dateRange: 'day' })
                    };
                    break;

                case 'weekly':
                    const weeklyStats = await api.reports.financial({ dateRange: 'week' });
                    report.data = {
                        ...weeklyStats,
                        devices: await api.devices.list({ dateRange: 'week' })
                    };
                    break;

                case 'monthly':
                    const monthlyStats = await api.reports.financial({ dateRange: 'month' });
                    report.data = {
                        ...monthlyStats,
                        devices: await api.devices.list({ dateRange: 'month' })
                    };
                    break;

                default:
                    throw new Error('Geçersiz rapor türü');
            }

            return report;
        } catch (error) {
            console.error('Report generation failed:', error);
            throw error;
        }
    },

    getSentEmails: () => {
        return window.emailService._emailStorage;
    },

    clearSentEmails: () => {
        window.emailService._emailStorage = [];
        return true;
    }
};
