import LockScreen from "@/src/legacy/screen/LockScreen";
import React from "react";

export default function LockUpdateScreen(): React.JSX.Element {
  return <LockScreen isSettingCode={true} />;
}
