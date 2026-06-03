import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";

import { LocationCombobox } from "#components/combobox/location-combobox";

const meta = {
  title: "ui/combobox/LocationCombobox",
  component: LocationCombobox,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof LocationCombobox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const PreselectedCity: Story = {
  args: { value: "Melbourne, Australia" },
};

export const PreselectedCountry: Story = {
  args: { value: "Australia" },
};

/**
 * Demonstrates freeform entry — the user can type anything (e.g. "Victoria, Australia")
 * even if it's not in the suggestions list.
 */
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = React.useState("");
    return (
      <div className="max-w-sm space-y-2">
        <LocationCombobox value={value} onValueChange={setValue} />
        <p className="text-xs text-muted-foreground">
          Stored value: <code>{value || "(none)"}</code>
        </p>
      </div>
    );
  },
};
