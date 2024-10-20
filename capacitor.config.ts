import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "cash.wallet.watch",
  appName: "Wallet Watch",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
    },
  },
};

export default config;
