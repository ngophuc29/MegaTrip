import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Plane, Wifi, Utensils, Luggage, ChevronUp, ChevronDown, Gift, CheckCircle, Shield, X, RefreshCw, Tv, Battery, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function CardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded bg-gray-200 shimmer" />
              <div className="h-4 w-32 bg-gray-200 rounded shimmer" />
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="h-4 w-12 bg-gray-200 rounded shimmer mx-auto mb-2" />
                <div className="h-3 w-16 bg-gray-200 rounded shimmer mx-auto" />
              </div>
              <div className="flex-1 text-center">
                <div className="h-3 w-20 bg-gray-200 rounded shimmer mx-auto mb-2" />
              </div>
              <div className="text-center">
                <div className="h-4 w-12 bg-gray-200 rounded shimmer mx-auto mb-2" />
                <div className="h-3 w-16 bg-gray-200 rounded shimmer mx-auto" />
              </div>
            </div>
          </div>
          <div className="lg:text-right space-y-2">
            <div className="h-5 w-24 bg-gray-200 rounded shimmer mx-auto mb-2" />
            <div className="h-8 w-32 bg-gray-200 rounded shimmer mx-auto" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FlightResults({
  isLoading,
  sortedFlights,
  hasSearched,
  expandedFlight,
  setExpandedFlight,
  formatPrice
}) {
  return (
    <div className="space-y-4">
      {isLoading ? (
        Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
      ) : (
        sortedFlights.length === 0 && hasSearched ? (
          <Card className="text-center py-12">
            <CardContent>
              <Plane className="h-12 w-12 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Không tìm thấy chuyến bay phù hợp</h3>
              <p className="text-[hsl(var(--muted-foreground))] mb-4">
                Vui lòng thử điều chỉnh bộ lọc hoặc thay đổi ngày bay
              </p>
              <Button variant="outline">Điều chỉnh tìm kiếm</Button>
            </CardContent>
          </Card>
        ) : (
          sortedFlights.map((flight) => (
            <Card key={flight.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Flight Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                        <Plane className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">{flight.airline}</div>
                        <div className="text-sm text-[hsl(var(--muted-foreground))]">{flight.flightNumber} • {flight.aircraft}</div>
                      </div>
                      {flight.discount && (
                        <Badge variant="destructive">-{flight.discount}%</Badge>
                      )}
                      {flight.amenities.priority && (
                        <Badge className="bg-purple-100 text-purple-800">Priority</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="font-bold text-lg">{flight.departure.time}</div>
                        <div className="text-sm text-[hsl(var(--muted-foreground))]">{flight.departure.airport}</div>
                        <div className="text-xs text-[hsl(var(--muted-foreground))]">{flight.departure.city}</div>
                      </div>
                      <div className="flex-1 text-center">
                        <div className="text-sm text-[hsl(var(--muted-foreground))] mb-1">{flight.duration}</div>
                        <div className="flex items-center">
                          <div className="flex-1 h-px bg-gray-300"></div>
                          <ArrowRight className="h-4 w-4 mx-2 text-gray-400" />
                          <div className="flex-1 h-px bg-gray-300"></div>
                        </div>
                        <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Bay thẳng</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg">{flight.arrival.time}</div>
                        <div className="text-sm text-[hsl(var(--muted-foreground))]">{flight.arrival.airport}</div>
                        <div className="text-xs text-[hsl(var(--muted-foreground))]">{flight.arrival.city}</div>
                      </div>
                    </div>
                    {/* Quick amenities */}
                    <div className="flex items-center gap-4 mt-3">
                      {flight.amenities.wifi.available && (
                        <div className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
                          <Wifi className="h-3 w-3" />
                          {flight.amenities.wifi.free ? 'WiFi miễn phí' : 'WiFi có phí'}
                        </div>
                      )}
                      {flight.amenities.meal.included && (
                        <div className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
                          <Utensils className="h-3 w-3" />
                          Bữa ăn
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
                        <Luggage className="h-3 w-3" />
                        {flight.baggage.checkin.weight}
                      </div>
                    </div>
                  </div>
                  {/* Price & Action */}
                  <div className="lg:text-right space-y-2">
                    <div>
                      {flight.originalPrice && (
                        <div className="text-sm text-[hsl(var(--muted-foreground))] line-through">
                          {formatPrice(flight.originalPrice)}
                        </div>
                      )}
                      <div className="text-xl font-bold text-[hsl(var(--primary))]">
                        {formatPrice(flight.price)}
                      </div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))]">Giá cho 1 khách</div>
                    </div>
                    <div className="space-y-1 text-[hsl(var(--muted-foreground))]">
                      <Button className="w-full lg:w-auto" asChild>
                        <Link prefetch={false} href={`/ve-may-bay/${flight.id}`}>
                          Chọn chuyến bay
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedFlight(expandedFlight === flight.id ? null : flight.id)}
                        className="w-full lg:w-auto text-xs"
                      >
                        Chi tiết
                        {expandedFlight === flight.id ?
                          <ChevronUp className="ml-1 h-3 w-3" /> :
                          <ChevronDown className="ml-1 h-3 w-3" />
                        }
                      </Button>
                    </div>
                  </div>
                </div>
                {/* Expandable Details with Tabs */}
                {expandedFlight === flight.id && (
                  <>
                    <Separator className="my-4" />
                    <Tabs defaultValue="details" className="w-full">
                      <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="details">Chi tiết</TabsTrigger>
                        <TabsTrigger value="benefits">Lợi ích đi kèm</TabsTrigger>
                        <TabsTrigger value="refund">Hoàn vé</TabsTrigger>
                        <TabsTrigger value="change">Đổi lịch</TabsTrigger>
                        <TabsTrigger value="promotions">Khuyến mãi</TabsTrigger>
                      </TabsList>
                      <div className="mt-4">
                        <TabsContent value="details" className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <h4 className="font-medium mb-3">Hành lý</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <Luggage className="h-4 w-4 text-blue-500" />
                                  <div>
                                    <div className="font-medium">Xách tay</div>
                                    <div className="text-muted-foreground">
                                      {flight.baggage.handbag.weight} • {flight.baggage.handbag.size}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Luggage className="h-4 w-4 text-green-500" />
                                  <div>
                                    <div className="font-medium">Ký gửi</div>
                                    <div className="text-muted-foreground">
                                      {flight.baggage.checkin.weight} • {flight.baggage.checkin.pieces} kiện
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-3">Tiện ích</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <Wifi className="h-4 w-4" />
                                  <div>
                                    {flight.amenities.wifi.available ? (
                                      <>
                                        <div className="font-medium">WiFi</div>
                                        <div className="text-muted-foreground">
                                          {flight.amenities.wifi.free ? 'Miễn phí' : flight.amenities.wifi.price}
                                        </div>
                                      </>
                                    ) : (
                                      <span className="text-muted-foreground">Không có WiFi</span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Utensils className="h-4 w-4" />
                                  <div>
                                    {flight.amenities.meal.included ? (
                                      <>
                                        <div className="font-medium">Bữa ăn</div>
                                        <div className="text-muted-foreground">{flight.amenities.meal.type}</div>
                                      </>
                                    ) : flight.amenities.meal.available ? (
                                      <>
                                        <div className="font-medium">Bữa ăn có phí</div>
                                        <div className="text-muted-foreground">{flight.amenities.meal.price}</div>
                                      </>
                                    ) : (
                                      <span className="text-muted-foreground">Không bán suất ăn</span>
                                    )}
                                  </div>
                                </div>
                                {flight.amenities.entertainment.available && (
                                  <div className="flex items-center gap-2">
                                    <Tv className="h-4 w-4" />
                                    <div>
                                      <div className="font-medium">Giải trí</div>
                                      <div className="text-muted-foreground">{flight.amenities.entertainment.screens}</div>
                                    </div>
                                  </div>
                                )}
                                {flight.amenities.power.available && (
                                  <div className="flex items-center gap-2">
                                    <Battery className="h-4 w-4" />
                                    <div>
                                      <div className="font-medium">Sạc điện</div>
                                      <div className="text-muted-foreground">{flight.amenities.power.type}</div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-3">Thông tin chuyến bay</h4>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="font-medium">Máy bay:</span> {flight.aircraft}
                                </div>
                                <div>
                                  <span className="font-medium">Hạng vé:</span> {flight.class}
                                </div>
                                <div>
                                  <span className="font-medium">Còn lại:</span> {flight.availableSeats} ghế
                                </div>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                        <TabsContent value="benefits" className="space-y-3">
                          <h4 className="font-medium">Lợi ích đi kèm</h4>
                          <div className="space-y-2">
                            {flight.benefits.map((benefit, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{benefit}</span>
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                        <TabsContent value="refund" className="space-y-3">
                          <div className="flex items-start gap-3">
                            {flight.policies.cancellable ? (
                              <Shield className="h-5 w-5 text-green-500 mt-0.5" />
                            ) : (
                              <X className="h-5 w-5 text-red-500 mt-0.5" />
                            )}
                            <div>
                              <h4 className="font-medium mb-2">
                                {flight.policies.cancellable ? 'Có thể hoàn vé' : 'Không hoàn vé'}
                              </h4>
                              {flight.policies.cancellable ? (
                                <div className="text-sm text-[hsl(var(--muted-foreground))] space-y-1">
                                  <div>• Phí hủy: {flight.policies.cancellationFee}</div>
                                  <div>• {flight.policies.refundable}</div>
                                  <div>• Thời gian xử lý: 7-14 ngày làm việc</div>
                                </div>
                              ) : (
                                <div className="text-sm text-[hsl(var(--muted-foreground))]">
                                  Vé này không thể hoàn tiền trong mọi trường hợp
                                </div>
                              )}
                            </div>
                          </div>
                        </TabsContent>
                        <TabsContent value="change" className="space-y-3">
                          <div className="flex items-start gap-3">
                            {flight.policies.changeable ? (
                              <RefreshCw className="h-5 w-5 text-blue-500 mt-0.5" />
                            ) : (
                              <X className="h-5 w-5 text-red-500 mt-0.5" />
                            )}
                            <div>
                              <h4 className="font-medium mb-2">
                                {flight.policies.changeable ? 'Có thể đổi lịch' : 'Không đổi lịch'}
                              </h4>
                              {flight.policies.changeable ? (
                                <div className="text-sm text-[hsl(var(--muted-foreground))] space-y-1">
                                  <div>• Phí đổi: {flight.policies.changeFee}</div>
                                  <div>• Áp dụng: Trước 24h khởi hành</div>
                                  <div>• Số lần đổi: Không giới hạn</div>
                                </div>
                              ) : (
                                <div className="text-sm text-[hsl(var(--muted-foreground))]">
                                  Vé này không thể đổi lịch bay
                                </div>
                              )}
                            </div>
                          </div>
                        </TabsContent>
                        <TabsContent value="promotions" className="space-y-3">
                          {flight.promotions.length > 0 ? (
                            <div className="space-y-3">
                              <h4 className="font-medium">Khuyến mãi áp dụng</h4>
                              {flight.promotions.map((promo, index) => (
                                <Card key={index} className="p-3">
                                  <div className="flex items-start gap-3">
                                    <Gift className="h-5 w-5 text-orange-500 mt-0.5" />
                                    <div className="flex-1">
                                      <div className="font-medium text-sm">{promo.code}</div>
                                      <div className="text-sm text-[hsl(var(--muted-foreground))]">{promo.description}</div>
                                      <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                                        Hết hạn: {promo.valid}
                                      </div>
                                    </div>
                                    <Button size="sm" variant="outline">
                                      Sao chép
                                    </Button>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <Info className="h-8 w-8 text-[hsl(var(--muted-foreground))] mx-auto mb-2" />
                              <div className="text-sm text-[hsl(var(--muted-foreground))]">
                                Hiện không có khuyến mãi cho chuyến bay này
                              </div>
                            </div>
                          )}
                        </TabsContent>
                      </div>
                    </Tabs>
                  </>
                )}
              </CardContent>
            </Card>
          ))
        )
      )}
    </div>
  );
}
