import {
  confidenceLabels,
  scaleLabels,
  soothingEffectLabels,
  sourceTypeLabels,
} from "@/lib/constants";
import type {
  AggregateSourceType,
  ConfidenceLevel,
  RatingAggregate,
  ScaleValue,
  TitleKind,
} from "@/lib/types";

const dateFormatter = new Intl.DateTimeFormat("de-DE", { dateStyle: "long" });

export function formatDate(date: string): string {
  return dateFormatter.format(new Date(date));
}

export function formatScale(value: ScaleValue): string {
  return `Stufe ${value} · ${scaleLabels[value].short}`;
}

export function formatScaleCompact(value: ScaleValue): string {
  return `${value} · ${scaleLabels[value].short}`;
}

export function formatSoothingEffect(value: ScaleValue): string {
  return soothingEffectLabels[value].short;
}

export function formatConfidence(value: ConfidenceLevel): string {
  return confidenceLabels[value].short;
}

export function formatRatingCount(value: number): string {
  return `${value} Einschätzung${value === 1 ? "" : "en"}`;
}

export function formatConfidenceSummary(aggregate: RatingAggregate): string {
  return `${formatConfidence(aggregate.level)} (${formatRatingCount(aggregate.ratingCount)})`;
}

export function getConfidencePresentation(
  aggregate: RatingAggregate,
  state: "seed" | "rated",
): {
  eyebrow: string;
  title: string;
  text: string;
} {
  if (state === "seed") {
    return {
      eyebrow: "Geringe Sicherheit",
      title: "Noch wenige Einschätzungen",
      text: "Die aktuelle Einordnung ist nur eine grobe Startbasis und wird erst durch anonyme Rückmeldungen stabiler.",
    };
  }

  if (aggregate.level === "hoch") {
    return {
      eyebrow: "Hohe Sicherheit",
      title: `Basierend auf ${formatRatingCount(aggregate.ratingCount)}`,
      text: "Mehrere anonyme Rückmeldungen tragen die aktuelle Einordnung bereits recht stabil.",
    };
  }

  if (aggregate.level === "mittel") {
    return {
      eyebrow: "Mittlere Sicherheit",
      title: `Basierend auf ${formatRatingCount(aggregate.ratingCount)}`,
      text: "Die aktuelle Einordnung hat schon eine erste Basis, kann sich mit weiteren Rückmeldungen aber noch merklich verschieben.",
    };
  }

  return {
    eyebrow: "Geringe Sicherheit",
    title: "Noch wenige Einschätzungen",
    text: `Bisher basiert die aktuelle Einordnung auf ${formatRatingCount(aggregate.ratingCount)} und wird mit weiteren Rückmeldungen belastbarer.`,
  };
}

export function formatKind(value: TitleKind): string {
  return value === "movie" ? "Film" : "Serie";
}

export function formatSourceType(value: AggregateSourceType): string {
  return sourceTypeLabels[value];
}

export function getAggregatePresentation(value: AggregateSourceType): {
  label: string;
  text: string;
  chip: string;
  state: "seed" | "rated";
} {
  if (value === "metadata_inference") {
    return {
      label: "Vorläufige Einschätzung aus Metadaten",
      text: "Noch geringe Sicherheit. Die aktuelle Einordnung beruht nur auf ausgewerteten Metadaten und wird erst durch anonyme Einschätzungen belastbarer.",
      chip: "Vorläufig",
      state: "seed",
    };
  }

  if (value === "community_median") {
    return {
      label: "Einschätzung aus anonymen Rückmeldungen",
      text: "Mehrere anonyme Einschätzungen tragen den aktuellen Stand des Reizprofils.",
      chip: "Rückmeldungen",
      state: "rated",
    };
  }

  if (value === "mixed") {
    return {
      label: "Startbasis mit Rückmeldungen ergänzt",
      text: "Die erste Startbasis wurde bereits durch anonyme Einschätzungen verdichtet.",
      chip: "Gemischt",
      state: "rated",
    };
  }

  return {
    label: "Vorläufige lokale Startbasis",
    text: "Noch geringe Sicherheit. Erste anonyme Einschätzungen fehlen noch oder tragen den Titel erst in kleinen Schritten.",
    chip: "Startbasis",
    state: "seed",
  };
}
