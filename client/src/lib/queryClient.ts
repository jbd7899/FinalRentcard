import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { ENV } from "@/constants/env";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem("token");
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: Record<string, string> = {
    ...getAuthHeader(),
  };

  if (data) {
    headers["Content-Type"] = "application/json";
  }

  const fullUrl = url.startsWith('http') ? url : `${ENV.API_URL}${url}`;

  try {
    console.log('Making API request:', { method, url: fullUrl, headers, data });
    const res = await fetch(fullUrl, {
      method,
      headers,
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('API Response Error:', {
        status: res.status,
        statusText: res.statusText,
        body: errorText
      });
      throw new Error(`API Error ${res.status}: ${errorText || res.statusText}`);
    }

    return res;
  } catch (error) {
    console.error('API Request error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const headers: Record<string, string> = getAuthHeader();
    const url = queryKey[0] as string;
    const fullUrl = url.startsWith('http') ? url : `${ENV.API_URL}${url}`;
    
    const res = await fetch(fullUrl, { 
      headers,
      credentials: 'include',
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});