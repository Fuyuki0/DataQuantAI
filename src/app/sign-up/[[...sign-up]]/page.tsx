// ═══════════════════════════════════════════
// DataQuantAI — Clerk Sign Up Page
// ═══════════════════════════════════════════

import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--bg)' }}
    >
      <SignUp
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'shadow-none',
          },
        }}
      />
    </div>
  );
}
