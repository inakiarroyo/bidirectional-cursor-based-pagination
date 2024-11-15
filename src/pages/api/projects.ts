// pages/api/projects.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { encodeCursor, decodeCursor } from '../../utils/cursor';
import { projectsData } from '../../data/projects';
import { PaginatedResponse } from '../../types';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaginatedResponse | { error: string }>
) {
  const { conversationRelayId, after, before, first, last } = req.query;

  const allProjects = projectsData;

  // Validate that only one of 'first' or 'last' is used
  if (first !== undefined && last !== undefined) {
    return res
      .status(400)
      .json({ error: 'Cannot specify both first and last' });
  }

  // Determine fetch direction
  const fetchFirst = first !== undefined;
  const fetchLast = last !== undefined;

  // Handle 'after' and 'before' cursors to find start and end indices
  let startIndex = 0;
  let endIndex = allProjects.length;

  if (after && typeof after === 'string') {
    try {
      const afterId = decodeCursor(after);
      const index = allProjects.findIndex((project) => project.id === afterId);
      if (index !== -1) {
        startIndex = index + 1;
      }
    } catch (error) {
      return res.status(400).json({ error: 'Invalid after cursor' });
    }
  }

  if (before && typeof before === 'string') {
    try {
      const beforeId = decodeCursor(before);
      const index = allProjects.findIndex((project) => project.id === beforeId);
      if (index !== -1) {
        endIndex = index;
      }
    } catch (error) {
      return res.status(400).json({ error: 'Invalid before cursor' });
    }
  }

  let slicedData = allProjects.slice(startIndex, endIndex);

  // Initialize variables for pagination flags
  let hasNextPage = false;
  let hasPreviousPage = false;

  if (fetchFirst) {
    // Fetch 'first' items plus one to check for more
    const firstInt = parseInt(first as string, 10);
    if (isNaN(firstInt) || firstInt <= 0) {
      return res.status(400).json({ error: 'Invalid first parameter' });
    }

    const slicedWithExtra = slicedData.slice(0, firstInt + 1);
    if (slicedWithExtra.length > firstInt) {
      hasNextPage = true;
      slicedData = slicedWithExtra.slice(0, firstInt);
    } else {
      hasNextPage = false;
      slicedData = slicedWithExtra;
    }

    hasPreviousPage = after ? true : false;
  }

  if (fetchLast) {
    // Fetch 'last' items plus one to check for more
    const lastInt = parseInt(last as string, 10);
    if (isNaN(lastInt) || lastInt <= 0) {
      return res.status(400).json({ error: 'Invalid last parameter' });
    }

    const slicedWithExtra = slicedData.slice(-lastInt - 1);
    if (slicedWithExtra.length > lastInt) {
      hasPreviousPage = true;
      slicedData = slicedWithExtra.slice(-lastInt);
    } else {
      hasPreviousPage = false;
      slicedData = slicedWithExtra;
    }

    hasNextPage = before ? true : false;
  }

  // Create edges
  const edges = slicedData.map((project) => ({
    cursor: encodeCursor(project.id),
    node: project,
  }));

  const firstEdge = edges[0];
  const lastEdge = edges[edges.length - 1];

  // Debugging: Log the pagination flags and indices
  console.log({
    fetchFirst,
    fetchLast,
    hasNextPage,
    hasPreviousPage,
    first,
    last,
    after,
    before,
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
