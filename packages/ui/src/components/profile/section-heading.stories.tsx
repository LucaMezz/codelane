import type { Meta, StoryObj } from "@storybook/react-vite";
import { Building2, ListTodo } from "lucide-react";

import { SectionHeading } from "#components/profile/section-heading";

const meta = {
  title: "ui/profile/SectionHeading",
  component: SectionHeading,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    title: "Current Work",
  },
} satisfies Meta<typeof SectionHeading>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Title only — the minimal usage.
 */
export const TitleOnly: Story = {
  args: { title: "Recent activity" },
};

/**
 * With a count pill next to the title.
 */
export const WithCount: Story = {
  args: { title: "Workspaces", count: 3 },
};

/**
 * With a Lucide icon and count.
 */
export const WithIconAndCount: Story = {
  args: { icon: ListTodo, title: "Current Work", count: 7 },
};

/**
 * Another icon variant.
 */
export const WorkspacesIcon: Story = {
  args: { icon: Building2, title: "Workspaces", count: 2 },
};

/**
 * Count of zero is displayed (differs from undefined, which hides the pill).
 */
export const ZeroCount: Story = {
  args: { title: "Blocked items", count: 0 },
};
