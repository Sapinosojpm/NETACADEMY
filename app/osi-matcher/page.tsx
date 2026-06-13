"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { Layers, HelpCircle, Trophy, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

interface ProtocolCard {
  id: string;
  name: string;
  correctLayer: number; // 1 to 7
  explanation: string;
}

const protocolPool: ProtocolCard[] = [
  { id: "p1", name: "HTTP", correctLayer: 7, explanation: "HTTP is an Application Layer protocol used to transfer webpage data across the web." },
  { id: "p2", name: "HTTPS", correctLayer: 7, explanation: "HTTPS is a secure version of HTTP running at the Application Layer." },
  { id: "p3", name: "SSH", correctLayer: 7, explanation: "SSH provides secure command-line access to routers and switches at the Application Layer." },
  { id: "p4", name: "BGP", correctLayer: 7, explanation: "BGP is the routing protocol of the internet, operating at the Application Layer." },
  { id: "p5", name: "SSL/TLS", correctLayer: 6, explanation: "SSL/TLS handles data encryption and translation at the Presentation Layer." },
  { id: "p6", name: "ASCII", correctLayer: 6, explanation: "ASCII is a character encoding standard located at the Presentation Layer." },
  { id: "p7", name: "RPC", correctLayer: 5, explanation: "Remote Procedure Call (RPC) manages inter-process communication sessions at the Session Layer." },
  { id: "p8", name: "TCP", correctLayer: 4, explanation: "TCP provides connection-oriented, reliable segment delivery at the Transport Layer." },
  { id: "p9", name: "UDP", correctLayer: 4, explanation: "UDP is a fast, connectionless transport protocol at the Transport Layer." },
  { id: "p10", name: "IP (IPv4/IPv6)", correctLayer: 3, explanation: "IP manages host addressing and packet routing at the Network Layer." },
  { id: "p11", name: "ICMP", correctLayer: 3, explanation: "ICMP is used for ping utilities and reporting routing errors at the Network Layer." },
  { id: "p12", name: "Router", correctLayer: 3, explanation: "Routers are Layer 3 devices because they make forwarding decisions based on Network Layer IP addresses." },
  { id: "p13", name: "Switch", correctLayer: 2, explanation: "Switches are Layer 2 devices because they forward frames based on Data Link MAC addresses." },
  { id: "p14", name: "MAC Address", correctLayer: 2, explanation: "MAC addresses are physical addresses burnt into NIC cards at the Data Link Layer." },
  { id: "p15", name: "Frame", correctLayer: 2, explanation: "A Frame is the Protocol Data Unit (PDU) of the Data Link Layer." },
  { id: "p16", name: "Hub", correctLayer: 1, explanation: "Hubs are Layer 1 physical repeaters that simply broadcast electrical signals at the Physical Layer." },
  { id: "p17", name: "Ethernet Cable", correctLayer: 1, explanation: "Copper and fiber optic cables transmit raw electrical/optical bits at the Physical Layer." },
  { id: "p18", name: "Bits", correctLayer: 1, explanation: "Bits (0s and 1s) are the Protocol Data Unit (PDU) of the Physical Layer." }
];

const osiLayers = [
  { num: 7, name: "Application", pdu: "Data" },
  { num: 6, name: "Presentation", pdu: "Data" },
  { num: 5, name: "Session", pdu: "Data" },
  { num: 4, name: "Transport", pdu: "Segment" },
  { num: 3, name: "Network", pdu: "Packet" },
  { num: 2, name: "Data Link", pdu: "Frame" },
  { num: 1, name: "Physical", pdu: "Bits" }
];

