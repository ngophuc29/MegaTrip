"use client"
import PlaceholderPage from '../components/PlaceholderPage';
import { LogIn } from 'lucide-react';

export default function Page() {
  return (
    <PlaceholderPage
      title="Đăng nhập"
      description="Đăng nhập vào tài khoản để quản lý đặt chỗ và ưu đãi"
      icon={LogIn}
    />
  );
}
