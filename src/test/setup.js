import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mocking SpeechSynthesis APIs
if (typeof window !== "undefined") {
  window.speechSynthesis = {
    speak: vi.fn(),
    cancel: vi.fn(),
    paused: false,
    pending: false,
    speaking: false,
    getVoices: vi.fn(() => []),
  };

  class MockSpeechSynthesisUtterance {
    constructor(text) {
      this.text = text;
      this.lang = "";
      this.onend = null;
      this.onerror = null;
    }
  }
  window.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;

  window.webkitSpeechRecognition = vi.fn().mockImplementation(() => {
    return {
      start: vi.fn(),
      stop: vi.fn(),
      abort: vi.fn(),
    };
  });
}
