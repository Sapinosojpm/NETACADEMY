"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Link from "next/link";
import { 
  Network, 
  Terminal, 
  Calculator, 
  HelpCircle, 
  Layers, 
  BookOpen, 
  Star, 
  CheckCircle,
  GraduationCap,
  Map
} from "lucide-react";
import { ccnaQuestions, Question } from "./data/questions";

interface DashboardStats {
  cliLabsCompleted: number;
  subnetQuestionsAnswered: number;
  quizzesTaken: number;
  averageScore: number;
  totalQuestionsSolved: number;
  flashcardsReviewed: number;
  osiGamesPlayed: number;
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats>({
    cliLabsCompleted: 0,
    subnetQuestionsAnswered: 0,
    quizzesTaken: 0,
    averageScore: 0,
    totalQuestionsSolved: 0,
    flashcardsReviewed: 0,
    osiGamesPlayed: 0
  });

  const [dailyQuestion, setDailyQuestion] = useState<Question | null>(null);
  const [answeredDaily, setAnsweredDaily] = useState<boolean>(false);
  const [selectedDailyAnswer, setSelectedDailyAnswer] = useState<number | null>(null);

  useEffect(() => {
    // Load local stats
    const saved = localStorage.getItem("ccna_stats");
    if (saved) {
      setStats(JSON.parse(saved));
    }

    // Set Daily Challenge Question deterministically based on date
    const day = new Date().getDate();
    const qIndex = day % ccnaQuestions.length;
    setDailyQuestion(ccnaQuestions[qIndex]);

    // Check if daily question answered in localStorage
    const answered = localStorage.getItem(`ccna_daily_answered_${new Date().toDateString()}`);
    if (answered) {
      setAnsweredDaily(true);
      setSelectedDailyAnswer(parseInt(answered, 10));
    }
  }, []);

  const handleDailySubmit = (idx: number) => {
    if (answeredDaily) return;
    setSelectedDailyAnswer(idx);
    setAnsweredDaily(true);
    localStorage.setItem(`ccna_daily_answered_${new Date().toDateString()}`, idx.toString());

    // Update stats if correct
    if (dailyQuestion && idx === dailyQuestion.answerIndex) {
      const nextStats = {
        ...stats,
        totalQuestionsSolved: (stats.totalQuestionsSolved || 0) + 1
      };
      setStats(nextStats);
      localStorage.setItem("ccna_stats", JSON.stringify(nextStats));
    }
  };

  // Calculate overall progress percentage
  const maxItems = 45; // 2 CLI labs + 35 flashcards + 8 questions
  const currentItems = (stats.cliLabsCompleted * 5) + stats.flashcardsReviewed + stats.totalQuestionsSolved;
  const progressPct = Math.min(100, Math.round((currentItems / maxItems) * 100));

  const modules = [
    {
      title: "Network Devices Lab",
      desc: "Simulate Packet transmission, flooding, filtering, and collisions in Hubs, Switches, and Bridges.",
      href: "/devices-lab",
      icon: Network,
      badge: "Simulator"
    },
    {
      title: "Cisco IOS CLI Sandbox",
      desc: "Practice commands, hostnames, IP allocations, OSPF routing on virtual Cisco routers with interactive labs.",
      href: "/cli-sandbox",
      icon: Terminal,
      badge: "Interactive Lab"
    },
    {
      title: "Subnetting Trainer",
      desc: "Calculate subnet boundaries, wildcards, masks, and test yourself with rapid-fire questions.",
      href: "/subnetting",
      icon: Calculator,
      badge: "Calculator"
    },
    {
      title: "Practice Exam",
      desc: "Take mock exams tailored to CCNA blueprint domains. Includes detailed justifications for correct answers.",
      href: "/quiz",
      icon: HelpCircle,
      badge: "Exam Prep"
    },
    {
      title: "Spaced Flashcards",
      desc: "Review crucial networking terms and acronyms using spaced repetition logic.",
      href: "/flashcards",
      icon: GraduationCap,
      badge: "Flashcards"
    },
    {
      title: "OSI Layer Matcher",
      desc: "Drag-and-match protocol and device cards to their corresponding OSI layer under time constraints.",
      href: "/osi-matcher",
      icon: Layers,
      badge: "Mini Game"
    },
    {
      title: "Cisco Cert Guide",
      desc: "Access a detailed exam syllabus breakdown, searchable command reference database, and glossary of key terms.",
      href: "/guide",
      icon: BookOpen,
      badge: "Reference"
    },
    {
      title: "Study Roadmap",
      desc: "Check off subtopics across the 6 CCNA domains, track your study milestones, and monitor readiness.",
      href: "/roadmap",
      icon: Map,
      badge: "Prep Tracker"
    }
  ];

