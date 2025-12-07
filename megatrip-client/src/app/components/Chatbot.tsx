'use client'

import { useState, useRef, useEffect } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { MessageCircle, X, Send } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
        { role: 'bot', text: 'Xin chào! Tôi là trợ lý du lịch của **MegaTrip**. Bạn muốn đặt **tour**, **xe khách** hay **vé máy bay**?' },
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    

    const handleSend = async () => {
        if (!input.trim()) return
        const userMessage = { role: 'user' as const, text: input }
        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsLoading(true)

        try {
            const lowerInput = input.toLowerCase()

            const [tourRes, busRes] = await Promise.all([
                fetch('https://megatripserver.onrender.com/api/tours'),
                fetch('https://megatripserver.onrender.com/api/buses/client/buses?page=1&pageSize=50&status=scheduled')
            ])
            const tours = (await tourRes.json()).data || []
            const buses = (await busRes.json()).data || []

            const destinations = new Set([
                ...tours.map((t: any) => t.destination.toLowerCase()),
                ...buses.map((b: any) => b.routeTo.city.toLowerCase())
            ])
            const matched = Array.from(destinations).filter(d => lowerInput.includes(d))

            let dataPrompt = ''

            if (lowerInput.includes('tour')) {
                const filtered = matched.length
                    ? tours.filter((t: any) => matched.includes(t.destination.toLowerCase()))
                    : tours

                if (filtered.length) {
                    dataPrompt = filtered.map((t: any) =>
                        `**${t.name}**\n` +
                        `💰 ${t.adultPrice.toLocaleString()}đ | ⏱ ${t.duration} ngày | 📍 ${t.departureFrom} → ${t.destination}\n` +
                        `🔗 [Đặt ngay](https://mega-trip-eewz.vercel.app/tour/${t.slug})`
                    ).join('\n\n')
                } else {
                    dataPrompt = 'Không tìm thấy tour phù hợp.'
                }
            }

            else if (lowerInput.includes('xe') || lowerInput.includes('bus')) {
                const filtered = matched.length
                    ? buses.filter((b: any) => matched.includes(b.routeTo.city.toLowerCase()))
                    : buses

                if (filtered.length) {
                    dataPrompt = filtered.map((b: any) =>
                        `**${b.operator.name}**\n` +
                        `📍 ${b.routeFrom.city} → ${b.routeTo.city} | 💰 ${b.adultPrice.toLocaleString()}đ\n` +
                        `🔗 [Đặt ngay](https://mega-trip-eewz.vercel.app/xe-du-lich/${b._id})`
                    ).join('\n\n')
                } else {
                    dataPrompt = 'Hiện tại chưa có xe đi điểm bạn muốn. Bạn thử tìm điểm khác hoặc kiểm tra lại sau nhé!'
                }
            }

            else if (lowerInput.includes('máy bay') || lowerInput.includes('flight')) {
                dataPrompt = 'Bạn hãy chọn **điểm đi** và **điểm đến** để xem vé máy bay nhé! [Tìm vé máy bay](https://mega-trip-eewz.vercel.app/ve-may-bay)';
            }

            else if (lowerInput.includes('hủy') || lowerInput.includes('hủy đơn') || lowerInput.includes('chính sách hủy')) {
                dataPrompt = `
**Chính sách hủy đơn MegaTrip**

**Tour:**
- Trước 15 ngày: Phí 20% giá trị tour
- 7-14 ngày trước: Phí 50% giá trị tour
- 3-6 ngày trước: Phí 75% giá trị tour
- Trong 3 ngày trước: Phí 100% giá trị tour

**Xe khách:**
- ≥ 72 giờ trước giờ khởi hành: Phí 10% (50.000đ/khách)
- 24-72 giờ trước: Phí 25% + 50.000đ/khách
- 12-24 giờ trước: Phí 50%
- < 12 giờ: Không hoàn

**Vé máy bay:**
- Theo chính sách của hãng (Vietnam Airlines, VietJet, v.v.)
- Thường: ≥ 7 ngày: Phí 5-10%, 3-7 ngày: 20-30%, < 3 ngày: 50-100%
- Thuế không hoàn: 50.000-60.000đ/khách

Liên hệ hỗ trợ để hủy đơn cụ thể.
            `;
            }

            else if (lowerInput.includes('đổi') || lowerInput.includes('đổi lịch') || lowerInput.includes('chính sách đổi')) {
                dataPrompt = `
**Chính sách đổi lịch MegaTrip**

**Tour:**
- Trên 5 ngày: Phí 30% giá trị tour
- Từ 5 ngày trước: Phí 50% giá trị tour
- 3 ngày trước: Phí 100% giá trị tour

**Xe khách:**
- ≥ 72 giờ trước: Phí 50.000đ/khách
- 24-72 giờ trước: Phí 50.000đ/khách + 25% giá vé
- < 24 giờ: Không đổi

**Vé máy bay:**
- Theo chính sách hãng, thường cao hơn hủy.
- Có thể đổi với phí + chênh lệch giá.

Liên hệ hỗ trợ để đổi lịch cụ thể.
            `;
            }
            

            else if (lowerInput.includes('thanh toán') || lowerInput.includes('hoàn tiền') || lowerInput.includes('chuyển khoản')) {
                dataPrompt = `
**Thanh toán & hoàn tiền MegaTrip**

**Phương thức thanh toán:**
- **Ví điện tử**: ZaloPay, VNPay, MoMo (phí 0%)

**Thanh toán như thế nào?**
- Chọn dịch vụ → Điền thông tin → Chọn phương thức → Xác nhận thanh toán.

**Khi nào nhận được tiền hoàn?**
- **Tour/Xe khách**: 7-14 ngày làm việc sau khi hủy.
- **Vé máy bay**: Theo chính sách hãng, thường 30-60 ngày.
- Hoàn về phương thức thanh toán gốc.

Liên hệ hỗ trợ nếu cần.
    `;
            }

            else if (lowerInput.includes('liên hệ') || lowerInput.includes('hotline') || lowerInput.includes('hỗ trợ') || lowerInput.includes('cskh')) {
                dataPrompt = `
**Hỗ trợ & liên hệ MegaTrip**

**Liên hệ ai khi có sự cố?**
- Gửi email: support@megatrip.vn
- Chat trực tiếp trên app/website.

**Có số hotline không?**
- Hotline: 1900 1234
- Zalo OA: @MegaTripVN
👉 [Xem ưu đãi ngay](https://mega-trip-eewz.vercel.app/ho-tro)
Chúng tôi luôn sẵn sàng giúp đỡ!
    `;
            }

            else if (lowerInput.includes('khuyến mãi') || lowerInput.includes('giảm giá')) {
                dataPrompt = `
**Khuyến mãi MegaTrip**
👉 [Xem ưu đãi ngay](https://mega-trip-eewz.vercel.app/khuyen-mai)
    `;
            }

            else if (lowerInput.includes('hành lý') || lowerInput.includes('ăn uống') || lowerInput.includes('wifi')) {
                dataPrompt = `
**Chi tiết dịch vụ MegaTrip**

**Mang hành lý bao nhiêu ký?**
- **Tour**: Hành lý cá nhân 7kg, ký gửi 20kg (tùy tour).
- **Xe khách**: Hành lý miễn phí 10kg, thêm 50.000đ/kg.
- **Vé máy bay**: Theo hãng, phổ thông 7kg handbag + 23kg checkin.

**Tour có bao gồm ăn uống không?**
- Phụ thuộc tour: Một số bao gồm bữa sáng/trưa, một số không. Kiểm tra chi tiết tour.

**Xe có wifi không?**
- Một số tuyến có wifi miễn phí, một số không. Kiểm tra chi tiết xe.

Xem chi tiết trên trang dịch vụ nhé!
    `;
            }

                
            else {
                dataPrompt = 'Mình hỗ trợ tìm **tour**, **xe khách**, **vé máy bay**, và tư vấn **chính sách hủy đơn** hoặc **đổi lịch**. Bạn cần gì ạ?'
            }

            const prompt = `Bạn là trợ lý MegaTrip. Dùng đúng data sau, KHÔNG bịa thêm:\n\n${dataPrompt}\n\nCâu hỏi: ${input}\n\nTrả lời tự nhiên, ngắn gọn, dùng emoji hợp lý, tên in đậm. Nếu có link thì giữ nguyên [Đặt ngay](...), nếu không thì KHÔNG thêm link.`

            const result = await model.generateContent(prompt)
            const botResponse = result.response.text()

            setMessages(prev => [...prev, { role: 'bot', text: botResponse }])
        } catch (error) {
            console.error('Lỗi:', error)
            setMessages(prev => [...prev, { role: 'bot', text: 'Xin lỗi, hệ thống đang bận. Vui lòng thử lại sau.' }])
        } finally {
            setIsLoading(false)
        }
    }

    

    return (
        <>
            {/* Nút mở chatbot */}
            <Button
                onClick={() => setIsOpen(!isOpen)}  // Thay đổi thành toggle
                className="fixed bottom-6 right-6 rounded-full w-14 h-14 p-0 shadow-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all z-50"
            // Loại bỏ style display
            >
                {isOpen ? <X className="h-7 w-7 text-white" /> : <MessageCircle className="h-7 w-7 text-white" />}
            </Button>

            {/* Chatbot window */}
            {isOpen && (
                <Card className="fixed bottom-24 right-6 w-96 h-[520px] shadow-2xl border-0 rounded-2xl overflow-hidden z-50 flex flex-col bg-white">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <MessageCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Trợ lý MegaTrip</h3>
                                <p className="text-xs opacity-90">Luôn sẵn sàng hỗ trợ bạn!</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20">
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Messages */}
                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] p-3 rounded-2xl shadow-sm ${msg.role === 'user'
                                        ? 'bg-blue-500 text-white rounded-br-none'
                                        : 'bg-white text-gray-800 rounded-bl-none border'
                                        }`}
                                >
                                    {msg.role === 'bot' ? (
                                        <ReactMarkdown
                                            // className="prose prose-sm max-w-none text-inherit"
                                            components={{
                                                a: ({ children, href }) => (
                                                    <a
                                                        href={href}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="font-semibold text-blue-600 hover:text-blue-700 underline inline-flex items-center gap-1"
                                                    >
                                                        {children} <span className="text-xs">↗</span>
                                                    </a>
                                                ),
                                                strong: ({ children }) => (
                                                    <strong className="font-bold text-blue-600">{children}</strong>
                                                )
                                            }}
                                        >
                                            {msg.text}
                                        </ReactMarkdown>
                                    ) : (
                                        <p className="text-sm">{msg.text}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white p-3 rounded-2xl rounded-bl-none border shadow-sm">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </CardContent>

                    {/* Input */}
                    <div className="p-3 bg-white border-t">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                                placeholder="Nhập câu hỏi..."
                                className="flex-1 px-4 py-2.5 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={isLoading}
                            />
                            <Button
                                onClick={handleSend}
                                disabled={isLoading || !input.trim()}
                                className="rounded-full w-11 h-11 p-0 bg-blue-500 hover:bg-blue-600 disabled:opacity-50"
                            >
                                <Send className="h-5 w-5 text-white" />
                            </Button>
                        </div>
                    </div>
                </Card>
            )}
        </>
    )
}

export default Chatbot