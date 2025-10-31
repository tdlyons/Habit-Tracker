import { cookies } from "next/headers";
import { USER_COOKIE_NAME } from "@/lib/user-cookie";

export const getCurrentUserId = async () => {
  const cookieStore = await cookies();
  const userId = cookieStore.get(USER_COOKIE_NAME)?.value;

  if (!userId) {
    throw new Error(
      "Missing user session cookie. Ensure the middleware that provisions user sessions is enabled.",
    );
  }

  return userId;
};
