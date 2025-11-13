/**
 * @jest-environment jsdom
 */
import { act, renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { Action, Cmd, Model, Thought } from "../model";
import { createElmArch } from "./use-elm-arch";
import { ModelProvider, useModel } from "./use-model";

test("use-model basics", async () => {
  const Ctx = createElmArch<Model.Model, Action.Action, Cmd.Cmd>();
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ModelProvider ctx={Ctx}>{children}</ModelProvider>
  );
  const { result } = renderHook(() => useModel(Ctx), { wrapper });
  const model = () => result.current[0];
  const ready = () => {
    const m = model();
    expect(m.status).toBe("ready");
    return m as Model.Ready;
  };
  const dispatch = () => result.current[1];
  expect(model()).toBe(Model.loading);
  await waitFor(() => expect(model().status).toBe("ready"));
  expect(ready().thoughts.size).toBe(0);
  expect(ready().settings.theme).toBe(null);
  act(() => dispatch()(Action.createThought(Thought.emptySpec())));
  expect(ready().thoughts.size).toBe(1);
  act(() => dispatch()(Action.setTheme("dark")));
  expect(ready().settings.theme).toBe("dark");
});
