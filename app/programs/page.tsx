import { ContentPage } from "@/components/marketing/content-page";
import { Body, CardHeading, SurfaceCard } from "@/components/marketing/section";

const programs = [
  { name: "Lean Build", details: "4 days/week, hypertrophy focus, moderate volume." },
  { name: "Strength Cycle", details: "5 days/week, compound lifts, progressive overload." },
  { name: "Recomp Track", details: "3-4 days/week, balanced volume and conditioning." },
];

export default function ProgramsPage() {
  return (
    <ContentPage
      eyebrow="GymBro Programs"
      title="Choose Your Training Track"
      lead="Pick a structure that fits your lifestyle, then personalize it inside chat coaching."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {programs.map((program) => (
          <SurfaceCard key={program.name}>
            <CardHeading as="h2" className="text-lg">
              {program.name}
            </CardHeading>
            <Body className="mt-2">{program.details}</Body>
          </SurfaceCard>
        ))}
      </div>
    </ContentPage>
  );
}
