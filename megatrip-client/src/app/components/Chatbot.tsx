'use client'

import { useState, useRef, useEffect } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { MessageCircle, X, Send } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { me } from '@/apis/auth'  // Import để lấy thông tin user từ API

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [userName, setUserName] = useState('bạn')  // State cho userName, mặc định 'bạn'
    const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
        { role: 'bot', text: `Xin chào ${userName}! Tôi là trợ lý du lịch của **MegaTrip**. Bạn muốn đặt **tour**, **xe khách** hay **vé máy bay**?` },
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // useEffect để fetch userName từ API nếu đã đăng nhập
    useEffect(() => {
        const token = localStorage.getItem('token')  // Giả sử key lưu token là 'token'
        if (token) {
            const fetchUserName = async () => {
                try {
                    const res = await me()
                    if (res.data?.success && res.data.data?.name) {
                        setUserName(res.data.data.name)
                    } else {
                        setUserName('bạn')
                    }
                } catch (error) {
                    console.error('Lỗi khi lấy thông tin user:', error)
                    setUserName('bạn')
                }
            }
            fetchUserName()
        } else {
            setUserName('bạn')  // Nếu chưa đăng nhập, dùng 'bạn'
        }
    }, [])

    // useEffect để cập nhật tin nhắn chào mừng khi userName thay đổi
    useEffect(() => {
        setMessages(prev => {
            if (prev.length > 0 && prev[0].role === 'bot') {
                return [
                    { role: 'bot', text: `Xin chào ${userName}! Tôi là trợ lý du lịch của **MegaTrip**. Bạn muốn đặt **tour**, **xe khách** hay **vé máy bay**?` },
                    ...prev.slice(1)
                ]
            }
            return prev
        })
    }, [userName])


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

            const rawTours = (await tourRes.json()).data || []
            const rawBuses = (await busRes.json()).data || []

            // normalize dates: only keep upcoming (today or later)
            const todayStart = new Date()
            todayStart.setHours(0, 0, 0, 0)

            const tours = rawTours.map((t: any) => {
                const upcomingStartDates = (t.startDates || [])
                    .map((s: string) => new Date(s))
                    .filter((d: Date) => d.getTime() >= todayStart.getTime())
                    .sort((a: Date, b: Date) => a.getTime() - b.getTime())
                    .map((d: Date) => d.toISOString())
                return { ...t, upcomingStartDates }
            }).filter((t: any) => (t.upcomingStartDates || []).length > 0) // drop tours with no future dates

            const buses = rawBuses.map((b: any) => {
                const upcomingDepartureDates = (b.departureDates || [])
                    .map((s: string) => new Date(s))
                    .filter((d: Date) => d.getTime() >= todayStart.getTime())
                    .sort((a: Date, b: Date) => a.getTime() - b.getTime())
                    .map((d: Date) => d.toISOString())
                return { ...b, upcomingDepartureDates }
            }).filter((b: any) => (b.upcomingDepartureDates || []).length > 0) // drop buses with no future dates

            // Danh sách điểm đến phân loại dựa trên provinces.json, bao phủ toàn bộ tỉnh Việt Nam
            const biểnDestinations = [
                'quảng ninh', 'hải phòng', 'thanh hóa', 'nghệ an', 'hà tĩnh', 'quảng bình', 'quảng trị', 'thừa thiên huế', 'đà nẵng', 'quảng nam', 'quảng ngãi', 'bình định', 'phú yên', 'khánh hòa', 'ninh thuận', 'bình thuận', 'bà rịa vũng tàu', 'đồng nai', 'hồ chí minh', 'tiền giang', 'bến tre', 'trà vinh', 'vĩnh long', 'đồng tháp', 'an giang', 'kiên giang', 'cần thơ', 'hậu giang', 'sóc trăng', 'bạc liêu', 'cà mau'
            ].map(d => d.toLowerCase())

            const núiDestinations = [
                'cao bằng', 'bắc kạn', 'tuyên quang', 'thái nguyên', 'lạng sơn', 'bắc giang', 'phú thọ', 'vĩnh phúc', 'yên bái', 'hà giang', 'lào cai', 'lai châu', 'sơn la', 'điện biên', 'hòa bình', 'lâm đồng', 'gia lai', 'kon tum', 'đắk lắk', 'đắk nông'
            ].map(d => d.toLowerCase())

            const đấtLiềnDestinations = [
                'hà nội', 'hải dương', 'hưng yên', 'bắc ninh', 'hà nam', 'nam định', 'ninh bình', 'thái bình', 'bình dương', 'bình phước', 'tây ninh', 'long an'
            ].map(d => d.toLowerCase())

            const destinations = new Set([
                ...tours.map((t: any) => (t.destination || '').toLowerCase()),
                ...buses.map((b: any) => (b.routeTo?.city || '').toLowerCase())
            ])
            const matched = Array.from(destinations).filter(d => lowerInput.includes(d))

            // Parse điểm đi: "từ [tỉnh]" - improved to avoid greedy capture and to handle "từ X đến Y"
            let fromProvince: string | null = null
            const fromToMatch = lowerInput.match(/từ\s+([^\n\r,]+?)\s+(?:đi|đến|->|to)\s+([^\n\r,]+)/i)
            if (fromToMatch) {
                fromProvince = fromToMatch[1].trim().toLowerCase()
            } else {
                const fromMatch = lowerInput.match(/từ\s+([a-z\s]+)/i)
                fromProvince = fromMatch ? fromMatch[1].trim().toLowerCase() : null
            }

            // Parse thời gian: "tháng [số]"
            const monthMatch = lowerInput.match(/tháng\s+(\d+)/i)
            const month = monthMatch ? parseInt(monthMatch[1]) : null

            // Parse ngày: "ngày [dd/mm]" hoặc "ngày mai", "ngày kia"
            let targetDate: Date | null = null
            const today = new Date()
            const tomorrow = new Date(today)
            tomorrow.setDate(today.getDate() + 1)
            const dayAfterTomorrow = new Date(today)
            dayAfterTomorrow.setDate(today.getDate() + 2)

            const dayMatch = lowerInput.match(/ngày\s+mai/i)
            const dayAfterMatch = lowerInput.match(/ngày\s+kia/i)
            const dateMatch = lowerInput.match(/ngày\s+(\d{1,2}\/\d{1,2}(?:\/\d{4})?)/i)

            if (dayMatch) {
                targetDate = tomorrow
            } else if (dayAfterMatch) {
                targetDate = dayAfterTomorrow
            } else if (dateMatch) {
                const dateStr = dateMatch[1]
                const parts = dateStr.split('/')
                const day = parseInt(parts[0])
                const monthIdx = parseInt(parts[1]) - 1  // JS months are 0-based
                const year = parts[2] ? parseInt(parts[2]) : today.getFullYear()
                targetDate = new Date(year, monthIdx, day)
            }

            // Parse giá: "rẻ" hoặc "dưới [số]" with better number handling (plain thousands)
            const priceMatch = lowerInput.match(/(?:dưới|<|rẻ)\s*([\d.,]+)\s*(k|nghìn|triệu|m|vnđ)?/i)
            let maxPrice: number | null = null
            if (priceMatch) {
                let num = parseFloat(priceMatch[1].replace(/[.,]/g, ''))
                const unit = (priceMatch[2] || '').toLowerCase()
                if (unit.includes('triệu') || unit === 'm') num = num * 1000000
                else if (unit === 'k' || unit.includes('nghìn')) num = num * 1000
                maxPrice = Math.round(num)
            } else {
                const simpleCheap = lowerInput.includes('rẻ') ? 5000000 : null
                maxPrice = simpleCheap
            }

            let dataPrompt = ''
            let filteredTours: any[] = []
            let filteredBuses: any[] = []

            if (lowerInput.includes('tour')) {
                let filtered = tours

                // Phân loại theo loại địa điểm nếu user chỉ định
                if (lowerInput.includes('biển')) {
                    filtered = filtered.filter((t: any) => biểnDestinations.includes((t.destination || '').toLowerCase()))
                } else if (lowerInput.includes('núi')) {
                    filtered = filtered.filter((t: any) => núiDestinations.includes((t.destination || '').toLowerCase()))
                } else if (lowerInput.includes('đất liền')) {
                    filtered = filtered.filter((t: any) => đấtLiềnDestinations.includes((t.destination || '').toLowerCase()))
                } else if (matched.length) {
                    // Nếu có match cụ thể, filter theo điểm đến
                    filtered = filtered.filter((t: any) => matched.includes((t.destination || '').toLowerCase()))
                }

                // Filter theo điểm đi nếu có
                if (fromProvince) {
                    filtered = filtered.filter((t: any) => (t.departureFrom || '').toLowerCase().includes(fromProvince))
                }

                // Filter theo tháng nếu có (dựa trên upcomingStartDates)
                if (month) {
                    filtered = filtered.filter((t: any) => (t.upcomingStartDates || []).some((date: string) => (new Date(date).getMonth() + 1) === month))
                }

                // Filter theo ngày nếu có (dựa trên upcomingStartDates)
                if (targetDate) {
                    filtered = filtered.filter((t: any) => (t.upcomingStartDates || []).some((date: string) => {
                        const startDate = new Date(date)
                        return startDate.getFullYear() === targetDate!.getFullYear()
                            && startDate.getMonth() === targetDate!.getMonth()
                            && startDate.getDate() === targetDate!.getDate()
                    }))
                }

                // Filter theo giá nếu có
                if (maxPrice) {
                    filtered = filtered.filter((t: any) => t.adultPrice <= maxPrice)
                }

                // Nếu user hỏi "rẻ nhất" -> lấy tour có giá nhỏ nhất
                if (lowerInput.includes('rẻ nhất')) {
                    if (filtered.length) {
                        const minPrice = Math.min(...filtered.map((t: any) => t.adultPrice))
                        filtered = filtered.filter((t: any) => t.adultPrice === minPrice)
                    }
                }

                filteredTours = filtered

                if (filtered.length) {
                    // Build dataPrompt with clear date range / upcoming-only info
                    dataPrompt = filtered.map((t: any) => {
                        const up = (t.upcomingStartDates || []).map((d: string) => new Date(d))
                        let dateText = ''
                        if (up.length === 1) {
                            const d = up[0]
                            dateText = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
                        } else if (up.length > 1) {
                            const first = up[0], last = up[up.length - 1]
                            dateText = `từ ${String(first.getDate()).padStart(2, '0')}/${String(first.getMonth() + 1).padStart(2, '0')}/${first.getFullYear()} đến ${String(last.getDate()).padStart(2, '0')}/${String(last.getMonth() + 1).padStart(2, '0')}/${last.getFullYear()}`
                        } else {
                            dateText = 'Không có ngày khởi hành trong tương lai'
                        }

                        return `**${t.name}**\n` +
                            `💰 ${t.adultPrice.toLocaleString()}đ | ⏱ ${t.duration} ngày | 📍 ${t.departureFrom} → ${t.destination}\n` +
                            `Ngày khởi hành: ${dateText}\n` +
                            `https://mega-trip-eewz.vercel.app/tour/${t.slug}`
                    }).join('\n\n')
                } else {
                    dataPrompt = 'Không tìm thấy tour phù hợp. Thử tìm theo loại địa điểm khác như "tour biển" hoặc "tour núi" nhé!'
                }
            }

            else if (lowerInput.includes('xe') || lowerInput.includes('bus')) {
                let filtered = buses

                // Filter theo điểm đến nếu có
                if (matched.length) {
                    filtered = filtered.filter((b: any) => matched.includes((b.routeTo?.city || '').toLowerCase()))
                }

                // Filter theo điểm đi nếu có
                if (fromProvince) {
                    filtered = filtered.filter((b: any) => (b.routeFrom?.city || '').toLowerCase().includes(fromProvince))
                }

                // Filter theo ngày nếu có (dựa trên upcomingDepartureDates)
                if (targetDate) {
                    filtered = filtered.filter((b: any) => (b.upcomingDepartureDates || []).some((date: string) => {
                        const depDate = new Date(date)
                        return depDate.getFullYear() === targetDate!.getFullYear()
                            && depDate.getMonth() === targetDate!.getMonth()
                            && depDate.getDate() === targetDate!.getDate()
                    }))
                }

                // Filter theo giá nếu có
                if (maxPrice) {
                    filtered = filtered.filter((b: any) => b.adultPrice <= maxPrice)
                }

                // Nếu user hỏi "rẻ nhất" -> lấy chuyến có giá nhỏ nhất
                if (lowerInput.includes('rẻ nhất')) {
                    if (filtered.length) {
                        const minPrice = Math.min(...filtered.map((b: any) => b.adultPrice))
                        filtered = filtered.filter((b: any) => b.adultPrice === minPrice)
                    }
                }

                filteredBuses = filtered

                if (filtered.length) {
                    dataPrompt = filtered.map((b: any) => {
                        const up = (b.upcomingDepartureDates || []).map((d: string) => new Date(d))
                        let dateText = ''
                        if (up.length === 1) {
                            const d = up[0]
                            dateText = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
                        } else if (up.length > 1) {
                            const first = up[0], last = up[up.length - 1]
                            dateText = `từ ${String(first.getDate()).padStart(2, '0')}/${String(first.getMonth() + 1).padStart(2, '0')}/${first.getFullYear()} đến ${String(last.getDate()).padStart(2, '0')}/${String(last.getMonth() + 1).padStart(2, '0')}/${last.getFullYear()}`
                        } else {
                            dateText = 'Không có ngày khởi hành trong tương lai'
                        }

                        return `**${b.operator?.name}**\n` +
                            `📍 ${b.routeFrom.city} → ${b.routeTo.city} | 💰 ${b.adultPrice.toLocaleString()}đ\n` +
                            `Ngày khởi hành: ${dateText}\n` +
                            `https://mega-trip-eewz.vercel.app/xe-du-lich/${b._id}`
                    }).join('\n\n')
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
- Từ 3 đến 5 ngày trước: Phí 50% giá trị tour
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
            if (!lowerInput.includes('tour') && !lowerInput.includes('xe') && !lowerInput.includes('bus') && dataPrompt && dataPrompt.trim()) {
                setMessages(prev => [...prev, { role: 'bot', text: dataPrompt.trim() }])
                setIsLoading(false)
                return
            }
            // Build structured payload for AI (use only this data)
            const payload = {
                query: input,
                tours: filteredTours.slice(0, 10).map(t => ({
                    name: t.name,
                    slug: t.slug,
                    adultPrice: t.adultPrice,
                    duration: t.duration,
                    departureFrom: t.departureFrom,
                    destination: t.destination,
                    startDates: t.upcomingStartDates || []
                })),
                buses: filteredBuses.slice(0, 10).map(b => ({
                    id: b._id,
                    operator: b.operator?.name,
                    from: b.routeFrom?.city,
                    to: b.routeTo?.city,
                    adultPrice: b.adultPrice,
                    departureDates: b.upcomingDepartureDates || []
                }))
            }

            const aiPrompt = `
Bạn là trợ lý MegaTrip. DÙNG CHỈ dữ liệu JSON sau để trả lời, KHÔNG bịa hay thêm thông tin. Trả lời tự nhiên, thân thiện, ngắn gọn, tiếng Việt, có đầu - thân - kết (mở đầu + các câu liệt kê + kết thúc ngắn gọn). QUY TẮC:
- Mở đầu 1 câu ngắn: "Mình tìm thấy X kết quả phù hợp." hoặc "Hiện tại có X chuyến phù hợp." (nếu X = 0, trả lời đúng theo mục 3).
- Với tours: liệt kê tối đa 5 mục; mỗi mục là 1 câu hoàn chỉnh (có chủ ngữ/vị ngữ), ví dụ: "**Tên tour** có giá 350.000₫/người, 1 ngày, khởi hành từ 19/12/2025 đến 25/12/2025, xuất phát Lai Châu → Khánh Hòa. Đặt ngay: [Đặt ngay](https://mega-trip-eewz.vercel.app/tour/{slug})."
- Với buses: tương tự, 1 câu/mục: "**Hãng** có chuyến Lai Châu → Khánh Hòa, giá 40.000₫, khởi hành từ 19/12/2025 đến 21/12/2025. Đặt ngay: [Đặt ngay](https://mega-trip-eewz.vercel.app/xe-du-lich/{id})."
- Nếu tour có nhiều ngày khởi hành chỉ ghi khoảng "khởi hành từ dd/mm/yyyy đến dd/mm/yyyy" (chỉ dùng ngày trong tương lai).
- Nếu payload.*.length = 0 -> nếu query chứa 'tour' trả về: "Hiện tại MegaTrip chưa có tour ...", nếu chứa 'xe'/'bus' trả về: "Hiện tại chưa có xe ...". KHÔNG thêm nội dung khác.
- KHÔNG thêm câu gợi ý ở cuối (không "Bạn muốn mình đặt giúp chỗ nào?" v.v.).
Dữ liệu JSON:
${JSON.stringify(payload)}
Câu hỏi user: "${input}"
`
            const result = await model.generateContent(aiPrompt)
            // Build a deterministic, well-formed reply from payload to avoid broken/malformed links
            const aiText = result.response.text().trim()
            const toursList = payload.tours || []
            const busesList = payload.buses || []

            const formatDate = (iso: string) => {
                const d = new Date(iso)
                return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
            }

            let finalText = ''
            const total = toursList.length + busesList.length

            if (total === 0) {
                // fallback to AI short reply if no results
                finalText = aiText || (dataPrompt || 'Mình hỗ trợ tìm **tour**, **xe khách**, **vé máy bay**. Bạn cần gì ạ?')
            } else {
                finalText = `Mình tìm thấy ${total} kết quả phù hợp.\n\n`

                const lines: string[] = []
                for (const t of toursList.slice(0, 5)) {
                    const up = (t.startDates || []).map((s: string) => new Date(s)).sort((a, b) => a.getTime() - b.getTime())
                    let dateText = ''
                    if (up.length === 1) dateText = `khởi hành ${formatDate(up[0].toISOString())}`
                    else if (up.length > 1) dateText = `khởi hành từ ${formatDate(up[0].toISOString())} đến ${formatDate(up[up.length - 1].toISOString())}`
                    else dateText = 'không có ngày khởi hành trong tương lai'
                    lines.push(`**${t.name}** có giá ${t.adultPrice.toLocaleString()}₫/người, ${t.duration} ngày, ${dateText}, xuất phát ${t.departureFrom} → ${t.destination}. Đặt ngay: [Đặt ngay](https://mega-trip-eewz.vercel.app/tour/${t.slug})`)
                }

                for (const b of busesList.slice(0, 5)) {
                    const up = (b.departureDates || []).map((s: string) => new Date(s)).sort((a:any, b:any) => a.getTime() - b.getTime())
                    let dateText = ''
                    if (up.length === 1) dateText = `khởi hành ${formatDate(up[0].toISOString())}`
                    else if (up.length > 1) dateText = `khởi hành từ ${formatDate(up[0].toISOString())} đến ${formatDate(up[up.length - 1].toISOString())}`
                    else dateText = 'không có ngày khởi hành trong tương lai'
                    lines.push(`**${b.operator}** có chuyến ${b.from} → ${b.to}, giá ${b.adultPrice.toLocaleString()}₫, ${dateText}. Đặt ngay: [Đặt ngay](https://mega-trip-eewz.vercel.app/xe-du-lich/${b.id})`)
                }

                finalText += lines.join('\n\n')
            }

            setMessages(prev => [...prev, { role: 'bot', text: finalText }])





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
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 rounded-full w-14 h-14 p-0 shadow-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all z-50"
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