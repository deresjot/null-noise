import { createAggregatedAssessment } from "@/lib/profile";
import type { MetadataSpikeTitle } from "@/lib/metadata-spike";
import type { RatingSampleSet } from "@/lib/types";
import {
  aggregateStimulusEvidence,
  createRatingSamplesFromEvidenceSummary,
  deriveTmdbStimulusEvidence,
  type StimulusEvidence,
  type StimulusEvidenceSummary,
} from "@/lib/stimulus-evidence";

type MetadataSeedSignalState = "thin" | "mixed" | "supported";

type MetadataInferenceAssessment = {
  ratingSamples: RatingSampleSet;
  notes: string;
  signalState: MetadataSeedSignalState;
  evidence: StimulusEvidence[];
  evidenceSummary: StimulusEvidenceSummary;
};

function getMetadataSignalState(summary: StimulusEvidenceSummary): MetadataSeedSignalState {
  if (!summary.evidence.length) {
    return "thin";
  }

  if (summary.tone === "mixed") {
    return "mixed";
  }

  return "supported";
}

export function deriveMetadataInferenceAssessment(
  item: MetadataSpikeTitle,
): MetadataInferenceAssessment {
  const evidence = deriveTmdbStimulusEvidence(item);
  const evidenceSummary = aggregateStimulusEvidence(evidence);

  return {
    ratingSamples: createRatingSamplesFromEvidenceSummary(evidenceSummary),
    notes: evidenceSummary.note,
    signalState: getMetadataSignalState(evidenceSummary),
    evidence,
    evidenceSummary,
  };
}

export function createMetadataInferencePreview(item: MetadataSpikeTitle) {
  const assessment = deriveMetadataInferenceAssessment(item);
  const aggregate = createAggregatedAssessment({
    ratings: assessment.ratingSamples,
    notes: assessment.notes,
    sourceType: "metadata_inference",
  });

  return {
    ...aggregate,
    notes: assessment.notes,
    signalState: assessment.signalState,
    evidenceSummary: assessment.evidenceSummary,
  };
}
