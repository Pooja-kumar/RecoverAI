import React, { useEffect, useState } from "react";

export default function LoadingScreen() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps = [
    { id: 1, text: "Understanding your situation" },
    { id: 2, text: "Analysing possible triggers" },
    { id: 3, text: "Creating a personalised recovery plan" }
  ];

  useEffect(() => {
    if (currentStepIndex >= steps.length) return;

    const timer = setTimeout(() => {
      setCurrentStepIndex((prev) => prev + 1);
    }, 2000); // 2 seconds per checkpoint state simulation

    return () => clearTimeout(timer);
  }, [currentStepIndex]);

  return (
    <main className="min-h-[80vh] flex items-center justify-center relative overflow-hidden px-4">
      <div className="max-w-[480px] w-full text-center z-10">
        
        {/* Brand Anchor Header (Standalone for Loading) */}
        <div className="mb-xl flex flex-col items-center">
          <div className="w-16 h-16 bg-primary-fixed text-primary rounded-xl flex items-center justify-center mb-md status-pulse">
            <span className="material-symbols-outlined text-[40px]">healing</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">RecoverAI</h1>
          <p className="font-body-md text-on-surface-variant mt-base">Preparing your space for recovery</p>
        </div>

        {/* Sequential Checklist Component */}
        <div className="bg-white border border-outline-variant/30 rounded-xl p-md shadow-sm backdrop-blur-sm">
          <ul className="space-y-sm text-left">
            {steps.map((step, idx) => {
              const isCompleted = idx < currentStepIndex;
              const isActive = idx === currentStepIndex;

              return (
                <li
                  key={step.id}
                  className="flex items-center gap-md py-sm transition-all duration-500 step-enter"
                  id={`step-${step.id}`}
                >
                  <div
                    className={`step-icon flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-500 ${
                      isCompleted ? "bg-secondary-container" : "bg-surface-container"
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined ${
                        isCompleted
                          ? "check-active"
                          : isActive
                          ? "text-primary"
                          : "check-pending"
                      }`}
                      id={`icon-${step.id}`}
                    >
                      {isCompleted ? "check_circle" : isActive ? "radio_button_checked" : "circle"}
                    </span>
                  </div>
                  <div className="flex-grow">
                    <span
                      className={`font-action-lg transition-colors duration-500 ${
                        isCompleted
                          ? "text-secondary"
                          : isActive
                          ? "text-on-surface shimmer-text"
                          : "text-on-surface-variant"
                      }`}
                      id={`text-${step.id}`}
                    >
                      {isCompleted ? `✓ ${step.text}` : step.text}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Affirmation Footer */}
        <div className="mt-xl step-enter" style={{ animationDelay: "0.5s" }}>
          <div className="inline-flex items-center px-4 py-2 bg-secondary-container/30 border border-secondary/20 rounded-full">
            <span className="material-symbols-outlined text-secondary text-sm mr-2" style={{ fontVariationSettings: "'FILL' 1" }}>
              verified
            </span>
            <span className="font-label-caps text-on-secondary-container uppercase tracking-wider text-xs">
              A safe space for your healing journey
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
