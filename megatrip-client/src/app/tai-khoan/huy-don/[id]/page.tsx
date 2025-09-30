"use client"
import { useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { Separator } from '../../../components/ui/separator';
import { Input } from '../../../components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/dialog';
import { AlertTriangle, ArrowLeft, CreditCard, DollarSign, FileText, Info, Plane, ChevronRight } from 'lucide-react';
import { toast } from '../../../components/ui/use-toast';

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
    {
        id: 'TRV123456787',
        type: 'bus',
        status: 'cancelled',
        bookingDate: '2024-10-15',
        serviceDate: '2024-10-20',
        title: 'Xe TP.HCM - Đà Lạt',
        details: 'Giường nằm VIP • 22:30',
        passengers: 2,
        total: 700000,
    },
];

function formatPrice(v: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);
}

function ServiceIcon({ type }: { type: Booking['type'] }) {
    if (type === 'flight') return <Plane className="h-4 w-4" />;
    if (type === 'bus') return <FileText className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
}

const AIRLINE_POLICIES = {
    VN: { name: 'Vietnam Airlines', tiers: [{ minDays: 7, feeRate: 0.05 }, { minDays: 3, feeRate: 0.2 }, { minDays: 0, feeRate: 0.5 }], nonRefundableTaxPerPax: 50000, platformFee: 15000 },
    VJ: { name: 'VietJet Air', tiers: [{ minDays: 7, feeRate: 0.1 }, { minDays: 3, feeRate: 0.3 }, { minDays: 0, feeRate: 0.6 }], nonRefundableTaxPerPax: 60000, platformFee: 20000 },
    QH: { name: 'Bamboo Airways', tiers: [{ minDays: 7, feeRate: 0.08 }, { minDays: 3, feeRate: 0.25 }, { minDays: 0, feeRate: 0.55 }], nonRefundableTaxPerPax: 50000, platformFee: 15000 },
};

function useBookingFromRoute(): Booking | null {
    const params = useParams() as any;
    const id = params?.id as string | undefined;
    return SAMPLE_BOOKINGS.find((b) => b.id === id) ?? null;
}

