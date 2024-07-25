// utils/errorHandler.ts
export const getErrorMessage = (e: unknown): string => {
  if (e instanceof Error) {
    return e.message;
  } else if (typeof e === "string") {
    return e;
  } else if (e && typeof e === "object" && "message" in e) {
    return (e as any).message;
  }
  return "Unknown error";
};
