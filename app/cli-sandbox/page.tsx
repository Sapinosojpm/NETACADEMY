"use client";

import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { 
  initialDeviceState, 
  executeCliCommand, 
  getPrompt, 
  CliDeviceState 
} from "../utils/cli-engine";
import { Terminal as TerminalIcon, CheckCircle2, AlertCircle, Play, RotateCcw, HelpCircle } from "lucide-react";

interface LabGuide {
  id: number;
  title: string;
  description: string;
  tasks: string[];
  validate: (state: CliDeviceState) => boolean;
}

const labsList: LabGuide[] = [
  {
    id: 1,
    title: "Lab 1: Router Hostname & Interface Config",
    description: "Learn the basics of entering configuration modes, changing a router's identity, and bringing up interfaces with IP addresses.",
    tasks: [
      "Enter privileged EXEC mode with 'enable' (or 'en')",
      "Enter global configuration mode with 'configure terminal' (or 'conf t')",
      "Change the router hostname to 'R1' using 'hostname R1'",
      "Enter configuration for GigabitEthernet0/0 using 'interface GigabitEthernet0/0' (or 'int g0/0')",
      "Assign IP address '192.168.1.1 255.255.255.0' using 'ip address 192.168.1.1 255.255.255.0'",
      "Enable the interface with 'no shutdown' (or 'no shut')"
    ],
    validate: (state) => {
      const g0 = state.interfaces["GigabitEthernet0/0"];
      return (
        state.hostname === "R1" &&
        g0?.ipAddress === "192.168.1.1" &&
        g0?.subnetMask === "255.255.255.0" &&
        g0?.isUp === true
      );
    }
  },
  {
    id: 2,
    title: "Lab 2: Loopback Setup & OSPFv2 Routing",
    description: "Configure virtual loopback interfaces and enable OSPF routing to advertise connected network subnets.",
    tasks: [
      "Enter global configuration mode",
      "Enter Loopback0 configuration using 'interface Loopback0' (or 'int lo0')",
      "Assign IP address '10.10.10.10 255.255.255.255' and enable with 'no shutdown'",
      "Enter OSPF configuration with 'router ospf 10'",
      "Advertise Loopback0 with 'network 10.10.10.10 0.0.0.0 area 0'",
      "Advertise G0/0 subnet with 'network 192.168.1.0 0.0.0.255 area 0'"
    ],
    validate: (state) => {
      const lo = state.interfaces["Loopback0"];
      const hasLoRoute = state.ospfNetworks.some(net => net.network === "10.10.10.10" && net.wildcard === "0.0.0.0" && net.area === 0);
      const hasGRoute = state.ospfNetworks.some(net => net.network === "192.168.1.0" && net.wildcard === "0.0.0.0" || net.wildcard === "0.0.0.255" && net.area === 0);
      return (
        lo?.ipAddress === "10.10.10.10" &&
        lo?.isUp === true &&
        state.ospfNetworks.length >= 2 &&
        hasLoRoute
      );
    }
  }
];

