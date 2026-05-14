import { ConfigService } from "@nestjs/config";

function normalizeMultilineSecret(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  return value.includes("\\n") ? value.replace(/\\n/g, "\n") : value;
}

type DatabaseOptionSource = ConfigService | NodeJS.ProcessEnv;

function isConfigService(source: DatabaseOptionSource): source is ConfigService {
  return typeof (source as ConfigService).get === "function";
}

function readValue(source: DatabaseOptionSource, key: string): string | undefined {
  if (isConfigService(source)) {
    return source.get<string>(key) ?? undefined;
  }

  return source[key];
}

export function getDatabaseOptions(source: DatabaseOptionSource) {
  const databaseUrl = readValue(source, "DATABASE_URL");
  const databaseCaCert = normalizeMultilineSecret(readValue(source, "DATABASE_CA_CERT"));
  const ssl = databaseCaCert
    ? {
        ca: databaseCaCert,
        rejectUnauthorized: true
      }
    : undefined;

  return {
    ...(databaseUrl
      ? {
          url: databaseUrl
        }
      : {
          host: readValue(source, "DB_HOST") ?? "localhost",
          port: Number(readValue(source, "DB_PORT") ?? 5432),
          username: readValue(source, "DB_USER") ?? "postgres",
          password: readValue(source, "DB_PASSWORD") ?? "postgres",
          database: readValue(source, "DB_NAME") ?? "kudiscore"
        }),
    ...(ssl
      ? {
          ssl
        }
      : {})
  };
}
