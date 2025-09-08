"use client"
import { useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import SearchTabs from '../components/SearchTabs';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Slider } from '../components/ui/slider';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
    Plane,
    Filter,
    ArrowRight,
    Clock,
    Luggage,
    Wifi,
    Coffee,
    Star,
    Calendar,
    Users,
    ChevronDown,
    ChevronUp,
    Shield,
    CreditCard,
    RefreshCw,
    X,
    CheckCircle,
    AlertTriangle,
    Info,
    Gift,
    Utensils,
    Tv,
    Battery,
    Headphones,
} from 'lucide-react';
import FlightResults from './FlightResults';

const airlines = [
    { code: 'VN', name: 'Vietnam Airlines', logo: '/placeholder.svg' },
    { code: 'VJ', name: 'VietJet Air', logo: '/placeholder.svg' },
    { code: 'BL', name: 'Jetstar', logo: '/placeholder.svg' },
    { code: 'QH', name: 'Bamboo Airways', logo: '/placeholder.svg' },
];

const sampleFlights = [
    {
        id: 1,
        airline: 'Vietnam Airlines',
        flightNumber: 'VN1546',
        departure: { time: '06:15', airport: 'SGN', city: 'TP.HCM', date: '2024-06-01' },
        arrival: { time: '08:30', airport: 'HAN', city: 'Hà Nội', date: '2024-06-01' },
        duration: '2h 15m',
        aircraft: 'Airbus A321-100/200',
        price: 1990000,
        originalPrice: 2490000,
        class: 'Phổ thông',
        baggage: {
            handbag: { weight: '7kg', size: '56x36x23cm' },
            checkin: { weight: '23kg', pieces: 1 }
        },
        amenities: {
            wifi: { available: true, free: false, price: '50.000đ' },
            meal: { included: true, type: 'Bữa ăn nóng' },
            entertainment: { available: true, screens: 'Màn hình cá nhân' },
            power: { available: true, type: 'USB & Ổ cắm điện' },
            priority: false
        },
        policies: {
            cancellable: true,
            cancellationFee: '500.000đ',
            changeable: true,
            changeFee: '300.000đ',
            refundable: 'Hoàn 80% nếu hủy trước 24h'
        },
        availableSeats: 12,
        discount: 20,
        promotions: [
            { code: 'SAVE30', description: 'Giảm thêm 300K cho vé bay nội địa', valid: '31/12/2024' },
            { code: 'STUDENT', description: 'Ưu đãi sinh viên giảm 15%', valid: '28/02/2025' }
        ],
        benefits: [
            'Tích lũy miles Bông Sen Vàng',
            'Ưu tiên check-in online',
            'Chọn chỗ ngồi miễn phí (hạng phổ thông)',
            'Bảo hiểm chuyến bay'
        ]
    },
    {
        id: 2,
        airline: 'VietJet Air',
        flightNumber: 'VJ142',
        departure: { time: '08:45', airport: 'SGN', city: 'TP.HCM', date: '2024-06-01' },
        arrival: { time: '11:00', airport: 'HAN', city: 'Hà Nội', date: '2024-06-01' },
        duration: '2h 15m',
        aircraft: 'Airbus A320',
        price: 1690000,
        class: 'Phổ thông',
        baggage: {
            handbag: { weight: '7kg', size: '56x36x23cm' },
            checkin: { weight: '20kg', pieces: 1 }
        },
        amenities: {
            wifi: { available: true, free: true },
            meal: { included: false, available: true, price: 'Từ 85.000đ' },
            entertainment: { available: false },
            power: { available: false },
            priority: false
        },
        policies: {
            cancellable: false,
            changeable: true,
            changeFee: '500.000đ + Chênh lệch giá vé',
            refundable: 'Không hoàn tiền'
        },
        availableSeats: 8,
        promotions: [
            { code: 'VIETJET50', description: 'Mã giảm 50K cho lần đặt đầu', valid: '15/01/2025' }
        ],
        benefits: [
            'Check-in online miễn phí',
            'Thay đổi thông tin hành khách',
            'Mua thêm dịch vụ sau khi đặt vé'
        ]
    },
    {
        id: 3,
        airline: 'Bamboo Airways',
        flightNumber: 'QH1402',
        departure: { time: '14:30', airport: 'SGN', city: 'TP.HCM', date: '2024-06-01' },
        arrival: { time: '16:50', airport: 'HAN', city: 'Hà Nội', date: '2024-06-01' },
        duration: '2h 20m',
        aircraft: 'Boeing 787',
        price: 2290000,
        class: 'Phổ thông Plus',
        baggage: {
            handbag: { weight: '10kg', size: '56x36x23cm' },
            checkin: { weight: '23kg', pieces: 1 }
        },
        amenities: {
            wifi: { available: true, free: true },
            meal: { included: true, type: 'Bữa ăn cao cấp' },
            entertainment: { available: true, screens: 'Màn hình HD 10 inch' },
            power: { available: true, type: 'USB-C & Ổ cắm điện' },
            priority: true
        },
        policies: {
            cancellable: true,
            cancellationFee: '300.000đ',
            changeable: true,
            changeFee: '200.000đ',
            refundable: 'Hoàn 85% nếu hủy trước 48h'
        },
        availableSeats: 15,
        promotions: [
            { code: 'BAMBOO100', description: 'Giảm 100K cho vé Bamboo Premium', valid: '31/01/2025' }
        ],
        benefits: [
            'Ưu tiên check-in & lên máy bay',
            'Chỗ ngồi rộng rãi (pitch 32-34 inch)',
            'Suất ăn cao cấp miễn phí',
            'Đổi lịch bay linh hoạt'
        ]
    },
    {
        id: 4,
        airline: 'Jetstar',
        flightNumber: 'BL268',
        departure: { time: '19:15', airport: 'SGN', city: 'TP.HCM', date: '2024-06-01' },
        arrival: { time: '21:35', airport: 'HAN', city: 'Hà Nội', date: '2024-06-01' },
        duration: '2h 20m',
        aircraft: 'Airbus A320',
        price: 1590000,
        class: 'Phổ thông',
        baggage: {
            handbag: { weight: '7kg', size: '56x36x23cm' },
            checkin: { weight: '20kg', pieces: 1 }
        },
        amenities: {
            wifi: { available: false },
            meal: { included: false, available: true, price: 'Từ 120.000đ' },
            entertainment: { available: false },
            power: { available: false },
            priority: false
        },
        policies: {
            cancellable: false,
            changeable: false,
            refundable: 'Không hoàn tiền, không đổi lịch'
        },
        availableSeats: 5,
        promotions: [
            { code: 'JETSTAR20', description: 'Giảm 20K phí dịch vụ', valid: '10/01/2025' }
        ],
        benefits: [
            'Giá vé cạnh tranh',
            'Lựa chọn dịch vụ bổ sung'
        ]
    },
];

