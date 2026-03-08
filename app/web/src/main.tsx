import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";

type ToolResult = {
  structuredContent?: Record<string, unknown>;
  content?: unknown;
  _meta?: unknown;
};

type Recommendation = {
  recommendedKw?: number;
  recommendedBtu?: number;
  roomArea?: number;
  roomHeight?: number;
  orientation?: string;
  topModels?: { id: string; name: string; capacityKw: number; price?: number }[];
};

function useLatestToolResult() {
  const [result, setResult] = useState<ToolResult | null>(null);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const msg = event.data;
      if (!msg || msg.jsonrpc !== "2.0") return;
      if (msg.method !== "ui/notifications/tool-result") return;
      setResult(msg.params ?? null);
    };

    window.addEventListener("message", handler, { passive: true });
    return () => window.removeEventListener("message", handler);
  }, []);

  return result;
}

function callTool(name: string, args: Record<string, unknown>) {
  const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(16).slice(2);
  window.parent?.postMessage(
    {
      jsonrpc: "2.0",
      id,
      method: "tools/call",
      params: { name, arguments: args },
    },
    "*"
  );
}

function App() {
  const toolResult = useLatestToolResult();

  const rec = useMemo<Recommendation | null>(() => {
    const data = toolResult?.structuredContent ?? {};
    return data as Recommendation;
  }, [toolResult]);

  return (
    <div style={styles.card}>
      <header style={styles.header}>
        <div>
          <div style={styles.eyebrow}>SmartAir • ChatGPT App</div>
          <h2 style={{ margin: 0 }}>Výber klimatizácie</h2>
          <p style={styles.muted}>Renderuje posledný výsledok z MCP nástroja (ui/notifications/tool-result).</p>
        </div>
        <button
          style={styles.button}
          onClick={() =>
            callTool("smartair_recommend", {
              roomArea: 25,
              roomHeight: 2.7,
              orientation: "south",
              maxBudget: 2000,
            })
          }
        >
          Spustiť demo výpočet
        </button>
      </header>

      {!rec?.recommendedKw ? (
        <p style={styles.muted}>Zatiaľ nemám žiadny výsledok. Spusti nástroj v chat-e alebo klikni na demo.</p>
      ) : (
        <div style={styles.summary}>
          <div>
            <div style={styles.label}>Odporúčaný výkon</div>
            <div style={styles.value}>{rec.recommendedKw} kW</div>
            <div style={styles.muted}>≈ {rec.recommendedBtu} BTU</div>
          </div>
          <div>
            <div style={styles.label}>Parametre</div>
            <div style={styles.muted}>Plocha: {rec.roomArea} m²</div>
            <div style={styles.muted}>Výška: {rec.roomHeight} m</div>
            <div style={styles.muted}>Orientácia: {rec.orientation ?? "—"}</div>
          </div>
        </div>
      )}

      {rec?.topModels?.length ? (
        <div style={styles.list}>
          {rec.topModels.map((m) => (
            <div key={m.id} style={styles.item}>
              <div>
                <div style={styles.itemTitle}>{m.name}</div>
                <div style={styles.muted}>{m.capacityKw} kW</div>
              </div>
              {m.price ? <div style={styles.price}>{m.price} €</div> : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    background: "#0f172a",
    color: "#e2e8f0",
    borderRadius: 16,
    padding: 16,
    maxWidth: 680,
    margin: "0 auto",
  },
  header: { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" },
  eyebrow: { letterSpacing: "0.08em", textTransform: "uppercase", fontSize: 12, color: "#94a3b8" },
  muted: { color: "#94a3b8", margin: "4px 0" },
  button: {
    background: "linear-gradient(135deg,#3b82f6 0%,#06b6d4 100%)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 700,
  },
  summary: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: 12,
    marginTop: 12,
    background: "#111827",
    borderRadius: 12,
    padding: 12,
  },
  label: { fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", color: "#cbd5e1" },
  value: { fontSize: 26, fontWeight: 800, margin: "4px 0" },
  list: { marginTop: 12, display: "flex", flexDirection: "column", gap: 8 },
  item: {
    background: "#111827",
    borderRadius: 12,
    padding: 12,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemTitle: { fontWeight: 700, color: "#e2e8f0" },
  price: { fontWeight: 800, color: "#a5f3fc" },
};

const mount = document.getElementById("root") || (() => {
  const div = document.createElement("div");
  div.id = "root";
  document.body.appendChild(div);
  return div;
})();

createRoot(mount).render(<App />);
