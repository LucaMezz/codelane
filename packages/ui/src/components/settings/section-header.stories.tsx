import type { Meta, StoryObj } from "@storybook/react-vite";

import { SettingsSectionHeader } from "#components/settings/section-header";

const meta = {
  title: "ui/settings/SettingsSectionHeader",
  component: SettingsSectionHeader,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    title: "Public profile",
  },
} satisfies Meta<typeof SettingsSectionHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Title only — no description.
 */
export const TitleOnly: Story = {
  args: { title: "Change password" },
};

/**
 * With a description line below the title.
 */
export const WithDescription: Story = {
  args: {
    title: "Public profile",
    description: "This information will be visible to other members of your workspace.",
  },
};

/**
 * A long description wraps naturally.
 */
export const LongDescription: Story = {
  args: {
    title: "Preferences",
    description:
      "Manage how the application looks and behaves for you. Changes take effect immediately and are stored per account.",
  },
};

/**
 * Multiple section headers as they appear stacked in a settings page.
 */
export const Stacked: Story = {
  render: () => (
    <div className="max-w-lg space-y-8">
      <SettingsSectionHeader
        title="Public profile"
        description="This information will be visible to other members of your workspace."
      />
      <SettingsSectionHeader
        title="Change password"
        description="After a successful password change, you will remain signed in."
      />
      <SettingsSectionHeader title="Preferences" />
    </div>
  ),
};
