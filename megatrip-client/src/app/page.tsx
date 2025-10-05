'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../app/components/Layout';
import TravelokaBanner from '../app/components/TravelokaBanner';
import LiveStats from '../app/components/LiveStats';
import { Button } from '../app/components/ui/button';
import { Badge } from '../app/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../app/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../app/components/ui/carousel';
import {
  Plane,
  Bus,
  Map,
  Star,
  Clock,
  Users,
  Shield,
  CreditCard,
  HeadphonesIcon,
  CheckCircle,
  Calendar,
  ChevronRight,
  MapPin,
  Timer,
} from 'lucide-react';
import TourResults from './tour/TourResults';

const banners = [
  {
    id: 1,
    title: 'Khuyến mãi đặc biệt - Giảm 30%',
    subtitle: 'Vé máy bay nội địa',
    image: '/placeholder.svg',
    cta: 'Đặt ngay',
  },
  {
    id: 2,
    title: 'Tour miền Trung',
    subtitle: 'Từ 2.990.000₫/khách',
    image: '/placeholder.svg',
    cta: 'Khám phá',
  },
  {
    id: 3,
    title: 'Xe giường nằm VIP',
    subtitle: 'Thoải mái như ở nhà',
    image: '/placeholder.svg',
    cta: 'Đặt chỗ',
  },
];

const quickCategories = [
  {
    icon: Plane,
    title: 'Vé máy bay',
    description: 'Đặt vé máy bay nội địa với giá tốt nhất',
    link: '/ve-may-bay',
    color: 'bg-blue-500',
  },
  {
    icon: Bus,
    title: 'Xe du lịch',
    description: 'Xe giường nằm và ghế ngồi chất lượng cao',
    link: '/xe-du-lich',
    color: 'bg-green-500',
  },
  {
    icon: Map,
    title: 'Tour du lịch',
    description: 'Khám phá Việt Nam với các gói tour hấp dẫn',
    link: '/tour',
    color: 'bg-purple-500',
  },
];

const promotions = [
  {
    id: 1,
    title: 'Giảm 300K cho vé bay',
    discount: '30%',
    description: 'Áp dụng cho chuyến bay nội địa',
    validUntil: '31/12/2024',
    code: 'FLIGHT30',
  },
  {
    id: 2,
    title: 'Tour miền Bắc giá sốc',
    discount: '25%',
    description: 'Hà Nội - Sapa - Hạ Long 3N2Đ',
    validUntil: '15/01/2025',
    code: 'NORTH25',
  },
  {
    id: 3,
    title: 'Xe limousine giảm giá',
    discount: '20%',
    description: 'Tuyến TP.HCM - Đà Lạt',
    validUntil: '28/12/2024',
    code: 'BUS20',
  },
];

const featuredTours = [
  {
    id: 1,
    name: 'Đà Nẵng - Hội An - Bà Nà 3N2Đ',
    departure: 'TP. Hồ Chí Minh',
    duration: '3 ngày 2 đêm',
    price: 'từ 3.990.000₫',
    rating: 4.8,
    reviews: 245,
    image: '/placeholder.svg',
    badge: 'Sale 20%',
  },
  {
    id: 2,
    name: 'Hà Nội - Sapa - Fansipan 4N3Đ',
    departure: 'Hà Nội',
    duration: '4 ngày 3 đêm',
    price: 'từ 4.590.000₫',
    rating: 4.9,
    reviews: 182,
    image: '/placeholder.svg',
    badge: 'Hot',
  },
  {
    id: 3,
    name: 'Phú Quốc thiên đường biển 3N2Đ',
    departure: 'TP. Hồ Chí Minh',
    duration: '3 ngày 2 đêm',
    price: 'từ 5.290.000₫',
    rating: 4.7,
    reviews: 328,
    image: '/placeholder.svg',
    badge: 'Mới',
  },
  {
    id: 4,
    name: 'Nha Trang - Đà Lạt 4N3Đ',
    departure: 'TP. Hồ Chí Minh',
    duration: '4 ngày 3 đêm',
    price: 'từ 4.190.000₫',
    rating: 4.6,
    reviews: 156,
    image: '/placeholder.svg',
    badge: 'Sale 15%',
  },
];

const popularFlights = [
  {
    route: 'SGN - HAN',
    airline: 'Vietnam Airlines',
    price: 'từ 1.990.000₫',
    cities: 'TP.HCM → Hà Nội',
  },
  {
    route: 'HAN - SGN',
    airline: 'VietJet Air',
    price: 'từ 1.790.000₫',
    cities: 'Hà Nội → TP.HCM',
  },
  
  {
    route: 'HAN - DAD',
    airline: 'Bamboo Airways',
    price: 'từ 1.690.000₫',
    cities: 'Hà Nội → Đà Nẵng',
  },
];

