import CreateThought from "./thoughts/create";

export default function Index() {
  // if (__DEV__) {
  //   const { Redirect } = require("expo-router");
  //   return <Redirect href="/v2" />;
  // }
  return <CreateThought />;
}
