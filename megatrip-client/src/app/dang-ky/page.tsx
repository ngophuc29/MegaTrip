"use client"
import { useState } from 'react';
import Link from 'next/link';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { UserPlus, Mail, ShieldCheck } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

export default function DangKy() {
  const [step, setStep] = useState<'form' | 'otp' | 'done'>('form');
  const [form, setForm] = useState({ email: '', password: '', confirm: '' });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Giả lập gửi mail OTP
  const handleRegister = async (e: any) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.email || !form.password || !form.confirm) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    setStep('otp');
    setSuccess('Mã OTP đã được gửi tới email của bạn.');
  };

  // Giả lập xác thực OTP
  const handleVerifyOtp = (e: any) => {
    e.preventDefault();
    setError('');
    if (otp !== '123456') {
      setError('Mã OTP không đúng. Vui lòng kiểm tra lại.');
      return;
    }
    setSuccess('Đăng ký thành công!');
    setStep('done');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative" style={{ background: 'url(/bg_signInUp.jpeg) center/cover no-repeat' }}>
      {/* Logo góc trên trái */}
      <div className="absolute top-0 left-0 z-20 p-6">
        <span className="font-extrabold text-2xl lg:text-2xl" style={{ color: 'hsl(var(--primary))' }}>MegaTrip</span>
      </div>
      {/* Overlay */}
       
      <div className="relative z-10 w-full max-w-6xl flex flex-col lg:flex-row items-center justify-between h-full">
        {/* Slogan bên trái */}
        <div className="hidden lg:flex flex-1 items-center justify-center h-full">
          <div className="text-white text-5xl font-extrabold leading-tight text-left drop-shadow-xl">
            Khám Phá Việt Nam,<br />
            Trải Nghiệm Trong Tầm Tay Bạn.
          </div>
        </div>
        {/* Form bên phải */}
        <div className="w-full max-w-md mx-auto lg:mr-16">
          <div className="mb-4 flex justify-start lg:justify-start">
            <a href="/" className="text-base font-semibold" style={{ color: 'hsl(var(--primary))' }}>← Trở về trang chủ</a>
          </div>
          <Card className="shadow-2xl rounded-3xl border-0 bg-white/95 backdrop-blur-lg" style={{ borderColor: 'hsl(var(--primary))', boxShadow: '0 8px 32px hsl(var(--primary-200) / 0.15)' }}>
            <CardHeader className="pb-2 text-center">
              <CardTitle className="text-2xl font-bold mb-1" style={{ color: 'hsl(var(--primary))' }}>Đăng ký tài khoản</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 pb-6">
              {step === 'form' && (
                <form className="space-y-5" onSubmit={handleRegister}>
                  <div>
                    <Label htmlFor="email" className="font-semibold">Email/Số điện thoại di động</Label>
                    <Input id="email" type="email" placeholder="Ví dụ: +84901234567 hoặc yourname@email.com" className="rounded-full focus-ring bg-[hsl(var(--muted))] border border-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]" required autoFocus />
                  </div>
                  <div>
                    <Label htmlFor="password" className="font-semibold">Mật khẩu</Label>
                    <Input id="password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="rounded-full focus-ring bg-[hsl(var(--muted))] border border-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]" required />
                  </div>
                  <div>
                    <Label htmlFor="confirm" className="font-semibold">Xác nhận mật khẩu</Label>
                    <Input id="confirm" type="password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} className="rounded-full focus-ring bg-[hsl(var(--muted))] border border-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]" required />
                  </div>
                  {error && <div className="text-red-600 text-sm text-center">{error}</div>}
                  <Button type="submit" className="w-full mt-2 rounded-full font-semibold text-lg py-2" style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', border: '1px solid hsl(var(--primary))' }}>Đăng ký</Button>
                  <div className="text-center text-sm mt-2">
                    Đã có tài khoản?{' '}
                    <Link href="/dang-nhap" className="text-primary font-medium hover:underline">Đăng nhập</Link>
                  </div>
                </form>
              )}
              {step === 'otp' && (
                <form className="space-y-5" onSubmit={handleVerifyOtp}>
                  <div className="flex items-center gap-2 justify-center mb-2">
                    <Mail className="h-5 w-5 text-primary" />
                    <span className="font-medium">Nhập mã OTP đã gửi tới email</span>
                  </div>
                  <Input id="otp" value={otp} onChange={e => setOtp(e.target.value)} placeholder="Nhập mã OTP" required autoFocus className="rounded-full focus-ring bg-[hsl(var(--muted))] border border-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]" />
                  {error && <div className="text-red-600 text-sm text-center">{error}</div>}
                  {success && <div className="text-green-600 text-sm text-center">{success}</div>}
                  <Button type="submit" className="w-full mt-2 rounded-full font-semibold text-lg py-2" style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', border: '1px solid hsl(var(--primary))' }}>Xác nhận OTP</Button>
                </form>
              )}
              {step === 'done' && (
                <div className="text-center space-y-4 py-6">
                  <ShieldCheck className="h-12 w-12 text-success mx-auto mb-2" />
                  <div className="text-success font-bold text-lg">Đăng ký thành công!</div>
                  <div className="text-sm text-muted-foreground">Bạn có thể đăng nhập để sử dụng dịch vụ.</div>
                  <Link href="/dang-nhap" className="inline-block mt-2 text-primary font-medium hover:underline">Đăng nhập ngay</Link>
                </div>
              )}
              <div className="my-4 w-full flex items-center">
                <span className="flex-1 h-px bg-[hsl(var(--primary))]"></span>
                <span className="px-3 text-xs text-muted-foreground">hoặc đăng ký với</span>
                <span className="flex-1 h-px bg-[hsl(var(--primary))]"></span>
              </div>
              <Button
                type="button"
                className="w-full flex items-center justify-center gap-2 rounded-full font-bold shadow transition px-4 py-3 border text-base"
                style={{ background: 'hsl(var(--primary-50))', color: 'hsl(var(--primary-700))', borderColor: 'hsl(var(--primary))' }}
                onClick={() => alert('Google login demo')}
              >
                <span className="flex-1  "
                style={{ marginLeft: '49px' }}
                >Google</span>
                <span className="flex items-center justify-center rounded-full bg-white w-8 h-8 ml-2">
                  <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
                    <g>
                      <path d="M44.5 20H24V28.5H36.1C35.1 32.1 31.8 34.5 28 34.5C23.3 34.5 19.5 30.7 19.5 26C19.5 21.3 23.3 17.5 28 17.5C29.7 17.5 31.2 18.1 32.4 19.1L37.2 14.3C34.7 12.2 31.5 11 28 11C20.3 11 14 17.3 14 25C14 32.7 20.3 39 28 39C35.7 39 42 32.7 42 25C42 23.7 41.8 22.4 41.5 21.2L44.5 20Z" fill="#4285F4" />
                      <path d="M6.3 14.7L12.1 18.7C13.7 15.7 16.6 13.5 20 13.5C22.1 13.5 24.1 14.3 25.7 15.7L31.1 10.3C28.2 7.8 24.3 6 20 6C13.2 6 7.3 10.7 6.3 14.7Z" fill="#34A853" />
                      <path d="M20 41C24.3 41 28.2 39.2 31.1 36.7L25.7 31.3C24.1 32.7 22.1 33.5 20 33.5C16.6 33.5 13.7 31.3 12.1 28.3L6.3 32.3C7.3 36.3 13.2 41 20 41Z" fill="#FBBC05" />
                      <path d="M41.5 21.2L44.5 20C43.7 17.2 42.1 14.7 39.9 12.9L34.7 17.7C35.7 18.7 36.5 19.9 37.2 21.2L41.5 21.2Z" fill="#EA4335" />
                    </g>
                  </svg>
                </span>
              </Button>
              <div className="text-xs text-muted-foreground text-center mt-6">
                Bằng cách tiếp tục, bạn đồng ý với <Link href="/dieu-khoan" className="text-primary underline">Điều khoản</Link> và <Link href="/dieu-kien" className="text-primary underline">Điều kiện</Link> này và bạn đã được thông báo về <Link href="/chinh-sach-bao-mat" className="text-primary underline">Chính sách bảo vệ dữ liệu</Link> của chúng tôi.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
