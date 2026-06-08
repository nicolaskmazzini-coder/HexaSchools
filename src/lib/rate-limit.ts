const requests = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

export function rateLimit(identifier: string, options: RateLimitOptions): boolean {
  const { maxRequests, windowMs } = options;
  const now = Date.now();
  const record = requests.get(identifier);

  if (!record || now > record.resetTime) {
    requests.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) return false;

  record.count++;
  return true;
}

export function rateLimitAuthAction(ip: string): boolean {
  return rateLimit(`${ip}:auth`, { maxRequests: 5, windowMs: 60 * 1000 });
}
