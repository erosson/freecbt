import { act, renderHook, waitFor } from "@testing-library/react-native";
import { useEffect, useState } from "react";

test("builtin hook", () => {
  const r = renderHook(() => useState(3));
  expect(r.result.current[0]).toEqual(3);
  act(() => {
    r.result.current[1](6);
  });
  expect(r.result.current[0]).toEqual(6);
});
test("builtin hook + useeffect", () => {
  const r = renderHook(() => {
    const [v, set] = useState(3);
    useEffect(() => {
      set(6);
    }, []);
    return [v, set];
  });
  expect(r.result.current[0]).toEqual(6);
});
test("builtin hook + sleep", async () => {
  const r = renderHook(() => {
    const [v, set] = useState(3);
    useEffect(() => {
      setTimeout(() => set(6), 1);
    }, []);
    return [v, set];
  });
  expect(r.result.current[0]).toEqual(3);
  await waitFor(() => {
    expect(r.result.current[0]).toEqual(6);
  });
});

// this passes, but throws obnoxious warnings about act() because we're calling an async function in useEffect()
// test.only("hook", async () => {
//   const r = renderHook(() => usePromiseState(Promise.resolve(3)));
//   expect(r.result.current).toEqual({ status: "pending" });
//   await waitFor(async () => {
//     // await act(async () => {
//     expect(r.result.current).toEqual({ status: "success", value: 3 });
//     // });
//   });
// });
