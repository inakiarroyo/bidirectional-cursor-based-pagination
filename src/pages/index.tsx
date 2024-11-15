import React, { useEffect } from 'react';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';
import {
  useInfiniteQuery,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PaginatedResponse, PageParam, Project } from '../types';
import { InfiniteProjects } from '../components/InfiniteProjects';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <InfiniteProjects />
      <ReactQueryDevtools initialIsOpen />
    </QueryClientProvider>
  );
}
