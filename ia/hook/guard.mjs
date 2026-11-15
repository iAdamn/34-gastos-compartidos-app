// Hook PreToolUse de Claude Code: revisa cada herramienta antes de que se ejecute.
// Si la llamada toca secretos, sale de la carpeta del proyecto o usa un comando peligroso,
// termina con codigo 2 y el motivo en stderr: Claude Code bloquea la llamada y le muestra el motivo.
// Se registra en .claude/settings.json (ver ia/hook/README.md). No depende de ningun paquete.
// Protege tambien su propia carpeta: si la IA pudiera editarlo, podria desactivarlo.
import { readFileSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Archivos con secretos: .env*, claves, cuentas de servicio de Firebase y keystores.
const SECRET_FILE =
  /(^|[\\/\s"'=])\.env(\.[\w.-]+)?\b|\.(pem|key|p12|p8|jks|keystore)\b|firebase-adminsdk/i;

// Comandos que bajan cosas de internet, borran sin vuelta atras o reescriben historial.
const DANGEROUS_COMMANDS = [
  { regex: /(^|[\s;&|/\\])(curl|wget)(\.exe)?\b/i, reason: "descargas por red (curl, wget)" },
  { regex: /\b(Invoke-WebRequest|Invoke-RestMethod|iwr|irm)\b/i, reason: "descargas por red" },
  { regex: /(^|[\s;&|])sudo\b/, reason: "sudo" },
  {
    regex: /\brm\s+(-\w*r\w*f|-\w*f\w*r|-r\s+-f|-f\s+-r|--recursive)/,
    reason: "borrado recursivo",
  },
  { regex: /\bRemove-Item\b.*-Recurse/i, reason: "borrado recursivo" },
  { regex: /\bgit\s+push\b.*(--force|-f\b|--force-with-lease)/, reason: "git push --force" },
  { regex: /\bgit\s+reset\s+--hard\b/, reason: "git reset --hard" },
  { regex: /\bvercel\s+env\s+pull\b/, reason: "vercel env pull baja las claves" },
  {
    regex: /\bgrep\s+(-\w*[rR]\w*|--recursive)\b/,
    reason: "grep recursivo lee .env (usa la herramienta Grep)",
  },
];

// La configuracion de la IA (.claude) y este mismo hook (ia/hook): la IA no puede quitarse las reglas.
const PROTECTED_DIR = /(^|[\s"'\\/])(\.claude|ia[\\/]hook)[\\/]/i;
const PROTECTED_REASON = "La configuracion de la IA (.claude e ia/hook) no la edita la IA";
// Formas de escribir un archivo desde la terminal.
const WRITES =
  /(>|\btee\b|\bsed\s+-i|\bcp\b|\bmv\b|\brm\b|Set-Content|Out-File|Remove-Item|writeFile)/i;

const FILE_TOOLS = new Set(["Read", "Edit", "Write", "MultiEdit", "NotebookEdit", "Grep", "Glob"]);
const SHELL_TOOLS = new Set(["Bash", "PowerShell"]);

function isInside(projectDir, path) {
  const target = isAbsolute(path) ? path : resolve(projectDir, path);
  const rel = relative(projectDir, target);
  return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel));
}

const READ_ONLY_TOOLS = new Set(["Read", "Grep", "Glob"]);

// Ruta que toca una herramienta de archivos (cada herramienta la llama distinto).
function targetPath(input) {
  return input.file_path ?? input.notebook_path ?? input.path ?? "";
}

function checkFileTool(toolName, input, projectDir) {
  const path = targetPath(input);
  const globPattern = toolName === "Glob" ? (input.pattern ?? "") : (input.glob ?? "");
  if (SECRET_FILE.test(path) || SECRET_FILE.test(globPattern)) {
    return "El archivo puede tener secretos (.env, claves o keystore)";
  }
  if (path && !isInside(projectDir, path)) {
    return "La ruta esta fuera de la carpeta del proyecto";
  }
  if (!READ_ONLY_TOOLS.has(toolName) && PROTECTED_DIR.test(path)) {
    return PROTECTED_REASON;
  }
  return null;
}

// Rutas que salen del proyecto dentro de un comando: el home, la carpeta de arriba o una ruta absoluta ajena.
function leavesProject(command, projectDir) {
  if (/(^|[\s"'=])~([\\/]|\s|$)|\$HOME\b|\$env:USERPROFILE\b|%USERPROFILE%/i.test(command)) {
    return true;
  }
  if (/(^|[\s"'=])\.\.([\\/]|\s|$)/.test(command)) {
    return true;
  }
  const absolutes =
    command.match(/(?<![\w.-])(?:[A-Za-z]:[\\/]|\/(?:c|home|Users|etc|root)\/)[^\s"'|;&]*/g) ?? [];
  return absolutes.some((path) => !isInside(projectDir, path.replace(/^\/c\//, "C:/")));
}

function checkShellTool(input, projectDir) {
  const command = input.command ?? "";
  if (SECRET_FILE.test(command)) {
    return "El comando menciona un archivo con secretos (.env, claves o keystore)";
  }
  const danger = DANGEROUS_COMMANDS.find(({ regex }) => regex.test(command));
  if (danger) {
    return `Comando bloqueado: ${danger.reason}`;
  }
  if (leavesProject(command, projectDir)) {
    return "El comando usa rutas fuera de la carpeta del proyecto";
  }
  if (PROTECTED_DIR.test(command) && WRITES.test(command)) {
    return PROTECTED_REASON;
  }
  return null;
}

// Devuelve el motivo del bloqueo, o null si la llamada esta permitida.
export function checkToolCall(call, projectDir) {
  const input = call.tool_input ?? {};
  if (FILE_TOOLS.has(call.tool_name)) {
    return checkFileTool(call.tool_name, input, projectDir);
  }
  if (SHELL_TOOLS.has(call.tool_name)) {
    return checkShellTool(input, projectDir);
  }
  return null;
}

function decide() {
  try {
    const call = JSON.parse(readFileSync(0, "utf8"));
    const projectDir = process.env.CLAUDE_PROJECT_DIR ?? call.cwd ?? process.cwd();
    return checkToolCall(call, projectDir);
  } catch {
    // Si no se puede revisar la llamada, se bloquea: es mas seguro fallar cerrado.
    return "no se pudo revisar la llamada";
  }
}

function main() {
  const reason = decide();
  if (reason) {
    process.stderr.write(`Bloqueado por el hook del proyecto: ${reason}.\n`);
    process.exit(2);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
