"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { CheckSquare, Square, Award, Clock } from "lucide-react";

interface Topic {
  id: string;
  name: string;
  desc: string;
  duration: string;
}

interface Stage {
  domain: string;
  title: string;
  weight: string;
  topics: Topic[];
}

const ccnaStages: Stage[] = [
  {
    domain: "1.0",
    title: "Network Fundamentals",
    weight: "20%",
    topics: [
      { id: "1.1", name: "Role & Function of Network Components", desc: "Routers, L2/L3 Switches, Firewalls, WLCs, APs, Endpoints, Servers", duration: "3 hours" },
      { id: "1.2", name: "Network Topology Architectures", desc: "2-tier, 3-tier, Spine-leaf, WAN, SOHO, Cloud, On-premises", duration: "4 hours" },
      { id: "1.3", name: "Physical Interfaces & Cabling Types", desc: "Fiber optic (Single-mode, Multi-mode), Copper (UTP, Cat5e/Cat6), PoE", duration: "2 hours" },
      { id: "1.4", name: "IP Addressing & Subnetting", desc: "IPv4 subnetting (VLSM), IPv6 address representations and prefixes", duration: "6 hours" }
    ]
  },
  {
    domain: "2.0",
    title: "Network Access",
    weight: "20%",
    topics: [
      { id: "2.1", name: "VLANs & Trunking (802.1Q)", desc: "Logical segmentation, access ports, trunk links, native VLANs", duration: "4 hours" },
      { id: "2.2", name: "Interswitch Connectivity & STP", desc: "Spanning Tree Protocol, root bridge selection, port states, RSTP", duration: "5 hours" },
      { id: "2.3", name: "Cisco Wireless Architectures", desc: "WLC configuration, AP modes, Split-MAC, SSID deployment", duration: "4 hours" },
      { id: "2.4", name: "EtherChannel (LACP)", desc: "Link aggregation, active/passive negotiation, load balancing", duration: "2 hours" }
    ]
  },
  {
    domain: "3.0",
    title: "IP Connectivity",
    weight: "25%",
    topics: [
      { id: "3.1", name: "Routing Table Principles", desc: "Administrative Distance (AD), routing metric, prefix length match", duration: "3 hours" },
      { id: "3.2", name: "Static Routing Configuration", desc: "Default routing, network static routing, floating static routes", duration: "3 hours" },
      { id: "3.3", name: "OSPFv2 Single-Area Routing", desc: "Neighbor adjacencies, Link-State database, DR/BDR election", duration: "5 hours" },
      { id: "3.4", name: "First Hop Redundancy (HSRP)", desc: "Gateway redundancy, active/standby status, virtual MAC/IP", duration: "2 hours" }
    ]
  },
  {
    domain: "4.0",
    title: "IP Services",
    weight: "10%",
    topics: [
      { id: "4.1", name: "Network Address Translation (NAT)", desc: "Static NAT, Dynamic NAT, PAT (NAT Overload / Port Mapping)", duration: "4 hours" },
      { id: "4.2", name: "NTP, DHCP & DNS Operations", desc: "Network Time Protocol synchronization, DHCP lease flow, DNS records", duration: "3 hours" },
      { id: "4.3", name: "SNMP & Syslog Monitoring", desc: "Simple Network Management Protocol, logging severity levels (0-7)", duration: "2 hours" },
      { id: "4.4", name: "Quality of Service (QoS)", desc: "Traffic classification, marking, queuing mechanisms (FIFO, WFQ)", duration: "3 hours" }
    ]
  },
  {
    domain: "5.0",
    title: "Security Fundamentals",
    weight: "15%",
    topics: [
      { id: "5.1", name: "Key Security Concepts", desc: "Threats, vulnerabilities, exploits, mitigation techniques", duration: "3 hours" },
      { id: "5.2", name: "Access Control Lists (ACLs)", desc: "Standard and Extended IPv4 ACLs (numbered and named)", duration: "5 hours" },
      { id: "5.3", name: "Layer 2 Security & AAA", desc: "DHCP Snooping, Dynamic ARP Inspection, Port Security, 802.1X", duration: "4 hours" },
      { id: "5.4", name: "VPNs & Secure Access", desc: "Site-to-site IPsec VPNs, remote access VPN tunnels, SSH vs Telnet", duration: "3 hours" }
    ]
  },
  {
    domain: "6.0",
    title: "Automation & Programmability",
    weight: "10%",
    topics: [
      { id: "6.1", name: "Controller-Based Networking", desc: "Software-Defined Networking (SDN), Cisco DNA Center, overlay/underlay", duration: "4 hours" },
      { id: "6.2", name: "APIs & Data Formats", desc: "REST APIs, HTTP status codes, JSON format representations", duration: "3 hours" },
      { id: "6.3", name: "Configuration Management Tools", desc: "Puppet, Chef, Ansible agentless vs agent-based orchestrations", duration: "3 hours" }
    ]
  }
];

