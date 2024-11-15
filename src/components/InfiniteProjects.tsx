// components/InfiniteProjects.tsx

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';
import {
  useInfiniteQuery,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PaginatedResponse, PageParam, Project } from '../types';

const DEFAULT_PAGE_SIZE = 5;
const API_PATH_WITHOUT_ERRORS = '/api/projects';
const API_PATH_WITH_ERRORS = '/api/projects-error';

export const InfiniteProjects = () => {
  const [apiPath, setApiPath] = useState(API_PATH_WITHOUT_ERRORS);
  const { ref, inView } = useInView();

  const fetchProjects = async ({ pageParam }) => {
    const params = new URLSearchParams();

    // Include other required parameters, e.g., conversationRelayId
    // params.append('conversationRelayId', 'yourRelayId');

    if (pageParam.after) {
      params.append('after', pageParam.after);
    }
    if (pageParam.before) {
      params.append('before', pageParam.before);
    }
    if (pageParam.first) {
      params.append('first', pageParam.first.toString());
    }
    if (pageParam.last) {
      params.append('last', pageParam.last.toString());
    }

    const response = await fetch(`${apiPath}?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    // return (await response.json()) as PaginatedResponse;
    return response.json();
  };

  const {
    status,
    isLoading,
    isError,
    data,
    error,
    isFetching,
    isFetchingNextPage,
    isFetchingPreviousPage,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
  } = useInfiniteQuery<PaginatedResponse, Error>({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    initialPageParam: { last: DEFAULT_PAGE_SIZE },
    getNextPageParam: (lastPage) => {
      const { endCursor, hasNextPage } = lastPage.data.pageInfo;
      if (hasNextPage && endCursor) {
        // Fetch newer items if available
        return { after: endCursor, first: DEFAULT_PAGE_SIZE };
      }
      return undefined;
    },
    getPreviousPageParam: (firstPage) => {
      const { startCursor, hasPreviousPage } = firstPage.data.pageInfo;
      if (hasPreviousPage && startCursor) {
        // Fetch older items
        return { before: startCursor, last: DEFAULT_PAGE_SIZE };
      }
      return undefined;
    },
  });

  // useEffect(() => {
  //   if (inView && hasNextPage && !isFetchingNextPage) {
  //     fetchNextPage();
  //   }
  // }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading || isError) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Infinite Loading</h1>

        {isLoading && <p>Loading...</p>}
        {isError && <span>Error: {error.message}</span>}
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Infinite Loading</h1>
      <div style={{ margin: '10px 0', display: 'flex', gap: '5px' }}>
        <button
          onClick={() => setApiPath(API_PATH_WITHOUT_ERRORS)}
          disabled={apiPath === API_PATH_WITHOUT_ERRORS}
          style={{ padding: '10px', fontSize: '16px' }}
        >
          API Ok
        </button>
        <button
          onClick={() => setApiPath(API_PATH_WITH_ERRORS)}
          disabled={apiPath === API_PATH_WITH_ERRORS}
          style={{ padding: '10px', fontSize: '16px' }}
        >
          API with cursor errors
        </button>
      </div>

      <>
        {/* Load Older Page */}
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => fetchPreviousPage()}
            disabled={!hasPreviousPage || isFetchingPreviousPage}
            style={{ padding: '10px', fontSize: '16px' }}
          >
            {isFetchingPreviousPage
              ? 'Loading more...'
              : hasPreviousPage
              ? 'Load Older'
              : 'Nothing more to load'}
          </button>
        </div>

        {/* Render Projects */}
        {data?.pages.map((page, pageIndex) => (
          <React.Fragment key={pageIndex}>
            {page.data.edges.map(({ node, cursor }) => (
              <p
                style={{
                  border: '1px solid gray',
                  borderRadius: '5px',
                  padding: '10px',
                  margin: '10px 0',
                  background: `hsla(${node.id * 30}, 60%, 80%, 1)`,
                }}
                key={node.id}
              >
                {node.name} (server time: {new Date().toLocaleTimeString()}) -
                cursor: <b>{cursor}</b>
              </p>
            ))}
          </React.Fragment>
        ))}

        {/* Load Newer Page */}
        <div style={{ marginTop: '20px' }}>
          <button
            ref={ref}
            onClick={() => fetchNextPage()}
            disabled={!hasNextPage || isFetchingNextPage}
            style={{ padding: '10px', fontSize: '16px' }}
          >
            {isFetchingNextPage
              ? 'Loading more...'
              : hasNextPage
              ? 'Load Newer'
              : 'Nothing more to load'}
          </button>
        </div>

        {/* Background Fetching Indicator */}
        <div style={{ marginTop: '10px' }}>
          {isFetching && !isFetchingNextPage ? 'Background Updating...' : null}
        </div>
      </>

      <hr />
      <Link href="/about">Go to another page</Link>
    </div>
  );
};
