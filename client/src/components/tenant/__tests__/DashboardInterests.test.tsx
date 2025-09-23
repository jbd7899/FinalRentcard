import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { TenantDashboardInterests, type DashboardInterest } from "../DashboardInterests";

describe("TenantDashboardInterests", () => {
  it("renders loading state", () => {
    render(
      <TenantDashboardInterests
        interests={[]}
        totalCount={0}
        isLoading
        error={null}
        onBrowseProperties={() => {}}
        onRetry={() => {}}
      />
    );

    expect(screen.getByTestId("tenant-interests-loading")).toBeInTheDocument();
  });

  it("renders error state and triggers retry", () => {
    const handleRetry = vi.fn();

    render(
      <TenantDashboardInterests
        interests={[]}
        totalCount={0}
        isLoading={false}
        error={new Error("Network error")}
        onBrowseProperties={() => {}}
        onRetry={handleRetry}
      />
    );

    expect(screen.getByTestId("tenant-interests-error")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("button-retry-interests"));
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it("renders empty state and navigates to browse", () => {
    const handleBrowse = vi.fn();

    render(
      <TenantDashboardInterests
        interests={[]}
        totalCount={0}
        isLoading={false}
        error={null}
        onBrowseProperties={handleBrowse}
        onRetry={() => {}}
      />
    );

    expect(screen.getByTestId("tenant-interests-empty")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("button-browse-properties"));
    expect(handleBrowse).toHaveBeenCalledTimes(1);
  });

  it("renders interest list when data is available", () => {
    const interests: DashboardInterest[] = [
      {
        id: 1,
        status: "new",
        createdAt: "2024-01-01T00:00:00.000Z",
        property: { address: "123 Market Street", rent: 2500 },
        isGeneral: false,
      },
      {
        id: 2,
        status: "contacted",
        createdAt: "2024-02-01T00:00:00.000Z",
        property: null,
        isGeneral: true,
      },
    ];

    render(
      <TenantDashboardInterests
        interests={interests}
        totalCount={4}
        isLoading={false}
        error={null}
        onBrowseProperties={() => {}}
        onRetry={() => {}}
      />
    );

    expect(screen.getByTestId("tenant-interests-list")).toBeInTheDocument();
    expect(screen.getByText("123 Market Street")).toBeInTheDocument();
    expect(screen.getByText("General Interest")).toBeInTheDocument();
    expect(screen.getByTestId("interest-status-1")).toHaveTextContent("New");
    expect(screen.getByTestId("interest-status-2")).toHaveTextContent("Contacted");
    expect(screen.getByTestId("tenant-interests-more-count")).toHaveTextContent(
      "Viewing 2 of 4 interests"
    );
  });
});
