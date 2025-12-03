"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { LogIn } from 'lucide-react';
import auth from '../../apis/auth';

// Thêm import
import { toast } from 'sonner';
export default function DangNhap() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [checked, setChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get('redirect') || '/';


  // Check if already logged in and redirect without rendering
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      router.replace('/');
    }
    else {
      setChecked(true);
    }
  }, [router]);
  if (!checked) return null;
  const handleLogin = async (e: any) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.email || !form.password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    setIsLoading(true);
    
    try {
      const res: any = await auth.login({ email: form.email, password: form.password });
      const token = res?.accessToken ?? res?.token ?? res?.data?.accessToken;
      if (token) {
        localStorage.setItem('accessToken', token);
        try {
          const maxAge = 7 * 24 * 60 * 60;
          const secure = window.location.protocol === 'https:' ? '; Secure' : '';
          document.cookie = `accessToken=${token}; path=/; max-age=${maxAge}${secure}`;
        } catch (e) { }
        if (res.user) localStorage.setItem('user', JSON.stringify(res.user));

        // Check if user needs to complete profile
        try {
          const userProfile: any = await auth.me();
          const needsProfileUpdate = !userProfile.name || !userProfile.address || !userProfile.phone;

          if (needsProfileUpdate) {
            // Chuyển đến cập nhật thông tin, và sau đó có thể redirect
            router.push(`/cap-nhat-thong-tin?redirect=${encodeURIComponent(redirect)}`);
          } else {
            // Hiển thị toast và chuyển đến redirect
            toast.success('Đăng nhập thành công! Đang chuyển về trang trước...');
            router.push(redirect);
          }
        } catch (profileErr) {
          // Nếu không lấy được profile, giả sử cần cập nhật
          router.push(`/cap-nhat-thong-tin?redirect=${encodeURIComponent(redirect)}`);
        }
      } else {
        setError('Đăng nhập thành công nhưng không nhận được token');
      }
    } catch (err: any) {
      setError(err?.message || 'Lỗi khi đăng nhập');
    } finally {
      setIsLoading(false);
    }

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
          <Card className="shadow-2xl rounded-3xl border" style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--primary))', boxShadow: '0 8px 32px hsl(var(--primary-200) / 0.15)' }}>
            <CardHeader className="pb-2 text-center">
              <CardTitle className="text-2xl font-bold mb-1" style={{ color: 'hsl(var(--primary))' }}>Đăng nhập</CardTitle>
              <div className="text-muted-foreground text-sm">Đăng nhập để quản lý đặt chỗ và ưu đãi</div>
            </CardHeader>
            <CardContent className="pt-2 pb-6">
              <form className="space-y-5" onSubmit={handleLogin}>
                <div>
                  <Label htmlFor="email" className="font-semibold">Email/Số điện thoại di động</Label>
                  <Input id="email" type="email" placeholder="Ví dụ: +84901234567 hoặc yourname@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="rounded-full focus-ring bg-[hsl(var(--muted))] border border-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]" required autoFocus />
                </div>
                <div>
                  <Label htmlFor="password" className="font-semibold">Mật khẩu</Label>
                  <Input id="password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="rounded-full focus-ring bg-[hsl(var(--muted))] border border-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]" required />
                </div>
                {error && <div className="text-red-600 text-sm text-center">{error}</div>}
                {success && <div className="text-green-600 text-sm text-center">{success}</div>}
                {/* <Button type="submit" className="w-full mt-2 rounded-full font-semibold text-lg py-2" style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', border: '1px solid hsl(var(--primary))' }}>Đăng nhập</Button> */}
                <Button type="submit" className="w-full mt-2 rounded-full font-semibold text-lg py-2" disabled={isLoading} style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', border: '1px solid hsl(var(--primary))' }}>
                  {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </Button>
                <div className="text-center text-sm mt-2">
                  Chưa có tài khoản?{' '}
                  <Link href="/dang-ky" className="text-primary font-medium hover:underline">Đăng ký ngay</Link>
                </div>
              <div className="text-center text-sm mt-2">
                <Link href="/quen-mat-khau" className="text-primary font-medium hover:underline">Quên mật khẩu?</Link>
              </div>
              </form>
              <div className="my-4 w-full flex items-center">
                <span className="flex-1 h-px bg-[hsl(var(--primary))]"></span>
                <span className="px-3 text-xs text-muted-foreground">hoặc đăng nhập với</span>
                <span className="flex-1 h-px bg-[hsl(var(--primary))]"></span>
              </div>

              {/* <Button
                type="button"
                className="w-full flex items-center justify-center gap-2 rounded-full font-bold shadow transition px-4 py-3 border text-base"
                style={{ background: 'hsl(var(--primary-50))', color: 'hsl(var(--primary-700))', borderColor: 'hsl(var(--primary))' }}
                onClick={() => alert('Google login demo')}
              >

                <span className="flex-1 "
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
              </Button> */}


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
