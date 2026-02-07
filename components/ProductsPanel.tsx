"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  RefreshCw,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Star,
  StarOff,
  X,
  Upload,
  Package,
  Calendar,
  Sparkles,
  Layers,
} from "lucide-react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductAvailability,
  toggleProductFeatured,
} from "@/lib/products";
import { formatPrice, cn } from "@/lib/utils";
import type { Product, ProductCategory, DayOfWeek, ProductVariant } from "@/types";

const categoryLabels: Record<ProductCategory, string> = {
  bread: "Bread",
  pastry: "Pastries",
  cookie: "Cookies",
  other: "Other",
  seasonal: "Seasonal",
};

const allergenLabels: Record<string, string> = {
  gluten: "Gluten",
  dairy: "Dairy",
  eggs: "Eggs",
  almonds: "Almonds",
  oats: "Oats",
  coconut: "Coconut",
};

const allDays: DayOfWeek[] = [
  "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
];

const dayLabels: Record<DayOfWeek, string> = {
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

const emptyVariant: ProductVariant = {
  id: "",
  name: "",
  nameSv: "",
  priceDiff: 0,
  available: true,
};

const emptyProduct: Omit<Product, "id"> = {
  name: "",
  nameSv: "",
  description: "",
  descriptionSv: "",
  price: 0,
  category: "bread",
  image: "",
  available: true,
  featured: false,
  allergens: [],
  weight: "",
  availableDays: [],
  specialType: null,
  minOrder: 1,
  hasVariants: false,
  variantLabel: "",
  variantLabelSv: "",
  variants: [],
};

export default function ProductsPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | "all">("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Omit<Product, "id">>(emptyProduct);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError("Could not fetch products");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        nameSv: product.nameSv,
        description: product.description,
        descriptionSv: product.descriptionSv,
        price: product.price,
        category: product.category,
        image: product.image,
        available: product.available,
        featured: product.featured || false,
        allergens: product.allergens || [],
        weight: product.weight || "",
        availableDays: product.availableDays || [],
        specialType: product.specialType || null,
        minOrder: product.minOrder || 1,
        hasVariants: product.hasVariants || false,
        variantLabel: product.variantLabel || "",
        variantLabelSv: product.variantLabelSv || "",
        variants: product.variants || [],
      });
      setImagePreview(product.image);
    } else {
      setEditingProduct(null);
      setFormData(emptyProduct);
      setImagePreview("");
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData(emptyProduct);
    setImageFile(null);
    setImagePreview("");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData, imageFile || undefined);
      } else {
        await createProduct(formData, imageFile || undefined);
      }
      await fetchProducts();
      handleCloseModal();
    } catch (err) {
      setError("Could not save product");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) return;

    try {
      await deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  };

  const handleToggleAvailability = async (productId: string, currentValue: boolean) => {
    try {
      await toggleProductAvailability(productId, !currentValue);
      setProducts((prev) =>
        prev.map((p) => p.id === productId ? { ...p, available: !currentValue } : p)
      );
    } catch (err) {
      console.error("Failed to toggle availability:", err);
    }
  };

  const handleToggleFeatured = async (productId: string, currentValue: boolean) => {
    try {
      await toggleProductFeatured(productId, !currentValue);
      setProducts((prev) =>
        prev.map((p) => p.id === productId ? { ...p, featured: !currentValue } : p)
      );
    } catch (err) {
      console.error("Failed to toggle featured:", err);
    }
  };

  const handleAllergenChange = (allergen: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      allergens: checked
        ? [...(prev.allergens || []), allergen]
        : (prev.allergens || []).filter((a) => a !== allergen),
    }));
  };

  const handleDayChange = (day: DayOfWeek, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      availableDays: checked
        ? [...(prev.availableDays || []), day]
        : (prev.availableDays || []).filter((d) => d !== day),
    }));
  };

  // ✅ Variant handlers
  const handleAddVariant = () => {
    const newVariant: ProductVariant = {
      ...emptyVariant,
      id: `variant-${Date.now()}`,
    };
    setFormData((prev) => ({
      ...prev,
      variants: [...(prev.variants || []), newVariant],
    }));
  };

  const handleUpdateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants?.map((v, i) =>
        i === index ? { ...v, [field]: value } : v
      ),
    }));
  };

  const handleRemoveVariant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants?.filter((_, i) => i !== index),
    }));
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.nameSv.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const formatAvailableDays = (days?: DayOfWeek[]): string => {
    if (!days || days.length === 0 || days.length === 7) return "All days";
    return days.map(d => dayLabels[d]).join(", ");
  };

  return (
    <div className="max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-crust-900">Products</h2>
            <button
              onClick={fetchProducts}
              className="p-2 text-crust-500 hover:text-crust-900 hover:bg-flour-200 rounded-md transition-colors"
              title="Refresh"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </button>
          </div>

          <button onClick={() => handleOpenModal()} className="btn-primary w-full sm:w-auto justify-center">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </button>
        </div>

        {/* Search & Filter Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-crust-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="pl-10 pr-4 py-2 w-full border border-flour-300 rounded-md text-sm focus:outline-none focus:border-crust-400"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as ProductCategory | "all")}
            className="px-3 py-2 border border-flour-300 rounded-md text-sm focus:outline-none focus:border-crust-400"
          >
            <option value="all">All categories</option>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-12 text-crust-500">
          Loading products...
        </div>
      )}

      {!loading && filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-flour-400 mx-auto mb-3" />
          <p className="text-crust-500 mb-4">No products found</p>
          <button onClick={() => handleOpenModal()} className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add first product
          </button>
        </div>
      )}

      {/* Products Grid */}
      {!loading && filteredProducts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={cn(
                "border rounded-lg overflow-hidden bg-white transition-all",
                !product.available && "opacity-60"
              )}
            >
              <div className="aspect-video bg-flour-200 relative">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    🥖
                  </div>
                )}

                <div className="absolute top-2 left-2 flex gap-1 flex-wrap max-w-[80%]">
                  {!product.available && (
                    <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">Hidden</span>
                  )}
                  {product.featured && (
                    <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs rounded-full">Featured</span>
                  )}
                  {product.specialType === "week" && (
                    <span className="px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full">Weekly</span>
                  )}
                  {product.specialType === "day" && (
                    <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">Daily</span>
                  )}
                  {/* ✅ Variants badge */}
                  {product.hasVariants && product.variants && product.variants.length > 0 && (
                    <span className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">
                      {product.variants.length} variants
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <h3 className="font-medium text-crust-900 truncate">{product.nameSv || product.name}</h3>
                    <p className="text-xs text-crust-500">{categoryLabels[product.category]}</p>
                  </div>
                  <p className="font-semibold text-crust-900 flex-shrink-0">
                    {product.hasVariants && "from "}
                    {formatPrice(product.price)}
                  </p>
                </div>

                {/* ✅ Variants preview */}
                {product.hasVariants && product.variants && product.variants.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {product.variants.map((variant) => (
                      <span
                        key={variant.id}
                        className={cn(
                          "text-xs px-1.5 py-0.5 rounded",
                          variant.available
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-400 line-through"
                        )}
                      >
                        {variant.nameSv || variant.name}
                        {variant.priceDiff !== 0 && (
                          <span className="ml-1">
                            ({variant.priceDiff! > 0 ? "+" : ""}{variant.priceDiff} kr)
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-1 text-xs text-crust-500 mb-2 flex-wrap">
                  <Calendar className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{formatAvailableDays(product.availableDays)}</span>
                </div>

                {product.availableDays && product.availableDays.length > 0 && product.availableDays.length < 7 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {allDays.map((day) => {
                      const isAvailable = product.availableDays?.includes(day);
                      return (
                        <span
                          key={day}
                          className={cn(
                            "text-xs px-1.5 py-0.5 rounded",
                            isAvailable
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-400 line-through"
                          )}
                        >
                          {dayLabels[day]}
                        </span>
                      );
                    })}
                  </div>
                )}

                <p className="text-sm text-crust-600 line-clamp-2 mb-3">
                  {product.descriptionSv || product.description}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-flour-200">
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleToggleAvailability(product.id, product.available)}
                      className={cn(
                        "p-2 rounded-md transition-colors",
                        product.available
                          ? "text-green-600 hover:bg-green-50"
                          : "text-crust-400 hover:bg-flour-100"
                      )}
                      title={product.available ? "Hide product" : "Show product"}
                    >
                      {product.available ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleToggleFeatured(product.id, product.featured || false)}
                      className={cn(
                        "p-2 rounded-md transition-colors",
                        product.featured
                          ? "text-yellow-500 hover:bg-yellow-50"
                          : "text-crust-400 hover:bg-flour-100"
                      )}
                      title={product.featured ? "Remove from home" : "Show on home"}
                    >
                      {product.featured ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => handleOpenModal(product)}
                      className="p-2 text-crust-500 hover:text-crust-900 hover:bg-flour-100 rounded-md transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      className="p-2 text-crust-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-flour-200 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-crust-900">
                {editingProduct ? "Edit Product" : "Add Product"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 text-crust-500 hover:text-crust-900 hover:bg-flour-100 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-crust-700 mb-2">
                  Product Image
                </label>
                <div className="flex items-start gap-4">
                  <div
                    className="w-28 h-28 bg-flour-200 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer hover:bg-flour-300 transition-colors border-2 border-dashed border-flour-400 flex-shrink-0"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-crust-400 mx-auto" />
                        <span className="text-xs text-crust-500">Upload</span>
                      </div>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  <div className="text-sm text-crust-500">
                    <p>Click to upload</p>
                    <p className="text-xs">PNG, JPG, max 5MB</p>
                    {editingProduct && imagePreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview("");
                          setImageFile(null);
                          setFormData({ ...formData, image: "" });
                        }}
                        className="text-red-600 text-xs mt-2 hover:underline"
                      >
                        Remove image
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-crust-700 mb-1">Name (Swedish) *</label>
                  <input
                    type="text"
                    value={formData.nameSv}
                    onChange={(e) => setFormData({ ...formData, nameSv: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-crust-700 mb-1">Name (English)</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div>
                <label className="block text-sm font-medium text-crust-700 mb-1">Description (Swedish) *</label>
                <textarea
                  value={formData.descriptionSv}
                  onChange={(e) => setFormData({ ...formData, descriptionSv: e.target.value })}
                  className="input-field"
                  rows={2}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-crust-700 mb-1">Description (English)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows={2}
                />
              </div>

              {/* Price, Category, Weight */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-crust-700 mb-1">Price (SEK) *</label>
                  <input
                    type="number"
                    value={formData.price.toString()}
                    onChange={(e) => setFormData({ ...formData, price: Number(parseInt(e.target.value)) })}
                    className="input-field"
                    min={0}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-crust-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                    className="input-field"
                    required
                  >
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-crust-700 mb-1">Weight</label>
                  <input
                    type="text"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="input-field"
                    placeholder="e.g. 500g"
                  />
                </div>
              </div>

              {/* ✅ VARIANTS SECTION */}
              <div className="border-t border-flour-200 pt-4">
                <label className="flex items-center gap-2 mb-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasVariants || false}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      hasVariants: e.target.checked,
                      variants: e.target.checked ? (formData.variants || []) : []
                    })}
                    className="rounded border-crust-300 text-crust-600 focus:ring-crust-500"
                  />
                  <Layers className="w-4 h-4 text-crust-500" />
                  <span className="text-sm font-medium text-crust-700">This product has variants (e.g. flavors, sizes)</span>
                </label>

                {formData.hasVariants && (
                  <div className="space-y-4 pl-6 border-l-2 border-purple-200">
                    {/* Variant Labels */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-crust-700 mb-1">
                          Variant Label (English)
                        </label>
                        <input
                          type="text"
                          value={formData.variantLabel || ""}
                          onChange={(e) => setFormData({ ...formData, variantLabel: e.target.value })}
                          placeholder="e.g. Flavor, Size"
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-crust-700 mb-1">
                          Variant Label (Swedish)
                        </label>
                        <input
                          type="text"
                          value={formData.variantLabelSv || ""}
                          onChange={(e) => setFormData({ ...formData, variantLabelSv: e.target.value })}
                          placeholder="e.g. Smak, Storlek"
                          className="input-field"
                        />
                      </div>
                    </div>

                    {/* Variants List */}
                    <div>
                      <label className="block text-sm font-medium text-crust-700 mb-2">Variants</label>
                      <div className="space-y-3">
                        {(formData.variants || []).map((variant, index) => (
                          <div key={variant.id || index} className="flex flex-wrap gap-2 p-3 bg-flour-50 rounded-lg border border-flour-200">
                            <div className="flex-1 min-w-[120px]">
                              <input
                                type="text"
                                value={variant.nameSv}
                                onChange={(e) => handleUpdateVariant(index, "nameSv", e.target.value)}
                                placeholder="Name (SV) *"
                                className="input-field text-sm"
                                required
                              />
                            </div>
                            <div className="flex-1 min-w-[120px]">
                              <input
                                type="text"
                                value={variant.name}
                                onChange={(e) => handleUpdateVariant(index, "name", e.target.value)}
                                placeholder="Name (EN)"
                                className="input-field text-sm"
                              />
                            </div>
                            <div className="w-24">
                              <input
                                type="number"
                                value={variant.priceDiff || 0}
                                onChange={(e) => handleUpdateVariant(index, "priceDiff", Number(e.target.value))}
                                placeholder="+/- kr"
                                className="input-field text-sm"
                              />
                            </div>
                            <label className="flex items-center gap-1 text-sm">
                              <input
                                type="checkbox"
                                checked={variant.available}
                                onChange={(e) => handleUpdateVariant(index, "available", e.target.checked)}
                                className="rounded border-crust-300 text-green-600 focus:ring-green-500"
                              />
                              <span className="text-crust-600">Available</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => handleRemoveVariant(index)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-md"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={handleAddVariant}
                        className="mt-3 text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Add Variant
                      </button>

                      <p className="text-xs text-crust-500 mt-2">
                        Price diff: Use 0 for same price, positive for more, negative for less (e.g. -5 for 5 kr less)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Available Days */}
              <div>
                <label className="block text-sm font-medium text-crust-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Available Days (leave empty for all days)
                </label>
                <div className="flex flex-wrap gap-2">
                  {allDays.map((day) => (
                    <label
                      key={day}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer transition-colors text-sm",
                        formData.availableDays?.includes(day)
                          ? "bg-crust-900 text-white border-crust-900"
                          : "bg-flour-100 text-crust-700 border-flour-300 hover:bg-flour-200"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={formData.availableDays?.includes(day)}
                        onChange={(e) => handleDayChange(day, e.target.checked)}
                        className="sr-only"
                      />
                      {dayLabels[day]}
                    </label>
                  ))}
                </div>
                <p className="text-xs text-crust-500 mt-1">If no days are selected, the product is available every day</p>
              </div>

              {/* Special & Min Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-crust-700 mb-1">
                    <Sparkles className="w-4 h-4 inline mr-1" />
                    Special
                  </label>
                  <select
                    value={formData.specialType || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      specialType: (e.target.value as "week" | "day") || null
                    })}
                    className="input-field"
                  >
                    <option value="">None</option>
                    <option value="week">Weekly Special</option>
                    <option value="day">Daily Special</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-crust-700 mb-1">Min. Order Quantity</label>
                  <input
                    type="number"
                    value={formData.minOrder || 1}
                    onChange={(e) => setFormData({ ...formData, minOrder: Number(e.target.value) })}
                    className="input-field"
                    min="1"
                  />
                </div>
              </div>

              {/* Allergens */}
              <div>
                <label className="block text-sm font-medium text-crust-700 mb-2">Allergens</label>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(allergenLabels).map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.allergens?.includes(key)}
                        onChange={(e) => handleAllergenChange(key, e.target.checked)}
                        className="rounded border-crust-300 text-crust-600 focus:ring-crust-500"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-4 sm:gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                    className="rounded border-crust-300 text-crust-600 focus:ring-crust-500"
                  />
                  <span className="text-sm text-crust-700">Available on website</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded border-crust-300 text-crust-600 focus:ring-crust-500"
                  />
                  <span className="text-sm text-crust-700">Show on homepage</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-flour-200">
                <button type="button" onClick={handleCloseModal} className="btn-secondary w-full sm:w-auto">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto">
                  {saving ? "Saving..." : editingProduct ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}