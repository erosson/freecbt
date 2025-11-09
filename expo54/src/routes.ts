import { SlideName } from "@/app/v2/thoughts/create";
import { Href } from "expo-router";
import { Thought } from "./model";

// see also ./legacy/screens.ts for legacy routes/screens
export function thoughtCreate(
  params: { fromIntro?: boolean; distortions?: string[] } = {}
): Href {
  const { fromIntro, ...p } = params;
  return {
    pathname: "/thoughts/create",
    params: {
      ...p,
      "from-intro": params.fromIntro ? "1" : undefined,
    },
  };
}
export function thoughtEdit(id: string, params: { slide?: string } = {}): Href {
  return { pathname: `/thoughts/[id]/edit`, params: { id, ...params } };
}
export function thoughtList(): Href {
  return "/thoughts";
}
export function intro(): Href {
  return "/intro";
}
export function help(params: { distortions?: string[] }): Href {
  return { pathname: "/help", params };
}
export function settings(): Href {
  return "/settings";
}
export function init(): Href {
  return "/";
}
export function thoughtView(id: string): Href {
  return `/thoughts/${id}`;
}
export function lockUpdate(): Href {
  return "/lock-update";
}
export function debug(): Href {
  return "/debug";
}
export function backup(): Href {
  return "/backup";
}
export function export_(): Href {
  return "/export";
}

export function helpV2(): Href {
  // return "/v2/help";
  return "/v2";
}
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
