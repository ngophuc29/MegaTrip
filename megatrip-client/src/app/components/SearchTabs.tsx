import { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/v2/').then(res => res.json()).then(data => {
      setProvinces(data);
    });
  }, []);

  const updatePassengerCount = (type: keyof PassengerCount, increment: boolean) => {
    setPassengers(prev => ({
      ...prev,
      [type]: Math.max(0, prev[type] + (increment ? 1 : -1))
    }));
  };

  const totalPassengers = passengers.adults + passengers.children + passengers.infants;

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
                <Label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="flightType"
                    value="multicity"
                    checked={flightType === 'multicity'}
                    onChange={() => setFlightType('multicity')}
                    className="text-primary"
                  />
                  <span>Nhiều thành phố</span>
                </Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* From */}
                <div className="space-y-2">
                  <Label htmlFor="from">Từ</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Thành phố hoặc sân bay" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((prov) => (
                        <SelectItem key={prov.code} value={prov.code}>{prov.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* To */}
                <div className="space-y-2 relative">
                  <Label htmlFor="to">Đến</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Thành phố hoặc sân bay" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((prov) => (
                        <SelectItem key={prov.code} value={prov.code}>{prov.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-8 h-8 w-8 p-0"
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Departure Date */}
                <div className="space-y-2">
                  <Label>Ngày đi</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !flightDeparture && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {flightDeparture ? (
                          format(flightDeparture, "dd/MM/yyyy", { locale: vi })
                        ) : (
                          <span>Chọn ngày</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={flightDeparture}
                        onSelect={setFlightDeparture}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Return Date */}
                {flightType === 'roundtrip' && (
                  <div className="space-y-2">
                    <Label>Ngày về</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !flightReturn && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {flightReturn ? (
                            format(flightReturn, "dd/MM/yyyy", { locale: vi })
                          ) : (
                            <span>Chọn ngày</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={flightReturn}
                          onSelect={setFlightReturn}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
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
                  <Button className="w-full h-10" onClick={onSearch}>
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
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Tỉnh/Thành phố hoặc bến xe" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((prov) => (
                        <SelectItem key={prov.code} value={prov.code}>{prov.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bus-to">Điểm trả</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Tỉnh/Thành phố hoặc bến xe" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((prov) => (
                        <SelectItem key={prov.code} value={prov.code}>{prov.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ngày đi</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !busDeparture && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {busDeparture ? (
                          format(busDeparture, "dd/MM/yyyy", { locale: vi })
                        ) : (
                          <span>Chọn ngày</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={busDeparture}
                        onSelect={setBusDeparture}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex items-end">
                  <Button className="w-full h-10" onClick={onSearch}>
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
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn điểm khởi hành" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((prov) => (
                        <SelectItem key={prov.code} value={prov.code}>{prov.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tour-to">Điểm đến</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Điểm đến mong muốn" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((prov) => (
                        <SelectItem key={prov.code} value={prov.code}>{prov.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ngày khởi hành</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !tourDeparture && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {tourDeparture ? (
                          format(tourDeparture, "dd/MM/yyyy", { locale: vi })
                        ) : (
                          <span>Chọn ngày</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={tourDeparture}
                        onSelect={setTourDeparture}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex items-end">
                  <Button className="w-full h-10" onClick={onSearch}>
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
