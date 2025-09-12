"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, Edit, Eye, Trash2, ThumbsUp, MessageSquare, Image, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { DataTable, Column } from "../../components/DataTable";
import { ModalForm } from "../../components/ModalForm";
import { ConfirmModal } from "../../components/ConfirmModal";
import { useToast } from "../../components/ui/use-toast";

interface Review {
    id: string;
    customerId: string;
    customerName: string;
    customerAvatar?: string;
    serviceId: string;
    serviceName: string;
    serviceType: "tour" | "flight" | "bus";
    rating: number;
    title: string;
    content: string;
    images: string[];
    status: "pending" | "approved" | "rejected";
    isHelpful: boolean;
    helpfulCount: number;
    replyText?: string;
    repliedBy?: string;
    repliedAt?: string;
    createdAt: string;
    updatedAt: string;
}

interface ReviewFilters {
    status: string;
    serviceType: string;
    rating: string;
}

const serviceTypes = [
    { value: "tour", label: "Tour du lịch" },
    { value: "flight", label: "Vé máy bay" },
    { value: "bus", label: "Vé xe khách" },
];

const ratingOptions = [
    { value: "5", label: "5 sao" },
    { value: "4", label: "4 sao" },
    { value: "3", label: "3 sao" },
    { value: "2", label: "2 sao" },
    { value: "1", label: "1 sao" },
];

