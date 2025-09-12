"use client"
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    MessageSquare, Plus, Eye, MessageCircle, Clock, CheckCircle, AlertCircle,
    User, Calendar, Filter, Search, Tag, Send, Paperclip, Star
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { Separator } from "../../components/ui/separator";
import { DataTable, Column } from "../../components/DataTable";
import { ModalForm } from "../../components/ModalForm";
import { ConfirmModal } from "../../components/ConfirmModal";
import { useToast } from "../../components/ui/use-toast";

interface SupportTicket {
    id: string;
    title: string;
    content: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerAvatar?: string;
    category: "technical" | "billing" | "account" | "general" | "complaint";
    priority: "low" | "medium" | "high" | "urgent";
    status: "new" | "open" | "pending" | "resolved" | "closed";
    assignedTo?: string;
    assignedToName?: string;
    createdAt: string;
    updatedAt: string;
    closedAt?: string;
    tags: string[];
    attachments: string[];
    responses: TicketResponse[];
    satisfaction?: 1 | 2 | 3 | 4 | 5;
    orderId?: string;
    serviceType?: "flight" | "bus" | "tour";
}

interface TicketResponse {
    id: string;
    content: string;
    isInternal: boolean;
    authorId: string;
    authorName: string;
    authorType: "customer" | "admin";
    createdAt: string;
    attachments: string[];
}

interface TicketFormData {
    title: string;
    content: string;
    customerId?: string;
    category: "technical" | "billing" | "account" | "general" | "complaint";
    priority: "low" | "medium" | "high" | "urgent";
    assignedTo?: string;
    tags: string[];
    isInternal?: boolean;
}

interface TicketFilters {
    status: string;
    priority: string;
    category: string;
    assignedTo: string;
    dateRange?: [string, string];
}

