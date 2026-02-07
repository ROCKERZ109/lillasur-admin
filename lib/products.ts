import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "./firebase";
import type { Product, ProductCategory } from "@/types";

const PRODUCTS_COLLECTION = process.env.NEXT_PUBLIC_PRODUCT_DATABASE as string;

// Upload image to Firebase Storage
export async function uploadProductImage(
  file: File,
  productId: string
): Promise<string> {
  try {
    const fileExtension = file.name.split(".").pop();
    const fileName = `products/${productId}.${fileExtension}`;
    const storageRef = ref(storage, fileName);

    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Failed to upload image");
  }
}

// Delete image from Firebase Storage
export async function deleteProductImage(imageUrl: string): Promise<void> {
  try {
    // Extract path from URL
    const storageRef = ref(storage, imageUrl);
    await deleteObject(storageRef);
  } catch (error) {
    console.error("Error deleting image:", error);
    // Don't throw - image might not exist
  }
}

// Create a new product
export async function createProduct(
  product: Omit<Product, "id">,
  imageFile?: File
): Promise<string> {
  try {
    // First create the product to get an ID
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
      ...product,
      image: "", // Will update with image URL if provided
      createdAt: new Date(),
    });

    // If image provided, upload it and update the product
    if (imageFile) {
      const imageUrl = await uploadProductImage(imageFile, docRef.id);
      await updateDoc(docRef, { image: imageUrl });
    }

    return docRef.id;
  } catch (error) {
    console.error("Error creating product:", error);
    throw new Error("Failed to create product");
  }
}

// Get all products from Firebase
export async function getProducts(): Promise<Product[]> {
  try {
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      orderBy("category", "asc")
    );

    const querySnapshot = await getDocs(q);
    const products: Product[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      products.push({
        id: doc.id,
        name: data.name,
        nameSv: data.nameSv,
        description: data.description,
        descriptionSv: data.descriptionSv,
        price: data.price,
        category: data.category,
        image: data.image,
        available: data.available,
         availableDays: data.availableDays || [],
        featured: data.featured || false,
        allergens: data.allergens || [],
        weight: data.weight || "",
      } as Product);
    });

    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
}

// Get products by category
export async function getProductsByCategory(
  category: ProductCategory
): Promise<Product[]> {
  try {
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where("category", "==", category),
      where("available", "==", true)
    );

    const querySnapshot = await getDocs(q);
    const products: Product[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      products.push({
        id: doc.id,
        ...data,
      } as Product);
    });

    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
}

// Get available products
export async function getAvailableProducts(): Promise<Product[]> {
  try {
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where("available", "==", true)
    );

    const querySnapshot = await getDocs(q);
    const products: Product[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      products.push({
        id: doc.id,
        ...data,
      } as Product);
    });

    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
}

// Get featured products
export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where("featured", "==", true),
      where("available", "==", true)
    );

    const querySnapshot = await getDocs(q);
    const products: Product[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      products.push({
        id: doc.id,
        ...data,
      } as Product);
    });

    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
}

// Update a product
export async function updateProduct(
  productId: string,
  updates: Partial<Product>,
  newImageFile?: File
): Promise<void> {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);

    // If new image provided, upload it
    if (newImageFile) {
      const imageUrl = await uploadProductImage(newImageFile, productId);
      updates.image = imageUrl;
    }

    await updateDoc(productRef, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error updating product:", error);
    throw new Error("Failed to update product");
  }
}

// Delete a product
export async function deleteProduct(productId: string): Promise<void> {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);
    await deleteDoc(productRef);
  } catch (error) {
    console.error("Error deleting product:", error);
    throw new Error("Failed to delete product");
  }
}

// Toggle product availability
export async function toggleProductAvailability(
  productId: string,
  available: boolean
): Promise<void> {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);
    await updateDoc(productRef, { available });
  } catch (error) {
    console.error("Error toggling product availability:", error);
    throw new Error("Failed to update product");
  }
}

// Toggle product featured status
export async function toggleProductFeatured(
  productId: string,
  featured: boolean
): Promise<void> {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);
    await updateDoc(productRef, { featured });
  } catch (error) {
    console.error("Error toggling product featured status:", error);
    throw new Error("Failed to update product");
  }
}