export default function CliSandbox() {
  const [deviceState, setDeviceState] = useState<CliDeviceState>(initialDeviceState());
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "Cisco IOS Software, IOS-XE Software, Version 17.03.04",
    "Copyright (c) 1986-2026 by Cisco Systems, Inc.",
    "Compiled Sat 13-Jun-26 by gemini-agents",
    "",
    "Press RETURN to get started!",
    "Type '?' or 'help' to see list of simulated commands.",
    ""
  ]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentLabId, setCurrentLabId] = useState(1);
  const [completedLabs, setCompletedLabs] = useState<Record<number, boolean>>({});

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeLab = labsList.find(l => l.id === currentLabId) || labsList[0];

  useEffect(() => {
    // Scroll to bottom of terminal
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalLogs, deviceState]);

  // Focus input on terminal click
  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  const submitCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.trim();
    if (!cmd) {
      // Empty enter prints new prompt line
      setTerminalLogs(prev => [...prev, getPrompt(deviceState)]);
      setTerminalInput("");
      return;
    }

    const promptLine = `${getPrompt(deviceState)} ${cmd}`;
    const result = executeCliCommand(deviceState, cmd);
    
    setTerminalLogs(prev => [...prev, promptLine, ...result.output]);
    setDeviceState(result.nextState);
    setHistory(prev => [cmd, ...prev]);
    setHistoryIndex(-1);
    setTerminalInput("");

    // Validate active lab
    const nextCompleted = activeLab.validate(result.nextState);
    if (nextCompleted && !completedLabs[activeLab.id]) {
      setCompletedLabs(prev => ({ ...prev, [activeLab.id]: true }));
      // Save stats to localstorage
      const savedStats = localStorage.getItem("ccna_stats");
      const parsed = savedStats ? JSON.parse(savedStats) : { cliLabsCompleted: 0 };
      parsed.cliLabsCompleted = Object.keys({ ...completedLabs, [activeLab.id]: true }).length;
      localStorage.setItem("ccna_stats", JSON.stringify(parsed));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIdx = historyIndex + 1;
      if (nextIdx < history.length) {
        setHistoryIndex(nextIdx);
        setTerminalInput(history[nextIdx]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIdx = historyIndex - 1;
      if (nextIdx >= 0) {
        setHistoryIndex(nextIdx);
        setTerminalInput(history[nextIdx]);
      } else {
        setHistoryIndex(-1);
        setTerminalInput("");
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      // Simple tab completion for basic commands
      const input = terminalInput.toLowerCase().trim();
      const commands = [
        "enable", "disable", "configure terminal", "interface", 
        "ip address", "no shutdown", "shutdown", "router ospf", 
        "network", "show running-config", "show ip interface brief", 
        "show ip route", "exit", "end"
      ];
      
      const match = commands.find(c => c.startsWith(input));
      if (match) {
        setTerminalInput(match);
      }
    }
  };

  const resetLab = () => {
    setDeviceState(initialDeviceState());
    setTerminalLogs([
      "System configuration reset.",
      "Press RETURN to get started!",
      ""
    ]);
    setTerminalInput("");
    setHistory([]);
    setHistoryIndex(-1);
  };

  return (
    <div className="flex w-full h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-zinc-800/80 px-6 flex items-center justify-between bg-zinc-900/40 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <TerminalIcon className="w-5 h-5 text-cyan-400" />
            <h2 className="font-bold text-lg text-zinc-200">Cisco IOS CLI Sandbox</h2>
          </div>
          
          <div className="flex bg-zinc-800/60 p-1 rounded-xl border border-zinc-700/50">
            {labsList.map((lab) => (
              <button
                key={lab.id}
                onClick={() => {
                  setCurrentLabId(lab.id);
                  resetLab();
                }}
                className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  currentLabId === lab.id 
                    ? "bg-cyan-505 text-cyan-400 font-bold bg-cyan-500/10 border border-cyan-500/20" 
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {completedLabs[lab.id] && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                <span>Lab {lab.id}</span>
              </button>
            ))}
          </div>
        </header>

        {/* Main Content Layout */}
        <div className="flex-1 p-6 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden min-h-0">
          
          {/* CLI Terminal Simulator Column */}
          <div className="lg:col-span-2 flex flex-col bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 glow-card overflow-hidden min-h-0">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-sm text-zinc-400 font-bold ml-2 font-mono">{deviceState.hostname} CLI</span>
              </div>
              <button 
                onClick={resetLab}
                className="text-sm font-semibold text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-all"
                title="Restart Router & Reset Config"
              >
                <RotateCcw className="w-4 h-4" />
                Reload
              </button>
            </div>

            {/* Terminal screen container */}
            <div 
              onClick={handleTerminalClick}
              className="flex-1 min-h-0 bg-black border border-zinc-800 rounded-xl p-5 font-mono text-sm text-zinc-200 overflow-y-auto cursor-text flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                {terminalLogs.map((log, index) => (
                  <div key={index} className="whitespace-pre-wrap leading-relaxed">
                    {log}
                  </div>
                ))}
                
                {/* Current command line prompt */}
                <form onSubmit={submitCommand} className="flex items-center gap-1 mt-1">
                  <span className="text-emerald-400 font-bold shrink-0">{getPrompt(deviceState)}</span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent border-0 outline-none p-0 m-0 text-zinc-100 placeholder-zinc-800 focus:ring-0 focus:border-0 autofill:bg-transparent text-sm"
                    placeholder="..."
                    autoFocus
                    autoComplete="off"
                    autoCapitalize="off"
                    spellCheck="false"
                  />
                </form>
                <div ref={terminalEndRef} />
              </div>
            </div>
            <p className="text-xs text-zinc-400 mt-2 text-center">
              Press <kbd className="bg-zinc-800 px-1.5 py-0.5 rounded text-[11px]">Tab</kbd> for completion. Type <kbd className="bg-zinc-800 px-1.5 py-0.5 rounded text-[11px]">?</kbd> for help.
            </p>
          </div>

          {/* Lab Guide Sidebar Column */}
          <div className="flex flex-col gap-6 min-h-0 overflow-hidden">
            
            {/* Lab Objective Card */}
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 flex flex-col gap-4 overflow-y-auto flex-1 min-h-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-cyan-400 uppercase tracking-widest bg-cyan-950/40 px-2.5 py-1 rounded-full border border-cyan-800/40">
                  Lab Assignment
                </span>
                {completedLabs[activeLab.id] && (
                  <span className="flex items-center gap-1 text-sm text-emerald-400 font-bold bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-800/40">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Complete
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-extrabold text-base text-zinc-100 mt-1">{activeLab.title}</h3>
                <p className="text-sm text-zinc-400 mt-2 leading-relaxed">{activeLab.description}</p>
              </div>

              <div className="border-t border-zinc-800/60 pt-4">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-zinc-400 mb-3">
                  Instructions checklist:
                </h4>
                <ul className="space-y-3">
                  {activeLab.tasks.map((task, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <div className="mt-0.5 shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-zinc-800 text-xs text-zinc-400 font-bold border border-zinc-700/60">
                        {i + 1}
                      </div>
                      <span className="text-zinc-300 leading-relaxed">{task}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {completedLabs[activeLab.id] ? (
                <div className="mt-4 bg-emerald-950/20 border border-emerald-800/30 p-4 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-sm text-emerald-400">Lab Passed Successfully!</h5>
                    <p className="text-xs text-zinc-500 leading-relaxed mt-1">
                      You have correctly configured all requirements. Ready for the next lab!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-4 bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-sm text-zinc-300">Validation Status</h5>
                    <p className="text-xs text-zinc-500 leading-relaxed mt-1">
                      Complete all tasks. The simulator will automatically detect when the running configuration matches.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Tips Reference */}
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 flex flex-col shrink-0">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-zinc-400 mb-3">
                Command Reference Cheat Sheet
              </h4>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between py-1.5 border-b border-zinc-800/40">
                  <code className="text-cyan-400 font-semibold text-sm">enable</code>
                  <span className="text-zinc-450">Go to Privileged mode</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-800/40">
                  <code className="text-cyan-400 font-semibold text-sm">configure terminal</code>
                  <span className="text-zinc-450">Go to Config mode</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-800/40">
                  <code className="text-cyan-400 font-semibold text-sm">hostname &lt;name&gt;</code>
                  <span className="text-zinc-450">Set hostname identity</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-800/40">
                  <code className="text-cyan-400 font-semibold text-sm">interface &lt;int&gt;</code>
                  <span className="text-zinc-450">Select interface to configure</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <code className="text-cyan-400 font-semibold text-sm">show run</code>
                  <span className="text-zinc-450">Inspect config details</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
