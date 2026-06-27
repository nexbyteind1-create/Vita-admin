export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  responseType?: "text" | "table" | "chart" | "cards" | "mixed";
  tableData?: { headers: string[]; rows: (string | number)[][] };
  chartData?: { type: "bar" | "line" | "area"; data: { label: string; value: number }[]; title: string };
  summaryCards?: { label: string; value: string | number; icon: string }[];
}

export const suggestedQuestions = [
  "How many users registered today?",
  "Which hospital had the highest appointments this month?",
  "Show Gold members who joined this month",
  "Total Wallet Credits issued today",
  "Show cancelled appointments this week",
  "Which laboratory has the most pending reports?",
  "Top 10 users by Wallet Credits",
  "Show users whose memberships expire this week",
  "Which doctor had the highest appointments this week?",
  "Show No Show appointments yesterday",
];

export const aiResponses: Record<string, AIMessage> = {
  "how many users registered today": {
    id: "r1",
    role: "assistant",
    content: "Here's the user registration summary for today:",
    timestamp: new Date().toISOString(),
    responseType: "cards",
    summaryCards: [
      { label: "Total Registered Today", value: "843", icon: "users" },
      { label: "Male Users", value: "489", icon: "user" },
      { label: "Female Users", value: "354", icon: "user" },
      { label: "With Membership", value: "124", icon: "shield" },
    ],
  },
  "which hospital had the highest appointments this month": {
    id: "r2",
    role: "assistant",
    content: "Here are the top hospitals by appointments this month:",
    timestamp: new Date().toISOString(),
    responseType: "mixed",
    tableData: {
      headers: ["Rank", "Hospital", "City", "Appointments", "Completed", "Cancelled"],
      rows: [
        [1, "Apollo Hospitals", "Hyderabad", 2842, 2410, 248],
        [2, "Fortis Healthcare", "Mumbai", 2418, 2080, 192],
        [3, "Max Healthcare", "Delhi", 2134, 1840, 178],
        [4, "KIMS Hospitals", "Hyderabad", 1892, 1640, 148],
        [5, "Yashoda Hospitals", "Hyderabad", 1684, 1480, 124],
      ],
    },
    chartData: {
      type: "bar",
      title: "Top Hospitals – Appointments This Month",
      data: [
        { label: "Apollo", value: 2842 },
        { label: "Fortis", value: 2418 },
        { label: "Max", value: 2134 },
        { label: "KIMS", value: 1892 },
        { label: "Yashoda", value: 1684 },
      ],
    },
  },
  "show gold members who joined this month": {
    id: "r3",
    role: "assistant",
    content: "Gold membership registrations for this month:",
    timestamp: new Date().toISOString(),
    responseType: "mixed",
    summaryCards: [
      { label: "New Gold Members", value: "1,248", icon: "shield" },
      { label: "Revenue Generated", value: "₹31,17,752", icon: "rupee" },
      { label: "Avg Age", value: "36 yrs", icon: "user" },
      { label: "From Upgrade", value: "312", icon: "trending-up" },
    ],
    tableData: {
      headers: ["UHID", "Name", "City", "Purchase Date", "Source"],
      rows: [
        ["VITA100245", "Lokesh Kumar", "Hyderabad", "Dec 01, 2024", "New Purchase"],
        ["VITA100248", "Ananya Krishnan", "Chennai", "Dec 03, 2024", "Upgrade from Silver"],
        ["VITA100251", "Ravi Kumar", "Bangalore", "Dec 05, 2024", "New Purchase"],
        ["VITA100254", "Meena Joshi", "Pune", "Dec 08, 2024", "Renewal"],
        ["VITA100257", "Arjun Nair", "Kochi", "Dec 10, 2024", "Upgrade from Silver"],
      ],
    },
  },
  "total wallet credits issued today": {
    id: "r4",
    role: "assistant",
    content: "Wallet Credits issued today across all sources:",
    timestamp: new Date().toISOString(),
    responseType: "cards",
    summaryCards: [
      { label: "Total Credits Issued", value: "48,420", icon: "wallet" },
      { label: "From Bill Uploads", value: "32,840", icon: "file" },
      { label: "From Lab Bills", value: "8,420", icon: "flask" },
      { label: "From Referrals", value: "7,160", icon: "users" },
    ],
  },
  "which laboratory has the most pending reports": {
    id: "r5",
    role: "assistant",
    content: "Laboratories ranked by pending reports:",
    timestamp: new Date().toISOString(),
    responseType: "table",
    tableData: {
      headers: ["Rank", "Laboratory", "City", "Total Bookings", "Pending Reports", "Avg TAT (hrs)"],
      rows: [
        [1, "SRL Diagnostics", "Hyderabad", 24820, 124, 18],
        [2, "Thyrocare", "Mumbai", 18420, 84, 24],
        [3, "LALS Path Labs", "Delhi", 14280, 42, 16],
        [4, "Dr. Lal PathLabs", "Bangalore", 12840, 38, 20],
        [5, "Vijaya Diagnostics", "Hyderabad", 10420, 34, 14],
      ],
    },
  },
};