const mockReviews: Review[] = [
    {
        id: "review_001",
        customerId: "cust_001",
        customerName: "Nguyễn Văn An",
        customerAvatar: "https://example.com/avatars/an.jpg",
        serviceId: "tour_001",
        serviceName: "Tour Đà Lạt 3N2Đ",
        serviceType: "tour",
        rating: 5,
        title: "Chuyến đi tuyệt vời",
        content: "Hướng dẫn viên nhiệt tình, cảnh đẹp, dịch vụ tốt. Rất đáng tiền!",
        images: ["https://example.com/images/dalat1.jpg", "https://example.com/images/dalat2.jpg"],
        status: "approved",
        isHelpful: true,
        helpfulCount: 25,
        replyText: "Cảm ơn bạn đã đánh giá! Rất mong được phục vụ bạn lần nữa.",
        repliedBy: "Admin",
        repliedAt: "2025-09-01T10:00:00.000Z",
        createdAt: "2025-08-30T09:00:00.000Z",
        updatedAt: "2025-09-01T10:00:00.000Z",
    },
    {
        id: "review_002",
        customerId: "cust_002",
        customerName: "Trần Thị Bình",
        customerAvatar: "",
        serviceId: "flight_001",
        serviceName: "Vé máy bay SGN-HAN",
        serviceType: "flight",
        rating: 4,
        title: "Chuyến bay ổn",
        content: "Chuyến bay đúng giờ, nhân viên thân thiện, nhưng ghế hơi chật.",
        images: [],
        status: "pending",
        isHelpful: false,
        helpfulCount: 10,
        createdAt: "2025-09-02T14:30:00.000Z",
        updatedAt: "2025-09-02T14:30:00.000Z",
    },
    {
        id: "review_003",
        customerId: "cust_003",
        customerName: "Lê Minh Châu",
        customerAvatar: "https://example.com/avatars/chau.jpg",
        serviceId: "bus_001",
        serviceName: "Vé xe Sài Gòn - Nha Trang",
        serviceType: "bus",
        rating: 3,
        title: "Bình thường",
        content: "Xe sạch sẽ nhưng tài xế chạy hơi nhanh, cần cải thiện.",
        images: ["https://example.com/images/bus1.jpg"],
        status: "rejected",
        isHelpful: false,
        helpfulCount: 5,
        createdAt: "2025-08-25T08:00:00.000Z",
        updatedAt: "2025-08-26T09:00:00.000Z",
    },
    {
        id: "review_004",
        customerId: "cust_004",
        customerName: "Phạm Quốc Dũng",
        customerAvatar: "",
        serviceId: "tour_002",
        serviceName: "Tour Phú Quốc 4N3Đ",
        serviceType: "tour",
        rating: 5,
        title: "Kỳ nghỉ tuyệt vời",
        content: "Bãi biển đẹp, khách sạn sang trọng, tổ chức rất chuyên nghiệp.",
        images: ["https://example.com/images/phuquoc1.jpg"],
        status: "approved",
        isHelpful: true,
        helpfulCount: 30,
        createdAt: "2025-09-05T11:00:00.000Z",
        updatedAt: "2025-09-05T11:00:00.000Z",
    },
    {
        id: "review_005",
        customerId: "cust_005",
        customerName: "Hoàng Thị Mai",
        customerAvatar: "https://example.com/avatars/mai.jpg",
        serviceId: "flight_002",
        serviceName: "Vé máy bay HAN-DAD",
        serviceType: "flight",
        rating: 2,
        title: "Không hài lòng",
        content: "Chuyến bay bị delay 2 tiếng, không được thông báo trước.",
        images: [],
        status: "pending",
        isHelpful: false,
        helpfulCount: 3,
        createdAt: "2025-09-07T15:00:00.000Z",
        updatedAt: "2025-09-07T15:00:00.000Z",
    },
    {
        id: "review_006",
        customerId: "cust_006",
        customerName: "Đỗ Văn Hùng",
        customerAvatar: "",
        serviceId: "bus_002",
        serviceName: "Vé xe Đà Lạt - Sài Gòn",
        serviceType: "bus",
        rating: 4,
        title: "Chuyến đi tốt",
        content: "Xe thoải mái, đúng giờ, nhưng wifi trên xe không ổn định.",
        images: [],
        status: "approved",
        isHelpful: true,
        helpfulCount: 15,
        replyText: "Cảm ơn bạn đã phản hồi. Chúng tôi sẽ cải thiện wifi trong thời gian tới.",
        repliedBy: "Admin",
        repliedAt: "2025-09-03T12:00:00.000Z",
        createdAt: "2025-09-02T10:00:00.000Z",
        updatedAt: "2025-09-03T12:00:00.000Z",
    },
    {
        id: "review_007",
        customerId: "cust_007",
        customerName: "Vũ Thị Lan",
        customerAvatar: "https://example.com/avatars/lan.jpg",
        serviceId: "tour_003",
        serviceName: "Tour Hà Giang 5N4Đ",
        serviceType: "tour",
        rating: 5,
        title: "Trải nghiệm đáng nhớ",
        content: "Cảnh quan hùng vĩ, tổ chức tốt, đồ ăn địa phương ngon.",
        images: ["https://example.com/images/hagiang1.jpg", "https://example.com/images/hagiang2.jpg"],
        status: "pending",
        isHelpful: false,
        helpfulCount: 8,
        createdAt: "2025-09-08T09:00:00.000Z",
        updatedAt: "2025-09-08T09:00:00.000Z",
    },
    {
        id: "review_008",
        customerId: "cust_008",
        customerName: "Ngô Minh Tuấn",
        customerAvatar: "",
        serviceId: "flight_003",
        serviceName: "Vé máy bay SGN-PQC",
        serviceType: "flight",
        rating: 3,
        title: "Tạm được",
        content: "Dịch vụ ổn, nhưng quy trình check-in hơi chậm.",
        images: [],
        status: "rejected",
        isHelpful: false,
        helpfulCount: 2,
        createdAt: "2025-09-01T16:00:00.000Z",
        updatedAt: "2025-09-02T10:00:00.000Z",
    },
    {
        id: "review_009",
        customerId: "cust_009",
        customerName: "Bùi Thị Hương",
        customerAvatar: "https://example.com/avatars/huong.jpg",
        serviceId: "bus_003",
        serviceName: "Vé xe Hà Nội - Hải Phòng",
        serviceType: "bus",
        rating: 4,
        title: "Dịch vụ tốt",
        content: "Xe mới, sạch sẽ, tài xế thân thiện. Sẽ sử dụng lại.",
        images: [],
        status: "approved",
        isHelpful: true,
        helpfulCount: 20,
        createdAt: "2025-09-04T13:00:00.000Z",
        updatedAt: "2025-09-04T13:00:00.000Z",
    },
    {
        id: "review_010",
        customerId: "cust_010",
        customerName: "Trương Văn Nam",
        customerAvatar: "",
        serviceId: "tour_004",
        serviceName: "Tour Côn Đảo 3N2Đ",
        serviceType: "tour",
        rating: 1,
        title: "Không như kỳ vọng",
        content: "Lịch trình không rõ ràng, dịch vụ khách sạn kém.",
        images: ["https://example.com/images/condao1.jpg"],
        status: "pending",
        isHelpful: false,
        helpfulCount: 1,
        createdAt: "2025-09-09T11:00:00.000Z",
        updatedAt: "2025-09-09T11:00:00.000Z",
    },
];

