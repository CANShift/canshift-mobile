import ExpoModulesCore
import NetworkExtension

private let joinOutcomes: [NEHotspotConfigurationError: String] = [
  .alreadyAssociated: "joined",
  .userDenied: "denied",
  .invalidWPAPassphrase: "invalid",
  .invalidSSID: "invalid",
]

private func outcome(of error: Error?) -> String {
  guard let error = error as NSError? else { return "joined" }
  guard error.domain == NEHotspotConfigurationErrorDomain,
    let code = NEHotspotConfigurationError(rawValue: error.code)
  else { return "failed" }
  return joinOutcomes[code] ?? "failed"
}

public class DashWifiModule: Module {
  public func definition() -> ModuleDefinition {
    Name("DashWifi")

    AsyncFunction("join") { (ssid: String, passphrase: String, promise: Promise) in
      let configuration = NEHotspotConfiguration(
        ssid: ssid, passphrase: passphrase, isWEP: false)
      configuration.joinOnce = false
      NEHotspotConfigurationManager.shared.apply(configuration) { error in
        promise.resolve(outcome(of: error))
      }
    }

    Function("forget") { (ssid: String) in
      NEHotspotConfigurationManager.shared.removeConfiguration(forSSID: ssid)
    }
  }
}
