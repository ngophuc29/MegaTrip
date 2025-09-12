"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bus, Plus, Edit, Eye, Trash2, Filter, Download, MapPin, Clock, Users, DollarSign, RefreshCw, Calendar, Ban, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { Checkbox } from "../../components/ui/checkbox";
import { DataTable, Column } from "../../components/DataTable";
import { ModalForm } from "../../components/ModalForm";
import { ConfirmModal } from "../../components/ConfirmModal";
import { useToast } from "../../components/ui/use-toast";

interface BusRoute {
    id: string;
    busCode: string;
    operator: {
        id: string;
        name: string;
        logo: string;
        code: string;
    };
    routeFrom: {
        code: string;
        name: string;
        city: string;
    };
    routeTo: {
        code: string;
        name: string;
        city: string;
    };
    departureAt: string;
    arrivalAt: string;
    duration: string;
    busType: string[];
    price: number;
    seatsTotal: number;
    seatsAvailable: number;
    status: "scheduled" | "cancelled" | "delayed" | "completed";
    amenities: string;
    createdAt: string;
    updatedAt: string;
}

interface BusFormData {
    busCode: string;
    operatorId: string;
    routeFrom: string;
    routeTo: string;
    departureAt: string;
    arrivalAt: string;
    duration: string;
    busType: string[];
    price: number;
    seatsTotal: number;
    seatsAvailable: number;
    amenities: string;
    status: "scheduled" | "cancelled" | "delayed" | "completed";
}

interface BusFilters {
    operator: string;
    status: string;
    route: string;
    dateRange?: [string, string];
}

const mockOperators = [
    { id: "op_001", name: "Phương Trang", code: "PT", logo: "/placeholder.svg" },
    { id: "op_002", name: "Hoàng Long", code: "HL", logo: "/placeholder.svg" },
    { id: "op_003", name: "Mai Linh", code: "ML", logo: "/placeholder.svg" },
    { id: "op_004", name: "Thanh Bưởi", code: "TB", logo: "/placeholder.svg" },
];

const mockStations = [
    { code: "SGN_MB", name: "Bến xe Miền Đông", city: "TP.HCM" },
    { code: "SGN_MT", name: "Bến xe Miền Tây", city: "TP.HCM" },
    { code: "HAN_MB", name: "Bến xe Mỹ Đình", city: "Hà Nội" },
    { code: "HAN_GL", name: "Bến xe Gia Lâm", city: "Hà Nội" },
    { code: "DAD_BX", name: "Bến xe Đà Nẵng", city: "Đà Nẵng" },
    { code: "HUE_BX", name: "Bến xe Huế", city: "Huế" },
];

const busTypeOptions = [
    { value: "Ghế ngồi", label: "Ghế ngồi" },
    { value: "Giường nằm", label: "Giường nằm" },
    { value: "Limousine", label: "Limousine" },
    { value: "VIP", label: "VIP" }
];

