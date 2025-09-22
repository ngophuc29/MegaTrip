"use client"
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Layout from '../components/Layout';
import SearchTabs from '../components/SearchTabs';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Slider } from '../components/ui/slider';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
    Plane,
    Filter,
    ArrowRight,
    ChevronDown,
    ChevronUp,
    Shield,
    CreditCard,
    RefreshCw,
    X,
    CheckCircle,
    AlertTriangle,
    Info,
    Gift,
    Utensils,
    Tv,
    Battery,
    Headphones,
    Luggage,
    Wifi,
} from 'lucide-react';
import FlightResults from './FlightResults';
import { useSearchParams } from 'next/navigation';

const airlines = [
    { code: 'VN', name: 'Vietnam Airlines', logo: '/placeholder.svg' },
    { code: 'VJ', name: 'VietJet Air', logo: '/placeholder.svg' },

    { code: 'QH', name: 'Bamboo Airways', logo: '/placeholder.svg' },
];

const sampleFlights = [
    {
        id: 1,
        airline: 'Vietnam Airlines',
        flightNumber: 'VN1546',
        departure: { time: '06:15', airport: 'SGN', city: 'TP.HCM', date: '2024-06-01' },
        arrival: { time: '08:30', airport: 'HAN', city: 'Hà Nội', date: '2024-06-01' },
        duration: '2h 15m',
        aircraft: 'Airbus A321-100/200',
        price: 1990000,
        originalPrice: 2490000,
        class: 'Phổ thông',
        baggage: {
            handbag: { weight: '7kg', size: '56x36x23cm' },
            checkin: { weight: '23kg', pieces: 1 }
        },
        amenities: {
            wifi: { available: true, free: false, price: '50.000đ' },
            meal: { included: true, type: 'Bữa ăn nóng' },
            entertainment: { available: true, screens: 'Màn hình cá nhân' },
            power: { available: true, type: 'USB & Ổ cắm điện' },
            priority: false
        },
        policies: {
            cancellable: true,
            cancellationFee: '500.000đ',
            changeable: true,
            changeFee: '300.000đ',
            refundable: 'Hoàn 80% nếu hủy trước 24h'
        },
        availableSeats: 12,
        discount: 20,
        promotions: [
            { code: 'SAVE30', description: 'Giảm thêm 300K cho vé bay nội địa', valid: '31/12/2024' },
            { code: 'STUDENT', description: 'Ưu đãi sinh viên giảm 15%', valid: '28/02/2025' }
        ],
        benefits: [
            'Tích lũy miles Bông Sen Vàng',
            'Ưu tiên check-in online',
            'Chọn chỗ ngồi miễn phí (hạng phổ thông)',
            'Bảo hiểm chuyến bay'
        ]
    },
    {
        id: 2,
        airline: 'VietJet Air',
        flightNumber: 'VJ142',
        departure: { time: '08:45', airport: 'SGN', city: 'TP.HCM', date: '2024-06-01' },
        arrival: { time: '11:00', airport: 'HAN', city: 'Hà Nội', date: '2024-06-01' },
        duration: '2h 15m',
        aircraft: 'Airbus A320',
        price: 1690000,
        class: 'Phổ thông',
        baggage: {
            handbag: { weight: '7kg', size: '56x36x23cm' },
            checkin: { weight: '20kg', pieces: 1 }
        },
        amenities: {
            wifi: { available: true, free: true },
            meal: { included: false, available: true, price: 'Từ 85.000đ' },
            entertainment: { available: false },
            power: { available: false },
            priority: false
        },
        policies: {
            cancellable: false,
            changeable: true,
            changeFee: '500.000đ + Chênh lệch giá vé',
            refundable: 'Không hoàn tiền'
        },
        availableSeats: 8,
        promotions: [
            { code: 'VIETJET50', description: 'Mã giảm 50K cho lần đặt đầu', valid: '15/01/2025' }
        ],
        benefits: [
            'Check-in online miễn phí',
            'Thay đổi thông tin hành khách',
            'Mua thêm dịch vụ sau khi đặt vé'
        ]
    },
    {
        id: 3,
        airline: 'Bamboo Airways',
        flightNumber: 'QH1402',
        departure: { time: '14:30', airport: 'SGN', city: 'TP.HCM', date: '2024-06-01' },
        arrival: { time: '16:50', airport: 'HAN', city: 'Hà Nội', date: '2024-06-01' },
        duration: '2h 20m',
        aircraft: 'Boeing 787',
        price: 2290000,
        class: 'Phổ thông Plus',
        baggage: {
            handbag: { weight: '10kg', size: '56x36x23cm' },
            checkin: { weight: '23kg', pieces: 1 }
        },
        amenities: {
            wifi: { available: true, free: true },
            meal: { included: true, type: 'Bữa ăn cao cấp' },
            entertainment: { available: true, screens: 'Màn hình HD 10 inch' },
            power: { available: true, type: 'USB-C & Ổ cắm điện' },
            priority: true
        },
        policies: {
            cancellable: true,
            cancellationFee: '300.000đ',
            changeable: true,
            changeFee: '200.000đ',
            refundable: 'Hoàn 85% nếu hủy trước 48h'
        },
        availableSeats: 15,
        promotions: [
            { code: 'BAMBOO100', description: 'Giảm 100K cho vé Bamboo Premium', valid: '31/01/2025' }
        ],
        benefits: [
            'Ưu tiên check-in & lên máy bay',
            'Chỗ ngồi rộng rãi (pitch 32-34 inch)',
            'Suất ăn cao cấp miễn phí',
            'Đổi lịch bay linh hoạt'
        ]
    },

];

