/**
 * Use something resembling the Elm architecture in your Typescript programs.
 *
 * State describing your program:
 * - Model: your program's entire immutable state.
 * - Action: a message; a description of some event that has occurred.
 * - Command: an object describing a side effect.
 *
 * Functions describing your program:
 * - init: [Model, Command[]]
 *   The initial state of your program, alongside any side effects that should be performed immediately.
 * - update: (Model, Action) => [Model, Command[]]
 *   When an action occurs, change the model and apply some commands (side effects).
 * - runner: (Command) => void
 *   Execute impure, side-effectful code. Any and all side effects in your program go here.
 *   (Elm doesn't make you write this one)
 */
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";

type ElmArchCtxValue<M, A> = readonly [M, (a: A) => void];
interface ElmArchProviderProps<M, A, C> {
  init: readonly [M, readonly C[]];
  update: (m: M, a: A) => readonly [M, readonly C[]];
  runner: (d: (a: A) => void) => (c: C) => void | Promise<void>;
  children: React.ReactNode;
}
interface ElmArchCtx<M, A, C> {
  reactCtx: React.Context<ElmArchCtxValue<M, A> | null>;
  Provider: (p: ElmArchProviderProps<M, A, C>) => React.JSX.Element;
}

interface PureElmArchProviderProps<M, A> {
  init: M;
  update: (m: M, a: A) => M;
  children: React.ReactNode;
}
interface PureElmArchCtx<M, A> {
  reactCtx: React.Context<ElmArchCtxValue<M, A> | null>;
  Provider: (p: PureElmArchProviderProps<M, A>) => React.JSX.Element;
}

export function createElmArch<M, A, C>(): ElmArchCtx<M, A, C> {
  const Ctx = createContext<ElmArchCtxValue<M, A> | null>(null);
  const clearCmdsAction = {};
  function Provider(props: ElmArchProviderProps<M, A, C>) {
    const { init, update, runner, children } = props;
    const [[model, lastCmds], dispatch] = useReducer(
      ([m0, cs0], a: A | typeof clearCmdsAction) => {
        if (a === clearCmdsAction) {
          return [m0, []];
        }
        const [m1, cs1] = update(m0, a as A);
        return [m1, [...cs0, ...cs1]];
      },
      init
    );
    const run = useMemo(() => runner(dispatch), [runner]);
    useEffect(() => {
      if (!lastCmds.length) return;
      for (const cmd of lastCmds) {
        run(cmd);
      }
      dispatch(clearCmdsAction);
    }, [run, lastCmds]);
    return <Ctx value={[model, dispatch]}>{children}</Ctx>;
  }
  return { reactCtx: Ctx, Provider };
}

export function createPureElmArch<M, A>(): PureElmArchCtx<M, A> {
  const arch = createElmArch<M, A, never>();
  function Provider(props: PureElmArchProviderProps<M, A>) {
    return arch.Provider({
      init: [props.init, []],
      update: (m, a) => [props.update(m, a), []],
      runner: () => () => {},
      children: props.children,
    });
  }
  return { ...arch, Provider };
}

export function useElmArch<M, A, C>(
  ctx: ElmArchCtx<M, A, C> | PureElmArchCtx<M, A>
): ElmArchCtxValue<M, A> {
  const x = useContext(ctx.reactCtx);
  if (x === null) {
    throw new Error("You must use <A.Provider> before useElmArch(A)");
  }
  return x;
}
