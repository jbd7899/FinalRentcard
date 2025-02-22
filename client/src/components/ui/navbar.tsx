import { Building2, Home } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

const Navbar = () => {
  const { user } = useAuth();

  return (
    <nav className="border-b">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Building2 className="w-8 h-8 text-blue-600" />
          <span className="text-xl font-semibold text-blue-600">MyRentCard</span>
        </Link>

        {user && (
          <div className="flex items-center gap-6">
            {user.userType === 'landlord' ? (
              <>
                <Link href="/landlord/dashboard" className="text-muted-foreground hover:text-foreground flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link href="/landlord/applications" className="text-muted-foreground hover:text-foreground">
                  Applications
                </Link>
              </>
            ) : (
              <>
                <Link href="/tenant/dashboard" className="text-muted-foreground hover:text-foreground flex items-center gap-1">
                  <Home className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link href="/create-rentcard" className="text-muted-foreground hover:text-foreground">
                  My RentCard
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;