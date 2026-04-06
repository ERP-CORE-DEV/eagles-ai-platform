export type Goal =
  | "architecture-review"
  | "security-audit"
  | "test-coverage"
  | "bug-fix"
  | "new-feature"
  | "refactor"
  | "deploy"
  | "documentation"
  | "onboard";

export interface ResolvedProject {
  resolved: boolean;
  name: string;
  path: string;
  candidates?: string[];
}

export interface Layer {
  name: string;
  path: string;
  files: number;
  loc: number;
}

export interface ExpandedContext {
  layers: Layer[];
  totalFiles: number;
  totalLOC: number;
  techStack: string[];
  pastFindings: string[];
  claudeMdSummary: string;
}

export interface ClassifiedIntent {
  goal: Goal;
  confidence: number;
  alternatives?: [string, number][];
}

export interface MissionPlan {
  project: string;
  projectPath: string;
  goal: Goal;
  confidence: number;
  skills: string[];
  scope: ExpandedContext;
  dag: { enrolled: boolean; taskCount: number; parallel: number };
}
