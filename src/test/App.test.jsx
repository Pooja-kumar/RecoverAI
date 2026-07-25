import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import App from "../App";
import HomeScreen from "../components/HomeScreen";
import LoadingScreen from "../components/LoadingScreen";
import RecoveryScreen from "../components/RecoveryScreen";

// Mock GeminiService
vi.mock("../services/GeminiService", () => ({
  generateRecoveryPlan: vi.fn().mockResolvedValue({
    userSelectedUrge: 4,
    geminiRiskAssessment: {
      level: "High",
      reason: "User reports strong urge in a high-risk environment."
    },
    triggerAnalysis: "Stress from work and caffeine triggers.",
    personalizedRecoveryPlan: [
      "Practice deep breathing",
      "Step away from the environment",
      "Call Sarah"
    ],
    recommendationExplanation: "This lowers heart rate and shifts neural focus.",
    encouragement: "You are doing great, stay strong.",
    emergencyMessage: "Hi Sarah, I need help right now."
  })
}));

describe("RecoverAI App Workflow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders welcome header and home elements on startup", () => {
    render(<App />);
    expect(screen.getByText("Need Help Right Now?")).toBeInTheDocument();
    expect(screen.getByText("How strong is your urge?")).toBeInTheDocument();
  });

  it("updates slider value correctly upon drag/change", () => {
    render(<HomeScreen onSubmit={() => {}} />);
    const slider = screen.getByRole("slider");
    expect(slider.value).toBe("3");
    
    fireEvent.change(slider, { target: { value: "4" } });
    expect(slider.value).toBe("4");
    // Query by specific urge-value element id
    const urgeValEl = document.getElementById("urge-value");
    expect(urgeValEl.textContent).toBe("4");
  });

  it("validates input fields and shows warning alert if empty submit triggers", () => {
    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});
    render(<HomeScreen onSubmit={() => {}} />);
    
    const submitBtn = screen.getByRole("button", { name: /Get My Recovery Plan/i });
    fireEvent.click(submitBtn);

    expect(alertMock).toHaveBeenCalledWith("Please provide context by typing/speaking how you feel or adding an image.");
    alertMock.mockRestore();
  });

  it("renders loading screen animations checklist correctly", () => {
    render(<LoadingScreen />);
    expect(screen.getByText("Understanding your situation")).toBeInTheDocument();
    expect(screen.getByText("Analysing possible triggers")).toBeInTheDocument();
    expect(screen.getByText("Creating a personalised recovery plan")).toBeInTheDocument();
  });

  it("renders recovery plan results dynamically matching Gemini specifications", () => {
    const mockResult = {
      userSelectedUrge: 4,
      geminiRiskAssessment: {
        level: "High",
        reason: "Critical craving situation"
      },
      triggerAnalysis: "Circadian trigger active due to work tiredness",
      personalizedRecoveryPlan: [
        "Practice breathing",
        "Perform grounding checks"
      ],
      recommendationExplanation: "This breaks the neurological urgency loop.",
      encouragement: "One day at a time.",
      emergencyMessage: "Sarah call me."
    };

    render(<RecoveryScreen result={mockResult} onReset={() => {}} />);
    
    expect(screen.getByText("High")).toBeInTheDocument();
    expect(screen.getByText(/Circadian trigger active due to work tiredness/i)).toBeInTheDocument();
    expect(screen.getByText("Practice breathing")).toBeInTheDocument();
    expect(screen.getByText("Perform grounding checks")).toBeInTheDocument();
    expect(screen.getByText(/This breaks the neurological urgency loop/i)).toBeInTheDocument();
  });

  it("activates speech synthesis read aloud on speaker CTA click", () => {
    const speakMock = vi.spyOn(window.speechSynthesis, "speak");
    
    const mockResult = {
      userSelectedUrge: 3,
      geminiRiskAssessment: { level: "Medium", reason: "Stable environment" },
      triggerAnalysis: "None",
      personalizedRecoveryPlan: ["Walk outdoors"],
      recommendationExplanation: "Fresh air changes mental patterns.",
      encouragement: "Keep going.",
      emergencyMessage: "Need help."
    };

    render(<RecoveryScreen result={mockResult} onReset={() => {}} />);
    const readBtn = screen.getByRole("button", { name: /Read Aloud/i });
    fireEvent.click(readBtn);

    expect(speakMock).toHaveBeenCalled();
    speakMock.mockRestore();
  });
});
