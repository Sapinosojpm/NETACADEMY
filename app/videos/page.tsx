"use client";

import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { Play, Award, ExternalLink, BookOpen, Terminal, Calculator, Layers } from "lucide-react";
import Link from "next/link";

interface VideoLesson {
  index: number;
  title: string;
  duration: string;
}

const ccnaPlaylist: VideoLesson[] = [
  { index: 0, title: "FREE CCNA 200-301 course // Complete Practical CCNA (v1.1 2025 Course)", duration: "13:24" },
  { index: 1, title: "Network Basics - What is a network? // FREE CCNA 200-301 course", duration: "18:44" },
  { index: 2, title: "What is a Switch? A Router? What network is this? And what is a MAC address?", duration: "36:00" },
  { index: 3, title: "Cisco Packet Tracer install (Windows 11) // FREE CCNA 200-301", duration: "10:14" },
  { index: 4, title: "Cisco Packet Tracer install (Apple macOS) // FREE CCNA 200-301", duration: "8:21" },
  { index: 5, title: "CCNA Packet Tracer Tips & Tricks (FREE CCNA 200-301 Course)", duration: "6:08" },
  { index: 6, title: "Real Equipment vs. Packet Tracer (FREE CCNA 200-301 Course)", duration: "14:05" },
  { index: 7, title: "Build a network with me for free using Cisco Packet Tracer", duration: "22:56" },
  { index: 8, title: "Build a Web Server network for free using Cisco Packet Tracer", duration: "11:25" },
  { index: 9, title: "How does a Switch learn MAC addresses? What is a MAC Address Table?", duration: "25:35" },
  { index: 10, title: "Why is ARP used in networks? (FREE CCNA 200-301 Course)", duration: "15:00" },
  { index: 11, title: "TCP/IP Model vs OSI Model (FREE CCNA 200-301 Course)", duration: "29:53" },
  { index: 12, title: "TCP/IP Model: Where are the devices and protocols?", duration: "11:55" },
  { index: 13, title: "TCP/IP Model: PDUs and Encapsulation & Decapsulation", duration: "8:25" },
  { index: 14, title: "TCP/IP Model: Packet Tracer Lab (hands on lab)", duration: "11:20" },
  { index: 15, title: "Real Device Wireshark Lab (TCP/IP Model)", duration: "8:59" },
  { index: 16, title: "Free CCNA Course: Practical Subnetting Quiz 1 (with real equipment)", duration: "12:06" },
  { index: 17, title: "Free CCNA Course: Practical Subnetting Quiz 2 (with real equipment)", duration: "10:57" },
  { index: 18, title: "Build Real Networks: Cisco, Starlink & DHCP Lab Setup", duration: "26:37" },
  { index: 19, title: "CCNA Course Split Explanation // FREE CCNA 200-301 course", duration: "1:48" },
  { index: 20, title: "Networking Myths: ARP and Switch MAC Address Tables", duration: "18:17" },
  { index: 21, title: "What happens when there is no DHCP server? (APIPA explained)", duration: "11:16" },
  { index: 22, title: "STOP Unauthorized Plugs: 3 Violation Modes EXPLAINED", duration: "18:58" },
  { index: 23, title: "The ULTIMATE Guide to Cisco Port Security - Part 2", duration: "10:34" },
  { index: 24, title: "Port Security in Practice: Modes, Logs, Counters, and more", duration: "24:24" },
  { index: 25, title: "Hack DHCP with Python and Kali Linux! This is why you need security.", duration: "15:54" },
  { index: 26, title: "Hacking networks with Python (FREE CCNA 200-301 Course)", duration: "30:21" },
  { index: 27, title: "Root Guard Lab (FREE CCNA 200-301 Course 2025)", duration: "12:23" },
  { index: 28, title: "Destroy a network with one command! (FREE CCNA 200-301)", duration: "21:58" },
  { index: 29, title: "NAT saved IPv4, the 3 RFC1918 ranges explained...", duration: "19:21" },
  { index: 30, title: "This is what you use at home: NAT Overload (PAT)...", duration: "23:03" },
  { index: 31, title: "Free CCNA Course: Configure Static NAT", duration: "10:46" },
  { index: 32, title: "Free CCNA Course: Dynamic NAT Pool (Live Lab)", duration: "7:29" },
  { index: 33, title: "Terraform for CCNA and beyond (demos included)", duration: "1:01:14" },
  { index: 34, title: "You have to learn this! AI for the CCNA 2025 exam!", duration: "38:21" },
  { index: 35, title: "What is My IP Address? Windows Linux Mac Network...", duration: "26:34" }
];

