/**
 * @jest-environment jsdom
 */
import { RemoteData, useAsyncEffect, useAsyncState } from "./async-state"
import { act, cleanup, renderHook } from "@testing-library/react"

test("useAsyncEffect lifecycle", async () => {
  let state: RemoteData<void> = { status: "init" }
  let effect = false
  let clean = false
  renderHook(() => {
    state = useAsyncEffect({
      effect: async () => {
        await new Promise((resolve) => setTimeout(resolve, 0))
        effect = true
      },
      cleanup: () => {
        clean = true
      },
    })
  })
  expect(state.status).toBe("pending")
  expect(effect).toBe(false)
  expect(clean).toBe(false)
  await act(() =>
    state.status === "pending" ? state.promise : fail("state is not pending")
  )
  expect(effect).toBe(true)
  expect(clean).toBe(false)
  cleanup()
  expect(effect).toBe(true)
  expect(clean).toBe(true)
})

test("useAsyncEffect simple success", async () => {
  let state: RemoteData<void> = { status: "init" }
  renderHook(() => {
    state = useAsyncEffect(async () => {})
  })
  expect(state.status).toBe("pending")
  await act(() =>
    state.status === "pending" ? state.promise : fail("state is not pending")
  )
  expect(state.status).toBe("success")
  expect((state as any)["value"]).toBeUndefined()
})

test("useAsyncEffect simple failure", async () => {
  let state: RemoteData<void> = { status: "init" }
  renderHook(() => {
    state = useAsyncEffect(async () => {
      throw new Error("oops")
    })
  })
  expect(state.status).toBe("pending")
  await act(() =>
    state.status === "pending" ? state.promise : fail("state is not pending")
  )
  expect(state.status).toBe("failure")
  expect((state as any)["error"]).toBeInstanceOf(Error)
})

test("useAsyncState simple success", async () => {
  let state: RemoteData<number> = { status: "init" }
  renderHook(() => {
    state = useAsyncState(async () => 3)
  })
  expect(state.status).toBe("pending")
  await act(() =>
    state.status === "pending" ? state.promise : fail("state is not pending")
  )
  expect(state.status).toBe("success")
  expect((state as any)["value"]).toBe(3)
})

test("useAsyncState simple failure", async () => {
  let state: RemoteData<number> = { status: "init" }
  renderHook(() => {
    state = useAsyncState(async () => {
      throw new Error("oops")
    })
  })
  expect(state.status).toBe("pending")
  await act(() =>
    state.status === "pending" ? state.promise : fail("state is not pending")
  )
  expect(state.status).toBe("failure")
  expect((state as any)["error"]).toBeInstanceOf(Error)
})