const popularBuses = [
  {
    route: 'TP.HCM - Đà Lạt',
    company: 'Phương Trang',
    type: 'Giường nằm VIP',
    duration: '6-7 giờ',
    price: 'từ 350.000₫',
  },
  {
    route: 'TP.HCM - Nha Trang',
    company: 'Sinh Tourist',
    type: 'Ghế ngồi',
    duration: '8-9 giờ',
    price: 'từ 280.000₫',
  },
  {
    route: 'Hà Nội - Sapa',
    company: 'Sapa Express',
    type: 'Giường nằm',
    duration: '5-6 giờ',
    price: 'từ 400.000₫',
  },
];

const whyChooseUs = [
  {
    icon: Shield,
    title: 'Giá minh bạch',
    description: 'Không phí ẩn, giá hiển thị là giá cuối cùng',
  },
  {
    icon: HeadphonesIcon,
    title: 'Hỗ trợ 24/7',
    description: 'Đội ngũ tư vấn sẵn sàng hỗ trợ bạn mọi lúc',
  },
  {
    icon: CreditCard,
    title: 'Thanh toán đa dạng',
    description: 'Hỗ trợ nhiều phương thức thanh toán tiện lợi',
  },
  {
    icon: CheckCircle,
    title: 'Bảo mật tuyệt đối',
    description: 'Thông tin cá nhân được bảo vệ an toàn',
  },
  {
    icon: Users,
    title: 'Đổi/hủy rõ ràng',
    description: 'Chính sách đổi/hủy minh bạch, dễ hiểu',
  },
  {
    icon: Star,
    title: 'Mạng lưới rộng khắp',
    description: 'Hợp tác với nhiều hãng & nhà cung cấp trên toàn quốc',
  },
];

const latestNews = [
  {
    id: 1,
    title: 'Hàng không mở lại đường bay mới đến Côn Đảo',
    category: 'Thông báo hãng',
    date: '28/12/2024',
    image: '/placeholder.svg',
  },
  {
    id: 2,
    title: '5 điểm đến không thể bỏ qua trong dịp Tết Nguyên Đán',
    category: 'Mẹo du lịch',
    date: '27/12/2024',
    image: '/placeholder.svg',
  },
  {
    id: 3,
    title: 'Cập nhật lịch trình xe khách dịp cuối năm',
    category: 'Thông báo',
    date: '26/12/2024',
    image: '/placeholder.svg',
  },
];

