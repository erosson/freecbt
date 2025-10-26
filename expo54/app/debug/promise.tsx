import { PromiseRender, usePromiseState } from "@/src/hooks/use-promise-state";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";

export default function Index() {
  //   const suspenseRoll = slowRandomInt();
  return (
    <View>
      <Text>Demo some various ways to render promises.</Text>
      <Text>useEffect: </Text>
      <UseEffectRoll />
      <Text>&lt;React.Suspense&gt; </Text>
      {/* <SuspenseRoll val={suspenseRoll} /> */}
      <Text>BROKEN</Text>
      <Text>My usePromiseState: </Text>
      <UsePromiseStateSwitch />
      <Text>My &lt;PromiseRender&gt;: </Text>
      <UsePromiseRender />
    </View>
  );
}
function UseEffectRoll() {
  const [val, setVal] = useState<number | null>(null);
  useEffect(() => {
    (async () => {
      setVal(await slowRandomInt());
    })();
  }, []);
  if (val === null) {
    return <Loading />;
  }
  return <Text>{val}</Text>;
}
function UsePromiseStateSwitch() {
  const val = usePromiseState(slowRandomInt());
  switch (val.status) {
    case "pending":
      return <Loading />;
    case "failure":
      return <Text>error: {val.error.message}</Text>;
    case "success":
      return <Text>{val.value}</Text>;
  }
}
function UsePromiseRender() {
  const p = slowRandomInt();
  return (
    <PromiseRender
      promise={p}
      pending={() => <Loading />}
      failure={(e) => <Text>error: {e.message}</Text>}
      success={(v) => <Text>{v}</Text>}
    />
  );
}
// this falls apart because suspense/use() doesn't work with promises created during render.
// don't know how I'm supposed to use this with asyncStorage, then...
//
// function SuspenseRoll(props: { val: Promise<number> }) {
//   console.log("suspenseroll...");
//   const val = use(props.val);
//   console.log("suspenseroll", val);
//   return (
//     <Suspense fallback={<Loading />}>
//       <Text>{val}</Text>
//     </Suspense>
//   );
// }

function Loading() {
  return <Text>Loading...</Text>;
}
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
function randomInt(opts: { max: number; min?: number }): number {
  const { max } = opts;
  const min = opts.min ?? 1;
  const diff = max - min + 1;
  return Math.floor(Math.random() * diff) + min;
}
async function slowRandomInt(): Promise<number> {
  if (typeof window !== "undefined") {
    await sleep(randomInt({ max: 3000 }));
  }
  return randomInt({ max: 100 });
}
