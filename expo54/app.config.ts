import { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  name: "FreeCBT",
  slug: "freecbt",
  version: "2.4.0",
  owner: "erosson",
  githubUrl: "https://github.com/erosson/freecbt",
  platforms: ["android", "ios", "web"],
  orientation: "portrait",
  icon: "./assets/ios.png",
  scheme: "freecbt",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  primaryColor: "#F8A5C2",
  ios: {
    bundleIdentifier: "org.erosson.freecbt",
    supportsTablet: true,
    icon: "./assets/ios.png",
    config: {
      // this silences a warning during `eas build -p ios`:
      // `app.config.ts is missing ios.infoPlist.ITSAppUsesNonExemptEncryption boolean. Manual configuration is required in App Store Connect before the app can be tested.`
      usesNonExemptEncryption: false,
    },
  },
  android: {
    package: "org.erosson.freecbt",
    permissions: [],
    blockedPermissions: [
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.WRITE_EXTERNAL_STORAGE",
    ],
    icon: "./assets/android.png",
    adaptiveIcon: {
      foregroundImage: "./assets/android-adaptive.png",
      backgroundColor: "#FFFFFF",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: "static",
    // favicon: "./assets/images/favicon.png",
    favicon: "./assets/ios.png",
  },
  notification: {
    icon: "./assets/quirk-bw.png",
  },
  // OTA update details:
  updates: {
    fallbackToCacheTimeout: 0,
    url: "https://u.expo.dev/7fbb9321-8d12-487a-a336-d12462e5f549",
  },
  extra: {
    eas: {
      projectId: "7fbb9321-8d12-487a-a336-d12462e5f549",
    },
  },
  runtimeVersion: {
    // Property indicating compatibility between a build's native code and an OTA update.
    // https://docs.expo.dev/eas-update/runtime-versions/
    policy: "sdkVersion",
  },
  plugins: [
    "expo-router",
    "expo-localization",
    [
      "expo-splash-screen",
      {
        image: "./assets/android.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#F8A5C2",
        dark: {
          backgroundColor: "#000000",
        },
      },
    ],
    "expo-web-browser",
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});
