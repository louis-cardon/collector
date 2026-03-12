import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { approveArticle, fetchPendingArticles, rejectArticle } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/auth/token-storage";
import AdminPendingArticlesPage from "./page";

jest.mock("@/lib/api/admin", () => ({
  fetchPendingArticles: jest.fn(),
  approveArticle: jest.fn(),
  rejectArticle: jest.fn(),
}));

jest.mock("@/lib/auth/token-storage", () => ({
  getAccessToken: jest.fn(),
}));

const fetchPendingArticlesMock = fetchPendingArticles as jest.MockedFunction<
  typeof fetchPendingArticles
>;
const approveArticleMock = approveArticle as jest.MockedFunction<typeof approveArticle>;
const rejectArticleMock = rejectArticle as jest.MockedFunction<typeof rejectArticle>;
const getAccessTokenMock = getAccessToken as jest.MockedFunction<typeof getAccessToken>;

describe("AdminPendingArticlesPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("blocks access without token", async () => {
    getAccessTokenMock.mockReturnValue(null);

    render(<AdminPendingArticlesPage />);

    expect(await screen.findByText(/Cette page necessite une connexion/i)).toBeInTheDocument();
    expect(fetchPendingArticlesMock).not.toHaveBeenCalled();
  });

  it("approves an article and refreshes pending list", async () => {
    getAccessTokenMock.mockReturnValue("admin-jwt");
    fetchPendingArticlesMock
      .mockResolvedValueOnce([
        {
          id: "article-1",
          title: "Carte a valider",
          description: "Annonce en attente de decision admin.",
          price: "90.00",
          shippingCost: "5.00",
          status: "PENDING_REVIEW",
          sellerId: "seller-1",
          categoryId: "category-1",
          reviewedAt: null,
          reviewedBy: null,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ])
      .mockResolvedValueOnce([]);
    approveArticleMock.mockResolvedValue({
      id: "article-1",
      title: "Carte a valider",
      description: "Annonce en attente de decision admin.",
      price: "90.00",
      shippingCost: "5.00",
      status: "APPROVED",
      sellerId: "seller-1",
      categoryId: "category-1",
      reviewedAt: "2026-01-01T12:00:00.000Z",
      reviewedBy: "admin-1",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T12:00:00.000Z",
    });

    render(<AdminPendingArticlesPage />);

    expect(await screen.findByRole("heading", { name: "Carte a valider" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Approve" }));

    await waitFor(() => {
      expect(approveArticleMock).toHaveBeenCalledWith("article-1");
    });

    await waitFor(() => {
      expect(fetchPendingArticlesMock).toHaveBeenCalledTimes(2);
    });

    expect(await screen.findByText("Annonce approuvee.")).toBeInTheDocument();
    expect(screen.getByText("Aucune annonce en attente de validation.")).toBeInTheDocument();
    expect(rejectArticleMock).not.toHaveBeenCalled();
  });

  it("rejects an article and refreshes pending list", async () => {
    getAccessTokenMock.mockReturnValue("admin-jwt");
    fetchPendingArticlesMock
      .mockResolvedValueOnce([
        {
          id: "article-2",
          title: "Carte a rejeter",
          description: "Annonce en attente de decision admin.",
          price: "50.00",
          shippingCost: "2.00",
          status: "PENDING_REVIEW",
          sellerId: "seller-1",
          categoryId: "category-1",
          reviewedAt: null,
          reviewedBy: null,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ])
      .mockResolvedValueOnce([]);
    rejectArticleMock.mockResolvedValue({
      id: "article-2",
      title: "Carte a rejeter",
      description: "Annonce en attente de decision admin.",
      price: "50.00",
      shippingCost: "2.00",
      status: "REJECTED",
      sellerId: "seller-1",
      categoryId: "category-1",
      reviewedAt: "2026-01-01T12:00:00.000Z",
      reviewedBy: "admin-1",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T12:00:00.000Z",
    });

    render(<AdminPendingArticlesPage />);

    expect(await screen.findByRole("heading", { name: "Carte a rejeter" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Reject" }));

    await waitFor(() => {
      expect(rejectArticleMock).toHaveBeenCalledWith("article-2");
    });

    expect(await screen.findByText("Annonce rejetee.")).toBeInTheDocument();
  });

  it("shows API error when decision request fails", async () => {
    getAccessTokenMock.mockReturnValue("admin-jwt");
    fetchPendingArticlesMock.mockResolvedValue([
      {
        id: "article-3",
        title: "Carte en conflit",
        description: "Annonce deja revue.",
        price: "70.00",
        shippingCost: "3.00",
        status: "PENDING_REVIEW",
        sellerId: "seller-1",
        categoryId: "category-1",
        reviewedAt: null,
        reviewedBy: null,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ]);
    approveArticleMock.mockRejectedValue(new ApiError("Article already reviewed", 409));

    render(<AdminPendingArticlesPage />);

    expect(await screen.findByRole("heading", { name: "Carte en conflit" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Approve" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Article already reviewed",
    );
  });
});
