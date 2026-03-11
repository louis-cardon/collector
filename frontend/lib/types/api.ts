export type Role = "seller" | "admin";
export type ArticleStatus = "PENDING_REVIEW" | "APPROVED" | "REJECTED";

export type CatalogArticle = {
  id: string;
  title: string;
  description: string;
  price: string;
  shippingCost: string;
  categoryId: string;
  createdAt: string;
};

export type Category = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type AuthUser = {
  id: string;
  email: string;
  role: Role;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  user: AuthUser;
};

export type CreateArticlePayload = {
  title: string;
  description: string;
  price: number;
  shippingCost: number;
  categoryId: string;
};

export type CreatedArticle = {
  id: string;
  title: string;
  description: string;
  price: string;
  shippingCost: string;
  status: ArticleStatus;
  sellerId: string;
  categoryId: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  createdAt: string;
  updatedAt: string;
};
