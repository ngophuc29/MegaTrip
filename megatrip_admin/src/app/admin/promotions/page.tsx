"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tag, Plus, Edit, Eye, Trash2, Percent, DollarSign, Users, Calendar, RefreshCw, TrendingUp, Copy, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { Checkbox } from "../../components/ui/checkbox";
import { Switch } from "../../components/ui/switch";
import { DataTable, Column } from "../../components/DataTable";
import { ModalForm } from "../../components/ModalForm";
import { ConfirmModal } from "../../components/ConfirmModal";
import { useToast } from "../../components/ui/use-toast";

interface Promotion {
    id: string;
    code: string;
    title: string;
    description: string;
    type: "percent" | "fixed";
    value: number;
    minSpend: number;
    maxUses: number;
    usedCount: number;
    appliesTo: string[];
    validFrom: string;
    validTo: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

interface PromotionFormData {
    code: string;
    title: string;
    description: string;
    type: "percent" | "fixed";
    value: number;
    minSpend: number;
    maxUses: number;
    appliesTo: string[];
    validFrom: string;
    validTo: string;
    active: boolean;
}

interface PromotionFilters {
    status: string;
    type: string;
    appliesTo: string;
}

const applyToOptions = [
    { value: "tours", label: "Tours du lịch" },
    { value: "flights", label: "Vé máy bay" },
    { value: "buses", label: "Vé xe khách" },
    { value: "all", label: "Tất cả dịch vụ" },
];

const mockPromotions: Promotion[] = [
    {
        id: "promo_001",
        code: "SUMMER2025",
        title: "Giảm giá mùa hè",
        description: "Giảm 20% cho tất cả tour du lịch mùa hè",
        type: "percent",
        value: 20,
        minSpend: 5000000,
        maxUses: 100,
        usedCount: 45,
        appliesTo: ["tours", "flights"],
        validFrom: "2025-06-01T00:00:00.000Z",
        validTo: "2025-08-31T23:59:59.000Z",
        active: true,
        createdAt: "2025-05-20T10:00:00.000Z",
        updatedAt: "2025-06-01T00:00:00.000Z",
    },
    {
        id: "promo_002",
        code: "FLIGHT100K",
        title: "Giảm giá vé máy bay",
        description: "Giảm 100,000 VNĐ cho vé máy bay nội địa",
        type: "fixed",
        value: 100000,
        minSpend: 1000000,
        maxUses: 200,
        usedCount: 180,
        appliesTo: ["flights"],
        validFrom: "2025-09-01T00:00:00.000Z",
        validTo: "2025-09-30T23:59:59.000Z",
        active: true,
        createdAt: "2025-08-25T09:00:00.000Z",
        updatedAt: "2025-09-01T00:00:00.000Z",
    },
    {
        id: "promo_003",
        code: "WINTER10",
        title: "Khuyến mãi mùa đông",
        description: "Giảm 10% cho tour du lịch mùa đông",
        type: "percent",
        value: 10,
        minSpend: 3000000,
        maxUses: 50,
        usedCount: 50,
        appliesTo: ["tours"],
        validFrom: "2025-12-01T00:00:00.000Z",
        validTo: "2026-01-31T23:59:59.000Z",
        active: false,
        createdAt: "2025-11-15T08:00:00.000Z",
        updatedAt: "2025-11-15T08:00:00.000Z",
    },
    {
        id: "promo_004",
        code: "BUSPROMO",
        title: "Ưu đãi vé xe khách",
        description: "Giảm 50,000 VNĐ cho vé xe khách",
        type: "fixed",
        value: 50000,
        minSpend: 200000,
        maxUses: 0,
        usedCount: 75,
        appliesTo: ["buses"],
        validFrom: "2025-09-10T00:00:00.000Z",
        validTo: "2025-10-10T23:59:59.000Z",
        active: true,
        createdAt: "2025-09-01T12:00:00.000Z",
        updatedAt: "2025-09-10T00:00:00.000Z",
    },
    {
        id: "promo_005",
        code: "ALLSERVICES",
        title: "Giảm giá tất cả dịch vụ",
        description: "Giảm 15% cho mọi dịch vụ",
        type: "percent",
        value: 15,
        minSpend: 2000000,
        maxUses: 0,
        usedCount: 120,
        appliesTo: ["tours", "flights", "buses"],
        validFrom: "2025-07-01T00:00:00.000Z",
        validTo: "2025-09-15T23:59:59.000Z",
        active: true,
        createdAt: "2025-06-20T15:00:00.000Z",
        updatedAt: "2025-07-01T00:00:00.000Z",
    },
    {
        id: "promo_006",
        code: "TRAVEL200K",
        title: "Giảm giá lớn",
        description: "Giảm 200,000 VNĐ cho đơn hàng từ 5 triệu",
        type: "fixed",
        value: 200000,
        minSpend: 5000000,
        maxUses: 150,
        usedCount: 90,
        appliesTo: ["tours", "flights"],
        validFrom: "2025-08-01T00:00:00.000Z",
        validTo: "2025-10-31T23:59:59.000Z",
        active: true,
        createdAt: "2025-07-25T14:00:00.000Z",
        updatedAt: "2025-08-01T00:00:00.000Z",
    },
    {
        id: "promo_007",
        code: "FESTIVAL5",
        title: "Khuyến mãi lễ hội",
        description: "Giảm 5% cho tất cả dịch vụ",
        type: "percent",
        value: 5,
        minSpend: 1000000,
        maxUses: 0,
        usedCount: 200,
        appliesTo: ["all"],
        validFrom: "2025-12-20T00:00:00.000Z",
        validTo: "2026-01-05T23:59:59.000Z",
        active: false,
        createdAt: "2025-12-10T10:00:00.000Z",
        updatedAt: "2025-12-10T10:00:00.000Z",
    },
    {
        id: "promo_008",
        code: "FLYHALF",
        title: "Giảm giá vé máy bay",
        description: "Giảm 50% cho vé máy bay quốc tế",
        type: "percent",
        value: 50,
        minSpend: 10000000,
        maxUses: 20,
        usedCount: 15,
        appliesTo: ["flights"],
        validFrom: "2025-11-01T00:00:00.000Z",
        validTo: "2025-12-31T23:59:59.000Z",
        active: true,
        createdAt: "2025-10-20T09:00:00.000Z",
        updatedAt: "2025-11-01T00:00:00.000Z",
    },
    {
        id: "promo_009",
        code: "TOUR50K",
        title: "Ưu đãi tour du lịch",
        description: "Giảm 50,000 VNĐ cho tour nội địa",
        type: "fixed",
        value: 50000,
        minSpend: 1000000,
        maxUses: 100,
        usedCount: 80,
        appliesTo: ["tours"],
        validFrom: "2025-09-05T00:00:00.000Z",
        validTo: "2025-09-20T23:59:59.000Z",
        active: false,
        createdAt: "2025-08-30T11:00:00.000Z",
        updatedAt: "2025-09-05T00:00:00.000Z",
    },
    {
        id: "promo_010",
        code: "BIGSALE2025",
        title: "Siêu khuyến mãi",
        description: "Giảm 30% cho tất cả dịch vụ",
        type: "percent",
        value: 30,
        minSpend: 3000000,
        maxUses: 0,
        usedCount: 150,
        appliesTo: ["all"],
        validFrom: "2025-10-01T00:00:00.000Z",
        validTo: "2025-11-30T23:59:59.000Z",
        active: true,
        createdAt: "2025-09-25T16:00:00.000Z",
        updatedAt: "2025-10-01T00:00:00.000Z",
    },
];

export default function Promotions() {
    const [selectedPromotions, setSelectedPromotions] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState<PromotionFilters>({
        status: "all",
        type: "all",
        appliesTo: "all",
    });
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
    const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [promotionToDelete, setPromotionToDelete] = useState<Promotion | null>(null);
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [formData, setFormData] = useState<PromotionFormData>({
        code: "",
        title: "",
        description: "",
        type: "percent",
        value: 0,
        minSpend: 0,
        maxUses: 0,
        appliesTo: [],
        validFrom: "",
        validTo: "",
        active: true,
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isFormDirty, setIsFormDirty] = useState(false);

    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
    });

