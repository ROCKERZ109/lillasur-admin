"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
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
import type { Product, ProductCategory } from "@/types";

const categoryLabels: Record<ProductCategory, string> = {
  bread: "Bröd",
  pastry: "Bakverk",
  cookie: "Kakor",
  // cake: "Tårtor",
  // seasonal: "Säsong",
};

const allergenLabels: Record<string, string> = {
  gluten: "Gluten",
  dairy: "Mjölk",
  eggs: "Ägg",
  almonds: "Mandel",
  oats: "Havre",
  coconut: "Kokos",
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
};

export default function ProductsPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | "all">("all");

  // Modal state
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
      setError("Kunde inte hämta produkter");
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
      setError("Kunde inte spara produkten");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId: string, productName: string) => {
    console.log(productId)
    if (!confirm(`Är du säker på att du vill ta bort "${productName}"?`)) return;

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
        prev.map((p) =>
          p.id === productId ? { ...p, available: !currentValue } : p
        )
      );
    } catch (err) {
      console.error("Failed to toggle availability:", err);
    }
  };

  const handleToggleFeatured = async (productId: string, currentValue: boolean) => {
    try {
      await toggleProductFeatured(productId, !currentValue);
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, featured: !currentValue } : p
        )
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

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.nameSv.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-crust-900">Produkter</h2>
          <button
            onClick={fetchProducts}
            className="p-2 text-crust-500 hover:text-crust-900 hover:bg-flour-200 rounded-md transition-colors"
            title="Uppdatera"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
        </div>

        <div className="flex gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-crust-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Sök produkt..."
              className="pl-10 pr-4 py-2 w-48 border border-flour-300 rounded-md text-sm focus:outline-none focus:border-crust-400"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value as ProductCategory | "all")
            }
            className="px-3 py-2 border border-flour-300 rounded-md text-sm focus:outline-none focus:border-crust-400"
          >
            <option value="all">Alla kategorier</option>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          {/* Add Button */}
          <button
            onClick={() => handleOpenModal()}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Lägg till
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12 text-crust-500">
          Laddar produkter...
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-flour-400 mx-auto mb-3" />
          <p className="text-crust-500 mb-4">Inga produkter hittades</p>
          <button onClick={() => handleOpenModal()} className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Lägg till första produkten
          </button>
        </div>
      )}

      {/* Products Grid */}
      {!loading && filteredProducts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={cn(
                "border rounded-lg overflow-hidden bg-white transition-all",
                !product.available && "opacity-60"
              )}
            >
              {/* Image */}
              <div className="aspect-video bg-flour-200 relative">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.nameSv}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    🥖
                  </div>
                )}

                {/* Status badges */}
                <div className="absolute top-2 left-2 flex gap-1">
                  {!product.available && (
                    <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                      Dold
                    </span>
                  )}
                  {product.featured && (
                    <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs rounded-full">
                      Utvald
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-medium text-crust-900">{product.nameSv}</h3>
                    <p className="text-xs text-crust-500">{categoryLabels[product.category]}</p>
                  </div>
                  <p className="font-semibold text-crust-900">{formatPrice(product.price)}</p>
                </div>

                <p className="text-sm text-crust-600 line-clamp-2 mb-3">
                  {product.descriptionSv}
                </p>

                {/* Actions */}
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
                      title={product.available ? "Dölj produkt" : "Visa produkt"}
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
                      title={product.featured ? "Ta bort från startsidan" : "Visa på startsidan"}
                    >
                      {product.featured ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => handleOpenModal(product)}
                      className="p-2 text-crust-500 hover:text-crust-900 hover:bg-flour-100 rounded-md transition-colors"
                      title="Redigera"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id, product.nameSv)}
                      className="p-2 text-crust-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Ta bort"
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
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-flour-200">
              <h3 className="text-lg font-semibold text-crust-900">
                {editingProduct ? "Redigera produkt" : "Lägg till produkt"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 text-crust-500 hover:text-crust-900 hover:bg-flour-100 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-crust-700 mb-2">
                  Produktbild
                </label>
                <div className="flex items-center gap-4">
                  <div
                    className="w-24 h-24 bg-flour-200 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer hover:bg-flour-300 transition-colors border-2 border-dashed border-flour-400"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Upload className="w-8 h-8 text-crust-400" />
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <div className="text-sm text-crust-500">
                    <p>Klicka för att ladda upp</p>
                    <p className="text-xs">PNG, JPG, max 5MB</p>
                  </div>
                </div>
              </div>

              {/* Names */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-crust-700 mb-1">
                    Namn (svenska) *
                  </label>
                  <input
                    type="text"
                    value={formData.nameSv}
                    onChange={(e) => setFormData({ ...formData, nameSv: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-crust-700 mb-1">
                    Namn (engelska)
                  </label>
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
                <label className="block text-sm font-medium text-crust-700 mb-1">
                  Beskrivning (svenska) *
                </label>
                <textarea
                  value={formData.descriptionSv}
                  onChange={(e) => setFormData({ ...formData, descriptionSv: e.target.value })}
                  className="input-field"
                  rows={2}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-crust-700 mb-1">
                  Beskrivning (engelska)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows={2}
                />
              </div>

              {/* Price, Category, Weight */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-crust-700 mb-1">
                    Pris (SEK) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="input-field"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-crust-700 mb-1">
                    Kategori *
                  </label>
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
                <div>
                  <label className="block text-sm font-medium text-crust-700 mb-1">
                    Vikt
                  </label>
                  <input
                    type="text"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="input-field"
                    placeholder="t.ex. 500g"
                  />
                </div>
              </div>

              {/* Allergens */}
              <div>
                <label className="block text-sm font-medium text-crust-700 mb-2">
                  Allergener
                </label>
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
              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                    className="rounded border-crust-300 text-crust-600 focus:ring-crust-500"
                  />
                  <span className="text-sm text-crust-700">Tillgänglig på hemsidan</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded border-crust-300 text-crust-600 focus:ring-crust-500"
                  />
                  <span className="text-sm text-crust-700">Visa på startsidan</span>
                </label>
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-3 pt-4 border-t border-flour-200">
                <button type="button" onClick={handleCloseModal} className="btn-secondary">
                  Avbryt
                </button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? "Sparar..." : editingProduct ? "Uppdatera" : "Lägg till"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
