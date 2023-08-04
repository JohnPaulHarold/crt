const video = document.createElement('video');

/**
 * @param {string} codec
 */
export function isCodecSupported(codec) {
  return {
    mse: window.MediaSource?.isTypeSupported(codec),
    video: !!video.canPlayType(codec),
  };
}