export default function RoadmapPage() {
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("ccna_roadmap_completed");
    if (saved) {
      try {
        setCompletedTopics(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
    setLoaded(true);
  }, []);

  const toggleTopic = (id: string) => {
    setCompletedTopics(prev => {
      const updated = prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id];
      localStorage.setItem("ccna_roadmap_completed", JSON.stringify(updated));
      return updated;
    });
  };

  const totalTopics = ccnaStages.flatMap(s => s.topics).length;
  const completedCount = completedTopics.length;
  const progressPercent = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

  return (
    <div className="flex w-full min-h-screen bg-zinc-950 text-zinc-100">
      <Sidebar />

      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        <header className="h-16 border-b border-zinc-800/80 px-6 flex items-center justify-between bg-zinc-900/40 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-lg text-zinc-200">CCNA Study Roadmap</h2>
          </div>
        </header>

        <div className="flex-1 p-6 max-w-4xl mx-auto w-full flex flex-col gap-6">
          
          {/* Overview / Progress Card */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 glow-card">
            <div className="space-y-1">
              <h3 className="font-extrabold text-lg text-zinc-100 flex items-center gap-2">
                <Award className="w-5 h-5 text-zinc-400" />
                Certification Progress
              </h3>
              <p className="text-sm text-zinc-500">
                Check off topics as you study to track your preparation for the CCNA 200-301 exam.
              </p>
            </div>
            
            <div className="w-full sm:w-64 space-y-2">
              <div className="flex items-center justify-between text-sm font-mono">
                <span className="text-zinc-500 font-bold uppercase">Completion</span>
                <span className="text-zinc-300 font-bold">{loaded ? `${progressPercent}% (${completedCount}/${totalTopics})` : "0%"}</span>
              </div>
              <div className="w-full h-2 bg-zinc-950 rounded-full border border-zinc-800 overflow-hidden">
                <div 
                  className="h-full bg-zinc-200 rounded-full transition-all duration-300"
                  style={{ width: `${loaded ? progressPercent : 0}%` }}
                />
              </div>
              {loaded && completedCount > 0 && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Are you sure you want to reset your CCNA preparation progress?")) {
                        setCompletedTopics([]);
                        localStorage.removeItem("ccna_roadmap_completed");
                      }
                    }}
                    className="text-xs font-bold font-mono text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-wider bg-zinc-950/40 px-2 py-1 rounded border border-zinc-800"
                  >
                    Reset Progress
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Roadmap Timeline */}
          <div className="space-y-6">
            {ccnaStages.map((stage) => {
              const stageTopics = stage.topics;
              const stageCompleted = stageTopics.filter(t => completedTopics.includes(t.id)).length;
              const isStageFinished = stageCompleted === stageTopics.length;

              return (
                <div key={stage.domain} className="relative pl-6 sm:pl-8 border-l border-zinc-800/80 last:border-0 pb-2">
                  
                  {/* Timeline Node Icon */}
                  <div className={`absolute left-0 -translate-x-1/2 w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                    isStageFinished
                      ? "bg-white border-white shadow-[0_0_8px_rgba(255,255,255,0.1)]"
                      : stageCompleted > 0
                        ? "bg-zinc-950 border-zinc-400"
                        : "bg-zinc-950 border-zinc-800"
                  }`}>
                    {isStageFinished && (
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-950" />
                    )}
                  </div>

                  {/* Stage Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div>
                      <span className="text-xs font-extrabold font-mono tracking-widest text-zinc-500 uppercase bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                        Domain {stage.domain} ({stage.weight} Weight)
                      </span>
                      <h4 className="font-extrabold text-base text-zinc-200 mt-1.5">
                        {stage.title}
                      </h4>
                    </div>
                    <span className="text-xs font-mono text-zinc-400 bg-zinc-950/40 px-2.5 py-1 rounded border border-zinc-800">
                      {stageCompleted} / {stageTopics.length} Done
                    </span>
                  </div>

                  {/* Stage Topics List */}
                  <div className="grid grid-cols-1 gap-3">
                    {stageTopics.map((topic) => {
                      const isCompleted = completedTopics.includes(topic.id);
                      return (
                        <div 
                          key={topic.id}
                          onClick={() => toggleTopic(topic.id)}
                          className={`group flex items-start justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                            isCompleted
                              ? "bg-zinc-950/60 border-zinc-800/80 text-zinc-400"
                              : "bg-zinc-900/20 border-zinc-800/30 text-zinc-300 hover:border-zinc-800 hover:bg-zinc-900/40"
                          }`}
                        >
                          <div className="flex items-start gap-3.5 pr-4">
                            <button className="mt-0.5 shrink-0 text-zinc-500 group-hover:text-zinc-300 transition-colors">
                              {isCompleted ? (
                                <CheckSquare className="w-4 h-4 text-zinc-300" />
                              ) : (
                                <Square className="w-4 h-4 text-zinc-600" />
                              )}
                            </button>
                            <div className="space-y-1">
                              <span className="text-sm font-bold leading-tight block">
                                {topic.id} {topic.name}
                              </span>
                              <span className="text-sm text-zinc-500 leading-relaxed block font-medium">
                                {topic.desc}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1.5 shrink-0 font-mono text-[11px] text-zinc-400 uppercase bg-zinc-950/60 border border-zinc-800 px-2 py-0.5 rounded">
                            <Clock className="w-3 h-3 text-zinc-600" />
                            {topic.duration}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </main>
    </div>
  );
}
