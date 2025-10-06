"use client"
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Newspaper, Plus, Edit, Eye, Trash2, RefreshCw, Calendar, Tag as TagIcon, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import { Switch } from "../../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { DataTable, Column } from "../../components/DataTable";
import { ModalForm } from "../../components/ModalForm";
import { ConfirmModal } from "../../components/ConfirmModal";
import { useToast } from "../../components/ui/use-toast";
import JoditEditorWrapper from "../../components/JoditEditorWrapper";
interface NewsArticle {
    id: string;
    title: string;
    slug: string;
    category: string;
    status: "draft" | "scheduled" | "published" | "archived" | "unpublished";
    author: {
        id: string;
        name: string;
        avatar: string;
    };
    summary: string;
    content: string;
    featured: boolean;
    heroImage?: string;
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
    views: number;
}

interface NewsFormData {
    title: string;
    slug: string;
    category: string;
    status: "published" | "unpublished";
    summary: string;
    content: string;
    // tags removed
    featured: boolean;
    heroImage: string;
    // removed publishedAt (no scheduling)
}

interface NewsFilters {
    status: string;
    category: string;
}

const categoryOptions = [
    { value: "company", label: "Tin công ty" },
    { value: "promotion", label: "Ưu đãi & khuyến mãi" },
    { value: "travel", label: "Cẩm nang du lịch" },
    { value: "policy", label: "Chính sách" },
];

const statusOptions = [
    { value: "published", label: "Xuất bản" },
    { value: "unpublished", label: "Ngưng xuất bản" },
];

