export const isConnectionError = (error: unknown) => {
  if (error instanceof TypeError && error.message === "fetch failed") {
    return true
  }

  if (
    error &&
    typeof error === "object" &&
    "cause" in error &&
    (error as any).cause?.code === "ECONNREFUSED"
  ) {
    return true
  }

  return false
}
