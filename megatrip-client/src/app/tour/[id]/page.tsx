"use client"
import { useState } from 'react';
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Calendar } from '../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Textarea } from '../../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Progress } from '../../components/ui/progress';
import {
    Map,
    Star,
    Users,
    Calendar as CalendarIcon,
    MapPin,
    ChevronLeft,
    Timer,
    PlusCircle,
    Info,
    AlertCircle,
    Plane,
    Hotel,
    Utensils,
    Camera,
    Heart,
    Share2,
    Phone,
    Clock,
    CheckCircle,
    XCircle,
    Plus,
    Minus,
    ThumbsUp,
    ThumbsDown,
    Send,
    Flag,
    ImageIcon,
    PlayCircle,
    MoreHorizontal,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useRouter } from 'next/navigation';

// Sample tour data with enhanced information
const tourDetails = {
    id: 1,
    name: 'Đà Nẵng - Hội An - Bà Nà Hills 3N2Đ',
    departure: 'TP. Hồ Chí Minh',
    destinations: ['Đà Nẵng', 'Hội An', 'Bà Nà Hills'],
    duration: '3 ngày 2 đêm',
    maxGroup: 35,
    priceFrom: 3990000,
    originalPrice: 4990000,
    rating: 4.8,
    reviews: 245,
    description: `Tour Đà Nẵng - Hội An - Bà Nà Hills 3N2Đ là hành trình khám phá vẻ đẹp miền Trung Việt Nam với những điểm đến nổi tiếng nhất. Bạn sẽ được trải nghiệm Cầu Vàng Bà Nà Hills - kỳ quan mới của thế giới, khám phá phố cổ Hội An - di sản văn hóa thế giới, thưởng thức ẩm thực đặc sắc và tắm biển tại bãi biển Mỹ Khê xinh đẹp.`,
    images: [
        { url: '/placeholder.svg', title: 'Cầu Vàng Bà Nà Hills', type: 'image' },
        { url: '/placeholder.svg', title: 'Phố cổ Hội An', type: 'image' },
        { url: '/placeholder.svg', title: 'Bãi biển Mỹ Khê', type: 'image' },
        { url: '/placeholder.svg', title: 'Chùa Cầu Nhật Bản', type: 'image' },
        { url: '/placeholder.svg', title: 'Video tour overview', type: 'video' },
        { url: '/placeholder.svg', title: 'Khách sạn 4 sao', type: 'image' },
    ],
    includes: ['Vé máy bay khứ hồi', 'Khách sạn 4*', '6 bữa ăn', 'Vé tham quan', 'HDV tiếng Việt', 'Bảo hiểm du lịch'],
    excludes: ['Chi phí cá nhân', 'Tiền tip HDV, tài xế', 'Đồ uống có cồn', 'Vé tham quan ngoài chương trình'],
    highlights: ['Cầu Vàng Bà Nà Hills', 'Phố cổ Hội An', 'Bãi biển Mỹ Khê', 'Chùa Cầu Nhật Bản'],
    attractions: [
        {
            name: 'Bà Nà Hills',
            description: 'Khu du lịch nổi tiếng với Cầu Vàng và làng Pháp cổ kính',
            duration: '1 ngày',
            highlights: ['Cầu Vàng', 'Làng Pháp', 'Cáp treo', 'Chùa Linh Ứng']
        },
        {
            name: 'Phố cổ Hội An',
            description: 'Di sản văn hóa thế giới với kiến trúc cổ độc đáo',
            duration: '1 ngày',
            highlights: ['Chùa Cầu', 'Nhà cổ', 'Đèn lồng', 'Ẩm thực địa phương']
        },
        {
            name: 'Ngũ Hành Sơn',
            description: 'Quần thể 5 ngọn núi đá vôi với động thiêng liêng',
            duration: 'Nửa ngày',
            highlights: ['Động Huyền Không', 'Chùa Tam Thai', 'Làng đá Non Nước']
        }
    ],
    availableDates: [
        { date: '2025-01-15', available: 12, price: 3990000, status: 'available' },
        { date: '2025-01-22', available: 8, price: 4190000, status: 'filling' },
        { date: '2025-01-29', available: 15, price: 3990000, status: 'available' },
        { date: '2025-02-05', available: 20, price: 4390000, status: 'available' },
        { date: '2025-02-12', available: 5, price: 4590000, status: 'limited' },
        { date: '2025-02-19', available: 18, price: 4190000, status: 'available' },
        { date: '2025-02-26', available: 0, price: 4590000, status: 'soldout' },
        { date: '2025-03-05', available: 25, price: 3990000, status: 'available' },
    ],
    itinerary: [
        {
            day: 1,
            title: 'TP.HCM - Đà Nẵng - Bà Nà Hills',
            activities: [
                'Tập trung sân bay Tân Sơn Nhất, bay đến Đà Nẵng',
                'Ăn trưa tại nhà hàng địa phương',
                'Tham quan Bà Nà Hills - Cầu Vàng',
                'Trải nghiệm cáp treo dài nhất thế giới',
                'Check-in khách sạn, nghỉ ngơi',
            ],
            meals: ['Trưa', 'Tối'],
            accommodation: 'Khách sạn 4* Đà Nẵng',
            transport: 'Máy bay + Xe du lịch',
        },
        {
            day: 2,
            title: 'Đà Nẵng - Hội An',
            activities: [
                'Ăn sáng tại khách sạn',
                'Tham quan Ngũ Hành Sơn',
                'Ăn trưa tại Hội An',
                'Khám phá phố cổ Hội An',
                'Chùa Cầu Nhật Bản',
                'Mua sắm đèn lồng và đặc sản địa phương',
            ],
            meals: ['Sáng', 'Trưa', 'Tối'],
            accommodation: 'Khách sạn 4* Hội An',
            transport: 'Xe du lịch',
        },
        {
            day: 3,
            title: 'Hội An - Đà Nẵng - TP.HCM',
            activities: [
                'Ăn sáng tại khách sạn',
                'Tự do tắm biển Cửa Đại',
                'Mua sắm tại chợ Hội An',
                'Ăn trưa tại nhà hàng',
                'Ra sân bay Đà Nẵng, bay về TP.HCM',
            ],
            meals: ['Sáng', 'Trưa'],
            accommodation: 'Không',
            transport: 'Xe du lịch + Máy bay',
        },
    ],
    pricing: {
        adult: 3990000,
        child: 3190000,
        infant: 990000,
        singleSupplement: 800000,
    },
    policies: {
        cancellation: {
            'Trước 15 ngày': '20% tổng tiền tour',
            'Trước 7-14 ngày': '50% tổng tiền tour',
            'Trước 3-6 ngày': '75% tổng tiền tour',
            'Trong vòng 2 ngày': '100% tổng tiền tour',
        },
        children: 'Trẻ em dưới 2 tuổi: 25% giá tour người lớn (không ghế máy bay, chung giường). Trẻ em 2-11 tuổi: 80% giá tour người lớn.',
        documents: 'CCCD/CMND còn hạn ít nhất 6 tháng. Trẻ em dưới 14 tuổi cần giấy khai sinh.',
    },
    reviews: {
        overall: 4.8,
        breakdown: {
            service: 4.9,
            value: 4.7,
            cleanliness: 4.8,
            location: 4.9,
            amenities: 4.6
        },
        distribution: {
            5: 75,
            4: 15,
            3: 8,
            2: 2,
            1: 0
        },
        comments: [
            {
                id: 1,
                user: {
                    name: 'Nguyễn Văn A',
                    avatar: '/placeholder.svg',
                    verified: true,
                    trips: 5
                },
                rating: 5,
                date: '2024-12-15',
                title: 'Tour tuyệt vời, HDV nhiệt tình',
                content: 'Tour được tổ chức rất tốt, lịch trình hợp lý. HDV nhiệt tình, am hiểu về địa phương. Cầu Vàng thật sự đẹp như trong ảnh. Khách sạn sạch sẽ, ăn uống ngon. Sẽ giới thiệu cho bạn bè.',
                helpful: 15,
                photos: ['/placeholder.svg', '/placeholder.svg'],
                response: {
                    from: 'MegaTrip',
                    content: 'Cảm ơn anh/chị đã chia sẻ. Chúng tôi rất vui khi anh/chị hài lòng với tour. Hẹn gặp lại trong những chuyến đi tiếp theo!'
                }
            },
            {
                id: 2,
                user: {
                    name: 'Trần Thị B',
                    avatar: '/placeholder.svg',
                    verified: true,
                    trips: 12
                },
                rating: 4,
                date: '2024-12-10',
                title: 'Đẹp nhưng hơi vội',
                content: 'Các điểm tham quan đều rất đẹp, đặc biệt là Hội An về đêm. Tuy nhiên lịch trình hơi dày, ít thời gian tự do. Ăn uống ở Hội An rất ngon. Chụp ảnh check-in nhiều.',
                helpful: 8,
                photos: []
            },
            {
                id: 3,
                user: {
                    name: 'Lê Văn C',
                    avatar: '/placeholder.svg',
                    verified: false,
                    trips: 2
                },
                rating: 5,
                date: '2024-12-05',
                title: 'Giá trị tốt cho tiền bỏ ra',
                content: 'So với giá tiền thì tour này khá ổn. Khách sạn ok, xe đời mới. Bà Nà Hills hơi đông nhưng cảnh đẹp. HDV hướng dẫn tận tình.',
                helpful: 5,
                photos: ['/placeholder.svg']
            }
        ]
    }
};

