// app/(auth)/layout.tsx — Bare layout for auth pages (no sidebar, no masthead)
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
