'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Badge } from '../components/ui/badge';
import {
  Plane,
  Bus,
  MapPin,
  Calendar as CalendarIcon,
  Users,
  ArrowUpDown,
  Plus,
  Search,
  Star,
  Hotel,
  Car,
  UtensilsCrossed,
  Gift,
  Minus
} from 'lucide-react';
import { cn } from '../lib/utils';

const tabs = [
  {
    id: 'flights',
    label: 'Vé máy bay',
    icon: Plane,
    active: true
  },
  {
    id: 'buses',
    label: 'Xe khách',
    icon: Bus,
    active: false
  },
  {
    id: 'tours',
    label: 'Tour du lịch',
    icon: MapPin,
    active: false
  }
];

const popularDestinations = [
  'TP. Hồ Chí Minh',
  'Hà Nội',
  'Đà Nẵng',
  'Nha Trang',
  'Đà Lạt',
  'Phú Quốc'
];

const quickActions = [
  {
    icon: MapPin,
    title: 'Tìm điểm đến',
    subtitle: 'Khám phá địa điểm mới'
  },
  {
    icon: Star,
    title: 'Ưu đãi hot',
    subtitle: 'Giảm đến 50%'
  },
  {
    icon: Users,
    title: 'Đặt nhóm',
    subtitle: 'Tiết kiệm hơn'
  }
];

const sidebarPromotions = [
  {
    id: 1,
    title: 'Giảm 30% Vé máy bay',
    subtitle: 'Áp dụng tất cả chuyến bay nội địa',
    discount: 'SAVE30',
    color: 'bg-gradient-to-r from-red-500 to-pink-500',
    icon: '✈️'
  },
  {
    id: 2,
    title: 'Tour Sapa chỉ 2.9M',
    subtitle: 'Khám phá vẻ đẹp núi rừng Tây Bắc',
    discount: 'HOT',
    color: 'bg-gradient-to-r from-green-500 to-emerald-500',
    icon: '🏔️'
  },
  {
    id: 3,
    title: 'Xe limousine giảm 25%',
    subtitle: 'Tuyến TP.HCM - Đà Lạt, Nha Trang',
    discount: 'NEW',
    color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    icon: '🚌'
  },
  {
    id: 4,
    title: 'Tết 2025 - Ưu đãi khủng',
    subtitle: 'Đặt ngay để nhận giá tốt nhất',
    discount: 'TET2025',
    color: 'bg-gradient-to-r from-orange-500 to-yellow-500',
    icon: '🧧'
  }
];