  return (
    <div className="flex w-full min-h-screen bg-zinc-950 text-zinc-100">
      <Sidebar />

      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Header */}
        <header className="h-16 border-b border-zinc-800/80 px-6 flex items-center justify-between bg-zinc-900/40 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-lg text-zinc-200">Dashboard</h2>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="flex-1 p-6 max-w-6xl mx-auto w-full flex flex-col gap-6">
          
          {/* Welcome Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-zinc-900/40 border border-zinc-800/85 rounded-2xl p-6 glow-card items-center">
            <div className="md:col-span-2 space-y-2">
              <h3 className="font-extrabold text-lg text-zinc-100">
                Welcome to NetAcademy
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                An interactive sandbox designed to help you prepare for the Cisco Certified Network Associate (CCNA 200-301) exam. Practice commands, test subnet calculations, and simulate network packets.
              </p>
              
              <div className="grid grid-cols-3 gap-4 pt-3 text-center">
                <div className="bg-zinc-950/40 p-3 rounded-xl border border-zinc-800">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">CLI Labs</span>
                  <span className="text-sm font-extrabold text-zinc-200 mt-0.5 block">{stats.cliLabsCompleted}/2</span>
                </div>
                <div className="bg-zinc-950/40 p-3 rounded-xl border border-zinc-800">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Cards Reviewed</span>
                  <span className="text-sm font-extrabold text-zinc-200 mt-0.5 block">{stats.flashcardsReviewed}</span>
                </div>
                <div className="bg-zinc-950/40 p-3 rounded-xl border border-zinc-800">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Solved Qs</span>
                  <span className="text-sm font-extrabold text-zinc-200 mt-0.5 block">{stats.totalQuestionsSolved}</span>
                </div>
              </div>
            </div>

            {/* Circular Progress Ring */}
            <div className="flex flex-col items-center justify-center p-2">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#1f1f23"
                    strokeWidth="6"
                    fill="transparent"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#ffffff"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * progressPct) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-lg font-black font-mono text-zinc-100">{progressPct}%</span>
                  <span className="text-xs font-bold text-zinc-550 uppercase tracking-wider mt-0.5">Mastery</span>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Challenge & Study Modules */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Daily Challenge Card */}
            <div className="bg-zinc-900/40 border border-zinc-800/85 rounded-2xl p-6 glow-card h-fit">
              <div className="flex justify-between items-center mb-4">
                <div className="text-zinc-300 font-bold text-sm uppercase tracking-wider">
                  Daily Challenge
                </div>
                <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider font-mono">24H Interval</span>
              </div>

              {dailyQuestion ? (
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-zinc-300 leading-relaxed bg-zinc-950/60 p-4 rounded-xl border border-zinc-800">
                    {dailyQuestion.question}
                  </p>
                  
                  <div className="space-y-2">
                    {dailyQuestion.options.map((opt, idx) => {
                      const isSelected = selectedDailyAnswer === idx;
                      const isCorrect = idx === dailyQuestion.answerIndex;
                      let btnStyle = "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700";

                      if (answeredDaily) {
                        if (isCorrect) {
                          btnStyle = "bg-zinc-950 border-zinc-700 text-white font-bold";
                        } else if (isSelected) {
                          btnStyle = "bg-zinc-950 border-zinc-800 text-zinc-600 opacity-60";
                        } else {
                          btnStyle = "bg-zinc-950 border-zinc-800 text-zinc-600 opacity-40";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          disabled={answeredDaily}
                          onClick={() => handleDailySubmit(idx)}
                          className={`w-full text-left p-3 rounded-xl border text-sm font-semibold transition-all leading-relaxed flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{String.fromCharCode(65 + idx)}. {opt}</span>
                          {answeredDaily && isCorrect && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 block shrink-0" />}
                          {answeredDaily && isSelected && !isCorrect && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 block shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {answeredDaily && (
                    <div className="text-[12.5px] text-zinc-400 leading-relaxed bg-zinc-950/40 p-4 rounded-xl border border-zinc-800 animate-fade-in font-medium">
                      <strong className="text-zinc-300 font-bold block mb-1">Explanation:</strong>
                      {dailyQuestion.explanation}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-6 text-zinc-500 text-xs">
                  Loading Daily Challenge...
                </div>
              )}
            </div>

            {/* Modules Grid */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="font-extrabold text-base tracking-wider uppercase text-zinc-500">
                CCNA Modules
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {modules.map((mod, idx) => {
                  const Icon = mod.icon;
                  return (
                    <Link
                      key={idx}
                      href={mod.href}
                      className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-zinc-700 transition-all duration-200 flex flex-col justify-between gap-4 group"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Icon className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-zinc-950 border border-zinc-800 rounded text-zinc-500 font-mono">
                            {mod.badge}
                          </span>
                        </div>
                        <h5 className="font-bold text-sm text-zinc-200 tracking-wide">
                          {mod.title}
                        </h5>
                        <p className="text-sm text-zinc-500 leading-relaxed font-sans font-semibold">
                          {mod.desc}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
