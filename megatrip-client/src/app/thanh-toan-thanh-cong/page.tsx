"use client"
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation'; // Thêm import này
import Link from 'next/link';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import {
    CheckCircle,
    Download,
    Mail,
    Phone,
    Calendar,
    Plane,
    Users,
    CreditCard,
    FileText,
    Home,
    List,
    Loader2, // Thêm icon loading
} from 'lucide-react';
import VeDienTu from '../components/VeDienTu';

export default function ThanhToanThanhCong() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId'); // Lấy orderId từ URL params
    const extraData = searchParams.get('extraData'); // Lấy extraData

    const [order, setOrder] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    useEffect(() => {
        if (!orderId) {
            setError('Không tìm thấy mã đơn hàng');
            setIsLoading(false);
            return;
        }

        // Parse extraData để lấy originalOrder nếu là change calendar
        let actualOrderId = orderId;
        if (orderId.startsWith('ORD_FORCHANGE_') && extraData) {
            try {
                const parsedExtraData = JSON.parse(decodeURIComponent(extraData));
                if (parsedExtraData.originalOrder) {
                    actualOrderId = parsedExtraData.originalOrder;
                }
            } catch (e) {
                console.error('Error parsing extraData:', e);
            }
        }

        const fetchOrderDetails = async () => {
            try {
                const response = await fetch(`http://localhost:7700/api/orders/${actualOrderId}/details`);
                if (!response.ok) throw new Error('Không thể tải thông tin đơn hàng');
                const data = await response.json();
                setOrder(data.order);
                setTickets(data.tickets || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId, extraData]);

    if (isLoading) {
        return (
            <div className="container py-8">
                <div className="max-w-4xl mx-auto text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p>Đang tải thông tin đơn hàng...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-8">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-red-600">{error}</p>
                    <Button asChild className="mt-4">
                        <Link href="/">Về trang chủ</Link>
                    </Button>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container py-8">
                <div className="max-w-4xl mx-auto text-center">
                    <p>Không tìm thấy đơn hàng</p>
                    <Button asChild className="mt-4">
                        <Link href="/">Về trang chủ</Link>
                    </Button>
                </div>
            </div>
        );
    }

    // Xác định bookingType từ order
    const bookingType = order.items?.[0]?.type || 'tour';
    const bookingData = {
        type: bookingType,
        details: order.metadata?.bookingDataSnapshot?.details || {},
        pricing: order.metadata?.bookingDataSnapshot?.pricing || {},
    };
    const passengers = order.metadata?.bookingDataSnapshot?.details?.passengers || [];

    return (
        <>
            <div className="container py-8">
                <div className="max-w-6xl mx-auto">
                    {/* Success Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-green-600 mb-2">
                            {orderId.startsWith('ORD_FORCHANGE_') ? 'Giao dịch đổi lịch thành công!' : 'Giao dịch thành công!'}
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Cảm ơn bạn đã tin tưởng MegaTrip. Vé điện tử đã được gửi đến email của bạn.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main: hiển thị vé điện tử từ tickets */}
                        <div className="lg:col-span-2 space-y-6">
                            {tickets.map((ticket, index) => {
                                // Parse passenger từ string JSON
                                let passengerObj = {};
                                try {
                                    passengerObj = typeof ticket.passenger === 'string' ? JSON.parse(ticket.passenger) : ticket.passenger;
                                } catch (e) {
                                    console.error('Error parsing passenger:', e);
                                }

                                return (
                                    <VeDienTu
                                        key={ticket._id}
                                        bookingType={bookingType}
                                        bookingData={bookingData}
                                        passengers={[passengerObj]} // Truyền passenger từ ticket
                                        ticket={ticket} // Truyền toàn bộ ticket
                                        countdown={undefined}
                                        expired={false}
                                        bookingCode={order.orderNumber}
                                        status={ticket.status} // Truyền status từ ticket
                                    />
                                );
                            })}
                        </div>
                        {/* Sidebar - Actions */}
                        <div className="space-y-6">
                            {/* Download E-ticket */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Vé điện tử</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                                        <Mail className="h-4 w-4 text-green-600 mt-0.5" />
                                        <div className="text-sm">
                                            <div className="font-medium text-green-800">Email đã được gửi</div>
                                            <div className="text-green-600">{order.customerEmail}</div>
                                        </div>
                                    </div>
                                    <Button className="w-full" variant="outline">
                                        <Download className="h-4 w-4 mr-2" />
                                        Tải vé điện tử (PDF)
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Important Notes */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Lưu ý quan trọng</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 text-sm">
                                        {bookingType === 'flight' && (
                                            <>
                                                <div className="flex items-start gap-2">
                                                    <Calendar className="h-4 w-4 text-blue-500 mt-0.5" />
                                                    <div>
                                                        <div className="font-medium">Check-in online</div>
                                                        <div className="text-muted-foreground">
                                                            24h trước giờ bay trên website Vietnam Airlines
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <FileText className="h-4 w-4 text-purple-500 mt-0.5" />
                                                    <div>
                                                        <div className="font-medium">Giấy tờ tùy thân</div>
                                                        <div className="text-muted-foreground">
                                                            Mang theo CCCD/CMND còn hạn khi đi máy bay
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <Plane className="h-4 w-4 text-green-500 mt-0.5" />
                                                    <div>
                                                        <div className="font-medium">Có mặt tại sân bay</div>
                                                        <div className="text-muted-foreground">
                                                            Trước 2h đối với chuyến bay nội địa
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        {bookingType === 'bus' && (
                                            <>
                                                <div className="flex items-start gap-2">
                                                    <Calendar className="h-4 w-4 text-blue-500 mt-0.5" />
                                                    <div>
                                                        <div className="font-medium">Giờ xuất phát</div>
                                                        <div className="text-muted-foreground">
                                                            Có mặt tại bến xe trước 30 phút
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <FileText className="h-4 w-4 text-purple-500 mt-0.5" />
                                                    <div>
                                                        <div className="font-medium">Điểm đón/trả</div>
                                                        <div className="text-muted-foreground">
                                                            Kiểm tra điểm đón/trả trên vé điện tử
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <Users className="h-4 w-4 text-green-500 mt-0.5" />
                                                    <div>
                                                        <div className="font-medium">Giấy tờ tùy thân</div>
                                                        <div className="text-muted-foreground">
                                                            Mang theo CCCD/CMND còn hạn
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        {bookingType === 'tour' && (
                                            <>
                                                <div className="flex items-start gap-2">
                                                    <Calendar className="h-4 w-4 text-blue-500 mt-0.5" />
                                                    <div>
                                                        <div className="font-medium">Điểm tập trung</div>
                                                        <div className="text-muted-foreground">
                                                            Có mặt đúng giờ tại điểm tập trung
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <FileText className="h-4 w-4 text-purple-500 mt-0.5" />
                                                    <div>
                                                        <div className="font-medium">Giấy tờ tùy thân</div>
                                                        <div className="text-muted-foreground">
                                                            Mang theo CCCD/CMND còn hạn
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <Plane className="h-4 w-4 text-green-500 mt-0.5" />
                                                    <div>
                                                        <div className="font-medium">Lịch trình</div>
                                                        <div className="text-muted-foreground">
                                                            Kiểm tra lịch trình chi tiết trên email
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Thao tác nhanh</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button variant="outline" className="w-full" asChild>
                                        <Link prefetch={false} href="/tai-khoan">
                                            <List className="h-4 w-4 mr-2" />
                                            Xem đơn hàng của tôi
                                        </Link>
                                    </Button>
                                    <Button variant="outline" className="w-full" asChild>
                                        <Link prefetch={false} href="/">
                                            <Home className="h-4 w-4 mr-2" />
                                            Về trang chủ
                                        </Link>
                                    </Button>
                                    {/* <Button variant="outline" className="w-full" asChild>
                                        <Link prefetch={false} href="/ve-may-bay">
                                            <Plane className="h-4 w-4 mr-2" />
                                            Đặt vé mới
                                        </Link>
                                    </Button> */}
                                </CardContent>
                            </Card>

                            {/* Support */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Cần hỗ trợ?</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-green-500" />
                                            <div>
                                                <div className="font-medium">Hotline 24/7</div>
                                                <div className="text-primary">1900 1234</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-blue-500" />
                                            <div>
                                                <div className="font-medium">Email hỗ trợ</div>
                                                <div className="text-primary">support@MegaTrip.com</div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}