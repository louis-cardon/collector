import { apiRequest } from "@/lib/api/client";
import type { CatalogArticle, Category } from "@/lib/types/api";

export async function fetchCatalog(
  categoryId?: string,
): Promise<CatalogArticle[]> {
  const params = new URLSearchParams();

  if (categoryId) {
    params.set("categoryId", categoryId);
  }

  const query = params.toString();

  return apiRequest<CatalogArticle[]>(`/catalog${query ? `?${query}` : ""}`, {
    auth: false,
  });
}

export async function fetchCatalogItem(id: string): Promise<CatalogArticle> {
  return apiRequest<CatalogArticle>(`/catalog/${id}`, {
    auth: false,
  });
}

export async function fetchCategories(): Promise<Category[]> {
  return apiRequest<Category[]>("/categories", {
    auth: false,
  });
}
