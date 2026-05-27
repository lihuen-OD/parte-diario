export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="error">{message}</span>;
}
