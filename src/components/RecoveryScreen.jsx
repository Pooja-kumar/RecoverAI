import React, { useState, useRef } from "react";
import html2canvas from "html2canvas";

export default function RecoveryScreen({ result, onReset }) {
  const [feedback, setFeedback] = useState(null); // null = plan, 'yes' = success, 'no' = support
  const [isReading, setIsReading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const cardRef = useRef(null);

  const riskAssessment = result.geminiRiskAssessment || { level: "Medium", reason: "" };
  const urge = result.userSelectedUrge || 3;
  const triggerAnalysis = result.triggerAnalysis || "";
  const recoveryPlan = result.personalizedRecoveryPlan || [];
  const explanation = result.recommendationExplanation || "";
  const encouragement = result.encouragement || "Every step matters.";
  const emergencyMessage = result.emergencyMessage || "I need support right now.";

  const handleReadAloud = () => {
    if ("speechSynthesis" in window) {
      if (isReading) {
        window.speechSynthesis.cancel();
        setIsReading(false);
        return;
      }

      const textToRead = `
        Your recovery plan.
        Risk level: ${riskAssessment.level}. Reason: ${riskAssessment.reason}.
        Trigger analysis: ${triggerAnalysis}.
        Recovery plan steps:
        ${recoveryPlan.map((step, idx) => `Step ${idx + 1}: ${step}`).join(". ")}.
        Why these steps: ${explanation}
      `;

      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.onend = () => setIsReading(false);
      utterance.onerror = () => setIsReading(false);

      setIsReading(true);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Speech synthesis is not supported on this browser.");
    }
  };

  const handleDownloadCard = async () => {
    if (cardRef.current) {
      try {
        const canvas = await html2canvas(cardRef.current, {
          useCORS: true,
          scale: 2,
          backgroundColor: "#f9f9ff"
        });
        const link = document.createElement("a");
        link.download = "Recovera_RecoveryCard.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      } catch (err) {
        console.error("Failed to generate card image", err);
      }
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(emergencyMessage);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-6 pb-32">
      
      {/* 1. ORIGINAL BENTO PLAN VIEW */}
      {feedback === null && (
        <div className="space-y-10 animate-in fade-in duration-300">
          
          {/* Header */}
          <section className="text-left mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-caps text-label-caps mb-4">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              AI-Generated Plan
            </div>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-on-surface mb-2">Your Path Forward</h2>
            <p className="text-on-surface-variant font-body-md">A customized guide created specifically for your current state.</p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
            {/* Trigger Analysis Card */}
            <div className="md:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-12 h-12 rounded-lg bg-primary-fixed flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary">psychology</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md mb-2">Trigger Analysis</h3>
                  <p className="text-on-surface-variant font-body-md leading-relaxed">
                    {triggerAnalysis}
                  </p>
                </div>
              </div>
              <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="w-2/3 h-full bg-primary-container"></div>
              </div>
            </div>

            {/* Risk Level Card */}
            <div className="md:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start mb-6">
                <span className="font-label-caps text-label-caps uppercase tracking-wider text-outline">Risk Level</span>
                <span className="material-symbols-outlined text-tertiary">priority_high</span>
              </div>
              <div className="flex flex-col items-center py-2">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle className="text-surface-container-highest" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeWidth="8"></circle>
                    <circle className="text-primary-fixed-dim" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeDasharray="251.2" strokeDashoffset="125" strokeWidth="8"></circle>
                  </svg>
                  <span className="absolute font-headline-md text-headline-md text-primary font-bold">
                    {riskAssessment.level}
                  </span>
                </div>
                <span className="mt-6 font-body-md text-on-surface-variant">{riskAssessment.reason || "Assessments are based on your current state description."}</span>
              </div>
            </div>

            {/* Main Plan Card */}
            <div className="md:col-span-12 bg-white border border-primary-fixed rounded-xl overflow-hidden shadow-sm">
              <div className="bg-primary-fixed/30 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">list_alt</span>
                  <h3 className="font-headline-md text-headline-md font-bold">Personalised Recovery Plan</h3>
                </div>
                <button 
                  onClick={handleReadAloud}
                  className={`flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-full font-action-lg text-action-lg hover:opacity-90 active:scale-95 transition-all scale-interaction ${isReading ? "animate-pulse" : ""}`}
                >
                  <span className="material-symbols-outlined">{isReading ? "graphic_eq" : "volume_up"}</span>
                  <span>{isReading ? "Stop" : "Read Aloud"}</span>
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {recoveryPlan.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-6 p-6 bg-surface-container-low rounded-lg border-l-4 border-primary">
                    <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 font-bold">{idx + 1}</div>
                    <div>
                      <p className="font-body-lg text-body-lg text-on-surface font-semibold">{step}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Explanation section */}
              {explanation && (
                <div className="p-6 bg-surface-container-lowest border-t border-outline-variant">
                  <div className="flex items-center gap-2 text-secondary mb-2">
                    <span className="material-symbols-outlined text-sm">info</span>
                    <span className="font-label-caps text-label-caps uppercase font-semibold">Why these steps?</span>
                  </div>
                  <p className="font-body-md text-on-surface-variant italic leading-relaxed">
                    "{explanation}"
                  </p>
                </div>
              )}
            </div>

            {/* serene graphic landscape */}
            <div className="md:col-span-12 h-48 rounded-xl overflow-hidden relative">
              <div 
                className="w-full h-full bg-cover bg-center" 
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDzj2GGoKcEyz7sRO0XGbl274zu8gW_qYKSlFYSSSRLVkvhLGo3XF3lBbQUWVVnb4XE9Mf_f3NfmxPHcTjaVfv8XPwlEBr7tHzZqvGJ00nNZT2cU7udYrVlsEz2QlRO7J1O77IOv5Qw2dnETyJwBXZGipvURYHBBzjj_Qk6g2FHlFN6QVgcIU4Eg9dNpkZw4cC-kyUSDRc_nh_i5mDMt48zziOF_1zvHi4yJEcsb8fjpDqpc6pu7mgw')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-on-surface/60 to-transparent flex items-end p-6">
                <p className="text-white font-headline-md italic">"Every urge is a wave. You don't have to fight it; you just have to ride it out."</p>
              </div>
            </div>

          </div>

          {/* Feedback Area */}
          <section className="mt-10 p-10 bg-secondary-container/20 rounded-2xl text-center border-2 border-dashed border-secondary/30 space-y-6">
            <h4 className="font-headline-md text-headline-md text-on-surface font-semibold">Are you feeling better?</h4>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button 
                onClick={() => setFeedback("yes")}
                className="flex items-center justify-center gap-2 bg-secondary text-on-secondary px-8 py-4 rounded-full font-action-lg text-action-lg hover:shadow-lg active:scale-95 transition-all scale-interaction"
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span>Yes, I'm Better</span>
              </button>
              <button 
                onClick={() => setFeedback("no")}
                className="flex items-center justify-center gap-2 bg-surface-container-highest text-on-surface px-8 py-4 rounded-full font-action-lg text-action-lg hover:bg-surface-dim active:scale-95 transition-all scale-interaction"
              >
                <span className="material-symbols-outlined">help</span>
                <span>I Still Need Help</span>
              </button>
            </div>
          </section>

          <div className="flex justify-center pt-4">
            <button onClick={onReset} className="text-primary hover:underline font-semibold py-2 px-4 scale-interaction">
              Go Back Home
            </button>
          </div>

        </div>
      )}

      {/* 2. ORIGINAL SUCCESS VIEW */}
      {feedback === "yes" && (
        <div className="flex flex-col items-center text-center space-y-10 py-10 animate-in fade-in duration-300 w-full max-w-5xl mx-auto">
          <div className="relative w-32 h-32 flex items-center justify-center mb-6">
            <div className="absolute inset-0 bg-secondary-container/30 rounded-full animate-ping"></div>
            <div className="relative bg-secondary-container text-on-secondary-container w-24 h-24 rounded-full flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="font-headline-lg text-headline-lg text-primary">You're doing amazing.</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-[500px] mx-auto">Your strength is inspiring.</p>
          </div>

          {/* Calming Recovery Card */}
          <div ref={cardRef} className="w-full bg-white p-6 rounded-xl shadow-lg border border-outline-variant/30 flex flex-col gap-6 text-left card-glass mx-auto">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="bg-secondary/10 p-2 rounded-lg">
                  <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                </div>
                <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest text-xs">Recovery Card</span>
              </div>
              <div className="bg-surface-container-low px-4 py-2 rounded-full">
                <span className="font-label-caps text-label-caps text-on-surface-variant text-xs">Day 42</span>
              </div>
            </div>

            <div className="space-y-6 py-6 border-y border-outline-variant/20 w-full">
              <p className="font-headline-md text-headline-md text-on-surface leading-tight italic whitespace-normal break-words">
                "{encouragement}"
              </p>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary text-[18px]">lightbulb</span>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Every urge resisted is progress.
                </p>
              </div>
            </div>

            <div className="relative h-24 w-full rounded-lg overflow-hidden">
              <div 
                className="w-full h-full bg-cover bg-center" 
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBqdo89qszUoBEuEw3amT2beM0rh-USePK7aFDHjD6HiGmRWaTHfYA-YxmeM9u4hOVWFo2v7dCEO6h_2VeissVsX3CRHWK6N1tsT-HO2AbtEYmbV4yUkcKvXS_SdXkgG3AVPsQEDLkLZFMswlMTFgoPHnAkIaMUlDrN1iZMYV9CNwUnOfdjkfF7NT6Zvk3w3TXkqlYNp2gBHnqgm2-ZZfwPuzubnIQrepttJxaHOq6etBprBwhc9Jay')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              <div className="absolute bottom-2 right-2">
                <span className="text-white/80 font-headline-md text-[14px]">Recovera</span>
              </div>
            </div>

            <button 
              onClick={handleDownloadCard}
              className="w-full h-14 bg-primary text-on-primary rounded-xl font-action-lg text-action-lg flex items-center justify-center gap-4 hover:opacity-90 transition-all active:scale-95 shadow-md scale-interaction"
            >
              <span className="material-symbols-outlined">download</span>
              <span>Download Recovery Card</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
            <button 
              onClick={() => setFeedback(null)} 
              className="text-secondary hover:underline font-semibold py-2 px-4 scale-interaction"
            >
              Back to Plan
            </button>
            <button 
              onClick={onReset} 
              className="text-primary hover:underline font-semibold py-2 px-4 scale-interaction"
            >
              Go Back Home
            </button>
          </div>
        </div>
      )}

      {/* 3. ORIGINAL SUPPORT VIEW */}
      {feedback === "no" && (
        <div className="space-y-10 py-10 animate-in fade-in duration-300 w-full max-w-5xl mx-auto">
          <div className="w-full text-center mb-6">
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2">Need Support?</h1>
            <p className="font-body-md text-on-surface-variant max-w-md mx-auto">
              You don't have to face this alone. Let's reach out to someone you trust.
            </p>
          </div>

          <div className="w-full grid grid-cols-1 gap-6">
            {/* Trusted caregiver card */}
            <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 flex items-center gap-6 shadow-sm w-full">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-secondary/20 flex-shrink-0">
                <img 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXrXBSxL9kTq-YhB4d3jhn8E9gyT-nNg3gQbG3RatWzsod4fvuMNP3HxDsnY19ZrJ00B9Oy9cmSkk33ZBILezf4MSrQFmzMEBxerSkMVPQuK_iXMTnFNBoeeaKY8onLMqC-1vhZdZyiPIpZSPYnSCLM-aU4_o-N3daQ_4ip1-W5YYjggISddGMdVBKOIUdM75e1CRZG1bbp-kpIpxkk7E0JdFteGFUvnl8UuMKnZcUCbG-5v5xTEGI" 
                  alt="Sarah caregiver"
                />
              </div>
              <div className="flex-grow text-left">
                <h2 className="font-headline-md text-headline-md text-on-surface">Sarah (Sister)</h2>
                <p className="font-body-md text-secondary font-semibold">(555) 0123</p>
              </div>
              <div className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full font-label-caps text-xs">
                TRUSTED CONTACT
              </div>
            </div>

            {/* Generated Emergency Message */}
            <div className="bg-surface-container border border-outline-variant/30 rounded-2xl p-6 flex flex-col gap-4 text-left w-full">
              <span className="font-label-caps text-label-caps text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                SUGGESTED MESSAGE
              </span>
              <div className="bg-white p-6 rounded-lg border border-outline-variant/30 italic text-on-surface-variant font-body-lg whitespace-normal break-words leading-relaxed w-full">
                "{emergencyMessage}"
              </div>
              <button 
                onClick={handleCopyMessage}
                className="flex items-center justify-center gap-2 font-action-lg text-primary h-[48px] hover:bg-primary-container/10 transition-colors rounded-lg w-full scale-interaction"
              >
                <span className="material-symbols-outlined">
                  {isCopied ? "check_circle" : "content_copy"}
                </span>
                <span>{isCopied ? "Message Copied" : "Copy Message"}</span>
              </button>
            </div>

            {/* Call Caregiver Button */}
            <div className="w-full mt-4">
              <button 
                onClick={() => alert("Calling caregiver Sarah at (555) 0123...")}
                className="w-full h-[64px] bg-secondary text-on-secondary rounded-full font-action-lg flex items-center justify-center gap-3 shadow-lg hover:opacity-90 transition-all active:scale-[0.98] pulse-soft scale-interaction"
              >
                <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>call</span>
                <span>Call Caregiver</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-6">
            <button 
              onClick={() => setFeedback(null)} 
              className="text-secondary hover:underline font-semibold py-2 px-4 scale-interaction"
            >
              Back to Plan
            </button>
            <button 
              onClick={onReset} 
              className="text-primary hover:underline font-semibold py-2 px-4 scale-interaction"
            >
              Go Back Home
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
