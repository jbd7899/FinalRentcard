import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Clock, AlertCircle } from "lucide-react";

export type DashboardInterestStatus =
  | "new"
  | "contacted"
  | "archived"
  | (string & {});

export interface DashboardInterest {
  id: number;
  status: DashboardInterestStatus;
  createdAt: string;
  property: {
    address?: string;
    rent?: number;
  } | null;
  isGeneral: boolean;
}

interface TenantDashboardInterestsProps {
  interests: DashboardInterest[];
  totalCount: number;
  isLoading: boolean;
  error: unknown;
  onBrowseProperties: () => void;
  onRetry: () => void;
}

function getStatusBadgeClasses(status: DashboardInterestStatus) {
  switch (status) {
    case "contacted":
      return "bg-green-100 text-green-800";
    case "archived":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-blue-100 text-blue-800";
  }
}

function getStatusLabel(status: DashboardInterestStatus) {
  if (!status) return "New";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatSubmittedLabel(createdAt: string) {
  if (!createdAt) {
    return "Submitted recently";
  }

  const timestamp = Date.parse(createdAt);
  if (Number.isNaN(timestamp)) {
    return "Submitted recently";
  }

  return `Submitted ${new Date(timestamp).toLocaleDateString()}`;
}

export function TenantDashboardInterests({
  interests,
  totalCount,
  isLoading,
  error,
  onBrowseProperties,
  onRetry,
}: TenantDashboardInterestsProps) {
  if (isLoading) {
    return (
      <Card data-testid="tenant-interests-loading">
        <CardContent className="p-5 sm:p-6 space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <div className="flex justify-between items-start">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unable to fetch interests. Please try again.";

    return (
      <Card data-testid="tenant-interests-error">
        <CardContent className="p-5 sm:p-6 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-medium text-red-600">
              Unable to load interests
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">{errorMessage}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            data-testid="button-retry-interests"
          >
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (totalCount === 0 || interests.length === 0) {
    return (
      <Card data-testid="tenant-interests-empty">
        <CardContent className="p-5 sm:p-6 text-center space-y-4">
          <Building2 className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto" />
          <div className="space-y-1">
            <p className="text-sm sm:text-base font-medium text-gray-700">
              No active interests
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              Share your RentCard to let landlords know you&apos;re interested.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs sm:text-sm h-8 sm:h-9"
            onClick={onBrowseProperties}
            data-testid="button-browse-properties"
          >
            Browse Properties
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="tenant-interests-list">
      <CardContent className="p-5 sm:p-6 space-y-4">
        {interests.map((interest) => (
          <div
            key={interest.id}
            className="border-b pb-4 mb-4 last:border-0 last:pb-0 last:mb-0"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-sm sm:text-base">
                  {interest.isGeneral
                    ? "General Interest"
                    : interest.property?.address || "Property Interest"}
                </h3>
                {typeof interest.property?.rent === "number" && (
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
                    ${interest.property.rent.toLocaleString()}/month
                  </p>
                )}
              </div>
              <Badge
                className={`px-2 py-1 text-xs font-medium ${getStatusBadgeClasses(
                  interest.status,
                )}`}
                data-testid={`interest-status-${interest.id}`}
              >
                {getStatusLabel(interest.status)}
              </Badge>
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-gray-500 mt-3">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{formatSubmittedLabel(interest.createdAt)}</span>
            </div>
          </div>
        ))}

        {totalCount > interests.length && (
          <p
            className="text-xs sm:text-sm text-gray-500"
            data-testid="tenant-interests-more-count"
          >
            Viewing {interests.length} of {totalCount} interests
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default TenantDashboardInterests;
