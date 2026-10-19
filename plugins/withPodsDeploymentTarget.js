const PATCH_MARKER = "# canshift-pods-deployment-target";
const PATCH = `
    ${PATCH_MARKER}
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        current = config.build_settings['IPHONEOS_DEPLOYMENT_TARGET']
        if current.nil? || Gem::Version.new(current) < Gem::Version.new('16.4')
          config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '16.4'
        end
      end
    end
`;

const withPodfilePostInstall = require("./withPodfilePostInstall");

module.exports = function withPodsDeploymentTarget(config) {
  return withPodfilePostInstall(
    config,
    "withPodsDeploymentTarget",
    PATCH_MARKER,
    PATCH,
  );
};
