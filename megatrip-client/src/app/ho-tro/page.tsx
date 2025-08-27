'use client'
import { useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  HelpCircle,
  Search,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  CreditCard,
  Plane,
  Bus,
  Map,
  User,
  Calendar,
  Send,
  ExternalLink,
} from 'lucide-react';

const supportCategories = [
  { id: 'booking', name: 'Đặt chỗ & Thanh toán', icon: CreditCard, count: 15 },
  { id: 'flight', name: 'Vé máy bay', icon: Plane, count: 12 },
  { id: 'bus', name: 'Xe du lịch', icon: Bus, count: 8 },
  { id: 'tour', name: 'Tour du lịch', icon: Map, count: 10 },
  { id: 'account', name: 'Tài khoản', icon: User, count: 6 },
  { id: 'other', name: 'Khác', icon: HelpCircle, count: 3 },
];

const faqData = [
  {
    id: 1,
    category: 'booking',
    question: 'Làm thế nào để đặt vé máy bay trên MegaTrip?',
    answer: 'Để đặt vé máy bay, bạn chỉ cần: 1) Chọn tab "Vé máy bay" trên trang chủ, 2) Nhập thông tin chuyến bay (điểm đi, điểm đến, ngày bay), 3) Chọn chuyến bay phù hợp, 4) Điền thông tin hành khách, 5) Thanh toán và nhận vé điện tử qua email.',
    helpful: 245,
    tags: ['đặt vé', 'máy bay', 'hướng dẫn'],
  },
  {
    id: 2,
    category: 'booking',
    question: 'Tôi có thể thanh toán bằng những phương thức nào?',
    answer: 'MegaTrip hỗ trợ nhiều phương thức thanh toán: Thẻ tín dụng/ghi nợ (Visa, Mastercard, JCB), ATM nội địa, Internet Banking, Ví điện tử (VNPay, MoMo, ZaloPay), và chuyển khoản ngân hàng.',
    helpful: 189,
    tags: ['thanh toán', 'phương thức', 'ngân hàng'],
  },
  {
    id: 3,
    category: 'flight',
    question: 'Tôi có thể thay đổi hoặc hủy vé máy bay không?',
    answer: 'Việc thay đổi hoặc hủy vé phụ thuộc vào điều kiện vé của từng hãng hàng không. Vé Economy thường có phí đổi/hủy, trong khi vé Flex cho phép thay đổi miễn phí. Bạn có thể kiểm tra điều kiện vé trong email xác nhận hoặc liên hệ hotline 1900 1234.',
    helpful: 156,
    tags: ['hủy vé', 'đổi vé', 'điều kiện'],
  },
  {
    id: 4,
    category: 'flight',
    question: 'Quy định về hành lý xách tay và ký gửi như thế nào?',
    answer: 'Hành lý xách tay: Thường 7kg, kích thước tối đa 56x36x23cm. Hành lý ký gửi: 20-23kg tùy hãng và loại vé. Vật phẩm cấm: chất lỏng >100ml, vật dụng nhọn, pin lithium rời. Chi tiết cụ thể xem trong email vé hoặc website hãng.',
    helpful: 203,
    tags: ['hành lý', 'quy định', 'cấm mang'],
  },
  {
    id: 5,
    category: 'bus',
    question: 'Làm sao để chọn chỗ ngồi trên xe?',
    answer: 'Sau khi chọn chuyến xe, bạn sẽ thấy sơ đồ chỗ ngồi. Ghế màu xanh là còn trống, màu đỏ là đã được đặt. Click vào ghế trống để chọn. Một số nhà xe tính phí thêm cho chỗ ngồi VIP hoặc tầng dưới.',
    helpful: 134,
    tags: ['chọn ghế', 'sơ đồ xe', 'vị trí ngồi'],
  },
  {
    id: 6,
    category: 'bus',
    question: 'Tôi có thể mang theo hành lý gì trên xe?',
    answer: 'Hành lý xách tay: 1 túi nhỏ (dưới 5kg). Hành lý ký gửi: 20kg miễn phí, tính phí cho phần vượt. Không được mang: chất dễ cháy nổ, thú cưng (trừ có giấy phép), thực phẩm có mùi nặng.',
    helpful: 98,
    tags: ['hành lý xe', 'quy định', 'vận chuyển'],
  },
  {
    id: 7,
    category: 'tour',
    question: 'Tour đã bao gồm những gì?',
    answer: 'Tùy từng tour, thường bao gồm: Vận chuyển (máy bay/xe), khách sạn, một số bữa ăn, vé tham quan các điểm theo chương trình, hướng dẫn viên. Không bao gồm: Chi phí cá nhân, bữa ăn ngoài chương trình, tip HDV, bảo hiểm du lịch.',
    helpful: 167,
    tags: ['tour bao gồm', 'chi phí', 'dịch vụ'],
  },
  {
    id: 8,
    category: 'tour',
    question: 'Tôi có thể hủy tour trước bao lâu?',
    answer: 'Chính sách hủy tour: Trước 15 ngày: mất 20% tiền tour. Trước 7-14 ngày: mất 50%. Trước 3-6 ngày: mất 75%. Trong vòng 2 ngày: mất 100%. Trường hợp bất khả kháng (bệnh tật có giấy tờ y tế) có thể được xem xét đặc biệt.',
    helpful: 142,
    tags: ['hủy tour', 'chính sách', 'hoàn tiền'],
  },
  {
    id: 9,
    category: 'account',
    question: 'Làm thế nào để đăng ký tài khoản?',
    answer: 'Click "Đăng ký" ở góc phải màn hình, điền email/số điện thoại và mật khẩu. Kiểm tra email/SMS để xác thực tài khoản. Sau khi xác thực, bạn có thể đăng nhập và sử dụng đầy đủ tính năng.',
    helpful: 89,
    tags: ['đăng ký', 'tài khoản', 'xác thực'],
  },
  {
    id: 10,
    category: 'account',
    question: 'Tôi quên mật khẩu, phải làm sao?',
    answer: 'Click "Quên mật khẩu" tại trang đăng nhập, nhập email/số điện thoại đã đăng ký. Hệ thống sẽ gửi link đặt lại mật khẩu. Click link trong email/SMS, nhập mật khẩu mới và xác nhận.',
    helpful: 156,
    tags: ['quên mật khẩu', 'khôi phục', 'đăng nhập'],
  },
];

