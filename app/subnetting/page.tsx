"use client";

import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { 
  calculateSubnetDetails, 
  generateSubnetQuestion, 
  validateIp, 
  SubnetDetails, 
  SubnetQuestion 
} from "../utils/subnet-utils";
import { Calculator, Zap, Award, CheckCircle2, AlertCircle, RefreshCw, Clock } from "lucide-react";

export default function Subnetting() {
  const [activeTab, setActiveTab] = useState<"calculator" | "practice">("calculator");
  
  // Calculator State
  const [ipInput, setIpInput] = useState("192.168.1.130");
  const [cidrInput, setCidrInput] = useState(26);
  const [details, setDetails] = useState<SubnetDetails | null>(null);

  // Practice State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<SubnetQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initial calculation
    handleCalculate();
    // Load highscore
    const saved = localStorage.getItem("ccna_subnet_highscore");
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  useEffect(() => {
    // Handle timer
    if (isPlaying && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isPlaying) {
      endGame();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, timeLeft]);

  // Calculator logic
  const handleCalculate = () => {
    if (validateIp(ipInput)) {
      const res = calculateSubnetDetails(ipInput, cidrInput);
      setDetails(res);
    } else {
      setDetails(null);
    }
  };

  const handleCidrChange = (val: number) => {
    setCidrInput(val);
    const res = calculateSubnetDetails(ipInput, val);
    setDetails(res);
  };

  // Practice logic
  const startPractice = () => {
    setIsPlaying(true);
    setScore(0);
    setStreak(0);
    setTimeLeft(60);
    setHasAnswered(false);
    setSelectedOption(null);
    nextQuestion();
  };

  const nextQuestion = () => {
    setCurrentQuestion(generateSubnetQuestion());
    setSelectedOption(null);
    setHasAnswered(false);
  };

  const submitOption = (opt: string) => {
    if (hasAnswered || !currentQuestion) return;
    setSelectedOption(opt);
    setHasAnswered(true);

    if (opt === currentQuestion.correctAnswer) {
      setScore(prev => prev + 10);
      setStreak(prev => {
        const next = prev + 1;
        if (next > highScore) {
          setHighScore(next);
          localStorage.setItem("ccna_subnet_highscore", next.toString());
        }
        return next;
      });
      
      // Save stats to general localstorage
      const savedStats = localStorage.getItem("ccna_stats");
      const parsed = savedStats ? JSON.parse(savedStats) : { subnetQuestionsAnswered: 0 };
      parsed.subnetQuestionsAnswered = (parsed.subnetQuestionsAnswered || 0) + 1;
      localStorage.setItem("ccna_stats", JSON.stringify(parsed));

    } else {
      setStreak(0);
    }
  };

  const endGame = () => {
    setIsPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  return (
    <div className="flex w-full min-h-screen bg-zinc-950 text-zinc-100">
      <Sidebar />

      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Header */}
        <header className="h-16 border-b border-zinc-800/80 px-6 flex items-center justify-between bg-zinc-900/40 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Calculator className="w-5 h-5 text-cyan-400" />
            <h2 className="font-bold text-lg text-zinc-200">Subnetting Sandbox</h2>
          </div>

          <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800/80 text-sm font-bold">
            <button
              onClick={() => { setActiveTab("calculator"); endGame(); }}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "calculator" 
                  ? "bg-cyan-500 text-zinc-950 font-bold shadow-md shadow-cyan-500/20" 
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              Subnet Calculator
            </button>
            <button
              onClick={() => setActiveTab("practice")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "practice" 
                  ? "bg-cyan-500 text-zinc-950 font-bold shadow-md shadow-cyan-500/20" 
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Practice Trainer
            </button>
          </div>
        </header>

        {/* Content Box */}
        <div className="flex-1 p-6 max-w-5xl mx-auto w-full flex flex-col gap-6">
          {activeTab === "calculator" ? (
            /* Calculator Tab */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
              {/* Inputs Panel */}
              <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 flex flex-col gap-5 h-fit glow-card">
                <h3 className="font-extrabold text-sm tracking-wider uppercase text-zinc-400">
                  IP Subnet Parameters
                </h3>
                
                {/* IP input */}
                <div>
                  <label htmlFor="ip-input" className="text-xs text-zinc-550 block mb-2 font-bold uppercase tracking-wider">
                    IPv4 Address
                  </label>
                  <input
                    id="ip-input"
                    type="text"
                    value={ipInput}
                    onChange={(e) => setIpInput(e.target.value)}
                    onKeyUp={handleCalculate}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-mono text-zinc-200 outline-none focus:border-cyan-500/50 transition-all font-bold"
                    placeholder="192.168.1.1"
                  />
                  {!validateIp(ipInput) && ipInput !== "" && (
                    <span className="text-xs text-rose-500 font-bold mt-1.5 block">
                      Invalid IPv4 format. E.g. 192.168.1.1
                    </span>
                  )}
                </div>

                {/* CIDR input */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="cidr-slider" className="text-xs text-zinc-550 font-bold uppercase tracking-wider">
                      Subnet Mask (CIDR)
                    </label>
                    <span className="text-sm font-bold font-mono text-cyan-400">/{cidrInput}</span>
                  </div>
                  <input
                    id="cidr-slider"
                    type="range"
                    min="1"
                    max="32"
                    value={cidrInput}
                    onChange={(e) => handleCidrChange(parseInt(e.target.value, 10))}
                    className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-zinc-850 rounded-lg"
                  />
                  <div className="flex justify-between text-[11px] text-zinc-600 mt-1 font-mono">
                    <span>/1</span>
                    <span>/8 (Class A)</span>
                    <span>/16 (Class B)</span>
                    <span>/24 (Class C)</span>
                    <span>/32</span>
                  </div>
                </div>
              </div>

              {/* Calculations Panel */}
              <div className="md:col-span-2 flex flex-col bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 glow-card">
                <h3 className="font-extrabold text-sm tracking-wider uppercase text-zinc-400 mb-5">
                  Subnet Calculation Output
                </h3>

                {details ? (
                  <div className="space-y-6 flex-1 flex flex-col justify-between">
                    
                    {/* Visual Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-855/80">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Network ID</span>
                        <span className="text-[17px] font-extrabold font-mono text-zinc-200 mt-1 block">{details.networkAddress}</span>
                      </div>
                      <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-855/80">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Broadcast Address</span>
                        <span className="text-[17px] font-extrabold font-mono text-zinc-200 mt-1 block">{details.broadcastAddress}</span>
                      </div>
                      <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-855/80">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Usable Host Range</span>
                        <span className="text-base font-extrabold font-mono text-cyan-400 mt-1 block">
                          {details.usableHosts > 0 ? `${details.firstUsable} ── ${details.lastUsable}` : "None"}
                        </span>
                      </div>
                      <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-855/80">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Usable Hosts Count</span>
                        <span className="text-[17px] font-extrabold font-mono text-zinc-200 mt-1 block">{details.usableHosts.toLocaleString()}</span>
                      </div>
                      <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-855/80">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Subnet Mask</span>
                        <span className="text-[17px] font-extrabold font-mono text-zinc-200 mt-1 block">{details.subnetMask}</span>
                      </div>
                      <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-855/80">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Wildcard Mask</span>
                        <span className="text-[17px] font-extrabold font-mono text-zinc-200 mt-1 block">{details.wildcardMask}</span>
                      </div>
                    </div>

                    {/* Metadata indicators */}
                    <div className="flex gap-3 text-sm text-zinc-400 border-t border-zinc-850/60 pt-4">
                      <span className="bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-lg font-bold">
                        {details.ipClass}
                      </span>
                      <span className="bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-lg font-bold text-emerald-400">
                        {details.ipType} Address
                      </span>
                    </div>

                    {/* Binary breakdown */}
                    <div className="border-t border-zinc-850/60 pt-4 mt-auto">
                      <h4 className="font-extrabold text-xs tracking-wider uppercase text-zinc-500 mb-3">
                        32-Bit Binary Visualizer (Network vs Host Bits)
                      </h4>
                      <div className="space-y-3 font-mono text-xs bg-zinc-950/80 p-4 rounded-xl border border-zinc-850">
                        <div className="flex flex-col sm:flex-row justify-between border-b border-zinc-900/50 pb-2">
                          <span className="text-zinc-500 font-bold">IP Address</span>
                          <span className="text-zinc-300 font-bold select-all">{details.ipBinary}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-between border-b border-zinc-900/50 pb-2">
                          <span className="text-zinc-500 font-bold">Subnet Mask</span>
                          <span className="font-bold select-all text-cyan-400">{details.maskBinary}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-between">
                          <span className="text-zinc-500 font-bold">Network ID</span>
                          <span className="text-zinc-300 font-bold select-all">{details.networkBinary}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="flex-1 border border-zinc-800/80 border-dashed rounded-xl flex items-center justify-center p-12 text-zinc-500 text-sm">
                    Enter a valid host IP address (e.g. 192.168.1.130) to see calculation results.
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Practice Tab */
            <div className="flex flex-col bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 glow-card flex-1 min-h-[400px]">
              
              {!isPlaying ? (
                /* Start Screen */
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto">
                  <Award className="w-16 h-16 text-cyan-400 mb-4 animate-pulse-glow" />
                  <h3 className="font-extrabold text-lg text-zinc-100">Subnetting Rapid Challenge</h3>
                  <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                    Test your speed and accuracy on subnet boundaries, host counts, wildcards, and network IDs. You have 60 seconds!
                  </p>

                  <div className="grid grid-cols-2 gap-4 w-full mt-6 mb-8">
                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-855 text-center">
                      <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block">Highest Streak</span>
                      <span className="text-xl font-black text-cyan-400 font-mono mt-1 block">{highScore}</span>
                    </div>
                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-855 text-center">
                      <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block">Time Limit</span>
                      <span className="text-xl font-black text-zinc-200 font-mono mt-1 block">60s</span>
                    </div>
                  </div>

                  <button
                    onClick={startPractice}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-sm py-3.5 rounded-xl transition-all shadow-md shadow-cyan-500/10 uppercase tracking-widest font-black"
                  >
                    Start Challenge
                  </button>
                </div>
              ) : (
                /* Question Screen */
                currentQuestion && (
                  <div className="flex flex-col flex-1 gap-6">
                    {/* Header bar */}
                    <div className="flex justify-between items-center border-b border-zinc-850/80 pb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-cyan-400 font-mono text-base font-bold">
                          <Clock className="w-4 h-4" />
                          <span>{timeLeft}s</span>
                        </div>
                        <div className="text-sm text-zinc-500 font-bold uppercase tracking-wider">
                          Score: <span className="text-zinc-200 font-mono font-black">{score}</span>
                        </div>
                      </div>
                      <div className="text-sm text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        Streak: 
                        <span className="text-emerald-400 font-mono font-black flex items-center gap-0.5">
                          <Zap className="w-3.5 h-3.5 fill-current animate-bounce" />
                          {streak}
                        </span>
                      </div>
                    </div>

                    {/* Question text */}
                    <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-850">
                      <p className="text-[15px] font-extrabold text-zinc-200 leading-relaxed font-sans">
                        {currentQuestion.question}
                      </p>
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentQuestion.options.map((opt, i) => {
                        const isSelected = selectedOption === opt;
                        const isCorrect = opt === currentQuestion.correctAnswer;
                        let btnStyle = "bg-zinc-950 hover:bg-zinc-900 border-zinc-850 text-zinc-300";

                        if (hasAnswered) {
                          if (isCorrect) {
                            btnStyle = "bg-emerald-950/20 border-emerald-500 text-emerald-400 font-bold shadow-md shadow-emerald-500/5";
                          } else if (isSelected) {
                            btnStyle = "bg-rose-950/20 border-rose-500 text-rose-400 font-bold";
                          } else {
                            btnStyle = "bg-zinc-950/40 border-zinc-850/60 text-zinc-500 opacity-60";
                          }
                        }

                        return (
                          <button
                            key={i}
                            disabled={hasAnswered}
                            onClick={() => submitOption(opt)}
                            className={`w-full text-left p-4 rounded-xl border text-sm font-mono transition-all leading-relaxed flex items-center justify-between ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {hasAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                            {hasAnswered && isSelected && !isCorrect && <AlertCircle className="w-4 h-4 text-rose-400" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation details */}
                    {hasAnswered && (
                      <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-850 flex flex-col gap-3 mt-2 animate-fade-in">
                        <div>
                          <h4 className="font-extrabold text-xs uppercase tracking-wider text-zinc-500">
                            Explanation:
                          </h4>
                          <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed font-medium">
                            {currentQuestion.explanation}
                          </p>
                        </div>
                        <button
                          onClick={nextQuestion}
                          className="self-end bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-sm px-5 py-2.5 rounded-lg transition-all flex items-center gap-1 uppercase tracking-widest font-black mt-2"
                        >
                          Next Question
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                  </div>
                )
              )}

            </div>
          )}
        </div>
      </main>
    </div>
  );
}
