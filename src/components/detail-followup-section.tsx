import { ExternalResultList } from "@/components/external-result-list";
import type { MetadataSpikeTitle } from "@/lib/metadata-spike";

type DetailFollowupSectionProps = {
  eyebrow?: string;
  heading: string;
  intro: string;
  items: MetadataSpikeTitle[];
  localTitleByExternalKey?: Record<string, string>;
  query?: string;
  writesEnabled?: boolean;
};

export function DetailFollowupSection({
  eyebrow = "Weitersehen",
  heading,
  intro,
  items,
  localTitleByExternalKey = {},
  query = "",
  writesEnabled = true,
}: DetailFollowupSectionProps) {
  if (!items.length) {
    return null;
  }

  const headingId = `detail-followup-${heading.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <section className="detail-followup-section" aria-labelledby={headingId}>
      <header className="detail-followup-header">
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={headingId}>{heading}</h2>
        <p className="field-note">{intro}</p>
      </header>
      <ExternalResultList
        items={items}
        localTitleByExternalKey={localTitleByExternalKey}
        query={query}
        writesEnabled={writesEnabled}
      />
    </section>
  );
}
