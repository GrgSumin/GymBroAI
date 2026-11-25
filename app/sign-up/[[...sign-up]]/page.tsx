import { SignUp } from "@clerk/nextjs";

import { AuthShell, clerkAuthAppearance } from "@/components/marketing/auth-shell";

export default function Page() {
  return (
    <AuthShell eyebrow="Start Your Program">
      <SignUp appearance={clerkAuthAppearance} />
    </AuthShell>
  );
}
