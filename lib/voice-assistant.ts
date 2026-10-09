// Web Speech API Voice Assistant for Vernacular Accessibility

export type LanguageCode = "hi-IN" | "en-IN" | "kn-IN";

export interface SpeechTemplateOptions {
  generatorName: string;
  wasteType: string;
  weight: number;
  address: string;
  earnings: number;
  distanceKm?: number;
}

export function speakText(text: string, lang: LanguageCode = "hi-IN", rate: number = 0.95): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    console.warn("Speech Synthesis is not supported in this browser.");
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.pitch = 1.0;

  // Find best matching voice
  const voices = window.speechSynthesis.getVoices();
  const langPrefix = lang.split("-")[0];
  const matchedVoice = voices.find(v => v.lang === lang || v.lang.startsWith(langPrefix));
  
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }
  utterance.lang = lang;

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export function getPickupVoicePrompt(opts: SpeechTemplateOptions, lang: LanguageCode = "hi-IN"): string {
  if (lang === "hi-IN") {
    return `नया पिकअप मिला है! ${opts.generatorName} जी का, ${opts.address} पर। ${opts.weight} किलो ${getHindiWasteType(opts.wasteType)}। आपकी पक्की कमाई है ${Math.round(opts.earnings)} रुपये। स्वीकार करने के लिए हरा बटन दबाएं।`;
  } else if (lang === "kn-IN") {
    return `ಹೊಸ ಪಿಕಪ್ ಇದೆ! ${opts.generatorName}, ${opts.address}. ${opts.weight} ಕೆಜಿ ${opts.wasteType}. ನಿಮ್ಮ ಗಳಿಕೆ ${Math.round(opts.earnings)} ರೂಪಾಯಿ.`;
  } else {
    return `New pickup request from ${opts.generatorName} at ${opts.address}. ${opts.weight} kilograms of ${opts.wasteType}. Guaranteed earnings: ${Math.round(opts.earnings)} rupees. Press the green button to accept.`;
  }
}

export function getEarningsVoicePrompt(todayEarned: number, jobsDone: number, lang: LanguageCode = "hi-IN"): string {
  if (lang === "hi-IN") {
    return `आज आपने ${jobsDone} पिकअप पूरे किए हैं और कुल ${Math.round(todayEarned)} रुपये कमाए हैं। आपकी कमाई सुरक्षित है।`;
  } else {
    return `Today you have completed ${jobsDone} pickups and earned a total of ${Math.round(todayEarned)} rupees. All payments are verified.`;
  }
}

export function getHindiWasteType(wasteType: string): string {
  const lower = wasteType.toLowerCase();
  if (lower.includes("plastic")) return "प्लास्टिक";
  if (lower.includes("cardboard") || lower.includes("paper")) return "कागज़ और गत्ता";
  if (lower.includes("metal") || lower.includes("scrap")) return "धातु और लोहा";
  if (lower.includes("e-waste") || lower.includes("electronic")) return "इलेक्ट्रॉनिक कबाड़";
  if (lower.includes("glass")) return "कांच";
  return "मिक्स्ड कबाड़";
}
