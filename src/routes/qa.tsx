import { createFileRoute } from "@tanstack/react-router";
import { QueuePage } from "@/components/queue-page";

export const Route = createFileRoute("/qa")({
  component: () => <QueuePage kicker="Quality assurance" title="QA" stage="qa" />,
});
