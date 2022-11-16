import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export const enum Screen {
    CBT_FORM = "CBT_FORM_SCREEN",
    CBT_LIST = "CBT_LIST_SCREEN",
    ONBOARDING = "ONBOARDING_SCREEN",
    EXPLANATION = "EXPLANATION_SCREEN",
    SETTING = "SETTING_SCREEN",
    INIT = "INIT_SCREEN",
    CBT_VIEW = "CBT_VIEW_SCREEN",
    LOCK = "LOCK_SCREEN",
    DEBUG = "DEBUG_SCREEN",
}

export type ParamList = {
    [Screen.DEBUG]: undefined,
    [Screen.EXPLANATION]: undefined,
    [Screen.ONBOARDING]: undefined,
}

export type NavigationProp = NativeStackNavigationProp<ParamList>