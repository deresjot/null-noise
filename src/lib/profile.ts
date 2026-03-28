import type {
  AggregateSourceType,
  ConfidenceLevel,
  RatingAggregate,
  RatingSampleSet,
  ScaleValue,
  StimulusProfile,
} from "@/lib/types";

export function getConfidenceLevel(ratingCount: number): ConfidenceLevel {
  if (ratingCount <= 1) {
    return "niedrig";
  }

  if (ratingCount <= 4) {
    return "mittel";
  }

  return "hoch";
}

export function createRatingAggregate(
  aggregate: Omit<RatingAggregate, "level">,
): RatingAggregate {
  return {
    ...aggregate,
    level: getConfidenceLevel(aggregate.ratingCount),
  };
}

export function getMedianScaleValue(values: ScaleValue[]): ScaleValue {
  if (!values.length) {
    throw new Error("At least one rating is required to calculate a median.");
  }

  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 1) {
    return sorted[middle] as ScaleValue;
  }

  return Math.round((sorted[middle - 1] + sorted[middle]) / 2) as ScaleValue;
}

function getSharedRatingCount(ratings: RatingSampleSet): number {
  const lengths = Object.values(ratings).map((values) => values.length);
  const ratingCount = lengths[0] ?? 0;

  if (!ratingCount || lengths.some((length) => length !== ratingCount)) {
    throw new Error("Each aggregated title assessment needs the same number of ratings per field.");
  }

  return ratingCount;
}

export function createAggregatedAssessment({
  ratings,
  notes,
  sourceType,
  lastReviewedAt,
}: {
  ratings: RatingSampleSet;
  notes: string;
  sourceType: AggregateSourceType;
  lastReviewedAt?: string;
}): {
  stimulusProfile: StimulusProfile;
  soothingEffect: ScaleValue;
  aggregation: RatingAggregate;
} {
  const ratingCount = getSharedRatingCount(ratings);

  return {
    stimulusProfile: {
      volumeLevel: getMedianScaleValue(ratings.volumeLevel),
      peakIntensity: getMedianScaleValue(ratings.peakIntensity),
      stimulusDensity: getMedianScaleValue(ratings.stimulusDensity),
      notes,
    },
    soothingEffect: getMedianScaleValue(ratings.soothingEffect),
    aggregation: createRatingAggregate({
      ratingCount,
      sourceType,
      lastReviewedAt,
    }),
  };
}

export function getToneValue(value: ScaleValue): "ruhig" | "ausgeglichen" | "intensiv" {
  if (value <= 1) {
    return "ruhig";
  }

  if (value === 2) {
    return "ausgeglichen";
  }

  return "intensiv";
}
