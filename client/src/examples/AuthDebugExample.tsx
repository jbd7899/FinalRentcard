/**
 * This file is maintained for backward compatibility.
 * For new implementations, import AuthDebugTools with embedded=true directly.
 * 
 * @deprecated Use AuthDebugTools with embedded=true instead
 */
import { AuthDebugTools } from "@/components/AuthDebugTools";

/**
 * Example component demonstrating how to use authentication debugging tools
 * 
 * This is an example only and not meant to be used in production.
 * For detailed information, see the Authentication Debugging Guide.
 */
export function AuthDebugExample() {
  return <AuthDebugTools embedded={true} />;
}