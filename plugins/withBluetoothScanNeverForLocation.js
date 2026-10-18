const { withAndroidManifest } = require("@expo/config-plugins");

const ANDROID_NS = "http://schemas.android.com/apk/res/android";

function withBluetoothScanNeverForLocation(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    const permissions = manifest["uses-permission"] ?? [];

    for (const perm of permissions) {
      const name = perm.$["android:name"];
      if (name === "android.permission.BLUETOOTH_SCAN") {
        perm.$["android:usesPermissionFlags"] = "neverForLocation";
      } else if (name === "android.permission.ACCESS_FINE_LOCATION") {
        perm.$["android:maxSdkVersion"] = "30";
      }
    }

    manifest.$["xmlns:android"] = manifest.$["xmlns:android"] ?? ANDROID_NS;

    return config;
  });
}

module.exports = withBluetoothScanNeverForLocation;
