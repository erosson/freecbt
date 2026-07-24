/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import React, { act } from "react";
import { createElmArch, createPureElmArch, useElmArch } from "./use-elm-arch";

test("use-pure-elm-arch", () => {
  const Ctx = createPureElmArch<Model, Action>();
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Ctx.Provider init={pureInit()} update={pureUpdate}>
      {children}
    </Ctx.Provider>
  );
  const { result } = renderHook(() => useElmArch(Ctx), { wrapper });
  const model = () => result.current[0];
  const dispatch = () => result.current[1];
  expect(model().value).toBe(0);
  act(() => {
    dispatch()(incr());
    dispatch()(incr());
    dispatch()(incr());
    dispatch()(decr());
  });
  expect(model().value).toBe(2);
});

test("use-nonpure-elm-arch", () => {
  const Ctx = createElmArch<Model, Action, Cmd>();
  const [spy, run] = runner();
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Ctx.Provider init={impureInit()} update={impureUpdate} runner={run}>
      {children}
    </Ctx.Provider>
  );
  const { result } = renderHook(() => useElmArch(Ctx), { wrapper });
  const model = () => result.current[0];
  const dispatch = () => result.current[1];
  expect(model().value).toBe(0);
  expect(spy.persistCount).toBe(1);
  act(() => {
    dispatch()(incr());
    dispatch()(incr());
    dispatch()(incr());
    dispatch()(decr());
  });
  expect(model().value).toBe(2);
  expect(spy.persistCount).toBe(5);
});

interface Model {
  value: number;
}
const pureInit = (): Model => ({ value: 0 });
const incr = () => ({ action: "incr" } as const);
const decr = () => ({ action: "decr" } as const);
type Action = ReturnType<typeof incr | typeof decr>;

export function pureUpdate(m: Model, a: Action): Model {
  switch (a.action) {
    case "incr":
      return { ...m, value: m.value + 1 };
    case "decr":
      return { ...m, value: m.value - 1 };
    default:
      throw new Error(a satisfies never);
  }
}

const persist = (model: Model) => ({ cmd: "persist", model } as const);
type Cmd = ReturnType<typeof persist>;

const impureInit = (): [Model, readonly Cmd[]] => [
  pureInit(),
  [persist(pureInit())],
];
function impureUpdate(m: Model, a: Action): [Model, readonly Cmd[]] {
  switch (a.action) {
    case "incr": {
      const m2 = { ...m, value: m.value + 1 };
      return [m2, [persist(m2)]];
    }
    case "decr": {
      const m2 = { ...m, value: m.value - 1 };
      return [m2, [persist(m2)]];
    }
    default:
      throw new Error(a satisfies never);
  }
}
function runner() {
  const spy = { persistCount: 0 };
  return [
    spy,
    (dispatch: (a: Action) => void) => {
      return (c: Cmd) => {
        switch (c.cmd) {
          case "persist": {
            spy.persistCount += 1;
            return;
          }
          default:
            throw new Error(`no such cmd: ${c.cmd satisfies never}`);
        }
      };
    },
  ] as const;
}
