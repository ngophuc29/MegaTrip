"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Separator } from '../components/ui/separator';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
    CreditCard,
    Shield,
    AlertCircle,
    ChevronLeft,
    Info,
    Lock,
    CheckCircle,
    Smartphone,
    Building,
    FileText,
    Clock,
    Plane,
    Users,
    Calendar,
    MapPin,
    ChevronDown,
    SeparatorVertical, // added icon for collapse
} from 'lucide-react';

// Khai báo mảng phương thức thanh toán
const paymentMethods = [
    {
        id: 'credit_card',
        name: 'Thẻ tín dụng/ghi nợ',
        description: 'Visa, Mastercard, JCB',
        icon: CreditCard,
        fee: 0,
        instant: true,
    },
    {
        id: 'atm',
        name: 'ATM nội địa',
        description: 'Internet Banking',
        icon: Building,
        fee: 0,
        instant: true,
    },
    {
        id: 'vnpay',
        name: 'VNPay',
        description: 'Ví điện tử VNPay',
        icon: Smartphone,
        fee: 0,
        instant: true,
    },
    {
        id: 'momo',
        name: 'MoMo',
        description: 'Ví điện tử MoMo',
        icon: Smartphone,
        fee: 0,
        instant: true,
    },
    {
        id: 'zalopay',
        name: 'ZaloPay',
        description: 'Ví điện tử ZaloPay',
        icon: Smartphone,
        fee: 0,
        instant: true,
    },
    {
        id: 'bank_transfer',
        name: 'Chuyển khoản ngân hàng',
        description: 'Xác nhận trong 15 phút',
        icon: Building,
        fee: 0,
        instant: false,
    },
];

// Lấy bookingData: ưu tiên bookingKey từ query (sessionStorage), sau đó fallback sang params/localStorage hoặc demo
const getBookingData = (searchParams: URLSearchParams) => {
    // 1) nếu bookingKey (session-stored full payload)
    const bookingKey = searchParams.get('bookingKey');
    if (bookingKey && typeof window !== 'undefined') {
        const raw = sessionStorage.getItem(bookingKey);
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                // keep original key info if present
                return parsed;
            } catch { /* ignore */ }
        }
    }

    // 2) Ưu tiên các param rút gọn (legacy behavior)
    const type = searchParams.get('type');
    if (type) {
        if (type === 'tour') {
            return {
                type: 'tour',
                details: {
                    route: searchParams.get('route') || '',
                    date: searchParams.get('date') || '',
                    time: searchParams.get('time') || '',
                },
                pricing: {
                    basePrice: Number(searchParams.get('basePrice')) || 0,
                    taxes: Number(searchParams.get('taxes')) || 0,
                    addOns: Number(searchParams.get('addOns')) || 0,
                    discount: Number(searchParams.get('discount')) || 0,
                    total: Number(searchParams.get('total')) || 0,
                }
            };
        }
        if (type === 'bus') {
            return {
                type: 'bus',
                details: {
                    route: searchParams.get('route') || '',
                    date: searchParams.get('date') || '',
                    time: searchParams.get('time') || '',
                },
                pricing: {
                    basePrice: Number(searchParams.get('basePrice')) || 0,
                    taxes: Number(searchParams.get('taxes')) || 0,
                    addOns: Number(searchParams.get('addOns')) || 0,
                    discount: Number(searchParams.get('discount')) || 0,
                    total: Number(searchParams.get('total')) || 0,
                }
            };
        }
    }

    // 3) fallback: try localStorage bookingData (older flow)
    if (typeof window !== 'undefined') {
        const stored = window.localStorage.getItem('bookingData');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch {}
        }
    }

    // 4) mẫu
    return {
        type: 'flight',
        details: {
            flightNumber: 'VN1546',
            route: 'TP.HCM → Hà Nội',
            date: '15/01/2025',
            time: '06:15 - 08:30',
            airline: 'Vietnam Airlines',
            passengers: 1,
            class: 'Phổ thông',
        },
        pricing: {
            basePrice: 1990000,
            taxes: 290000,
            addOns: 150000,
            discount: -200000,
            total: 2230000,
        }
    };
};

// Nhận số lượng khách từ param hoặc localStorage
const getInitialPassengers = (searchParams: URLSearchParams) => {
    let adults = 1, children = 0, infants = 0;
    if (searchParams.get('adults')) adults = Number(searchParams.get('adults'));
    if (searchParams.get('children')) children = Number(searchParams.get('children'));
    if (searchParams.get('infants')) infants = Number(searchParams.get('infants'));
    // Nếu không có param thì lấy từ localStorage
    if (!searchParams.get('adults') && typeof window !== 'undefined') {
        const stored = window.localStorage.getItem('participants');
        if (stored) {
            try {
                const p = JSON.parse(stored);
                adults = p.adults || adults;
                children = p.children || children;
                infants = p.infants || infants;
            } catch {}
        }
    }
    const arr = [];
    for (let i = 0; i < adults; i++) {
        arr.push({ type: 'adult', title: 'Mr', firstName: '', lastName: '', dateOfBirth: '', nationality: 'VN', idNumber: '', idType: 'cccd' });
    }
    for (let i = 0; i < children; i++) {
        arr.push({ type: 'child', firstName: '', lastName: '', dateOfBirth: '', nationality: 'VN', idNumber: '', idType: 'cccd' });
    }
    for (let i = 0; i < infants; i++) {
        arr.push({ type: 'infant', firstName: '', lastName: '', dateOfBirth: '', nationality: 'VN', idNumber: '', idType: 'cccd' });
    }
    return arr;
};