export default function News() {
    const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState<NewsFilters>({ status: "all", category: "all" });
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
    const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [articleToDelete, setArticleToDelete] = useState<NewsArticle | null>(null);
    const [formData, setFormData] = useState<NewsFormData>({
        title: "",
        slug: "",
        category: "company",
        status: "unpublished",
        summary: "",
        content: "",
        // tags removed
        featured: false,
        heroImage: "",
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isFormDirty, setIsFormDirty] = useState(false);

    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const BACKEND_AVAILABLE = false;

    // local store used while BE not ready (or for optimistic updates)
    const [articlesState, setArticlesState] = useState<NewsArticle[]>([]);
    const [totalState, setTotalState] = useState<number>(0);
    // stubbed fetch/query
    const { data: newsData, isLoading, error, refetch } = (() => {
        if (BACKEND_AVAILABLE) {
            return useQuery({
                queryKey: ["news", pagination.current, pagination.pageSize, searchQuery, filters],
                queryFn: async () => {
                    const params = new URLSearchParams({
                        page: pagination.current.toString(),
                        limit: pagination.pageSize.toString(),
                        ...(searchQuery && { q: searchQuery }),
                        ...(filters.status !== "all" && { status: filters.status }),
                        ...(filters.category !== "all" && { category: filters.category }),
                    });
                    const response = await fetch(`/api/admin/news?${params}`);
                    if (!response.ok) throw new Error("Failed to fetch news");
                    return response.json();
                },
            });
        } else {
            // no network; return local-shaped object
            return {
                data: { data: articlesState, pagination: { total: totalState } },
                isLoading: false,
                error: null,
                refetch: async () => {
                    toast({ title: "Chạy local mode", description: "Dữ liệu thao tác chỉ trên frontend", variant: "default" });
                    return { data: articlesState, pagination: { total: totalState } };
                },
            };
        }
    })();
    // helpers to mutate local state (used by stubbed mutations)
    const makeLocalArticle = (data: NewsFormData): NewsArticle => {
        const now = new Date().toISOString();
        const id = `local_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        return {
            id,
            title: data.title,
            slug: data.slug,
            category: data.category,
            status: data.status === "published" ? "published" : "unpublished",
            author: { id: "local_admin", name: "Admin (local)", avatar: "" },
            summary: data.summary,
            content: data.content,
            // tags removed
            featured: data.featured,
            heroImage: data.heroImage || undefined,
            publishedAt: data.status === "published" ? now : undefined,
            createdAt: now,
            updatedAt: now,
            views: 0,
        };
    };
    const createNewsMutation = {
        mutate: (data: NewsFormData) => {
            const newArticle = makeLocalArticle(data);
            setArticlesState(prev => [newArticle, ...prev]);
            setTotalState(prev => prev + 1);
            setModalOpen(false);
            resetForm();
            toast({ title: "Đã tạo (local)", description: "Bài viết được lưu tạm trên frontend" });

            if (BACKEND_AVAILABLE) {
                // actual network create (kept here for when BE ready)
                (async () => {
                    try {
                        const payload = { ...data }; // tags removed
                        const res = await fetch("/api/admin/news", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payload),
                        });
                        if (!res.ok) throw new Error("Failed to create article");
                        queryClient.invalidateQueries({ queryKey: ["news"] });
                    } catch (err: any) {
                        toast({ title: "Lỗi tạo trên server", description: err.message, variant: "destructive" });
                    }
                })();
            }
        },
        isPending: false,
    };

    const updateNewsMutation = {
        mutate: ({ id, data }: { id: string; data: NewsFormData }) => {
            setArticlesState(prev => prev.map(a => a.id === id ? {
                ...a,
                title: data.title,
                slug: data.slug,
                category: data.category,
                status: data.status === "published" ? "published" : "unpublished",
                summary: data.summary,
                content: data.content,
                // tags removed
                featured: data.featured,
                heroImage: data.heroImage || undefined,
                updatedAt: new Date().toISOString(),
            } : a));
            toast({ title: "Cập nhật (local)", description: "Thay đổi đã áp dụng trên frontend" });
            setModalOpen(false);
            resetForm();

            if (BACKEND_AVAILABLE) {
                (async () => {
                    try {
                        const payload = { ...data }; // tags removed
                        const res = await fetch(`/api/admin/news/${id}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payload),
                        });
                        if (!res.ok) throw new Error("Failed to update article");
                        queryClient.invalidateQueries({ queryKey: ["news"] });
                    } catch (err: any) {
                        toast({ title: "Lỗi cập nhật trên server", description: err.message, variant: "destructive" });
                    }
                })();
            }
        },
        isPending: false,
    };


    const deleteNewsMutation = {
        mutate: (id: string) => {
            const target = articlesState.find(a => a.id === id);
            setArticlesState(prev => prev.filter(a => a.id !== id));
            setTotalState(prev => Math.max(0, prev - 1));
            setDeleteModalOpen(false);
            setArticleToDelete(null);
            toast({ title: "Xóa (local)", description: `Đã xóa "${target?.title}" trên frontend` });

            if (BACKEND_AVAILABLE) {
                (async () => {
                    try {
                        const res = await fetch(`/api/admin/news/${id}`, { method: "DELETE" });
                        if (!res.ok) throw new Error("Failed to delete article");
                        queryClient.invalidateQueries({ queryKey: ["news"] });
                    } catch (err: any) {
                        toast({ title: "Lỗi xóa trên server", description: err.message, variant: "destructive" });
                    }
                })();
            }
        },
        isPending: false,
    };

    const bulkActionMutation = {
        mutate: ({ action, ids }: { action: string; ids: string[] }) => {
            setArticlesState(prev => {
                if (action === "delete") {
                    setTotalState(prev.length - ids.length);
                    return prev.filter(a => !ids.includes(a.id));
                } else if (action === "publish") {
                    return prev.map(a => ids.includes(a.id) ? { ...a, status: "published", publishedAt: new Date().toISOString() } : a);
                } else if (action === "archive") {
                    return prev.map(a => ids.includes(a.id) ? { ...a, status: "archived" as any } : a);
                }
                return prev;
            });
            toast({ title: `Thao tác ${action} (local)`, description: "Đã áp dụng trên frontend" });

            if (BACKEND_AVAILABLE) {
                (async () => {
                    try {
                        const res = await fetch("/api/admin/news/bulk", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ action, ids }),
                        });
                        if (!res.ok) throw new Error("Failed to perform bulk action");
                        queryClient.invalidateQueries({ queryKey: ["news"] });
                    } catch (err: any) {
                        toast({ title: "Lỗi thao tác hàng loạt trên server", description: err.message, variant: "destructive" });
                    }
                })();
            }
        },
        isPending: false,
    };

    // use UI data from local state when BE not available
    const articles: NewsArticle[] = (newsData?.data && BACKEND_AVAILABLE) ? newsData.data : articlesState;
    const total = (newsData?.pagination?.total && BACKEND_AVAILABLE) ? newsData.pagination.total : totalState;

    const validateForm = (data: NewsFormData) => {
        const errors: Record<string, string> = {};
        if (!data.title.trim()) errors.title = "Bạn phải nhập tiêu đề";
        if (!data.slug.trim()) errors.slug = "Bạn phải nhập đường dẫn";
        if (!/^[-a-z0-9]+$/.test(data.slug)) errors.slug = "Slug chỉ gồm chữ thường, số, dấu gạch ngang";
        if (!data.summary.trim()) errors.summary = "Bạn phải nhập tóm tắt";
        if (data.summary.length > 240) errors.summary = "Tóm tắt không quá 240 ký tự";
        if (!data.content.trim()) errors.content = "Bạn phải nhập nội dung";
        // no scheduling/publishedAt validation
        return errors;
    };

    const resetForm = () => {
        setFormData({
            title: "",
            slug: "",
            category: "company",
            status: "unpublished",
            summary: "",
            content: "",
            tags: "",
            featured: false,
            heroImage: "",

        });
        setFormErrors({});
        setIsFormDirty(false);
    };

    const handleFormChange = (field: keyof NewsFormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setIsFormDirty(true);
        if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: "" }));
    };

    // const autoGenerateSlug = () => {
    //     if (!formData.title.trim()) return;
    //     const slug = formData.title
    //         .toLowerCase()
    //         .normalize("NFD")
    //         .replace(/[^a-z0-9\s-]/g, "")
    //         .replace(/\s+/g, "-")
    //         .replace(/-+/g, "-")
    //         .trim();
    //     handleFormChange("slug", slug);
    // };
    const generateSlugFromTitle = (title: string) =>
        title
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // remove diacritics
            .replace(/đ/g, "d") // convert Vietnamese đ -> d
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .trim();

    const autoGenerateSlug = () => {
        if (!formData.title.trim()) return;
        handleFormChange("slug", generateSlugFromTitle(formData.title));
    };

    const handleView = (article: NewsArticle) => {
        setSelectedArticle(article);
        setModalMode("view");
        setModalOpen(true);
    };

    const handleEdit = (article: NewsArticle) => {
        setSelectedArticle(article);
        setFormData({
            title: article.title,
            slug: article.slug,
            category: article.category,
            status: article.status === "published" ? "published" : "unpublished",
            summary: article.summary,
            content: article.content,
            // tags removed
            featured: article.featured,
            heroImage: article.heroImage || "",
        });
        setModalMode("edit");
        setModalOpen(true);
        setIsFormDirty(false);
    };

    const handleDelete = (article: NewsArticle) => {
        setArticleToDelete(article);
        setDeleteModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedArticle(null);
        resetForm();
        setModalMode("create");
        setModalOpen(true);
    };

    const handleSubmit = () => {
        const errors = validateForm(formData);
        setFormErrors(errors);
        if (Object.keys(errors).length > 0) {
            toast({ title: "Lỗi nhập liệu", description: "Vui lòng kiểm tra lại thông tin", variant: "destructive" });
            return;
        }

        if (modalMode === "create") {
            createNewsMutation.mutate(formData);
        } else if (modalMode === "edit" && selectedArticle) {
            updateNewsMutation.mutate({ id: selectedArticle.id, data: formData });
        }
    };

    const isSubmitDisabled = () => {
        if (modalMode === "view") return true;
        if (!isFormDirty) return true;
        return createNewsMutation.isPending || updateNewsMutation.isPending;
    };

    const bulkActions = [
        {
            label: "Xuất bản",
            action: (keys: string[]) => bulkActionMutation.mutate({ action: "publish", ids: keys }),
            icon: <CheckCircle2 className="w-4 h-4 mr-2" />,
        },
        {
            label: "Lưu trữ",
            action: (keys: string[]) => bulkActionMutation.mutate({ action: "archive", ids: keys }),
            icon: <ArchiveIcon className="w-4 h-4 mr-2" />,
            variant: "secondary" as const,
        },
        {
            label: "Xóa",
            action: (keys: string[]) => bulkActionMutation.mutate({ action: "delete", ids: keys }),
            icon: <Trash2 className="w-4 h-4 mr-2" />,
            variant: "destructive" as const,
        },
    ];

    const actions = [
        { label: "Xem chi tiết", action: handleView, icon: <Eye className="mr-2 h-4 w-4" /> },
        { label: "Chỉnh sửa", action: handleEdit, icon: <Edit className="mr-2 h-4 w-4" /> },
        { label: "Xóa", action: handleDelete, icon: <Trash2 className="mr-2 h-4 w-4" />, variant: "destructive" as const },
    ];

    const statusBadge = (status: NewsArticle["status"]) => {
        switch (status) {
            case "published":
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Đã xuất bản</Badge>;
            case "scheduled":
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Đã lên lịch</Badge>;
            case "archived":
                return <Badge className="bg-gray-200 text-gray-700 hover:bg-gray-200">Lưu trữ</Badge>;
            default:
                return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Bản nháp</Badge>;
        }
    };

    const columns: Column[] = [
        {
            key: "title",
            title: "Tiêu đề",
            sortable: true,
            render: (value, record: NewsArticle) => (
                <div>
                    <p className="font-medium text-gray-900 line-clamp-1">{value}</p>
                    <p className="text-xs text-gray-500">/{record.slug}</p>
                </div>
            ),
        },
        {
            key: "category",
            title: "Danh mục",
            render: (value: string) => {
                const option = categoryOptions.find((opt) => opt.value === value);
                return (
                    <div className="flex items-center space-x-2 text-sm">
                        <TagIcon className="w-3 h-3 text-gray-400" />
                        <span>{option ? option.label : value}</span>
                    </div>
                );
            },
        },
        {
            key: "status",
            title: "Trạng thái",
            render: (_, record: NewsArticle) => (
                <div className="space-y-1 text-sm">
                    {statusBadge(record.status)}
                    {record.status === "scheduled" && record.publishedAt && (
                        <div className="flex items-center text-xs text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(record.publishedAt).toLocaleString("vi-VN")}
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: "author",
            title: "Tác giả",
            render: (_, record: NewsArticle) => (
                <div className="text-sm">
                    <p className="font-medium">{record.author.name}</p>
                    <p className="text-xs text-gray-500">Cập nhật {new Date(record.updatedAt).toLocaleDateString("vi-VN")}</p>
                </div>
            ),
        },
        // {
        //     key: "tags",
        //     title: "Thẻ",
        //     render: (value: string[]) => (
        //         <div className="flex flex-wrap gap-1 max-w-[200px]">
        //             {value.slice(0, 3).map((tag) => (
        //                 <Badge key={tag} variant="outline" className="text-xs">#{tag}</Badge>
        //             ))}
        //             {value.length > 3 && (
        //                 <Badge variant="secondary" className="text-xs">+{value.length - 3}</Badge>
        //             )}
        //         </div>
        //     ),
        // },
        {
            key: "publishedAt",
            title: "Xuất bản",
            render: (value: string | undefined, record: NewsArticle) => (
                <div className="text-sm">
                    {value ? (
                        <div className="flex items-center text-gray-700">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(value).toLocaleDateString("vi-VN")}
                        </div>
                    ) : (
                        <span className="text-gray-400">Chưa xuất bản</span>
                    )}
                    <p className="text-xs text-gray-500">{record.views.toLocaleString()} lượt xem</p>
                </div>
            ),
        },
    ];

    const renderArticleView = () => {
        if (!selectedArticle) return null;
        return (
            <div className="space-y-6">
                <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-gray-900">{selectedArticle.title}</h2>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                        {statusBadge(selectedArticle.status)}
                        <span>Danh mục: {categoryOptions.find((opt) => opt.value === selectedArticle.category)?.label || selectedArticle.category}</span>
                        <span>Tác giả: {selectedArticle.author.name}</span>
                        {selectedArticle.publishedAt && <span>Xuất bản: {new Date(selectedArticle.publishedAt).toLocaleString("vi-VN")}</span>}
                    </div>
                </div>
                <div>
                    <Label className="text-sm font-medium text-gray-700">Tóm tắt</Label>
                    <p className="mt-2 text-gray-800 leading-relaxed">{selectedArticle.summary}</p>
                </div>
                <div>
                    <Label className="text-sm font-medium text-gray-700">Nội dung</Label>
                    <div
                        className="mt-2 whitespace-pre-wrap text-gray-800 leading-relaxed max-h-80 overflow-auto border border-gray-100 rounded-lg p-4 bg-gray-50"
                        dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {selectedArticle.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">#{tag}</Badge>
                    ))}
                </div>
            </div>
        );
    };

    const renderArticleForm = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                    <Label htmlFor="title">Tiêu đề *</Label>
                    <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => {
                            const v = e.target.value;
                            // update title and auto-generate slug immediately
                            handleFormChange("title", v);
                            handleFormChange("slug", generateSlugFromTitle(v));
                        }}
                        placeholder="Tour hè 2024: Top điểm đến hút khách"
                        className={formErrors.title ? "border-red-500" : ""}
                    />
                    {formErrors.title && <p className="text-sm text-red-500 mt-1">{formErrors.title}</p>}
                </div>
                <div>
                    <Label htmlFor="slug">Đường dẫn *</Label>
                    <div className="flex gap-2">
                        <Input
                            id="slug"
                            value={formData.slug}
                            onChange={(e) => handleFormChange("slug", e.target.value)}
                            placeholder="tour-he-2024"
                            className={formErrors.slug ? "border-red-500" : ""}
                        />
                        <Button type="button" variant="outline" onClick={autoGenerateSlug}>
                            Tạo tự động
                        </Button>
                    </div>
                    {formErrors.slug && <p className="text-sm text-red-500 mt-1">{formErrors.slug}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <Label>Danh mục *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleFormChange("category", value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Chọn danh mục" />
                        </SelectTrigger>
                        <SelectContent>
                            {categoryOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Trạng thái *</Label>
                    <Select value={formData.status} onValueChange={(value) => handleFormChange("status", value as NewsFormData["status"])}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {statusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-3 border rounded-lg p-3">
                    <Switch
                        id="featured"
                        checked={formData.featured}
                        onCheckedChange={(checked) => handleFormChange("featured", checked)}
                    />
                    <div>
                        <Label htmlFor="featured">Đánh dấu nổi bật</Label>
                        <p className="text-sm text-gray-500">Hiển thị ở vị trí ưu tiên trên trang chủ</p>
                    </div>
                </div>
            </div>



            <div>
                <Label htmlFor="heroImage">Ảnh đại diện</Label>
                <Input
                    id="heroImage"
                    value={formData.heroImage}
                    onChange={(e) => handleFormChange("heroImage", e.target.value)}
                    placeholder="https://cdn.yoursite.com/uploads/hero-image.jpg"
                />
            </div>

            <div>
                <Label htmlFor="summary">Tóm tắt *</Label>
                <Textarea
                    id="summary"
                    value={formData.summary}
                    onChange={(e) => handleFormChange("summary", e.target.value)}
                    rows={3}
                    className={formErrors.summary ? "border-red-500" : ""}
                    maxLength={240}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{formErrors.summary ? formErrors.summary : ""}</span>
                    <span>{formData.summary.length}/240</span>
                </div>
            </div>

            {/* tags input removed */}


            <div>
                <Label htmlFor="content">Nội dung *</Label>
                <JoditEditorWrapper
                    value={formData.content}
                    onChange={(v) => handleFormChange("content", v)}
                    placeholder="Nội dung bài viết"
                />
                {formErrors.content && <p className="text-sm text-red-500 mt-1">{formErrors.content}</p>}
            </div>
        </div>
    );

    const bulkStats = {
        total: total,
        published: articles.filter((item) => item.status === "published").length,
        drafts: articles.filter((item) => item.status === "draft").length,
        scheduled: articles.filter((item) => item.status === "scheduled").length,
    };


    return (
        <div className="p-6 space-y-6 bg-gray-50">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý tin tức</h1>
                    <p className="text-gray-600 mt-1">Quản lý bài viết, công bố tin tức và nội dung truyền thông</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                        Làm mới
                    </Button>
                    <Button onClick={handleAdd} className="bg-primary hover:bg-primary-600">
                        <Plus className="w-4 h-4 mr-2" />
                        Đăng tin mới
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Tổng bài viết</p>
                                <p className="text-2xl font-bold">{bulkStats.total}</p>
                            </div>
                            <Newspaper className="w-8 h-8 text-primary" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Đã xuất bản</p>
                                <p className="text-2xl font-bold text-green-600">{bulkStats.published}</p>
                            </div>
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Đang lên lịch</p>
                                <p className="text-2xl font-bold text-blue-600">{bulkStats.scheduled}</p>
                            </div>
                            <Clock className="w-8 h-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Bản nháp</p>
                                <p className="text-2xl font-bold text-yellow-600">{bulkStats.drafts}</p>
                            </div>
                            <AlertCircle className="w-8 h-8 text-yellow-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Danh sách bài viết</CardTitle>
                            <CardDescription>Theo dõi trạng thái, tác giả và lịch xuất bản</CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Select value={filters.category} onValueChange={(value) => setFilters((prev) => ({ ...prev, category: value }))}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Danh mục" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả danh mục</SelectItem>
                                    {categoryOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={filters.status} onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}>
                                <SelectTrigger className="w-44">
                                    <SelectValue placeholder="Trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                    {statusOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={articles}
                        pagination={{ current: pagination.current, pageSize: pagination.pageSize, total }}
                        onPaginationChange={(page, pageSize) => setPagination({ current: page, pageSize })}
                        onSearch={setSearchQuery}
                        rowSelection={{ selectedRowKeys: selectedArticles, onChange: setSelectedArticles }}
                        bulkActions={bulkActions}
                        actions={actions}
                        exportable
                        onExport={() => toast({ title: "Đang xuất dữ liệu", description: "File sẽ tải xuống trong giây lát" })}
                        loading={isLoading}
                    />
                </CardContent>
            </Card>

            <ModalForm
                open={modalOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        if (isFormDirty && modalMode !== "view") {
                            if (confirm("Bạn có muốn hủy bỏ các thay đổi?")) {
                                setModalOpen(false);
                                resetForm();
                            }
                        } else {
                            setModalOpen(false);
                            resetForm();
                        }
                    } else {
                        setModalOpen(true);
                    }
                }}
                title={modalMode === "create" ? "Đăng tin mới" : modalMode === "edit" ? "Chỉnh sửa bài viết" : "Chi tiết bài viết"}
                description={modalMode === "create" ? "Tạo bài viết mới và xuất bản trên hệ thống" : modalMode === "edit" ? "Cập nhật nội dung bài viết hiện có" : "Xem thông tin chi tiết bài viết"}
                mode={modalMode}
                size="large"
                onSubmit={handleSubmit}
                submitDisabled={isSubmitDisabled()}
                submitText={modalMode === "create" ? "Đăng tin" : "Cập nhật"}
                cancelText="Đóng"
            >
                <div className="max-h-[60vh] overflow-y-auto pr-2">

                    {modalMode === "view" ? renderArticleView() : renderArticleForm()}
                </div>
            </ModalForm>

            <ConfirmModal
                open={deleteModalOpen}
                onOpenChange={setDeleteModalOpen}
                title="Xóa bài viết"
                message={`Bạn có chắc chắn muốn xóa bài viết "${articleToDelete?.title}"?`}
                type="danger"
                onConfirm={() => articleToDelete && deleteNewsMutation.mutate(articleToDelete.id)}
                confirmText="Xóa bài viết"
                loading={deleteNewsMutation.isPending}
            />
        </div>
    );
}

function ArchiveIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect x="3" y="4" width="18" height="4" rx="1" />
            <path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
            <path d="M10 12h4" />
        </svg>
    );
}
