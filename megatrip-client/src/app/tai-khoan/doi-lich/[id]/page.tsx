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
    // const booking = useBookingFromRoute();
    const params = useParams() as any;
    const routeId = params?.id as string | undefined;
    const router = useRouter();

    // real order loaded from server (fallback to SAMPLE_BOOKINGS for dev)
    const [order, setOrder] = useState<any | null>(null);
    const [loadingOrder, setLoadingOrder] = useState(false);
    useEffect(() => {
        if (!routeId) return;
        let mounted = true;
        (async () => {
            setLoadingOrder(true);
            try {
                const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:7700';
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
    const [payMethod, setPayMethod] = useState<'momo' | 'zalopay'>('momo');
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
    useEffect(() => {
        async function loadProductOptions() {
            if (!order) { setOptions([]); return; }
            setLoadingOptions(true);
            const Tourbase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';

            const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:7700';
            const item = Array.isArray(order.items) && order.items[0] ? order.items[0] : null;
            const { adults, children, infants, seatCount } = paxCountsFromOrder(order);
            const type = (item?.type || '').toLowerCase();

            if (type === 'flight') {
                const baseFare = Math.round((order.total || 0) / Math.max(1, adults + children + infants));
                const dates: Date[] = [];
                const start = selectedDate || new Date();
                for (let i = 0; i < 7; i++) dates.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
                const opts: Option[] = [];
                for (const d of dates) {
                    const gen = generateOptions(baseFare, d);
                    for (const g of gen) opts.push({ ...g });
                }
                setOptions(opts);
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
                    const dates = Array.isArray(tour?.startDates) ? tour.startDates : [];
                    const adultUnit = Number(tour?.adultPrice ?? tour?.pricing?.perPax?.adultUnit ?? tour?.price ?? 0);
                    const childUnit = Number(tour?.childPrice ?? tour?.pricing?.perPax?.childUnit ?? 0);
                    const infantUnit = Number(tour?.infantPrice ?? tour?.pricing?.perPax?.infantUnit ?? 0);
                    const perPax = { adult: adultUnit, child: childUnit, infant: infantUnit };

                    // fetch slot info for each date in parallel to get accurate availability
                    const dateList = (dates || []).map((d: any) => {
                        try { return new Date(d).toISOString(); } catch { return String(d); }
                    });
                    const slotPromises = dateList.map(async (dtIso, idx) => {
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
                    setOptions(opts);
                } else if (type === 'bus') {
                    const r = await fetch(`${base}/api/buses/${encodeURIComponent(productId)}`);
                    if (!r.ok) throw new Error(String(r.status));
                    const j = await r.json();
                    const bus = j && j.data ? j.data : j;
                    const dates = Array.isArray(bus?.departureDates) && bus.departureDates.length ? bus.departureDates : (bus?.departureAt ? [bus.departureAt] : []);
                    const adultUnit = Number(bus?.adultPrice || bus?.price || 0);
                    const childUnit = Number(bus?.childPrice || 0);
                    const infantUnit = 0;

                    // try fetch slot info per date from bus slot endpoint if available
                    const dateList = (dates || []).map((d: any) => {
                        try { return new Date(d).toISOString(); } catch { return String(d); }
                    });
                    const slotPromises = dateList.map(async (dtIso) => {
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
    }, [order, selectedDate]);


    // recompute totals when selection or order/options change
    useEffect(() => {
        if (!order) { setNewTotal(0); setFareDiff(0); setExtraPay(0); setRefundBack(0); return; }
        const { adults, children, infants } = paxCountsFromOrder(order);
        // compute new total base (sum of pax * unit) then add proportional tax from original order
        let computedNewTotalBase = 0;
        if (selectedOption && (selectedOption as any).perPax) {
            const pp = (selectedOption as any).perPax;
            computedNewTotalBase = (Number(pp.adult || 0) * adults) + (Number(pp.child || 0) * children) + (Number(pp.infant || 0) * infants);
        } else if (selectedOption) {
            const totalPax = adults + children + infants;
            computedNewTotalBase = Number(selectedOption.fare || 0) * Math.max(1, totalPax);
        } else {
            computedNewTotalBase = 0;
        }
        // original order base & tax (prefer snapshot pricing)
        const origBase = Number(order?.metadata?.bookingDataSnapshot?.pricing?.basePrice ?? order?.subtotal ?? (order?.total ? (Number(order.total || 0) - Number(order.tax || 0)) : 0));
        const origTax = Number(order?.metadata?.bookingDataSnapshot?.pricing?.taxes ?? order?.tax ?? 0);
        const computedNewTax = origBase > 0 ? Math.round(origTax * (computedNewTotalBase / Math.max(1, origBase))) : origTax;
        const computedNewTotal = computedNewTotalBase + computedNewTax;
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
    }, [order, selectedOption, options]);

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
        setPayMethod('momo');
        setPayOpen(true);
    };

    // final payment handler (simulated): save request + attach payment info, then navigate
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
        const ORDERS_API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:7700';

        try {
            const requestBody: any = {
                newDate: selectedDateLabel,
                newTime: selectedOption.time,
                selectedOption: selectedOption,
                passengers: booking.passengers,
                changeFeePerPax: changeFeePerPax,
                fareDiff: fareDiff,
                totalpayforChange: extraPay
            };

            // Nếu là bus, thêm selectedSeats
            if (booking.type === 'bus') {
                requestBody.selectedSeats = selectedSeats;
            }
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
                throw new Error(errorData.error || 'Failed to update change calendar');
            }
            const responseData = await changeResponse.json();
            const { codeChange, amountDue, refund } = responseData;
            if (!codeChange || typeof amountDue !== 'number') {
                throw new Error('Invalid response from change calendar API');
            }

            // Nếu không cần thanh toán (amountDue <= 0), hiển thị thông tin hoàn tiền và navigate
            if (amountDue <= 0) {
                const refundAmount = Math.abs(amountDue) || refund || 0; // Sử dụng refund nếu có
                const id = saveRequest();
                toast({
                    title: 'Yêu cầu lưu',
                    description: refundAmount > 0 ? `Không cần thanh toán. Sẽ hoàn lại ${formatPrice(refundAmount)}. Mã yêu cầu ${id}` : `Không cần thanh toán. Mã yêu cầu ${id}`
                });
                setPayOpen(false);
                router.push('/tai-khoan'); // Navigate nhất quán
                return;
            }

            // Tiếp tục logic thanh toán với amountDue từ server
            const changeCode = codeChange;

            // Build payment payloads per gateway (dùng amountDue thay vì extraPay)
            if (payMethod === 'momo') {
                const resp = await fetch(`${PAYMENT_BASE}/momo/payment`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderId: changeCode,
                        amount: Math.max(0, Math.round(amountDue)), // Dùng amountDue từ server
                        orderInfo: `Thanh toán đổi lịch - ${order.orderNumber || ''}`,
                        orderDescription: `${booking.title} — ${selectedDateLabel} ${selectedOption?.time ?? ''}`,
                        extraData: JSON.stringify({ originalOrder: order.orderNumber, changeCode })
                    })
                });
                const data = await resp.json();
                const url = data?.payUrl || data?.shortLink || data?.payUrl;
                if (url) {
                    window.location.href = url;
                    return;
                } else {
                    throw new Error('MoMo tạo payment không trả về URL');
                }
            } else if (payMethod === 'zalopay') {
                const resp = await fetch(`${PAYMENT_BASE}/zalo/payment`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: Math.max(0, Math.round(amountDue)), // Dùng amountDue từ server
                        description: `Thanh toán đổi lịch ${order.orderNumber || ''}`,
                        orderId: changeCode,
                        app_user: order.customerEmail || 'guest',
                        callback_url: `${ORDERS_API}/api/payment/callback/zalo`,
                        embed_data: { orderNumber: changeCode, originalOrder: order.orderNumber }
                    })
                });
                const data = await resp.json();
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
            console.error('Payment init failed', err);
            toast({ title: 'Lỗi thanh toán', description: String(err?.message || err) });
            return;
        }
    }
    // Map server Order shape -> booking summary used by this page
    function mapOrderToBooking(order: any): Booking {
        if (!order) return null as any;
        const item = Array.isArray(order.items) && order.items[0] ? order.items[0] : null;
        const snapshot = order?.metadata?.bookingDataSnapshot || order?.metadata || {};
        // determine service date
        const serviceRaw = snapshot?.details?.startDateTime ?? snapshot?.details?.date ?? item?.travelDate ?? order?.createdAt;
        let serviceDate = '';
        try { serviceDate = new Date(serviceRaw).toISOString().slice(0, 10); } catch { serviceDate = String(serviceRaw || '').slice(0, 10); }
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
    // use loaded order -> map to booking shape for display; fallback to SAMPLE_BOOKINGS if order not found
    const booking = order ? (mapOrderToBooking(order)) : (routeId ? null : useBookingFromRoute());
    const groupedOptions = useMemo(() => {
        const g: Record<string, Option[]> = {};
        const excludeDate = booking?.serviceDate ?? null;
        const now = new Date();
        const todayIso = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().slice(0, 10);
        const nowMinutes = now.getHours() * 60 + now.getMinutes();

        for (const o of options) {
            const d = (o as any).labelDate || (o.id.split('-')[2] ?? null);
            if (!d) continue;
            // skip current service date
            if (excludeDate && d === excludeDate) continue;
            // skip past dates
            if (d < todayIso) continue;

            // if date is today, drop options that are already departed (compare HH:mm)
            if (d === todayIso) {
                const timeStr = String((o as any).time || '').trim();
                const m = timeStr.match(/^(\d{1,2}):(\d{2})$/);
                if (m) {
                    const hh = Number(m[1]);
                    const mm = Number(m[2]);
                    if (!Number.isNaN(hh) && !Number.isNaN(mm)) {
                        const optMinutes = hh * 60 + mm;
                        if (optMinutes <= nowMinutes) {
                            // this option already departed — skip it
                            continue;
                        }
                    }
                }
                // if no parsable time, keep the option (can't decide)
            }

            if (!g[d]) g[d] = [];
            g[d].push(o);
        }

        // remove dates that have no remaining options (safety; should not be needed)
        Object.keys(g).forEach(k => { if (!g[k] || g[k].length === 0) delete g[k]; });
        return g;
    }, [options, booking?.serviceDate]);
    // selected date label (YYYY-MM-DD) chosen from right column
    const [selectedDateLabel, setSelectedDateLabel] = useState<string | null>(null);
    const optionsForSelectedDate = useMemo(() => {
        if (!selectedDateLabel) return [] as Option[];
        return groupedOptions[selectedDateLabel] ?? [];
    }, [groupedOptions, selectedDateLabel]);

    const canChange = (() => {
        if (booking?.type === 'bus') {
            // Cho bus: >=24 giờ
            const sdRaw = order?.metadata?.bookingDataSnapshot?.details?.startDateTime ?? order?.metadata?.bookingDataSnapshot?.details?.date ?? booking?.serviceDate ?? order?.createdAt;
            if (sdRaw) {
                const sd = new Date(sdRaw);
                const now = new Date();
                const hoursDiff = (sd.getTime() - now.getTime()) / (1000 * 60 * 60);
                return hoursDiff >= 24;
            }
            return false;
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
        // booking may be null — guard before accessing details
        const detailsStr = booking?.details ?? '';
        const m = String(detailsStr).match(/(\d{1,2}:\d{2})/);
        return m ? m[1] : '-';
    })();

    const [assignedSeats, setAssignedSeats] = useState<string[]>([]);
    const [seatMap, setSeatMap] = useState<any[]>([]); // seat objects { seatId, label, status, reservationId, type, pos }
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    // Clear selected seats & current seatMap when user picks a different date (avoid stale selection)
    useEffect(() => {
        // only for bus bookings — no-op for others
        if (!booking || booking.type !== 'bus') return;
        // when selectedDateLabel changes reset selections before loading new map
        setSelectedSeats((prev) => (prev && prev.length ? [] : prev));
        setSeatMap((prev) => (prev && prev.length ? [] : prev));
    }, [selectedDateLabel, booking?.type]);
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
                    const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:7700';
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
            const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:7700';
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
            setSelectedSeats(selectedSeats.filter(s => s !== seatId));
            return;
        }
        if (selectedSeats.length >= max) {
            toast({ title: 'Giới hạn chỗ', description: `Bạn chỉ được chọn tối đa ${max} ghế` });
            return;
        }
        // ensure seat exists and available
        const seat = seatMap.find(s => s.seatId === seatId);
        if (seat && seat.status !== 'available') {
            toast({ title: 'Ghế không khả dụng', description: 'Ghế này đã được đặt/không thể chọn' });
            return;
        }
        setSelectedSeats([...selectedSeats, seatId]);
    }
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


                                                    {/* If a date selected, show available times for that date (optional) */}
                                                    {optionsForSelectedDate.length > 0 && (
                                                        <>
                                                            <div className="text-sm font-medium mb-2">Bạn đã chọn </div>
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
                                                                                    <div className="text-sm">Phí mới  <span className='font-bold'>(chưa kèm thuế)</span>{formatPrice(previewTotal)}</div>
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
                                                                // pick seatsAvailable from first option of that date
                                                                const opts = groupedOptions[date];
                                                                const seats = opts[0]?.seatsAvailable ?? '-';
                                                                const selected = selectedDateLabel === date;
                                                                return (
                                                                    <button
                                                                        key={date}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setSelectedDateLabel(date);
                                                                            // auto-select first time option for chosen date
                                                                            if (opts && opts.length) setSelectedOptionId(opts[0].id);
                                                                        }}
                                                                        className={`w-full flex items-center justify-between p-3 rounded border transition ${selected ? 'border-2 border-[hsl(var(--primary))] bg-primary/10' : 'hover:bg-[hsl(var(--primary))/0.03]'}`}
                                                                    >
                                                                        <div>
                                                                            <div className="font-medium">{date}</div>
                                                                            {/* <div className="text-xs text-muted-foreground">Chọn ngày</div> */}
                                                                        </div>
                                                                        <div className="text-right">
                                                                            {/* hide seat count for bus orders */}
                                                                            {booking?.type !== 'bus' && <div className="text-sm">{seats} chỗ</div>}
                                                                        </div>
                                                                    </button>
                                                                );
                                                            })
                                                        ) : (
                                                            <div className="text-sm text-muted-foreground border rounded p-3">Không có ngày phù hợp hoặc hết chỗ.</div>
                                                        )}
                                                    </div>
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
                                            disabled={!canChange || !selectedDateLabel || !selectedOption}
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
                                        <RadioGroupItem value="momo" />
                                        <span>MoMo</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <RadioGroupItem value="zalopay" />
                                        <span>ZaloPay</span>
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