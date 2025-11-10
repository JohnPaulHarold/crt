const video = document.createElement('video');

export function isCodecSupported(codec: string) {
	return {
		mse:
			window.MediaSource &&
			window.MediaSource.isTypeSupported &&
			window.MediaSource.isTypeSupported(codec),
		video: !!video.canPlayType(codec),
	};
}
