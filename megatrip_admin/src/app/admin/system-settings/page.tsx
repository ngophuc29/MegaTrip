"use client"
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Settings, Save, RefreshCw, Shield, Mail, Database, Globe,
    Bell, CreditCard, Users, FileText, Lock, Key, Server, Palette
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { Separator } from "../../components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import { useToast } from "../../components/ui/use-toast";

interface SystemSettings {
    // General Settings
    siteName: string;
    siteDescription: string;
    siteUrl: string;
    adminEmail: string;
    timezone: string;
    language: string;
    currency: string;
    dateFormat: string;

    // Email Settings
    emailProvider: "smtp" | "sendgrid" | "mailgun" | "ses";
    smtpHost?: string;
    smtpPort?: number;
    smtpUsername?: string;
    smtpPassword?: string;
    smtpSecure: boolean;
    emailFromName: string;
    emailFromAddress: string;

    // Payment Settings
    paymentEnabled: boolean;
    paymentProviders: {
        vnpay: { enabled: boolean; merchantId?: string; secretKey?: string };
        momo: { enabled: boolean; partnerCode?: string; accessKey?: string; secretKey?: string };
        zalopay: { enabled: boolean; appId?: string; key1?: string; key2?: string };
        stripe: { enabled: boolean; publishableKey?: string; secretKey?: string };
    };

    // Security Settings
    twoFactorEnabled: boolean;
    sessionTimeout: number; // minutes
    passwordMinLength: number;
    passwordRequireSpecialChars: boolean;
    passwordRequireNumbers: boolean;
    passwordRequireUppercase: boolean;
    loginAttemptLimit: number;
    loginLockoutDuration: number; // minutes

    // API Settings
    apiRateLimit: number; // requests per minute
    apiKeyRequired: boolean;
    corsOrigins: string[];

    // Notification Settings
    emailNotifications: {
        newOrder: boolean;
        orderCancellation: boolean;
        paymentSuccess: boolean;
        paymentFailed: boolean;
        customerRegistration: boolean;
        lowInventory: boolean;
    };
    smsNotifications: {
        enabled: boolean;
        provider?: "twilio" | "nexmo" | "local";
        accountSid?: string;
        authToken?: string;
    };

    // Backup Settings
    backupEnabled: boolean;
    backupFrequency: "daily" | "weekly" | "monthly";
    backupRetention: number; // days
    backupLocation: "local" | "s3" | "gcs";

    // Performance Settings
    cacheEnabled: boolean;
    cacheDriver: "memory" | "redis" | "file";
    cdnEnabled: boolean;
    cdnUrl?: string;

    // Maintenance
    maintenanceMode: boolean;
    maintenanceMessage: string;

    // Booking Settings
    bookingConfirmationRequired: boolean;
    bookingCancellationDeadline: number; // hours
    refundProcessingTime: number; // days
    maxAdvanceBookingDays: number;

    // Customer Settings
    customerRegistrationEnabled: boolean;
    customerEmailVerificationRequired: boolean;
    customerPhoneVerificationRequired: boolean;
    loyaltyProgramEnabled: boolean;
}

