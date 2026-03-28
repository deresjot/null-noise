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

export function formatKind(value: TitleKind): string {
  return value === "movie" ? "Film" : "Serie";
}

export function formatSourceType(value: AggregateSourceType): string {
  return sourceTypeLabels[value];
}