const Support: React.FC = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [editTicket, setEditTicket] = useState<SupportTicket | null>(null);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [filters, setFilters] = useState<TicketFilters>({
        status: "all",
        priority: "all",
        category: "all",
        assignedTo: "all"
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [responseContent, setResponseContent] = useState("");
    const [isInternal, setIsInternal] = useState(false);

    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch tickets
    const { data: tickets = [], isLoading } = useQuery({
        queryKey: ['tickets', filters, searchTerm],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters.status !== 'all') params.append('status', filters.status);
            if (filters.priority !== 'all') params.append('priority', filters.priority);
            if (filters.category !== 'all') params.append('category', filters.category);
            if (filters.assignedTo !== 'all') params.append('assignedTo', filters.assignedTo);
            if (searchTerm) params.append('search', searchTerm);

            const response = await fetch(`/api/admin/tickets?${params}`);
            if (!response.ok) throw new Error('Failed to fetch tickets');
            return response.json();
        }
    });

    // Fetch admins for assignment
    const { data: admins = [] } = useQuery({
        queryKey: ['admins'],
        queryFn: async () => {
            const response = await fetch('/api/admin/admins');
            if (!response.ok) throw new Error('Failed to fetch admins');
            return response.json();
        }
    });

    // Fetch customers for ticket creation
    const { data: customers = [] } = useQuery({
        queryKey: ['customers'],
        queryFn: async () => {
            const response = await fetch('/api/admin/customers');
            if (!response.ok) throw new Error('Failed to fetch customers');
            return response.json();
        }
    });

    // Create ticket mutation
    const createTicketMutation = useMutation({
        mutationFn: async (data: TicketFormData) => {
            const response = await fetch('/api/admin/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to create ticket');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            setModalOpen(false);
            resetForm();
            toast({
                title: "Tạo ticket thành công",
                description: "Ticket mới đã được tạo trong hệ thống",
            });
        }
    });

    // Update ticket mutation
    const updateTicketMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<TicketFormData> }) => {
            const response = await fetch(`/api/admin/tickets/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to update ticket');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            setModalOpen(false);
            setEditTicket(null);
            resetForm();
            toast({
                title: "Cập nhật ticket thành công",
                description: "Thông tin ticket đã được cập nhật",
            });
        }
    });

    // Add response mutation
    const addResponseMutation = useMutation({
        mutationFn: async ({ ticketId, content, isInternal }: { ticketId: string; content: string; isInternal: boolean }) => {
            const response = await fetch(`/api/admin/tickets/${ticketId}/responses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, isInternal }),
            });
            if (!response.ok) throw new Error('Failed to add response');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            setResponseContent("");
            setIsInternal(false);
            toast({
                title: "Phản hồi thành công",
                description: "Phản hồi đã được gửi cho khách hàng",
            });
        }
    });

    // Delete ticket mutation
    const deleteTicketMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/admin/tickets/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete ticket');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            setDeleteId(null);
            toast({
                title: "Xóa ticket thành công",
                description: "Ticket đã được xóa khỏi hệ thống",
            });
        }
    });

    const resetForm = () => {
        setEditTicket(null);
    };

    const handleEdit = (ticket: SupportTicket) => {
        setEditTicket(ticket);
        setModalOpen(true);
    };

    const handleView = (ticket: SupportTicket) => {
        setSelectedTicket(ticket);
        setViewModalOpen(true);
    };

    const handleDelete = (id: string) => {
        setDeleteId(id);
    };

    const handleStatusChange = (ticketId: string, status: string) => {
        updateTicketMutation.mutate({
            id: ticketId,
            data: { status: status as any }
        });
    };

    const handleAssignmentChange = (ticketId: string, assignedTo: string) => {
        updateTicketMutation.mutate({
            id: ticketId,
            data: { assignedTo }
        });
    };

    const handleAddResponse = () => {
        if (!selectedTicket || !responseContent.trim()) return;

        addResponseMutation.mutate({
            ticketId: selectedTicket.id,
            content: responseContent.trim(),
            isInternal
        });
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            new: "bg-blue-100 text-blue-800",
            open: "bg-green-100 text-green-800",
            pending: "bg-yellow-100 text-yellow-800",
            resolved: "bg-purple-100 text-purple-800",
            closed: "bg-gray-100 text-gray-800"
        };

        const labels = {
            new: "Mới",
            open: "Đang xử lý",
            pending: "Chờ phản hồi",
            resolved: "Đã giải quyết",
            closed: "Đã đóng"
        };

        return (
            <Badge className={variants[status as keyof typeof variants]}>
                {labels[status as keyof typeof labels]}
            </Badge>
        );
    };

    const getPriorityBadge = (priority: string) => {
        const variants = {
            low: "bg-gray-100 text-gray-800",
            medium: "bg-blue-100 text-blue-800",
            high: "bg-orange-100 text-orange-800",
            urgent: "bg-red-100 text-red-800"
        };

        const labels = {
            low: "Thấp",
            medium: "Trung bình",
            high: "Cao",
            urgent: "Khẩn cấp"
        };

        return (
            <Badge className={variants[priority as keyof typeof variants]}>
                {labels[priority as keyof typeof labels]}
            </Badge>
        );
    };

    const getCategoryLabel = (category: string) => {
        const labels = {
            technical: "Kỹ thuật",
            billing: "Thanh toán",
            account: "Tài khoản",
            general: "Chung",
            complaint: "Khiếu nại"
        };
        return labels[category as keyof typeof labels] || category;
    };

    const columns: Column<SupportTicket>[] = [
        {
            header: "Ticket",
            accessorKey: "title",
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.title}</div>
                    <div className="text-sm text-gray-500">#{row.id}</div>
                </div>
            ),
        },
        {
            header: "Khách hàng",
            accessorKey: "customerName",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={row.customerAvatar} />
                        <AvatarFallback>{row.customerName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-medium">{row.customerName}</div>
                        <div className="text-sm text-gray-500">{row.customerEmail}</div>
                    </div>
                </div>
            ),
        },
        {
            header: "Loại",
            accessorKey: "category",
            cell: ({ row }) => getCategoryLabel(row.category),
        },
        {
            header: "Ưu tiên",
            accessorKey: "priority",
            cell: ({ row }) => getPriorityBadge(row.priority),
        },
        {
            header: "Trạng thái",
            accessorKey: "status",
            cell: ({ row }) => getStatusBadge(row.status),
        },
        {
            header: "Người xử lý",
            accessorKey: "assignedToName",
            cell: ({ row }) => row.assignedToName || "Chưa phân công",
        },
        {
            header: "Ngày tạo",
            accessorKey: "createdAt",
            cell: ({ row }) => new Date(row.createdAt).toLocaleDateString("vi-VN"),
        },
        {
            header: "Thao tác",
            id: "actions",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(row)}
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(row)}
                    >
                        <MessageCircle className="h-4 w-4" />
                    </Button>
                    <Select onValueChange={(value) => handleStatusChange(row.id, value)}>
                        <SelectTrigger className="w-32">
                            <SelectValue placeholder="Trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="new">Mới</SelectItem>
                            <SelectItem value="open">Đang xử lý</SelectItem>
                            <SelectItem value="pending">Chờ phản hồi</SelectItem>
                            <SelectItem value="resolved">Đã giải quyết</SelectItem>
                            <SelectItem value="closed">Đã đóng</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            ),
        },
    ];

    return (
        <div className="p-6 space-y-6 bg-gray-50">

        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Chăm sóc khách hàng</h1>
                    <p className="text-gray-600">Quản lý ticket hỗ trợ khách hàng</p>
                </div>
                <Button onClick={() => setModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo ticket mới
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ticket mới</CardTitle>
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {tickets.filter((t: SupportTicket) => t.status === 'new').length}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Đang xử lý</CardTitle>
                        <Clock className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {tickets.filter((t: SupportTicket) => t.status === 'open').length}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Khẩn cấp</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {tickets.filter((t: SupportTicket) => t.priority === 'urgent').length}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Đã giải quyết</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {tickets.filter((t: SupportTicket) => t.status === 'resolved').length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Bộ lọc</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Tìm kiếm ticket..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                <SelectItem value="new">Mới</SelectItem>
                                <SelectItem value="open">Đang xử lý</SelectItem>
                                <SelectItem value="pending">Chờ phản hồi</SelectItem>
                                <SelectItem value="resolved">Đã giải quyết</SelectItem>
                                <SelectItem value="closed">Đã đóng</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={filters.priority} onValueChange={(value) => setFilters({ ...filters, priority: value })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Ưu tiên" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả ưu tiên</SelectItem>
                                <SelectItem value="low">Thấp</SelectItem>
                                <SelectItem value="medium">Trung bình</SelectItem>
                                <SelectItem value="high">Cao</SelectItem>
                                <SelectItem value="urgent">Khẩn cấp</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Loại" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả loại</SelectItem>
                                <SelectItem value="technical">Kỹ thuật</SelectItem>
                                <SelectItem value="billing">Thanh toán</SelectItem>
                                <SelectItem value="account">Tài khoản</SelectItem>
                                <SelectItem value="general">Chung</SelectItem>
                                <SelectItem value="complaint">Khiếu nại</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={filters.assignedTo} onValueChange={(value) => setFilters({ ...filters, assignedTo: value })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Người xử lý" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                <SelectItem value="unassigned">Chưa phân công</SelectItem>
                                {admins.map((admin: any) => (
                                    <SelectItem key={admin.id} value={admin.id}>
                                        {admin.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button
                            variant="outline"
                            onClick={() => {
                                setFilters({ status: "all", priority: "all", category: "all", assignedTo: "all" });
                                setSearchTerm("");
                            }}
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            Xóa bộ lọc
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Tickets Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách ticket ({tickets.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={tickets}
                        loading={isLoading}
                    />
                </CardContent>
            </Card>

            {/* Create/Edit Ticket Modal */}
            <ModalForm
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    resetForm();
                }}
                title={editTicket ? "Chỉnh sửa ticket" : "Tạo ticket mới"}
                size="large"
                onSubmit={(formData) => {
                    const data = {
                        title: formData.get('title') as string,
                        content: formData.get('content') as string,
                        customerId: formData.get('customerId') as string,
                        category: formData.get('category') as string,
                        priority: formData.get('priority') as string,
                        assignedTo: formData.get('assignedTo') as string || undefined,
                        tags: (formData.get('tags') as string)?.split(',').map(t => t.trim()).filter(Boolean) || [],
                    };

                    if (editTicket) {
                        updateTicketMutation.mutate({ id: editTicket.id, data });
                    } else {
                        createTicketMutation.mutate(data);
                    }
                }}
                loading={createTicketMutation.isPending || updateTicketMutation.isPending}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Tiêu đề</Label>
                        <Input
                            id="title"
                            name="title"
                            defaultValue={editTicket?.title}
                            placeholder="Nhập tiêu đề ticket..."
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="customerId">Khách hàng</Label>
                        <Select name="customerId" defaultValue={editTicket?.customerId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn khách hàng" />
                            </SelectTrigger>
                            <SelectContent>
                                {customers.map((customer: any) => (
                                    <SelectItem key={customer.id} value={customer.id}>
                                        {customer.name} - {customer.email}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Loại</Label>
                        <Select name="category" defaultValue={editTicket?.category}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn loại" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="technical">Kỹ thuật</SelectItem>
                                <SelectItem value="billing">Thanh toán</SelectItem>
                                <SelectItem value="account">Tài khoản</SelectItem>
                                <SelectItem value="general">Chung</SelectItem>
                                <SelectItem value="complaint">Khiếu nại</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="priority">Ưu tiên</Label>
                        <Select name="priority" defaultValue={editTicket?.priority}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn mức ưu tiên" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Thấp</SelectItem>
                                <SelectItem value="medium">Trung bình</SelectItem>
                                <SelectItem value="high">Cao</SelectItem>
                                <SelectItem value="urgent">Khẩn cấp</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="assignedTo">Phân công cho</Label>
                        <Select name="assignedTo" defaultValue={editTicket?.assignedTo}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn người xử lý" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="unassigned">Chưa phân công</SelectItem>
                                {admins.map((admin: any) => (
                                    <SelectItem key={admin.id} value={admin.id}>
                                        {admin.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tags">Tags (phân cách bằng dấu phẩy)</Label>
                        <Input
                            id="tags"
                            name="tags"
                            defaultValue={editTicket?.tags?.join(', ')}
                            placeholder="urgent, payment, technical..."
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="content">Nội dung</Label>
                    <Textarea
                        id="content"
                        name="content"
                        defaultValue={editTicket?.content}
                        placeholder="Mô tả chi tiết vấn đề..."
                        rows={4}
                        required
                    />
                </div>
            </ModalForm>

            {/* View Ticket Modal */}
            <ModalForm
                isOpen={viewModalOpen}
                onClose={() => {
                    setViewModalOpen(false);
                    setSelectedTicket(null);
                    setResponseContent("");
                    setIsInternal(false);
                }}
                title="Chi ti���t ticket"
                size="large"
                hideActions
            >
                {selectedTicket && (
                    <div className="space-y-6">
                        {/* Ticket Header */}
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">{selectedTicket.title}</h3>
                                <p className="text-sm text-gray-500">#{selectedTicket.id}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {getStatusBadge(selectedTicket.status)}
                                {getPriorityBadge(selectedTicket.priority)}
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={selectedTicket.customerAvatar} />
                                <AvatarFallback>{selectedTicket.customerName?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-medium">{selectedTicket.customerName}</div>
                                <div className="text-sm text-gray-500">{selectedTicket.customerEmail}</div>
                            </div>
                        </div>

                        {/* Ticket Details */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-medium">Loại:</span> {getCategoryLabel(selectedTicket.category)}
                            </div>
                            <div>
                                <span className="font-medium">Người xử lý:</span> {selectedTicket.assignedToName || "Chưa phân công"}
                            </div>
                            <div>
                                <span className="font-medium">Ngày tạo:</span> {new Date(selectedTicket.createdAt).toLocaleString("vi-VN")}
                            </div>
                            <div>
                                <span className="font-medium">Cập nhật:</span> {new Date(selectedTicket.updatedAt).toLocaleString("vi-VN")}
                            </div>
                        </div>

                        {/* Tags */}
                        {selectedTicket.tags.length > 0 && (
                            <div>
                                <span className="font-medium text-sm">Tags:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {selectedTicket.tags.map((tag, index) => (
                                        <Badge key={index} variant="secondary" className="text-xs">
                                            <Tag className="h-3 w-3 mr-1" />
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Original Content */}
                        <div>
                            <h4 className="font-medium mb-2">Nội dung gốc:</h4>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="whitespace-pre-wrap">{selectedTicket.content}</p>
                            </div>
                        </div>

                        <Separator />

                        {/* Responses */}
                        <div>
                            <h4 className="font-medium mb-4">Lịch sử trả lời ({selectedTicket.responses.length})</h4>
                            <div className="space-y-4 max-h-60 overflow-y-auto">
                                {selectedTicket.responses.map((response) => (
                                    <div key={response.id} className={`p-4 rounded-lg ${response.authorType === 'admin'
                                            ? response.isInternal
                                                ? 'bg-yellow-50 border-l-4 border-yellow-400'
                                                : 'bg-blue-50 border-l-4 border-blue-400'
                                            : 'bg-gray-50 border-l-4 border-gray-400'
                                        }`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{response.authorName}</span>
                                                <Badge variant={response.authorType === 'admin' ? 'default' : 'secondary'}>
                                                    {response.authorType === 'admin' ? 'Admin' : 'Khách hàng'}
                                                </Badge>
                                                {response.isInternal && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        Nội bộ
                                                    </Badge>
                                                )}
                                            </div>
                                            <span className="text-sm text-gray-500">
                                                {new Date(response.createdAt).toLocaleString("vi-VN")}
                                            </span>
                                        </div>
                                        <p className="whitespace-pre-wrap">{response.content}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        {/* Add Response */}
                        <div>
                            <h4 className="font-medium mb-4">Thêm phản hồi</h4>
                            <div className="space-y-4">
                                <Textarea
                                    value={responseContent}
                                    onChange={(e) => setResponseContent(e.target.value)}
                                    placeholder="Nhập phản hồi..."
                                    rows={4}
                                />
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="isInternal"
                                            checked={isInternal}
                                            onChange={(e) => setIsInternal(e.target.checked)}
                                            className="rounded"
                                        />
                                        <Label htmlFor="isInternal">Ghi chú nội bộ (không gửi cho khách hàng)</Label>
                                    </div>
                                    <Button
                                        onClick={handleAddResponse}
                                        disabled={!responseContent.trim() || addResponseMutation.isPending}
                                        loading={addResponseMutation.isPending}
                                    >
                                        <Send className="h-4 w-4 mr-2" />
                                        Gửi phản hồi
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </ModalForm>

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={() => deleteId && deleteTicketMutation.mutate(deleteId)}
                title="Xóa ticket"
                description="Bạn có chắc chắn muốn xóa ticket này? Hành động này không thể hoàn tác."
                loading={deleteTicketMutation.isPending}
            />
        </div>
        </div>
    );
};

export default Support;
