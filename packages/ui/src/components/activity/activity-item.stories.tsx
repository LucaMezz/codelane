import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  ActivityItem,
  DEFAULT_ACTIVITY_CONFIG,
  type ActivityEvent,
} from "#components/activity/activity-item";

const SAMPLE_ITEMS: Record<ActivityEvent["type"], ActivityEvent> = {
  created: {
    id: "1",
    type: "created",
    title: "Add OAuth2 provider support",
    workspace: "Platform Team",
    time: "2 hours ago",
  },
  resolved: {
    id: "2",
    type: "resolved",
    title: "Fix race condition in auth middleware",
    workspace: "API Infrastructure",
    time: "5 hours ago",
  },
  commented: {
    id: "3",
    type: "commented",
    title: "Improve CI pipeline performance",
    workspace: "Platform Team",
    time: "1 day ago",
  },
  assigned: {
    id: "4",
    type: "assigned",
    title: "Design new onboarding flow",
    workspace: "Mobile App",
    time: "2 days ago",
  },
};

const meta = {
  title: "ui/activity/ActivityItem",
  component: ActivityItem,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    item: SAMPLE_ITEMS.created,
  },
} satisfies Meta<typeof ActivityItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Created: Story = {
  args: { item: SAMPLE_ITEMS.created },
};

export const Resolved: Story = {
  args: { item: SAMPLE_ITEMS.resolved },
};

export const Commented: Story = {
  args: { item: SAMPLE_ITEMS.commented },
};

export const Assigned: Story = {
  args: { item: SAMPLE_ITEMS.assigned },
};

/**
 * All four activity types rendered together as they appear in a feed.
 */
export const Feed: Story = {
  render: () => (
    <div className="divide-y overflow-hidden rounded-lg border">
      {Object.values(SAMPLE_ITEMS).map((item) => (
        <ActivityItem key={item.id} item={item} />
      ))}
    </div>
  ),
};

/**
 * Demonstrates overriding the default config for a specific activity type.
 */
export const CustomConfig: Story = {
  args: {
    item: SAMPLE_ITEMS.created,
    config: {
      created: {
        ...DEFAULT_ACTIVITY_CONFIG.created,
        verb: "Filed",
        color: "bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-400",
      },
    },
  },
};
