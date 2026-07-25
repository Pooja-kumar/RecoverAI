import React, { useState, useRef, useEffect } from "react";

export default function HomeScreen({ onSubmit }) {
  const [urge, setUrge] = useState(3);
  const [inputText, setInputText] = useState("");
  
  // Media Input states
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  
  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState("");
  
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Setup dynamic color styling for the slider
  const getSliderColor = (val) => {
    const colors = ['#85f6ad', '#85f6ad', '#a2c9ff', '#2b6cb0', '#ba1a1a'];
    return colors[val - 1];
  };

  // Voice Speech Recognition
  const startSpeechRecognition = () => {
    setRecordingError("");
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRecordingError("Speech recognition is not supported in this browser. Please try Google Chrome or Safari.");
      return;
    }

    try {
      console.log("Initializing SpeechRecognition...");
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true; // Show results in real-time
      recognition.lang = "en-US";

      recognition.onstart = () => {
        console.log("Speech recognition service started");
        setIsRecording(true);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error event:", event);
        if (event.error === "not-allowed") {
          setRecordingError("Microphone permission denied. Please allow mic access in your browser settings.");
        } else if (event.error === "no-speech") {
          setRecordingError("No speech detected. Please speak closer to your microphone.");
        } else {
          setRecordingError(`Voice error: ${event.error}`);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        console.log("Speech recognition service ended");
        setIsRecording(false);
      };

      recognition.onresult = (event) => {
        console.log("Speech recognition result received:", event.results);
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const finalSpeech = event.results[i][0].transcript;
            setInputText((prev) => (prev ? prev + " " + finalSpeech : finalSpeech));
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        if (interimTranscript) {
          console.log("Interim transcript:", interimTranscript);
        }
      };

      recognition.start();
    } catch (e) {
      console.error("Speech recognition initialization crash:", e);
      setRecordingError("Could not start voice recognition. Check your input settings.");
      setIsRecording(false);
    }
  };

  // Image upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file.");
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      // Close camera if open
      stopCamera();
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  // Camera handling
  const startCamera = async () => {
    setCameraError("");
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access failed:", err);
      setCameraError("Camera permission denied or unavailable.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "captured_frame.png", { type: "image/png" });
        setSelectedFile(file);
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        stopCamera();
      }
    }, "image/png");
  };

  // Convert File to Base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result.split(",")[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!inputText.trim() && !selectedFile) {
      alert("Please provide context by typing/speaking how you feel or adding an image.");
      return;
    }

    let imageBase64 = null;
    let imageMimeType = null;

    if (selectedFile) {
      try {
        imageBase64 = await fileToBase64(selectedFile);
        imageMimeType = selectedFile.type;
      } catch (err) {
        console.error("Base64 conversion failed:", err);
      }
    }

    onSubmit({
      urgeLevel: urge,
      situationText: inputText,
      imageBase64,
      imageMimeType
    });
  };

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="space-y-lg">
      {/* Welcome Section */}
      <section className="text-center space-y-sm">
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-on-surface">
          Need Help Right Now?
        </h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-[500px] mx-auto">
          You are not alone. Let's get through this together.
        </p>
      </section>

      {/* Main Input Actions (Bento Style) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-md items-stretch">
        
        {/* Voice Input Card */}
        <div className="flex flex-col items-center justify-center p-md bg-white border border-outline-variant rounded-xl hover:bg-surface-container-low transition-all duration-300 group shadow-sm hover:shadow-md min-h-[180px]">
          <button
            onClick={startSpeechRecognition}
            disabled={isRecording}
            className={`w-16 h-16 rounded-full flex items-center justify-center mb-base transition-all scale-interaction ${
              isRecording ? "bg-error text-on-error animate-pulse" : "bg-primary-fixed text-on-primary-fixed-variant group-hover:scale-110"
            }`}
            aria-label="Describe how you feel using voice input"
          >
            <span className="material-symbols-outlined text-[32px]">{isRecording ? "settings_voice" : "mic"}</span>
          </button>
          <span className="font-headline-md text-headline-md text-on-surface text-center">
            {isRecording ? "Listening..." : "Describe How You Feel"}
          </span>
          {recordingError && (
            <p className="text-error text-xs mt-2 text-center">{recordingError}</p>
          )}
          
          <textarea
            className="w-full mt-4 p-sm border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary text-body-md bg-surface-container-lowest"
            rows="3"
            placeholder="Type or record how you feel..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </div>

        {/* Camera / Upload Bento */}
        <div className="grid grid-rows-2 gap-md">
          {/* Capture surroundings */}
          <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col justify-center p-md">
            {!isCameraActive ? (
              <button
                onClick={startCamera}
                className="flex items-center gap-md hover:bg-surface-container-low transition-all duration-300 group h-full w-full text-left scale-interaction"
              >
                <div className="w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform">
                  <span className="material-symbols-outlined text-on-secondary-fixed-variant text-[24px]">photo_camera</span>
                </div>
                <span className="font-action-lg text-action-lg text-on-surface">Capture Your Surroundings</span>
              </button>
            ) : (
              <div className="space-y-sm w-full">
                <div className="relative rounded-lg overflow-hidden border border-outline bg-black aspect-video max-h-[140px] flex items-center justify-center">
                  <video ref={videoRef} autoPlay playsInline muted className="h-full object-cover" />
                </div>
                <div className="flex gap-sm">
                  <button onClick={capturePhoto} className="flex-1 bg-secondary text-on-secondary py-2 rounded-lg font-semibold text-sm hover:opacity-90 active:scale-95 transition-all">
                    Take Photo
                  </button>
                  <button onClick={stopCamera} className="bg-surface-container-highest px-4 py-2 rounded-lg font-semibold text-sm hover:bg-surface-dim active:scale-95 transition-all">
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {cameraError && <p className="text-error text-xs mt-1">{cameraError}</p>}
          </div>

          {/* Upload Photo */}
          <div className="bg-white border border-outline-variant rounded-xl shadow-sm flex flex-col justify-center p-md">
            <button
              onClick={triggerUpload}
              className="flex items-center gap-md hover:bg-surface-container-low transition-all duration-300 group h-full w-full text-left scale-interaction"
            >
              <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center shrink-0 group-hover:scale-90 transition-transform">
                <span className="material-symbols-outlined text-on-tertiary-fixed-variant text-[24px]">add_photo_alternate</span>
              </div>
              <div className="flex-grow">
                <span className="font-action-lg text-action-lg text-on-surface block">Upload a Photo</span>
                {selectedFile && (
                  <span className="text-xs text-secondary font-semibold block truncate mt-1">✓ {selectedFile.name}</span>
                )}
              </div>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>
      </section>

      {/* Image Preview Container */}
      {previewUrl && (
        <section className="bg-surface-container-low p-sm rounded-xl border border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-sm">
            <img src={previewUrl} alt="Preview input" className="w-16 h-16 object-cover rounded-lg border border-outline" />
            <span className="text-sm font-semibold text-on-surface-variant">Image selected for triggers analysis</span>
          </div>
          <button
            onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
            className="text-error hover:underline text-sm font-semibold p-2"
          >
            Remove
          </button>
        </section>
      )}

      {/* Urgency Slider Section */}
      <section className="bg-surface-container-low p-md rounded-xl border border-outline-variant/30 space-y-md">
        <div className="flex justify-between items-end">
          <div className="space-y-xs">
            <h3 className="font-headline-md text-headline-md text-on-surface">How strong is your urge?</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">Self-report your current state to tailor your plan.</p>
          </div>
          <div
            className={`w-12 h-12 rounded-full text-on-primary flex items-center justify-center font-bold text-lg transition-all duration-300 ${
              urge === 5 ? "animate-bounce" : ""
            }`}
            style={{ backgroundColor: getSliderColor(urge) }}
            id="urge-value"
          >
            {urge}
          </div>
        </div>
        <div className="relative pt-6 pb-2">
          <input
            className="urgency-slider w-full h-3 bg-gradient-to-r from-[#85f6ad] via-[#a2c9ff] to-[#2b6cb0] rounded-full appearance-none outline-none"
            id="urgencyRange"
            max="5"
            min="1"
            type="range"
            value={urge}
            onChange={(e) => setUrge(parseInt(e.target.value))}
          />
          <div className="flex justify-between mt-4 px-1 text-on-surface-variant font-label-caps text-label-caps">
            <span>1 (Mild)</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5 (Very Strong)</span>
          </div>
        </div>
      </section>

      {/* Atmospheric Section */}
      <section className="relative h-48 rounded-xl overflow-hidden group shadow-sm">
        <div 
          className="absolute inset-0 z-0 transition-transform duration-700 group-hover:scale-105 bg-cover bg-center" 
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAggETRp-IMTu0pTkuwXCYb_BqG3EM94ngry8wKM22tNcroaf1mZLIfHpMspuxQKZhMWHGP9o1Ccg9IUBvGn0CC3cNsckuTo_F8P4mV470a03VMulvFZnSXWXm20rVR0erBImPehfF6Kwd6P9FjDWQnldkTswa5AfcM1jktfyd6GVlhPkqDOj5O2COqERQwjH48LxNpTKJrha7-Aebwh7QGV-LODVeLoL6EHqSmb45YBn3qeobdDl1E')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent z-10"></div>
        <div className="absolute bottom-4 left-4 z-20 text-on-primary">
          <div className="flex items-center gap-2 mb-xs">
            <span className="px-2 py-0.5 bg-secondary-fixed text-on-secondary-fixed text-[12px] font-bold rounded-full uppercase tracking-wider">3 Days Steady</span>
          </div>
          <p className="font-headline-md text-headline-md italic">"Every step forward is a victory."</p>
        </div>
      </section>

      {/* Primary Call to Action */}
      <section className="pb-base">
        <button
          onClick={handleSubmit}
          className="w-full h-[56px] bg-primary text-on-primary rounded-full font-action-lg text-action-lg shadow-lg hover:bg-primary-container transition-all active:scale-95 flex items-center justify-center gap-base scale-interaction"
        >
          <span>Get My Recovery Plan</span>
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </section>
    </div>
  );
}
