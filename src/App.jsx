import React, { useState } from "react";
import HomeScreen from "./components/HomeScreen";
import LoadingScreen from "./components/LoadingScreen";
import RecoveryScreen from "./components/RecoveryScreen";
import { generateRecoveryPlan } from "./services/GeminiService";

export default function App() {
  const [screen, setScreen] = useState("HOME"); // "HOME", "LOADING", "RECOVERY", "ERROR"
  const [errorMsg, setErrorMsg] = useState("");
  const [lastSubmission, setLastSubmission] = useState(null);
  const [geminiResult, setGeminiResult] = useState(null);

  const handleSubmit = async (submissionData) => {
    setLastSubmission(submissionData);
    setScreen("LOADING");
    setErrorMsg("");

    try {
      const data = await generateRecoveryPlan(submissionData);
      setGeminiResult(data);
      setScreen("RECOVERY");
    } catch (error) {
      console.error("Submission failed:", error);
      setErrorMsg(error.message || "Something went wrong. Please check your network connection or API Key.");
      setScreen("ERROR");
    }
  };

  const handleRetry = () => {
    if (lastSubmission) {
      handleSubmit(lastSubmission);
    } else {
      setScreen("HOME");
    }
  };

  return (
    <div className="font-body-md text-on-background min-h-screen pb-32">
      {/* Top App Bar */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/10">
        <div className="flex items-center justify-between px-4 h-16 w-full max-w-container-max mx-auto">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              healing
            </span>
            <h1 className="font-headline-md text-headline-md font-bold text-primary">RecoverAI</h1>
          </div>
          <button className="hover:opacity-80 transition-opacity scale-95 active:duration-150">
            <span className="material-symbols-outlined text-on-surface-variant text-[28px]">
              account_circle
            </span>
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="pt-24 px-margin-mobile max-w-container-max mx-auto">
        {screen === "HOME" && (
          <HomeScreen onSubmit={handleSubmit} />
        )}

        {screen === "LOADING" && (
          <LoadingScreen />
        )}

        {screen === "RECOVERY" && geminiResult && (
          <RecoveryScreen 
            result={geminiResult} 
            onReset={() => setScreen("HOME")} 
          />
        )}

        {screen === "ERROR" && (
          <div className="max-w-md mx-auto my-xl p-md bg-white border border-error-container rounded-xl shadow-md text-center space-y-md">
            <div className="w-16 h-16 bg-error-container text-error rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[32px]">warning</span>
            </div>
            <h2 className="font-headline-md text-headline-md text-error">Unable to Generate Recovery Plan</h2>
            <p className="font-body-md text-on-surface-variant leading-relaxed">
              {errorMsg}
            </p>
            <div className="flex gap-md justify-center">
              <button 
                onClick={handleRetry}
                className="bg-primary text-on-primary px-xl py-2 rounded-full font-action-lg text-action-lg hover:bg-primary-container transition-all active:scale-95 scale-interaction"
              >
                Retry
              </button>
              <button 
                onClick={() => setScreen("HOME")}
                className="bg-surface-container-highest text-on-surface px-xl py-2 rounded-full font-action-lg text-action-lg hover:bg-surface-dim transition-all active:scale-95 scale-interaction"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full flex flex-col items-center justify-center gap-base text-center py-lg mt-lg">
        <div className="flex gap-md mb-xs">
          <a className="font-body-md text-body-md text-tertiary hover:text-primary transition-colors" href="#">Privacy Policy</a>
          <a className="font-body-md text-body-md text-tertiary hover:text-primary transition-colors" href="#">Support</a>
        </div>
        <p className="font-body-md text-body-md text-secondary">RecoverAI • Your path to steady recovery</p>
      </footer>

      {/* Bottom Nav Bar (Mobile layout indicator matching Stitch layout) */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 pb-safe bg-surface shadow-lg rounded-t-xl md:hidden border-t border-outline-variant/10">
        <button 
          onClick={() => setScreen("HOME")}
          className={`flex flex-col items-center justify-center px-6 py-2 transition-all rounded-full ${
            screen === "HOME" ? "bg-secondary-container text-on-secondary-container" : "text-on-surface-variant"
          }`}
        >
          <span className="material-symbols-outlined">home</span>
          <span className="font-label-caps text-label-caps mt-1">Home</span>
        </button>
        <button 
          onClick={() => {
            if (geminiResult) {
              setScreen("RECOVERY");
            } else {
              alert("Please submit your state on the Home Screen first.");
            }
          }}
          className={`flex flex-col items-center justify-center px-6 py-2 transition-all rounded-full ${
            screen === "RECOVERY" ? "bg-secondary-container text-on-secondary-container" : "text-on-surface-variant"
          }`}
        >
          <span className="material-symbols-outlined">emergency_home</span>
          <span className="font-label-caps text-label-caps mt-1">Recovery Plan</span>
        </button>
      </nav>

    </div>
  );
}
