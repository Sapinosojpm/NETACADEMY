"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { ccnaFlashcards, Flashcard } from "../data/flashcards";
import { GraduationCap, Sparkles, RefreshCw, CheckCircle, ChevronRight, HelpCircle, BookOpen, Terminal } from "lucide-react";

export default function Flashcards() {
  const [selectedDomain, setSelectedDomain] = useState<string>("All Domains");
  const [deck, setDeck] = useState<Flashcard[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [mastery, setMastery] = useState<Record<string, "easy" | "medium" | "hard" | null>>({});

  const domains = [
    "All Domains",
    "Network Fundamentals",
    "Network Access",
    "IP Connectivity",
    "IP Services",
    "Security Fundamentals",
    "Automation and Programmability"
  ];

  useEffect(() => {
    // Load local mastery
    const saved = localStorage.getItem("ccna_flashcards_mastery");
    if (saved) setMastery(JSON.parse(saved));
  }, []);

  useEffect(() => {
    // Generate deck based on domain filter
    let filtered = [...ccnaFlashcards];
    if (selectedDomain !== "All Domains") {
      filtered = filtered.filter(f => f.domain === selectedDomain);
    }
    // Shuffle deck
    filtered = filtered.sort(() => Math.random() - 0.5);
    setDeck(filtered);
    setCurrentIdx(0);
    setIsFlipped(false);
  }, [selectedDomain]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleMastery = (level: "easy" | "medium" | "hard") => {
    const activeCard = deck[currentIdx];
    const nextMastery = { ...mastery, [activeCard.id]: level };
    setMastery(nextMastery);
    localStorage.setItem("ccna_flashcards_mastery", JSON.stringify(nextMastery));

    // Save general progress stats
    const savedStats = localStorage.getItem("ccna_stats");
    const parsed = savedStats ? JSON.parse(savedStats) : { flashcardsReviewed: 0 };
    parsed.flashcardsReviewed = Object.keys(nextMastery).length;
    localStorage.setItem("ccna_stats", JSON.stringify(parsed));

    handleNext();
  };

  const handleNext = () => {
    setIsFlipped(false);
    // Wait briefly for flip-back animation before changing content
    setTimeout(() => {
      if (currentIdx + 1 < deck.length) {
        setCurrentIdx(prev => prev + 1);
      } else {
        // Wrap around / reshuffle
        setDeck(prev => [...prev].sort(() => Math.random() - 0.5));
        setCurrentIdx(0);
      }
    }, 150);
  };

  const activeCard = deck[currentIdx];
  const totalMastered = Object.values(mastery).filter(v => v === "easy").length;

  return (
    <div className="flex w-full min-h-screen bg-zinc-950 text-zinc-100">
      <Sidebar />

      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Header */}
        <header className="h-16 border-b border-zinc-800/80 px-6 flex items-center justify-between bg-zinc-900/40 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-5 h-5 text-cyan-400" />
            <h2 className="font-bold text-lg text-zinc-200">Spaced Repetition Flashcards</h2>
          </div>
        </header>

        {/* Content Box */}
        <div className="flex-1 p-6 max-w-4xl mx-auto w-full flex flex-col justify-center gap-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1 items-start">
            
            {/* Filter sidebar */}
            <div className="md:col-span-1 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-4">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-zinc-400 pl-1">
                Select Domain
              </h3>
              <div className="flex flex-col gap-1.5">
                {domains.map((dom) => (
                  <button
                    key={dom}
                    onClick={() => setSelectedDomain(dom)}
                    className={`text-left px-3 py-2 text-sm font-semibold rounded-lg transition-all ${
                      selectedDomain === dom 
                        ? "bg-zinc-800 text-cyan-400 border border-zinc-700/50" 
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/20"
                    }`}
                  >
                    {dom}
                  </button>
                ))}
              </div>

              {/* Progress Panel */}
              <div className="border-t border-zinc-800/60 pt-4 mt-2">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">Overall Mastery</span>
                <div className="flex justify-between items-end mt-1">
                  <span className="text-sm font-bold text-zinc-300">{totalMastered} Mastered</span>
                  <span className="text-xs text-zinc-500 font-mono">Total pool: {ccnaFlashcards.length}</span>
                </div>
              </div>
            </div>

            {/* Flashcard container */}
            <div className="md:col-span-3 flex flex-col items-center gap-6">
              {activeCard ? (
                <div className="w-full max-w-xl flex flex-col items-center gap-6">
                  
                  {/* Flip Card Wrapper */}
                  <div 
                    onClick={handleFlip}
                    className="w-full h-[480px] cursor-pointer [perspective:1000px] select-none group"
                  >
                    {/* Inner flippable box */}
                    <div 
                      className={`relative w-full h-full duration-500 [transform-style:preserve-3d] rounded-2xl border transition-all ${
                        isFlipped 
                          ? "[transform:rotateY(180deg)] border-cyan-500/25 bg-cyan-950/5" 
                          : "border-zinc-800 bg-zinc-900/60 shadow-xl"
                      }`}
                    >
                      {/* FRONT OF THE CARD */}
                      <div className="absolute inset-0 w-full h-full p-8 flex flex-col justify-between [backface-visibility:hidden]">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-extrabold text-cyan-400 uppercase tracking-wider bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                            {activeCard.domain}
                          </span>
                          <span className="text-xs text-zinc-550 font-bold uppercase tracking-wider">
                            Card {currentIdx + 1} of {deck.length}
                          </span>
                        </div>

                        <div className="text-center">
                          <h4 className="text-lg md:text-xl font-extrabold text-zinc-100 tracking-wide leading-relaxed font-sans px-4">
                            {activeCard.term}
                          </h4>
                          <span className="text-xs text-zinc-500 font-medium uppercase tracking-widest mt-6 block opacity-50 group-hover:opacity-100 transition-opacity">
                            Tap to reveal details
                          </span>
                        </div>

                        <div className="flex justify-center text-zinc-500">
                          <HelpCircle className="w-4.5 h-4.5" />
                        </div>
                      </div>

                      {/* BACK OF THE CARD */}
                      <div className="absolute inset-0 w-full h-full p-6 flex flex-col [transform:rotateY(180deg)] [backface-visibility:hidden]">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-4 border-b border-zinc-800/60 pb-3">
                          <span className="text-xs font-extrabold text-cyan-400 uppercase tracking-wider bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                            {activeCard.domain}
                          </span>
                          <span className="text-xs text-zinc-550 font-bold uppercase tracking-wider">
                            Details
                          </span>
                        </div>

                        {/* Scrollable Content Container */}
                        <div 
                          onClick={(e) => e.stopPropagation()} 
                          className="flex-1 overflow-y-auto pr-1.5 space-y-4 text-left custom-scrollbar"
                        >
                          {/* Definition Section */}
                          <div>
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                              Definition
                            </span>
                            <p className="text-sm font-semibold text-zinc-100 leading-relaxed bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/50">
                              {activeCard.definition}
                            </p>
                          </div>

                          {/* Explanation Section */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-zinc-550">
                              <BookOpen className="w-3.5 h-3.5 text-cyan-400/80" />
                              <span className="text-xs font-bold uppercase tracking-wider">
                                Explanation
                              </span>
                            </div>
                            <p className="text-sm text-zinc-300 leading-relaxed pl-5 font-medium">
                              {activeCard.explanation}
                            </p>
                          </div>

                          {/* Scenario Section */}
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 text-zinc-555">
                              <Terminal className="w-3.5 h-3.5 text-amber-400/80" />
                              <span className="text-xs font-bold uppercase tracking-wider">
                                Real-World Scenario
                              </span>
                            </div>
                            <div className="pl-5">
                              <div className="bg-zinc-950/90 text-zinc-300 p-3 rounded-xl border border-zinc-800/80 font-mono text-xs leading-relaxed shadow-inner">
                                <span className="text-amber-500 font-bold block mb-1"># SCENARIO:</span>
                                {activeCard.scenario}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bottom indicator */}
                        <div className="flex justify-center text-cyan-400/30 pt-3 border-t border-zinc-800/40 mt-3">
                          <Sparkles className="w-4 h-4 animate-pulse" />
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Rating Actions */}
                  {isFlipped ? (
                    <div className="w-full max-w-md flex flex-col items-center gap-3 animate-fade-in">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">
                        How well did you know this?
                      </span>
                      <div className="grid grid-cols-3 gap-3 w-full">
                        <button
                          onClick={() => handleMastery("hard")}
                          className="bg-rose-950/20 hover:bg-rose-950/40 border border-rose-800/60 hover:border-rose-500 text-rose-400 text-xs font-bold py-2.5 rounded-xl transition-all uppercase tracking-wider"
                        >
                          Forgot
                        </button>
                        <button
                          onClick={() => handleMastery("medium")}
                          className="bg-amber-950/20 hover:bg-amber-950/40 border border-amber-800/60 hover:border-amber-500 text-amber-400 text-xs font-bold py-2.5 rounded-xl transition-all uppercase tracking-wider"
                        >
                          Okay
                        </button>
                        <button
                          onClick={() => handleMastery("easy")}
                          className="bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-800/60 hover:border-emerald-500 text-emerald-400 text-xs font-bold py-2.5 rounded-xl transition-all uppercase tracking-wider"
                        >
                          Mastered
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleFlip}
                      className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-300 font-bold text-xs px-6 py-2.5 rounded-xl transition-all flex items-center gap-1.5 uppercase tracking-widest"
                    >
                      Flip Card
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  )}

                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 border border-dashed border-zinc-800 rounded-2xl text-zinc-500">
                  No flashcards found in this category.
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
