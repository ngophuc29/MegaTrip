"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, Plus, Edit, Eye, Trash2, Calendar, DollarSign, Users, Star, Upload, RefreshCw, Globe, Settings, Image, Copy, ExternalLink, Save, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { Switch } from "../../components/ui/switch";
import { Checkbox } from "../../components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { DataTable, Column } from "../../components/DataTable";
import { ModalForm } from "../../components/ModalForm";
import { ConfirmModal } from "../../components/ConfirmModal";
import { ImageUploader } from "../../components/ImageUploader";
import { RichTextEditor } from "../../components/RichTextEditor";
import { useToast } from "../../components/ui/use-toast";

interface Tour {
    id: string;
    title: string;
    title_vn?: string;
    slug: string;
    summary: string;
    description: string;
    departure: string;
    destination: string;
    startDate: string;
    endDate: string;
    duration: string;
    priceAdult: number;
    priceChild?: number;
    seatsTotal: number;
    seatsBooked: number;
    minBooking: number;
    status: "active" | "hidden" | "draft";
    highlight: boolean;
    visibility: "public" | "private";
    categoryId: string;
    tags: string[];
    images: string[];
    videoUrl?: string;
    itinerary: Array<{
        dayNumber: number;
        title: string;
        details: string;
    }>;
    inclusions: string[];
    exclusions: string[];
    pickupPoints: string[];
    cancellationPolicy?: string;
    rating: number;
    reviewCount: number;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    createdAt: string;
    updatedAt: string;
}

interface TourFormData {
    title: string;
    title_vn: string;
    slug: string;
    summary: string;
    description: string;
    departure: string;
    destination: string;
    startDate: string;
    endDate: string;
    duration: string;
    priceAdult: number;
    priceChild: number;
    seatsTotal: number;
    minBooking: number;
    categoryId: string;
    tags: string[];
    images: string[];
    videoUrl: string;
    itinerary: Array<{
        dayNumber: number;
        title: string;
        details: string;
    }>;
    inclusions: string[];
    exclusions: string[];
    pickupPoints: string[];
    cancellationPolicy: string;
    status: "active" | "hidden" | "draft";
    highlight: boolean;
    visibility: "public" | "private";
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
}

interface TourFilters {
    status: string;
    category: string;
    priceRange?: [number, number];
    dateRange?: [string, string];
}

const mockCategories = [
    { id: "cat_001", name: "Tour biển đảo" },
    { id: "cat_002", name: "Tour núi non" },
    { id: "cat_003", name: "Tour thành phố" },
    { id: "cat_004", name: "Tour văn hóa" },
];

