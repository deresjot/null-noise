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
  StimulusProfile,
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
  return scaleLabels[value].short;
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
  return `${formatRatingCount(aggregate.ratingCount)} · ${formatConfidence(aggregate.level)}`;
}

export type ReadingDecisionPresentation = {
  title: string;
  text: string;
  tone: "steady" | "caution" | "risk";
};

export function getProfileLoadScore(
  profile: Pick<StimulusProfile, "volumeLevel" | "peakIntensity" | "stimulusDensity">,
): number {
  return profile.peakIntensity * 0.55 + profile.stimulusDensity * 0.3 + profile.volumeLevel * 0.15;
}

export function getConfidencePresentation(
  aggregate: RatingAggregate,
  state: "seed" | "growing" | "rated",
): {
  eyebrow: string;
  title: string;
  text: string;
} {
  if (state === "seed") {
    return {
      eyebrow: "Stand heute",
      title: "Kaum Hinweise",
      text: "Das ist noch eine erste Einschätzung aus Basisdaten. Mehr trägt das gerade nicht.",
    };
  }

  if (state === "growing") {
    if (aggregate.ratingCount <= 2) {
      return {
        eyebrow: "Stand heute",
        title: "Erste Rückmeldungen da",
        text: "Ein paar Rückmeldungen sind schon da. Die Richtung kann sich aber noch merklich verschieben.",
      };
    }

    return {
      eyebrow: "Stand heute",
      title: "Das wirkt schon greifbarer",
      text: "Die Richtung trägt schon besser, bleibt aber offen für Korrekturen.",
    };
  }

  if (aggregate.level === "hoch") {
    return {
      eyebrow: "Stand heute",
      title: "Das wirkt inzwischen recht stimmig",
      text: "Nicht endgültig, aber inzwischen von mehreren Rückmeldungen mitgetragen.",
    };
  }

  if (aggregate.level === "mittel") {
    return {
      eyebrow: "Stand heute",
      title: "Das hält schon eher",
      text: "Der Stand trägt schon besser, wirkt aber noch nicht ganz gesetzt.",
    };
  }

  return {
    eyebrow: "Stand heute",
    title: "Kaum Hinweise",
    text: "Bisher gibt es dazu nur wenig, worauf sich das stützen kann.",
  };
}

export function formatKind(value: TitleKind): string {
  return value === "movie" ? "Film" : "Serie";
}

export function formatSourceType(value: AggregateSourceType): string {
  return sourceTypeLabels[value];
}

export function getAggregatePresentation(aggregate: RatingAggregate): {
  label: string;
  text: string;
  chip: string;
  state: "seed" | "growing" | "rated";
  basis: string;
} {
  if (aggregate.sourceType === "metadata_inference") {
    return {
      label: "Erste Einschätzung",
      text: "Kaum Hinweise außer Basisdaten. Das kann noch deutlich kippen.",
      chip: "Vorläufig",
      state: "seed",
      basis: "Bisher spricht vor allem die Basis dafür.",
    };
  }

  if (aggregate.sourceType === "community_median") {
    if (aggregate.level === "hoch") {
      return {
        label: "Dafür spricht inzwischen mehr",
        text: "Mehrere anonyme Rückmeldungen ziehen hier in eine ähnliche Richtung.",
        chip: "Trägt",
        state: "rated",
        basis: "Mehrere Rückmeldungen ziehen inzwischen ähnlich.",
      };
    }

    return {
      label: "Dafür gibt es erste Rückmeldungen",
      text: "Es gibt schon Rückmeldungen dazu, aber das kann sich noch merklich verschieben.",
      chip: "Hinweise",
      state: "growing",
      basis: "Zur Startbasis kommen erste Rückmeldungen dazu.",
    };
  }

  if (aggregate.sourceType === "mixed") {
    if (aggregate.level === "hoch") {
      return {
        label: "Das wirkt inzwischen stimmiger",
        text: "Basisdaten und Rückmeldungen ziehen hier inzwischen eher zusammen.",
        chip: "Trägt",
        state: "rated",
        basis: "Basisdaten und mehrere Rückmeldungen ziehen zusammen.",
      };
    }

    return {
      label: "Dafür gibt es erste Rückmeldungen",
      text: "Zur Startbasis kommen Rückmeldungen dazu. Ganz fest ist das noch nicht.",
      chip: "Hinweise",
      state: "growing",
    basis: "Erste Einschätzung plus erste Rückmeldungen.",
    };
  }

  return {
    label: "Dafür gibt es erste Hinweise",
    text: "Es gibt schon eine kleine Startbasis, aber noch kaum Korrekturen dazu.",
    chip: "Hinweise",
    state: "growing",
    basis: "Kleine Startbasis, aber noch wenig Rückhalt.",
  };
}

