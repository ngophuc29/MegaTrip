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
import {
    Bus,
    Filter,
    ArrowRight,
    Clock,
    Wifi,
    Coffee,
    Star,
    Users,
    MapPin,
    ChevronDown,
    ChevronUp,
    Armchair,
    Bed,
    Shield,
} from 'lucide-react';
import BusResults from './BusResults';

const busCompanies = [
    { name: 'Phương Trang', rating: 4.5 },
    { name: 'Sinh Tourist', rating: 4.3 },
    { name: 'Hoàng Long', rating: 4.4 },
    { name: 'Thành Bưởi', rating: 4.2 },
    { name: 'Mai Linh Express', rating: 4.1 },
];

const sampleBuses = [
    {
        id: 1,
        company: 'Phương Trang',
        route: 'TP.HCM - Đà Lạt',
        type: 'Giường nằm VIP',
        departure: { time: '22:30', location: 'Bến xe Miền Đông' },
        arrival: { time: '05:00+1', location: 'Bến xe Đà Lạt' },
        duration: '6h 30m',
        distance: '308km',
        price: 350000,
        originalPrice: 420000,
        seats: 32,
        availableSeats: 8,
        amenities: ['wifi', 'blanket', 'water', 'toilet', 'entertainment'],
        rating: 4.5,
        reviews: 1250,
        images: ['/placeholder.svg'],
        busNumber: 'PT-001',
        discount: 17,
        cancellable: true,
        pickup: ['Bến xe Miền Đông', 'Ngã Tư Bình Phước', 'Ngã Tư An Sương'],
        dropoff: ['Bến xe Đà Lạt', 'Chợ Đà Lạt', 'Ga Đà Lạt'],
    },
    {
        id: 2,
        company: 'Sinh Tourist',
        route: 'TP.HCM - Đà Lạt',
        type: 'Ghế ngồi',
        departure: { time: '23:00', location: 'Bến xe Miền Đông' },
        arrival: { time: '06:00+1', location: 'Bến xe Đà Lạt' },
        duration: '7h 00m',
        distance: '308km',
        price: 280000,
        
        seats: 45,
        availableSeats: 12,
        amenities: ['wifi', 'water', 'toilet'],
        rating: 4.3,
        reviews: 890,
        images: ['/placeholder.svg'],
        busNumber: 'ST-205',
        cancellable: false,
        pickup: ['Bến xe Miền Đông', 'Ngã Tư Bình Phước'],
        dropoff: ['Bến xe Đà Lạt', 'Chợ Đà Lạt'],
    },
    {
        id: 3,
        company: 'Hoàng Long',
        route: 'TP.HCM - Đà Lạt',
        type: 'Giường nằm',
        departure: { time: '21:45', location: 'Bến xe Miền Đông' },
        arrival: { time: '04:30+1', location: 'Bến xe Đà Lạt' },
        duration: '6h 45m',
        distance: '308km',
        price: 320000,
        seats: 40,
        availableSeats: 5,
        amenities: ['wifi', 'blanket', 'water', 'toilet'],
        rating: 4.4,
        reviews: 650,
        images: ['/placeholder.svg'],
        busNumber: 'HL-158',
        cancellable: true,
        pickup: ['Bến xe Miền Đông', 'Chùa Hạnh Phúc'],
        dropoff: ['Bến xe Đà Lạt'],
    },
    {
        id: 4,
        company: 'Mai Linh Express',
        route: 'TP.HCM - Đà Lạt',
        type: 'Limousine VIP',
        departure: { time: '23:30', location: 'Ga Sài Gòn' },
        arrival: { time: '06:15+1', location: 'Trung tâm Đà Lạt' },
        duration: '6h 45m',
        distance: '308km',
        price: 450000,
        seats: 22,
        availableSeats: 3,
        amenities: ['wifi', 'massage', 'blanket', 'snack', 'water', 'toilet', 'entertainment'],
        rating: 4.7,
        reviews: 320,
        images: ['/placeholder.svg'],
        busNumber: 'ML-VIP01',
        cancellable: true,
        pickup: ['Ga Sài Gòn', 'Quận 1', 'Quận 3'],
        dropoff: ['Trung tâm Đà Lạt', 'Chợ Đà Lạt'],
    },
];