export default function Index() {
  const [currentBanner, setCurrentBanner] = useState(0);
  // recently viewed tours state
  const [recentTours, setRecentTours] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const toggleFavorite = (id: any) => {
    setFavorites(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem('recentTours');
    if (!raw) return;
    let ids: string[] = [];
    try {
      ids = JSON.parse(raw);
    } catch (e) { ids = []; }
    if (!Array.isArray(ids) || ids.length === 0) return;
    ids = ids.slice(0, 6);

    // fetch each slug/id from backend; tolerate different response shapes
    (async () => {
      try {
        const res = await fetch('http://localhost:8080/api/tours/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slugs: ids })
        });
        if (!res.ok) return;
        const json = await res.json();
        // json.data is ordered array (some elements may be null)
        const data = Array.isArray(json.data) ? json.data : [];
        setRecentTours(data); // keep raw DB-like objects, map later
      } catch (e) {
        // ignore
      }
    })();
  }, []);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // map batch API shape -> TourResults expected list item shape
  const mappedRecent = recentTours.map((db: any, i: number) => {
    if (!db) return null;
    const id = db._id?.$oid ?? db._id ?? db.id ?? (db.slug ?? `recent-${i}`);
    const images = Array.isArray(db.images) && db.images.length ? db.images : (db.image ? [db.image] : ['/placeholder.svg']);
    const startDates = Array.isArray(db.startDates) ? db.startDates : (Array.isArray(db.availableDates) ? db.availableDates : []);
    const availableDates = startDates.slice(0, 30).map((d: any) => (typeof d === 'string' ? d : (d.date || d.$date || d)));
    const durationStr = typeof db.duration === 'number' ? `${db.duration} ngày ${db.duration > 1 ? `${db.duration - 1} đêm` : 'đêm'}` : (db.duration ?? '');
    return {
      id,
      slug: db.slug ?? id,
      name: db.name ?? 'Tour',
      departure: db.departureFrom ?? db.startLocation?.address ?? db.departure ?? '',
      duration: durationStr,
      priceFrom: Number(db.adultPrice ?? db.priceFrom ?? 0),
      originalPrice: Number(db.originalPrice ?? db.listPrice ?? 0) || undefined,
      images,
      availableDates: availableDates,
      highlights: db.highlights || [],
      includes: db.services || db.includes || [],
      transport: db.transport || '',
      hotel: db.hotel || '',
      meals: db.meals || '',
      maxGroup: db.maxGroupSize ?? db.maxGroup ?? 0,
      rating: db.ratingsAverage ?? db.rating ?? 0,
      reviews: db.ratingsQuantity ?? db.reviews ?? 0,
      badge: db.badge ?? '',
      badgeColor: db.badgeColor ?? 'default',
    };
  }).filter(Boolean);
  return (
    <>
      {/* Traveloka-style Banner */}
      <TravelokaBanner />

      {/* Quick Categories */}
      <section className="py-12 lg:py-16">
        <div className="container">
          <h2 className="text-2xl lg:text-3xl font-bold text-center mb-8">
            Đặt ngay dịch vụ du lịch
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickCategories.map((category) => (
              <Link prefetch={false}
                key={category.title}
                href={category.link}
                className="group block"
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${category.color} text-white mb-4 group-hover:scale-110 transition-transform`}>
                      <category.icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                    <p className="text-muted-foreground">{category.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Promotions */}
      <section className="py-12 lg:py-16 bg-gray-50">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold">Ưu đãi & Khuyến mãi Hot</h2>
            <Button variant="outline" asChild>
              <Link prefetch={false} href="/khuyen-mai">
                Xem tất cả
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promotions.map((promo) => (
              <Card key={promo.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="destructive" className="text-lg font-bold">
                      -{promo.discount}
                    </Badge>
                    <Badge variant="outline">
                      Hết hạn: {promo.validUntil}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{promo.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">{promo.description}</p>
                  <div className="flex items-center justify-between">
                    <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                      {promo.code}
                    </code>
                    <Button size="sm" variant="destructive">Sử dụng ngay</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tours */}
      <section className="py-12 lg:py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold">Tour nổi bật</h2>
            <Button variant="outline" asChild>
              <Link prefetch={false} href="/tour">
                Xem tất cả
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredTours.map((tour) => (
              <Card key={tour.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={tour.image}
                    alt={tour.name}
                    className="w-full h-48 object-cover"
                  />
                  <Badge className="absolute top-2 left-2" variant="secondary">
                    {tour.badge}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2">{tour.name}</h3>
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {tour.departure}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <Timer className="h-4 w-4 mr-1" />
                    {tour.duration}
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="text-sm font-medium">{tour.rating}</span>
                      <span className="text-sm text-muted-foreground ml-1">
                        ({tour.reviews})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-[hsl(var(--primary))]">{tour.price}</span>
                    </div>
                    <Button size="sm">Xem chi tiết</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tour du lịch bạn đã xem gần đây */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold">Tour bạn đã xem gần đây</h2>
            <Button variant="outline" size="sm" onClick={() => { localStorage.removeItem('recentTours'); setRecentTours([]); }}>
              Xóa
            </Button>
          </div>
          {mappedRecent.length ? (
            <TourResults
              isLoading={false}
              sortedTours={mappedRecent}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              formatPrice={formatPrice}
            />
          ) : (
            <div className="text-[hsl(var(--muted-foreground))]">Chưa có tour nào được xem gần đây.</div>
          )}
        </div>
      </section>

      {/* Popular Flights & Buses */}
      <section className="py-12 lg:py-16 bg-gray-50">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Popular Flights */}
            <div>
              <h3 className="text-xl lg:text-2xl font-bold mb-6">Chuyến bay phổ biến</h3>
              <div className="space-y-4">
                {popularFlights.map((flight, index) => (
                  <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{flight.cities}</div>
                        <div className="text-sm text-muted-foreground">{flight.airline}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[hsl(var(--primary))]">{flight.price}</div>
                        <Button size="sm" variant="outline" className="mt-1">
                          Đặt ngay
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Popular Buses */}
            <div>
              <h3 className="text-xl lg:text-2xl font-bold mb-6">Tuyến xe được đặt nhiều</h3>
              <div className="space-y-4">
                {popularBuses.map((bus, index) => (
                  <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{bus.route}</div>
                        <div className="text-sm text-muted-foreground">
                          {bus.company} • {bus.type} • {bus.duration}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[hsl(var(--primary))]">{bus.price}</div>
                        <Button size="sm" variant="outline" className="mt-1">
                          Đặt chỗ
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Statistics and Trust Indicators */}
      <section className="py-12 lg:py-16">
        <div className="container">
          <LiveStats />
        </div>
      </section>

      {/* Why Choose Us (widget removed; layout adjusted) */}
      <section className="py-12 lg:py-16 bg-gray-50">
        <div className="container">
          <h2 className="text-2xl lg:text-3xl font-bold mb-8 text-center">
            Tại sao chọn MegaTrip?
          </h2>
          <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyChooseUs.map((item, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: 'hsl(var(--primary))/0.1', color: 'hsl(var(--primary))' }}>
                  <item.icon className="h-8 w-8" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="mb-8 bg-gray-50">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold">Tin tức & Blog</h2>
            <Button variant="outline" asChild>
              <Link prefetch={false} href="/tin-tuc">
                Xem tất cả
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestNews.map((article) => (
              <Card key={article.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {article.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{article.date}</span>
                  </div>
                  <h3 className="font-semibold line-clamp-2 mb-2">{article.title}</h3>
                  <Button variant="ghost" className="p-0 h-auto text-[hsl(var(--primary))]">
                    Đọc thêm →
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>

  );
}
