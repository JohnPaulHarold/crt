import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { getRouteParams } from './getRouteParams';

describe('getRouteParams', () => {
	test('should return en empty object if no params are defined in the pattern', () => {
		const pattern = '/home';
		const path = '/home';
		expect(getRouteParams(path, pattern)).toEqual({});
	});

	test('should extract a single parameter', () => {
		const pattern = '/user/{id}';
		const path = '/user/123';
		expect(getRouteParams(path, pattern)).toEqual({ id: '123' });
	});

	test('should extract multiple parameters', () => {
		const pattern = '/show/{showId}/episode/{episodeId}';
		const path = '/show/abc/episode/xyz';
		expect(getRouteParams(path, pattern)).toEqual({
			showId: 'abc',
			episodeId: 'xyz',
		});
	});

	test('should return null if the path has extra segments', () => {
		const pattern = '/user/{id}';
		const path = '/user/123/details'; // Extra segment
		expect(getRouteParams(path, pattern)).toBeNull();
	});

	test('should return null if the path does not match the pattern structure (fewer segments)', () => {
		const pattern = '/user/{id}/details';
		const path = '/user/123'; // Fewer segments
		expect(getRouteParams(path, pattern)).toBeNull();
	});

	test('should return null if static parts of the path do not match', () => {
		const pattern = '/product/{id}/info';
		const path = '/product/456/details'; // 'info' vs 'details'
		expect(getRouteParams(path, pattern)).toBeNull();
	});

	test('should handle parameters with hyphens and underscores', () => {
		const pattern = '/item/{item-name_v2}';
		const path = '/item/my-cool-item_v2_instance';
		expect(getRouteParams(path, pattern)).toEqual({
			'item-name_v2': 'my-cool-item_v2_instance',
		});
	});

	test('should return an empty object if pattern has params but path is for a non-param route', () => {
		// This case implies the higher-level router would have already decided this pattern doesn't match.
		// getRouteParams itself might still try to match segment by segment.
		// If the segments don't align, it should return null.
		const pattern = '/user/{id}';
		const path = '/home';
		expect(getRouteParams(path, pattern)).toBeNull();
	});

	test('should handle empty path and pattern correctly', () => {
		expect(getRouteParams('', '')).toEqual({});
		expect(getRouteParams('/', '/')).toEqual({});
	});
});
