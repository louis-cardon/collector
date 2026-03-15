import { apiRequestWithAuth } from "@/lib/api/client";
import type {
  Category,
  CreateCategoryPayload,
  CreatedArticle,
  UpdateCategoryPayload,
} from "@/lib/types/api";

export async function fetchPendingArticles(): Promise<CreatedArticle[]> {
  return apiRequestWithAuth<CreatedArticle[]>("/admin/articles/pending");
}

export async function approveArticle(articleId: string): Promise<CreatedArticle> {
  return apiRequestWithAuth<CreatedArticle>(`/admin/articles/${articleId}/approve`, {
    method: "POST",
  });
}

export async function rejectArticle(articleId: string): Promise<CreatedArticle> {
  return apiRequestWithAuth<CreatedArticle>(`/admin/articles/${articleId}/reject`, {
    method: "POST",
  });
}

export async function fetchAdminCategories(): Promise<Category[]> {
  return apiRequestWithAuth<Category[]>("/categories");
}

export async function createCategory(
  payload: CreateCategoryPayload,
): Promise<Category> {
  return apiRequestWithAuth<Category>("/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateCategory(
  categoryId: string,
  payload: UpdateCategoryPayload,
): Promise<Category> {
  return apiRequestWithAuth<Category>(`/categories/${categoryId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
