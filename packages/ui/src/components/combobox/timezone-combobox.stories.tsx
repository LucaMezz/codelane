import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";

import { TimezoneCombobox } from "#components/combobox/timezone-combobox";

const meta = {
  title: "ui/combobox/TimezoneCombobox",
  component: TimezoneCombobox,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof TimezoneCombobox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const PreselectedValue: Story = {
  args: {
    value: "Australia/Melbourne",
  },
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = React.useState("");
    return (
      <div className="max-w-sm space-y-2">
        <TimezoneCombobox value={value} onValueChange={setValue} />
        <p className="text-xs text-muted-foreground">
          Stored value: <code>{value || "(none)"}</code>
        </p>
      </div>
    );
  },
};
