interface ApprovalErrorProps {
  message: string | null;
}

export function ApprovalError({ message }: ApprovalErrorProps) {
  if (!message) return null;

  // Present server-returned validation and service failures where approval actions are performed.
  return (
    <p
      className="mb-4 rounded-xl border border-red-300/15 bg-red-500/[0.07] px-4 py-3 text-sm text-red-200"
      role="alert"
    >
      {message}
    </p>
  );
}
