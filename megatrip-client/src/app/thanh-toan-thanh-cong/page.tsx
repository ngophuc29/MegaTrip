"use client"
import { useEffect } from 'react';
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
} from 'lucide-react';

// Sample booking confirmation data
const bookingConfirmation = {
    bookingCode: 'TRV123456789',
    status: 'confirmed',
    paymentMethod: 'Thẻ tín dụng',
    transactionId: 'TXN987654321',
    bookingDate: '29/12/2024 14:30',
    flightDetails: {
        flightNumber: 'VN1546',
        airline: 'Vietnam Airlines',
        route: 'TP.HCM → Hà Nội',
        date: '15/01/2025',
        time: '06:15 - 08:30',
        class: 'Phổ thông',
    },
    passenger: {
        name: 'NGUYEN VAN AN',
        idNumber: '123456789',
    },
    pricing: {
        total: 2230000,
    },
    contact: {
        email: 'customer@email.com',
        phone: '0912345678',
    }
};

export default function ThanhToanThanhCong() {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    useEffect(() => {
        // Send confirmation email (would be handled by backend)
        console.log('Sending confirmation email...');
    }, []);

    return (
        <>
            <div className="container py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Success Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-green-600 mb-2">
                            Đặt chỗ thành công!
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Cảm ơn bạn đã tin tưởng MegaTrip. Vé điện tử đã được gửi đến email của bạn.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Booking Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Booking Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Thông tin đặt chỗ
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-sm text-muted-foreground">Mã đặt chỗ</div>
                                            <div className="text-xl font-bold text-primary">
                                                {bookingConfirmation.bookingCode}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-muted-foreground">Trạng thái</div>
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                <span className="font-medium text-green-600">Đã xác nhận</span>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-muted-foreground">Ngày đặt</div>
                                            <div className="font-medium">{bookingConfirmation.bookingDate}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-muted-foreground">Phương thức thanh toán</div>
                                            <div className="font-medium">{bookingConfirmation.paymentMethod}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Flight Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Plane className="h-5 w-5" />
                                        Chi tiết chuyến bay
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold">06:15</div>
                                            <div className="text-sm text-muted-foreground">TP.HCM (SGN)</div>
                                            <div className="text-xs text-muted-foreground">15/01/2025</div>
                                        </div>
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="text-sm text-muted-foreground mb-2">2h 15m</div>
                                            <div className="w-full h-px bg-gray-300 relative">
                                                <Plane className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-primary bg-white" />
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-2">VN1546</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold">08:30</div>
                                            <div className="text-sm text-muted-foreground">Hà Nội (HAN)</div>
                                            <div className="text-xs text-muted-foreground">15/01/2025</div>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <div className="text-muted-foreground">Hãng hàng không</div>
                                            <div className="font-medium">{bookingConfirmation.flightDetails.airline}</div>
                                        </div>
                                        <div>
                                            <div className="text-muted-foreground">Hạng vé</div>
                                            <div className="font-medium">{bookingConfirmation.flightDetails.class}</div>
                                        </div>
                                        <div>
                                            <div className="text-muted-foreground">Hành khách</div>
                                            <div className="font-medium">{bookingConfirmation.passenger.name}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Passenger Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Thông tin hành khách
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Họ và tên:</span>
                                            <span className="font-medium">{bookingConfirmation.passenger.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Giấy tờ tùy thân:</span>
                                            <span className="font-medium">{bookingConfirmation.passenger.idNumber}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Payment Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5" />
                                        Thông tin thanh toán
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Phương thức:</span>
                                            <span className="font-medium">{bookingConfirmation.paymentMethod}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Mã giao dịch:</span>
                                            <span className="font-medium">{bookingConfirmation.transactionId}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Tổng tiền:</span>
                                            <span className="text-xl font-bold text-primary">
                                                {formatPrice(bookingConfirmation.pricing.total)}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
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
                                            <div className="text-green-600">{bookingConfirmation.contact.email}</div>
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
                                        <Link prefetch={false}  href="/tai-khoan">
                                            <List className="h-4 w-4 mr-2" />
                                            Xem đơn hàng của tôi
                                        </Link>
                                    </Button>
                                    <Button variant="outline" className="w-full" asChild>
                                        <Link prefetch={false}  href="/">
                                            <Home className="h-4 w-4 mr-2" />
                                            Về trang chủ
                                        </Link>
                                    </Button>
                                    <Button variant="outline" className="w-full" asChild>
                                        <Link prefetch={false}  href="/ve-may-bay">
                                            <Plane className="h-4 w-4 mr-2" />
                                            Đặt vé mới
                                        </Link>
                                    </Button>
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
