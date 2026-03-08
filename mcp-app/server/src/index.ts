import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

import {
  registerAppResource,
  registerAppTool,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import http from "node:http";
import { z } from "zod";

type Product = {
  id: string;
  name: string;
  capacityKw: number;
  areaLabel?: string;
  price: number;
};

type ToolInput = {
  roomArea: number;
  roomHeight?: number;
  orientation?: string;
  maxBudget?: number;
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, "..", "..");
const DATA_PATH = path.resolve(APP_ROOT, "..", "data", "dreamair-product-import.csv");
const WEB_DIST = path.resolve(APP_ROOT, "web", "dist");

const COLOR_PICKER_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Color Picker</title>
    <style>
      :root {
        color-scheme: light dark;
        --card-bg: color-mix(in srgb, canvas, canvastext 4%);
        --border: color-mix(in srgb, canvastext 12%, canvas 80%);
        --text-muted: color-mix(in srgb, canvastext 60%, canvas 40%);
      }
      * { box-sizing: border-box; font-family: "Inter", "Segoe UI", system-ui, sans-serif; }
      body { margin: 0; padding: 16px; background: radial-gradient(circle at 20% 20%, #f5f5ff 0, #fdfdfd 40%, #ffffff 75%); color: canvastext; }
      .card {
        max-width: 420px;
        margin: 0 auto;
        padding: 16px 18px;
        background: var(--card-bg);
        border: 1px solid var(--border);
        border-radius: 14px;
        box-shadow: 0 10px 50px rgba(0,0,0,0.06);
      }
      h1 {
        margin: 0 0 4px;
        font-size: 18px;
        letter-spacing: -0.02em;
      }
      p { margin: 4px 0 14px; color: var(--text-muted); font-size: 13px; }
      .picker-row { display: flex; gap: 12px; align-items: center; }
      #color-input {
        flex: 0 0 56px;
        width: 56px;
        height: 42px;
        border: 1px solid var(--border);
        border-radius: 10px;
        background: transparent;
        padding: 0;
      }
      .swatch {
        flex: 1;
        padding: 10px 12px;
        border: 1px solid var(--border);
        border-radius: 10px;
        background: linear-gradient(135deg, #ffffff80, #f6f8ff80);
        display: grid;
        grid-template-columns: 48px 1fr;
        gap: 10px;
        align-items: center;
      }
      .swatch-dot {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        border: 1px solid var(--border);
        background: var(--color, #7c3aed);
        box-shadow: inset 0 0 0 1px #ffffff90;
      }
      .value { font-weight: 600; font-size: 15px; letter-spacing: 0.02em; }
      button {
        margin-top: 14px;
        width: 100%;
        border: none;
        border-radius: 12px;
        padding: 12px 14px;
        font-weight: 600;
        background: linear-gradient(135deg, var(--color, #7c3aed), color-mix(in srgb, var(--color, #7c3aed) 70%, white));
        color: #fff;
        cursor: pointer;
        box-shadow: 0 10px 30px color-mix(in srgb, var(--color, #7c3aed), #000 12%);
        transition: transform 120ms ease, box-shadow 160ms ease;
      }
      button:hover { transform: translateY(-1px); }
      button:active { transform: translateY(0); box-shadow: 0 4px 18px color-mix(in srgb, var(--color, #7c3aed), #000 18%); }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Pick a color</h1>
      <p>Choose a hex color; we\u2019ll send it back to the chat.</p>
      <div class="picker-row">
        <input id="color-input" type="color" value="#7c3aed" aria-label="Color input" />
        <div class="swatch">
          <div class="swatch-dot" id="swatch"></div>
          <div class="value" id="value">#7c3aed</div>
        </div>
      </div>
      <button id="send-btn">Send color</button>
    </div>
    <script type="module">
      const picker = document.getElementById("color-input");
      const swatch = document.getElementById("swatch");
      const valueEl = document.getElementById("value");
      const btn = document.getElementById("send-btn");

      const applyColor = (color) => {
        if (!color) return;
        picker.value = color;
        document.documentElement.style.setProperty("--color", color);
        swatch.style.setProperty("--color", color);
        valueEl.textContent = color;
      };

      const sendToHost = (color) => {
        const payload = { role: "user", content: [{ type: "text", text: \`Selected color: \${color}\` }] };
        // MCP Apps bridge (generic)
        window.parent?.postMessage(
          { jsonrpc: "2.0", method: "ui/message", params: payload },
          "*"
        );
        // ChatGPT-specific helper (if available)
        if (window.openai?.sendFollowUpMessage) {
          window.openai.sendFollowUpMessage(payload);
        }
      };

      picker.addEventListener("input", (e) => applyColor(e.target.value));
      btn.addEventListener("click", () => sendToHost(picker.value));

      window.addEventListener("message", (event) => {
        const data = event.data;
        if (data?.method === "ui/notifications/tool-result") {
          const color = data?.params?.structuredContent?.color;
          if (color) applyColor(color);
        }
      });

      // Initialize from URL param or default
      const urlColor = new URLSearchParams(location.search).get("color");
      applyColor(urlColor || "#7c3aed");
    </script>
  </body>
</html>`;

function parseNumber(input: string): number {
  const numeric = Number(
    input
      .replace(/[^\d.,-]/g, "")
      .replace(",", ".")
      .trim()
  );
  return Number.isFinite(numeric) ? numeric : 0;
}

function loadCatalog(): Product[] {
  try {
    const csv = readFileSync(DATA_PATH, "utf-8");
    const lines = csv.split(/\r?\n/).filter(Boolean);
    const [, ...rows] = lines;

    return rows.map((row) => {
      const cols = row.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/g);
      const handle = cols[0] ?? "unknown";
      const name = cols[1] ?? "Produkt";
      const price = parseNumber(cols[2] ?? "0");
      const capacityKw = parseNumber(cols[7] ?? "0");
      const areaLabel = cols[11];

      return {
        id: `${handle}-${capacityKw || Math.random().toString(16).slice(2, 6)}`,
        name,
        capacityKw,
        areaLabel,
        price,
      };
    });
  } catch (error) {
    console.warn("Catalog not found, falling back to static data", error);
    return [
      { id: "demo-25", name: "Daikin Comfora 2.5 kW", capacityKw: 2.5, areaLabel: "do 25 m2", price: 1590 },
      { id: "demo-35", name: "Daikin Comfora 3.5 kW", capacityKw: 3.5, areaLabel: "do 40 m2", price: 1690 },
      { id: "demo-50", name: "Daikin Comfora 5.0 kW", capacityKw: 5.0, areaLabel: "do 60 m2", price: 2050 },
    ];
  }
}

const catalog = loadCatalog();

function estimateCoolingLoad({ roomArea, roomHeight = 2.7, orientation }: ToolInput) {
  const baseBtu = roomArea * 215 * (roomHeight / 2.7);
  const orientationBoost = orientation && ["south", "west", "south-west"].includes(orientation)
    ? 1.1
    : 1.0;
  const totalBtu = Math.round(baseBtu * orientationBoost);
  const kw = Number((totalBtu / 3412.14).toFixed(2));
  return { totalBtu, kw, orientationBoost };
}

function pickModels(kwNeeded: number, maxBudget?: number): Product[] {
  const sorted = [...catalog].sort((a, b) => {
    const diffA = Math.abs(a.capacityKw - kwNeeded);
    const diffB = Math.abs(b.capacityKw - kwNeeded);
    if (diffA !== diffB) return diffA - diffB;
    return (a.price || 0) - (b.price || 0);
  });

  const filtered = maxBudget
    ? sorted.filter((item) => item.price <= maxBudget)
    : sorted;

  return (filtered.length ? filtered : sorted).slice(0, 3);
}

async function buildWidgetHtml(): Promise<string> {
  const js = readFileSync(path.join(WEB_DIST, "smartair-widget.js"), "utf-8");
  const css = readFileSync(path.join(WEB_DIST, "smartair-widget.css"), "utf-8");
  return `
<div id="smartair-root"></div>
<style>${css}</style>
<script type="module">
${js}
</script>
`.trim();
}

async function main() {
  const server = new McpServer({ name: "smartair-mcp", version: "0.1.0" });

  registerAppResource(
    server,
    "smartair-configurator",
    "ui://widget/smartair-configurator-v1.html",
    {},
    async () => ({
      contents: [
        {
          uri: "ui://widget/smartair-configurator-v1.html",
          mimeType: RESOURCE_MIME_TYPE,
          text: await buildWidgetHtml(),
          _meta: {
            ui: {
              prefersBorder: true,
              domain: "https://smartair.space",
              csp: {
                connectDomains: [],
                resourceDomains: [],
              },
            },
            "openai/widgetDescription": "Interaktívny výber klimatizácie a montáže Dream Air.",
          },
        },
      ],
    })
  );

  registerAppResource(
    server,
    "color-picker",
    "ui://widget/color-picker-v1.html",
    {},
    async () => ({
      contents: [
        {
          uri: "ui://widget/color-picker-v1.html",
          mimeType: RESOURCE_MIME_TYPE,
          text: COLOR_PICKER_HTML,
          _meta: {
            ui: {
              prefersBorder: true,
            },
            "openai/widgetDescription": "Simple MCP App color picker that echoes your selection to the chat.",
          },
        },
      ],
    })
  );

  registerAppTool(
    server,
    "color_picker",
    {
      title: "Open color picker",
      description: "Use this to show a color picker UI and capture the user\u2019s chosen color.",
      inputSchema: {
        initialColor: z
          .string()
          .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
          .optional(),
      },
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
        idempotentHint: true,
      },
      _meta: {
        ui: {
          resourceUri: "ui://widget/color-picker-v1.html",
          visibility: ["model", "app"],
        },
        "openai/toolInvocation/invoking": "Opening the color picker...",
        "openai/toolInvocation/invoked": "Color picker ready.",
      },
    },
    async (input: { initialColor?: string }) => {
      const color = input.initialColor ?? "#7c3aed";
      return {
        structuredContent: { color },
        content: [{ type: "text", text: `Showing the color picker (starting at ${color}).` }],
        _meta: {
          // Host-specific data, kept small for transport
          initialColor: color,
        },
      };
    }
  );

  registerAppTool(
    server,
    "smartair_recommend",
    {
      title: "Odporučiť klimatizáciu",
      description: "Use this when you need to size and suggest Dream Air AC models.",
      inputSchema: {
        roomArea: z.number().positive(),
        roomHeight: z.number().optional(),
        orientation: z.enum(["north", "east", "south", "west", "south-west", "north-west"]).optional(),
        maxBudget: z.number().optional(),
      },
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
      _meta: {
        ui: {
          resourceUri: "ui://widget/smartair-configurator-v1.html",
          visibility: ["model", "app"],
        },
        "openai/toolInvocation/invoking": "Počítam výkon a hľadám vhodné modely...",
        "openai/toolInvocation/invoked": "Mám odporúčanie pripravené.",
      },
    },
    async (input: ToolInput) => {
      const load = estimateCoolingLoad(input);
      const suggestions = pickModels(load.kw, input.maxBudget);

      const structuredContent = {
        roomArea: input.roomArea,
        roomHeight: input.roomHeight ?? 2.7,
        orientation: input.orientation,
        recommendedKw: load.kw,
        recommendedBtu: load.totalBtu,
        topModels: suggestions.map((s) => ({
          id: s.id,
          name: s.name,
          capacityKw: s.capacityKw,
          areaLabel: s.areaLabel,
          price: s.price,
        })),
      };

      const contentText = [
        `Odporúčaný výkon: ${load.kw} kW (~${load.totalBtu} BTU).`,
        suggestions.length
          ? `Najbližšie modely: ${suggestions.map((s) => `${s.name} (${s.capacityKw} kW)`).join(", ")}.`
          : "V katalógu som nenašiel žiadne modely v rozpočte.",
      ].join(" ");

      return {
        structuredContent,
        content: [{ type: "text", text: contentText }],
        _meta: {
          catalogSample: suggestions,
          orientationBoost: load.orientationBoost,
        },
      };
    }
  );

  const port = Number(process.env.PORT || 3030);
  const transport = new StreamableHTTPServerTransport({});
  await server.connect(transport);

  const httpServer = http.createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
    if (req.method === "GET" && url.pathname === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok" }));
      return;
    }
    if (url.pathname === "/mcp") {
      try {
        await transport.handleRequest(req, res);
      } catch (err) {
        console.error("Transport error", err);
        if (!res.headersSent) {
          res.writeHead(500, { "Content-Type": "application/json" });
        }
        res.end(JSON.stringify({ error: "mcp transport error" }));
      }
      return;
    }
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "not found" }));
  });

  httpServer.listen(port, () => {
    console.log(`SmartAir MCP server running on http://localhost:${port}/mcp`);
  });
}

main().catch((err) => {
  console.error("Failed to start MCP server", err);
  process.exit(1);
});
