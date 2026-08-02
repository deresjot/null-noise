import type { Metadata } from "next";

import { SearchExperience } from "@/components/search-experience";
import { createSearchPageState } from "@/lib/search-page-state";

type SearchPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getFirstQueryValue(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim().slice(0, 120) ?? "";
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const resolvedSearchParams = (await searchParams) ?? {};
  const query = getFirstQueryValue(resolvedSearchParams.q);

  return {
    title: query ? `Suche nach „${query}“` : "Suche und stöbern",
    description:
      "Suche Filme und Serien in null-noise oder stöbere nach ruhigen, wechselhaften und intensiveren Richtungen.",
    alternates: {
      canonical: "/suche",
    },
    openGraph: {
      url: "/suche",
    },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const initialState = await createSearchPageState(resolvedSearchParams);

  return <SearchExperience initialState={initialState} />;
}
