import type { StimulusAxis, StimulusEvidence, StimulusEvidenceSummary } from "@/lib/stimulus-evidence";

export type EvidenceDisclosureGroup = {
  heading: string;
  items: string[];
};

function uniqueLimited(items: string[], limit: number): string[] {
  return [...new Set(items.filter(Boolean))].slice(0, limit);
}

function describeEvidence(item: StimulusEvidence): string {
  const axisLabels: Record<StimulusAxis, string> = {
    audio_peaks: "mögliche Spitzen",
    emotional_load: "emotionale Schwere",
    predictability: item.direction === "calming" ? "klarere Struktur" : "weniger Vorhersehbarkeit",
    relief: "entlastende Form",
    stimulus_density: "mehr Dichte",
    visual_intensity: "visuell dichtere Form",
  };

  return axisLabels[item.axis];
}

export function getSituationalDiscoveryLabel(summary: StimulusEvidenceSummary): string {
  if (summary.thinData) {
    return "Erst kurz prüfen";
  }

  if (summary.tone === "calm") {
    return "Eher ruhig";
  }

  if (summary.tone === "intense") {
    const emotionalOnly =
      summary.evidence.some((item) => item.axis === "emotional_load") &&
      !summary.evidence.some((item) =>
        ["audio_peaks", "stimulus_density", "visual_intensity"].includes(item.axis),
      );

    return emotionalOnly ? "Eher später prüfen" : "Kann gerade zu dicht sein";
  }

  if (summary.conflicts.length) {
    return "Eher wechselhaft";
  }

  return "Kurz reinlesen";
}

export function buildEvidenceDisclosureGroups(
  summary: StimulusEvidenceSummary | null,
): EvidenceDisclosureGroup[] {
  if (!summary) {
    return [];
  }

  const supportive = uniqueLimited(
    summary.evidence
      .filter((item) => item.direction === "calming")
      .map(describeEvidence),
    3,
  );
  const caution = uniqueLimited(
    summary.evidence
      .filter((item) => item.direction === "intensifying")
      .map(describeEvidence),
    3,
  );
  const dataState = summary.thinData
    ? "Dünne Datenlage. Das bleibt eine erste Orientierung."
    : summary.conflicts.length
      ? "Gemischte Hinweise. Keine eindeutige Richtung."
      : "Erste Einschätzung aus Metadaten.";

  return [
    supportive.length
      ? {
          heading: "Spricht eher dafür",
          items: supportive,
        }
      : null,
    caution.length
      ? {
          heading: "Kann dagegen sprechen",
          items: caution,
        }
      : null,
    {
      heading: "Datenlage",
      items: [dataState, "Keine Szenenprüfung."],
    },
  ].filter((group): group is EvidenceDisclosureGroup => Boolean(group));
}
