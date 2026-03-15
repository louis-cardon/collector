import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  createCategory,
  fetchAdminCategories,
  updateCategory,
} from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/auth/token-storage";
import AdminCategoriesPage from "./page";

jest.mock("@/lib/api/admin", () => ({
  createCategory: jest.fn(),
  fetchAdminCategories: jest.fn(),
  updateCategory: jest.fn(),
}));

jest.mock("@/lib/auth/token-storage", () => ({
  getAccessToken: jest.fn(),
}));

const createCategoryMock = createCategory as jest.MockedFunction<typeof createCategory>;
const fetchAdminCategoriesMock = fetchAdminCategories as jest.MockedFunction<
  typeof fetchAdminCategories
>;
const updateCategoryMock = updateCategory as jest.MockedFunction<typeof updateCategory>;
const getAccessTokenMock = getAccessToken as jest.MockedFunction<typeof getAccessToken>;

describe("AdminCategoriesPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("blocks access without token", async () => {
    getAccessTokenMock.mockReturnValue(null);

    render(<AdminCategoriesPage />);

    expect(
      await screen.findByText(/Cette page necessite une connexion admin/i),
    ).toBeInTheDocument();
    expect(fetchAdminCategoriesMock).not.toHaveBeenCalled();
  });

  it("creates a category and refreshes the list", async () => {
    getAccessTokenMock.mockReturnValue("admin-jwt");
    fetchAdminCategoriesMock
      .mockResolvedValueOnce([
        {
          id: "category-1",
          name: "Cartes",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ])
      .mockResolvedValueOnce([
        {
          id: "category-1",
          name: "Cartes",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
        {
          id: "category-2",
          name: "Vinyles",
          createdAt: "2026-01-01T12:00:00.000Z",
          updatedAt: "2026-01-01T12:00:00.000Z",
        },
      ]);
    createCategoryMock.mockResolvedValue({
      id: "category-2",
      name: "Vinyles",
      createdAt: "2026-01-01T12:00:00.000Z",
      updatedAt: "2026-01-01T12:00:00.000Z",
    });

    render(<AdminCategoriesPage />);

    expect(await screen.findByRole("heading", { name: "Cartes" })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Nom de la nouvelle categorie"), {
      target: { value: "Vinyles" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Creer la categorie" }));

    await waitFor(() => {
      expect(createCategoryMock).toHaveBeenCalledWith({ name: "Vinyles" });
    });

    expect(await screen.findByText("Categorie creee.")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Vinyles" })).toBeInTheDocument();
  });

  it("updates a category name", async () => {
    getAccessTokenMock.mockReturnValue("admin-jwt");
    fetchAdminCategoriesMock
      .mockResolvedValueOnce([
        {
          id: "category-1",
          name: "Cartes",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ])
      .mockResolvedValueOnce([
        {
          id: "category-1",
          name: "Cartes retro",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T08:00:00.000Z",
        },
      ]);
    updateCategoryMock.mockResolvedValue({
      id: "category-1",
      name: "Cartes retro",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T08:00:00.000Z",
    });

    render(<AdminCategoriesPage />);

    expect(await screen.findByRole("heading", { name: "Cartes" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Renommer" }));
    fireEvent.change(screen.getByLabelText("Nouveau nom"), {
      target: { value: "Cartes retro" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }));

    await waitFor(() => {
      expect(updateCategoryMock).toHaveBeenCalledWith("category-1", {
        name: "Cartes retro",
      });
    });

    expect(await screen.findByText("Categorie mise a jour.")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Cartes retro" })).toBeInTheDocument();
  });

  it("shows API error when category creation fails", async () => {
    getAccessTokenMock.mockReturnValue("admin-jwt");
    fetchAdminCategoriesMock.mockResolvedValue([]);
    createCategoryMock.mockRejectedValue(
      new ApiError("Category name already exists", 409),
    );

    render(<AdminCategoriesPage />);

    fireEvent.change(screen.getByLabelText("Nom de la nouvelle categorie"), {
      target: { value: "Cartes" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Creer la categorie" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Category name already exists",
    );
  });
});
