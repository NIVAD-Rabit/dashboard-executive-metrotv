// Import icon house dari lucide
import {
  House,
  // Import icon bar chart 2 dari lucide
  BarChart2,
  // Import icon git compare dari lucide
  GitCompare,
  // Import icon database dari lucide
  Database,
  // Import icon shield alert dari lucide
  ShieldAlert,
  // Import icon line chart dari lucide
  LineChart,
  // Import icon bar chart 3 dari lucide
  BarChart3,
  // Import icon x dari lucide
  X,
  // Import icon layout dashboard dari lucide
  LayoutDashboard,
} from "lucide-react";

// Variabel tampungan konfigurasi grup menu aplikasi
export const menuGroups = [
  {
    // Nama grup menu utama
    group: "EXECUTIVE VIEW",
    // Isi item navigasi grup tersebut
    items: [
      // Menu dashboard utama
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
      // Komen menu finansial yang lagi dimatiin
      // { name: "Finansial & Efisiensi", href: "/financial", icon: BarChart2 },
      // Komen menu operasional yang lagi dimatiin
      // { name: "Operasional & Rating", href: "/operation", icon: LineChart },
    ],
  },
  {
    // Nama grup menu tools
    group: "ANALYTICS TOOLS",
    // Isi item navigasi grup tersebut
    items: [
      // Menu details analytics
      { name: "Details", href: "/details", icon: BarChart3 },
      // Menu compare antar program
      { name: "Compare", href: "/compare", icon: GitCompare },
    ],
  },
  {
    // Nama grup menu master
    group: "MASTER DATA",
    // Isi item navigasi grup tersebut
    items: [
      // Komen master data yang lagi dimatiin
      // { name: "Master Data", href: "/master-program", icon: Database },
      // Komen target realisasi yang lagi dimatiin
      // {
      //   name: "Target & Realisasi",
      //   href: "/master-realisasi",
      //   icon: ShieldAlert,
      // },
    ],
  },
];
