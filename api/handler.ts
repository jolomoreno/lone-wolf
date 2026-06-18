import type { VercelRequest, VercelResponse } from "@vercel/node";
import { buildApp } from "../apps/api/src/config/composition-root";
import { connectToDatabase } from "../apps/api/src/infrastructure/persistence/mongoose";

let app: ReturnType<typeof buildApp> | undefined;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await connectToDatabase(); // sin-op si readyState >= 1 (ver S3)
  app ??= buildApp(); // se reutiliza en invocaciones calientes
  app(req as any, res as any);
}
