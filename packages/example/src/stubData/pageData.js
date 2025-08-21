/**
 * @type {import("../views/home").PageData} pageData
 */
export const pageData = {
	id: 'test',
	items: ['YouView', 'Freeview QA', 'Sky Glass Preprod', 'Freesat DEV'].map(
		(env) => ({
			title: env,
			id: env.toLowerCase().replace(/ /g, ''),
			items: ['0A', '0B', '0C', '0D', '0E', '0F'].map((inst) => ({
				id: [env.toLowerCase().replace(/ /g, ''), inst].join('-'),
				title: [env, inst].join(' '),
				url: `https://www.google.com/search?q=${encodeURI(env)}`,
			})),
		})
	),
};
