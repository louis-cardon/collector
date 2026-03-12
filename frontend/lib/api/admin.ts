import { apiRequestWithAuth } from "@/lib/api/client";
import type { CreatedArticle } from "@/lib/types/api";

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
