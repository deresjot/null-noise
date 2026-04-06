import { getProfileLoadScore, getProfileTendency } from "@/lib/format";
import { createMetadataInferencePreview } from "@/lib/metadata-inference";
import { browseTmdbMetadata, type MetadataSpikeBrowseSection, type MetadataSpikeTitle } from "@/lib/metadata-spike";
import type { SearchFilters, StimulusProfile, TitleKind } from "@/lib/types";

export type DetailFollowupSection = {
  eyebrow: string;
  id: "nearby" | "escape";
  intro: string;
  items: MetadataSpikeTitle[];
  title: string;
};

export type DetailFollowupNotice = {
  id: "nearby" | "escape";
  text: string;
  title: string;
  tone: "neutral" | "warning";
};

export type DetailFollowupState = {
  comparison: {
    items: Array<{
      item: MetadataSpikeTitle;
      relationLabel: string;
    }>;
    notice: string | null;
  };
  notices: DetailFollowupNotice[];
  sections: DetailFollowupSection[];
};

function buildStableMix(seed: string, suffix: string): string {
  return `detail:${seed}:${suffix}`;
}

export function buildFollowupFiltersFromProfile(
  profile: Pick<StimulusProfile, "peakIntensity" | "stimulusDensity" | "volumeLevel">,
  kind: TitleKind,
): SearchFilters {
  const tendency = getProfileTendency(profile);

  return {
    avoidDensity: profile.stimulusDensity <= 1,
    avoidPeaks: profile.peakIntensity <= 1,
    kind,
    q: "",
    tone:
      tendency.tone === "ruhig"
        ? "calm"
        : tendency.tone === "intensiv"
          ? "intense"
          : "balanced",
  };
}

function buildEscapeFilters(kind: TitleKind): SearchFilters {
  return {
    avoidDensity: true,
    avoidPeaks: true,
    kind,
    q: "",
    tone: "calm",
  };
}

function excludeItems(
  items: MetadataSpikeTitle[],
  excludedIds: Set<string>,
  alreadyUsed: Set<string>,
): MetadataSpikeTitle[] {
  return items.filter((item) => !excludedIds.has(item.externalId) && !alreadyUsed.has(item.externalId));
}

function interleaveItems(
  left: MetadataSpikeTitle[],
  right: MetadataSpikeTitle[],
  limit: number,
): MetadataSpikeTitle[] {
  const selected: MetadataSpikeTitle[] = [];
  const maxLength = Math.max(left.length, right.length);

  for (let index = 0; index < maxLength; index += 1) {
    if (left[index]) {
      selected.push(left[index]);
    }

    if (selected.length >= limit) {
      break;
    }

    if (right[index]) {
      selected.push(right[index]);
    }

    if (selected.length >= limit) {
      break;
    }
  }

  return selected.slice(0, limit);
}

function pickComparisonItems(
  currentProfile: Pick<StimulusProfile, "peakIntensity" | "stimulusDensity" | "volumeLevel">,
  candidates: MetadataSpikeTitle[],
  limit = 3,
) {
  const currentScore = getProfileLoadScore(currentProfile);
  const scoredCandidates = candidates
    .map((item) => ({
      item,
      score: getProfileLoadScore(createMetadataInferencePreview(item).stimulusProfile),
    }))
    .sort((left, right) => Math.abs(left.score - currentScore) - Math.abs(right.score - currentScore));

  const quieter = scoredCandidates.find((candidate) => candidate.score >= currentScore + 0.45);
  const similar = scoredCandidates.find((candidate) => Math.abs(candidate.score - currentScore) <= 0.4);
  const louder = scoredCandidates.find((candidate) => candidate.score <= currentScore - 0.45);

  const selections = [quieter, similar, louder]
    .filter((candidate): candidate is NonNullable<typeof candidate> => Boolean(candidate))
    .filter(
      (candidate, index, collection) =>
        collection.findIndex((entry) => entry.item.externalId === candidate.item.externalId) === index,
    )
    .slice(0, limit)
    .map((candidate) => ({
      item: candidate.item,
      relationLabel:
        candidate.score >= currentScore + 0.45
          ? "Ruhiger als"
          : candidate.score <= currentScore - 0.45
            ? "Intensiver als"
            : "Ähnlich wie",
    }));

  return selections;
}

export function pickNearbyFollowupItems(
  sections: MetadataSpikeBrowseSection[],
  tone: ReturnType<typeof getProfileTendency>["tone"],
  excludedIds: Set<string>,
  limit = 4,
): MetadataSpikeTitle[] {
  const quietItems = excludeItems(
    sections.find((section) => section.id === "quiet")?.items ?? [],
    excludedIds,
    new Set<string>(),
  );
  const loudItems = excludeItems(
    sections.find((section) => section.id === "loud")?.items ?? [],
    excludedIds,
    new Set<string>(),
  );

  if (tone === "ruhig") {
    return quietItems.slice(0, limit);
  }

  if (tone === "intensiv") {
    return loudItems.slice(0, limit);
  }

  return interleaveItems(quietItems, loudItems, limit);
}

