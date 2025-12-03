"use client"
import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
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
// Thêm import
import { toast } from 'sonner';
import { withSuspense } from '@/app/components/SuspenseWrapper';
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
        children: 'Trẻ con dưới 4 tuổi được miễn phí (không có ghế riêng)',
        pets: 'Không cho phép mang thú cưng',
    }
};

// Sample seat layout - simplified for demo
const sampleSeatLayout = [
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

 function ChiTietXeDuLich() {
    const router = useRouter();
    const { id } = useParams() as { id: string };
    const searchParams = useSearchParams();
    const [remoteBus, setRemoteBus] = useState<any | null>(null);
    const [busSlotsMap, setBusSlotsMap] = useState<Record<string, any>>({});
    const [derivedSeatLayout, setDerivedSeatLayout] = useState<any[]>([]);
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:7700';
    // prefer local Y-M-D string (avoid UTC shift from toISOString)
    const toLocalYMD = (d: Date | null) => {
        if (!d) return null;
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };
    // helper: build rows from flat seatmapFill returned by bus-slot
    const normalizeNum = (v: any): number | null => {
        if (v == null) return null;
        if (typeof v === 'number') return v;
        if (typeof v === 'string' && /^\d+$/.test(v)) return Number(v);
        if (typeof v === 'object') {
            if (v.$numberInt) return Number(v.$numberInt);
            if (v.$numberLong) return Number(v.$numberLong);
            if (v.$date && v.$date.$numberLong) return Number(v.$date.$numberLong);
            // fallback: try numeric coercion
            const n = Number(v);
            return Number.isFinite(n) ? n : null;
        }
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
    };

    const buildLayoutFromSlot = (seatmapFill: any[] = []) => {
        const rowsMap: Record<string, any[]> = {};
        for (const s of seatmapFill || []) {
            const rawR = s?.pos?.r ?? s?.pos;
            const rawC = s?.pos?.c ?? null;
            const rNum = normalizeNum(rawR);
            const cNum = normalizeNum(rawC);
            const rowKey = rNum !== null ? String(rNum) : '0';
            rowsMap[rowKey] = rowsMap[rowKey] || [];
            rowsMap[rowKey].push({
                id: s.seatId || s.label,
                label: s.label || s.seatId,
                type: s.type || 'seat',
                status: (s.status === 'booked' || s.status === 'blocked') ? 'booked' : (s.status || 'available'),
                floor: (String(s.type || '').toLowerCase().includes('upper') ? 'upper' : 'lower'),
                pos: { r: rNum, c: cNum },
            });
        }
        return Object.keys(rowsMap)
            .sort((a, b) => Number(a) - Number(b))
            .map(k => rowsMap[k]);
    };
    const mapBusDocToClient = (doc: any) => {
        const toNumber = (v: any) => {
            if (v == null) return undefined;
            if (typeof v === 'number') return v;
            if (typeof v === 'string' && /^\d+$/.test(v)) return Number(v);
            // nested mongo export shapes
            if (v?.$numberInt) return Number(v.$numberInt);
            if (v?.$numberLong) return Number(v.$numberLong);
            if (v?.$date?.$numberLong) return Number(v.$date.$numberLong);
            if (v?.$date) return Number(new Date(v.$date));
            return Number(v);
        };

        const toDate = (raw: any) => {
            const n = toNumber(raw);
            if (!n) return null;
            return new Date(n);
        };

        const fmtDate = (d: Date | null) => d ? d.toISOString().split('T')[0] : '';

        const departureDate = toDate(doc.departureAt ?? (doc.departureDates && doc.departureDates[0]));
        const arrivalDate = toDate(doc.arrivalAt ?? (doc.arrivalDates && doc.arrivalDates[0]));

        // convert seatMap -> grouped rows (array of rows)
        const seatMap = Array.isArray(doc.seatMap) ? doc.seatMap : [];
        const rows: Record<string, any[]> = {};
        seatMap.forEach((s: any) => {
            const r = s?.pos?.r?.$numberInt ?? s?.pos?.r ?? '0';
            const rowKey = String(r);
            rows[rowKey] = rows[rowKey] || [];
            const floor = String(s.type || '').toLowerCase().includes('upper') ? 'upper' : 'lower';
            rows[rowKey].push({
                id: s.seatId ?? s.label,
                label: s.label ?? s.seatId,
                type: String(s.type).includes('bed') ? 'bed' : 'seat',
                status: s.status ?? 'available',
                floor,
                pos: {
                    r: rowKey,
                    c: s?.pos?.c?.$numberInt ?? s?.pos?.c ?? null
                }
            });
        });
        const seatLayout = Object.keys(rows).sort((a, b) => Number(a) - Number(b)).map(k => rows[k]);
        // price mapping: prefer explicit adultPrice/childPrice/infantPrice; fallback to legacy price if present
        const adultPrice = toNumber(doc.adultPrice ?? doc.price);
        const childPrice = toNumber(doc.childPrice ?? (adultPrice ? Math.round(adultPrice * 0.75) : undefined));
        const infantPrice = toNumber(doc.infantPrice ?? (adultPrice ? Math.round(adultPrice * 0.2) : undefined));

        return {
            id: doc._id?.$oid ?? doc._id ?? doc.busCode,
            busNumber: doc.busCode ?? doc.busNumber,
            company: doc.operator?.name ?? doc.operator,
            images: doc.operator?.logo ? [doc.operator.logo] : (doc.images || []),
            route: `${doc.routeFrom?.city ?? doc.routeFrom?.name ?? ''} - ${doc.routeTo?.city ?? doc.routeTo?.name ?? ''}`.trim(),
            routeFrom: doc.routeFrom,
            routeTo: doc.routeTo,
            departure: {
                time: departureDate ? departureDate.toISOString().split('T')[1].slice(0, 5) : '',
                location: doc.routeFrom?.name ?? '',
                address: doc.routeFrom?.city ?? ''
            },
            arrival: {
                time: arrivalDate ? arrivalDate.toISOString().split('T')[1].slice(0, 5) : '',
                location: doc.routeTo?.name ?? '',
                address: doc.routeTo?.city ?? ''
            },
            date: fmtDate(departureDate),
            departureDate,
            arrivalDate,
            duration: doc.duration ?? '',
            type: Array.isArray(doc.busType) ? doc.busType.join(', ') : doc.busType,
            adultPrice: adultPrice ?? 0,
            childPrice: childPrice ?? 0,
            infantPrice: infantPrice ?? 0,
            seats: toNumber(doc.seatsTotal),
            availableSeats: toNumber(doc.seatsAvailable),
            seatLayout, // array of rows with seats
            amenities: Array.isArray(doc.amenities) ? doc.amenities : (typeof doc.amenities === 'string' ? doc.amenities.split(',') : []),
            status: doc.status,
            raw: doc
        };
    }
    useEffect(() => {
        if (!id) return;
        let mounted = true;
        (async () => {
            try {
                console.log('[BusDetail] fetch id:', id);
                const res = await fetch(`${API_BASE}/api/buses/${id}`);
                if (!res.ok) {
                    const txt = await res.text();
                    throw new Error(txt || res.statusText);
                }
                const json = await res.json();
                // backend may return doc directly or { data: doc }
                const doc = json?.data ?? json;
                console.log('[BusDetail] raw api doc:', doc);
                const mapped = mapBusDocToClient(doc);
                if (mounted) setRemoteBus(mapped);
            } catch (err) {
                console.error('Failed to load bus detail', err);
                if (mounted) setRemoteBus(null);
            }
        })();
        // fetch slots for this bus (to get per-date seatmap/seatsAvailable)
        (async () => {
            try {
                const r = await fetch(`${API_BASE}/api/buses/bus-slots/${id}`);
                if (r.ok) {
                    const json = await r.json();
                    // map dateIso -> booking entry
                    const map: Record<string, any> = {};
                    for (const db of (json.dateBookings || [])) {
                        if (!db || !db.dateIso) continue;
                        map[String(db.dateIso).trim()] = db;
                    }
                    if (mounted) setBusSlotsMap(map);
                } else {
                    setBusSlotsMap({});
                }
            } catch (e) {
                console.warn('fetch bus slots failed', e);
                setBusSlotsMap({});
            }
        })();
        return () => { mounted = false; };
    }, [id]);

    // use remoteBus when available, fallback to sample bus
    const bus = remoteBus ?? busDetails;

    // choose target date: prefer query param 'date' or 'departure', otherwise use today
    const dateParam = (searchParams?.get('date') || searchParams?.get('departure')) ?? null;
    const todayStr = new Date().toISOString().split('T')[0];
    const targetDateStr = dateParam ?? todayStr;

    const getDateFromRaw = (raw: any) => {
        if (!raw) return null;
        // mongo export shapes
        if (raw?.$date?.$numberLong) return new Date(Number(raw.$date.$numberLong));
        if (raw?.$date) return new Date(raw.$date);
        if (raw?.$numberLong) return new Date(Number(raw.$numberLong));
        if (typeof raw === 'number') return new Date(raw);
        try { return new Date(raw); } catch { return null; }
    };
    const departureDatesArr: (Date | null)[] = (remoteBus?.raw?.departureDates || remoteBus?.departureDates || []).map(getDateFromRaw);
    const arrivalDatesArr: (Date | null)[] = (remoteBus?.raw?.arrivalDates || remoteBus?.arrivalDates || []).map(getDateFromRaw);
    // current time used for "past" checks

    const now = new Date();
    // mark which departure dates are in the past (cannot choose)
    const isDatePast = (d: Date | null) => !d ? false : (d.getTime() < now.getTime());

    // initial selected index based on query param (or today). if requested date is past, pick first non-past; fallback to 0.
    const initialIndex = (() => {
        const requestedIdx = departureDatesArr.findIndex(d => d && d.toISOString().split('T')[0] === targetDateStr);
        if (requestedIdx !== -1 && !isDatePast(departureDatesArr[requestedIdx])) return requestedIdx;
        const firstAvailable = departureDatesArr.findIndex(d => d && !isDatePast(d));
        return firstAvailable === -1 ? (requestedIdx === -1 ? 0 : requestedIdx) : firstAvailable;
    })();
    const [selectedIndex, setSelectedIndex] = useState<number>(initialIndex);

    // keep selectedIndex in sync if remoteBus / query date changes (ensure not pointing to past)
    useEffect(() => {
        const reqIdx = departureDatesArr.findIndex(d => d && d.toISOString().split('T')[0] === targetDateStr);
        const resolved = (reqIdx !== -1 && !isDatePast(departureDatesArr[reqIdx])) ? reqIdx : departureDatesArr.findIndex(d => d && !isDatePast(d));
        setSelectedIndex(resolved === -1 ? (reqIdx === -1 ? 0 : reqIdx) : resolved);
    }, [targetDateStr, remoteBus?.raw?.departureDates?.length]);

    // Thêm useEffect để clear selected seats khi chọn ngày khác
    useEffect(() => {
        setSelectedSeats([]);
        setSeatSaved(false);
        setSeatEditMode(false);
        setActiveReplaceIndex(null);
        setPrevSelectedSeats([]);
    }, [selectedIndex]);

    // format using VN timezone to avoid local offset issues
    const dtDate = new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric' });
    const dtTime = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit' });

    const fmtDate = (d: Date | null) => d ? dtDate.format(d) : (bus.date ?? '');
    const fmtTime = (d: Date | null) => d ? dtTime.format(d) : '';

    const displayDepartureDate = departureDatesArr[selectedIndex] ? fmtDate(departureDatesArr[selectedIndex]) : (bus.date ?? '');
    const displayDepartureTime = departureDatesArr[selectedIndex] ? fmtTime(departureDatesArr[selectedIndex]) : (bus.departure?.time ?? '');
    const displayArrivalDate = arrivalDatesArr[selectedIndex] ? fmtDate(arrivalDatesArr[selectedIndex]) : '';
    const displayArrivalTime = arrivalDatesArr[selectedIndex] ? fmtTime(arrivalDatesArr[selectedIndex]) : (bus.arrival?.time ?? '');

    const selectedDepartureDateObj = departureDatesArr[selectedIndex] ?? null;
    const isDeparturePast = !!selectedDepartureDateObj && (selectedDepartureDateObj.getTime() < now.getTime());

    // helper list for rendering date buttons
    // const dateOptions = departureDatesArr.map((d, i) => ({
    //     idx: i,
    //     date: d,
    //     labelDate: fmtDate(d),
    //     labelTime: fmtTime(d),
    //     isPast: isDatePast(d)
    // }));
    const dateOptions = departureDatesArr.map((d, i) => {
        const dateStr = toLocalYMD(d);
        const slot = dateStr ? busSlotsMap[dateStr] : null;
        return {
            idx: i,
            date: d,
            dateStr,
            labelDate: fmtDate(d),
            labelTime: fmtTime(d),
            isPast: isDatePast(d),
            seatsAvailable: slot?.seatsAvailable ?? (bus.availableSeats ?? undefined)
        };
    });
    // keep derived seat layout in sync when selectedIndex or busSlotsMap changes
    useEffect(() => {
        const sel = departureDatesArr[selectedIndex] ?? null;
        const dateStr = toLocalYMD(sel);
        if (dateStr && busSlotsMap[dateStr]) {
            setDerivedSeatLayout(buildLayoutFromSlot(busSlotsMap[dateStr].seatmapFill || []));
        } else if (remoteBus && Array.isArray(remoteBus.seatLayout) && remoteBus.seatLayout.length) {
            setDerivedSeatLayout(remoteBus.seatLayout);
        } else {
            setDerivedSeatLayout([]);
        }
    }, [selectedIndex, busSlotsMap, remoteBus]);
    // log for debugging
    // debug: check keys and mapped date strings (remove after verification)
    useEffect(() => {
        console.log('[BusDetail] busSlotsMap keys:', Object.keys(busSlotsMap || {}));
        console.log('[BusDetail] dateOptions keys:', dateOptions.map(o => o.dateStr));
    }, [busSlotsMap, dateOptions.length]);
    useEffect(() => {
        console.log('[BusDetail] selected date index:', selectedIndex, 'departure:', selectedDepartureDateObj, 'isPast:', isDeparturePast);
    }, [selectedIndex, selectedDepartureDateObj, isDeparturePast]);
    // resolved seat layout: prefer mapped remoteBus.seatLayout else fallback
    // const resolvedSeatLayout: any[] = (remoteBus && Array.isArray(remoteBus.seatLayout) && remoteBus.seatLayout.length)
    //     ? remoteBus.seatLayout
    //     : sampleSeatLayout;
    // resolved seat layout: prefer derivedSeatLayout (per-date) else mapped remoteBus.seatLayout else fallback sample
    const resolvedSeatLayout: any[] = (derivedSeatLayout && derivedSeatLayout.length)
        ? derivedSeatLayout
        : (remoteBus && Array.isArray(remoteBus.seatLayout) && remoteBus.seatLayout.length ? remoteBus.seatLayout : sampleSeatLayout);
    // ...existing code...
    // flatten/group by floor for UI (upper / lower)
    const upperSeats = resolvedSeatLayout.map((row: any[]) => row.filter(s => s.floor === 'upper')).flat();
    const lowerSeats = resolvedSeatLayout.map((row: any[]) => row.filter(s => s.floor === 'lower')).flat();
    // ensure pickup/dropoff lists exist — fallback to routeFrom/routeTo name when missing
    const pickupList = (bus?.pickup && bus.pickup.length)
        ? bus.pickup
        : [{ location: bus?.routeFrom?.name ?? '', time: bus?.departure?.time ?? '', address: bus?.routeFrom?.city ?? '' }];

    const dropoffList = (bus?.dropoff && bus.dropoff.length)
        ? bus.dropoff
        : [{ location: bus?.routeTo?.name ?? '', time: bus?.arrival?.time ?? '', address: bus?.routeTo?.city ?? '' }];

    // Số lượng khách từng loại
    const [participants, setParticipants] = useState({
        adults: 1,
        children: 0,
        infants: 0,
    });
    // initialize selected pickup/dropoff from resolved lists
    const [selectedPickup, setSelectedPickup] = useState<string>(() => pickupList?.[0]?.location ?? '');
    const [selectedDropoff, setSelectedDropoff] = useState<string>(() => dropoffList?.[0]?.location ?? '');
    // const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
    // support selecting multiple seats (must match total participants)
    // support selecting multiple seats (must match total participants)
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    // saved lock: when true seats are "saved" and cannot be changed until user enters edit mode
    const [seatSaved, setSeatSaved] = useState<boolean>(false);
    // seat edit flow
    const [seatEditMode, setSeatEditMode] = useState<boolean>(false);
    const [prevSelectedSeats, setPrevSelectedSeats] = useState<string[]>([]);
    // index of selectedSeats that user wants to replace (click a selected seat to mark it for replacement)
    const [activeReplaceIndex, setActiveReplaceIndex] = useState<number | null>(null);
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

    // returns full class for a seat button, highlight selected seats and active replace target
    const getSeatClass = (seat: any) => {
        const base = 'aspect-square border-2 rounded text-xs font-medium';
        const selIdx = selectedSeats.indexOf(seat.id);
        if (selIdx !== -1) {
            // active replacement target gets extra ring
            return `${base} bg-primary border-primary text-primary-foreground ${activeReplaceIndex === selIdx ? 'ring-2 ring-[hsl(var(--primary))]' : ''}`;
        }
        switch (seat.status) {
            case 'available': return `${base} bg-green-100 border-green-300 hover:bg-green-200`;
            case 'selected': return `${base} bg-primary border-primary text-primary-foreground`;
            case 'occupied':
            case 'booked': return `${base} bg-gray-300 border-gray-400 cursor-not-allowed`;
            default: return base;
        }
    };

    const handleSeatSelect = (seatId: string, status: string) => {
        if (status !== 'available') return;

        const idx = selectedSeats.indexOf(seatId);
        const isOverSelected = selectedSeats.length > totalParticipants;

        // If seat is already selected
        if (idx !== -1) {
            // If we are over-selected (after reducing participants) allow direct removal
            if (isOverSelected) {
                setSelectedSeats(prev => prev.filter(s => s !== seatId));
                // clear any replace marker if it pointed to removed index
                setActiveReplaceIndex(null);
                return;
            }

            // If seatSaved and not in edit mode, do nothing (locked)
            if (seatSaved && !seatEditMode) {
                // allow user to mark this seat to be replaced even if saved? keep locked until edit
                return;
            }

            // If not full yet, toggling should remove the seat
            if (selectedSeats.length < totalParticipants) {
                setSelectedSeats(prev => prev.filter(s => s !== seatId));
                setActiveReplaceIndex(null);
                return;
            }

            // If full and editable (either not saved yet or in edit mode), toggle replace target
            if (!seatSaved || seatEditMode) {
                setActiveReplaceIndex(prev => prev === idx ? null : idx);
            }
            return;
        }

        // clicked an unselected seat
        // if selection is locked (saved and not in edit mode) ignore
        if (seatSaved && !seatEditMode) return;

        // if currently have an active replace target -> replace that index
        if (activeReplaceIndex !== null) {
            setSelectedSeats(prev => {
                const copy = [...prev];
                copy[activeReplaceIndex] = seatId;
                return copy;
            });
            setActiveReplaceIndex(null);
            return;
        }

        // normal add when not full
        if (selectedSeats.length < totalParticipants) {
            setSelectedSeats(prev => [...prev, seatId]);
            return;
        }

        // otherwise (full, no replace target) do nothing — user should click a selected seat first to mark replace
    };

    // Hàm cập nhật số lượng khách với ràng buộc seats (adults + children)
    const updateParticipantCount = (type: keyof typeof participants, increment: boolean) => {
        const avail = getCurrentAvailable();
        setParticipants(prev => {
            const next = { ...prev };
            if (increment) {
                if (type === 'infants') {
                    // infants must be <= adults
                    if (prev.infants >= prev.adults) return prev;
                    next.infants = prev.infants + 1;
                    return next;
                }
                // for adults/children check seat-consuming total (infants don't consume seats)
                const seatTotal = prev.adults + prev.children;
                if (!isFinite(avail) || seatTotal < avail) {
                    next[type] = Math.max(type === 'adults' ? 1 : 0, prev[type] + 1);
                    return next;
                }
                return prev; // cannot increase beyond available seats
            } else {
                // decrement
                if (type === 'adults') {
                    const newAdults = Math.max(1, prev.adults - 1);
                    next.adults = newAdults;
                    if (next.infants > newAdults) next.infants = newAdults;
                } else if (type === 'children') {
                    next.children = Math.max(0, prev.children - 1);
                } else if (type === 'infants') {
                    next.infants = Math.max(0, prev.infants - 1);
                }
                return next;
            }
        });
    };

    // Tính tổng tiền
    const calculateTotal = () => {
        const adultUnit = bus.adultPrice ?? bus.price ?? 0;
        const childUnit = (typeof bus.childPrice === 'number' && bus.childPrice > 0) ? bus.childPrice : Math.round(adultUnit * 0.75);
        // infants are free and do not add to price
        const adultTotal = participants.adults * adultUnit;
        const childTotal = participants.children * childUnit;
        return adultTotal + childTotal;
    };

    // totalParticipants counts only those who need a seat: adults  children
    const totalParticipants = participants.adults + participants.children;
    useEffect(() => {
        if (!remoteBus) return;
        const p = remoteBus.pickup?.[0]?.location ?? remoteBus.routeFrom?.name ?? '';
        const d = remoteBus.dropoff?.[0]?.location ?? remoteBus.routeTo?.name ?? '';
        if (p) setSelectedPickup(p);
        if (d) setSelectedDropoff(d);
    }, [remoteBus]);
    const getCurrentAvailable = () => {
        const sel = dateOptions[selectedIndex];
        if (sel && typeof sel.seatsAvailable === 'number') return Number(sel.seatsAvailable);
        if (typeof bus.availableSeats === 'number') return Number(bus.availableSeats);
        return Infinity;
    };

    // clamp participants (adults+children) when selected date changes
    useEffect(() => {
        const avail = getCurrentAvailable();
        if (!isFinite(avail)) return;
        setParticipants(prev => {
            const adults = prev.adults;
            const children = prev.children;
            // infants do not consume seats but must be <= adults
            const seatCount = adults + children;
            if (seatCount <= avail && prev.infants <= adults) return prev;
            // reduce children first then adults, keep at least 1 adult
            let remain = Math.max(0, avail);
            const newAdults = Math.max(1, Math.min(adults, remain));
            remain -= newAdults;
            const newChildren = Math.max(0, Math.min(children, remain));
            const newInfants = Math.min(prev.infants, newAdults);
            return { adults: newAdults, children: newChildren, infants: newInfants };
        });
    }, [selectedIndex, busSlotsMap, remoteBus]);

    // Thêm function kiểm tra đăng nhập
    const isLoggedIn = () => {
        return !!localStorage.getItem('accessToken');
    };

    return (
        <>
            {/* Breadcrumb */}
            <div className="border-b">
                <div className="container py-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Link prefetch={false} href="/" className="hover:text-primary">Trang chủ</Link>
                        <span>/</span>
                        <Link prefetch={false} href="/xe-du-lich" className="hover:text-primary">Xe du lịch</Link>
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
                            <Link prefetch={false} href="/xe-du-lich">
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
                                            <div className="text-xl">{bus.company}</div>
                                            <div className="text-sm text-[hsl(var(--muted-foreground))] font-normal">
                                                {bus.busNumber} • {bus.type}
                                            </div>
                                        </div>
                                    </CardTitle>
                                    <div className="text-right">
                                        {bus.discount && (
                                            <Badge variant="destructive" className="mb-2">-{bus.discount}%</Badge>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                            <span className="font-medium">{bus.rating}</span>
                                            <span className="text-sm text-[hsl(var(--muted-foreground))]">({bus.reviews})</span>
                                        </div>
                                    </div>
                                </div>

                            </CardHeader>


                            <CardContent className="space-y-6">
                                {/* Route */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <div className="text-2xl font-bold">{bus.departure.time}</div>
                                        <div className="text-lg font-medium">{bus.departure.location}</div>
                                        <div className="text-sm text-[hsl(var(--muted-foreground))]">{bus.departure.address}</div>
                                        <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{bus.date}</div>
                                    </div>

                                    <div className="flex flex-col items-center justify-center">
                                        <div className="text-sm text-[hsl(var(--muted-foreground))] mb-2">{bus.duration}</div>
                                        <div className="flex items-center w-full">
                                            <div className="flex-1 h-px bg-[hsl(var(--muted))]"></div>
                                            <ArrowRight className="h-5 w-5 mx-2 text-[hsl(var(--muted-foreground))]" />
                                            <div className="flex-1 h-px bg-[hsl(var(--muted))]"></div>
                                        </div>
                                        <div className="text-xs text-[hsl(var(--muted-foreground))] mt-2">{bus.distance}</div>
                                    </div>

                                    <div>
                                        <div className="text-2xl font-bold">{bus.arrival.time}</div>
                                        <div className="text-lg font-medium">{bus.arrival.location}</div>
                                        <div className="text-sm text-[hsl(var(--muted-foreground))]">{bus.arrival.address}</div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Amenities and Info */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <h4 className="font-medium mb-2">Tiện ích</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {bus.amenities.map((amenity:any, index:any) => (
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
                                            <div>Tổng ghế: {bus.seats}</div>
                                            {/* <div>Còn trống: {bus.availableSeats} ghế</div> */}
                                            <div>Loại xe: {bus.type}</div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-medium mb-2">Chính sách</h4>
                                        <div className="space-y-1 text-sm text-[hsl(var(--muted-foreground))]">
                                            {/* <div>{bus.cancellable ? '✓ Có hoàn hủy' : '✗ Không hoàn hủy'}</div> */}
                                            <div> ✓ Có hoàn hủy</div>
                                            <div>✓ Hành lý 20kg</div>
                                            <div>✓ WiFi miễn phí</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Date selector: show available departureDates for user to pick */}
                        <div className="px-6 pb-4"

                            style={{ width: '55vw', overflow: 'auto' }}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-lg font-bold">Chọn ngày khởi hành</div>
                            </div>
                            <div className="flex space-x-2 overflow-x-auto pb-2"
                            >
                                {dateOptions.length ? dateOptions.map(opt => (
                                    <button
                                        key={opt.idx}
                                        onClick={() => { if (!opt.isPast) setSelectedIndex(opt.idx); }}
                                        disabled={opt.isPast}
                                        className={`min-w-[96px] flex-shrink-0 px-3 py-2 rounded-lg transition-all
                    ${selectedIndex === opt.idx
                                                ? 'border border-[hsl(var(--primary))] bg-primary/10 text-[hsl(var(--primary))]'
                                                : opt.isPast
                                                    ? 'border border-gray-200 bg-transparent text-[hsl(var(--muted-foreground))] opacity-50 cursor-not-allowed'
                                                    : 'border border-gray-300 hover:bg-[hsl(var(--primary))/0.05] hover:border-[hsl(var(--primary))]'}
                `}
                                    >
                                        <div className="text-sm font-medium">{opt.labelDate}</div>
                                        {/* <div className="text-xs text-[hsl(var(--muted-foreground))]">{opt.labelTime}</div> */}
                                        <div className="text-xs text-[hsl(var(--muted-foreground))]">{opt.labelTime}</div>
                                        {opt.isPast ? (
                                            <div className="text-xs text-red-500 mt-1">Đã khởi hành</div>
                                        ) : typeof opt.seatsAvailable === 'number' && (
                                            <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Còn {opt.seatsAvailable} chỗ</div>
                                        )}
                                    </button>
                                )) : (
                                    <div className="text-sm text-[hsl(var(--muted-foreground))]">Không có lịch khởi hành</div>
                                )}

                            </div>
                        </div>
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

                                            {pickupList.map((point:any, index:any) => (
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
                                            ))
                                            }
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-base font-medium mb-3 block">Điểm trả</Label>
                                        <div className="space-y-3">
                                            {dropoffList.map((point:any, index:any) => (
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
                                                {upperSeats.map((seat: any) => (
                                                    <button
                                                        key={seat.id}
                                                        className={getSeatClass(seat)}
                                                        onClick={() => handleSeatSelect(seat.id, seat.status)}
                                                        disabled={seat.status === 'occupied' || seat.status === 'booked'}
                                                        aria-pressed={selectedSeats.includes(seat.id)}
                                                    >
                                                        {seat.id}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-sm font-medium mb-2">Tầng dưới</div>
                                            <div className="grid grid-cols-4 gap-2">
                                                {lowerSeats.map((seat: any) => (
                                                    <button
                                                        key={seat.id}
                                                        className={getSeatClass(seat)}
                                                        onClick={() => handleSeatSelect(seat.id, seat.status)}
                                                        disabled={seat.status === 'occupied' || seat.status === 'booked'}
                                                        aria-pressed={selectedSeats.includes(seat.id)}
                                                    >
                                                        {seat.id}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {selectedSeats.length > 0 && (
                                        <div className="mt-4 p-3 bg-primary/5 rounded-lg text-center">
                                            <div className="font-medium">Ghế đã chọn: {selectedSeats.join(', ')}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {selectedSeats.map(id => (resolvedSeatLayout.flat().find((s: any) => s.id === id)?.floor ?? '')).join(', ')}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Passenger Information */}
                        {/* <Card>
                            <CardHeader>
                                <CardTitle>Thông tin liên hệ</CardTitle>
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
                        </Card> */}

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

                                {/* Date list (show date, time, seats available) */}
                                {/* <div>
                                    <Label className="text-base font-medium mb-2 block">Chọn ngày khởi hành</Label>
                                    <div className="space-y-2">
                                        {dateOptions.map(opt => (
                                            <button
                                                key={opt.idx}
                                                onClick={() => { if (!opt.isPast) setSelectedIndex(opt.idx); }}
                                                disabled={opt.isPast}
                                                className={`w-full text-left p-3 rounded-lg transition-colors ${selectedIndex === opt.idx ? 'border border-[hsl(var(--primary))] bg-primary/10 text-[hsl(var(--primary))]' : 'border border-gray-200 hover:bg-gray-50'}`}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <div className="font-medium">{opt.labelDate}</div>
                                                        <div className="text-sm text-[hsl(var(--muted-foreground))]">{opt.labelTime}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm">Còn {opt.seatsAvailable ?? '—'} chỗ</div>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <Separator /> */}

                                {/* Số lượng khách */}
                                <div>
                                    <Label className="text-base font-medium mb-3 block">Số lượng khách</Label>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium">Người lớn</div>
                                                <div className="text-sm text-muted-foreground">≥ 18 tuổi</div>
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
                                                    // disable if adults+children reached available seats
                                                    disabled={(participants.adults + participants.children) >= getCurrentAvailable()}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium">Trẻ em</div>
                                                <div className="text-sm text-muted-foreground">&gt; 4 tuổi</div>
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
                                                    disabled={(participants.adults + participants.children) >= getCurrentAvailable()}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium">Trẻ con</div>
                                                <div className="text-sm text-muted-foreground">&lt; 4 tuổi</div>
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
                                                    // infants limited by adults (one infant per adult)
                                                    disabled={participants.infants >= participants.adults}
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
                                        <span className="text-sm text-[hsl(var(--muted-foreground))]">{bus.busNumber}</span>
                                    </div>
                                    <div className="text-sm text-[hsl(var(--muted-foreground))] space-y-1">
                                        <div>{bus.route}</div>
                                        <div>{displayDepartureDate} - {displayDepartureTime} • {displayArrivalDate} - {displayArrivalTime}</div>
                                        <div>{bus.type}</div>
                                    </div>
                                    {/* Warn if departure already passed */}
                                    {isDeparturePast && (
                                        <div className="mt-3 flex items-start gap-2 rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
                                            <AlertCircle className="h-4 w-4" />
                                            <div>
                                                Chú ý: thời gian khởi hành ({displayDepartureDate} {displayDepartureTime}) đã qua. Vui lòng chọn chuyến khác hoặc ngày khác.
                                            </div>
                                        </div>
                                    )}
                                    {/* Seat/participant mismatch warning */}
                                    {selectedSeats.length !== totalParticipants && (
                                        <div className="mt-3 flex items-start gap-2 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
                                            <AlertCircle className="h-4 w-4" />
                                            <div>
                                                Số ghế đã chọn ({selectedSeats.length}) không khớp số hành khách ({totalParticipants}). Vui lòng chọn đúng số ghế.
                                            </div>
                                        </div>
                                    )}
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
                                    <div className="flex justify-between">
                                        <span>Ghế đã chọn:</span>
                                        <span>{selectedSeats.length ? selectedSeats.join(', ') : 'Chưa chọn'}</span>
                                    </div>
                                    <div className="flex flex-col gap-2 mt-2">
                                        {/* Over-selected notice */}
                                        {selectedSeats.length > totalParticipants && (
                                            <div className="text-sm text-red-700">
                                                Số ghế hiện lớn hơn số khách ({selectedSeats.length} &gt; {totalParticipants}). Vui lòng bấm vào ghế muốn bỏ.
                                            </div>
                                        )}

                                        {/* Active replace hint */}
                                        {activeReplaceIndex !== null && selectedSeats[activeReplaceIndex] && (
                                            <div className="text-sm text-[hsl(var(--muted-foreground))]">
                                                Đang đổi ghế: <strong>{selectedSeats[activeReplaceIndex]}</strong>. Bấm ghế mới để thay thế.
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2">
                                            {/* When not yet saved: allow saving (only enable when count matches) */}
                                            {!seatSaved && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        // only allow save if counts match
                                                        if (selectedSeats.length === totalParticipants) {
                                                            setSeatSaved(true);
                                                            setPrevSelectedSeats(selectedSeats);
                                                            setSeatEditMode(false);
                                                            setActiveReplaceIndex(null);
                                                        }
                                                    }}
                                                    disabled={selectedSeats.length !== totalParticipants}
                                                >
                                                    Lưu ghế
                                                </Button>
                                            )}

                                            {/* When saved: show Đổi ghế to enter edit mode */}
                                            {seatSaved && !seatEditMode && (
                                                <Button size="sm" variant="outline" onClick={() => { setPrevSelectedSeats(selectedSeats); setSeatEditMode(true); }}>
                                                    Đổi ghế
                                                </Button>
                                            )}

                                            {/* In edit mode: allow save/cancel */}
                                            {seatEditMode && (
                                                <>
                                                    <Button size="sm" onClick={() => { setSeatSaved(true); setSeatEditMode(false); setActiveReplaceIndex(null); }}>
                                                        Lưu
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={() => { setSelectedSeats(prevSelectedSeats); setSeatEditMode(false); setActiveReplaceIndex(null); }}>
                                                        Hủy
                                                    </Button>
                                                </>
                                            )}

                                            {/* Helper text */}
                                            {!seatSaved && selectedSeats.length === 0 && (
                                                <div className="text-xs text-[hsl(var(--muted-foreground))]">Chọn ghế ở trên</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <Separator />
                                {/* Pricing */}
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Người lớn ({participants.adults})</span>
                                        <span>{formatPrice(participants.adults * (bus.adultPrice ?? 0))}</span>
                                    </div>
                                    {participants.children > 0 && (
                                        <div className="flex justify-between">
                                            <span>Trẻ em ({participants.children})</span>
                                            <span>{formatPrice(participants.children * ((bus.childPrice && bus.childPrice > 0) ? bus.childPrice : Math.round((bus.adultPrice ?? 0) * 0.75)))}</span>
                                        </div>
                                    )}
                                    {participants.infants > 0 && (
                                        <div className="flex flex-col">
                                            <div className="flex justify-between">
                                                <span>Trẻ con ({participants.infants})</span>
                                                <span className="font-medium">{formatPrice(0)}</span>
                                            </div>
                                            <div className="text-xs text-[hsl(var(--muted-foreground))]">
                                                Miễn phí — mỗi trẻ đi kèm 1 người lớn và không cần ghế riêng
                                            </div>
                                        </div>
                                    )}
                                    {bus.originalPrice && (
                                        <div className="flex justify-between text-sm text-muted-foreground">
                                            <span>Giá gốc</span>
                                            <span className="line-through">{formatPrice(bus.originalPrice * totalParticipants)}</span>
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
                                    <Button className="w-full"
                                        size="lg"
                                        disabled={isDeparturePast || (selectedSeats.length !== totalParticipants) || totalParticipants === 0 || seatEditMode}
                                        onClick={() => {
                                            // Kiểm tra đăng nhập trước
                                            if (!isLoggedIn()) {
                                                toast.info('Bạn chưa đăng nhập. Đang chuyển sang trang đăng nhập...');
                                                // Thêm delay 2.5 giây trước khi chuyển hướng
                                                setTimeout(() => {
                                                    router.push(`/dang-nhap?redirect=${encodeURIComponent(window.location.pathname)}`);
                                                }, 2500); // 2.5 giây
                                                return;
                                            }

                                            
                                            const adultUnitForCheckout = bus.adultPrice ?? 0;
                                            const childUnitForCheckout = (typeof bus.childPrice === 'number' && bus.childPrice > 0) ? bus.childPrice : Math.round(adultUnitForCheckout * 0.75);
                                            const basePrice = (participants.adults * adultUnitForCheckout) + (participants.children * childUnitForCheckout);
                                            const taxes = Math.round(basePrice * 0.08); // demo: 8% thuế
                                            const addOns = 0; // xe chưa có dịch vụ thêm
                                            const discount = bus.originalPrice ? basePrice - calculateTotal() : 0;
                                            const total = basePrice + taxes + addOns - discount;
                                            // normalized date  ISO timestamp for checkout
                                            // const dateParamForCheckout = (departureDatesArr[selectedIndex] ? departureDatesArr[selectedIndex].toISOString().split('T')[0] : (bus.date ?? ''));
                                            // const departureDateIso = departureDatesArr[selectedIndex] ? departureDatesArr[selectedIndex].toISOString() : '';
                                            const dateParamForCheckout = toLocalYMD(departureDatesArr[selectedIndex]) || (bus.date ?? '');
                                            // Fix: Use local YYYY-MM-DD for departureDateIso to match UI date
                                            const departureDateIso = dateParamForCheckout;  // YYYY-MM-DD local
                                            // passengerInfo JSON (encode)
                                            // prepare passenger payloads (let URLSearchParams handle encoding)
                                            const leadPassengerInfo = {
                                                name: passengerInfo.name,
                                                phone: passengerInfo.phone,
                                                email: passengerInfo.email,
                                                idNumber: passengerInfo.idNumber,
                                            };
                                            // no per-passenger list implemented yet — gửi mảng rỗng
                                            // TODO: nếu cần gửi danh sách hành khách, tạo state `passengers` và map vào đây
                                            const passengersJson = JSON.stringify([]);
                                            const leadJson = JSON.stringify(leadPassengerInfo);

                                            // if user provided shuttle pickup in form, prefer it for selectedPickup sent to checkout


                                            const params = new URLSearchParams({
                                                type: 'bus',
                                                busId: String(bus.id ?? ''),
                                                busNumber: String(bus.busNumber ?? ''),
                                                company: String(bus.company ?? ''),
                                                route: bus.route,
                                                date: dateParamForCheckout,
                                                departureDateIso: departureDateIso,  // Now YYYY-MM-DD
                                                selectedIndex: String(selectedIndex),
                                                time: `${displayDepartureTime} - ${displayArrivalTime}`,
                                                seats: selectedSeats.join(','),
                                                // include selectedPickup so ThanhToan receives it
                                                selectedPickup: selectedPickup,
                                                selectedDropoff: selectedDropoff,
                                                passengerInfo: leadJson,
                                                passengers: passengersJson,
                                                basePrice: basePrice.toString(),
                                                taxes: taxes.toString(),
                                                addOns: addOns.toString(),
                                                discount: discount.toString(),
                                                total: total.toString(),
                                                // send explicit per‑pax units to avoid inference errors in ThanhToan
                                                unitAdult: String(adultUnitForCheckout),
                                                unitChild: String(childUnitForCheckout),
                                                unitInfant: String(0),
                                                adults: participants.adults.toString(),
                                                children: participants.children.toString(),
                                                infants: participants.infants.toString(),
                                                currency: 'VND'
                                            });
                                            router.push(`/thanh-toan?${params.toString()}`);
                                        }}
                                    >
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
            </div >
        </>
    );
}
export default withSuspense(ChiTietXeDuLich);