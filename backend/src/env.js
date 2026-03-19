import "dotenv/config";

const REQUIRED_ENV_KEYS = ["DATABASE_URL", "JWT_SECRET"];

export function validateEnv() {
  const missing = REQUIRED_ENV_KEYS.filter((key) => !process.env[key]?.trim());

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }
}

export function getEnv(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}
