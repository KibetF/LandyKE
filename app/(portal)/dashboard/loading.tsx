export default function DashboardLoading() {
  return (
    <>
      {/* Header skeleton */}
      <div style={{ marginBottom: "2.5rem" }}>
        <div
          style={{
            width: "280px",
            height: "2rem",
            background: "var(--warm)",
            borderRadius: "4px",
            marginBottom: "0.5rem",
          }}
        />
        <div
          style={{
            width: "220px",
            height: "0.8rem",
            background: "var(--warm)",
            borderRadius: "4px",
          }}
        />
      </div>

      {/* KPI skeleton */}
      <div
        className="kpi-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            style={{
              background: "var(--white)",
              borderRadius: "8px",
              padding: "1.5rem",
              border: "1px solid rgba(200,150,62,0.08)",
            }}
          >
            <div
              style={{
                width: "100px",
                height: "0.6rem",
                background: "var(--warm)",
                borderRadius: "3px",
                marginBottom: "0.8rem",
              }}
            />
            <div
              style={{
                width: "80px",
                height: "1.6rem",
                background: "var(--warm)",
                borderRadius: "4px",
                marginBottom: "0.5rem",
              }}
            />
            <div
              style={{
                width: "120px",
                height: "0.6rem",
                background: "var(--warm)",
                borderRadius: "3px",
              }}
            />
          </div>
        ))}
      </div>

      {/* Chart + Properties skeleton */}
      <div
        className="dashboard-grid-2"
        style={{
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr",
          gap: "1.5rem",
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            background: "var(--white)",
            borderRadius: "8px",
            border: "1px solid rgba(200,150,62,0.08)",
            height: "300px",
          }}
        >
          <div
            style={{
              padding: "1.2rem 1.5rem",
              borderBottom: "1px solid var(--warm)",
            }}
          >
            <div
              style={{
                width: "200px",
                height: "1rem",
                background: "var(--warm)",
                borderRadius: "4px",
              }}
            />
          </div>
          <div
            style={{
              padding: "1.5rem",
              display: "flex",
              alignItems: "flex-end",
              gap: "0.5rem",
              height: "220px",
            }}
          >
            {[60, 80, 70, 90, 85, 75].map((h, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${h}%`,
                  background: "var(--warm)",
                  borderRadius: "3px 3px 0 0",
                }}
              />
            ))}
          </div>
        </div>
        <div
          style={{
            background: "var(--white)",
            borderRadius: "8px",
            border: "1px solid rgba(200,150,62,0.08)",
          }}
        >
          <div
            style={{
              padding: "1.2rem 1.5rem",
              borderBottom: "1px solid var(--warm)",
            }}
          >
            <div
              style={{
                width: "100px",
                height: "1rem",
                background: "var(--warm)",
                borderRadius: "4px",
              }}
            />
          </div>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              style={{
                padding: "0.9rem 1.5rem",
                borderBottom: i < 3 ? "1px solid var(--warm)" : "none",
              }}
            >
              <div
                style={{
                  width: "140px",
                  height: "0.8rem",
                  background: "var(--warm)",
                  borderRadius: "3px",
                  marginBottom: "0.4rem",
                }}
              />
              <div
                style={{
                  width: "100px",
                  height: "0.6rem",
                  background: "var(--warm)",
                  borderRadius: "3px",
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Tenants + Transactions skeleton */}
      <div
        className="dashboard-grid-2"
        style={{
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr",
          gap: "1.5rem",
          marginBottom: "1.5rem",
        }}
      >
        {[...Array(2)].map((_, cardIdx) => (
          <div
            key={cardIdx}
            style={{
              background: "var(--white)",
              borderRadius: "8px",
              border: "1px solid rgba(200,150,62,0.08)",
            }}
          >
            <div
              style={{
                padding: "1.2rem 1.5rem",
                borderBottom: "1px solid var(--warm)",
              }}
            >
              <div
                style={{
                  width: "160px",
                  height: "1rem",
                  background: "var(--warm)",
                  borderRadius: "4px",
                }}
              />
            </div>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                style={{
                  padding: "0.9rem 1.5rem",
                  borderBottom: i < 3 ? "1px solid var(--warm)" : "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "50%",
                    background: "var(--warm)",
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      width: "120px",
                      height: "0.75rem",
                      background: "var(--warm)",
                      borderRadius: "3px",
                      marginBottom: "0.3rem",
                    }}
                  />
                  <div
                    style={{
                      width: "80px",
                      height: "0.6rem",
                      background: "var(--warm)",
                      borderRadius: "3px",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
