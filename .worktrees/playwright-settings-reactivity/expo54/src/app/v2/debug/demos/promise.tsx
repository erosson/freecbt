import { PromiseRender, usePromiseState } from "@/src/hooks/use-promise-state";
import React, { Suspense, use, useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function Index() {
  return (
    <View>
      <Text>Demo some various ways to render promises.</Text>
      <Text>useEffect: </Text>
      <UseEffectRoll />
      <Text>&lt;React.Suspense&gt; </Text>
      <Suspense fallback={<ActivityIndicator />}>
        <SuspenseRoll p={slowRandomInt()} />
      </Suspense>
      <Text>&lt;React.Suspense&gt;, but simpler </Text>
      <Suspense fallback={<ActivityIndicator />}>
        <SuspenseRoll p={baka()} />
      </Suspense>
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
    return <ActivityIndicator />;
  }
  return <Text>{val}</Text>;
}
function UsePromiseStateSwitch() {
  const val = usePromiseState(slowRandomInt());
  switch (val.status) {
    case "pending":
      return <ActivityIndicator />;
    case "failure":
      return <Text>error: {val.error.message}</Text>;
    case "success":
      return <Text>{val.value}</Text>;
    default:
      throw new Error(val satisfies never);
  }
}
function UsePromiseRender() {
  const p = slowRandomInt();
  return (
    <PromiseRender
      promise={p}
      pending={() => <ActivityIndicator />}
      failure={(e) => <Text>error: {e.message}</Text>}
      success={(v) => <Text>{v}</Text>}
    />
  );
}
// this is super finicky. you cannot create the promise inside this element, it must be passed as a parameter or it spins forever.
function SuspenseRoll(props: { p: Promise<number> }) {
  const val = use(props.p);
  return <Text>{val}</Text>;
}

function randomInt(opts: { max: number; min?: number }): number {
  const { max } = opts;
  const min = opts.min ?? 1;
  const diff = max - min + 1;
  return Math.floor(Math.random() * diff) + min;
}
async function baka() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return 9;
}
async function slowRandomInt() {
  const ms = randomInt({ max: 3000 });
  await new Promise((resolve) => setTimeout(resolve, ms));
  return randomInt({ max: 100 });
}