export default function Reviews() {
    const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState<ReviewFilters>({
        status: "all",
        serviceType: "all",
        rating: "all",
    });
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("view");
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [replyModalOpen, setReplyModalOpen] = useState(false);
    const [replyText, setReplyText] = useState("");

    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
    });

    // Fetch reviews with mock data
    const { data: reviewsData, isLoading, error, refetch } = useQuery({
        queryKey: ["reviews", pagination.current, pagination.pageSize, searchQuery, filters],
        queryFn: async () => {
            const filteredReviews = mockReviews.filter((review) => {
                const matchesSearch =
                    review.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    review.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    review.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    review.serviceName.toLowerCase().includes(searchQuery.toLowerCase());

                const matchesStatus = filters.status === "all" || review.status === filters.status;
                const matchesServiceType = filters.serviceType === "all" || review.serviceType === filters.serviceType;
                const matchesRating = filters.rating === "all" || review.rating.toString() === filters.rating;

                return matchesSearch && matchesStatus && matchesServiceType && matchesRating;
            });

            const start = (pagination.current - 1) * pagination.pageSize;
            const end = start + pagination.pageSize;
            const paginatedReviews = filteredReviews.slice(start, end);

            return {
                data: paginatedReviews,
                pagination: {
                    total: filteredReviews.length,
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                },
            };
        },
    });

    // Approve review mutation
    const approveReviewMutation = useMutation({
        mutationFn: async (id: string) => {
            const index = mockReviews.findIndex((review) => review.id === id);
            if (index === -1) throw new Error("Review not found");

            mockReviews[index] = {
                ...mockReviews[index],
                status: "approved",
                updatedAt: new Date().toISOString(),
            };
            return mockReviews[index];
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reviews"] });
            toast({
                title: "Duyệt đánh giá thành công",
                description: "Đánh giá đã được phê duyệt và hiển thị công khai",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Lỗi khi duyệt đánh giá",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    // Reject review mutation
    const rejectReviewMutation = useMutation({
        mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
            const index = mockReviews.findIndex((review) => review.id === id);
            if (index === -1) throw new Error("Review not found");

            mockReviews[index] = {
                ...mockReviews[index],
                status: "rejected",
                updatedAt: new Date().toISOString(),
            };
            return mockReviews[index];
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reviews"] });
            setRejectModalOpen(false);
            setRejectReason("");
            toast({
                title: "Từ chối đánh giá thành công",
                description: "Đánh giá đã bị từ chối",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Lỗi khi từ chối đánh giá",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    // Reply to review mutation
    const replyReviewMutation = useMutation({
        mutationFn: async ({ id, replyText }: { id: string; replyText: string }) => {
            const index = mockReviews.findIndex((review) => review.id === id);
            if (index === -1) throw new Error("Review not found");

            mockReviews[index] = {
                ...mockReviews[index],
                replyText,
                repliedBy: "Admin",
                repliedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            return mockReviews[index];
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reviews"] });
            setReplyModalOpen(false);
            setReplyText("");
            toast({
                title: "Trả lời đánh giá thành công",
                description: "Phản hồi đã được gửi tới khách hàng",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Lỗi khi trả lời đánh giá",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    // Delete review mutation
    const deleteReviewMutation = useMutation({
        mutationFn: async (id: string) => {
            const index = mockReviews.findIndex((review) => review.id === id);
            if (index === -1) throw new Error("Review not found");

            const deletedReview = mockReviews.splice(index, 1)[0];
            return deletedReview;
        },
        onSuccess: (_, reviewId) => {
            queryClient.invalidateQueries({ queryKey: ["reviews"] });
            setDeleteModalOpen(false);
            setReviewToDelete(null);

            const review = reviewsData?.data?.find((r: Review) => r.id === reviewId);
            toast({
                title: "Đã xóa đánh giá",
                description: `Đánh giá của ${review?.customerName} đã được xóa`,
                action: (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            toast({
                                title: "Khôi phục thành công",
                                description: "Đánh giá đã được khôi phục",
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
                title: "Lỗi khi xóa đánh giá",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    // Bulk operations mutation
    const bulkActionMutation = useMutation({
        mutationFn: async ({ action, ids }: { action: string; ids: string[] }) => {
            ids.forEach((id) => {
                const index = mockReviews.findIndex((review) => review.id === id);
                if (index === -1) throw new Error(`Review ${id} not found`);

                if (action === "approve") {
                    mockReviews[index].status = "approved";
                    mockReviews[index].updatedAt = new Date().toISOString();
                } else if (action === "reject") {
                    mockReviews[index].status = "rejected";
                    mockReviews[index].updatedAt = new Date().toISOString();
                } else if (action === "delete") {
                    mockReviews.splice(index, 1);
                }
            });
            return { action, ids };
        },
        onSuccess: (_, { action, ids }) => {
            queryClient.invalidateQueries({ queryKey: ["reviews"] });
            setSelectedReviews([]);
            const actionText = action === "approve" ? "duyệt" : action === "reject" ? "từ chối" : "xóa";
            toast({
                title: `Thực hiện thành công`,
                description: `Đã ${actionText} ${ids.length} đánh giá`,
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

    const reviews = reviewsData?.data || [];
    const total = reviewsData?.pagination?.total || 0;

    const renderStarRating = (rating: number, size: "sm" | "lg" = "sm") => {
        const stars = [];
        const starSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";

        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    className={`${starSize} ${i <= rating ? "text-yellow-500 fill-current" : "text-gray-300"}`}
                />
            );
        }
        return <div className="flex">{stars}</div>;
    };

    const columns: Column[] = [
        {
            key: "customer",
            title: "Khách hàng",
            render: (_, record: Review) => (
                <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                        <AvatarImage src={record.customerAvatar} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                            {record.customerName.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-medium">{record.customerName}</div>
                        <div className="text-sm text-gray-500">ID: {record.customerId}</div>
                    </div>
                </div>
            ),
        },
        {
            key: "service",
            title: "Dịch vụ",
            render: (_, record: Review) => (
                <div>
                    <div className="font-medium">{record.serviceName}</div>
                    <Badge variant="outline" className="text-xs">
                        {serviceTypes.find((t) => t.value === record.serviceType)?.label}
                    </Badge>
                </div>
            ),
        },
        {
            key: "rating",
            title: "Đánh giá",
            sortable: true,
            render: (value, record: Review) => (
                <div>
                    {renderStarRating(value)}
                    <div className="text-sm text-gray-500 mt-1">{value}/5 sao</div>
                </div>
            ),
        },
        {
            key: "content",
            title: "Nội dung",
            render: (_, record: Review) => (
                <div className="max-w-xs">
                    <div className="font-medium text-sm">{record.title}</div>
                    <div className="text-sm text-gray-600 truncate">{record.content}</div>
                    {record.images.length > 0 && (
                        <div className="flex items-center mt-1">
                            <Image className="w-3 h-3 mr-1" />
                            <span className="text-xs text-gray-500">{record.images.length} ảnh</span>
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: "helpful",
            title: "Hữu ích",
            render: (_, record: Review) => (
                <div className="flex items-center space-x-1">
                    <ThumbsUp className="w-3 h-3 text-green-500" />
                    <span className="text-sm">{record.helpfulCount}</span>
                </div>
            ),
        },
        {
            key: "status",
            title: "Trạng thái",
            sortable: true,
            render: (value, record: Review) => (
                <div className="space-y-1">
                    <Badge
                        className={
                            value === "approved"
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : value === "rejected"
                                    ? "bg-red-100 text-red-800 hover:bg-red-100"
                                    : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                        }
                    >
                        {value === "approved" ? "Đã duyệt" : value === "rejected" ? "Từ chối" : "Chờ duyệt"}
                    </Badge>
                    {record.replyText && (
                        <Badge variant="outline" className="text-xs">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Đã trả lời
                        </Badge>
                    )}
                </div>
            ),
        },
        {
            key: "createdAt",
            title: "Ngày tạo",
            sortable: true,
            render: (value) => (
                <div className="text-sm">
                    <div>{new Date(value).toLocaleDateString("vi-VN")}</div>
                    <div className="text-gray-500">
                        {new Date(value).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                </div>
            ),
        },
    ];

    const handleView = (review: Review) => {
        setSelectedReview(review);
        setModalMode("view");
        setModalOpen(true);
    };

    const handleApprove = (review: Review) => {
        approveReviewMutation.mutate(review.id);
    };

    const handleReject = (review: Review) => {
        setSelectedReview(review);
        setRejectModalOpen(true);
    };

    const handleReply = (review: Review) => {
        setSelectedReview(review);
        setReplyText(review.replyText || "");
        setReplyModalOpen(true);
    };

    const handleDelete = (review: Review) => {
        setReviewToDelete(review);
        setDeleteModalOpen(true);
    };

    const confirmReject = () => {
        if (selectedReview && rejectReason.trim()) {
            rejectReviewMutation.mutate({ id: selectedReview.id, reason: rejectReason.trim() });
        }
    };

    const confirmReply = () => {
        if (selectedReview && replyText.trim()) {
            replyReviewMutation.mutate({ id: selectedReview.id, replyText: replyText.trim() });
        }
    };

    const confirmDelete = () => {
        if (reviewToDelete) {
            deleteReviewMutation.mutate(reviewToDelete.id);
        }
    };

    const bulkActions = [
        {
            label: "Duyệt",
            action: (keys: string[]) => {
                bulkActionMutation.mutate({ action: "approve", ids: keys });
            },
            icon: <CheckCircle className="w-4 h-4 mr-2" />,
        },
        {
            label: "Từ chối",
            action: (keys: string[]) => {
                bulkActionMutation.mutate({ action: "reject", ids: keys });
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
            label: "Duyệt",
            action: handleApprove,
            icon: <CheckCircle className="mr-2 h-4 w-4" />,
            condition: (review: Review) => review.status === "pending",
        },
        {
            label: "Từ chối",
            action: handleReject,
            icon: <XCircle className="mr-2 h-4 w-4" />,
            variant: "secondary" as const,
            condition: (review: Review) => review.status === "pending",
        },
        {
            label: "Trả lời",
            action: handleReply,
            icon: <MessageSquare className="mr-2 h-4 w-4" />,
            condition: (review: Review) => review.status === "approved",
        },
        {
            label: "Xóa",
            action: handleDelete,
            icon: <Trash2 className="mr-2 h-4 w-4" />,
            variant: "destructive" as const,
        },
    ];

    const renderReviewDetails = () => {
        if (!selectedReview) return null;

        return (
            <div className="space-y-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12">
                            <AvatarImage src={selectedReview.customerAvatar} />
                            <AvatarFallback className="bg-primary/10 text-primary text-lg">
                                {selectedReview.customerName.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="text-lg font-semibold">{selectedReview.customerName}</h3>
                            <p className="text-gray-500">Đánh giá cho: {selectedReview.serviceName}</p>
                            <Badge variant="outline" className="text-xs mt-1">
                                {serviceTypes.find((t) => t.value === selectedReview.serviceType)?.label}
                            </Badge>
                        </div>
                    </div>
                    <div className="text-right">
                        {renderStarRating(selectedReview.rating, "lg")}
                        <p className="text-sm text-gray-500 mt-1">
                            {new Date(selectedReview.createdAt).toLocaleDateString("vi-VN")}
                        </p>
                    </div>
                </div>

                <div>
                    <h4 className="font-medium text-lg mb-2">{selectedReview.title}</h4>
                    <p className="text-gray-900 leading-relaxed">{selectedReview.content}</p>
                </div>

                {selectedReview.images.length > 0 && (
                    <div>
                        <Label className="text-sm font-medium text-gray-700">Hình ảnh đính kèm</Label>
                        <div className="mt-2 grid grid-cols-3 gap-4">
                            {selectedReview.images.map((image, index) => (
                                <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                    <img
                                        src={image}
                                        alt={`Review image ${index + 1}`}
                                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                                        onClick={() => window.open(image, "_blank")}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <ThumbsUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{selectedReview.helpfulCount} người thấy hữu ích</span>
                    </div>
                    {selectedReview.isHelpful && (
                        <Badge variant="outline" className="text-green-600">
                            Đánh giá hữu ích
                        </Badge>
                    )}
                </div>

                {selectedReview.replyText && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-medium text-blue-800">Phản hồi từ {selectedReview.repliedBy}</Label>
                            <span className="text-xs text-blue-600">
                                {selectedReview.repliedAt && new Date(selectedReview.repliedAt).toLocaleString("vi-VN")}
                            </span>
                        </div>
                        <p className="text-blue-900">{selectedReview.replyText}</p>
                    </div>
                )}

                <div className="flex space-x-2 pt-4 border-t">
                    {selectedReview.status === "pending" && (
                        <>
                            <Button size="sm" onClick={() => handleApprove(selectedReview)}>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Duyệt
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleReject(selectedReview)}>
                                <XCircle className="w-4 h-4 mr-2" />
                                Từ chối
                            </Button>
                        </>
                    )}
                    {selectedReview.status === "approved" && (
                        <Button size="sm" variant="outline" onClick={() => handleReply(selectedReview)}>
                            <MessageSquare className="w-4 h-4 mr-2" />
                            {selectedReview.replyText ? "Sửa phản hồi" : "Trả lời"}
                        </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => handleDelete(selectedReview)}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Xóa
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 space-y-6 bg-gray-50">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý đánh giá</h1>
                    <p className="text-gray-600 mt-1">Quản lý đánh giá, bình luận của khách hàng</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                        Làm mới
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Tổng đánh giá</p>
                                <p className="text-2xl font-bold">{total || 0}</p>
                            </div>
                            <Star className="w-8 h-8 text-primary" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Chờ duyệt</p>
                                <p className="text-2xl font-bold">{reviews.filter((r: Review) => r.status === "pending").length}</p>
                            </div>
                            <MessageSquare className="w-8 h-8 text-yellow-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Đã duyệt</p>
                                <p className="text-2xl font-bold">{reviews.filter((r: Review) => r.status === "approved").length}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Điểm TB</p>
                                <p className="text-2xl font-bold">
                                    {reviews.length > 0
                                        ? (reviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / reviews.length).toFixed(1)
                                        : "0.0"}
                                </p>
                            </div>
                            <Star className="w-8 h-8 text-yellow-500 fill-current" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Danh sách đánh giá</CardTitle>
                            <CardDescription>Quản lý và kiểm duyệt đánh giá của khách hàng</CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Select value={filters.status} onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}>
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    <SelectItem value="pending">Chờ duyệt</SelectItem>
                                    <SelectItem value="approved">Đã duyệt</SelectItem>
                                    <SelectItem value="rejected">Từ chối</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select
                                value={filters.serviceType}
                                onValueChange={(value) => setFilters((prev) => ({ ...prev, serviceType: value }))}
                            >
                                <SelectTrigger className="w-36">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả dịch vụ</SelectItem>
                                    {serviceTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={filters.rating} onValueChange={(value) => setFilters((prev) => ({ ...prev, rating: value }))}>
                                <SelectTrigger className="w-24">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    {ratingOptions.map((rating) => (
                                        <SelectItem key={rating.value} value={rating.value}>
                                            {rating.label}
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
                        data={reviews}
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: total,
                        }}
                        onPaginationChange={(page, pageSize) => setPagination({ current: page, pageSize })}
                        onSearch={setSearchQuery}
                        rowSelection={{
                            selectedRowKeys: selectedReviews,
                            onChange: setSelectedReviews,
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
                onOpenChange={setModalOpen}
                title="Chi tiết đánh giá"
                description="Xem thông tin chi tiết và quản lý đánh giá"
                mode="view"
                size="medium"
            >
                {renderReviewDetails()}
            </ModalForm>

            <ModalForm
                open={rejectModalOpen}
                onOpenChange={setRejectModalOpen}
                title="Từ chối đánh giá"
                description="Nhập lý do từ chối đánh giá này"
                mode="edit"
                size="medium"
                onSubmit={confirmReject}
                submitText="Từ chối"
                submitDisabled={!rejectReason.trim()}
            >
                <div>
                    <Label htmlFor="rejectReason">Lý do từ chối *</Label>
                    <Textarea
                        id="rejectReason"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Nhập lý do từ chối đánh giá..."
                        rows={4}
                    />
                </div>
            </ModalForm>

            <ModalForm
                open={replyModalOpen}
                onOpenChange={setReplyModalOpen}
                title={selectedReview?.replyText ? "Sửa phản hồi" : "Trả lời đánh giá"}
                description="Viết phản hồi cho đánh giá của khách hàng"
                mode="edit"
                size="medium"
                onSubmit={confirmReply}
                submitText={selectedReview?.replyText ? "Cập nhật" : "Gửi phản hồi"}
                submitDisabled={!replyText.trim()}
            >
                <div>
                    <Label htmlFor="replyText">Nội dung phản hồi *</Label>
                    <Textarea
                        id="replyText"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Cảm ơn bạn đã đánh giá. Chúng tôi rất vui vì..."
                        rows={4}
                    />
                    <p className="text-xs text-gray-500 mt-1">Phản hồi sẽ được hiển thị công khai cùng với đánh giá</p>
                </div>
            </ModalForm>

            <ConfirmModal
                open={deleteModalOpen}
                onOpenChange={setDeleteModalOpen}
                title="Xóa đánh giá"
                message={`Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác.`}
                type="danger"
                requireTyping={false}
                onConfirm={confirmDelete}
                confirmText="Xóa đánh giá"
                loading={deleteReviewMutation.isPending}
            />
        </div>
    );
}