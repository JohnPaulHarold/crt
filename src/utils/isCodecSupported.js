const video = document.createElement('video');

/**
 * @param {string} codec
 */
export function isCodecSupported(codec) {
    return {
        mse:
            window.MediaSource &&
            window.MediaSource.isTypeSupported &&
            window.MediaSource.isTypeSupported(codec),
        video: !!video.canPlayType(codec),
    };
}
