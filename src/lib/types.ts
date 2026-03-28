export type TitleKind = "movie" | "series";
export type ToneFilter = "all" | "calm" | "balanced" | "intense";
export type KindFilter = "all" | TitleKind;
export type ScaleValue = 0 | 1 | 2 | 3 | 4;
export type ConfidenceLevel = "niedrig" | "mittel" | "hoch";
export type AggregateSourceType =
  | "editorial_seed"
  | "provisional_seed"
  | "community_median"
  | "mixed";
export type StimulusScaleKey = "volumeLevel" | "peakIntensity" | "stimulusDensity";

export interface RatingSampleSet {
  volumeLevel: ScaleValue[];
  peakIntensity: ScaleValue[];
  stimulusDensity: ScaleValue[];
  soothingEffect: ScaleValue[];
}

export interface ExternalTitleRecord {
  slug: string;
  title: string;
  originalTitle?: string;
  kind: TitleKind;
  year: number | null;
  synopsis: string | null;
  runtimeMinutes?: number;
  posterPath?: string | null;
  externalSource: string;
  externalSourceId: string;
}

export interface StimulusProfile {
  volumeLevel: ScaleValue;
  peakIntensity: ScaleValue;
  stimulusDensity: ScaleValue;
  notes: string;
}

export interface RatingAggregate {
  ratingCount: number;
  level: ConfidenceLevel;
  sourceType: AggregateSourceType;
  lastReviewedAt?: string;
}

export interface TitleRecord {
  external: ExternalTitleRecord;
  stimulusProfile: StimulusProfile;
  soothingEffect: ScaleValue;
  contentFlags: string[];
  aggregation: RatingAggregate;
}

export interface TitleSeedRecord {
  external: ExternalTitleRecord;
  ratingSamples: RatingSampleSet;
  notes: string;
  contentFlags: string[];
  aggregation: Omit<TitleRecord["aggregation"], "level" | "ratingCount">;
}

export interface SearchFilters {
  q: string;
  tone: ToneFilter;
  kind: KindFilter;
  avoidPeaks: boolean;
  avoidDensity: boolean;
}
