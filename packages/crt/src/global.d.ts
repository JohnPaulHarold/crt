declare global {
	interface Window {
		__INITIAL_DATA__?: Record<string, unknown>;
	}
}
