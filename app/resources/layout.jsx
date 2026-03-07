export const metadata = {
  title: "Resource Desk",
  description: "Manage live hospital inventory for beds, oxygen sources, and critical medicines.",
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

export default function ResourcesLayout({ children }) {
  return children;
}
