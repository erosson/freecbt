import { Distortion, VERSION } from "./distortion"

/**
 * hardcoded distortion data
 */
const list: Distortion[] = [
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
    explanationKeys: 2,
  },
  {
    slug: "should-statements",
    emoji: ["✨"],
    explanationKeys: 2,
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
    explanationKeys: 2,
  },
].map((d) => new Distortion({ ...d, v: VERSION }))
export default list
