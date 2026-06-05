import { getTimeZones, type TimeZone } from "@vvo/tzdb";
import { CheckIcon, ChevronDownIcon, XIcon } from "lucide-react";
import * as React from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "#components/shadcn-ui/command";
import { InputGroup, InputGroupAddon, InputGroupButton } from "#components/shadcn-ui/input-group";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "#components/shadcn-ui/popover";
import { cn } from "#utils/cn";

// ── Formatting helpers ────────────────────────────────────────────────────────

function formatOffset(minutes: number): string {
  const sign = minutes >= 0 ? "+" : "-";
  const abs = Math.abs(minutes);
  const h = String(Math.floor(abs / 60)).padStart(2, "0");
  const m = String(abs % 60).padStart(2, "0");
  return `UTC${sign}${h}:${m}`;
}

// A real abbreviation is 2–6 uppercase letters (EST, AEST, GMT, CST, etc.).
// Numeric offsets like "+05:30" are excluded.
function isRealAbbreviation(abbr: string): boolean {
  return /^[A-Z]{2,6}$/.test(abbr) && abbr !== "UTC";
}

function buildInputLabel(offset: string, abbreviation: string): string {
  return isRealAbbreviation(abbreviation) ? `${offset} ${abbreviation}` : offset;
}

// ── Data ──────────────────────────────────────────────────────────────────────

interface TzOption {
  tz: TimeZone;
  formattedName: string;
  offset: string;
  cityList: string;
  searchText: string;
  inputLabel: string;
}

// Built once at module load — static per session.
const { TZ_BY_CONTINENT, TZ_LABEL_MAP } = (() => {
  const grouped = new Map<string, TzOption[]>();
  const labels = new Map<string, string>();

  for (const tz of getTimeZones({ includeUtc: true }).sort(
    (a, b) =>
      a.currentTimeOffsetInMinutes - b.currentTimeOffsetInMinutes || a.name.localeCompare(b.name),
  )) {
    const formattedName = tz.name.replace(/_/g, " ");
    const offset = formatOffset(tz.currentTimeOffsetInMinutes);
    const inputLabel = buildInputLabel(offset, tz.abbreviation);

    const option: TzOption = {
      tz,
      formattedName,
      offset,
      cityList: tz.mainCities.slice(0, 3).join(", "),
      searchText: [
        tz.name,
        tz.alternativeName,
        tz.mainCities.join(" "),
        tz.countryName,
        offset,
        tz.abbreviation,
      ]
        .join(" ")
        .toLowerCase(),
      inputLabel,
    };

    labels.set(tz.name, inputLabel);

    const continent = tz.continentName;
    if (!grouped.has(continent)) grouped.set(continent, []);
    grouped.get(continent)!.push(option);
  }

  return { TZ_BY_CONTINENT: grouped, TZ_LABEL_MAP: labels };
})();

// ── Component ─────────────────────────────────────────────────────────────────

// similarity-ignore — generic combobox props; intentionally the same shape as
// LocationComboboxProps, each scoped to its own component.
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
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);

  const selectedLabel = value ? (TZ_LABEL_MAP.get(value) ?? value) : null;

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

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (!isOpen) {
      setQuery("");
      onBlur?.();
    }
  }

  function handleSelect(tzName: string) {
    onValueChange?.(tzName);
    setOpen(false);
    setQuery("");
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    onValueChange?.("");
  }

  // Focus the search input once the popover finishes opening
  React.useEffect(() => {
    if (open) {
      const id = setTimeout(() => searchRef.current?.focus(), 0);
      return () => clearTimeout(id);
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverAnchor asChild>
        <InputGroup ref={anchorRef} className={cn("w-auto", className)}>
          <PopoverTrigger asChild>
            <button
              id={id}
              type="button"
              data-slot="input-group-control"
              disabled={disabled}
              className="flex min-w-0 flex-1 cursor-default items-center px-3 text-sm outline-none disabled:cursor-not-allowed"
            >
              <span
                className={cn(
                  "flex-1 truncate text-left",
                  !selectedLabel && "text-muted-foreground",
                )}
              >
                {selectedLabel ?? "Search timezone by city, country, or offset…"}
              </span>
            </button>
          </PopoverTrigger>
          <InputGroupAddon align="inline-end">
            {value && (
              <InputGroupButton
                size="icon-xs"
                variant="ghost"
                onClick={handleClear}
                disabled={disabled}
              >
                <XIcon className="pointer-events-none" />
              </InputGroupButton>
            )}
            <InputGroupButton
              size="icon-xs"
              variant="ghost"
              tabIndex={-1}
              onClick={() => setOpen((o) => !o)}
              disabled={disabled}
              className="data-pressed:bg-transparent"
            >
              <ChevronDownIcon className="pointer-events-none text-muted-foreground" />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </PopoverAnchor>

      <PopoverContent
        align="start"
        sideOffset={4}
        className="p-0"
        style={{ width: anchorRef.current?.offsetWidth }}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command shouldFilter={false}>
          <CommandInput
            ref={searchRef}
            placeholder="Search timezone by city, country, or offset…"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>No timezone found.</CommandEmpty>
            {Array.from(filteredGroups.entries()).map(([continent, options]) => (
              <CommandGroup key={continent} heading={continent}>
                {options.map(({ tz, offset, cityList }) => (
                  <CommandItem
                    key={tz.name}
                    value={tz.name}
                    onSelect={handleSelect}
                    className="pr-8"
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <span className="flex-shrink-0 text-sm font-medium">{offset}</span>
                      <span className="min-w-0 truncate text-xs text-muted-foreground">
                        {cityList}
                        {tz.countryName ? ` · ${tz.countryName}` : ""}
                      </span>
                    </div>
                    {value === tz.name && (
                      <CheckIcon className="pointer-events-none absolute right-2 size-4" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export { TimezoneCombobox };
