import { Request } from "express";

/**
 * Returns the session token from the request, preferring the httpOnly cookie
 * but falling back to an Authorization: Bearer header so API clients that
 * can't set cookies (e.g. mobile apps, Postman) still work.
 */
export function resolveToken(req: Request): string | undefined {
  const cookie = req.cookies?.kudiscore_session as string | undefined;
  if (cookie) return cookie;

  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) return auth.slice(7);

  return undefined;
}