export default function HuyDonPage() {
    const booking = useBookingFromRoute();
    const router = useRouter();

    const [reason, setReason] = useState('');
    const [note, setNote] = useState('');
    const [refundMethod, setRefundMethod] = useState('');
    const [agreePolicy, setAgreePolicy] = useState(false);
    const [bankName, setBankName] = useState('');
    const [bankAccountName, setBankAccountName] = useState('');
    const [bankAccountNumber, setBankAccountNumber] = useState('');
    const [cardLast4, setCardLast4] = useState('');
    const [walletId, setWalletId] = useState('');
    const [otpOpen, setOtpOpen] = useState(false);
    const [otp, setOtp] = useState('');

    const airlineCode = useMemo(() => {
        if (!booking || booking.type !== 'flight') return 'GEN';
        const m = booking.details.match(/^([A-Z]{2})\d+/);
        return m?.[1] ?? 'GEN';
    }, [booking]);

    const policy = useMemo(() => {
        if (!booking) return { canCancel: false, message: 'Không tìm thấy đơn hàng.' } as const;
        if (booking.status !== 'confirmed') return { canCancel: false, message: 'Chỉ hủy được đơn đã xác nhận.' } as const;
        const today = new Date();
        const service = new Date(booking.serviceDate + 'T00:00:00');
        if (service <= today) return { canCancel: false, message: 'Đơn đã qua ngày sử dụng.' } as const;
        const diffDays = Math.ceil((service.getTime() - today.getTime()) / (24 * 3600 * 1000));

        const airlinePolicy = (AIRLINE_POLICIES as any)[airlineCode] ?? { name: 'Nhà vận chuyển', tiers: [{ minDays: 7, feeRate: 0.08 }, { minDays: 3, feeRate: 0.25 }, { minDays: 0, feeRate: 0.55 }], nonRefundableTaxPerPax: 50000, platformFee: 15000 };
        const tier = airlinePolicy.tiers.find((t: any) => diffDays >= t.minDays) ?? airlinePolicy.tiers[airlinePolicy.tiers.length - 1];

        return { canCancel: true, diffDays, airlinePolicy, tier } as const;
    }, [booking, airlineCode]);

    const breakdown = useMemo(() => {
        if (!booking || !(policy as any).canCancel) return null;
        const paxCount = booking.passengers;
        const baseAmount = booking.total;
        const tierRate = (policy as any).tier.feeRate as number;
        const airlinePenalty = Math.round(baseAmount * tierRate);
        const taxes = ((policy as any).airlinePolicy.nonRefundableTaxPerPax as number) * paxCount;
        const platformFee = (policy as any).airlinePolicy.platformFee as number;
        const totalFees = airlinePenalty + taxes + platformFee;
        const refund = Math.max(0, baseAmount - totalFees);
        return { paxCount, baseAmount, airlinePenalty, taxes, platformFee, refund, tierRate };
    }, [booking, policy]);

    if (!booking) {
        return (
            <Layout>
                <div className="container py-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 text-red-600">
                                <AlertTriangle className="h-4 w-4" />
                                <span>Không tìm thấy đơn hàng.</span>
                            </div>
                            <Button className="mt-4" asChild>
                                <Link href="/tai-khoan">Quay lại tài khoản</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </Layout>
        );
    }

    const validMethod = useMemo(() => {
        if (!refundMethod) return false;
        if (refundMethod === 'bank') return !!(bankName && bankAccountName && bankAccountNumber);
        if (refundMethod === 'card') return !!(cardLast4.length === 4);
        if (refundMethod === 'wallet') return !!walletId;
        return false;
    }, [refundMethod, bankName, bankAccountName, bankAccountNumber, cardLast4, walletId]);

    function saveRequest() {
        const id = 'RQ-' + Date.now();
        const req = {
            id,
            type: 'refund',
            bookingId: booking.id,
            title: booking.title,
            status: 'submitted',
            createdAt: new Date().toISOString(),
            amountRefund: breakdown?.refund || 0,
            method: refundMethod === 'wallet' ? `Ví (${walletId})` : refundMethod === 'card' ? `Thẻ **** ${cardLast4}` : refundMethod === 'bank' ? `Ngân hàng ${bankName}` : undefined,
            details: {
                airline: (policy as any).airlinePolicy?.name,
                tierRate: breakdown?.tierRate,
                airlinePenalty: breakdown?.airlinePenalty,
                taxes: breakdown?.taxes,
                platformFee: breakdown?.platformFee,
                note,
                reason,
            },
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

    const startOtpFlow = () => {
        setOtp('');
        setOtpOpen(true);
    };

    const confirmOtp = () => {
        if (otp.trim().length !== 6) {
            toast({ title: 'Mã OTP chưa hợp lệ', description: 'Nhập đủ 6 số để xác nhận' });
            return;
        }
        const rid = saveRequest();
        toast({ title: 'Đã gửi yêu cầu hủy', description: `Mã yêu cầu ${rid}` });
        // set history state so TaiKhoan page can pick activeTab
        if (typeof window !== 'undefined') window.history.replaceState({ activeTab: 'requests' }, '');
        router.push('/tai-khoan');
    };

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
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Hủy đơn & Hoàn tiền</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded bg-primary/10">
                                        <ServiceIcon type={booking.type} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold">{booking.title}</h3>
                                            <Badge variant="secondary">{booking.id}</Badge>
                                        </div>
                                        <div className="text-sm text-muted-foreground">{booking.details}</div>
                                        <div className="text-sm text-muted-foreground">Ngày sử dụng: {booking.serviceDate}</div>
                                        <div className="text-sm text-muted-foreground">Số khách: {booking.passengers}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-muted-foreground">Tổng tiền</div>
                                        <div className="text-xl font-bold text-primary">{formatPrice(booking.total)}</div>
                                    </div>
                                </div>
                                <Separator />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Lý do hủy</Label>
                                        <Select value={reason} onValueChange={setReason}>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Chọn lý do" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="change-plan">Thay đổi kế hoạch</SelectItem>
                                                <SelectItem value="illness">Sức khỏe không đảm bảo</SelectItem>
                                                <SelectItem value="schedule">Không phù hợp thời gian</SelectItem>
                                                <SelectItem value="document">Thiếu giấy tờ</SelectItem>
                                                <SelectItem value="other">Lý do khác</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Phương thức nhận tiền</Label>
                                        <Select value={refundMethod} onValueChange={setRefundMethod}>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Chọn phương thức" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="wallet">Ví Travel</SelectItem>
                                                <SelectItem value="card">Thẻ đã thanh toán</SelectItem>
                                                <SelectItem value="bank">Chuyển khoản ngân hàng</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {refundMethod === 'bank' && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div>
                                            <Label>Ngân hàng</Label>
                                            <Input className="mt-1" value={bankName} onChange={(e) => setBankName(e.target.value)} />
                                        </div>
                                        <div>
                                            <Label>Chủ tài khoản</Label>
                                            <Input className="mt-1" value={bankAccountName} onChange={(e) => setBankAccountName(e.target.value)} />
                                        </div>
                                        <div>
                                            <Label>Số tài khoản</Label>
                                            <Input className="mt-1" value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} />
                                        </div>
                                    </div>
                                )}
                                {refundMethod === 'card' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <Label>4 số cuối thẻ đã thanh toán</Label>
                                            <Input className="mt-1" value={cardLast4} onChange={(e) => setCardLast4(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))} placeholder="1234" />
                                        </div>
                                    </div>
                                )}
                                {refundMethod === 'wallet' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <Label>ID ví/Email/SĐT ví</Label>
                                            <Input className="mt-1" value={walletId} onChange={(e) => setWalletId(e.target.value)} />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <Label>Ghi chú</Label>
                                    <Textarea className="mt-1" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi rõ thông tin nếu cần bổ sung" />
                                </div>

                                <div className="p-3 rounded border bg-amber-50 text-amber-900 flex items-start gap-2">
                                    <Info className="h-4 w-4 mt-0.5" />
                                    <div className="text-sm">
                                        <div className="font-medium">Chính sách hoàn tiền theo nhà vận chuyển</div>
                                        {(policy as any).canCancel ? (
                                            <>
                                                <div className="mt-1">Nhà vận chuyển: {(policy as any).airlinePolicy.name} • Còn {(policy as any).diffDays} ngày đến ngày sử dụng</div>
                                                <div className="mt-2">
                                                    <div className="text-xs font-medium">Bảng phí</div>
                                                    <ul className="list-disc ml-4 mt-1 space-y-1">
                                                        {((policy as any).airlinePolicy.tiers as { minDays: number; feeRate: number }[]).map((t: any, idx: number) => (
                                                            <li key={idx}>
                                                                ≥ {t.minDays} ngày trước giờ bay: Phí {Math.round(t.feeRate * 100)}%
                                                                {t.feeRate === (policy as any).tier.feeRate && <span className="ml-1 text-[11px] px-1 py-0.5 rounded bg-amber-200 text-amber-900">Áp dụng</span>}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    <div className="text-xs mt-1">Thuế/Phí không hoàn: {formatPrice((policy as any).airlinePolicy.nonRefundableTaxPerPax)} mỗi hành khách • Phí nền tảng: {formatPrice((policy as any).airlinePolicy.platformFee)}</div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="mt-1">{(policy as any).message}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input id="agree" type="checkbox" className="h-4 w-4" checked={agreePolicy} onChange={(e) => setAgreePolicy(e.target.checked)} />
                                    <Label htmlFor="agree" className="text-sm">Tôi đã đọc và đồng ý với chính sách hủy/hoàn tiền</Label>
                                </div>

                                <div className="flex gap-2">
                                    <Button onClick={() => router.back()} variant="outline">Hủy</Button>
                                    <Button onClick={startOtpFlow} disabled={!(policy as any).canCancel || !reason || !refundMethod || !agreePolicy || !breakdown || !validMethod}>
                                        <DollarSign className="h-4 w-4 mr-1" />
                                        Xác nhận hủy đơn
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Tóm tắt hoàn tiền</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span>Số hành khách</span>
                                    <span className="font-medium">{booking.passengers}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span>Tổng giá áp dụng</span>
                                    <span className="font-medium">{formatPrice(breakdown?.baseAmount ?? booking.total)}</span>
                                </div>
                                {(policy as any).canCancel && breakdown && (
                                    <>
                                        <div className="flex items-center justify-between text-sm">
                                            <span>Phí phạt hãng ({Math.round(breakdown.tierRate * 100)}%)</span>
                                            <span className="font-medium text-red-600">- {formatPrice(breakdown.airlinePenalty)}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span>Thuế/Phí không hoàn</span>
                                            <span className="font-medium text-red-600">- {formatPrice(breakdown.taxes)}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span>Phí nền tảng</span>
                                            <span className="font-medium text-red-600">- {formatPrice(breakdown.platformFee)}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">Hoàn dự kiến</span>
                                            <span className="text-lg font-bold text-green-600">{formatPrice(breakdown.refund)}</span>
                                        </div>
                                        {refundMethod && (
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <CreditCard className="h-3 w-3" />
                                                Phương thức: {refundMethod === 'wallet' ? `Ví (${walletId || 'chưa nhập'})` : refundMethod === 'card' ? `Thẻ **** ${cardLast4 || '----'}` : bankName ? `Ngân hàng ${bankName}` : 'Ngân hàng'}
                                            </div>
                                        )}
                                    </>
                                )}
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
                        <DialogDescription>Nhập mã 6 số đã gửi tới email/SMS để xác nhận hủy đơn.</DialogDescription>
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