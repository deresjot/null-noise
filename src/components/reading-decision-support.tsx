import Link from "next/link";

import type { ReadingDecisionPresentation } from "@/lib/format";

type ReadingDecisionSupportProps = {
  cautions: {
    items: string[];
    notice?: string | null;
  };
  comparisons: {
    items: Array<{
      href: string;
      relationLabel: string;
      title: string;
    }>;
    notice?: string | null;
  };
  decision: ReadingDecisionPresentation;
};

export function ReadingDecisionSupport({
  cautions,
  comparisons,
  decision,
}: ReadingDecisionSupportProps) {
  return (
    <section className="reading-support-stack" aria-label="Entscheidungshilfe">
      <section className="reading-support-card" data-tone={decision.tone} aria-labelledby="reading-decision-heading">
        <p className="reading-support-kicker">Passt das gerade?</p>
        <h3 id="reading-decision-heading" className="reading-support-title">
          {decision.title}
        </h3>
        <p className="reading-support-text">{decision.text}</p>
      </section>

      {comparisons.items.length || comparisons.notice ? (
        <section className="reading-support-card" aria-labelledby="reading-comparison-heading">
          <p className="reading-support-kicker">Im Vergleich zu …</p>
          <h3 id="reading-comparison-heading" className="reading-support-title reading-support-title-small">
            Ein grober Bezugspunkt
          </h3>
          {comparisons.items.length ? (
            <ul className="plain-list reading-support-list">
              {comparisons.items.map((item) => (
                <li key={`${item.relationLabel}-${item.title}`}>
                  <span className="reading-support-prefix">{item.relationLabel}</span>{" "}
                  <Link href={item.href}>{item.title}</Link>
                </li>
              ))}
            </ul>
          ) : null}
          {!comparisons.items.length && comparisons.notice ? (
            <p className="field-note reading-support-note">{comparisons.notice}</p>
          ) : null}
        </section>
      ) : null}

      {cautions.items.length || cautions.notice ? (
        <section className="reading-support-card" aria-labelledby="reading-caution-heading">
          <p className="reading-support-kicker">Könnte kippen, weil …</p>
          <h3 id="reading-caution-heading" className="reading-support-title reading-support-title-small">
            Das Risiko liegt eher hier
          </h3>
          {cautions.items.length ? (
            <ul className="plain-list reading-support-list">
              {cautions.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
          {!cautions.items.length && cautions.notice ? (
            <p className="field-note reading-support-note">{cautions.notice}</p>
          ) : null}
        </section>
      ) : null}
    </section>
  );
}
