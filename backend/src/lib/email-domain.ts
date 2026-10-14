import { promises as dns } from "node:dns";

// Mail to a domain without a mail server bounces, and repeated bounces make the SMTP
// provider block the whole mailbox (Zoho: "550 5.4.6 Unusual sending activity").
const cache = new Map<string, { ok: boolean; at: number }>();
const TTL_MS = 6 * 3600_000;
const LOOKUP_TIMEOUT_MS = 4000;

const lookup = async (domain: string): Promise<boolean> => {
  try {
    const mx = await Promise.race([
      dns.resolveMx(domain),
      new Promise<never>((_, reject) => setTimeout(() => reject(Object.assign(new Error("timeout"), { code: "ETIMEOUT" })), LOOKUP_TIMEOUT_MS)),
    ]);
    return mx.some(record => record.exchange && record.exchange !== ".");
  } catch (error) {
    const code = (error as { code?: string }).code;
    // Only a definite "no such domain / no MX" answer counts as undeliverable; DNS hiccups do not block mail.
    return !(code === "ENOTFOUND" || code === "ENODATA");
  }
};

/** False only when DNS says the address's domain has no mail server. */
export async function canReceiveMail(email: string): Promise<boolean> {
  const domain = email.split("@")[1]?.trim().toLowerCase();
  if (!domain) return false;
  const hit = cache.get(domain);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.ok;
  const ok = await lookup(domain);
  cache.set(domain, { ok, at: Date.now() });
  return ok;
}