export function getSearchAggregatePresentation(aggregate: RatingAggregate): {
  label: string;
  text: string;
  chip: string;
  state: "seed" | "growing" | "rated";
  basis: string;
} {
  if (aggregate.sourceType === "metadata_inference") {
    return {
      label: "Erste Einschätzung",
      text: "Kaum Hinweise außer Basisdaten. Eigene Rückmeldungen fehlen noch.",
      chip: "Vorläufig",
      state: "seed",
      basis: "Bisher spricht vor allem die Basis dafür.",
    };
  }

  if (aggregate.sourceType === "community_median") {
    if (aggregate.level === "hoch") {
      return {
        label: "Dafür spricht inzwischen mehr",
        text: "Mehrere Rückmeldungen tragen diesen Stand inzwischen mit.",
        chip: "Trägt",
        state: "rated",
        basis: "Mehrere Rückmeldungen ziehen zusammen.",
      };
    }

    return {
      label: "Dafür gibt es erste Rückmeldungen",
      text: "Ein paar Rückmeldungen tragen schon mit.",
      chip: "Hinweise",
      state: "growing",
      basis: "Erste Einschätzung plus erste Rückmeldungen.",
    };
  }

  if (aggregate.sourceType === "mixed") {
    if (aggregate.level === "hoch") {
      return {
        label: "Das wirkt inzwischen stimmiger",
        text: "Erste Einschätzung und Rückmeldungen ziehen inzwischen eher zusammen.",
        chip: "Trägt",
        state: "rated",
        basis: "Basisdaten und mehrere Rückmeldungen ziehen zusammen.",
      };
    }

    return {
      label: "Dafür gibt es erste Rückmeldungen",
      text: "Zur ersten Einschätzung kommen erste Rückmeldungen dazu.",
      chip: "Hinweise",
      state: "growing",
      basis: "Erste Einschätzung plus erste Rückmeldungen.",
    };
  }

  return {
    label: "Dafür gibt es erste Hinweise",
    text: "Es gibt schon eine kleine Startbasis, aber noch kaum Korrekturen dazu.",
    chip: "Hinweise",
    state: "growing",
    basis: "Kleine Startbasis, aber noch wenig Rückhalt.",
  };
}

export function getProfileTendency(profile: Pick<StimulusProfile, "volumeLevel" | "peakIntensity" | "stimulusDensity">): {
  tone: "ruhig" | "ausgeglichen" | "intensiv";
  label: string;
  text: string;
} {
  const weightedValue = getProfileLoadScore(profile);

  if (weightedValue <= 1.35) {
    return {
      tone: "ruhig",
      label: "ruhig",
      text: "Mehr Luft als Druck. Spitzen und Dichte bleiben meist im Hintergrund.",
    };
  }

  if (weightedValue <= 1.95) {
    return {
      tone: "ruhig",
      label: "ruhig",
      text: "Im Grundton eher ruhig, aber nicht ganz ohne engere Momente.",
    };
  }

  if (weightedValue <= 2.55) {
    return {
      tone: "ausgeglichen",
      label: "durchwachsen",
      text: "Ruhigere Strecken und dichtere Phasen wechseln sich eher ab.",
    };
  }

  return {
    tone: "intensiv",
    label: "intensiv",
    text: "Spitzen und Dichte deuten eher auf einen anstrengenderen Titel hin.",
  };
}

