import { STRINGS } from "../strings";
import type { FlowFailure } from "../services/workshop/firmware-flow-types";

const F = STRINGS.firmware;

export interface FailureCopy {
  title: string;
  cause: string;
  advice: string;
  canRetry: boolean;
}

type RefusalKind = "signature" | "otherDash" | "refused";

type CopyKind = RefusalKind | Exclude<FlowFailure["kind"], "refused">;

const REFUSAL_BY_CODE: Record<string, RefusalKind> = {
  ota_bad_signature: "signature",
  ota_unsigned: "signature",
  size_out_of_range: "otherDash",
  not_app_image: "otherDash",
};

const OTHER_DASH_DETAIL = "0x1503";

const failed = (cause: string, advice: string, canRetry: boolean) => ({
  title: F.failureTitle,
  cause,
  advice,
  canRetry,
});

const COPY: Record<CopyKind, (version: string) => FailureCopy> = {
  signature: (version) =>
    failed(F.signatureMismatch(version), F.signatureAdvice, false),
  otherDash: (version) =>
    failed(F.otherDash(version), F.signatureAdvice, false),
  refused: (version) => failed(F.refused(version), F.refusedAdvice, true),
  differentDash: (version) =>
    failed(F.differentDash(version), F.differentDashAdvice, true),
  dropped: (version) =>
    failed(F.wifiDropped(version), F.wifiDroppedAdvice, true),
  rolledBack: (version) =>
    failed(F.rolledBack(version), F.rolledBackAdvice, false),
  notBack: () => ({
    title: F.notBackTitle,
    cause: F.notBack,
    advice: F.notBackAdvice,
    canRetry: false,
  }),
};

const refusalKind = (code: string, detail: string | null): RefusalKind =>
  detail?.toLowerCase() === OTHER_DASH_DETAIL
    ? "otherDash"
    : (REFUSAL_BY_CODE[code] ?? "refused");

const copyKind = (failure: FlowFailure): CopyKind =>
  failure.kind === "refused"
    ? refusalKind(failure.code, failure.detail)
    : failure.kind;

export const failureCopy = (
  failure: FlowFailure,
  running: string,
): FailureCopy =>
  COPY[copyKind(failure)](
    failure.kind === "rolledBack" ? failure.running : running,
  );