const mockBuses: BusRoute[] = [
    {
        id: "bus_001",
        busCode: "PT001",
        operator: { id: "op_001", name: "Phương Trang", logo: "/placeholder.svg", code: "PT" },
        routeFrom: { code: "SGN_MB", name: "Bến xe Miền Đông", city: "TP.HCM" },
        routeTo: { code: "DAD_BX", name: "Bến xe Đà Nẵng", city: "Đà Nẵng" },
        departureAt: "2025-09-15T08:00:00.000Z",
        arrivalAt: "2025-09-16T02:00:00.000Z",
        duration: "18h 0m",
        busType: ["Ghế ngồi", "Limousine"],
        price: 650000,
        seatsTotal: 45,
        seatsAvailable: 30,
        status: "scheduled",
        amenities: "Wifi, Điều hòa, Nước uống miễn phí",
        createdAt: "2025-09-01T10:00:00.000Z",
        updatedAt: "2025-09-01T10:00:00.000Z",
    },
    {
        id: "bus_002",
        busCode: "HL002",
        operator: { id: "op_002", name: "Hoàng Long", logo: "/placeholder.svg", code: "HL" },
        routeFrom: { code: "HAN_MB", name: "Bến xe Mỹ Đình", city: "Hà Nội" },
        routeTo: { code: "HUE_BX", name: "Bến xe Huế", city: "Huế" },
        departureAt: "2025-09-16T18:00:00.000Z",
        arrivalAt: "2025-09-17T06:00:00.000Z",
        duration: "12h 0m",
        busType: ["Giường nằm", "VIP"],
        price: 500000,
        seatsTotal: 40,
        seatsAvailable: 10,
        status: "scheduled",
        amenities: "Wifi, Chăn gối, Nước uống",
        createdAt: "2025-09-02T12:00:00.000Z",
        updatedAt: "2025-09-02T12:00:00.000Z",
    },
    {
        id: "bus_003",
        busCode: "ML003",
        operator: { id: "op_003", name: "Mai Linh", logo: "/placeholder.svg", code: "ML" },
        routeFrom: { code: "SGN_MT", name: "Bến xe Miền Tây", city: "TP.HCM" },
        routeTo: { code: "HAN_GL", name: "Bến xe Gia Lâm", city: "Hà Nội" },
        departureAt: "2025-09-17T07:30:00.000Z",
        arrivalAt: "2025-09-18T15:30:00.000Z",
        duration: "32h 0m",
        busType: ["Ghế ngồi"],
        price: 1200000,
        seatsTotal: 50,
        seatsAvailable: 5,
        status: "delayed",
        amenities: "Điều hòa, Ghế ngả",
        createdAt: "2025-09-03T09:00:00.000Z",
        updatedAt: "2025-09-10T14:00:00.000Z",
    },
    {
        id: "bus_004",
        busCode: "TB004",
        operator: { id: "op_004", name: "Thanh Bưởi", logo: "/placeholder.svg", code: "TB" },
        routeFrom: { code: "DAD_BX", name: "Bến xe Đà Nẵng", city: "Đà Nẵng" },
        routeTo: { code: "SGN_MB", name: "Bến xe Miền Đông", city: "TP.HCM" },
        departureAt: "2025-09-18T20:00:00.000Z",
        arrivalAt: "2025-09-19T14:00:00.000Z",
        duration: "18h 0m",
        busType: ["Limousine", "VIP"],
        price: 800000,
        seatsTotal: 30,
        seatsAvailable: 15,
        status: "scheduled",
        amenities: "Wifi, TV, Nước uống",
        createdAt: "2025-09-04T11:00:00.000Z",
        updatedAt: "2025-09-04T11:00:00.000Z",
    },
    {
        id: "bus_005",
        busCode: "PT005",
        operator: { id: "op_001", name: "Phương Trang", logo: "/placeholder.svg", code: "PT" },
        routeFrom: { code: "HUE_BX", name: "Bến xe Huế", city: "Huế" },
        routeTo: { code: "HAN_MB", name: "Bến xe Mỹ Đình", city: "Hà Nội" },
        departureAt: "2025-09-19T09:00:00.000Z",
        arrivalAt: "2025-09-19T21:00:00.000Z",
        duration: "12h 0m",
        busType: ["Giường nằm"],
        price: 550000,
        seatsTotal: 40,
        seatsAvailable: 20,
        status: "scheduled",
        amenities: "Wifi, Điều hòa",
        createdAt: "2025-09-05T08:00:00.000Z",
        updatedAt: "2025-09-05T08:00:00.000Z",
    },
    {
        id: "bus_006",
        busCode: "HL006",
        operator: { id: "op_002", name: "Hoàng Long", logo: "/placeholder.svg", code: "HL" },
        routeFrom: { code: "SGN_MB", name: "Bến xe Miền Đông", city: "TP.HCM" },
        routeTo: { code: "HAN_MB", name: "Bến xe Mỹ Đình", city: "Hà Nội" },
        departureAt: "2025-09-20T06:00:00.000Z",
        arrivalAt: "2025-09-21T14:00:00.000Z",
        duration: "32h 0m",
        busType: ["VIP"],
        price: 1300000,
        seatsTotal: 35,
        seatsAvailable: 0,
        status: "cancelled",
        amenities: "Wifi, Ghế massage, Nước uống",
        createdAt: "2025-09-06T10:00:00.000Z",
        updatedAt: "2025-09-10T15:00:00.000Z",
    },
    {
        id: "bus_007",
        busCode: "ML007",
        operator: { id: "op_003", name: "Mai Linh", logo: "/placeholder.svg", code: "ML" },
        routeFrom: { code: "HAN_GL", name: "Bến xe Gia Lâm", city: "Hà Nội" },
        routeTo: { code: "SGN_MT", name: "Bến xe Miền Tây", city: "TP.HCM" },
        departureAt: "2025-09-21T07:00:00.000Z",
        arrivalAt: "2025-09-22T15:00:00.000Z",
        duration: "32h 0m",
        busType: ["Ghế ngồi", "Limousine"],
        price: 1100000,
        seatsTotal: 45,
        seatsAvailable: 10,
        status: "scheduled",
        amenities: "Điều hòa, Nước uống",
        createdAt: "2025-09-07T09:00:00.000Z",
        updatedAt: "2025-09-07T09:00:00.000Z",
    },
    {
        id: "bus_008",
        busCode: "TB008",
        operator: { id: "op_004", name: "Thanh Bưởi", logo: "/placeholder.svg", code: "TB" },
        routeFrom: { code: "DAD_BX", name: "Bến xe Đà Nẵng", city: "Đà Nẵng" },
        routeTo: { code: "HUE_BX", name: "Bến xe Huế", city: "Huế" },
        departureAt: "2025-09-22T10:00:00.000Z",
        arrivalAt: "2025-09-22T12:30:00.000Z",
        duration: "2h 30m",
        busType: ["Ghế ngồi"],
        price: 150000,
        seatsTotal: 30,
        seatsAvailable: 25,
        status: "completed",
        amenities: "Điều hòa",
        createdAt: "2025-09-08T11:00:00.000Z",
        updatedAt: "2025-09-08T11:00:00.000Z",
    },
    {
        id: "bus_009",
        busCode: "PT009",
        operator: { id: "op_001", name: "Phương Trang", logo: "/placeholder.svg", code: "PT" },
        routeFrom: { code: "SGN_MB", name: "Bến xe Miền Đông", city: "TP.HCM" },
        routeTo: { code: "HUE_BX", name: "Bến xe Huế", city: "Huế" },
        departureAt: "2025-09-23T08:30:00.000Z",
        arrivalAt: "2025-09-24T02:30:00.000Z",
        duration: "18h 0m",
        busType: ["Giường nằm", "VIP"],
        price: 700000,
        seatsTotal: 40,
        seatsAvailable: 12,
        status: "scheduled",
        amenities: "Wifi, Nước uống, Chăn gối",
        createdAt: "2025-09-09T10:00:00.000Z",
        updatedAt: "2025-09-09T10:00:00.000Z",
    },
    {
        id: "bus_010",
        busCode: "HL010",
        operator: { id: "op_002", name: "Hoàng Long", logo: "/placeholder.svg", code: "HL" },
        routeFrom: { code: "HAN_MB", name: "Bến xe Mỹ Đình", city: "Hà Nội" },
        routeTo: { code: "SGN_MB", name: "Bến xe Miền Đông", city: "TP.HCM" },
        departureAt: "2025-09-24T06:00:00.000Z",
        arrivalAt: "2025-09-25T14:00:00.000Z",
        duration: "32h 0m",
        busType: ["Limousine"],
        price: 1250000,
        seatsTotal: 35,
        seatsAvailable: 8,
        status: "scheduled",
        amenities: "Wifi, Ghế massage, Nước uống",
        createdAt: "2025-09-10T09:00:00.000Z",
        updatedAt: "2025-09-10T09:00:00.000Z",
    },
];