export function getDecisionPresentation(input: {
  profile: Pick<StimulusProfile, "volumeLevel" | "peakIntensity" | "stimulusDensity">;
  state: "seed" | "growing" | "rated";
}): ReadingDecisionPresentation {
  const weightedValue = getProfileLoadScore(input.profile);

  if (weightedValue <= 1.95) {
    if (input.state === "rated") {
      return {
        title: "Passt gerade gut.",
        text: "Ruhig. Das wirkt passend, wenn du gerade wenig Reibung willst.",
        tone: "steady",
      };
    }

    if (input.state === "growing") {
      return {
        title: "Kann gut passen.",
        text: "Ruhig. Das ist aber noch keine feste Einordnung.",
        tone: "steady",
      };
    }

    return {
      title: "Kann gut gehen.",
      text: "Erste Einschätzung: ruhig.",
      tone: "steady",
    };
  }

  if (weightedValue <= 2.55) {
    if (input.state === "rated") {
      return {
        title: "Kommt auf die Reserve an.",
        text: "Nicht ganz ruhig. Das kann passen, wenn heute etwas Wechsel okay ist.",
        tone: "caution",
      };
    }

    if (input.state === "growing") {
      return {
        title: "Könnte passen.",
        text: "Nicht ganz ruhig. Wenn du wenig Reserve hast, kann das schnell zu viel werden.",
        tone: "caution",
      };
    }

    return {
      title: "Lieber mit etwas Reserve.",
      text: "Erste Einschätzung: nicht durchgehend ruhig.",
      tone: "caution",
    };
  }

  if (input.state === "rated") {
    return {
      title: "Eher nichts für einen ruhigen Abend.",
      text: "Dicht oder spitz. Das kann schnell zu viel werden.",
      tone: "risk",
    };
  }

  if (input.state === "growing") {
    return {
      title: "Könnte kippen.",
      text: "Wirkt eher anstrengend. Wenn du gerade Reserve brauchst, lieber etwas Ruhigeres.",
      tone: "risk",
    };
  }

  return {
    title: "Lieber mit etwas Reserve.",
    text: "Erste Einschätzung: intensiv. Das kann schnell zu viel werden.",
    tone: "risk",
  };
}

export function getCautionHints(
  profile: Pick<StimulusProfile, "volumeLevel" | "peakIntensity" | "stimulusDensity">,
): string[] {
  const hints: string[] = [];
  const weightedValue = getProfileLoadScore(profile);

  if (profile.peakIntensity >= 3) {
    hints.push("harte Spitzen ziehen hier merklich an");
  }

  if (profile.stimulusDensity >= 3) {
    hints.push("es bleibt über längere Strecken dicht");
  }

  if (profile.volumeLevel >= 3) {
    hints.push("das Grundniveau wirkt klar intensiv");
  }

  if (!hints.length && weightedValue >= 2) {
    hints.push("ruhigere Phasen kippen zwischendurch in dichtere Momente");
  }

  if (weightedValue >= 2.7 && hints.length < 3) {
    hints.push("echte Erholungspausen wirken hier eher knapp");
  }

  return hints.slice(0, 3);
}

export function getCompactProfileTendencyLabel(tone: "ruhig" | "ausgeglichen" | "intensiv"): string {
  if (tone === "ruhig") {
    return "ruhig";
  }

  if (tone === "ausgeglichen") {
    return "durchwachsen";
  }

  return "intensiv";
}

export function getCardReadingStatus(aggregate: RatingAggregate): string {
  if (aggregate.sourceType === "metadata_inference" || aggregate.ratingCount === 0) {
    return "Noch ohne Rückmeldungen";
  }

  return "Erste Einschätzung";
}

export function getReadingReasonLine(
  profile: Pick<StimulusProfile, "volumeLevel" | "peakIntensity" | "stimulusDensity">,
): string {
  return getCompactProfileTendencyLabel(getProfileTendency(profile).tone);
}
