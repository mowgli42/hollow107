import { createFileRoute } from "@tanstack/react-router";
import { QueuePage } from "@/components/queue-page";

export const Route = createFileRoute("/")({
  component: () => (
    <QueuePage
      kicker="All open work"
      title="In-work"
      stage="open"
      showKanbanToggle
    />
  ),
});