export default function Buses() {
    const [selectedBuses, setSelectedBuses] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState<BusFilters>({
        operator: "all",
        status: "all",
        route: "all"
    });
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
    const [selectedBus, setSelectedBus] = useState<BusRoute | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [busToDelete, setBusToDelete] = useState<BusRoute | null>(null);
    const [formData, setFormData] = useState<BusFormData>({
        busCode: "",
        operatorId: "",
        routeFrom: "",
        routeTo: "",
        departureAt: "",
        arrivalAt: "",
        duration: "",
        busType: ["Ghế ngồi"],
        price: 0,
        seatsTotal: 0,
        seatsAvailable: 0,
        amenities: "",
        status: "scheduled"
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isFormDirty, setIsFormDirty] = useState(false);

    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
    });

    // Fetch buses with mock data
    const { data: busesData, isLoading, error, refetch } = useQuery({
        queryKey: ['buses', pagination.current, pagination.pageSize, searchQuery, filters],
        queryFn: async () => {
            const filteredBuses = mockBuses.filter((bus) => {
                const matchesSearch = bus.busCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    bus.operator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    bus.routeFrom.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    bus.routeTo.city.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesOperator = filters.operator === 'all' || bus.operator.id === filters.operator;
                const matchesStatus = filters.status === 'all' || bus.status === filters.status;
                const matchesRoute = filters.route === 'all' ||
                    `${bus.routeFrom.code}-${bus.routeTo.code}`.includes(filters.route);
                return matchesSearch && matchesOperator && matchesStatus && matchesRoute;
            });

            const start = (pagination.current - 1) * pagination.pageSize;
            const end = start + pagination.pageSize;
            const paginatedBuses = filteredBuses.slice(start, end);

            return {
                data: paginatedBuses,
                pagination: {
                    total: filteredBuses.length,
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                },
            };
        },
    });

    // Create bus mutation (mock implementation)
    const createBusMutation = useMutation({
        mutationFn: async (data: BusFormData) => {
            const newBus: BusRoute = {
                ...data,
                id: `bus_${Date.now()}`,
                operator: mockOperators.find(op => op.id === data.operatorId)!,
                routeFrom: mockStations.find(st => st.code === data.routeFrom)!,
                routeTo: mockStations.find(st => st.code === data.routeTo)!,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            mockBuses.push(newBus); // Add to mock data
            return newBus;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['buses'] });
            setModalOpen(false);
            resetForm();
            toast({
                title: "Thêm tuyến xe thành công",
                description: "Tuyến xe mới đã được thêm vào hệ thống",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Lỗi khi thêm tuyến xe",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    // Update bus mutation (mock implementation)
    const updateBusMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<BusFormData> }) => {
            const index = mockBuses.findIndex(bus => bus.id === id);
            if (index === -1) throw new Error('Bus not found');
            mockBuses[index] = {
                ...mockBuses[index],
                ...data,
                operator: mockOperators.find(op => op.id === (data.operatorId || mockBuses[index].operator.id))!,
                routeFrom: mockStations.find(st => st.code === (data.routeFrom || mockBuses[index].routeFrom.code))!,
                routeTo: mockStations.find(st => st.code === (data.routeTo || mockBuses[index].routeTo.code))!,
                updatedAt: new Date().toISOString(),
            };
            return mockBuses[index];
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['buses'] });
            setModalOpen(false);
            resetForm();
            toast({
                title: "Cập nhật tuyến xe thành công",
                description: "Thông tin tuyến xe đã được cập nhật",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Lỗi khi cập nhật tuyến xe",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    // Delete bus mutation (mock implementation)
    const deleteBusMutation = useMutation({
        mutationFn: async (id: string) => {
            const index = mockBuses.findIndex(bus => bus.id === id);
            if (index === -1) throw new Error('Bus not found');
            const deletedBus = mockBuses.splice(index, 1)[0];
            return deletedBus;
        },
        onSuccess: (_, busId) => {
            queryClient.invalidateQueries({ queryKey: ['buses'] });
            setDeleteModalOpen(false);
            setBusToDelete(null);
            const bus = busesData?.data?.find((b: BusRoute) => b.id === busId);
            toast({
                title: "Đã xóa tuyến xe",
                description: `Tuyến xe ${bus?.busCode} đã được xóa thành công`,
                action: (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            toast({
                                title: "Khôi phục thành công",
                                description: "Tuyến xe đã được khôi phục",
                            });
                        }}
                    >
                        Hoàn tác
                    </Button>
                ),
            });
        },
        onError: (error: any) => {
            toast({
                title: "Lỗi khi xóa tuyến xe",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    // Bulk operations mutation (mock implementation)
    const bulkActionMutation = useMutation({
        mutationFn: async ({ action, ids }: { action: string; ids: string[] }) => {
            ids.forEach(id => {
                const index = mockBuses.findIndex(bus => bus.id === id);
                if (index !== -1) {
                    if (action === 'delete') {
                        mockBuses.splice(index, 1);
                    } else if (action === 'activate') {
                        mockBuses[index].status = 'scheduled';
                        mockBuses[index].updatedAt = new Date().toISOString();
                    } else if (action === 'cancel') {
                        mockBuses[index].status = 'cancelled';
                        mockBuses[index].updatedAt = new Date().toISOString();
                    }
                }
            });
            return { success: true };
        },
        onSuccess: (_, { action, ids }) => {
            queryClient.invalidateQueries({ queryKey: ['buses'] });
            setSelectedBuses([]);
            const actionText = action === 'activate' ? 'kích hoạt' : action === 'cancel' ? 'hủy' : 'xóa';
            toast({
                title: `Thực hiện thành công`,
                description: `Đã ${actionText} ${ids.length} tuyến xe`,
            });
        },
        onError: (error: any) => {
            toast({
                title: "Lỗi khi thực hiện thao tác",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const buses = busesData?.data || [];
    const total = busesData?.pagination?.total || 0;

    // Form validation
    const validateForm = (data: BusFormData): Record<string, string> => {
        const errors: Record<string, string> = {};

        if (!data.busCode.trim()) {
            errors.busCode = "Bạn phải nhập mã tuyến xe";
        }

        if (!data.operatorId) {
            errors.operatorId = "Bạn phải chọn nhà xe";
        }

        if (!data.routeFrom) {
            errors.routeFrom = "Bạn phải chọn điểm đi";
        }

        if (!data.routeTo) {
            errors.routeTo = "Bạn phải chọn điểm đến";
        }

        if (data.routeFrom === data.routeTo) {
            errors.routeTo = "Điểm đến phải khác điểm đi";
        }

        if (!data.departureAt) {
            errors.departureAt = "Bạn phải chọn giờ xuất phát";
        }

        if (!data.arrivalAt) {
            errors.arrivalAt = "Bạn phải chọn giờ đến";
        }

        if (data.departureAt && data.arrivalAt && new Date(data.arrivalAt) <= new Date(data.departureAt)) {
            errors.arrivalAt = "Giờ đến phải sau giờ xuất phát";
        }

        if (data.price <= 0) {
            errors.price = "Giá vé phải lớn hơn 0";
        }

        if (data.seatsTotal <= 0) {
            errors.seatsTotal = "Số ghế phải lớn hơn 0";
        }

        if (data.seatsAvailable < 0) {
            errors.seatsAvailable = "Số ghế có sẵn không được âm";
        }

        if (data.seatsAvailable > data.seatsTotal) {
            errors.seatsAvailable = "Số ghế có sẵn không được lớn hơn tổng số ghế";
        }

        if (data.busType.length === 0) {
            errors.busType = "Bạn phải chọn ít nhất một loại xe";
        }

        return errors;
    };

    const resetForm = () => {
        setFormData({
            busCode: "",
            operatorId: "",
            routeFrom: "",
            routeTo: "",
            departureAt: "",
            arrivalAt: "",
            duration: "",
            busType: ["Ghế ngồi"],
            price: 0,
            seatsTotal: 0,
            seatsAvailable: 0,
            amenities: "",
            status: "scheduled"
        });
        setFormErrors({});
        setIsFormDirty(false);
    };

    const handleFormChange = (field: keyof BusFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setIsFormDirty(true);

        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    const calculateDuration = (departure: string, arrival: string): string => {
        if (!departure || !arrival) return "";

        const depTime = new Date(departure);
        const arrTime = new Date(arrival);
        const diffMs = arrTime.getTime() - depTime.getTime();

        if (diffMs <= 0) return "";

        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        return `${hours}h ${minutes}m`;
    };

    const columns: Column[] = [
        {
            key: "busCode",
            title: "Mã tuyến",
            sortable: true,
            render: (value, record: BusRoute) => (
                <div>
                    <div className="font-mono font-medium">{value}</div>
                    <div className="text-sm text-gray-500">{record.id}</div>
                </div>
            ),
        },
        {
            key: "operator",
            title: "Nhà xe",
            render: (value, record: BusRoute) => (
                <div className="flex items-center space-x-2">
                    <img
                        src={value.logo}
                        alt={value.name}
                        className="w-8 h-8 rounded object-cover"
                    />
                    <div>
                        <div className="font-medium">{value.name}</div>
                        <div className="text-sm text-gray-500">{value.code}</div>
                    </div>
                </div>
            ),
        },
        {
            key: "route",
            title: "Tuyến đường",
            render: (_, record: BusRoute) => (
                <div className="text-sm">
                    <div className="flex items-center space-x-2 font-medium">
                        <span className="font-mono">{record.routeFrom.code}</span>
                        <Bus className="w-4 h-4 text-gray-400" />
                        <span className="font-mono">{record.routeTo.code}</span>
                    </div>
                    <div className="text-gray-500">
                        {record.routeFrom.city} → {record.routeTo.city}
                    </div>
                </div>
            ),
        },
        {
            key: "schedule",
            title: "Lịch trình",
            sortable: true,
            render: (_, record: BusRoute) => (
                <div className="text-sm">
                    <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="font-medium">
                            {new Date(record.departureAt).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>
                        <span className="text-gray-500">→</span>
                        <span>
                            {new Date(record.arrivalAt).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>
                    </div>
                    <div className="text-gray-500">
                        {new Date(record.departureAt).toLocaleDateString('vi-VN')}
                    </div>
                    <div className="text-xs text-gray-400">{record.duration}</div>
                </div>
            ),
        },
        {
            key: "busType",
            title: "Loại xe",
            render: (value: string[]) => (
                <div className="space-y-1">
                    {value.map((type, index) => (
                        <Badge
                            key={index}
                            variant="outline"
                            className="text-xs block w-fit"
                        >
                            {type}
                        </Badge>
                    ))}
                </div>
            ),
        },
        {
            key: "price",
            title: "Giá vé",
            sortable: true,
            render: (value) => (
                <div className="text-sm">
                    <div className="flex items-center font-medium">
                        <DollarSign className="w-3 h-3 mr-1" />
                        {new Intl.NumberFormat('vi-VN').format(value)} ₫
                    </div>
                </div>
            ),
        },
        {
            key: "seats",
            title: "Ghế",
            render: (_, record: BusRoute) => (
                <div className="text-sm">
                    <div className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        <span className="font-medium">{record.seatsAvailable}</span>
                        <span className="text-gray-500">/{record.seatsTotal}</span>
                    </div>
                    <div className={`text-xs ${record.seatsAvailable <= record.seatsTotal * 0.2 ? 'text-red-600' :
                        record.seatsAvailable <= record.seatsTotal * 0.5 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                        {record.seatsAvailable} chỗ trống
                    </div>
                </div>
            ),
        },
        {
            key: "status",
            title: "Trạng thái",
            sortable: true,
            render: (value) => (
                <Badge className={
                    value === "scheduled" ? "bg-green-100 text-green-800 hover:bg-green-100" :
                        value === "cancelled" ? "bg-red-100 text-red-800 hover:bg-red-100" :
                            value === "delayed" ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" :
                                "bg-gray-100 text-gray-800 hover:bg-gray-100"
                }>
                    {value === "scheduled" ? "Đã lên lịch" :
                        value === "cancelled" ? "Đã hủy" :
                            value === "delayed" ? "Hoãn" : "Hoàn thành"}
                </Badge>
            ),
        },
    ];

    const handleView = (bus: BusRoute) => {
        setSelectedBus(bus);
        setModalMode("view");
        setModalOpen(true);
    };

    const handleEdit = (bus: BusRoute) => {
        setSelectedBus(bus);
        setFormData({
            busCode: bus.busCode,
            operatorId: bus.operator.id,
            routeFrom: bus.routeFrom.code,
            routeTo: bus.routeTo.code,
            departureAt: bus.departureAt.slice(0, 16),
            arrivalAt: bus.arrivalAt.slice(0, 16),
            duration: bus.duration,
            busType: bus.busType,
            price: bus.price,
            seatsTotal: bus.seatsTotal,
            seatsAvailable: bus.seatsAvailable,
            amenities: bus.amenities,
            status: bus.status
        });
        setModalMode("edit");
        setModalOpen(true);
        setIsFormDirty(false);
    };

    const handleDelete = (bus: BusRoute) => {
        setBusToDelete(bus);
        setDeleteModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedBus(null);
        resetForm();
        setModalMode("create");
        setModalOpen(true);
    };

    const handleSubmit = () => {
        const errors = validateForm(formData);
        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            toast({
                title: "Lỗi validation",
                description: "Vui lòng kiểm tra lại thông tin nhập vào",
                variant: "destructive",
            });
            return;
        }

        if (modalMode === "create") {
            createBusMutation.mutate(formData);
        } else if (modalMode === "edit" && selectedBus) {
            updateBusMutation.mutate({ id: selectedBus.id, data: formData });
        }
    };

    const confirmDelete = () => {
        if (busToDelete) {
            const bookedSeats = busToDelete.seatsTotal - busToDelete.seatsAvailable;
            if (bookedSeats > 0) {
                toast({
                    title: "Không thể xóa tuyến xe",
                    description: "Tuyến xe này có đặt chỗ. Vui lòng hủy tuyến xe thay vì xóa.",
                    variant: "destructive",
                });
                return;
            }
            deleteBusMutation.mutate(busToDelete.id);
        }
    };

    const bulkActions = [
        {
            label: "Kích hoạt",
            action: (keys: string[]) => {
                bulkActionMutation.mutate({ action: 'activate', ids: keys });
            },
            icon: <Eye className="w-4 h-4 mr-2" />,
        },
        {
            label: "Hủy tuyến",
            action: (keys: string[]) => {
                bulkActionMutation.mutate({ action: 'cancel', ids: keys });
            },
            icon: <Ban className="w-4 h-4 mr-2" />,
            variant: "secondary" as const,
        },
        {
            label: "Xóa",
            action: (keys: string[]) => {
                bulkActionMutation.mutate({ action: 'delete', ids: keys });
            },
            icon: <Trash2 className="w-4 h-4 mr-2" />,
            variant: "destructive" as const,
        },
    ];

    const actions = [
        {
            label: "Xem chi tiết",
            action: handleView,
            icon: <Eye className="mr-2 h-4 w-4" />,
        },
        {
            label: "Chỉnh sửa",
            action: handleEdit,
            icon: <Edit className="mr-2 h-4 w-4" />,
        },
        {
            label: "Xóa",
            action: handleDelete,
            icon: <Trash2 className="mr-2 h-4 w-4" />,
            variant: "destructive" as const,
        },
    ];

    const handleModalClose = () => {
        if (isFormDirty && modalMode !== "view") {
            if (confirm("Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn đóng?")) {
                setModalOpen(false);
                resetForm();
            }
        } else {
            setModalOpen(false);
            resetForm();
        }
    };

    const isSubmitDisabled = () => {
        if (modalMode === "view") return true;
        if (!isFormDirty) return true;
        return createBusMutation.isPending || updateBusMutation.isPending;
    };

    const renderBusForm = () => {
        if (modalMode === "view" && selectedBus) {
            return (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-700">Mã tuyến xe</Label>
                                <p className="mt-1 font-mono text-lg font-bold">{selectedBus.busCode}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-700">Nhà xe</Label>
                                <div className="mt-1 flex items-center space-x-2">
                                    <img
                                        src={selectedBus.operator.logo}
                                        alt={selectedBus.operator.name}
                                        className="w-8 h-8 rounded"
                                    />
                                    <span className="font-medium">{selectedBus.operator.name}</span>
                                </div>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-700">Tuyến đường</Label>
                                <div className="mt-1 space-y-1">
                                    <div className="flex items-center space-x-2">
                                        <span className="font-mono font-bold">{selectedBus.routeFrom.code}</span>
                                        <Bus className="w-4 h-4 text-gray-400" />
                                        <span className="font-mono font-bold">{selectedBus.routeTo.code}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {selectedBus.routeFrom.name} → {selectedBus.routeTo.name}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-700">Lịch trình</Label>
                                <div className="mt-1 space-y-1">
                                    <p className="font-medium">
                                        {new Date(selectedBus.departureAt).toLocaleString('vi-VN')} →{" "}
                                        {new Date(selectedBus.arrivalAt).toLocaleString('vi-VN')}
                                    </p>
                                    <p className="text-sm text-gray-600">Thời gian di chuyển: {selectedBus.duration}</p>
                                </div>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-700">Giá vé</Label>
                                <p className="mt-1 text-lg font-bold text-green-600">
                                    {new Intl.NumberFormat('vi-VN').format(selectedBus.price)} ₫
                                </p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-700">Ghế ngồi</Label>
                                <p className="mt-1">
                                    {selectedBus.seatsAvailable} / {selectedBus.seatsTotal} ghế còn trống
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label className="text-sm font-medium text-gray-700">Loại xe</Label>
                        <div className="mt-1 flex space-x-2">
                            {selectedBus.busType.map((type, index) => (
                                <Badge key={index} variant="outline">{type}</Badge>
                            ))}
                        </div>
                    </div>

                    <div>
                        <Label className="text-sm font-medium text-gray-700">Tiện ích</Label>
                        <p className="mt-1 text-gray-900">{selectedBus.amenities}</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="busCode">Mã tuyến xe *</Label>
                        <Input
                            id="busCode"
                            value={formData.busCode}
                            onChange={(e) => handleFormChange('busCode', e.target.value.toUpperCase())}
                            placeholder="PT001"
                            className={`font-mono ${formErrors.busCode ? "border-red-500" : ""}`}
                        />
                        {formErrors.busCode && (
                            <p className="text-sm text-red-500 mt-1">{formErrors.busCode}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="operator">Nhà xe *</Label>
                        <Select
                            value={formData.operatorId}
                            onValueChange={(value) => handleFormChange('operatorId', value)}
                        >
                            <SelectTrigger className={formErrors.operatorId ? "border-red-500" : ""}>
                                <SelectValue placeholder="Chọn nhà xe" />
                            </SelectTrigger>
                            <SelectContent>
                                {mockOperators.map((operator) => (
                                    <SelectItem key={operator.id} value={operator.id}>
                                        <div className="flex items-center space-x-2">
                                            <img src={operator.logo} alt={operator.name} className="w-6 h-6 rounded" />
                                            <span>{operator.name} ({operator.code})</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {formErrors.operatorId && (
                            <p className="text-sm text-red-500 mt-1">{formErrors.operatorId}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="routeFrom">Điểm đi *</Label>
                        <Select
                            value={formData.routeFrom}
                            onValueChange={(value) => handleFormChange('routeFrom', value)}
                        >
                            <SelectTrigger className={formErrors.routeFrom ? "border-red-500" : ""}>
                                <SelectValue placeholder="Chọn điểm đi" />
                            </SelectTrigger>
                            <SelectContent>
                                {mockStations.map((station) => (
                                    <SelectItem key={station.code} value={station.code}>
                                        {station.code} - {station.name} ({station.city})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {formErrors.routeFrom && (
                            <p className="text-sm text-red-500 mt-1">{formErrors.routeFrom}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="routeTo">Điểm đến *</Label>
                        <Select
                            value={formData.routeTo}
                            onValueChange={(value) => handleFormChange('routeTo', value)}
                        >
                            <SelectTrigger className={formErrors.routeTo ? "border-red-500" : ""}>
                                <SelectValue placeholder="Chọn điểm đến" />
                            </SelectTrigger>
                            <SelectContent>
                                {mockStations.map((station) => (
                                    <SelectItem key={station.code} value={station.code}>
                                        {station.code} - {station.name} ({station.city})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {formErrors.routeTo && (
                            <p className="text-sm text-red-500 mt-1">{formErrors.routeTo}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <Label htmlFor="departureAt">Giờ xuất phát *</Label>
                        <Input
                            id="departureAt"
                            type="datetime-local"
                            value={formData.departureAt}
                            onChange={(e) => {
                                handleFormChange('departureAt', e.target.value);
                                if (formData.arrivalAt) {
                                    const duration = calculateDuration(e.target.value, formData.arrivalAt);
                                    if (duration) handleFormChange('duration', duration);
                                }
                            }}
                            className={formErrors.departureAt ? "border-red-500" : ""}
                        />
                        {formErrors.departureAt && (
                            <p className="text-sm text-red-500 mt-1">{formErrors.departureAt}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="arrivalAt">Giờ đến *</Label>
                        <Input
                            id="arrivalAt"
                            type="datetime-local"
                            value={formData.arrivalAt}
                            onChange={(e) => {
                                handleFormChange('arrivalAt', e.target.value);
                                if (formData.departureAt) {
                                    const duration = calculateDuration(formData.departureAt, e.target.value);
                                    if (duration) handleFormChange('duration', duration);
                                }
                            }}
                            className={formErrors.arrivalAt ? "border-red-500" : ""}
                        />
                        {formErrors.arrivalAt && (
                            <p className="text-sm text-red-500 mt-1">{formErrors.arrivalAt}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="duration">Thời gian di chuyển</Label>
                        <Input
                            id="duration"
                            value={formData.duration}
                            onChange={(e) => handleFormChange('duration', e.target.value)}
                            placeholder="6h 30m"
                            readOnly
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <Label htmlFor="price">Giá vé (VNĐ) *</Label>
                        <Input
                            id="price"
                            type="number"
                            value={formData.price || ""}
                            onChange={(e) => handleFormChange('price', parseInt(e.target.value) || 0)}
                            placeholder="350000"
                            className={formErrors.price ? "border-red-500" : ""}
                        />
                        {formErrors.price && (
                            <p className="text-sm text-red-500 mt-1">{formErrors.price}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="seatsTotal">Tổng số ghế *</Label>
                        <Input
                            id="seatsTotal"
                            type="number"
                            value={formData.seatsTotal || ""}
                            onChange={(e) => {
                                const total = parseInt(e.target.value) || 0;
                                handleFormChange('seatsTotal', total);
                                if (modalMode === "create" && formData.seatsAvailable === 0) {
                                    handleFormChange('seatsAvailable', total);
                                }
                            }}
                            placeholder="45"
                            className={formErrors.seatsTotal ? "border-red-500" : ""}
                        />
                        {formErrors.seatsTotal && (
                            <p className="text-sm text-red-500 mt-1">{formErrors.seatsTotal}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="seatsAvailable">Ghế có sẵn *</Label>
                        <Input
                            id="seatsAvailable"
                            type="number"
                            value={formData.seatsAvailable || ""}
                            onChange={(e) => handleFormChange('seatsAvailable', parseInt(e.target.value) || 0)}
                            placeholder="45"
                            className={formErrors.seatsAvailable ? "border-red-500" : ""}
                        />
                        {formErrors.seatsAvailable && (
                            <p className="text-sm text-red-500 mt-1">{formErrors.seatsAvailable}</p>
                        )}
                    </div>
                </div>

                <div>
                    <Label>Loại xe *</Label>
                    <div className="mt-2 space-y-2">
                        {busTypeOptions.map((option) => (
                            <div key={option.value} className="flex items-center space-x-2">
                                <Checkbox
                                    id={option.value}
                                    checked={formData.busType.includes(option.value)}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            handleFormChange('busType', [...formData.busType, option.value]);
                                        } else {
                                            handleFormChange('busType', formData.busType.filter(t => t !== option.value));
                                        }
                                    }}
                                />
                                <Label htmlFor={option.value}>{option.label}</Label>
                            </div>
                        ))}
                    </div>
                    {formErrors.busType && (
                        <p className="text-sm text-red-500 mt-1">{formErrors.busType}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="amenities">Tiện ích</Label>
                    <Textarea
                        id="amenities"
                        value={formData.amenities}
                        onChange={(e) => handleFormChange('amenities', e.target.value)}
                        placeholder="Wifi miễn phí, điều hòa, nước uống"
                        rows={3}
                    />
                </div>

                <div>
                    <Label htmlFor="status">Trạng thái</Label>
                    <Select
                        value={formData.status}
                        onValueChange={(value) => handleFormChange('status', value)}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="scheduled">Đã lên lịch</SelectItem>
                            <SelectItem value="cancelled">Đã hủy</SelectItem>
                            <SelectItem value="delayed">Hoãn</SelectItem>
                            <SelectItem value="completed">Hoàn thành</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 space-y-6 bg-gray-50">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý vé xe</h1>
                    <p className="text-gray-600 mt-1">Quản lý tuyến xe, lịch trình và thông tin vé xe</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Button
                        variant="outline"
                        onClick={() => refetch()}
                        disabled={isLoading}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Làm mới
                    </Button>
                    <Button onClick={handleAdd} className="bg-primary hover:bg-primary-600">
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm tuyến xe
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Tổng tuyến xe</p>
                                <p className="text-2xl font-bold">{total || 0}</p>
                            </div>
                            <Bus className="w-8 h-8 text-primary" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Đang hoạt động</p>
                                <p className="text-2xl font-bold">{buses.filter((b: BusRoute) => b.status === "scheduled").length}</p>
                            </div>
                            <Eye className="w-8 h-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Sắp hết chỗ</p>
                                <p className="text-2xl font-bold">
                                    {buses.filter((b: BusRoute) => b.seatsAvailable <= b.seatsTotal * 0.2).length}
                                </p>
                            </div>
                            <Users className="w-8 h-8 text-orange-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Doanh thu TB</p>
                                <p className="text-2xl font-bold">1.8M</p>
                            </div>
                            <DollarSign className="w-8 h-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Danh sách tuyến xe</CardTitle>
                            <CardDescription>Quản lý thông tin và lịch trình tuyến xe</CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Select value={filters.operator} onValueChange={(value) => setFilters(prev => ({ ...prev, operator: value }))}>
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả nhà xe</SelectItem>
                                    {mockOperators.map((operator) => (
                                        <SelectItem key={operator.id} value={operator.id}>
                                            {operator.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                                <SelectTrigger className="w-36">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                    <SelectItem value="scheduled">Đã lên lịch</SelectItem>
                                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                                    <SelectItem value="delayed">Hoãn</SelectItem>
                                    <SelectItem value="completed">Hoàn thành</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={buses}
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: total,
                        }}
                        onPaginationChange={(page, pageSize) =>
                            setPagination({ current: page, pageSize })
                        }
                        onSearch={setSearchQuery}
                        rowSelection={{
                            selectedRowKeys: selectedBuses,
                            onChange: setSelectedBuses,
                        }}
                        bulkActions={bulkActions}
                        actions={actions}
                        exportable
                        onExport={() => toast({ title: "Đang xuất file...", description: "File sẽ được tải xuống sau vài giây" })}
                        loading={isLoading}
                    />
                </CardContent>
            </Card>

            <ModalForm
                open={modalOpen}
                onOpenChange={handleModalClose}
                title={
                    modalMode === "create" ? "Thêm tuyến xe mới" :
                        modalMode === "edit" ? "Chỉnh sửa tuyến xe" :
                            "Chi tiết tuyến xe"
                }
                description={
                    modalMode === "create" ? "Tạo tuyến xe mới trong hệ thống" :
                        modalMode === "edit" ? "Cập nhật thông tin tuyến xe" :
                            "Xem thông tin chi tiết tuyến xe"
                }
                mode={modalMode}
                size="medium"
                onSubmit={handleSubmit}
                submitDisabled={isSubmitDisabled()}
                submitText={modalMode === "create" ? "Thêm tuyến xe" : "Cập nhật"}
                cancelText="Hủy"
            >
                {renderBusForm()}
            </ModalForm>

            <ConfirmModal
                open={deleteModalOpen}
                onOpenChange={setDeleteModalOpen}
                title="Xóa tuyến xe"
                message={`Bạn có chắc chắn muốn xóa tuyến xe "${busToDelete?.busCode}"?${busToDelete && (busToDelete.seatsTotal - busToDelete.seatsAvailable) > 0 ? ' Tuyến xe này có đặt chỗ.' : ''}`}
                type="danger"
                requireTyping={true}
                typingText={busToDelete && (busToDelete.seatsTotal - busToDelete.seatsAvailable) > 0 ? "FORCE_DELETE" : "DELETE"}
                onConfirm={confirmDelete}
                confirmText="Xóa tuyến xe"
                loading={deleteBusMutation.isPending}
            />
        </div>
    );
}