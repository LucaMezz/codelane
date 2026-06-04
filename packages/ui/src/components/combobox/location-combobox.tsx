import { getTimeZones } from "@vvo/tzdb";
import { countries } from "countries-list";
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

// ── Data ──────────────────────────────────────────────────────────────────────

interface LocationOption {
  label: string;
  group: "Cities" | "Countries";
  searchText: string;
}

const LOCATION_OPTIONS: LocationOption[] = (() => {
  const cityOptions: LocationOption[] = [];
  const seen = new Set<string>();

  // Derive cities from timezone data — covers all major world cities
  for (const tz of getTimeZones()) {
    for (const city of tz.mainCities) {
      const label = `${city}, ${tz.countryName}`;
      if (!seen.has(label)) {
        seen.add(label);
        cityOptions.push({
          label,
          group: "Cities",
          searchText: label.toLowerCase(),
        });
      }
    }
  }

  cityOptions.sort((a, b) => a.label.localeCompare(b.label));

  // All country names
  const countryOptions: LocationOption[] = Object.values(countries)
    .map((c) => ({
      label: c.name,
      group: "Countries" as const,
      searchText: c.name.toLowerCase(),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return [...countryOptions, ...cityOptions];
})();

// ── Component ─────────────────────────────────────────────────────────────────

const MAX_RESULTS = 40;

interface LocationComboboxProps {
  id?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  className?: string;
}

function LocationCombobox({
  id,
  value,
  onValueChange,
  onBlur,
  disabled,
  className,
}: LocationComboboxProps) {
  const [query, setQuery] = React.useState("");

  const { cities, countries: countryResults } = React.useMemo(() => {
    const q = (query ?? "").toLowerCase().trim();
    const matches = q
      ? LOCATION_OPTIONS.filter((o) => o.searchText.includes(q)).slice(0, MAX_RESULTS)
      : LOCATION_OPTIONS.slice(0, MAX_RESULTS);

    return {
      cities: matches.filter((o) => o.group === "Cities"),
      countries: matches.filter((o) => o.group === "Countries"),
    };
  }, [query]);

  function handleInputChange(inputValue: string) {
    setQuery(inputValue);
    // Freeform: the typed text is always the live form value
    onValueChange?.(inputValue);
  }

  function handleSelect(selected: string | null) {
    if (selected) onValueChange?.(selected);
  }

  return (
    <Combobox
      value={value ?? null}
      onValueChange={handleSelect}
      onInputValueChange={handleInputChange}
    >
      <ComboboxInput
        id={id}
        placeholder="e.g. Melbourne, Australia"
        disabled={disabled}
        className={className}
        onBlur={onBlur}
        showTrigger
        showClear={!!value}
      />
      <ComboboxContent>
        <ComboboxList>
          {countryResults.length > 0 && (
            <ComboboxGroup>
              <ComboboxLabel>Countries</ComboboxLabel>
              {countryResults.map((opt) => (
                <ComboboxItem key={opt.label} value={opt.label}>
                  {opt.label}
                </ComboboxItem>
              ))}
            </ComboboxGroup>
          )}
          {cities.length > 0 && (
            <ComboboxGroup>
              <ComboboxLabel>Cities</ComboboxLabel>
              {cities.map((opt) => (
                <ComboboxItem key={opt.label} value={opt.label}>
                  {opt.label}
                </ComboboxItem>
              ))}
            </ComboboxGroup>
          )}
        </ComboboxList>
        <ComboboxEmpty>
          {query.trim()
            ? "No suggestions — your text will be saved as entered."
            : "Start typing to search locations."}
        </ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  );
}

export { LocationCombobox };
