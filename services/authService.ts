import { apiFetch } from "@/utils/apiClient";
import { API_ROUTES } from "@/utils/apiRoutes";

export async function getCurrentUser() {
  return apiFetch(API_ROUTES.USER.ME, {
    method: "GET",
    authRequired: false,
  });
}

// Replaces registerUser + loginUser + resendVerificationToken — a magic
// link makes signup, login, and resend the exact same call. No password
// is ever involved, so there's nothing else to send here beyond email.
export async function requestMagicLink(email: string) {
  return apiFetch(API_ROUTES.AUTH.REQUEST_LINK, {
    method: "POST",
    body: JSON.stringify({ email }),
    authRequired: false,
  });
}

export async function verifyMagicLink(token: string) {
  return apiFetch(API_ROUTES.AUTH.VERIFY_TOKEN(token), {
    method: "GET",
    authRequired: false,
  });
}

// forgotPassword/resetPassword have no equivalent — there are no
// passwords anywhere in this app to forget or reset.

export async function logOutUser() {
  return apiFetch(API_ROUTES.AUTH.LOGOUT, {
    method: "POST",
    body: JSON.stringify({ logoutAll: true }),
    authRequired: false,
  });
}