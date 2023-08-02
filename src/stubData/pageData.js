/**
 * @typedef {import('../declarations/types').PageData} PageData
 */

/**
 * @type {PageData} pageData
 */
export const pageData = {
  id: 'test',
  items: ["YouView", "Freeview QA", "Sky Glass Preprod", "Freesat DEV"].map((env) => ({
    title: env,
    id: env.toLowerCase().replace(" ", ""),
    items: ['0A', '0B', '0C', '0D', '0E', '0F'].map((inst) => ({
      id: [env.toLowerCase().replace(" ", ""), inst].join('-'),
      title: [env, inst].join(" "),
      url: `https://www.google.com/search?q=${encodeURI(env)}`
    }))
  }))
}
