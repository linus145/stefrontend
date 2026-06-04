// Filter option sets for search dropdowns
export const dateOptions = [
  { label: 'Any time', value: '' },
  { label: 'Past 24 hours', value: '24h' },
  { label: 'Past week', value: 'week' },
  { label: 'Past month', value: 'month' }
];

export const modeOptions = [
  { label: 'Remote', value: 'REMOTE' },
  { label: 'Hybrid', value: 'HYBRID' },
  { label: 'On-site', value: 'ONSITE' }
];

export const expOptions = [
  { label: 'Entry Level', value: 'ENTRY' },
  { label: 'Mid Level', value: 'MID' },
  { label: 'Senior Level', value: 'SENIOR' },
  { label: 'Lead / Principal', value: 'LEAD' }
];

export const typeOptions = [
  { label: 'Full-time', value: 'FULL_TIME' },
  { label: 'Part-time', value: 'PART_TIME' },
  { label: 'Contract', value: 'CONTRACT' },
  { label: 'Internship', value: 'INTERNSHIP' }
];

export const matchOptions = [
  { label: 'All Matches', value: 0 },
  { label: 'Good Fit (> 80%)', value: 80 },
  { label: 'Excellent Fit (> 90%)', value: 90 }
];

// Helper formatting for Experience levels
export const formatExpLevel = (level: string) => {
  switch (level) {
    case 'ENTRY': return 'Entry Level';
    case 'MID': return 'Mid Level';
    case 'SENIOR': return 'Senior Level';
    case 'LEAD': return 'Lead / Principal';
    default: return level;
  }
};

export const formatJobType = (type: string) => {
  switch (type) {
    case 'FULL_TIME': return 'Full-time';
    case 'PART_TIME': return 'Part-time';
    case 'CONTRACT': return 'Contract';
    case 'INTERNSHIP': return 'Internship';
    default: return type;
  }
};

// Keyword suggestions based on search query
export const getKeywordSuggestions = (query: string) => {
  const q = query.toLowerCase();
  if (q.includes('python') || q.includes('django')) {
    return ['Django', 'Flask', 'REST API', 'AWS', 'PostgreSQL', 'FastAPI'];
  }
  if (q.includes('react') || q.includes('frontend') || q.includes('developer') || q.includes('web') || q.includes('typescript')) {
    return ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Redux', 'GraphQL'];
  }
  if (q.includes('design') || q.includes('ui') || q.includes('ux') || q.includes('product')) {
    return ['Figma', 'UI/UX', 'Product Design', 'Web Design', 'Prototyping', 'Adobe XD'];
  }
  return ['Python', 'React', 'Node.js', 'SaaS', 'AWS', 'AI/ML'];
};

export const PAGE_SIZE = 20;
