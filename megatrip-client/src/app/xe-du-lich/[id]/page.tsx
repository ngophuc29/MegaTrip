"use client"
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Separator } from '../../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
    Bus,
    ArrowRight,
    Clock,
    Star,
    Users,
    MapPin,
    ChevronLeft,
    Timer,
    PlusCircle,
    Info,
    AlertCircle,
    Wifi,
    Coffee,
    Bed,
    Shield,
    Phone,
    Calendar,
    Minus,
    Plus,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Sample bus data
const busDetails = {
    id: 1,
    company: 'Phương Trang',
    route: 'TP.HCM - Đà Lạt',
    type: 'Giường nằm VIP',
    departure: { time: '22:30', location: 'Bến xe Miền Đông', address: '292 Đinh Bộ Lĩnh, Bình Thạnh, TP.HCM' },
    arrival: { time: '05:00+1', location: 'Bến xe Đà Lạt', address: '01 Tô Hiến Thành, Đà Lạt, Lâm Đồng' },
    duration: '6h 30m',
    distance: '308km',
    date: '15/01/2025',
    price: 350000,
    originalPrice: 420000,
    seats: 32,
    availableSeats: 8,
    amenities: ['wifi', 'blanket', 'water', 'toilet', 'entertainment'],
    rating: 4.5,
    reviews: 1250,
    images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    busNumber: 'PT-001',
    discount: 17,
    cancellable: true,
    pickup: [
        { location: 'Bến xe Miền Đông', time: '22:30', address: '292 Đinh Bộ Lĩnh, Bình Thạnh, TP.HCM' },
        { location: 'Ngã Tư Bình Phước', time: '22:45', address: 'Quốc lộ 1A, Bình Chánh, TP.HCM' },
        { location: 'Ngã Tư An Sương', time: '23:00', address: 'Quốc lộ 22, Hóc Môn, TP.HCM' },
    ],
    dropoff: [
        { location: 'Bến xe Đà Lạt', time: '05:00', address: '01 Tô Hiến Thành, Đà Lạt, Lâm Đồng' },
        { location: 'Chợ Đà Lạt', time: '05:15', address: 'Nguyễn Thị Minh Khai, Đà Lạt, Lâm Đồng' },
        { location: 'Ga Đà Lạt', time: '05:30', address: 'Quang Trung, Đà Lạt, Lâm Đồng' },
    ],
    policies: {
        cancellation: 'Miễn phí hủy trước 2 giờ khởi hành',
        baggage: 'Hành lý ký gửi: 20kg miễn phí, xách tay: 5kg',
        children: 'Trẻ em dưới 6 tuổi được miễn phí (không có ghế riêng)',
        pets: 'Không cho phép mang thú cưng',
    }
};

// Sample seat layout - simplified for demo
const seatLayout = [
    [
        { id: 'A1', type: 'bed', status: 'available', floor: 'upper' },
        { id: 'A2', type: 'bed', status: 'selected', floor: 'upper' },
        { id: 'A3', type: 'bed', status: 'occupied', floor: 'upper' },
        { id: 'A4', type: 'bed', status: 'available', floor: 'upper' },
    ],
    [
        { id: 'B1', type: 'bed', status: 'available', floor: 'lower' },
        { id: 'B2', type: 'bed', status: 'available', floor: 'lower' },
        { id: 'B3', type: 'bed', status: 'occupied', floor: 'lower' },
        { id: 'B4', type: 'bed', status: 'available', floor: 'lower' },
    ]
];

