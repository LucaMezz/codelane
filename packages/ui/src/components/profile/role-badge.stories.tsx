import type { Meta, StoryObj } from "@storybook/react-vite";

import { RoleBadge } from "#components/profile/role-badge";

const meta = {
  title: "ui/profile/RoleBadge",
  component: RoleBadge,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    role: "Member",
  },
} satisfies Meta<typeof RoleBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Owner: Story = {
  args: { role: "Owner" },
};

export const Admin: Story = {
  args: { role: "Admin" },
};

export const Member: Story = {
  args: { role: "Member" },
};

/**
 * Any arbitrary string can be passed as `role`. Unknown roles get no extra colour.
 */
export const CustomRole: Story = {
  args: { role: "Reviewer" },
};

/**
 * All built-in roles side by side.
 */
export const AllRoles: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <RoleBadge role="Owner" />
      <RoleBadge role="Admin" />
      <RoleBadge role="Member" />
    </div>
  ),
};
