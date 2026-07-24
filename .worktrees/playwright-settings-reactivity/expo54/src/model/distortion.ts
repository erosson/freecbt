import _ from "lodash";
import { z } from "zod";
import { translateKeys } from "../hooks/use-i18n";
import { AssertExtends } from "../type-utils";

export const TranslateKey = z.enum(translateKeys);

/**
 * A human-maintained cognitive distortion definition.
 *
 * This is what's listed in `distortion-data.ts`. It's missing translation ids needed in other code, but we can autogenerate them.
 */
export const Spec = z.object({
  slug: z.string(),
  emoji: z.string().array().readonly(),
  labelKey: TranslateKey.optional(),
  descriptionKey: TranslateKey.optional(),
  explanationKeys: TranslateKey.array().optional(),
  explanationKeyCount: z.number().optional(),
  explanationThoughtKey: TranslateKey.optional(),
});
export type Spec = z.infer<typeof Spec>;

/**
 * Distortion identifier.
 */
export const Slug = z.string().brand("distortion.slug");
export type Slug = z.infer<typeof Slug>;

/**
 * A complete cognitive distortion definition.
 */
export const Distortion = z.object({
  slug: Slug,
  emojis: z.string().array().readonly(),
  labelKey: TranslateKey,
  descriptionKey: TranslateKey,
  explanationKeys: TranslateKey.array().readonly(),
  explanationThoughtKey: TranslateKey,
});
export type Distortion = z.infer<typeof Distortion>;

export const fromSpec = Spec.transform((spec: Spec): Distortion => {
  const slug = Slug.decode(spec.slug);
  const emojis = spec.emoji;
  const labelKey = spec.labelKey ?? TranslateKey.parse(_.snakeCase(slug));
  const descriptionKey =
    spec.descriptionKey ?? TranslateKey.parse(`${_.snakeCase(slug)}_one_liner`);
  const explanationKeys = spec.explanationKeyCount
    ? _.range(spec.explanationKeyCount).map((i) =>
        TranslateKey.parse(`${_.snakeCase(slug)}_explanation_${i + 1}`)
      )
    : spec.explanationKeys
    ? spec.explanationKeys
    : [TranslateKey.parse(`${_.snakeCase(slug)}_explanation`)];
  const explanationThoughtKey =
    spec.explanationThoughtKey ??
    TranslateKey.parse(`${_.snakeCase(slug)}_thought`);
  return {
    slug,
    emojis,
    labelKey,
    descriptionKey,
    explanationKeys,
    explanationThoughtKey,
  };
});
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type checkFromSpecIn = AssertExtends<z.input<typeof fromSpec>, Spec>;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type checkFromSpecOut = AssertExtends<z.infer<typeof fromSpec>, Distortion>;

/**
 * A list of cognitive distortions. Usually we use the one in `distortion-data.ts`, but you could test with some other list.
 */
export interface Data {
  list: readonly Distortion[];
  bySlug: ReadonlyMap<string, Distortion>;
}

/**
 * Given a list of cognitive distortions, create parsers/validators for that data.
 */
export function createParsers(data: Data) {
  const validSlug = Slug.refine((slug) => data.bySlug.has(slug), {
    error: "no such Distortion.Slug",
  });
  const fromSlug = z.codec(validSlug, Distortion, {
    // decode is guaranteed not-null from validSlug's refinement
    decode: (slug: Slug) => data.bySlug.get(slug)!,
    encode: (d: z.input<typeof Distortion>) => Slug.parse(d.slug),
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type checkFromSlugIn = AssertExtends<z.input<typeof fromSlug>, string>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type checkFromSlugOut = AssertExtends<z.infer<typeof fromSlug>, Distortion>;

  const fromSlugList = fromSlug.array();
  const fromSlugSet = z.set(fromSlug);

  return { validSlug, fromSlug, fromSlugList, fromSlugSet };
}

export function emoji(d: Distortion): string {
  // TODO: properly distinguish valid emojis by platform
  return d.emojis[0];
}
