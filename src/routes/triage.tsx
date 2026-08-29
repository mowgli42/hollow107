import { createFileRoute } from "@tanstack/react-router";
import { QueuePage } from "@/components/queue-page";

export const Route = createFileRoute("/triage")({
  component: () => <QueuePage kicker="Field service" title="Triage" stage="triage" />,
});
