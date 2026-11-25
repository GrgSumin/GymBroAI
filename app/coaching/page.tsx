import { ContentPage } from "@/components/marketing/content-page";
import { Body, Eyebrow, SurfaceCard } from "@/components/marketing/section";

const flow = [
  "Share your goal, schedule, and current fitness level.",
  "Receive a weekly structure with sets, reps, and progression guidance.",
  "Adjust each week using feedback from your training performance.",
];

export default function CoachingPage() {
  return (
    <ContentPage
      eyebrow="Coaching System"
      title="How GymBro Coaching Works"
      lead="Keep things simple: one focused system that helps you train, recover, and progress."
    >
      <ol className="space-y-4">
        {flow.map((item, index) => (
          <SurfaceCard as="li" key={item}>
            <Eyebrow className="text-sm">Step {index + 1}</Eyebrow>
            <Body className="mt-2 sm:text-base">{item}</Body>
          </SurfaceCard>
        ))}
      </ol>
    </ContentPage>
  );
}
