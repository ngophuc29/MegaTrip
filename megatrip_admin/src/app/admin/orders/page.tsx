"use client"

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShoppingBag, Plus, Edit, Eye, Trash2, FileText, Printer, RefreshCw, DollarSign, Package, Truck, CheckCircle, XCircle, Clock, AlertTriangle, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { Separator } from "../../components/ui/separator";
import { DataTable, Column } from "../../components/DataTable";
import { ModalForm } from "../../components/ModalForm";
import { ConfirmModal } from "../../components/ConfirmModal";
import { useToast } from "../../components/ui/use-toast";

interface OrderItem {
    id: string;
    type: "tour" | "flight" | "bus";
    name: string;
    sku: string;
    image?: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
}

interface Order {
    id: string;
    orderNumber: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress: string;
    items: OrderItem[];
    subtotal: number;
    discounts: Array<{
        code: string;
        name: string;
        amount: number;
    }>;
    fees: Array<{
        name: string;
        amount: number;
    }>;
    tax: number;
    total: number;
    paymentMethod: string;
    paymentStatus: "pending" | "paid" | "failed" | "refunded";
    orderStatus: "pending" | "confirmed" | "processing" | "completed" | "cancelled";
    timeline: Array<{
        status: string;
        note?: string;
        actor: string;
        timestamp: string;
    }>;
    notes: Array<{
        id: string;
        content: string;
        author: string;
        timestamp: string;
    }>;
    createdAt: string;
    updatedAt: string;
}

interface OrderFilters {
    paymentStatus: string;
    orderStatus: string;
    paymentMethod: string;
    dateRange?: [string, string];
}

const paymentMethods = [
    { value: "bank_transfer", label: "Chuyển khoản ngân hàng" },
    { value: "credit_card", label: "Thẻ tín dụng" },
    { value: "e_wallet", label: "Ví điện tử" },
    { value: "cash", label: "Tiền mặt" },
];

const orderStatuses = [
    { value: "pending", label: "Chờ xử lý", color: "yellow" },
    { value: "confirmed", label: "Đã xác nhận", color: "blue" },
    { value: "processing", label: "Đang xử lý", color: "purple" },
    { value: "completed", label: "Hoàn thành", color: "green" },
    { value: "cancelled", label: "Đã hủy", color: "red" },
];

const paymentStatuses = [
    { value: "pending", label: "Chờ thanh toán", color: "yellow" },
    { value: "paid", label: "Đã thanh toán", color: "green" },
    { value: "failed", label: "Thanh toán thất bại", color: "red" },
    { value: "refunded", label: "Đã hoàn tiền", color: "gray" },
];

