import { mockSearch } from '../mock/handlers/search.handler';

export const searchApi = {
  search: (query: string) => mockSearch(query),
};
