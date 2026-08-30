import path from "node:path";
import type { NextConfig } from "next";

const keepTestIds = process.env.E2E_KEEP_TEST_IDS === "1";

function mediaRemotePatterns() {
  const origins = new Set([
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333",
    "http://localhost:3333",
    "http://127.0.0.1:3337",
  ]);

  return [...origins].flatMap((origin) => {
    try {
      const parsed = new URL(origin);
      const protocol: "http" | "https" =
        parsed.protocol === "https:" ? "https" : "http";
      const pattern: {
        protocol: "http" | "https";
        hostname: string;
        port?: string;
        pathname: string;
      } = {
        protocol,
        hostname: parsed.hostname,
        pathname: "/**",
      };

      if (parsed.port) {
        pattern.port = parsed.port;
      }

      return [pattern];
    } catch {
      return [];
    }
  });
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../.."),
  transpilePackages: ["@lumira/contracts", "recharts"],
  images: {
    qualities: [75, 90],
    remotePatterns: [
      { protocol: "http", hostname: "localhost", pathname: "/**" },
      { protocol: "http", hostname: "127.0.0.1", pathname: "/**" },
      ...mediaRemotePatterns(),
    ],
  },
  compiler: {
    // SWC analog of babel-plugin-react-remove-properties — prod only.
    reactRemoveProperties: keepTestIds
      ? false
      : { properties: ["^data-testid$"] },
  },
};

export default nextConfig;