export default function Orders() {
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState<OrderFilters>({
        paymentStatus: "all",
        orderStatus: "all",
        paymentMethod: "all"
    });
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("view");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
    const [refundModalOpen, setRefundModalOpen] = useState(false);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [noteModalOpen, setNoteModalOpen] = useState(false);
    const [newNote, setNewNote] = useState("");
    const [refundData, setRefundData] = useState({
        amount: 0,
        reason: "",
        method: "bank_transfer",
        transactionId: ""
    });

    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
    });

    // Fetch orders with React Query
    const { data: ordersData, isLoading, error, refetch } = useQuery({
        queryKey: ['orders', pagination.current, pagination.pageSize, searchQuery, filters],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: pagination.current.toString(),
                limit: pagination.pageSize.toString(),
                ...(searchQuery && { q: searchQuery }),
                ...(filters.paymentStatus !== 'all' && { paymentStatus: filters.paymentStatus }),
                ...(filters.orderStatus !== 'all' && { orderStatus: filters.orderStatus }),
                ...(filters.paymentMethod !== 'all' && { paymentMethod: filters.paymentMethod }),
            });

            const response = await fetch(`/api/admin/orders?${params}`);
            if (!response.ok) throw new Error('Failed to fetch orders');
            return response.json();
        },
    });

    // Update order status mutation
    const updateOrderMutation = useMutation({
        mutationFn: async ({ id, status, note }: { id: string; status: string; note?: string }) => {
            const response = await fetch(`/api/admin/orders/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, note }),
            });
            if (!response.ok) throw new Error('Failed to update order');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            toast({
                title: "Cập nhật đơn hàng thành công",
                description: "Trạng thái đơn hàng đã được cập nhật",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Lỗi khi cập nhật đơn hàng",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    // Refund mutation
    const refundMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const response = await fetch(`/api/admin/orders/${id}/refund`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to process refund');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            setRefundModalOpen(false);
            setRefundData({ amount: 0, reason: "", method: "bank_transfer", transactionId: "" });
            toast({
                title: "Hoàn tiền thành công",
                description: "Yêu cầu hoàn tiền đã được xử lý",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Lỗi khi hoàn tiền",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    // Add note mutation
    const addNoteMutation = useMutation({
        mutationFn: async ({ id, note }: { id: string; note: string }) => {
            const response = await fetch(`/api/admin/orders/${id}/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: note, author: "Admin" }),
            });
            if (!response.ok) throw new Error('Failed to add note');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            setNoteModalOpen(false);
            setNewNote("");
            toast({
                title: "Thêm ghi chú thành công",
                description: "Ghi chú đã được thêm vào đơn hàng",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Lỗi khi thêm ghi chú",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const orders = ordersData?.data || [];
    const total = ordersData?.pagination?.total || 0;

    const getStatusInfo = (status: string, type: 'order' | 'payment') => {
        const statuses = type === 'order' ? orderStatuses : paymentStatuses;
        return statuses.find(s => s.value === status) || { label: status, color: 'gray' };
    };

    const getRefundableAmount = (order: Order) => {
        if (order.paymentStatus !== 'paid') return 0;
        if (order.orderStatus === 'completed') return order.total * 0.8; // 80% refund for completed
        if (order.orderStatus === 'cancelled') return 0;
        return order.total; // Full refund for other statuses
    };

    const columns: Column[] = [
        {
            key: "orderNumber",
            title: "Số đơn hàng",
            sortable: true,
            render: (value, record: Order) => (
                <div>
                    <div className="font-mono font-medium">{value}</div>
                    <div className="text-sm text-gray-500">{record.id}</div>
                </div>
            ),
        },
        {
            key: "customer",
            title: "Khách hàng",
            render: (_, record: Order) => (
                <div>
                    <div className="font-medium">{record.customerName}</div>
                    <div className="text-sm text-gray-500">{record.customerEmail}</div>
                    <div className="text-xs text-gray-400">{record.customerPhone}</div>
                </div>
            ),
        },
        {
            key: "items",
            title: "Sản phẩm",
            render: (items: OrderItem[]) => (
                <div className="space-y-1">
                    {items.slice(0, 2).map((item, index) => (
                        <div key={index} className="text-sm">
                            <span className="font-medium">{item.name}</span>
                            <span className="text-gray-500 ml-2">x{item.quantity}</span>
                        </div>
                    ))}
                    {items.length > 2 && (
                        <div className="text-xs text-gray-500">+{items.length - 2} sản phẩm khác</div>
                    )}
                </div>
            ),
        },
        {
            key: "total",
            title: "Tổng tiền",
            sortable: true,
            render: (value, record: Order) => (
                <div className="text-sm">
                    <div className="font-bold">
                        {new Intl.NumberFormat('vi-VN').format(value)} ₫
                    </div>
                    <div className="text-gray-500">
                        {record.items.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm
                    </div>
                </div>
            ),
        },
        {
            key: "paymentMethod",
            title: "Thanh toán",
            render: (value, record: Order) => {
                const method = paymentMethods.find(m => m.value === value);
                const paymentStatus = getStatusInfo(record.paymentStatus, 'payment');

                return (
                    <div className="text-sm">
                        <div className="font-medium">{method?.label || value}</div>
                        <Badge className={
                            paymentStatus.color === 'green' ? "bg-green-100 text-green-800 hover:bg-green-100" :
                                paymentStatus.color === 'yellow' ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" :
                                    paymentStatus.color === 'red' ? "bg-red-100 text-red-800 hover:bg-red-100" :
                                        "bg-gray-100 text-gray-800 hover:bg-gray-100"
                        }>
                            {paymentStatus.label}
                        </Badge>
                    </div>
                );
            },
        },
        {
            key: "orderStatus",
            title: "Trạng thái",
            sortable: true,
            render: (value) => {
                const status = getStatusInfo(value, 'order');
                return (
                    <Badge className={
                        status.color === 'green' ? "bg-green-100 text-green-800 hover:bg-green-100" :
                            status.color === 'blue' ? "bg-blue-100 text-blue-800 hover:bg-blue-100" :
                                status.color === 'purple' ? "bg-purple-100 text-purple-800 hover:bg-purple-100" :
                                    status.color === 'yellow' ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" :
                                        status.color === 'red' ? "bg-red-100 text-red-800 hover:bg-red-100" :
                                            "bg-gray-100 text-gray-800 hover:bg-gray-100"
                    }>
                        {status.label}
                    </Badge>
                );
            },
        },
        {
            key: "createdAt",
            title: "Ngày tạo",
            sortable: true,
            render: (value) => (
                <div className="text-sm">
                    <div>{new Date(value).toLocaleDateString('vi-VN')}</div>
                    <div className="text-gray-500">
                        {new Date(value).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </div>
                </div>
            ),
        },
    ];

    const handleView = (order: Order) => {
        setSelectedOrder(order);
        setModalMode("view");
        setModalOpen(true);
    };

    const handleConfirmOrder = (order: Order) => {
        updateOrderMutation.mutate({
            id: order.id,
            status: "confirmed",
            note: "Đơn hàng đã được xác nhận bởi admin"
        });
    };

    const handleCompleteOrder = (order: Order) => {
        updateOrderMutation.mutate({
            id: order.id,
            status: "completed",
            note: "Đơn hàng đã hoàn thành"
        });
    };

    const handleRefund = (order: Order) => {
        const refundableAmount = getRefundableAmount(order);
        setRefundData({
            amount: refundableAmount,
            reason: "",
            method: "bank_transfer",
            transactionId: ""
        });
        setSelectedOrder(order);
        setRefundModalOpen(true);
    };

    const handleCancelOrder = (order: Order) => {
        setSelectedOrder(order);
        setCancelModalOpen(true);
    };

    const handleExportInvoice = (order: Order) => {
        // Mock invoice export
        toast({
            title: "Đang xuất hóa đơn",
            description: `Hóa đơn ${order.orderNumber} sẽ được tải xuống`,
        });
    };

    const handlePrintInvoice = (order: Order) => {
        // Mock print invoice
        toast({
            title: "Đang in hóa đơn",
            description: `Hóa đơn ${order.orderNumber} đang được in`,
        });
    };

    const bulkActions = [
        {
            label: "Xác nhận",
            action: (keys: string[]) => {
                keys.forEach(id => {
                    updateOrderMutation.mutate({ id, status: "confirmed" });
                });
            },
            icon: <CheckCircle className="w-4 h-4 mr-2" />,
        },
        {
            label: "Hoàn thành",
            action: (keys: string[]) => {
                keys.forEach(id => {
                    updateOrderMutation.mutate({ id, status: "completed" });
                });
            },
            icon: <Package className="w-4 h-4 mr-2" />,
        },
        {
            label: "Hủy đơn",
            action: (keys: string[]) => {
                keys.forEach(id => {
                    updateOrderMutation.mutate({ id, status: "cancelled" });
                });
            },
            icon: <XCircle className="w-4 h-4 mr-2" />,
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
            label: "Xác nhận",
            action: handleConfirmOrder,
            icon: <CheckCircle className="mr-2 h-4 w-4" />,
            condition: (order: Order) => order.orderStatus === "pending",
        },
        {
            label: "Hoàn thành",
            action: handleCompleteOrder,
            icon: <Package className="mr-2 h-4 w-4" />,
            condition: (order: Order) => order.orderStatus === "confirmed" || order.orderStatus === "processing",
        },
        {
            label: "Hoàn tiền",
            action: handleRefund,
            icon: <DollarSign className="mr-2 h-4 w-4" />,
            condition: (order: Order) => order.paymentStatus === "paid" && order.orderStatus !== "cancelled",
        },
        {
            label: "Hủy đơn",
            action: handleCancelOrder,
            icon: <XCircle className="mr-2 h-4 w-4" />,
            variant: "destructive" as const,
            condition: (order: Order) => order.orderStatus !== "completed" && order.orderStatus !== "cancelled",
        },
        {
            label: "Xuất hóa đơn",
            action: handleExportInvoice,
            icon: <Download className="mr-2 h-4 w-4" />,
        },
        {
            label: "In hóa đơn",
            action: handlePrintInvoice,
            icon: <Printer className="mr-2 h-4 w-4" />,
        },
    ];

    const renderOrderDetails = () => {
        if (!selectedOrder) return null;

        return (
            <div className="space-y-6">
                {/* Order Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">Đơn hàng #{selectedOrder.orderNumber}</h3>
                        <p className="text-gray-500">ID: {selectedOrder.id}</p>
                    </div>
                    <div className="flex space-x-2">
                        <Badge className={
                            getStatusInfo(selectedOrder.orderStatus, 'order').color === 'green' ? "bg-green-100 text-green-800" :
                                getStatusInfo(selectedOrder.orderStatus, 'order').color === 'blue' ? "bg-blue-100 text-blue-800" :
                                    getStatusInfo(selectedOrder.orderStatus, 'order').color === 'purple' ? "bg-purple-100 text-purple-800" :
                                        getStatusInfo(selectedOrder.orderStatus, 'order').color === 'yellow' ? "bg-yellow-100 text-yellow-800" :
                                            getStatusInfo(selectedOrder.orderStatus, 'order').color === 'red' ? "bg-red-100 text-red-800" :
                                                "bg-gray-100 text-gray-800"
                        }>
                            {getStatusInfo(selectedOrder.orderStatus, 'order').label}
                        </Badge>
                        <Badge className={
                            getStatusInfo(selectedOrder.paymentStatus, 'payment').color === 'green' ? "bg-green-100 text-green-800" :
                                getStatusInfo(selectedOrder.paymentStatus, 'payment').color === 'yellow' ? "bg-yellow-100 text-yellow-800" :
                                    getStatusInfo(selectedOrder.paymentStatus, 'payment').color === 'red' ? "bg-red-100 text-red-800" :
                                        "bg-gray-100 text-gray-800"
                        }>
                            {getStatusInfo(selectedOrder.paymentStatus, 'payment').label}
                        </Badge>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="flex space-x-2">
                    {selectedOrder.orderStatus === "pending" && (
                        <Button size="sm" onClick={() => handleConfirmOrder(selectedOrder)}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Xác nhận
                        </Button>
                    )}
                    {selectedOrder.paymentStatus === "paid" && selectedOrder.orderStatus !== "cancelled" && (
                        <Button size="sm" variant="outline" onClick={() => handleRefund(selectedOrder)}>
                            <DollarSign className="w-4 h-4 mr-2" />
                            Hoàn tiền
                        </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => handleExportInvoice(selectedOrder)}>
                        <FileText className="w-4 h-4 mr-2" />
                        Xuất PDF
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handlePrintInvoice(selectedOrder)}>
                        <Printer className="w-4 h-4 mr-2" />
                        In hóa đơn
                    </Button>
                </div>

                <Separator />

                {/* Customer Information */}
                <div>
                    <Label className="text-sm font-medium text-gray-700">Th��ng tin khách hàng</Label>
                    <div className="mt-2 grid grid-cols-2 gap-4">
                        <div>
                            <div className="font-medium">{selectedOrder.customerName}</div>
                            <div className="text-sm text-gray-600">{selectedOrder.customerEmail}</div>
                            <div className="text-sm text-gray-600">{selectedOrder.customerPhone}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-600">{selectedOrder.customerAddress}</div>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Order Items */}
                <div>
                    <Label className="text-sm font-medium text-gray-700">Sản phẩm đặt hàng</Label>
                    <div className="mt-2 space-y-3">
                        {selectedOrder.items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                        {item.type === "tour" && <Package className="w-6 h-6 text-gray-400" />}
                                        {item.type === "flight" && <Truck className="w-6 h-6 text-gray-400" />}
                                        {item.type === "bus" && <Truck className="w-6 h-6 text-gray-400" />}
                                    </div>
                                    <div>
                                        <div className="font-medium">{item.name}</div>
                                        <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                                        <div className="text-sm text-gray-500">Loại: {item.type}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium">
                                        {new Intl.NumberFormat('vi-VN').format(item.subtotal)} ₫
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {new Intl.NumberFormat('vi-VN').format(item.unitPrice)} ₫ x {item.quantity}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <Separator />

                {/* Pricing Breakdown */}
                <div>
                    <Label className="text-sm font-medium text-gray-700">Chi tiết giá</Label>
                    <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                            <span>Tạm tính:</span>
                            <span>{new Intl.NumberFormat('vi-VN').format(selectedOrder.subtotal)} ₫</span>
                        </div>

                        {selectedOrder.discounts.map((discount, index) => (
                            <div key={index} className="flex justify-between text-green-600">
                                <span>Giảm giá ({discount.code}):</span>
                                <span>-{new Intl.NumberFormat('vi-VN').format(discount.amount)} ₫</span>
                            </div>
                        ))}

                        {selectedOrder.fees.map((fee, index) => (
                            <div key={index} className="flex justify-between">
                                <span>{fee.name}:</span>
                                <span>{new Intl.NumberFormat('vi-VN').format(fee.amount)} ₫</span>
                            </div>
                        ))}

                        {selectedOrder.tax > 0 && (
                            <div className="flex justify-between">
                                <span>Thuế:</span>
                                <span>{new Intl.NumberFormat('vi-VN').format(selectedOrder.tax)} ₫</span>
                            </div>
                        )}

                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Tổng cộng:</span>
                            <span>{new Intl.NumberFormat('vi-VN').format(selectedOrder.total)} ₫</span>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Payment Information */}
                <div>
                    <Label className="text-sm font-medium text-gray-700">Th��ng tin thanh toán</Label>
                    <div className="mt-2">
                        <div className="flex justify-between">
                            <span>Phương thức:</span>
                            <span>{paymentMethods.find(m => m.value === selectedOrder.paymentMethod)?.label}</span>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Timeline */}
                <div>
                    <Label className="text-sm font-medium text-gray-700">Lịch sử đơn hàng</Label>
                    <div className="mt-2 space-y-3">
                        {selectedOrder.timeline.map((event, index) => (
                            <div key={index} className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{getStatusInfo(event.status, 'order').label}</span>
                                        <span className="text-sm text-gray-500">
                                            {new Date(event.timestamp).toLocaleString('vi-VN')}
                                        </span>
                                    </div>
                                    {event.note && (
                                        <p className="text-sm text-gray-600 mt-1">{event.note}</p>
                                    )}
                                    <p className="text-xs text-gray-500">Bởi: {event.actor}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <Separator />

                {/* Admin Notes */}
                <div>
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-gray-700">Ghi chú nội bộ</Label>
                        <Button size="sm" variant="outline" onClick={() => setNoteModalOpen(true)}>
                            Thêm ghi chú
                        </Button>
                    </div>
                    <div className="mt-2 space-y-2">
                        {selectedOrder.notes.length > 0 ? (
                            selectedOrder.notes.map((note, index) => (
                                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm">{note.content}</p>
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>Bởi: {note.author}</span>
                                        <span>{new Date(note.timestamp).toLocaleString('vi-VN')}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">Chưa có ghi chú nào</p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 space-y-6 bg-gray-50">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn đặt</h1>
                    <p className="text-gray-600 mt-1">Quản lý đơn hàng, thanh toán và trạng thái đơn</p>
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
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Tổng đơn hàng</p>
                                <p className="text-2xl font-bold">{total || 0}</p>
                            </div>
                            <ShoppingBag className="w-8 h-8 text-primary" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Chờ xử lý</p>
                                <p className="text-2xl font-bold">
                                    {orders.filter((o: Order) => o.orderStatus === "pending").length}
                                </p>
                            </div>
                            <Clock className="w-8 h-8 text-yellow-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Hoàn thành</p>
                                <p className="text-2xl font-bold">
                                    {orders.filter((o: Order) => o.orderStatus === "completed").length}
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
                                <p className="text-sm text-gray-600">Doanh thu</p>
                                <p className="text-2xl font-bold">
                                    {new Intl.NumberFormat('vi-VN', {
                                        notation: 'compact',
                                        compactDisplay: 'short'
                                    }).format(
                                        orders
                                            .filter((o: Order) => o.paymentStatus === "paid")
                                            .reduce((sum: number, o: Order) => sum + o.total, 0)
                                    )} ₫
                                </p>
                            </div>
                            <DollarSign className="w-8 h-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Danh sách đơn hàng</CardTitle>
                            <CardDescription>Quản lý đơn hàng, thanh toán và trạng thái</CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Select value={filters.orderStatus} onValueChange={(value) => setFilters(prev => ({ ...prev, orderStatus: value }))}>
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                    {orderStatuses.map((status) => (
                                        <SelectItem key={status.value} value={status.value}>
                                            {status.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={filters.paymentStatus} onValueChange={(value) => setFilters(prev => ({ ...prev, paymentStatus: value }))}>
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả thanh toán</SelectItem>
                                    {paymentStatuses.map((status) => (
                                        <SelectItem key={status.value} value={status.value}>
                                            {status.label}
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
                        data={orders}
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
                            selectedRowKeys: selectedOrders,
                            onChange: setSelectedOrders,
                        }}
                        bulkActions={bulkActions}
                        actions={actions}
                        exportable
                        onExport={() => toast({ title: "Đang xuất file...", description: "File sẽ được tải xuống sau vài giây" })}
                        loading={isLoading}
                    />
                </CardContent>
            </Card>

            {/* Order Details Modal */}
            <ModalForm
                open={modalOpen}
                onOpenChange={setModalOpen}
                title="Chi tiết đơn hàng"
                description="Xem thông tin chi tiết và quản lý đơn hàng"
                mode="view"
                size="large"
            >
                {renderOrderDetails()}
            </ModalForm>

            {/* Refund Modal */}
            <ModalForm
                open={refundModalOpen}
                onOpenChange={setRefundModalOpen}
                title="Hoàn tiền"
                description={`Xử lý hoàn tiền cho đơn hàng #${selectedOrder?.orderNumber}`}
                mode="edit"
                size="medium"
                onSubmit={() => {
                    if (selectedOrder) {
                        refundMutation.mutate({ id: selectedOrder.id, data: refundData });
                    }
                }}
                submitText="Xử lý hoàn tiền"
            >
                <div className="space-y-4">
                    <div>
                        <Label>Số tiền có thể hoàn</Label>
                        <p className="text-lg font-bold text-green-600">
                            {selectedOrder ? new Intl.NumberFormat('vi-VN').format(getRefundableAmount(selectedOrder)) : '0'} ₫
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="refundAmount">Số ti��n hoàn *</Label>
                        <Input
                            id="refundAmount"
                            type="number"
                            value={refundData.amount}
                            onChange={(e) => setRefundData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                            max={selectedOrder ? getRefundableAmount(selectedOrder) : 0}
                        />
                    </div>

                    <div>
                        <Label htmlFor="refundReason">Lý do hoàn tiền *</Label>
                        <Textarea
                            id="refundReason"
                            value={refundData.reason}
                            onChange={(e) => setRefundData(prev => ({ ...prev, reason: e.target.value }))}
                            placeholder="Nhập lý do hoàn tiền"
                            rows={3}
                        />
                    </div>

                    <div>
                        <Label htmlFor="refundMethod">Phương thức hoàn tiền</Label>
                        <Select
                            value={refundData.method}
                            onValueChange={(value) => setRefundData(prev => ({ ...prev, method: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {paymentMethods.map((method) => (
                                    <SelectItem key={method.value} value={method.value}>
                                        {method.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="transactionId">Mã giao dịch</Label>
                        <Input
                            id="transactionId"
                            value={refundData.transactionId}
                            onChange={(e) => setRefundData(prev => ({ ...prev, transactionId: e.target.value }))}
                            placeholder="Mã giao dịch hoàn tiền"
                        />
                    </div>
                </div>
            </ModalForm>

            {/* Add Note Modal */}
            <ModalForm
                open={noteModalOpen}
                onOpenChange={setNoteModalOpen}
                title="Thêm ghi chú"
                description="Thêm ghi chú nội bộ cho đơn hàng"
                mode="edit"
                size="medium"
                onSubmit={() => {
                    if (selectedOrder && newNote.trim()) {
                        addNoteMutation.mutate({ id: selectedOrder.id, note: newNote.trim() });
                    }
                }}
                submitText="Thêm ghi chú"
            >
                <div>
                    <Label htmlFor="note">Nội dung ghi chú *</Label>
                    <Textarea
                        id="note"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Nhập ghi chú..."
                        rows={4}
                    />
                </div>
            </ModalForm>

            {/* Cancel Order Modal */}
            <ConfirmModal
                open={cancelModalOpen}
                onOpenChange={setCancelModalOpen}
                title="Hủy đơn hàng"
                message={`Bạn có chắc chắn muốn hủy đơn hàng #${selectedOrder?.orderNumber}? Hành động này không thể hoàn tác.`}
                type="danger"
                requireTyping={false}
                onConfirm={() => {
                    if (selectedOrder) {
                        updateOrderMutation.mutate({
                            id: selectedOrder.id,
                            status: "cancelled",
                            note: "Đơn hàng đã bị hủy bởi admin"
                        });
                        setCancelModalOpen(false);
                    }
                }}
                confirmText="Hủy đơn hàng"
            />
        </div>
    );
}
