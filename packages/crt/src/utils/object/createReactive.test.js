import { vi, describe, expect, test } from 'vitest';
import { createReactive } from './createReactive';

describe('createReactive', () => {
	test('it creates a reactive object', () => {
		const initialState = { x: 0, y: 0 };
		const callback = vi.fn();

		const r = createReactive(initialState, callback);

		r.x = 100;

		expect(r.x).toEqual(100);
		expect(callback).toHaveBeenCalledWith({ x: 100, y: 0 });
	});
});
