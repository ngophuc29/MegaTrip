import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  Plane,
  Bus,
  Map,
  Calendar as CalendarIcon,
  ArrowLeftRight,
  Plus,
  Minus,
  Users,
  Search,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface PassengerCount {
  adults: number;
  children: number;
  infants: number;
}

interface SearchTabsProps {
  onSearch?: () => void;
  activeTab?: 'flight' | 'bus' | 'tour';
}

export default function SearchTabs({ onSearch, activeTab }: SearchTabsProps) {
  const [flightType, setFlightType] = useState<'roundtrip' | 'oneway' | 'multicity'>('roundtrip');
  const [passengers, setPassengers] = useState<PassengerCount>({
    adults: 1,
    children: 0,
    infants: 0,
  });
  const [flightDeparture, setFlightDeparture] = useState<Date>();
  const [flightReturn, setFlightReturn] = useState<Date>();
  const [busDeparture, setBusDeparture] = useState<Date>();
  const [tourDeparture, setTourDeparture] = useState<Date>();
  const [isPassengerOpen, setIsPassengerOpen] = useState(false);
  const [provinces, setProvinces] = useState<{code:string, name:string}[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Thêm state cho from/to các loại search
  const [flightFrom, setFlightFrom] = useState<string>('');
  const [flightTo, setFlightTo] = useState<string>('');
  const [busFrom, setBusFrom] = useState<string>('');
  const [busTo, setBusTo] = useState<string>('');
  const [tourFrom, setTourFrom] = useState<string>('');
  const [tourTo, setTourTo] = useState<string>('');

  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/v2/').then(res => res.json()).then(data => {
      setProvinces(data);
    });
  }, []);

  useEffect(() => {
    if (searchParams) {
      if (activeTab === 'flight') {
        const from = searchParams.get('from');
        const to = searchParams.get('to');
        const departure = searchParams.get('departure');
        const returnDate = searchParams.get('return');
        const adults = searchParams.get('adults');
        const children = searchParams.get('children');
        const infants = searchParams.get('infants');
        if (from !== null) setFlightFrom(String(from));
        if (to !== null) setFlightTo(String(to));
        if (departure) setFlightDeparture(new Date(departure));
        if (returnDate) setFlightReturn(new Date(returnDate));
        if (adults || children || infants) {
          setPassengers({
            adults: adults ? Number(adults) : 1,
            children: children ? Number(children) : 0,
            infants: infants ? Number(infants) : 0,
          });
        }
        if (from && to && departure) {
          onSearch?.();
        }
      }
      if (activeTab === 'bus') {
        const from = searchParams.get('from');
        const to = searchParams.get('to');
        const departure = searchParams.get('departure');
        if (from !== null) setBusFrom(String(from));
        if (to !== null) setBusTo(String(to));
        if (departure) setBusDeparture(new Date(departure));
        if (from && to && departure) {
          onSearch?.();
        }
      }
      if (activeTab === 'tour') {
        const from = searchParams.get('from');
        const to = searchParams.get('to');
        const departure = searchParams.get('departure');
        if (from !== null) setTourFrom(String(from));
        if (to !== null) setTourTo(String(to));
        if (departure) setTourDeparture(new Date(departure));
        if (from && to && departure) {
          onSearch?.();
        }
      }
    }
  }, [searchParams, activeTab]);

  const updatePassengerCount = (type: keyof PassengerCount, increment: boolean) => {
    setPassengers(prev => ({
      ...prev,
      [type]: Math.max(0, prev[type] + (increment ? 1 : -1))
    }));
  };

  const totalPassengers = passengers.adults + passengers.children + passengers.infants;

  // Hàm chuyển route và truyền query
  const handleSearch = (type: 'flight' | 'bus' | 'tour') => {
    if (type === 'flight') {
      router.push(`/ve-may-bay?from=${flightFrom}&to=${flightTo}&departure=${flightDeparture ? flightDeparture.toISOString().split('T')[0] : ''}&return=${flightReturn ? flightReturn.toISOString().split('T')[0] : ''}&adults=${passengers.adults}&children=${passengers.children}&infants=${passengers.infants}`);
    } else if (type === 'bus') {
      router.push(`/xe-du-lich?from=${busFrom}&to=${busTo}&departure=${busDeparture ? busDeparture.toISOString().split('T')[0] : ''}`);
    } else if (type === 'tour') {
      router.push(`/tour?from=${tourFrom}&to=${tourTo}&departure=${tourDeparture ? tourDeparture.toISOString().split('T')[0] : ''}`);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <Tabs defaultValue={activeTab || "flight"} value={activeTab} className="w-full">


        {/* <TabsList className="grid w-full grid-cols-3 mb-1">
          <TabsTrigger value="flight" className="flex items-center space-x-2">
            <Plane className="h-4 w-4" />
            <span>Vé máy bay</span>
          </TabsTrigger>
          <TabsTrigger value="bus" className="flex items-center space-x-2">
            <Bus className="h-4 w-4" />
            <span>Xe du lịch</span>
          </TabsTrigger>
          <TabsTrigger value="tour" className="flex items-center space-x-2">
            <Map className="h-4 w-4" />
            <span>Tour</span>
          </TabsTrigger>
        </TabsList> */}

        {/* Chỉ render đúng tab content nếu có activeTab */}
        {(!activeTab || activeTab === 'flight') && (
          <TabsContent value="flight" className="space-y-4">
            <div className="bg-white rounded-lg  p-6 shadow-sm">
              {/* Flight Type */}
              <div className="flex items-center space-x-4 mb-4">
                <Label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="flightType"
                    value="roundtrip"
                    checked={flightType === 'roundtrip'}
                    onChange={() => setFlightType('roundtrip')}
                    className="text-primary"
                  />
                  <span>Khứ hồi</span>
                </Label>
                <Label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="flightType"
                    value="oneway"
                    checked={flightType === 'oneway'}
                    onChange={() => setFlightType('oneway')}
                    className="text-primary"
                  />
                  <span>Một chiều</span>
                </Label>
                {/* <Label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="flightType"
                    value="multicity"
                    checked={flightType === 'multicity'}
                    onChange={() => setFlightType('multicity')}
                    className="text-primary"
                  />
                  <span>Nhiều thành phố</span>
                </Label> */}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* From */}
                <div className="space-y-2">
                  <Label htmlFor="from">Từ</Label>
                  <Select value={flightFrom} onValueChange={setFlightFrom}>
                    <SelectTrigger>
                      <SelectValue placeholder="Thành phố hoặc sân bay" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.filter(prov => prov.code.toString() !== flightTo).map((prov) => (
                        <SelectItem key={prov.code} value={prov.code.toString()}>{prov.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* To */}
                <div className="space-y-2 relative">
                  <Label htmlFor="to">Đến</Label>
                  <Select value={flightTo} onValueChange={setFlightTo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Thành phố hoặc sân bay" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.filter(prov => prov.code.toString() !== flightFrom).map((prov) => (
                        <SelectItem key={prov.code} value={prov.code.toString()}>{prov.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-8 h-8 w-8 p-0"
                    onClick={() => {
                      setFlightFrom(flightTo);
                      setFlightTo(flightFrom);
                    }}
                  >
                    {/* <ArrowLeftRight className="h-4 w-4" /> */}
                  </Button>
                </div>

                {/* Departure Date */}
                <div className="space-y-2">
                  <Label>Ngày đi</Label>
                  <Input
                    type="date"
                    className="block h-12 bg-white shadow-md text-black w-full"
                    value={flightDeparture ? flightDeparture.toISOString().split('T')[0] : ''}
                    onChange={e => setFlightDeparture(e.target.value ? new Date(e.target.value) : undefined)}
                  />
                </div>

                {/* Return Date */}
                {flightType === 'roundtrip' && (
                  <div className="space-y-2">
                    <Label>Ngày về</Label>
                    <Input
                      type="date"
                      className="block h-12 bg-white shadow-md text-black w-full"
                      value={flightReturn ? flightReturn.toISOString().split('T')[0] : ''}
                      onChange={e => setFlightReturn(e.target.value ? new Date(e.target.value) : undefined)}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {/* Passengers */}
                <div className="space-y-2">
                  <Label>Số hành khách</Label>
                  <Popover open={isPassengerOpen} onOpenChange={setIsPassengerOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
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
                              disabled={passengers.adults <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center">{passengers.adults}</span>
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
                              disabled={passengers.children <= 0}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center">{passengers.children}</span>
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
                              disabled={passengers.infants <= 0}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center">{passengers.infants}</span>
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

                {/* Class */}
                <div className="space-y-2">
                  <Label>Hạng vé</Label>
                  <Select defaultValue="economy">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="economy">Phổ thông</SelectItem>
                      <SelectItem value="business">Thương gia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Search Button */}
                <div className="flex items-end">
                  <Button className="w-full h-10" onClick={() => handleSearch('flight')}>
                    <Search className="mr-2 h-4 w-4" />
                    Tìm chuyến bay
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        )}
        {(!activeTab || activeTab === 'bus') && (
          <TabsContent value="bus" className="space-y-4">
            <div className="bg-white rounded-lg  p-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bus-from">Điểm đón</Label>
                  <Select value={busFrom} onValueChange={setBusFrom}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tỉnh/Thành phố hoặc bến xe" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.filter(prov => prov.code.toString() !== busTo).map((prov) => (
                        <SelectItem key={prov.code} value={prov.code.toString()}>{prov.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bus-to">Điểm trả</Label>
                  <Select value={busTo} onValueChange={setBusTo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tỉnh/Thành phố hoặc bến xe" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.filter(prov => prov.code.toString() !== busFrom).map((prov) => (
                        <SelectItem key={prov.code} value={prov.code.toString()}>{prov.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ngày đi</Label>
                  <Input
                    type="date"
                    className="block h-12 bg-white shadow-md text-black w-full"
                    value={busDeparture ? busDeparture.toISOString().split('T')[0] : ''}
                    onChange={e => setBusDeparture(e.target.value ? new Date(e.target.value) : undefined)}
                  />
                </div>
                <div className="flex items-end">
                  <Button className="w-full h-10" onClick={() => handleSearch('bus')}>
                    <Search className="mr-2 h-4 w-4" />
                    Tìm chuyến xe
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        )}
        {(!activeTab || activeTab === 'tour') && (
          <TabsContent value="tour" className="space-y-4">
            <div className="bg-white rounded-lg  p-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tour-from">Điểm khởi hành</Label>
                  <Select value={tourFrom} onValueChange={setTourFrom}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn điểm khởi hành" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.filter(prov => prov.code.toString() !== tourTo).map((prov) => (
                        <SelectItem key={prov.code} value={prov.code.toString()}>{prov.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tour-to">Điểm đến</Label>
                  <Select value={tourTo} onValueChange={setTourTo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Điểm đến mong muốn" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.filter(prov => prov.code.toString() !== tourFrom).map((prov) => (
                        <SelectItem key={prov.code} value={prov.code.toString()}>{prov.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ngày khởi hành</Label>
                  <Input
                    type="date"
                    className="block h-12 bg-white shadow-md text-black w-full"
                    value={tourDeparture ? tourDeparture.toISOString().split('T')[0] : ''}
                    onChange={e => setTourDeparture(e.target.value ? new Date(e.target.value) : undefined)}
                  />
                </div>
                <div className="flex items-end">
                  <Button className="w-full h-10" onClick={() => handleSearch('tour')}>
                    <Search className="mr-2 h-4 w-4" />
                    Tìm tour
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