export default function VideosPage() {
  const [activeVideoIndex, setActiveVideoIndex] = useState<number>(0);

  const suggestLabs = [
    {
      topic: "1. Subnetting Fundamentals",
      desc: "Learn to calculate host ranges and masks in binary. Match this with our Subnetting Trainer.",
      href: "/subnetting",
      icon: Calculator,
      label: "Open Subnet Trainer"
    },
    {
      topic: "2. Switch vs Hub Collision Domains",
      desc: "See how Layer 2 switches isolate collisions compared to Layer 1 hubs. Match this with our simulator.",
      href: "/devices-lab",
      icon: Layers,
      label: "Open Devices Simulator"
    },
    {
      topic: "3. Router Hostnames & IP Commands",
      desc: "Watch how to configure interfaces and hostnames, then practice in our Cisco IOS CLI terminal.",
      href: "/cli-sandbox",
      icon: Terminal,
      label: "Open CLI Sandbox"
    }
  ];

  return (
    <div className="flex w-full min-h-screen bg-zinc-950 text-zinc-100">
      <Sidebar />

      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Header */}
        <header className="h-16 border-b border-zinc-800/80 px-6 flex items-center justify-between bg-zinc-900/40 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Play className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h2 className="font-bold text-base text-zinc-200 font-sans">Video Course: CCNA 200-301</h2>
          </div>
        </header>

        {/* Video Course Layout */}
        <div className="flex-1 p-6 max-w-6xl mx-auto w-full flex flex-col gap-6">
          
          {/* Main player & Interactive Sidebar Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-zinc-900/40 border border-zinc-800/85 rounded-2xl p-6 glow-card">
            
            {/* Player (Left / Col-Span-2) */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="relative w-full aspect-video rounded-xl border border-zinc-850 overflow-hidden bg-black shadow-inner">
                <iframe
                  src={`https://www.youtube.com/embed/videoseries?list=PLw6kwOJVj3MbMZ8B72ZgUryj8OSETC0ds&index=${activeVideoIndex}`}
                  title={ccnaPlaylist[activeVideoIndex]?.title || "CCNA Video Player"}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full border-0"
                />
              </div>

              {/* Current Video Meta */}
              <div className="space-y-1 mt-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-rose-500 uppercase tracking-widest bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/30">
                    Lesson {activeVideoIndex + 1} of {ccnaPlaylist.length}
                  </span>
                  <a 
                    href="https://www.youtube.com/watch?v=tj3yCZWOWYc&list=PLw6kwOJVj3MbMZ8B72ZgUryj8OSETC0ds"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-zinc-400 hover:text-cyan-400 flex items-center gap-1 transition-all"
                  >
                    Open on YouTube
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <h3 className="font-extrabold text-base text-zinc-250 mt-1 leading-snug">
                  {ccnaPlaylist[activeVideoIndex]?.title}
                </h3>
              </div>
            </div>

            {/* Interactive Playlist Sidebar (Right) */}
            <div className="flex flex-col gap-3 bg-zinc-950 border border-zinc-850 rounded-xl p-4 max-h-[360px] lg:max-h-none lg:h-[400px]">
              <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-400 pb-2 border-b border-zinc-905">
                Course Syllabus ({ccnaPlaylist.length} Videos)
              </h4>

              {/* Scrollable list */}
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                {ccnaPlaylist.map((video) => {
                  const isActive = activeVideoIndex === video.index;
                  return (
                    <button
                      key={video.index}
                      onClick={() => setActiveVideoIndex(video.index)}
                      className={`w-full text-left p-2.5 rounded-lg border text-sm leading-relaxed transition-all flex items-start justify-between gap-3 ${
                        isActive 
                          ? "bg-zinc-900 border-zinc-700 text-white font-black" 
                          : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30"
                      }`}
                    >
                      <div className="flex gap-2">
                        <span className="font-bold text-xs text-zinc-500 font-mono mt-0.5">
                          {(video.index + 1).toString().padStart(2, "0")}
                        </span>
                        <span className="line-clamp-2">{video.title}</span>
                      </div>
                      <span className="text-xs font-bold text-zinc-550 font-mono shrink-0 mt-0.5">
                        {video.duration}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Practice Alignment & Vouchers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Alignment cards */}
            <div className="md:col-span-2 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6">
              <h4 className="font-extrabold text-sm tracking-wider uppercase text-zinc-400 mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Hands-On Practice Map
              </h4>
              <p className="text-sm text-zinc-450 mb-5 leading-relaxed font-medium">
                Align David's video training with real-time exercises inside our sandboxes to solidify your configuration speed.
              </p>

              <div className="space-y-3">
                {suggestLabs.map((lab, idx) => {
                  const Icon = lab.icon;
                  return (
                    <div key={idx} className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <h5 className="text-sm font-extrabold text-zinc-200">{lab.topic}</h5>
                        <p className="text-xs text-zinc-450 leading-relaxed mt-1">{lab.desc}</p>
                      </div>
                      <Link 
                        href={lab.href}
                        className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] font-bold px-3 py-2 rounded-lg text-cyan-400 hover:text-cyan-300 transition-all shrink-0 flex items-center gap-1 uppercase tracking-wider font-extrabold"
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {lab.label}
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Course details card */}
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 flex flex-col gap-4">
              <h4 className="font-extrabold text-sm tracking-wider uppercase text-zinc-400 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Instructor Details
              </h4>
              <div className="space-y-3.5 text-sm text-zinc-400 leading-relaxed">
                <p>
                  This course is led by **David Bombal**, an industry-renowned networking expert, CCIE #11056, and Cisco Legend.
                </p>
                <div className="border-t border-zinc-800/60 pt-3.5 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-bold uppercase text-xs tracking-wider">Exam Covered</span>
                    <span className="font-bold text-zinc-350 font-mono text-sm">CCNA 200-301</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-bold uppercase text-xs tracking-wider">Scope</span>
                    <span className="font-bold text-zinc-350 text-sm">Syllabus v1.1 2025</span>
                  </div>
                </div>
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 text-xs leading-relaxed mt-2 text-zinc-500 font-medium">
                  Select any lesson from the Course Syllabus menu on the right. The player will automatically load that video block in the playlist.
                </div>
              </div>
            </div>

          </div>

          {/* Credits & Safety Disclaimer Footer */}
          <footer className="mt-8 border-t border-zinc-900/80 pt-6 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-zinc-500 font-mono">
            <div className="space-y-1">
              <p className="font-bold text-zinc-400 text-xs">Content Attribution & Credits</p>
              <p>Course materials & videos are authored and owned by <strong className="text-zinc-450">David Bombal Tech</strong>.</p>
            </div>
            <div className="space-y-1 text-left sm:text-right">
              <p className="font-bold text-zinc-400 text-xs">Security & Compliance Notice</p>
              <p>Embedded via YouTube Standard Embed Player. 100% legal, virus-free, and secure.</p>
            </div>
          </footer>

        </div>
      </main>
    </div>
  );
}
