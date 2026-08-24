import { headers } from "next/headers";

// Identity now comes from proxy.ts, which runs before every request —
// page or API — verifies the access token, or silently refreshes it via
// the refresh token if it's expired, and forwards the result as
// x-user-id. Reading that header here (instead of re-verifying the raw
// accessToken cookie the way this used to) is what lets a Server
// Component see an already-refreshed session, since middleware can set
// a new cookie during the request and this can't.
export async function getServerUserId(): Promise<string | null> {
  return (await headers()).get("x-user-id");
}
