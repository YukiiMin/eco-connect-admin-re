/** Analytics mock data for RE */

export const volumeByType = [
  { date: "01/12", RECYCLABLE: 45, ORGANIC: 38, HAZARDOUS: 12, MIXED: 22 },
  { date: "05/12", RECYCLABLE: 52, ORGANIC: 41, HAZARDOUS: 9, MIXED: 28 },
  { date: "10/12", RECYCLABLE: 48, ORGANIC: 55, HAZARDOUS: 15, MIXED: 19 },
  { date: "15/12", RECYCLABLE: 61, ORGANIC: 43, HAZARDOUS: 11, MIXED: 31 },
  { date: "20/12", RECYCLABLE: 57, ORGANIC: 49, HAZARDOUS: 18, MIXED: 25 },
  { date: "25/12", RECYCLABLE: 44, ORGANIC: 36, HAZARDOUS: 8, MIXED: 17 },
  { date: "01/01", RECYCLABLE: 63, ORGANIC: 58, HAZARDOUS: 14, MIXED: 33 },
  { date: "05/01", RECYCLABLE: 71, ORGANIC: 62, HAZARDOUS: 20, MIXED: 29 },
  { date: "10/01", RECYCLABLE: 68, ORGANIC: 55, HAZARDOUS: 16, MIXED: 35 },
];

export const WASTE_COLORS = {
  RECYCLABLE: "#5B8DEF",
  ORGANIC: "#1DB36E",
  HAZARDOUS: "#E74C3C",
  MIXED: "#F5A623",
};

export const volumeByArea = [
  { area: "Khu A", RECYCLABLE: 189, ORGANIC: 156, HAZARDOUS: 45, MIXED: 88 },
  { area: "Khu B", RECYCLABLE: 167, ORGANIC: 142, HAZARDOUS: 38, MIXED: 74 },
  { area: "Khu C", RECYCLABLE: 143, ORGANIC: 121, HAZARDOUS: 29, MIXED: 61 },
];

export const collectionRate = [
  { date: "01/01", rate: 91.2 },
  { date: "02/01", rate: 94.5 },
  { date: "03/01", rate: 88.7 },
  { date: "04/01", rate: 96.1 },
  { date: "05/01", rate: 93.4 },
  { date: "06/01", rate: 91.8 },
  { date: "07/01", rate: 97.2 },
  { date: "08/01", rate: 94.6 },
  { date: "09/01", rate: 95.3 },
  { date: "10/01", rate: 92.1 },
];

export const performanceSummary = {
  totalReports: 847,
  totalCollected: 798,
  collectionRate: 94.2,
  avgProcessTime: "2h 14m",
  topArea: "Khu A",
  hazardousHandled: 112,
};
