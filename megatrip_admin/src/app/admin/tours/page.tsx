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
import dynamic from "next/dynamic";
import { Separator } from "@/app/components/ui/separator";
const JoditEditorWrapper = dynamic(() => import("../../components/JoditEditorWrapper"), { ssr: false });
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
    startDates?: string[];
    endDates?: string[];
    duration: string;
    priceAdult: number;
    priceChild?: number;
    priceBaby?: number;
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
    startDates?: string[];
    endDates?: string[];
    duration: string;
    priceAdult: number;
    priceChild: number;
    priceBaby: number;
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
        priceBaby: 1500000,
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
        priceBaby: 1000000,
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
        priceBaby: 2000000,
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
const DEFAULT_CANCELLATION_POLICY = `
        CHÍNH SÁCH ĐẶT TOUR

        1. Thanh toán & đặt cọc
        - Khách đặt tour cần **đặt cọc tối thiểu 30% giá tour hoặc 1.000.000đ/người** (tùy mức nào cao hơn).
        - Phần còn lại thanh toán trước ngày khởi hành 5 ngày.

        2. Hủy tour bởi khách hàng
        - Trước 15 ngày: mất phí 30% tổng giá trị tour.
        - Trước 7 – 14 ngày: mất phí 50%.
        - Trước 3 – 6 ngày: mất phí 70%.
        - Trong 48h trước ngày khởi hành: mất phí 100%.

        3. Chuyển / đổi tour
        - Trước 7 ngày: miễn phí.
        - Trong vòng 7 ngày: tính phí như hủy tour.

        4. Hủy tour bởi công ty
        - Nếu tour **không đủ số lượng khách trước ngày khởi hành 3 ngày** → hoàn tiền 100% cho khách.
        - Nếu tour bị hủy do công ty (khác lý do thiên tai, bất khả kháng) → khách có quyền chọn chuyển tour khác hoặc hoàn tiền 100%.

        5. Trường hợp bất khả kháng
        - Thiên tai, dịch bệnh, khủng bố, biểu tình… có thể ảnh hưởng lịch trình.
        - Công ty sẽ thông báo sớm nhất và đảm bảo quyền lợi tối đa cho khách.

        6. Tranh chấp
        - Các bên ưu tiên thương lượng, hòa giải.
        - Nếu không đạt được thỏa thuận, tranh chấp sẽ được giải quyết theo **pháp luật Việt Nam**.
        `;

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
        startDates: [],
        endDates: [],
        duration: "",
        priceAdult: 0,
        priceChild: 0,
        priceBaby: 0,
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
        // set default cancellation policy text here
        cancellationPolicy: DEFAULT_CANCELLATION_POLICY,
        status: "draft",
        highlight: false,
        visibility: "public",
        metaTitle: "",
        metaDescription: "",
        metaKeywords: "",
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [recurrenceMode, setRecurrenceMode] = useState<"single" | "weekly" | "monthly" | "weekday_of_month">("single");
    const [recurrenceWeekday, setRecurrenceWeekday] = useState<number>(1);
    const [recurrenceApplied, setRecurrenceApplied] = useState<boolean>(false);

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
        setTours(mockTours);
        toast({ title: "Dữ liệu đã được làm mới" });
    };

    const toLocalInput = (d: Date) => {
        const tzOffset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
    };

    const parseLocalInput = (isoLocal: string) => {
        if (!isoLocal) return null;
        const [datePart, timePart] = isoLocal.split('T');
        if (!datePart) return null;
        const [y, m, day] = datePart.split('-').map(Number);
        const [hh = 0, mm = 0] = (timePart || '').split(':').map(Number);
        return new Date(y, (m || 1) - 1, day || 1, hh || 0, mm || 0, 0, 0);
    };

    // returns true if isoLocal (datetime-local string) is strictly in the past compared to now (local)
    const isPastLocal = (isoLocal?: string | null) => {
        if (!isoLocal) return true;
        const dt = parseLocalInput(isoLocal);
        if (!dt) return true;
        const now = new Date();
        return dt.getTime() < now.getTime();
    };
    
    const localToIso = (localStr: string) => {
        if (!localStr) return "";
        const d = parseLocalInput(localStr);
        return d ? d.toISOString() : localStr;
    };

    const generateConsecutiveDays = (startIsoLocal: string, daysCount: number) => {
        const start = parseLocalInput(startIsoLocal);
        if (!start) return [];
        const result: string[] = [];
        for (let i = 0; i < daysCount; i++) {
            const dd = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
            const isoLocal = toLocalInput(dd);
            // skip past dates
            if (!isPastLocal(isoLocal)) result.push(isoLocal);
        }
        return result;
    };

    const generateWeekdayInMonth = (startIsoLocal: string, weekday: number) => {
        const start = parseLocalInput(startIsoLocal);
        if (!start) return [];
        const year = start.getFullYear();
        const month = start.getMonth();
        const result: string[] = [];
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let d = 1; d <= daysInMonth; d++) {
            const dt = new Date(year, month, d, start.getHours(), start.getMinutes());
            if (dt.getDay() === weekday && dt.getTime() >= start.getTime()) {
                const isoLocal = toLocalInput(dt);
                // skip past dates
                if (!isPastLocal(isoLocal)) result.push(isoLocal);
            }
        }
        return result;
    };

    // Chuyển chuỗi duration (ví dụ "3 ngày 2 đêm" hoặc "3N2Đ") sang số ngày (3).
    const parseDurationToDays = (durationStr?: string, startIso?: string, endIso?: string): number => {
        if (durationStr) {
            // match "3 ngày", "3 ngày 2 đêm"
            const vnMatch = durationStr.match(/(\d+)\s*ngày/i);
            if (vnMatch) return Math.max(1, parseInt(vnMatch[1], 10));

            // match compact "3N2Đ" or "3n2đ"
            const compactMatch = durationStr.match(/(\d+)\s*[Nn]\s*(\d+)?\s*[ĐĐd]?/);
            if (compactMatch) return Math.max(1, parseInt(compactMatch[1], 10));
        }

        if (startIso && endIso) {
            const s = parseLocalInput(startIso);
            const e = parseLocalInput(endIso);
            if (s && e && e.getTime() >= s.getTime()) {
                // số ngày = chênh lệch ngày (full days) + 1 (inclusive)
                const diffDays = Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
                return diffDays + 1;
            }
        }

        return 0;
    };

    // Đảm bảo itinerary có đúng số ngày; giữ nội dung hiện có nếu có, tạo rỗng nếu cần
    const ensureItineraryLength = (days: number, existing: TourFormData["itinerary"]): TourFormData["itinerary"] => {
        const n = Math.max(0, Math.floor(days));
        const next: TourFormData["itinerary"] = [];
        for (let i = 0; i < n; i++) {
            const existingDay = existing && existing[i];
            if (existingDay) {
                next.push({ ...existingDay, dayNumber: i + 1 });
            } else {
                next.push({ dayNumber: i + 1, title: "", details: "" });
            }
        }
        return next;
    };

    // Đổi: thêm helper lấy số ngày mong đợi dựa vào duration hoặc start/end
    const getExpectedItineraryDays = () => {
        const firstStart = (formData.startDates && formData.startDates.length) ? formData.startDates[0] : formData.startDate;
        const firstEnd = (formData.endDates && formData.endDates.length) ? formData.endDates[0] : formData.endDate;
        // parseDurationToDays sẽ trả về 0 nếu không thể xác định
        return parseDurationToDays(formData.duration || undefined, firstStart, firstEnd);
    };

    const applyRecurrence = () => {
        const firstStart = (formData.startDates && formData.startDates.length) ? formData.startDates[0] : formData.startDate;
        const firstEnd = (formData.endDates && formData.endDates.length) ? formData.endDates[0] : formData.endDate;
 
        if (!firstStart) {
            toast({ title: "Thiếu ngày bắt đầu", description: "Vui lòng chọn ngày khởi hành đầu tiên trước khi áp dụng", variant: "destructive" });
            return;
        }

        let generatedStarts: string[] = [];
        if (recurrenceMode === "weekly") {
            generatedStarts = generateConsecutiveDays(firstStart, 7);
        } else if (recurrenceMode === "monthly") {
            generatedStarts = generateConsecutiveDays(firstStart, 30);
        } else if (recurrenceMode === "weekday_of_month") {
            generatedStarts = generateWeekdayInMonth(firstStart, recurrenceWeekday);
        } else {
            generatedStarts = Array.isArray(formData.startDates) && formData.startDates.length ? formData.startDates : (formData.startDate ? [formData.startDate] : []);
        }

        // filter out any generated start dates that are in the past (defensive)
        generatedStarts = generatedStarts.filter(s => !isPastLocal(s));
        
        let generatedEnds: string[] = [];
        if (firstEnd) {
            const startDate = parseLocalInput(firstStart);
            const endDate = parseLocalInput(firstEnd);
            if (startDate && endDate) {
                const deltaMs = endDate.getTime() - startDate.getTime();
                for (const dIso of generatedStarts) {
                    const d = parseLocalInput(dIso);
                    if (d) {
                        const end = new Date(d.getTime() + deltaMs);
                        // ensure corresponding end is not before its start
                        const endLocal = toLocalInput(end);
                        if (isPastLocal(endLocal) && end.getTime() < new Date().getTime()) {
                            // keep it only if end is not before now — otherwise push empty so validation will catch it
                            generatedEnds.push(endLocal);
                        } else {
                            generatedEnds.push(endLocal);
                        }
                    } else {
                        generatedEnds.push("");
                    }
                }
            } else {
                generatedEnds = generatedStarts.map(() => firstEnd);
            }
        } else {
            generatedEnds = [];
        }

        if (!generatedStarts || generatedStarts.length === 0) {
             toast({ title: "Không có ngày nào được tạo", description: "Vui lòng kiểm tra ngày bắt đầu hoặc loại lặp", variant: "destructive" });
             setRecurrenceApplied(false);
             return;
         }

         handleFormChange('startDates' as any, generatedStarts);
         handleFormChange('startDate' as any, generatedStarts[0]);

         if (generatedEnds.length) {
             handleFormChange('endDates' as any, generatedEnds);
             handleFormChange('endDate' as any, generatedEnds[0]);
             setRecurrenceApplied(true);
         } else {
             setRecurrenceApplied(false);
         }

         setIsFormDirty(true);
         toast({ title: "Đã tạo ngày khởi hành", description: `Tạo ${generatedStarts.length} ngày theo chế độ ${recurrenceMode}` });
    };

    const handleResetSchedule = () => {
        if (!confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch khởi hành và giờ đến? Hành động này sẽ xóa startDates, endDates và giờ tương ứng.")) {
            return;
        }

        setFormData(prev => ({
            ...prev,
            startDates: [],
            endDates: [],
            startDate: "",
            endDate: "",
            duration: ""
        }));

        setFormErrors(prev => {
            const next: Record<string, string> = { ...prev };
            Object.keys(next).forEach(k => {
                if (k === 'startDate' || k === 'endDate' || k.startsWith('startDates_') || k.startsWith('endDates_')) {
                    delete next[k];
                }
            });
            return next;
        });

        setIsFormDirty(true);
        setRecurrenceApplied(false);

        toast({ title: "Đã đặt lại lịch", description: "Lịch khởi hành và giờ đến đã được xóa", variant: "default" });
    };

    // Create tour mutation
    const createTourMutation = useMutation({
        mutationFn: async (data: TourFormData) => {
            const payload: any = { ...data };
            payload.startDates = (data.startDates && Array.isArray(data.startDates)) ? data.startDates.map((s: string) => localToIso(s)) : (data.startDate ? [localToIso(data.startDate)] : []);
            payload.endDates = (data.endDates && Array.isArray(data.endDates)) ? data.endDates.map((s: string) => localToIso(s)) : (data.endDate ? [localToIso(data.endDate)] : []);

            if (payload.startDates.length && payload.endDates.length) {
                payload.duration = calculateDuration(payload.startDates[0], payload.endDates[0]);
            }

            delete payload.startDate;
            delete payload.endDate;

            const newTour: Tour = {
                ...payload,
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
            const payload: any = { ...data };
            if (data.startDates && Array.isArray(data.startDates)) {
                payload.startDates = data.startDates.map((s: string) => localToIso(s));
            } else if (data.startDate && !payload.startDates?.length) {
                payload.startDates = [localToIso(data.startDate)];
            }
            if (data.endDates && Array.isArray(data.endDates)) {
                payload.endDates = data.endDates.map((s: string) => localToIso(s));
            } else if (data.endDate && !payload.endDates?.length) {
                payload.endDates = [localToIso(data.endDate)];
            }

            delete payload.startDate;
            delete payload.endDate;

            if (payload.startDates?.length && payload.endDates?.length) {
                payload.duration = calculateDuration(payload.startDates[0], payload.endDates[0]);
            }

            setTours((prev) =>
                prev.map((tour) =>
                    tour.id === id ? { ...tour, ...payload, updatedAt: new Date().toISOString() } : tour
                )
            );
            return { id, ...payload };
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

        const now = new Date();
        if (!Array.isArray(data.startDates) || data.startDates.length === 0) {
            errors.startDate = "Bạn phải chọn ít nhất một ngày bắt đầu";
        } else {
            const seen = new Set<string>();
            for (let i = 0; i < data.startDates.length; i++) {
                const d = data.startDates[i];
                const dt = parseLocalInput(d);
                if (!d || !dt || isNaN(dt.getTime())) {
                    errors[`startDates_${i}`] = `Ngày bắt đầu thứ ${i + 1} không hợp lệ`;
                } else {
                    if (dt.getTime() < now.getTime()) {
                        errors[`startDates_${i}`] = `Ngày bắt đầu thứ ${i + 1} không được ở quá khứ`;
                    }
                    const key = dt.toISOString();
                    if (seen.has(key)) {
                        errors[`startDates_${i}`] = `Ngày bắt đầu trùng lặp`;
                    }
                    seen.add(key);
                }
            }
        }

        if (Array.isArray(data.endDates) && data.endDates.length > 0) {
            for (let i = 0; i < (data.startDates || []).length; i++) {
                const start = data.startDates?.[i];
                const end = data.endDates?.[i];
                const startDt = start ? parseLocalInput(start) : null;
                const endDt = end ? parseLocalInput(end) : null;
                if (!end || !endDt || isNaN(endDt.getTime())) {
                    errors[`endDates_${i}`] = `Ngày kết thúc thứ ${i + 1} không hợp lệ`;
                } else if (start && startDt && !isNaN(startDt.getTime())) {
                    if (endDt.getTime() <= startDt.getTime()) {
                        errors[`endDates_${i}`] = `Ngày kết thúc thứ ${i + 1} phải sau ngày bắt đầu tương ứng`;
                    }
                }
            }
        } else {
            if (!data.endDate) {
                errors.endDate = "Bạn phải chọn ngày kết thúc";
            } else if (isNaN(new Date(data.endDate).getTime())) {
                errors.endDate = "Ngày kết thúc không hợp lệ";
            } else {
                const earliestRaw = Array.isArray(data.startDates) && data.startDates.length ? data.startDates.slice().sort()[0] : (data.startDate ? data.startDate : null);
                const earliest = earliestRaw ? parseLocalInput(earliestRaw) : null;
                const endDt = parseLocalInput(data.endDate);
                if (earliest && endDt && endDt.getTime() <= earliest.getTime()) {
                    errors.endDate = "Ngày kết thúc phải sau ngày bắt đầu (với tất cả ngày khởi hành)";
                }
            }
        }

        if (data.priceAdult <= 0) {
            errors.priceAdult = "Giá người lớn phải lớn hơn 0";
        }

        if (typeof data.priceChild !== "number" || isNaN(data.priceChild) || data.priceChild < 0) {
            errors.priceChild = "Giá trẻ em (≥5 tuổi) phải là số không âm";
        }
        if (typeof data.priceBaby !== "number" || isNaN(data.priceBaby) || data.priceBaby < 0) {
            errors.priceBaby = "Giá em bé (<5 tuổi) phải là số không âm";
        }
        if (typeof data.priceChild === "number" && typeof data.priceBaby === "number" && data.priceBaby > data.priceChild) {
            errors.priceBaby = "Giá em bé phải không lớn hơn giá trẻ em (≥5 tuổi)";
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

    const calculateDuration = (start: string, end: string): string => {
        if (!start || !end) return "";

        const startTime = parseLocalInput(start) || new Date(start);
        const endTime = parseLocalInput(end) || new Date(end);
        const diffMs = endTime.getTime() - startTime.getTime();

        if (diffMs <= 0) return "";

        // diff full days, inclusive days = diffDays + 1, nights = diffDays
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const days = diffDays + 1;
        const nights = Math.max(0, diffDays);

        // trả về dạng thân thiện: "3 ngày 2 đêm"
        return `${days} ngày ${nights} đêm`;
    };


    const isoLocalNow = () => {
        const d = new Date();
        const tzOffset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
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
            startDates: [],
            endDates: [],
            duration: "",
            priceAdult: 0,
            priceChild: 0,
            priceBaby: 0,
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
            // restore default cancellation policy on reset
            cancellationPolicy: DEFAULT_CANCELLATION_POLICY,
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
        setRecurrenceApplied(false);
    };

    const handleFormChange = (field: keyof TourFormData, value: any) => {
        setIsFormDirty(true);

        // compute next state synchronously so we can derive duration/itinerary reliably
        setFormData((prev) => {
            const next: any = { ...prev, [field]: value };

            // Auto-generate slug from title if user types title
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
                // only auto-set slug if empty or derived from previous title
                if (!prev.slug || prev.slug === "" || prev.slug === (prev.title || "").toLowerCase().replace(/\s+/g, "-")) {
                    next.slug = slug;
                }
            }

            // Determine first start/end after this change
            const firstStart = (next.startDates && next.startDates.length) ? next.startDates[0] : next.startDate;
            const firstEnd = (next.endDates && next.endDates.length) ? next.endDates[0] : next.endDate;

            // If we have both start and end, compute duration and adjust itinerary
            if (firstStart && firstEnd) {
                const computedDuration = calculateDuration(firstStart, firstEnd);
                next.duration = computedDuration;
                const days = parseDurationToDays(computedDuration, firstStart, firstEnd);
                if (days > 0) {
                    next.itinerary = ensureItineraryLength(days, next.itinerary || []);
                }
            } else {
                // if only duration changed explicitly, still allow updating itinerary
                if (field === "duration") {
                    const days = parseDurationToDays(value, firstStart, firstEnd);
                    if (days > 0) {
                        next.itinerary = ensureItineraryLength(days, next.itinerary || []);
                    }
                    next.duration = value;
                }
            }

            return next;
        });

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
            // convert stored ISO dates into local "YYYY-MM-DDTHH:MM" so datetime-local inputs
            // will enforce both date and time (min/validation) properly
            startDate: tour.startDate ? toLocalInput(new Date(tour.startDate)) : "",
            endDate: tour.endDate ? toLocalInput(new Date(tour.endDate)) : "",
            startDates: Array.isArray(tour.startDates)
                ? tour.startDates.map((d: string) => toLocalInput(new Date(d)))
                : (tour.startDate ? [toLocalInput(new Date(tour.startDate))] : []),
            endDates: Array.isArray(tour.endDates)
                ? tour.endDates.map((d: string) => toLocalInput(new Date(d)))
                : (tour.endDate ? [toLocalInput(new Date(tour.endDate))] : []),
            duration: tour.duration,
            priceAdult: tour.priceAdult,
            priceChild: tour.priceChild || 0,
            priceBaby: tour.priceBaby || 0,
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

        const dataToSend = { ...formData } as any;
        const startsRaw = (formData.startDates && formData.startDates.length) ? formData.startDates : (formData.startDate ? [formData.startDate] : []);
        dataToSend.startDates = startsRaw.map((s: string) => localToIso(s)).filter(Boolean);

        const endsRaw = (formData.endDates && formData.endDates.length) ? formData.endDates : (formData.endDate ? [formData.endDate] : []);
        dataToSend.endDates = endsRaw.map((s: string) => localToIso(s)).filter(Boolean);

        delete dataToSend.startDate;
        delete dataToSend.endDate;

        if (dataToSend.startDates.length && dataToSend.endDates.length) {
            dataToSend.duration = calculateDuration(dataToSend.startDates[0], dataToSend.endDates[0]);
        }

        if (modalMode === "create") {
            createTourMutation.mutate({ ...dataToSend, status: "active" });
        } else if (modalMode === "edit" && selectedTour) {
            updateTourMutation.mutate({ id: selectedTour.id, data: dataToSend });
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
            const startArray: string[] = Array.isArray(selectedTour.startDates) && selectedTour.startDates.length
                ? selectedTour.startDates
                : (selectedTour.startDate ? [selectedTour.startDate] : []);
            const endArray: string[] = Array.isArray(selectedTour.endDates) && selectedTour.endDates.length
                ? selectedTour.endDates
                : (selectedTour.endDate ? [selectedTour.endDate] : []);

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
                                {selectedTour.priceChild !== undefined && (
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Giá trẻ em (≥5 tuổi)</Label>
                                        <p className="mt-1 font-bold text-green-600">
                                            {new Intl.NumberFormat("vi-VN").format(selectedTour.priceChild || 0)} ₫
                                        </p>
                                    </div>
                                )}
                                {selectedTour.priceBaby !== undefined && (
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Giá em bé (&lt;5 tuổi)</Label>
                                        <p className="mt-1 font-bold text-green-600">
                                            {new Intl.NumberFormat("vi-VN").format(selectedTour.priceBaby || 0)} ₫
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
                        <div className="mt-1 space-y-2">
                            {startArray.length ? (
                                startArray.map((start, i) => {
                                    const end = endArray[i];
                                    const startDate = start ? new Date(start) : null;
                                    const endDate = end ? new Date(end) : null;
                                    const duration = (start && end) ? calculateDuration(start, end) : (selectedTour.duration || "");
                                    return (
                                        <div key={i} className="bg-gray-50 p-3 rounded">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-sm text-gray-500">Chuyến #{i + 1}</div>
                                                    <div className="font-medium">
                                                        Bắt đầu : {startDate ? startDate.toLocaleDateString('vi-VN') : '---'}{" "}
                                                        <span className="text-gray-600">•</span>{" "}
                                                        <span className="font-mono">{startDate ? startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '---'}</span>
                                                    </div>
                                                    <div className="text-sm text-gray-500 mt-1">
                                                        Kết thúc : {endDate ? `${endDate.toLocaleDateString('vi-VN')} • ${endDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}` : 'Kết thúc chưa được đặt'}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm text-gray-500">Thời gian</div>
                                                    <div className="font-medium">{duration || '—'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-sm text-gray-600">Không có lịch trình</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <Label className="text-sm font-medium text-gray-700">Lịch trình chi tiết</Label>
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
                    <TabsTrigger value="pricing">Giá & Chỗ</TabsTrigger>
                    <TabsTrigger value="itinerary">Lịch trình</TabsTrigger>
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
                        <div className="col-span-2">
                            <Label>Lịch khởi hành *</Label>

                            <div className="flex items-center space-x-2 mb-2">
                                <Select value={recurrenceMode} onValueChange={(v) => setRecurrenceMode(v as any)} >
                                    <SelectTrigger className="flex-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="single">Chỉ ngày được chọn</SelectItem>
                                        <SelectItem value="weekly">Tạo theo 1 tuần (7 ngày liên tiếp)</SelectItem>
                                        <SelectItem value="monthly">Tạo theo 1 tháng (30 ngày liên tiếp)</SelectItem>
                                        <SelectItem value="weekday_of_month">Chọn 1 ngày trong mỗi tuần của tháng</SelectItem>
                                    </SelectContent>
                                </Select>

                                {recurrenceMode === "weekday_of_month" && (
                                    <Select value={String(recurrenceWeekday)} onValueChange={(v) => setRecurrenceWeekday(parseInt(v, 10))}>
                                        <SelectTrigger className="w-40">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Thứ 2</SelectItem>
                                            <SelectItem value="2">Thứ 3</SelectItem>
                                            <SelectItem value="3">Thứ 4</SelectItem>
                                            <SelectItem value="4">Thứ 5</SelectItem>
                                            <SelectItem value="5">Thứ 6</SelectItem>
                                            <SelectItem value="6">Thứ 7</SelectItem>
                                            <SelectItem value="0">Chủ nhật</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}

                                <div className="flex items-center space-x-2">
                                    <Button onClick={applyRecurrence}>Áp dụng</Button>
                                    {recurrenceApplied && (
                                        <Button
                                            onClick={handleResetSchedule}
                                            className="bg-primary-100 text-red-600 hover:bg-red-100 hover:text-red-700 flex items-center gap-1 text-1 text-sm"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                            Clear
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="mt-2 space-y-2">
                                {(formData.startDates && formData.startDates.length ? formData.startDates : [formData.startDate || ""]).map((d, idx) => {
                                    const endVal = (formData.endDates && formData.endDates[idx]) || "";
                                    return (
                                        <div key={idx} className="flex items-center space-x-2">
                                            <div className="flex-1">
                                                <Label className="text-xs">Bắt đầu #{idx + 1}</Label>
                                                <Input
                                                    type="datetime-local"
                                                    value={d || ""}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        const starts = Array.isArray(formData.startDates) ? formData.startDates.slice() : [];
                                                        if (idx >= starts.length) starts.push(val); else starts[idx] = val;
                                                        handleFormChange('startDates' as any, starts);
                                                        if (idx === 0) handleFormChange('startDate', val);

                                                        const ends = Array.isArray(formData.endDates) ? formData.endDates.slice() : [];
                                                        if (!ends[idx]) {
                                                            let defaultEnd = "";
                                                            const firstStart = (formData.startDates && formData.startDates[0]) || formData.startDate;
                                                            const firstEnd = (formData.endDates && formData.endDates[0]) || formData.endDate;
                                                            if (firstStart && firstEnd) {
                                                                const baseStart = parseLocalInput(firstStart);
                                                                const baseEnd = parseLocalInput(firstEnd);
                                                                if (baseStart && baseEnd) {
                                                                    const delta = baseEnd.getTime() - baseStart.getTime();
                                                                    const thisStart = parseLocalInput(val) || parseLocalInput(firstStart);
                                                                    if (thisStart) defaultEnd = toLocalInput(new Date(thisStart.getTime() + delta));
                                                                }
                                                            }
                                                            if (!defaultEnd) {
                                                                const thisStart = parseLocalInput(val);
                                                                defaultEnd = thisStart ? toLocalInput(new Date(thisStart.getTime() + 6 * 3600000)) : "";
                                                            }
                                                            ends[idx] = defaultEnd;
                                                            handleFormChange('endDates' as any, ends);
                                                            if (idx === 0) handleFormChange('endDate', ends[0] || "");
                                                        }
                                                    }}
                                                    min={isoLocalNow()}
                                                    className={`w-full ${formErrors[`startDates_${idx}`] ? "border-red-500" : ""}`}


                                                />
                                            </div>

                                            <div className="flex-1">
                                                <Label className="text-xs">Kết thúc #{idx + 1}</Label>
                                                <Input
                                                    type="datetime-local"
                                                    value={endVal || ""}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        const ends = Array.isArray(formData.endDates) ? formData.endDates.slice() : [];
                                                        if (idx >= ends.length) ends.push(val); else ends[idx] = val;
                                                        handleFormChange('endDates' as any, ends);
                                                        if (idx === 0) handleFormChange('endDate', val);

                                                        const firstStart = (formData.startDates && formData.startDates.length) ? formData.startDates[0] : formData.startDate;
                                                        const firstEnd = (ends && ends.length) ? ends[0] : formData.endDate;
                                                        if (firstStart && firstEnd) {
                                                            const duration = calculateDuration(firstStart, firstEnd);
                                                            if (duration) handleFormChange('duration', duration);
                                                        }
                                                    }}
                                                    min={(formData.startDates && formData.startDates.length && formData.startDates[idx]) ? formData.startDates[idx] : isoLocalNow()}
                                                    className={formErrors[`endDates_${idx}`] ? "border-red-500" : ""}
                                                />
                                            </div>

                                            <div className="flex items-end" style={{ marginTop: 'auto' }}>
                                                <Button variant="outline" onClick={() => {
                                                    const starts = Array.isArray(formData.startDates) ? formData.startDates.slice() : [];
                                                    const ends = Array.isArray(formData.endDates) ? formData.endDates.slice() : [];
                                                    if (!starts.length && formData.startDate) starts.push(formData.startDate);
                                                    starts.splice(idx, 1);
                                                    ends.splice(idx, 1);
                                                    handleFormChange('startDates' as any, starts);
                                                    handleFormChange('endDates' as any, ends);
                                                    handleFormChange('startDate', (starts[0] || ""));
                                                    handleFormChange('endDate', (ends[0] || ""));
                                                }}>Xóa</Button>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div>
                                    <Button variant="ghost" onClick={() => {
                                        const starts = Array.isArray(formData.startDates) ? formData.startDates.slice() : [];
                                        const ends = Array.isArray(formData.endDates) ? formData.endDates.slice() : [];
                                        const newStart = "";
                                        starts.push(newStart);
                                        let newEnd = "";
                                        const firstStart = (formData.startDates && formData.startDates[0]) || formData.startDate;
                                        const firstEnd = (formData.endDates && formData.endDates[0]) || formData.endDate;
                                        if (newStart && firstStart && firstEnd) {
                                            const baseStart = parseLocalInput(firstStart);
                                            const baseEnd = parseLocalInput(firstEnd);
                                            if (baseStart && baseEnd) {
                                                const delta = baseEnd.getTime() - baseStart.getTime();
                                                const thisStart = parseLocalInput(newStart);
                                                if (thisStart) newEnd = toLocalInput(new Date(thisStart.getTime() + delta));
                                            }
                                        }
                                        ends.push(newEnd);
                                        handleFormChange('startDates' as any, starts);
                                        handleFormChange('endDates' as any, ends);
                                        if (starts.length === 1 && starts[0]) handleFormChange('startDate', starts[0]);
                                        if (ends.length === 1 && ends[0]) handleFormChange('endDate', ends[0]);
                                    }}>Thêm ngày khởi hành</Button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="duration" className="mt-2 block">Thời lượng </Label>
                            <Input
                                id="duration"
                                value={formData.duration}
                                onChange={(e) => handleFormChange("duration", e.target.value)}
                                placeholder="3 ngày 2 đêm"
                                readOnly
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
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
                            <Label htmlFor="priceChild">Giá trẻ em (≥5 tuổi)</Label>
                            <Input
                                id="priceChild"
                                type="number"
                                value={formData.priceChild || ""}
                                onChange={(e) => handleFormChange("priceChild", parseInt(e.target.value) || 0)}
                                placeholder="2800000"
                                className={formErrors.priceChild ? "border-red-500" : ""}
                            />
                            {formErrors.priceChild && (
                                <p className="text-sm text-red-500 mt-1">{formErrors.priceChild}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="priceBaby">Giá em bé (&lt;5 tuổi)</Label>
                            <Input
                                id="priceBaby"
                                type="number"

                                value={formData.priceBaby || ""}
                                onChange={(e) => handleFormChange("priceBaby", parseInt(e.target.value) || 0)}
                                placeholder="1000000"
                                className={formErrors.priceBaby ? "border-red-500" : ""}
                            />
                            {formErrors.priceBaby && (
                                <p className="text-sm text-red-500 mt-1">{formErrors.priceBaby}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="seatsTotal">Số chỗ tối đa *</Label>
                            <Input
                                id="seatsTotal"
                                type="number"
                                value={formData.seatsTotal || ""}
                                onChange={(e) => handleFormChange("seatsTotal", parseInt(e.target.value) || 1)}
                                placeholder="30"
                                className={formErrors.seatsTotal ? "border-red-500" : ""}
                            />
                            {formErrors.seatsTotal && (
                                <p className="text-sm text-red-500 mt-1">{formErrors.seatsTotal}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="minBooking">Số booking tối thiểu *</Label>
                            <Input
                                id="minBooking"
                                type="number"
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
                <TabsContent value="itinerary" className="space-y-4 mt-6">
                    <div className="space-y-4 mb-16">
                        <Label className="text-xl font-semibold text-gray-900" htmlFor="description">Mô tả chi tiết</Label>
                        <JoditEditorWrapper
                            value={formData.description}
                            onChange={(newContent) => handleFormChange("description", newContent)}
                            placeholder="Mô tả chi tiết ngày này"
                        />
                    </div>

                    <Separator />
                    {/* NOTE: show mapping info if we can/can't derive number of days */}
                    {(() => {
                        const expected = getExpectedItineraryDays();
                        if (expected === 0) {
                            return (
                                <div className="text-sm text-gray-500 mb-2">
                                    Không thể tự động xác định số ngày cho lịch trình chi tiết.
                                    Vui lòng đảm bảo đã đặt Ngày bắt đầu & Ngày kết thúc cho chuyến đầu tiên
                                    hoặc có trường Thời lượng hợp lệ để hệ thống tự map số ngày.
                                </div>
                            );
                        }
                        if (formData.itinerary.length !== expected) {
                            return (
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm text-yellow-600">
                                        Số ngày lịch trình hiện tại: {formData.itinerary.length} — mong đợi theo thời lượng: {expected} ngày.
                                    </p>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                const nextIt = ensureItineraryLength(expected, formData.itinerary || []);
                                                handleFormChange("itinerary", nextIt);
                                            }}
                                        >
                                            Đồng bộ với thời lượng
                                        </Button>
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    })()}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-xl font-semibold text-gray-900">Lịch trình chi tiết <span className="text-gray-500">{formData.itinerary.length} ngày theo thời lượng tour </span></Label>
                            {/* <Button onClick={addItineraryDay} size="sm">
                                 <Plus className="w-4 h-4 mr-2" />
                                 Thêm ngày
                             </Button> */}
                        </div>
                        {formData.itinerary.map((day, index) => (
                            <div key={index} className="border rounded-lg p-4 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-medium">Ngày {day.dayNumber}</h4>
                                    <div className="flex space-x-2">
                                        {/* <Button
                                             variant="outline"
                                             size="sm"
                                             onClick={() => duplicateItineraryDay(index)}
                                         >
                                             <Copy className="w-4 h-4 mr-2" />
                                             Sao chép
                                         </Button> */}
                                        {/* <Button
                                             variant="destructive"
                                             size="sm"
                                             onClick={() => removeItineraryDay(index)}
                                         >
                                             <Trash2 className="w-4 h-4 mr-2" />
                                             Xóa
                                         </Button> */}
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor={`itinerary-title-${index}`}>Tiêu đề</Label>
                                    <Input
                                        id={`itinerary-title-${index}`}
                                        value={day.title}
                                        onChange={(e) => updateItineraryDay(index, "title", e.target.value)}
                                        placeholder="Ví dụ: Khám phá hang Sửng Sốt"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor={`itinerary-details-${index}`}>Chi tiết</Label>
                                    <JoditEditorWrapper
                                        value={day.details}
                                        onChange={(newContent) => updateItineraryDay(index, "details", newContent)}
                                        placeholder="Mô tả chi tiết ngày này"
                                    />
                                </div>
                            </div>
                        ))}
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
                // extraActions={
                //     modalMode !== "view"
                //         ? [
                //             {
                //                 text: "Lưu nháp",
                //                 onClick: handleSaveDraft,
                //                 variant: "outline" as const,
                //                 icon: <Save className="w-4 h-4 mr-2" />,
                //             },
                //             {
                //                 text: "Xem trước",
                //                 onClick: handlePreview,
                //                 variant: "outline" as const,
                //                 icon: <ExternalLink className="w-4 h-4 mr-2" />,
                //             },
                //         ]
                //         : undefined
                // }
            >
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