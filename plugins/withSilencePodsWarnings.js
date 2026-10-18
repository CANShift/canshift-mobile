const PATCH_MARKER = "# canshift-silence-pods-warnings";
const PATCH = `
    ${PATCH_MARKER}
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['CLANG_WARN_DOCUMENTATION'] = 'NO'
        config.build_settings['CLANG_WARN_DOCUMENTATION_COMMENTS'] = 'NO'
        config.build_settings['CLANG_WARN_OBJC_DESIGNATED_INITIALIZERS'] = 'NO'
        config.build_settings['CLANG_WARN_DEPRECATED_OBJC_IMPLEMENTATIONS'] = 'NO'
        config.build_settings['GCC_WARN_INHIBIT_ALL_WARNINGS'] = 'YES'
      end
    end
`;

const withPodfilePostInstall = require("./withPodfilePostInstall");

module.exports = function withSilencePodsWarnings(config) {
  return withPodfilePostInstall(
    config,
    "withSilencePodsWarnings",
    PATCH_MARKER,
    PATCH,
  );
};
