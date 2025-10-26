import { Distortion } from ".";

/**
 * hardcoded distortion data
 */
export const specList: readonly Distortion.Spec[] = [
  {
    slug: "all-or-nothing",
    emoji: ["🌓"],
    labelKey: "all_or_nothing_thinking",
    descriptionKey: "all_or_nothing_thinking_one_liner",
    explanationKeys: ["all_or_nothing_thinking_explanation"],
    explanationThoughtKey: "all_or_nothing_thinking_thought",
  },
  {
    slug: "overgeneralization",
    emoji: ["👯‍"],
    labelKey: "over_generalization",
    explanationKeys: ["over_generalization_explanation"],
    explanationThoughtKey: "over_generalization_thought",
  },
  {
    slug: "mind-reading",
    emoji: ["🧠", "💭"],
  },
  {
    slug: "fortune-telling",
    emoji: ["🔮"],
  },
  {
    slug: "magnification-of-the-negative",
    emoji: ["👎"],
  },
  {
    slug: "minimization-of-the-positive",
    emoji: ["👍"],
  },
  {
    slug: "catastrophizing",
    emoji: ["🤯", "💥"],
  },
  {
    slug: "emotional-reasoning",
    emoji: ["🎭"],
    explanationKeyCount: 2,
  },
  {
    slug: "should-statements",
    emoji: ["✨"],
    explanationKeyCount: 2,
  },
  {
    slug: "labeling",
    emoji: ["🏷", "🍙"],
  },
  {
    slug: "self-blaming",
    emoji: ["👁", "🚷"],
  },
  {
    slug: "other-blaming",
    emoji: ["🧛‍", "👺"],
    explanationKeyCount: 2,
  },
] as const;

export const list: readonly Distortion.Distortion[] = specList.map((spec) =>
  Distortion.fromSpec.decode(spec)
);
export const bySlug = new Map(list.map((d) => [d.slug as string, d]));
