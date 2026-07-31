"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Social content doesn't need financial-data-level freshness —
            // a minute of staleness before a background refetch is fine
            // for feeds, profiles, and the current-user/session check.
            // Individual queries can still override this per-query if
            // something later genuinely needs to feel closer to live.
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // keep unused cache for 5 mins max
            retry: 1, // one retry on failure is enough
            refetchOnWindowFocus: true, // re-check session/feed when the tab regains focus
            refetchOnReconnect: true, // re-fetch when internet reconnects
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
