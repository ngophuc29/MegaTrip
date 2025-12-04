"use client"
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '../../../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Label } from '../../../components/ui/label';
import { Calendar } from '../../../components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '../../../components/ui/radio-group';
import { Separator } from '../../../components/ui/separator';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { toast } from '../../../components/ui/use-toast';
import { ArrowLeft, CalendarDays, Clock, Plane, Ticket, TrendingUp, ChevronRight, Bus, MapPin } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
interface Booking {
    id: string;
    type: 'flight' | 'bus' | 'tour';
    status: 'confirmed' | 'completed' | 'cancelled' | 'pending';
    bookingDate: string; // YYYY-MM-DD
    serviceDate: string; // YYYY-MM-DD
    title: string;
    details: string;
    passengers: number;
    total: number;
}

const SAMPLE_BOOKINGS: Booking[] = [
    {
        id: 'TRV123456789',
        type: 'flight',
        status: 'confirmed',
        bookingDate: (() => { const d = new Date(); d.setDate(d.getDate() - 2); return d.toISOString().slice(0, 10); })(),
        serviceDate: (() => { const d = new Date(); d.setDate(d.getDate() + 15); return d.toISOString().slice(0, 10); })(),
        title: 'Chuyến bay TP.HCM - Hà Nội',
        details: 'VN1546 • 06:15 - 08:30',
        passengers: 2,
        total: 4460000,
    },
    {
        id: 'TRV123456788',
        type: 'tour',
        status: 'confirmed',
        bookingDate: '2024-11-20',
        serviceDate: '2025-12-05',
        title: 'Tour Đà Nẵng - Hội An 3N2Đ',
        details: 'Khách sạn 4* • 4 khách',
        passengers: 4,
        total: 15960000,
    },
    {
        id: 'TRV123456787',
        type: 'bus',
        status: 'confirmed',
        bookingDate: '2024-10-15',
        serviceDate: '2025-12-20',
        title: 'Xe TP.HCM - Đà Lạt',
        details: 'Giường nằm VIP • 22:30',
        passengers: 2,
        total: 700000,
    },
    { id: 'TRV123456790', type: 'flight', status: 'confirmed', bookingDate: '2025-01-10', serviceDate: '2025-06-10', title: 'TP.HCM - Nha Trang', details: 'VJ221 • 08:00 - 09:10', passengers: 1, total: 900000 },
    { id: 'TRV123456791', type: 'flight', status: 'pending', bookingDate: '2025-02-01', serviceDate: '2025-07-01', title: 'HN - Đà Lạt', details: 'VN330 • 12:00 - 13:30', passengers: 2, total: 1800000 },
    { id: 'TRV123456792', type: 'bus', status: 'confirmed', bookingDate: '2025-03-05', serviceDate: '2025-08-15', title: 'Xe Sài Gòn - Vũng Tàu', details: 'Ghế ngồi thường • 07:00', passengers: 3, total: 450000 },
    { id: 'TRV123456793', type: 'tour', status: 'cancelled', bookingDate: '2024-09-12', serviceDate: '2024-10-01', title: 'Tour Sapa 2N1Đ', details: 'Khách sạn 3* • 2 khách', passengers: 2, total: 3200000 },
    { id: 'TRV123456794', type: 'bus', status: 'completed', bookingDate: '2024-08-01', serviceDate: '2024-09-01', title: 'Xe Đà Nẵng - Hội An', details: 'Ghế ngồi • 10:00', passengers: 2, total: 200000 },
    { id: 'TRV123456795', type: 'flight', status: 'cancelled', bookingDate: '2024-07-15', serviceDate: '2024-08-20', title: 'HN - TP.HCM', details: 'VJ110 • 20:00 - 21:30', passengers: 1, total: 1200000 },
    { id: 'TRV123456796', type: 'tour', status: 'confirmed', bookingDate: '2025-04-01', serviceDate: '2025-09-10', title: 'Tour Miền Tây 3N2Đ', details: 'Khách sạn 3* • 4 khách', passengers: 4, total: 8400000 },
];

function formatPrice(v: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);
}

interface Option { id: string; time: string; fare: number; notes?: string; }
function generateOptions(baseFare: number, date: Date): Option[] {
    const dayFactor = 1 + ((date.getDate() % 5) - 2) * 0.03; // -6% .. +6%
    const times = [
        { id: '06', time: '06:00' },
        { id: '09', time: '09:30' },
        { id: '13', time: '13:00' },
        { id: '18', time: '18:45' },
        { id: '21', time: '21:15' },
    ];
    return times.map((t, idx) => ({
        id: `${t.id}-${date.toISOString().slice(0, 10)}`,
        time: t.time,
        fare: Math.round(baseFare * dayFactor * (0.95 + idx * 0.05)),
        notes: idx === 0 ? 'Tiết kiệm' : idx === times.length - 1 ? 'Giờ tối muộn' : undefined,
    }));
}

function useBookingFromRoute(): Booking | null {
    const params = useParams() as any;
    const id = params?.id as string | undefined;
    return SAMPLE_BOOKINGS.find((b) => b.id === id) ?? null;
}

function ServiceIcon({ type }: { type: string }) {
    if (type === 'flight') return <Plane className="h-4 w-4" />;
    if (type === 'bus') return <Bus className="h-4 w-4" />;
    if (type === 'tour') return <MapPin className="h-4 w-4" />;
    return <Plane className="h-4 w-4" />;
}

