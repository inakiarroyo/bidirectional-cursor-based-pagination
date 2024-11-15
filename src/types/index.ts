// types/index.ts

export interface Project {
  id: number;
  name: string;
  // Add other fields as necessary
  conversationRelayId?: string; // If needed
}

export interface Edge {
  cursor: string;
  node: Project;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface PaginatedResponse {
  data: {
    edges: Edge[];
    pageInfo: PageInfo;
  };
}

export interface PageParam {
  after?: string;
  before?: string;
  first?: number;
  last?: number;
}
