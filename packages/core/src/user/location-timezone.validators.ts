import { getTimeZones } from "@vvo/tzdb";
import { countries } from "countries-list";
import { z } from "zod";

// ── Cache ─────────────────────────────────────────────────────────────────────

let _validLocations: Set<string> | null = null;
let _validTimezones: Set<string> | null = null;

/**
 * Get the set of valid location values.
 * Includes all country names and "City, Country" combinations from timezone data.
 * These are the predefined options in the LocationCombobox dropdown.
 * Cached after first call.
 */
export function getValidLocations(): Set<string> {
  if (_validLocations) return _validLocations;

  const locations = new Set<string>();

  // All country names
  for (const country of Object.values(countries)) {
    locations.add(country.name);
  }

  // All "City, Country" combinations from timezone mainCities
  for (const tz of getTimeZones()) {
    for (const city of tz.mainCities) {
      locations.add(`${city}, ${tz.countryName}`);
    }
  }

  _validLocations = locations;
  return locations;
}

/**
 * Get the set of valid timezone names (IANA timezone identifiers).
 * These are all timezones returned by @vvo/tzdb.
 * Cached after first call.
 */
export function getValidTimezones(): Set<string> {
  if (_validTimezones) return _validTimezones;

  const timezones = new Set<string>();

  for (const tz of getTimeZones({ includeUtc: true })) {
    timezones.add(tz.name);
  }

  _validTimezones = timezones;
  return timezones;
}

/**
 * Validate location field.
 * Accepts any non-empty string (LocationCombobox allows freeform input).
 * Empty string is allowed to clear the field.
 */
export const locationValidator = z
  .string()
  .trim()
  .max(100, "Location must be at most 100 characters.")
  .optional();

/**
 * Validate timezone field.
 * Must be a valid IANA timezone identifier from @vvo/tzdb (includes UTC).
 * TimezoneCombobox only allows selection from predefined timezones.
 * Empty string is allowed to clear the field.
 */
export const timezoneValidator = z
  .string()
  .trim()
  .max(100, "Timezone must be at most 100 characters.")
  .refine(
    (val) => val === "" || getValidTimezones().has(val),
    "Timezone must be a valid IANA timezone identifier.",
  )
  .optional();
