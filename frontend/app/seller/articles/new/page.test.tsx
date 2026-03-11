import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createArticle } from "@/lib/api/articles";
import { fetchCategories } from "@/lib/api/catalog";
import { getAccessToken } from "@/lib/auth/token-storage";
import SellerArticleCreatePage from "./page";

jest.mock("@/lib/api/articles", () => ({
  createArticle: jest.fn(),
}));

jest.mock("@/lib/api/catalog", () => ({
  fetchCategories: jest.fn(),
}));

jest.mock("@/lib/auth/token-storage", () => ({
  getAccessToken: jest.fn(),
}));

const createArticleMock = createArticle as jest.MockedFunction<typeof createArticle>;
const fetchCategoriesMock = fetchCategories as jest.MockedFunction<
  typeof fetchCategories
>;
const getAccessTokenMock = getAccessToken as jest.MockedFunction<
  typeof getAccessToken
>;

describe("SellerArticleCreatePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("blocks access without token", async () => {
    getAccessTokenMock.mockReturnValue(null);

    render(<SellerArticleCreatePage />);

    expect(await screen.findByText(/Cette page necessite une connexion/i)).toBeInTheDocument();
    expect(fetchCategoriesMock).not.toHaveBeenCalled();
  });

  it("creates an article when form is valid", async () => {
    getAccessTokenMock.mockReturnValue("fake-jwt");
    fetchCategoriesMock.mockResolvedValue([
      {
        id: "category-1",
        name: "Cartes",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ]);
    createArticleMock.mockResolvedValue({
      id: "article-1",
      title: "Carte rare",
      description: "Carte en bon etat, edition limitee.",
      price: "120.00",
      shippingCost: "4.50",
      status: "PENDING_REVIEW",
      sellerId: "seller-1",
      categoryId: "category-1",
      reviewedAt: null,
      reviewedBy: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    render(<SellerArticleCreatePage />);

    expect(await screen.findByRole("option", { name: "Cartes" })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Titre"), {
      target: { value: "Carte rare" },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "Carte en bon etat, edition limitee." },
    });
    fireEvent.change(screen.getByLabelText("Prix (EUR)"), {
      target: { value: "120.00" },
    });
    fireEvent.change(screen.getByLabelText("Frais de port (EUR)"), {
      target: { value: "4.50" },
    });
    fireEvent.change(screen.getByLabelText("Categorie"), {
      target: { value: "category-1" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Creer l'annonce" }));

    await waitFor(() => {
      expect(createArticleMock).toHaveBeenCalledWith({
        title: "Carte rare",
        description: "Carte en bon etat, edition limitee.",
        price: 120,
        shippingCost: 4.5,
        categoryId: "category-1",
      });
    });

    expect(
      await screen.findByText("Annonce creee avec succes. Statut: PENDING_REVIEW."),
    ).toBeInTheDocument();
  });
});
