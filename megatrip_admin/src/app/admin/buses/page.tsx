"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bus, Plus, Edit, Eye, Trash2, Filter, Download, MapPin, Clock, Users, DollarSign, RefreshCw, Calendar, Ban, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { Checkbox } from "../../components/ui/checkbox";
import { DataTable, Column } from "../../components/DataTable";
import { ModalForm } from "../../components/ModalForm";
import { ConfirmModal } from "../../components/ConfirmModal";
import { useToast } from "../../components/ui/use-toast";

// --- Add API base (points to port 7700 by default) ---
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:7700';

interface BusRoute {
    id: string;
    busCode: string;
    operator: {
        id: string;
        name: string;
        logo: string;
        code: string;
    };
    routeFrom: {
        code: string;
        name: string;
        city: string;
    };
    routeTo: {
        code: string;
        name: string;
        city: string;
    };
    departureAt: string;
    arrivalAt: string;
    duration: string;
    busType: string[];
    price: number;
    seatsTotal: number;
    seatsAvailable: number;
    status: "scheduled" | "cancelled" | "delayed" | "completed";
    amenities: string;
    createdAt: string;
    updatedAt: string;
}

interface BusFormData {
    busCode: string;
    operatorId: string;
    routeFrom: string;
    routeTo: string;
    departureAt: string;
    arrivalAt: string;
    duration: string;
    busType: string[];
    price: number;
    seatsTotal: number;
    seatsAvailable: number;
    amenities: string;
    status: "scheduled" | "cancelled" | "delayed" | "completed";
}

interface BusFilters {
    operator: string;
    status: string;
    route: string;
    dateRange?: [string, string];
}

const mockOperators = [
    { id: "op_001", name: "Phương Trang", code: "PT", logo: "/placeholder.svg" },
    { id: "op_002", name: "Hoàng Long", code: "HL", logo: "/placeholder.svg" },
    { id: "op_003", name: "Mai Linh", code: "ML", logo: "/placeholder.svg" },
    { id: "op_004", name: "Thanh Bưởi", code: "TB", logo: "/placeholder.svg" },
];

const mockStations = [
    { code: "SGN_MB", name: "Bến xe Miền Đông", city: "TP.HCM" },
    { code: "SGN_MT", name: "Bến xe Miền Tây", city: "TP.HCM" },
    { code: "HAN_MB", name: "Bến xe Mỹ Đình", city: "Hà Nội" },
    { code: "HAN_GL", name: "Bến xe Gia Lâm", city: "Hà Nội" },
    { code: "DAD_BX", name: "Bến xe Đà Nẵng", city: "Đà Nẵng" },
    { code: "HUE_BX", name: "Bến xe Huế", city: "Huế" },
];

const busTypeOptions = [
	{ value: "Ghế ngồi", label: "Ghế ngồi" },
	{ value: "Giường nằm", label: "Giường nằm" },
	{ value: "Limousine", label: "Limousine" },
	{ value: "VIP", label: "VIP" }
];

// --- New: amenities options ---
const amenitiesOptions = [
	"Wifi miễn phí",
	"Điều hòa",
	"Nước uống",
	"Ăn nhẹ",
	"Bữa ăn dọc đường"
];

// --- New helper: safe collect all subtypes without flatMap ---
const getAllSubtypes = (data: any) => {
	// returns [] if data is not an array
	if (!Array.isArray(data)) return [];
	const result: any[] = [];
	for (const cat of data) {
		if (cat && Array.isArray(cat.subtypes)) {
			for (const s of cat.subtypes) result.push(s);
		}
	}
	return result;
};

// --- New helper: parse route select value into object { code, name, city } ---
const parseRouteValue = (value: string) => {
	// value may be "PROV_CODE||Station Name" (when loaded from provincesData)
	if (!value) return null;
	if (typeof value !== 'string') return null;

	// try prov||station format
	const parts = value.split('||');
	if (parts.length === 2) {
		const provCode = parts[0];
		const stationName = parts[1];
		// Guard access to provincesData (may be undefined at module scope)
		if (typeof provincesData !== 'undefined' && Array.isArray(provincesData)) {
			const prov = provincesData.find((p: any) => String(p.code) === String(provCode) || p.name === provCode);
			if (prov && Array.isArray(prov.bus_stations)) {
				const st = prov.bus_stations.find((s: any) => s.name === stationName);
				if (st) {
					return {
						code: provCode,
						name: st.name,
						city: prov.name || prov.city || ''
					};
				}
			}
		}
		// fallback: try to find station in mockStations by name
		const m = mockStations.find(s => s.name === stationName || s.code === stationName);
		if (m) return { code: m.code, name: m.name, city: m.city };
		// fallback generic
		return { code: provCode, name: stationName, city: '' };
	}

	// otherwise value might be a simple code like "SGN_MB"
	const ms = mockStations.find(s => s.code === value);
	if (ms) return { code: ms.code, name: ms.name, city: ms.city };
	// if provincesData contains stations with matching code/name, try to search
	// Guard access to provincesData (may be undefined at module scope)
	if (typeof provincesData !== 'undefined' && Array.isArray(provincesData)) {
		for (const prov of provincesData) {
			if (Array.isArray(prov.bus_stations)) {
				const st = prov.bus_stations.find((s: any) => s.name === value || s.code === value);
				if (st) {
					return { code: prov.code || value, name: st.name, city: prov.name || prov.city || '' };
				}
			}
		}
	}
	return { code: value, name: value, city: '' };
};

// --- New helper: format a route object into the Select value used by the UI ---
const formatRouteSelectValue = (routeObj: any) => {
	// routeObj may be { code, name, city } or a simple code string
	if (!routeObj) return "";
	if (typeof routeObj === "string") return routeObj;

	const code = routeObj.code || "";
	const name = routeObj.name || "";

	// prefer provincesData provCode||stationName when possible
	if (typeof provincesData !== 'undefined' && Array.isArray(provincesData)) {
		for (const prov of provincesData) {
			if (!Array.isArray(prov.bus_stations)) continue;
			const found = prov.bus_stations.find((s: any) => {
				// match by station name or code or routeObj.name/code
				return s.name === name || s.name === code || s.code === name || s.code === code;
			});
			if (found) {
				return `${prov.code}||${found.name}`;
			}
		}
	}

	// fallback to mockStations by code or name
	const ms = mockStations.find(s => s.code === code || s.name === name || s.code === name || s.name === code);
	if (ms) return ms.code;

	// fallback to use code if present, otherwise name
	return code || name || "";
};

