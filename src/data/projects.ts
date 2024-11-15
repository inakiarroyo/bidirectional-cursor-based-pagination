// data/projects.ts

import { Project } from '../types';

export const projectsData: Project[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `Project ${i + 1}`,
  // Add other fields as necessary
}));