export default function OsiMatcher() {
  const [gameState, setGameState] = useState<"setup" | "playing" | "summary">("setup");
  const [score, setScore] = useState(0);
  const [remainingCards, setRemainingCards] = useState<ProtocolCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<ProtocolCard | null>(null);
  const [matchedPlacements, setMatchedPlacements] = useState<Record<number, string[]>>({
    7: [], 6: [], 5: [], 4: [], 3: [], 2: [], 1: []
  });
  
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [gameHighScore, setGameHighScore] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("ccna_osi_highscore");
    if (saved) setGameHighScore(parseInt(saved, 10));
  }, []);

  const startGame = () => {
    // Shuffle cards and select 8 random cards for this session to keep it quick
    const shuffled = [...protocolPool]
      .sort(() => Math.random() - 0.5)
      .slice(0, 8);

    setRemainingCards(shuffled);
    setScore(0);
    setSelectedCard(null);
    setFeedback(null);
    setMatchedPlacements({ 7: [], 6: [], 5: [], 4: [], 3: [], 2: [], 1: [] });
    setGameState("playing");
  };

  const handleCardClick = (card: ProtocolCard) => {
    setSelectedCard(card);
    setFeedback(null);
  };

  const handleLayerClick = (layerNum: number) => {
    if (!selectedCard) return;

    const isCorrect = selectedCard.correctLayer === layerNum;

    if (isCorrect) {
      // Add card to layer placements
      setMatchedPlacements(prev => ({
        ...prev,
        [layerNum]: [...prev[layerNum], selectedCard.name]
      }));
      setScore(prev => prev + 10);
      setFeedback({
        isCorrect: true,
        text: `Correct! ${selectedCard.explanation}`
      });

      // Remove card from remaining pool
      setRemainingCards(prev => prev.filter(c => c.id !== selectedCard.id));
      setSelectedCard(null);

      // Check if game is finished
      if (remainingCards.length === 1) {
        setTimeout(() => {
          finishGame();
        }, 1500);
      }

    } else {
      setScore(prev => Math.max(0, prev - 5));
      setFeedback({
        isCorrect: false,
        text: `Incorrect placement! ${selectedCard.name} does not operate at Layer ${layerNum}. Try again.`
      });
    }
  };

  const finishGame = () => {
    setGameState("summary");
    setFeedback(null);

    // Save highscore
    const finalScore = score + 10; // add points for last card
    setScore(finalScore);
    if (finalScore > gameHighScore) {
      setGameHighScore(finalScore);
      localStorage.setItem("ccna_osi_highscore", finalScore.toString());
    }

    // Save general stats
    const savedStats = localStorage.getItem("ccna_stats");
    const parsed = savedStats ? JSON.parse(savedStats) : { osiGamesPlayed: 0 };
    parsed.osiGamesPlayed = (parsed.osiGamesPlayed || 0) + 1;
    localStorage.setItem("ccna_stats", JSON.stringify(parsed));
  };

  return (
    <div className="flex w-full min-h-screen bg-zinc-950 text-zinc-100">
      <Sidebar />

      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Header */}
        <header className="h-16 border-b border-zinc-800/80 px-6 flex items-center justify-between bg-zinc-900/40 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h2 className="font-bold text-lg text-zinc-200">OSI Protocol Matcher</h2>
          </div>
        </header>

        {/* Content Box */}
        <div className="flex-1 p-6 max-w-5xl mx-auto w-full flex flex-col justify-center gap-6">
          {gameState === "setup" && (
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-8 glow-card max-w-md mx-auto w-full text-center">
              <Trophy className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-pulse-glow" />
              <h3 className="font-extrabold text-lg text-zinc-100">OSI Layer Protocol Matcher</h3>
              <p className="text-sm text-zinc-400 mt-2 leading-relaxed font-medium">
                Test your knowledge of the 7-Layer OSI model. Match common networking protocols, hardware devices, and PDUs to their correct layers.
              </p>

              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-855 my-6">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block">Highest Score</span>
                <span className="text-xl font-black text-cyan-400 font-mono mt-1 block">{gameHighScore}</span>
              </div>

              <button
                onClick={startGame}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-sm py-3.5 rounded-xl transition-all shadow-md shadow-cyan-500/10 uppercase tracking-widest font-black"
              >
                Start Game
              </button>
            </div>
          )}

          {gameState === "playing" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
              
              {/* Layers Board Column */}
              <div className="md:col-span-2 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 glow-card flex flex-col gap-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-extrabold text-base tracking-wider uppercase text-zinc-400">OSI Layers Board</h3>
                  <span className="text-sm text-zinc-500 font-bold">Score: <span className="text-zinc-200 font-mono font-black">{score}</span></span>
                </div>

                {/* Vertical OSI stack */}
                <div className="space-y-2.5">
                  {osiLayers.map((layer) => {
                    const placements = matchedPlacements[layer.num] || [];
                    const isSelectable = selectedCard !== null;
                    return (
                      <div
                        key={layer.num}
                        onClick={() => isSelectable && handleLayerClick(layer.num)}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                          isSelectable 
                            ? "hover:border-cyan-500/50 hover:bg-cyan-950/5 cursor-pointer border-zinc-800 bg-zinc-950/20" 
                            : "border-zinc-850/80 bg-zinc-950/40"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-zinc-800/60 border border-zinc-700/60 flex items-center justify-center font-mono text-xs font-black text-cyan-400 shrink-0">
                            L{layer.num}
                          </div>
                          <div>
                            <span className="text-sm font-extrabold text-zinc-200">{layer.name}</span>
                            <span className="text-xs text-zinc-400 block font-medium">PDU: {layer.pdu}</span>
                          </div>
                        </div>

                        {/* Placements display */}
                        <div className="flex gap-1.5 flex-wrap justify-end">
                          {placements.length > 0 ? (
                            placements.map((p, idx) => (
                              <span 
                                key={idx} 
                                className="px-2 py-1 bg-emerald-950/30 border border-emerald-800/60 text-emerald-400 text-xs font-bold rounded-lg animate-fade-in"
                              >
                                {p}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-zinc-700 italic pr-2">Empty</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Protocol Cards Pool Column */}
              <div className="flex flex-col gap-6">
                
                {/* Cards Deck */}
                <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 flex flex-col gap-4">
                  <h3 className="font-extrabold text-base tracking-wider uppercase text-zinc-400">Protocols Deck</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                    Select a card from the deck below, then click the correct target layer slot on the board.
                  </p>

                  <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                    {remainingCards.map((card) => {
                      const isSelected = selectedCard?.id === card.id;
                      return (
                        <button
                          key={card.id}
                          onClick={() => handleCardClick(card)}
                          className={`p-3 text-center rounded-xl border text-sm font-bold transition-all ${
                            isSelected 
                              ? "bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-md shadow-cyan-500/5 font-black" 
                              : "bg-zinc-950 border-zinc-850 hover:border-zinc-700 text-zinc-300"
                          }`}
                        >
                          {card.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Feedback Panel */}
                <div className="flex-1 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 flex items-center justify-center min-h-[160px]">
                  {feedback ? (
                    <div className="flex flex-col gap-2.5 text-center items-center">
                      {feedback.isCorrect ? (
                        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-8 h-8 text-rose-500" />
                      )}
                      <h4 className={`font-extrabold text-sm uppercase tracking-wider ${feedback.isCorrect ? "text-emerald-400" : "text-rose-500"}`}>
                        {feedback.isCorrect ? "Match Confirmed" : "Mismatch Alert"}
                      </h4>
                      <p className="text-sm text-zinc-400 leading-relaxed max-w-[240px] font-medium">
                        {feedback.text}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center text-zinc-500 max-w-[200px]">
                      <HelpCircle className="w-6 h-6 mx-auto mb-2 text-zinc-700" />
                      <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                        Select a protocol card to see clues and place it on the board.
                      </p>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {gameState === "summary" && (
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-8 glow-card max-w-md mx-auto w-full text-center">
              <Trophy className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-bounce" />
              <h3 className="font-extrabold text-lg text-zinc-100">Match Session Complete!</h3>
              <p className="text-sm text-zinc-400 mt-2 font-medium">All protocols correctly mapped on the OSI Stack.</p>

              <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-850 my-6 space-y-2">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block font-bold">Session Score</span>
                <span className="text-3xl font-black text-emerald-400 font-mono block">{score}</span>
              </div>

              <button
                onClick={startGame}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-sm py-3.5 rounded-xl transition-all shadow-md shadow-cyan-500/10 uppercase tracking-widest font-black flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" />
                Play Again
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
