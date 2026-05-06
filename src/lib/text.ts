export function toTitleCase(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("es-AR")
    .replace(/\s+/g, " ")
    .replace(/(^|\s|-)(\p{L})/gu, (_, prefix: string, letter: string) => `${prefix}${letter.toLocaleUpperCase("es-AR")}`);
}
