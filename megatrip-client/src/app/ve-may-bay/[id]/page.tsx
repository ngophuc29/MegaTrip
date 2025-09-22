"use client"
import { useState, useEffect, useRef } from 'react';
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
    // seatmap UI state
    const [seatRows, setSeatRows] = useState<Array<{ row: string; seats: any[] }>>([]);
    const [selectedSeats, setSelectedSeats] = useState<any[]>([]);
    // convenience: aircraft amenities loaded from seatmap
    const [aircraftAmenities, setAircraftAmenities] = useState<any | null>(null);
    // seatmap ref + instruction banner for UX when seat-selection addon enabled
    const seatmapRef = useRef<HTMLElement | null>(null);
    const [showSeatSelectionInstruction, setShowSeatSelectionInstruction] = useState(false);

    // Số lượng khách từng loại (moved up so useEffect can reference participants safely)
    const [participants, setParticipants] = useState({
        adults: 1,
        children: 0,
        infants: 0,
    });
    const [selectedFare, setSelectedFare] = useState('basic');
    const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
    // per-addOn flag: true = mua cho tất cả hành khách, false = chỉ 1 (khi người dùng xác nhận)
    const [addOnPerPassenger, setAddOnPerPassenger] = useState<Record<string, boolean>>({});
    // prevent duplicate confirmations / re-entrant calls for same add-on
    const addOnProcessingRef = useRef<Record<string, boolean>>({});

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

    // add: validation state for lead passenger + contact
	const [passengerErrors, setPassengerErrors] = useState<Record<string, string>>({});
	const [contactErrors, setContactErrors] = useState<Record<string, string>>({});

	const validateLeadPassengerAndContact = () => {
		const pErr: Record<string, string> = {};
		const cErr: Record<string, string> = {};

		// passenger required fields (lead passenger)
		if (!passengerInfo.firstName || String(passengerInfo.firstName).trim() === '') pErr.firstName = 'Họ và tên đệm bắt buộc';
		if (!passengerInfo.lastName || String(passengerInfo.lastName).trim() === '') pErr.lastName = 'Tên bắt buộc';
		if (!passengerInfo.dateOfBirth || String(passengerInfo.dateOfBirth).trim() === '') pErr.dateOfBirth = 'Ngày sinh bắt buộc';
		if (!passengerInfo.idNumber || String(passengerInfo.idNumber).trim() === '') pErr.idNumber = 'Số giấy tờ bắt buộc';

		// contact required
		if (!contactInfo.email || String(contactInfo.email).trim() === '') cErr.email = 'Email liên hệ bắt buộc';
		if (!contactInfo.phone || String(contactInfo.phone).trim() === '') cErr.phone = 'Số điện thoại liên hệ bắt buộc';

		setPassengerErrors(pErr);
		setContactErrors(cErr);

		return Object.keys(pErr).length === 0 && Object.keys(cErr).length === 0;
	};

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

                // --- NEW: derive participants counts from offer.travelerPricings (fix missing CHILD/INFANT counts) ---
                try {
                    const tps = Array.isArray(offer?.travelerPricings) ? offer.travelerPricings : [];
                    if (tps.length > 0) {
                        const adults = tps.filter((t: any) => String(t?.travelerType ?? '').toUpperCase().startsWith('ADULT')).length;
                        const children = tps.filter((t: any) => /CHILD/i.test(String(t?.travelerType ?? ''))).length;
                        const infants = tps.filter((t: any) => /INFANT/i.test(String(t?.travelerType ?? ''))).length;
                        // only update if totals differ (avoid unnecessary re-renders)
                        const totalDerived = (adults || 0) + (children || 0) + (infants || 0);
                        const totalCurrent = participants.adults + participants.children + participants.infants;
                        if (totalDerived > 0 && totalDerived !== totalCurrent) {
                            setParticipants({
                                adults: Math.max(1, adults || 1),
                                children: children || 0,
                                infants: infants || 0,
                            });
                        }
                    }
                } catch (e) {
                    console.warn('Error deriving participants from offer', e);
                }
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
                // parse seatmap -> rows by numeric row extracted from seat.number
                const raw = stored.seatmap[id];
                const decks = raw?.decks ?? [];
                const allSeats: any[] = [];
                for (const d of decks) {
                    for (const s of (d.seats ?? [])) {
                        const seatNum = s.number ?? '';
                        const rowMatch = String(seatNum).match(/\d+/);
                        const row = rowMatch ? rowMatch[0] : '0';

                        // travelerPricing might be an array of objects or an object — pick the first meaningful entry
                        let travEntry: any = null;
                        if (Array.isArray(s.travelerPricing) && s.travelerPricing.length > 0) travEntry = s.travelerPricing[0];
                        else if (s.travelerPricing && typeof s.travelerPricing === 'object') travEntry = s.travelerPricing;

                        // availability string (e.g. "AVAILABLE","BLOCKED", etc.)
                        const availability = travEntry?.seatAvailabilityStatus ?? 'UNKNOWN';

                        // price can be under price.total / price.amount; sometimes string -> normalize to number
                        const priceRaw = travEntry?.price?.total ?? travEntry?.price?.amount ?? null;
                        const price = priceRaw != null ? Number(String(priceRaw).replace(/[^\d.-]/g, '')) : 0;
                        const currency = travEntry?.price?.currency ?? travEntry?.price?.currencyCode ?? 'VND';

                        // characteristics: prefer characteristicsCodes (as in set.json), fallback to characteristics
                        const characteristics = s.characteristicsCodes ?? s.characteristics ?? [];

                        allSeats.push({
                            id: seatNum,
                            number: seatNum,
                            row,
                            availability,
                            // numeric
                            price: Number.isFinite(price) ? price : 0,
                            currency: currency ?? 'VND',
                            coords: s.coordinates ?? null,
                            characteristics,
                            raw: s
                        });
                    }
                }
                // group by row (sorted)
                const rowsMap: Record<string, any[]> = {};
                allSeats.forEach(s => {
                    rowsMap[s.row] = rowsMap[s.row] ?? [];
                    rowsMap[s.row].push(s);
                });
                const rows = Object.keys(rowsMap)
                    .map(r => ({ row: r, seats: rowsMap[r].sort((a, b) => a.number.localeCompare(b.number)) }))
                    .sort((a, b) => Number(a.row) - Number(b.row));
                setSeatRows(rows);
                // load amenities
                setAircraftAmenities(raw?.aircraftCabinAmenities ?? null);
                // auto-assign free seats if available and not yet selected

                // Auto-assign up to totalParticipants free seats (AVAILABLE, price === 0, and NOT marked CH)
                const totalNeeded = participants.adults + participants.children + participants.infants;
                const freeSeats = allSeats.filter(s => {
                    const chars = (s.characteristics ?? []).map((c: string) => String(c).toUpperCase());
                    const hasCH = chars.includes('CH');
                    const priceIsZero = Number(s.price || 0) === 0;
                    return s.availability === 'AVAILABLE' && priceIsZero && !hasCH;
                });
                // Only auto-assign when user hasn't selected any seats yet
                if (freeSeats.length > 0 && totalNeeded > 0 && selectedSeats.length === 0) {
                    setSelectedSeats(freeSeats.slice(0, Math.min(totalNeeded, freeSeats.length)));
                }
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
                            desc = [qtyNote, desc].filter(Boolean).join('\n');

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
    }, [id, participants.adults, participants.children, participants.infants]);

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

    const totalParticipants = participants.adults + participants.children + participants.infants;
    const addOnClickRef = useRef(false); // Theo dõi trạng thái click

    const toggleAddOn = (addOnId: string) => {
        if (addOnClickRef.current) return; // prevent rapid double-invokes
        addOnClickRef.current = true;

        try {
            const currentlySelected = selectedAddOns.includes(addOnId);

            // If currently selected -> remove immediately
            if (currentlySelected) {
                setSelectedAddOns(prev => prev.filter(id => id !== addOnId));
                setAddOnPerPassenger(prevFlags => {
                    const copy = { ...prevFlags };
                    delete copy[addOnId];
                    return copy;
                });
                if (addOnId === 'seat_selection') setShowSeatSelectionInstruction(false);
                return;
            }

            // Not selected -> determine per-passenger behavior (call confirm once if needed)
            const total = participants.adults + participants.children + participants.infants;
            let perPassenger = false;

            if (addOnId === 'seat_selection') {
                // seat selection: show instruction and scroll
                setShowSeatSelectionInstruction(true);
                if (seatmapRef.current && typeof seatmapRef.current.scrollIntoView === 'function') {
                    try { seatmapRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch { /* ignore */ }
                }
            } else if (addOnId === 'travel_insurance') {
                // always per passenger
                perPassenger = true;
            } else if (total > 1) {
                // ask user once (synchronous) and use answer
                const ok = window.confirm(`Bạn có ${total} hành khách. Bạn muốn mua dịch vụ này cho tất cả ${total} hành khách? (OK = tất cả, Cancel = chỉ 1)`);
                perPassenger = !!ok;
            }

            // apply decision to state (single update per state)
            setAddOnPerPassenger(prevFlags => ({ ...prevFlags, [addOnId]: perPassenger }));
            setSelectedAddOns(prev => [...prev, addOnId]);
        } finally {
            // small timeout to allow event loop to finish before releasing lock
            setTimeout(() => { addOnClickRef.current = false; }, 0);
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
        // Prefer derived per-unit prices when available (more robust if traveler breakdown exists),
        // otherwise fallback to fareRules-based approximations.
        const adultUnit = (derived.adultsUnit && derived.adultsUnit > 0)
            ? derived.adultsUnit
            : flightDetails.fareRules[selectedFare as keyof typeof flightDetails.fareRules].price;
        const childUnit = (derived.childrenUnit && derived.childrenUnit > 0)
            ? derived.childrenUnit
            : Math.round(flightDetails.fareRules[selectedFare as keyof typeof flightDetails.fareRules].price * 0.75);
        const infantUnit = (derived.infantsUnit && derived.infantsUnit > 0)
            ? derived.infantsUnit
            : Math.round(flightDetails.fareRules[selectedFare as keyof typeof flightDetails.fareRules].price * 0.2);

        const adultTotal = adultUnit * participants.adults;
        const childTotal = childUnit * participants.children;
        const infantTotal = infantUnit * participants.infants;

        const addOnTotal = selectedAddOns.reduce((total, addOnId) => {
            const addOn = dynamicAddOnServices.find(service => service.id === addOnId);
            if (!addOn) return total;
            const per = addOnPerPassenger[addOnId] ?? false;
            const qty = per ? (participants.adults + participants.children + participants.infants) : 1;
            return total + ((addOn?.price || 0) * qty);
        }, 0);

        const seatSelectedTotal = selectedSeats.reduce((sum, s) => sum + (s.price || 0), 0);
        return adultTotal + childTotal + infantTotal + addOnTotal + seatSelectedTotal;
    };

    // compute only extras (add-ons + seat fees) to be added on top of derived.offerTotal when present
    const computeExtras = () => {
        const addOnTotal = selectedAddOns.reduce((total, addOnId) => {
            const addOn = dynamicAddOnServices.find(service => service.id === addOnId);
            if (!addOn) return total;
            const per = addOnPerPassenger[addOnId] ?? false;
            const qty = per ? (participants.adults + participants.children + participants.infants) : 1;
            return total + ((addOn?.price || 0) * qty);
        }, 0);
        const seatSelectedTotal = selectedSeats.reduce((sum, s) => sum + (s.price || 0), 0);
        return addOnTotal + seatSelectedTotal;
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

    // --- CHANGED: toggleSeat with confirm-on-change and confirm-on-paid logic ---
    const toggleSeat = (seat: any) => {
        if (!seat || seat.availability !== 'AVAILABLE') return;

        const exists = selectedSeats.find(s => s.id === seat.id);
        if (exists) {
            // deselect
            setSelectedSeats(prev => prev.filter(s => s.id !== seat.id));
            return;
        }

        // detect paid seat: require CH AND numeric price
        const chars = (seat.characteristics ?? []).map((c: string) => String(c).toUpperCase());
        const hasCH = chars.includes('CH');
        const explicitPrice = Number(seat.price || 0) > 0;
        const isPaidSeat = hasCH && explicitPrice;
        const max = participants.adults + participants.children + participants.infants;

        // if selecting a paid seat, ask user confirm
        if (isPaidSeat) {
            const msgPrice = seat.currency && seat.currency !== 'VND' ? `${seat.price.toLocaleString()} ${seat.currency}` : formatPrice(seat.price);
            const ok = window.confirm(`Ghế ${seat.number} có phí ${msgPrice}. Bạn xác nhận chọn ghế này và chấp nhận trả phí?`);
            if (!ok) return;
        }
        // if already selected max seats, ask to replace first selected seat
        if (selectedSeats.length >= max && max > 0) {
            const toReplace = selectedSeats[0];
            const ok = window.confirm(`Bạn đã chọn đủ ${max} ghế. Thay thế ghế ${toReplace.number} bằng ghế ${seat.number}?`);
            if (!ok) return;
            setSelectedSeats(prev => [...prev.slice(1), seat]);
            return;
        }

        // normal add
        setSelectedSeats(prev => [...prev, seat]);
    };

    {/* Component Legend nhỏ gọn */ }
    function Legend({ color, label }: { color: string; label: string }) {
        return (
            <div className="flex items-center gap-1">
                <div className={`w-4 h-4 rounded ${color}`}></div>
                <span>{label}</span>
            </div>
        );
    }
    // Thêm vào trước return (...)
    const renderSeatGroup = (row: any, seatLetters: string[]) => {
        return row.seats
            .filter((s: any) => seatLetters.includes(s.number.replace(/^\d+/, '')))
            .map((s: any) => {
                const seatLetter = s.number.replace(/^\d+/, '');
                const chars = (s.characteristics || []).map((c: string) => c.toUpperCase());
                const isSelected = selectedSeats.some((ss) => ss.id === s.id);
                // detect paid seat: require CH in characteristics AND price > 0 (parsed into s.price)
                const hasCH = chars.includes('CH');
                const explicitPrice = Number(s.price || 0) > 0;
                const isPaid = hasCH && explicitPrice;
                const isFree = !isPaid && Number(s.price || 0) === 0;

                // Determine seat type
                let seatType: string | null = null;
                if (chars.includes('E')) seatType = 'exit';
                else if (chars.includes('W') || seatLetter === 'A' || seatLetter === 'K') seatType = 'window';
                else if (chars.includes('A') || ['C', 'D', 'F', 'G'].includes(seatLetter)) seatType = 'aisle';
                else seatType = 'middle';

                // Base styles
                const baseUnavailable =
                    'bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed';
                const baseSelected =
                    'bg-blue-600 text-white shadow-md scale-105 ring-2 ring-blue-600';
                const baseFree =
                    'bg-white border border-gray-300 hover:bg-gray-50 cursor-pointer';
                const basePaid =
                    'bg-yellow-50 border border-yellow-400 hover:bg-yellow-100 cursor-pointer ring-1 ring-yellow-200';

                let btnClass =
                    s.availability !== 'AVAILABLE'
                        ? baseUnavailable
                        : isSelected
                            ? baseSelected
                            : isPaid
                                ? basePaid
                                : baseFree;

                const title = `${s.number} • ${seatType?.toUpperCase()} • ${s.availability
                    }${s.price
                        ? ` • ${s.currency} ${s.price.toLocaleString()}`
                        : isFree
                            ? ' • Miễn phí'
                            : ''
                    }`;

                const seatTypeLabel: Record<string, string> = {
                    window: 'W',
                    aisle: 'A',
                    exit: 'EX',
                    middle: 'M',
                };

                return (
                    <div key={s.id} className="relative">
                        <button
                            title={title}
                            onClick={() => toggleSeat(s)}
                            className={`${btnClass} w-10 h-10 rounded-md text-xs flex flex-col items-center justify-center transition-all duration-150 relative`}
                        >
                            <span className="font-semibold">{s.number}</span>
                            {!isFree && s.price > 0 && s.availability === 'AVAILABLE' && (
                                <span className="text-[8px] text-yellow-700 mt-0.5"></span>
                            )}
                        </button>

                        {/* Price Badge */}
                        {(hasCH && explicitPrice) && s.availability === 'AVAILABLE' && (
                            <div className="absolute -top-2 -right-2 bg-yellow-100 text-[10px] px-1 rounded border border-yellow-200 whitespace-nowrap z-10">
                                {s.currency && s.currency !== 'VND'
                                    ? `${s.price.toLocaleString()} ${s.currency}`
                                    : formatPrice(s.price)}
                            </div>
                        )}

                        {/* Seat Type Badge */}
                        {seatType && s.availability === 'AVAILABLE' && (
                            <div className="absolute -bottom-3 left-0 text-[10px] text-gray-500">
                                <span className="inline-block px-1 py-0.5 bg-gray-100 rounded font-medium">
                                    {seatTypeLabel[seatType] ?? seatType}
                                </span>
                            </div>
                        )}
                    </div>
                );
            });
    };

    // ensure selectedSeats always matches participants count:
    useEffect(() => {
        const max = participants.adults + participants.children + participants.infants;
        // trim if too many selected
        if (selectedSeats.length > max) {
            setSelectedSeats(prev => prev.slice(0, max));
            return;
        }

        // if fewer than needed, try to auto-assign additional free seats
        if (selectedSeats.length < max && seatRows.length > 0) {
            const alreadyIds = new Set(selectedSeats.map(s => s.id));
            // gather all seats from seatRows
            const allSeats = seatRows.flatMap(r => r.seats || []);
            // filter free seats: AVAILABLE, price === 0, NOT CH, and not already selected
            const freeSeats = allSeats.filter(s => {
                const chars = (s.characteristics ?? []).map((c: string) => String(c).toUpperCase());
                const hasCH = chars.includes('CH');
                const priceIsZero = Number(s.price || 0) === 0;
                return s.availability === 'AVAILABLE' && priceIsZero && !hasCH && !alreadyIds.has(s.id);
            });
            if (freeSeats.length > 0) {
                const need = Math.min(max - selectedSeats.length, freeSeats.length);
                setSelectedSeats(prev => [...prev, ...freeSeats.slice(0, need)]);
            }
        }
    }, [participants.adults, participants.children, participants.infants, seatRows]);

    // --- NEW: safe number parser + derive traveler-level pricing when available ---
    const parseNumberSafe = (v: any) => {
        if (v == null) return 0;
        const n = Number(String(v).replace(/[^\d.-]/g, ''));
        return Number.isFinite(n) ? n : 0;
    };

    const travelerPricings = normalizedOffer?.travelerPricings
        ?? cachedPricing?.data?.flightOffers?.[0]?.travelerPricings
        ?? cachedPricing?.travelerPricings
        ?? [];

    // derived summary used by UI / calculateTotal
    const derived: {
        adultsCount: number;
        childrenCount: number;
        infantsCount: number;
        adultsTotal: number;
        childrenTotal: number;
        infantsTotal: number;
        adultsUnit: number;
        childrenUnit: number;
        infantsUnit: number;
        offerTotal: number;
    } = {
        adultsCount: 0,
        childrenCount: 0,
        infantsCount: 0,
        adultsTotal: 0,
        childrenTotal: 0,
        infantsTotal: 0,
        adultsUnit: 0,
        childrenUnit: 0,
        infantsUnit: 0,
        offerTotal: parseNumberSafe(normalizedOffer?.price?.total ?? cachedPricing?.price?.total ?? 0)
    };

    if (Array.isArray(travelerPricings) && travelerPricings.length > 0) {
        for (const t of travelerPricings) {
            const typ = String(t?.travelerType ?? '').toUpperCase();
            const amount = parseNumberSafe(t?.price?.total ?? t?.price?.grandTotal ?? t?.price?.amount ?? 0);
            if (typ.includes('ADULT')) {
                derived.adultsCount += 1;
                derived.adultsTotal += amount;
            } else if (typ.includes('CHILD')) {
                derived.childrenCount += 1;
                derived.childrenTotal += amount;
            } else if (typ.includes('INFANT')) {
                derived.infantsCount += 1;
                derived.infantsTotal += amount;
            } else {
                derived.adultsCount += 1;
                derived.adultsTotal += amount;
            }
        }
        derived.adultsUnit = derived.adultsCount > 0 ? derived.adultsTotal / derived.adultsCount : 0;
        derived.childrenUnit = derived.childrenCount > 0 ? derived.childrenTotal / derived.childrenCount : 0;
        derived.infantsUnit = derived.infantsCount > 0 ? derived.infantsTotal / derived.infantsCount : 0;
        if (!derived.offerTotal || derived.offerTotal === 0) {
            derived.offerTotal = derived.adultsTotal + derived.childrenTotal + derived.infantsTotal;
        }
    } else {
        // fallback: approximate per-unit from priceNumber / totalParticipants
        const pax = Math.max(1, totalParticipants);
        const avg = Math.round((derived.offerTotal || priceNumber) / pax);
        derived.adultsUnit = avg;
        derived.childrenUnit = Math.round(avg * 0.75);
        derived.infantsUnit = Math.round(avg * 0.2);
        derived.adultsCount = participants.adults;
        derived.childrenCount = participants.children;
        derived.infantsCount = participants.infants;
        derived.adultsTotal = derived.adultsUnit * derived.adultsCount;
        derived.childrenTotal = derived.childrenUnit * derived.childrenCount;
        derived.infantsTotal = derived.infantsUnit * derived.infantsCount;
    }

    // --- NEW: tổng add-ons và seat fees để hiển thị cùng pricing khi có offerTotal ---
    const addOnTotalForDisplay = selectedAddOns.reduce((total, addOnId) => {
        const addOn = dynamicAddOnServices.find(s => s.id === addOnId);
        if (!addOn) return total;
        const per = addOnPerPassenger[addOnId] ?? false;
        const qty = per ? totalParticipants : 1;
        return total + ((Number(addOn.price) || 0) * qty);
    }, 0);

    const seatSelectedTotalForDisplay = selectedSeats.reduce((t, s) => t + (Number(s.price) || 0), 0);

    const totalCombined = (derived.offerTotal && derived.offerTotal > 0)
        ? (Number(derived.offerTotal || 0) + addOnTotalForDisplay + seatSelectedTotalForDisplay)
        : calculateTotal();

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
                                        { /* prefer times from pricing itineraries if present */}
                                        <div className="text-2xl font-bold">{normalizedOffer?.itineraries?.[0]?.segments?.[0]?.departure?.at?.split('T')?.[1]?.slice(0, 5) ?? flightDetails.departure.time}</div>
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
                                        <div className="text-2xl font-bold">{normalizedOffer?.itineraries?.[0]?.segments?.[0]?.arrival?.at?.split('T')?.[1]?.slice(0, 5) ?? flightDetails.arrival.time}</div>
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
                                                -                                                Xách tay: {displayCabin}
                                                Xách tay: {displayCabin}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Luggage className="h-4 w-4" />
                                                {/*                                                Ký gửi: {flightDetails.baggage.checkin} */}
                                                -                                                Ký gửi: {displayChecked}
                                                Ký gửi: {displayChecked}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-medium mb-2">Tiện ích</h4>
                                        <div className="text-sm text-[hsl(var(--muted-foreground))]">
                                            {/* load from aircraftAmenities if present */}
                                            {aircraftAmenities?.seat && (
                                                <div>Khoảng cách ghế: {aircraftAmenities.seat.legSpace}{aircraftAmenities.seat.spaceUnit ? ` ${aircraftAmenities.seat.spaceUnit}` : ''}</div>
                                            )}
                                            {aircraftAmenities?.food && (
                                                <div>Suất ăn: {aircraftAmenities.food.isChargeable ? 'Có tính phí' : 'Miễn phí'}</div>
                                            )}
                                            {aircraftAmenities?.beverage && (
                                                <div>Đồ uống: {aircraftAmenities.beverage.isChargeable ? 'Có tính phí' : 'Miễn phí'}</div>
                                            )}
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
                                            onClick={() => toggleAddOn(service.id)}
                                        >
                                            <div className="flex items-start space-x-3">
                                                <Checkbox
                                                    checked={selectedAddOns.includes(service.id)}
                                                    onClick={(e) => e.stopPropagation()} // Giữ để ngăn lan truyền
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-medium">{service.name}</h4>
                                                        <span className="font-bold text-[hsl(var(--primary))]">
                                                            {service.currency && service.currency !== 'VND' ? `${Number(service.price).toLocaleString()} ${service.currency}` : formatPrice(Number(service.price))}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                                                        {service.description ?? (service.raw ? JSON.stringify(service.raw).slice(0, 200) : '')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                        {/* Seatmap (showable, compact) */}
                        <div ref={(el) => { seatmapRef.current = el as HTMLElement | null; }} className="shadow-lg rounded-2xl bg-white p-5">
                            {/* Header */}
                            <div className="mb-4">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    🪑 Sơ đồ chỗ ngồi
                                </h2>
                            </div>

                            {/* Info banner */}
                            {showSeatSelectionInstruction && (
                                <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm p-3 rounded-lg mb-4">
                                    Bạn đã bật "Chọn chỗ ngồi". Nhấp vào sơ đồ bên dưới để chọn tối đa {totalParticipants} ghế.
                                </div>
                            )}

                            {/* Empty state */}
                            {seatRows.length === 0 && (
                                <div className="text-center text-gray-500 text-sm py-6 border rounded-xl">
                                    Không có dữ liệu sơ đồ ghế
                                </div>
                            )}

                            {/* Cockpit */}
                            <div className="flex justify-center mb-3">
                                <div className="bg-gray-800 text-white text-xs font-semibold px-5 py-1.5 rounded-t-xl shadow-inner">
                                    ✈ Buồng lái
                                </div>
                            </div>

                            {/* Seat map */}
                            <div className="space-y-3 flex flex-col items-center">
                                {/** column layout: letters with aisles after C and F */}
                                {seatRows.map((row) => {
                                    const letters = ['A', 'B', 'C', '_aisle', 'D', 'E', 'F', '_aisle', 'G', 'H', 'K'];
                                    // map seats by letter for quick lookup
                                    const seatMap: Record<string, any> = {};
                                    row.seats.forEach((s: any) => {
                                        const letter = String(s.number || '').replace(/^\d+/, '') || '';
                                        seatMap[letter] = s;
                                    });

                                    // NEW: detect if any seat in this row will render a top price badge (CH + explicit price)
                                    const rowHasTopBadge = row.seats.some((s: any) => {
                                        const charsUp = (s.characteristics ?? []).map((c: string) => String(c).toUpperCase());
                                        const hasCH = charsUp.includes('CH');
                                        const explicitPrice = Number(s.price || 0) > 0;
                                        return hasCH && explicitPrice;
                                    });

                                    return (
                                        // NOTE: added conditional padding-top when rowHasTopBadge to avoid price badge overlap
                                        <div key={row.row} className={`grid grid-cols-[44px_repeat(11,44px)] items-center gap-2 relative ${rowHasTopBadge ? 'pt-4' : ''}`}>
                                            {/* row number column */}
                                            <div className="w-11 text-center font-bold text-sm">{row.row}</div>

                                            {/* seats + aisles columns */}
                                            {letters.map((col: string, idx) => {
                                                if (col === '_aisle') {
                                                    return (
                                                        <div key={idx} className="h-10 flex items-center justify-center">
                                                            <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center" >
                                                                <span className='text-[10px] text-gray-500 space-x-1'>Lối đi</span>
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                const s = seatMap[col];
                                                if (!s) {
                                                    // empty seat placeholder (align grid)
                                                    return <div key={idx} className="w-11 h-11" />;
                                                }

                                                const isSelected = !!selectedSeats.find(ss => ss.id === s.id);
                                                const unavailable = s.availability !== 'AVAILABLE';


                                                // detect paid seats: MUST have "CH" AND a numeric price (parsed to s.price)
                                                const charsUp = (s.characteristics ?? []).map((c: string) => String(c).toUpperCase());
                                                const hasCH = charsUp.includes('CH');
                                                const explicitPrice = Number(s.price || 0) > 0;
                                                const isPaid = hasCH && explicitPrice; // require BOTH
                                                const isFree = !isPaid && Number(s.price || 0) === 0;

                                                // determine seat type badge
                                                let seatType = 'M';
                                                if (charsUp.includes('EXIT') || charsUp.includes('EXIT_ROW')) seatType = 'EX';
                                                else if (charsUp.includes('GALLEY') || charsUp.includes('GAL')) seatType = 'GAL';
                                                else if (charsUp.includes('AISLE') || ['C', 'D', 'F', 'G'].includes(col)) seatType = 'A';
                                                else if (charsUp.includes('WINDOW') || ['A', 'K', 'F'].includes(col)) seatType = 'W';

                                                const baseUnavailable = 'bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed';
                                                const baseSelected = 'bg-[hsl(var(--primary))] text-white shadow-md';
                                                const baseFree = 'bg-white border border-gray-300 hover:bg-gray-50 cursor-pointer';
                                                const basePaid = 'bg-yellow-50 border border-yellow-400 hover:bg-yellow-100 cursor-pointer ring-1 ring-yellow-200';

                                                const base = unavailable
                                                    ? baseUnavailable
                                                    : isSelected
                                                        ? baseSelected
                                                        : isPaid
                                                            ? basePaid
                                                            : baseFree;

                                                return (
                                                    <div key={idx} className="relative flex items-center justify-center">
                                                        <button
                                                            title={`${s.number} • ${hasCH ? 'CH (có thể tính phí)' : 'Miễn phí'} • ${s.availability}${explicitPrice ? ` • ${s.currency} ${s.price.toLocaleString()}` : ''}`}
                                                            onClick={() => toggleSeat(s)}
                                                            className={`${base} w-11 h-11 rounded-md text-xs flex items-center justify-center transition`}
                                                        >
                                                            <div className="flex flex-col items-center">
                                                                <span className="font-semibold text-xs leading-none">{s.number}</span>
                                                                {/* quick cue inside seat: explicit price => currency symbol; CH present but no explicit price => "CH" */}
                                                                {explicitPrice && s.price > 0 && s.availability === 'AVAILABLE' && (
                                                                    <span className="text-[10px] text-yellow-700 mt-0.5"></span>
                                                                )}
                                                                {!explicitPrice && hasCH && s.availability === 'AVAILABLE' && (
                                                                    <span className="text-[9px] text-yellow-700 mt-0.5 font-semibold">CH</span>
                                                                )}
                                                            </div>
                                                        </button>

                                                        {/* price badge: show amount only when CH present AND explicit price exists */}
                                                        {(hasCH && explicitPrice) && s.availability === 'AVAILABLE' && (
                                                            <div className="absolute -top-2 -right-2 bg-yellow-100 text-[10px] px-1 rounded border border-yellow-200 z-20 whitespace-nowrap">
                                                                {s.currency && s.currency !== 'VND' ? `${s.price.toLocaleString()} ${s.currency}` : formatPrice(s.price)}
                                                            </div>
                                                        )}

                                                        {/* seat type tag bottom-left */}
                                                        <div className="absolute -bottom-3 left-0 text-[10px] text-gray-600">
                                                            <span className="inline-block px-1 py-0.5 bg-gray-100 rounded font-medium">{seatType}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {/* exit indicator for certain rows (if any seat has EXIT char) */}
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                                {row.seats.some((s: any) => (s.characteristics ?? []).some((c: string) => /EXIT/i.test(String(c)))) && (
                                                    <div className="text-xs text-red-600 font-semibold">🛟 Exit</div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {/* Legend */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-gray-600 mt-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-[hsl(var(--primary))] border border-[hsl(var(--primary))]"></div>
                                    <div>Đang chọn</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded border bg-white border-gray-300"></div>
                                    <div>Ghế trống (AVAILABLE)</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-yellow-50 border border-yellow-400 flex items-center justify-center text-[10px]"></div>
                                    <div>Ghế trả phí (CH hoặc có giá)</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-gray-200 border border-gray-300"></div>
                                    <div>Không khả dụng / Đã đặt</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded border bg-white flex items-center justify-center text-[10px]">W</div>
                                    <div>Cửa sổ (Window)</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded border bg-white flex items-center justify-center text-[10px]">A</div>
                                    <div>Hàng lối (Aisle)</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded border bg-white flex items-center justify-center text-[10px]">EX</div>
                                    <div>Cửa thoát hiểm</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded border bg-white flex items-center justify-center text-[10px]">GAL</div>
                                    <div>Galley</div>
                                </div>
                            </div>

                            <p className="text-xs text-gray-500 mt-2">
                                Ghế miễn phí sẽ tự gán nếu còn đủ cho {totalParticipants} khách.
                            </p>
                        </div>

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
                                                { passengerErrors.firstName && (
	<div className="text-xs text-red-600 mt-1">{passengerErrors.firstName}</div>
) }
                                            </div>
                                            <div>
                                                <Label htmlFor="lastName">Tên</Label>
                                                <Input id="lastName" value={passengerInfo.lastName} onChange={(e) => setPassengerInfo(prev => ({ ...prev, lastName: e.target.value }))} placeholder="VD: AN" />
                                                { passengerErrors.lastName && (
	<div className="text-xs text-red-600 mt-1">{passengerErrors.lastName}</div>
) }
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="dateOfBirth">Ngày sinh</Label>
                                                <Input id="dateOfBirth" type="date"
                                                    className="block h-12 bg-white shadow-md text-black w-full"
                                                    value={passengerInfo.dateOfBirth} onChange={(e) => setPassengerInfo(prev => ({ ...prev, dateOfBirth: e.target.value }))} />
                                                    { passengerErrors.dateOfBirth && (
	<div className="text-xs text-red-600 mt-1">{passengerErrors.dateOfBirth}</div>
) }
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
                                                { passengerErrors.idNumber && (
	<div className="text-xs text-red-600 mt-1">{passengerErrors.idNumber}</div>
) }
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="contact" className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="email">Email *</Label>
                                                <Input id="email" type="email" value={contactInfo.email} onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))} placeholder="email@example.com" />
                                                { contactErrors.email && (
	<div className="text-xs text-red-600 mt-1">{contactErrors.email}</div>
) }
                                            </div>
                                            <div>
                                                <Label htmlFor="phone">Số điện thoại *</Label>
                                                <Input id="phone" value={contactInfo.phone} onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))} placeholder="0912345678" />
                                                { contactErrors.phone && (
	<div className="text-xs text-red-600 mt-1">{contactErrors.phone}</div>
) }
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
                                        <span className="text-sm text-[hsl(var(--muted-foreground))]">
                                            {normalizedOffer?.itineraries?.[0]?.segments?.[0]?.carrierCode ?? flightDetails.airline}
                                            {normalizedOffer?.itineraries?.[0]?.segments?.[0]?.number ?? flightDetails.flightNumber}
                                        </span>
                                    </div>
                                    <div className="text-sm text-[hsl(var(--muted-foreground))]">
                                        {normalizedOffer?.itineraries?.[0]?.segments?.[0]?.departure?.iataCode ?? flightDetails.departure.airport} ({flightDetails.departure.city}) →
                                        {normalizedOffer?.itineraries?.[0]?.segments?.[0]?.arrival?.iataCode ?? flightDetails.arrival.airport} ({flightDetails.arrival.city})<br />
                                        {normalizedOffer?.itineraries?.[0]?.segments?.[0]?.departure?.at?.split('T')?.[0] ?? flightDetails.date} •
                                        {normalizedOffer?.itineraries?.[0]?.segments?.[0]?.departure?.at?.split('T')?.[1]?.slice(0, 5) ?? flightDetails.departure.time} -
                                        {normalizedOffer?.itineraries?.[0]?.segments?.[0]?.arrival?.at?.split('T')?.[1]?.slice(0, 5) ?? flightDetails.arrival.time}
                                    </div>
                                </div>
                                <Separator />
                                {/* Pricing Breakdown */}
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Người lớn ({participants.adults})</span>
                                        <span>
                                            {currency === 'VND'
                                                ? formatPrice(Math.round((derived.adultsUnit || (priceNumber || 0)) * participants.adults))
                                                : `${Math.round((derived.adultsUnit || (priceNumber || 0)) * participants.adults).toLocaleString()} ${currency}`}
                                        </span>
                                    </div>
                                    {participants.children > 0 && (
                                        <div className="flex justify-between">
                                            <span>Trẻ em ({participants.children})</span>
                                            <span>
                                                {currency === 'VND'
                                                    ? formatPrice(Math.round((derived.childrenUnit || Math.round((flightDetails.fareRules[selectedFare as keyof typeof flightDetails.fareRules].price * 0.75))) * participants.children))
                                                    : `${Math.round((derived.childrenUnit || Math.round((flightDetails.fareRules[selectedFare as keyof typeof flightDetails.fareRules].price * 0.75))) * participants.children).toLocaleString()} ${currency}`}
                                            </span>
                                        </div>
                                    )}
                                    {participants.infants > 0 && (
                                        <div className="flex justify-between">
                                            <span>Em bé ({participants.infants})</span>
                                            <span>
                                                {currency === 'VND'
                                                    ? formatPrice(Math.round((derived.infantsUnit || Math.round((flightDetails.fareRules[selectedFare as keyof typeof flightDetails.fareRules].price * 0.2))) * participants.infants))
                                                    : `${Math.round((derived.infantsUnit || Math.round((flightDetails.fareRules[selectedFare as keyof typeof flightDetails.fareRules].price * 0.2))) * participants.infants).toLocaleString()} ${currency}`}
                                            </span>
                                        </div>
                                    )}
                                    {selectedAddOns.length > 0 && (
                                        <div className="space-y-1">
                                            {selectedAddOns.map(addOnId => {
                                                const addOn = dynamicAddOnServices.find(service => service.id === addOnId);
                                                if (!addOn) return null;
                                                const per = addOnPerPassenger[addOnId] ?? false;
                                                const qty = per ? totalParticipants : 1;
                                                return (
                                                    <div key={addOnId} className="flex justify-between text-sm">
                                                        <span>{addOn.name} ({qty})</span>
                                                        <span>{addOn.currency && addOn.currency !== 'VND' ? `${(addOn.price * qty).toLocaleString()} ${addOn.currency}` : formatPrice(addOn.price * qty)}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                    {selectedSeats.length > 0 && (
                                        <div className="space-y-1">
                                            {selectedSeats.map(s => (
                                                <div key={s.id} className="flex justify-between text-sm">
                                                    <span>Ghế {s.number}</span>
                                                    <span>{s.currency && s.currency !== 'VND' ? `${(s.price).toLocaleString()} ${s.currency}` : formatPrice(s.price || 0)}</span>
                                                </div>
                                            ))}
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
                                        <span className="text-[hsl(var(--primary))]">
                                            {currency === 'VND'
                                                ? formatPrice(Math.round(totalCombined))
                                                : `${Math.round(totalCombined).toLocaleString()} ${currency}`}
                                        </span>
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
                                        // validate lead passenger + contact (defined above)
                                        if (!validateLeadPassengerAndContact()) {
                                            // passengerErrors / contactErrors are set and will be shown under inputs
                                            // show brief notice and stop navigation
                                            window.scrollTo({ top: 200, behavior: 'smooth' });
                                            alert('Vui lòng điền đầy đủ thông tin hành khách và liên hệ trước khi tiếp tục.');
                                            return;
                                        }

                                        // Build comprehensive booking payload to pass to payment page
                                        const paxCount = participants.adults + participants.children + participants.infants;

                                        // pricing breakdown (prefer derived if available)
                                        const pricingPerPax = {
                                            adultUnit: Math.round(derived.adultsUnit || flightDetails.fareRules[selectedFare].price),
                                            childUnit: Math.round(derived.childrenUnit || Math.round(flightDetails.fareRules[selectedFare].price * 0.75)),
                                            infantUnit: Math.round(derived.infantsUnit || Math.round(flightDetails.fareRules[selectedFare].price * 0.2)),
                                        };
                                        const paxTotals = {
                                            adultsTotal: pricingPerPax.adultUnit * participants.adults,
                                            childrenTotal: pricingPerPax.childUnit * participants.children,
                                            infantsTotal: pricingPerPax.infantUnit * participants.infants,
                                        };

                                        // add-ons with qty determined by addOnPerPassenger flags
                                        const addOnsDetailed = selectedAddOns.map(id => {
                                            const svc = dynamicAddOnServices.find(s => s.id === id) ?? { id, name: id, price: 0 };
                                            const per = addOnPerPassenger[id] ?? false;
                                            const qty = per ? paxCount : 1;
                                            return {
                                                id: svc.id,
                                                name: svc.name,
                                                unitPrice: Number(svc.price) || 0,
                                                qty,
                                                total: (Number(svc.price) || 0) * qty,
                                                perPassenger: per
                                            };
                                        });

                                        // seats selected
                                        const seatsDetailed = selectedSeats.map((s) => ({
                                            id: s.id,
                                            number: s.number,
                                            price: Number(s.price) || 0,
                                            currency: s.currency || currency || 'VND'
                                        }));

                                        // taxes / fees estimate (keep existing demo calc as fallback)
                                        const taxesEstimate = (() => {
                                            // try to derive from cachedPricing / normalizedOffer if possible
                                            const offerTotal = parseNumberSafe(normalizedOffer?.price?.total ?? cachedPricing?.price?.total ?? 0);
                                            if (offerTotal && offerTotal > 0) {
                                                // taxes = offerTotal - sum(pax base totals)
                                                const paxSum = (paxTotals.adultsTotal || 0) + (paxTotals.childrenTotal || 0) + (paxTotals.infantsTotal || 0);
                                                const t = Math.max(0, Math.round(offerTotal - paxSum));
                                                return t || (290000 * paxCount);
                                            }
                                            return 290000 * paxCount;
                                        })();

                                        // totals
                                        const addOnsTotal = addOnsDetailed.reduce((s, a) => s + a.total, 0);
                                        const seatsTotal = seatsDetailed.reduce((s, a) => s + a.price, 0);
                                        const passengerBaseTotal = paxTotals.adultsTotal + paxTotals.childrenTotal + paxTotals.infantsTotal;
                                        const estimatedTotal = passengerBaseTotal + taxesEstimate + addOnsTotal + seatsTotal;

                                        // build booking.flight from real offer/pricing when available (normalizedOffer/mappedOffer/cachedPricing)
                                        const offerSeg = normalizedOffer?.itineraries?.[0]?.segments?.[0] ?? mappedOffer?.rawOffer?.itineraries?.[0]?.segments?.[0] ?? null;
                                        const dep = offerSeg?.departure ?? null;
                                        const arr = offerSeg?.arrival ?? null;
                                        const carrier = offerSeg?.carrierCode ?? offerSeg?.operating?.carrierCode ?? null;
                                        const number = offerSeg?.number ?? null;
                                        const flightNumberStr = carrier && number ? `${carrier}${number}` : (normalizedOffer?.id ?? mappedOffer?.rawOffer?.id ?? flightDetails.flightNumber);
                                        const airlineName = (normalizedOffer?.validatingAirlineCodes && normalizedOffer.validatingAirlineCodes[0]) || flightDetails.airline;
                                        const routeStr = `${dep?.iataCode ?? flightDetails.departure.airport} → ${arr?.iataCode ?? flightDetails.arrival.airport}`;
                                        const dateStr = dep?.at?.split('T')?.[0] ?? flightDetails.date;
                                        const timeStr = (dep?.at ? dep.at.split('T')[1]?.slice(0,5) : null) && (arr?.at ? arr.at.split('T')[1]?.slice(0,5) : null)
                                        ? `${dep.at.split('T')[1].slice(0,5)} - ${arr.at.split('T')[1].slice(0,5)}`
                                        : `${flightDetails.departure.time} - ${flightDetails.arrival.time}`;

                                    const booking = {
                                        source: 'megatrip-client',
                                        flight: {
                                            id: normalizedOffer?.id ?? mappedOffer?.rawOffer?.id ?? flightDetails.id,
                                            flightNumber: flightNumberStr,
                                            airline: airlineName,
                                            route: routeStr,
                                            date: dateStr,
                                            time: timeStr,
                                            itineraries: normalizedOffer?.itineraries ?? mappedOffer?.rawOffer?.itineraries ?? null,
                                            currency,
                                        },
                                        passengers: {
                                            counts: { ...participants },
                                            contactInfo,
                                            leadPassenger: passengerInfo
                                        },
                                        pricing: {
                                            perPax: pricingPerPax,
                                            paxTotals,
                                            taxesEstimate,
                                            addOns: addOnsDetailed,
                                            seats: seatsDetailed,
                                            passengerBaseTotal,
                                            addOnsTotal,
                                            seatsTotal,
                                            estimatedTotal,
                                            offerTotal: derived.offerTotal || null
                                        },
                                        rawPricing: cachedPricing ?? mappedOffer?.rawOffer ?? null,
                                        timestamp: Date.now()
                                    };

                                        // save to sessionStorage and navigate with bookingKey
                                        try {
                                            const bookingKey = `booking_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
                                            sessionStorage.setItem(bookingKey, JSON.stringify(booking));
                                            router.push(`/thanh-toan?bookingKey=${encodeURIComponent(bookingKey)}`);
                                        } catch (e) {
                                            console.error('Lỗi lưu booking', e);
                                            alert('Không thể lưu dữ liệu thanh toán. Vui lòng thử lại.');
                                        }
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
