export interface CourseInfo {
  title: string;
  level: string;
  provider: string;
  framework: string;
  courseUrl: string;
  tagline: string;
}

export interface ModuleItem {
  id: number;
  code: string;
  title: string;
  short: string;
  pages: number;
  file: string;
  outcomes: string[];
  keywords: string[];
}

export interface AssessmentItem {
  id: string;
  title: string;
  file: string;
  pages: number;
  summary: string;
  tags: string[];
}

export interface ProjectItem {
  slug: string;
  job: number;
  title: string;
  time: string;
  summary: string;
  stack: string[];
  related: number[];
  features: string[];
  run: string[];
  setup: string | null;
}

export interface LearningPathStep {
  step: string;
  module: number;
}

export interface HubData {
  course: CourseInfo;
  modules: ModuleItem[];
  assessment: AssessmentItem[];
  projects: ProjectItem[];
  learningPath: LearningPathStep[];
}

export interface TreeEntry {
  path: string;
  size: number;
  text: boolean;
}

export interface TreeNode {
  dirs: Record<string, TreeNode>;
  files: (TreeEntry & { name: string })[];
}

export interface SearchHit {
  g: string; // Group: 'Modules' | 'Projects' | 'Assessment' | 'Files'
  t: string; // Title
  s: string; // Subtitle / summary
  h: string; // Hash href
  k: string; // Keywords
}
