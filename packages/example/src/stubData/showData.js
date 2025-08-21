/**
 * @typedef { {id: string, imageUrl: string } } ShortShowType
 * @type {Array<ShortShowType>}
 */
const data = [];

const width = 16 * 16;
const height = 16 * 9;

for (let i = 0, l = Array(8).length; i < l; i++) {
	data.push({
		id: 'TV00000' + i,
		imageUrl:
			'https://picsum.photos/id/' +
			(i + 1 * 120) +
			'/' +
			width +
			'/' +
			height +
			'',
	});
}

export const showData = {
	id: 'PTV1234567',
	title: 'Moby Dick',
	description:
		"Call me Ishmael. Some years ago--never mind how long precisely--having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people's hats off--then, I account it high time to get to sea as soon as I can. This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the ship. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the ocean with me.",
	rating: 'PG',
	genres: ['Welsh', 'Action', 'Musical'],
	related: {
		suggestions: data,
	},
};
