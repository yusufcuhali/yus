function Charts({ type, data, hideValues }) {
    const chartRef = React.useRef(null);
    const [chart, setChart] = React.useState(null);
    
    React.useEffect(() => {
        if (chartRef.current) {
            // Destroy previous chart if it exists
            if (chart) {
                chart.destroy();
            }
            
            // Create new chart based on type
            let options;
            switch (type) {
                case 'status':
                    options = createStatusChartOptions(data);
                    break;
                case 'revenue':
                    options = createRevenueChartOptions(data, hideValues);
                    break;
                case 'expenses':
                    options = createExpensesChartOptions();
                    break;
                case 'issues':
                    options = createIssuesChartOptions(data);
                    break;
                default:
                    options = createDefaultChartOptions();
            }
            
            try {
                const newChart = new ApexCharts(chartRef.current, options);
                newChart.render();
                setChart(newChart);
            } catch (error) {
                reportError(error);
                console.error('Chart rendering error:', error);
            }
        }
        
        // Cleanup function
        return () => {
            if (chart) {
                chart.destroy();
            }
        };
    }, [type, data, hideValues]);
    
    const createStatusChartOptions = (statusData) => {
        try {
            // For status chart, we use a donut chart
            const labels = [];
            const series = [];
            const colors = [];
            
            // If data is an object (like stats from Dashboard), convert it to array format
            if (!Array.isArray(statusData) && typeof statusData === 'object') {
                Object.entries(statusData).forEach(([key, value]) => {
                    if (value > 0) {
                        const statusOption = STATUS_OPTIONS.find(opt => opt.value === key);
                        if (statusOption) {
                            labels.push(statusOption.label);
                            series.push(value);
                            colors.push(getStatusColor(key));
                        }
                    }
                });
            } 
            // If data is already in array format (like from ServiceReports)
            else if (Array.isArray(statusData)) {
                statusData.forEach(item => {
                    if (item && item.count > 0) {
                        labels.push(item.status);
                        series.push(item.count);
                        colors.push(getStatusColor(getStatusKeyByLabel(item.status)));
                    }
                });
            }
            
            return {
                series: series,
                chart: {
                    type: 'donut',
                    height: 280,
                    width: '100%',
                    background: 'transparent',
                    fontFamily: 'Inter, sans-serif',
                    animations: {
                        enabled: true,
                        easing: 'easeinout',
                        speed: 800
                    },
                    toolbar: {
                        show: false
                    }
                },
                colors: colors,
                labels: labels,
                dataLabels: {
                    enabled: false
                },
                plotOptions: {
                    pie: {
                        donut: {
                            size: '60%',
                            labels: {
                                show: true,
                                name: {
                                    show: true,
                                    fontSize: '12px',
                                    color: '#fff'
                                },
                                value: {
                                    show: true,
                                    fontSize: '16px',
                                    color: '#fff',
                                    formatter: function(val) {
                                        return val;
                                    }
                                },
                                total: {
                                    show: true,
                                    label: 'Toplam',
                                    color: '#fff',
                                    formatter: function(w) {
                                        return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                                    }
                                }
                            }
                        }
                    }
                },
                legend: {
                    position: 'bottom',
                    horizontalAlign: 'center',
                    fontSize: '12px',
                    labels: {
                        colors: '#fff'
                    },
                    markers: {
                        width: 10,
                        height: 10,
                        radius: 10
                    },
                    itemMargin: {
                        horizontal: 8,
                        vertical: 3
                    },
                    formatter: function(seriesName, opts) {
                        return [seriesName, ": ", opts.w.globals.series[opts.seriesIndex]].join('');
                    }
                },
                tooltip: {
                    theme: 'dark',
                    y: {
                        formatter: function(val) {
                            return val + ' cihaz';
                        }
                    }
                },
                responsive: [
                    {
                        breakpoint: 480,
                        options: {
                            chart: {
                                height: 260
                            },
                            legend: {
                                position: 'bottom',
                                fontSize: '10px'
                            }
                        }
                    }
                ]
            };
        } catch (error) {
            reportError(error);
            console.error('Status chart options error:', error);
            return createDefaultChartOptions();
        }
    };
    
    const createRevenueChartOptions = (revenueData, hideValues) => {
        try {
            // For revenue chart, we use a bar chart
            const categories = [];
            const series = [{
                name: 'Gelir',
                data: []
            }];
            
            // Process data based on format
            if (Array.isArray(revenueData)) {
                revenueData.forEach(item => {
                    categories.push(item.month || item.label || '');
                    series[0].data.push(Number(item.amount) || 0);
                });
            }
            
            return {
                series: series,
                chart: {
                    type: 'bar',
                    height: 280,
                    width: '100%',
                    background: 'transparent',
                    fontFamily: 'Inter, sans-serif',
                    toolbar: {
                        show: false
                    },
                    animations: {
                        enabled: true,
                        easing: 'easeinout',
                        speed: 800
                    }
                },
                plotOptions: {
                    bar: {
                        horizontal: false,
                        columnWidth: '60%',
                        borderRadius: 4,
                        dataLabels: {
                            position: 'top'
                        }
                    }
                },
                colors: ['#3b82f6'],
                dataLabels: {
                    enabled: false
                },
                stroke: {
                    show: true,
                    width: 2,
                    colors: ['transparent']
                },
                xaxis: {
                    categories: categories,
                    labels: {
                        style: {
                            colors: '#9ca3af',
                            fontSize: '10px'
                        },
                        rotate: -45,
                        rotateAlways: true,
                        hideOverlappingLabels: true,
                        trim: true,
                        maxHeight: 50
                    },
                    axisBorder: {
                        show: false
                    },
                    axisTicks: {
                        show: false
                    }
                },
                yaxis: {
                    labels: {
                        style: {
                            colors: '#9ca3af',
                            fontSize: '10px'
                        },
                        formatter: function(val) {
                            return hideValues ? '***' : '₺' + val.toFixed(0);
                        }
                    }
                },
                fill: {
                    opacity: 1,
                    type: 'gradient',
                    gradient: {
                        shade: 'dark',
                        type: 'vertical',
                        shadeIntensity: 0.5,
                        gradientToColors: ['#60a5fa'],
                        inverseColors: false,
                        opacityFrom: 1,
                        opacityTo: 0.8
                    }
                },
                tooltip: {
                    theme: 'dark',
                    y: {
                        formatter: function(val) {
                            return hideValues ? '***' : '₺' + val.toFixed(2);
                        }
                    }
                },
                grid: {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    strokeDashArray: 4,
                    yaxis: {
                        lines: {
                            show: true
                        }
                    }
                }
            };
        } catch (error) {
            reportError(error);
            console.error('Revenue chart options error:', error);
            return createDefaultChartOptions();
        }
    };
    
    const createExpensesChartOptions = () => {
        try {
            // Mock data for expenses chart
            const mockData = [
                { category: 'Elektrik', amount: 1200 },
                { category: 'İnternet', amount: 600 },
                { category: 'Kira', amount: 3500 },
                { category: 'Malzeme', amount: 2200 },
                { category: 'Diğer', amount: 800 }
            ];
            
            return {
                series: mockData.map(item => item.amount),
                chart: {
                    type: 'pie',
                    height: 280,
                    width: '100%',
                    background: 'transparent',
                    fontFamily: 'Inter, sans-serif',
                    toolbar: {
                        show: false
                    }
                },
                labels: mockData.map(item => item.category),
                colors: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'],
                plotOptions: {
                    pie: {
                        expandOnClick: true
                    }
                },
                dataLabels: {
                    enabled: true,
                    style: {
                        fontSize: '12px',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500
                    },
                    dropShadow: {
                        enabled: false
                    }
                },
                legend: {
                    position: 'bottom',
                    horizontalAlign: 'center',
                    fontSize: '12px',
                    labels: {
                        colors: '#fff'
                    },
                    markers: {
                        width: 10,
                        height: 10,
                        radius: 10
                    },
                    itemMargin: {
                        horizontal: 8,
                        vertical: 3
                    }
                },
                tooltip: {
                    theme: 'dark',
                    y: {
                        formatter: function(val) {
                            return '₺' + val.toFixed(2);
                        }
                    }
                },
                responsive: [
                    {
                        breakpoint: 480,
                        options: {
                            chart: {
                                height: 260
                            },
                            legend: {
                                position: 'bottom',
                                fontSize: '10px'
                            }
                        }
                    }
                ]
            };
        } catch (error) {
            reportError(error);
            console.error('Expenses chart options error:', error);
            return createDefaultChartOptions();
        }
    };
    
    const createIssuesChartOptions = (issuesData) => {
        try {
            // For issues chart, we use a bar chart
            const categories = [];
            const series = [{
                name: 'Arıza Sayısı',
                data: []
            }];
            
            // Process data based on format
            if (Array.isArray(issuesData)) {
                issuesData.forEach(item => {
                    categories.push(item.name || '');
                    series[0].data.push(item.count || 0);
                });
            }
            
            return {
                series: series,
                chart: {
                    type: 'bar',
                    height: 280,
                    width: '100%',
                    background: 'transparent',
                    fontFamily: 'Inter, sans-serif',
                    toolbar: {
                        show: false
                    }
                },
                plotOptions: {
                    bar: {
                        horizontal: true,
                        borderRadius: 4,
                        barHeight: '70%',
                        distributed: true
                    }
                },
                colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
                dataLabels: {
                    enabled: true,
                    textAnchor: 'start',
                    style: {
                        colors: ['#fff'],
                        fontSize: '12px'
                    },
                    formatter: function(val) {
                        return val;
                    },
                    offsetX: 0
                },
                xaxis: {
                    categories: categories,
                    labels: {
                        style: {
                            colors: '#9ca3af',
                            fontSize: '10px'
                        }
                    },
                    axisBorder: {
                        show: false
                    },
                    axisTicks: {
                        show: false
                    }
                },
                yaxis: {
                    labels: {
                        style: {
                            colors: '#9ca3af',
                            fontSize: '10px'
                        },
                        maxWidth: 150,
                        trim: true
                    }
                },
                grid: {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    strokeDashArray: 4,
                    xaxis: {
                        lines: {
                            show: true
                        }
                    }
                },
                tooltip: {
                    theme: 'dark',
                    y: {
                        formatter: function(val) {
                            return val + ' adet';
                        }
                    }
                }
            };
        } catch (error) {
            reportError(error);
            console.error('Issues chart options error:', error);
            return createDefaultChartOptions();
        }
    };
    
    const createDefaultChartOptions = () => {
        return {
            series: [{
                name: 'Veri',
                data: [10, 20, 15, 25, 30, 20, 15]
            }],
            chart: {
                type: 'line',
                height: 280,
                width: '100%',
                background: 'transparent',
                fontFamily: 'Inter, sans-serif',
                toolbar: {
                    show: false
                }
            },
            colors: ['#3b82f6'],
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: 'smooth',
                width: 3
            },
            xaxis: {
                categories: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz'],
                labels: {
                    style: {
                        colors: '#9ca3af',
                        fontSize: '10px'
                    }
                }
            },
            yaxis: {
                labels: {
                    style: {
                        colors: '#9ca3af',
                        fontSize: '10px'
                    }
                }
            },
            tooltip: {
                theme: 'dark'
            },
            grid: {
                borderColor: 'rgba(255, 255, 255, 0.1)',
                strokeDashArray: 4
            }
        };
    };
    
    const getStatusColor = (status) => {
        switch(status) {
            case 'pending': return '#f59e0b'; // yellow
            case 'diagnosing': return '#3b82f6'; // blue
            case 'repairing': return '#6366f1'; // indigo
            case 'waiting_part': return '#f97316'; // orange
            case 'completed': return '#10b981'; // green
            case 'delivered': return '#8b5cf6'; // purple
            case 'cancelled': return '#ef4444'; // red
            default: return '#6b7280'; // gray
        }
    };
    
    const getStatusKeyByLabel = (label) => {
        const status = STATUS_OPTIONS.find(option => option.label === label);
        return status ? status.value : 'pending';
    };
    
    return (
        <div className="chart-wrapper w-full h-full" data-name="chart-container">
            <div ref={chartRef} className="w-full h-full"></div>
        </div>
    );
}
