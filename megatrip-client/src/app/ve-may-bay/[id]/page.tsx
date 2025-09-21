"use client"
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { Separator } from '../../components/ui/separator';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
    Plane,
    ArrowRight,
    Clock,
    Luggage,
    Wifi,
    Coffee,
    Star,
    Calendar,
    Users,
    CreditCard,
    Shield,
    AlertCircle,
    ChevronLeft,
    MapPin,
    Timer,
    PlusCircle,
    Info,
    Minus,
    Plus,
} from 'lucide-react';
import { useRouter } from 'next/navigation';


// same cache key used in FlightResults
const CACHE_KEY = 'amadeus_pricing_cache_v1';

const loadCacheFromStorage = () => {
    try {
        if (typeof window === 'undefined') return {};
        const raw = localStorage.getItem(CACHE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
};

// Sample flight data - normally would come from API based on ID
const flightDetails = {
    id: 1,
    airline: 'Vietnam Airlines',
    flightNumber: 'VN1546',
    departure: { time: '06:15', airport: 'SGN', city: 'TP.HCM', terminal: 'Terminal 1' },
    arrival: { time: '08:30', airport: 'HAN', city: 'Hà Nội', terminal: 'Terminal 1' },
    duration: '2h 15m',
    aircraft: 'Airbus A321',
    date: '15/01/2025',
    price: 1990000,
    originalPrice: 2490000,
    class: 'Phổ thông',
    baggage: { handbag: '7kg', checkin: '23kg' },
    amenities: ['wifi', 'meal', 'entertainment'],
    cancellable: true,
    changeable: true,
    availableSeats: 12,
    discount: 20,
    fareRules: {
        basic: { price: 1990000, changeFee: 500000, cancelFee: 1000000, baggage: '23kg' },
        standard: { price: 2190000, changeFee: 200000, cancelFee: 500000, baggage: '23kg', seatSelection: true },
        flex: { price: 2490000, changeFee: 0, cancelFee: 0, baggage: '30kg', seatSelection: true, priority: true },
    }
};

const addOnServices = [
    // {
    //     id: 'baggage_10',
    //     name: 'Hành lý ký gửi thêm 10kg',
    //     price: 200000,
    //     description: 'Thêm 10kg hành lý ký gửi (tối đa 33kg)',
    // },
    {
        id: 'seat_selection',
        name: 'Chọn chỗ ngồi',
        price: 150000,
        description: 'Chọn chỗ ngồi yêu thích trên máy bay',
    },
    {
        id: 'meal_upgrade',
        name: 'Nâng cấp suất ăn',
        price: 300000,
        description: 'Suất ăn cao cấp với nhiều lựa chọn',
    },
    {
        id: 'priority_checkin',
        name: 'Check-in ưu tiên',
        price: 100000,
        description: 'Check-in nhanh chóng tại sân bay',
    },
    {
        id: 'travel_insurance',
        name: 'Bảo hiểm du lịch',
        price: 250000,
        description: 'Bảo hiểm toàn diện cho chuyến đi',
    },
];

export default function ChiTietVeMayBay() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id ?? null;

    // --- ADDED: mapped state for easier UI ---
    const [cachedPricing, setCachedPricing] = useState<any | null>(null);
    const [cachedSeatmap, setCachedSeatmap] = useState<any | null>(null);
    const [mappedOffer, setMappedOffer] = useState<any | null>(null);
    const [seatmapSummary, setSeatmapSummary] = useState<any | null>(null);
    // dynamic add-ons: static fallback + any included resources from pricing (bags, credit-card-fees, other-services, detailed-fare-rules, ...)
    const [dynamicAddOnServices, setDynamicAddOnServices] = useState<typeof addOnServices>(addOnServices);

    useEffect(() => {
        if (!id) return;
        try {
            const stored = loadCacheFromStorage();
            // LOG: kiểm tra cache cho id này
            console.log('[Flight detail] id=', id, 'cache present:', Boolean(stored));
            console.log('[Flight detail] pricing for id=', id, stored?.pricing?.[id]);
            console.log('[Flight detail] seatmap for id=', id, stored?.seatmap?.[id]);
            console.log('[Flight detail] signature for id=', id, stored?.signatures?.[id]);
            if (stored && stored.pricing && stored.pricing[id]) {
                setCachedPricing(stored.pricing[id]);
                // normalize/derive offer
                const offer =
                    stored.pricing[id]?.data?.flightOffers?.[0] ??
                    (Array.isArray(stored.pricing[id]?.data) ? stored.pricing[id].data[0] : (stored.pricing[id]?.data ?? stored.pricing[id] ?? null));
                const travelerCount = (offer?.travelerPricings && offer.travelerPricings.length) || (offer?.travelerPricings?.length) || 0;
                const mapped = {
                    numberOfBookableSeats: offer?.numberOfBookableSeats ?? stored.pricing[id]?.data?.flightOffers?.[0]?.numberOfBookableSeats ?? null,
                    total: offer?.price?.total ?? stored.pricing[id]?.price?.total ?? null,
                    currency: offer?.price?.currency ?? stored.pricing[id]?.price?.currency ?? null,
                    travelerPricingsCount: travelerCount,
                    validatingAirlines: offer?.validatingAirlineCodes ?? stored.pricing[id]?.validatingAirlineCodes ?? [],
                    lastTicketingDate: offer?.lastTicketingDate ?? null,
                    rawOffer: offer
                };
                setMappedOffer(mapped);
                console.log('[Flight detail] mappedOffer=', mapped);
            }
            if (stored && stored.seatmap && stored.seatmap[id]) {
                setCachedSeatmap(stored.seatmap[id]);
                const summary = {
                    aircraftCode: stored.seatmap[id]?.aircraft?.code ?? stored.seatmap[id]?.data?.aircraft?.code ?? null,
                    availableSeatsCounters: stored.seatmap[id]?.availableSeatsCounters ?? stored.seatmap[id]?.data?.availableSeatsCounters ?? null,
                    rawSeatmap: stored.seatmap[id]
                };
                setSeatmapSummary(summary);
                console.log('[Flight detail] seatmapSummary=', summary);
            }
            // map ALL included resources into add-on-like items (merge with static addOnServices)
            const inc = stored.pricing[id]?.included ?? stored.pricing[id]?.data?.included ?? {};
            console.log('[Flight detail] included keys:', Object.keys(inc));
            const includedAddOns: any[] = [];
            for (const [key, val] of Object.entries(inc || {})) {
                // SKIP: do not map detailed fare rules or credit-card-fees into add-on list
                if (key === 'detailed-fare-rules' || key === 'credit-card-fees') {
                    console.log(`[Flight detail] skipping included key for add-ons: ${key}`);
                    continue;
                }
                // val can be an object mapping ids -> resources, or an array
                if (!val) continue;
                if (Array.isArray(val)) {
                    val.forEach((entry, idx) => {
                        // SPECIAL: if key === 'bags' we want to include quantity meaning
                        const price = entry?.price?.amount ?? entry?.amount ?? null;
                        const currency = entry?.price?.currencyCode ?? entry?.price?.currency ?? null;
                        const qty = entry?.quantity ?? null;
                        const baseName = entry?.name ?? `${key} ${idx + 1}`;
                        const name = key === 'bags' && qty ? `${baseName} (${qty} kiện)` : baseName;
                        let desc = entry?.description ?? entry?.text ?? (entry?.fareNotes?.descriptions?.[0]?.text ?? null);
                        if (key === 'bags') {
                            // Giải thích đơn giản về số kiện, đoạn bay, hành khách
                            const segs = Array.isArray(entry?.segmentIds)
                                ? `Đoạn bay: ${entry.segmentIds.join(', ')}`
                                : '';
                            const travs = Array.isArray(entry?.travelerIds)
                                ? `Hành khách: ${entry.travelerIds.join(', ')}`
                                : '';
                            const qtyNote = qty
                                ? `Số kiện: ${qty}`
                                : '';

                            // Ghép thành nhiều dòng cho dễ đọc
                            desc = [qtyNote, segs, travs, desc].filter(Boolean).join('\n');
                        }

                        includedAddOns.push({
                            id: `${key}_${idx}`,
                            name,
                            price: price != null ? Number(String(price).replace(/[^\d.-]/g, '')) : 0,
                            currency: currency ?? 'VND',
                            description: desc ? String(desc).slice(0, 300) : key,
                            raw: entry,
                            sourceKey: key
                        });
                    });
                } else if (typeof val === 'object') {
                    // object keyed by id
                    Object.entries(val).forEach(([subKey, entry]: any, idx) => {
                        if (!entry) return;
                        const price = entry?.price?.amount ?? entry?.amount ?? entry?.amount?.value ?? null;
                        const currency = entry?.price?.currencyCode ?? entry?.price?.currency ?? entry?.currency ?? null;
                        const qty = entry?.quantity ?? null;
                        let name = entry?.name ?? entry?.brand ?? `${key} ${subKey}`;
                        let desc = entry?.fareNotes?.descriptions?.[0]?.text ?? entry?.text ?? entry?.description ?? null;
                        if (key === 'bags') {
                            // object-style bags (keyed by id) -> include quantity note as above
                            name = entry?.name ? `${entry.name}${qty ? ` (${qty} kiện)` : ''}` : `${key} ${subKey}${qty ? ` (${qty} kiện)` : ''}`;
                            // const segs = Array.isArray(entry?.segmentIds) ? `Chặng: ${entry.segmentIds.join(', ')}` : '';
                            // const travs = Array.isArray(entry?.travelerIds) ? `Hành khách: ${entry.travelerIds.join(', ')}` : '';
                            const qtyNote = qty ? `Số kiện: ${qty} (số kiện ký gửi mặc định cho lựa chọn này (23kg/1 kiện))` : '';
                            // desc = [qtyNote, segs, travs, desc].filter(Boolean).join('\n');
                            desc = [qtyNote,  desc].filter(Boolean).join('\n');

                        }
                        includedAddOns.push({
                            id: `${key}_${subKey}`,
                            name,
                            price: price != null ? Number(String(price).replace(/[^\d.-]/g, '')) : 0,
                            currency: currency ?? 'VND',
                            description: desc ? String(desc).slice(0, 300) : key,
                            raw: entry,
                            sourceKey: key
                        });
                    });
                }
            }
            // merge static + includedAddOns (static first)
            const merged = [
                ...addOnServices,
                ...includedAddOns.filter(ia => !addOnServices.some(s => s.id === ia.id))
            ];
            setDynamicAddOnServices(merged);
        } catch (e) {
            console.warn('Error loading cached pricing/seatmap', e);
        }
    }, [id]);

    // MOVE: formatPrice must be defined before we derive/display prices
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };
    
    // --- NEW: derive normalized fields from cached pricing for direct mapping into UI ---
    const normalizedOffer = mappedOffer?.rawOffer ?? null;
    const priceRaw = normalizedOffer?.price?.total ?? cachedPricing?.price?.total ?? flightDetails.price;
    const priceNumber = Number(String(priceRaw).replace(/[^\d.-]/g, '')) || Number(flightDetails.price);
    const currency = normalizedOffer?.price?.currency ?? cachedPricing?.price?.currency ?? 'VND';
    const displayPrice = currency === 'VND' ? formatPrice(priceNumber) : `${priceNumber.toLocaleString()} ${currency}`;
 
    // fare / baggage from traveler pricing if available
    const traveler = normalizedOffer?.travelerPricings?.[0] ?? null;
    const fareSeg = traveler?.fareDetailsBySegment?.[0] ?? traveler?.fareDetails?.[0] ?? null;
    const displayCabin = fareSeg?.includedCabinBags?.quantity ?? fareSeg?.includedCabinBags?.weight ?? flightDetails.baggage.handbag;
    const displayChecked = fareSeg?.includedCheckedBags?.quantity ?? fareSeg?.includedCheckedBags?.weight ?? flightDetails.baggage.checkin;
 
    // bookable seats
    const numberOfBookableSeats = normalizedOffer?.numberOfBookableSeats ?? mappedOffer?.numberOfBookableSeats ?? flightDetails.availableSeats;
 
    // simple refundable detection
    const parseRefundable = (obj: any) => {
        if (!obj) return false;
        const cand = obj?.price?.refundableTaxes ?? obj?.price?.refundableTaxesAmount ?? obj?.refundableTaxes ?? obj?.refundableTaxesAmount ?? null;
        if (cand == null) return false;
        const num = Number(String(cand).replace(/[^\d.-]/g, ''));
        return Number.isFinite(num) && num > 0;
    };
    const policyObj = cachedPricing?.data?.policies ?? cachedPricing?.policies ?? null;
    const isRefundable = (Array.isArray(normalizedOffer?.travelerPricings) && normalizedOffer.travelerPricings.some(parseRefundable)) || parseRefundable(normalizedOffer) || Boolean(policyObj?.cancellable) || flightDetails.cancellable;
 
    // changeable detection (basic): scan included detailed-fare-rules text for "CHANGE"
    const included = cachedPricing?.included ?? cachedPricing?.data?.included ?? {};
    const detailedFareRules = included?.['detailed-fare-rules'] ?? {};
    let isChangeable = flightDetails.changeable;
    try {
        for (const r of Object.values(detailedFareRules || {})) {
            const notes = r?.fareNotes?.descriptions ?? [];
            for (const n of notes) {
                if (String(n?.text ?? '').toUpperCase().includes('CHANGE')) {
                    isChangeable = true;
                    break;
                }
            }
            if (isChangeable) break;
        }
    } catch (e) { /* ignore */ }

    // Số lượng khách từng loại
    const [participants, setParticipants] = useState({
        adults: 1,
        children: 0,
        infants: 0,
    });
    const [selectedFare, setSelectedFare] = useState('basic');
    const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
    const [passengerInfo, setPassengerInfo] = useState({
        title: 'Mr',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        nationality: 'VN',
        idNumber: '',
        idType: 'cccd',
    });
    const [contactInfo, setContactInfo] = useState({
        email: '',
        phone: '',
        address: '',
    });

    const totalParticipants = participants.adults + participants.children + participants.infants;

    const toggleAddOn = (addOnId: string) => {
        setSelectedAddOns(prev =>
            prev.includes(addOnId)
                ? prev.filter(id => id !== addOnId)
                : [...prev, addOnId]
        );
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
        const adultTotal = participants.adults * flightDetails.fareRules[selectedFare as keyof typeof flightDetails.fareRules].price;
        const childTotal = participants.children * Math.round(flightDetails.fareRules[selectedFare as keyof typeof flightDetails.fareRules].price * 0.75);
        const infantTotal = participants.infants * Math.round(flightDetails.fareRules[selectedFare as keyof typeof flightDetails.fareRules].price * 0.2);
        const addOnTotal = selectedAddOns.reduce((total, addOnId) => {
            const addOn = dynamicAddOnServices.find(service => service.id === addOnId);
            return total + ((addOn?.price || 0) * (participants.adults + participants.children + participants.infants));
        }, 0);
        return adultTotal + childTotal + infantTotal + addOnTotal;
    };

    const getAmenityIcon = (amenity: string) => {
        switch (amenity) {
            case 'wifi': return <Wifi className="h-4 w-4" />;
            case 'meal': return <Coffee className="h-4 w-4" />;
            case 'entertainment': return <Star className="h-4 w-4" />;
            default: return null;
        }
    };

    const handleFareChange = (value: string) => {
        setSelectedFare(value);
        console.log('Chọn hạng vé:', value);
    };

    return (
        <>
            {/* Breadcrumb */}
            <div className="border-b">
                <div className="container py-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Link prefetch={false} href="/" className="hover:text-primary">Trang chủ</Link>
                        <span>/</span>
                        <Link prefetch={false} href="/ve-may-bay" className="hover:text-primary">Vé máy bay</Link>
                        <span>/</span>
                        <span>Chi tiết chuyến bay</span>
                    </div>
                </div>
            </div>

            <div className="container py-6">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content */}
                    <div className="flex-1 space-y-6">
                        {/* If cached pricing present, map fields directly into UI elements below (no separate summary card) */}
                        {/* (mappedOffer/seatmapSummary used to derive values; UI below uses derived variables) */}
 
                        {/* Back Button */}
                        <Button variant="outline" asChild className="w-fit">
                            <Link prefetch={false} href="/ve-may-bay">
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Quay lại kết quả tìm kiếm
                            </Link>
                        </Button>
 
                        {/* Flight Details */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded bg-[hsl(var(--primary))/0.1] flex items-center justify-center">
                                            <Plane className="h-5 w-5 text-[hsl(var(--primary))]" />
                                        </div>
                                        <div>
                                            <div className="text-xl">{flightDetails.airline}</div>
                                            <div className="text-sm text-[hsl(var(--muted-foreground))] font-normal">
                                                {flightDetails.flightNumber} • {flightDetails.aircraft}
                                            </div>
                                        </div>
                                    </CardTitle>
                                    {/* {flightDetails.discount && (
                                        <Badge variant="destructive" className="text-lg">-{flightDetails.discount}%</Badge>
                                    )} */}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Flight Route */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="text-center">
                                        { /* prefer times from pricing itineraries if present */ }
                                        <div className="text-2xl font-bold">{normalizedOffer?.itineraries?.[0]?.segments?.[0]?.departure?.at?.split('T')?.[1]?.slice(0,5) ?? flightDetails.departure.time}</div>
                                        <div className="text-lg font-medium">{normalizedOffer?.itineraries?.[0]?.segments?.[0]?.departure?.iataCode ?? flightDetails.departure.airport}</div>
                                        <div className="text-sm text-[hsl(var(--muted-foreground))]">{flightDetails.departure.city}</div>
                                        <div className="text-xs text-[hsl(var(--muted-foreground))]">{/* departure terminal */} Terminal {normalizedOffer?.itineraries?.[0]?.segments?.[0]?.departure?.terminal ?? flightDetails.departure.terminal}</div>
                                        <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{normalizedOffer?.itineraries?.[0]?.segments?.[0]?.departure?.at?.split('T')?.[0] ?? flightDetails.date}</div>
                                    </div>
 
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="text-sm text-[hsl(var(--muted))] mb-2">{normalizedOffer?.itineraries?.[0]?.duration ?? flightDetails.duration}</div>
                                         <div className="flex items-center w-full">
                                             <div className="flex-1 h-px bg-[hsl(var(--muted))]"></div>
                                             <ArrowRight className="h-5 w-5 mx-2 text-[hsl(var(--muted-foreground))]" />
                                             <div className="flex-1 h-px bg-[hsl(var(--muted))]"></div>
                                         </div>
                                         <div className="text-xs text-[hsl(var(--muted-foreground))] mt-2">Bay thẳng</div>
                                     </div>
 
                                     <div className="text-center">
                                        <div className="text-2xl font-bold">{normalizedOffer?.itineraries?.[0]?.segments?.[0]?.arrival?.at?.split('T')?.[1]?.slice(0,5) ?? flightDetails.arrival.time}</div>
                                        <div className="text-lg font-medium">{normalizedOffer?.itineraries?.[0]?.segments?.[0]?.arrival?.iataCode ?? flightDetails.arrival.airport}</div>
                                        <div className="text-sm text-[hsl(var(--muted-foreground))]">{flightDetails.arrival.city}</div>
                                        <div className="text-xs text-[hsl(var(--muted-foreground))]">{/* arrival terminal */} Terminal {normalizedOffer?.itineraries?.[0]?.segments?.slice(-1)[0]?.arrival?.terminal ?? flightDetails.arrival.terminal}</div>
                                        <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{normalizedOffer?.itineraries?.[0]?.segments?.[0]?.arrival?.at?.split('T')?.[0] ?? flightDetails.date}</div>

                                     </div>
                                 </div>
 
                                 <Separator />
 
                                 {/* Flight Info */}
                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                     <div>
                                         <h4 className="font-medium mb-2">Hành lý</h4>
                                         <div className="space-y-1 text-sm text-[hsl(var(--muted-foreground))]">
                                             <div className="flex items-center gap-2">
                                                 <Luggage className="h-4 w-4" />
{/*                                                Xách tay: {flightDetails.baggage.handbag} */}
+                                                Xách tay: {displayCabin}
                                             </div>
                                             <div className="flex items-center gap-2">
                                                 <Luggage className="h-4 w-4" />
{/*                                                Ký gửi: {flightDetails.baggage.checkin} */}
+                                                Ký gửi: {displayChecked}
                                             </div>
                                         </div>
                                     </div>
 
                                     <div>
                                         <h4 className="font-medium mb-2">Tiện ích</h4>
                                         <div className="flex gap-3">
                                              
                                         </div>
                                     </div>
 
                                     <div>
                                         <h4 className="font-medium mb-2">Điều kiện vé</h4>
                                         <div className="space-y-1 text-sm text-[hsl(var(--muted-foreground))]">
                                            
                                            <div>{isRefundable ? '✓ Có hoàn hủy' : '✗ Không hoàn hủy'}</div>
                                            <div>{isChangeable ? '✓ Có thể đổi' : '✗ Không thể đổi'}</div>
                                         </div>
                                     </div>
                                 </div>
                             </CardContent>
                         </Card>
                                 

                        {/* Add-on Services */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Dịch vụ bổ sung</CardTitle>
                                <p className="text-[hsl(var(--muted-foreground))]">
                                    Nâng cao trải nghiệm bay của bạn với các dịch vụ thêm
                                </p>
                            </CardHeader>
                            <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {dynamicAddOnServices.map((service) => (
                                        <div
                                            key={service.id}
                                            className={`border rounded-lg p-4 transition-colors ${selectedAddOns.includes(service.id) ? 'border-primary bg-[hsl(var(--primary))/0.05]' : 'hover:bg-[hsl(var(--muted))]'}`}
                                        >
                                            <div className="flex items-start space-x-3">
                                                <Checkbox
                                                    checked={selectedAddOns.includes(service.id)}
                                                    onCheckedChange={() => toggleAddOn(service.id)}
                                                />
                                                <div className="flex-1 cursor-pointer" onClick={() => toggleAddOn(service.id)}>
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-medium">{service.name}</h4>
                                                        <span className="font-bold text-[hsl(var(--primary))]">
                                                            {service.currency && service.currency !== 'VND' ? `${Number(service.price).toLocaleString()} ${service.currency}` : formatPrice(Number(service.price))}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                                                        {service.description ?? (service.raw ? JSON.stringify(service.raw).slice(0,200) : '')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Passenger Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin hành khách</CardTitle>
                                <p className="text-[hsl(var(--muted-foreground))]">
                                    Vui lòng điền chính xác thông tin theo giấy tờ tùy thân
                                </p>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="passenger" className="w-full">
                                    <TabsList>
                                        <TabsTrigger value="passenger">Hành khách</TabsTrigger>
                                        <TabsTrigger value="contact">Thông tin liên hệ</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="passenger" className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <Label htmlFor="title">Danh xưng</Label>
                                                <Select value={passengerInfo.title} onValueChange={(value) => setPassengerInfo(prev => ({ ...prev, title: value }))}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Mr">Ông</SelectItem>
                                                        <SelectItem value="Mrs">Bà</SelectItem>
                                                        <SelectItem value="Ms">Cô</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor="firstName">Họ và tên đệm</Label>
                                                <Input id="firstName" value={passengerInfo.firstName} onChange={(e) => setPassengerInfo(prev => ({ ...prev, firstName: e.target.value }))} placeholder="VD: NGUYEN VAN" />
                                            </div>
                                            <div>
                                                <Label htmlFor="lastName">Tên</Label>
                                                <Input id="lastName" value={passengerInfo.lastName} onChange={(e) => setPassengerInfo(prev => ({ ...prev, lastName: e.target.value }))} placeholder="VD: AN" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="dateOfBirth">Ngày sinh</Label>
                                                <Input id="dateOfBirth" type="date"
                                                    className="block h-12 bg-white shadow-md text-black w-full"
                                                    value={passengerInfo.dateOfBirth} onChange={(e) => setPassengerInfo(prev => ({ ...prev, dateOfBirth: e.target.value }))} />
                                            </div>
                                            <div>
                                                <Label htmlFor="nationality">Quốc tịch</Label>
                                                <Select value={passengerInfo.nationality} onValueChange={(value) => setPassengerInfo(prev => ({ ...prev, nationality: value }))}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="VN">Việt Nam</SelectItem>
                                                        <SelectItem value="US">Hoa Kỳ</SelectItem>
                                                        <SelectItem value="GB">Anh</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="idType">Loại giấy tờ</Label>
                                                <Select value={passengerInfo.idType} onValueChange={(value) => setPassengerInfo(prev => ({ ...prev, idType: value }))}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="cccd">CCCD</SelectItem>
                                                        <SelectItem value="cmnd">CMND</SelectItem>
                                                        <SelectItem value="passport">Hộ chiếu</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor="idNumber">Số giấy tờ</Label>
                                                <Input id="idNumber" value={passengerInfo.idNumber} onChange={(e) => setPassengerInfo(prev => ({ ...prev, idNumber: e.target.value }))} placeholder="Nhập số CCCD/CMND/Hộ chiếu" />
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="contact" className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="email">Email *</Label>
                                                <Input id="email" type="email" value={contactInfo.email} onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))} placeholder="email@example.com" />
                                            </div>
                                            <div>
                                                <Label htmlFor="phone">Số điện thoại *</Label>
                                                <Input id="phone" value={contactInfo.phone} onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))} placeholder="0912345678" />
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="address">Địa chỉ</Label>
                                            <Input id="address" value={contactInfo.address} onChange={(e) => setContactInfo(prev => ({ ...prev, address: e.target.value }))} placeholder="Địa chỉ liên hệ" />
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar - Booking Summary */}
                    <div className="lg:w-96">
                        <Card className="sticky top-20">
                            <CardHeader>
                                <CardTitle>Đặt vé máy bay</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1">
                                {/* Số lượng khách */}
                                {/* <div>
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
                                </div> */}
                                <Separator />
                                {/* Flight Summary */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium">Chuyến bay</span>
                                        <span className="text-sm text-[hsl(var(--muted-foreground))]">{flightDetails.flightNumber}</span>
                                    </div>
                                    <div className="text-sm text-[hsl(var(--muted-foreground))]">
                                        {flightDetails.departure.city} → {flightDetails.arrival.city}<br />
                                        {flightDetails.date} • {flightDetails.departure.time} - {flightDetails.arrival.time}
                                    </div>
                                </div>
                                <Separator />
                                {/* Pricing Breakdown */}
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Người lớn ({participants.adults})</span>
                                        <span>{currency === 'VND' ? formatPrice(participants.adults * priceNumber) : `${(participants.adults * priceNumber).toLocaleString()} ${currency}`}</span>
                                    </div>
                                    {participants.children > 0 && (
                                        <div className="flex justify-between">
                                            <span>Trẻ em ({participants.children})</span>
                                            <span>{formatPrice(participants.children * Math.round(flightDetails.fareRules[selectedFare as keyof typeof flightDetails.fareRules].price * 0.75))}</span>
                                        </div>
                                    )}
                                    {participants.infants > 0 && (
                                        <div className="flex justify-between">
                                            <span>Em bé ({participants.infants})</span>
                                            <span>{formatPrice(participants.infants * Math.round(flightDetails.fareRules[selectedFare as keyof typeof flightDetails.fareRules].price * 0.2))}</span>
                                        </div>
                                    )}
                                    {selectedAddOns.length > 0 && (
                                        <div className="space-y-1">
                                            {selectedAddOns.map(addOnId => {
                                                const addOn = dynamicAddOnServices.find(service => service.id === addOnId);
                                                return addOn ? (
                                                    <div key={addOnId} className="flex justify-between text-sm">
                                                        <span>{addOn.name} ({totalParticipants})</span>
                                                        <span>{addOn.currency && addOn.currency !== 'VND' ? `${(addOn.price * totalParticipants).toLocaleString()} ${addOn.currency}` : formatPrice(addOn.price * totalParticipants)}</span>
                                                    </div>
                                                ) : null;
                                            })}
                                        </div>
                                    )}
                                    {flightDetails.originalPrice && (
                                        <div className="flex justify-between text-sm text-muted-foreground">
                                            <span>Giá gốc</span>
                                            <span className="line-through">{formatPrice(flightDetails.originalPrice * totalParticipants)}</span>
                                        </div>
                                    )}
                                    <Separator />
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Tổng cộng (giá từ pricing)</span>
                                        <span className="text-[hsl(var(--primary))]">{currency === 'VND' ? formatPrice((participants.adults + participants.children + participants.infants) * priceNumber) : `${((participants.adults + participants.children + participants.infants) * priceNumber).toLocaleString()} ${currency}`}</span>
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
                                            Giá vé có thể thay đổi trong quá trình đặt chỗ
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Info className="h-4 w-4 text-[hsl(var(--primary))] mt-0.5" />
                                        <div className="text-xs text-[hsl(var(--muted-foreground))]">
                                            Vé sẽ được giữ chỗ trong 15 phút
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-2 pt-4">
                                    <Button className="w-full" size="lg" onClick={() => {
                                        // Tính toán giá trị booking
                                        const basePrice = flightDetails.fareRules[selectedFare].price * participants.adults;
                                        const taxes = 290000 * (participants.adults + participants.children + participants.infants); // demo
                                        const addOns = selectedAddOns.reduce((total, addOnId) => {
                                            const addOn = addOnServices.find(service => service.id === addOnId);
                                            return total + (addOn?.price || 0) * (participants.adults + participants.children + participants.infants);
                                        }, 0);
                                        const discount = flightDetails.discount ? -Math.round(basePrice * flightDetails.discount / 100) : 0;
                                        const total = basePrice + taxes + addOns + discount;
                                        // Chuyển sang trang thanh toán với param
                                        const params = new URLSearchParams({
                                            type: 'flight',
                                            route: `${flightDetails.departure.city} → ${flightDetails.arrival.city}`,
                                            date: flightDetails.date,
                                            time: `${flightDetails.departure.time} - ${flightDetails.arrival.time}`,
                                            flightNumber: flightDetails.flightNumber,
                                            airline: flightDetails.airline,
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
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
