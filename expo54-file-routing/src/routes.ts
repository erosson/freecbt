import { Href } from "expo-router";

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
