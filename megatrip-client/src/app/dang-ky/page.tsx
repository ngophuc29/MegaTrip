"use client"
import PlaceholderPage from '../components/PlaceholderPage';
import { UserPlus } from 'lucide-react';

export default function Page() {
  return (
    <PlaceholderPage
      title="Đăng ký"
      description="Tạo tài khoản mới để trải nghiệm đầy đủ các tính năng"
      icon={UserPlus}
    />
  );
}
