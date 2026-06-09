export interface JourneyStage {
  id: string;
  num: string;
  title: string;
  duration: string;
  summary: string;
  focusAreas: string[];
  skillsAcquired: string[];
}

export interface Mentor {
  name: string;
  role: string;
  firm: string;
  background: string;
  monochromeImage: string;
  details: string;
}

export interface MemoPage {
  title: string;
  tag: string;
  content: string;
  evidence: string[];
  metricLabel?: string;
  metricVal?: string;
}
