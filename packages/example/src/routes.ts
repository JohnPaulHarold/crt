export type RouteParams = Record<string, string>;

export type RouteSearch = Record<string, string | number | boolean>;

export const routes: Record<string, { pattern: string; title: string; nav: boolean; navId?: string; }> = {
	HOME: { pattern: '/', title: 'Home', nav: true },
	SEARCH: { pattern: '/search', title: 'Search', nav: true },
	SHOW: { pattern: '/show/{id}', title: 'Show', nav: false, navId: '123' },
	DIFF: { pattern: '/diff', title: 'Diff', nav: true },
	VLIST: { pattern: '/vlist', title: 'VList', nav: true },
	REACTIVE_VLIST: {
		pattern: '/reactive-vlist',
		title: 'Reactive VList',
		nav: true,
	},
	PLAYER: { pattern: '/player', title: 'Player', nav: true },
};
