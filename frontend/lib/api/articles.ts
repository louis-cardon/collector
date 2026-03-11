import { apiRequestWithAuth } from "@/lib/api/client";
import type { CreateArticlePayload, CreatedArticle } from "@/lib/types/api";

export async function createArticle(
  payload: CreateArticlePayload,
): Promise<CreatedArticle> {
  return apiRequestWithAuth<CreatedArticle>("/articles", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
