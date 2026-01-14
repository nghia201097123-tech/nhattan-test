'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spin } from 'antd';
import { useAuthStore } from '@/store/auth.store';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, isHydrated, loadUser } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Đợi hydration hoàn thành trước khi kiểm tra
    if (!isHydrated) return;

    // Nếu đã authenticated, không cần load lại
    if (isAuthenticated) {
      setIsChecking(false);
      return;
    }

    // Chỉ gọi loadUser nếu chưa authenticated
    loadUser().finally(() => setIsChecking(false));
  }, [isHydrated, isAuthenticated, loadUser]);

  useEffect(() => {
    if (!isChecking && !isLoading && !isAuthenticated && isHydrated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, isChecking, isHydrated, router]);

  // Đang đợi hydration hoặc đang kiểm tra
  if (!isHydrated || isChecking || isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
