import { STRINGS } from "../strings";
import { formatWidgetValue } from "../components/widgets/widget-value";
import type { AlertEntry } from "./alert-model";

const SECONDS_PER_MINUTE = 60;

const withUnit = (text: string, unit: string): string =>
  unit === "" ? text : `${text} ${unit}`;

export const alertTitle = (entry: AlertEntry): string =>
  entry.limit === null
    ? entry.name.toUpperCase()
    : STRINGS.alert.title(
        entry.name,
        entry.limit.direction === "below" ? "LOW" : "HIGH",
      );

export const alertValue = (entry: AlertEntry): string =>
  formatWidgetValue(entry.value, entry.decimals);

export const alertLimit = (entry: AlertEntry): string => {
  if (entry.limit === null) return STRINGS.alert.limitUnknown;
  const limit = withUnit(
    formatWidgetValue(entry.limit.value, entry.decimals),
    entry.unit,
  );
  return entry.limit.direction === "below"
    ? STRINGS.alert.limitBelow(limit)
    : STRINGS.alert.limitAbove(limit);
};

export const alertSince = (seconds: number): string => {
  const minutes = Math.floor(seconds / SECONDS_PER_MINUTE);
  const rest = String(seconds % SECONDS_PER_MINUTE).padStart(2, "0");
  return `${String(minutes)}:${rest}`;
};

export const alertStripLine = (entry: AlertEntry): string => {
  const title = alertTitle(entry);
  const named = title.charAt(0) + title.slice(1).toLowerCase();
  return STRINGS.alert.stripLine(
    named,
    withUnit(alertValue(entry), entry.unit),
  );
};

export const alertSpoken = (entry: AlertEntry): string =>
  `${alertTitle(entry)}, ${withUnit(alertValue(entry), entry.unit)}, ${alertLimit(entry)}`;
