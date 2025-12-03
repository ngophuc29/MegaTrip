"use client";

import { useState, useEffect, useMemo } from "react";
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
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { DatePickerWithRange } from "../../components/ui/date-range-picker";
import { ModalForm } from "../../components/ModalForm";
import { useToast } from "../../components/ui/use-toast";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { DateRange } from "react-day-picker";

export default function Reports() {
  const [reportType, setReportType] = useState("revenue");
  const [granularity, setGranularity] = useState("month");
  const [serviceType, setServiceType] = useState("all");
  const [operator, setOperator] = useState("all");
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const { toast } = useToast();

  // Add state for API data
  const [revenueData, setRevenueData] = useState([]);
  const [serviceDistribution, setServiceDistribution] = useState([]);
  const [orderStats, setOrderStats] = useState([]);
  const [customerStats, setCustomerStats] = useState([]);
  const [promoStats, setPromoStats] = useState([
    { code: "SUMMER2024", uses: 450, discount: 125000000, conversion: 12.5 },
    { code: "WELCOME10", uses: 320, discount: 89000000, conversion: 8.7 },
    { code: "FAMILY20", uses: 180, discount: 156000000, conversion: 15.2 },
    { code: "EARLY15", uses: 290, discount: 78000000, conversion: 8.8 },
    { code: "FLASH50", uses: 150, discount: 50000000, conversion: 10.0 },
  ] as any);
  const [loading, setLoading] = useState(false);
  const [productsData, setProductsData] = useState([] as any[]);

  // Thêm state cho dateRange dựa trên granularity
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const [monthRange, setMonthRange] = useState({ fromMonth: (currentMonth === 1 ? 12 : currentMonth - 1).toString(), fromYear: (currentMonth === 1 ? currentYear - 1 : currentYear).toString(), toMonth: currentMonth.toString(), toYear: currentYear.toString() }); // Chuyển thành string
  const [yearRange, setYearRange] = useState({ fromYear: currentYear.toString(), toYear: currentYear.toString() }); // Chuyển thành string

  // API base URL (adjust if needed)
  const API_BASE = "http://localhost:7700/api/stats";

  // Tính dateParams và granularityParam bằng useMemo
  const { dateParams, granularityParam } = useMemo(() => {
    let dateParams = "";
    if (granularity === "day" && dateRange?.from && dateRange?.to) {
      dateParams = `&start=${dateRange.from.toISOString()}&end=${dateRange.to.toISOString()}`;
    } else if (granularity === "month" && monthRange.fromMonth && monthRange.fromYear && monthRange.toMonth && monthRange.toYear) {
      const start = new Date(monthRange.fromYear, monthRange.fromMonth - 1, 1);
      const end = new Date(monthRange.toYear, monthRange.toMonth, 0);
      dateParams = `&start=${start.toISOString()}&end=${end.toISOString()}`;
    } else if (granularity === "year" && yearRange.fromYear && yearRange.toYear) {
      const start = new Date(yearRange.fromYear, 0, 1);
      const end = new Date(yearRange.toYear, 11, 31);
      dateParams = `&start=${start.toISOString()}&end=${end.toISOString()}`;
    }
    const granularityParam = `&granularity=${granularity}`;
    return { dateParams, granularityParam };
  }, [granularity, dateRange, monthRange, yearRange]);

  // useEffect để cập nhật state dựa trên granularity
  useEffect(() => {
    const now = new Date();
    if (granularity === "day") {
      const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      setDateRange({ from: start, to: now });
      setMonthRange({ fromMonth: undefined, fromYear: undefined, toMonth: undefined, toYear: undefined });
      setYearRange({ fromYear: undefined, toYear: undefined });
    } else if (granularity === "month") {
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      setMonthRange({ fromMonth: prevMonth.toString(), fromYear: prevYear.toString(), toMonth: currentMonth.toString(), toYear: currentYear.toString() }); // Chuyển thành string
      setDateRange(undefined);
      setYearRange({ fromYear: undefined, toYear: undefined });
    } else if (granularity === "year") {
      const currentYear = now.getFullYear();
      setYearRange({ fromYear: currentYear.toString(), toYear: currentYear.toString() }); // Chuyển thành string
      setDateRange(undefined);
      setMonthRange({ fromMonth: undefined, fromYear: undefined, toMonth: undefined, toYear: undefined });
    }
  }, [granularity]);

  // Fetch data based on reportType
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let endpoint = "";
        let response;
        let data;

        // Sử dụng dateParams và granularityParam từ useMemo
        switch (reportType) {
          case "revenue":
            endpoint = `${API_BASE}/revenue?${dateParams}${granularityParam}`;
            response = await fetch(endpoint);
            data = await response.json();
            setRevenueData(data.revenueOverTime || []);
            setServiceDistribution(data.revenueByType || []);
            break;
          case "orders":
            endpoint = `${API_BASE}/orders?${dateParams}${granularityParam}`;
            response = await fetch(endpoint);
            data = await response.json();
            setOrderStats(data.ordersOverTime || []);
            break;
          case "customers":
            // Placeholder for customers
            setCustomerStats([]);
            break;
          case "promo":
            // Placeholder for promo
            break;
          case "products":
            endpoint = `${API_BASE}/products?${dateParams}${granularityParam}`;
            response = await fetch(endpoint);
            data = await response.json();
            // Use productsWithStats (contains all products with confirmed/cancelled counts and revenue from paid+confirmed only)
            {
              const src = data.productsWithStats || [];
              const normalized = src.map((p: any) => ({
                name: p.name,
                type: p.type,
                totalBookings: p.totalBookings ?? 0,
                totalConfirmedOrders: p.totalConfirmedOrders ?? 0,
                totalCancelledOrders: p.totalCancelledOrders ?? 0,
                totalRevenue: p.totalRevenue ?? 0,
              }));
              setProductsData(normalized);
            }
            break;
          default:
            break;
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [reportType, dateParams, granularityParam]);

  // Sửa hàm formatCurrency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
  };

  const handleExport = (format: "csv" | "excel" | "pdf") => {
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

  const renderDateRange = () => {
    if (granularity === "day") {
      return (
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={
              dateRange?.from
                ? dateRange.from.toISOString().slice(0, 10)
                : ""
            }
            onChange={(e) => {
              setDateRange({
                from: e.target.value
                  ? new Date(e.target.value)
                  : undefined,
                to: dateRange?.to,
              });
            }}
            className="w-[200px]"
          />
          <span className="mx-1">-</span>
          <Input
            type="date"
            value={
              dateRange?.to ? dateRange.to.toISOString().slice(0, 10) : ""
            }
            onChange={(e) => {
              setDateRange({
                from: dateRange?.from,
                to: e.target.value ? new Date(e.target.value) : undefined,
              });
            }}
            className="w-[200px]"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDateRange(undefined)}
            className="ml-2"
          >
            Clear
          </Button>
        </div>
      );
    } else if (granularity === "month") {
      return (
        <div className="flex items-center gap-2">
          <Select value={monthRange.fromMonth} onValueChange={(value) => setMonthRange({ ...monthRange, fromMonth: value })}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Tháng" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={monthRange.fromYear} onValueChange={(value) => setMonthRange({ ...monthRange, fromYear: value })}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Năm" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 10 }, (_, i) => (
                <SelectItem key={2025 - i} value={(2025 - i).toString()}>
                  {2025 - i}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="mx-1">-</span>
          <Select value={monthRange.toMonth} onValueChange={(value) => setMonthRange({ ...monthRange, toMonth: value })}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Tháng" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={monthRange.toYear} onValueChange={(value) => setMonthRange({ ...monthRange, toYear: value })}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Năm" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 10 }, (_, i) => (
                <SelectItem key={2025 - i} value={(2025 - i).toString()}>
                  {2025 - i}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMonthRange({ fromMonth: undefined, fromYear: undefined, toMonth: undefined, toYear: undefined })}
            className="ml-2"
          >
            Clear
          </Button>
        </div>
      );
    } else if (granularity === "year") {
      return (
        <div className="flex items-center gap-2">
          <Select value={yearRange.fromYear} onValueChange={(value) => setYearRange({ fromYear: value, toYear: value })}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Năm" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 10 }, (_, i) => (
                <SelectItem key={2025 - i} value={(2025 - i).toString()}>
                  {2025 - i}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setYearRange({ fromYear: undefined, toYear: undefined })}
            className="ml-2"
          >
            Clear
          </Button>
        </div>
      );
    }
  };

  const renderChart = () => {
    if (loading)
      return (
        <div className="flex justify-center items-center h-64">
          Đang tải dữ liệu...
        </div>
      );

    switch (reportType) {
      case "products":
        // Group products by name and type to avoid duplicates
        const groupedProducts = productsData.reduce((acc: any, product: any) => {
          const key = `${product.name}-${product.type}`;
          if (!acc[key]) {
            acc[key] = { ...product };
          } else {
            acc[key].totalBookings += product.totalBookings ?? 0;
            acc[key].totalConfirmedOrders += product.totalConfirmedOrders ?? 0;
            acc[key].totalCancelledOrders += product.totalCancelledOrders ?? 0;
            acc[key].totalRevenue += product.totalRevenue ?? 0;
          }
          return acc;
        }, {});

        const groupedArray = Object.values(groupedProducts);

        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Tổng Tour</p>
                      <p className="text-2xl font-bold">
                        {groupedArray.filter((p:any) => p.type === "tour").length}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Tổng Xe</p>
                      <p className="text-2xl font-bold">
                        {groupedArray.filter((p:any) => p.type === "bus").length}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-100">
                      <Bus className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Tổng Vé Máy Bay</p>
                      <p className="text-2xl font-bold">
                        {groupedArray.filter((p:any) => p.type === "flight").length}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-100">
                      <Plane className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <h1 className="text-2xl font-bold">
              Biểu đồ tổng quan sản phẩm trong đơn đặt{" "}
            </h1>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={groupedArray}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip labelFormatter={(label) => `Sản phẩm: ${label}`} />
                <Legend />
                <Bar dataKey="totalBookings" fill="#1E88E5" name="Tổng đặt" />
              </BarChart>
            </ResponsiveContainer>

            <div className="overflow-x-auto">
              {/* Thêm note cho tab products */}
              {reportType === "products" && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Lưu ý:</strong> &quot;Đơn duyệt&quot; là số đơn hàng đã được duyệt và hoàn thành thành công (confirmed orders). &quot;Doanh thu&quot; chỉ tính từ đơn đã duyệt và thanh toán thành công.
                  </p>
                </div>
              )}
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Tên sản phẩm</th>
                    <th className="text-right py-2">Loại</th>
                    <th className="text-right py-2">Tổng đặt</th>
                    <th className="text-right py-2">Đơn duyệt</th>
                    <th className="text-right py-2">Đơn hủy</th>
                    <th className="text-right py-2">Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedArray.map((product:any, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">{product.name}</td>
                      <td className="text-right py-2">
                        {product.type === "tour"
                          ? "Tour"
                          : product.type === "bus"
                            ? "Xe"
                            : "Máy bay"}
                      </td>
                      <td className="text-right py-2">
                        {product.totalBookings ?? 0}
                      </td>
                      <td className="text-right py-2">
                        {product.totalConfirmedOrders ?? 0}
                      </td>
                      <td className="text-right py-2">
                        {product.totalCancelledOrders ?? 0}
                      </td>
                      <td className="text-right py-2">
                        {formatCurrency(product.totalRevenue ?? 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );


      case "revenue":
        return (
          <ResponsiveContainer width="99%" height={600}>
            <BarChart
              data={revenueData}
              margin={{ top: 20, right: 10, left: 40, bottom: 10 }} // 👈 THÊM DÒNG NÀY
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), ""]}
                labelFormatter={(label) => `${granularity === 'day' ? 'Ngày' : 'Tháng'} ${label}`}
              />
              <Legend />

              <Bar
                dataKey="flight"
                stackId="a"
                fill="#1E88E5"
                name="Vé máy bay"
              />
              <Bar
                dataKey="tour"
                stackId="a"
                fill="#FFC107"
                name="Tour du lịch"
              />
              <Bar dataKey="bus" stackId="a" fill="#4CAF50" name="Vé xe" />
            </BarChart>
          </ResponsiveContainer>

        );

      case "orders":
        return (
          <ResponsiveContainer width="100%" height={500} style={{ margin: 10 }}>
            <LineChart data={orderStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip labelFormatter={(label) => `${label}`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#1E88E5"
                name="Tổng đơn hàng"
              />
              <Line
                type="monotone"
                dataKey="confirmed"
                stroke="#4CAF50"
                name="Đã hoàn thành"
              />
              <Line
                type="monotone"
                dataKey="cancelled"
                stroke="#F44336"
                name="Đã hủy"
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case "customers":
        return (
          <ResponsiveContainer width="100%" height={500} style={{ margin: 40 }}>
            <BarChart data={customerStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip labelFormatter={(label) => `Tháng ${label}`} />
              <Legend />
              <Bar dataKey="newUsers" fill="#1E88E5" name="Khách hàng mới" />
              <Bar
                dataKey="returningUsers"
                fill="#FFC107"
                name="Khách hàng quay lại"
              />
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
                  name="Lượt sử dụng"
                >
                  {promoStats.map((entry:any, index:any) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`hsl(${index * 90}, 70%, 50%)`}
                    />
                  ))}
                </Pie>
                <Tooltip
                  labelFormatter={(label) => ""}  // Bỏ label mặc định để tránh dấu : thừa
                  formatter={(value, name, props) => [`${props.payload.title}: ${value} Lượt sử dụng`, ""]}
                />
                <Legend formatter={(value:any, entry:any) => entry.payload.title || value} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4">
              {promoStats.map((promo:any, index:any) => (
                <div key={index} className="p-4 border rounded-lg">
                  <h4 className="font-medium">{promo.title}</h4>  {/* Hiển thị title */}
                  <p className="text-sm text-gray-600">Mã: {promo.code || 'Không có'}</p>  {/* Hiển thị code */}
                  <p className="text-sm text-gray-600">Loại: {promo.autoApply ? 'Auto' : 'Manual'}</p>  {/* Hiển thị loại */}
                  <div className="mt-2 space-y-1 text-sm">
                    <div>
                      Lượt sử dụng:{" "}
                      <span className="font-medium">{promo.uses}</span>
                    </div>
                    <div>
                      Tổng giảm:{" "}
                      <span className="font-medium">
                        {formatCurrency(promo.discount)}
                      </span>
                    </div>
                    <div>
                      Tỷ lệ chuyển đổi:{" "}
                      <span className="font-medium">{promo.conversion}%</span>
                    </div>
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
    if (loading) return [];

    let growth = 0;
    let totalRevenue = 0;
    let totalOrders = 0;
    let totalNew = 0;
    let totalReturning = 0;
    let totalUses = 0;
    let totalDiscount = 0;
    let totalProducts = 0;
    let totalBookings = 0;

    switch (reportType) {
      case "revenue":
        totalRevenue = revenueData.reduce((sum:any, item:any) => sum + item.total, 0);
        const avgPeriod = totalRevenue / (revenueData.length || 1); // Tránh chia 0
        growth =
          revenueData.length > 1 && revenueData[0].total !== 0
            ? (
              ((revenueData[revenueData.length - 1].total -
                revenueData[0].total) /
                revenueData[0].total) *
              100
            ).toFixed(1)
            : 0;
        // Tính dịch vụ hàng đầu từ serviceDistribution (đã filter theo dateParams)
        const topService = serviceDistribution.reduce((max, item) => item.revenue > max.revenue ? item : max, { _id: '', revenue: 0 });
        const topServiceName = topService._id === 'flight' ? 'Vé máy bay' : topService._id === 'tour' ? 'Tour du lịch' : topService._id === 'bus' ? 'Vé xe' : 'N/A';
        const periodLabel = granularity === 'day' ? 'ngày' : granularity === 'month' ? 'tháng' : 'năm';
        return [
          {
            label: "Tổng doanh thu",
            value: formatCurrency(totalRevenue),
            icon: DollarSign,
            color: "text-green-600",
          },
          {
            label: `Trung bình/${periodLabel}`,
            value: formatCurrency(avgPeriod),
            icon: TrendingUp,
            color: "text-blue-600",
          },
          {
            label: "Tăng trưởng",
            value: `+${growth}%`,
            icon: TrendingUp,
            color: "text-green-600",
          },
          {
            label: "Dịch vụ hàng đầu",
            value: topServiceName,
            icon: Plane,
            color: "text-purple-600",
          },
        ];

      case "orders":
        totalOrders = orderStats.reduce((sum:any, item:any) => sum + item.total, 0);
        const completionRate = totalOrders
          ? (
            (orderStats.reduce((sum:any, item:any) => sum + item.confirmed, 0) /
              totalOrders) *
            100
          ).toFixed(1)
          : 0;
        growth =
          orderStats.length > 1 && orderStats[0].total !== 0
            ? (
              ((orderStats[orderStats.length - 1].total -
                orderStats[0].total) /
                orderStats[0].total) *
              100
            ).toFixed(1)
            : 0;
        return [
          {
            label: "Tổng đơn hàng",
            value: totalOrders.toLocaleString(),
            icon: ShoppingBag,
            color: "text-blue-600",
          },
          {
            label: "Tỷ lệ hoàn thành",
            value: `${completionRate}%`,
            icon: TrendingUp,
            color: "text-green-600",
          },
          {
            label: "Đơn hủy",
            value: orderStats
              .reduce((sum:any, item:any) => sum + item.cancelled, 0)
              .toString(),
            icon: ShoppingBag,
            color: "text-red-600",
          },
          {
            label: "Tăng trưởng",
            value: `+${growth}%`,
            icon: TrendingUp,
            color: "text-green-600",
          },
        ];

      case "customers":
        totalNew = customerStats.reduce((sum:any, item:any) => sum + item.newUsers, 0);
        totalReturning = customerStats.reduce(
          (sum:any, item:any) => sum + item.returningUsers,
          0
        );
        const retentionRate =
          totalNew + totalReturning
            ? ((totalReturning / (totalNew + totalReturning)) * 100).toFixed(1)
            : 0;
        growth =
          customerStats.length > 1 && customerStats[0].returningUsers !== 0
            ? (
              ((customerStats[customerStats.length - 1].returningUsers -
                customerStats[0].returningUsers) /
                customerStats[0].returningUsers) *
              100
            ).toFixed(1)
            : 0;
        return [
          {
            label: "Khách hàng mới",
            value: totalNew.toLocaleString(),
            icon: Users,
            color: "text-blue-600",
          },
          {
            label: "Khách quay lại",
            value: totalReturning.toLocaleString(),
            icon: Users,
            color: "text-green-600",
          },
          {
            label: "Tỷ lệ giữ chân",
            value: `${retentionRate}%`,
            icon: TrendingUp,
            color: "text-purple-600",
          },
          {
            label: "Tăng trưởng",
            value: `+${growth}%`,
            icon: TrendingUp,
            color: "text-green-600",
          },
        ];

      case "promo":
        totalUses = promoStats.reduce((sum:any, item:any) => sum + item.uses, 0);
        totalDiscount = promoStats.reduce(
          (sum:any, item:any) => sum + item.discount,
          0
        );
        const avgConversion = promoStats.length
          ? (
            promoStats.reduce((sum:any, item:any) => sum + item.conversion, 0) /
            promoStats.length
          ).toFixed(1)
          : 0;
        return [
          {
            label: "Tổng lượt dùng",
            value: totalUses.toLocaleString(),
            icon: MapPin,
            color: "text-blue-600",
          },
          {
            label: "Tổng giảm giá",
            value: formatCurrency(totalDiscount),
            icon: DollarSign,
            color: "text-red-600",
          },
          {
            label: "Tỷ lệ chuyển đổi TB",
            value: `${avgConversion}%`,
            icon: TrendingUp,
            color: "text-green-600",
          },
          {
            label: "Khuyến mãi hiệu quả nhất",
            value: promoStats[0]?.title || "N/A",
            icon: MapPin,
            color: "text-purple-600",
          },
        ];

      case "products":
        totalProducts = productsData.length;
        totalBookings = productsData.reduce(
          (sum:any, p:any) => sum + p.totalBookings,
          0
        );
        totalRevenue = productsData.reduce((sum:any, p:any) => sum + p.totalRevenue, 0);
        return [
          {
            label: "Tổng sản phẩm",
            value: totalProducts.toString(),
            icon: ShoppingBag,
            color: "text-blue-600",
          },
          {
            label: "Tổng lượt đặt",
            value: totalBookings.toLocaleString(),
            icon: Users,
            color: "text-green-600",
          },
          {
            label: "Tổng doanh thu",
            value: formatCurrency(totalRevenue),
            icon: DollarSign,
            color: "text-purple-600",
          },
          {
            label: "Sản phẩm hot nhất",
            value: productsData[0]?.name || "N/A",
            icon: TrendingUp,
            color: "text-red-600",
          },
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
          <SelectContent className="bg-white">
            <SelectItem value="revenue">Báo cáo doanh thu</SelectItem>
            <SelectItem value="orders">Báo cáo đơn hàng</SelectItem>
            <SelectItem value="customers">Báo cáo khách hàng</SelectItem>
            <SelectItem value="promo">Báo cáo khuyến mãi</SelectItem>
            <SelectItem value="products">Báo cáo sản phẩm</SelectItem>
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
        <Input id="time" type="time" defaultValue="08:00" />
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
          <h1 className="text-2xl font-bold text-gray-900">
            Thống kê & Báo cáo
          </h1>
          <p className="text-gray-600 mt-1">
            Phân tích dữ liệu kinh doanh và xuất báo cáo chi tiết
          </p>
        </div>
        <Button
          onClick={() => setScheduleModalOpen(true)}
          className="hover:bg-primary-600 hover:text-white"
          variant="outline"
        >
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Loại báo cáo */}
            <div className="lg:col-span-3">
              <Label htmlFor="reportType">Loại báo cáo</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Doanh thu</SelectItem>
                  <SelectItem value="orders">Đơn hàng</SelectItem>
                  {/* <SelectItem value="customers">Khách hàng</SelectItem>
                  <SelectItem value="promo">Khuyến mãi</SelectItem> */}
                  <SelectItem value="products">Sản phẩm</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Khoảng thời gian */}
            <div className="lg:col-span-4">
              <Label>Khoảng thời gian</Label>
              {renderDateRange()}
            </div>

            {/* Theo */}
            <div className="lg:col-span-2">
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

            {/* Loại dịch vụ */}
            {/* <div className="lg:col-span-3">
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
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100`}
                >
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
                {reportType === "products" && "Biểu đồ sản phẩm"}
              </CardTitle>
              <CardDescription>
                Dữ liệu được cập nhật theo thời gian
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("csv")}
              >
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("excel")}
              >
                <Download className="w-4 h-4 mr-2" />
                Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("pdf")}
              >
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent
        style={{margin:'0 10px'}}
        >{renderChart()}</CardContent>
      </Card>

      {reportType !== "products" && (
        <Card>
          <CardHeader>
            <CardTitle>Bảng tóm tắt</CardTitle>
            <CardDescription>Chi tiết dữ liệu theo từng mục</CardDescription>
          </CardHeader>
          <CardContent>
            {reportType === "products" && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Lưu ý:</strong> &quot;Đơn duyệt&quot; là số đơn hàng đã được thanh toán (confirmed orders). &quot;Doanh thu&quot; chỉ tính từ đơn đã duyệt và thanh toán thành công.
                </p>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    {reportType === "revenue" && (
                      <>
                        <th className="text-left py-2">Thời gian</th>
                        <th className="text-left py-2">Vé máy bay</th>
                        <th className="text-left py-2">Tour du lịch</th>
                        <th className="text-left py-2">Vé xe</th>
                        <th className="text-left py-2">Tổng cộng</th>
                      </>
                    )}
                    {reportType === "orders" && (
                      <>
                        <th className="text-left py-2">Thời gian</th>
                        <th className="text-left py-2">Tổng đơn</th>
                        <th className="text-left py-2">Hoàn thành</th>
                        <th className="text-left py-2">Hủy</th>
                        <th className="text-left py-2">Tỷ lệ hoàn thành</th>
                      </>
                    )}
                    {reportType === "customers" && (
                      <>
                        <th className="text-left py-2">Thời gian</th>
                        <th className="text-left py-2">Khách mới</th>
                        <th className="text-left py-2">Khách quay lại</th>
                        <th className="text-left py-2">Tổng</th>
                        <th className="text-left py-2">Tỷ lệ giữ chân</th>
                      </>
                    )}
                    {reportType === "products" && (
                      <>
                        <th className="text-left py-2">Tên sản phẩm</th>
                        <th className="text-right py-2">Loại</th>
                        <th className="text-right py-2">Tổng đặt</th>
                        <th className="text-right py-2">Đơn duyệt</th>
                        <th className="text-right py-2">Đơn hủy</th>
                        <th className="text-right py-2">Doanh thu</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {reportType === "revenue" &&
                    revenueData.map((row:any, index:any) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{row.period}</td>
                        <td className="text-left py-2">
                          {formatCurrency(row.flight)}
                        </td>
                        <td className="text-left py-2">
                          {formatCurrency(row.tour)}
                        </td>
                        <td className="text-left py-2">
                          {formatCurrency(row.bus)}
                        </td>
                        <td className="text-left py-2 font-bold">
                          {formatCurrency(row.total)}
                        </td>
                      </tr>
                    ))}
                  {reportType === "orders" &&
                    orderStats.map((row:any, index:any) => (
                      <tr key={index} className="border-b">
                        <td className="text-left py-2">{row.date}</td>
                        <td className="text-left py-2">
                          {row.total.toLocaleString()}
                        </td>
                        <td className="text-left py-2">
                          {row.confirmed.toLocaleString()}
                        </td>
                        <td className="text-left py-2">
                          {row.cancelled.toLocaleString()}
                        </td>
                        <td className="text-left py-2">
                          {row.total
                            ? ((row.confirmed / row.total) * 100).toFixed(1)
                            : 0}
                          %
                        </td>
                      </tr>
                    ))}
                  {reportType === "customers" &&
                    customerStats.map((row:any, index:any) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">Tháng {row.month}</td>
                        <td className="text-left py-2">
                          {row.newUsers.toLocaleString()}
                        </td>
                        <td className="text-left py-2">
                          {row.returningUsers.toLocaleString()}
                        </td>
                        <td className="text-left py-2">
                          {(row.newUsers + row.returningUsers).toLocaleString()}
                        </td>
                        <td className="text-left py-2">
                          {row.newUsers + row.returningUsers
                            ? (
                              (row.returningUsers /
                                (row.newUsers + row.returningUsers)) *
                              100
                            ).toFixed(1)
                            : 0}
                          %
                        </td>
                      </tr>
                    ))}
                  {reportType === "products" &&
                    productsData.map((product:any, index:any) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{product.name}</td>
                        <td className="text-right py-2">
                          {product.type === "tour"
                            ? "Tour"
                            : product.type === "bus"
                              ? "Xe"
                              : "Máy bay"}
                        </td>
                        <td className="text-right py-2">
                          {product.totalBookings ?? 0}
                        </td>
                        <td className="text-right py-2">
                          {product.totalConfirmedOrders ?? 0}
                        </td>
                        <td className="text-right py-2">
                          {product.totalCancelledOrders ?? 0}
                        </td>
                        <td className="text-right py-2">
                          {formatCurrency(product.totalRevenue ?? 0)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
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