export default function VeMayBay() {
    const router = useRouter();
    const [showFilters, setShowFilters] = useState(true);
    const [priceRange, setPriceRange] = useState([1000000, 3000000]);
    const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState('price-asc');
    const [expandedFlight, setExpandedFlight] = useState<number | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [showPromotions, setShowPromotions] = useState(true);
    const [selectedRoute, setSelectedRoute] = useState<{ from: string, to: string, price?: string } | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [searchForm, setSearchForm] = useState({
        from: 'TP.HCM (SGN)',
        to: 'Hà Nội (HAN)'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [apiFlights, setApiFlights] = useState<any[]>([]); // mapped flights returned from Amadeus
    const searchParams = useSearchParams();
    const [roundtripMode, setRoundtripMode] = useState(true);
    const [tripStep, setTripStep] = useState<'outbound' | 'inbound'>('outbound');
    const [selectedOutbound, setSelectedOutbound] = useState<typeof sampleFlights[number] | null>(null);
    const [selectedInbound, setSelectedInbound] = useState<typeof sampleFlights[number] | null>(null);
    const [showReview, setShowReview] = useState(false);
    const [pricingLoadingRT, setPricingLoadingRT] = useState(false);
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    // Format ISO date string to readable vi-VN date (fallback to original string if invalid)
    const formatDateReadable = (d?: string) => {
        if (!d) return '';
        const dt = new Date(d);
        if (Number.isNaN(dt.getTime())) return d;
        return dt.toLocaleDateString('vi-VN');
    };

    // Return day offset (arrivalDate - departureDate) in days (0, 1, 2, ...)
    const getDayOffset = (dep?: string, arr?: string) => {
        if (!dep || !arr) return 0;
        try {
            const a = new Date(arr);
            const b = new Date(dep);
            const diff = Math.round((a.setHours(0, 0, 0, 0) - b.setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24));
            return Number.isFinite(diff) ? diff : 0;
        } catch {
            return 0;
        }
    };

    const getAmenityIcon = (amenity: string) => {
        switch (amenity) {
            case 'wifi': return <Wifi className="h-4 w-4" />;
            case 'meal': return <Utensils className="h-4 w-4" />;
            case 'entertainment': return <Tv className="h-4 w-4" />;
            case 'power': return <Battery className="h-4 w-4" />;
            default: return null;
        }
    };

    // Generate additional flights for selected route
    const generateRouteFlights = () => {
        if (!selectedRoute) return [];

        const basePrice = selectedRoute.price ? parseInt(selectedRoute.price.replace(/[^\d]/g, '')) : 1690000;
        // Lấy ngày đang chọn, nếu chưa chọn thì lấy ngày hôm nay
        const date = selectedDate || new Date().toISOString().split('T')[0];

        return [
            {
                ...sampleFlights[0],
                id: 999,
                departure: { time: '06:15', airport: 'SGN', city: selectedRoute.from, date },
                arrival: { time: '08:30', airport: 'HAN', city: selectedRoute.to, date },
                price: basePrice,
                originalPrice: basePrice + 300000,
                airline: 'VietJet Air',
                flightNumber: 'VJ142',
                discount: 15,
                availableSeats: 12,
            },
            {
                ...sampleFlights[0],
                id: 998,
                departure: { time: '08:45', airport: 'SGN', city: selectedRoute.from, date },
                arrival: { time: '11:00', airport: 'HAN', city: selectedRoute.to, date },
                price: basePrice + 200000,
                airline: 'Vietnam Airlines',
                flightNumber: 'VN1546',
                availableSeats: 8,
            },
            {
                ...sampleFlights[0],
                id: 997,
                departure: { time: '14:30', airport: 'SGN', city: selectedRoute.from, date },
                arrival: { time: '16:50', airport: 'HAN', city: selectedRoute.to, date },
                price: basePrice + 600000,
                airline: 'Bamboo Airways',
                flightNumber: 'QH1402',
                class: 'Phổ thông Plus',
                availableSeats: 15,
            }
        ];
    };

    // Helper: convert ISO duration (e.g. PT2H10M) => '2h 10m'
    const convertDuration = (iso: string | undefined) => {
        if (!iso) return '';
        const matchH = iso.match(/(\d+)H/);
        const matchM = iso.match(/(\d+)M/);
        const h = matchH ? `${matchH[1]}h` : '';
        const m = matchM ? `${matchM[1]}m` : '';
        return [h, m].filter(Boolean).join(' ');
    };

    // Map Amadeus response 'offer' -> local sampleFlight-like object (handles multi-segment itineraries)
    const mapOfferToFlight = (offer: any, dictionaries: any, idx: number) => {
        const itineraries = offer.itineraries || [];
        // flatten segments from first itinerary (most offers are single-itinerary)
        const firstItin = itineraries[0] || {};
        const segments = firstItin.segments || [];
        const firstSeg = segments[0] || {};
        const lastSeg = segments[segments.length - 1] || firstSeg;

        const depAt: string = firstSeg.departure?.at || '';
        const arrAt: string = lastSeg.arrival?.at || '';
        const depDate = depAt.split('T')[0] || '';
        const arrDate = arrAt.split('T')[0] || '';
        const depTime = depAt.split('T')[1]?.slice(0, 5) || '';
        const arrTime = arrAt.split('T')[1]?.slice(0, 5) || '';

        // airline: prefer validatingAirlineCodes or segment carrier
        const carrier = (offer.validatingAirlineCodes && offer.validatingAirlineCodes[0]) || firstSeg.carrierCode || '';
        const airlineName = dictionaries?.carriers?.[carrier] || carrier || 'Unknown';

        // aircraft: combine segment aircraft names or pick first
        const aircraftCodes = [...new Set(segments.map((s: any) => s.aircraft?.code).filter(Boolean))];
        const aircraft = aircraftCodes.map((c: string) => dictionaries?.aircraft?.[c] || c).join(' / ') || '';

        // stops
        const stopsCount = Math.max(0, segments.length - 1);
        const stopsText = stopsCount === 0 ? 'Bay thẳng' : `${stopsCount} dừng`;

        // cabin(s) from travelerPricings -> join per-segment cabin info
        const traveler = offer.travelerPricings?.[0] || {};
        const cabins = (traveler.fareDetailsBySegment || []).map((f: any) => f.cabin).filter(Boolean);
        const cabinText = cabins.length > 0 ? cabins.join('/') : (traveler.travelerType || '');

        // baggage: try to read includedCheckedBags quantity/weight and includedCabinBags
        const fareSeg = traveler.fareDetailsBySegment?.[0] || {};
        const includedChecked = fareSeg.includedCheckedBags;
        const includedCabin = fareSeg.includedCabinBags;
        const checkin = {
            pieces: includedChecked?.quantity ?? undefined,
            weight: includedChecked?.weight ?? undefined,
            unit: includedChecked?.weightUnit ?? (includedChecked?.quantity ? undefined : undefined)
        };
        const handbag = {
            pieces: includedCabin?.quantity ?? undefined,
            weight: includedCabin?.weight ?? undefined,
            unit: includedCabin?.weightUnit ?? (includedCabin?.quantity ? undefined : undefined)
        };

        // price and currency (use total/grandTotal as provided)
        const priceStr = String(offer.price?.total || offer.price?.grandTotal || '0');
        const currency = offer.price?.currency || 'VND';
        let priceNumeric = Number(priceStr) || 0;
        // if currency isn't VND keep numeric as-is (formatting will show currency)

        return {
            id: String(offer.id) || `offer-${idx}`,
            airline: airlineName,
            airlineCode: carrier,
            flightNumber: `${firstSeg.carrierCode || ''}${firstSeg.number || ''}`,
            departure: { time: depTime, airport: firstSeg.departure?.iataCode || '', city: firstSeg.departure?.iataCode || '', date: depDate },
            arrival: { time: arrTime, airport: lastSeg.arrival?.iataCode || '', city: lastSeg.arrival?.iataCode || '', date: arrDate },
            duration: convertDuration(firstItin.duration),
            aircraft,
            price: priceNumeric,
            currency,
            originalPrice: priceNumeric + 300000,
            class: cabinText || 'ECONOMY',
            baggage: {
                handbag,
                checkin
            },
            // Ensure these arrays exist so UI can safely iterate
            benefits: offer.benefits || [],
            promotions: offer.promotions || [],
            amenities: {
                wifi: { available: false },
                meal: { included: false, available: true, price: 'Từ 120.000đ' },
                entertainment: { available: false },
                power: { available: false },
                priority: false
            },
            policies: {
                cancellable: false,
                changeable: false,
                refundable: 'Không hoàn tiền, không đổi lịch'
            },
            availableSeats: offer.numberOfBookableSeats || 0,
            stopsCount,
            stopsText,
            raw: offer // keep raw for debugging if needed
        };
    };

    // Thêm helper cache (canonical key từ searchParams; lưu mapped results để tái sử dụng)
    const CACHE_PREFIX = 'mt_flight_offers_cache_v1';
    const CACHE_TTL_MS = 30 * 60 * 1000; // 30 phút

    function makeCacheKeyFromParams(paramsObj: Record<string, string | undefined>) {
        // canonicalize: sort keys so order query ko tạo key khác
        const entries = Object.entries(paramsObj)
            .filter(([_, v]) => v !== undefined && v !== null && String(v) !== '')
            .map(([k, v]) => [k, String(v)]);
        entries.sort((a, b) => a[0].localeCompare(b[0]));
        return entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
    }

    function getCache(key: string) {
        try {
            const raw = localStorage.getItem(`${CACHE_PREFIX}::${key}`);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (!parsed || !parsed.timestamp) return null;
            return parsed;
        } catch {
            return null;
        }
    }

    function setCache(key: string, payload: any) {
        try {
            const item = { timestamp: Date.now(), data: payload };
            localStorage.setItem(`${CACHE_PREFIX}::${key}`, JSON.stringify(item));
        } catch {
            // ignore storage errors
        }
    }

    function removeCache(key: string) {
        try {
            localStorage.removeItem(`${CACHE_PREFIX}::${key}`);
        } catch {
            // ignore
        }
    }

    // Fetch Amadeus token + flight offers when URL query changes (SearchTabs pushes query)
    useEffect(() => {
	const q = searchParams ? Object.fromEntries(searchParams.entries()) : {};
	const origin = q['originLocationCode'] || q['from'] || q['origin'] || q['fromLocationCode'];
	const destination = q['destinationLocationCode'] || q['to'] || q['destination'];
	const departure = q['departureDate'] || q['departure'] || q['date'];
	if (!origin || !destination || !departure) {
		return;
	}

	// build canonical param object used for cache key (only relevant params)
	const cacheParams: Record<string, string | undefined> = {
		originLocationCode: origin,
		destinationLocationCode: destination,
		departureDate: departure,
		returnDate: q['returnDate'] || q['return'],
		adults: q['adults'] || '1',
		children: q['children'] || '0',
		infants: q['infants'] || '0',
		travelClass: q['travelClass'] || undefined,
		nonStop: q['nonStop'] || undefined,
		currencyCode: q['currencyCode'] || undefined,
		includedAirlineCodes: q['includedAirlineCodes'] || undefined
	};
	const cacheKey = makeCacheKeyFromParams(cacheParams);

	// If we have cached results for this canonical key, use them and DO NOT call API.
	// This prevents duplicate fetch when same logical search is triggered from different UI components.
	const cached = getCache(cacheKey);
	if (cached && cached.timestamp && Array.isArray(cached.data)) {
		try {
			// ensure priceRange covers cached prices so filters don't immediately hide results
			const prices = (cached.data as any[]).map(m => Number(m.price) || 0).filter(Boolean);
			if (prices.length > 0) {
				const minP = Math.min(...prices);
				const maxP = Math.max(...prices);
				const anyInCurrentRange = prices.some(p => p >= priceRange[0] && p <= priceRange[1]);
				if (!anyInCurrentRange) {
					setPriceRange([Math.max(0, minP - 100000), maxP + 100000]);
				}
			}
		} catch {
			// ignore parsing errors
		}

		console.log('[Cache] using cached flight offers for key', cacheKey, `(age ${Math.round((Date.now() - cached.timestamp)/1000)}s)`);
		setApiFlights(cached.data);
		setHasSearched(true);
		setShowPromotions(false);
		setIsLoading(false);
		// Important: DO NOT call the API if cached data exists — return early.
		return;
	}

	// No cache -> proceed to fetch and save results if any
	const fetchAmadeus = async () => {
		setIsLoading(true);
		setApiFlights([]);
		try {
			// 1) get token
			const tokenRes = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: new URLSearchParams({
					grant_type: 'client_credentials',
					client_id: 'e9bhGWGeAIZG4qLn708d5oAV3gDDaWut',
					client_secret: '9fcdtMUicUy6ZAGm'
				})
			});
			const tokenJson = await tokenRes.json();
			const token = tokenJson.access_token;

			if (!token) throw new Error('No token from Amadeus');

			// 2) build offers URL
			const params = new URLSearchParams();
			params.set('originLocationCode', origin);
			params.set('destinationLocationCode', destination);
			params.set('departureDate', departure);
			if (q['returnDate']) params.set('returnDate', q['returnDate']);

			params.set('adults', q['adults'] || '1');
			params.set('children', q['children'] || '0');
			params.set('infants', q['infants'] || '0');
			if (q['travelClass']) params.set('travelClass', q['travelClass']);
			// params.set('includedAirlineCodes', q['includedAirlineCodes'] || 'VN');
			params.set('currencyCode', q['currencyCode'] || 'VND');
			params.set('nonStop', q['nonStop'] || 'true');
			params.set('max', q['max'] || '5');

			console.log('[Amadeus] Request URL:', `https://test.api.amadeus.com/v2/shopping/flight-offers?${params.toString()}`);

			const offersRes = await fetch(`https://test.api.amadeus.com/v2/shopping/flight-offers?${params.toString()}`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			const offersJson = await offersRes.json();
			const dicts = offersJson.dictionaries || {};
			const data = offersJson.data || [];
			// map offers
			const mapped = data.map((o: any, i: number) => mapOfferToFlight(o, dicts, i));
			console.log('[Amadeus] mapped flights:', mapped.map(m => ({ id: m.id, price: m.price, dep: m.departure, arr: m.arrival })));
			// if mapped flights exist but none fit current priceRange, widen priceRange so UI shows results
			if (mapped.length > 0) {
				const prices = mapped.map(m => Number(m.price) || 0).filter(Boolean);
				if (prices.length > 0) {
					const minP = Math.min(...prices);
					const maxP = Math.max(...prices);
					const anyInCurrentRange = prices.some(p => p >= priceRange[0] && p <= priceRange[1]);
					if (!anyInCurrentRange) {
						// expand to include mapped results with small padding
						setPriceRange([Math.max(0, minP - 100000), maxP + 100000]);
					}
				}
			}
			setApiFlights(mapped);
			setHasSearched(true);
			setShowPromotions(false);

			// save mapped results to cache (overwrite existing entry for same key) only if we have data
			try {
				if (mapped.length > 0) {
					setCache(cacheKey, mapped);
					console.log('[Cache] saved/updated cache for key', cacheKey);
				} else {
					console.log('[Cache] mapped empty — not caching for key', cacheKey);
				}
			} catch (e) {
				// ignore storage errors
			}
		} catch (err) {
			console.error('Amadeus fetch error', err);
		} finally {
			setIsLoading(false);
		}
	};

	fetchAmadeus();
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [searchParams ? searchParams.toString() : '']);

    const routeFlights = selectedRoute ? generateRouteFlights() : [];
    // If API returned flights, prefer them. Otherwise fallback to generated + sample flights.
    const allFlights = apiFlights && apiFlights.length > 0 ? apiFlights : (selectedRoute ? [...routeFlights, ...sampleFlights] : sampleFlights);

    const filteredFlights = allFlights.filter(flight => {
        const matchesPrice = flight.price >= priceRange[0] && flight.price <= priceRange[1];
        const matchesAirline = selectedAirlines.length === 0 || selectedAirlines.includes(flight.airline);

        // If route is selected, prioritize matching routes
        if (selectedRoute) {
            const matchesRoute =
                flight.departure.city === selectedRoute.from &&
                flight.arrival.city === selectedRoute.to;
            return matchesPrice && matchesAirline && matchesRoute;
        }

        return matchesPrice && matchesAirline;
    });

    const sortedFlights = [...filteredFlights].sort((a, b) => {
        // If route selected, show generated route flights first
        if (selectedRoute) {
            const aIsRoute = a.id >= 997;
            const bIsRoute = b.id >= 997;
            if (aIsRoute && !bIsRoute) return -1;
            if (!aIsRoute && bIsRoute) return 1;
        }

        switch (sortBy) {
            case 'price-asc': return a.price - b.price;
            case 'price-desc': return b.price - a.price;
            case 'departure-asc': return a.departure.time.localeCompare(b.departure.time);
            case 'departure-desc': return b.departure.time.localeCompare(a.departure.time);
            case 'arrival-desc': return b.arrival.time.localeCompare(a.arrival.time);
            case 'duration': return a.duration.localeCompare(b.duration);
            default: return 0;
        }
    });

    const handleSearch = () => {
        setHasSearched(true);
        setShowPromotions(false);
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 3000);
    };

    const handleRouteSelect = (from: string, to: string, price?: string) => {
        // Update search form
        setSearchForm({ from, to });
        // Set selected route
        setSelectedRoute({ from, to, price });
        // Trigger search
        setHasSearched(true);
        setShowPromotions(false);
        // Set default date to today + 1
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setSelectedDate(tomorrow.toISOString().split('T')[0]);
    };

    const [copied, setCopied] = useState<{ [code: string]: boolean }>({});

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code).then(() => {
            setCopied(prev => ({ ...prev, [code]: true }));
            setTimeout(() => setCopied(prev => ({ ...prev, [code]: false })), 2000);
        });
    };

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

    function FilterSidebarSkeleton() {
        return (
            <Card className="sticky top-20 bg-[hsl(var(--card))] border border-[hsl(var(--muted))] animate-pulse">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <div className="h-5 w-24 bg-gray-200 rounded shimmer" />
                    <div className="h-8 w-8 bg-gray-200 rounded shimmer" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="h-4 w-32 bg-gray-200 rounded shimmer mb-2" />
                    <div className="h-6 w-full bg-gray-200 rounded shimmer mb-2" />
                    <div className="h-4 w-20 bg-gray-200 rounded shimmer mb-2" />
                    <div className="h-4 w-24 bg-gray-200 rounded shimmer mb-2" />
                    <div className="h-4 w-32 bg-gray-200 rounded shimmer mb-2" />
                    <div className="h-4 w-16 bg-gray-200 rounded shimmer mb-2" />
                    <div className="h-4 w-28 bg-gray-200 rounded shimmer mb-2" />
                    <div className="h-4 w-24 bg-gray-200 rounded shimmer mb-2" />
                    <div className="h-4 w-20 bg-gray-200 rounded shimmer mb-2" />
                    <div className="h-4 w-32 bg-gray-200 rounded shimmer mb-2" />
                </CardContent>
            </Card>
        );
    }

    // Detect roundtrip mode from query (returnDate)
    useEffect(() => {
        if (!searchParams) return;
        const params = Object.fromEntries(searchParams.entries());
        setRoundtripMode(!!params['returnDate']);
    }, [searchParams]);

    // Reset state when mode changes
    useEffect(() => {
        setTripStep('outbound');
        setSelectedOutbound(null);
        setSelectedInbound(null);
        setShowReview(false);
    }, [roundtripMode, selectedRoute, selectedDate]);

    // Tổng giá vé khứ hồi
    const totalRoundtripPrice = () => {
        return (selectedOutbound?.price || 0) + (selectedInbound?.price || 0);
    };

    // Card chọn chuyến bay cho roundtrip
    function RoundtripSelectCard() {
        // Read state names from URL if present, fallback to searchForm values
        const params = searchParams ? Object.fromEntries(searchParams.entries()) : {};
        const fromState = params['fromState'] || '';
        const toState = params['toState'] || '';

        const outboundRoute = fromState && toState
            ? `${fromState} → ${toState}`
            : (selectedRoute ? `${selectedRoute.from} → ${selectedRoute.to}` : `${searchForm.from} → ${searchForm.to}`);

        const inboundRoute = fromState && toState
            ? `${toState} → ${fromState}`
            : (selectedRoute ? `${selectedRoute.to} → ${selectedRoute.from}` : `${searchForm.to} → ${searchForm.from}`);

        // Determine outbound/inbound dates (prefer selected flight, then URL params, then selectedDate)
        const depParam = params['departureDate'] || params['departure'] || params['date'] || selectedDate || '';
        const retParam = params['returnDate'] || params['return'] || '';

        const outboundRawDate = selectedOutbound?.departure?.date || depParam || selectedDate || '';
        const inboundRawDate = selectedInbound?.departure?.date || retParam || selectedDate || '';

        const formatDate = (d: string) => {
            if (!d) return '';
            const dt = new Date(d);
            if (Number.isNaN(dt.getTime())) return d; // fallback to raw
            return dt.toLocaleDateString('vi-VN');
        };

        const outboundDateText = formatDate(outboundRawDate);
        const inboundDateText = formatDate(inboundRawDate);

        return (
            <Card className="mb-4 bg-[hsl(var(--card))] border border-[hsl(var(--muted))]">
                <CardHeader className="py-3 bg-[hsl(var(--card))] border-b border-[hsl(var(--muted))]">
                    <CardTitle className="text-base flex items-center gap-2 text-[hsl(var(--primary))]">
                        <Plane className="h-4 w-4 text-[hsl(var(--primary))]" /> Chuyến bay của bạn
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {/* Outbound */}
                    <div className="border-l-4 border-[hsl(var(--primary))]">
                        <div className="px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-7 w-7 rounded-md bg-[hsl(var(--primary))] text-white text-sm font-bold flex items-center justify-center">1</div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <div className="text-xs text-[hsl(var(--muted-foreground))]">Chuyến đi</div>
                                        {outboundDateText && <div className="text-xs text-[hsl(var(--muted-foreground))]">• {outboundDateText}</div>}
                                    </div>
                                    <div className="text-sm text-[hsl(var(--primary))] font-semibold">
                                        {outboundRoute}
                                    </div>
                                </div>
                            </div>
                            {selectedOutbound && (
                                <div className="text-sm">
                                    {/* Chi tiết UI only */}
                                    <button className="text-[hsl(var(--primary))] text-sm hover:underline cursor-default" onClick={() => { /* no-op UI */ }}>
                                        Chi tiết
                                    </button>
                                </div>
                            )}
                        </div>

                        {selectedOutbound ? (
                            <div className="px-4 pb-3">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded bg-white/70 flex items-center justify-center text-sm font-semibold">
                                            {/* placeholder for airline logo/initial */}
                                            {selectedOutbound.airline.split(' ').map(s => s[0]).slice(0, 2).join('')}
                                        </div>
                                        <div>
                                            <div className="font-medium">{selectedOutbound.airline}</div>
                                            <div className="text-xs text-[hsl(var(--muted-foreground))]">{selectedOutbound.flightNumber} • {selectedOutbound.aircraft}</div>
                                        </div>
                                    </div>
                                    {/* <div className="text-right">
                                        <div className="text-sm font-semibold text-[hsl(var(--primary))]">{formatPrice(selectedOutbound.price)}</div>
                                        <div className="text-xs text-[hsl(var(--muted-foreground))]">1 khách</div>
                                    </div> */}
                                </div>

                                <div className="flex items-center gap-6 mt-3">
                                    <div className="text-center">
                                        <div className="font-bold text-lg">{selectedOutbound.departure.time}</div>
                                        <div className="text-sm text-[hsl(var(--muted-foreground))]">{selectedOutbound.departure.airport}</div>
                                        <div className="text-xs text-[hsl(var(--muted-foreground))]">{selectedOutbound.departure.city}</div>
                                    </div>

                                    <div className="flex-1 text-center">
                                        <div className="text-sm text-[hsl(var(--muted-foreground))] mb-1">{selectedOutbound.duration}</div>
                                        <div className="flex items-center">
                                            <div className="flex-1 h-px bg-gray-300"></div>
                                            <ArrowRight className="h-4 w-4 mx-2 text-gray-400" />
                                            <div className="flex-1 h-px bg-gray-300"></div>
                                        </div>
                                        {/* <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Bay thẳng</div> */}
                                    </div>

                                    <div className="text-center">
                                        <div className="font-bold text-lg">{selectedOutbound.arrival.time}</div>
                                        <div className="text-sm text-[hsl(var(--muted-foreground))]">{selectedOutbound.arrival.airport}</div>
                                        <div className="text-xs text-[hsl(var(--muted-foreground))]">{selectedOutbound.arrival.city}</div>
                                    </div>
                                </div>

                                <div className="mt-3">
                                    <Button className="w-full" onClick={() => { setSelectedOutbound(null); setTripStep('outbound'); }}>
                                        Đổi chuyến bay đi
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="px-4 pb-3">
                                {/* <div className="text-sm text-[hsl(var(--muted-foreground))]">Chưa chọn chuyến đi</div> */}
                            </div>
                        )}
                    </div>

                    {/* Inbound */}
                    <div className=" ">
                        {/* Inbound sidebar intentionally minimal.
                            Selected inbound is NOT shown here; it is only visible in the "Xem lại" panel.
                            When the review panel is closed the inbound selection will be cleared so the user can pick another. */}
                        <div className="px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-7 w-7 rounded-md bg-[hsl(var(--primary))] text-white text-sm font-bold flex items-center justify-center">2</div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <div className="text-xs text-[hsl(var(--muted-foreground))]">Chuyến về</div>
                                        {inboundDateText && <div className="text-xs text-[hsl(var(--muted-foreground))]">• {inboundDateText}</div>}
                                    </div>
                                    <div className="text-sm text-[hsl(var(--primary))] font-semibold">
                                        {inboundRoute}
                                    </div>
                                </div>
                            </div>
                            {/* No inbound details shown in sidebar per requirement */}
                        </div>
                        <div className="px-4 pb-3">
                            {/* intentionally empty: user selects inbound from results; selection is shown only in review panel */}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            {/* Search Section */}
            <div className="relative min-h-[480px]" style={{ backgroundImage: 'url(./banner-may-bay.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>

                <div className="container">

                    <div className="absolute inset-x-0 top-[calc(100%/1.3)] -translate-y-1/2">
                        <div className="w-full max-w-6xl mx-auto" style={{
                            background: 'linear-gradient(90deg, rgba(0,17,30,0.6) 0%, rgba(0,0,0,0) 100%)',
                            paddingBottom: '7px', paddingLeft: '18px', marginBottom: '-10px', borderTopLeftRadius: '10px'

                        }}>
                            <h1 className="pt-4 text-2xl lg:text-3xl font-bold mb-2 text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.1)]">
                                Tìm vé máy bay
                            </h1>
                            <p className="font-bold mb-2 text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.1)]">Đặt vé máy bay nội địa với giá tốt nhất</p>
                        </div>
                        <SearchTabs onSearch={handleSearch} activeTab="flight" />
                    </div>
                </div>
            </div>

            {/* Vouchers & Promotions Section */}
            <section className={`pt-16 py-8 bg-gray-50 ${hasSearched && !showPromotions ? 'hidden' : ''}`}>
                <div className="container">
                    {/* Vouchers */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">🎫 Voucher & Mã giảm giá</h2>
                            <Button variant="outline" size="sm" asChild>
                                <Link prefetch={false} href="/khuyen-mai">Xem tất cả</Link>
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-lg font-bold">SAVE30</div>
                                            <div className="text-sm opacity-90">Giảm 300K vé máy bay</div>
                                            <div className="text-xs opacity-75 mt-1">HSD: 31/12/2024</div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="text-red-600"
                                            onClick={() => handleCopy('SAVE30')}
                                        >
                                            {copied['SAVE30'] ? 'Đã copy!' : 'Copy mã'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-lg font-bold">FIRSTFLIGHT</div>
                                            <div className="text-sm opacity-90">Giảm 50K lần đầu đặt</div>
                                            <div className="text-xs opacity-75 mt-1">HSD: 15/01/2025</div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="text-blue-600"
                                            onClick={() => handleCopy('FIRSTFLIGHT')}
                                        >
                                            {copied['FIRSTFLIGHT'] ? 'Đã copy!' : 'Copy mã'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-lg font-bold">WEEKEND20</div>
                                            <div className="text-sm opacity-90">Giảm 20% cuối tuần</div>
                                            <div className="text-xs opacity-75 mt-1">HSD: 28/02/2025</div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="text-green-600"
                                            onClick={() => handleCopy('WEEKEND20')}
                                        >
                                            {copied['WEEKEND20'] ? 'Đã copy!' : 'Copy mã'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Popular Routes */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold mb-4 text-[hsl(var(--primary))]">✈️ Tuyến bay phổ biến</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleRouteSelect('TP.HCM', 'Hà Nội', '1.690.000₫')}>
                                <CardContent className="p-4 text-center">
                                    <div className="text-sm font-medium">TP.HCM → Hà Nội</div>
                                    <div className="text-xs text-[hsl(var(--muted-foreground))]">từ 1.690.000₫</div>
                                    <Badge variant="secondary" className="mt-2 text-xs">Phổ biến</Badge>
                                </CardContent>
                            </Card>

                            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleRouteSelect('TP.HCM', 'Đà Nẵng', '1.590.000₫')}>
                                <CardContent className="p-4 text-center">
                                    <div className="text-sm font-medium">TP.HCM → Đà Nẵng</div>
                                    <div className="text-xs text-[hsl(var(--muted-foreground))]">từ 1.590.000₫</div>
                                    <Badge variant="secondary" className="mt-2 text-xs">Giá tốt</Badge>
                                </CardContent>
                            </Card>

                            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleRouteSelect('Hà Nội', 'Đà Nẵng', '1.490.000₫')}>
                                <CardContent className="p-4 text-center">
                                    <div className="text-sm font-medium">Hà Nội → Đà Nẵng</div>
                                    <div className="text-xs text-[hsl(var(--muted-foreground))]">từ 1.490.000₫</div>
                                    <Badge variant="secondary" className="mt-2 text-xs">Sale 30%</Badge>
                                </CardContent>
                            </Card>

                            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleRouteSelect('TP.HCM', 'Nha Trang', '1.390.000₫')}>
                                <CardContent className="p-4 text-center">
                                    <div className="text-sm font-medium">TP.HCM → Nha Trang</div>
                                    <div className="text-xs text-[hsl(var(--muted-foreground))]">từ 1.390.000₫</div>
                                    <Badge variant="secondary" className="mt-2 text-xs">Hot</Badge>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Great Deals */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold mb-4 text-[hsl(var(--primary))]">🔥 Vé máy bay giá tốt</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Card className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="font-medium">VietJet Air</div>
                                            <div className="text-sm text-[hsl(var(--muted-foreground))]">TP.HCM → Hà Nội</div>
                                        </div>
                                        <Badge variant="destructive">-25%</Badge>
                                    </div>
                                    <div className="text-sm text-[hsl(var(--muted-foreground))] mb-2">06:15 → 08:30</div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <div className="text-lg font-bold text-[hsl(var(--primary))]">1.690.000₫</div>
                                            <div className="text-xs text-[hsl(var(--muted-foreground))] line-through">2.250.000₫</div>
                                        </div>
                                        <Button size="sm">Chọn</Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="font-medium">Bamboo Airways</div>
                                            <div className="text-sm text-[hsl(var(--muted-foreground))]">TP.HCM → Đà Nẵng</div>
                                        </div>
                                        <Badge variant="destructive">-20%</Badge>
                                    </div>
                                    <div className="text-sm text-[hsl(var(--muted-foreground))] mb-2">14:30 → 16:50</div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <div className="text-lg font-bold text-[hsl(var(--primary))]">1.590.000₫</div>
                                            <div className="text-xs text-[hsl(var(--muted-foreground))] line-through">1.990.000₫</div>
                                        </div>
                                        <Button size="sm">Chọn</Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="font-medium">Vietnam Airlines</div>
                                            <div className="text-sm text-[hsl(var(--muted-foreground))]">Hà Nội → Đà Nẵng</div>
                                        </div>
                                        <Badge variant="destructive">-30%</Badge>
                                    </div>
                                    <div className="text-sm text-[hsl(var(--muted-foreground))] mb-2">08:45 → 10:20</div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <div className="text-lg font-bold text-[hsl(var(--primary))]">1.490.000₫</div>
                                            <div className="text-xs text-[hsl(var(--muted-foreground))] line-through">2.130.000₫</div>
                                        </div>
                                        <Button size="sm">Chọn</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Toggle Promotions Button */}
            {hasSearched && (
                <section className={hasSearched ? "py-4 bg-white border-b mt-14" : "py-4 bg-white border-b mt-14"}>
                    <div className="container">
                        <div className="flex justify-center">
                            <Button
                                variant="outline"
                                onClick={() => setShowPromotions(!showPromotions)}
                                className="flex items-center gap-2"
                            >
                                {showPromotions ? (
                                    <>
                                        <ChevronUp className="h-4 w-4" />
                                        Ẩn ưu đãi & tuyến phổ biến
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="h-4 w-4" />
                                        Hiện ưu đãi & tuyến phổ biến
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </section>
            )}

            {/* Date Selector */}
            {hasSearched && selectedRoute && (
                <section className="py-6 bg-[hsl(var(--blue-50))]">
                    <div className="container">
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold mb-2">
                                {selectedRoute.from} → {selectedRoute.to}
                            </h3>
                            <div className="text-sm text-[hsl(var(--muted-foreground))]">
                                Chọn ngày để xem giá tốt nhất
                            </div>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {Array.from({ length: 7 }, (_, i) => {
                                const date = new Date();
                                date.setDate(date.getDate() + i);
                                const dateStr = date.toISOString().split('T')[0];
                                const dayName = date.toLocaleDateString('vi-VN', { weekday: 'short' });
                                const dayMonth = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

                                // Mock prices for different dates
                                const prices = ['1.424.000', '1.575.000', '1.151.000', '966.000', '764.000', '1.234.000', '1.456.000'];
                                const price = prices[i] + ' VND';

                                return (
                                    <div
                                        key={dateStr}
                                        onClick={() => setSelectedDate(dateStr)}
                                        className={`flex-shrink-0 p-3 rounded-lg cursor-pointer transition-colors min-w-[120px] text-center ${selectedDate === dateStr
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white hover:bg-blue-100'
                                            }`}
                                    >
                                        <div className="text-sm font-medium">{dayName} {dayMonth}</div>
                                        <div className="text-xs mt-1">{price}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* Results Section */}
            <section className="py-8">
                <div className="container">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Filters Sidebar */}
                        <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                            {/* Hiện card chọn chuyến bay nếu là roundtrip */}
                            {roundtripMode && <RoundtripSelectCard />}
                            {isLoading ? <FilterSidebarSkeleton /> : (
                                <Card className="sticky top-20 bg-[hsl(var(--card))] border border-[hsl(var(--muted))]">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                        <CardTitle className="text-lg text-[hsl(var(--primary))] font-bold">Bộ lọc</CardTitle>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowFilters(!showFilters)}
                                            className="lg:hidden"
                                        >
                                            <Filter className="h-4 w-4" />
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Price Range */}
                                        <div>
                                            <Label className="text-sm font-medium mb-3 block text-[hsl(var(--primary))]">Khoảng giá</Label>
                                            <div className="px-2">
                                                <Slider
                                                    value={priceRange}
                                                    onValueChange={setPriceRange}
                                                    max={3000000}
                                                    min={1000000}
                                                    step={100000}
                                                    className="mb-3"
                                                />
                                                <div className="flex justify-between text-sm text-[hsl(var(--muted-foreground))]">
                                                    <span>{formatPrice(priceRange[0])}</span>
                                                    <span>{formatPrice(priceRange[1])}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Airlines */}
                                        <div>
                                            <Label className="text-sm font-medium mb-3 block text-[hsl(var(--primary))]">Hãng hàng không</Label>
                                            <div className="space-y-3">
                                                {airlines.map((airline) => (
                                                    <div key={airline.code} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={airline.code}
                                                            checked={selectedAirlines.includes(airline.name)}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) {
                                                                    setSelectedAirlines([...selectedAirlines, airline.name]);
                                                                } else {
                                                                    setSelectedAirlines(selectedAirlines.filter(a => a !== airline.name));
                                                                }
                                                            }}
                                                        />
                                                        <label htmlFor={airline.code} className="text-sm cursor-pointer">
                                                            {airline.name}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Departure Time */}
                                        <div>
                                            <Label className="text-sm font-medium mb-3 block text-[hsl(var(--primary))]">Giờ khởi hành</Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Button variant="outline" size="sm" className="text-xs">Sáng sớm<br />06:00 - 12:00</Button>
                                                <Button variant="outline" size="sm" className="text-xs">Chiều<br />12:00 - 18:00</Button>
                                                <Button variant="outline" size="sm" className="text-xs">Tối<br />18:00 - 24:00</Button>
                                                <Button variant="outline" size="sm" className="text-xs">Đêm<br />00:00 - 06:00</Button>
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Quick Filters */}
                                        <div>
                                            <Label className="text-sm font-medium mb-3 block text-[hsl(var(--primary))]">Bộ lọc nhanh</Label>
                                            <div className="space-y-2">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox id="refundable" />
                                                    <label htmlFor="refundable" className="text-sm cursor-pointer">
                                                        Có hoàn hủy
                                                    </label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox id="changeable" />
                                                    <label htmlFor="changeable" className="text-sm cursor-pointer">
                                                        Có thể đổi
                                                    </label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox id="baggage" />
                                                    <label htmlFor="baggage" className="text-sm cursor-pointer">
                                                        Hành lý ký gửi
                                                    </label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox id="wifi" />
                                                    <label htmlFor="wifi" className="text-sm cursor-pointer">
                                                        Có WiFi
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Results */}
                        <div className="flex-1">
                            {/* Controls */}
                            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                                <div className="flex items-center gap-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowFilters(!showFilters)}
                                        className="lg:hidden"
                                    >
                                        <Filter className="h-4 w-4 mr-2" />
                                        Bộ lọc
                                    </Button>
                                    {/* <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                        Tìm thấy {sortedFlights.length} chuyến bay
                                    </p> */}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="sort" className="text-sm">Sắp xếp:</Label>
                                    <Select value={sortBy} onValueChange={setSortBy}>
                                        <SelectTrigger className="w-[200px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="price-asc">Giá tăng dần</SelectItem>
                                            <SelectItem value="price-desc">Giá giảm dần</SelectItem>
                                            <SelectItem value="departure-asc">Giờ đi sớm nhất</SelectItem>
                                            <SelectItem value="departure-desc">Giờ đi muộn nhất</SelectItem>
                                            <SelectItem value="arrival-desc">Giờ đến muộn nhất</SelectItem>
                                            <SelectItem value="duration">Thời gian bay</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Flight Results */}
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
                                        // Nếu là roundtrip, custom render để chọn lần lượt outbound/inbound
                                        roundtripMode ? (
                                            sortedFlights
                                                .filter(flight => {
                                                    if (tripStep === 'outbound') {
                                                        // Chỉ show các chuyến đi (theo selectedRoute)
                                                        if (!selectedRoute) return true;
                                                        return flight.departure.city === selectedRoute.from && flight.arrival.city === selectedRoute.to;
                                                    } else {
                                                        // Chỉ show các chuyến về (ngược lại)
                                                        if (!selectedRoute) return true;
                                                        return flight.departure.city === selectedRoute.to && flight.arrival.city === selectedRoute.from;
                                                    }
                                                })
                                                .map(flight => (
                                                    <Card key={flight.id} className={`hover:shadow-md transition-shadow ${((tripStep === 'outbound' && selectedOutbound?.id === flight.id) || (tripStep === 'inbound' && selectedInbound?.id === flight.id)) ? 'ring-2 ring-blue-500' : ''}`}>
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
                                                                            {flight.baggage.checkin.weight} • {flight.baggage.checkin.pieces ?? `kiện`}
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
                                                                        <Button
                                                                            className="w-full lg:w-auto"
                                                                            onClick={() => {
                                                                                if (tripStep === 'outbound') {
                                                                                    setSelectedOutbound(flight);
                                                                                    setTripStep('inbound');
                                                                                } else if (tripStep === 'inbound') {
                                                                                    setSelectedInbound(flight);
                                                                                    setShowReview(true);
                                                                                }
                                                                            }}
                                                                            disabled={
                                                                                (tripStep === 'outbound' && selectedOutbound?.id === flight.id) ||
                                                                                (tripStep === 'inbound' && selectedInbound?.id === flight.id)
                                                                            }
                                                                        >
                                                                            {tripStep === 'outbound'
                                                                                ? (selectedOutbound?.id === flight.id ? 'Đã chọn' : 'Chọn chuyến đi')
                                                                                : (selectedInbound?.id === flight.id ? 'Đã chọn' : 'Chọn chuyến về')}
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
                                                                                                        {flight.baggage.checkin.weight} • {flight.baggage.checkin.pieces ?? `kiện`}
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
                                                                                            {flight.amenities.entertainment?.available && (
                                                                                                <div className="flex items-center gap-2">
                                                                                                    <Tv className="h-4 w-4" />
                                                                                                    <div>
                                                                                                        <div className="font-medium">Giải trí</div>
                                                                                                        <div className="text-muted-foreground">{flight.amenities.entertainment.screens}</div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            )}
                                                                                            {flight.amenities.power?.available && (
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
                                                                                    {flight.benefits?.map((benefit: string, index: number) => (
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
                                                                                {flight.promotions && flight.promotions.length > 0 ? (
                                                                                    <div className="space-y-3">
                                                                                        <h4 className="font-medium">Khuyến mãi áp dụng</h4>
                                                                                        {flight.promotions.map((promo: any, index: number) => (
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
                                                                                                    <Button size="sm" variant="outline" onClick={() => handleCopy(promo.code)}>
                                                                                                        {copied[promo.code] ? 'Đã copy!' : 'Sao chép'}
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
                                                                            {/* CHI TIẾT VÉ (roundtrip): map travelerPricings for this flight if pricing fetched */}
                                                                            <TabsContent value="detailsCharge" className="space-y-3">
                                                                                {(() => {
                                                                                    const key = String(flight.id);
                                                                                    const p = pricingByFlight[key];
                                                                                    // normalize to offer object
                                                                                    const offer = p?.data?.[0] ?? p?.data ?? p ?? null;
                                                                                    const travelers = offer?.travelerPricings ?? [];
                                                                                    if (!offer || travelers.length === 0) {
                                                                                        return (
                                                                                            <div className="text-sm text-[hsl(var(--muted-foreground))]">
                                                                                                Chưa có thông tin giá. Bấm "Kiểm giá" để lấy chi tiết.
                                                                                            </div>
                                                                                        );
                                                                                    }
                                                                                    const currency = offer?.price?.currency ?? travelers[0]?.price?.currency ?? '';
                                                                                    return (
                                                                                        <div className="space-y-3">
                                                                                            {travelers.map((t: any, i: number) => {
                                                                                                const price = t?.price ?? {};
                                                                                                const total = price?.total ?? price?.grandTotal ?? '-';
                                                                                                const base = price?.base ?? '-';
                                                                                                const taxes = price?.taxes ?? [];
                                                                                                const refundableTaxes = price?.refundableTaxes ?? null;
                                                                                                const fareDetails = t?.fareDetailsBySegment ?? [];
                                                                                                return (
                                                                                                    <div key={i} className="p-3 border rounded">
                                                                                                        <div className="flex justify-between items-center">
                                                                                                            <div className="text-sm font-medium">
                                                                                                                {t.travelerType ?? `Hành khách ${i + 1}`}{" "}
                                                                                                                {t.travelerId ? `(id: ${t.travelerId})` : ''}

                                                                                                            </div>
                                                                                                            <div className="text-sm text-[hsl(var(--muted-foreground))]">
                                                                                                                {t.fareOption ?? ''}
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                                                                                            <div>
                                                                                                                <div className="text-xs text-[hsl(var(--muted-foreground))]">
                                                                                                                    Tổng
                                                                                                                </div>
                                                                                                                <div className="font-semibold">
                                                                                                                    {total !== '-'
                                                                                                                        ? `${Number(total).toLocaleString()} ${currency}`
                                                                                                                        : '-'}
                                                                                                                </div>
                                                                                                            </div>
                                                                                                            <div>
                                                                                                                <div className="text-xs text-[hsl(var(--muted-foreground))]">
                                                                                                                    Giá cơ sở
                                                                                                                </div>
                                                                                                                <div>
                                                                                                                    {base !== '-'
                                                                                                                        ? `${Number(base).toLocaleString()} ${currency}`
                                                                                                                        : '-'}
                                                                                                                </div>
                                                                                                            </div>
                                                                                                            <div>
                                                                                                                <div className="text-xs text-[hsl(var(--muted-foreground))]">
                                                                                                                    Thuế & phí
                                                                                                                </div>
                                                                                                                <div className="text-xs text-[hsl(var(--muted-foreground))]">
                                                                                                                    {taxes.length > 0
                                                                                                                        ? taxes.map((tx: any) => `${tx.code}:${tx.amount}`).join(', ')
                                                                                                                        : '-'}
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        {refundableTaxes && (
                                                                                                            <div className="text-xs text-[hsl(var(--muted-foreground))] mt-2">
                                                                                                                Refundable taxes: {refundableTaxes}
                                                                                                            </div>
                                                                                                        )}
                                                                                                        <div className="mt-3">
                                                                                                            <div className="text-xs font-medium mb-1">
                                                                                                                Chi tiết theo segment
                                                                                                            </div>
                                                                                                            <div className="space-y-1 text-xs text-[hsl(var(--muted-foreground))]">
                                                                                                                {fareDetails.length === 0 && (
                                                                                                                    <div>Không có thông tin theo segment.</div>
                                                                                                                )}
                                                                                                                {fareDetails.map((fd: any, idx: number) => (
                                                                                                                    <div key={idx} className="p-2 bg-gray-50 rounded">
                                                                                                                        <div>
                                                                                                                            Segment:{' '}
                                                                                                                            <span className="font-medium">
                                                                                                                                {fd.segmentId ?? idx}
                                                                                                                            </span>
                                                                                                                        </div>
                                                                                                                        <div>Cabin: {fd.cabin ?? '-'}</div>
                                                                                                                        <div>Fare basis: {fd.fareBasis ?? '-'}</div>
                                                                                                                        <div>Class: {fd.class ?? fd.bookingClass ?? '-'}</div>
                                                                                                                        <div>
                                                                                                                            Included checked bags:{' '}
                                                                                                                            {fd.includedCheckedBags?.quantity ??
                                                                                                                                fd.includedCheckedBags?.weight ??
                                                                                                                                '-'}

                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                ))}
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                );
                                                                                            })}
                                                                                        </div>
                                                                                    );
                                                                                })()}
                                                                            </TabsContent>
                                                                        </div>
                                                                    </Tabs>
                                                                </>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                ))
                                        ) : (
                                            // Nếu không phải roundtrip, render mặc định
                                            <FlightResults
                                                isLoading={isLoading}
                                                sortedFlights={sortedFlights}
                                                hasSearched={hasSearched}
                                                expandedFlight={expandedFlight}
                                                setExpandedFlight={setExpandedFlight}
                                                formatPrice={formatPrice}
                                            />
                                        )
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Review Side Panel */}
            {roundtripMode && showReview && selectedOutbound && selectedInbound && (
                <div className="fixed inset-0 z-50">
                    {/* overlay: when closing review, clear inbound selection so it's not persisted */}
                    <div className="absolute inset-0 bg-black/30" onClick={() => { setShowReview(false); setSelectedInbound(null); }} />
                    <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl animate-in slide-in-from-right duration-200">
                        <Card className="h-full rounded-none border-0">
                            <CardHeader className="flex flex-row items-center justify-between py-4 px-4">
                                <CardTitle className="text-base">Xem lại chuyến bay của bạn</CardTitle>
                                {/* Close: close + clear inbound (do not persist selectedInbound) */}
                                <Button variant="ghost" size="sm" onClick={() => { setShowReview(false); setSelectedInbound(null); }}>Đóng</Button>
                            </CardHeader>
                            <CardContent className="space-y-3 px-4 pb-4">
                                {/* OUTBOUND: sử dụng style giống phần bạn gửi */}
                                <Card className="p-3">
                                    <div className="text-md font-medium mb-1">
                                        <span className='inline-flex items-center px-2 py-1 bg-sky-100 text-sky-700 text-xs font-medium rounded mr-2'>Khởi hành</span>
                                        {selectedOutbound.departure.city} → {selectedOutbound.arrival.city}
                                        {selectedOutbound.departure?.date && (
                                            <span className="text-xs text-[hsl(var(--muted-foreground))]"> • {formatDateReadable(selectedOutbound.departure.date)}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded bg-white/70 flex items-center justify-center text-sm font-semibold">
                                                {selectedOutbound.airline.split(' ').map((s: string) => s[0]).slice(0, 2).join('')}
                                            </div>
                                            <div>
                                                <div className="font-medium">{selectedOutbound.airline}</div>
                                                <div className="text-xs text-[hsl(var(--muted-foreground))]">{selectedOutbound.flightNumber} • {selectedOutbound.aircraft}</div>
                                            </div>
                                        </div>
                                        {/* right column reserved (bỏ hiển thị giá theo yêu cầu) */}
                                    </div>

                                    <div className="flex items-center gap-6 mt-3">
                                        <div className="text-center">
                                            <div className="font-bold text-lg">{selectedOutbound.departure.time}</div>
                                            <div className="text-sm text-[hsl(var(--muted-foreground))]">{selectedOutbound.departure.airport}</div>
                                            <div className="text-xs text-[hsl(var(--muted-foreground))]">{selectedOutbound.departure.city}</div>
                                        </div>

                                        <div className="flex-1 text-center">
                                            <div className="text-sm text-[hsl(var(--muted-foreground))] mb-1">{selectedOutbound.duration}</div>
                                            <div className="flex items-center">
                                                <div className="flex-1 h-px bg-gray-300"></div>
                                                <ArrowRight className="h-4 w-4 mx-2 text-gray-400" />
                                                <div className="flex-1 h-px bg-gray-300"></div>
                                            </div>
                                        </div>

                                        <div className="text-center">
                                            <div className="font-bold text-lg">{selectedOutbound.arrival.time}</div>
                                            <div className="text-sm text-[hsl(var(--muted-foreground))]">{selectedOutbound.arrival.airport}</div>
                                            <div className="text-xs text-[hsl(var(--muted-foreground))]">{selectedOutbound.arrival.city}</div>
                                        </div>
                                    </div>


                                </Card>

                                {/* INBOUND: cùng style như Outbound */}
                                <Card className="p-3">
                                    <div className="text-sm font-medium mb-1">
                                        <span className='inline-flex items-center px-2 py-1 bg-sky-100 text-sky-700 text-md font-medium rounded mr-2'>Chuyến về</span>
                                        {selectedInbound.departure.city} → {selectedInbound.arrival.city}
                                        {selectedInbound.departure?.date && (
                                            <span className="text-xs text-[hsl(var(--muted-foreground))]"> • {formatDateReadable(selectedInbound.departure.date)}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded bg-white/70 flex items-center justify-center text-sm font-semibold">
                                                {selectedInbound.airline.split(' ').map((s: string) => s[0]).slice(0, 2).join('')}
                                            </div>
                                            <div>
                                                <div className="font-medium">{selectedInbound.airline}</div>
                                                <div className="text-xs text-[hsl(var(--muted-foreground))]">{selectedInbound.flightNumber} • {selectedInbound.aircraft}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 mt-3">
                                        <div className="text-center">
                                            <div className="font-bold text-lg">{selectedInbound.departure.time}</div>
                                            <div className="text-sm text-[hsl(var(--muted-foreground))]">{selectedInbound.departure.airport}</div>
                                            <div className="text-xs text-[hsl(var(--muted-foreground))]">{selectedInbound.departure.city}</div>
                                        </div>

                                        <div className="flex-1 text-center">
                                            <div className="text-sm text-[hsl(var(--muted-foreground))] mb-1">{selectedInbound.duration}</div>
                                            <div className="flex items-center">
                                                <div className="flex-1 h-px bg-gray-300"></div>
                                                <ArrowRight className="h-4 w-4 mx-2 text-gray-400" />
                                                <div className="flex-1 h-px bg-gray-300"></div>
                                            </div>
                                        </div>

                                        <div className="text-center">
                                            <div className="font-bold text-lg">{selectedInbound.arrival.time}</div>
                                            <div className="text-sm text-[hsl(var(--muted-foreground))]">{selectedInbound.arrival.airport}</div>
                                            <div className="text-xs text-[hsl(var(--muted-foreground))]">{selectedInbound.arrival.city}</div>
                                        </div>
                                    </div>


                                </Card>

                                {/* Tổng giá + nút tiếp tục giữ nguyên */}
                                <div className="flex items-center justify-between pt-2">
                                    <div className="text-lg font-bold text-orange-600">{formatPrice(totalRoundtripPrice())}/khách</div>
                                    <div>
                                        <Button
                                            size="lg"
                                            onClick={() => handlePriceRoundtrip()}
                                            disabled={pricingLoadingRT}
                                        >
                                            {pricingLoadingRT ? 'Đang kiểm giá...' : 'Tiếp tục'}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}



        </>
    );
}
