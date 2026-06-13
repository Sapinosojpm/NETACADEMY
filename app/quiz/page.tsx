"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { ccnaQuestions, Question } from "../data/questions";
import { HelpCircle, Clock, CheckCircle2, AlertCircle, RefreshCw, BarChart2, Star, BookOpen } from "lucide-react";

export default function Quiz() {
  const [quizState, setQuizState] = useState<"setup" | "active" | "results">("setup");
  
  // Quiz Setup Config
  const [selectedDomain, setSelectedDomain] = useState<string>("All Domains");
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [isTimed, setIsTimed] = useState<boolean>(true);

  // Active Quiz State
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [answersLog, setAnswersLog] = useState<{ questionId: string; selectedIdx: number; isCorrect: boolean }[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 mins default
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  // Results State
  const [score, setScore] = useState<number>(0);
  const [domainBreakdown, setDomainBreakdown] = useState<Record<string, { correct: number; total: number }>>({});

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
    if (quizState === "active" && isTimed && timeLeft > 0) {
      const t = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      setTimer(t);
    } else if (timeLeft === 0 && quizState === "active") {
      finishQuiz();
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [quizState, timeLeft]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const domain = params.get("domain");
      const autostart = params.get("autostart") === "true";
      if (domain) {
        const match = domains.find(d => d.toLowerCase() === domain.toLowerCase() || d.toLowerCase().replace(/\s/g, "") === domain.toLowerCase().replace(/\s/g, ""));
        if (match) {
          setSelectedDomain(match);
          if (autostart) {
            let pool = ccnaQuestions.filter(q => q.domain === match);
            pool = pool.sort(() => Math.random() - 0.5);
            const questions = pool.slice(0, Math.min(questionCount, pool.length));
            setFilteredQuestions(questions);
            setCurrentIdx(0);
            setSelectedAnswer(null);
            setIsAnswered(false);
            setAnswersLog([]);
            setTimeLeft(questions.length * 60);
            setQuizState("active");
          }
        }
      }
    }
  }, []);

  const startQuiz = () => {
    // Filter questions
    let pool = [...ccnaQuestions];
    if (selectedDomain !== "All Domains") {
      pool = pool.filter(q => q.domain === selectedDomain);
    }
    
    // Shuffle pool
    pool = pool.sort(() => Math.random() - 0.5);
    
    // Slice count
    const questions = pool.slice(0, Math.min(questionCount, pool.length));

    setFilteredQuestions(questions);
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setAnswersLog([]);
    setTimeLeft(questions.length * 60); // 60s per question
    setQuizState("active");
  };

  const submitAnswer = (idx: number) => {
    if (isAnswered) return;
    setSelectedAnswer(idx);
    setIsAnswered(true);

    const activeQ = filteredQuestions[currentIdx];
    const isCorrect = idx === activeQ.answerIndex;

    setAnswersLog(prev => [
      ...prev,
      { questionId: activeQ.id, selectedIdx: idx, isCorrect }
    ]);
  };

  const handleNext = () => {
    if (currentIdx + 1 < filteredQuestions.length) {
      setCurrentIdx(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setQuizState("results");
    if (timer) clearTimeout(timer);

    // Calculate score
    const correctCount = answersLog.filter(a => a.isCorrect).length;
    const pct = Math.round((correctCount / filteredQuestions.length) * 100);
    setScore(pct);

    // Calculate domain breakdown
    const breakdown: Record<string, { correct: number; total: number }> = {};
    filteredQuestions.forEach((q, idx) => {
      const log = answersLog.find(l => l.questionId === q.id);
      const isCorrect = log ? log.isCorrect : false;

      if (!breakdown[q.domain]) {
        breakdown[q.domain] = { correct: 0, total: 0 };
      }
      breakdown[q.domain].total += 1;
      if (isCorrect) {
        breakdown[q.domain].correct += 1;
      }
    });
    setDomainBreakdown(breakdown);

    // Save statistics locally
    const savedStats = localStorage.getItem("ccna_stats");
    const parsed = savedStats ? JSON.parse(savedStats) : { quizzesTaken: 0, averageScore: 0, totalQuestionsSolved: 0 };
    
    const nextTaken = (parsed.quizzesTaken || 0) + 1;
    const nextAvg = parsed.averageScore === 0 ? pct : Math.round((parsed.averageScore + pct) / 2);
    parsed.quizzesTaken = nextTaken;
    parsed.averageScore = nextAvg;
    parsed.totalQuestionsSolved = (parsed.totalQuestionsSolved || 0) + correctCount;
    localStorage.setItem("ccna_stats", JSON.stringify(parsed));
  };

  const resetQuizSetup = () => {
    setQuizState("setup");
    setSelectedAnswer(null);
    setIsAnswered(false);
  };

  const activeQ = filteredQuestions[currentIdx];

  return (
    <div className="flex w-full min-h-screen bg-zinc-950 text-zinc-100">
      <Sidebar />

      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Header */}
        <header className="h-16 border-b border-zinc-800/80 px-6 flex items-center justify-between bg-zinc-900/40 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <h2 className="font-bold text-lg text-zinc-200">Practice Exam Simulator</h2>
          </div>
        </header>

        {/* Content Box */}
        <div className="flex-1 p-6 max-w-4xl mx-auto w-full flex flex-col justify-center gap-6">
          {quizState === "setup" && (
            /* Setup Screen */
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-8 glow-card max-w-2xl mx-auto w-full">
              <div className="text-center mb-6">
                <Star className="w-12 h-12 text-cyan-400 mx-auto mb-2 animate-pulse" />
                <h3 className="font-extrabold text-lg text-zinc-100">CCNA Exam Simulator Config</h3>
                <p className="text-sm text-zinc-400 mt-1">Configure your mock exam parameters modeled on official Cisco guidelines.</p>
              </div>

              <div className="space-y-5">
                {/* Domain Selector */}
                <div>
                  <label htmlFor="domain-select" className="text-xs text-zinc-500 block mb-2 font-bold uppercase tracking-wider">
                    CCNA Domain Category
                  </label>
                  <select
                    id="domain-select"
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-zinc-300 font-semibold outline-none focus:border-cyan-500/50 cursor-pointer"
                  >
                    {domains.map((dom) => (
                      <option key={dom} value={dom}>{dom}</option>
                    ))}
                  </select>
                </div>

                {/* Length & Timer */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="count-select" className="text-xs text-zinc-500 block mb-2 font-bold uppercase tracking-wider">
                      Question Count
                    </label>
                    <select
                      id="count-select"
                      value={questionCount}
                      onChange={(e) => setQuestionCount(parseInt(e.target.value, 10))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-zinc-300 font-semibold outline-none focus:border-cyan-500/50 cursor-pointer"
                    >
                      <option value={5}>5 Questions</option>
                      <option value={10}>10 Questions</option>
                      <option value={20}>20 Questions</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="timer-select" className="text-xs text-zinc-500 block mb-2 font-bold uppercase tracking-wider">
                      Time Mode
                    </label>
                    <select
                      id="timer-select"
                      value={isTimed ? "timed" : "untimed"}
                      onChange={(e) => setIsTimed(e.target.value === "timed")}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-zinc-300 font-semibold outline-none focus:border-cyan-500/50 cursor-pointer"
                    >
                      <option value="timed">Timed (60s/Q)</option>
                      <option value="untimed">Untimed</option>
                    </select>
                  </div>
                </div>

                {/* Start Button */}
                <button
                  onClick={startQuiz}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-sm py-3.5 rounded-xl transition-all shadow-md shadow-cyan-500/10 uppercase tracking-widest font-black mt-2"
                >
                  Generate Exam
                </button>
              </div>
            </div>
          )}

          {quizState === "active" && activeQ && (
            /* Active Quiz Screen */
            <div className="flex flex-col gap-6 w-full flex-1">
              
              {/* Top Progress bar */}
              <div className="flex justify-between items-center border-b border-zinc-855/80 pb-4">
                <div>
                  <span className="text-xs font-extrabold text-cyan-400 uppercase tracking-widest bg-cyan-950/40 px-2.5 py-1 rounded-full border border-cyan-800/40">
                    {activeQ.domain}
                  </span>
                  <span className="text-sm text-zinc-500 font-bold ml-3 uppercase tracking-wider">
                    Question {currentIdx + 1} of {filteredQuestions.length}
                  </span>
                </div>
                {isTimed && (
                  <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-sm font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}</span>
                  </div>
                )}
              </div>

              {/* Progress Line */}
              <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-cyan-500 h-full transition-all duration-300"
                  style={{ width: `${((currentIdx) / filteredQuestions.length) * 100}%` }}
                />
              </div>

              {/* Question Text */}
              <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl glow-card">
                <p className="text-[15px] font-extrabold text-zinc-100 leading-relaxed font-sans">
                  {activeQ.question}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {activeQ.options.map((opt, i) => {
                  const isSelected = selectedAnswer === i;
                  const isCorrect = i === activeQ.answerIndex;
                  let btnStyle = "bg-zinc-950 hover:bg-zinc-900 border-zinc-855 text-zinc-300";

                  if (isAnswered) {
                    if (isCorrect) {
                      btnStyle = "bg-emerald-950/20 border-emerald-500 text-emerald-400 font-bold shadow-md shadow-emerald-500/5";
                    } else if (isSelected) {
                      btnStyle = "bg-rose-950/20 border-rose-500 text-rose-400 font-bold";
                    } else {
                      btnStyle = "bg-zinc-950/40 border-zinc-850/60 text-zinc-550 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={i}
                      disabled={isAnswered}
                      onClick={() => submitAnswer(i)}
                      className={`w-full text-left p-4 rounded-xl border text-sm font-semibold leading-relaxed flex items-center justify-between transition-all ${btnStyle}`}
                    >
                      <div className="flex gap-3">
                        <span className="font-bold text-zinc-500 uppercase">{String.fromCharCode(65 + i)}.</span>
                        <span>{opt}</span>
                      </div>
                      {isAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                      {isAnswered && isSelected && !isCorrect && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Next */}
              {isAnswered && (
                <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-850 flex flex-col gap-4 animate-fade-in">
                  <div>
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      Detailed Explanation:
                    </h4>
                    <p className="text-sm text-zinc-400 mt-2 leading-relaxed font-medium">
                      {activeQ.explanation}
                    </p>
                  </div>
                  <button
                    onClick={handleNext}
                    className="self-end bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-sm px-6 py-3 rounded-xl transition-all flex items-center gap-1 uppercase tracking-widest font-black"
                  >
                    {currentIdx + 1 === filteredQuestions.length ? "Finish & Review" : "Next Question"}
                  </button>
                </div>
              )}

            </div>
          )}

          {quizState === "results" && (
            /* Results Screen */
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-8 glow-card w-full flex flex-col gap-6">
              <div className="text-center border-b border-zinc-850/80 pb-6">
                <BarChart2 className="w-12 h-12 text-cyan-400 mx-auto mb-2" />
                <h3 className="font-extrabold text-lg text-zinc-100">Exam Performance Report</h3>
                <p className="text-sm text-zinc-500 mt-1">Detailed feedback of your CCNA domain strengths and weaknesses.</p>
              </div>

              {/* Large Score Indicator */}
              <div className="flex flex-col items-center justify-center p-6 bg-zinc-950 rounded-2xl border border-zinc-850 max-w-xs mx-auto w-full text-center">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Overall Score</span>
                <span className={`text-4xl font-black font-mono mt-1 ${score >= 80 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : "text-rose-500"}`}>
                  {score}%
                </span>
                <span className="text-xs text-zinc-500 font-semibold mt-2">
                  {score >= 80 ? "Passing Grade! Excellent job." : "Below standard. Needs review."}
                </span>
              </div>

              {/* Domain Breakdown */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-4">
                  Domain Performance Breakdown:
                </h4>
                <div className="space-y-4">
                  {Object.entries(domainBreakdown).map(([domain, stats]) => {
                    const pct = Math.round((stats.correct / stats.total) * 100);
                    return (
                      <div key={domain} className="space-y-1.5">
                        <div className="flex justify-between text-sm font-semibold">
                          <span className="text-zinc-300">{domain}</span>
                          <span className="text-zinc-350 font-mono">{stats.correct}/{stats.total} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-850">
                          <div 
                            className={`h-full transition-all duration-500 ${pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-rose-500"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-4 border-t border-zinc-855/80 pt-6">
                <button
                  onClick={resetQuizSetup}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-sm py-3 rounded-xl transition-all shadow-md shadow-cyan-500/10 flex items-center justify-center gap-1.5 uppercase tracking-widest font-black"
                >
                  <RefreshCw className="w-4 h-4" />
                  New Practice Quiz
                </button>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}
