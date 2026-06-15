import "dotenv/config";

const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
if (!googleMapsApiKey) {
  throw new Error(
    "GOOGLE_MAPS_API_KEY is not set. Add it to your local .env for local builds, " +
      "or as an EAS secret (`eas secret:create --name GOOGLE_MAPS_API_KEY`) for cloud builds. " +
      "Without it the Android build crashes at runtime with a missing Maps API key.",
  );
}

export default {
  expo: {
    name: "Janikoke",
    slug: "janikoke54",
    version: "2.0.4",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.anonymous.janikoke54",
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/android-icon-foreground.png",
        backgroundImage: "./assets/android-icon-background.png",
        monochromeImage: "./assets/android-icon-monochrome.png",
      },
      config: {
        googleMaps: {
          apiKey: googleMapsApiKey,
        },
      },
      package: "com.anonymous.janikoke",
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      eas: {
        projectId: "a12ce848-7666-40b4-8a46-154c41219de9",
      },
    },
    runtimeVersion: {
      policy: "appVersion",
    },
    updates: {
      url: "https://u.expo.dev/a12ce848-7666-40b4-8a46-154c41219de9",
    },
    plugins: [
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission:
            "Allow $(PRODUCT_NAME) to use your location.",
        },
      ],
      [
        "@sentry/react-native/expo",
        {
          url: "https://sentry.io/",
          project: "react-native",
          organization: "genjerator",
        },
      ],
      "@sentry/react-native",
      "@react-native-community/datetimepicker",
    ],
  },
};
