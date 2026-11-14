// Revisa que en el codigo de la app no haya secretos ni direcciones locales.
// Uso: node scripts/check-secrets.mjs [carpeta-extra]. Sale con codigo 1 si encuentra algo.
// La carpeta extra sirve para revisar el bundle exportado (npx expo export).
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";

const ROOTS = ["app", "src", "app.json", "eas.json", ...process.argv.slice(2)];
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".mjs", ".json", ".hbc", ".map"]);

const PATTERNS = [
  { name: "firebaseConfig", regex: /firebaseConfig/ },
  { name: "clave de Google (AIza...)", regex: /AIza[0-9A-Za-z_-]{20,}/ },
  { name: "clave privada", regex: /BEGIN (RSA )?PRIVATE KEY/ },
  {
    name: "variable de Firebase del servidor",
    regex: /FIREBASE_(PRIVATE_KEY|WEB_API_KEY|CLIENT_EMAIL)/,
  },
  { name: "localhost", regex: /localhost|127\.0\.0\.1/ },
  { name: "URL sin HTTPS", regex: /EXPO_PUBLIC_API_URL"?\s*[:=]\s*"?http:/ },
];

function listFiles(path) {
  let info;
  try {
    info = statSync(path);
  } catch {
    return [];
  }
  if (info.isFile()) {
    return EXTENSIONS.has(extname(path)) ? [path] : [];
  }
  return readdirSync(path).flatMap((name) => listFiles(join(path, name)));
}

const findings = [];
for (const file of ROOTS.flatMap(listFiles)) {
  const text = readFileSync(file, "utf8");
  for (const { name, regex } of PATTERNS) {
    if (regex.test(text)) {
      findings.push(`${file}: ${name}`);
    }
  }
}

if (findings.length > 0) {
  process.stderr.write(`Posibles secretos o direcciones locales:\n${findings.join("\n")}\n`);
  process.exit(1);
}
process.stdout.write("Sin secretos ni direcciones locales.\n");
