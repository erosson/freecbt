import _ from "lodash";
import { z } from "zod";

export interface Spec {
  readonly slug: string;
  readonly emoji: readonly string[];
  readonly labelKey?: string;
  readonly descriptionKey?: string;
  readonly explanationKeys?: number | readonly string[];
  readonly explanationThoughtKey?: string;
}
export const Slug = z.string().brand("distortion.slug");
export type Slug = z.infer<typeof Slug>;

export interface Distortion {
  readonly slug: Slug;
  readonly emojis: readonly string[];
  readonly labelKey: string;
  readonly descriptionKey: string;
  readonly explanationKeys: readonly string[];
  readonly explanationThoughtKey: string;
}

export function fromSpec(spec: Spec): Distortion {
  const slug = Slug.parse(spec.slug);
  const emojis = spec.emoji;
  const labelKey = spec.labelKey ?? _.snakeCase(slug);
  const descriptionKey =
    spec.descriptionKey ?? `${_.snakeCase(slug)}_one_liner`;
  const explanationKeys = spec.explanationKeys
    ? typeof spec.explanationKeys === "number"
      ? _.range(spec.explanationKeys).map(
          (i) => `${_.snakeCase(slug)}_explanation_${i + 1}`
        )
      : spec.explanationKeys
    : [`${_.snakeCase(slug)}_explanation`];
  const explanationThoughtKey = `${_.snakeCase(slug)}_thought`;
  return {
    slug,
    emojis,
    labelKey,
    descriptionKey,
    explanationKeys,
    explanationThoughtKey,
  };
}
