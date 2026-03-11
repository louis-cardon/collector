import { render, screen, waitFor } from "@testing-library/react";
import { ApiError } from "@/lib/api/client";
import { fetchCatalog, fetchCategories } from "@/lib/api/catalog";
import CatalogPage from "./page";

jest.mock("@/lib/api/catalog", () => ({
  fetchCatalog: jest.fn(),
  fetchCategories: jest.fn(),
}));

const fetchCatalogMock = fetchCatalog as jest.MockedFunction<typeof fetchCatalog>;
const fetchCategoriesMock = fetchCategories as jest.MockedFunction<
  typeof fetchCategories
>;

describe("CatalogPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    fetchCategoriesMock.mockResolvedValue([
      {
        id: "category-1",
        name: "Cartes",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ]);
  });

  it("renders catalog data returned by API", async () => {
    fetchCatalogMock.mockResolvedValue([
      {
        id: "article-approved-1",
        title: "Carte approuvee",
        description: "Annonce visible publiquement",
        price: "30.00",
        shippingCost: "5.00",
        categoryId: "category-1",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ]);

    render(<CatalogPage />);

    expect(screen.getByText("Chargement du catalogue...")).toBeInTheDocument();

    expect(await screen.findByRole("heading", { name: "Carte approuvee" })).toBeInTheDocument();
    expect(screen.getByText("Annonce visible publiquement")).toBeInTheDocument();
    expect(screen.getByText("30.00 EUR")).toBeInTheDocument();
    expect(screen.getByText("5.00 EUR")).toBeInTheDocument();
    expect(screen.getAllByText("Cartes").length).toBeGreaterThan(0);
  });

  it("shows an error when catalog API fails", async () => {
    fetchCatalogMock.mockRejectedValue(
      new ApiError("Service indisponible", 503),
    );

    render(<CatalogPage />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Service indisponible",
      );
    });
  });
});
