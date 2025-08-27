"use client"
import { useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import {
    Newspaper,
    Search,
    Calendar,
    Clock,
    User,
    Eye,
    Heart,
    Share2,
    TrendingUp,
    MapPin,
    Plane,
    AlertCircle,
    Coffee,
    Camera,
} from 'lucide-react';

const categories = [
    { id: 'all', name: 'Tất cả', count: 45, icon: Newspaper },
    { id: 'travel-tips', name: 'Mẹo du lịch', count: 18, icon: Coffee },
    { id: 'destinations', name: 'Điểm đến', count: 12, icon: MapPin },
    { id: 'airline-news', name: 'Thông báo hãng', count: 8, icon: Plane },
    { id: 'promotions', name: 'Khuyến mãi', count: 5, icon: TrendingUp },
    { id: 'experiences', name: 'Trải nghiệm', count: 2, icon: Camera },
];

const featuredArticles = [
    {
        id: 1,
        title: 'Top 10 điểm đến không thể bỏ qua trong dịp Tết Nguyên Đán 2025',
        excerpt: 'Khám phá những điểm đến tuyệt đẹp và ý nghĩa để có một kỳ nghỉ Tết đáng nhớ cùng gia đình và bạn bè.',
        content: 'Dịp Tết Nguyên Đán là thời gian tuyệt vời để du lịch và khám phá những vùng đất mới...',
        author: 'Minh Anh',
        publishDate: '28/12/2024',
        readTime: '8 phút đọc',
        views: 12543,
        likes: 245,
        category: 'destinations',
        categoryName: 'Điểm đến',
        image: '/placeholder.svg',
        featured: true,
        tags: ['Tết 2025', 'Điểm đến', 'Du lịch gia đình'],
    },
    {
        id: 2,
        title: 'Hàng không Vietnam Airlines mở rộng mạng lưới đường bay đến Côn Đảo',
        excerpt: 'Vietnam Airlines chính thức công bố kế hoạch mở thêm đường bay mới từ TP.HCM và Hà Nội đến Côn Đảo.',
        content: 'Trong nỗ lực mở rộng mạng lưới đường bay nội địa, Vietnam Airlines đã công bố...',
        author: 'Hồng Nhung',
        publishDate: '27/12/2024',
        readTime: '5 phút đọc',
        views: 8932,
        likes: 156,
        category: 'airline-news',
        categoryName: 'Thông báo hãng',
        image: '/placeholder.svg',
        featured: true,
        tags: ['Vietnam Airlines', 'Côn Đảo', 'Đường bay mới'],
    },
    {
        id: 3,
        title: '7 mẹo tiết kiệm chi phí khi du lịch Sapa mùa đông',
        excerpt: 'Sapa mùa đông tuyệt đẹp nhưng chi phí có thể cao. Hãy cùng tìm hiểu cách tiết kiệm mà vẫn có trải nghiệm tuyệt vời.',
        content: 'Sapa trong mùa đông mang một vẻ đẹp hoang sơ và lãng mạn khó cưỡng...',
        author: 'Đức Minh',
        publishDate: '26/12/2024',
        readTime: '6 phút đọc',
        views: 15678,
        likes: 324,
        category: 'travel-tips',
        categoryName: 'Mẹo du lịch',
        image: '/placeholder.svg',
        featured: true,
        tags: ['Sapa', 'Tiết kiệm', 'Mùa đông'],
    },
];

const allArticles = [
    ...featuredArticles,
    {
        id: 4,
        title: 'Lịch trình xe khách được cập nhật cho dịp Tết Nguyên Đán',
        excerpt: 'Các nhà xe lớn đã công bố lịch trình và giá vé mới cho dịp Tết Nguyên Đán 2025.',
        content: 'Với nhu cầu đi lại tăng cao trong dịp Tết, các nhà xe đã chuẩn bị...',
        author: 'Thu Hà',
        publishDate: '25/12/2024',
        readTime: '4 phút đọc',
        views: 6543,
        likes: 89,
        category: 'airline-news',
        categoryName: 'Thông báo hãng',
        image: '/placeholder.svg',
        featured: false,
        tags: ['Xe khách', 'Tết 2025', 'Lịch trình'],
    },
    {
        id: 5,
        title: 'Phú Quốc vs Nha Trang: Chọn điểm đến biển nào cho kỳ nghỉ?',
        excerpt: 'So sánh chi tiết giữa hai điểm đến biển hàng đầu Việt Nam để bạn có lựa chọn phù hợp.',
        content: 'Cả Phú Quốc và Nha Trang đều là những điểm đến biển tuyệt vời...',
        author: 'Lan Anh',
        publishDate: '24/12/2024',
        readTime: '7 phút đọc',
        views: 9876,
        likes: 187,
        category: 'destinations',
        categoryName: 'Điểm đến',
        image: '/placeholder.svg',
        featured: false,
        tags: ['Phú Quốc', 'Nha Trang', 'So sánh'],
    },
    {
        id: 6,
        title: 'Cách chuẩn bị hành lý thông minh cho chuyến bay',
        excerpt: 'Những mẹo hay để chuẩn bị hành lý hiệu quả, tiết kiệm không gian và tránh phát sinh phí.',
        content: 'Việc chuẩn bị hành lý là một nghệ thuật, đặc biệt khi bạn muốn mang theo...',
        author: 'Văn Hùng',
        publishDate: '23/12/2024',
        readTime: '5 phút đọc',
        views: 11234,
        likes: 203,
        category: 'travel-tips',
        categoryName: 'Mẹo du lịch',
        image: '/placeholder.svg',
        featured: false,
        tags: ['Hành lý', 'Máy bay', 'Mẹo hay'],
    },
    {
        id: 7,
        title: 'Trải nghiệm ẩm thực đường phố Hà Nội trong 2 ngày',
        excerpt: 'Hành trình khám phá những món ăn đường phố đặc trưng của Thủ đô trong 48 giờ.',
        content: 'Hà Nội không chỉ nổi tiếng với những di tích lịch sử mà còn là thiên đường ẩm thực...',
        author: 'Mai Linh',
        publishDate: '22/12/2024',
        readTime: '6 phút đọc',
        views: 7890,
        likes: 145,
        category: 'experiences',
        categoryName: 'Trải nghiệm',
        image: '/placeholder.svg',
        featured: false,
        tags: ['Hà Nội', 'Ẩm thực', 'Đường phố'],
    },
    {
        id: 8,
        title: 'Khuyến mãi đặc biệt: Giảm 40% cho tour miền Trung',
        excerpt: 'Chương trình khuyến mãi hấp dẫn cho các tour khám phá miền Trung trong tháng 1/2025.',
        content: 'Nhằm kích cầu du lịch nội địa, nhiều công ty lữ hành đã tung ra...',
        author: 'Thanh Tùng',
        publishDate: '21/12/2024',
        readTime: '3 phút đọc',
        views: 5432,
        likes: 67,
        category: 'promotions',
        categoryName: 'Khuyến mãi',
        image: '/placeholder.svg',
        featured: false,
        tags: ['Khuyến mãi', 'Miền Trung', 'Tour'],
    },
];

export default function TinTuc() {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [favorites, setFavorites] = useState<number[]>([]);

    const toggleFavorite = (articleId: number) => {
        setFavorites(prev =>
            prev.includes(articleId)
                ? prev.filter(id => id !== articleId)
                : [...prev, articleId]
        );
    };

    const filteredArticles = allArticles.filter(article => {
        const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
        const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    const sortedArticles = [...filteredArticles].sort((a, b) => {
        switch (sortBy) {
            case 'newest': return new Date(b.publishDate.split('/').reverse().join('-')).getTime() -
                new Date(a.publishDate.split('/').reverse().join('-')).getTime();
            case 'oldest': return new Date(a.publishDate.split('/').reverse().join('-')).getTime() -
                new Date(b.publishDate.split('/').reverse().join('-')).getTime();
            case 'popular': return b.views - a.views;
            case 'liked': return b.likes - a.likes;
            default: return 0;
        }
    });

    const featuredNews = sortedArticles.filter(article => article.featured);
    const regularNews = sortedArticles.filter(article => !article.featured);

    return (
        <>
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
                <div className="container">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl lg:text-4xl font-bold mb-4">Tin tức du lịch</h1>
                        <p className="text-lg text-muted-foreground">
                            Cập nhật những thông tin mới nhất về du lịch, khuyến mãi và mẹo hay
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm tin tức, mẹo du lịch..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 h-12"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="py-6 border-b">
                <div className="container">
                    <div className="flex items-center gap-4 overflow-x-auto">
                        <span className="text-sm font-medium whitespace-nowrap">Chuyên mục:</span>
                        {categories.map((category) => (
                            <Button
                                key={category.id}
                                variant={selectedCategory === category.id ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedCategory(category.id)}
                                className="whitespace-nowrap"
                            >
                                <category.icon className="h-4 w-4 mr-2" />
                                {category.name} ({category.count})
                            </Button>
                        ))}
                    </div>
                </div>
            </section>

            <div className="container py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Featured Articles */}
                        {featuredNews.length > 0 && (
                            <section className="mb-12">
                                <h2 className="text-2xl font-bold mb-6 flex items-center">
                                    <TrendingUp className="h-6 w-6 mr-2 text-red-500" />
                                    Tin nổi bật
                                </h2>

                                {/* Main Featured Article */}
                                {featuredNews[0] && (
                                    <Card className="mb-6 overflow-hidden hover:shadow-lg transition-shadow">
                                        <div className="md:flex">
                                            <div className="md:w-1/2">
                                                <img
                                                    src={featuredNews[0].image}
                                                    alt={featuredNews[0].title}
                                                    className="w-full h-64 md:h-full object-cover"
                                                />
                                            </div>
                                            <div className="md:w-1/2 p-6">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Badge variant="secondary">{featuredNews[0].categoryName}</Badge>
                                                    <Badge variant="destructive">Nổi bật</Badge>
                                                </div>
                                                <h3 className="text-xl font-bold mb-3 hover:text-primary transition-colors">
                                                    <Link prefetch={false}  href={`/tin-tuc/${featuredNews[0].id}`}>
                                                        {featuredNews[0].title}
                                                    </Link>
                                                </h3>
                                                <p className="text-muted-foreground mb-4 line-clamp-3">
                                                    {featuredNews[0].excerpt}
                                                </p>
                                                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                                                    <div className="flex items-center gap-4">
                                                        <span className="flex items-center">
                                                            <User className="h-3 w-3 mr-1" />
                                                            {featuredNews[0].author}
                                                        </span>
                                                        <span className="flex items-center">
                                                            <Calendar className="h-3 w-3 mr-1" />
                                                            {featuredNews[0].publishDate}
                                                        </span>
                                                        <span className="flex items-center">
                                                            <Clock className="h-3 w-3 mr-1" />
                                                            {featuredNews[0].readTime}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        <span className="flex items-center">
                                                            <Eye className="h-3 w-3 mr-1" />
                                                            {featuredNews[0].views.toLocaleString()}
                                                        </span>
                                                        <button
                                                            className="flex items-center hover:text-red-500 transition-colors"
                                                            onClick={() => toggleFavorite(featuredNews[0].id)}
                                                        >
                                                            <Heart className={`h-3 w-3 mr-1 ${favorites.includes(featuredNews[0].id) ? 'fill-red-500 text-red-500' : ''}`} />
                                                            {featuredNews[0].likes}
                                                        </button>
                                                    </div>
                                                    <Button size="sm" asChild>
                                                        <Link prefetch={false}  href={`/tin-tuc/${featuredNews[0].id}`}>
                                                            Đọc thêm
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                )}

                                {/* Secondary Featured Articles */}
                                {featuredNews.length > 1 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {featuredNews.slice(1, 3).map((article) => (
                                            <Card key={article.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                                <img
                                                    src={article.image}
                                                    alt={article.title}
                                                    className="w-full h-48 object-cover"
                                                />
                                                <CardContent className="p-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge variant="outline">{article.categoryName}</Badge>
                                                    </div>
                                                    <h3 className="font-semibold mb-2 line-clamp-2 hover:text-primary transition-colors">
                                                        <Link prefetch={false}  href={`/tin-tuc/${article.id}`}>
                                                            {article.title}
                                                        </Link>
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                                        {article.excerpt}
                                                    </p>
                                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                        <div className="flex items-center gap-2">
                                                            <span>{article.author}</span>
                                                            <span>•</span>
                                                            <span>{article.publishDate}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="flex items-center">
                                                                <Eye className="h-3 w-3 mr-1" />
                                                                {article.views.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Regular Articles */}
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">Tất cả tin tức</h2>
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="newest">Mới nhất</SelectItem>
                                        <SelectItem value="oldest">Cũ nhất</SelectItem>
                                        <SelectItem value="popular">Xem nhiều nhất</SelectItem>
                                        <SelectItem value="liked">Yêu thích nhất</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-6">
                                {regularNews.map((article) => (
                                    <Card key={article.id} className="hover:shadow-md transition-shadow">
                                        <div className="md:flex">
                                            <div className="md:w-1/3">
                                                <img
                                                    src={article.image}
                                                    alt={article.title}
                                                    className="w-full h-48 md:h-full object-cover"
                                                />
                                            </div>
                                            <div className="md:w-2/3 p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge variant="outline">{article.categoryName}</Badge>
                                                </div>
                                                <h3 className="text-lg font-semibold mb-2 hover:text-primary transition-colors">
                                                    <Link prefetch={false}  href={`/tin-tuc/${article.id}`}>
                                                        {article.title}
                                                    </Link>
                                                </h3>
                                                <p className="text-muted-foreground mb-3 line-clamp-2">
                                                    {article.excerpt}
                                                </p>
                                                <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                                                    <div className="flex items-center gap-4">
                                                        <span className="flex items-center">
                                                            <User className="h-3 w-3 mr-1" />
                                                            {article.author}
                                                        </span>
                                                        <span className="flex items-center">
                                                            <Calendar className="h-3 w-3 mr-1" />
                                                            {article.publishDate}
                                                        </span>
                                                        <span className="flex items-center">
                                                            <Clock className="h-3 w-3 mr-1" />
                                                            {article.readTime}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        <span className="flex items-center">
                                                            <Eye className="h-3 w-3 mr-1" />
                                                            {article.views.toLocaleString()}
                                                        </span>
                                                        <button
                                                            className="flex items-center hover:text-red-500 transition-colors"
                                                            onClick={() => toggleFavorite(article.id)}
                                                        >
                                                            <Heart className={`h-3 w-3 mr-1 ${favorites.includes(article.id) ? 'fill-red-500 text-red-500' : ''}`} />
                                                            {article.likes}
                                                        </button>
                                                        <button className="flex items-center hover:text-blue-500 transition-colors">
                                                            <Share2 className="h-3 w-3 mr-1" />
                                                            Chia sẻ
                                                        </button>
                                                    </div>
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link prefetch={false}  href={`/tin-tuc/${article.id}`}>
                                                            Đọc thêm
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>

                            {sortedArticles.length === 0 && (
                                <Card className="text-center py-12">
                                    <CardContent>
                                        <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-lg font-medium mb-2">Không tìm thấy bài viết</h3>
                                        <p className="text-muted-foreground mb-4">
                                            Vui lòng thử tìm kiếm với từ khóa khác hoặc chọn chuyên mục khác
                                        </p>
                                        <Button variant="outline" onClick={() => {
                                            setSearchTerm('');
                                            setSelectedCategory('all');
                                        }}>
                                            Xóa bộ lọc
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:w-80 space-y-6">
                        {/* Newsletter Signup */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Đăng ký nhận tin</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Nhận thông tin mới nhất về khuyến mãi và mẹo du lịch
                                </p>
                                <div className="space-y-3">
                                    <Input placeholder="Email của bạn" type="email" />
                                    <Button className="w-full">
                                        Đăng ký ngay
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Popular Tags */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Thẻ phổ biến</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {['Tết 2025', 'Khuyến mãi', 'Sapa', 'Phú Quốc', 'Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Tour', 'Mẹo hay'].map((tag) => (
                                        <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Thống kê</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Tổng bài viết</span>
                                    <span className="font-medium">45</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Tuần này</span>
                                    <span className="font-medium">8</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Lượt xem</span>
                                    <span className="font-medium">125.4K</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