export default function ChiTietTour() {
    const router = useRouter();
    const { id } = useParams();
    const [selectedDate, setSelectedDate] = useState<Date>();
    const [participants, setParticipants] = useState({
        adults: 2,
        children: 0,
        infants: 0,
    });
    const [singleRooms, setSingleRooms] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [activeImage, setActiveImage] = useState(0);
    const [showAllImages, setShowAllImages] = useState(false);
    const [newReview, setNewReview] = useState({
        rating: 5,
        title: '',
        content: ''
    });

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit'
        });
    };

    const getStatusBadge = (status: string, available: number) => {
        switch (status) {
            case 'available':
                return <Badge className="bg-green-100 text-green-800">Còn {available} chỗ</Badge>;
            case 'filling':
                return <Badge className="bg-yellow-100 text-yellow-800">Sắp đầy</Badge>;
            case 'limited':
                return <Badge className="bg-orange-100 text-orange-800">Còn ít chỗ</Badge>;
            case 'soldout':
                return <Badge variant="destructive">Hết chỗ</Badge>;
            default:
                return null;
        }
    };

    const updateParticipantCount = (type: keyof typeof participants, increment: boolean) => {
        setParticipants(prev => ({
            ...prev,
            [type]: Math.max(0, prev[type] + (increment ? 1 : -1))
        }));
    };

    const updateSingleRooms = (increment: boolean) => {
        setSingleRooms(prev => Math.max(0, prev + (increment ? 1 : -1)));
    };

    const calculateTotal = () => {
        const adultTotal = participants.adults * tourDetails.pricing.adult;
        const childTotal = participants.children * tourDetails.pricing.child;
        const infantTotal = participants.infants * tourDetails.pricing.infant;
        const singleSupplementTotal = singleRooms * tourDetails.pricing.singleSupplement;

        return adultTotal + childTotal + infantTotal + singleSupplementTotal;
    };

    const getSelectedDateInfo = () => {
        if (!selectedDate) return null;
        const dateStr = selectedDate.toISOString().split('T')[0];
        return tourDetails.availableDates.find(d => d.date === dateStr);
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
                        <Link prefetch={false}  href="/tour" className="hover:text-primary">Tour</Link>
                        <span>/</span>
                        <span>Chi tiết tour</span>
                    </div>
                </div>
            </div>

            <div className="container py-6">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content */}
                    <div className="flex-1 space-y-6">
                        {/* Back Button */}
                        <Button variant="outline" asChild className="w-fit">
                            <Link prefetch={false}  href="/tour">
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Quay lại danh sách tour
                            </Link>
                        </Button>

                        {/* Tour Header with Enhanced Image Gallery */}
                        <Card>
                            <CardContent className="p-0">
                                <div className="grid grid-cols-1 lg:grid-cols-2">
                                    {/* Enhanced Image Gallery */}
                                    <div className="relative">
                                        <div className="relative h-80">
                                            <img
                                                src={tourDetails.images[activeImage].url}
                                                alt={tourDetails.images[activeImage].title}
                                                className="w-full h-full object-cover"
                                            />
                                            {tourDetails.images[activeImage].type === 'video' && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <PlayCircle className="h-16 w-16 text-white opacity-80" />
                                                </div>
                                            )}
                                            <div className="absolute top-4 left-4">
                                                <Badge variant="destructive">Sale 20%</Badge>
                                            </div>
                                            <div className="absolute top-4 right-4 flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => setIsLiked(!isLiked)}
                                                >
                                                    <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                                                </Button>
                                                <Button size="sm" variant="secondary">
                                                    <Share2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="absolute bottom-4 right-4">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => setShowAllImages(true)}
                                                >
                                                    <ImageIcon className="h-4 w-4 mr-1" />
                                                    {tourDetails.images.length} ảnh
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Image Thumbnails */}
                                        <div className="flex gap-2 p-4 overflow-x-auto">
                                            {tourDetails.images.slice(0, 5).map((image, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setActiveImage(index)}
                                                    className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 ${activeImage === index ? 'border-primary' : 'border-transparent'
                                                        }`}
                                                >
                                                    <img
                                                        src={image.url}
                                                        alt={image.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    {image.type === 'video' && (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <PlayCircle className="h-4 w-4 text-white" />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                            {tourDetails.images.length > 5 && (
                                                <button
                                                    onClick={() => setShowAllImages(true)}
                                                    className="flex-shrink-0 w-16 h-16 rounded bg-gray-100 flex items-center justify-center text-xs"
                                                >
                                                    +{tourDetails.images.length - 5}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Tour Info */}
                                    <div className="p-6">
                                        <h1 className="text-2xl lg:text-3xl font-bold mb-3">{tourDetails.name}</h1>

                                        <div className="space-y-3 mb-4">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <MapPin className="h-4 w-4" />
                                                <span>Khởi hành từ {tourDetails.departure}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Timer className="h-4 w-4" />
                                                <span>{tourDetails.duration}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Users className="h-4 w-4" />
                                                <span>Tối đa {tourDetails.maxGroup} khách</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="flex items-center">
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                                                <span className="font-medium">{tourDetails.rating}</span>
                                            </div>
                                            <span className="text-muted-foreground">({tourDetails.reviews.comments.length} đánh giá)</span>
                                        </div>

                                        <div className="space-y-2">
                                            {tourDetails.originalPrice && (
                                                <div className="text-lg text-muted-foreground line-through">
                                                    {formatPrice(tourDetails.originalPrice)}
                                                </div>
                                            )}
                                            <div className="text-2xl lg:text-3xl font-bold text-primary">
                                                Từ {formatPrice(tourDetails.priceFrom)}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Giá cho 1 người lớn</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Available Dates Calendar */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Lịch khởi hành & Giá tour</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {tourDetails.availableDates.map((dateInfo, index) => (
                                        <div
                                            key={index}
                                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${dateInfo.status === 'soldout'
                                                    ? 'bg-[hsl(var(--muted))] cursor-not-allowed opacity-60'
                                                    : 'hover:bg-[hsl(var(--primary))/0.05] hover:border-[hsl(var(--primary))]'
                                                }`}
                                            onClick={() => {
                                                if (dateInfo.status !== 'soldout') {
                                                    setSelectedDate(new Date(dateInfo.date));
                                                }
                                            }}
                                        >
                                            <div className="text-sm font-medium">{formatDate(dateInfo.date)}</div>
                                            <div className="text-xs text-[hsl(var(--primary))] font-semibold">{formatPrice(dateInfo.price)}</div>
                                            <div className="mt-1">
                                                {getStatusBadge(dateInfo.status, dateInfo.available)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tour Overview */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Giới thiệu tour</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <p className="text-muted-foreground leading-relaxed">{tourDetails.description}</p>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="text-lg font-semibold mb-3">Điểm nổi bật</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {tourDetails.highlights.map((highlight, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                <span className="text-sm">{highlight}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="text-lg font-semibold mb-3">Điểm đến</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {tourDetails.destinations.map((destination, index) => (
                                            <Badge key={index} variant="secondary">
                                                {destination}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Itinerary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Lịch trình chi tiết</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible className="w-full">
                                    {tourDetails.itinerary.map((day) => (
                                        <AccordionItem key={day.day} value={`day-${day.day}`}>
                                            <AccordionTrigger>
                                                <div className="text-left">
                                                    <div className="font-semibold">Ngày {day.day}: {day.title}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        Bữa ăn: {day.meals.join(', ')} • Nghỉ: {day.accommodation}
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="space-y-4">
                                                    <div>
                                                        <h4 className="font-medium mb-2">Hoạt động</h4>
                                                        <ul className="space-y-1">
                                                            {day.activities.map((activity, index) => (
                                                                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                                                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                                                                    {activity}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <Utensils className="h-4 w-4 text-orange-500" />
                                                            <span>Bữa ăn: {day.meals.join(', ')}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Hotel className="h-4 w-4 text-blue-500" />
                                                            <span>Nghỉ: {day.accommodation}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Plane className="h-4 w-4 text-green-500" />
                                                            <span>Di chuyển: {day.transport}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </CardContent>
                        </Card>

                        {/* Attractions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Các điểm tham quan</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {tourDetails.attractions.map((attraction, index) => (
                                    <Card key={index}>
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-semibold">{attraction.name}</h4>
                                                <Badge variant="outline">{attraction.duration}</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-3">{attraction.description}</p>
                                            <div className="flex flex-wrap gap-1">
                                                {attraction.highlights.map((highlight, idx) => (
                                                    <Badge key={idx} variant="secondary" className="text-xs">
                                                        {highlight}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Included/Excluded */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Dịch vụ bao gồm</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3 text-[hsl(var(--success))]">Bao gồm</h3>
                                        <div className="space-y-2">
                                            {tourDetails.includes.map((item, index) => (
                                                <div key={index} className="flex items-start gap-2">
                                                    <CheckCircle className="h-4 w-4 text-[hsl(var(--success))] mt-0.5" />
                                                    <span className="text-sm">{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold mb-3 text-[hsl(var(--destructive))]">Không bao gồm</h3>
                                        <div className="space-y-2">
                                            {tourDetails.excludes.map((item, index) => (
                                                <div key={index} className="flex items-start gap-2">
                                                    <XCircle className="h-4 w-4 text-[hsl(var(--destructive))] mt-0.5" />
                                                    <span className="text-sm">{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Policies */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Chính sách tour</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-3">Chính sách hủy tour</h3>
                                    <div className="space-y-2">
                                        {Object.entries(tourDetails.policies.cancellation).map(([time, fee]) => (
                                            <div key={time} className="flex justify-between p-2 bg-[hsl(var(--muted))] rounded">
                                                <span className="text-sm">{time}</span>
                                                <span className="text-sm font-medium">{fee}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-3">Trẻ em</h3>
                                    <p className="text-sm text-muted-foreground">{tourDetails.policies.children}</p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-3">Giấy tờ cần thiết</h3>
                                    <p className="text-sm text-muted-foreground">{tourDetails.policies.documents}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Reviews */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Đánh giá từ khách hàng</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Rating Overview */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <div className="text-center">
                                            <div className="text-4xl font-bold text-primary mb-2">{tourDetails.reviews.overall}</div>
                                            <div className="flex justify-center mb-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`h-5 w-5 ${i < Math.floor(tourDetails.reviews.overall)
                                                                ? 'fill-yellow-400 text-yellow-400'
                                                                : 'text-gray-300'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Dựa trên {tourDetails.reviews.comments.length} đánh giá
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {Object.entries(tourDetails.reviews.distribution).reverse().map(([stars, count]) => (
                                            <div key={stars} className="flex items-center gap-2">
                                                <span className="text-sm w-8">{stars}★</span>
                                                <Progress value={(count / 100) * 100} className="flex-1" />
                                                <span className="text-sm text-muted-foreground w-8">{count}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Separator />

                                {/* Detailed Ratings */}
                                <div>
                                    <h4 className="font-semibold mb-3">Đánh giá chi tiết</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                        {Object.entries(tourDetails.reviews.breakdown).map(([category, rating]) => (
                                            <div key={category} className="text-center">
                                                <div className="font-medium text-primary">{rating}</div>
                                                <div className="text-xs text-muted-foreground capitalize">{category}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Separator />

                                {/* Write Review */}
                                <div>
                                    <h4 className="font-semibold mb-3">Viết đánh giá</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <Label className="text-sm font-medium">Đánh giá tổng thể</Label>
                                            <div className="flex gap-1 mt-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => setNewReview(prev => ({ ...prev, rating: i + 1 }))}
                                                    >
                                                        <Star
                                                            className={`h-5 w-5 ${i < newReview.rating
                                                                    ? 'fill-yellow-400 text-yellow-400'
                                                                    : 'text-gray-300'
                                                                }`}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="review-title">Tiêu đề</Label>
                                            <Input
                                                id="review-title"
                                                placeholder="Tóm tắt trải nghiệm của bạn"
                                                value={newReview.title}
                                                onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="review-content">Nội dung đánh giá</Label>
                                            <Textarea
                                                id="review-content"
                                                placeholder="Chia sẻ chi tiết về trải nghiệm tour của bạn..."
                                                rows={4}
                                                value={newReview.content}
                                                onChange={(e) => setNewReview(prev => ({ ...prev, content: e.target.value }))}
                                            />
                                        </div>

                                        <Button>
                                            <Send className="h-4 w-4 mr-2" />
                                            Gửi đánh giá
                                        </Button>
                                    </div>
                                </div>

                                <Separator />

                                {/* Reviews List */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold">Đánh giá từ khách hàng</h4>
                                    {tourDetails.reviews.comments.map((review) => (
                                        <Card key={review.id}>
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10">
                                                            <AvatarImage src={review.user.avatar} />
                                                            <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium">{review.user.name}</span>
                                                                {review.user.verified && (
                                                                    <Badge variant="secondary" className="text-xs">Verified</Badge>
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {review.user.trips} chuyến đi • {review.date}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </div>

                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="flex">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`h-4 w-4 ${i < review.rating
                                                                        ? 'fill-yellow-400 text-yellow-400'
                                                                        : 'text-gray-300'
                                                                    }`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="font-medium">{review.title}</span>
                                                </div>

                                                <p className="text-sm text-muted-foreground mb-3">{review.content}</p>

                                                {review.photos && review.photos.length > 0 && (
                                                    <div className="flex gap-2 mb-3">
                                                        {review.photos.map((photo, index) => (
                                                            <img
                                                                key={index}
                                                                src={photo}
                                                                alt={`Review photo ${index + 1}`}
                                                                className="w-16 h-16 object-cover rounded"
                                                            />
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <Button variant="ghost" size="sm">
                                                            <ThumbsUp className="h-4 w-4 mr-1" />
                                                            Hữu ích ({review.helpful})
                                                        </Button>
                                                        <Button variant="ghost" size="sm">
                                                            <Flag className="h-4 w-4 mr-1" />
                                                            Báo cáo
                                                        </Button>
                                                    </div>
                                                </div>

                                                {review.response && (
                                                    <div className="mt-3 p-3 bg-blue-50 rounded">
                                                        <div className="text-sm font-medium text-blue-900 mb-1">
                                                            Phản hồi từ {review.response.from}
                                                        </div>
                                                        <div className="text-sm text-blue-800">{review.response.content}</div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar - Booking */}
                    <div className="lg:w-96">
                        <Card className="sticky top-20">
                            <CardHeader>
                                <CardTitle>Đặt tour</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Date Selection */}
                                <div>
                                    <Label className="text-base font-medium mb-3 block">Chọn ngày khởi hành</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !selectedDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {selectedDate ? (
                                                    selectedDate.toLocaleDateString('vi-VN')
                                                ) : (
                                                    <span>Chọn ngày</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={selectedDate}
                                                onSelect={setSelectedDate}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>

                                    {selectedDate && getSelectedDateInfo() && (
                                        <div className="mt-2 p-2 bg-[hsl(var(--success))/0.1] rounded text-sm">
                                            <div className="flex justify-between">
                                                <span>Còn {getSelectedDateInfo()?.available} chỗ</span>
                                                <span className="font-medium">{formatPrice(getSelectedDateInfo()?.price || 0)}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Participants */}
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

                                {/* Single Room Supplement */}
                                <div>
                                    <Label className="text-base font-medium mb-3 block">Phụ thu phòng đơn</Label>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium">Số phòng đơn</div>
                                            <div className="text-sm text-muted-foreground">+{formatPrice(tourDetails.pricing.singleSupplement)}/phòng</div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => updateSingleRooms(false)}
                                                disabled={singleRooms <= 0}
                                            >
                                                <Minus className="h-4 w-4" />
                                            </Button>
                                            <span className="w-8 text-center">{singleRooms}</span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => updateSingleRooms(true)}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Pricing Breakdown */}
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Người lớn ({participants.adults})</span>
                                        <span>{formatPrice(participants.adults * tourDetails.pricing.adult)}</span>
                                    </div>

                                    {participants.children > 0 && (
                                        <div className="flex justify-between">
                                            <span>Trẻ em ({participants.children})</span>
                                            <span>{formatPrice(participants.children * tourDetails.pricing.child)}</span>
                                        </div>
                                    )}

                                    {participants.infants > 0 && (
                                        <div className="flex justify-between">
                                            <span>Em bé ({participants.infants})</span>
                                            <span>{formatPrice(participants.infants * tourDetails.pricing.infant)}</span>
                                        </div>
                                    )}

                                    {singleRooms > 0 && (
                                        <div className="flex justify-between">
                                            <span>Phụ thu phòng đơn ({singleRooms})</span>
                                            <span>{formatPrice(singleRooms * tourDetails.pricing.singleSupplement)}</span>
                                        </div>
                                    )}

                                    <Separator />

                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Tổng cộng</span>
                                        <span className="text-primary">{formatPrice(calculateTotal())}</span>
                                    </div>

                                    <div className="text-xs text-muted-foreground">
                                        Tổng {totalParticipants} khách • Giá đã bao gồm thuế và phí
                                    </div>
                                </div>

                                <Separator />

                                {/* Important Notes */}
                                <div className="space-y-2">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="h-4 w-4 text-[hsl(var(--warning))] mt-0.5" />
                                        <div className="text-xs text-[hsl(var(--muted-foreground))]">Giá tour có thể thay đổi tùy theo ngày khởi hành</div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Info className="h-4 w-4 text-[hsl(var(--primary))] mt-0.5" />
                                        <div className="text-xs text-[hsl(var(--muted-foreground))]">Tour sẽ được xác nhận sau khi thanh toán</div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-2 pt-4">
                                    <Button className="w-full" size="lg" disabled={!selectedDate} onClick={() => {
                                        if (!selectedDate) return;
                                        const selectedDateInfo = getSelectedDateInfo();
                                        const basePrice = (participants.adults * tourDetails.pricing.adult) + (participants.children * tourDetails.pricing.child) + (participants.infants * tourDetails.pricing.infant) + (singleRooms * tourDetails.pricing.singleSupplement);
                                        const taxes = Math.round(basePrice * 0.08); // demo: 8% thuế
                                        const addOns = 0; // tour chưa có dịch vụ thêm
                                        const discount = tourDetails.originalPrice ? basePrice - calculateTotal() : 0;
                                        const total = basePrice + taxes + addOns - discount;
                                        const params = new URLSearchParams({
                                            type: 'tour',
                                            route: tourDetails.name,
                                            date: selectedDateInfo?.date || '',
                                            time: '',
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
                                        Đặt tour ngay
                                    </Button>
                                    <Button variant="outline" className="w-full" disabled={!selectedDate}>
                                        <PlusCircle className="h-4 w-4 mr-2" />
                                        Thêm vào giỏ hàng
                                    </Button>
                                </div>

                                {/* Contact */}
                                <div className="pt-4 border-t text-center">
                                    <div className="text-sm font-medium mb-1">Cần tư vấn?</div>
                                    <div className="flex items-center justify-center gap-1 text-sm text-primary">
                                        <Phone className="h-3 w-3" />
                                        <span>1900 1234</span>
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