// --- Stronger validation ---
const validateForm = (data: BusFormData): Record<string, string> => {
	const errors: Record<string, string> = {};

	// busCode: required, uppercase alnum/_- 3-12 chars
	if (!data.busCode || !data.busCode.trim()) {
		errors.busCode = "Bạn phải nhập mã tuyến xe";
	} else {
		const code = data.busCode.trim().toUpperCase();
		const re = /^[A-Z0-9_-]{3,12}$/;
		if (!re.test(code)) errors.busCode = "Mã tuyến không hợp lệ (3-12 ký tự A-Z, 0-9, _ hoặc -)";
	}

	// operator: must exist in loaded operators (if available)
	if (!data.operatorId) {
		errors.operatorId = "Bạn phải chọn nhà xe";
	} else if (operatorsData && Array.isArray(operatorsData)) {
		const foundOp = operatorsData.find((o: any) => o.id === data.operatorId);
		if (!foundOp) errors.operatorId = "Nhà xe không tồn tại";
	}

	// routeFrom / routeTo: required and must map to a station
	if (!data.routeFrom) {
		errors.routeFrom = "Bạn phải chọn điểm đi";
	} else {
		const parsedFrom = parseRouteValue(data.routeFrom);
		if (!parsedFrom || !parsedFrom.name) errors.routeFrom = "Điểm đi không hợp lệ";
	}
	if (!data.routeTo) {
		errors.routeTo = "Bạn phải chọn điểm đến";
	} else {
		const parsedTo = parseRouteValue(data.routeTo);
		if (!parsedTo || !parsedTo.name) errors.routeTo = "Điểm đến không hợp lệ";
	}
	// Ensure they are different
	if (data.routeFrom && data.routeTo && data.routeFrom === data.routeTo) {
		errors.routeTo = "Điểm đến phải khác điểm đi";
	}

	// departure/arrival
	if (!data.departureAt) {
		errors.departureAt = "Bạn phải chọn giờ xuất phát";
	} else if (isNaN(new Date(data.departureAt).getTime())) {
		errors.departureAt = "Giờ xuất phát không hợp lệ";
	} else {
        // disallow past departure times
        const now = new Date();
        if (new Date(data.departureAt) < now) {
            errors.departureAt = "Giờ xuất phát không được ở quá khứ";
        }
    }
	if (!data.arrivalAt) {
		errors.arrivalAt = "Bạn phải chọn giờ đến";
	} else if (isNaN(new Date(data.arrivalAt).getTime())) {
		errors.arrivalAt = "Giờ đến không hợp lệ";
	} else {
        // disallow past arrival times
        const now2 = new Date();
        if (new Date(data.arrivalAt) < now2) {
            errors.arrivalAt = "Giờ đến không được ở quá khứ";
        }
    }
	if (data.departureAt && data.arrivalAt && !errors.departureAt && !errors.arrivalAt) {
		if (new Date(data.arrivalAt) <= new Date(data.departureAt)) {
			errors.arrivalAt = "Giờ đến phải sau giờ xuất phát";
		}
		// optional: require departure not too far in past (e.g. > now - 1 day) — skip strictness for edit
	}

	// numeric checks
	if (typeof data.price !== 'number' || isNaN(data.price) || data.price <= 0) {
		errors.price = "Giá vé phải là số lớn hơn 0";
	}
	if (!Number.isInteger(data.seatsTotal) || data.seatsTotal <= 0) {
		errors.seatsTotal = "Tổng số ghế phải là số nguyên dương";
	}
	if (!Number.isInteger(data.seatsAvailable) || data.seatsAvailable < 0) {
		errors.seatsAvailable = "Số ghế có sẵn phải là số nguyên không âm";
	} else if (data.seatsAvailable > data.seatsTotal) {
		errors.seatsAvailable = "Số ghế có sẵn không được lớn hơn tổng số ghế";
	}

	// busType must have at least one entry
	if (!Array.isArray(data.busType) || data.busType.length === 0) {
		errors.busType = "Bạn phải chọn ít nhất một loại xe";
	}

	// No strict requirement for amenities (checkboxes) — optional

	return errors;
};

