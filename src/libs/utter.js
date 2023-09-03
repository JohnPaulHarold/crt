function getSynth() {
  return window.speechSynthesis;
}

/**
 * @funtion
 * @name phrase
 * @param {string} text 
 */
export function speak(text) {
  const utterThis = new SpeechSynthesisUtterance(text);
  const synth = getSynth();

  utterThis.onend = function (event) {
    console.log("SpeechSynthesisUtterance.onend", event);
  };

  utterThis.onerror = function (event) {
    console.error("SpeechSynthesisUtterance.onerror", event);
  };

  synth.speak(utterThis);
}