"use client"
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
    User,
    Edit,
    Settings,
    FileText,
    CreditCard,
    Bell,
    MapPin,
    Phone,
    Mail,
    Calendar,
    Plane,
    Bus,
    Map as MapIcon,
    Eye,
    Download,
    Star,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Users,
} from 'lucide-react';

// Sample user data
const userData = {
    profile: {
        name: 'Nguyễn Văn An',
        email: 'nguyenvanan@email.com',
        phone: '0912345678',
        dateOfBirth: '1990-05-15',
        gender: 'male',
        address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
        avatar: '/placeholder.svg',
        memberSince: '2023-01-15',
        verified: true,
    },
    bookings: [
        {
            id: 'TRV123456789',
            type: 'flight',
            status: 'confirmed',
            bookingDate: '2024-12-28',
            serviceDate: '2025-01-15',
            title: 'Chuyến bay TP.HCM - Hà Nội',
            details: 'VN1546 • 06:15 - 08:30',
            passengers: 1,
            total: 2230000,
            canCancel: true,
            canChange: true,
        },
        {
            id: 'TRV123456788',
            type: 'tour',
            status: 'completed',
            bookingDate: '2024-11-20',
            serviceDate: '2024-12-05',
            title: 'Tour Đà Nẵng - Hội An 3N2Đ',
            details: 'Khách sạn 4* • 4 khách',
            passengers: 4,
            total: 15960000,
            canReview: true,
            rating: 5,
        },
        {
            id: 'TRV123456787',
            type: 'bus',
            status: 'cancelled',
            bookingDate: '2024-10-15',
            serviceDate: '2024-10-20',
            title: 'Xe TP.HCM - Đà Lạt',
            details: 'Giường nằm VIP • 22:30',
            passengers: 2,
            total: 700000,
            refunded: 350000,
        },
    ],
    savedTravelers: [
        {
            id: 1,
            name: 'Nguyễn Văn An',
            idType: 'cccd',
            idNumber: '123456789012',
            dateOfBirth: '1990-05-15',
            relationship: 'Bản thân',
        },
        {
            id: 2,
            name: 'Nguyễn Thị Bình',
            idType: 'cccd',
            idNumber: '123456789013',
            dateOfBirth: '1992-03-20',
            relationship: 'Vợ/Chồng',
        },
        {
            id: 3,
            name: 'Nguyễn Văn Cường',
            idType: 'cccd',
            idNumber: '123456789014',
            dateOfBirth: '2015-08-10',
            relationship: 'Con',
        },
    ],
    notifications: [
        {
            id: 1,
            type: 'booking_confirmed',
            title: 'Đặt chỗ thành công',
            message: 'Vé máy bay TRV123456789 đã được xác nhận',
            date: '2024-12-28 14:30',
            read: false,
        },
        {
            id: 2,
            type: 'price_alert',
            title: 'Cảnh báo giá vé',
            message: 'Giá vé TP.HCM - Đà Nẵng đã giảm 20%',
            date: '2024-12-27 09:15',
            read: true,
        },
        {
            id: 3,
            type: 'promotion',
            title: 'Khuyến mãi mới',
            message: 'Giảm 30% cho tour miền Bắc trong tháng 1',
            date: '2024-12-26 16:00',
            read: true,
        },
    ]
};

