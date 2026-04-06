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
      title: "Das ist noch ziemlich offen",
      text: "Bisher ist das eher eine erste Lesart aus Basisdaten als etwas, das schon trägt.",
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
    title: "Dafür gibt es noch wenig",
    text: "Bisher gibt es dazu nur sehr wenig, worauf sich das stützen kann.",
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
      label: "Bisher nur grob gelesen",
      text: "Bisher sprechen hier nur Basisdaten dafür. Das kann noch deutlich kippen.",
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
      basis: "Erstlesart plus erste Rückmeldungen.",
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
      label: "Bisher nur grob gelesen",
      text: "Bisher sprechen nur Basisdaten dafür. Eigene Rückmeldungen fehlen noch.",
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
      basis: "Erstlesart plus erste Rückmeldungen.",
    };
  }

  if (aggregate.sourceType === "mixed") {
    if (aggregate.level === "hoch") {
      return {
        label: "Das wirkt inzwischen stimmiger",
        text: "Erstlesart und Rückmeldungen ziehen inzwischen eher zusammen.",
        chip: "Trägt",
        state: "rated",
        basis: "Basisdaten und mehrere Rückmeldungen ziehen zusammen.",
      };
    }

    return {
      label: "Dafür gibt es erste Rückmeldungen",
      text: "Zur Erstlesart kommen erste Rückmeldungen dazu.",
      chip: "Hinweise",
      state: "growing",
      basis: "Erstlesart plus erste Rückmeldungen.",
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
      label: "eher leise",
      text: "Mehr Luft als Druck. Spitzen und Dichte bleiben meist im Hintergrund.",
    };
  }

  if (weightedValue <= 1.95) {
    return {
      tone: "ruhig",
      label: "eher leise mit dichteren Spitzen",
      text: "Im Grundton eher ruhig, aber nicht ganz ohne engere Momente.",
    };
  }

  if (weightedValue <= 2.55) {
    return {
      tone: "ausgeglichen",
      label: "zwischen leise und laut",
      text: "Ruhigere Strecken und dichtere Phasen wechseln sich eher ab.",
    };
  }

  return {
    tone: "intensiv",
    label: "eher laut",
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
        text: "Bisher spricht eher für einen ruhigeren Abend oder einen sanften Einstieg.",
        tone: "steady",
      };
    }

    if (input.state === "growing") {
      return {
        title: "Kann gut passen.",
        text: "Wirkt eher ruhig, auch wenn das noch nicht ganz fest ist.",
        tone: "steady",
      };
    }

    return {
      title: "Kann gut gehen.",
      text: "Spricht eher für einen ruhigen Abend, bleibt aber noch ziemlich vorläufig.",
      tone: "steady",
    };
  }

  if (weightedValue <= 2.55) {
    if (input.state === "rated") {
      return {
        title: "Kommt auf die Reserve an.",
        text: "Nicht ganz leise, aber bisher auch nicht klar zu viel.",
        tone: "caution",
      };
    }

    if (input.state === "growing") {
      return {
        title: "Könnte passen.",
        text: "Kann gut gehen, wenn heute etwas Wechsel oder Druck okay ist.",
        tone: "caution",
      };
    }

    return {
      title: "Lieber mit etwas Reserve.",
      text: "Hier wäre alles andere zu sicher formuliert. Ruhig ist das eher nicht durchgehend.",
      tone: "caution",
    };
  }

  if (input.state === "rated") {
    return {
      title: "Eher nichts für einen ruhigen Abend.",
      text: "Bisher spricht einiges für dichte oder spitze Momente.",
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
    text: "Die Startbasis wirkt eher dicht oder spitz. Für einen ruhigen Abend eher riskant.",
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
    hints.push("das Grundniveau drückt eher laut nach vorn");
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
    return "eher leise";
  }

  if (tone === "ausgeglichen") {
    return "zwischen leise und laut";
  }

  return "eher laut";
}

export function getReadingReasonLine(
  profile: Pick<StimulusProfile, "volumeLevel" | "peakIntensity" | "stimulusDensity">,
): string {
  if (profile.peakIntensity <= 1 && profile.stimulusDensity <= 1) {
    return "wenig harte Spitzen";
  }

  if (profile.peakIntensity <= 1 && profile.stimulusDensity <= 2) {
    return "eher gleichmäßig und nicht zu dicht";
  }

  if (profile.stimulusDensity <= 1 && profile.volumeLevel <= 1) {
    return "eher ruhiger Einstieg";
  }

  if (profile.peakIntensity >= 3 && profile.stimulusDensity >= 3) {
    return "spürbare Spitzen und dichte Phasen";
  }

  if (profile.peakIntensity >= 3) {
    return "spürbare harte Spitzen";
  }

  if (profile.stimulusDensity >= 3) {
    return "dichter, aber nicht ganz extrem";
  }

  return "zwischen ruhigeren und dichteren Momenten";
}
