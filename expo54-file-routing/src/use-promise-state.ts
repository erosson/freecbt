import { PromiseState } from "@/src/model";
import React, { useEffect, useState } from "react";

/**
 * Load some data asynchronously. Represent it synchronously using a PromiseState.
 *
 * See also <PromiseRender />.
 *
 * Usage:
 *
 *     // replace the Promise.resolve() below with a real promise, like a fetch()
 *     function Home(): React.ReactNode {
 *       const num = useAsyncState(Promise.resolve(Math.random()))
 *       switch(num.status) {
 *         case 'pending': return <Text>Loading...</Text>
 *         case 'failure': return <Text>error: {num.error.message}</Text>
 *         case 'success': return <Text>value: {num.value}</Text>
 *       }
 *     }
 */
export function usePromiseState<V>(p: Promise<V>): PromiseState.T<V> {
  const [value, setValue] = useState<PromiseState.T<V>>(PromiseState.pending());
  useEffect(() => {
    (async () => {
      try {
        setValue(PromiseState.success(await p));
      } catch (e) {
        setValue(PromiseState.failure(e as Error));
      }
    })();
  }, [p]);
  return value;
}

/**
 * Render data inside a Promise, with loading and error states.
 *
 * Usage:
 *
 *     // replace the Promise.resolve() below with a real promise, like a fetch()
 *     function Home(): React.ReactNode {
 *       const num = Promise.resolve(Math.random())
 *       return (
 *         <PromiseRender
 *           promise={num}
 *           pending={() => <Loading />}
 *           failure={(e) => <Text>error: {e.message}</Text>}
 *           success={(v) => <Text>{v}</Text>}
 *         />
 *       );
 *     }
 */
export function PromiseRender<V>(
  props: PromiseState.Match<React.ReactNode, V, Error> & { promise: Promise<V> }
): React.ReactNode {
  const { promise, ...match } = props;
  const v = usePromiseState<V>(promise);
  return PromiseState.match(v, match);
}
