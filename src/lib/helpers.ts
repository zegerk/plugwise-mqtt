/**
 * Helpers
 *
 * @param {number} ms delay in millisconds
 */
export async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
 *
 * template('Hello {drlow}', { dlrow: 'world'}) -> Hello world
 *
 * @param {string} template
 * @param {object} substitutes
 * @return {string}
 */
export function template(
  template: string,
  substitutes: {[index: string]: string | number},
): string {
  return Object.keys(substitutes).reduce(
    (accumulator, pattern) =>
      accumulator.replace('{' + pattern + '}', String(substitutes[pattern])),
    template,
  )
}