export async function getDetailFollowupSections(input: {
  excludeExternalIds?: string[];
  kind: TitleKind;
  profile: Pick<StimulusProfile, "peakIntensity" | "stimulusDensity" | "volumeLevel">;
  seed: string;
}): Promise<DetailFollowupState> {
  const tendency = getProfileTendency(input.profile);
  const excludedIds = new Set(input.excludeExternalIds ?? []);
  const sections: DetailFollowupSection[] = [];
  const notices: DetailFollowupNotice[] = [];
  let comparison: DetailFollowupState["comparison"] = {
    items: [],
    notice: null,
  };
  const usedIds = new Set<string>();
  const nearbyState = await browseTmdbMetadata(
    buildFollowupFiltersFromProfile(input.profile, input.kind),
    buildStableMix(input.seed, "nearby"),
  );

  if (nearbyState.kind === "success") {
    comparison = {
      items: pickComparisonItems(
        input.profile,
        excludeItems(
          [
            ...(nearbyState.sections.find((section) => section.id === "quiet")?.items ?? []),
            ...(nearbyState.sections.find((section) => section.id === "loud")?.items ?? []),
          ],
          excludedIds,
          new Set<string>(),
        ),
      ),
      notice: null,
    };

    if (!comparison.items.length) {
      comparison.notice = "Dafür gibt es gerade noch zu wenig brauchbare Vergleichstitel.";
    }

    const items = pickNearbyFollowupItems(nearbyState.sections, tendency.tone, excludedIds, 4);

    for (const item of items) {
      usedIds.add(item.externalId);
    }

    if (items.length) {
      sections.push({
        eyebrow: "Weiter in ähnlicher Reizlage",
        id: "nearby",
        intro:
          tendency.tone === "intensiv"
            ? "Ähnliche Reizlage, ohne so zu tun, als wäre das exaktes Matching."
            : tendency.tone === "ruhig"
              ? "Ähnlich ruhig oder zumindest ohne harte Spitzen."
              : "Im selben groben Rahmen, ohne das enger zu behaupten als es ist.",
        items,
        title: "Dazu passt auch …",
      });
    } else {
      notices.push({
        id: "nearby",
        text: "In ähnlicher Reizlage war gerade nichts Greifbares dabei.",
        title: "Dazu passt auch … bleibt hier gerade leer",
        tone: "neutral",
      });
    }
  } else {
    comparison = {
      items: [],
      notice:
        nearbyState.kind === "disabled" || nearbyState.kind === "error"
          ? "Vergleiche lassen sich gerade nicht belastbar ziehen."
          : "Dafür gibt es gerade noch zu wenig Anhaltspunkte.",
    };
    notices.push({
      id: "nearby",
      text:
        nearbyState.kind === "disabled" || nearbyState.kind === "error"
          ? "Dazu konnte gerade nichts Belastbares geladen werden."
          : "In ähnlicher Reizlage war gerade nichts Greifbares dabei.",
      title: "Dazu passt auch … fehlt gerade",
      tone: nearbyState.kind === "disabled" || nearbyState.kind === "error" ? "warning" : "neutral",
    });
  }

  if (tendency.tone === "intensiv") {
    const escapeState = await browseTmdbMetadata(
      buildEscapeFilters(input.kind),
      buildStableMix(input.seed, "escape"),
    );

    if (escapeState.kind === "success") {
      const items = excludeItems(
        escapeState.sections.find((section) => section.id === "quiet")?.items ?? [],
        excludedIds,
        usedIds,
      ).slice(0, 4);

      if (items.length) {
        sections.push({
          eyebrow: "Entlasten",
          id: "escape",
          intro: "Leiser, luftiger und mit weniger harten Spitzen.",
          items,
          title: "Wenn du etwas Ruhigeres suchst",
        });
      } else {
        notices.push({
          id: "escape",
          text: "Ruhigere Alternativen waren gerade nicht greifbar.",
          title: "Leisere Alternativen fehlen gerade",
          tone: "neutral",
        });
      }
    } else {
      notices.push({
        id: "escape",
        text:
          escapeState.kind === "disabled" || escapeState.kind === "error"
            ? "Ruhigere Alternativen konnten gerade nicht belastbar geladen werden."
            : "Ruhigere Alternativen waren gerade nicht greifbar.",
        title: "Leisere Alternativen fehlen gerade",
        tone: escapeState.kind === "disabled" || escapeState.kind === "error" ? "warning" : "neutral",
      });
    }
  }

  return {
    comparison,
    notices,
    sections,
  };
}