export default function Buses() {
    const [selectedBuses, setSelectedBuses] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState<BusFilters>({
        operator: "all",
        status: "all",
        route: "all"
    });
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
    const [selectedBus, setSelectedBus] = useState<BusRoute | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [busToDelete, setBusToDelete] = useState<BusRoute | null>(null);
    const [formData, setFormData] = useState<BusFormData>({
        busCode: "",
        operatorId: "",
        routeFrom: "",
        routeTo: "",
        departureAt: "",
        arrivalAt: "",
        duration: "",
        busType: ["Ghế ngồi"],
        price: 0,
        seatsTotal: 0,
        seatsAvailable: 0,
        amenities: "",
        status: "scheduled"
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [selectedSubtypeId, setSelectedSubtypeId] = useState<string>("");
    // New: store selected subtype layout and constructed seatMap
    const [selectedLayout, setSelectedLayout] = useState<any | null>(null);
    const [seatMap, setSeatMap] = useState<any[] | null>(null);

    // --- New state: selected amenities (checkboxes) ---
	const [amenitiesSelected, setAmenitiesSelected] = useState<string[]>([]);

    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
    });

    // Fetch buses from server API
    const { data: busesData, isLoading, error, refetch } = useQuery({
        queryKey: ['buses', pagination.current, pagination.pageSize, searchQuery, filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.set('page', String(pagination.current));
            params.set('pageSize', String(pagination.pageSize));
            if (searchQuery) params.set('search', searchQuery);
            if (filters.operator) params.set('operator', filters.operator);
            if (filters.status) params.set('status', filters.status);
            if (filters.route) params.set('route', filters.route);

            const res = await fetch(`${API_BASE}/api/buses?${params.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch buses');
            return res.json();
        },
    });

    // --- Add data fetch for operators and stations (provinces) ---
    const { data: operatorsData, isLoading: operatorsLoading } = useQuery({
        queryKey: ['operators'],
        queryFn: async () => {
            // load local JSON from public folder
            const res = await fetch('/nhaxekhach.json');
            if (!res.ok) throw new Error('Failed to load operators (local json)');
            return res.json();
        },
    });

    const { data: provincesData, isLoading: provincesLoading } = useQuery({
        queryKey: ['provinces_with_stations'],
        queryFn: async () => {
            // load local JSON from public folder
            const res = await fetch('/cac_ben_xe_bus_chua_sat_nhap.json');
            if (!res.ok) throw new Error('Failed to load stations (local json)');
            return res.json();
        },
    });

    // --- New: fetch vehicle categories (loaixe) ---
    const { data: loaixeData, isLoading: loaixeLoading } = useQuery({
        queryKey: ['loaixe'],
        queryFn: async () => {
            // load local JSON from public folder
            const res = await fetch('/dsloaixevexere.json');
            if (!res.ok) throw new Error('Failed to load vehicle types (local json)');
            return res.json();
        },
    });

    // Create bus mutation -> POST /api/buses
    const createBusMutation = useMutation({
        mutationFn: async (data: BusFormData) => {
            const payload: any = { ...data };
            // operatorId -> create operator object with minimal info (frontend keeps mockOperators)
            const op = (operatorsData || mockOperators).find((o: any) => o.id === data.operatorId);
            if (op) payload.operator = { id: op.id, name: op.name, logo: (op.logo || '/placeholder.svg'), code: (op.code || op.short_name || '') };
            const parsedFrom = parseRouteValue(data.routeFrom);
            if (parsedFrom) payload.routeFrom = parsedFrom;
            else payload.routeFrom = mockStations.find(s => s.code === data.routeFrom) || { code: data.routeFrom };

            const parsedTo = parseRouteValue(data.routeTo);
            if (parsedTo) payload.routeTo = parsedTo;
            else payload.routeTo = mockStations.find(s => s.code === data.routeTo) || { code: data.routeTo };

            payload.departureAt = new Date(data.departureAt).toISOString();
            payload.arrivalAt = new Date(data.arrivalAt).toISOString();
            // ensure duration is computed from departure -> arrival (arrival - departure)
            payload.duration = calculateDuration(data.departureAt, data.arrivalAt);
            const subtype = getAllSubtypes(loaixeData).find((s: any) => s.id === selectedSubtypeId);
            if (subtype) {
                payload.busType = [subtype.name];
                // set total seats from seat_capacity (user wanted seat_capacity => Tổng số ghế)
                if (typeof subtype.seat_capacity === 'number') payload.seatsTotal = subtype.seat_capacity;
            }
            // set amenities string from selected checkboxes
            payload.amenities = amenitiesSelected.length ? amenitiesSelected.join(', ') : (payload.amenities || '');
            payload.seatMap = seatMap && seatMap.length ? seatMap : undefined;

            // DEBUG: log payload so we can inspect what will be sent when creating a bus
            console.log('[Buses] createBus payload:', payload);

            const res = await fetch(`${API_BASE}/api/buses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const j = await res.json().catch(() => ({}));
                throw new Error(j.error || 'Failed to create');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['buses'] });
            setModalOpen(false);
            resetForm();
            toast({ title: "Thêm tuyến xe thành công", description: "Tuyến xe mới đã được thêm vào hệ thống" });
        },
        onError: (error: any) => {
            toast({ title: "Lỗi khi thêm tuyến xe", description: error.message, variant: "destructive" });
        }
    });

    // Update bus mutation -> PUT /api/buses/:id
    const updateBusMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<BusFormData> }) => {
            const payload: any = { ...data };
            if ((data as any).operatorId) {
                const op = (operatorsData || mockOperators).find((o: any) => o.id === (data as any).operatorId);
                if (op) payload.operator = { id: op.id, name: op.name, logo: (op.logo || '/placeholder.svg'), code: (op.code || op.short_name || '') };
            }
            if ((data as any).routeFrom) {
				const parsedFromUp = parseRouteValue((data as any).routeFrom);
				payload.routeFrom = parsedFromUp || mockStations.find(s => s.code === (data as any).routeFrom) || { code: (data as any).routeFrom };
			}
            if ((data as any).routeTo) {
				const parsedToUp = parseRouteValue((data as any).routeTo);
				payload.routeTo = parsedToUp || mockStations.find(s => s.code === (data as any).routeTo) || { code: (data as any).routeTo };
			}
            if ((data as any).departureAt) payload.departureAt = new Date((data as any).departureAt).toISOString();
            if ((data as any).arrivalAt) payload.arrivalAt = new Date((data as any).arrivalAt).toISOString();
            // compute duration when both departure and arrival are available in the payload
            if (payload.departureAt && payload.arrivalAt) {
                // payload.* are ISO strings — calculateDuration accepts date strings
                payload.duration = calculateDuration(payload.departureAt, payload.arrivalAt);
            }
            const allSubtypes = getAllSubtypes(loaixeData);
            let subtypeUpd;
            if (selectedSubtypeId) {
                subtypeUpd = allSubtypes.find((s: any) => s.id === selectedSubtypeId);
            } else {
                const firstTypeName = payload && payload.busType && payload.busType[0];
                subtypeUpd = firstTypeName ? allSubtypes.find((s: any) => s.name === firstTypeName) : undefined;
            }
            if (subtypeUpd) {
                payload.busType = [subtypeUpd.name];
                if (typeof subtypeUpd.seat_capacity === 'number') payload.seatsTotal = subtypeUpd.seat_capacity;
            }
            // set amenities string from selected checkboxes (if user changed via UI)
            if (amenitiesSelected && amenitiesSelected.length) {
				payload.amenities = amenitiesSelected.join(', ');
			}
            payload.seatMap = seatMap && seatMap.length ? seatMap : undefined;

            const res = await fetch(`${API_BASE}/api/buses/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const j = await res.json().catch(() => ({}));
                throw new Error(j.error || 'Failed to update');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['buses'] });
            setModalOpen(false);
            resetForm();
            toast({ title: "Cập nhật tuyến xe thành công", description: "Thông tin tuyến xe đã được cập nhật" });
        },
        onError: (error: any) => {
            toast({ title: "Lỗi khi cập nhật tuyến xe", description: error.message, variant: "destructive" });
        }
    });

    // Delete bus mutation -> DELETE /api/buses/:id
    const deleteBusMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`${API_BASE}/api/buses/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const j = await res.json().catch(() => ({}));
                throw new Error(j.error || 'Failed to delete');
            }
            return res.json();
        },
        onSuccess: (_, busId) => {
            queryClient.invalidateQueries({ queryKey: ['buses'] });
            setDeleteModalOpen(false);
            setBusToDelete(null);
            toast({
                title: "Đã xóa tuyến xe",
                description: `Tuyến xe đã được xóa thành công`,
            });
        },
        onError: (error: any) => {
            toast({ title: "Lỗi khi xóa tuyến xe", description: error.message, variant: "destructive" });
        }
    });

    // Bulk operations -> POST /api/buses/bulk
    const bulkActionMutation = useMutation({
        mutationFn: async ({ action, ids }: { action: string; ids: string[] }) => {
            const res = await fetch(`${API_BASE}/api/buses/bulk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, ids }),
            });
            if (!res.ok) {
                const j = await res.json().catch(() => ({}));
                throw new Error(j.error || 'Bulk action failed');
            }
            return res.json();
        },
        onSuccess: (_, { action, ids }) => {
            queryClient.invalidateQueries({ queryKey: ['buses'] });
            setSelectedBuses([]);
            const actionText = action === 'activate' ? 'kích hoạt' : action === 'cancel' ? 'hủy' : 'xóa';
            toast({ title: `Thực hiện thành công`, description: `Đã ${actionText} ${ids.length} tuyến xe` });
        },
        onError: (error: any) => {
            toast({ title: "Lỗi khi thực hiện thao tác", description: error.message, variant: "destructive" });
        }
    });

    // Normalize incoming bus documents: ensure `id` exists (use `_id` when returned by Mongo)
    const rawBuses = busesData?.data || [];
    const buses = Array.isArray(rawBuses) ? rawBuses.map((b: any) => {
        const id = b.id || b._id || (b._id ? String(b._id) : undefined);
        return {
            ...b,
            id,
            // ensure routeFrom/routeTo always exist to avoid undefined errors in UI/delete flow
            routeFrom: b.routeFrom || (b.route && b.route.from) || { code: b.routeFrom?.code || '', name: b.routeFrom?.name || '', city: b.routeFrom?.city || '' },
            routeTo: b.routeTo || (b.route && b.route.to) || { code: b.routeTo?.code || '', name: b.routeTo?.name || '', city: b.routeTo?.city || '' },
        };
    }) : [];
    const total = busesData?.pagination?.total || 0;

    // Form validation
    const validateForm = (data: BusFormData): Record<string, string> => {
        const errors: Record<string, string> = {};

        // busCode: required, uppercase alnum/_- 3-12 chars
        if (!data.busCode || !data.busCode.trim()) {
            errors.busCode = "Bạn phải nhập mã tuyến xe";
        } else {
            const code = data.busCode.trim().toUpperCase();
            const re = /^[A-Z0-9_-]{3,12}$/;
            if (!re.test(code)) errors.busCode = "Mã tuyến không hợp lệ (3-12 ký tự A-Z, 0-9, _ hoặc -)";
        }

        // operator: must exist in loaded operators (if available)
        if (!data.operatorId) {
            errors.operatorId = "Bạn phải chọn nhà xe";
        } else if (operatorsData && Array.isArray(operatorsData)) {
            const foundOp = operatorsData.find((o: any) => o.id === data.operatorId);
            if (!foundOp) errors.operatorId = "Nhà xe không tồn tại";
        }

        // routeFrom / routeTo: required and must map to a station
        if (!data.routeFrom) {
            errors.routeFrom = "Bạn phải chọn điểm đi";
        } else {
            const parsedFrom = parseRouteValue(data.routeFrom);
            if (!parsedFrom || !parsedFrom.name) errors.routeFrom = "Điểm đi không hợp lệ";
        }
        if (!data.routeTo) {
            errors.routeTo = "Bạn phải chọn điểm đến";
        } else {
            const parsedTo = parseRouteValue(data.routeTo);
            if (!parsedTo || !parsedTo.name) errors.routeTo = "Điểm đến không hợp lệ";
        }
        // Ensure they are different
        if (data.routeFrom && data.routeTo && data.routeFrom === data.routeTo) {
            errors.routeTo = "Điểm đến phải khác điểm đi";
        }

        // departure/arrival
        if (!data.departureAt) {
            errors.departureAt = "Bạn phải chọn giờ xuất phát";
        } else if (isNaN(new Date(data.departureAt).getTime())) {
            errors.departureAt = "Giờ xuất phát không hợp lệ";
        } else {
            // disallow past departure times
            const now = new Date();
            if (new Date(data.departureAt) < now) {
                errors.departureAt = "Giờ xuất phát không được ở quá khứ";
            }
        }
        if (!data.arrivalAt) {
            errors.arrivalAt = "Bạn phải chọn giờ đến";
        } else if (isNaN(new Date(data.arrivalAt).getTime())) {
            errors.arrivalAt = "Giờ đến không hợp lệ";
        } else {
            // disallow past arrival times
            const now2 = new Date();
            if (new Date(data.arrivalAt) < now2) {
                errors.arrivalAt = "Giờ đến không được ở quá khứ";
            }
        }
        if (data.departureAt && data.arrivalAt && !errors.departureAt && !errors.arrivalAt) {
            if (new Date(data.arrivalAt) <= new Date(data.departureAt)) {
                errors.arrivalAt = "Giờ đến phải sau giờ xuất phát";
            }
            // optional: require departure not too far in past (e.g. > now - 1 day) — skip strictness for edit
        }

        // numeric checks
        if (typeof data.price !== 'number' || isNaN(data.price) || data.price <= 0) {
            errors.price = "Giá vé phải là số lớn hơn 0";
        }
        if (!Number.isInteger(data.seatsTotal) || data.seatsTotal <= 0) {
            errors.seatsTotal = "Tổng số ghế phải là số nguyên dương";
        }
        if (!Number.isInteger(data.seatsAvailable) || data.seatsAvailable < 0) {
            errors.seatsAvailable = "Số ghế có sẵn phải là số nguyên không âm";
        } else if (data.seatsAvailable > data.seatsTotal) {
            errors.seatsAvailable = "Số ghế có sẵn không được lớn hơn tổng số ghế";
        }

        // busType must have at least one entry
        if (!Array.isArray(data.busType) || data.busType.length === 0) {
            errors.busType = "Bạn phải chọn ít nhất một loại xe";
        }

        // No strict requirement for amenities (checkboxes) — optional

        return errors;
    };

    const resetForm = () => {
        setFormData({
            busCode: "",
            operatorId: "",
            routeFrom: "",
            routeTo: "",
            departureAt: "",
            arrivalAt: "",
            duration: "",
            busType: ["Ghế ngồi"],
            price: 0,
            seatsTotal: 0,
            seatsAvailable: 0,
            amenities: "",
            status: "scheduled"
        });
        setFormErrors({});
        setIsFormDirty(false);
        setSelectedSubtypeId("");
        // clear amenities selection
		setAmenitiesSelected([]);
    };

    const handleFormChange = (field: keyof BusFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setIsFormDirty(true);

        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    const calculateDuration = (departure: string, arrival: string): string => {
        if (!departure || !arrival) return "";

        const depTime = new Date(departure);
        const arrTime = new Date(arrival);
        const diffMs = arrTime.getTime() - depTime.getTime();

        if (diffMs <= 0) return "";

        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        return `${hours}h ${minutes}m`;
    };

    // helper: current local datetime suitable for <input type="datetime-local" />
    const isoLocalNow = () => {
        const d = new Date();
        // convert to local ISO without seconds: YYYY-MM-DDTHH:mm
        const tzOffset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - tzOffset).toISOString().slice(0,16);
    };
    
    // Helper: build seat map from a subtype.layout
    const buildSeatMapFromLayout = (layout: any) => {
        if (!layout || !Array.isArray(layout.rows)) return [];
        const seats: any[] = [];
        for (const row of layout.rows) {
            if (!Array.isArray(row.seats)) continue;
            for (const s of row.seats) {
                seats.push({
                    seatId: s.seat_id || s.id || `${row.row_index}-${(s.label || s.seat_id)}`,
                    label: s.label || s.seat_id || '',
                    type: s.type || 'seat',
                    pos: s.pos || null,
                    status: 'available' // initial
                });
            }
        }
        return seats;
    };

    // New: generate seatMap and mark N random seats as booked (bookedCount)
    const generateSeatMapWithBooked = (layout: any, bookedCount: number) => {
        const map = buildSeatMapFromLayout(layout);
        if (!map.length) return map;
        const availableIndices = map.map((_, i) => i);
        // shuffle indices
        for (let i = availableIndices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableIndices[i], availableIndices[j]] = [availableIndices[j], availableIndices[i]];
        }
        let toBook = Math.min(bookedCount, map.length);
        for (let k = 0; k < toBook; k++) {
            map[availableIndices[k]].status = 'booked';
        }
        return map;
    };

    const columns: Column[] = [
        {
            key: "busCode",
            title: "Mã tuyến",
            sortable: true,
            render: (value, record: BusRoute) => (
                <div>
                    <div className="font-mono font-medium">{value}</div>
                    <div className="text-sm text-gray-500">{record.id}</div>
                </div>
            ),
        },
        {
            key: "operator",
            title: "Nhà xe",
            render: (value, record: BusRoute) => (
                <div className="flex items-center space-x-2">
                     
                    <div>
                        <div className="font-medium">{value.name}</div>
                        <div className="text-sm text-gray-500">{value.code}</div>
                    </div>
                </div>
            ),
        },
        {
            key: "route",
            title: "Tuyến đường",
            render: (_, record: BusRoute) => (
                <div className="text-sm">
                    <div className="flex items-center space-x-2 font-medium">
                        <span className="font-mono">{record.routeFrom.code}</span>
                        <Bus className="w-4 h-4 text-gray-400" />
                        <span className="font-mono">{record.routeTo.code}</span>
                    </div>
                    <div className="text-gray-500">
                        {record.routeFrom.city} → {record.routeTo.city}
                    </div>
                </div>
            ),
        },
        {
            key: "schedule",
            title: "Lịch trình",
            sortable: true,
            render: (_, record: BusRoute) => (
                <div className="text-sm">
                    <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="font-medium">
                            {new Date(record.departureAt).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>
                        <span className="text-gray-500">→</span>
                        <span>
                            {new Date(record.arrivalAt).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>
                    </div>
                    <div className="text-gray-500">
                        {new Date(record.departureAt).toLocaleDateString('vi-VN')}
                    </div>
                    <div className="text-xs text-gray-400">{record.duration}</div>
                </div>
            ),
        },
        {
            key: "busType",
            title: "Loại xe",
            render: (value: string[]) => (
                <div className="space-y-1">
                    {value.map((type, index) => (
                        <Badge
                            key={index}
                            variant="outline"
                            className="text-xs block w-fit"
                        >
                            {type}
                        </Badge>
                    ))}
                </div>
            ),
        },
        {
            key: "price",
            title: "Giá vé",
            sortable: true,
            render: (value) => (
                <div className="text-sm">
                    <div className="flex items-center font-medium">
                        <DollarSign className="w-3 h-3 mr-1" />
                        {new Intl.NumberFormat('vi-VN').format(value)} ₫
                    </div>
                </div>
            ),
        },
        {
            key: "seats",
            title: "Ghế",
            render: (_, record: BusRoute) => (
                <div className="text-sm">
                    <div className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        <span className="font-medium">{record.seatsAvailable}</span>
                        <span className="text-gray-500">/{record.seatsTotal}</span>
                    </div>
                    <div className={`text-xs ${record.seatsAvailable <= record.seatsTotal * 0.2 ? 'text-red-600' :
                        record.seatsAvailable <= record.seatsTotal * 0.5 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                        {record.seatsAvailable} chỗ trống
                    </div>
                </div>
            ),
        },
        {
            key: "status",
            title: "Trạng thái",
            sortable: true,
            render: (value) => (
                <Badge className={
                    value === "scheduled" ? "bg-green-100 text-green-800 hover:bg-green-100" :
                        value === "cancelled" ? "bg-red-100 text-red-800 hover:bg-red-100" :
                            value === "delayed" ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" :
                                "bg-gray-100 text-gray-800 hover:bg-gray-100"
                }>
                    {value === "scheduled" ? "Đã lên lịch" :
                        value === "cancelled" ? "Đã hủy" :
                            value === "delayed" ? "Hoãn" : "Hoàn thành"}
                </Badge>
            ),
        },
    ];

    const handleView = (bus: BusRoute) => {
        setSelectedBus(bus);
        setModalMode("view");
        setModalOpen(true);
    };

    const handleEdit = (bus: BusRoute) => {
        setSelectedBus(bus);
        setFormData({
            busCode: bus.busCode,
            operatorId: bus.operator.id,
            // format select values so the Select component can find the matching option
            routeFrom: formatRouteSelectValue(bus.routeFrom),
            routeTo: formatRouteSelectValue(bus.routeTo),
            departureAt: bus.departureAt.slice(0, 16),
            arrivalAt: bus.arrivalAt.slice(0, 16),
            duration: bus.duration,
            busType: bus.busType,
            price: bus.price,
            seatsTotal: bus.seatsTotal,
            seatsAvailable: bus.seatsAvailable,
            amenities: bus.amenities || "",
            status: bus.status
        });
        setModalMode("edit");
        setModalOpen(true);
        setIsFormDirty(false);
        const existingTypeName = bus.busType && bus.busType[0];
        if (existingTypeName && Array.isArray(loaixeData)) {
            const found = getAllSubtypes(loaixeData).find((s: any) => s.name === existingTypeName);
            if (found) setSelectedSubtypeId(found.id);
        }
        // populate amenitiesSelected from comma-separated amenities string
		setAmenitiesSelected((bus.amenities || "").split(',').map((s) => s.trim()).filter(Boolean));
    };

    const handleDelete = (bus: BusRoute) => {
        setBusToDelete(bus);
        setDeleteModalOpen(true);
    };

    const handleAdd = () => {
        // DEBUG: user clicked "Thêm tuyến xe" -> open create modal
        console.log('[Buses] handleAdd: opening create modal, resetting form');
        setSelectedBus(null);
        resetForm();
        setModalMode("create");
        setModalOpen(true);
    };

    const handleSubmit = () => {
        const errors = validateForm(formData);
        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            toast({
                title: "Lỗi validation",
                description: "Vui lòng kiểm tra lại thông tin nhập vào",
                variant: "destructive",
            });
            return;
        }

        // LOG: show the current data/state that will be submitted
        console.log('[Buses] submit - mode:', modalMode, {
            formData,
            selectedSubtypeId,
            selectedLayout,
            seatMap,
            amenitiesSelected
        });

        if (modalMode === "create") {
            createBusMutation.mutate(formData);
        } else if (modalMode === "edit" && selectedBus) {
            updateBusMutation.mutate({ id: selectedBus.id, data: formData });
        }
    };

    const confirmDelete = () => {
        if (!busToDelete) return;
        // ConfirmModal already forces typing "DELETE" or "FORCE_DELETE" when there are bookings.
        // Proceed with deletion when user confirms.
        deleteBusMutation.mutate(busToDelete.id);
    };
    // Immediately call DELETE /api/buses/:id (no confirm) and refresh list
    const handleForceDeleteApi = async (id: string) => {
        try {
            const res = await fetch(`${API_BASE}/api/buses/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const j = await res.json().catch(() => ({}));
                throw new Error(j.error || 'Failed to delete');
            }
            toast({ title: "Đã xóa tuyến xe", description: `ID: ${id}` });
            queryClient.invalidateQueries({ queryKey: ['buses'] });
        } catch (err: any) {
            toast({ title: "Lỗi khi xóa tuyến xe", description: err.message || String(err), variant: "destructive" });
        }
    };
    const bulkActions = [
        {
            label: "Kích hoạt",
            action: (keys: string[]) => {
                bulkActionMutation.mutate({ action: 'activate', ids: keys });
            },
            icon: <Eye className="w-4 h-4 mr-2" />,
        },
        {
            label: "Hủy tuyến",
            action: (keys: string[]) => {
                bulkActionMutation.mutate({ action: 'cancel', ids: keys });
            },
            icon: <Ban className="w-4 h-4 mr-2" />,
            variant: "secondary" as const,
        },
        {
            label: "Xóa",
            action: (keys: string[]) => {
                bulkActionMutation.mutate({ action: 'delete', ids: keys });
            },
            icon: <Trash2 className="w-4 h-4 mr-2" />,
            variant: "destructive" as const,
        },
    ];

    const actions = [
        {
            label: "Xem chi tiết",
            action: handleView,
            icon: <Eye className="mr-2 h-4 w-4" />,
        },
        {
            label: "Chỉnh sửa",
            action: handleEdit,
            icon: <Edit className="mr-2 h-4 w-4" />,
        },
        {
            label: "Xóa",
            action: handleDelete,
            icon: <Trash2 className="mr-2 h-4 w-4" />,
            variant: "destructive" as const,
        },
        {
            label: "Xóa ngay",
            action: (bus: BusRoute) => handleForceDeleteApi(bus.id),
            icon: <Trash2 className="mr-2 h-4 w-4" />,
            variant: "destructive" as const,
        },
    ];

    const handleModalClose = () => {
        if (isFormDirty && modalMode !== "view") {
            if (confirm("Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn đóng?")) {
                setModalOpen(false);
                resetForm();
            }
        } else {
            setModalOpen(false);
            resetForm();
        }
    };

    const isSubmitDisabled = () => {
        if (modalMode === "view") return true;
        if (!isFormDirty) return true;
        return createBusMutation.isPending || updateBusMutation.isPending;
    };

    const renderBusForm = () => {
        if (modalMode === "view" && selectedBus) {
            return (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-700">Mã tuyến xe</Label>
                                <p className="mt-1 font-mono text-lg font-bold">{selectedBus.busCode}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-700">Nhà xe</Label>
                                <div className="mt-1 flex items-center space-x-2">
                                    <img
                                        src={selectedBus.operator.logo}
                                        alt={selectedBus.operator.name}
                                        className="w-8 h-8 rounded"
                                    />
                                    <span className="font-medium">{selectedBus.operator.name}</span>
                                </div>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-700">Tuyến đường</Label>
                                <div className="mt-1 space-y-1">
                                    <div className="flex items-center space-x-2">
                                        <span className="font-mono font-bold">{selectedBus.routeFrom.code}</span>
                                        <Bus className="w-4 h-4 text-gray-400" />
                                        <span className="font-mono font-bold">{selectedBus.routeTo.code}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {selectedBus.routeFrom.name} → {selectedBus.routeTo.name}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-700">Lịch trình</Label>
                                <div className="mt-1 space-y-1">
                                    <p className="font-medium">
                                        {new Date(selectedBus.departureAt).toLocaleString('vi-VN')} →{" "}
                                        {new Date(selectedBus.arrivalAt).toLocaleString('vi-VN')}
                                    </p>
                                    <p className="text-sm text-gray-600">Thời gian di chuyển: {selectedBus.duration}</p>
                                </div>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-700">Giá vé</Label>
                                <p className="mt-1 text-lg font-bold text-green-600">
                                    {new Intl.NumberFormat('vi-VN').format(selectedBus.price)} ₫
                                </p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-700">Ghế ngồi</Label>
                                <p className="mt-1">
                                    {selectedBus.seatsAvailable} / {selectedBus.seatsTotal} ghế còn trống
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label className="text-sm font-medium text-gray-700">Loại xe</Label>
                        <div className="mt-1 flex space-x-2">
                            {selectedBus.busType.map((type, index) => (
                                <Badge key={index} variant="outline">{type}</Badge>
                            ))}
                        </div>
                    </div>

                    <div>
                        <Label className="text-sm font-medium text-gray-700">Tiện ích</Label>
                        <p className="mt-1 text-gray-900">{selectedBus.amenities}</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="busCode">Mã tuyến xe *</Label>
                        <Input
                            id="busCode"
                            value={formData.busCode}
                            onChange={(e) => handleFormChange('busCode', e.target.value.toUpperCase())}
                            placeholder="PT001"
                            className={`font-mono ${formErrors.busCode ? "border-red-500" : ""}`}
                        />
                        {formErrors.busCode && (
                            <p className="text-sm text-red-500 mt-1">{formErrors.busCode}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="operator">Nhà xe *</Label>
                        <Select
                            value={formData.operatorId}
                            onValueChange={(value) => handleFormChange('operatorId', value)}
                        >
                            <SelectTrigger className={formErrors.operatorId ? "border-red-500" : ""}>
                                <SelectValue placeholder="Chọn nhà xe" />
                            </SelectTrigger>
                            <SelectContent>
                                {(operatorsData && Array.isArray(operatorsData) ? operatorsData : mockOperators).map((operator: any) => (
                                    <SelectItem key={operator.id} value={operator.id}>
                                        <div className="flex items-center space-x-2">
                                            <img src={operator.logo || '/placeholder.svg'} alt={operator.name} className="w-6 h-6 rounded" />
                                            <span>{operator.name} {operator.code ? `(${operator.code})` : ''}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {formErrors.operatorId && (
                            <p className="text-sm text-red-500 mt-1">{formErrors.operatorId}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="routeFrom">Điểm đi *</Label>
                        <Select
                            value={formData.routeFrom}
                            onValueChange={(value) => handleFormChange('routeFrom', value)}
                        >
                            <SelectTrigger className={formErrors.routeFrom ? "border-red-500" : ""}>
                                <SelectValue placeholder="Chọn điểm đi" />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.isArray(provincesData) ? (
                                    provincesData.map((prov: any) => (
                                        <div key={prov.code}>
                                            <div className="px-3 py-1 text-sm font-semibold text-gray-700">{prov.name}</div>
                                            {Array.isArray(prov.bus_stations) && prov.bus_stations.map((st: any, idx: number) => (
                                                <SelectItem key={prov.code + '|' + idx} value={`${prov.code}||${st.name}`}>
                                                    {st.name} {st.address ? `- ${st.address}` : ''}
                                                </SelectItem>
                                            ))}
                                        </div>
                                    ))
                                ) : (
                                    mockStations.map((station) => (
                                        <SelectItem key={station.code} value={station.code}>
                                            {station.code} - {station.name} ({station.city})
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                        {formErrors.routeFrom && (
                            <p className="text-sm text-red-500 mt-1">{formErrors.routeFrom}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="routeTo">Điểm đến *</Label>
                        <Select
                            value={formData.routeTo}
                            onValueChange={(value) => handleFormChange('routeTo', value)}
                        >
                            <SelectTrigger className={formErrors.routeTo ? "border-red-500" : ""}>
                                <SelectValue placeholder="Chọn điểm đến" />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.isArray(provincesData) ? (
                                    provincesData.map((prov: any) => (
                                        <div key={prov.code}>
                                            <div className="px-3 py-1 text-sm font-semibold text-gray-700">{prov.name}</div>
                                            {Array.isArray(prov.bus_stations) && prov.bus_stations.map((st: any, idx: number) => (
                                                <SelectItem key={prov.code + '|' + idx} value={`${prov.code}||${st.name}`}>
                                                    {st.name} {st.address ? `- ${st.address}` : ''}
                                                </SelectItem>
                                            ))}
                                        </div>
                                    ))
                                ) : (
                                    mockStations.map((station) => (
                                        <SelectItem key={station.code} value={station.code}>
                                            {station.code} - {station.name} ({station.city})
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                        {formErrors.routeTo && (
                            <p className="text-sm text-red-500 mt-1">{formErrors.routeTo}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <Label htmlFor="departureAt">Giờ xuất phát *</Label>
                        <Input
                            id="departureAt"
                            type="datetime-local"
                            value={formData.departureAt}
                            onChange={(e) => {
                                handleFormChange('departureAt', e.target.value);
                                if (formData.arrivalAt) {
                                    const duration = calculateDuration(e.target.value, formData.arrivalAt);
                                    if (duration) handleFormChange('duration', duration);
                                }
                            }}
                           // prevent picking past datetime
                            min={isoLocalNow()}
                            className={formErrors.departureAt ? "border-red-500" : ""}
                        />
                        {formErrors.departureAt && (
                            <p className="text-sm text-red-500 mt-1">{formErrors.departureAt}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="arrivalAt">Giờ đến *</Label>
                        <Input
                            id="arrivalAt"
                            type="datetime-local"
                            value={formData.arrivalAt}
                            onChange={(e) => {
                                handleFormChange('arrivalAt', e.target.value);
                                if (formData.departureAt) {
                                    const duration = calculateDuration(formData.departureAt, e.target.value);
                                    if (duration) handleFormChange('duration', duration);
                                }
                            }}
                          // arrival cannot be earlier than departure (if set), otherwise not in the past
                            min={formData.departureAt && formData.departureAt.length ? formData.departureAt : isoLocalNow()}
                            className={formErrors.arrivalAt ? "border-red-500" : ""}
                        />
                        {formErrors.arrivalAt && (
                            <p className="text-sm text-red-500 mt-1">{formErrors.arrivalAt}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="duration">Thời gian di chuyển</Label>
                        <Input
                            id="duration"
                            value={formData.duration}
                            onChange={(e) => handleFormChange('duration', e.target.value)}
                            placeholder="6h 30m"
                            readOnly
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <Label htmlFor="price">Giá vé (VNĐ) *</Label>
                        <Input
                            id="price"
                            type="number"
                            value={formData.price || ""}
                            onChange={(e) => handleFormChange('price', parseInt(e.target.value) || 0)}
                            placeholder="350000"
                            className={formErrors.price ? "border-red-500" : ""}
                        />
                        {formErrors.price && (
                            <p className="text-sm text-red-500 mt-1">{formErrors.price}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="seatsTotal">Tổng số ghế *</Label>
                        <Input
                            id="seatsTotal"
                            type="number"
                            value={formData.seatsTotal || ""}
                            onChange={(e) => {
                                const total = parseInt(e.target.value) || 0;
                                handleFormChange('seatsTotal', total);
                                if (modalMode === "create" && formData.seatsAvailable === 0) {
                                    handleFormChange('seatsAvailable', total);
                                }
                            }}
                            placeholder="45"
                            className={formErrors.seatsTotal ? "border-red-500" : ""}
                        />
                        {formErrors.seatsTotal && (
                            <p className="text-sm text-red-500 mt-1">{formErrors.seatsTotal}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="seatsAvailable">Ghế có sẵn *</Label>
                        <Input
                            id="seatsAvailable"
                            type="number"
                            value={formData.seatsAvailable || ""}
                            onChange={(e) => handleFormChange('seatsAvailable', parseInt(e.target.value) || 0)}
                            placeholder="45"
                            className={formErrors.seatsAvailable ? "border-red-500" : ""}
                        />
                        {formErrors.seatsAvailable && (
                            <p className="text-sm text-red-500 mt-1">{formErrors.seatsAvailable}</p>
                        )}
                    </div>
                </div>

                <div>
                    <Label>Loại xe *</Label>
                    <div className="mt-2">
                        <Select value={selectedSubtypeId} onValueChange={(val) => {
                            setSelectedSubtypeId(val);
                            // find subtype by id to set formData.busType and seatsTotal
                            const subtypeSel = getAllSubtypes(loaixeData).find((s: any) => s.id === val);
                            if (subtypeSel) {
                                setSelectedLayout(subtypeSel.layout || null);
                                handleFormChange('busType', [subtypeSel.name]);
                                if (typeof subtypeSel.seat_capacity === 'number') {
                                    const cap = subtypeSel.seat_capacity;
                                    handleFormChange('seatsTotal', cap);
                                    // default: mark ~10% as already booked (so seatsAvailable < seatsTotal)
                                    const bookedDefault = Math.max(1, Math.floor(cap * 0.1));
                                    const avail = Math.max(0, cap - bookedDefault);
                                    handleFormChange('seatsAvailable', avail);
                                    // build seatMap and set booked seats
                                    const map = generateSeatMapWithBooked(subtypeSel.layout, bookedDefault);
                                    setSeatMap(map);
                                } else {
                                    handleFormChange('seatsTotal', 0);
                                    setSeatMap(null);
                                }
                            } else {
                                handleFormChange('busType', []);
                                setSelectedLayout(null);
                                setSeatMap(null);
                                handleFormChange('seatsTotal', 0);
                            }
                            setIsFormDirty(true);
                        }}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn loại xe (chọn 1 loại con)" />
                            </SelectTrigger>
                            <SelectContent>
                   {/*
                     Prefer categories from loaixeData when it contains subtypes.
                     Otherwise try a flat list from getAllSubtypes(loaixeData).
                     Only if both are empty do we fallback to busTypeOptions.
                   */}
                   {Array.isArray(loaixeData) && loaixeData.length > 0 && loaixeData.some((c: any) => Array.isArray(c.subtypes) && c.subtypes.length > 0) ? (
                       loaixeData.map((cat: any) => (
                           <div key={cat.id || cat.name}>
                               <div className="px-3 py-1 text-sm font-semibold text-gray-700">{cat.name}</div>
                               {Array.isArray(cat.subtypes) && cat.subtypes.map((s: any) => (
                                   <SelectItem key={s.id || s.name} value={s.id || s.name}>
                                       {s.name} {s.seat_capacity ? `- ${s.seat_capacity} chỗ` : ''}
                                   </SelectItem>
                               ))}
                           </div>
                       ))
                   ) : (() => {
                       const flat = getAllSubtypes(loaixeData);
                       if (flat && flat.length > 0) {
                           return flat.map((s: any) => (
                               <SelectItem key={s.id || s.name} value={s.id || s.name}>
                                   {s.name} {s.seat_capacity ? `- ${s.seat_capacity} chỗ` : ''}
                               </SelectItem>
                           ));
                       }
                       // final fallback: small static list
                       return busTypeOptions.map((option) => (
                           <SelectItem key={option.value} value={option.value}>
                               {option.label}
                           </SelectItem>
                       ));
                   })()}
                            </SelectContent>
                        </Select>
                        {formErrors.busType && (
                            <p className="text-sm text-red-500 mt-1">{formErrors.busType}</p>
                        )}
                        <p className="text-sm text-gray-500 mt-2">Chọn 1 loại con; Tổng số ghế sẽ được đặt từ seat_capacity (nếu có). Ghế có sẵn giữ nguyên.</p>
                    </div>
                </div>

                {/* --- Replace Textarea with amenities checkboxes --- */}
				<div>
					<Label>Tiện ích</Label>
					<div className="mt-2 space-y-2">
						{amenitiesOptions.map((opt) => {
							const checked = amenitiesSelected.includes(opt);
							return (
								<div key={opt} className="flex items-center space-x-2">
									<Checkbox
										id={opt}
										checked={checked}
										onCheckedChange={(c) => {
											setIsFormDirty(true);
											if (c) {
												setAmenitiesSelected(prev => [...prev, opt]);
											} else {
												setAmenitiesSelected(prev => prev.filter(a => a !== opt));
											}
											// clear errors if any
											if (formErrors['amenities']) {
												setFormErrors(prev => ({ ...prev, amenities: "" }));
											}
										}}
									/>
									<Label htmlFor={opt}>{opt}</Label>
								</div>
							);
						})}
					</div>
					<p className="text-sm text-gray-500 mt-2">Chọn các tiện ích có sẵn trên tuyến.</p>
				</div>

                <div>
                    <Label htmlFor="status">Trạng thái</Label>
                    <Select
                        value={formData.status}
                        onValueChange={(value) => handleFormChange('status', value)}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="scheduled">Đã lên lịch</SelectItem>
                            <SelectItem value="cancelled">Đã hủy</SelectItem>
                            <SelectItem value="delayed">Hoãn</SelectItem>
                            <SelectItem value="completed">Hoàn thành</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 space-y-6 bg-gray-50">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý vé xe</h1>
                    <p className="text-gray-600 mt-1">Quản lý tuyến xe, lịch trình và thông tin vé xe</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Button
                        variant="outline"
                        onClick={() => refetch()}
                        disabled={isLoading}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Làm mới
                    </Button>
                    <Button onClick={handleAdd} className="bg-primary hover:bg-primary-600">
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm tuyến xe
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Tổng tuyến xe</p>
                                <p className="text-2xl font-bold">{total || 0}</p>
                            </div>
                            <Bus className="w-8 h-8 text-primary" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Đang hoạt động</p>
                                <p className="text-2xl font-bold">{buses.filter((b: BusRoute) => b.status === "scheduled").length}</p>
                            </div>
                            <Eye className="w-8 h-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Sắp hết chỗ</p>
                                <p className="text-2xl font-bold">
                                    {buses.filter((b: BusRoute) => b.seatsAvailable <= b.seatsTotal * 0.2).length}
                                </p>
                            </div>
                            <Users className="w-8 h-8 text-orange-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Doanh thu TB</p>
                                <p className="text-2xl font-bold">1.8M</p>
                            </div>
                            <DollarSign className="w-8 h-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Danh sách tuyến xe</CardTitle>
                            <CardDescription>Quản lý thông tin và lịch trình tuyến xe</CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Select value={filters.operator} onValueChange={(value) => setFilters(prev => ({ ...prev, operator: value }))}>
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả nhà xe</SelectItem>
                                    {mockOperators.map((operator) => (
                                        <SelectItem key={operator.id} value={operator.id}>
                                            {operator.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                                <SelectTrigger className="w-36">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                    <SelectItem value="scheduled">Đã lên lịch</SelectItem>
                                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                                    <SelectItem value="delayed">Hoãn</SelectItem>
                                    <SelectItem value="completed">Hoàn thành</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={buses}
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: total,
                        }}
                        onPaginationChange={(page, pageSize) =>
                            setPagination({ current: page, pageSize })
                        }
                        onSearch={setSearchQuery}
                        rowSelection={{
                            selectedRowKeys: selectedBuses,
                            onChange: setSelectedBuses,
                        }}
                        bulkActions={bulkActions}
                        actions={actions}
                        exportable
                        onExport={() => toast({ title: "Đang xuất file...", description: "File sẽ được tải xuống sau vài giây" })}
                        loading={isLoading}
                    />
                </CardContent>
            </Card>

            <ModalForm
                open={modalOpen}
                onOpenChange={handleModalClose}
                title={
                    modalMode === "create" ? "Thêm tuyến xe mới" :
                        modalMode === "edit" ? "Chỉnh sửa tuyến xe" :
                            "Chi tiết tuyến xe"
                }
                description={
                    modalMode === "create" ? "Tạo tuyến xe mới trong hệ thống" :
                        modalMode === "edit" ? "Cập nhật thông tin tuyến xe" :
                            "Xem thông tin chi tiết tuyến xe"
                }
                mode={modalMode}
                size="medium"
                onSubmit={handleSubmit}
                submitDisabled={isSubmitDisabled()}
                submitText={modalMode === "create" ? "Thêm tuyến xe" : "Cập nhật"}
                cancelText="Hủy"
            >
                {renderBusForm()}
            </ModalForm>

            <ConfirmModal
                open={deleteModalOpen}
                onOpenChange={setDeleteModalOpen}
                title="Xóa tuyến xe"
                message={`Bạn có chắc chắn muốn xóa tuyến xe "${busToDelete?.busCode}"?${busToDelete && (busToDelete.seatsTotal - busToDelete.seatsAvailable) > 0 ? ' Tuyến xe này có đặt chỗ.' : ''}`}
                type="danger"
                requireTyping={true}
                // typingText={busToDelete && (busToDelete.seatsTotal - busToDelete.seatsAvailable) > 0 ? "FORCE_DELETE" : "DELETE"}
                typingText={busToDelete   ? "FORCE_DELETE" : "DELETE"}

                onConfirm={confirmDelete}
                confirmText="Xóa tuyến xe"
                loading={deleteBusMutation.isPending}
            />
        </div>
    );
}