export default function VeMayBay() {
    const [showFilters, setShowFilters] = useState(true);
    const [priceRange, setPriceRange] = useState([1000000, 3000000]);
    const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState('price-asc');
    const [expandedFlight, setExpandedFlight] = useState<number | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [showPromotions, setShowPromotions] = useState(true);
    const [selectedRoute, setSelectedRoute] = useState<{ from: string, to: string, price?: string } | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [searchForm, setSearchForm] = useState({
        from: 'TP.HCM (SGN)',
        to: 'Hà Nội (HAN)'
    });
    const [isLoading, setIsLoading] = useState(false);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    const getAmenityIcon = (amenity: string) => {
        switch (amenity) {
            case 'wifi': return <Wifi className="h-4 w-4" />;
            case 'meal': return <Utensils className="h-4 w-4" />;
            case 'entertainment': return <Tv className="h-4 w-4" />;
            case 'power': return <Battery className="h-4 w-4" />;
            default: return null;
        }
    };

    // Generate additional flights for selected route
    const generateRouteFlights = () => {
        if (!selectedRoute) return [];

        const basePrice = selectedRoute.price ? parseInt(selectedRoute.price.replace(/[^\d]/g, '')) : 1690000;
        // Lấy ngày đang chọn, nếu chưa chọn thì lấy ngày hôm nay
        const date = selectedDate || new Date().toISOString().split('T')[0];

        return [
            {
                ...sampleFlights[0],
                id: 999,
                departure: { time: '06:15', airport: 'SGN', city: selectedRoute.from, date },
                arrival: { time: '08:30', airport: 'HAN', city: selectedRoute.to, date },
                price: basePrice,
                originalPrice: basePrice + 300000,
                airline: 'VietJet Air',
                flightNumber: 'VJ142',
                discount: 15,
                availableSeats: 12,
            },
            {
                ...sampleFlights[0],
                id: 998,
                departure: { time: '08:45', airport: 'SGN', city: selectedRoute.from, date },
                arrival: { time: '11:00', airport: 'HAN', city: selectedRoute.to, date },
                price: basePrice + 200000,
                airline: 'Vietnam Airlines',
                flightNumber: 'VN1546',
                availableSeats: 8,
            },
            {
                ...sampleFlights[0],
                id: 997,
                departure: { time: '14:30', airport: 'SGN', city: selectedRoute.from, date },
                arrival: { time: '16:50', airport: 'HAN', city: selectedRoute.to, date },
                price: basePrice + 600000,
                airline: 'Bamboo Airways',
                flightNumber: 'QH1402',
                class: 'Phổ thông Plus',
                availableSeats: 15,
            }
        ];
    };

    const routeFlights = selectedRoute ? generateRouteFlights() : [];
    const allFlights = selectedRoute ? [...routeFlights, ...sampleFlights] : sampleFlights;

    const filteredFlights = allFlights.filter(flight => {
        const matchesPrice = flight.price >= priceRange[0] && flight.price <= priceRange[1];
        const matchesAirline = selectedAirlines.length === 0 || selectedAirlines.includes(flight.airline);

        // If route is selected, prioritize matching routes
        if (selectedRoute) {
            const matchesRoute =
                flight.departure.city === selectedRoute.from &&
                flight.arrival.city === selectedRoute.to;
            return matchesPrice && matchesAirline && matchesRoute;
        }

        return matchesPrice && matchesAirline;
    });

    const sortedFlights = [...filteredFlights].sort((a, b) => {
        // If route selected, show generated route flights first
        if (selectedRoute) {
            const aIsRoute = a.id >= 997;
            const bIsRoute = b.id >= 997;
            if (aIsRoute && !bIsRoute) return -1;
            if (!aIsRoute && bIsRoute) return 1;
        }

        switch (sortBy) {
            case 'price-asc': return a.price - b.price;
            case 'price-desc': return b.price - a.price;
            case 'departure-asc': return a.departure.time.localeCompare(b.departure.time);
            case 'departure-desc': return b.departure.time.localeCompare(a.departure.time);
            case 'arrival-desc': return b.arrival.time.localeCompare(a.arrival.time);
            case 'duration': return a.duration.localeCompare(b.duration);
            default: return 0;
        }
    });

    const handleSearch = () => {
        setHasSearched(true);
        setShowPromotions(false);
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 3000);
    };

    const handleRouteSelect = (from: string, to: string, price?: string) => {
        // Update search form
        setSearchForm({ from, to });
        // Set selected route
        setSelectedRoute({ from, to, price });
        // Trigger search
        setHasSearched(true);
        setShowPromotions(false);
        // Set default date to today + 1
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setSelectedDate(tomorrow.toISOString().split('T')[0]);
    };

    const [copied, setCopied] = useState<{ [code: string]: boolean }>({});

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code).then(() => {
            setCopied(prev => ({ ...prev, [code]: true }));
            setTimeout(() => setCopied(prev => ({ ...prev, [code]: false })), 2000);
        });
    };

    function CardSkeleton() {
        return (
            <Card className="animate-pulse">
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded bg-gray-200 shimmer" />
                                <div className="h-4 w-32 bg-gray-200 rounded shimmer" />
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <div className="h-4 w-12 bg-gray-200 rounded shimmer mx-auto mb-2" />
                                    <div className="h-3 w-16 bg-gray-200 rounded shimmer mx-auto" />
                                </div>
                                <div className="flex-1 text-center">
                                    <div className="h-3 w-20 bg-gray-200 rounded shimmer mx-auto mb-2" />
                                </div>
                                <div className="text-center">
                                    <div className="h-4 w-12 bg-gray-200 rounded shimmer mx-auto mb-2" />
                                    <div className="h-3 w-16 bg-gray-200 rounded shimmer mx-auto" />
                                </div>
                            </div>
                        </div>
                        <div className="lg:text-right space-y-2">
                            <div className="h-5 w-24 bg-gray-200 rounded shimmer mx-auto mb-2" />
                            <div className="h-8 w-32 bg-gray-200 rounded shimmer mx-auto" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    function FilterSidebarSkeleton() {
        return (
            <Card className="sticky top-20 bg-[hsl(var(--card))] border border-[hsl(var(--muted))] animate-pulse">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <div className="h-5 w-24 bg-gray-200 rounded shimmer" />
                    <div className="h-8 w-8 bg-gray-200 rounded shimmer" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="h-4 w-32 bg-gray-200 rounded shimmer mb-2" />
                    <div className="h-6 w-full bg-gray-200 rounded shimmer mb-2" />
                    <div className="h-4 w-20 bg-gray-200 rounded shimmer mb-2" />
                    <div className="h-4 w-24 bg-gray-200 rounded shimmer mb-2" />
                    <div className="h-4 w-32 bg-gray-200 rounded shimmer mb-2" />
                    <div className="h-4 w-16 bg-gray-200 rounded shimmer mb-2" />
                    <div className="h-4 w-28 bg-gray-200 rounded shimmer mb-2" />
                    <div className="h-4 w-24 bg-gray-200 rounded shimmer mb-2" />
                    <div className="h-4 w-20 bg-gray-200 rounded shimmer mb-2" />
                    <div className="h-4 w-32 bg-gray-200 rounded shimmer mb-2" />
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            {/* Search Section */}
            <div className="relative min-h-[480px]" style={{ backgroundImage: 'url(./banner-may-bay.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>

                <div className="container">

                    <div className="absolute inset-x-0 top-[calc(100%/1.3)] -translate-y-1/2">
                        <div className="w-full max-w-6xl mx-auto" style={{
                            background: 'linear-gradient(90deg, rgba(0,17,30,0.6) 0%, rgba(0,0,0,0) 100%)',
                            paddingBottom: '7px', paddingLeft: '18px', marginBottom: '-10px', borderTopLeftRadius: '10px'

                        }}>
                            <h1 className="pt-4 text-2xl lg:text-3xl font-bold mb-2 text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.1)]">
                                Tìm vé máy bay
                            </h1>
                            <p className="font-bold mb-2 text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.1)]">Đặt vé máy bay nội địa với giá tốt nhất</p>
                        </div>
                        <SearchTabs onSearch={handleSearch} activeTab="flight" />
                    </div>
                </div>
            </div>

            {/* Vouchers & Promotions Section */}
            <section className={`pt-16 py-8 bg-gray-50 ${hasSearched && !showPromotions ? 'hidden' : ''}`}>
                <div className="container">
                    {/* Vouchers */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">🎫 Voucher & Mã giảm giá</h2>
                            <Button variant="outline" size="sm" asChild>
                                <Link prefetch={false} href="/khuyen-mai">Xem tất cả</Link>
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-lg font-bold">SAVE30</div>
                                            <div className="text-sm opacity-90">Giảm 300K vé máy bay</div>
                                            <div className="text-xs opacity-75 mt-1">HSD: 31/12/2024</div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="text-red-600"
                                            onClick={() => handleCopy('SAVE30')}
                                        >
                                            {copied['SAVE30'] ? 'Đã copy!' : 'Copy mã'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-lg font-bold">FIRSTFLIGHT</div>
                                            <div className="text-sm opacity-90">Giảm 50K lần đầu đặt</div>
                                            <div className="text-xs opacity-75 mt-1">HSD: 15/01/2025</div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="text-blue-600"
                                            onClick={() => handleCopy('FIRSTFLIGHT')}
                                        >
                                            {copied['FIRSTFLIGHT'] ? 'Đã copy!' : 'Copy mã'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-lg font-bold">WEEKEND20</div>
                                            <div className="text-sm opacity-90">Giảm 20% cuối tuần</div>
                                            <div className="text-xs opacity-75 mt-1">HSD: 28/02/2025</div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="text-green-600"
                                            onClick={() => handleCopy('WEEKEND20')}
                                        >
                                            {copied['WEEKEND20'] ? 'Đã copy!' : 'Copy mã'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Popular Routes */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold mb-4 text-[hsl(var(--primary))]">✈️ Tuyến bay phổ biến</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleRouteSelect('TP.HCM', 'Hà Nội', '1.690.000₫')}>
                                <CardContent className="p-4 text-center">
                                    <div className="text-sm font-medium">TP.HCM → Hà Nội</div>
                                    <div className="text-xs text-[hsl(var(--muted-foreground))]">từ 1.690.000₫</div>
                                    <Badge variant="secondary" className="mt-2 text-xs">Phổ biến</Badge>
                                </CardContent>
                            </Card>

                            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleRouteSelect('TP.HCM', 'Đà Nẵng', '1.590.000₫')}>
                                <CardContent className="p-4 text-center">
                                    <div className="text-sm font-medium">TP.HCM → Đà Nẵng</div>
                                    <div className="text-xs text-[hsl(var(--muted-foreground))]">từ 1.590.000₫</div>
                                    <Badge variant="secondary" className="mt-2 text-xs">Giá tốt</Badge>
                                </CardContent>
                            </Card>

                            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleRouteSelect('Hà Nội', 'Đà Nẵng', '1.490.000₫')}>
                                <CardContent className="p-4 text-center">
                                    <div className="text-sm font-medium">Hà Nội → Đà Nẵng</div>
                                    <div className="text-xs text-[hsl(var(--muted-foreground))]">từ 1.490.000₫</div>
                                    <Badge variant="secondary" className="mt-2 text-xs">Sale 30%</Badge>
                                </CardContent>
                            </Card>

                            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleRouteSelect('TP.HCM', 'Nha Trang', '1.390.000₫')}>
                                <CardContent className="p-4 text-center">
                                    <div className="text-sm font-medium">TP.HCM → Nha Trang</div>
                                    <div className="text-xs text-[hsl(var(--muted-foreground))]">từ 1.390.000₫</div>
                                    <Badge variant="secondary" className="mt-2 text-xs">Hot</Badge>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Great Deals */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold mb-4 text-[hsl(var(--primary))]">🔥 Vé máy bay giá tốt</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Card className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="font-medium">VietJet Air</div>
                                            <div className="text-sm text-[hsl(var(--muted-foreground))]">TP.HCM → Hà Nội</div>
                                        </div>
                                        <Badge variant="destructive">-25%</Badge>
                                    </div>
                                    <div className="text-sm text-[hsl(var(--muted-foreground))] mb-2">06:15 → 08:30</div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <div className="text-lg font-bold text-[hsl(var(--primary))]">1.690.000₫</div>
                                            <div className="text-xs text-[hsl(var(--muted-foreground))] line-through">2.250.000₫</div>
                                        </div>
                                        <Button size="sm">Chọn</Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="font-medium">Bamboo Airways</div>
                                            <div className="text-sm text-[hsl(var(--muted-foreground))]">TP.HCM → Đà Nẵng</div>
                                        </div>
                                        <Badge variant="destructive">-20%</Badge>
                                    </div>
                                    <div className="text-sm text-[hsl(var(--muted-foreground))] mb-2">14:30 → 16:50</div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <div className="text-lg font-bold text-[hsl(var(--primary))]">1.590.000₫</div>
                                            <div className="text-xs text-[hsl(var(--muted-foreground))] line-through">1.990.000₫</div>
                                        </div>
                                        <Button size="sm">Chọn</Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="font-medium">Vietnam Airlines</div>
                                            <div className="text-sm text-[hsl(var(--muted-foreground))]">Hà Nội → Đà Nẵng</div>
                                        </div>
                                        <Badge variant="destructive">-30%</Badge>
                                    </div>
                                    <div className="text-sm text-[hsl(var(--muted-foreground))] mb-2">08:45 → 10:20</div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <div className="text-lg font-bold text-[hsl(var(--primary))]">1.490.000₫</div>
                                            <div className="text-xs text-[hsl(var(--muted-foreground))] line-through">2.130.000₫</div>
                                        </div>
                                        <Button size="sm">Chọn</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Toggle Promotions Button */}
            {hasSearched && (
                <section className={hasSearched ? "py-4 bg-white border-b mt-14" : "py-4 bg-white border-b mt-14"}>
                    <div className="container">
                        <div className="flex justify-center">
                            <Button
                                variant="outline"
                                onClick={() => setShowPromotions(!showPromotions)}
                                className="flex items-center gap-2"
                            >
                                {showPromotions ? (
                                    <>
                                        <ChevronUp className="h-4 w-4" />
                                        Ẩn ưu đãi & tuyến phổ biến
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="h-4 w-4" />
                                        Hiện ưu đãi & tuyến phổ biến
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </section>
            )}

            {/* Date Selector */}
            {hasSearched && selectedRoute && (
                <section className="py-6 bg-[hsl(var(--blue-50))]">
                    <div className="container">
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold mb-2">
                                {selectedRoute.from} → {selectedRoute.to}
                            </h3>
                            <div className="text-sm text-[hsl(var(--muted-foreground))]">
                                Chọn ngày để xem giá tốt nhất
                            </div>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {Array.from({ length: 7 }, (_, i) => {
                                const date = new Date();
                                date.setDate(date.getDate() + i);
                                const dateStr = date.toISOString().split('T')[0];
                                const dayName = date.toLocaleDateString('vi-VN', { weekday: 'short' });
                                const dayMonth = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

                                // Mock prices for different dates
                                const prices = ['1.424.000', '1.575.000', '1.151.000', '966.000', '764.000', '1.234.000', '1.456.000'];
                                const price = prices[i] + ' VND';

                                return (
                                    <div
                                        key={dateStr}
                                        onClick={() => setSelectedDate(dateStr)}
                                        className={`flex-shrink-0 p-3 rounded-lg cursor-pointer transition-colors min-w-[120px] text-center ${selectedDate === dateStr
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white hover:bg-blue-100'
                                            }`}
                                    >
                                        <div className="text-sm font-medium">{dayName} {dayMonth}</div>
                                        <div className="text-xs mt-1">{price}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* Results Section */}
            <section className="py-8">
                <div className="container">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Filters Sidebar */}
                        <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                            {isLoading ? <FilterSidebarSkeleton /> : (
                                <Card className="sticky top-20 bg-[hsl(var(--card))] border border-[hsl(var(--muted))]">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                        <CardTitle className="text-lg text-[hsl(var(--primary))] font-bold">Bộ lọc</CardTitle>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowFilters(!showFilters)}
                                            className="lg:hidden"
                                        >
                                            <Filter className="h-4 w-4" />
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Price Range */}
                                        <div>
                                            <Label className="text-sm font-medium mb-3 block text-[hsl(var(--primary))]">Khoảng giá</Label>
                                            <div className="px-2">
                                                <Slider
                                                    value={priceRange}
                                                    onValueChange={setPriceRange}
                                                    max={3000000}
                                                    min={1000000}
                                                    step={100000}
                                                    className="mb-3"
                                                />
                                                <div className="flex justify-between text-sm text-[hsl(var(--muted-foreground))]">
                                                    <span>{formatPrice(priceRange[0])}</span>
                                                    <span>{formatPrice(priceRange[1])}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Airlines */}
                                        <div>
                                            <Label className="text-sm font-medium mb-3 block text-[hsl(var(--primary))]">Hãng hàng không</Label>
                                            <div className="space-y-3">
                                                {airlines.map((airline) => (
                                                    <div key={airline.code} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={airline.code}
                                                            checked={selectedAirlines.includes(airline.name)}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) {
                                                                    setSelectedAirlines([...selectedAirlines, airline.name]);
                                                                } else {
                                                                    setSelectedAirlines(selectedAirlines.filter(a => a !== airline.name));
                                                                }
                                                            }}
                                                        />
                                                        <label htmlFor={airline.code} className="text-sm cursor-pointer">
                                                            {airline.name}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Departure Time */}
                                        <div>
                                            <Label className="text-sm font-medium mb-3 block text-[hsl(var(--primary))]">Giờ khởi hành</Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Button variant="outline" size="sm" className="text-xs">Sáng sớm<br />06:00 - 12:00</Button>
                                                <Button variant="outline" size="sm" className="text-xs">Chiều<br />12:00 - 18:00</Button>
                                                <Button variant="outline" size="sm" className="text-xs">Tối<br />18:00 - 24:00</Button>
                                                <Button variant="outline" size="sm" className="text-xs">Đêm<br />00:00 - 06:00</Button>
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Quick Filters */}
                                        <div>
                                            <Label className="text-sm font-medium mb-3 block text-[hsl(var(--primary))]">Bộ lọc nhanh</Label>
                                            <div className="space-y-2">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox id="refundable" />
                                                    <label htmlFor="refundable" className="text-sm cursor-pointer">
                                                        Có hoàn hủy
                                                    </label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox id="changeable" />
                                                    <label htmlFor="changeable" className="text-sm cursor-pointer">
                                                        Có thể đổi
                                                    </label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox id="baggage" />
                                                    <label htmlFor="baggage" className="text-sm cursor-pointer">
                                                        Hành lý ký gửi
                                                    </label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox id="wifi" />
                                                    <label htmlFor="wifi" className="text-sm cursor-pointer">
                                                        Có WiFi
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Results */}
                        <div className="flex-1">
                            {/* Controls */}
                            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                                <div className="flex items-center gap-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowFilters(!showFilters)}
                                        className="lg:hidden"
                                    >
                                        <Filter className="h-4 w-4 mr-2" />
                                        Bộ lọc
                                    </Button>
                                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                        Tìm thấy {sortedFlights.length} chuyến bay
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="sort" className="text-sm">Sắp xếp:</Label>
                                    <Select value={sortBy} onValueChange={setSortBy}>
                                        <SelectTrigger className="w-[200px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="price-asc">Giá tăng dần</SelectItem>
                                            <SelectItem value="price-desc">Giá giảm dần</SelectItem>
                                            <SelectItem value="departure-asc">Giờ đi sớm nhất</SelectItem>
                                            <SelectItem value="departure-desc">Giờ đi muộn nhất</SelectItem>
                                            <SelectItem value="arrival-desc">Giờ đến muộn nhất</SelectItem>
                                            <SelectItem value="duration">Thời gian bay</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Flight Results */}
                            <div className="space-y-4">
                                {isLoading ? (
                                    Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
                                ) : (
                                    sortedFlights.length === 0 && hasSearched ? (
                                      <Card className="text-center py-12">
                                          <CardContent>
                                              <Plane className="h-12 w-12 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
                                              <h3 className="text-lg font-medium mb-2">Không tìm thấy chuyến bay phù hợp</h3>
                                              <p className="text-[hsl(var(--muted-foreground))] mb-4">
                                                  Vui lòng thử điều chỉnh bộ lọc hoặc thay đổi ngày bay
                                              </p>
                                              <Button variant="outline">Điều chỉnh tìm kiếm</Button>
                                          </CardContent>
                                      </Card>
                                    ) : (
                                        <FlightResults
                                          isLoading={isLoading}
                                          sortedFlights={sortedFlights}
                                          hasSearched={hasSearched}
                                          expandedFlight={expandedFlight}
                                          setExpandedFlight={setExpandedFlight}
                                          formatPrice={formatPrice}
                                        />
                                    ))}
                            </div>

                            {sortedFlights.length === 0 && (
                                <Card className="text-center py-12">
                                    <CardContent>
                                        <Plane className="h-12 w-12 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
                                        <h3 className="text-lg font-medium mb-2">Không tìm thấy chuyến bay phù hợp</h3>
                                        <p className="text-[hsl(var(--muted-foreground))] mb-4">
                                            Vui lòng thử điều chỉnh bộ lọc hoặc thay đổi ngày bay
                                        </p>
                                        <Button variant="outline">Điều chỉnh tìm kiếm</Button>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
