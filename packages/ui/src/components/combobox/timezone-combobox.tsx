import { getTimeZones, type TimeZone } from "@vvo/tzdb";
import * as React from "react";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
} from "#components/shadcn-ui/combobox";

// ── Formatting helpers ────────────────────────────────────────────────────────

function formatOffset(minutes: number): string {
  const sign = minutes >= 0 ? "+" : "-";
  const abs = Math.abs(minutes);
  const h = String(Math.floor(abs / 60)).padStart(2, "0");
  const m = String(abs % 60).padStart(2, "0");
  return `UTC${sign}${h}:${m}`;
}

// ── Data ──────────────────────────────────────────────────────────────────────

interface TzOption {
  tz: TimeZone;
  formattedName: string;
  offset: string;
  cityList: string;
  searchText: string;
}

// Built once at module load — static per session.
const TZ_BY_CONTINENT = (() => {
  const grouped = new Map<string, TzOption[]>();

  for (const tz of getTimeZones({ includeUtc: true }).sort(
    (a, b) =>
      a.currentTimeOffsetInMinutes - b.currentTimeOffsetInMinutes || a.name.localeCompare(b.name),
  )) {
    const option: TzOption = {
      tz,
      formattedName: tz.name.replace(/_/g, " "),
      offset: formatOffset(tz.currentTimeOffsetInMinutes),
      cityList: tz.mainCities.slice(0, 3).join(", "),
      searchText: [
        tz.name,
        tz.alternativeName,
        tz.mainCities.join(" "),
        tz.countryName,
        formatOffset(tz.currentTimeOffsetInMinutes),
      ]
        .join(" ")
        .toLowerCase(),
    };

    const continent = tz.continentName;
    if (!grouped.has(continent)) grouped.set(continent, []);
    grouped.get(continent)!.push(option);
  }

  return grouped;
})();

// ── Component ─────────────────────────────────────────────────────────────────

interface TimezoneComboboxProps {
  id?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  className?: string;
}

function TimezoneCombobox({
  id,
  value,
  onValueChange,
  onBlur,
  disabled,
  className,
}: TimezoneComboboxProps) {
  const [query, setQuery] = React.useState("");

  const filteredGroups = React.useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return TZ_BY_CONTINENT;

    const result = new Map<string, TzOption[]>();
    for (const [continent, options] of TZ_BY_CONTINENT) {
      const matches = options.filter((o) => o.searchText.includes(q));
      if (matches.length > 0) result.set(continent, matches);
    }
    return result;
  }, [query]);

  return (
    <Combobox
      value={value ?? null}
      onValueChange={(v) => onValueChange?.(v ?? "")}
      onInputValueChange={(inputValue) => setQuery(inputValue)}
    >
      <ComboboxInput
        id={id}
        placeholder="Search timezone by city, country, or offset…"
        disabled={disabled}
        className={className}
        onBlur={onBlur}
        showTrigger
        showClear={!!value}
      />
      <ComboboxContent>
        <ComboboxList>
          {Array.from(filteredGroups.entries()).map(([continent, options]) => (
            <ComboboxGroup key={continent}>
              <ComboboxLabel>{continent}</ComboboxLabel>
              {options.map(({ tz, offset, cityList }) => (
                <ComboboxItem key={tz.name} value={tz.name}>
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex-shrink-0 text-sm font-medium">{offset}</span>
                    <span className="min-w-0 truncate text-xs text-muted-foreground">
                      {cityList}
                      {tz.countryName ? ` · ${tz.countryName}` : ""}
                    </span>
                  </div>
                </ComboboxItem>
              ))}
            </ComboboxGroup>
          ))}
        </ComboboxList>
        <ComboboxEmpty>No timezone found.</ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  );
}

export { TimezoneCombobox };
