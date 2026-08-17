import path from "node:path";
import type { NextConfig } from "next";

const keepTestIds = process.env.E2E_KEEP_TEST_IDS === "1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../.."),
  transpilePackages: ["@lustra/contracts"],
  compiler: {
    // SWC analog of babel-plugin-react-remove-properties — prod only.
    reactRemoveProperties: keepTestIds
      ? false
      : { properties: ["^data-testid$"] },
  },
};

export default nextConfig;
