// Shared Podfile post_install patcher: inserts `patch` just before the final
// `end` pair that closes the post_install block, once, guarded by `marker`.
const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

module.exports = function withPodfilePostInstall(
  config,
  pluginName,
  marker,
  patch,
) {
  return withDangerousMod(config, [
    "ios",
    (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile",
      );
      const podfile = fs.readFileSync(podfilePath, "utf8");

      if (podfile.includes(marker)) {
        return config;
      }

      const insertionRegex = /\n( {2}end\nend\s*\n?)$/;
      if (!insertionRegex.test(podfile)) {
        throw new Error(
          `${pluginName}: could not locate post_install closing in Podfile. ` +
            "The plugin needs an update for the current Expo template.",
        );
      }

      const patched = podfile.replace(insertionRegex, `${patch}\n$1`);
      fs.writeFileSync(podfilePath, patched);
      return config;
    },
  ]);
};
