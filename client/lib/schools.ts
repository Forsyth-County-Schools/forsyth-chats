// Forsyth County Schools data and utilities

export interface School {
  name: string;
  abbreviation: string;
  category: 'high' | 'middle' | 'elementary';
}

export const FORSYTH_SCHOOLS: School[] = [
  // High Schools
  { name: "Alliance Academy for Innovation", abbreviation: "AAI", category: "high" },
  { name: "Denmark High School", abbreviation: "DEN", category: "high" },
  { name: "East Forsyth High School", abbreviation: "EAS", category: "high" },
  { name: "Forsyth Central High School", abbreviation: "FCH", category: "high" },
  { name: "Lambert High School", abbreviation: "LAM", category: "high" },
  { name: "North Forsyth High School", abbreviation: "NFH", category: "high" },
  { name: "South Forsyth High School", abbreviation: "SFH", category: "high" },
  { name: "West Forsyth High School", abbreviation: "WFH", category: "high" },
  
  // Middle Schools
  { name: "DeSana Middle School", abbreviation: "DES", category: "middle" },
  { name: "Hendricks Middle School", abbreviation: "HEN", category: "middle" },
  { name: "Lakeside Middle School", abbreviation: "LAK", category: "middle" },
  { name: "Liberty Middle School", abbreviation: "LIB", category: "middle" },
  { name: "Little Mill Middle School", abbreviation: "LMM", category: "middle" },
  { name: "North Forsyth Middle School", abbreviation: "NFM", category: "middle" },
  { name: "Otwell Middle School", abbreviation: "OTW", category: "middle" },
  { name: "Piney Grove Middle School", abbreviation: "PGM", category: "middle" },
  { name: "Riverwatch Middle School", abbreviation: "RIV", category: "middle" },
  { name: "South Forsyth Middle School", abbreviation: "SFM", category: "middle" },
  { name: "Vickery Creek Middle School", abbreviation: "VCM", category: "middle" },
  
  // Elementary Schools
  { name: "Big Creek Elementary School", abbreviation: "BIG", category: "elementary" },
  { name: "Brandywine Elementary School", abbreviation: "BRA", category: "elementary" },
  { name: "Brookwood Elementary School", abbreviation: "BRO", category: "elementary" },
  { name: "Chattahoochee Elementary School", abbreviation: "CHA", category: "elementary" },
  { name: "Chestatee Elementary School", abbreviation: "CHE", category: "elementary" },
  { name: "Coal Mountain Elementary School", abbreviation: "COA", category: "elementary" },
  { name: "Cumming Elementary School", abbreviation: "CUM", category: "elementary" },
  { name: "Daves Creek Elementary School", abbreviation: "DAV", category: "elementary" },
  { name: "Haw Creek Elementary School", abbreviation: "HAW", category: "elementary" },
  { name: "Johns Creek Elementary School", abbreviation: "JOH", category: "elementary" },
  { name: "Kelly Mill Elementary School", abbreviation: "KEL", category: "elementary" },
  { name: "Mashburn Elementary School", abbreviation: "MAS", category: "elementary" },
  { name: "Matt Elementary School", abbreviation: "MAT", category: "elementary" },
  { name: "Midway Elementary School", abbreviation: "MID", category: "elementary" },
  { name: "New Hope Elementary School", abbreviation: "NEW", category: "elementary" },
  { name: "Poole's Mill Elementary School", abbreviation: "POO", category: "elementary" },
  { name: "Sawnee Elementary School", abbreviation: "SAW", category: "elementary" },
  { name: "Settles Bridge Elementary School", abbreviation: "SET", category: "elementary" },
  { name: "Sharon Elementary School", abbreviation: "SHA", category: "elementary" },
  { name: "Shiloh Point Elementary School", abbreviation: "SHI", category: "elementary" },
  { name: "Silver City Elementary School", abbreviation: "SIL", category: "elementary" },
  { name: "Vickery Creek Elementary School", abbreviation: "VCE", category: "elementary" },
  { name: "Whitlow Elementary School", abbreviation: "WHI", category: "elementary" },
];

export const SCHOOL_ABBREVIATIONS: Record<string, School> = FORSYTH_SCHOOLS.reduce(
  (acc, school) => {
    acc[school.abbreviation] = school;
    return acc;
  },
  {} as Record<string, School>
);

export const SCHOOLS_BY_CATEGORY = {
  high: FORSYTH_SCHOOLS.filter(s => s.category === 'high'),
  middle: FORSYTH_SCHOOLS.filter(s => s.category === 'middle'),
  elementary: FORSYTH_SCHOOLS.filter(s => s.category === 'elementary'),
};

export function generateSchoolCode(schoolAbbreviation: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomPart = '';
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${schoolAbbreviation}-${randomPart}`;
}

export function parseSchoolCode(code: string): { school: School | null; randomPart: string } {
  const parts = code.split('-');
  if (parts.length !== 2) {
    return { school: null, randomPart: code };
  }
  
  const [abbrev, randomPart] = parts;
  const school = SCHOOL_ABBREVIATIONS[abbrev] || null;
  return { school, randomPart };
}