import TenantLayout from "@/components/layouts/TenantLayout";
import { ReferralDashboard } from "@/components/tenant/referral";
import { ROUTES } from "@/constants";

export default function TenantReferralsPage() {
  return (
    <TenantLayout activeRoute={ROUTES.TENANT.REFERRALS}>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <ReferralDashboard />
      </div>
    </TenantLayout>
  );
}