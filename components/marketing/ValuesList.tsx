import { companyValues } from "./valuesData";

export default function ValuesList() {
  return (
    <div className="ledger-list keyed">
      {companyValues.map((v) => (
        <div key={v.key} className="ledger-list-row">
          <span className="ledger-list-key">{v.key}</span>
          <div>
            <h4
              className="font-serif"
              style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.4rem" }}
            >
              {v.title}
            </h4>
            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--muted)",
                lineHeight: 1.7,
                fontWeight: 300,
              }}
            >
              {v.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
