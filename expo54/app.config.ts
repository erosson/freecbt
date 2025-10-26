import { ConfigContext, ExpoConfig } from "expo/config";

const BUILD_VERSION = 34;

export default ({ config }: ConfigContext): ExpoConfig => ({
  name: "FreeCBT",
  slug: "freecbt",
  owner: "erosson",
  version: "3.0.0",
  orientation: "portrait",
  githubUrl: "https://github.com/erosson/freecbt",
  platforms: ["web", "android", "ios"],
  icon: "./assets/ios.png",
  scheme: "freecbt",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    bundleIdentifier: "org.erosson.freecbt",
    supportsTablet: true,
    icon: "./assets/ios.png",
    config: {
      usesNonExemptEncryption: false,
    },
    buildNumber: `${BUILD_VERSION}`,
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
      backgroundColor: "#F8A5C2",
    },
    versionCode: BUILD_VERSION,
  },
  web: {
    output: "static",
    favicon: "./assets/ios.png",
  },
  plugins: [
    "expo-router",
    "expo-localization",
    [
      "expo-splash-screen",
      {
        image: "./assets/splash.png",
        resizeMode: "contain",
        backgroundColor: "#F8A5C2",
        dark: {
          backgroundColor: "#000000",
        },
      },
    ],
  ],
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
    policy: "sdkVersion",
  },
  assetBundlePatterns: ["**/*"],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});
