export class AppError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
  }
}

export const isUniqueViolation = (error: unknown, constraint?: string): boolean => {
  const e = error as { code?: string; message?: string };
  if (e?.code !== '23505') return false;
  if (constraint) return e?.message?.includes(constraint) ?? false;
  return true;
};