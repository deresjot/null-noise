import { SearchExperience } from "@/components/search-experience";
import { createSearchPageState } from "@/lib/search-page-state";

type SearchPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const initialState = await createSearchPageState(resolvedSearchParams);

  return <SearchExperience initialState={initialState} />;
}