// Mock data
const mockTours: Tour[] = [
    {
        id: "tour_001",
        title: "Du thuyền Vịnh Hạ Long 3N2Đ",
        title_vn: "Du thuyền Vịnh Hạ Long 3 ngày 2 đêm",
        slug: "du-thuyen-vinh-ha-long-3n2d",
        summary: "Khám phá Vịnh Hạ Long hùng vĩ với hành trình 3 ngày 2 đêm trên du thuyền 5 sao.",
        description: "Trải nghiệm du thuyền sang trọng, khám phá các hang động và thưởng thức ẩm thực địa phương.",
        departure: "Hà Nội",
        destination: "Vịnh Hạ Long",
        startDate: "2025-10-01",
        endDate: "2025-10-03",
        duration: "3 ngày 2 đêm",
        priceAdult: 6500000,
        priceChild: 4500000,
        seatsTotal: 30,
        seatsBooked: 20,
        minBooking: 2,
        status: "active",
        highlight: true,
        visibility: "public",
        categoryId: "cat_001",
        tags: ["du thuyền", "biển đảo", "sang trọng"],
        images: [
            "https://example.com/images/halong1.jpg",
            "https://example.com/images/halong2.jpg",
        ],
        videoUrl: "https://youtube.com/watch?v=abc123",
        itinerary: [
            {
                dayNumber: 1,
                title: "Khởi hành và khám phá hang Sửng Sốt",
                details: "Đón khách tại Hà Nội, di chuyển đến Vịnh Hạ Long, tham quan hang Sửng Sốt.",
            },
            {
                dayNumber: 2,
                title: "Chèo thuyền kayak và làng chài",
                details: "Tham gia chèo thuyền kayak và khám phá làng chài nổi trên vịnh.",
            },
            {
                dayNumber: 3,
                title: "Tham quan đảo Titop và trở về",
                details: "Thăm đảo Titop, tắm biển và trở về Hà Nội.",
            },
        ],
        inclusions: ["Vé du thuyền", "Ăn uống theo chương trình", "Hướng dẫn viên"],
        exclusions: ["Chi phí cá nhân", "Đồ uống ngoài chương trình"],
        pickupPoints: ["Hà Nội", "Hải Phòng"],
        cancellationPolicy: "Hủy trước 7 ngày: hoàn 100%. Hủy trước 3 ngày: hoàn 50%.",
        rating: 4.8,
        reviewCount: 120,
        metaTitle: "Du thuyền Vịnh Hạ Long 3N2Đ",
        metaDescription: "Trải nghiệm du thuyền 5 sao tại Vịnh Hạ Long với hành trình 3 ngày 2 đêm.",
        metaKeywords: "du thuyền, vịnh hạ long, tour biển đảo",
        createdAt: "2025-09-01T10:00:00Z",
        updatedAt: "2025-09-10T15:30:00Z",
    },
    {
        id: "tour_002",
        title: "Khám phá Sapa 2N1Đ",
        title_vn: "Khám phá Sapa 2 ngày 1 đêm",
        slug: "kham-pha-sapa-2n1d",
        summary: "Hành trình khám phá Sapa với núi non hùng vĩ và văn hóa bản địa đặc sắc.",
        description: "Tham quan núi Hàm Rồng, bản Cát Cát và trải nghiệm văn hóa dân tộc thiểu số.",
        departure: "Hà Nội",
        destination: "Sapa",
        startDate: "2025-11-01",
        endDate: "2025-11-02",
        duration: "2 ngày 1 đêm",
        priceAdult: 3500000,
        priceChild: 2500000,
        seatsTotal: 25,
        seatsBooked: 10,
        minBooking: 1,
        status: "draft",
        highlight: false,
        visibility: "public",
        categoryId: "cat_002",
        tags: ["núi non", "văn hóa", "trekking"],
        images: ["https://example.com/images/sapa1.jpg"],
        videoUrl: "",
        itinerary: [
            {
                dayNumber: 1,
                title: "Khám phá núi Hàm Rồng",
                details: "Đón khách tại Hà Nội, di chuyển đến Sapa, tham quan núi Hàm Rồng.",
            },
            {
                dayNumber: 2,
                title: "Thăm bản Cát Cát",
                details: "Khám phá bản Cát Cát, trải nghiệm văn hóa dân tộc H'Mông.",
            },
        ],
        inclusions: ["Vé tham quan", "Ăn uống", "Xe đưa đón"],
        exclusions: ["Chi phí cá nhân", "Bảo hiểm du lịch"],
        pickupPoints: ["Hà Nội"],
        cancellationPolicy: "Hủy trước 5 ngày: hoàn 100%.",
        rating: 4.5,
        reviewCount: 80,
        metaTitle: "Khám phá Sapa 2N1Đ",
        metaDescription: "Hành trình khám phá Sapa với núi non và văn hóa dân tộc đặc sắc.",
        metaKeywords: "sapa, núi non, văn hóa bản địa",
        createdAt: "2025-08-15T09:00:00Z",
        updatedAt: "2025-09-05T12:00:00Z",
    },
    {
        id: "tour_003",
        title: "Tour Đà Nẵng - Hội An 4N3Đ",
        title_vn: "Tour Đà Nẵng - Hội An 4 ngày 3 đêm",
        slug: "tour-da-nang-hoi-an-4n3d",
        summary: "Khám phá Đà Nẵng hiện đại và phố cổ Hội An lãng mạn trong 4 ngày 3 đêm.",
        description: "Tham quan cầu Rồng, Bà Nà Hills, phố cổ Hội An và bãi biển Mỹ Khê.",
        departure: "TP. Hồ Chí Minh",
        destination: "Đà Nẵng",
        startDate: "2025-12-01",
        endDate: "2025-12-04",
        duration: "4 ngày 3 đêm",
        priceAdult: 7500000,
        priceChild: 5500000,
        seatsTotal: 40,
        seatsBooked: 35,
        minBooking: 2,
        status: "active",
        highlight: true,
        visibility: "public",
        categoryId: "cat_003",
        tags: ["thành phố", "biển", "văn hóa"],
        images: [
            "https://example.com/images/danang1.jpg",
            "https://example.com/images/hoian1.jpg",
        ],
        videoUrl: "https://vimeo.com/123456789",
        itinerary: [
            {
                dayNumber: 1,
                title: "Đến Đà Nẵng - Cầu Rồng",
                details: "Đón khách tại sân bay Đà Nẵng, tham quan cầu Rồng và bãi biển Mỹ Khê.",
            },
            {
                dayNumber: 2,
                title: "Bà Nà Hills",
                details: "Khám phá khu du lịch Bà Nà Hills, cáp treo và cầu Vàng.",
            },
            {
                dayNumber: 3,
                title: "Phố cổ Hội An",
                details: "Tham quan phố cổ Hội An, chùa Cầu và thưởng thức ẩm thực địa phương.",
            },
            {
                dayNumber: 4,
                title: "Tự do và trở về",
                details: "Tự do mua sắm, tắm biển và trở về TP. Hồ Chí Minh.",
            },
        ],
        inclusions: ["Vé máy bay", "Khách sạn 4 sao", "Vé tham quan"],
        exclusions: ["Chi phí cá nhân", "Đồ uống"],
        pickupPoints: ["TP. Hồ Chí Minh", "Hà Nội"],
        cancellationPolicy: "Hủy trước 10 ngày: hoàn 100%. Hủy trước 5 ngày: hoàn 50%.",
        rating: 4.9,
        reviewCount: 150,
        metaTitle: "Tour Đà Nẵng - Hội An 4N3Đ",
        metaDescription: "Khám phá Đà Nẵng và Hội An với hành trình 4 ngày 3 đêm đầy thú vị.",
        metaKeywords: "đà nẵng, hội an, tour thành phố",
        createdAt: "2025-07-20T08:00:00Z",
        updatedAt: "2025-09-12T10:00:00Z",
    },
];

