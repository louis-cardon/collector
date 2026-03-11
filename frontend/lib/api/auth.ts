import { apiRequest } from "@/lib/api/client";
import type { LoginCredentials, LoginResponse } from "@/lib/types/api";

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}
