import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Building2, 
  User, 
  LogOut, 
  Home,
} from "lucide-react";
import { ROUTES } from "@/constants";

export default function Navbar() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <nav className="border-b">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <Building2 className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-semibold text-blue-600">MyRentCard</span>
          </div>
        </Link>

        <div className="flex items-center space-x-4">
          {/* Navigation Links */}
          {user && (
            <div className="flex items-center gap-6 mr-4">
              {user.userType === 'landlord' ? (
                <>
                  <Link href="/landlord/dashboard">
                    <span className="text-muted-foreground hover:text-foreground flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      Dashboard
                    </span>
                  </Link>
                  <Link href="/landlord/applications">
                    <span className="text-muted-foreground hover:text-foreground">
                      Applications
                    </span>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/tenant/dashboard">
                    <span className="text-muted-foreground hover:text-foreground flex items-center gap-1">
                      <Home className="w-4 h-4" />
                      Dashboard
                    </span>
                  </Link>
                  <Link href="/create-rentcard">
                    <span className="text-muted-foreground hover:text-foreground">
                      My RentCard
                    </span>
                  </Link>
                </>
              )}
            </div>
          )}

          {/* User Menu or Login Button */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <Link href={user.userType === "landlord" ? "/landlord/dashboard" : "/tenant/dashboard"}>
                  <DropdownMenuItem className="gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem
                  className="gap-2 text-red-600 cursor-pointer"
                  onClick={() => logoutMutation.mutate()}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth">
              <Button 
                className="px-6 cursor-pointer"
                variant="default"
                type="button"
              >
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}