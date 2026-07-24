// Shared by the homepage PortfolioSection and the /about coverage grid.
// Six of the eleven properties under management — a selection, not the full book.
export interface PortfolioProperty {
  name: string;
  area: string;
  type: string;
  units: number;
}

export const portfolioProperties: PortfolioProperty[] = [
  { name: "Elbros Business Park", area: "Near Royalton", type: "Mixed-Use", units: 18 },
  { name: "Sanshin House", area: "Sinai", type: "Commercial", units: 12 },
  { name: "Action Flats Phase 1", area: "Action", type: "Mixed-Use", units: 16 },
  { name: "Action Flats Phase 2", area: "Action", type: "Residential", units: 14 },
  { name: "Rock Center Parkview", area: "Rock Center", type: "Residential", units: 10 },
  { name: "Eldoville Villa", area: "Eldoville", type: "Residential", units: 8 },
];
