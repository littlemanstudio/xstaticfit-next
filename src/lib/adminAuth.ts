import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "xf_admin";
const SESSION_HOURS = 12;

function sign(password: string, payload: string) {
  return createHmac("sha256", password).update(payload).digest("hex");
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function adminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function passwordMatches(input: string) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  // Compare digests so length differences do not leak.
  return safeEqual(sign(password, `login:${input}`), sign(password, `login:${password}`));
}

export function createAdminToken(now = Date.now()) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  const exp = String(now + SESSION_HOURS * 3600 * 1000);
  return `${exp}.${sign(password, `session:${exp}`)}`;
}

export function verifyAdminToken(token: string | undefined, now = Date.now()) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || !token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || Number(exp) < now) return false;
  return safeEqual(sig, sign(password, `session:${exp}`));
}

export const ADMIN_COOKIE_MAX_AGE = SESSION_HOURS * 3600;