    // Fetch promotions with mock data
    const { data: promotionsData, isLoading, error, refetch } = useQuery({
        queryKey: ['promotions', pagination.current, pagination.pageSize, searchQuery, filters],
        queryFn: async () => {
            const filteredPromotions = mockPromotions.filter((promotion) => {
                const matchesSearch =
                    promotion.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    promotion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    promotion.description.toLowerCase().includes(searchQuery.toLowerCase());

                const status = getPromotionStatus(promotion).status;
                const matchesStatus =
                    filters.status === "all" ||
                    (filters.status === "active" && status === "active") ||
                    (filters.status === "inactive" && status === "inactive") ||
                    (filters.status === "expired" && status === "expired") ||
                    (filters.status === "used_up" && status === "used_up");

                const matchesType = filters.type === "all" || promotion.type === filters.type;
                const matchesAppliesTo =
                    filters.appliesTo === "all" ||
                    (filters.appliesTo === "all" && promotion.appliesTo.includes("all")) ||
                    promotion.appliesTo.includes(filters.appliesTo);

                return matchesSearch && matchesStatus && matchesType && matchesAppliesTo;
            });

            const start = (pagination.current - 1) * pagination.pageSize;
            const end = start + pagination.pageSize;
            const paginatedPromotions = filteredPromotions.slice(start, end);

            return {
                data: paginatedPromotions,
                pagination: {
                    total: filteredPromotions.length,
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                },
            };
        },
    });

