"use client"
import { useState } from 'react';
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

// Lấy bookingData từ localStorage nếu có
const getBookingData = (searchParams: URLSearchParams) => {
    // Ưu tiên lấy từ param
    const type = searchParams.get('type');
    if (type) {
        // Tùy loại booking, lấy các param phù hợp
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
        // ...các loại khác
    }
    // Nếu không có param thì lấy từ localStorage
    if (typeof window !== 'undefined') {
        const stored = window.localStorage.getItem('bookingData');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch {}
        }
    }
    // Dữ liệu mẫu nếu chưa có
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
    const [bookingData, setBookingData] = useState(getBookingData(searchParams));
    const [bookingType, setBookingType] = useState(bookingData.type);
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedPayment, setSelectedPayment] = useState('credit_card');
    const [needInvoice, setNeedInvoice] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);

    const [contactInfo, setContactInfo] = useState({
        email: '',
        phone: '',
        fullName: '',
    });

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
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handlePayment = () => {
        // Handle payment processing
        console.log('Processing payment...', {
            method: selectedPayment,
            contactInfo,
            passengerInfo: passengers,
            paymentInfo,
            invoiceInfo: needInvoice ? invoiceInfo : null,
        });

        // Simulate payment processing
        setTimeout(() => {
            if (selectedPayment === 'bank_transfer') {
                // Redirect to bank transfer instructions page
                router.push('/chuyen-khoan');
            } else {
                // Redirect to success page for instant payment methods
                router.push('/thanh-toan-thanh-cong');
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
                                            </div>
                                            <div>
                                                <Label htmlFor="phone">Số điện thoại *</Label>
                                                <Input
                                                    id="phone"
                                                    value={contactInfo.phone}
                                                    onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                                                    placeholder="0912345678"
                                                />
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
                                                <div className="absolute top-2 right-2">
                                                    {passengers.length > 1 && (
                                                        <Button variant="ghost" size="sm" onClick={() => handleRemovePassenger(idx)}>
                                                            Xóa
                                                        </Button>
                                                    )}
                                                </div>
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
                                                        </div>
                                                        <div>
                                                            <Label>Tên *</Label>
                                                            <Input value={p.lastName} onChange={e => handlePassengerChange(idx, 'lastName', e.target.value)} placeholder="VD: AN" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <Label>Họ và tên đệm *</Label>
                                                            <Input value={p.firstName} onChange={e => handlePassengerChange(idx, 'firstName', e.target.value)} placeholder="VD: NGUYEN VAN" />
                                                        </div>
                                                        <div>
                                                            <Label>Tên *</Label>
                                                            <Input value={p.lastName} onChange={e => handlePassengerChange(idx, 'lastName', e.target.value)} placeholder="VD: AN" />
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                                    <div>
                                                        <Label>Ngày sinh *</Label>
                                                        <Input type="date" value={p.dateOfBirth} onChange={e => handlePassengerChange(idx, 'dateOfBirth', e.target.value)} />
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
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {/* Nút thêm hành khách */}
                                        <div className="flex gap-2 mt-2">
                                            <Button variant="outline" size="sm" onClick={() => handleAddPassenger('adult')}>+ Người lớn</Button>
                                            <Button variant="outline" size="sm" onClick={() => handleAddPassenger('child')}>+ Trẻ em</Button>
                                            <Button variant="outline" size="sm" onClick={() => handleAddPassenger('infant')}>+ Em bé</Button>
                                        </div>
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
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="cardHolder">Tên chủ thẻ *</Label>
                                                        <Input
                                                            id="cardHolder"
                                                            value={paymentInfo.cardHolder}
                                                            onChange={(e) => setPaymentInfo(prev => ({ ...prev, cardHolder: e.target.value }))}
                                                            placeholder="NGUYEN VAN A"
                                                        />
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
                                                        </div>
                                                        <div>
                                                            <Label htmlFor="cvv">CVV *</Label>
                                                            <Input
                                                                id="cvv"
                                                                value={paymentInfo.cvv}
                                                                onChange={(e) => setPaymentInfo(prev => ({ ...prev, cvv: e.target.value }))}
                                                                placeholder="123"
                                                            />
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
                                                        </div>
                                                        <div>
                                                            <Label htmlFor="taxCode">Mã số thuế *</Label>
                                                            <Input
                                                                id="taxCode"
                                                                value={invoiceInfo.taxCode}
                                                                onChange={(e) => setInvoiceInfo(prev => ({ ...prev, taxCode: e.target.value }))}
                                                                placeholder="0123456789"
                                                            />
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
                                disabled={currentStep === 1}
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
                                {/* Booking Details - Hiển thị theo loại booking */}
                                {bookingType === 'flight' && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Plane className="h-4 w-4 text-primary" />
                                            <span className="font-medium">Vé máy bay</span>
                                        </div>
                                        <div className="text-sm text-muted-foreground space-y-1">
                                            <div className="flex justify-between">
                                                <span>Chuyến bay:</span>
                                                <span>{bookingData.details.flightNumber}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Tuyến:</span>
                                                <span>{bookingData.details.route}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Ngày bay:</span>
                                                <span>{bookingData.details.date}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Giờ bay:</span>
                                                <span>{bookingData.details.time}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Hành khách:</span>
                                                <span>{passengers.length} người</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {bookingType === 'bus' && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Users className="h-4 w-4 text-primary" />
                                            <span className="font-medium">Vé xe du lịch</span>
                                        </div>
                                        <div className="text-sm text-muted-foreground space-y-1">
                                            <div className="flex justify-between">
                                                <span>Tuyến xe:</span>
                                                <span>{bookingData.details.route || '---'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Ngày đi:</span>
                                                <span>{bookingData.details.date || '---'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Giờ xuất phát:</span>
                                                <span>{bookingData.details.time || '---'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Hành khách:</span>
                                                <span>{passengers.length} người</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {bookingType === 'tour' && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <MapPin className="h-4 w-4 text-primary" />
                                            <span className="font-medium">Đặt tour</span>
                                        </div>
                                        <div className="text-sm text-muted-foreground space-y-1">
                                            <div className="flex justify-between">
                                                <span>Tên tour:</span>
                                                <span>{bookingData.details.route || '---'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Ngày khởi hành:</span>
                                                <span>{bookingData.details.date || '---'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Giờ khởi hành:</span>
                                                <span>{bookingData.details.time || '---'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Hành khách:</span>
                                                <span>{passengers.length} người</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <Separator />
                                {/* Pricing Breakdown */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Giá vé</span>
                                        <span>{formatPrice(bookingData.pricing.basePrice)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Thuế và phí</span>
                                        <span>{formatPrice(bookingData.pricing.taxes)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Dịch vụ thêm</span>
                                        <span>{formatPrice(bookingData.pricing.addOns)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>Giảm giá</span>
                                        <span>{formatPrice(bookingData.pricing.discount)}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Tổng cộng</span>
                                        <span className="text-primary">{formatPrice(bookingData.pricing.total)}</span>
                                    </div>
                                </div>
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
