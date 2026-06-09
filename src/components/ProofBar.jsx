const STATS = [
  { value: "2 000+", label: "pagayeurs actifs" },
  { value: "150+",   label: "spots vérifiés" },
  { value: "12",     label: "pays couverts" },
  { value: "4.9★",   label: "note moyenne" },
];

export default function ProofBar() {
  return (
    <div
      aria-label="Chiffres clés FleuVibe"
      style={{ background: "#fff", borderBottom: "1px solid #e8f0ed", padding: "0 24px" }}
    >
      <div style={{ maxWidth: "860px", margin: "0 auto", display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: "0" }}>
        {STATS.map(({ value, label }) => (
          <div key={label} style={{ padding: "20px 16px", textAlign: "center", flex: "1 1 120px" }}>
            <div style={{ fontSize: "clamp(1.3rem,3vw,1.7rem)", fontWeight: 900, color: "#1a9e6e", letterSpacing: "-0.5px", fontFamily: "'Fraunces', Georgia, serif" }}>{value}</div>
            <div style={{ fontSize: "0.72rem", color: "#8aa89e", fontWeight: 500, marginTop: "2px" }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
