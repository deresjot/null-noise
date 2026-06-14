import type { Metadata } from "next";

import { SearchExperience } from "@/components/search-experience";
import { createSearchPageState } from "@/lib/search-page-state";

export const metadata: Metadata = {
  title: "Suche",
  description:
    "Suche Filme und Serien in null-noise oder stöbere nach ruhigen, wechselhaften und intensiveren Richtungen.",
  alternates: {
    canonical: "/suche",
  },
  openGraph: {
    url: "/suche",
  },
};

type SearchPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const initialState = await createSearchPageState(resolvedSearchParams);

  return <SearchExperience initialState={initialState} />;
}
