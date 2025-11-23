/**
 * @jest-environment jsdom
 */
import { act, renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { Action, Model, Thought } from "../model";
import { ModelProvider, useModel } from "./use-model";

test("use-model basics", async () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ModelProvider>{children}</ModelProvider>
  );
  const { result } = renderHook(() => useModel(), { wrapper });
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
  act(() => dispatch()(Action.createThought(Thought.emptySpec(), new Date(0))));
  expect(ready().thoughts.size).toBe(1);
  act(() => dispatch()(Action.setTheme("dark")));
  expect(ready().settings.theme).toBe("dark");
});