export default function Tours() {
    const [selectedTours, setSelectedTours] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState<TourFilters>({
        status: "all",
        category: "all",
    });
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
    const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [tourToDelete, setTourToDelete] = useState<Tour | null>(null);
    const [activeTab, setActiveTab] = useState("basic");
    const [formData, setFormData] = useState<TourFormData>({
        title: "",
        title_vn: "",
        slug: "",
        summary: "",
        description: "",
        departure: "",
        destination: "",
        startDate: "",
        endDate: "",
        duration: "",
        priceAdult: 0,
        priceChild: 0,
        seatsTotal: 1,
        minBooking: 1,
        categoryId: "",
        tags: [],
        images: [],
        videoUrl: "",
        itinerary: [],
        inclusions: [],
        exclusions: [],
        pickupPoints: [],
        cancellationPolicy: "",
        status: "draft",
        highlight: false,
        visibility: "public",
        metaTitle: "",
        metaDescription: "",
        metaKeywords: "",
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isFormDirty, setIsFormDirty] = useState(false);

    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
    });

    // Fake data with filtering and pagination
    const [tours, setTours] = useState<Tour[]>(mockTours);
    const isLoading = false;
    const error = null;

    const filteredTours = mockTours
        .filter((tour) => {
            if (filters.status !== "all" && tour.status !== filters.status) return false;
            if (filters.category !== "all" && tour.categoryId !== filters.category) return false;
            if (searchQuery && !tour.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            return true;
        })
        .slice((pagination.current - 1) * pagination.pageSize, pagination.current * pagination.pageSize);

    const toursData = {
        data: filteredTours,
        pagination: {
            total: filteredTours.length,
        },
    };

    const refetch = () => {
        setTours(mockTours); // Reset to original mock data
        toast({ title: "Dữ liệu đã được làm mới" });
    };

    // Create tour mutation
    const createTourMutation = useMutation({
        mutationFn: async (data: TourFormData) => {
            const newTour: Tour = {
                ...data,
                id: `tour_${Math.random().toString(36).substr(2, 9)}`,
                seatsBooked: 0,
                rating: 0,
                reviewCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            setTours((prev) => [...prev, newTour]);
            return newTour;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tours"] });
            setModalOpen(false);
            resetForm();
            toast({
                title: "Tạo tour thành công",
                description: "Tour mới đã được tạo và lưu",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Lỗi khi tạo tour",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    // Update tour mutation
    const updateTourMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<TourFormData> }) => {
            setTours((prev) =>
                prev.map((tour) =>
                    tour.id === id ? { ...tour, ...data, updatedAt: new Date().toISOString() } : tour
                )
            );
            return { id, ...data };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tours"] });
            setModalOpen(false);
            resetForm();
            toast({
                title: "Cập nhật tour thành công",
                description: "Thông tin tour đã được cập nhật",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Lỗi khi cập nhật tour",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    // Delete tour mutation
    const deleteTourMutation = useMutation({
        mutationFn: async (id: string) => {
            setTours((prev) => prev.filter((tour) => tour.id !== id));
            return { id };
        },
        onSuccess: (_, tourId) => {
            queryClient.invalidateQueries({ queryKey: ["tours"] });
            setDeleteModalOpen(false);
            setTourToDelete(null);

            const tour = toursData?.data?.find((t: Tour) => t.id === tourId);
            toast({
                title: "Đã xóa tour",
                description: `Tour ${tour?.title} đã được xóa thành công`,
                action: (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            toast({
                                title: "Khôi phục thành công",
                                description: "Tour đã được khôi phục",
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
                title: "Lỗi khi xóa tour",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    // Bulk operations mutation
    const bulkActionMutation = useMutation({
        mutationFn: async ({ action, ids }: { action: string; ids: string[] }) => {
            setTours((prev) =>
                prev.map((tour) =>
                    ids.includes(tour.id)
                        ? {
                            ...tour,
                            status:
                                action === "publish" ? "active" : action === "unpublish" ? "hidden" : tour.status,
                        }
                        : tour
                )
            );
            if (action === "delete") {
                setTours((prev) => prev.filter((tour) => !ids.includes(tour.id)));
            }
            return { action, ids };
        },
        onSuccess: (_, { action, ids }) => {
            queryClient.invalidateQueries({ queryKey: ["tours"] });
            setSelectedTours([]);
            const actionText = action === "publish" ? "xuất bản" : action === "unpublish" ? "ẩn" : "xóa";
            toast({
                title: `Thực hiện thành công`,
                description: `Đã ${actionText} ${ids.length} tour`,
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

    const total = toursData?.pagination?.total || 0;

    // Form validation
    const validateForm = (data: TourFormData): Record<string, string> => {
        const errors: Record<string, string> = {};

        if (!data.title.trim()) {
            errors.title = "Bạn phải nhập tên tour";
        }

        if (!data.summary.trim()) {
            errors.summary = "Bạn phải nhập mô tả ngắn";
        } else if (data.summary.length > 300) {
            errors.summary = "Mô tả ngắn không được vượt quá 300 ký tự";
        }

        if (!data.categoryId) {
            errors.categoryId = "Bạn phải chọn danh mục";
        }

        if (!data.departure.trim()) {
            errors.departure = "Bạn phải nhập điểm khởi hành";
        }

        if (!data.destination.trim()) {
            errors.destination = "Bạn phải nhập điểm đến";
        }

        if (!data.startDate) {
            errors.startDate = "Bạn phải chọn ngày bắt đầu";
        }

        if (!data.endDate) {
            errors.endDate = "Bạn phải chọn ngày kết thúc";
        }

        if (data.startDate && data.endDate && new Date(data.endDate) <= new Date(data.startDate)) {
            errors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
        }

        if (data.priceAdult <= 0) {
            errors.priceAdult = "Giá người lớn phải lớn hơn 0";
        }

        if (data.seatsTotal < 1) {
            errors.seatsTotal = "Số chỗ tối đa phải ít nhất là 1";
        }

        if (data.minBooking < 1) {
            errors.minBooking = "Số booking tối thiểu phải ít nhất là 1";
        }

        if (data.images.length === 0) {
            errors.images = "Bạn phải tải lên ít nhất 1 hình ảnh";
        }

        if (data.videoUrl && !isValidVideoUrl(data.videoUrl)) {
            errors.videoUrl = "URL video không hợp lệ (chỉ hỗ trợ YouTube/Vimeo)";
        }

        return errors;
    };

    const isValidVideoUrl = (url: string): boolean => {
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
        const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\/.+/;
        return youtubeRegex.test(url) || vimeoRegex.test(url);
    };

    const resetForm = () => {
        setFormData({
            title: "",
            title_vn: "",
            slug: "",
            summary: "",
            description: "",
            departure: "",
            destination: "",
            startDate: "",
            endDate: "",
            duration: "",
            priceAdult: 0,
            priceChild: 0,
            seatsTotal: 1,
            minBooking: 1,
            categoryId: "",
            tags: [],
            images: [],
            videoUrl: "",
            itinerary: [],
            inclusions: [],
            exclusions: [],
            pickupPoints: [],
            cancellationPolicy: "",
            status: "draft",
            highlight: false,
            visibility: "public",
            metaTitle: "",
            metaDescription: "",
            metaKeywords: "",
        });
        setFormErrors({});
        setIsFormDirty(false);
        setActiveTab("basic");
    };

    const handleFormChange = (field: keyof TourFormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setIsFormDirty(true);

        // Auto-generate slug from title
        if (field === "title" && value) {
            const slug = value
                .toLowerCase()
                .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a")
                .replace(/[èéẹẻẽêềếệểễ]/g, "e")
                .replace(/[ìíịỉĩ]/g, "i")
                .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o")
                .replace(/[ùúụủũưừứựửữ]/g, "u")
                .replace(/[ỳýỵỷỹ]/g, "y")
                .replace(/đ/g, "d")
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-")
                .trim("-");
            setFormData((prev) => ({ ...prev, slug }));
        }

        // Clear error for this field
        if (formErrors[field]) {
            setFormErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const addItineraryDay = () => {
        const newDay = {
            dayNumber: formData.itinerary.length + 1,
            title: "",
            details: "",
        };
        handleFormChange("itinerary", [...formData.itinerary, newDay]);
    };

    const updateItineraryDay = (index: number, field: "title" | "details", value: string) => {
        const updatedItinerary = [...formData.itinerary];
        updatedItinerary[index] = { ...updatedItinerary[index], [field]: value };
        handleFormChange("itinerary", updatedItinerary);
    };

    const removeItineraryDay = (index: number) => {
        const updatedItinerary = formData.itinerary.filter((_, i) => i !== index);
        // Renumber days
        const renumberedItinerary = updatedItinerary.map((day, i) => ({
            ...day,
            dayNumber: i + 1,
        }));
        handleFormChange("itinerary", renumberedItinerary);
    };

    const duplicateItineraryDay = (index: number) => {
        const dayToCopy = formData.itinerary[index];
        const newDay = {
            ...dayToCopy,
            dayNumber: formData.itinerary.length + 1,
            title: `${dayToCopy.title} (sao chép)`,
        };
        handleFormChange("itinerary", [...formData.itinerary, newDay]);
    };

    const columns: Column[] = [
        {
            key: "images",
            title: "Ảnh",
            width: "w-16",
            render: (images: string[]) => (
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {images.length > 0 ? (
                        <img src={images[0]} alt="Tour" className="w-full h-full object-cover" />
                    ) : (
                        <MapPin className="w-6 h-6 text-gray-400" />
                    )}
                </div>
            ),
        },
        {
            key: "id",
            title: "Mã tour",
            sortable: true,
            render: (value) => <span className="font-mono text-sm">{value}</span>,
        },
        {
            key: "title",
            title: "Tên tour",
            sortable: true,
            filterable: true,
            render: (value, record: Tour) => (
                <div className="max-w-xs">
                    <div className="font-medium truncate">{value}</div>
                    <div className="text-sm text-gray-500">
                        {record.departure} → {record.destination}
                    </div>
                    <div className="text-xs text-gray-400">{record.duration}</div>
                </div>
            ),
        },
        {
            key: "schedule",
            title: "Lịch trình",
            sortable: true,
            render: (_, record: Tour) => (
                <div className="text-sm">
                    <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(record.startDate).toLocaleDateString("vi-VN")}
                    </div>
                    <div className="text-gray-500">
                        đến {new Date(record.endDate).toLocaleDateString("vi-VN")}
                    </div>
                </div>
            ),
        },
        {
            key: "priceAdult",
            title: "Giá",
            sortable: true,
            render: (value, record: Tour) => (
                <div className="text-sm">
                    <div className="font-medium flex items-center">
                        <DollarSign className="w-3 h-3 mr-1" />
                        {new Intl.NumberFormat("vi-VN").format(value)} ₫
                    </div>
                    {record.priceChild && (
                        <div className="text-gray-500 text-xs">
                            Trẻ em: {new Intl.NumberFormat("vi-VN").format(record.priceChild)} ₫
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: "seats",
            title: "Chỗ",
            sortable: true,
            render: (_, record: Tour) => (
                <div className="text-sm">
                    <div className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {record.seatsBooked}/{record.seatsTotal}
                    </div>
                    <div
                        className={`text-xs ${record.seatsTotal - record.seatsBooked <= record.seatsTotal * 0.2
                                ? "text-orange-600"
                                : record.seatsTotal - record.seatsBooked <= record.seatsTotal * 0.5
                                    ? "text-yellow-600"
                                    : "text-green-600"
                            }`}
                    >
                        {record.seatsTotal - record.seatsBooked} chỗ trống
                    </div>
                </div>
            ),
        },
        {
            key: "rating",
            title: "Đánh giá",
            sortable: true,
            render: (value, record: Tour) => (
                <div className="text-sm">
                    <div className="flex items-center">
                        <Star className="w-3 h-3 mr-1 text-yellow-500 fill-current" />
                        {value}
                    </div>
                    <div className="text-gray-500 text-xs">{record.reviewCount} đánh giá</div>
                </div>
            ),
        },
        {
            key: "status",
            title: "Trạng thái",
            sortable: true,
            render: (value, record: Tour) => (
                <div className="flex items-center space-x-1">
                    <Badge
                        className={
                            value === "active"
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : value === "hidden"
                                    ? "bg-gray-100 text-gray-800 hover:bg-gray-100"
                                    : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                        }
                    >
                        {value === "active" ? "Hoạt động" : value === "hidden" ? "Ẩn" : "Bản nháp"}
                    </Badge>
                    {record.highlight && (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                            <Star className="w-3 h-3 mr-1" />
                            Nổi bật
                        </Badge>
                    )}
                </div>
            ),
        },
    ];

    const handleView = (tour: Tour) => {
        setSelectedTour(tour);
        setModalMode("view");
        setModalOpen(true);
    };

    const handleEdit = (tour: Tour) => {
        setSelectedTour(tour);
        setFormData({
            title: tour.title,
            title_vn: tour.title_vn || "",
            slug: tour.slug,
            summary: tour.summary,
            description: tour.description,
            departure: tour.departure,
            destination: tour.destination,
            startDate: tour.startDate,
            endDate: tour.endDate,
            duration: tour.duration,
            priceAdult: tour.priceAdult,
            priceChild: tour.priceChild || 0,
            seatsTotal: tour.seatsTotal,
            minBooking: tour.minBooking,
            categoryId: tour.categoryId,
            tags: tour.tags,
            images: tour.images,
            videoUrl: tour.videoUrl || "",
            itinerary: tour.itinerary,
            inclusions: tour.inclusions,
            exclusions: tour.exclusions,
            pickupPoints: tour.pickupPoints,
            cancellationPolicy: tour.cancellationPolicy || "",
            status: tour.status,
            highlight: tour.highlight,
            visibility: tour.visibility,
            metaTitle: tour.metaTitle || "",
            metaDescription: tour.metaDescription || "",
            metaKeywords: tour.metaKeywords || "",
        });
        setModalMode("edit");
        setModalOpen(true);
        setIsFormDirty(false);
    };

    const handleDelete = (tour: Tour) => {
        setTourToDelete(tour);
        setDeleteModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedTour(null);
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
            createTourMutation.mutate({ ...formData, status: "active" });
        } else if (modalMode === "edit" && selectedTour) {
            updateTourMutation.mutate({ id: selectedTour.id, data: formData });
        }
    };

    const handleSaveDraft = () => {
        if (modalMode === "create") {
            createTourMutation.mutate({ ...formData, status: "draft" });
        } else if (modalMode === "edit" && selectedTour) {
            updateTourMutation.mutate({ id: selectedTour.id, data: { ...formData, status: "draft" } });
        }
    };

    const handlePreview = () => {
        window.open(`/tours/${formData.slug}`, "_blank");
    };

    const confirmDelete = () => {
        if (tourToDelete) {
            if (tourToDelete.seatsBooked > 0) {
                toast({
                    title: "Không thể xóa tour",
                    description: "Tour này có đơn hàng đã thanh toán. Vui lòng ẩn tour thay vì xóa.",
                    variant: "destructive",
                });
                return;
            }
            deleteTourMutation.mutate(tourToDelete.id);
        }
    };

    const bulkActions = [
        {
            label: "Xuất bản",
            action: (keys: string[]) => {
                bulkActionMutation.mutate({ action: "publish", ids: keys });
            },
            icon: <Eye className="w-4 h-4 mr-2" />,
        },
        {
            label: "Ẩn",
            action: (keys: string[]) => {
                bulkActionMutation.mutate({ action: "unpublish", ids: keys });
            },
            icon: <Eye className="w-4 h-4 mr-2" />,
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
            action: (tour: Tour) => {
                const duplicatedTour = {
                    ...tour,
                    title: `${tour.title} (sao chép)`,
                    slug: `${tour.slug}-copy`,
                    status: "draft" as const,
                };
                delete (duplicatedTour as any).id;
                setFormData(duplicatedTour as any);
                setModalMode("create");
                setModalOpen(true);
            },
            icon: <Copy className="mr-2 h-4 w-4" />,
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
        return createTourMutation.isPending || updateTourMutation.isPending;
    };

    const renderTourForm = () => {
        if (modalMode === "view" && selectedTour) {
            return (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold">{selectedTour.title}</h3>
                                <p className="text-gray-500">{selectedTour.summary}</p>
                                <div className="flex items-center mt-2">
                                    <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                                    <span>
                                        {selectedTour.rating} ({selectedTour.reviewCount} đánh giá)
                                    </span>
                                </div>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-700">Tuyến</Label>
                                <p className="mt-1">
                                    {selectedTour.departure} → {selectedTour.destination}
                                </p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-700">Thời gian</Label>
                                <p className="mt-1">{selectedTour.duration}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Giá người lớn</Label>
                                    <p className="mt-1 font-bold text-green-600">
                                        {new Intl.NumberFormat("vi-VN").format(selectedTour.priceAdult)} ₫
                                    </p>
                                </div>
                                {selectedTour.priceChild && (
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Giá trẻ em</Label>
                                        <p className="mt-1 font-bold text-green-600">
                                            {new Intl.NumberFormat("vi-VN").format(selectedTour.priceChild)} ₫
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-700">Số chỗ</Label>
                                <p className="mt-1">
                                    {selectedTour.seatsBooked}/{selectedTour.seatsTotal} đã đặt
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label className="text-sm font-medium text-gray-700">Mô tả</Label>
                        <p className="mt-1 text-gray-900">{selectedTour.description}</p>
                    </div>

                    <div>
                        <Label className="text-sm font-medium text-gray-700">Lịch trình</Label>
                        <div className="mt-2 space-y-3">
                            {selectedTour.itinerary.map((day, index) => (
                                <div key={index} className="border rounded-lg p-3">
                                    <h4 className="font-medium">
                                        Ngày {day.dayNumber}: {day.title}
                                    </h4>
                                    <p className="mt-1 text-sm text-gray-600">{day.details}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-sm font-medium text-gray-700">Bao gồm</Label>
                            <ul className="mt-1 text-sm list-disc list-inside">
                                {selectedTour.inclusions.map((item, index) => (
                                    <li key={index} className="text-green-600">
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-gray-700">Không bao gồm</Label>
                            <ul className="mt-1 text-sm list-disc list-inside">
                                {selectedTour.exclusions.map((item, index) => (
                                    <li key={index} className="text-red-600">
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
                    <TabsTrigger value="itinerary">Lịch trình</TabsTrigger>
                    <TabsTrigger value="pricing">Giá & Chỗ</TabsTrigger>
                    <TabsTrigger value="media">Media</TabsTrigger>
                    <TabsTrigger value="seo">SEO</TabsTrigger>
                    <TabsTrigger value="settings">Cài đặt</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="title">Tên tour *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => handleFormChange("title", e.target.value)}
                                placeholder="Du thuyền Vịnh Hạ Long 3N2Đ"
                                className={formErrors.title ? "border-red-500" : ""}
                            />
                            {formErrors.title && (
                                <p className="text-sm text-red-500 mt-1">{formErrors.title}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="title_vn">Tên tour (Tiếng Việt)</Label>
                            <Input
                                id="title_vn"
                                value={formData.title_vn}
                                onChange={(e) => handleFormChange("title_vn", e.target.value)}
                                placeholder="Tên tiếng Việt"
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="slug">Slug</Label>
                        <Input
                            id="slug"
                            value={formData.slug}
                            onChange={(e) => handleFormChange("slug", e.target.value)}
                            placeholder="du-thuyen-vinh-ha-long-3n2d"
                        />
                        <p className="text-xs text-gray-500 mt-1">Nếu để trống sẽ tự động tạo từ tiêu đề</p>
                    </div>

                    <div>
                        <Label htmlFor="summary">Mô tả ngắn * (tối đa 300 ký tự)</Label>
                        <Textarea
                            id="summary"
                            value={formData.summary}
                            onChange={(e) => handleFormChange("summary", e.target.value)}
                            placeholder="Mô tả ngắn về tour"
                            rows={2}
                            maxLength={300}
                            className={formErrors.summary ? "border-red-500" : ""}
                        />
                        <div className="flex justify-between items-center mt-1">
                            {formErrors.summary && (
                                <p className="text-sm text-red-500">{formErrors.summary}</p>
                            )}
                            <p className="text-xs text-gray-500 ml-auto">{formData.summary.length}/300</p>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="categoryId">Danh mục *</Label>
                        <Select
                            value={formData.categoryId}
                            onValueChange={(value) => handleFormChange("categoryId", value)}
                        >
                            <SelectTrigger className={formErrors.categoryId ? "border-red-500" : ""}>
                                <SelectValue placeholder="Chọn danh mục" />
                            </SelectTrigger>
                            <SelectContent>
                                {mockCategories.map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {formErrors.categoryId && (
                            <p className="text-sm text-red-500 mt-1">{formErrors.categoryId}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="tags">Tags</Label>
                        <Input
                            id="tags"
                            value={formData.tags.join(", ")}
                            onChange={(e) =>
                                handleFormChange(
                                    "tags",
                                    e.target.value
                                        .split(",")
                                        .map((tag) => tag.trim())
                                        .filter(Boolean)
                                )
                            }
                            placeholder="thiên nhiên, du thuyền, gia đình"
                        />
                    </div>
                </TabsContent>

                <TabsContent value="itinerary" className="space-y-4 mt-6">
                    <div>
                        <Label htmlFor="description">Mô tả chi tiết</Label>
                        <RichTextEditor
                            value={formData.description}
                            onChange={(value) => handleFormChange("description", value)}
                            placeholder="Mô tả chi tiết về tour"
                        />
                    </div>

                    <div>
                        <Label>Lịch trình từng ngày</Label>
                        <div className="mt-2 space-y-3">
                            {formData.itinerary.map((day, index) => (
                                <div key={index} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium">Ngày {day.dayNumber}</h4>
                                        <div className="flex space-x-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => duplicateItineraryDay(index)}
                                            >
                                                <Copy className="w-3 h-3 mr-1" />
                                                Sao chép
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeItineraryDay(index)}
                                            >
                                                <Trash2 className="w-3 h-3 mr-1" />
                                                Xóa
                                            </Button>
                                        </div>
                                    </div>
                                    <Input
                                        placeholder="Tiêu đề ngày"
                                        value={day.title}
                                        onChange={(e) => updateItineraryDay(index, "title", e.target.value)}
                                        className="mb-2"
                                    />
                                    <Textarea
                                        placeholder="Chi tiết hoạt động trong ngày"
                                        value={day.details}
                                        onChange={(e) => updateItineraryDay(index, "details", e.target.value)}
                                        rows={2}
                                    />
                                </div>
                            ))}

                            {formData.itinerary.length === 0 && (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                    <p className="text-gray-500">Chưa có lịch trình nào</p>
                                    <Button type="button" onClick={addItineraryDay} className="mt-2">
                                        Thêm ngày đầu tiên
                                    </Button>
                                </div>
                            )}
                        </div>

                        {formData.itinerary.length > 0 && (
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full mt-4"
                                onClick={addItineraryDay}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Thêm ngày mới
                            </Button>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="pricing" className="space-y-4 mt-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="departure">Điểm khởi hành *</Label>
                            <Input
                                id="departure"
                                value={formData.departure}
                                onChange={(e) => handleFormChange("departure", e.target.value)}
                                placeholder="Hà Nội"
                                className={formErrors.departure ? "border-red-500" : ""}
                            />
                            {formErrors.departure && (
                                <p className="text-sm text-red-500 mt-1">{formErrors.departure}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="destination">Điểm đến *</Label>
                            <Input
                                id="destination"
                                value={formData.destination}
                                onChange={(e) => handleFormChange("destination", e.target.value)}
                                placeholder="Vịnh Hạ Long"
                                className={formErrors.destination ? "border-red-500" : ""}
                            />
                            {formErrors.destination && (
                                <p className="text-sm text-red-500 mt-1">{formErrors.destination}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="startDate">Ngày bắt đầu *</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => handleFormChange("startDate", e.target.value)}
                                className={formErrors.startDate ? "border-red-500" : ""}
                            />
                            {formErrors.startDate && (
                                <p className="text-sm text-red-500 mt-1">{formErrors.startDate}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="endDate">Ngày kết thúc *</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => handleFormChange("endDate", e.target.value)}
                                className={formErrors.endDate ? "border-red-500" : ""}
                            />
                            {formErrors.endDate && (
                                <p className="text-sm text-red-500 mt-1">{formErrors.endDate}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="duration">Thời gian</Label>
                            <Input
                                id="duration"
                                value={formData.duration}
                                onChange={(e) => handleFormChange("duration", e.target.value)}
                                placeholder="3 ngày 2 đêm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="priceAdult">Giá người lớn (VNĐ) *</Label>
                            <Input
                                id="priceAdult"
                                type="number"
                                value={formData.priceAdult || ""}
                                onChange={(e) => handleFormChange("priceAdult", parseInt(e.target.value) || 0)}
                                placeholder="3500000"
                                className={formErrors.priceAdult ? "border-red-500" : ""}
                            />
                            {formErrors.priceAdult && (
                                <p className="text-sm text-red-500 mt-1">{formErrors.priceAdult}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="priceChild">Giá trẻ em (VNĐ)</Label>
                            <Input
                                id="priceChild"
                                type="number"
                                value={formData.priceChild || ""}
                                onChange={(e) => handleFormChange("priceChild", parseInt(e.target.value) || 0)}
                                placeholder="2800000"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="seatsTotal">Số chỗ tối đa *</Label>
                            <Input
                                id="seatsTotal"
                                type="number"
                                min="1"
                                value={formData.seatsTotal || ""}
                                onChange={(e) => handleFormChange("seatsTotal", parseInt(e.target.value) || 1)}
                                placeholder="25"
                                className={formErrors.seatsTotal ? "border-red-500" : ""}
                            />
                            {formErrors.seatsTotal && (
                                <p className="text-sm text-red-500 mt-1">{formErrors.seatsTotal}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="minBooking">Booking tối thiểu</Label>
                            <Input
                                id="minBooking"
                                type="number"
                                min="1"
                                value={formData.minBooking || ""}
                                onChange={(e) => handleFormChange("minBooking", parseInt(e.target.value) || 1)}
                                placeholder="1"
                                className={formErrors.minBooking ? "border-red-500" : ""}
                            />
                            {formErrors.minBooking && (
                                <p className="text-sm text-red-500 mt-1">{formErrors.minBooking}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="pickupPoints">Điểm đón</Label>
                        <Input
                            id="pickupPoints"
                            value={formData.pickupPoints.join(", ")}
                            onChange={(e) =>
                                handleFormChange(
                                    "pickupPoints",
                                    e.target.value
                                        .split(",")
                                        .map((point) => point.trim())
                                        .filter(Boolean)
                                )
                            }
                            placeholder="Hà Nội, Hải Phòng"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="inclusions">Dịch vụ bao gồm</Label>
                            <Textarea
                                id="inclusions"
                                value={formData.inclusions.join("\n")}
                                onChange={(e) =>
                                    handleFormChange("inclusions", e.target.value.split("\n").filter(Boolean))
                                }
                                placeholder="Mỗi dòng là một dịch vụ bao gồm"
                                rows={4}
                            />
                        </div>
                        <div>
                            <Label htmlFor="exclusions">Dịch vụ không bao gồm</Label>
                            <Textarea
                                id="exclusions"
                                value={formData.exclusions.join("\n")}
                                onChange={(e) =>
                                    handleFormChange("exclusions", e.target.value.split("\n").filter(Boolean))
                                }
                                placeholder="Mỗi dòng là một dịch vụ không bao gồm"
                                rows={4}
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="cancellationPolicy">Chính sách hủy tour</Label>
                        <Textarea
                            id="cancellationPolicy"
                            value={formData.cancellationPolicy}
                            onChange={(e) => handleFormChange("cancellationPolicy", e.target.value)}
                            placeholder="Mô tả chính sách hủy tour và hoàn tiền"
                            rows={3}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="media" className="space-y-4 mt-6">
                    <div>
                        <Label>Hình ảnh tour * (tối thiểu 1, tối đa 10)</Label>
                        <div className="mt-2">
                            <ImageUploader
                                maxFiles={10}
                                maxSizeMB={5}
                                initialFiles={formData.images}
                                onChange={(files) => handleFormChange("images", files)}
                                hint="Kích thước tối đa 5MB/file, khuyến nghị 1920×1080"
                                className={formErrors.images ? "border-red-500" : ""}
                            />
                        </div>
                        {formErrors.images && (
                            <p className="text-sm text-red-500 mt-1">{formErrors.images}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            Ảnh đầu tiên sẽ được sử dụng làm ảnh bìa
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="videoUrl">Video URL (YouTube/Vimeo)</Label>
                        <Input
                            id="videoUrl"
                            value={formData.videoUrl}
                            onChange={(e) => handleFormChange("videoUrl", e.target.value)}
                            placeholder="https://youtube.com/watch?v=..."
                            className={formErrors.videoUrl ? "border-red-500" : ""}
                        />
                        {formErrors.videoUrl && (
                            <p className="text-sm text-red-500 mt-1">{formErrors.videoUrl}</p>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="seo" className="space-y-4 mt-6">
                    <div>
                        <Label htmlFor="metaTitle">Meta Title</Label>
                        <Input
                            id="metaTitle"
                            value={formData.metaTitle}
                            onChange={(e) => handleFormChange("metaTitle", e.target.value)}
                            placeholder="Title cho SEO (khuyến nghị 50-60 ký tự)"
                            maxLength={60}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {formData.metaTitle.length}/60 ký tự
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="metaDescription">Meta Description</Label>
                        <Textarea
                            id="metaDescription"
                            value={formData.metaDescription}
                            onChange={(e) => handleFormChange("metaDescription", e.target.value)}
                            placeholder="Mô tả cho SEO (khuyến nghị 150-160 ký tự)"
                            rows={3}
                            maxLength={160}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {formData.metaDescription.length}/160 ký tự
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="metaKeywords">Meta Keywords</Label>
                        <Input
                            id="metaKeywords"
                            value={formData.metaKeywords}
                            onChange={(e) => handleFormChange("metaKeywords", e.target.value)}
                            placeholder="keyword1, keyword2, keyword3"
                        />
                    </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4 mt-6">
                    <div>
                        <Label htmlFor="status">Trạng thái</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value) => handleFormChange("status", value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Hoạt động</SelectItem>
                                <SelectItem value="hidden">Ẩn</SelectItem>
                                <SelectItem value="draft">Bản nháp</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="highlight"
                            checked={formData.highlight}
                            onCheckedChange={(checked) => handleFormChange("highlight", checked)}
                        />
                        <Label htmlFor="highlight">Tour nổi bật</Label>
                    </div>

                    <div>
                        <Label htmlFor="visibility">Khả năng hiển thị</Label>
                        <Select
                            value={formData.visibility}
                            onValueChange={(value) => handleFormChange("visibility", value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="public">Công khai</SelectItem>
                                <SelectItem value="private">Riêng tư</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </TabsContent>
            </Tabs>
        );
    };

    return (
        <div className="p-6 space-y-6 bg-gray-50">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý tour</h1>
                    <p className="text-gray-600 mt-1">Quản lý các tour du lịch và lịch trình</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Button
                        variant="outline"
                        onClick={() => refetch()}
                        disabled={isLoading}
                        className="hover:bg-primary-600 hover:text-white"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                        Làm mới
                    </Button>
                    <Button onClick={handleAdd} className="bg-primary hover:bg-primary-600">
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm tour mới
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Tổng tour</p>
                                <p className="text-2xl font-bold">{total || 0}</p>
                            </div>
                            <MapPin className="w-8 h-8 text-primary" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Đang bán</p>
                                <p className="text-2xl font-bold">
                                    {tours.filter((t: Tour) => t.status === "active").length}
                                </p>
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
                                    {tours.filter((t: Tour) => t.seatsTotal - t.seatsBooked <= t.seatsTotal * 0.2)
                                        .length}
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
                                <p className="text-sm text-gray-600">Đánh giá TB</p>
                                <p className="text-2xl font-bold">4.7</p>
                            </div>
                            <Star className="w-8 h-8 text-yellow-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Danh sách tour</CardTitle>
                            <CardDescription>Quản lý thông tin và trạng thái tour du lịch</CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Select
                                value={filters.status}
                                onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
                            >
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                    <SelectItem value="active">Hoạt động</SelectItem>
                                    <SelectItem value="hidden">Ẩn</SelectItem>
                                    <SelectItem value="draft">Bản nháp</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select
                                value={filters.category}
                                onValueChange={(value) => setFilters((prev) => ({ ...prev, category: value }))}
                            >
                                <SelectTrigger className="w-36">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả danh mục</SelectItem>
                                    {mockCategories.map((category) => (
                                        <SelectItem key={category.id} value={category.id}>
                                            {category.name}
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
                        data={tours}
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: total,
                        }}
                        onPaginationChange={(page, pageSize) => setPagination({ current: page, pageSize })}
                        onSearch={setSearchQuery}
                        rowSelection={{
                            selectedRowKeys: selectedTours,
                            onChange: setSelectedTours,
                        }}
                        bulkActions={bulkActions}
                        actions={actions}
                        exportable
                        onExport={() =>
                            toast({ title: "Đang xuất file...", description: "File sẽ được tải xuống sau vài giây" })
                        }
                        loading={isLoading}
                    />
                </CardContent>
            </Card>

            {/* Tour Modal */}
            <ModalForm
                open={modalOpen}
                onOpenChange={handleModalClose}
                title={
                    modalMode === "create"
                        ? "Tạo tour mới"
                        : modalMode === "edit"
                            ? "Chỉnh sửa tour"
                            : "Chi tiết tour"
                }
                description={
                    modalMode === "create"
                        ? "Tạo tour du lịch mới với đầy đủ thông tin"
                        : modalMode === "edit"
                            ? "Cập nhật thông tin tour du lịch"
                            : "Xem thông tin chi tiết tour du lịch"
                }
                mode={modalMode}
                size="full"
                onSubmit={handleSubmit}
                submitDisabled={isSubmitDisabled()}
                submitText={modalMode === "create" ? "Tạo & Xuất bản" : "Cập nhật"}
                cancelText="Hủy"
                extraActions={
                    modalMode !== "view"
                        ? [
                            {
                                text: "Lưu nháp",
                                onClick: handleSaveDraft,
                                variant: "outline" as const,
                                icon: <Save className="w-4 h-4 mr-2" />,
                            },
                            {
                                text: "Xem trước",
                                onClick: handlePreview,
                                variant: "outline" as const,
                                icon: <ExternalLink className="w-4 h-4 mr-2" />,
                            },
                        ]
                        : undefined
                }
            >
                {/* Bọc scroll chỉ phần nội dung form, không bọc toàn bộ ModalForm children */}
                <div className="max-h-[60vh] overflow-y-auto pr-2">
                    {renderTourForm()}
                </div>
            </ModalForm>

            {/* Delete Confirmation */}
            <ConfirmModal
                open={deleteModalOpen}
                onOpenChange={setDeleteModalOpen}
                title="Xóa tour"
                message={`Bạn có chắc chắn muốn xóa tour "${tourToDelete?.title}"?${tourToDelete?.seatsBooked ? " Tour này có đơn hàng đã đặt." : ""
                    }`}
                type="danger"
                requireTyping={true}
                typingText={tourToDelete?.seatsBooked ? "FORCE_DELETE" : "DELETE"}
                onConfirm={confirmDelete}
                confirmText="Xóa tour"
                loading={deleteTourMutation.isPending}
            />
        </div>
    );
}