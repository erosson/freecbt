import { SlideName } from "@/src/app/v2/(public)/thoughts/create";
import { Href } from "expo-router";
import { Thought } from "./model";

export function settingsV2(): Href {
  return "/v2/settings";
}
export function thoughtCreateV2(): Href {
  return "/v2/thoughts/create";
}
export function thoughtListV2(): Href {
  return "/v2/thoughts";
}
export function thoughtViewV2(id: Thought.Id): Href {
  return { pathname: `/v2/thoughts/[idOrKey]`, params: { idOrKey: id } };
}
export function thoughtEditV2(id: Thought.Id, slide: SlideName): Href {
  return {
    pathname: `/v2/thoughts/[idOrKey]/edit`,
    params: { idOrKey: id, slide },
  };
}
export function lockUpdateV2(): Href {
  return "/v2/settings/lock";
}
export function backupV2(): Href {
  return "/v2/settings/backup";
}
export function exportV2(): Href {
  return "/v2/settings/export";
}
export function helpV2(): Href {
  return "/v2/help";
}
export function introV2(params: { onboarded?: boolean } = {}): Href {
  return {
    pathname: "/v2/help/intro",
    params: { onboarded: params.onboarded ? "1" : undefined },
  };
}
export function debugV2(): Href {
  return "/v2/debug";
}
