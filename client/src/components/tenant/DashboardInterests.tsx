import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Building2, Heart } from "lucide-react";

export type DashboardInterest = {
  id: number;
  status: string;
  createdAt: string;
  property: {
    address?: string;
    rent?: number;
  } | null;
  isGeneral: boolean;
};

interface TenantDashboardInterestsProps {
  interests: DashboardInterest[];
  totalCount: number;
  isLoading: boolean;
  error: Error | null;
  onBrowseProperties: () => void;
  onRetry: () => void;
}

const statusStyles: Record<string, string> = {
  contacted: "bg-green-100 text-green-800",
  archived: "bg-gray-100 text-gray-800",
  new: "bg-blue-100 text-blue-800",
};

const formatCurrency = (value?: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString();
};

export function TenantDashboardInterests({
  interests,
  totalCount,
  isLoading,
  error,
  onBrowseProperties,
  onRetry,
}: TenantDashboardInterestsProps) {
  if (isLoading && interests.length === 0) {
    return (
      <Card data-testid="card-interests-loading">
        <CardContent className="py-6 space-y-4">
          <Skeleton className="h-5 w-40" />
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex items-center justify-between">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card data-testid="card-interests-error">
        <CardContent className="py-6 text-center space-y-3">
          <AlertCircle className="mx-auto h-6 w-6 text-red-500" />
          <p className="text-sm text-gray-600">
            We couldn&apos;t load your interests right now. Please try again.
          </p>
          <Button variant="outline" size="sm" onClick={onRetry}>
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (interests.length === 0) {
    return (
      <Card data-testid="card-interests-empty">
        <CardContent className="py-6 text-center space-y-3">
          <Building2 className="mx-auto h-8 w-8 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">No active interests</p>
            <p className="text-xs text-gray-500">
              Share your RentCard to start hearing from landlords faster.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onBrowseProperties}
            data-testid="button-interests-browse"
          >
            Browse properties
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-interests-list">
      <CardContent className="py-5 space-y-4">
        <div className="text-xs text-gray-500">
          Showing {Math.min(interests.length, 3)} of {totalCount} interest
          {totalCount === 1 ? "" : "s"}
        </div>
        {interests.map((interest) => {
          const title = interest.isGeneral
            ? "General interest"
            : interest.property?.address || "Property interest";
          const rent = formatCurrency(interest.property?.rent);
          const submittedAt = formatDate(interest.createdAt);
          const badgeStyle = statusStyles[interest.status] ?? statusStyles.new;
          const badgeLabel =
            interest.status.charAt(0).toUpperCase() + interest.status.slice(1);

          return (
            <div
              key={interest.id}
              className="flex items-start justify-between gap-3 border-b pb-3 last:border-none last:pb-0"
            >
              <div>
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <p className="text-sm font-medium text-gray-900">{title}</p>
                </div>
                <div className="mt-1 text-xs text-gray-500 space-y-0.5">
                  {rent && <p>{rent} budget</p>}
                  {submittedAt && <p>Submitted {submittedAt}</p>}
                </div>
              </div>
              <Badge className={`${badgeStyle} whitespace-nowrap`}>{badgeLabel}</Badge>
            </div>
          );
        })}
        {totalCount > interests.length && (
          <p className="text-xs text-gray-500">
            +{totalCount - interests.length} more interest
            {totalCount - interests.length === 1 ? "" : "s"} in your list
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default TenantDashboardInterests;
