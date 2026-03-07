export const metadata = {
  title: "Hospital Command Center",
  description: "Operational command center for hospital bed, oxygen, and medicine continuity.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function DashboardLayout({ children }) {
  return children;
}
