"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Network, 
  Terminal, 
  Calculator, 
  HelpCircle, 
  Layers, 
  BookOpen,
  Menu,
  X,
  Cpu,
  GraduationCap,
  Play,
  Map
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = "" }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Devices Simulator", href: "/devices-lab", icon: Network, badge: "Sim" },
    { name: "Cisco IOS CLI", href: "/cli-sandbox", icon: Terminal, badge: "Lab" },
    { name: "Subnetting Trainer", href: "/subnetting", icon: Calculator },
    { name: "Practice Quizzes", href: "/quiz", icon: HelpCircle },
    { name: "Spaced Flashcards", href: "/flashcards", icon: GraduationCap },
    { name: "OSI Layer Matcher", href: "/osi-matcher", icon: Layers },
    { name: "Cisco Cert Guide", href: "/guide", icon: BookOpen },
    { name: "Video Course", href: "/videos", icon: Play },
    { name: "Study Roadmap", href: "/roadmap", icon: Map },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between w-full h-16 px-4 bg-zinc-900 border-b border-zinc-800 fixed top-0 left-0 z-40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-zinc-950 border border-zinc-800 rounded-lg">
            <Cpu className="w-5 h-5 text-zinc-300" />
          </div>
          <span className="font-bold text-sm text-zinc-100 tracking-wide">
            NetAcademy CCNA
          </span>
        </div>
        <button 
          onClick={toggleSidebar}
          className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar for Desktop & Mobile drawer */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 flex flex-col w-64 bg-zinc-900 border-r border-zinc-800/80 transition-transform duration-300 ease-in-out md:translate-x-0 md:static ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${className}`}
      >
        {/* Header Logo */}
        <div className="flex items-center gap-3 h-16 px-6 border-b border-zinc-800/85">
          <div className="p-2 bg-zinc-950 border border-zinc-800 rounded-xl">
            <Cpu className="w-5 h-5 text-zinc-200" />
          </div>
          <div>
            <h1 className="font-black text-base leading-tight tracking-wider text-zinc-100">
              NETACADEMY
            </h1>
            <p className="text-xs font-extrabold tracking-widest text-zinc-400 uppercase">
              CCNA 200-301
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive 
                    ? "bg-zinc-950 text-white border-l border-white pl-2.5" 
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${
                    isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
                  }`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[11px] font-bold rounded-md bg-zinc-950 border border-zinc-800 text-zinc-500 font-mono">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Info */}
        <div className="p-4 border-t border-zinc-800/60 bg-zinc-950/20">
          <div className="flex items-center gap-3 p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/60">
            <div className="w-2.5 h-2.5 bg-zinc-650 rounded-full shrink-0 animate-pulse" />
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-zinc-350 truncate">CCNA Prep Mode</p>
              <p className="text-[11px] text-zinc-500 font-medium">Saved locally</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          onClick={toggleSidebar}
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-xs md:hidden"
        />
      )}
    </>
  );
}
