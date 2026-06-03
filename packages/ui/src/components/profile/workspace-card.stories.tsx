import type { Meta, StoryObj } from "@storybook/react-vite";

import { WorkspaceCard, type Workspace } from "#components/profile/workspace-card";

const SAMPLE_WORKSPACES: Workspace[] = [
  {
    id: "1",
    name: "Platform Team",
    role: "Owner",
    openIssues: 8,
    inProgress: 3,
    members: 5,
    color: "#6366f1",
  },
  {
    id: "2",
    name: "Mobile App",
    role: "Member",
    openIssues: 3,
    inProgress: 1,
    members: 8,
    color: "#0ea5e9",
  },
  {
    id: "3",
    name: "API Infrastructure",
    role: "Admin",
    openIssues: 6,
    inProgress: 2,
    members: 4,
    color: "#10b981",
  },
];

const meta = {
  title: "ui/profile/WorkspaceCard",
  component: WorkspaceCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    workspace: SAMPLE_WORKSPACES[0],
  },
} satisfies Meta<typeof WorkspaceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OwnerRole: Story = {
  args: { workspace: SAMPLE_WORKSPACES[0] },
};

export const MemberRole: Story = {
  args: { workspace: SAMPLE_WORKSPACES[1] },
};

export const AdminRole: Story = {
  args: { workspace: SAMPLE_WORKSPACES[2] },
};

/**
 * Multiple cards in a responsive grid as they appear on a profile page.
 */
export const Grid: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {SAMPLE_WORKSPACES.map((ws) => (
        <WorkspaceCard key={ws.id} workspace={ws} />
      ))}
    </div>
  ),
};

/**
 * A workspace with no activity yet.
 */
export const Empty: Story = {
  args: {
    workspace: {
      id: "empty",
      name: "New Project",
      role: "Owner",
      openIssues: 0,
      inProgress: 0,
      members: 1,
      color: "#f59e0b",
    },
  },
};
