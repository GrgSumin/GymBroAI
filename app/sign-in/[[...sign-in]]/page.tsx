import { SignIn } from "@clerk/nextjs";

import { AuthShell, clerkAuthAppearance } from "@/components/marketing/auth-shell";

export default function Page() {
  return (
    <AuthShell eyebrow="Welcome Back">
      <SignIn appearance={clerkAuthAppearance} />
    </AuthShell>
  );
}
