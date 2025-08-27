"use client"
import { useState } from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuLink,
} from './ui/navigation-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import {
  Search,
  ShoppingCart,
  Bell,
  User,
  Menu,
  Plane,
  Bus,
  Map,
  Percent,
  Newspaper,
  HelpCircle,
} from 'lucide-react';

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link prefetch={false}  href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary))]">
              <Plane className="h-5 w-5 text-[hsl(var(--primary-foreground))]" />
            </div>
            <span className="text-xl font-bold text-[hsl(var(--primary))]">MegaTrip</span>
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList className="flex space-x-6">
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link prefetch={false} 
                    href="/"
                    className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
                  >
                    Trang chủ
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link prefetch={false} 
                    href="/ve-may-bay"
                    className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
                  >
                    <Plane className="h-4 w-4" />
                    <span>Vé máy bay</span>
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link prefetch={false} 
                    href="/xe-du-lich"
                    className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
                  >
                    <Bus className="h-4 w-4" />
                    <span>Xe du lịch</span>
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link prefetch={false} 
                    href="/tour"
                    className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
                  >
                    <Map className="h-4 w-4" />
                    <span>Tour</span>
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link prefetch={false} 
                    href="/khuyen-mai"
                    className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
                  >
                    <Percent className="h-4 w-4" />
                    <span>Khuyến mãi</span>
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link prefetch={false} 
                    href="/tin-tuc"
                    className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
                  >
                    <Newspaper className="h-4 w-4" />
                    <span>Tin tức</span>
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link prefetch={false} 
                    href="/ho-tro"
                    className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
                  >
                    <HelpCircle className="h-4 w-4" />
                    <span>Hỗ trợ</span>
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex items-center space-x-2 flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm nhanh..."
                className="pl-10"
                onClick={() => setIsSearchOpen(true)}
              />
            </div>
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-2">
            {/* Mobile search */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="sm" asChild>
              <Link prefetch={false}  href="/gio-hang">
                <ShoppingCart className="h-5 w-5" />
                <span className="sr-only">Giỏ hàng</span>
              </Link>
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="sm">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Thông báo</span>
            </Button>

            {/* User Account */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Tài khoản</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link prefetch={false}  href="/dang-nhap">Đăng nhập</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link prefetch={false}  href="/dang-ky">Đăng ký</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-4 mt-4">
                  <Link prefetch={false} 
                    href="/"
                    className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors"
                  >
                    <span>Trang chủ</span>
                  </Link>
                  <Link prefetch={false} 
                    href="/ve-may-bay"
                    className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors"
                  >
                    <Plane className="h-4 w-4" />
                    <span>Vé máy bay</span>
                  </Link>
                  <Link prefetch={false} 
                    href="/xe-du-lich"
                    className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors"
                  >
                    <Bus className="h-4 w-4" />
                    <span>Xe du lịch</span>
                  </Link>
                  <Link prefetch={false} 
                    href="/tour"
                    className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors"
                  >
                    <Map className="h-4 w-4" />
                    <span>Tour</span>
                  </Link>
                  <Link prefetch={false} 
                    href="/khuyen-mai"
                    className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors"
                  >
                    <Percent className="h-4 w-4" />
                    <span>Khuyến mãi</span>
                  </Link>
                  <Link prefetch={false} 
                    href="/tin-tuc"
                    className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors"
                  >
                    <Newspaper className="h-4 w-4" />
                    <span>Tin tức</span>
                  </Link>
                  <Link prefetch={false} 
                    href="/ho-tro"
                    className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors"
                  >
                    <HelpCircle className="h-4 w-4" />
                    <span>Hỗ trợ</span>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
