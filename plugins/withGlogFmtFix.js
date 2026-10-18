const PATCH_MARKER = "# canshift-fmt-glog-cxx17-fix";
const PATCH = `
    ${PATCH_MARKER}
    installer.pods_project.targets.each do |target|
      if ['fmt', 'glog'].include?(target.name)
        target.build_configurations.each do |config|
          config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'gnu++17'
        end
      end
    end
    ['fmt', 'glog'].each do |pod_name|
      ['Debug', 'Release'].each do |cfg|
        xcconfig_path = File.join(
          installer.sandbox.root,
          "Target Support Files/#{pod_name}/#{pod_name}.#{cfg.downcase}.xcconfig"
        )
        next unless File.exist?(xcconfig_path)
        content = File.read(xcconfig_path)
        content.gsub!(/CLANG_CXX_LANGUAGE_STANDARD = c\\+\\+20/, 'CLANG_CXX_LANGUAGE_STANDARD = gnu++17')
        File.write(xcconfig_path, content)
      end
    end
`;

const withPodfilePostInstall = require("./withPodfilePostInstall");

module.exports = function withGlogFmtFix(config) {
  return withPodfilePostInstall(config, "withGlogFmtFix", PATCH_MARKER, PATCH);
};
