/**
 * The app's routes, grouped by the job they serve. One list for the sidebar and its test, so
 * a new route cannot be added to the app and forgotten in the navigation.
 */
export interface NavItem {
  href: string;
  label: string;
}

export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    id: "portfolio",
    label: "Portfolio",
    items: [
      { href: "/", label: "Account Health" },
      { href: "/interventions", label: "Interventions" },
      { href: "/manager", label: "Manager Decisions" },
    ],
  },
  {
    id: "signals",
    label: "Adoption signals",
    items: [
      { href: "/blockers", label: "Adoption Blockers" },
      { href: "/insights", label: "Adoption Insights" },
      { href: "/benchmarks", label: "Benchmarks" },
    ],
  },
  {
    id: "product-loop",
    label: "Product loop",
    items: [
      { href: "/feedback", label: "Product Feedback" },
      { href: "/research", label: "Research to Change" },
    ],
  },
];
