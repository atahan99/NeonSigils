/** Join class names, dropping falsy entries. */
export const cn = (...parts: (string | false | null | undefined)[]): string =>
  parts.filter(Boolean).join(" ")