export default function DoiLichPage() {
    // Định nghĩa seatTypeLabel (mapping cho seat types)
    const seatTypeLabel: Record<string, string> = {
        'W': 'Cửa sổ',
        'A': 'Hàng lối',
        'EX': 'Cửa thoát hiểm',
        'GAL': 'Galley',
        'M': 'Tiêu chuẩn',
    };
    // const booking = useBookingFromRoute();
    // Luôn gọi hook ở đầu để tránh lỗi "more hooks than previous render"
    const bookingFromRoute = useBookingFromRoute();
    const params = useParams() as any;
    const routeId = params?.id as string | undefined;
    const router = useRouter();
    // Thêm state cho API flights và cache
    const [apiFlights, setApiFlights] = useState<any[]>([]);
    const [currentCacheKey, setCurrentCacheKey] = useState<string | null>(null);
    const [cacheExpired, setCacheExpired] = useState(false);
    // State cho seatmap flight (khác với bus)
    const [flightSeatMap, setFlightSeatMap] = useState<any>({ rows: [], summary: null, amenities: null, freeSeats: [] });

    const [selectedLeg, setSelectedLeg] = useState<'outbound' | 'inbound'>('outbound');

    // Thêm hàm mapOfferToFlight từ ve-may-bay
    const mapOfferToFlight = (offer: any, dictionaries: any, idx: number) => {
        const itineraries = offer.itineraries || [];
        const firstItin = itineraries[0] || {};
        const segments = firstItin.segments || [];
        const firstSeg = segments[0] || {};
        const lastSeg = segments[segments.length - 1] || firstSeg;

        const depAt: string = firstSeg.departure?.at || '';
        const arrAt: string = lastSeg.arrival?.at || '';
        const depDate = depAt.split('T')[0] || '';
        const arrDate = arrAt.split('T')[0] || '';
        const depTime = depAt.split('T')[1]?.slice(0, 5) || '';
        const arrTime = arrAt.split('T')[1]?.slice(0, 5) || '';

        const carrier = (offer.validatingAirlineCodes && offer.validatingAirlineCodes[0]) || firstSeg.carrierCode || '';
        const airlineName = dictionaries?.carriers?.[carrier] || carrier || 'Unknown';

        const aircraftCodes = [...new Set(segments.map((s: any) => s.aircraft?.code).filter(Boolean))];
        const aircraft = (aircraftCodes as any)?.map((c: string) => dictionaries?.aircraft?.[c] || c).join(' / ') || '';

        const stopsCount = Math.max(0, segments.length - 1);
        const stopsText = stopsCount === 0 ? 'Bay thẳng' : `${stopsCount} dừng`;

        const traveler = offer.travelerPricings?.[0] || {};
        const cabins = (traveler.fareDetailsBySegment || []).map((f: any) => f.cabin).filter(Boolean);
        const cabinText = cabins.length > 0 ? cabins.join('/') : (traveler.travelerType || '');

        const baggage = {
            handbag: {
                pieces: traveler.fareDetailsBySegment?.[0]?.includedCabinBags?.quantity ?? undefined,
                weight: traveler.fareDetailsBySegment?.[0]?.includedCabinBags?.weight ?? undefined,
                unit: traveler.fareDetailsBySegment?.[0]?.includedCabinBags?.weightUnit ?? undefined
            },
            checkin: {
                pieces: traveler.fareDetailsBySegment?.[0]?.includedCheckedBags?.quantity ?? undefined,
                weight: traveler.fareDetailsBySegment?.[0]?.includedCheckedBags?.weight ?? undefined,
                unit: traveler.fareDetailsBySegment?.[0]?.includedCheckedBags?.weightUnit ?? undefined
            }
        };

        const priceStr = String(offer.price?.total || offer.price?.grandTotal || '0');
        const currency = offer.price?.currency || 'VND';
        const priceNumeric = Number(priceStr) || 0;

        const amenities = {
            wifi: { available: false },
            meal: { included: false, available: true, price: 'Từ 120.000đ' },
            entertainment: { available: false },
            power: { available: false },
            priority: false
        };

        const policies = {
            cancellable: false,
            changeable: false,
            refundable: 'Không hoàn tiền, không đổi lịch'
        };

        return {
            id: String(offer.id) || `offer-${idx}`,
            airline: airlineName,
            airlineCode: carrier,
            flightNumber: `${firstSeg.carrierCode || ''}${firstSeg.number || ''}`,
            departure: { time: depTime, airport: firstSeg.departure?.iataCode || '', city: firstSeg.departure?.iataCode || '', date: depDate },
            arrival: { time: arrTime, airport: lastSeg.arrival?.iataCode || '', city: lastSeg.arrival?.iataCode || '', date: arrDate },
            duration: convertDuration(firstItin.duration),
            aircraft,
            price: priceNumeric,
            currency,
            // Bỏ originalPrice, dùng price
            class: cabinText || 'ECONOMY',
            baggage,
            benefits: [],
            promotions: [],
            amenities,
            policies,
            availableSeats: offer.numberOfBookableSeats || 0,
            stopsCount,
            stopsText,
            raw: offer
        };
    };

    // Thêm hàm convertDuration
    const convertDuration = (iso: string | undefined) => {
        if (!iso) return '';
        const matchH = iso.match(/(\d+)H/);
        const matchM = iso.match(/(\d+)M/);
        const h = matchH ? `${matchH[1]}h` : '';
        const m = matchM ? `${matchM[1]}m` : '';
        return [h, m].filter(Boolean).join(' ');
    };

    // Thêm hàm fetchAmadeusOffers cho flight
    // Thêm hàm fetchAmadeusOffers cho flight
    const fetchAmadeusOffersForFlight = async (origin: string, destination: string, departureDate: string) => {
        setIsLoading(true);
        try {
            // Lấy pax counts từ order (đảm bảo pc được khai báo)
            const pc = paxCountsFromOrder(order || {});

            const tokenRes = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    grant_type: 'client_credentials',
                    client_id: 'e9bhGWGeAIZG4qLn708d5oAV3gDDaWut',
                    client_secret: '9fcdtMUicUy6ZAGm'
                })
            });
            const tokenJson = await tokenRes.json();
            const token = tokenJson.access_token;
            if (!token) throw new Error('No token from Amadeus');

            const params = new URLSearchParams();
            params.set('originLocationCode', origin);
            params.set('destinationLocationCode', destination);
            params.set('departureDate', departureDate);
            params.set('adults', pc.adults.toString());  // Sử dụng pc.adults thay hardcoded '1'
            params.set('children', pc.children.toString());  // Sử dụng pc.children thay hardcoded '0'
            params.set('infants', pc.infants.toString());
            params.set('includedAirlineCodes', 'VN');
            params.set('currencyCode', 'VND');
            params.set('nonStop', 'true');
            params.set('max', '5');

            const offersRes = await fetch(`https://test.api.amadeus.com/v2/shopping/flight-offers?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const offersJson = await offersRes.json();
            const dicts = offersJson.dictionaries || {};
            const data = offersJson.data || [];
            const mapped = data.map((o: any, i: number) => mapOfferToFlight(o, dicts, i));

            // Lưu cache
            const cacheKey = `flight-${origin}-${destination}-${departureDate}`;
            localStorage.setItem(cacheKey, JSON.stringify({ data: mapped, timestamp: Date.now() }));
            setCurrentCacheKey(cacheKey);

            console.log('Fetched flight offers:', mapped); // Log để xem data

            setApiFlights(mapped);
            setCacheExpired(false);
        } catch (err) {
            console.error('Amadeus fetch error', err);
            setApiFlights([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Thêm hàm fetch token và seatmap cho flight (từ ve-may-bay)
    const fetchAmadeusTokenSimple = async () => {
        const tokenRes = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: 'e9bhGWGeAIZG4qLn708d5oAV3gDDaWut',
                client_secret: '9fcdtMUicUy6ZAGm'
            })
        });
        const tokenJson = await tokenRes.json();
        return tokenJson.access_token;
    };

    const fetchSeatmapForFlight = async (offer: any) => {
        try {
            const token = await fetchAmadeusTokenSimple();
            if (!token) throw new Error('No Amadeus token');

            const seatmapBody = { data: [offer] };
            const seatmapUrl = 'https://test.api.amadeus.com/v1/shopping/seatmaps';
            const seatRes = await fetch(seatmapUrl, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/vnd.amadeus+json'
                },
                body: JSON.stringify(seatmapBody)
            });
            const seatJson = await seatRes.json();
            const normalizedSeat = Array.isArray(seatJson) ? seatJson[0] : (seatJson?.data?.[0] ?? seatJson);
            return normalizedSeat;
        } catch (err) {
            console.error('Fetch seatmap error', err);
            return null;
        }
    };

    // Hàm parse seatmap từ Amadeus (từ FlightResults.tsx)
    const parseSeatmap = (raw: any) => {
        try {
            const decks = raw?.decks ?? [];
            const allSeats: any[] = [];
            for (const d of decks) {
                for (const s of (d.seats ?? [])) {
                    const seatNum = s.number ?? '';
                    const rowMatch = String(seatNum).match(/\d+/);
                    const row = rowMatch ? rowMatch[0] : '0';

                    let travEntry: any = null;
                    if (Array.isArray(s.travelerPricing) && s.travelerPricing.length > 0) travEntry = s.travelerPricing[0];
                    else if (s.travelerPricing && typeof s.travelerPricing === 'object') travEntry = s.travelerPricing;

                    const availability = travEntry?.seatAvailabilityStatus ?? 'UNKNOWN';
                    const priceRaw = travEntry?.price?.total ?? travEntry?.price?.amount ?? null;
                    const price = priceRaw != null ? Number(String(priceRaw).replace(/[^\d.-]/g, '')) : 0;
                    const currency = travEntry?.price?.currency ?? travEntry?.price?.currencyCode ?? 'VND';
                    const characteristics = s.characteristicsCodes ?? s.characteristics ?? [];

                    allSeats.push({
                        id: seatNum,
                        number: seatNum,
                        row,
                        availability,
                        price: Number.isFinite(price) ? price : 0,
                        currency: currency ?? 'VND',
                        coords: s.coordinates ?? null,
                        characteristics,
                        raw: s
                    });
                }
            }

            const rowsMap: Record<string, any[]> = {};
            allSeats.forEach(s => {
                rowsMap[s.row] = rowsMap[s.row] ?? [];
                rowsMap[s.row].push(s);
            });
            const rows = Object.keys(rowsMap)
                .map(r => ({ row: r, seats: rowsMap[r].sort((a, b) => a.number.localeCompare(b.number)) }))
                .sort((a, b) => Number(a.row) - Number(b.row));

            const summary = {
                aircraftCode: raw?.aircraft?.code ?? raw?.data?.aircraft?.code ?? null,
                availableSeatsCounters: raw?.availableSeatsCounters ?? raw?.data?.availableSeatsCounters ?? null,
                rawSeatmap: raw
            };

            const amenities = raw?.aircraftCabinAmenities ?? null;

            const freeSeats = allSeats.filter(s => {
                const chars = (s.characteristics ?? []).map((c: string) => String(c).toUpperCase());
                const hasCH = chars.includes('CH');
                const priceIsZero = Number(s.price || 0) === 0;
                return s.availability === 'AVAILABLE' && priceIsZero && !hasCH;
            });

            return { rows, summary, amenities, freeSeats };
        } catch (e) {
            console.warn('parseSeatmap error', e);
            return { rows: [], summary: null, amenities: null, freeSeats: [] };
        }
    };


    // Thêm state isLoading nếu chưa có
    const [isLoading, setIsLoading] = useState(false);
    // real order loaded from server (fallback to SAMPLE_BOOKINGS for dev)
    const [order, setOrder] = useState<any | null>(null);
    const [loadingOrder, setLoadingOrder] = useState(false);
    useEffect(() => {
        if (!routeId) return;
        let mounted = true;
        (async () => {
            setLoadingOrder(true);
            try {
                const base = process.env.NEXT_PUBLIC_API_BASE || 'https://megatripserver.onrender.com';
                const r = await fetch(`${base}/api/orders/${encodeURIComponent(routeId)}`);
                if (!r.ok) throw new Error(String(r.status));
                const json = await r.json();
                const ord = json && json.data ? json.data : json;
                if (mounted) setOrder(ord);
            } catch (e) {
                console.warn('Failed to load order', e);
            } finally { if (mounted) setLoadingOrder(false); }
        })();
        return () => { mounted = false; };
    }, [routeId]);

    // selected date / option for change
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);


    const [selectedOptionId, setSelectedOptionId] = useState<string>('');

    const [ackChecked, setAckChecked] = useState<boolean>(false);

    // payment modal state
    const [payOpen, setPayOpen] = useState<boolean>(false);
    const [payMethod, setPayMethod] = useState<'momo' | 'zalopay'>('zalopay');
    const [payAckConfirmed, setPayAckConfirmed] = useState<boolean>(false);

    const [options, setOptions] = useState<Option[]>([]);
    const [loadingOptions, setLoadingOptions] = useState<boolean>(false);
    const selectedOption = options.find((o) => o.id === selectedOptionId);

    const changeFeePerPax = 100000; // show but NOT added to final auto-pay (per your note)
    // derived totals (updated below when order or selection changes)
    const [newTotal, setNewTotal] = useState<number>(0);
    const [fareDiff, setFareDiff] = useState<number>(0);
    const [extraPay, setExtraPay] = useState<number>(0);
    const [refundBack, setRefundBack] = useState<number>(0);
    const [penaltyPercent, setPenaltyPercent] = useState<number>(0);
    const [penaltyAmount, setPenaltyAmount] = useState<number>(0);
    // Thêm state cho phí ghế đã chọn
    const [selectedSeatFees, setSelectedSeatFees] = useState<number>(0);



    // helper: extract pax counts from order snapshot (adults/children/infants)
    function paxCountsFromOrder(ord: any) {
        const snap = ord?.metadata?.bookingDataSnapshot || ord?.metadata || {};
        let adults = 0, children = 0, infants = 0;
        if (Array.isArray(snap?.details?.passengers) && snap.details.passengers.length) {
            for (const p of snap.details.passengers) {
                const t = String(p?.type || 'adult').toLowerCase();
                if (t === 'infant') infants++;
                else if (t === 'child') children++;
                else adults++;
            }
        } else if (snap?.passengers?.counts) {
            const c = snap.passengers.counts;
            adults = Number(c.adults || 0);
            children = Number(c.children || 0);
            infants = Number(c.infants || 0);
        } else {
            const item = Array.isArray(ord?.items) && ord.items[0] ? ord.items[0] : null;
            const q = Number(item?.quantity || 1);
            adults = q;
        }
        // ensure at least 1 adult if unknown
        if (adults + children + infants === 0) adults = 1;
        const seatCount = Math.max(1, adults + children); // infants don't consume seats
        return { adults, children, infants, seatCount };
    }


    // when order loads, prefill selectedDate/options based on product type
    // set initial selectedDate once when order loads (guard to avoid infinite loop)
    useEffect(() => {
        if (!order) return;
        try {
            const snap = order.metadata?.bookingDataSnapshot || order.metadata || {};
            const serviceRaw = snap?.details?.startDateTime ?? snap?.details?.date ?? order.createdAt;
            if (!serviceRaw) return;
            const d = new Date(serviceRaw);
            const iso = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
            const curIso = selectedDate ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()).toISOString() : null;
            if (curIso !== iso) setSelectedDate(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
        } catch (e) { /* ignore */ }
    }, [order]);

    // load product options (depends on order and selectedDate) - DOES NOT set selectedDate



    // recompute totals when selection or order/options change
    // ...existing code...

    // recompute totals when selection or order/options change
    // recompute totals when selection or order/options change
    useEffect(() => {
        if (!order) { setNewTotal(0); setFareDiff(0); setExtraPay(0); setRefundBack(0); return; }
        const { adults, children, infants } = paxCountsFromOrder(order);
        let computedNewTotalBase = 0;
        if (selectedOption && (selectedOption as any).perPax) {
            const pp = (selectedOption as any).perPax;
            computedNewTotalBase = (Number(pp.adult || 0) * adults) + (Number(pp.child || 0) * children) + (Number(pp.infant || 0) * infants);
        } else if (selectedOption) {
            const unitPrice = Number((selectedOption as any).raw?.price?.total || (selectedOption as any).price || selectedOption.fare || 0);
            // Fix: For flight, price is already total; don't multiply by totalPax
            if (booking?.type === 'flight') {
                computedNewTotalBase = unitPrice;
            } else {
                const totalPax = adults + children + infants;
                computedNewTotalBase = unitPrice * Math.max(1, totalPax);
            }
        } else {
            computedNewTotalBase = 0;
        }
        // original order base & tax (prefer snapshot pricing)
        const origBase = Number(order?.metadata?.bookingDataSnapshot?.pricing?.basePrice ?? order?.subtotal ?? (order?.total ? (Number(order.total || 0) - Number(order.tax || 0)) : 0));
        const origTax = Number(order?.metadata?.bookingDataSnapshot?.pricing?.taxes ?? order?.tax ?? 0);
        const computedNewTax = origBase > 0 ? Math.round(origTax * (computedNewTotalBase / Math.max(1, origBase))) : origTax;
        const computedNewTotal = computedNewTotalBase + computedNewTax + (selectedSeatFees || 0);  // Thêm selectedSeatFees
        const currentTotal = Number(order.total || 0);
        const diff = computedNewTotal - currentTotal;

        // compute days until original service date (used to pick penalty policy)
        let daysUntilService = Infinity;
        try {
            const sdRaw = order?.metadata?.bookingDataSnapshot?.details?.startDateTime ?? order?.metadata?.bookingDataSnapshot?.details?.date ?? booking?.serviceDate ?? order?.createdAt;
            if (sdRaw) {
                const sd = new Date(sdRaw);
                const today = new Date();
                const t0 = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
                const t1 = Date.UTC(sd.getFullYear(), sd.getMonth(), sd.getDate());
                daysUntilService = Math.ceil((t1 - t0) / (1000 * 60 * 60 * 24));
            }
        } catch { daysUntilService = Infinity; }

        // penalty policy: riêng cho bus
        let penAmount = 0;
        if (booking?.type === 'bus') {
            // Tính theo giờ cho bus
            const sdRaw = order?.metadata?.bookingDataSnapshot?.details?.startDateTime ?? order?.metadata?.bookingDataSnapshot?.details?.date ?? booking?.serviceDate ?? order?.createdAt;
            if (sdRaw) {
                const sd = new Date(sdRaw);
                const now = new Date();
                const hoursDiff = (sd.getTime() - now.getTime()) / (1000 * 60 * 60);
                const pc = paxCountsFromOrder(order || ({} as any));
                const totalPax = pc.adults + pc.children; // Giả sử không tính infant cho phạt
                if (hoursDiff >= 72) {
                    penAmount = 50000 * totalPax;
                } else if (hoursDiff >= 24) {
                    penAmount = 50000 * totalPax + 0.25 * currentTotal;
                } else {
                    penAmount = Infinity; // Không cho đổi, sẽ set canChange = false
                }
            }
        } else {
            // Tour/flight: giữ nguyên
            let pp = 0;
            if (typeof daysUntilService === 'number') {
                if (daysUntilService > 5) pp = 0.30;
                else if (daysUntilService > 3) pp = 0.50;
                else pp = 1.00;
            }
            penAmount = Math.round(Number(currentTotal) * pp);
        }

        // determine final pay / refund after applying penalty
        let amountDue = 0;
        let refund = 0;
        if (diff >= 0) {
            // customer needs to pay fare difference + penalty
            amountDue = Math.max(0, diff) + penAmount;
            refund = 0;
        } else {
            // there is a refund gross; penalty reduces refund (if penalty > refund, customer pays difference)
            const refundGross = Math.max(0, -diff);
            if (refundGross > penAmount) {
                refund = refundGross - penAmount;
                amountDue = 0;
            } else {
                refund = 0;
                amountDue = penAmount - refundGross;
            }
        }
        // console.log('selectedOption:', selectedOption);
        // console.log('selectedOption.raw.price:', selectedOption?.raw?.price);
        // console.log('selectedOption.price:', selectedOption?.price);
        // console.log('unitPrice:', Number(selectedOption?.raw?.price?.total || selectedOption?.price || selectedOption?.fare || 0), 'totalPax:', adults + children + infants);

        // console.log('selectedOption:', selectedOption);
        // console.log('unitPrice:', Number(selectedOption?.fare || selectedOption?.price || 0), 'totalPax:', adults + children + infants);
        // console.log('computedNewTotalBase:', computedNewTotalBase);
        // console.log('origBase:', origBase, 'origTax:', origTax);
        // console.log('computedNewTax:', computedNewTax);
        // console.log('selectedSeatFees:', selectedSeatFees);
        // console.log('computedNewTotal:', computedNewTotal);
        // console.log('currentTotal:', currentTotal);
        // console.log('diff:', diff);
        // console.log('penAmount:', penAmount);
        // console.log('amountDue:', amountDue);

        // per your request: do NOT include change fee into automatic total; show fee separately
        // const pay = Math.max(0, diff);
        // const refund = Math.max(0, -diff);
        // setNewTotal(computedNewTotal);
        // setFareDiff(diff);
        // setExtraPay(pay);
        // setRefundBack(refund);
        setNewTotal(computedNewTotal);
        setFareDiff(diff);
        setExtraPay(amountDue);
        setRefundBack(refund);
        setPenaltyPercent(penAmount / currentTotal); // Tùy chỉnh hiển thị %
        setPenaltyAmount(penAmount);
    }, [order, selectedOption, options, selectedSeatFees]);  // Thêm selectedSeatFees vào dependency  // Thêm selectedSeatFees vào dependency

    // ...existing code...

    function saveRequest() {
        if (!booking || !selectedDateLabel || !selectedOption) return '';
        const id = 'RQ-' + Date.now();
        const req = {
            id, type: 'change', bookingId: booking.id, title: booking.title, status: 'submitted', createdAt: new Date().toISOString(),
            extraPay: extraPay > 0 ? extraPay : -refundBack,
            details: { newDate: selectedDateLabel, time: selectedOption.time, changeFeePerPax, passengers: booking.passengers, fareDiff },
        } as any;
        try {
            const arr = JSON.parse(localStorage.getItem('userRequests') || '[]');
            arr.push(req);
            localStorage.setItem('userRequests', JSON.stringify(arr));
        } catch {
            localStorage.setItem('userRequests', JSON.stringify([req]));
        }
        return id;
    }

    // const handleConfirm = () => { if (!booking || !selectedDate || !selectedOption) return; setOtp(''); setOtpOpen(true); };
    // open payment modal after primary ackChecked
    const handleConfirm = () => {
        // debug info
        console.log('handleConfirm click', {
            booking,
            selectedDateLabel,
            selectedOptionId,
            selectedOption,
            ackChecked,
            canChange,
            optionsForSelectedDate,
        });

        if (!booking || !selectedDateLabel) {
            toast({ title: 'Thiếu thông tin', description: 'Vui lòng chọn ngày mới' });
            return;
        }

        // Check phải chọn ghế cho flight/bus
        if ((booking.type === 'flight' || booking.type === 'bus') && selectedSeats.length === 0) {
            toast({ title: 'Chưa chọn ghế', description: 'Vui lòng chọn ghế trước khi xác nhận đổi lịch.' });
            return;
        }

        // if user selected a date but didn't pick a time option, auto-select first available option for that date
        if (!selectedOption && optionsForSelectedDate && optionsForSelectedDate.length > 0) {
            // set state and ask user to confirm again (simple & safe)
            setSelectedOptionId(optionsForSelectedDate[0].id);
            toast({ title: 'Đã chọn mặc định', description: 'Đã tự chọn chuyến đầu tiên trong ngày. Vui lòng nhấn lại Xác nhận.' });
            return;
        }

        if (!ackChecked) {
            toast({ title: 'Chưa đồng ý', description: 'Bạn phải đồng ý chính sách trước khi xác nhận' });
            return;
        }

        if (!canChange) {
            toast({ title: 'Không đủ điều kiện đổi', description: 'Không thể đổi lịch — kiểm tra chính sách thời hạn đổi.' });
            return;
        }

        // ready to open payment modal
        setPayAckConfirmed(false);
        setPayMethod('zalopay');
        setPayOpen(true);
    };

    // final payment handler (simulated): save request + attach payment info, then navigate
    // ...existing code...


    async function handlePay() {
        if (!booking || !order || !selectedDateLabel || !selectedOption) {
            toast({ title: 'Thiếu thông tin', description: 'Vui lòng chọn ngày và chuyến mới' });
            return;
        }
        if (!payAckConfirmed) {
            toast({ title: 'Chưa xác nhận', description: 'Vui lòng xác nhận trước khi thanh toán' });
            return;
        }

        const PAYMENT_BASE = process.env.NEXT_PUBLIC_PAYMENT_BASE || 'http://localhost:7000';
        const ORDERS_API = process.env.NEXT_PUBLIC_API_BASE || 'https://megatripserver.onrender.com';

        try {
            const requestBody: any = {
                newDate: selectedDateLabel,
                newTime: selectedOption.time,
                selectedOption: selectedOption,
                passengers: booking.passengers,
                changeFeePerPax: changeFeePerPax,
                fareDiff: fareDiff,
                totalpayforChange: extraPay,
                selectedSeatFees: selectedSeatFees,
            };

            // Nếu là bus, thêm selectedSeats
            if (booking.type === 'bus') {
                requestBody.selectedSeats = selectedSeats;
            }
            // Nếu là flight, thêm selectedSeats
            if (booking.type === 'flight') {
                requestBody.selectedSeats = selectedSeats;
            }

            // Log requestBody trước khi gửi
            console.log('RequestBody gửi lên change-calendar:', requestBody);

            // Bước mới: Gọi API để update inforChangeCalendar trước
            const changeResponse = await fetch(`${ORDERS_API}/api/orders/${order._id || order.orderNumber}/change-calendar`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            if (!changeResponse.ok) {
                const errorData = await changeResponse.json().catch(() => ({}));
                console.error('Change-calendar response error:', errorData); // Log lỗi
                throw new Error(errorData.error || 'Failed to update change calendar');
            }
            const responseData = await changeResponse.json();
            console.log('Response từ change-calendar:', responseData); // Log response

            const { codeChange, amountDue, refund } = responseData;
            console.log('Final amountDue before payment:', Math.max(0, amountDue)); // Log amountDue cuối cùng trước khi thanh toán
            if (!codeChange || typeof amountDue !== 'number') {
                throw new Error('Invalid response from change calendar API');
            }

            // Nếu không cần thanh toán (amountDue <= 0), hiển thị thông tin hoàn tiền và navigate
            if (amountDue <= 0) {
                const refundAmount = Math.abs(amountDue) || refund || 0;
                const id = saveRequest();
                toast({
                    title: 'Yêu cầu lưu',
                    description: refundAmount > 0 ? `Không cần thanh toán. Sẽ hoàn lại ${formatPrice(refundAmount)}. Mã yêu cầu ${id}` : `Không cần thanh toán. Mã yêu cầu ${id}`
                });
                setPayOpen(false);
                router.push('/tai-khoan');
                return;
            }

            // Tiếp tục logic thanh toán với amountDue từ server
            const changeCode = codeChange;

            // Log payment request trước khi gửi
            console.log('Payment method:', payMethod, 'Amount:', amountDue);

            // Build payment payloads per gateway (dùng amountDue thay vì extraPay)
            if (payMethod === 'momo') {
                const paymentBody = {
                    orderId: changeCode,
                    amount: Math.max(0, Math.round(amountDue)),
                    orderInfo: `Thanh toán đổi lịch - ${order.orderNumber || ''}`,
                    orderDescription: `${booking.title} — ${selectedDateLabel} ${selectedOption?.time ?? ''}`,
                    extraData: JSON.stringify({ originalOrder: order.orderNumber, changeCode })
                };
                console.log('MoMo payment request:', paymentBody); // Log MoMo request

                const resp = await fetch(`${PAYMENT_BASE}/momo/payment`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(paymentBody)
                });
                const data = await resp.json();
                console.log('MoMo payment response:', data); // Log MoMo response

                const url = data?.payUrl || data?.shortLink || data?.payUrl;
                if (url) {
                    window.location.href = url;
                    return;
                } else {
                    throw new Error('MoMo tạo payment không trả về URL');
                }
            } else if (payMethod === 'zalopay') {
                const paymentBody = {
                    amount: Math.max(0, Math.round(amountDue)),
                    description: `Thanh toán đổi lịch ${order.orderNumber || ''}`,
                    orderId: changeCode,
                    app_user: order.customerEmail || 'guest',
                    callback_url: `${ORDERS_API}/api/payment/callback/zalo`,
                    embed_data: { orderNumber: changeCode, originalOrder: order.orderNumber }
                };
                console.log('ZaloPay payment request:', paymentBody); // Log ZaloPay request

                const resp = await fetch(`${PAYMENT_BASE}/zalo/payment`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(paymentBody)
                });
                const data = await resp.json();
                console.log('ZaloPay payment response:', data); // Log ZaloPay response

                const url = data?.order_url || data?.paymentUrl || (data && data.data && data.data.order_url);
                if (url) {
                    window.location.href = url;
                    return;
                } else {
                    throw new Error('ZaloPay tạo payment không trả về URL');
                }
            } else {
                throw new Error('Phương thức thanh toán không hỗ trợ');
            }
        } catch (err: any) {
            console.error('Payment init failed:', err); // Log lỗi tổng
            toast({ title: 'Lỗi thanh toán', description: String(err?.message || err) });
            return;
        }
    }

    // Map server Order shape -> booking summary used by this page
    function mapOrderToBooking(order: any): Booking {
        if (!order) return null as any;
        // let serviceDate = '';
        // const item = Array.isArray(order.items) && order.items[0] ? order.items[0] : null;
        // const snapshot = order?.metadata?.bookingDataSnapshot || order?.metadata || {};
        // // determine service date
        // const serviceRaw = snapshot?.details?.startDateTime ?? snapshot?.details?.date ?? item?.travelDate ?? order?.createdAt;
        // try { serviceDate = new Date(serviceRaw).toISOString().slice(0, 10); } catch { serviceDate = String(serviceRaw || '').slice(0, 10); }
        // determine service date
        let serviceDate = '';
        const snapshot = order?.metadata?.bookingDataSnapshot || order?.metadata || {};
        const item = Array.isArray(order.items) && order.items[0] ? order.items[0] : null;

        // Nếu là flight, lấy ngày từ flights trước (ưu tiên)
        if (item?.type === 'flight') {
            const flights = snapshot?.flights;
            if (flights?.outbound && flights?.inbound) {
                serviceDate = `${flights.outbound.date} - ${flights.inbound.date}`;
            } else if (flights?.outbound) {
                serviceDate = flights.outbound.date;
            } else if (flights?.inbound) {
                serviceDate = flights.inbound.date;
            }
        }

        // Fallback nếu không phải flight hoặc không có
        if (!serviceDate) {
            const serviceRaw = snapshot?.details?.startDateTime ?? snapshot?.details?.date ?? item?.travelDate ?? order?.createdAt;
            try { serviceDate = new Date(serviceRaw).toISOString().slice(0, 10); } catch { serviceDate = String(serviceRaw || '').slice(0, 10); }
        }


        // booking date
        const bookingDate = order?.createdAt ? new Date(order.createdAt).toISOString().slice(0, 10) : (order?.bookingDate || new Date().toISOString().slice(0, 10));
        // passengers count: fallback to snapshot counts or item.quantity
        let passengers = 0;
        if (Array.isArray(snapshot?.details?.passengers) && snapshot.details.passengers.length) {
            passengers = snapshot.details.passengers.length;
        } else if (snapshot?.passengers?.counts) {
            const c = snapshot.passengers.counts;
            passengers = Number(c.adults || 0) + Number(c.children || 0) + Number(c.infants || 0);
        } else {
            passengers = Number(item?.quantity || order?.passengers || 1);
        }
        // title/details fallback
        const title = item?.title || item?.name || order?.title || (item ? `${item.type || ''} ${item.productId || item.itemId || ''}` : 'Đặt chỗ');
        const details = item?.details || item?.description || order?.notes?.[0] || '';

        // status mapping
        const status = (order?.orderStatus || order?.status || order?.paymentStatus || 'pending');
        // build Booking
        return {
            id: order.orderNumber || order._id || String(order.id || ''),
            type: (item?.type || order?.type || 'tour') as any,
            status: (status === 'cancelled' || status === 'completed' || status === 'confirmed') ? status : 'confirmed',
            bookingDate: bookingDate,
            serviceDate: serviceDate,
            title,
            details,
            passengers,
            total: Number(order.total || 0),
        } as Booking;
    }

    // const bookingFromRoute = useBookingFromRoute();
    // use loaded order -> map to booking shape for display; fallback to SAMPLE_BOOKINGS if order not found
    const booking = order ? mapOrderToBooking(order) : bookingFromRoute;
    // Thêm hàm markOccupiedSeats (từ ChiTietMayBay)
    // Thêm state cho bookedSeatsByLeg (từ ChiTietMayBay)
    const [bookedSeatsByLeg, setBookedSeatsByLeg] = useState<{
        outbound: string[];
        inbound: string[];
    }>({ outbound: [], inbound: [] });
    // Thêm hàm markOccupiedSeats (từ ChiTietMayBay)
    const markOccupiedSeats = (rows: any[], leg: 'outbound' | 'inbound') => {
        console.log(`🔍 [Đổi lịch] Mark OCCUPIED cho leg: ${leg}`);
        console.log(`🔍 [Đổi lịch] bookedSeatsByLeg[${leg}]:`, bookedSeatsByLeg[leg]);
        const markedRows = rows.map(row => ({
            ...row,
            seats: row.seats.map((seat: any) => {
                const isOccupied = bookedSeatsByLeg[leg].includes(seat.number);
                if (isOccupied) {
                    console.log(`✅ [Đổi lịch] Ghế ${seat.number} được mark OCCUPIED (từ bookedSeatsByLeg)`);
                }
                return {
                    ...seat,
                    availability: isOccupied ? 'OCCUPIED' : seat.availability,
                };
            }),
        }));
        console.log(`🔍 [Đổi lịch] Tổng ghế OCCUPIED sau mark:`, markedRows.flatMap(r => r.seats).filter(s => s.availability === 'OCCUPIED').map(s => s.number));
        return markedRows;
    };
    // Thêm useEffect để load bookedSeatsByLeg từ tickets (từ ChiTietMayBay, adapt cho đổi lịch)
    useEffect(() => {
        if (!selectedOptionId || !booking || booking.type !== 'flight') {
            setBookedSeatsByLeg({ outbound: [], inbound: [] });
            return;
        }
        const fetchAndMatchTickets = async () => {
            // Log ngày của selectedOption's flight
            const selectedOffer = options.find((f: any) => f.id === selectedOptionId);
            console.log(`🔍 [Đổi lịch] Ngày flight outbound:`, (selectedOffer as any)?.raw?.itineraries?.[0]?.segments?.[0]?.departure?.at?.split('T')?.[0] || 'Không có');
            if ((selectedOffer as any)?.raw?.itineraries?.[0]?.segments?.[1]) {  // Nếu có inbound (roundtrip)
                console.log(`🔍 [Đổi lịch] Ngày flight inbound:`, (selectedOffer as any).raw.itineraries[0].segments[1]?.departure?.at?.split('T')?.[0] || 'Không có');
            }
            try {
                // Fetch tickets: chỉ lấy flight tickets với status paid/changed (đồng bộ với ChiTietMayBay)
                const response = await fetch('https://megatripserver.onrender.com/api/tickets?type=flight&status=paid&status=changed');
                if (!response.ok) return;
                const { data: tickets } = await response.json();

                const outboundBooked: string[] = [];
                const inboundBooked: string[] = [];

                // Hàm helper để so khớp flight info (đồng bộ với ChiTietMayBay)
                const matchFlight = (segment: any, ticketFlight: any) => {
                    const segCarrier = segment?.carrierCode;
                    const tickCarrier = ticketFlight?.airline;
                    const segFlightNum = segment?.carrierCode + segment?.number;
                    const tickFlightNum = ticketFlight?.flightNumber;
                    const segDepIata = segment?.departure?.iataCode;
                    const tickDepIata = ticketFlight?.route?.split(' → ')?.[0];
                    const segArrIata = segment?.arrival?.iataCode;
                    const tickArrIata = ticketFlight?.route?.split(' → ')?.[1];
                    const segDate = segment?.departure?.at?.split('T')?.[0];
                    const tickDate = ticketFlight?.date;
                    const segTime = segment?.departure?.at?.includes(ticketFlight?.time?.split(' - ')?.[0]?.trim());

                    console.log(`🔍 [Đổi lịch] Debug matchFlight:`);
                    console.log(`  Segment carrier: ${segCarrier}, Ticket airline: ${tickCarrier}`);
                    console.log(`  Segment flightNum: ${segFlightNum}, Ticket flightNumber: ${tickFlightNum}`);
                    console.log(`  Segment depIata: ${segDepIata}, Ticket depIata: ${tickDepIata}`);
                    console.log(`  Segment arrIata: ${segArrIata}, Ticket arrIata: ${tickArrIata}`);
                    console.log(`  Segment date: ${segDate}, Ticket date: ${tickDate}`);
                    console.log(`  Segment time match: ${segTime}`);

                    const match = (
                        segCarrier === tickCarrier &&
                        segFlightNum === tickFlightNum &&
                        segDepIata === tickDepIata &&
                        segArrIata === tickArrIata &&
                        segDate === tickDate &&
                        segTime
                    );
                    if (match) {
                        console.log('✅ Matched flight segment:', segment, 'with ticket flight:', ticketFlight);
                    } else {
                        console.log('❌ No match for segment:', segment, 'and ticket flight:', ticketFlight);
                    }
                    return match;
                };

                // Duyệt tickets và match với selectedOption's flight (adapt cho chuyến mới)
                tickets.forEach((ticket: any) => {
                    console.log('🔍 Checking ticket:', ticket.ticketNumber, 'status:', ticket.status, 'uniq:', ticket.uniq);
                    const resInfo = ticket.reservationInfo || {};
                    const outboundFlight = resInfo.flights?.outbound;
                    const inboundFlight = resInfo.flights?.inbound;

                    // Lấy leg từ uniq hoặc pricing.seats (đồng bộ với ChiTietMayBay)
                    const uniqParts = (ticket.uniq || '').split('::');
                    const legFromUniq = uniqParts.includes('outbound') ? 'outbound' : uniqParts.includes('inbound') ? 'inbound' : null;
                    const legFromPricing = ticket.pricing?.seats?.[0]?.leg || null;

                    // Build list of legs to check: prefer explicit leg info, fallback to reservationInfo
                    const legsToCheck: Array<'outbound' | 'inbound'> = [];
                    if (legFromPricing) legsToCheck.push(legFromPricing);
                    if (legFromUniq && !legsToCheck.includes(legFromUniq as any)) legsToCheck.push(legFromUniq as any);
                    if (outboundFlight && !legsToCheck.includes('outbound')) legsToCheck.push('outbound');
                    if (inboundFlight && !legsToCheck.includes('inbound')) legsToCheck.push('inbound');

                    // Log thông tin flight từ reservationInfo
                    if (outboundFlight) {
                        console.log(`🔍 [Đổi lịch] Ticket outbound flight:`, outboundFlight.flightNumber, outboundFlight.date, outboundFlight.route);
                    }
                    if (inboundFlight) {
                        console.log(`🔍 [Đổi lịch] Ticket inbound flight:`, inboundFlight.flightNumber, inboundFlight.date, inboundFlight.route);
                    }

                    // For each potential leg, attempt to match với selectedOption's segment
                    legsToCheck.forEach((leg) => {
                        const ticketFlight = leg === 'outbound' ? outboundFlight : inboundFlight;
                        if (!ticketFlight) return;

                        // Match with selectedOffer's segment (for the new flight)
                        const segment = (selectedOffer as any)?.raw?.itineraries?.[0]?.segments?.[selectedLeg === 'outbound' ? 0 : 1];  // 0 for outbound, 1 for inbound if roundtrip
                        const didMatch = segment ? matchFlight(segment, ticketFlight) : false;

                        // Add seats only when matched (for paid/changed tickets)
                        if (didMatch && (ticket.status === 'paid' || ticket.status === 'changed')) {
                            // Ưu tiên ticket.seats (array string, booked seats thực tế)
                            let seatsToAdd: string[] = [];
                            if (Array.isArray(ticket.seats) && ticket.seats.length > 0) {
                                seatsToAdd = ticket.seats;
                            } else {
                                // Fallback: pricing.seats (array object với leg)
                                seatsToAdd = ticket.pricing?.seats?.filter((s: any) => s.leg === leg).map((s: any) => s.number) || [];
                            }

                            // Add to the selectedLeg's bookedSeats (not the ticket's leg)
                            if (selectedLeg === 'outbound') {
                                outboundBooked.push(...seatsToAdd);
                            } else {
                                inboundBooked.push(...seatsToAdd);
                            }
                            console.log(`➕ [MATCHED - ${selectedLeg}] Added seats from ticket ${ticket.ticketNumber} for selected leg ${selectedLeg}:`, seatsToAdd);
                        } else {
                            console.log(`➖ Did not add seats for ticket ${ticket.ticketNumber} leg ${leg} (matched=${didMatch}, status=${ticket.status})`);
                        }
                    });
                });

                // Loại bỏ duplicate seats
                setBookedSeatsByLeg({
                    outbound: [...new Set(outboundBooked)],
                    inbound: [...new Set(inboundBooked)],
                });
            } catch (e) {
                console.warn('Error fetching/matching tickets for booked seats', e);
                setBookedSeatsByLeg({ outbound: [], inbound: [] });
            }
        };

        fetchAndMatchTickets();
    }, [selectedOptionId, booking?.type, options]);


    useEffect(() => {
        async function loadProductOptions() {
            if (!order) { setOptions([]); return; }
            setLoadingOptions(true);
            setOptions([]);
            const Tourbase = process.env.NEXT_PUBLIC_API_BASE || 'https://megatripserver.onrender.com';

            const base = process.env.NEXT_PUBLIC_API_BASE || 'https://megatripserver.onrender.com';
            const item = Array.isArray(order.items) && order.items[0] ? order.items[0] : null;
            const { adults, children, infants, seatCount } = paxCountsFromOrder(order);
            const type = (item?.type || '').toLowerCase();

            const now = new Date();
            const todayIso = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });

            if (type === 'flight') {
                if (!selectedDateLabel) {
                    setOptions([]);
                    return;
                }
                // Sử dụng apiFlights nếu có, else fallback generate
                if (apiFlights.length > 0) {
                    const opts = apiFlights.map(g => ({
                        ...g,
                        time: `${g.departure?.time} - ${g.arrival?.time}` || g.time || '-', // Thêm time từ departure.time
                        labelDate: selectedDateLabel
                    }));
                    setOptions(opts);
                } else {
                    const baseFare = Math.round((order.total || 0) / Math.max(1, adults + children + infants));
                    const d = new Date(selectedDateLabel);
                    const gen = generateOptions(baseFare, d);
                    const opts = gen.map(g => ({ ...g, labelDate: selectedDateLabel }));
                    setOptions(opts);
                }
                return;
            }

            const productId = item?.productId || item?.itemId;
            if (!productId) return setOptions([]);
            try {
                if (type === 'tour') {
                    const r = await fetch(`${Tourbase}/api/tours/${encodeURIComponent(productId)}`);
                    if (!r.ok) throw new Error(String(r.status));
                    const j = await r.json();
                    const tour = j && j.data ? j.data : j;
                    let dates = Array.isArray(tour?.startDates) ? tour.startDates : [];
                    // Filter chỉ giữ ngày > today
                    dates = dates.filter((d: any) => d > todayIso);
                    const adultUnit = Number(tour?.adultPrice ?? tour?.pricing?.perPax?.adultUnit ?? tour?.price ?? 0);
                    const childUnit = Number(tour?.childPrice ?? tour?.pricing?.perPax?.childUnit ?? 0);
                    const infantUnit = Number(tour?.infantPrice ?? tour?.pricing?.perPax?.infantUnit ?? 0);
                    const perPax = { adult: adultUnit, child: childUnit, infant: infantUnit };

                    // fetch slot info for each date in parallel to get accurate availability
                    const dateList = (dates || []).map((d: any) => {
                        try { return new Date(d).toISOString(); } catch { return String(d); }
                    });
                    const slotPromises = dateList.map(async (dtIso: any, idx: number) => {
                        const dateIso = dtIso.split('T')[0];
                        const slotUrl = `${Tourbase}/api/tours/${encodeURIComponent(productId)}/slots/${encodeURIComponent(dateIso)}`;
                        try {
                            const sr = await fetch(slotUrl);
                            if (!sr.ok) return { dateIso, slot: null };
                            const sj = await sr.json();
                            return { dateIso, slot: sj?.slot ?? sj };
                        } catch {
                            return { dateIso, slot: null };
                        }
                    });
                    const slotResults = await Promise.all(slotPromises);

                    const opts = slotResults.map((res: any, idx: number) => {
                        const dateIso = res.dateIso;
                        const time = tour?.time || (new Date(dateList[idx] || dateIso)).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                        // seatsAvailable from slot API else fallback to tour.maxGroupSize or capacity or 0
                        let seatsAvailable = null;
                        if (res.slot) {
                            if (typeof res.slot.available === 'number') seatsAvailable = Number(res.slot.available);
                            else if (typeof res.slot.capacity === 'number' && typeof res.slot.reserved === 'number') seatsAvailable = Math.max(0, Number(res.slot.capacity) - Number(res.slot.reserved));
                        }
                        if (seatsAvailable == null) seatsAvailable = Number(tour?.maxGroupSize ?? tour?.capacity ?? 0);
                        const fareTotal = (adultUnit * adults) + (childUnit * children) + (infantUnit * infants);
                        return {
                            id: `tour-${idx}-${dateIso}`,
                            time,
                            fare: fareTotal,
                            notes: undefined,
                            labelDate: dateIso,
                            seatsAvailable,
                            perPax
                        } as any;
                    }).filter((o: any) => Number(o.seatsAvailable || 0) >= seatCount);
                    console.log('Tour options loaded:', opts.map(o => o.labelDate)); // Debug log
                    setOptions(opts);
                } else if (type === 'bus') {

                    const r = await fetch(`${base}/api/buses/${encodeURIComponent(productId)}`);
                    if (!r.ok) throw new Error(String(r.status));
                    const j = await r.json();
                    const bus = j && j.data ? j.data : j;
                    // let dates = Array.isArray(bus?.departureDates) && bus.departureDates.length ? bus.departureDates : (bus?.departureAt ? [bus.departureAt] : []);
                    let dates = Array.isArray(bus?.departureDates) ? bus.departureDates.map((d: string) => d.split('T')[0]) : (bus?.departureAt ? [bus.departureAt.split('T')[0]] : []);
                    // Filter chỉ giữ ngày > today + 3 days
                    const now = new Date();
                    // dates = dates.filter(d => {
                    //     const depDate = new Date(d);
                    //     const depDateMidnight = new Date(depDate.getFullYear(), depDate.getMonth(), depDate.getDate());
                    //     const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    //     const daysDiff = (depDateMidnight.getTime() - nowMidnight.getTime()) / (1000 * 60 * 60 * 24);
                    //     return daysDiff > 3;
                    // });
                    dates = dates.filter((d: any) => {
                        const depDate = new Date(d + 'T00:00:00'); // assuming d is YYYY-MM-DD
                        const hoursDiff = (depDate.getTime() - now.getTime()) / (1000 * 60 * 60);
                        return hoursDiff >= 24; // Match canChange policy for bus
                    });
                    console.log('dates bus after filter:', dates);

                    const adultUnit = Number(bus?.adultPrice || bus?.price || 0);
                    const childUnit = Number(bus?.childPrice || 0);
                    const infantUnit = 0;

                    // try fetch slot info per date from bus slot endpoint if available
                    const dateList = (dates || []).map((d: any) => {
                        try { return new Date(d).toISOString(); } catch { return String(d); }
                    });
                    const slotPromises = dateList.map(async (dtIso: any) => {
                        const dateIso = dtIso.split('T')[0];
                        const slotUrl = `${base}/api/buses/${encodeURIComponent(productId)}/slots/${encodeURIComponent(dateIso)}`;
                        try {
                            const sr = await fetch(slotUrl);
                            if (!sr.ok) return { dateIso, slot: null };
                            const sj = await sr.json();
                            return { dateIso, slot: sj?.slot ?? sj };
                        } catch {
                            return { dateIso, slot: null };
                        }
                    });
                    const slotResults = await Promise.all(slotPromises);

                    const opts = slotResults.map((res: any, idx: number) => {
                        const dateIso = res.dateIso;
                        const time = bus?.time || (new Date(dateList[idx] || dateIso)).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                        let seatsAvailable = null;
                        if (res.slot) {
                            if (typeof res.slot.available === 'number') seatsAvailable = Number(res.slot.available);
                            else if (typeof res.slot.capacity === 'number' && typeof res.slot.reserved === 'number') seatsAvailable = Math.max(0, Number(res.slot.capacity) - Number(res.slot.reserved));
                        }
                        if (seatsAvailable == null) seatsAvailable = Number(bus?.seatsAvailable ?? bus?.seatsTotal ?? 0);
                        return {
                            id: `bus-${idx}-${dateIso}`,
                            time,
                            fare: adultUnit * (adults + children) + infantUnit * infants,
                            notes: undefined,
                            labelDate: dateIso,
                            seatsAvailable,
                            perPax: { adult: adultUnit, child: childUnit, infant: infantUnit }
                        } as any;
                    }).filter((o: any) => Number(o.seatsAvailable || 0) >= seatCount);
                    console.log('Bus options loaded:', opts.map(o => o.labelDate)); // Debug log
                    setOptions(opts);
                } else {
                    setOptions([]);
                }
            } catch (e) {
                console.warn('load product options failed', e);
                setOptions([]);
            } finally {
                setLoadingOptions(false);
            }
        }
        loadProductOptions();
    }, [order, selectedDate, apiFlights, booking?.type, order?._id]);
    const groupedOptions = useMemo(() => {
        const g: Record<string, Option[]> = {};
        const excludeDate = booking?.serviceDate ?? null;
        const now = new Date();
        const todayIso = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });
        const nowMinutes = now.getHours() * 60 + now.getMinutes();

        for (const o of options) {
            const d = (o as any).labelDate || (o.id.split('-')[2] ?? null);
            console.log('Processing option d:', d, 'todayIso:', todayIso, 'excludeDate:', excludeDate); // Debug log
            if (!d) continue;
            // skip current service date
            if (excludeDate && d === excludeDate) {
                console.log('Skipping excludeDate:', d);
                continue;
            }
            // skip today specifically
            if (d === todayIso) {
                console.log('Skipping today:', d);
                continue;
            }
            // skip past dates
            if (d < todayIso) {
                console.log('Skipping past:', d);
                continue;
            }
            if (!g[d]) g[d] = [];
            g[d].push(o);
        }

        // remove dates that have no remaining options (safety; should not be needed)
        Object.keys(g).forEach(k => { if (!g[k] || g[k].length === 0) delete g[k]; });
        // console.log('Grouped options keys:', Object.keys(g)); // Debug log
        return g;
    }, [options, booking?.serviceDate]);
    // selected date label (YYYY-MM-DD) chosen from right column
    const [selectedDateLabel, setSelectedDateLabel] = useState<string | null>(null);
    // Thêm useEffect để reset selectedOptionId, selectedSeats, selectedSeatFees khi selectedDateLabel thay đổi
    useEffect(() => {
        console.log('selectedDateLabel changed to:', selectedDateLabel, 'resetting selectedOptionId and selectedSeats');
        // setSelectedOptionId('');
        setSelectedSeats([]);
        setSelectedSeatFees(0);
    }, [selectedDateLabel]);

    const optionsForSelectedDate = useMemo(() => {
        if (!selectedDateLabel) return [] as Option[];
        return groupedOptions[selectedDateLabel] ?? [];
    }, [groupedOptions, selectedDateLabel]);

    const canChange = (() => {
        if (booking?.type === 'bus') {
            const snap = order?.metadata?.bookingDataSnapshot || order?.metadata || {};
            const sdRaw = snap?.details?.startDateTime ?? order?.items?.[0]?.travelDate ?? booking?.serviceDate;  // Thêm fallback booking?.serviceDate
            console.log('canChange debug - sdRaw:', sdRaw);
            if (!sdRaw) return false;
            const sd = new Date(sdRaw);
            const now = new Date();
            const hoursDiff = (sd.getTime() - now.getTime()) / (1000 * 60 * 60);
            console.log('canChange debug - sd:', sd, 'now:', now, 'hoursDiff:', hoursDiff);
            return hoursDiff >= 24;
        } else {
            // Tour/flight: >3 ngày
            try {
                const sd = booking?.serviceDate ? new Date(booking.serviceDate) : null;
                if (!sd) return false;
                const today = new Date();
                const t0 = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
                const t1 = Date.UTC(sd.getFullYear(), sd.getMonth(), sd.getDate());
                const days = Math.ceil((t1 - t0) / (1000 * 60 * 60 * 24));
                return typeof days === 'number' ? days > 3 : false;
            } catch {
                return false;
            }
        }
    })();

    // extract service time from order snapshot or parse from booking.details
    // extract service time from order snapshot or parse from booking.details (guarded)
    const serviceTime = (() => {
        const snap = order?.metadata?.bookingDataSnapshot || order?.metadata || {};
        const raw = snap?.details?.startDateTime ?? snap?.details?.startTime ?? snap?.details?.time ?? null;
        if (raw) {
            try {
                const dt = new Date(raw);
                if (!Number.isNaN(dt.getTime())) return dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            } catch { }
        }
        // Cho flight, lấy từ flights.outbound.time nếu có
        if (booking?.type === 'flight') {
            const flights = snap?.flights;
            if (flights?.outbound?.time) {
                return flights.outbound.time;
            }
        }
        // Fallback từ booking.details
        const detailsStr = booking?.details ?? '';
        const m = String(detailsStr).match(/(\d{1,2}:\d{2})/);
        return m ? m[1] : '-';
    })();

    const [assignedSeats, setAssignedSeats] = useState<string[]>([]);
    const [seatMap, setSeatMap] = useState<any[]>([]); // seat objects { seatId, label, status, reservationId, type, pos }
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    const [seatmapLoading, setSeatmapLoading] = useState(false);

    // Clear selected seats & current seatMap when user picks a different date (avoid stale selection)

    // load assigned seats from order (try snapshot -> ticketIds)
    useEffect(() => {
        async function loadAssigned() {
            if (!order) { setAssignedSeats([]); return; }
            try {
                const snap = order?.metadata?.bookingDataSnapshot || order?.metadata || {};
                // snapshot passengers may include seat info
                const paxArr = Array.isArray(snap?.details?.passengers) ? snap.details.passengers : [];
                const seatsFromSnap: string[] = [];
                for (const p of paxArr) {
                    if (p?.seat || p?.seatId) seatsFromSnap.push(String(p.seat || p.seatId));
                }
                if (seatsFromSnap.length) { setAssignedSeats(seatsFromSnap); return; }

                // fallback: fetch tickets by ticketIds if exists
                const tIds = Array.isArray(order?.ticketIds) ? order.ticketIds : [];
                if (tIds.length) {
                    const base = process.env.NEXT_PUBLIC_API_BASE || 'https://megatripserver.onrender.com';
                    const seatList: string[] = [];
                    await Promise.all(tIds.map(async (tid: any) => {
                        try {
                            const id = String(tid && (tid.$oid || tid) || tid);
                            const r = await fetch(`${base}/api/tickets/${encodeURIComponent(id)}`);
                            if (!r.ok) return;
                            const j = await r.json();
                            const tk = j && j.data ? j.data : j;
                            if (Array.isArray(tk?.seats) && tk.seats.length) {
                                for (const s of tk.seats) seatList.push(String(s));
                            } else if (tk?.seat) seatList.push(String(tk.seat));
                        } catch (e) { /* ignore individual failures */ }
                    }));
                    if (seatList.length) { setAssignedSeats(seatList); return; }
                }

                setAssignedSeats([]); // nothing found
            } catch (e) {
                console.warn('loadAssignedSeats failed', e);
                setAssignedSeats([]);
            }
        }
        loadAssigned();
    }, [order]);

    // load seatmap for selected date when booking is bus
    useEffect(() => {
        async function loadSeatMapForDate() {
            // clear only when nothing to load
            if (!selectedDateLabel || !booking || booking.type !== 'bus') {
                setSeatMap([]);
                setSelectedSeats([]);
                return;
            }
            const item = Array.isArray(order?.items) && order.items[0] ? order.items[0] : null;
            const productId = item?.productId || item?.itemId;
            if (!productId) {
                setSeatMap([]);
                setSelectedSeats([]);
                return;
            }
            const base = process.env.NEXT_PUBLIC_API_BASE || 'https://megatripserver.onrender.com';
            try {
                // try slot endpoint first
                const slotUrl = `${base}/api/buses/${encodeURIComponent(productId)}/slots/${encodeURIComponent(selectedDateLabel)}`;
                const r = await fetch(slotUrl);
                if (r.ok) {
                    const j = await r.json();
                    const slot = j?.slot ?? j;
                    // prefer seatmapFill / seatMap / seatmap
                    const sm = slot?.seatmapFill ?? slot?.seatMap ?? slot?.seatmap ?? slot?.seatMapFill ?? null;
                    if (Array.isArray(sm) && sm.length) {
                        setSeatMap(sm.map((s: any) => ({
                            seatId: s.seatId || s.label || s.id || '',
                            label: s.label || s.seatId || '',
                            status: s.status || 'available',
                            reservationId: s.reservationId || s.reservation || null,
                            type: s.type || 'seat',
                            pos: s.pos || null
                        })));
                        return;
                    }
                    // fallback to seatsTotal -> generate placeholders
                    const seatsTotal = Number(slot?.seatsTotal ?? slot?.capacity ?? 0);
                    if (seatsTotal > 0) {
                        const arr = Array.from({ length: seatsTotal }).map((_, i) => ({ seatId: `S${i + 1}`, label: `S${i + 1}`, status: 'available', type: 'seat' }));
                        setSeatMap(arr);
                        return;
                    }
                }
                // fallback: fetch bus entity to derive seatMap
                const br = await fetch(`${base}/api/buses/${encodeURIComponent(productId)}`);
                if (br.ok) {
                    const bj = await br.json();
                    const bus = bj && bj.data ? bj.data : bj;
                    const sm2 = Array.isArray(bus?.seatMap) ? bus.seatMap : [];
                    if (sm2.length) {
                        setSeatMap(sm2.map((s: any) => ({
                            seatId: s.seatId || s.label || '',
                            label: s.label || s.seatId || '',
                            status: s.status || 'available',
                            reservationId: s.reservationId || null,
                            type: s.type || 'seat',
                            pos: s.pos || null
                        })));
                        return;
                    }
                }
                // if nothing found, ensure empty map
                setSeatMap([]);
            } catch (e) {
                console.warn('loadSeatMapForDate failed', e);
                setSeatMap([]);
            }
        }
        loadSeatMapForDate();
        // depend on stable primitive fields to avoid loops caused by object identity changes
    }, [booking?.type, selectedDateLabel, order?.items?.[0]?.productId]);

    // toggle seat selection (only available seats allowed) - limit by seatCount

    function toggleSeat(seatId: string) {
        if (!seatId) return;
        const pc = paxCountsFromOrder(order || ({} as any));
        const max = pc.seatCount;
        const existing = selectedSeats.includes(seatId);
        if (existing) {
            const newSelectedSeats = selectedSeats.filter(s => s !== seatId);
            setSelectedSeats(newSelectedSeats);
            console.log('selectedSeats after toggle (removed):', newSelectedSeats);
            // Nếu bỏ chọn ghế paid, trừ phí
            if (booking?.type === 'flight') {
                const allSeats = flightSeatMap.rows.flatMap((r: any) => r.seats || []);
                const seat = allSeats.find((s: any) => s.id === seatId);
                if (seat) {
                    const charsUp = (seat.characteristics ?? []).map((c: string) => String(c).toUpperCase());
                    const hasCH = charsUp.includes('CH');
                    const explicitPrice = Number(seat.price || 0) > 0;
                    const isPaid = hasCH && explicitPrice;
                    if (isPaid) {
                        setSelectedSeatFees(prev => prev - Number(seat.price || 0));
                    }
                }
            }
            return;
        }
        if (selectedSeats.length >= max) {
            toast({ title: 'Giới hạn chỗ', description: `Bạn chỉ được chọn tối đa ${max} ghế` });
            return;
        }
        // Check availability cho bus
        if (booking?.type === 'bus') {
            const seat = seatMap.find(s => s.seatId === seatId);
            if (seat && seat.status !== 'available') {
                toast({ title: 'Ghế không khả dụng', description: 'Ghế này đã được đặt/không thể chọn' });
                return;
            }
        }
        // Check availability cho flight (bao gồm OCCUPIED từ bookedSeatsByLeg)
        if (booking?.type === 'flight') {
            const allSeats = flightSeatMap.rows.flatMap((r: any) => r.seats || []);
            const seat = allSeats.find((s: any) => s.id === seatId);
            if (seat && seat.availability !== 'AVAILABLE') {
                toast({ title: 'Ghế không khả dụng', description: 'Ghế này đã được đặt/không thể chọn' });
                return;
            }
            // Confirm cho paid seat
            const charsUp = (seat.characteristics ?? []).map((c: string) => String(c).toUpperCase());
            const hasCH = charsUp.includes('CH');
            const explicitPrice = Number(seat.price || 0) > 0;
            const isPaid = hasCH && explicitPrice; // Require BOTH
            if (isPaid) {
                const msgPrice = seat.currency && seat.currency !== 'VND' ? `${seat.price.toLocaleString()} ${seat.currency}` : formatPrice(seat.price);
                const ok = window.confirm(`Ghế ${seat.number} có phí ${msgPrice}. Bạn xác nhận chọn ghế này và chấp nhận trả phí?`);
                if (!ok) return;
                // Cộng phí khi chọn
                setSelectedSeatFees(prev => prev + Number(seat.price || 0));
            }
        }
        const newSelectedSeats = [...selectedSeats, seatId];
        setSelectedSeats(newSelectedSeats);
        console.log('selectedSeats after toggle (added):', newSelectedSeats);
    }


    useEffect(() => {
        // Reset cho bus
        if (!booking || booking.type !== 'bus') return;
        setSelectedSeats((prev) => (prev && prev.length ? [] : prev));
        setSeatMap((prev) => (prev && prev.length ? [] : prev));
        // Reset cho flight
        if ((booking as any).type !== 'flight') {
            setFlightSeatMap({ rows: [], summary: null, amenities: null, freeSeats: [] });
            setSelectedSeats([]);
            setSelectedSeatFees(0);  // Reset phí ghế
        }
    }, [selectedDateLabel, booking?.type]);

    // Load seatmap cho flight khi chọn option
    useEffect(() => {
        async function loadSeatMapForFlight() {
            if (!selectedOptionId || !booking || booking.type !== 'flight') {
                setFlightSeatMap({ rows: [], summary: null, amenities: null, freeSeats: [] });
                setSelectedSeats([]);
                return;
            }

            const selectedOffer = options.find((f: any) => f.id === selectedOptionId);
            if (!selectedOffer || !(selectedOffer as any).raw) {
                setFlightSeatMap({ rows: [], summary: null, amenities: null, freeSeats: [] });
                return;
            }
            setSeatmapLoading(true);

            try {
                const seatmap = await fetchSeatmapForFlight((selectedOffer as any).raw);
                if (seatmap) {
                    const parsed = parseSeatmap(seatmap);
                    // Áp dụng markOccupiedSeats cho leg hiện tại (outbound/inbound dựa trên selectedLeg)
                    const markedRows = markOccupiedSeats(parsed.rows, selectedLeg);
                    setFlightSeatMap({ ...parsed, rows: markedRows });
                } else {
                    setFlightSeatMap({ rows: [], summary: null, amenities: null, freeSeats: [] });
                }
            } catch (err) {
                console.error('Error loading flight seatmap', err);
                setFlightSeatMap({ rows: [], summary: null, amenities: null, freeSeats: [] });
            }
            finally {
                setSeatmapLoading(false);  // Thêm: Kết thúc loading sau khi mark xong
            }
        }
        loadSeatMapForFlight();
    }, [selectedOptionId, booking?.type, options, bookedSeatsByLeg, selectedLeg]);


    if (!booking) {
        return (
            <>
                <div className="container py-6">
                    <Card><CardContent className="p-6">Không tìm thấy đơn hàng.</CardContent></Card>
                </div>
            </>
        );
    }
    return (
        <>
            <div className="container py-6">
                <div style={{ background: 'yellow', padding: '10px', fontSize: '12px' }}>
                    Debug: canChange={String(canChange)}, selectedDateLabel={selectedDateLabel}, selectedOptionId={selectedOptionId}, selectedSeatsLength={selectedSeats.length}
                </div>
                <div className="mb-4">
                    <Button variant="ghost" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-6 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Đổi lịch đặt chỗ</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded bg-primary/10"><ServiceIcon type={booking.type} /></div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold">{booking.title}</h3>
                                            <Badge variant="secondary">{booking.id}</Badge>
                                            <span className="ml-2 text-xs text-muted-foreground rounded px-2 py-0.5 border">{booking.type === 'flight' ? 'Máy bay' : booking.type === 'bus' ? 'Xe' : 'Tour'}</span>
                                        </div>
                                        <div className="text-sm text-muted-foreground">{booking.details}</div>
                                        {/* <div className="text-sm text-muted-foreground">Ngày hiện tại: {booking.serviceDate}</div> */}
                                        <div className="text-sm text-muted-foreground">
                                            <div>Ngày đặt: <span className="font-medium">{booking.bookingDate}</span></div>
                                            <div>Ngày khởi hành: <span className="font-medium">{booking.serviceDate}</span></div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-muted-foreground">Giá hiện tại</div>
                                        <div className="text-xl font-bold text-primary">{formatPrice(order ? Number(order.total || 0) : booking.total)}</div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Left column: Chuyến cũ (top) + Chuyến mới (below) */}
                                    <div className="space-y-6">
                                        {/* Chuyến cũ */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Chuyến cũ</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <div className="font-medium">{booking.title}</div>
                                                        <div className="text-sm text-muted-foreground">{booking.details}</div>
                                                        <div className="text-sm mt-2">Ngày khởi hành: <span className="font-semibold">{booking.serviceDate}</span></div>
                                                        {assignedSeats && assignedSeats.length > 0 && (
                                                            <div className="mt-2 text-sm">
                                                                <div className="font-medium">Ghế đã đặt</div>
                                                                <div className="flex flex-wrap gap-2 mt-1">
                                                                    {assignedSeats.map(s => <span key={s} className="px-2 py-1 rounded border text-sm">{s}</span>)}
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div className="text-sm">Giờ: <span className="font-medium">{serviceTime}</span></div>
                                                        {/* <div className="text-sm">Ngày đặt: <span className="font-medium">{booking.bookingDate}</span></div> */}
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm text-muted-foreground">Tổng hiện tại</div>
                                                        <div className="text-lg font-bold">{formatPrice(order ? Number(order.total || 0) : booking.total)}</div>
                                                    </div>
                                                </div>

                                                <Separator className="my-3" />
                                                {/* passenger breakdown */}
                                                {(() => {
                                                    const pc = paxCountsFromOrder(order || ({} as any));
                                                    return (
                                                        <div className="space-y-1 text-sm">
                                                            <div>Người lớn: <strong>{pc.adults}</strong></div>
                                                            <div>Trẻ em: <strong>{pc.children}</strong></div>
                                                            <div>Em bé: <strong>{pc.infants}</strong></div>
                                                            <div>Loại vé: <strong>{booking.type?.toUpperCase()}</strong></div>
                                                        </div>
                                                    );
                                                })()}
                                            </CardContent>
                                        </Card>

                                        {/* Chuyến mới — format giống chuyến cũ */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Chuyến mới</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <div className="font-medium">{booking.title}</div>
                                                        <div className="text-sm text-muted-foreground">{booking.details}</div>
                                                        <div className="text-sm mt-2">
                                                            Ngày khởi hành: <span className="font-semibold">{selectedDateLabel ?? 'Chưa chọn'}</span>
                                                        </div>
                                                        {selectedSeats && selectedSeats.length > 0 && (
                                                            <div className="mt-2 text-sm">
                                                                <div className="font-medium">Ghế mới chọn</div>
                                                                <div className="flex flex-wrap gap-2 mt-1">
                                                                    {selectedSeats.map(s => <span key={s} className="px-2 py-1 rounded border text-sm">{s}</span>)}
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div className="text-sm">Giờ: <span className="font-medium">{selectedOption ? selectedOption.time : '-'}</span></div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm text-muted-foreground">Tổng chuyến mới <span className='font-bold'>(đã thêm thuế)</span></div>
                                                        <div className="text-lg font-bold">{selectedOption ? formatPrice(newTotal) : <span className="text-muted-foreground">Chưa chọn</span>}</div>
                                                    </div>
                                                </div>

                                                <Separator className="my-3" />
                                                {/* passenger breakdown (same as chuyến cũ) */}
                                                {(() => {
                                                    const pc = paxCountsFromOrder(order || ({} as any));
                                                    return (
                                                        <div className="space-y-1 text-sm">
                                                            <div>Người lớn: <strong>{pc.adults}</strong></div>
                                                            <div>Trẻ em: <strong>{pc.children}</strong></div>
                                                            <div>Em bé: <strong>{pc.infants}</strong></div>
                                                            <div>Loại vé: <strong>{booking.type?.toUpperCase()}</strong></div>
                                                        </div>
                                                    );
                                                })()}
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Right column: chỉ hiển thị các ngày có đủ chỗ để đổi */}
                                    <div>
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Chọn ngày để đổi</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="" style={{ height: '51.6vh', overflow: 'auto' }}>
                                                    {booking.type === 'flight' ? (
                                                        <div className="space-y-4">
                                                            {selectedDateLabel === booking.serviceDate && <div className="text-sm text-red-500">Hãy chọn ngày khởi hành bạn muốn đổi khác với ngày khởi hành khác với chuyến bay của bạn </div>}
                                                            <div className="flex gap-2 items-end">
                                                                <div className="flex-1">
                                                                    <Label htmlFor="flight-date">Chọn ngày đổi lịch</Label>
                                                                    <Input
                                                                        id="flight-date"
                                                                        type="date"
                                                                        value={selectedDateLabel || ''}
                                                                        onChange={(e) => {
                                                                            setSelectedDateLabel(e.target.value);
                                                                            setSelectedOptionId(''); // Reset option khi đổi ngày
                                                                        }}
                                                                        min={new Date().toISOString().split('T')[0]} // Disabled ngày quá khứ
                                                                    />
                                                                </div>
                                                                <Button
                                                                    onClick={() => {
                                                                        const date = (document.getElementById('flight-date') as HTMLInputElement)?.value;
                                                                        if (date) {
                                                                            setSelectedDateLabel(date);
                                                                            setSelectedOptionId(''); // Reset option để trigger load lại
                                                                            // Lấy mã sân bay từ data order
                                                                            const snap = order?.metadata?.bookingDataSnapshot || order?.metadata || {};
                                                                            const flights = snap?.flights;
                                                                            if (flights?.outbound) {
                                                                                const route = flights.outbound.route; // Ví dụ: "HAN → SGN"
                                                                                const [departure, arrival] = route.split(' → ');
                                                                                console.log('Ngày đã chọn:', date);
                                                                                console.log('Mã sân bay đi (Departure):', departure);
                                                                                console.log('Mã sân bay đến (Arrival):', arrival);
                                                                                // Gọi API
                                                                                fetchAmadeusOffersForFlight(departure, arrival, date);
                                                                            }
                                                                        }
                                                                    }}
                                                                    disabled={!selectedDateLabel || selectedDateLabel === booking.serviceDate || isLoading}  // Thêm disabled khi isLoading
                                                                >

                                                                    {isLoading ? "Đang tìm chuyến..." : "Tìm chuyến"}
                                                                </Button>
                                                            </div>
                                                            {selectedDateLabel && (isLoading || optionsForSelectedDate.length > 0) && (  // Thêm isLoading vào điều kiện để hiện section ngay
                                                                <div>
                                                                    <div className="text-sm font-medium mb-2">Chọn giờ khởi hành</div>
                                                                    {isLoading ? (  // Hiện loading khi isLoading
                                                                        <div className="text-sm text-muted-foreground border rounded p-3">Đang tải thông tin chuyến bay...</div>
                                                                    ) : (
                                                                        <RadioGroup value={selectedOptionId} onValueChange={(value) => {
                                                                            console.log('Selected option ID:', value);
                                                                            const selectedOpt = options.find(o => o.id === value);  // Tìm item từ options
                                                                            console.log('Selected option item (full):', selectedOpt);
                                                                            if ((selectedOpt as any)?.raw) {
                                                                                console.log('Selected option raw data for seatmap:', (selectedOpt as any).raw);
                                                                            } else {
                                                                                console.log('No raw data found for selected option');
                                                                            }
                                                                            setSelectedOptionId(value);
                                                                        }}>
                                                                            <div className="space-y-2">
                                                                                {optionsForSelectedDate.map((opt) => (
                                                                                    <label key={opt.id} className="flex items-center justify-between rounded p-2 cursor-pointer">
                                                                                        <div className="flex items-center gap-3">
                                                                                            <RadioGroupItem value={opt.id} />
                                                                                            <div>
                                                                                                <div className="font-medium flex items-center gap-2"><Clock className="h-4 w-4" /> {(opt as any).departure.time}</div>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="text-right">
                                                                                            <div className="text-sm">Phí mới {formatPrice((opt as any).price)}</div>
                                                                                        </div>
                                                                                    </label>
                                                                                ))}
                                                                            </div>
                                                                        </RadioGroup>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {selectedDateLabel && optionsForSelectedDate.length === 0 && !loadingOptions && (
                                                                <div className="text-sm text-muted-foreground border rounded p-3">Không có chuyến phù hợp cho ngày này.</div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        // Code hiện tại cho tour/bus
                                                        <>
                                                            {optionsForSelectedDate.length > 0 && (
                                                                <>
                                                                    <div className="text-sm font-medium mb-2">Bạn đã chọn</div>
                                                                    <RadioGroup value={selectedOptionId} onValueChange={setSelectedOptionId}>
                                                                        <div className="space-y-2">
                                                                            {optionsForSelectedDate.map((opt) => {
                                                                                const pc = paxCountsFromOrder(order || ({} as any));
                                                                                const perPax = (opt as any).perPax || null;
                                                                                const previewTotal = perPax
                                                                                    ? (Number(perPax.adult || 0) * pc.adults) + (Number(perPax.child || 0) * pc.children) + (Number(perPax.infant || 0) * pc.infants)
                                                                                    : (Number(opt.fare || 0) * Math.max(1, (pc.adults + pc.children + pc.infants)));
                                                                                return (
                                                                                    <label key={opt.id} className={`flex items-center justify-between rounded p-2 cursor-pointer`}>
                                                                                        <div className="flex items-center gap-3">
                                                                                            <RadioGroupItem value={opt.id} />
                                                                                            <div>
                                                                                                <div className="font-medium flex items-center gap-2"><Clock className="h-4 w-4" /> {opt.time}</div>
                                                                                                {(opt as any).labelDate && <div className="text-xs text-muted-foreground">Ngày {(opt as any).labelDate}</div>}
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="text-right">
                                                                                            <div className="text-sm">Phí mới <span className='font-bold'>(chưa kèm thuế)</span>{formatPrice(previewTotal)}</div>
                                                                                            {booking?.type !== 'bus' && typeof (opt as any).seatsAvailable !== 'undefined' && <div className="text-xs">{(opt as any).seatsAvailable} chỗ</div>}
                                                                                        </div>
                                                                                    </label>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </RadioGroup>
                                                                </>
                                                            )}
                                                            <Separator className="my-3" />
                                                            <div className="text-sm text-muted-foreground mb-3">Chỉ hiển thị ngày còn đủ chỗ theo số khách của đơn</div>
                                                            <div className="space-y-2">
                                                                {loadingOptions ? (
                                                                    <div className="text-sm text-muted-foreground border rounded p-3">Đang tải danh sách ngày, xin đợi...</div>
                                                                ) : Object.keys(groupedOptions).length ? (
                                                                    Object.keys(groupedOptions).sort().map((date) => {
                                                                        const opts = groupedOptions[date];
                                                                        const seats = (opts[0] as any)?.seatsAvailable ?? '-';
                                                                        const selected = selectedDateLabel === date;
                                                                        return (
                                                                            <button
                                                                                key={date}
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    setSelectedDateLabel(date);
                                                                                    if (opts && opts.length) setSelectedOptionId(opts[0].id);
                                                                                }}
                                                                                className={`w-full flex items-center justify-between p-3 rounded border transition ${selected ? 'border-2 border-[hsl(var(--primary))] bg-primary/10' : 'hover:bg-[hsl(var(--primary))/0.03]'}`}
                                                                            >
                                                                                <div>
                                                                                    <div className="font-medium">{date}</div>
                                                                                </div>
                                                                                <div className="text-right">
                                                                                    {booking?.type !== 'bus' && <div className="text-sm">{seats} chỗ</div>}
                                                                                </div>
                                                                            </button>
                                                                        );
                                                                    })
                                                                ) : (
                                                                    <div className="text-sm text-muted-foreground border rounded p-3">Không có ngày phù hợp hoặc hết chỗ.</div>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>

                                <div className=" ">
                                    <div className="mb-5">

                                        <label className="flex items-center gap-2 text-sm mb-2 sm:mb-0  ">
                                            <input type="checkbox" checked={ackChecked} onChange={(e) => setAckChecked(e.target.checked)} className="w-4 h-4" />
                                            <span>Bạn đã đọc chính sách và vẫn muốn đổi lịch?</span>
                                        </label>
                                    </div>
                                    <div className="flex gap-2">

                                        <Button variant="outline" onClick={() => router.back()}>Hủy</Button>
                                        <Button onClick={handleConfirm}
                                            // disabled={!canChange || !selectedDateLabel || !selectedOption || ((booking.type === 'flight' || booking.type === 'bus') && selectedSeats.length === 0)}
                                            disabled={!canChange || !selectedDateLabel || !selectedOptionId || ((booking.type === 'flight' || booking.type === 'bus') && selectedSeats.length === 0)}
                                        >
                                            <Ticket className="h-4 w-4 mr-1" />
                                            Xác nhận đổi lịch
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    {/* Right column: Tóm tắt chi phí */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Tóm tắt chi phí</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span>Giá hiện tại</span>
                                    <span className="font-medium">{formatPrice(order ? Number(order.total || 0) : booking.total)}</span>
                                </div>
                                {selectedOption ? (
                                    <>
                                        <div className="flex items-center justify-between text-sm">
                                            <span>Giá chuyến mới</span>
                                            <span className="font-medium">{formatPrice(newTotal)}</span>
                                        </div>
                                        {selectedSeatFees > 0 && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span>Phí ghế đã chọn (đã cộng vào giá chuyến mới )</span>
                                                <span className="font-medium text-orange-600">{formatPrice(selectedSeatFees)}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between text-sm">
                                            <span>Chênh lệch giá</span>
                                            <span className={fareDiff >= 0 ? 'font-medium text-orange-600' : 'font-medium text-green-600'}>
                                                {fareDiff >= 0 ? '+' : '-'}{formatPrice(Math.abs(fareDiff))}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span>Phạt theo chính sách ({Math.round(penaltyPercent * 100)}%)</span>
                                            <span className="font-medium text-red-600">{formatPrice(penaltyAmount)}</span>
                                        </div>
                                        {/* <div className="flex items-center justify-between text-sm">
            <span>Phí đổi lịch (tham khảo)</span>
            <span className="font-medium">{formatPrice(changeFeePerPax)}</span>
        </div> */}
                                        <Separator />
                                        {extraPay > 0 ? (
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium">Thanh toán thêm</span>
                                                <span className="text-lg font-bold text-primary">{formatPrice(extraPay)}</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium">Hoàn lại</span>
                                                <span className="text-lg font-bold text-green-600">{formatPrice(refundBack)}</span>
                                            </div>
                                        )}

                                    </>
                                ) : (
                                    <div className="text-sm text-muted-foreground">Chưa chọn chuyến mới để hiển thị tóm tắt.</div>
                                )}
                                <div className="text-md text-muted-foreground mt-3">
                                    <strong>Chính sách đổi lịch</strong><br />
                                    {booking?.type === 'bus' ? (
                                        <>
                                            - Đổi ≥ 72 giờ trước giờ khởi hành: phí 50.000đ / khách<br />
                                            - Đổi 24 – 72 giờ trước: phí 50.000đ / khách + 25% giá vé<br />
                                            - Đổi &lt; 24 giờ: không cho đổi
                                        </>
                                    ) : (
                                        <>
                                            - Trên 5 ngày: 30% giá trị tour<br />
                                            - Từ 5 ngày trước: 50% giá trị tour<br />
                                            - 3 ngày trước: 100% giá trị tour
                                        </>
                                    )}
                                </div>

                            </CardContent>
                        </Card>
                        {booking.type === 'bus' && selectedDateLabel && seatMap.length > 0 && (
                            <>
                                <Separator className="my-3" />
                                <div className="text-sm font-medium mb-2">Sơ đồ ghế ({selectedDateLabel})</div>
                                <div className="grid grid-cols-6 gap-2">
                                    {seatMap.map((s) => {
                                        const id = s.seatId || s.label;
                                        const isBooked = s.status !== 'available';
                                        const isSelected = selectedSeats.includes(id);


                                        return (
                                            <button
                                                type="button"
                                                key={id}
                                                onClick={() => toggleSeat(id)}
                                                disabled={isBooked && !isSelected}
                                                className={`text-xs p-2 rounded border flex items-center justify-center ${isBooked ? 'bg-red-100 text-red-800 cursor-not-allowed' : isSelected ? 'bg-primary/10 border-[hsl(var(--primary))]' : 'hover:bg-slate-50'}`}
                                            >
                                                <div className="text-center">
                                                    <div className="font-medium">{s.label || id}</div>
                                                    <div className="text-[10px] text-muted-foreground">{s.type || ''}</div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="text-xs text-muted-foreground mt-2">Chọn tối đa {paxCountsFromOrder(order).seatCount} ghế. Ghế đỏ đã bị đặt.</div>
                            </>
                        )}
                        {booking.type === 'flight' && selectedDateLabel && flightSeatMap.rows.length > 0 && (
                            <>
                                {/* Lưu ý mới */}
                                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">  {/* Giữ nguyên text-xs cho lưu ý */}
                                    <div className="font-bold mb-1">⚠️ Lưu ý khi đổi lịch</div>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Chỗ ngồi đã thanh toán ở chuyến bay cũ sẽ không được hoàn lại.</li>
                                        <li>Bạn cần chọn lại ghế cho chuyến bay mới.</li>
                                        <li>Nếu chọn ghế miễn phí, bạn sẽ không bị thu thêm.</li>
                                    </ul>
                                </div>
                                <Separator className="my-3" />
                                <div className="text-sm font-medium mb-2">Sơ đồ ghế ({selectedDateLabel})</div>

                                {seatmapLoading ? (  // Thêm: Loading khi load seatmap
                                    <div className="text-sm text-muted-foreground border rounded p-3">Đang tải sơ đồ ghế...</div>
                                ) : (
                                    <div className="shadow-lg rounded-2xl bg-white p-5">
                                        {/* Header */}
                                        <div className="mb-4">
                                            <h2 className="text-sm font-semibold flex items-center gap-2">  {/* Giảm từ text-lg xuống text-sm */}
                                                🪑 Sơ đồ chỗ ngồi
                                            </h2>
                                        </div>

                                        {/* Empty state */}
                                        {flightSeatMap.rows.length === 0 && (
                                            <div className="text-center text-gray-500 text-xs py-6 border rounded-xl">  {/* Giảm từ text-sm xuống text-xs */}
                                                Không có dữ liệu sơ đồ ghế
                                            </div>
                                        )}

                                        {/* Cockpit */}
                                        <div className="flex justify-center mb-3">
                                            <div className="bg-gray-800 text-white text-[10px] font-semibold px-5 py-1.5 rounded-t-xl shadow-inner">  {/* Giảm từ text-xs xuống text-[10px] */}
                                                ✈ Buồng lái
                                            </div>
                                        </div>

                                        {/* Seat map */}
                                        <div className="overflow-x-auto">

                                            <div className="space-y-3 flex flex-col items-center min-w-max">
                                                {flightSeatMap.rows.map((row: any) => {
                                                    const letters = ['A', 'B', 'C', '_aisle', 'D', 'E', 'F', '_aisle', 'G', 'H', 'K'];
                                                    // Map seats by letter for quick lookup
                                                    const seatMap: Record<string, any> = {};
                                                    row.seats.forEach((s: any) => {
                                                        const letter = String(s.number || '').replace(/^\d+/, '') || '';
                                                        seatMap[letter] = s;
                                                    });

                                                    // Detect if any seat in this row will render a top price badge (CH + explicit price)
                                                    const rowHasTopBadge = row.seats.some((s: any) => {
                                                        const charsUp = (s.characteristics ?? []).map((c: string) => String(c).toUpperCase());
                                                        const hasCH = charsUp.includes('CH');
                                                        const explicitPrice = Number(s.price || 0) > 0;
                                                        return hasCH && explicitPrice;
                                                    });

                                                    return (
                                                        // Added conditional padding-top when rowHasTopBadge to avoid price badge overlap
                                                        <div key={row.row} className={`grid grid-cols-[44px_repeat(11,44px)] items-center gap-2 relative ${rowHasTopBadge ? 'pt-4' : ''}`}>
                                                            {/* Row number column */}
                                                            <div className="w-11 text-center font-bold text-xs">{row.row}</div>  {/* Giảm từ text-sm xuống text-xs */}

                                                            {/* Seats + aisles columns */}
                                                            {letters.map((col: string, idx) => {
                                                                if (col === '_aisle') {
                                                                    return (
                                                                        <div key={idx} className="w-11 h-11 flex items-center justify-center">
                                                                            <div className="w-4 h-11 bg-gray-100 border border-gray-300 rounded text-[10px] flex items-center justify-center text-gray-500">  {/* Giảm từ text-xs xuống text-[10px] */}
                                                                                |
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                }

                                                                const s = seatMap[col];
                                                                if (!s) {
                                                                    // Empty seat placeholder (align grid)
                                                                    return <div key={idx} className="w-11 h-11" />;
                                                                }

                                                                const isSelected = selectedSeats.includes(s.id);
                                                                const unavailable = s.availability !== 'AVAILABLE';

                                                                // Detect paid seats: MUST have "CH" AND a numeric price (parsed to s.price)
                                                                const charsUp = (s.characteristics ?? []).map((c: string) => String(c).toUpperCase());
                                                                const hasCH = charsUp.includes('CH');
                                                                const explicitPrice = Number(s.price || 0) > 0;
                                                                const isPaid = hasCH && explicitPrice; // Require BOTH
                                                                const isFree = !isPaid && Number(s.price || 0) === 0;

                                                                // Determine seat type badge
                                                                let seatType = 'M';
                                                                if (charsUp.includes('EXIT') || charsUp.includes('EXIT_ROW')) seatType = 'EX';
                                                                else if (charsUp.includes('GALLEY') || charsUp.includes('GAL')) seatType = 'GAL';
                                                                else if (charsUp.includes('AISLE') || ['C', 'D', 'F', 'G'].includes(col)) seatType = 'A';
                                                                else if (charsUp.includes('WINDOW') || ['A', 'K', 'F'].includes(col)) seatType = 'W';

                                                                const baseUnavailable = 'bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed';
                                                                const baseSelected = 'bg-[hsl(var(--primary))] text-white shadow-md';
                                                                const baseFree = 'bg-white border border-gray-300 hover:bg-gray-50 cursor-pointer';
                                                                const baseOccupied = 'bg-red-200 text-red-400 border border-red-300 cursor-not-allowed';
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
                                                                            title={`${s.number} • ${seatType.toUpperCase()} • ${s.availability}${s.price ? ` • ${s.currency} ${s.price.toLocaleString()}` : isFree ? ' • Miễn phí' : ''}`}
                                                                            onClick={() => toggleSeat(s.id)}
                                                                            className={`${base} w-11 h-11 rounded-md text-[10px] flex flex-col items-center justify-center transition-all duration-150 relative`}
                                                                        >
                                                                            <span className="font-semibold text-[10px]">{s.number}</span>
                                                                            {!isFree && s.price > 0 && s.availability === 'AVAILABLE' && (
                                                                                <span className="text-[8px] text-yellow-700 mt-0.5"></span>
                                                                            )}
                                                                        </button>

                                                                        {(hasCH && explicitPrice) && s.availability === 'AVAILABLE' && (
                                                                            <div className="absolute -top-2 -right-2 bg-yellow-100 text-[8px] px-1 rounded border border-yellow-200 whitespace-nowrap z-10">  {/* Giảm từ text-[10px] xuống text-[8px] */}
                                                                                {s.currency && s.currency !== 'VND'
                                                                                    ? `${s.price.toLocaleString()} ${s.currency}`
                                                                                    : formatPrice(s.price)}
                                                                            </div>
                                                                        )}

                                                                        {seatType && s.availability === 'AVAILABLE' && (
                                                                            <div className="absolute -bottom-3 left-0 text-[8px] text-gray-500">  {/* Giảm từ text-[10px] xuống text-[8px] */}
                                                                                <span className="inline-block px-0.5 py-0.5 bg-gray-100 rounded font-medium text-[8px]">  {/* Giảm px, py, và thêm text-[8px] */}
                                                                                    {seatTypeLabel[seatType] ?? seatType}
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}

                                                            {/* Exit indicator for certain rows (if any seat has EXIT char) */}
                                                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                                                {row.seats.some((s: any) => (s.characteristics ?? []).some((c: string) => /EXIT/i.test(String(c)))) && (
                                                                    <div className="bg-red-100 text-red-700 text-[8px] px-1 py-0.5 rounded border border-red-200">  {/* Giảm từ text-[10px] xuống text-[8px] */}
                                                                        EXIT
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Legend */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[10px] text-gray-600 mt-6">  {/* Giảm từ text-xs xuống text-[10px] */}
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded bg-[hsl(var(--primary))] border border-[hsl(var(--primary))]"></div>
                                                <div>Đang chọn</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded border bg-white border-gray-300"></div>
                                                <div>Ghế trống (AVAILABLE)</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded bg-yellow-50 border border-yellow-400 flex items-center justify-center text-[8px]"></div>  {/* Giảm text-[10px] xuống text-[8px] */}
                                                <div>Ghế trả phí (CH hoặc có giá)</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded bg-gray-200 border border-gray-300"></div>
                                                <div>Không khả dụng / Đã đặt</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded border bg-white flex items-center justify-center text-[8px]">W</div>  {/* Giảm text-[10px] xuống text-[8px] */}
                                                <div>Cửa sổ (Window)</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded border bg-white flex items-center justify-center text-[8px]">A</div>  {/* Giảm text-[10px] xuống text-[8px] */}
                                                <div>Hàng lối (Aisle)</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded border bg-white flex items-center justify-center text-[8px]">EX</div>  {/* Giảm text-[10px] xuống text-[8px] */}
                                                <div>Cửa thoát hiểm</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded border bg-white flex items-center justify-center text-[8px]">GAL</div>  {/* Giảm text-[10px] xuống text-[8px] */}
                                                <div>Galley</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded bg-red-200 border border-red-300"></div>
                                                <div>Ghế đã đặt (Occupied)</div>
                                            </div>
                                        </div>

                                        <p className="text-[10px] text-gray-500 mt-2">  {/* Giảm từ text-xs xuống text-[10px] */}
                                            Ghế miễn phí sẽ tự gán nếu còn đủ cho {(() => { const pc = paxCountsFromOrder(order); return pc.adults + pc.children; })()} khách. (em bé sẽ ngồi cùng người lớn)
                                        </p>
                                    </div>
                                )}

                            </>
                        )}
                    </div>


                </div>
            </div>



            {/* Payment dialog */}
            {/* Payment dialog with overlay and explicit bg */}
            <Dialog open={payOpen} onOpenChange={(open) => setPayOpen(open)}>
                {/* overlay */}
                {payOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" aria-hidden="true" />}
                <DialogContent className="z-[70] bg-white dark:bg-slate-900 rounded-md shadow-lg">
                    <DialogHeader>
                        <DialogTitle>Thanh toán đổi lịch</DialogTitle>
                        <DialogDescription>Việc đổi lịch này chỉ được thực hiện 1 lần và không được hoàn tiền nhé!</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Old trip summary */}
                        <div className="text-sm">
                            <div className="font-medium mb-2">Chuyến cũ</div>
                            <div className="mb-1">{booking.title}</div>
                            <div className="text-muted-foreground text-sm mb-1">{booking.details}</div>
                            <div className="text-sm">Ngày : <span className="font-medium">{booking.serviceDate}</span> — Giờ : <span className="font-medium">{serviceTime}</span></div>

                            <div className="text-sm">Giá hiện tại: <span className="font-medium">{formatPrice(order ? Number(order.total || 0) : booking.total)}</span></div>
                        </div>

                        <Separator />

                        {/* New trip summary */}
                        <div className="text-sm">
                            <div className="font-medium mb-2">Chuyến mới</div>
                            <div className="mb-1">{booking.title}</div>
                            <div className="text-muted-foreground text-sm mb-1">{booking.details}</div>
                            <div className="text-sm">Ngày: <span className="font-medium">{selectedDateLabel ?? '-'}</span> — Giờ: <span className="font-medium">{selectedOption ? selectedOption.time : '-'}</span></div>
                            {selectedSeats && selectedSeats.length > 0 && <div className="text-sm">Ghế: <span className="font-medium">{selectedSeats.join(', ')}</span></div>}
                            <div className="text-sm mt-2">Giá chuyến mới: <span className="font-medium">{selectedOption ? formatPrice(newTotal) : '-'}</span></div>
                            <div className="text-sm">Số tiền cần thanh toán: <span className="text-primary font-bold">{formatPrice(Math.max(0, extraPay))}</span></div>
                            <div className="text-xs text-muted-foreground font-bold mt-1">Lưu ý: chi phí hiển thị đã bao gồm phạt theo chính sách .</div>
                        </div>

                        <Separator />

                        {/* Payment method */}
                        <div>
                            <div className="text-sm font-medium mb-2">Chọn phương thức thanh toán</div>
                            <RadioGroup value={payMethod} onValueChange={(v) => setPayMethod(v as any)}>
                                <div className="flex gap-4 items-center">
                                    <label className="flex items-center gap-2">
                                        <RadioGroupItem value="zalopay" />
                                        <span>ZaloPay</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <RadioGroupItem value="momo" />
                                        <span>MoMo</span>
                                    </label>
                                </div>
                            </RadioGroup>
                        </div>

                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={payAckConfirmed} onChange={(e) => setPayAckConfirmed(e.target.checked)} className="w-4 h-4" />
                            <span>Tôi xác nhận đã kiểm tra thông tin và đồng ý thanh toán cho việc đổi lịch (không hoàn lại)</span>
                        </label>

                        <div className="text-xs text-muted-foreground font-bold">
                            Đơn hàng sẽ được cập nhật và vé sẽ được gửi lại cho khách sau khi thanh toán được hoàn tất.
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPayOpen(false)}>Hủy</Button>
                        <Button onClick={handlePay} disabled={!payAckConfirmed}>Thanh toán</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}