import { createFileRoute } from "@tanstack/react-router";
import { QueuePage } from "@/components/queue-page";

export const Route = createFileRoute("/closed")({
  component: () => <QueuePage kicker="Archive" title="Closed" stage="closed" showSearch />,
});