export default function TaiKhoan() {
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState(userData.profile);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'text-green-600 bg-green-50 border-green-200';
            case 'completed': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
            case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'confirmed': return 'Đã xác nhận';
            case 'completed': return 'Đã hoàn thành';
            case 'cancelled': return 'Đã hủy';
            case 'pending': return 'Chờ xác nhận';
            default: return status;
        }
    };

    const getServiceIcon = (type: string) => {
        switch (type) {
            case 'flight': return <Plane className="h-4 w-4" />;
            case 'bus': return <Bus className="h-4 w-4" />;
            case 'tour': return <MapIcon className="h-4 w-4" />;
            default: return <FileText className="h-4 w-4" />;
        }
    };

    const handleSaveProfile = () => {
        // Handle profile update
        console.log('Saving profile:', editForm);
        setIsEditing(false);
    };

    return (
        <>
            <div className="container py-6">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="lg:w-80">
                        <Card>
                            <CardContent className="p-6">
                                {/* User Info */}
                                <div className="text-center mb-6">
                                    <Avatar className="w-20 h-20 mx-auto mb-4">
                                        <AvatarImage src={userData.profile.avatar} />
                                        <AvatarFallback className="text-lg">
                                            {userData.profile.name.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <h2 className="text-xl font-bold">{userData.profile.name}</h2>
                                    <p className="text-muted-foreground">{userData.profile.email}</p>
                                    {userData.profile.verified && (
                                        <Badge variant="secondary" className="mt-2">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Đã xác thực
                                        </Badge>
                                    )}
                                </div>

                                {/* Navigation */}
                                <nav className="space-y-2">
                                    <Button
                                        variant={activeTab === 'overview' ? 'default' : 'ghost'}
                                        className="w-full justify-start"
                                        onClick={() => setActiveTab('overview')}
                                    >
                                        <User className="h-4 w-4 mr-2" />
                                        Tổng quan
                                    </Button>
                                    <Button
                                        variant={activeTab === 'bookings' ? 'default' : 'ghost'}
                                        className="w-full justify-start"
                                        onClick={() => setActiveTab('bookings')}
                                    >
                                        <FileText className="h-4 w-4 mr-2" />
                                        Đơn hàng của tôi
                                    </Button>
                                    <Button
                                        variant={activeTab === 'travelers' ? 'default' : 'ghost'}
                                        className="w-full justify-start"
                                        onClick={() => setActiveTab('travelers')}
                                    >
                                        <Users className="h-4 w-4 mr-2" />
                                        Hành khách thường đi
                                    </Button>
                                    <Button
                                        variant={activeTab === 'notifications' ? 'default' : 'ghost'}
                                        className="w-full justify-start"
                                        onClick={() => setActiveTab('notifications')}
                                    >
                                        <Bell className="h-4 w-4 mr-2" />
                                        Thông báo
                                    </Button>
                                    <Button
                                        variant={activeTab === 'settings' ? 'default' : 'ghost'}
                                        className="w-full justify-start"
                                        onClick={() => setActiveTab('settings')}
                                    >
                                        <Settings className="h-4 w-4 mr-2" />
                                        Cài đặt
                                    </Button>
                                </nav>

                                <Separator className="my-6" />

                                {/* Quick Stats */}
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Tổng đơn hàng</span>
                                        <span className="font-medium">{userData.bookings.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Đã hoàn thành</span>
                                        <span className="font-medium">
                                            {userData.bookings.filter(b => b.status === 'completed').length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Thành viên từ</span>
                                        <span className="font-medium">Jan 2023</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h1 className="text-2xl font-bold">Tổng quan tài khoản</h1>
                                </div>

                                {/* Profile Card */}
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle>Thông tin cá nhân</CardTitle>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsEditing(!isEditing)}
                                        >
                                            <Edit className="h-4 w-4 mr-2" />
                                            {isEditing ? 'Hủy' : 'Chỉnh sửa'}
                                        </Button>
                                    </CardHeader>
                                    <CardContent>
                                        {isEditing ? (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <Label htmlFor="name">Họ và tên</Label>
                                                        <Input
                                                            id="name"
                                                            value={editForm.name}
                                                            onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="phone">Số điện thoại</Label>
                                                        <Input
                                                            id="phone"
                                                            value={editForm.phone}
                                                            onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="email">Email</Label>
                                                        <Input
                                                            id="email"
                                                            type="email"
                                                            value={editForm.email}
                                                            onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="dateOfBirth">Ngày sinh</Label>
                                                        <Input
                                                            className="block h-12 bg-white shadow-md text-black w-full"
                                                            id="dateOfBirth"
                                                            type="date"
                                                            value={editForm.dateOfBirth}
                                                            onChange={(e) => setEditForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label htmlFor="address">Địa chỉ</Label>
                                                    <Input
                                                        id="address"
                                                        value={editForm.address}
                                                        onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button onClick={handleSaveProfile}>Lưu thay đổi</Button>
                                                    <Button variant="outline" onClick={() => setIsEditing(false)}>Hủy</Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm text-muted-foreground">Họ và tên:</span>
                                                        <span className="font-medium">{userData.profile.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm text-muted-foreground">Email:</span>
                                                        <span className="font-medium">{userData.profile.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm text-muted-foreground">Điện thoại:</span>
                                                        <span className="font-medium">{userData.profile.phone}</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm text-muted-foreground">Ngày sinh:</span>
                                                        <span className="font-medium">15/05/1990</span>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                        <span className="text-sm text-muted-foreground">Địa chỉ:</span>
                                                        <span className="font-medium">{userData.profile.address}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Recent Bookings */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Đơn hàng gần đây</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {userData.bookings.slice(0, 3).map((booking) => (
                                                <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-primary/10 rounded">
                                                            {getServiceIcon(booking.type)}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{booking.title}</div>
                                                            <div className="text-sm text-muted-foreground">{booking.details}</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <Badge className={getStatusColor(booking.status)}>
                                                            {getStatusText(booking.status)}
                                                        </Badge>
                                                        <div className="text-sm text-muted-foreground mt-1">
                                                            {formatPrice(booking.total)}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <Button variant="outline" className="w-full mt-4" onClick={() => setActiveTab('bookings')}>
                                            Xem tất cả đơn hàng
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Bookings Tab */}
                        {activeTab === 'bookings' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h1 className="text-2xl font-bold">Đơn hàng của tôi</h1>
                                    <div className="flex gap-2">
                                        <Select defaultValue="all">
                                            <SelectTrigger className="w-40">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Tất cả</SelectItem>
                                                <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                                                <SelectItem value="completed">Đã hoàn thành</SelectItem>
                                                <SelectItem value="cancelled">Đã hủy</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {userData.bookings.map((booking) => (
                                        <Card key={booking.id}>
                                            <CardContent className="p-6">
                                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                                    <div className="flex items-start gap-4">
                                                        <div className="p-3 bg-primary/10 rounded-lg">
                                                            {getServiceIcon(booking.type)}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <h3 className="font-semibold">{booking.title}</h3>
                                                                <Badge className={getStatusColor(booking.status)}>
                                                                    {getStatusText(booking.status)}
                                                                </Badge>
                                                            </div>
                                                            <div className="text-sm text-muted-foreground space-y-1">
                                                                <div>Mã đơn hàng: {booking.id}</div>
                                                                <div>Chi tiết: {booking.details}</div>
                                                                <div>Ngày đặt: {booking.bookingDate}</div>
                                                                <div>Ngày sử dụng: {booking.serviceDate}</div>
                                                                <div>Số khách: {booking.passengers}</div>
                                                                {booking.refunded && (
                                                                    <div className="text-green-600">Đã hoàn: {formatPrice(booking.refunded)}</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="text-right space-y-2">
                                                        <div className="text-xl font-bold text-primary">
                                                            {formatPrice(booking.total)}
                                                        </div>
                                                        <div className="flex flex-col gap-2">
                                                            <Button size="sm" variant="outline">
                                                                <Eye className="h-3 w-3 mr-1" />
                                                                Xem chi tiết
                                                            </Button>
                                                            {booking.canCancel && (
                                                                <Button size="sm" variant="outline">
                                                                    <XCircle className="h-3 w-3 mr-1" />
                                                                    Hủy đơn
                                                                </Button>
                                                            )}
                                                            {booking.canChange && (
                                                                <Button size="sm" variant="outline">
                                                                    <Edit className="h-3 w-3 mr-1" />
                                                                    Đổi lịch
                                                                </Button>
                                                            )}
                                                            {booking.canReview && (
                                                                <Button size="sm" variant="outline">
                                                                    <Star className="h-3 w-3 mr-1" />
                                                                    Đánh giá
                                                                </Button>
                                                            )}
                                                            {booking.status === 'confirmed' && (
                                                                <Button size="sm">
                                                                    <Download className="h-3 w-3 mr-1" />
                                                                    Tải vé
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Travelers Tab */}
                        {activeTab === 'travelers' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h1 className="text-2xl font-bold">Hành khách thường đi</h1>
                                    <Button>
                                        <Users className="h-4 w-4 mr-2" />
                                        Thêm hành khách
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {userData.savedTravelers.map((traveler) => (
                                        <Card key={traveler.id}>
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h3 className="font-semibold">{traveler.name}</h3>
                                                    <Button size="sm" variant="ghost">
                                                        <Edit className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                <div className="space-y-2 text-sm text-muted-foreground">
                                                    <div>Giấy tờ: {traveler.idType.toUpperCase()} - {traveler.idNumber}</div>
                                                    <div>Ngày sinh: {traveler.dateOfBirth}</div>
                                                    <div>Mối quan hệ: {traveler.relationship}</div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Notifications Tab */}
                        {activeTab === 'notifications' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h1 className="text-2xl font-bold">Thông báo</h1>
                                    <Button variant="outline" size="sm">
                                        Đánh dấu đã đọc tất cả
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {userData.notifications.map((notification) => (
                                        <Card key={notification.id} className={!notification.read ? 'border-primary/50' : ''}>
                                            <CardContent className="p-4">
                                                <div className="flex items-start gap-3">
                                                    <div className={`p-2 rounded-full ${!notification.read ? 'bg-primary/10' : 'bg-gray-100'}`}>
                                                        <Bell className="h-4 w-4" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <h4 className="font-medium">{notification.title}</h4>
                                                            <span className="text-xs text-muted-foreground">{notification.date}</span>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                                                        {!notification.read && (
                                                            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Settings Tab */}
                        {activeTab === 'settings' && (
                            <div className="space-y-6">
                                <h1 className="text-2xl font-bold">Cài đặt</h1>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Bảo mật tài khoản</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium">Đổi mật khẩu</div>
                                                <div className="text-sm text-muted-foreground">Cập nhật mật khẩu để bảo mật tài khoản</div>
                                            </div>
                                            <Button variant="outline">Đổi mật khẩu</Button>
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium">Xác thực 2 bước</div>
                                                <div className="text-sm text-muted-foreground">Tăng cường bảo mật với OTP</div>
                                            </div>
                                            <Button variant="outline">Thiết lập</Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Thông báo</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium">Email thông báo</div>
                                                <div className="text-sm text-muted-foreground">Nhận thông báo qua email</div>
                                            </div>
                                            <input type="checkbox" defaultChecked className="toggle" />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium">SMS thông báo</div>
                                                <div className="text-sm text-muted-foreground">Nhận thông báo qua SMS</div>
                                            </div>
                                            <input type="checkbox" defaultChecked className="toggle" />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium">Cảnh báo giá vé</div>
                                                <div className="text-sm text-muted-foreground">Thông báo khi giá vé thay đổi</div>
                                            </div>
                                            <input type="checkbox" className="toggle" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Khác</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <Button variant="outline" className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50">
                                            Xóa tài khoản
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
