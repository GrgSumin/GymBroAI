import { ContentPage } from "@/components/marketing/content-page";
import { Body, CardHeading, SurfaceCard } from "@/components/marketing/section";

const stories = [
  { name: "Aarav", result: "Dropped 9kg in 16 weeks with consistent lifting + nutrition guidance." },
  { name: "Maya", result: "Added strength to all major lifts while improving recovery habits." },
  { name: "Jordan", result: "Moved from random workouts to a structured routine with visible progress." },
];

export default function TransformationsPage() {
  return (
    <ContentPage
      eyebrow="Transformations"
      title="Real Consistency Stories"
      lead="Progress is built through repeatable systems. These examples show what consistency looks like."
    >
      <div className="space-y-4">
        {stories.map((story) => (
          <SurfaceCard key={story.name}>
            <CardHeading as="h2" className="text-lg">
              {story.name}
            </CardHeading>
            <Body className="mt-2">{story.result}</Body>
          </SurfaceCard>
        ))}
      </div>
    </ContentPage>
  );
}