    // Create promotion mutation
    const createPromotionMutation = useMutation({
        mutationFn: async (data: PromotionFormData) => {
            const newId = `promo_${Date.now()}`;
            const newPromotion: Promotion = {
                ...data,
                id: newId,
                usedCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            mockPromotions.push(newPromotion);
            return newPromotion;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['promotions'] });
            setModalOpen(false);
            resetForm();
            toast({
                title: "Tạo khuyến mãi thành công",
                description: "Chương trình khuyến mãi mới đã được tạo",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Lỗi khi tạo khuyến mãi",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    // Update promotion mutation
    const updatePromotionMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<PromotionFormData> }) => {
            const index = mockPromotions.findIndex((promo) => promo.id === id);
            if (index === -1) throw new Error("Promotion not found");

            mockPromotions[index] = {
                ...mockPromotions[index],
                ...data,
                updatedAt: new Date().toISOString(),
            };
            return mockPromotions[index];
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['promotions'] });
            setModalOpen(false);
            resetForm();
            toast({
                title: "Cập nhật khuyến mãi thành công",
                description: "Thông tin khuyến mãi đã được cập nhật",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Lỗi khi cập nhật khuyến mãi",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    // Delete promotion mutation
    const deletePromotionMutation = useMutation({
        mutationFn: async (id: string) => {
            const index = mockPromotions.findIndex((promo) => promo.id === id);
            if (index === -1) throw new Error("Promotion not found");

            const deletedPromotion = mockPromotions.splice(index, 1)[0];
            return deletedPromotion;
        },
        onSuccess: (_, promotionId) => {
            queryClient.invalidateQueries({ queryKey: ['promotions'] });
            setDeleteModalOpen(false);
            setPromotionToDelete(null);

            const promotion = promotionsData?.data?.find((p: Promotion) => p.id === promotionId);
            toast({
                title: "Đã xóa khuyến mãi",
                description: `Khuyến mãi ${promotion?.code} đã được xóa thành công`,
                action: (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            toast({
                                title: "Khôi phục thành công",
                                description: "Khuyến mãi đã được khôi phục",
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
                title: "Lỗi khi xóa khuyến mãi",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    // Bulk operations mutation
    const bulkActionMutation = useMutation({
        mutationFn: async ({ action, ids }: { action: string; ids: string[] }) => {
            ids.forEach((id) => {
                const index = mockPromotions.findIndex((promo) => promo.id === id);
                if (index === -1) throw new Error(`Promotion ${id} not found`);

                if (action === "activate") {
                    mockPromotions[index].active = true;
                    mockPromotions[index].updatedAt = new Date().toISOString();
                } else if (action === "deactivate") {
                    mockPromotions[index].active = false;
                    mockPromotions[index].updatedAt = new Date().toISOString();
                } else if (action === "delete") {
                    mockPromotions.splice(index, 1);
                }
            });
            return { action, ids };
        },
        onSuccess: (_, { action, ids }) => {
            queryClient.invalidateQueries({ queryKey: ['promotions'] });
            setSelectedPromotions([]);
            const actionText = action === "activate" ? "kích hoạt" : action === "deactivate" ? "tắt" : "xóa";
            toast({
                title: `Thực hiện thành công`,
                description: `Đã ${actionText} ${ids.length} khuyến mãi`,
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

    const promotions = promotionsData?.data || [];
    const total = promotionsData?.pagination?.total || 0;

    // Form validation
    const validateForm = (data: PromotionFormData): Record<string, string> => {
        const errors: Record<string, string> = {};

        if (!data.code.trim()) {
            errors.code = "Bạn phải nhập mã khuyến mãi";
        } else if (!/^[A-Z0-9]{3,20}$/.test(data.code)) {
            errors.code = "Mã khuyến mãi chỉ chứa chữ hoa và số, từ 3-20 ký tự";
        }

        if (!data.title.trim()) {
            errors.title = "Bạn phải nhập tiêu đề khuyến mãi";
        }

        if (data.value <= 0) {
            errors.value = "Giá trị khuyến mãi phải lớn hơn 0";
        }

        if (data.type === "percent" && data.value > 100) {
            errors.value = "Phần trăm giảm giá không được vượt quá 100%";
        }

        if (data.minSpend < 0) {
            errors.minSpend = "Giá trị đơn hàng tối thiểu không được âm";
        }

        if (data.maxUses < 0) {
            errors.maxUses = "Số lần sử dụng tối đa không được âm";
        }

        if (!data.validFrom) {
            errors.validFrom = "Bạn phải chọn ngày bắt đầu";
        }

        if (!data.validTo) {
            errors.validTo = "Bạn phải chọn ngày kết thúc";
        }

        if (data.validFrom && data.validTo && new Date(data.validTo) <= new Date(data.validFrom)) {
            errors.validTo = "Ngày kết thúc phải sau ngày bắt đầu";
        }

        if (data.appliesTo.length === 0) {
            errors.appliesTo = "Bạn phải chọn ít nhất một dịch vụ áp dụng";
        }

        return errors;
    };

    const resetForm = () => {
        setFormData({
            code: "",
            title: "",
            description: "",
            type: "percent",
            value: 0,
            minSpend: 0,
            maxUses: 0,
            appliesTo: [],
            validFrom: "",
            validTo: "",
            active: true,
        });
        setFormErrors({});
        setIsFormDirty(false);
    };

    const handleFormChange = (field: keyof PromotionFormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setIsFormDirty(true);

        if (formErrors[field]) {
            setFormErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const generateCode = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let result = "";
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        handleFormChange("code", result);
    };

    const getPromotionStatus = (promotion: Promotion) => {
        const now = new Date();
        const from = new Date(promotion.validFrom);
        const to = new Date(promotion.validTo);

        if (!promotion.active) return { status: "inactive", text: "Tắt", color: "gray" };
        if (now < from) return { status: "upcoming", text: "Sắp diễn ra", color: "blue" };
        if (now > to) return { status: "expired", text: "Hết hạn", color: "red" };
        if (promotion.maxUses > 0 && promotion.usedCount >= promotion.maxUses) return { status: "used_up", text: "Hết lượt", color: "orange" };
        return { status: "active", text: "Đang hoạt động", color: "green" };
    };

    const columns: Column[] = [
        {
            key: "code",
            title: "Mã khuyến mãi",
            sortable: true,
            render: (value, record: Promotion) => (
                <div>
                    <div className="font-mono font-bold text-primary">{value}</div>
                    <div className="text-sm text-gray-500">{record.title}</div>
                </div>
            ),
        },
        {
            key: "type",
            title: "Loại & Giá trị",
            render: (_, record: Promotion) => (
                <div className="text-sm">
                    <div className="flex items-center font-medium">
                        {record.type === "percent" ? (
                            <>
                                <Percent className="w-3 h-3 mr-1" />
                                {record.value}%
                            </>
                        ) : (
                            <>
                                <DollarSign className="w-3 h-3 mr-1" />
                                {new Intl.NumberFormat("vi-VN").format(record.value)} ₫
                            </>
                        )}
                    </div>
                    <div className="text-gray-500">{record.type === "percent" ? "Giảm theo %" : "Giảm cố định"}</div>
                </div>
            ),
        },
        {
            key: "usage",
            title: "Sử dụng",
            render: (_, record: Promotion) => (
                <div className="text-sm">
                    <div className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        <span className="font-medium">{record.usedCount}</span>
                        {record.maxUses > 0 && <span className="text-gray-500">/{record.maxUses}</span>}
                    </div>
                    <div className="text-gray-500">{record.maxUses > 0 ? `Còn ${record.maxUses - record.usedCount}` : "Không giới hạn"}</div>
                </div>
            ),
        },
        {
            key: "validity",
            title: "Thời gian",
            sortable: true,
            render: (_, record: Promotion) => (
                <div className="text-sm">
                    <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>{new Date(record.validFrom).toLocaleDateString("vi-VN")}</span>
                    </div>
                    <div className="text-gray-500">đến {new Date(record.validTo).toLocaleDateString("vi-VN")}</div>
                </div>
            ),
        },
        {
            key: "appliesTo",
            title: "Áp dụng cho",
            render: (value: string[]) => (
                <div className="space-y-1">
                    {value.slice(0, 2).map((service, index) => (
                        <Badge key={index} variant="outline" className="text-xs block w-fit">
                            {applyToOptions.find((opt) => opt.value === service)?.label || service}
                        </Badge>
                    ))}
                    {value.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                            +{value.length - 2} khác
                        </Badge>
                    )}
                </div>
            ),
        },
        {
            key: "minSpend",
            title: "Đơn tối thiểu",
            render: (value) => (
                <div className="text-sm">
                    {value > 0 ? (
                        new Intl.NumberFormat("vi-VN").format(value) + " ₫"
                    ) : (
                        <span className="text-gray-500">Không yêu cầu</span>
                    )}
                </div>
            ),
        },
        {
            key: "status",
            title: "Trạng thái",
            sortable: true,
            render: (_, record: Promotion) => {
                const status = getPromotionStatus(record);
                return (
                    <Badge
                        className={
                            status.color === "green"
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : status.color === "blue"
                                    ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                                    : status.color === "red"
                                        ? "bg-red-100 text-red-800 hover:bg-red-100"
                                        : status.color === "orange"
                                            ? "bg-orange-100 text-orange-800 hover:bg-orange-100"
                                            : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                        }
                    >
                        {status.text}
                    </Badge>
                );
            },
        },
    ];

    const handleView = (promotion: Promotion) => {
        setSelectedPromotion(promotion);
        setModalMode("view");
        setModalOpen(true);
    };

    const handleEdit = (promotion: Promotion) => {
        setSelectedPromotion(promotion);
        setFormData({
            code: promotion.code,
            title: promotion.title,
            description: promotion.description,
            type: promotion.type,
            value: promotion.value,
            minSpend: promotion.minSpend,
            maxUses: promotion.maxUses,
            appliesTo: promotion.appliesTo,
            validFrom: promotion.validFrom.slice(0, 16),
            validTo: promotion.validTo.slice(0, 16),
            active: promotion.active,
        });
        setModalMode("edit");
        setModalOpen(true);
        setIsFormDirty(false);
    };

    const handleDelete = (promotion: Promotion) => {
        setPromotionToDelete(promotion);
        setDeleteModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedPromotion(null);
        resetForm();
        setModalMode("create");
        setModalOpen(true);
    };

    const handleCopy = (promotion: Promotion) => {
        setFormData({
            code: `${promotion.code}_COPY`,
            title: `${promotion.title} (Sao chép)`,
            description: promotion.description,
            type: promotion.type,
            value: promotion.value,
            minSpend: promotion.minSpend,
            maxUses: promotion.maxUses,
            appliesTo: promotion.appliesTo,
            validFrom: "",
            validTo: "",
            active: false,
        });
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
            createPromotionMutation.mutate(formData);
        } else if (modalMode === "edit" && selectedPromotion) {
            updatePromotionMutation.mutate({ id: selectedPromotion.id, data: formData });
        }
    };

    const confirmDelete = () => {
        if (promotionToDelete) {
            deletePromotionMutation.mutate(promotionToDelete.id);
        }
    };

    const bulkActions = [
        {
            label: "Kích hoạt",
            action: (keys: string[]) => {
                bulkActionMutation.mutate({ action: "activate", ids: keys });
            },
            icon: <CheckCircle className="w-4 h-4 mr-2" />,
        },
        {
            label: "Tắt",
            action: (keys: string[]) => {
                bulkActionMutation.mutate({ action: "deactivate", ids: keys });
            },
            icon: <XCircle className="w-4 h-4 mr-2" />,
            variant: "secondary" as const,
        },
        {
            label: "Xóa",
            action: (keys: string[]) => {
                bulkActionMutation.mutate({ action: "delete", ids: keys });
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
            label: "Sao chép",
            action: handleCopy,
            icon: <Copy className="mr-2 h-4 w-4" />,
        },
        {
            label: "Báo cáo",
            action: (promotion: Promotion) => {
                setSelectedPromotion(promotion);
                setReportModalOpen(true);
            },
            icon: <TrendingUp className="mr-2 h-4 w-4" />,
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
        return createPromotionMutation.isPending || updatePromotionMutation.isPending;
    };

    const renderPromotionForm = () => {
        if (modalMode === "view" && selectedPromotion) {
            const status = getPromotionStatus(selectedPromotion);
            return (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-700">Mã khuyến mãi</Label>
                                <p className="mt-1 font-mono text-lg font-bold text-primary">{selectedPromotion.code}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-700">Tiêu đề</Label>
                                <p className="mt-1 font-medium">{selectedPromotion.title}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-700">Mô tả</Label>
                                <p className="mt-1 text-gray-900">{selectedPromotion.description}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-700">Giá trị giảm</Label>
                                <p className="mt-1 text-lg font-bold text-green-600">
                                    {selectedPromotion.type === "percent"
                                        ? `${selectedPromotion.value}%`
                                        : `${new Intl.NumberFormat("vi-VN").format(selectedPromotion.value)} ₫`}
                                </p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-700">Đơn hàng tối thiểu</Label>
                                <p className="mt-1">
                                    {selectedPromotion.minSpend > 0
                                        ? `${new Intl.NumberFormat("vi-VN").format(selectedPromotion.minSpend)} ₫`
                                        : "Không yêu cầu"}
                                </p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-700">Trạng thái</Label>
                                <div className="mt-1">
                                    <Badge
                                        className={
                                            status.color === "green"
                                                ? "bg-green-100 text-green-800"
                                                : status.color === "blue"
                                                    ? "bg-blue-100 text-blue-800"
                                                    : status.color === "red"
                                                        ? "bg-red-100 text-red-800"
                                                        : status.color === "orange"
                                                            ? "bg-orange-100 text-orange-800"
                                                            : "bg-gray-100 text-gray-800"
                                        }
                                    >
                                        {status.text}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <Label className="text-sm font-medium text-gray-700">Thời gian hiệu lực</Label>
                            <p className="mt-1">
                                {new Date(selectedPromotion.validFrom).toLocaleDateString("vi-VN")} -{" "}
                                {new Date(selectedPromotion.validTo).toLocaleDateString("vi-VN")}
                            </p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-gray-700">Sử dụng</Label>
                            <p className="mt-1">
                                {selectedPromotion.usedCount} / {selectedPromotion.maxUses > 0 ? selectedPromotion.maxUses : "∞"} lần
                            </p>
                        </div>
                    </div>

                    <div>
                        <Label className="text-sm font-medium text-gray-700">Áp dụng cho</Label>
                        <div className="mt-1 flex flex-wrap gap-2">
                            {selectedPromotion.appliesTo.map((service, index) => (
                                <Badge key={index} variant="outline">
                                    {applyToOptions.find((opt) => opt.value === service)?.label || service}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="code">Mã khuyến mãi *</Label>
                        <div className="flex space-x-2">
                            <Input
                                id="code"
                                value={formData.code}
                                onChange={(e) => handleFormChange("code", e.target.value.toUpperCase())}
                                placeholder="SUMMER2024"
                                className={`font-mono ${formErrors.code ? "border-red-500" : ""}`}
                            />
                            <Button type="button" variant="outline" onClick={generateCode} className="px-3">
                                Tạo mã
                            </Button>
                        </div>
                        {formErrors.code && <p className="text-sm text-red-500 mt-1">{formErrors.code}</p>}
                    </div>
                    <div>
                        <Label htmlFor="title">Tiêu đề *</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => handleFormChange("title", e.target.value)}
                            placeholder="Giảm giá mùa hè"
                            className={formErrors.title ? "border-red-500" : ""}
                        />
                        {formErrors.title && <p className="text-sm text-red-500 mt-1">{formErrors.title}</p>}
                    </div>
                </div>

                <div>
                    <Label htmlFor="description">Mô tả</Label>
                    <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleFormChange("description", e.target.value)}
                        placeholder="Mô tả chi tiết về chương trình khuyến mãi"
                        rows={3}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="type">Loại giảm giá *</Label>
                        <Select value={formData.type} onValueChange={(value) => handleFormChange("type", value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="percent">Giảm theo phần trăm (%)</SelectItem>
                                <SelectItem value="fixed">Giảm cố định (VNĐ)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="value">
                            Giá trị * {formData.type === "percent" ? "(%)" : "(VNĐ)"}
                        </Label>
                        <Input
                            id="value"
                            type="number"
                            value={formData.value || ""}
                            onChange={(e) => handleFormChange("value", parseFloat(e.target.value) || 0)}
                            placeholder={formData.type === "percent" ? "10" : "100000"}
                            className={formErrors.value ? "border-red-500" : ""}
                        />
                        {formErrors.value && <p className="text-sm text-red-500 mt-1">{formErrors.value}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="minSpend">Đơn hàng tối thiểu (VNĐ)</Label>
                        <Input
                            id="minSpend"
                            type="number"
                            value={formData.minSpend || ""}
                            onChange={(e) => handleFormChange("minSpend", parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            className={formErrors.minSpend ? "border-red-500" : ""}
                        />
                        {formErrors.minSpend && <p className="text-sm text-red-500 mt-1">{formErrors.minSpend}</p>}
                        <p className="text-xs text-gray-500 mt-1">Để 0 nếu không yêu cầu</p>
                    </div>
                    <div>
                        <Label htmlFor="maxUses">Số lần sử dụng tối đa</Label>
                        <Input
                            id="maxUses"
                            type="number"
                            value={formData.maxUses || ""}
                            onChange={(e) => handleFormChange("maxUses", parseInt(e.target.value) || 0)}
                            placeholder="0"
                            className={formErrors.maxUses ? "border-red-500" : ""}
                        />
                        {formErrors.maxUses && <p className="text-sm text-red-500 mt-1">{formErrors.maxUses}</p>}
                        <p className="text-xs text-gray-500 mt-1">Để 0 nếu không giới hạn</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="validFrom">Ngày bắt đầu *</Label>
                        <Input
                            id="validFrom"
                            type="datetime-local"
                            value={formData.validFrom}
                            onChange={(e) => handleFormChange("validFrom", e.target.value)}
                            className={formErrors.validFrom ? "border-red-500" : ""}
                        />
                        {formErrors.validFrom && <p className="text-sm text-red-500 mt-1">{formErrors.validFrom}</p>}
                    </div>
                    <div>
                        <Label htmlFor="validTo">Ngày kết thúc *</Label>
                        <Input
                            id="validTo"
                            type="datetime-local"
                            value={formData.validTo}
                            onChange={(e) => handleFormChange("validTo", e.target.value)}
                            className={formErrors.validTo ? "border-red-500" : ""}
                        />
                        {formErrors.validTo && <p className="text-sm text-red-500 mt-1">{formErrors.validTo}</p>}
                    </div>
                </div>

                <div>
                    <Label>Áp dụng cho *</Label>
                    <div className="mt-2 space-y-2">
                        {applyToOptions.map((option) => (
                            <div key={option.value} className="flex items-center space-x-2">
                                <Checkbox
                                    id={option.value}
                                    checked={formData.appliesTo.includes(option.value)}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            handleFormChange("appliesTo", [...formData.appliesTo, option.value]);
                                        } else {
                                            handleFormChange("appliesTo", formData.appliesTo.filter((s) => s !== option.value));
                                        }
                                    }}
                                />
                                <Label htmlFor={option.value}>{option.label}</Label>
                            </div>
                        ))}
                    </div>
                    {formErrors.appliesTo && <p className="text-sm text-red-500 mt-1">{formErrors.appliesTo}</p>}
                </div>

                <div className="flex items-center space-x-2">
                    <Switch id="active" checked={formData.active} onCheckedChange={(checked) => handleFormChange("active", checked)} />
                    <Label htmlFor="active">Kích hoạt ngay</Label>
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 space-y-6 bg-gray-50">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý khuyến mãi</h1>
                    <p className="text-gray-600 mt-1">Quản lý mã giảm giá, voucher và chương trình khuyến mãi</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                        Làm mới
                    </Button>
                    <Button onClick={handleAdd} className="bg-primary hover:bg-primary-600">
                        <Plus className="w-4 h-4 mr-2" />
                        Tạo khuyến mãi
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Tổng khuyến mãi</p>
                                <p className="text-2xl font-bold">{total || 0}</p>
                            </div>
                            <Tag className="w-8 h-8 text-primary" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Đang hoạt động</p>
                                <p className="text-2xl font-bold">
                                    {promotions.filter((p: Promotion) => {
                                        const status = getPromotionStatus(p);
                                        return status.status === "active";
                                    }).length}
                                </p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Sắp hết hạn</p>
                                <p className="text-2xl font-bold">
                                    {promotions.filter((p: Promotion) => {
                                        const now = new Date();
                                        const to = new Date(p.validTo);
                                        const daysLeft = (to.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
                                        return daysLeft <= 7 && daysLeft > 0;
                                    }).length}
                                </p>
                            </div>
                            <Calendar className="w-8 h-8 text-orange-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Lượt sử dụng</p>
                                <p className="text-2xl font-bold">{promotions.reduce((sum: number, p: Promotion) => sum + p.usedCount, 0)}</p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Danh sách khuyến mãi</CardTitle>
                            <CardDescription>Quản lý mã giảm giá và chương trình khuyến mãi</CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Select value={filters.status} onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}>
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                    <SelectItem value="active">Đang hoạt động</SelectItem>
                                    <SelectItem value="inactive">Tắt</SelectItem>
                                    <SelectItem value="expired">Hết hạn</SelectItem>
                                    <SelectItem value="used_up">Hết lượt</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filters.type} onValueChange={(value) => setFilters((prev) => ({ ...prev, type: value }))}>
                                <SelectTrigger className="w-36">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả loại</SelectItem>
                                    <SelectItem value="percent">Giảm %</SelectItem>
                                    <SelectItem value="fixed">Giảm cố định</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filters.appliesTo} onValueChange={(value) => setFilters((prev) => ({ ...prev, appliesTo: value }))}>
                                <SelectTrigger className="w-36">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả dịch vụ</SelectItem>
                                    {applyToOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={promotions}
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: total,
                        }}
                        onPaginationChange={(page, pageSize) => setPagination({ current: page, pageSize })}
                        onSearch={setSearchQuery}
                        rowSelection={{
                            selectedRowKeys: selectedPromotions,
                            onChange: setSelectedPromotions,
                        }}
                        bulkActions={bulkActions}
                        actions={actions}
                        exportable
                        onExport={() => toast({ title: "Đang xuất file...", description: "File sẽ được tải xuống sau vài giây" })}
                        loading={isLoading}
                    />
                </CardContent>
            </Card>

            {/* Promotion Modal */}
            <ModalForm
                open={modalOpen}
                onOpenChange={handleModalClose}
                title={modalMode === "create" ? "Tạo khuyến mãi mới" : modalMode === "edit" ? "Chỉnh sửa khuyến mãi" : "Chi tiết khuyến mãi"}
                description={
                    modalMode === "create" ? "Tạo chương trình khuyến mãi mới" : modalMode === "edit" ? "Cập nhật thông tin khuyến mãi" : "Xem thông tin chi tiết khuyến mãi"
                }
                mode={modalMode}
                size="medium"
                onSubmit={handleSubmit}
                submitDisabled={isSubmitDisabled()}
                submitText={modalMode === "create" ? "Tạo khuyến mãi" : "Cập nhật"}
                cancelText="Hủy"
            >
                <div className="max-h-[70vh] overflow-y-auto pr-2">

                    {renderPromotionForm()}
                </div>

            </ModalForm>

            {/* Delete Confirmation */}
            <ConfirmModal
                open={deleteModalOpen}
                onOpenChange={setDeleteModalOpen}
                title="Xóa khuyến mãi"
                message={`Bạn có chắc chắn muốn xóa khuyến mãi "${promotionToDelete?.code}"? Hành động này sẽ ảnh hưởng đến các đơn hàng đã sử dụng mã này.`}
                type="danger"
                requireTyping={true}
                typingText="DELETE"
                onConfirm={confirmDelete}
                confirmText="Xóa khuyến mãi"
                loading={deletePromotionMutation.isPending}
            />

            {/* Report Modal */}
            <ModalForm
                open={reportModalOpen}
                onOpenChange={setReportModalOpen}
                title="Báo cáo khuyến mãi"
                description={`Thống kê sử dụng cho mã "${selectedPromotion?.code}"`}
                mode="view"
                size="medium"
            >
                {selectedPromotion && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Card>
                                <CardContent className="pt-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">{selectedPromotion.usedCount}</div>
                                        <div className="text-sm text-gray-600">Lượt sử dụng</div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">85%</div>
                                        <div className="text-sm text-gray-600">Tỷ lệ chuyển đổi</div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-gray-700">Tổng giảm giá</Label>
                            <p className="mt-1 text-lg font-bold text-red-600">
                                {new Intl.NumberFormat("vi-VN").format(selectedPromotion.usedCount * selectedPromotion.value)}
                                {selectedPromotion.type === "percent" ? " (ước tính)" : " ₫"}
                            </p>
                        </div>
                    </div>
                )}
            </ModalForm>
        </div>
    );
}