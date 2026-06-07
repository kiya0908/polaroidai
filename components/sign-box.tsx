import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { hasClerkPublishableKey } from "@/lib/clerk-runtime";

export default function SignBox(props: {
  children: React.ReactNode;
  noSign?: React.ReactNode;
}) {
  const { children, noSign } = props;
  const clerkEnabled = hasClerkPublishableKey();

  if (!clerkEnabled) {
    return <>{children}</>;
  }

  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <SignInButton mode="redirect">{noSign ?? children}</SignInButton>
      </SignedOut>
    </>
  );
}
