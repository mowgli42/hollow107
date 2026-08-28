import { createFileRoute } from "@tanstack/react-router";
import { QueuePage } from "@/components/queue-page";

export const Route = createFileRoute("/engineer")({
  component: () => <QueuePage kicker="Engineering" title="Engineer" stage="engineer" />,
});
