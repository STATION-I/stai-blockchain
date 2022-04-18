import { createApi } from '@reduxjs/toolkit/query/react';
import staiLazyBaseQuery from './staiLazyBaseQuery';

export const baseQuery = staiLazyBaseQuery({});

export default createApi({
  reducerPath: 'staiApi',
  baseQuery,
  endpoints: () => ({}),
});
