import "dotenv/config";

const REQUIRED_ENV_KEYS = [
  "DATABASE_URL",
  "JWT_SECRET",
  "FRONTEND_URL",
  "GITHUB_CLIENT_ID",
  "GITHUB_CLIENT_SECRET",
  "GITHUB_CALLBACK_URL",
  "FORTYTWO_CLIENT_ID",
  "FORTYTWO_CLIENT_SECRET",
  "FORTYTWO_CALLBACK_URL",
  "MAIL_USER",
  "MAIL_PASS",
];

export function assertEnv(keys) {
  const missing = keys.filter((key) => !process.env[key]?.trim());

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }
}

export function validateEnv() {
  assertEnv(REQUIRED_ENV_KEYS);
}

export function getEnv(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}


export function getOptionalEnv(name) {
  return process.env[name]?.trim() || "";
}