export default function ThanhToan() {
    const router = useRouter();
    const searchParams = useSearchParams();
    // remember bookingKey param so we can re-save payload to sessionStorage if user edits data
    const initialBookingKey = typeof searchParams?.get === 'function' ? searchParams.get('bookingKey') : null;
    const [bookingKey, setBookingKey] = useState<string | null>(initialBookingKey ?? null);
    // don't compute bookingData from storage during render — load on client after mount to avoid SSR/CSR mismatch
    const [bookingData, setBookingData] = useState<any>(null);
    // bookingType default; will be adjusted after bookingData is loaded
    const [bookingType, setBookingType] = useState<'flight' | 'bus' | 'tour'>('flight');
    // mounted guard to ensure server/client initial render match, then hydrate with real data
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // load bookingData on client (reads session/local storage safely)
    useEffect(() => {
        try {
            const data = getBookingData(searchParams as unknown as URLSearchParams);
            setBookingData(data);
            setBookingType(data?.flight ? 'flight' : (data?.type ?? 'flight'));
        } catch (e) { /* ignore */ }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    // Normalized view of booking payload: support both legacy bookingData.details and new booking.flight shape
    const normalizedDetails = bookingData ? (bookingData?.flight ?? bookingData?.details ?? {}) : {};
    const normalizedPricing = bookingData ? (bookingData?.pricing ?? bookingData?.pricingEstimate ?? bookingData?.price ?? {}) : {};

    // keep bookingType in sync if bookingData changes (e.g. loaded from sessionStorage)
    useEffect(() => {
        setBookingType(bookingData?.flight ? 'flight' : (bookingData?.type ?? 'flight'));
    }, [bookingData]);

    // Reload bookingData if query/search params change (e.g. new bookingKey)
    useEffect(() => {
        try {
            const refreshed = getBookingData(searchParams as unknown as URLSearchParams);
            // only update if different reference (avoid extra renders)
            if (JSON.stringify(refreshed) !== JSON.stringify(bookingData)) {
                setBookingData(refreshed);
            }
        } catch (e) { /* ignore */ }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const [currentStep, setCurrentStep] = useState(1);
    const [selectedPayment, setSelectedPayment] = useState('credit_card');
    const [needInvoice, setNeedInvoice] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);

    // New: toggle states for showing details
    const [showFareDetails, setShowFareDetails] = useState(false);
    const [showAddonsDetails, setShowAddonsDetails] = useState(false);

    const [contactInfo, setContactInfo] = useState({
        email: '',
        phone: '',
        fullName: '',
    });

    // Validation errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateEmail = (e: string) => /\S+@\S+\.\S+/.test(e);
    const validatePhone = (p: string) => /^\+?\d{7,15}$/.test(p.replace(/\s+/g, ''));

    const validateStep = (step: number) => {
        const next: Record<string, string> = {};
        if (step === 1) {
            if (!contactInfo.fullName || contactInfo.fullName.trim().length < 2) next['contact.fullName'] = 'Vui lòng nhập họ và tên';
            if (!contactInfo.email || !validateEmail(contactInfo.email)) next['contact.email'] = 'Vui lòng nhập email hợp lệ';
            if (!contactInfo.phone || !validatePhone(contactInfo.phone)) next['contact.phone'] = 'Vui lòng nhập số điện thoại hợp lệ';
            passengers.forEach((p, i) => {
                if (!p.firstName || !p.firstName.trim()) next[`passenger.${i}.firstName`] = 'Bắt buộc';
                if (!p.lastName || !p.lastName.trim()) next[`passenger.${i}.lastName`] = 'Bắt buộc';
                if (!p.dateOfBirth) next[`passenger.${i}.dateOfBirth`] = 'Bắt buộc';
                if (!p.idNumber || !p.idNumber.trim()) next[`passenger.${i}.idNumber`] = 'Bắt buộc';
            });
        }
        if (step === 2) {
            if (selectedPayment === 'credit_card') {
                if (!paymentInfo.cardNumber || paymentInfo.cardNumber.replace(/\s+/g, '').length < 12) next['payment.cardNumber'] = 'Số thẻ không hợp lệ';
                if (!paymentInfo.cardHolder || paymentInfo.cardHolder.trim().length < 2) next['payment.cardHolder'] = 'Tên chủ thẻ bắt buộc';
                if (!paymentInfo.expiryDate || !/^\d{2}\/?\d{2}$/.test(paymentInfo.expiryDate)) next['payment.expiryDate'] = 'MM/YY';
                if (!paymentInfo.cvv || !/^\d{3,4}$/.test(paymentInfo.cvv)) next['payment.cvv'] = 'CVV 3-4 chữ số';
            }
            if (needInvoice) {
                if (!invoiceInfo.companyName || !invoiceInfo.companyName.trim()) next['invoice.companyName'] = 'Bắt buộc';
                if (!invoiceInfo.taxCode || !invoiceInfo.taxCode.trim()) next['invoice.taxCode'] = 'Bắt buộc';
                if (!invoiceInfo.address || !invoiceInfo.address.trim()) next['invoice.address'] = 'Bắt buộc';
                if (!invoiceInfo.email || !validateEmail(invoiceInfo.email)) next['invoice.email'] = 'Email không hợp lệ';
            }
        }

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    // Danh sách hành khách
    const [passengers, setPassengers] = useState(getInitialPassengers(searchParams));

    const [paymentInfo, setPaymentInfo] = useState({
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: '',
    });

    const [invoiceInfo, setInvoiceInfo] = useState({
        companyName: '',
        taxCode: '',
        address: '',
        email: '',
    });

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    const handleNextStep = () => {
        if (currentStep === 1) {
            if (!validateStep(1)) return;
        }
        if (currentStep === 2) {
            if (!validateStep(2)) return;
        }
        if (currentStep < 3) setCurrentStep(currentStep + 1);
    };

    const handlePrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            return;
        }
        // nếu đang ở bước 1 thì quay lại trang trước (history)
        try {
            router.back();
        } catch {
            // fallback: nếu không có history thì chuyển về trang chủ
            router.push('/');
        }
    };

    const handlePayment = async () => {
        // validate all before proceed
        const ok1 = validateStep(1);
        const ok2 = validateStep(2);
        if (!ok1 || !ok2) {
            // jump to first invalid step
            if (!ok1) setCurrentStep(1);
            else if (!ok2) setCurrentStep(2);
            return;
        }
        if (!agreeTerms) {
            setErrors(prev => ({ ...prev, agreeTerms: 'Bạn phải đồng ý với điều khoản' }));
            setCurrentStep(3);
            return;
        } else {
            setErrors(prev => { const c = { ...prev }; delete c['agreeTerms']; return c; });
        }

         // Lưu dữ liệu booking (toàn bộ payload) vào sessionStorage tại bookingKey nếu có,
         // hoặc tạo bookingKey mới để các bước sau có thể truy xuất payload đầy đủ.
         try {
             if (typeof window !== 'undefined') {
                 // always persist participants to localStorage for quick UI restore
                 window.localStorage.setItem('participants', JSON.stringify(passengers));
 
                 // persist booking payload to sessionStorage under bookingKey (preserve full payload)
                 if (bookingKey) {
                     sessionStorage.setItem(bookingKey, JSON.stringify(bookingData));
                 } else {
                     const newKey = `booking_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
                     sessionStorage.setItem(newKey, JSON.stringify(bookingData));
                     setBookingKey(newKey);
                     // update URL to include bookingKey for bookmarking/share flow
                     try {
                         const url = new URL(window.location.href);
                         url.searchParams.set('bookingKey', newKey);
                         window.history.replaceState({}, '', url.toString());
                     } catch { /* ignore */ }
                 }
             }
         } catch (e) {
             console.warn('Could not persist booking payload', e);
         }

        // Handle payment processing
        console.log('Processing payment...', {
            method: selectedPayment,
            contactInfo,
            passengerInfo: passengers,
            paymentInfo,
            invoiceInfo: needInvoice ? invoiceInfo : null,
        });

        // inside handlePayment()
        if (selectedPayment === 'vnpay') {
            try {
                const resp = await fetch('http://localhost:7000/vnpay/create_payment_url', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: (normalizedPricing?.total ?? normalizedPricing?.estimatedTotal ?? normalizedPricing?.offerTotal ??  bookingData.pricing?.total ?? 50000),
                        orderInfo: (normalizedDetails?.flightNumber ?? normalizedDetails?.route ?? 'Thanh toan MegaTrip'),
                        ip: '127.0.0.1',
                        returnUrl: 'http://localhost:7000/vnpay/check-payment',
                    }),
                });

                if (!resp.ok) {
                    const text = await resp.text();
                    console.error('VNPay create-qr failed:', resp.status, text);
                    alert('Không thể tạo thanh toán VNPay. (server trả lỗi)');
                    return;
                }

                // try parse JSON, fallback to text
                let data;
                const ct = resp.headers.get('content-type') || '';
                if (ct.includes('application/json')) {
                    data = await resp.json();
                } else {
                    data = await resp.text();
                }
                console.log('VNPay response raw:', data);

                // data có thể là:
                // - một string url trực tiếp
                // - 1 object { paymentUrl: '...' } hoặc { data: '...' }
                const url =
                    (typeof data === 'string' && data) ||
                    (data && (data.paymentUrl || data.data || data.url));

                if (url) {
                    window.location.href = url;
                    return;
                }
                alert('Không thể tạo thanh toán VNPay. (data không hợp lệ)');
            } catch (err) {
                console.error('Lỗi khi kết nối VNPay:', err);
                alert('Lỗi khi kết nối VNPay: ' + (err?.message || err));
            }
            return;
        }

        if (selectedPayment === 'zalopay') {
            try {
                const resp = await fetch('http://localhost:7000/zalo/payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: (normalizedPricing?.total ?? normalizedPricing?.estimatedTotal ?? bookingData.pricing?.total ?? 50000),
                        orderInfo: (normalizedDetails?.flightNumber ?? normalizedDetails?.route ?? 'Thanh toan MegaTrip'),
                        // các trường khác nếu cần
                    }),
                });
                const data = await resp.json();
                if (data && data.return_code === 1 && data.order_url) {
                    window.location.href = data.order_url;
                    return;
                } else {
                    alert('Không thể tạo thanh toán ZaloPay: ' + (data?.return_message || 'Lỗi không xác định'));
                }
            } catch (err) {
                console.error('Lỗi khi kết nối ZaloPay:', err);
                alert('Lỗi khi kết nối ZaloPay: ' + (err?.message || err));
            }
            return;
        }

        if (selectedPayment === 'momo') {
            try {
                const resp = await fetch('http://localhost:7000/momo/payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        // amount, orderInfo... nếu backend MoMo cần truyền từ client
                        // ở đây backend đang lấy sẵn từ config, nếu muốn truyền động thì sửa backend
                    }),
                });
                const data = await resp.json();
                if (data && data.resultCode === 0 && (data.payUrl || data.shortLink)) {
                    window.location.href = data.payUrl || data.shortLink;
                    return;
                } else {
                    alert('Không thể tạo thanh toán MoMo: ' + (data?.message || 'Lỗi không xác định'));
                }
            } catch (err) {
                console.error('Lỗi khi kết nối MoMo:', err);
                alert('Lỗi khi kết nối MoMo: ' + (err?.message || err));
            }
            return;
        }

        // Simulate payment processing
        setTimeout(() => {
            if (selectedPayment === 'bank_transfer') {
                // Redirect to bank transfer instructions page
                router.push('/chuyen-khoan');
            } else {
                // Redirect to success page for instant payment methods
                // ensure bookingKey remains in query so success page / webhook can correlate
                if (bookingKey) router.push(`/thanh-toan-thanh-cong?bookingKey=${encodeURIComponent(bookingKey)}`);
                else router.push('/thanh-toan-thanh-cong');
            }
        }, 1000);
    };

    const steps = [
        { number: 1, title: 'Thông tin', description: 'Nhập thông tin liên hệ và hành khách' },
        { number: 2, title: 'Thanh toán', description: 'Chọn phương thức thanh toán' },
        { number: 3, title: 'Xác nhận', description: 'Kiểm tra và hoàn tất đặt chỗ' },
    ];

    // Thêm hành khách
    const handleAddPassenger = (type: 'adult' | 'child' | 'infant') => {
        setPassengers(prev => [
            ...prev,
            {
                type,
                title: type === 'adult' ? 'Mr' : '',
                firstName: '',
                lastName: '',
                dateOfBirth: '',
                nationality: 'VN',
                idNumber: '',
                idType: 'cccd',
            }
        ]);
    };
    // Xóa hành khách
    const handleRemovePassenger = (index: number) => {
        setPassengers(prev => prev.filter((_, i) => i !== index));
    };
    // Cập nhật thông tin hành khách
    const handlePassengerChange = (index: number, field: string, value: any) => {
        setPassengers(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
    };

    // If bookingData contains leadPassenger / contactInfo from details page, prefill local contact and passengers
    useEffect(() => {
        try {
            if (!bookingData) return;
            const bp = bookingData.passengers ?? bookingData.passenger ?? null;
            if (!bp) return;

            // lead passenger (from details page)
            const lead = bp.leadPassenger ?? bp.lead ?? null;
            const contactFromBooking = bp.contactInfo ?? bookingData.contactInfo ?? null;

            if (contactFromBooking) {
                setContactInfo(prev => ({
                    fullName: prev.fullName || `${lead?.title ? lead.title + ' ' : ''}${lead?.firstName ?? ''} ${lead?.lastName ?? ''}`.trim(),
                    email: contactFromBooking.email ?? prev.email,
                    phone: contactFromBooking.phone ?? prev.phone
                }));
            } else if (lead) {
                // if there's a lead but no explicit contactInfo, populate fullName
                setContactInfo(prev => ({ ...prev, fullName: `${lead?.title ? lead.title + ' ' : ''}${lead?.firstName ?? ''} ${lead?.lastName ?? ''}`.trim() }));
            }

            // build passengers array: prefer explicit passenger list -> counts -> fallback to getInitialPassengers
            if (Array.isArray(bp.list) && bp.list.length > 0) {
                // some flows may provide a list of passengers directly
                setPassengers(bp.list.map((x: any) => ({
                    type: x.type ?? 'adult',
                    title: x.title ?? 'Mr',
                    firstName: x.firstName ?? '',
                    lastName: x.lastName ?? '',
                    dateOfBirth: x.dateOfBirth ?? '',
                    nationality: x.nationality ?? 'VN',
                    idNumber: x.idNumber ?? '',
                    idType: x.idType ?? 'cccd'
                })));
            } else if (Array.isArray(bp.passengers) && bp.passengers.length > 0) {
                // alternative naming
                setPassengers(bp.passengers.map((x: any) => ({
                    type: x.type ?? 'adult',
                    title: x.title ?? 'Mr',
                    firstName: x.firstName ?? '',
                    lastName: x.lastName ?? '',
                    dateOfBirth: x.dateOfBirth ?? '',
                    nationality: x.nationality ?? 'VN',
                    idNumber: x.idNumber ?? '',
                    idType: x.idType ?? 'cccd'
                })));
            } else {
                const counts = bp.counts ?? { adults: 1, children: 0, infants: 0 };
                const arr: any[] = [];
                for (let i = 0; i < (counts.adults || 0); i++) {
                    arr.push({ type: 'adult', title: 'Mr', firstName: '', lastName: '', dateOfBirth: '', nationality: 'VN', idNumber: '', idType: 'cccd' });
                }
                for (let i = 0; i < (counts.children || 0); i++) {
                    arr.push({ type: 'child', title: '', firstName: '', lastName: '', dateOfBirth: '', nationality: 'VN', idNumber: '', idType: 'cccd' });
                }
                for (let i = 0; i < (counts.infants || 0); i++) {
                    arr.push({ type: 'infant', title: '', firstName: '', lastName: '', dateOfBirth: '', nationality: 'VN', idNumber: '', idType: 'cccd' });
                }
                // map lead onto first slot if available
                if (lead && arr.length > 0) {
                    arr[0] = {
                        ...arr[0],
                        title: lead.title ?? arr[0].title,
                        firstName: lead.firstName ?? arr[0].firstName,
                        lastName: lead.lastName ?? arr[0].lastName,
                        dateOfBirth: lead.dateOfBirth ?? arr[0].dateOfBirth,
                        nationality: lead.nationality ?? arr[0].nationality,
                        idNumber: lead.idNumber ?? arr[0].idNumber,
                        idType: lead.idType ?? arr[0].idType
                    };
                }
                setPassengers(arr);
            }
        } catch (e) {
            /* ignore */
        }
    }, [bookingData]);

    return (
        <>
            {/* Breadcrumb */}
            <div className="border-b">
                <div className="container py-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Link prefetch={false}  href="/" className="hover:text-primary">Trang chủ</Link>
                        <span>/</span>
                        <Link prefetch={false}  href="/ve-may-bay" className="hover:text-primary">Vé máy bay</Link>
                        <span>/</span>
                        <span>Thanh toán</span>
                    </div>
                </div>
            </div>

            <div className="container py-6">
                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-center space-x-4 md:space-x-8">
                        {steps.map((step, index) => (
                            <div key={step.number} className="flex items-center">
                                <div className="flex flex-col items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${currentStep >= step.number
                                            ? 'bg-primary border-primary text-primary-foreground'
                                            : 'border-gray-300 text-gray-400'
                                        }`}>
                                        {currentStep > step.number ? (
                                            <CheckCircle className="h-5 w-5" />
                                        ) : (
                                            step.number
                                        )}
                                    </div>
                                    <div className="mt-2 text-center">
                                        <div className={`text-sm font-medium ${currentStep >= step.number ? 'text-primary' : 'text-gray-400'
                                            }`}>
                                            {step.title}
                                        </div>
                                        <div className="text-xs text-muted-foreground hidden md:block">
                                            {step.description}
                                        </div>
                                    </div>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`w-12 md:w-20 h-0.5 mx-4 ${currentStep > step.number ? 'bg-primary' : 'bg-gray-300'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Step 1: Contact & Passenger Info */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Thông tin liên hệ</CardTitle>
                                        <p className="text-muted-foreground">
                                            Thông tin này sẽ được sử dụng để gửi vé và xác nhận đặt chỗ
                                        </p>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="fullName">Họ và tên *</Label>
                                                <Input
                                                    id="fullName"
                                                    value={contactInfo.fullName}
                                                    onChange={(e) => setContactInfo(prev => ({ ...prev, fullName: e.target.value }))}
                                                    placeholder="Nhập họ và tên"
                                                />
                                            {errors['contact.fullName'] && (
                                                <p className="text-red-500 text-xs mt-1">{errors['contact.fullName']}</p>
                                            )}
                                            </div>
                                            <div>
                                                <Label htmlFor="phone">Số điện thoại *</Label>
                                                <Input
                                                    id="phone"
                                                    value={contactInfo.phone}
                                                    onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                                                    placeholder="0912345678"
                                                />
                                            {errors['contact.phone'] && (
                                                <p className="text-red-500 text-xs mt-1">{errors['contact.phone']}</p>
                                            )}
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="email">Email *</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={contactInfo.email}
                                                onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                                                placeholder="email@example.com"
                                            />
                                        {errors['contact.email'] && (
                                            <p className="text-red-500 text-xs mt-1">{errors['contact.email']}</p>
                                        )}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Thông tin hành khách</CardTitle>
                                        <p className="text-muted-foreground">
                                            Vui lòng điền chính xác theo giấy tờ tùy thân
                                        </p>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Danh sách form hành khách */}
                                        {passengers.map((p, idx) => (
                                            <div key={idx} className="border rounded-lg p-4 mb-2 relative">
                                                {/* <div className="absolute top-2 right-2">
                                                    {passengers.length > 1 && (
                                                        <Button variant="ghost" size="sm" onClick={() => handleRemovePassenger(idx)}>
                                                            Xóa
                                                        </Button>
                                                    )}
                                                </div> */}
                                                <div className="mb-2">
                                                    <Badge variant={p.type === 'adult' ? 'secondary' : p.type === 'child' ? 'outline' : 'destructive'}>
                                                        {p.type === 'adult' ? 'Người lớn' : p.type === 'child' ? 'Trẻ em' : 'Em bé'}
                                                    </Badge>
                                                </div>
                                                {p.type === 'adult' ? (
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div>
                                                            <Label>Danh xưng</Label>
                                                            <Select value={p.title} onValueChange={value => handlePassengerChange(idx, 'title', value)}>
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
                                                            <Label>Họ và tên đệm *</Label>
                                                            <Input value={p.firstName} onChange={e => handlePassengerChange(idx, 'firstName', e.target.value)} placeholder="VD: NGUYEN VAN" />
                                                        {errors[`passenger.${idx}.firstName`] && (
                                                            <p className="text-red-500 text-xs mt-1">{errors[`passenger.${idx}.firstName`]}</p>
                                                        )}
                                                        </div>
                                                        <div>
                                                            <Label>Tên *</Label>
                                                            <Input value={p.lastName} onChange={e => handlePassengerChange(idx, 'lastName', e.target.value)} placeholder="VD: AN" />
                                                        {errors[`passenger.${idx}.lastName`] && (
                                                            <p className="text-red-500 text-xs mt-1">{errors[`passenger.${idx}.lastName`]}</p>
                                                        )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <Label>Họ và tên đệm *</Label>
                                                            <Input value={p.firstName} onChange={e => handlePassengerChange(idx, 'firstName', e.target.value)} placeholder="VD: NGUYEN VAN" />
                                                        {errors[`passenger.${idx}.firstName`] && (
                                                            <p className="text-red-500 text-xs mt-1">{errors[`passenger.${idx}.firstName`]}</p>
                                                        )}
                                                        </div>
                                                        <div>
                                                            <Label>Tên *</Label>
                                                            <Input value={p.lastName} onChange={e => handlePassengerChange(idx, 'lastName', e.target.value)} placeholder="VD: AN" />
                                                        {errors[`passenger.${idx}.lastName`] && (
                                                            <p className="text-red-500 text-xs mt-1">{errors[`passenger.${idx}.lastName`]}</p>
                                                        )}
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                                    <div>
                                                        <Label>Ngày sinh *</Label>
                                                        <Input type="date" value={p.dateOfBirth} onChange={e => handlePassengerChange(idx, 'dateOfBirth', e.target.value)} />
                                                    {errors[`passenger.${idx}.dateOfBirth`] && (
                                                        <p className="text-red-500 text-xs mt-1">{errors[`passenger.${idx}.dateOfBirth`]}</p>
                                                    )}
                                                    </div>
                                                    <div>
                                                        <Label>Quốc tịch</Label>
                                                        <Select value={p.nationality} onValueChange={value => handlePassengerChange(idx, 'nationality', value)}>
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
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                                    <div>
                                                        <Label>Loại giấy tờ</Label>
                                                        <Select value={p.idType} onValueChange={value => handlePassengerChange(idx, 'idType', value)}>
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
                                                        <Label>Số giấy tờ *</Label>
                                                        <Input value={p.idNumber} onChange={e => handlePassengerChange(idx, 'idNumber', e.target.value)} placeholder="Nhập số CCCD/CMND/Hộ chiếu" />
                                                    {errors[`passenger.${idx}.idNumber`] && (
                                                        <p className="text-red-500 text-xs mt-1">{errors[`passenger.${idx}.idNumber`]}</p>
                                                    )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {/* Nút thêm hành khách */}
                                        {/* <div className="flex gap-2 mt-2">
                                            <Button variant="outline" size="sm" onClick={() => handleAddPassenger('adult')}>+ Người lớn</Button>
                                            <Button variant="outline" size="sm" onClick={() => handleAddPassenger('child')}>+ Trẻ em</Button>
                                            <Button variant="outline" size="sm" onClick={() => handleAddPassenger('infant')}>+ Em bé</Button>
                                        </div> */}
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Step 2: Payment Method */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Phương thức thanh toán</CardTitle>
                                        <p className="text-muted-foreground">
                                            Chọn phương thức thanh toán phù hợp với bạn
                                        </p>
                                    </CardHeader>
                                    <CardContent>
                                        <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment}>
                                            <div className="space-y-3">
                                                {paymentMethods.map((method) => (
                                                    <div
                                                        key={method.id}
                                                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedPayment === method.id ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'
                                                            }`}
                                                        onClick={() => setSelectedPayment(method.id)}
                                                    >
                                                        <div className="flex items-center space-x-3">
                                                            <RadioGroupItem value={method.id} id={method.id} />
                                                            <method.icon className="h-5 w-5" />
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between">
                                                                    <Label htmlFor={method.id} className="font-medium cursor-pointer">
                                                                        {method.name}
                                                                    </Label>
                                                                    <div className="flex items-center gap-2">
                                                                        {method.instant && (
                                                                            <Badge variant="secondary" className="text-xs">
                                                                                Tức thì
                                                                            </Badge>
                                                                        )}
                                                                        {method.fee === 0 && (
                                                                            <Badge variant="outline" className="text-xs">
                                                                                Miễn phí
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <p className="text-sm text-muted-foreground mt-1">
                                                                    {method.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </RadioGroup>

                                        {/* Credit Card Form */}
                                        {selectedPayment === 'credit_card' && (
                                            <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                                                <h4 className="font-medium mb-4">Thông tin thẻ</h4>
                                                <div className="space-y-4">
                                                    <div>
                                                        <Label htmlFor="cardNumber">Số thẻ *</Label>
                                                        <Input
                                                            id="cardNumber"
                                                            value={paymentInfo.cardNumber}
                                                            onChange={(e) => setPaymentInfo(prev => ({ ...prev, cardNumber: e.target.value }))}
                                                            placeholder="1234 5678 9012 3456"
                                                        />
                                                    {errors['payment.cardNumber'] && (
                                                        <p className="text-red-500 text-xs mt-1">{errors['payment.cardNumber']}</p>
                                                    )}
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="cardHolder">Tên chủ thẻ *</Label>
                                                        <Input
                                                            id="cardHolder"
                                                            value={paymentInfo.cardHolder}
                                                            onChange={(e) => setPaymentInfo(prev => ({ ...prev, cardHolder: e.target.value }))}
                                                            placeholder="NGUYEN VAN A"
                                                        />
                                                    {errors['payment.cardHolder'] && (
                                                        <p className="text-red-500 text-xs mt-1">{errors['payment.cardHolder']}</p>
                                                    )}
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <Label htmlFor="expiryDate">Ngày hết hạn *</Label>
                                                            <Input
                                                                id="expiryDate"
                                                                value={paymentInfo.expiryDate}
                                                                onChange={(e) => setPaymentInfo(prev => ({ ...prev, expiryDate: e.target.value }))}
                                                                placeholder="MM/YY"
                                                            />
                                                        {errors['payment.expiryDate'] && (
                                                            <p className="text-red-500 text-xs mt-1">{errors['payment.expiryDate']}</p>
                                                        )}
                                                        </div>
                                                        <div>
                                                            <Label htmlFor="cvv">CVV *</Label>
                                                            <Input
                                                                id="cvv"
                                                                value={paymentInfo.cvv}
                                                                onChange={(e) => setPaymentInfo(prev => ({ ...prev, cvv: e.target.value }))}
                                                                placeholder="123"
                                                            />
                                                        {errors['payment.cvv'] && (
                                                            <p className="text-red-500 text-xs mt-1">{errors['payment.cvv']}</p>
                                                        )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Invoice Option */}
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-start space-x-3">
                                            <Checkbox
                                                id="needInvoice"
                                                checked={needInvoice}
                                                onCheckedChange={checked => setNeedInvoice(!!checked)}
                                            />
                                            <div className="flex-1">
                                                <Label htmlFor="needInvoice" className="font-medium cursor-pointer">
                                                    Xuất hóa đơn công ty
                                                </Label>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Hóa đơn VAT sẽ được gửi qua email trong vòng 24h
                                                </p>
                                            </div>
                                        </div>

                                        {needInvoice && (
                                            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <Label htmlFor="companyName">Tên công ty *</Label>
                                                            <Input
                                                                id="companyName"
                                                                value={invoiceInfo.companyName}
                                                                onChange={(e) => setInvoiceInfo(prev => ({ ...prev, companyName: e.target.value }))}
                                                                placeholder="Công ty TNHH ABC"
                                                            />
                                                        {errors['invoice.companyName'] && (
                                                            <p className="text-red-500 text-xs mt-1">{errors['invoice.companyName']}</p>
                                                        )}
                                                        </div>
                                                        <div>
                                                            <Label htmlFor="taxCode">Mã số thuế *</Label>
                                                            <Input
                                                                id="taxCode"
                                                                value={invoiceInfo.taxCode}
                                                                onChange={(e) => setInvoiceInfo(prev => ({ ...prev, taxCode: e.target.value }))}
                                                                placeholder="0123456789"
                                                            />
                                                        {errors['invoice.taxCode'] && (
                                                            <p className="text-red-500 text-xs mt-1">{errors['invoice.taxCode']}</p>
                                                        )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="companyAddress">Địa chỉ công ty *</Label>
                                                        <Input
                                                            id="companyAddress"
                                                            value={invoiceInfo.address}
                                                            onChange={(e) => setInvoiceInfo(prev => ({ ...prev, address: e.target.value }))}
                                                            placeholder="Địa chỉ trụ sở chính"
                                                        />
                                                    {errors['invoice.address'] && (
                                                        <p className="text-red-500 text-xs mt-1">{errors['invoice.address']}</p>
                                                    )}
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="invoiceEmail">Email nhận hóa đơn *</Label>
                                                        <Input
                                                            id="invoiceEmail"
                                                            type="email"
                                                            value={invoiceInfo.email}
                                                            onChange={(e) => setInvoiceInfo(prev => ({ ...prev, email: e.target.value }))}
                                                            placeholder="ketoan@company.com"
                                                        />
                                                    {errors['invoice.email'] && (
                                                        <p className="text-red-500 text-xs mt-1">{errors['invoice.email']}</p>
                                                    )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Step 3: Confirmation */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Xác nhận thông tin</CardTitle>
                                        <p className="text-muted-foreground">
                                            Vui lòng kiểm tra lại thông tin trước khi thanh toán
                                        </p>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Contact Info Review */}
                                        <div>
                                            <h4 className="font-medium mb-2">Thông tin liên hệ</h4>
                                            <div className="text-sm text-muted-foreground space-y-1">
                                                <div>Họ tên: {contactInfo.fullName}</div>
                                                <div>Email: {contactInfo.email}</div>
                                                <div>Điện thoại: {contactInfo.phone}</div>
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Passenger Info Review */}
                                        <div>
                                            <h4 className="font-medium mb-2">Thông tin hành khách</h4>
                                            <div className="text-sm text-muted-foreground space-y-1">
                                                {passengers.map((p, idx) => (
                                                    <div key={idx}>
                                                        <div>Tên: {p.title} {p.firstName} {p.lastName}</div>
                                                        <div>Ngày sinh: {p.dateOfBirth}</div>
                                                        <div>Giấy tờ: {p.idType.toUpperCase()} - {p.idNumber}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Payment Method Review */}
                                        <div>
                                            <h4 className="font-medium mb-2">Phương thức thanh toán</h4>
                                            <div className="text-sm text-muted-foreground">
                                                {paymentMethods.find(m => m.id === selectedPayment)?.name}
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Terms and Conditions */}
                                        <div className="space-y-4">
                                            <div className="flex items-start space-x-3">
                                                <Checkbox
                                                    id="agreeTerms"
                                                    checked={agreeTerms}
                                                    onCheckedChange={checked => setAgreeTerms(!!checked)}
                                                />
                                                <div className="flex-1">
                                                    <Label htmlFor="agreeTerms" className="text-sm cursor-pointer">
                                                        Tôi đồng ý với{' '}
                                                        <Link prefetch={false}  href="/dieu-khoan" className="text-primary hover:underline">
                                                            Điều khoản sử dụng
                                                        </Link>
                                                        {' '}và{' '}
                                                        <Link prefetch={false}  href="/chinh-sach-bao-mat" className="text-primary hover:underline">
                                                            Chính sách bảo mật
                                                        </Link>
                                                        {' '}của MegaTrip
                                                    </Label>
                                                </div>
                                            </div>

                                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                                <div className="flex items-start gap-2">
                                                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                                                    <div className="text-sm">
                                                        <div className="font-medium text-amber-800 mb-1">Lưu ý quan trọng:</div>
                                                        <ul className="text-amber-700 space-y-1">
                                                            <li>• Vui lòng kiểm tra kỹ thông tin trước khi thanh toán</li>
                                                            <li>• Vé điện tử sẽ được gửi qua email sau khi thanh toán thành công</li>
                                                            <li>• Mọi thay đổi sau khi đặt vé có thể phát sinh phí</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between pt-6">
                            <Button
                                variant="outline"
                                onClick={handlePrevStep}
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Quay lại
                            </Button>

                            {currentStep < 3 ? (
                                <Button onClick={handleNextStep}>
                                    Tiếp tục
                                </Button>
                            ) : (
                                <Button
                                    onClick={handlePayment}
                                    disabled={!agreeTerms}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    <Lock className="h-4 w-4 mr-2" />
                                    Thanh toán ngay
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Sidebar - Order Summary */}
                    <div className="lg:w-96">
                        <Card className="sticky top-20">
                            <CardHeader>
                                <CardTitle>Tóm tắt đơn hàng</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Booking Details - Hiển thị theo loại booking (dùng normalizedDetails cho an toàn).
                                    Delay rendering until mounted so server/client initial markup matches and avoids hydration errors */}
                                {mounted && bookingType === 'flight' && (
                                     <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Plane className="h-4 w-4 text-primary" />
                                            <span className="font-medium">Vé máy bay</span>
                                        </div>
                                        <div className="text-sm text-muted-foreground space-y-1">
                                            <div className="flex justify-between">
                                                <span>Chuyến bay:</span>
                                                <span>{normalizedDetails.flightNumber ?? '—'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Tuyến:</span>
                                                <span>{normalizedDetails.route ?? '—'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Ngày bay:</span>
                                                <span>{normalizedDetails.date ?? '—'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Giờ bay:</span>
                                                <span>{normalizedDetails.time ?? '—'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Hành khách:</span>
                                                <span>{passengers.length} người</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {mounted && bookingType === 'bus' && (
                                     <div>
                                         <div className="flex items-center gap-2 mb-2">
                                             <Users className="h-4 w-4 text-primary" />
                                             <span className="font-medium">Vé xe du lịch</span>
                                         </div>
                                         <div className="text-sm text-muted-foreground space-y-1">
                                             <div className="flex justify-between">
                                                 <span>Tuyến xe:</span>
                                                 <span>{normalizedDetails.route ?? '---'}</span>
                                             </div>
                                             <div className="flex justify-between">
                                                 <span>Ngày đi:</span>
                                                 <span>{normalizedDetails.date ?? '---'}</span>
                                             </div>
                                             <div className="flex justify-between">
                                                 <span>Giờ xuất phát:</span>
                                                 <span>{normalizedDetails.time ?? '---'}</span>
                                             </div>
                                             <div className="flex justify-between">
                                                 <span>Hành khách:</span>
                                                 <span>{passengers.length} người</span>
                                             </div>
                                         </div>
                                     </div>
                                 )}
                                {mounted && bookingType === 'tour' && (
                                     <div>
                                         <div className="flex items-center gap-2 mb-2">
                                             <MapPin className="h-4 w-4 text-primary" />
                                             <span className="font-medium">Đặt tour</span>
                                         </div>
                                         <div className="text-sm text-muted-foreground space-y-1">
                                             <div className="flex justify-between">
                                                 <span>Tên tour:</span>
                                                 <span>{normalizedDetails.route ?? '---'}</span>
                                             </div>
                                             <div className="flex justify-between">
                                                 <span>Ngày khởi hành:</span>
                                                 <span>{normalizedDetails.date ?? '---'}</span>
                                             </div>
                                             <div className="flex justify-between">
                                                 <span>Giờ khởi hành:</span>
                                                 <span>{normalizedDetails.time ?? '---'}</span>
                                             </div>
                                             <div className="flex justify-between">
                                                 <span>Hành khách:</span>
                                                 <span>{passengers.length} người</span>
                                             </div>
                                         </div>
                                     </div>
                                 )}
                                <Separator />
                                 {/* Pricing Breakdown (dùng normalizedPricing để hiện đúng các giá trị từ booking payload) */}
                                 {/* Pricing: hỗ trợ nhiều shape của payload -> lấy trường phù hợp nhất từ payload (ghi nhận tất cả) */}
                                 {mounted ? (() => {
                                     const p = normalizedPricing || {};
                                     // base: prefer explicit totals (passengerBaseTotal / perPax sums) then fallback
                                     const base = Number(p.basePrice ?? p.passengerBaseTotal ?? p.passengerBase ?? p.perPax?.adultUnit ?? p.perPax?.unit ?? 0);
                                     // taxes
                                     const taxes = Number(p.taxes ?? p.taxesEstimate ?? p.taxesEstimateAmount ?? p.taxesAmount ?? 0);
                                     // addons: handle array shape safely (sum items) or total field
                                     let addons = 0;
                                     if (Array.isArray(p.addOns)) {
                                         addons = Number(p.addOnsTotal ?? p.addOns.reduce((s: number, a: any) => {
                                             const itemTotal = Number(a.total ?? a.totalPrice ?? a.unitPrice ?? 0);
                                             if (Number.isFinite(itemTotal)) return s + itemTotal;
                                             const unit = Number(a.unitPrice ?? 0);
                                             const qty = Number(a.qty ?? 1);
                                             return s + ((Number.isNaN(unit) ? 0 : unit) * (Number.isNaN(qty) ? 1 : qty));
                                         }, 0));
                                     } else {
                                         addons = Number(p.addOnsTotal ?? p.addOns ?? p.addOnsAmount ?? p.addOnsTotalAmount ?? 0);
                                     }
                                     const discount = Number(p.discount ?? p.discountAmount ?? 0);
                                     // total priority: explicit total fields on payload
                                     const totalFromPayload = (p.total ?? p.estimatedTotal ?? p.estimatedTotalAmount ?? p.offerTotal ?? p.estimatedTotalPrice) ?? null;
                                     const totalComputed = totalFromPayload != null ? Number(totalFromPayload) : (base + taxes + addons + discount);
 
                                // --- New: compute counts and per-type unit prices ---
                                const adultsCount = passengers.filter((x: any) => x.type === 'adult').length;
                                const childrenCount = passengers.filter((x: any) => x.type === 'child').length;
                                const infantsCount = passengers.filter((x: any) => x.type === 'infant').length;
                                const passengerCount = Math.max(1, adultsCount + childrenCount + infantsCount);
 
                                // prefer explicit per-pax unit fields if present
                                const adultUnit = Number(p.perPax?.adultUnit ?? p.perPax?.adult ?? p.perPax?.unit ?? (passengerCount ? (Number(p.passengerBaseTotal ?? p.basePrice ?? base) / passengerCount) : 0));
                                const childUnit = Number(p.perPax?.childUnit ?? p.perPax?.child ?? (Number.isFinite(adultUnit) ? adultUnit : 0));
                                const infantUnit = Number(p.perPax?.infantUnit ?? p.perPax?.infant ?? 0);
 
                                // Prepare aggregated fare lines
                                const fareLines: { label: string; count: number; unit: number; total: number }[] = [];
                                if (adultsCount > 0) fareLines.push({ label: 'Người lớn', count: adultsCount, unit: adultUnit, total: adultUnit * adultsCount });
                                if (childrenCount > 0) fareLines.push({ label: 'Trẻ em', count: childrenCount, unit: childUnit, total: childUnit * childrenCount });
                                if (infantsCount > 0) fareLines.push({ label: 'Em bé', count: infantsCount, unit: infantUnit, total: infantUnit * infantsCount });
 
                                const fallbackSplitUnit = passengerCount ? (Number(p.passengerBaseTotal ?? p.basePrice ?? base) / passengerCount) : 0;
                                const usingFallback = !p.perPax && !(p.passengerBaseTotal) && !p.basePrice;
 
                                     // Compute a per-passenger price guess (safe fallback)
                                     // keep perPaxPrice for backward compatibility (single unit shown per individual if needed)
                                     const perPaxPrice = Number(p.perPax?.unit ?? fallbackSplitUnit);
 
                                     // Prepare addons detail list if available
                                     const addonsList = Array.isArray(p.addOns) ? p.addOns.map((a: any, i: number) => {
                                         const name = a.name ?? a.title ?? `Addon ${i + 1}`;
                                         const qty = Number(a.qty ?? 1);
                                         const unit = Number(a.unitPrice ?? a.price ?? 0);
                                         const total = Number(a.total ?? (unit * qty));
                                         return { name, qty, unit, total };
                                     }) : [];
  
                                     return (
                                         <>
                                             {/* Fare row with toggle */}
                                             <div
                                                 className="flex items-center justify-between text-sm cursor-pointer"
                                                 onClick={() => setShowFareDetails(prev => !prev)}
                                             >
                                                 <div className="flex items-center gap-2">
                                                     <span>Giá vé</span>
                                                     <span className="text-xs text-muted-foreground">{passengers.length} người</span>
                                                 </div>
                                                 <div className="flex items-center gap-4">
                                                     <span>{formatPrice(Number(isNaN(base) ? 0 : base))}</span>
                                                     <ChevronDown className={`h-4 w-4 transition-transform ${showFareDetails ? 'rotate-180' : ''}`} />
                                                 </div>
                                             </div>
  
                                            {/* Fare details aggregated by type */}
                                            {showFareDetails && (
                                                <div className="mt-2 mb-2 p-2 bg-gray-50 rounded-md text-sm">
                                                    {fareLines.length > 0 ? (
                                                        <div className="space-y-2">
                                                            {fareLines.map((line, idx) => (
                                                                <div key={idx} className="flex justify-between">
                                                                    <div>{line.label} {line.count > 1 ? `(${line.count} người)` : ''} <span className="text-xs text-muted-foreground"> - {formatPrice(line.unit)} / người</span></div>
                                                                    <div>{formatPrice(line.total)}</div>
                                                                </div>
                                                            ))}
                                                            <div className="flex justify-between font-medium pt-2 border-t">
                                                                <div>Tổng</div>
                                                                <div>{formatPrice(Math.round(Number(isNaN(base) ? 0 : base)))}</div>
                                                            </div>
                                                            {usingFallback && (
                                                                <div className="text-xs text-muted-foreground pt-1">Lưu ý: không có dữ liệu giá theo loại trong payload, đang chia đều giá cơ bản ({formatPrice(fallbackSplitUnit)}/người)</div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="text-muted-foreground">Không có dữ liệu chi tiết hành khách</div>
                                                    )}
                                                </div>
                                            )}
  
                                                 <div className="flex justify-between text-sm">
                                                     <span>Thuế và phí</span>
                                                     <span>{formatPrice(Number(isNaN(taxes) ? 0 : taxes))}</span>
                                                 </div>
  
                                                 {/* Addons row with toggle */}
                                                 <div
                                                     className="flex items-center justify-between text-sm cursor-pointer mt-2"
                                                     onClick={() => setShowAddonsDetails(prev => !prev)}
                                                 >
                                                     <div> Dịch vụ thêm </div>
                                                     <div className="flex items-center gap-4">
                                                         <span>{formatPrice(Number(isNaN(addons) ? 0 : addons))}</span>
                                                         <ChevronDown className={`h-4 w-4 transition-transform ${showAddonsDetails ? 'rotate-180' : ''}`} />
                                                     </div>
                                                 </div>
  
                                                 {/* Addons details */}
                                                 {showAddonsDetails && (
                                                     <div className="mt-2 mb-2 p-2 bg-gray-50 rounded-md text-sm">
                                                         {addonsList.length > 0 ? (
                                                             <div className="space-y-2">
                                                                 {addonsList.map((a: any, idx: number) => (
                                                                     <div key={idx} className="flex justify-between">
                                                                         <div>{a.name}{a.qty && a.qty > 1 ? ` ×${a.qty}` : ''}</div>
                                                                         <div>{formatPrice(Number(a.total || 0))}</div>
                                                                     </div>
                                                                 ))}
                                                                 <div className="flex justify-between font-medium pt-2 border-t">
                                                                     <div>Tổng dịch vụ</div>
                                                                     <div>{formatPrice(Number(addons))}</div>
                                                                 </div>
                                                             </div>
                                                         ) : (
                                                             <div className="text-muted-foreground">Không có thông tin dịch vụ thêm</div>
                                                         )}
                                                     </div>
                                                 )}
 
                                                 <div className="flex justify-between text-sm text-green-600">
                                                     <span>Giảm giá</span>
                                                     <span>{formatPrice(Number(isNaN(discount) ? 0 : discount))}</span>
                                                 </div>
                                                 <Separator />
                                                 <div className="flex justify-between font-bold text-lg">
                                                     <span>Tổng cộng</span>
                                                     <span className="text-primary">{formatPrice(Math.round(Number(isNaN(totalComputed) ? 0 : totalComputed)))}</span>
                                                 </div>
                                             </>
                                         );
                           
                                })() : (
                                    <div className="text-sm text-muted-foreground">Đang tải tóm tắt đơn hàng...</div>
                                )}
                                <Separator />
                                {/* Security Info */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Shield className="h-4 w-4 text-green-500" />
                                        <span>Thanh toán bảo mật SSL</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="h-4 w-4 text-blue-500" />
                                        <span>Xác nhận tức thì</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <FileText className="h-4 w-4 text-purple-500" />
                                        <span>Vé điện tử</span>
                                    </div>
                                </div>
                                {/* Support Info */}
                                <div className="pt-4 border-t text-center">
                                    <div className="text-sm font-medium mb-1">Cần hỗ trợ?</div>
                                    <div className="text-sm text-primary">
                                        Hotline: 1900 1234
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Hỗ trợ 24/7
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
