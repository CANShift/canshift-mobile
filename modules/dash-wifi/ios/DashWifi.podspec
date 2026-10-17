Pod::Spec.new do |s|
  s.name           = 'DashWifi'
  s.version        = '1.0.0'
  s.summary        = 'Joins the CANShift dash access point'
  s.description    = 'Joins and forgets the dash workshop-mode Wi-Fi with NEHotspotConfiguration'
  s.author         = 'CANShift'
  s.homepage       = 'https://github.com/CANShift/canshift-mobile'
  s.license        = 'MIT'
  s.platforms      = { :ios => '15.1' }
  s.source         = { git: '' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.frameworks     = 'NetworkExtension'
  s.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES' }
  s.source_files = '**/*.swift'
end