const supportChannels = [
  {
    icon: Phone,
    title: 'Hotline 24/7',
    description: 'Gọi ngay để được hỗ trợ trực tiếp',
    contact: '1900 1234',
    available: 'Luôn sẵn sàng',
    color: 'bg-green-500',
  },
  {
    icon: MessageCircle,
    title: 'Live Chat',
    description: 'Chat trực tiếp với tư vấn viên',
    contact: 'Bắt đầu chat',
    available: '6:00 - 24:00',
    color: 'bg-blue-500',
  },
  {
    icon: Mail,
    title: 'Email hỗ trợ',
    description: 'Gửi email cho đội ngũ hỗ trợ',
    contact: 'support@MegaTrip.com',
    available: 'Phản hồi trong 2-4h',
    color: 'bg-purple-500',
  },
];

export default function HoTro() {
  const [selectedCategory, setSelectedCategory] = useState('booking');
  const [searchTerm, setSearchTerm] = useState('');
  const [helpfulVotes, setHelpfulVotes] = useState<{[key: number]: boolean}>({});
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    subject: '',
    message: '',
    orderNumber: '',
  });

  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const markAsHelpful = (faqId: number) => {
    setHelpfulVotes(prev => ({
      ...prev,
      [faqId]: !prev[faqId]
    }));
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Contact form submitted:', contactForm);
    // Reset form or show success message
  };

  const handleInputChange = (field: string, value: string) => {
    setContactForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
        <div className="container">
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">Trung tâm hỗ trợ</h1>
            <p className="text-lg text-muted-foreground">
              Tìm câu trả lời cho mọi thắc mắc hoặc liên hệ với chúng tôi
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm câu hỏi thường gặp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
          </div>

          {/* Support Channels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {supportChannels.map((channel, index) => (
              <Card key={index} className="text-center hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${channel.color} text-white mb-4`}>
                    <channel.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2">{channel.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{channel.description}</p>
                  <div className="font-medium text-primary mb-1">{channel.contact}</div>
                  <div className="text-xs text-muted-foreground">{channel.available}</div>
                  <Button className="mt-3" size="sm">
                    Liên hệ ngay
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <div className="container py-8">
        <Tabs defaultValue="faq" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="faq">Câu hỏi thường gặp</TabsTrigger>
            <TabsTrigger value="contact">Gửi yêu cầu hỗ trợ</TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-6">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                Tất cả
              </Button>
              {supportCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2"
                >
                  <category.icon className="h-4 w-4" />
                  {category.name} ({category.count})
                </Button>
              ))}
            </div>

            {/* FAQ List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Câu hỏi thường gặp</h2>
                <Accordion type="single" collapsible className="w-full">
                  {filteredFAQs.slice(0, Math.ceil(filteredFAQs.length / 2)).map((faq) => (
                    <AccordionItem key={faq.id} value={`item-${faq.id}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <p className="text-muted-foreground">{faq.answer}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex gap-1">
                              {faq.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant={helpfulVotes[faq.id] ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => markAsHelpful(faq.id)}
                                className="text-xs"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Hữu ích ({faq.helpful + (helpfulVotes[faq.id] ? 1 : 0)})
                              </Button>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">&nbsp;</h2>
                <Accordion type="single" collapsible className="w-full">
                  {filteredFAQs.slice(Math.ceil(filteredFAQs.length / 2)).map((faq) => (
                    <AccordionItem key={faq.id} value={`item-${faq.id}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <p className="text-muted-foreground">{faq.answer}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex gap-1">
                              {faq.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant={helpfulVotes[faq.id] ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => markAsHelpful(faq.id)}
                                className="text-xs"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Hữu ích ({faq.helpful + (helpfulVotes[faq.id] ? 1 : 0)})
                              </Button>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>

            {filteredFAQs.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Không tìm thấy câu hỏi phù hợp</h3>
                  <p className="text-muted-foreground mb-4">
                    Vui lòng thử tìm kiếm với từ khóa khác hoặc liên hệ trực tiếp với chúng tôi
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
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Contact Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Gửi yêu cầu hỗ trợ</CardTitle>
                  <p className="text-muted-foreground">
                    Điền form bên dưới và chúng tôi sẽ phản hồi trong vòng 2-4 giờ
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Họ và tên *</Label>
                        <Input
                          id="name"
                          value={contactForm.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Số điện thoại</Label>
                        <Input
                          id="phone"
                          value={contactForm.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Loại vấn đề</Label>
                        <Select
                          value={contactForm.category}
                          onValueChange={(value) => handleInputChange('category', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn loại vấn đề" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="booking">Đặt chỗ & Thanh toán</SelectItem>
                            <SelectItem value="flight">Vé máy bay</SelectItem>
                            <SelectItem value="bus">Xe du lịch</SelectItem>
                            <SelectItem value="tour">Tour du lịch</SelectItem>
                            <SelectItem value="refund">Hoàn tiền</SelectItem>
                            <SelectItem value="account">Tài khoản</SelectItem>
                            <SelectItem value="other">Khác</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="orderNumber">Mã đơn hàng (nếu có)</Label>
                        <Input
                          id="orderNumber"
                          value={contactForm.orderNumber}
                          onChange={(e) => handleInputChange('orderNumber', e.target.value)}
                          placeholder="VD: TRV123456789"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="subject">Tiêu đề *</Label>
                      <Input
                        id="subject"
                        value={contactForm.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">Nội dung chi tiết *</Label>
                      <Textarea
                        id="message"
                        rows={6}
                        value={contactForm.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        placeholder="Mô tả chi tiết vấn đề của bạn..."
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full">
                      <Send className="h-4 w-4 mr-2" />
                      Gửi yêu cầu hỗ trợ
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Support Info */}
              <div className="space-y-6">
                {/* Contact Methods */}
                <Card>
                  <CardHeader>
                    <CardTitle>Thông tin liên hệ</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-green-500" />
                      <div>
                        <div className="font-medium">Hotline 24/7</div>
                        <div className="text-sm text-muted-foreground">1900 1234</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="font-medium">Email hỗ trợ</div>
                        <div className="text-sm text-muted-foreground">support@MegaTrip.com</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-orange-500" />
                      <div>
                        <div className="font-medium">Thời gian làm việc</div>
                        <div className="text-sm text-muted-foreground">
                          Hotline: 24/7<br />
                          Email: 6:00 - 24:00 hàng ngày
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Links */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tài liệu hữu ích</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Link prefetch={false} 
                      href="/dieu-khoan"
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>Điều khoản sử dụng</span>
                      </div>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                    <Link prefetch={false} 
                      href="/chinh-sach-bao-mat"
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>Chính sách bảo mật</span>
                      </div>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                    <Link prefetch={false} 
                      href="/chinh-sach-huy-hoan"
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>Chính sách hủy/hoàn</span>
                      </div>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </CardContent>
                </Card>

                {/* Response Time */}
                <Card>
                  <CardHeader>
                    <CardTitle>Thời gian phản hồi</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Hotline</span>
                      <Badge variant="secondary">Ngay lập tức</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Live Chat</span>
                      <Badge variant="secondary">1-2 phút</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Email</span>
                      <Badge variant="secondary">2-4 giờ</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Form hỗ trợ</span>
                      <Badge variant="secondary">2-4 giờ</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