export default function TravelokaBanner() {
  const [activeTab, setActiveTab] = useState('flights');
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [passengers, setPassengers] = useState(1);
  const [tripType, setTripType] = useState('roundtrip');
  const [headerSolid, setHeaderSolid] = useState(false);
  const [isPassengerOpen, setIsPassengerOpen] = useState(false);
  const [passengerCounts, setPassengerCounts] = useState({ adults: 1, children: 0, infants: 0 });
  const totalPassengers = passengerCounts.adults + passengerCounts.children + passengerCounts.infants;
  const [provinces, setProvinces] = useState<{code:string, name:string}[]>([]);
  // Thêm state cho fromProvince và toProvince
  const [fromProvince, setFromProvince] = useState<string>("");
  const [toProvince, setToProvince] = useState<string>("");

  // Thêm state cho from/to của buses và tours
  const [busFrom, setBusFrom] = useState<string>("");
  const [busTo, setBusTo] = useState<string>("");
  const [tourFrom, setTourFrom] = useState<string>("");
  const [tourTo, setTourTo] = useState<string>("");

  const router = useRouter();

  // Hàm swap
  const handleSwapProvinces = () => {
    setFromProvince(toProvince);
    setToProvince(fromProvince);
  };

  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/v2/').then(res => res.json()).then(data => {
      setProvinces(data);
      // Gán mặc định nếu chưa có
      // if (data.length > 0 && !fromProvince && !toProvince) {
      //   setFromProvince(data[0].code);
      //   setToProvince(data[1]?.code || "");
      // }
    });
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setHeaderSolid(window.scrollY > 400);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const updatePassengerCount = (type, increment) => {
    setPassengerCounts(prev => ({
      ...prev,
      [type]: Math.max(type === 'adults' ? 1 : 0, prev[type] + (increment ? 1 : -1))
    }));
  };

  // Hàm chuyển route và truyền query
  const handleSearch = () => {
    if (activeTab === 'flights') {
      router.push(`/ve-may-bay?from=${fromProvince}&to=${toProvince}&departure=${fromDate ? fromDate.toISOString().split('T')[0] : ''}&return=${toDate ? toDate.toISOString().split('T')[0] : ''}&adults=${passengerCounts.adults}&children=${passengerCounts.children}&infants=${passengerCounts.infants}`);
    } else if (activeTab === 'buses') {
      router.push(`/xe-du-lich?from=${busFrom}&to=${busTo}&departure=${fromDate ? fromDate.toISOString().split('T')[0] : ''}`);
    } else if (activeTab === 'tours') {
      router.push(`/tour?from=${tourFrom}&to=${tourTo}&departure=${fromDate ? fromDate.toISOString().split('T')[0] : ''}&passengers=${passengers}`);
    }
  };

  return (
    <div className="relative min-h-[480px]" style={{ backgroundImage: 'url(./banner.webp)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      {/* Header Bar */}
      <div className={cn(
        "fixed top-0 left-0 w-full z-20 transition-all",
        headerSolid
          ? "bg-white text-black shadow"
          : "bg-transparent text-white"
      )}>
        <div className="container max-w-7xl mx-auto flex items-center justify-between py-3 px-4 text-sm">
          <div className="flex items-center space-x-6">
            <span className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              VND (₫)
            </span>
            <span>🇻🇳 Tiếng Việt</span>
            <span>Hỗ trợ</span>
            <span>Hợp tác với chúng tôi</span>
            <span>Đăng chỗ nghỉ của bạn</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Đăng nhập</span>
            <span>Đăng ký</span>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        {/* Main Content */}
        <div className="container max-w-7xl mx-auto px-4 pt-6 pb-8">
          {/* Service Tabs */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-1 bg-[hsl(var(--background))/0.1] rounded-full p-1 backdrop-blur-sm max-w-fit">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                    activeTab === tab.id
                      ? "bg-[hsl(var(--background))] text-[hsl(var(--primary))] shadow-md"
                      : "text-[hsl(var(--background))] hover:bg-[hsl(var(--background))/0.2]"
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Ưu đãi Hot Carousel */}
          <div className="mb-6">
            <h3 className="text-[hsl(var(--background))] font-semibold text-base mb-3">🔥 Ưu đãi Hot</h3>
            <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
              {sidebarPromotions.map((promo) => (
                <div
                  key={promo.id}
                  className={cn(
                    `${promo.color} min-w-[260px] max-w-xs rounded-lg p-3 text-[hsl(var(--background))] cursor-pointer hover:scale-105 transition-transform shadow-lg flex-shrink-0`
                  )}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{promo.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-sm">{promo.title}</h4>
                        <Badge className="bg-[hsl(var(--background))/0.2] text-[hsl(var(--background))] text-xs px-2 py-1">
                          {promo.discount}
                        </Badge>
                      </div>
                      <p className="text-xs text-[hsl(var(--background))/0.9] leading-tight">{promo.subtitle}</p>
                      <Button
                        size="sm"
                        className="mt-2 bg-[hsl(var(--background))/0.2] hover:bg-[hsl(var(--background))/0.3] text-[hsl(var(--background))] text-xs h-7 px-3"
                      >
                        Xem ngay →
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Search Form with Promotions Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 max-w-7xl">
            {/* Main Search Form */}
            <div className="p-0 bg-transparent shadow-none border-none rounded-none">
              {/* Flight Search Form */}
              {activeTab === 'flights' && (
                <div className="space-y-4">
                  {/* Trip Type */}
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="tripType"
                        value="roundtrip"
                        checked={tripType === 'roundtrip'}
                        onChange={(e) => setTripType(e.target.value)}
                        className="text-blue-600"
                      />
                      <span className="text-sm font-medium text-white">Khứ hồi</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="tripType"
                        value="oneway"
                        checked={tripType === 'oneway'}
                        onChange={(e) => setTripType(e.target.value)}
                        className="text-blue-600"
                      />
                      <span className="text-sm font-medium text-white">Một chiều</span>
                    </label>
                 
                  </div>

                  {/* Search Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_1fr_1fr] gap-4 items-center">
                    {/* From */}
                    <div className="relative w-full">
                      <label className="block text-sm font-semibold text-white mb-1">Từ</label>
                      <Select value={fromProvince} onValueChange={setFromProvince}>
                        <SelectTrigger className="h-12 bg-white shadow-md text-black">
                          <SelectValue placeholder="Chọn điểm đi" />
                        </SelectTrigger>
                        <SelectContent>
                          {provinces.filter(prov => prov.code !== toProvince).map((prov) => (
                            <SelectItem key={prov.code} value={prov.code}>{prov.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Swap Button */}
                    <div className="flex items-end justify-center h-full w-full">
                      <Button variant="outline" size="icon" className="h-12 w-12 rounded-full bg-white shadow-md text-black flex items-center justify-center" onClick={handleSwapProvinces}>
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* To */}
                    <div className="relative w-full">
                      <label className="block text-sm font-semibold text-white mb-1">Đến</label>
                      <Select value={toProvince} onValueChange={setToProvince}>
                        <SelectTrigger className="h-12 bg-white shadow-md text-black">
                          <SelectValue placeholder="Chọn điểm đến" />
                        </SelectTrigger>
                        <SelectContent>
                          {provinces.filter(prov => prov.code !== fromProvince).map((prov) => (
                            <SelectItem key={prov.code} value={prov.code}>{prov.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Departure Date */}
                    <div className="relative w-full">
                      <label className="block text-sm font-semibold text-white mb-1">Ngày đi</label>
                      <Input
                        type="date"
                        className="block h-12 bg-white shadow-md text-black w-full"
                        value={fromDate ? fromDate.toISOString().split('T')[0] : ''}
                        onChange={e => setFromDate(e.target.value ? new Date(e.target.value) : undefined)}
                      />
                    </div>

                    {/* Return Date */}
                    {tripType === 'roundtrip' && (
                      <div className="relative w-full">
                        <label className="block text-sm font-semibold text-white mb-1">Ngày về</label>
                        <Input
                          type="date"
                          className="block h-12 bg-white shadow-md text-black w-full"
                          value={toDate ? toDate.toISOString().split('T')[0] : ''}
                          onChange={e => setToDate(e.target.value ? new Date(e.target.value) : undefined)}
                        />
                      </div>
                    )}
                  </div>

                  {/* Passengers and Search */}
                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-white mb-1">Số hành khách</label>
                      <Popover open={isPassengerOpen} onOpenChange={setIsPassengerOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start bg-white shadow-md text-black">
                            <Users className="mr-2 h-4 w-4" />
                            {totalPassengers} hành khách
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-4">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">Người lớn</div>
                                <div className="text-sm text-muted-foreground">≥ 12 tuổi</div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updatePassengerCount('adults', false)}
                                  disabled={passengerCounts.adults <= 1}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center">{passengerCounts.adults}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updatePassengerCount('adults', true)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">Trẻ em</div>
                                <div className="text-sm text-muted-foreground">2-11 tuổi</div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updatePassengerCount('children', false)}
                                  disabled={passengerCounts.children <= 0}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center">{passengerCounts.children}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updatePassengerCount('children', true)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">Em bé</div>
                                <div className="text-sm text-muted-foreground">&lt; 2 tuổi</div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updatePassengerCount('infants', false)}
                                  disabled={passengerCounts.infants <= 0}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center">{passengerCounts.infants}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updatePassengerCount('infants', true)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Button size="lg" className="h-12 px-8 bg-orange-500 hover:bg-orange-600 text-white shadow-md" onClick={handleSearch}>
                      <Search className="mr-2 h-5 w-5" />
                      Tìm chuyến bay
                    </Button>
                  </div>

                  {/* Quick Filters */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="text-sm font-semibold text-white">Tìm nhanh:</span>
                    <Badge
                      variant="outline"
                      className="text-white border-white hover:bg-white/40 cursor-pointer"
                    >
                      Chuyến bay giá rẻ
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-white border-white hover:bg-white/40 cursor-pointer"
                    >
                      Bay sớm
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-white border-white hover:bg-white/40 cursor-pointer"
                    >
                      Bay muộn
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-white border-white hover:bg-white/40 cursor-pointer"
                    >
                      Không baggage
                    </Badge>

                  </div>
                </div>
              )}

              {/* Bus Search Form */}
              {activeTab === 'buses' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="w-full">
                      <label className="block text-sm font-semibold text-white mb-1">Điểm đi</label>
                      <Select value={busFrom} onValueChange={setBusFrom}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Chọn điểm đi" />
                        </SelectTrigger>
                        <SelectContent>
                          {provinces.filter(prov => prov.code.toString() !== busTo).map((prov) => (
                            <SelectItem key={prov.code} value={prov.code.toString()}>{prov.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-full">
                      <label className="block text-sm font-semibold text-white mb-1">Điểm đến</label>
                      <Select value={busTo} onValueChange={setBusTo}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Chọn điểm đến" />
                        </SelectTrigger>
                        <SelectContent>
                          {provinces.filter(prov => prov.code.toString() !== busFrom).map((prov) => (
                            <SelectItem key={prov.code} value={prov.code.toString()}>{prov.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-full">
                      <label className="block text-sm font-semibold text-white mb-1">Ngày đi</label>
                      <Input
                        type="date"
                        className="block h-12 bg-white shadow-md text-black w-full"
                        value={fromDate ? fromDate.toISOString().split('T')[0] : ''}
                        onChange={e => setFromDate(e.target.value ? new Date(e.target.value) : undefined)}
                      />
                    </div>

                    <Button size="lg" className="h-12 mt-6 bg-orange-500 hover:bg-orange-600 text-white" onClick={handleSearch}>
                      <Search className="mr-2 h-5 w-5" />
                      Tìm xe
                    </Button>
                  </div>
                </div>
              )}

              {/* Tour Search Form */}
              {activeTab === 'tours' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="w-full">
                      <label className="block text-sm font-semibold text-white mb-1">Điểm khởi hành</label>
                      <Select value={tourFrom} onValueChange={setTourFrom}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Chọn điểm khởi hành" />
                        </SelectTrigger>
                        <SelectContent>
                          {provinces.filter(prov => prov.code.toString() !== tourTo).map((prov) => (
                            <SelectItem key={prov.code} value={prov.code.toString()}>{prov.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-full">
                      <label className="block text-sm font-semibold text-white mb-1">Điểm đến</label>
                      <Select value={tourTo} onValueChange={setTourTo}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Chọn điểm đến" />
                        </SelectTrigger>
                        <SelectContent>
                          {provinces.filter(prov => prov.code.toString() !== tourFrom).map((prov) => (
                            <SelectItem key={prov.code} value={prov.code.toString()}>{prov.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-full">
                      <label className="block text-sm font-semibold text-white mb-1">Ngày khởi hành</label>
                      <Input
                        type="date"
                        className="block h-12 bg-white shadow-md text-black w-full"
                        value={fromDate ? fromDate.toISOString().split('T')[0] : ''}
                        onChange={e => setFromDate(e.target.value ? new Date(e.target.value) : undefined)}
                      />
                    </div>

                    <Button size="lg" className="h-12 mt-6 bg-orange-500 hover:bg-orange-600 text-white" onClick={handleSearch}>
                      <Search className="mr-2 h-5 w-5" />
                      Tìm tour
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
            {quickActions.map((action, index) => (
              <div
                key={index}
                className="bg-[hsl(var(--background))/0.8] backdrop-blur-sm rounded-lg p-4 text-[hsl(var(--background))] hover:bg-[hsl(var(--background))/0.2] transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-[hsl(var(--background))/0.2] rounded-full p-2">
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium">{action.title}</div>
                    <div className="text-sm text-[hsl(var(--background))/0.8]">{action.subtitle}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
