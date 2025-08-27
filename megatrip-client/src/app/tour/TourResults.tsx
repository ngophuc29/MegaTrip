import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { Star, Heart, Map } from 'lucide-react';
import Link from 'next/link';

function TourSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div className="h-32 w-full bg-gray-200 rounded shimmer mb-2" />
          <div className="h-5 w-1/2 bg-gray-200 rounded shimmer mb-2" />
          <div className="h-4 w-1/3 bg-gray-200 rounded shimmer mb-2" />
          <div className="h-4 w-1/4 bg-gray-200 rounded shimmer mb-2" />
          <div className="h-8 w-32 bg-gray-200 rounded shimmer mx-auto" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function TourResults({
  isLoading,
  sortedTours,
  favorites,
  toggleFavorite,
  formatPrice
}) {
  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <TourSkeleton key={i} />)}
        </div>
      ) : (
        sortedTours.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Map className="h-12 w-12 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Không tìm thấy tour phù hợp</h3>
              <p className="text-[hsl(var(--muted-foreground))] mb-4">
                Vui lòng thử điều chỉnh bộ lọc hoặc thay đổi điều kiện tìm kiếm
              </p>
              <Button variant="outline">Điều chỉnh tìm kiếm</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedTours.map((tour) => (
              <Card key={tour.id} className="hover:shadow-md transition-shadow group overflow-hidden">
                <div className="relative">
                  <img
                    src={tour.images[0]}
                    alt={tour.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant={tour.badgeColor as any}>{tour.badge}</Badge>
                  </div>
                  <div className="absolute top-3 right-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0"
                      onClick={() => toggleFavorite(tour.id)}
                    >
                      <Heart className={`h-4 w-4 ${favorites.includes(tour.id) ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="mb-2 mt-2">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                      {tour.name}
                    </h3>
                    <div className="flex items-center text-sm text-[hsl(var(--muted-foreground))] mb-2">
                      <span className="mr-1">Từ</span>{tour.departure}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="text-sm font-medium">{tour.rating}</span>
                      <span className="text-sm text-[hsl(var(--muted-foreground))] ml-1">({tour.reviews})</span>
                    </div>
                    <div className="flex items-center text-sm text-[hsl(var(--muted-foreground))]">
                      <span className="mr-1">Max</span>{tour.maxGroup}
                    </div>
                  </div>
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">{tour.transport}</span>
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">KS {tour.hotel}</span>
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">{tour.meals}</span>
                    </div>
                  </div>
                  <div className="space-y-1 mb-3 text-xs text-[hsl(var(--muted-foreground))]">
                    <div className="line-clamp-2">Điểm nổi bật: {tour.highlights.join(' • ')}</div>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between">
                      <div>
                        {tour.originalPrice && (
                          <div className="text-xs text-[hsl(var(--muted-foreground))] line-through">
                            {formatPrice(tour.originalPrice)}
                          </div>
                        )}
                        <div className="text-sm text-[hsl(var(--muted-foreground))]">Từ</div>
                        <div className="text-lg font-bold text-[hsl(var(--primary))]">
                          {formatPrice(tour.priceFrom)}
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <Button size="sm" asChild>
                          <Link prefetch={false} href={`/tour/${tour.id}`}>
                            Xem chi tiết
                          </Link>
                        </Button>
                        <div className="text-xs text-[hsl(var(--muted-foreground))]">
                          {tour.availableDates.length} ngày khả dụng
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}
    </div>
  );
}