export default function XeDuLich() {
    const [showFilters, setShowFilters] = useState(true);
    const [priceRange, setPriceRange] = useState([200000, 500000]);
    const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState('price-asc');
    const [showDetails, setShowDetails] = useState<number | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [showPromotions, setShowPromotions] = useState(true);
    const [selectedRoute, setSelectedRoute] = useState<{ from: string, to: string, price?: string } | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    const getTypeIcon = (type: string) => {
        if (type.includes('Giường nằm')) return <Bed className="h-4 w-4" />;
        if (type.includes('Ghế ngồi')) return <Armchair className="h-4 w-4" />;
        return <Bus className="h-4 w-4" />;
    };

    const getAmenityIcon = (amenity: string) => {
        switch (amenity) {
            case 'wifi': return <Wifi className="h-4 w-4" />;
            case 'water': return '💧';
            case 'blanket': return '🛏️';
            case 'toilet': return '🚽';
            case 'entertainment': return '📺';
            case 'massage': return '💆';
            case 'snack': return '🍪';
            default: return '•';
        }
    };

    // Generate additional buses for selected route
    const generateRouteBuses = () => {
        if (!selectedRoute) return [];

        const basePrice = selectedRoute.price ? parseInt(selectedRoute.price.replace(/[^\d]/g, '')) : 280000;

        return [
            {
                ...sampleBuses[0],
                id: 999,
                route: `${selectedRoute.from} - ${selectedRoute.to}`,
                price: basePrice,
                originalPrice: basePrice + 70000,
                company: 'Phương Trang',
                type: 'Giường nằm VIP',
                departure: { time: '22:30', location: `Bến xe ${selectedRoute.from}` },
                arrival: { time: '05:00+1', location: `Bến xe ${selectedRoute.to}` },
                discount: 15,
                availableSeats: 8,
                busNumber: 'PT-Premium',
            },
            {
                ...sampleBuses[0],
                id: 998,
                route: `${selectedRoute.from} - ${selectedRoute.to}`,
                price: basePrice + 40000,
                company: 'Sinh Tourist',
                type: 'Ghế ngồi',
                departure: { time: '23:00', location: `Bến xe ${selectedRoute.from}` },
                arrival: { time: '06:30+1', location: `Bến xe ${selectedRoute.to}` },
                availableSeats: 12,
                busNumber: 'ST-Comfort',
            },
            {
                ...sampleBuses[0],
                id: 997,
                route: `${selectedRoute.from} - ${selectedRoute.to}`,
                price: basePrice + 70000,
                company: 'Hoàng Long',
                type: 'Giường nằm',
                departure: { time: '21:45', location: `Bến xe ${selectedRoute.from}` },
                arrival: { time: '04:30+1', location: `Bến xe ${selectedRoute.to}` },
                availableSeats: 5,
                busNumber: 'HL-Express',
            }
        ];
    };

    const routeBuses = selectedRoute ? generateRouteBuses() : [];
    const allBuses = selectedRoute ? [...routeBuses, ...sampleBuses] : sampleBuses;

    const filteredBuses = allBuses.filter(bus => {
        const matchesPrice = bus.price >= priceRange[0] && bus.price <= priceRange[1];
        const matchesCompany = selectedCompanies.length === 0 || selectedCompanies.includes(bus.company);
        const matchesType = selectedTypes.length === 0 || selectedTypes.includes(bus.type);

        // If route is selected, prioritize matching routes
        if (selectedRoute) {
            const matchesRoute = bus.route === `${selectedRoute.from} - ${selectedRoute.to}`;
            return matchesPrice && matchesCompany && matchesType && matchesRoute;
        }

        return matchesPrice && matchesCompany && matchesType;
    });

    const sortedBuses = [...filteredBuses].sort((a, b) => {
        // If route selected, show generated route buses first
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
            case 'rating': return b.rating - a.rating;
            case 'duration': return a.duration.localeCompare(b.duration);
            default: return 0;
        }
    });

    const handleSearch = () => {
        setHasSearched(true);
        setShowPromotions(false);
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 2000);
    };

    const handleRouteSelect = (from: string, to: string, price?: string) => {
        setSelectedRoute({ from, to, price });
        setHasSearched(true);
        setShowPromotions(false);
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 2000);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setSelectedDate(tomorrow.toISOString().split('T')[0]);
    };

    const busTypes = [...new Set(sampleBuses.map(bus => bus.type))];


    const [copied, setCopied] = useState<{[code:string]: boolean}>({});

    const handleCopy = (code:string) => {
        navigator.clipboard.writeText(code).then(() => {
            setCopied(prev => ({...prev, [code]: true}));
            setTimeout(() => setCopied(prev => ({...prev, [code]: false})), 2000);
        });
    };

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
            <div className="relative min-h-[480px]" style={{ backgroundImage: 'url(./banner-xe-ve.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>

                <div className="container">
                 
                    <div className="absolute inset-x-0 top-[calc(100%/1.2)] -translate-y-1/2">
                        <div className="w-full max-w-6xl mx-auto" style={{
                            background: 'linear-gradient(90deg, rgba(0,17,30,0.6) 0%, rgba(0,0,0,0) 100%)',
                            paddingBottom: '7px', paddingLeft: '18px', marginBottom: '-10px', borderTopLeftRadius: '10px'

                        }}>
                            <h1 className="pt-4 text-2xl lg:text-3xl font-bold mb-2 text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.1)]">
                                Tìm vé xe
                            </h1>
                            <p className="font-bold mb-2 text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.1)]">Đặt vé xe với giá tốt nhất</p>
                        </div>
                        <SearchTabs onSearch={handleSearch} activeTab="bus" />
                    </div>
                </div>
            </div>

            {/* Vouchers & Promotions Section */}
            <section className={`py-8 bg-gray-50 ${hasSearched && !showPromotions ? 'hidden' : ''}`}>
                <div className="container">
                    {/* Vouchers */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">🎫 Voucher & Mã giảm giá</h2>
                            <Button variant="outline" size="sm" asChild>
                                <Link prefetch={false}  href="/khuyen-mai">Xem tất cả</Link>
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-lg font-bold">BUS100</div>
                                            <div className="text-sm opacity-90">Giảm 100K xe khách</div>
                                            <div className="text-xs opacity-75 mt-1">HSD: 31/12/2024</div>
                                        </div>
                                        <Button size="sm" variant="secondary" className="text-cyan-600" onClick={() => handleCopy('BUS100')}>
                                            {copied['BUS100'] ? 'Đã copy!' : 'Copy mã'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-lg font-bold">NEWBUS50</div>
                                            <div className="text-sm opacity-90">Giảm 50K lần đầu đặt</div>
                                            <div className="text-xs opacity-75 mt-1">HSD: 15/01/2025</div>
                                        </div>
                                        <Button size="sm" variant="secondary" className="text-emerald-600" onClick={() => handleCopy('NEWBUS50')}>
                                            {copied['NEWBUS50'] ? 'Đã copy!' : 'Copy mã'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-r from-violet-500 to-purple-500 text-white">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-lg font-bold">VIP15</div>
                                            <div className="text-sm opacity-90">Giảm 15% xe VIP</div>
                                            <div className="text-xs opacity-75 mt-1">HSD: 28/02/2025</div>
                                        </div>
                                        <Button size="sm" variant="secondary" className="text-violet-600" onClick={() => handleCopy('VIP15')}>
                                            {copied['VIP15'] ? 'Đã copy!' : 'Copy mã'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>


                    {/* Popular Routes */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold mb-4 text-[hsl(var(--primary))]">🚌 Tuyến xe phổ biến</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleRouteSelect('TP.HCM', 'Đà Lạt', '280.000₫')}>
                                <CardContent className="p-4 text-center">
                                    <div className="text-sm font-medium">TP.HCM → Đà Lạt</div>
                                    <div className="text-xs text-[hsl(var(--muted-foreground))]">từ 280.000₫</div>
                                    <Badge variant="secondary" className="mt-2 text-xs">Phổ biến</Badge>
                                </CardContent>
                            </Card>

                            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleRouteSelect('TP.HCM', 'Nha Trang', '350.000₫')}>
                                <CardContent className="p-4 text-center">
                                    <div className="text-sm font-medium">TP.HCM → Nha Trang</div>
                                    <div className="text-xs text-[hsl(var(--muted-foreground))]">từ 350.000₫</div>
                                    <Badge variant="secondary" className="mt-2 text-xs">Hot</Badge>
                                </CardContent>
                            </Card>

                            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleRouteSelect('Hà Nội', 'Sapa', '400.000₫')}>
                                <CardContent className="p-4 text-center">
                                    <div className="text-sm font-medium">Hà Nội → Sapa</div>
                                    <div className="text-xs text-[hsl(var(--muted-foreground))]">từ 400.000₫</div>
                                    <Badge variant="secondary" className="mt-2 text-xs">Sale 20%</Badge>
                                </CardContent>
                            </Card>

                            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleRouteSelect('TP.HCM', 'Cần Thơ', '180.000₫')}>
                                <CardContent className="p-4 text-center">
                                    <div className="text-sm font-medium">TP.HCM → Cần Thơ</div>
                                    <div className="text-xs text-[hsl(var(--muted-foreground))]">từ 180.000₫</div>
                                    <Badge variant="secondary" className="mt-2 text-xs">Giá tốt</Badge>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Great Bus Deals */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold mb-4 text-[hsl(var(--primary))]">🔥 Xe giá tốt</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Card className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="font-medium">Phương Trang</div>
                                            <div className="text-sm text-[hsl(var(--muted-foreground))]">TP.HCM → Đà Lạt • Giường nằm VIP</div>
                                        </div>
                                        <Badge variant="destructive">-17%</Badge>
                                    </div>
                                    <div className="text-sm text-[hsl(var(--muted-foreground))] mb-2">⭐ 4.5 (1250 đánh giá)</div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <div className="text-lg font-bold text-[hsl(var(--primary))]">{formatPrice(350000)}</div>
                                            <div className="text-xs text-[hsl(var(--muted-foreground))] line-through">{formatPrice(420000)}</div>
                                        </div>
                                        <Button size="sm">Chọn xe</Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="font-medium">Sinh Tourist</div>
                                            <div className="text-sm text-[hsl(var(--muted-foreground))]">TP.HCM → Nha Trang • Ghế ngồi</div>
                                        </div>
                                        <Badge variant="destructive">-20%</Badge>
                                    </div>
                                    <div className="text-sm text-[hsl(var(--muted-foreground))] mb-2">⭐ 4.3 (890 đánh giá)</div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <div className="text-lg font-bold text-[hsl(var(--primary))]">{formatPrice(350000)}</div>
                                            <div className="text-xs text-[hsl(var(--muted-foreground))] line-through">{formatPrice(438000)}</div>
                                        </div>
                                        <Button size="sm">Chọn xe</Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="font-medium">Hoàng Long</div>
                                            <div className="text-sm text-[hsl(var(--muted-foreground))]">Hà Nội → Sapa • Giường nằm</div>
                                        </div>
                                        <Badge variant="destructive">-25%</Badge>
                                    </div>
                                    <div className="text-sm text-[hsl(var(--muted-foreground))] mb-2">⭐ 4.4 (650 đánh giá)</div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <div className="text-lg font-bold text-[hsl(var(--primary))]">{formatPrice(400000)}</div>
                                            <div className="text-xs text-[hsl(var(--muted-foreground))] line-through">{formatPrice(533000)}</div>
                                        </div>
                                        <Button size="sm">Chọn xe</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Date Selector */}
            {hasSearched && selectedRoute && (
                <section className="py-6 bg-[hsl(var(--orange-50))]">
                    <div className="container">
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold mb-2">
                                {selectedRoute.from} → {selectedRoute.to}
                            </h3>
                            <div className="text-sm text-[hsl(var(--muted-foreground))]">
                                Chọn ngày khởi hành
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
                                const prices = ['280.000', '320.000', '250.000', '350.000', '300.000', '280.000', '400.000'];
                                const price = prices[i] + ' VND';

                                return (
                                    <div
                                        key={dateStr}
                                        onClick={() => setSelectedDate(dateStr)}
                                        className={`flex-shrink-0 p-3 rounded-lg cursor-pointer transition-colors min-w-[120px] text-center ${selectedDate === dateStr
                                            ? 'bg-orange-600 text-white'
                                            : 'bg-white hover:bg-orange-100'
                                            }`}
                                    >
                                        <div className="text-sm font-medium">{dayName} {dayMonth}</div>
                                        <div className="text-xs mt-1">{price}</div>
                                        <div className="text-xs text-[hsl(var(--muted-foreground))]">Còn 8 chỗ</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* Toggle Promotions Button */}
            {hasSearched && (
                <section className={hasSearched ? "py-4 bg-white border-b mt-7" : "py-4 bg-white border-b mt-7"}>

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
                                                    max={500000}
                                                    min={200000}
                                                    step={50000}
                                                    className="mb-3"
                                                />
                                                <div className="flex justify-between text-sm text-[hsl(var(--muted-foreground))]">
                                                    <span>{formatPrice(priceRange[0])}</span>
                                                    <span>{formatPrice(priceRange[1])}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Bus Companies */}
                                        <div>
                                            <Label className="text-sm font-medium mb-3 block text-[hsl(var(--primary))]">Nhà xe</Label>
                                            <div className="space-y-3">
                                                {busCompanies.map((company) => (
                                                    <div key={company.name} className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={company.name}
                                                                checked={selectedCompanies.includes(company.name)}
                                                                onCheckedChange={(checked) => {
                                                                    if (checked) {
                                                                        setSelectedCompanies([...selectedCompanies, company.name]);
                                                                    } else {
                                                                        setSelectedCompanies(selectedCompanies.filter(c => c !== company.name));
                                                                    }
                                                                }}
                                                            />
                                                            <label htmlFor={company.name} className="text-sm cursor-pointer">
                                                                {company.name}
                                                            </label>
                                                        </div>
                                                        <div className="flex items-center text-xs text-[hsl(var(--muted-foreground))]">
                                                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                                                            {company.rating}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Bus Types */}
                                        <div>
                                            <Label className="text-sm font-medium mb-3 block text-[hsl(var(--primary))]">Loại xe</Label>
                                            <div className="space-y-3">
                                                {busTypes.map((type) => (
                                                    <div key={type} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={type}
                                                            checked={selectedTypes.includes(type)}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) {
                                                                    setSelectedTypes([...selectedTypes, type]);
                                                                } else {
                                                                    setSelectedTypes(selectedTypes.filter(t => t !== type));
                                                                }
                                                            }}
                                                        />
                                                        <label htmlFor={type} className="text-sm cursor-pointer flex items-center gap-1">
                                                            {getTypeIcon(type)}
                                                            {type}
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
                                                    <Checkbox id="wifi" />
                                                    <label htmlFor="wifi" className="text-sm cursor-pointer">
                                                        Có WiFi
                                                    </label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox id="toilet" />
                                                    <label htmlFor="toilet" className="text-sm cursor-pointer">
                                                        Có WC
                                                    </label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox id="refundable" />
                                                    <label htmlFor="refundable" className="text-sm cursor-pointer">
                                                        Có hoàn hủy
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
                                        Tìm thấy {sortedBuses.length} chuyến xe
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
                                            <SelectItem value="rating">Đánh giá cao nhất</SelectItem>
                                            <SelectItem value="duration">Thời gian ngắn nhất</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Bus Results */}
                            <BusResults
                                isLoading={isLoading}
                                sortedBuses={sortedBuses}
                                showDetails={showDetails}
                                setShowDetails={setShowDetails}
                                formatPrice={formatPrice}
                                getTypeIcon={getTypeIcon}
                                getAmenityIcon={getAmenityIcon}
                            />

                            {sortedBuses.length === 0 && (
                                <Card className="text-center py-12">
                                    <CardContent>
                                        <Bus className="h-12 w-12 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
                                        <h3 className="text-lg font-medium mb-2">Không tìm thấy chuyến xe phù hợp</h3>
                                        <p className="text-[hsl(var(--muted-foreground))] mb-4">
                                            Vui lòng thử điều chỉnh bộ lọc hoặc thay đổi tuyến đường
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
