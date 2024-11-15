import type { NextApiRequest, NextApiResponse } from 'next';
import { encodeCursor, decodeCursor } from '../../utils/cursor';
import { projectsData } from '../../data/projects';
import { PaginatedResponse } from '../../types';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaginatedResponse | { error: string }>
) {
  const { conversationRelayId, after, before, first, last } = req.query;

  // Optional: Filter based on conversationRelayId
  let filteredProjects = projectsData;
  if (conversationRelayId && typeof conversationRelayId === 'string') {
    filteredProjects = filteredProjects.filter(
      (project) => project.conversationRelayId === conversationRelayId
    );
  }

  let startIndex = 0;
  let endIndex = filteredProjects.length;

  // Handle 'after' cursor
  if (after && typeof after === 'string') {
    try {
      const afterId = decodeCursor(after);
      const index = filteredProjects.findIndex(
        (project) => project.id === afterId
      );
      if (index !== -1) {
        startIndex = index + 1;
      }
    } catch (error) {
      return res.status(400).json({ error: 'Invalid after cursor' });
    }
  }

  // Handle 'before' cursor
  if (before && typeof before === 'string') {
    try {
      const beforeId = decodeCursor(before);
      const index = filteredProjects.findIndex(
        (project) => project.id === beforeId
      );
      if (index !== -1) {
        endIndex = index;
      }
    } catch (error) {
      return res.status(400).json({ error: 'Invalid before cursor' });
    }
  }

  let slicedData = filteredProjects.slice(startIndex, endIndex);

  // Handle 'first' and 'last'
  let firstInt: number | undefined;
  let lastInt: number | undefined;

  if (first) {
    firstInt = parseInt(first as string, 10);
    if (!isNaN(firstInt)) {
      slicedData = slicedData.slice(0, firstInt);
    }
  }

  if (last) {
    lastInt = parseInt(last as string, 10);
    if (!isNaN(lastInt)) {
      slicedData = slicedData.slice(-lastInt);
    }
  }

  const edges = slicedData.map((project) => ({
    cursor: encodeCursor(project.id),
    node: project,
  }));

  const firstEdge = edges[0];
  const lastEdge = edges[edges.length - 1];

  // Determine if 'first' or 'last' was used
  const isFirstFetch = first !== undefined && last === undefined;
  const isLastFetch = last !== undefined && first === undefined;

  // Calculate hasNextPage and hasPreviousPage based on fetch direction
  let hasNextPage = false;
  let hasPreviousPage = false;

  if (isFirstFetch) {
    hasNextPage = endIndex < filteredProjects.length;
    hasPreviousPage = after ? true : false;
  } else if (isLastFetch) {
    hasPreviousPage = filteredProjects.length > (lastInt || 0);
    hasNextPage = before ? true : false;
  } else {
    // If both 'first' and 'last' are used or neither, set default behavior
    hasPreviousPage = startIndex > 0;
    hasNextPage = endIndex < filteredProjects.length;
  }

  // Debugging: Log the pagination flags
  console.log({
    isFirstFetch,
    isLastFetch,
    hasNextPage,
    hasPreviousPage,
    firstInt,
    lastInt,
    startIndex,
    endIndex,
    slicedDataLength: slicedData.length,
  });

  res.status(200).json({
    data: {
      edges,
      pageInfo: {
        hasNextPage,
        hasPreviousPage,
        startCursor: firstEdge ? firstEdge.cursor : null,
        endCursor: lastEdge ? lastEdge.cursor : null,
      },
    },
  });
}
