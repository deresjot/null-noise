import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { siteName } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Bedienung | ${siteName}`,
  alternates: {
    canonical: "/erklaerung",
  },
  openGraph: {
    url: "/erklaerung",
  },
};

export default function BedienungPage() {
  redirect("/erklaerung");
}
