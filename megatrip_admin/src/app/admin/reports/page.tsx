"use client"
import { useState } from "react";
import {
    BarChart3,
    Download,
    Filter,
    Calendar,
    TrendingUp,
    DollarSign,
    Users,
    ShoppingBag,
    Plane,
    MapPin,
    Bus,
    Clock
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { DatePickerWithRange } from "../../components/ui/date-range-picker";
import { ModalForm } from "../../components/ModalForm";
import { useToast } from "../../components/ui/use-toast";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock data for reports
const revenueData = [
    { month: 'T1', total: 8500000000, flights: 4200000000, tours: 2800000000, buses: 1500000000 },
    { month: 'T2', total: 9200000000, flights: 4600000000, tours: 3100000000, buses: 1500000000 },
    { month: 'T3', total: 10100000000, flights: 5100000000, tours: 3200000000, buses: 1800000000 },
    { month: 'T4', total: 11200000000, flights: 5600000000, tours: 3700000000, buses: 1900000000 },
    { month: 'T5', total: 10800000000, flights: 5300000000, tours: 3600000000, buses: 1900000000 },
    { month: 'T6', total: 12450000000, flights: 6200000000, tours: 4050000000, buses: 2200000000 },
];

const serviceDistribution = [
    { name: 'Vé máy bay', value: 6200000000, color: '#1E88E5' },
    { name: 'Tour du lịch', value: 4050000000, color: '#FFC107' },
    { name: 'Vé xe khách', value: 2200000000, color: '#4CAF50' },
];

const orderStats = [
    { month: 'T1', orders: 1250, completed: 1180, cancelled: 70 },
    { month: 'T2', orders: 1380, completed: 1310, cancelled: 70 },
    { month: 'T3', orders: 1520, completed: 1445, cancelled: 75 },
    { month: 'T4', orders: 1650, completed: 1570, cancelled: 80 },
    { month: 'T5', orders: 1580, completed: 1500, cancelled: 80 },
    { month: 'T6', orders: 1847, completed: 1760, cancelled: 87 },
];

const customerStats = [
    { month: 'T1', newUsers: 120, returningUsers: 580 },
    { month: 'T2', newUsers: 145, returningUsers: 620 },
    { month: 'T3', newUsers: 160, returningUsers: 680 },
    { month: 'T4', newUsers: 180, returningUsers: 720 },
    { month: 'T5', newUsers: 165, returningUsers: 740 },
    { month: 'T6', newUsers: 195, returningUsers: 810 },
];

const promoStats = [
    { code: 'SUMMER2024', uses: 450, discount: 125000000, conversion: 12.5 },
    { code: 'WELCOME10', uses: 320, discount: 89000000, conversion: 8.7 },
    { code: 'FAMILY20', uses: 180, discount: 156000000, conversion: 15.2 },
    { code: 'EARLY15', uses: 290, discount: 78000000, conversion: 9.8 },
];

export default function Reports() {
    const [reportType, setReportType] = useState("revenue");
    const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>({
        from: new Date(2024, 0, 1),
        to: new Date(2024, 5, 30)
    });
    const [granularity, setGranularity] = useState("month");
    const [serviceType, setServiceType] = useState("all");
    const [operator, setOperator] = useState("all");
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
    const { toast } = useToast();

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN').format(value / 1000000) + ' triệu ₫';
    };

    const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
        toast({
            title: "Đang xuất báo cáo",
            description: `Báo cáo ${reportType} đang được tạo dưới định dạng ${format.toUpperCase()}...`,
        });
        // Mock export delay
        setTimeout(() => {
            toast({
                title: "Xuất báo cáo thành công",
                description: `File báo cáo đã được tải xuống`,
            });
        }, 2000);
    };

    const handleScheduleReport = () => {
        setScheduleModalOpen(false);
        toast({
            title: "Lập lịch báo cáo thành công",
            description: "Báo cáo sẽ được gửi tự động theo lịch đã đặt",
        });
    };

    const renderChart = () => {
        switch (reportType) {
            case "revenue":
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis tickFormatter={(value) => formatCurrency(value)} />
                            <Tooltip
                                formatter={(value: number) => [formatCurrency(value * 1000000), ""]}
                                labelFormatter={(label) => `Tháng ${label}`}
                            />
                            <Legend />
                            <Bar dataKey="flights" stackId="a" fill="#1E88E5" name="Vé máy bay" />
                            <Bar dataKey="tours" stackId="a" fill="#FFC107" name="Tour du lịch" />
                            <Bar dataKey="buses" stackId="a" fill="#4CAF50" name="Vé xe" />
                        </BarChart>
                    </ResponsiveContainer>
                );

            case "orders":
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={orderStats}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip labelFormatter={(label) => `Tháng ${label}`} />
                            <Legend />
                            <Line type="monotone" dataKey="orders" stroke="#1E88E5" name="Tổng đơn hàng" />
                            <Line type="monotone" dataKey="completed" stroke="#4CAF50" name="Đã hoàn thành" />
                            <Line type="monotone" dataKey="cancelled" stroke="#F44336" name="Đã hủy" />
                        </LineChart>
                    </ResponsiveContainer>
                );

            case "customers":
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={customerStats}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip labelFormatter={(label) => `Tháng ${label}`} />
                            <Legend />
                            <Bar dataKey="newUsers" fill="#1E88E5" name="Khách hàng mới" />
                            <Bar dataKey="returningUsers" fill="#FFC107" name="Khách hàng quay lại" />
                        </BarChart>
                    </ResponsiveContainer>
                );

            case "promo":
                return (
                    <div className="space-y-4">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={promoStats}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={120}
                                    paddingAngle={5}
                                    dataKey="uses"
                                >
                                    {promoStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={`hsl(${index * 90}, 70%, 50%)`} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="grid grid-cols-2 gap-4">
                            {promoStats.map((promo, index) => (
                                <div key={promo.code} className="p-4 border rounded-lg">
                                    <h4 className="font-medium">{promo.code}</h4>
                                    <div className="mt-2 space-y-1 text-sm">
                                        <div>Lượt sử dụng: <span className="font-medium">{promo.uses}</span></div>
                                        <div>Tổng giảm: <span className="font-medium">{formatCurrency(promo.discount)}</span></div>
                                        <div>Tỷ lệ chuyển đổi: <span className="font-medium">{promo.conversion}%</span></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    const getSummaryData = () => {
        switch (reportType) {
            case "revenue":
                const totalRevenue = revenueData.reduce((sum, item) => sum + item.total, 0);
                const avgMonthly = totalRevenue / revenueData.length;
                return [
                    { label: "Tổng doanh thu", value: formatCurrency(totalRevenue), icon: DollarSign, color: "text-green-600" },
                    { label: "Trung bình/tháng", value: formatCurrency(avgMonthly), icon: TrendingUp, color: "text-blue-600" },
                    { label: "Tăng trưởng", value: "+18.2%", icon: TrendingUp, color: "text-green-600" },
                    { label: "Dịch vụ hàng đầu", value: "Vé máy bay", icon: Plane, color: "text-purple-600" },
                ];

            case "orders":
                const totalOrders = orderStats.reduce((sum, item) => sum + item.orders, 0);
                const completionRate = (orderStats.reduce((sum, item) => sum + item.completed, 0) / totalOrders * 100).toFixed(1);
                return [
                    { label: "Tổng đơn hàng", value: totalOrders.toLocaleString(), icon: ShoppingBag, color: "text-blue-600" },
                    { label: "Tỷ lệ hoàn thành", value: `${completionRate}%`, icon: TrendingUp, color: "text-green-600" },
                    { label: "Đơn hủy", value: orderStats.reduce((sum, item) => sum + item.cancelled, 0).toString(), icon: ShoppingBag, color: "text-red-600" },
                    { label: "Tăng trưởng", value: "+12.5%", icon: TrendingUp, color: "text-green-600" },
                ];

            case "customers":
                const totalNew = customerStats.reduce((sum, item) => sum + item.newUsers, 0);
                const totalReturning = customerStats.reduce((sum, item) => sum + item.returningUsers, 0);
                const retentionRate = (totalReturning / (totalNew + totalReturning) * 100).toFixed(1);
                return [
                    { label: "Khách hàng mới", value: totalNew.toLocaleString(), icon: Users, color: "text-blue-600" },
                    { label: "Khách quay lại", value: totalReturning.toLocaleString(), icon: Users, color: "text-green-600" },
                    { label: "Tỷ lệ giữ chân", value: `${retentionRate}%`, icon: TrendingUp, color: "text-purple-600" },
                    { label: "Tăng trưởng", value: "+8.1%", icon: TrendingUp, color: "text-green-600" },
                ];

            case "promo":
                const totalUses = promoStats.reduce((sum, item) => sum + item.uses, 0);
                const totalDiscount = promoStats.reduce((sum, item) => sum + item.discount, 0);
                const avgConversion = (promoStats.reduce((sum, item) => sum + item.conversion, 0) / promoStats.length).toFixed(1);
                return [
                    { label: "Tổng lượt dùng", value: totalUses.toLocaleString(), icon: MapPin, color: "text-blue-600" },
                    { label: "Tổng giảm giá", value: formatCurrency(totalDiscount), icon: DollarSign, color: "text-red-600" },
                    { label: "Tỷ lệ chuyển đổi TB", value: `${avgConversion}%`, icon: TrendingUp, color: "text-green-600" },
                    { label: "Mã hiệu quả nhất", value: "FAMILY20", icon: MapPin, color: "text-purple-600" },
                ];

            default:
                return [];
        }
    };

    const renderScheduleModal = () => (
        <div className="space-y-4">
            <div>
                <Label htmlFor="schedule-report-type">Loại báo cáo *</Label>
                <Select defaultValue={reportType}>
                    <SelectTrigger className="bg-white">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                        className="bg-white"
                    >
                        <SelectItem value="revenue">Báo cáo doanh thu</SelectItem>
                        <SelectItem value="orders">Báo cáo đơn hàng</SelectItem>
                        <SelectItem value="customers">Báo cáo khách hàng</SelectItem>
                        <SelectItem value="promo">Báo cáo khuyến mãi</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Label htmlFor="frequency">Tần suất *</Label>
                <Select defaultValue="weekly">
                    <SelectTrigger className="bg-white">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="daily">Hàng ngày</SelectItem>
                        <SelectItem value="weekly">Hàng tuần</SelectItem>
                        <SelectItem value="monthly">Hàng tháng</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Label htmlFor="time">Thời gian gửi *</Label>
                <Input
                    id="time"
                    type="time"
                    defaultValue="08:00"
                />
            </div>

            <div>
                <Label htmlFor="recipients">Email nhận báo cáo *</Label>
                <Input
                    id="recipients"
                    placeholder="email1@domain.com, email2@domain.com"
                />
            </div>

            <div>
                <Label htmlFor="format">Định dạng file *</Label>
                <Select defaultValue="excel">
                    <SelectTrigger className="bg-white">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );

    return (
        <div className="p-6 space-y-6 bg-gray-50">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Thống kê & Báo cáo</h1>
                    <p className="text-gray-600 mt-1">Phân tích dữ liệu kinh doanh và xuất báo cáo chi tiết</p>
                </div>
                <Button onClick={() => setScheduleModalOpen(true)}
                    className="hover:bg-primary-600 hover:text-white"

                    variant="outline">
                    <Clock className="w-4 h-4 mr-2" />
                    Lập lịch báo cáo
                </Button>
            </div>

            {/* Filters Panel */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Filter className="w-5 h-5 mr-2" />
                        Bộ lọc báo cáo
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                        <div>
                            <Label htmlFor="reportType">Loại báo cáo</Label>
                            
                            <Select value={reportType} onValueChange={setReportType}
                            >
                                <SelectTrigger className="bg-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent
                                
                                >
                                    <SelectItem value="revenue">Doanh thu</SelectItem>
                                    <SelectItem value="orders">Đơn hàng</SelectItem>
                                    <SelectItem value="customers">Khách hàng</SelectItem>
                                    <SelectItem value="promo">Khuyến mãi</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Khoảng thời gian</Label>
                            <DatePickerWithRange
                                date={dateRange}
                                onDateChange={setDateRange}
                            />
                        </div>

                        <div>
                            <Label htmlFor="granularity">Theo</Label>
                            <Select value={granularity} onValueChange={setGranularity}>
                                <SelectTrigger className="bg-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="day">Ngày</SelectItem>
                                    <SelectItem value="month">Tháng</SelectItem>
                                    <SelectItem value="year">Năm</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="serviceType">Loại dịch vụ</Label>
                            <Select value={serviceType} onValueChange={setServiceType}>
                                <SelectTrigger className="bg-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    <SelectItem value="flights">Vé máy bay</SelectItem>
                                    <SelectItem value="tours">Tour du lịch</SelectItem>
                                    <SelectItem value="buses">Vé xe</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
{/* 
                        <div>
                            <Label htmlFor="operator">Đối tác</Label>
                            <Select value={operator} onValueChange={setOperator}>
                                <SelectTrigger className="bg-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    <SelectItem value="vn">Vietnam Airlines</SelectItem>
                                    <SelectItem value="vj">VietJet Air</SelectItem>
                                    <SelectItem value="qh">Bamboo Airways</SelectItem>
                                </SelectContent>
                            </Select>
                        </div> */}
                    </div>
                </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {getSummaryData().map((item, index) => (
                    <Card key={index}>
                        <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">{item.label}</p>
                                    <p className="text-2xl font-bold">{item.value}</p>
                                </div>
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100`}>
                                    <item.icon className={`w-5 h-5 ${item.color}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Chart */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>
                                {reportType === "revenue" && "Biểu đồ doanh thu"}
                                {reportType === "orders" && "Biểu đồ đơn hàng"}
                                {reportType === "customers" && "Biểu đồ khách hàng"}
                                {reportType === "promo" && "Hiệu suất khuyến mãi"}
                            </CardTitle>
                            <CardDescription>
                                Dữ liệu được cập nhật theo thời gian thực
                            </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleExport('csv')}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                CSV
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleExport('excel')}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Excel
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleExport('pdf')}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                PDF
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {renderChart()}
                </CardContent>
            </Card>

            {/* Summary Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Bảng tóm tắt</CardTitle>
                    <CardDescription>Chi tiết dữ liệu theo từng mục</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2">Thời kỳ</th>
                                    {reportType === "revenue" && (
                                        <>
                                            <th className="text-right py-2">Vé máy bay</th>
                                            <th className="text-right py-2">Tour du lịch</th>
                                            <th className="text-right py-2">Vé xe</th>
                                            <th className="text-right py-2">Tổng cộng</th>
                                        </>
                                    )}
                                    {reportType === "orders" && (
                                        <>
                                            <th className="text-right py-2">Tổng đơn</th>
                                            <th className="text-right py-2">Hoàn thành</th>
                                            <th className="text-right py-2">Hủy</th>
                                            <th className="text-right py-2">Tỷ lệ hoàn thành</th>
                                        </>
                                    )}
                                    {reportType === "customers" && (
                                        <>
                                            <th className="text-right py-2">Khách mới</th>
                                            <th className="text-right py-2">Khách quay lại</th>
                                            <th className="text-right py-2">Tổng</th>
                                            <th className="text-right py-2">Tỷ lệ giữ chân</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {reportType === "revenue" && revenueData.map((row, index) => (
                                    <tr key={index} className="border-b">
                                        <td className="py-2">Tháng {row.month}</td>
                                        <td className="text-right py-2">{formatCurrency(row.flights)}</td>
                                        <td className="text-right py-2">{formatCurrency(row.tours)}</td>
                                        <td className="text-right py-2">{formatCurrency(row.buses)}</td>
                                        <td className="text-right py-2 font-bold">{formatCurrency(row.total)}</td>
                                    </tr>
                                ))}
                                {reportType === "orders" && orderStats.map((row, index) => (
                                    <tr key={index} className="border-b">
                                        <td className="py-2">Tháng {row.month}</td>
                                        <td className="text-right py-2">{row.orders.toLocaleString()}</td>
                                        <td className="text-right py-2">{row.completed.toLocaleString()}</td>
                                        <td className="text-right py-2">{row.cancelled.toLocaleString()}</td>
                                        <td className="text-right py-2">{(row.completed / row.orders * 100).toFixed(1)}%</td>
                                    </tr>
                                ))}
                                {reportType === "customers" && customerStats.map((row, index) => (
                                    <tr key={index} className="border-b">
                                        <td className="py-2">Tháng {row.month}</td>
                                        <td className="text-right py-2">{row.newUsers.toLocaleString()}</td>
                                        <td className="text-right py-2">{row.returningUsers.toLocaleString()}</td>
                                        <td className="text-right py-2">{(row.newUsers + row.returningUsers).toLocaleString()}</td>
                                        <td className="text-right py-2">{(row.returningUsers / (row.newUsers + row.returningUsers) * 100).toFixed(1)}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Schedule Report Modal */}
            <ModalForm
                open={scheduleModalOpen}
                onOpenChange={setScheduleModalOpen}
                title="Lập lịch báo cáo tự động"
                description="Thiết lập gửi báo cáo định kỳ qua email"
                mode="create"
                size="medium"
                onSubmit={handleScheduleReport}
            >
                <div className="max-h-[70vh] overflow-y-auto pr-2">

                    {renderScheduleModal()}
                </div>  
            </ModalForm>
        </div>
    );
}