const SystemSettings: React.FC = () => {
    const [activeTab, setActiveTab] = useState("general");
    const [hasChanges, setHasChanges] = useState(false);

    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch system settings
    const { data: settings, isLoading } = useQuery({
        queryKey: ['system-settings'],
        queryFn: async () => {
            const response = await fetch('/api/admin/settings');
            if (!response.ok) throw new Error('Failed to fetch settings');
            return response.json();
        }
    });

    // Update settings mutation
    const updateSettingsMutation = useMutation({
        mutationFn: async (data: Partial<SystemSettings>) => {
            const response = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to update settings');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['system-settings'] });
            setHasChanges(false);
            toast({
                title: "Cập nhật thành công",
                description: "Cài đặt hệ thống đã được lưu",
            });
        }
    });

    // Test email settings mutation
    const testEmailMutation = useMutation({
        mutationFn: async () => {
            const response = await fetch('/api/admin/settings/test-email', {
                method: 'POST',
            });
            if (!response.ok) throw new Error('Failed to send test email');
            return response.json();
        },
        onSuccess: () => {
            toast({
                title: "Email test thành công",
                description: "Email thử nghiệm đã được gửi",
            });
        }
    });

    const handleSave = (formData: FormData) => {
        const data: any = {};
        for (const [key, value] of formData.entries()) {
            if (key.includes('.')) {
                const [parent, child] = key.split('.');
                if (!data[parent]) data[parent] = {};
                data[parent][child] = value === 'true' ? true : value === 'false' ? false : value;
            } else {
                data[key] = value === 'true' ? true : value === 'false' ? false : value;
            }
        }
        updateSettingsMutation.mutate(data);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Cài đặt hệ thống</h1>
                    <p className="text-gray-600">Quản lý cấu hình và thiết lập hệ thống</p>
                </div>
                <div className="flex items-center gap-2">
                    {hasChanges && (
                        <Badge variant="secondary">
                            Có thay đổi chưa lưu
                        </Badge>
                    )}
                    <Button
                        onClick={() => window.location.reload()}
                        variant="outline"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Làm mới
                    </Button>
                </div>
            </div>

            <form onSubmit={(e) => {
                e.preventDefault();
                handleSave(new FormData(e.currentTarget));
            }}>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-8">
                        <TabsTrigger value="general">
                            <Globe className="h-4 w-4 mr-2" />
                            Chung
                        </TabsTrigger>
                        <TabsTrigger value="email">
                            <Mail className="h-4 w-4 mr-2" />
                            Email
                        </TabsTrigger>
                        <TabsTrigger value="payment">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Thanh toán
                        </TabsTrigger>
                        <TabsTrigger value="security">
                            <Shield className="h-4 w-4 mr-2" />
                            Bảo mật
                        </TabsTrigger>
                        <TabsTrigger value="api">
                            <Server className="h-4 w-4 mr-2" />
                            API
                        </TabsTrigger>
                        <TabsTrigger value="notifications">
                            <Bell className="h-4 w-4 mr-2" />
                            Thông báo
                        </TabsTrigger>
                        <TabsTrigger value="booking">
                            <FileText className="h-4 w-4 mr-2" />
                            Đặt chỗ
                        </TabsTrigger>
                        <TabsTrigger value="advanced">
                            <Settings className="h-4 w-4 mr-2" />
                            Nâng cao
                        </TabsTrigger>
                    </TabsList>

                    {/* General Settings */}
                    <TabsContent value="general" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin chung</CardTitle>
                                <CardDescription>Cấu hình thông tin cơ bản của website</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="siteName">Tên website</Label>
                                        <Input
                                            id="siteName"
                                            name="siteName"
                                            defaultValue={settings?.siteName}
                                            placeholder="VietTravel Admin"
                                            onChange={() => setHasChanges(true)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="siteUrl">URL website</Label>
                                        <Input
                                            id="siteUrl"
                                            name="siteUrl"
                                            defaultValue={settings?.siteUrl}
                                            placeholder="https://viettravel.com"
                                            onChange={() => setHasChanges(true)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="adminEmail">Email quản trị</Label>
                                        <Input
                                            id="adminEmail"
                                            name="adminEmail"
                                            type="email"
                                            defaultValue={settings?.adminEmail}
                                            placeholder="admin@viettravel.com"
                                            onChange={() => setHasChanges(true)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="timezone">Múi giờ</Label>
                                        <Select name="timezone" defaultValue={settings?.timezone || "Asia/Ho_Chi_Minh"}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Asia/Ho_Chi_Minh">Việt Nam (UTC+7)</SelectItem>
                                                <SelectItem value="Asia/Bangkok">Bangkok (UTC+7)</SelectItem>
                                                <SelectItem value="Asia/Singapore">Singapore (UTC+8)</SelectItem>
                                                <SelectItem value="UTC">UTC (UTC+0)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="language">Ngôn ngữ</Label>
                                        <Select name="language" defaultValue={settings?.language || "vi"}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="vi">Tiếng Việt</SelectItem>
                                                <SelectItem value="en">English</SelectItem>
                                                <SelectItem value="zh">中文</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="currency">Đơn vị tiền tệ</Label>
                                        <Select name="currency" defaultValue={settings?.currency || "VND"}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="VND">VND (₫)</SelectItem>
                                                <SelectItem value="USD">USD ($)</SelectItem>
                                                <SelectItem value="EUR">EUR (€)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="siteDescription">Mô tả website</Label>
                                    <Textarea
                                        id="siteDescription"
                                        name="siteDescription"
                                        defaultValue={settings?.siteDescription}
                                        placeholder="Nền tảng đặt tour và vé du lịch hàng đầu Việt Nam"
                                        rows={3}
                                        onChange={() => setHasChanges(true)}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Email Settings */}
                    <TabsContent value="email" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Cài đặt Email</CardTitle>
                                <CardDescription>Cấu hình dịch vụ gửi email</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="emailProvider">Nhà cung cấp email</Label>
                                        <Select name="emailProvider" defaultValue={settings?.emailProvider || "smtp"}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="smtp">SMTP</SelectItem>
                                                <SelectItem value="sendgrid">SendGrid</SelectItem>
                                                <SelectItem value="mailgun">Mailgun</SelectItem>
                                                <SelectItem value="ses">Amazon SES</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="emailFromName">Tên người gửi</Label>
                                        <Input
                                            id="emailFromName"
                                            name="emailFromName"
                                            defaultValue={settings?.emailFromName}
                                            placeholder="VietTravel"
                                            onChange={() => setHasChanges(true)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="emailFromAddress">Email người gửi</Label>
                                        <Input
                                            id="emailFromAddress"
                                            name="emailFromAddress"
                                            type="email"
                                            defaultValue={settings?.emailFromAddress}
                                            placeholder="noreply@viettravel.com"
                                            onChange={() => setHasChanges(true)}
                                        />
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <h4 className="font-medium">Cấu hình SMTP</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="smtpHost">SMTP Host</Label>
                                            <Input
                                                id="smtpHost"
                                                name="smtpHost"
                                                defaultValue={settings?.smtpHost}
                                                placeholder="smtp.gmail.com"
                                                onChange={() => setHasChanges(true)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="smtpPort">SMTP Port</Label>
                                            <Input
                                                id="smtpPort"
                                                name="smtpPort"
                                                type="number"
                                                defaultValue={settings?.smtpPort}
                                                placeholder="587"
                                                onChange={() => setHasChanges(true)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="smtpUsername">Username</Label>
                                            <Input
                                                id="smtpUsername"
                                                name="smtpUsername"
                                                defaultValue={settings?.smtpUsername}
                                                onChange={() => setHasChanges(true)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="smtpPassword">Password</Label>
                                            <Input
                                                id="smtpPassword"
                                                name="smtpPassword"
                                                type="password"
                                                defaultValue={settings?.smtpPassword}
                                                onChange={() => setHasChanges(true)}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="smtpSecure"
                                            name="smtpSecure"
                                            defaultChecked={settings?.smtpSecure}
                                            onCheckedChange={() => setHasChanges(true)}
                                        />
                                        <Label htmlFor="smtpSecure">Sử dụng SSL/TLS</Label>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => testEmailMutation.mutate()}
                                        loading={testEmailMutation.isPending}
                                    >
                                        <Mail className="h-4 w-4 mr-2" />
                                        Gửi email thử nghiệm
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Payment Settings */}
                    <TabsContent value="payment" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Cài đặt thanh toán</CardTitle>
                                <CardDescription>Cấu hình các phương thức thanh toán</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="paymentEnabled"
                                        name="paymentEnabled"
                                        defaultChecked={settings?.paymentEnabled}
                                        onCheckedChange={() => setHasChanges(true)}
                                    />
                                    <Label htmlFor="paymentEnabled">Bật thanh toán trực tuyến</Label>
                                </div>

                                <Separator />

                                {/* VNPay */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium">VNPay</h4>
                                        <Switch
                                            name="paymentProviders.vnpay.enabled"
                                            defaultChecked={settings?.paymentProviders?.vnpay?.enabled}
                                            onCheckedChange={() => setHasChanges(true)}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Merchant ID</Label>
                                            <Input
                                                name="paymentProviders.vnpay.merchantId"
                                                defaultValue={settings?.paymentProviders?.vnpay?.merchantId}
                                                placeholder="Nhập Merchant ID"
                                                onChange={() => setHasChanges(true)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Secret Key</Label>
                                            <Input
                                                name="paymentProviders.vnpay.secretKey"
                                                type="password"
                                                defaultValue={settings?.paymentProviders?.vnpay?.secretKey}
                                                placeholder="Nhập Secret Key"
                                                onChange={() => setHasChanges(true)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* MoMo */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium">MoMo</h4>
                                        <Switch
                                            name="paymentProviders.momo.enabled"
                                            defaultChecked={settings?.paymentProviders?.momo?.enabled}
                                            onCheckedChange={() => setHasChanges(true)}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Partner Code</Label>
                                            <Input
                                                name="paymentProviders.momo.partnerCode"
                                                defaultValue={settings?.paymentProviders?.momo?.partnerCode}
                                                onChange={() => setHasChanges(true)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Access Key</Label>
                                            <Input
                                                name="paymentProviders.momo.accessKey"
                                                defaultValue={settings?.paymentProviders?.momo?.accessKey}
                                                onChange={() => setHasChanges(true)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Secret Key</Label>
                                            <Input
                                                name="paymentProviders.momo.secretKey"
                                                type="password"
                                                defaultValue={settings?.paymentProviders?.momo?.secretKey}
                                                onChange={() => setHasChanges(true)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* ZaloPay */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium">ZaloPay</h4>
                                        <Switch
                                            name="paymentProviders.zalopay.enabled"
                                            defaultChecked={settings?.paymentProviders?.zalopay?.enabled}
                                            onCheckedChange={() => setHasChanges(true)}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>App ID</Label>
                                            <Input
                                                name="paymentProviders.zalopay.appId"
                                                defaultValue={settings?.paymentProviders?.zalopay?.appId}
                                                onChange={() => setHasChanges(true)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Key 1</Label>
                                            <Input
                                                name="paymentProviders.zalopay.key1"
                                                defaultValue={settings?.paymentProviders?.zalopay?.key1}
                                                onChange={() => setHasChanges(true)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Key 2</Label>
                                            <Input
                                                name="paymentProviders.zalopay.key2"
                                                type="password"
                                                defaultValue={settings?.paymentProviders?.zalopay?.key2}
                                                onChange={() => setHasChanges(true)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Security Settings */}
                    <TabsContent value="security" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Cài đặt bảo mật</CardTitle>
                                <CardDescription>Cấu hình các tính năng bảo mật hệ thống</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <h4 className="font-medium">Xác thực hai yếu tố</h4>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="twoFactorEnabled"
                                            name="twoFactorEnabled"
                                            defaultChecked={settings?.twoFactorEnabled}
                                            onCheckedChange={() => setHasChanges(true)}
                                        />
                                        <Label htmlFor="twoFactorEnabled">Bật xác thực hai yếu tố (2FA)</Label>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <h4 className="font-medium">Chính sách m���t khẩu</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="passwordMinLength">Độ dài tối thiểu</Label>
                                            <Input
                                                id="passwordMinLength"
                                                name="passwordMinLength"
                                                type="number"
                                                min="6"
                                                max="50"
                                                defaultValue={settings?.passwordMinLength || 8}
                                                onChange={() => setHasChanges(true)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="sessionTimeout">Thời gian phiên (phút)</Label>
                                            <Input
                                                id="sessionTimeout"
                                                name="sessionTimeout"
                                                type="number"
                                                min="15"
                                                max="1440"
                                                defaultValue={settings?.sessionTimeout || 60}
                                                onChange={() => setHasChanges(true)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="passwordRequireSpecialChars"
                                                name="passwordRequireSpecialChars"
                                                defaultChecked={settings?.passwordRequireSpecialChars}
                                                onCheckedChange={() => setHasChanges(true)}
                                            />
                                            <Label htmlFor="passwordRequireSpecialChars">Yêu cầu ký tự đặc biệt</Label>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="passwordRequireNumbers"
                                                name="passwordRequireNumbers"
                                                defaultChecked={settings?.passwordRequireNumbers}
                                                onCheckedChange={() => setHasChanges(true)}
                                            />
                                            <Label htmlFor="passwordRequireNumbers">Yêu cầu số</Label>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="passwordRequireUppercase"
                                                name="passwordRequireUppercase"
                                                defaultChecked={settings?.passwordRequireUppercase}
                                                onCheckedChange={() => setHasChanges(true)}
                                            />
                                            <Label htmlFor="passwordRequireUppercase">Yêu cầu chữ hoa</Label>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <h4 className="font-medium">Chống brute force</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="loginAttemptLimit">Số lần đăng nhập sai tối đa</Label>
                                            <Input
                                                id="loginAttemptLimit"
                                                name="loginAttemptLimit"
                                                type="number"
                                                min="3"
                                                max="10"
                                                defaultValue={settings?.loginAttemptLimit || 5}
                                                onChange={() => setHasChanges(true)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="loginLockoutDuration">Thời gian khóa (phút)</Label>
                                            <Input
                                                id="loginLockoutDuration"
                                                name="loginLockoutDuration"
                                                type="number"
                                                min="5"
                                                max="60"
                                                defaultValue={settings?.loginLockoutDuration || 15}
                                                onChange={() => setHasChanges(true)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* API Settings */}
                    <TabsContent value="api" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Cài đặt API</CardTitle>
                                <CardDescription>Cấu hình API và các tích hợp bên ngoài</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="apiRateLimit">Giới hạn request/phút</Label>
                                        <Input
                                            id="apiRateLimit"
                                            name="apiRateLimit"
                                            type="number"
                                            min="10"
                                            max="1000"
                                            defaultValue={settings?.apiRateLimit || 100}
                                            onChange={() => setHasChanges(true)}
                                        />
                                    </div>

                                    <div className="flex items-center space-x-2 mt-8">
                                        <Switch
                                            id="apiKeyRequired"
                                            name="apiKeyRequired"
                                            defaultChecked={settings?.apiKeyRequired}
                                            onCheckedChange={() => setHasChanges(true)}
                                        />
                                        <Label htmlFor="apiKeyRequired">Yêu cầu API key</Label>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="corsOrigins">CORS Origins (một dòng một domain)</Label>
                                    <Textarea
                                        id="corsOrigins"
                                        name="corsOrigins"
                                        defaultValue={settings?.corsOrigins?.join('\n')}
                                        placeholder="https://viettravel.com&#10;https://app.viettravel.com"
                                        rows={4}
                                        onChange={() => setHasChanges(true)}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Notification Settings */}
                    <TabsContent value="notifications" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông báo Email</CardTitle>
                                <CardDescription>Cấu hình các loại thông báo email tự động</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            name="emailNotifications.newOrder"
                                            defaultChecked={settings?.emailNotifications?.newOrder}
                                            onCheckedChange={() => setHasChanges(true)}
                                        />
                                        <Label>Đơn hàng mới</Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            name="emailNotifications.orderCancellation"
                                            defaultChecked={settings?.emailNotifications?.orderCancellation}
                                            onCheckedChange={() => setHasChanges(true)}
                                        />
                                        <Label>Hủy đơn hàng</Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            name="emailNotifications.paymentSuccess"
                                            defaultChecked={settings?.emailNotifications?.paymentSuccess}
                                            onCheckedChange={() => setHasChanges(true)}
                                        />
                                        <Label>Thanh toán thành công</Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            name="emailNotifications.paymentFailed"
                                            defaultChecked={settings?.emailNotifications?.paymentFailed}
                                            onCheckedChange={() => setHasChanges(true)}
                                        />
                                        <Label>Thanh toán thất bại</Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            name="emailNotifications.customerRegistration"
                                            defaultChecked={settings?.emailNotifications?.customerRegistration}
                                            onCheckedChange={() => setHasChanges(true)}
                                        />
                                        <Label>Khách hàng đăng ký mới</Label>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Thông báo SMS</CardTitle>
                                <CardDescription>Cấu hình dịch vụ gửi SMS</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        name="smsNotifications.enabled"
                                        defaultChecked={settings?.smsNotifications?.enabled}
                                        onCheckedChange={() => setHasChanges(true)}
                                    />
                                    <Label>Bật thông báo SMS</Label>
                                </div>

                                <div className="space-y-2">
                                    <Label>Nhà cung cấp SMS</Label>
                                    <Select name="smsNotifications.provider" defaultValue={settings?.smsNotifications?.provider}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn nhà cung cấp" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="twilio">Twilio</SelectItem>
                                            <SelectItem value="nexmo">Nexmo</SelectItem>
                                            <SelectItem value="local">Nhà cung cấp nội địa</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Booking Settings */}
                    <TabsContent value="booking" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Cài đặt đặt chỗ</CardTitle>
                                <CardDescription>Cấu hình quy trình đặt chỗ và hủy vé</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="bookingCancellationDeadline">Thời hạn hủy vé (giờ)</Label>
                                        <Input
                                            id="bookingCancellationDeadline"
                                            name="bookingCancellationDeadline"
                                            type="number"
                                            min="1"
                                            max="168"
                                            defaultValue={settings?.bookingCancellationDeadline || 24}
                                            onChange={() => setHasChanges(true)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="refundProcessingTime">Thời gian xử lý hoàn tiền (ngày)</Label>
                                        <Input
                                            id="refundProcessingTime"
                                            name="refundProcessingTime"
                                            type="number"
                                            min="1"
                                            max="30"
                                            defaultValue={settings?.refundProcessingTime || 7}
                                            onChange={() => setHasChanges(true)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="maxAdvanceBookingDays">Số ngày đặt trước tối đa</Label>
                                        <Input
                                            id="maxAdvanceBookingDays"
                                            name="maxAdvanceBookingDays"
                                            type="number"
                                            min="30"
                                            max="365"
                                            defaultValue={settings?.maxAdvanceBookingDays || 90}
                                            onChange={() => setHasChanges(true)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="bookingConfirmationRequired"
                                            name="bookingConfirmationRequired"
                                            defaultChecked={settings?.bookingConfirmationRequired}
                                            onCheckedChange={() => setHasChanges(true)}
                                        />
                                        <Label htmlFor="bookingConfirmationRequired">Yêu cầu xác nhận đặt chỗ</Label>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Cài đặt khách hàng</CardTitle>
                                <CardDescription>Cấu hình đăng ký và xác thực khách hàng</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            name="customerRegistrationEnabled"
                                            defaultChecked={settings?.customerRegistrationEnabled}
                                            onCheckedChange={() => setHasChanges(true)}
                                        />
                                        <Label>Cho phép khách hàng đăng ký</Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            name="customerEmailVerificationRequired"
                                            defaultChecked={settings?.customerEmailVerificationRequired}
                                            onCheckedChange={() => setHasChanges(true)}
                                        />
                                        <Label>Yêu cầu xác thực email</Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            name="customerPhoneVerificationRequired"
                                            defaultChecked={settings?.customerPhoneVerificationRequired}
                                            onCheckedChange={() => setHasChanges(true)}
                                        />
                                        <Label>Yêu cầu xác thực số điện thoại</Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            name="loyaltyProgramEnabled"
                                            defaultChecked={settings?.loyaltyProgramEnabled}
                                            onCheckedChange={() => setHasChanges(true)}
                                        />
                                        <Label>Bật chương trình khách hàng thân thiết</Label>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Advanced Settings */}
                    <TabsContent value="advanced" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Maintenance Mode</CardTitle>
                                <CardDescription>Tạm ngưng hoạt động website để bảo trì</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="maintenanceMode"
                                        name="maintenanceMode"
                                        defaultChecked={settings?.maintenanceMode}
                                        onCheckedChange={() => setHasChanges(true)}
                                    />
                                    <Label htmlFor="maintenanceMode">Bật chế độ bảo trì</Label>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="maintenanceMessage">Thông báo bảo trì</Label>
                                    <Textarea
                                        id="maintenanceMessage"
                                        name="maintenanceMessage"
                                        defaultValue={settings?.maintenanceMessage}
                                        placeholder="Website đang trong quá trình bảo trì. Vui lòng quay lại sau."
                                        rows={3}
                                        onChange={() => setHasChanges(true)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Performance</CardTitle>
                                <CardDescription>Cài đặt hiệu suất và cache</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            name="cacheEnabled"
                                            defaultChecked={settings?.cacheEnabled}
                                            onCheckedChange={() => setHasChanges(true)}
                                        />
                                        <Label>Bật cache</Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            name="cdnEnabled"
                                            defaultChecked={settings?.cdnEnabled}
                                            onCheckedChange={() => setHasChanges(true)}
                                        />
                                        <Label>Bật CDN</Label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Cache Driver</Label>
                                        <Select name="cacheDriver" defaultValue={settings?.cacheDriver || "memory"}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="memory">Memory</SelectItem>
                                                <SelectItem value="redis">Redis</SelectItem>
                                                <SelectItem value="file">File</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="cdnUrl">CDN URL</Label>
                                        <Input
                                            id="cdnUrl"
                                            name="cdnUrl"
                                            defaultValue={settings?.cdnUrl}
                                            placeholder="https://cdn.viettravel.com"
                                            onChange={() => setHasChanges(true)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Backup & Recovery</CardTitle>
                                <CardDescription>Cài đặt sao lưu dữ liệu tự động</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        name="backupEnabled"
                                        defaultChecked={settings?.backupEnabled}
                                        onCheckedChange={() => setHasChanges(true)}
                                    />
                                    <Label>Bật sao lưu tự động</Label>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Tần suất sao lưu</Label>
                                        <Select name="backupFrequency" defaultValue={settings?.backupFrequency || "daily"}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="daily">Hàng ngày</SelectItem>
                                                <SelectItem value="weekly">Hàng tuần</SelectItem>
                                                <SelectItem value="monthly">Hàng tháng</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="backupRetention">Lưu trữ (ngày)</Label>
                                        <Input
                                            id="backupRetention"
                                            name="backupRetention"
                                            type="number"
                                            min="7"
                                            max="365"
                                            defaultValue={settings?.backupRetention || 30}
                                            onChange={() => setHasChanges(true)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Vị trí lưu trữ</Label>
                                        <Select name="backupLocation" defaultValue={settings?.backupLocation || "local"}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="local">Local</SelectItem>
                                                <SelectItem value="s3">Amazon S3</SelectItem>
                                                <SelectItem value="gcs">Google Cloud Storage</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-2 pt-6 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => window.location.reload()}
                    >
                        Hủy thay đổi
                    </Button>
                    <Button
                        type="submit"
                        loading={updateSettingsMutation.isPending}
                        disabled={!hasChanges}
                    >
                        <Save className="h-4 w-4 mr-2" />
                        Lưu cài đặt
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default SystemSettings;