export default function ChiTietXeDuLich() {
    const router = useRouter();
    const { id } = useParams();
    // Số lượng khách từng loại
    const [participants, setParticipants] = useState({
        adults: 1,
        children: 0,
        infants: 0,
    });
    const [selectedPickup, setSelectedPickup] = useState(busDetails.pickup[0].location);
    const [selectedDropoff, setSelectedDropoff] = useState(busDetails.dropoff[0].location);
    const [selectedSeat, setSelectedSeat] = useState<string | null>('A2');
    const [passengerInfo, setPassengerInfo] = useState({
        name: '',
        phone: '',
        email: '',
        idNumber: '',
    });

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    const getAmenityIcon = (amenity: string) => {
        switch (amenity) {
            case 'wifi': return <Wifi className="h-4 w-4" />;
            case 'water': return '💧';
            case 'blanket': return <Bed className="h-4 w-4" />;
            case 'toilet': return '🚽';
            case 'entertainment': return '📺';
            default: return '•';
        }
    };

    const getSeatColor = (status: string) => {
        switch (status) {
            case 'available': return 'bg-green-100 border-green-300 hover:bg-green-200';
            case 'selected': return 'bg-primary border-primary text-primary-foreground';
            case 'occupied': return 'bg-gray-300 border-gray-400 cursor-not-allowed';
            default: return '';
        }
    };

    const handleSeatSelect = (seatId: string, status: string) => {
        if (status === 'available') {
            setSelectedSeat(seatId);
        }
    };

    // Hàm cập nhật số lượng khách
    const updateParticipantCount = (type: keyof typeof participants, increment: boolean) => {
        setParticipants(prev => ({
            ...prev,
            [type]: Math.max(type === 'adults' ? 1 : 0, prev[type] + (increment ? 1 : -1))
        }));
    };

    // Tính tổng tiền
    const calculateTotal = () => {
        const adultTotal = participants.adults * busDetails.price;
        // Giả sử trẻ em 75% giá vé, em bé 20% giá vé
        const childTotal = participants.children * Math.round(busDetails.price * 0.75);
        const infantTotal = participants.infants * Math.round(busDetails.price * 0.2);
        return adultTotal + childTotal + infantTotal;
    };

    const totalParticipants = participants.adults + participants.children + participants.infants;

    return (
        <>
            {/* Breadcrumb */}
            <div className="border-b">
                <div className="container py-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Link prefetch={false}  href="/" className="hover:text-primary">Trang chủ</Link>
                        <span>/</span>
                        <Link prefetch={false}  href="/xe-du-lich" className="hover:text-primary">Xe du lịch</Link>
                        <span>/</span>
                        <span>Chi tiết chuyến xe</span>
                    </div>
                </div>
            </div>

            <div className="container py-6">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content */}
                    <div className="flex-1 space-y-6">
                        {/* Back Button */}
                        <Button variant="outline" asChild className="w-fit">
                            <Link prefetch={false}  href="/xe-du-lich">
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Quay lại kết quả tìm kiếm
                            </Link>
                        </Button>

                        {/* Bus Details */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded bg-[hsl(var(--primary))/0.1] flex items-center justify-center">
                                            <Bus className="h-5 w-5 text-[hsl(var(--primary))]" />
                                        </div>
                                        <div>
                                            <div className="text-xl">{busDetails.company}</div>
                                            <div className="text-sm text-[hsl(var(--muted-foreground))] font-normal">
                                                {busDetails.busNumber} • {busDetails.type}
                                            </div>
                                        </div>
                                    </CardTitle>
                                    <div className="text-right">
                                        {busDetails.discount && (
                                            <Badge variant="destructive" className="mb-2">-{busDetails.discount}%</Badge>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                            <span className="font-medium">{busDetails.rating}</span>
                                            <span className="text-sm text-[hsl(var(--muted-foreground))]">({busDetails.reviews})</span>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Route */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <div className="text-2xl font-bold">{busDetails.departure.time}</div>
                                        <div className="text-lg font-medium">{busDetails.departure.location}</div>
                                        <div className="text-sm text-[hsl(var(--muted-foreground))]">{busDetails.departure.address}</div>
                                        <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{busDetails.date}</div>
                                    </div>

                                    <div className="flex flex-col items-center justify-center">
                                        <div className="text-sm text-[hsl(var(--muted-foreground))] mb-2">{busDetails.duration}</div>
                                        <div className="flex items-center w-full">
                                            <div className="flex-1 h-px bg-[hsl(var(--muted))]"></div>
                                            <ArrowRight className="h-5 w-5 mx-2 text-[hsl(var(--muted-foreground))]" />
                                            <div className="flex-1 h-px bg-[hsl(var(--muted))]"></div>
                                        </div>
                                        <div className="text-xs text-[hsl(var(--muted-foreground))] mt-2">{busDetails.distance}</div>
                                    </div>

                                    <div>
                                        <div className="text-2xl font-bold">{busDetails.arrival.time}</div>
                                        <div className="text-lg font-medium">{busDetails.arrival.location}</div>
                                        <div className="text-sm text-[hsl(var(--muted-foreground))]">{busDetails.arrival.address}</div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Amenities and Info */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <h4 className="font-medium mb-2">Tiện ích</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {busDetails.amenities.map((amenity, index) => (
                                                <div key={index} className="flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))]">
                                                    {getAmenityIcon(amenity)}
                                                    <span className="capitalize">{amenity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-medium mb-2">Thông tin xe</h4>
                                        <div className="space-y-1 text-sm text-[hsl(var(--muted-foreground))]">
                                            <div>Tổng ghế: {busDetails.seats}</div>
                                            <div>Còn trống: {busDetails.availableSeats} ghế</div>
                                            <div>Loại xe: {busDetails.type}</div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-medium mb-2">Chính sách</h4>
                                        <div className="space-y-1 text-sm text-[hsl(var(--muted-foreground))]">
                                            <div>{busDetails.cancellable ? '✓ Có hoàn hủy' : '✗ Không hoàn hủy'}</div>
                                            <div>✓ Hành lý 20kg</div>
                                            <div>✓ WiFi miễn phí</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pickup/Dropoff Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Chọn điểm đón và trả</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label className="text-base font-medium mb-3 block">Điểm đón</Label>
                                        <div className="space-y-3">
                                            {busDetails.pickup.map((point, index) => (
                                                <div
                                                    key={index}
                                                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${selectedPickup === point.location ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'
                                                        }`}
                                                    onClick={() => setSelectedPickup(point.location)}
                                                >
                                                    <div className="flex items-start space-x-3">
                                                        <input
                                                            type="radio"
                                                            name="pickup"
                                                            checked={selectedPickup === point.location}
                                                            onChange={() => setSelectedPickup(point.location)}
                                                            className="mt-1"
                                                        />
                                                        <div className="flex-1">
                                                            <div className="font-medium">{point.location}</div>
                                                            <div className="text-sm text-muted-foreground">{point.address}</div>
                                                            <div className="text-sm text-primary font-medium">{point.time}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-base font-medium mb-3 block">Điểm trả</Label>
                                        <div className="space-y-3">
                                            {busDetails.dropoff.map((point, index) => (
                                                <div
                                                    key={index}
                                                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${selectedDropoff === point.location ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'
                                                        }`}
                                                    onClick={() => setSelectedDropoff(point.location)}
                                                >
                                                    <div className="flex items-start space-x-3">
                                                        <input
                                                            type="radio"
                                                            name="dropoff"
                                                            checked={selectedDropoff === point.location}
                                                            onChange={() => setSelectedDropoff(point.location)}
                                                            className="mt-1"
                                                        />
                                                        <div className="flex-1">
                                                            <div className="font-medium">{point.location}</div>
                                                            <div className="text-sm text-muted-foreground">{point.address}</div>
                                                            <div className="text-sm text-primary font-medium">{point.time}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Seat Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Chọn vị trí ngồi</CardTitle>
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                                        <span>Còn trống</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-primary border border-primary rounded"></div>
                                        <span>Đã chọn</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-gray-300 border border-gray-400 rounded"></div>
                                        <span>Đã đặt</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="max-w-md mx-auto">
                                    {/* Driver */}
                                    <div className="text-center mb-4">
                                        <div className="inline-block bg-gray-200 rounded-lg px-4 py-2 text-sm">
                                            🚗 Tài xế
                                        </div>
                                    </div>

                                    {/* Seats */}
                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-sm font-medium mb-2">Tầng trên</div>
                                            <div className="grid grid-cols-4 gap-2">
                                                {seatLayout[0].map((seat) => (
                                                    <button
                                                        key={seat.id}
                                                        className={`aspect-square border-2 rounded text-xs font-medium ${getSeatColor(seat.status)}`}
                                                        onClick={() => handleSeatSelect(seat.id, seat.status)}
                                                        disabled={seat.status === 'occupied'}
                                                    >
                                                        {seat.id}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-sm font-medium mb-2">Tầng dưới</div>
                                            <div className="grid grid-cols-4 gap-2">
                                                {seatLayout[1].map((seat) => (
                                                    <button
                                                        key={seat.id}
                                                        className={`aspect-square border-2 rounded text-xs font-medium ${getSeatColor(seat.status)}`}
                                                        onClick={() => handleSeatSelect(seat.id, seat.status)}
                                                        disabled={seat.status === 'occupied'}
                                                    >
                                                        {seat.id}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {selectedSeat && (
                                        <div className="mt-4 p-3 bg-primary/5 rounded-lg text-center">
                                            <div className="font-medium">Ghế đã chọn: {selectedSeat}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {seatLayout.flat().find(s => s.id === selectedSeat)?.floor === 'upper' ? 'Tầng trên' : 'Tầng dưới'}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Passenger Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin hành khách</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="name">Họ và tên *</Label>
                                        <Input
                                            id="name"
                                            value={passengerInfo.name}
                                            onChange={(e) => setPassengerInfo(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="Nhập họ và tên"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="phone">Số điện thoại *</Label>
                                        <Input
                                            id="phone"
                                            value={passengerInfo.phone}
                                            onChange={(e) => setPassengerInfo(prev => ({ ...prev, phone: e.target.value }))}
                                            placeholder="Nhập số điện thoại"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={passengerInfo.email}
                                            onChange={(e) => setPassengerInfo(prev => ({ ...prev, email: e.target.value }))}
                                            placeholder="Nhập email"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="idNumber">CCCD/CMND</Label>
                                        <Input
                                            id="idNumber"
                                            value={passengerInfo.idNumber}
                                            onChange={(e) => setPassengerInfo(prev => ({ ...prev, idNumber: e.target.value }))}
                                            placeholder="Nhập số CCCD/CMND"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Policies */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Chính sách và điều kiện</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-medium mb-2">Chính sách hủy vé</h4>
                                        <p className="text-sm text-[hsl(var(--muted-foreground))]">{busDetails.policies.cancellation}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-2">Hành lý</h4>
                                        <p className="text-sm text-[hsl(var(--muted-foreground))]">{busDetails.policies.baggage}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-2">Trẻ em</h4>
                                        <p className="text-sm text-[hsl(var(--muted-foreground))]">{busDetails.policies.children}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-2">Thú cưng</h4>
                                        <p className="text-sm text-[hsl(var(--muted-foreground))]">{busDetails.policies.pets}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar - Booking Summary */}
                    <div className="lg:w-96">
                        <Card className="sticky top-20">
                            <CardHeader>
                                <CardTitle>Đặt vé xe</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Số lượng khách */}
                                <div>
                                    <Label className="text-base font-medium mb-3 block">Số lượng khách</Label>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium">Người lớn</div>
                                                <div className="text-sm text-muted-foreground">≥ 12 tuổi</div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => updateParticipantCount('adults', false)}
                                                    disabled={participants.adults <= 1}
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                                <span className="w-8 text-center">{participants.adults}</span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => updateParticipantCount('adults', true)}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium">Trẻ em</div>
                                                <div className="text-sm text-muted-foreground">2-11 tuổi</div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => updateParticipantCount('children', false)}
                                                    disabled={participants.children <= 0}
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                                <span className="w-8 text-center">{participants.children}</span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => updateParticipantCount('children', true)}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium">Em bé</div>
                                                <div className="text-sm text-muted-foreground">&lt; 2 tuổi</div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => updateParticipantCount('infants', false)}
                                                    disabled={participants.infants <= 0}
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                                <span className="w-8 text-center">{participants.infants}</span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => updateParticipantCount('infants', true)}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <Separator />
                                {/* Trip Summary */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium">Tuyến xe</span>
                                        <span className="text-sm text-[hsl(var(--muted-foreground))]">{busDetails.busNumber}</span>
                                    </div>
                                    <div className="text-sm text-[hsl(var(--muted-foreground))] space-y-1">
                                        <div>{busDetails.route}</div>
                                        <div>{busDetails.date} • {busDetails.departure.time} - {busDetails.arrival.time}</div>
                                        <div>{busDetails.type}</div>
                                    </div>
                                </div>
                                <Separator />
                                {/* Selected Details */}
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>Điểm đón:</span>
                                        <span className="text-right">{selectedPickup}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Điểm trả:</span>
                                        <span className="text-right">{selectedDropoff}</span>
                                    </div>
                                    {selectedSeat && (
                                        <div className="flex justify-between">
                                            <span>Ghế:</span>
                                            <span>{selectedSeat}</span>
                                        </div>
                                    )}
                                </div>
                                <Separator />
                                {/* Pricing */}
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Người lớn ({participants.adults})</span>
                                        <span>{formatPrice(participants.adults * busDetails.price)}</span>
                                    </div>
                                    {participants.children > 0 && (
                                        <div className="flex justify-between">
                                            <span>Trẻ em ({participants.children})</span>
                                            <span>{formatPrice(participants.children * Math.round(busDetails.price * 0.75))}</span>
                                        </div>
                                    )}
                                    {participants.infants > 0 && (
                                        <div className="flex justify-between">
                                            <span>Em bé ({participants.infants})</span>
                                            <span>{formatPrice(participants.infants * Math.round(busDetails.price * 0.2))}</span>
                                        </div>
                                    )}
                                    {busDetails.originalPrice && (
                                        <div className="flex justify-between text-sm text-muted-foreground">
                                            <span>Giá gốc</span>
                                            <span className="line-through">{formatPrice(busDetails.originalPrice * totalParticipants)}</span>
                                        </div>
                                    )}
                                    <Separator />
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Tổng cộng</span>
                                        <span className="text-[hsl(var(--primary))]">{formatPrice(calculateTotal())}</span>
                                    </div>
                                    <div className="text-xs text-[hsl(var(--muted-foreground))]">
                                        Tổng {totalParticipants} khách • Giá đã bao gồm thuế và phí
                                    </div>
                                </div>

                                <Separator />

                                {/* Important Notes */}
                                <div className="space-y-2">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="h-4 w-4 text-[hsl(var(--warning))] mt-0.5" />
                                        <div className="text-xs text-[hsl(var(--muted-foreground))]">
                                            Vui lòng có mặt tại điểm đón trước 15 phút
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Info className="h-4 w-4 text-[hsl(var(--primary))] mt-0.5" />
                                        <div className="text-xs text-[hsl(var(--muted-foreground))]">
                                            Mang theo CCCD/CMND khi đi xe
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-2 pt-4">
                                    <Button className="w-full" size="lg" onClick={() => {
                                        const basePrice = (participants.adults * busDetails.price) + (participants.children * Math.round(busDetails.price * 0.75)) + (participants.infants * Math.round(busDetails.price * 0.2));
                                        const taxes = Math.round(basePrice * 0.08); // demo: 8% thuế
                                        const addOns = 0; // xe chưa có dịch vụ thêm
                                        const discount = busDetails.originalPrice ? basePrice - calculateTotal() : 0;
                                        const total = basePrice + taxes + addOns - discount;
                                        const params = new URLSearchParams({
                                            type: 'bus',
                                            route: busDetails.route,
                                            date: busDetails.date,
                                            time: `${busDetails.departure.time} - ${busDetails.arrival.time}`,
                                            basePrice: basePrice.toString(),
                                            taxes: taxes.toString(),
                                            addOns: addOns.toString(),
                                            discount: discount.toString(),
                                            total: total.toString(),
                                            adults: participants.adults.toString(),
                                            children: participants.children.toString(),
                                            infants: participants.infants.toString(),
                                        });
                                        router.push(`/thanh-toan?${params.toString()}`);
                                    }}>
                                        Tiếp tục thanh toán
                                    </Button>
                                    <Button variant="outline" className="w-full">
                                        <PlusCircle className="h-4 w-4 mr-2" />
                                        Thêm vào giỏ hàng
                                    </Button>
                                </div>

                                {/* Contact */}
                                <div className="pt-4 border-t">
                                    <div className="text-center">
                                        <div className="text-sm font-medium mb-1">Cần hỗ trợ?</div>
                                        <div className="flex items-center justify-center gap-1 text-sm text-primary">
                                            <Phone className="h-3 w-3" />
                                            <span>1900 1234</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
