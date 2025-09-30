"use client"
import { useMemo, useState } from 'react';
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
import { ArrowLeft, CalendarDays, Clock, Plane, Ticket, TrendingUp, ChevronRight } from 'lucide-react';

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
        status: 'completed',
        bookingDate: '2024-11-20',
        serviceDate: '2024-12-05',
        title: 'Tour Đà Nẵng - Hội An 3N2Đ',
        details: 'Khách sạn 4* • 4 khách',
        passengers: 4,
        total: 15960000,
    },
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

export default function DoiLichPage() {
    const booking = useBookingFromRoute();
    const router = useRouter();

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => {
        if (!booking) return undefined;
        const d = new Date(booking.serviceDate + 'T00:00:00');
        d.setDate(d.getDate() + 1);
        return d;
    });
    const [selectedOptionId, setSelectedOptionId] = useState<string>('');
    const [otpOpen, setOtpOpen] = useState(false);
    const [otp, setOtp] = useState('');

    const canChange = booking && booking.status === 'confirmed';
    const options = useMemo(() => {
        if (!booking || !selectedDate) return [] as Option[];
        return generateOptions(booking.total, selectedDate);
    }, [booking, selectedDate]);
    const selectedOption = options.find((o) => o.id === selectedOptionId);
    const changeFeePerPax = 100000;
    const fareDiff = selectedOption ? selectedOption.fare - (booking?.total ?? 0) : 0;
    const extraPay = selectedOption ? Math.max(0, fareDiff) + changeFeePerPax * (booking?.passengers ?? 1) : 0;
    const refundBack = selectedOption ? Math.max(0, -(fareDiff)) : 0;

    function saveRequest() {
        if (!booking || !selectedDate || !selectedOption) return '';
        const id = 'RQ-' + Date.now();
        const req = {
            id, type: 'change', bookingId: booking.id, title: booking.title, status: 'submitted', createdAt: new Date().toISOString(),
            extraPay: extraPay > 0 ? extraPay : -refundBack,
            details: { newDate: selectedDate.toISOString().slice(0, 10), time: selectedOption.time, changeFeePerPax, passengers: booking.passengers, fareDiff },
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

    const handleConfirm = () => { if (!booking || !selectedDate || !selectedOption) return; setOtp(''); setOtpOpen(true); };

    const confirmOtp = () => {
        if (otp.trim().length !== 6) { toast({ title: 'Mã OTP chưa hợp lệ', description: 'Nhập đủ 6 số để xác nhận' }); return; }
        const rid = saveRequest();
        toast({ title: 'Đã gửi yêu cầu đổi lịch', description: `Mã yêu cầu ${rid}` });
        if (typeof window !== 'undefined') window.history.replaceState({ activeTab: 'requests' }, '');
        router.push('/tai-khoan');
    };

    if (!booking) {
        return (
            <Layout>
                <div className="container py-6">
                    <Card><CardContent className="p-6">Không tìm thấy đơn hàng.</CardContent></Card>
                </div>
            </Layout>
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
                                    <div className="p-2 rounded bg-primary/10"><Plane className="h-4 w-4" /></div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold">{booking.title}</h3>
                                            <Badge variant="secondary">{booking.id}</Badge>
                                        </div>
                                        <div className="text-sm text-muted-foreground">{booking.details}</div>
                                        <div className="text-sm text-muted-foreground">Ngày hiện tại: {booking.serviceDate}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-muted-foreground">Giá hiện tại</div>
                                        <div className="text-xl font-bold text-primary">{formatPrice(booking.total)}</div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label className="mb-2 block">Chọn ngày mới</Label>
                                        <div className="rounded border p-2">
                                            <Calendar
                                                mode="single"
                                                selected={selectedDate}
                                                onSelect={(d) => setSelectedDate(d)}
                                                disabled={(d) => {
                                                    const today = new Date();
                                                    today.setHours(0, 0, 0, 0);
                                                    return d < today;
                                                }}
                                                initialFocus
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="mb-2 block">Chọn chuyến/giờ</Label>
                                        {selectedDate ? (
                                            <RadioGroup value={selectedOptionId} onValueChange={setSelectedOptionId}>
                                                <div className="space-y-2">
                                                    {options.map((opt) => (
                                                        <label key={opt.id} className="flex items-center justify-between border rounded p-3 cursor-pointer">
                                                            <div className="flex items-center gap-3">
                                                                <RadioGroupItem value={opt.id} />
                                                                <div>
                                                                    <div className="font-medium flex items-center gap-2">
                                                                        <Clock className="h-4 w-4" /> {opt.time}
                                                                        {opt.notes && (
                                                                            <span className="text-xs text-muted-foreground">• {opt.notes}</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-xs text-muted-foreground">Ngày {selectedDate.toLocaleDateString('vi-VN')}</div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-sm">{formatPrice(opt.fare)}</div>
                                                                {opt.fare > booking.total && (
                                                                    <div className="text-xs text-orange-600 flex items-center gap-1 justify-end"><TrendingUp className="h-3 w-3" /> +{formatPrice(opt.fare - booking.total)}</div>
                                                                )}
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </RadioGroup>
                                        ) : (
                                            <div className="text-sm text-muted-foreground border rounded p-3">Vui lòng chọn ngày để xem chuyến phù hợp.</div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => router.back()}>Hủy</Button>
                                    <Button onClick={handleConfirm} disabled={!canChange || !selectedDate || !selectedOption}>
                                        <Ticket className="h-4 w-4 mr-1" />
                                        Xác nhận đổi lịch
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Tóm tắt chi phí</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span>Giá hiện tại</span>
                                    <span className="font-medium">{formatPrice(booking.total)}</span>
                                </div>
                                {selectedOption && (
                                    <>
                                        <div className="flex items-center justify-between text-sm">
                                            <span>Giá chuyến mới</span>
                                            <span className="font-medium">{formatPrice(selectedOption.fare)}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span>Chênh lệch giá</span>
                                            <span className={fareDiff >= 0 ? 'font-medium text-orange-600' : 'font-medium text-green-600'}>
                                                {fareDiff >= 0 ? '+' : '-'}{formatPrice(Math.abs(fareDiff))}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span>Phí đổi lịch</span>
                                            <span className="font-medium">{formatPrice(changeFeePerPax * booking.passengers)}</span>
                                        </div>
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
                                )}
                                {!canChange && (
                                    <div className="text-sm text-muted-foreground">Chỉ có thể đổi lịch với đơn đã xác nhận.</div>
                                )}
                                <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                    <CalendarDays className="h-3 w-3" />
                                    Có thể đổi lịch trước giờ khởi hành, tùy theo quy định của nhà cung cấp.
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* OTP Dialog */}
            <Dialog open={otpOpen} onOpenChange={setOtpOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xác minh OTP</DialogTitle>
                        <DialogDescription>Nhập mã 6 số đã gửi tới email/SMS để xác nhận đổi lịch.</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-6 gap-2">
                        {Array.from({ length: 6 }).map((_, idx) => (
                            <Input
                                key={idx}
                                inputMode="numeric"
                                value={otp[idx] || ''}
                                onChange={(e) => {
                                    const v = e.target.value.replace(/[^0-9]/g, '').slice(-1);
                                    const arr = otp.split('');
                                    arr[idx] = v;
                                    const next = arr.join('');
                                    setOtp(next);
                                }}
                                className="text-center text-lg"
                                maxLength={1}
                            />
                        ))}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOtpOpen(false)}>Hủy</Button>
                        <Button onClick={confirmOtp}>
                            Xác nhận
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}