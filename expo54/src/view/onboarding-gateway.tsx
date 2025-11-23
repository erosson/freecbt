import { LoadModel, ModelLoadedProps } from "@/src/hooks/use-model";
import { Action } from "@/src/model";
import { Redirect, useGlobalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import { Routes } from "..";

export function OnboardingGateway(props: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <LoadModel
      ready={(lprops) => (
        <OnboardingReady {...lprops}>{props.children}</OnboardingReady>
      )}
    />
  );
}
function OnboardingReady(
  props: ModelLoadedProps & { children: React.ReactNode }
) {
  const { model, dispatch } = props;
  const { onboarded } = useGlobalSearchParams();

  // console.log("onboarding-gateway", model.settings.existingUser, onboarded);
  useEffect(() => {
    if (!model.settings.existingUser && onboarded) {
      // console.log("onboarding-gateway: set");
      dispatch(Action.setExistingUser());
    }
  });

  if (model.settings.existingUser || onboarded) {
    return props.children;
  } else {
    return <Redirect href={Routes.introV2({ onboarded: true })} />;
  }
}
