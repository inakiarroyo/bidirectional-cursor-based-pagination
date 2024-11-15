import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextApiRequest, NextApiResponse } from 'next';
import handler from '../pages/api/projects';
import { encodeCursor } from '../utils/cursor';

// Helper function to create a mock NextApiResponse
const createMockResponse = () => {
  const res: Partial<NextApiResponse> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as NextApiResponse;
};

describe('API Route /api/projects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return first 5 projects with hasNextPage: true and hasPreviousPage: false when fetching with { first: 5 }', async () => {
    const req = {
      query: {
        first: '5',
      },
    } as unknown as NextApiRequest;

    const res = createMockResponse();

    await handler(req, res);

    const responseData = (res.json as vi.Mock).mock.calls[0][0].data;

    expect(responseData.edges).toHaveLength(5);
    expect(responseData.edges[0].node.id).toBe(1);
    expect(responseData.edges[4].node.id).toBe(5);
    expect(responseData.pageInfo.hasNextPage).toBe(true);
    expect(responseData.pageInfo.hasPreviousPage).toBe(false);
    expect(responseData.pageInfo.startCursor).toBe(encodeCursor(1));
    expect(responseData.pageInfo.endCursor).toBe(encodeCursor(5));
  });

  it('should return last 5 projects with hasNextPage: false and hasPreviousPage: true when fetching with { last: 5 }', async () => {
    const req = {
      query: {
        last: '5',
      },
    } as unknown as NextApiRequest;

    const res = createMockResponse();

    await handler(req, res);

    const responseData = (res.json as vi.Mock).mock.calls[0][0].data;

    expect(responseData.edges).toHaveLength(5);
    expect(responseData.edges[0].node.id).toBe(46);
    expect(responseData.edges[4].node.id).toBe(50);
    expect(responseData.pageInfo.hasNextPage).toBe(false);
    expect(responseData.pageInfo.hasPreviousPage).toBe(true);
    expect(responseData.pageInfo.startCursor).toBe(encodeCursor(46));
    expect(responseData.pageInfo.endCursor).toBe(encodeCursor(50));
  });

  it('should return projects before cursor:5 when fetching with { before: cursor:5, last: 5 }', async () => {
    const req = {
      query: {
        before: encodeCursor(5),
        last: '5',
      },
    } as unknown as NextApiRequest;

    const res = createMockResponse();

    await handler(req, res);

    const responseData = (res.json as vi.Mock).mock.calls[0][0].data;

    // Since projects 1-4 are before cursor:5
    expect(responseData.edges.length).toBe(4);
    expect(responseData.edges[0].node.id).toBe(1);
    expect(responseData.edges[responseData.edges.length - 1].node.id).toBe(4);
    expect(responseData.pageInfo.hasNextPage).toBe(true);
    expect(responseData.pageInfo.hasPreviousPage).toBe(false);
    expect(responseData.pageInfo.startCursor).toBe(encodeCursor(1));
    expect(responseData.pageInfo.endCursor).toBe(encodeCursor(4));
  });

  it('should return projects after cursor:5 when fetching with { after: cursor:5, first: 5 }', async () => {
    const req = {
      query: {
        after: encodeCursor(5),
        first: '5',
      },
    } as unknown as NextApiRequest;

    const res = createMockResponse();

    await handler(req, res);

    const responseData = (res.json as vi.Mock).mock.calls[0][0].data;

    expect(responseData.edges).toHaveLength(5);
    expect(responseData.edges[0].node.id).toBe(6);
    expect(responseData.edges[4].node.id).toBe(10);
    expect(responseData.pageInfo.hasNextPage).toBe(true);
    expect(responseData.pageInfo.hasPreviousPage).toBe(true);
    expect(responseData.pageInfo.startCursor).toBe(encodeCursor(6));
    expect(responseData.pageInfo.endCursor).toBe(encodeCursor(10));
  });

  it('should set hasPreviousPage to false and hasNextPage to true when all items are fetched with { last: 5, before: x }', async () => {
    // Simulate fetching beyond available items
    const req = {
      query: {
        before: encodeCursor(1),
        last: '5',
      },
    } as unknown as NextApiRequest;

    const res = createMockResponse();

    await handler(req, res);

    const responseData = (res.json as vi.Mock).mock.calls[0][0].data;

    expect(responseData.edges).toHaveLength(0);
    expect(responseData.pageInfo.hasNextPage).toBe(true);
    expect(responseData.pageInfo.hasPreviousPage).toBe(false);
    expect(responseData.pageInfo.startCursor).toBeNull();
    expect(responseData.pageInfo.endCursor).toBeNull();
  });

  it('should return 400 error when both first and last are provided', async () => {
    const req = {
      query: {
        first: '5',
        last: '5',
      },
    } as unknown as NextApiRequest;

    const res = createMockResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Cannot specify both first and last',
    });
  });

  it('should return 400 error for invalid first parameter', async () => {
    const req = {
      query: {
        first: '-5',
      },
    } as unknown as NextApiRequest;

    const res = createMockResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid first parameter' });
  });

  it('should return 400 error for invalid last parameter', async () => {
    const req = {
      query: {
        last: '0',
      },
    } as unknown as NextApiRequest;

    const res = createMockResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid last parameter' });
  });

  it('should return 400 error for invalid after cursor', async () => {
    const req = {
      query: {
        after: 'invalidCursor',
        first: '5',
      },
    } as unknown as NextApiRequest;

    const res = createMockResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid after cursor' });
  });

  it('should return 400 error for invalid before cursor', async () => {
    const req = {
      query: {
        before: 'invalidCursor',
        last: '5',
      },
    } as unknown as NextApiRequest;

    const res = createMockResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid before cursor' });
  });
});
