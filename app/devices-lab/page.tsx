"use client";

import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { 
  PCIcon, 
  HubIcon, 
  SwitchIcon, 
  BridgeIcon, 
  CollisionIcon,
  RouterIcon
} from "../components/icons";
import { RotateCcw, Send, BookOpen, Layers, RefreshCw, ShieldAlert, Cpu, Wifi, Server, Play, ExternalLink } from "lucide-react";

type DeviceMode = "hub" | "switch" | "bridge" | "router" | "firewall" | "wlc" | "vlan" | "nat" | "dhcp" | "server" | "unicast" | "broadcast" | "multicast" | "anycast";

interface PacketAnimation {
  id: string;
  from: [number, number];
  to: [number, number];
  color: string;
  delay: number;
  duration: number;
  status: "pending" | "animating" | "arrived" | "collided";
  label?: string;
}

interface NodeState {
  name: string;
  x: number;
  y: number;
  status: "idle" | "sending" | "accepted" | "rejected" | "collided";
  segment: 1 | 2;
  ip?: string;
  mac?: string;
  role?: string;
}

export default function DevicesLab() {
  const [mode, setMode] = useState<DeviceMode>("hub");
  const [activeTab, setActiveTab] = useState<"simulator" | "notebook">("simulator");
  const [notebookTab, setNotebookTab] = useState<"all" | "hub" | "switch" | "bridge" | "router" | "firewall" | "wlc" | "vlan" | "nat" | "dhcp" | "server">("all");
  const [logs, setLogs] = useState<string[]>(["Switched to Hub Mode. Ready to simulate."]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showCollision, setShowCollision] = useState(false);
  const [firewallBlocked, setFirewallBlocked] = useState(false);
  const [natTable, setNatTable] = useState<{ localIp: string; localPort: number; globalIp: string; globalPort: number; destIp: string; destPort: number }[]>([]);

  // Cabling & Drag-Drop states
  const [links, setLinks] = useState<{ from: string; to: string }[]>([]);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [cableSource, setCableSource] = useState<string | null>(null);
  const [cableMode, setCableMode] = useState(false);
  const [serverSpawned, setServerSpawned] = useState(false);

  // Server config states
  const [serverIp, setServerIp] = useState("192.168.1.254");
  const [serverSubnet, setServerSubnet] = useState("255.255.255.0");
  const [serverGateway, setServerGateway] = useState("192.168.1.1");
  const [httpEnabled, setHttpEnabled] = useState(false);
  const [httpHtml, setHttpHtml] = useState("<h1>Welcome to Cisco Network Academy!</h1>");
  const [dnsEnabled, setDnsEnabled] = useState(false);
  const [dnsRecords, setDnsRecords] = useState<{ domain: string; ip: string }[]>([
    { domain: "academy.cisco", ip: "192.168.1.254" }
  ]);
  const [dhcpEnabled, setDhcpEnabled] = useState(false);
  const [dhcpStart, setDhcpStart] = useState("192.168.1.50");
  const [activeServerTab, setActiveServerTab] = useState<"ip" | "http" | "dns" | "dhcp">("ip");
  const [selectedConfigDevice, setSelectedConfigDevice] = useState<string | null>(null);
  const [newDnsDomain, setNewDnsDomain] = useState("");
  const [newDnsIp, setNewDnsIp] = useState("");
  
  // Simulation packets
  const [packets, setPackets] = useState<PacketAnimation[]>([]);
  
  // Dynamic diagnostic tables
  const [camTable, setCamTable] = useState<{ mac: string; port: string; vlan: string; type: string }[]>([]);
  const [dhcpLeases, setDhcpLeases] = useState<{ client: string; mac: string; ip: string; lease: string; status: string }[]>([]);
  const [activeAclSeq, setActiveAclSeq] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Nodes base placement (A, C on Left Segment; B, D on Right Segment)
  const [nodes, setNodes] = useState<Record<string, NodeState>>({
    "PC A": { name: "PC A", x: 80, y: 70, status: "idle", segment: 1, ip: "192.168.1.10", mac: "000A.0001.0001", role: "Client A" },
    "PC B": { name: "PC B", x: 420, y: 70, status: "idle", segment: 2, ip: "10.0.0.10", mac: "000B.0002.0002", role: "Web Server" },
    "PC C": { name: "PC C", x: 80, y: 230, status: "idle", segment: 1, ip: "192.168.1.20", mac: "000A.0001.0003", role: "Client C" },
    "PC D": { name: "PC D", x: 420, y: 230, status: "idle", segment: 2, ip: "10.0.0.20", mac: "000B.0002.0004", role: "DB Server" },
    "Central Device": { name: "Central Device", x: 250, y: 150, status: "idle", segment: 1, role: "Hub" },
  });

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 49)]);
  };

  const resetSimulation = () => {
    setPackets([]);
    setIsSimulating(false);
    setShowCollision(false);
    setFirewallBlocked(false);
    setNatTable([]);
    setActiveAclSeq(null);
    setNodes(prev => {
      const reset = { ...prev };
      Object.keys(reset).forEach(k => {
        reset[k].status = "idle";
        // Retain current IP if in DHCP mode to preserve dynamic leases
        if (mode === "dhcp" && k === "PC A" && prev[k].ip !== "0.0.0.0") {
          reset[k].ip = prev[k].ip;
        }
        // Retain dynamic IP in Server mode if DHCP succeeded
        if (mode === "server" && k === "PC A" && prev[k].ip !== "0.0.0.0") {
          reset[k].ip = prev[k].ip;
        }
      });
      return reset;
    });
    // In server mode, reset links back to default PC-to-Switch only
    if (mode === "server") {
      setLinks([{ from: "PC A", to: "L2 Switch" }]);
    }
    addLog("Simulator reset. Ready.");
  };

  const handleModeChange = (newMode: DeviceMode) => {
    setMode(newMode);
    setPackets([]);
    setIsSimulating(false);
    setShowCollision(false);
    setFirewallBlocked(false);
    setNatTable([]);
    setCableMode(false);
    setCableSource(null);
    setSelectedConfigDevice(null);
    setActiveAclSeq(null);
    setCamTable([]);

    if (newMode === "dhcp") {
      setDhcpLeases([
        { client: "DNS Server", mac: "000B.0002.0004", ip: "192.168.1.253", lease: "Infinite", status: "Static" },
        { client: "DHCP Server", mac: "000A.0001.0003", ip: "192.168.1.254", lease: "Infinite", status: "Static" }
      ]);
    } else if (newMode === "server") {
      setDhcpLeases([
        { client: "Config Server", mac: "000B.0002.9999", ip: "192.168.1.254", lease: "Infinite", status: "Static" }
      ]);
    } else {
      setDhcpLeases([]);
    }
    
    // Update topology configurations
    if (newMode === "wlc") {
      setServerSpawned(false);
      setLinks([]);
      setNodes({
        "Laptop A": { name: "Laptop A", x: 80, y: 70, status: "idle", segment: 1, ip: "192.168.10.50", mac: "000A.1111.1111", role: "Wifi Client" },
        "WLC": { name: "WLC", x: 420, y: 70, status: "idle", segment: 2, ip: "192.168.1.250", mac: "000B.3333.3333", role: "Controller" },
        "Lightweight AP": { name: "Lightweight AP", x: 80, y: 230, status: "idle", segment: 1, ip: "192.168.1.5", mac: "000A.2222.2222", role: "Access Point" },
        "Server": { name: "Server", x: 420, y: 230, status: "idle", segment: 2, ip: "8.8.8.8", mac: "000B.4444.4444", role: "Internet Gateway" },
        "Central Device": { name: "Central Device", x: 250, y: 150, status: "idle", segment: 1, role: "L3 Switch" },
      });
    } else if (newMode === "vlan") {
      setServerSpawned(false);
      setLinks([]);
      setNodes({
        "PC A": { name: "PC A", x: 80, y: 70, status: "idle", segment: 1, ip: "192.168.10.10", mac: "000A.0001.0010", role: "HR (VLAN 10)" },
        "PC B": { name: "PC B", x: 420, y: 70, status: "idle", segment: 2, ip: "192.168.10.20", mac: "000B.0002.0020", role: "HR (VLAN 10)" },
        "PC C": { name: "PC C", x: 80, y: 230, status: "idle", segment: 1, ip: "192.168.20.10", mac: "000A.0001.0030", role: "IT (VLAN 20)" },
        "PC D": { name: "PC D", x: 420, y: 230, status: "idle", segment: 2, ip: "192.168.20.20", mac: "000B.0002.0040", role: "IT (VLAN 20)" },
        "Switch 1": { name: "Switch 1", x: 180, y: 150, status: "idle", segment: 1, role: "Switch" },
        "Switch 2": { name: "Switch 2", x: 320, y: 150, status: "idle", segment: 2, role: "Switch" },
      });
    } else if (newMode === "nat") {
      setServerSpawned(false);
      setLinks([]);
      setNodes({
        "PC A": { name: "PC A", x: 80, y: 70, status: "idle", segment: 1, ip: "192.168.1.10", mac: "000A.0001.0001", role: "Inside PC A" },
        "PC B": { name: "PC B", x: 420, y: 70, status: "idle", segment: 2, ip: "8.8.8.8", mac: "000B.0002.0002", role: "Web Server" },
        "PC C": { name: "PC C", x: 80, y: 230, status: "idle", segment: 1, ip: "192.168.1.20", mac: "000A.0001.0003", role: "Inside PC C" },
        "PC D": { name: "PC D", x: 420, y: 230, status: "idle", segment: 2, ip: "8.8.4.4", mac: "000B.0002.0004", role: "DNS Server" },
        "Central Device": { name: "Central Device", x: 250, y: 150, status: "idle", segment: 1, role: "Router" },
      });
    } else if (newMode === "dhcp") {
      setServerSpawned(false);
      setLinks([]);
      setNodes({
        "PC A": { name: "PC A", x: 80, y: 70, status: "idle", segment: 1, ip: "0.0.0.0", mac: "000A.0001.0001", role: "DHCP Client" },
        "PC B": { name: "PC B", x: 420, y: 70, status: "idle", segment: 2, ip: "10.10.10.10", mac: "000B.0002.0002", role: "Web Server" },
        "PC C": { name: "PC C", x: 80, y: 230, status: "idle", segment: 1, ip: "192.168.1.254", mac: "000A.0001.0003", role: "DHCP Server" },
        "PC D": { name: "PC D", x: 420, y: 230, status: "idle", segment: 2, ip: "192.168.1.253", mac: "000B.0002.0004", role: "DNS Server" },
        "Central Device": { name: "Central Device", x: 250, y: 150, status: "idle", segment: 1, role: "Switch" },
      });
    } else if (newMode === "server") {
      setServerSpawned(false);
      setLinks([{ from: "PC A", to: "L2 Switch" }]);
      setNodes({
        "PC A": { name: "PC A", x: 80, y: 70, status: "idle", segment: 1, ip: "0.0.0.0", mac: "000A.0001.0001", role: "DHCP Client" },
        "L2 Switch": { name: "L2 Switch", x: 250, y: 150, status: "idle", segment: 1, role: "Switch" },
        "Server": { name: "Server", x: 340, y: 230, status: "idle", segment: 2, ip: "192.168.1.254", mac: "000B.0002.9999", role: "Configurable Server" },
      });
    } else if (newMode === "unicast") {
      setServerSpawned(false);
      setLinks([]);
      setNodes({
        "PC A": { name: "PC A", x: 80, y: 70, status: "idle", segment: 1, ip: "192.168.1.10", mac: "AA:BB:CC:DD:EE:01", role: "Sender" },
        "PC B": { name: "PC B", x: 420, y: 70, status: "idle", segment: 2, ip: "10.0.0.10", mac: "AA:BB:CC:DD:EE:02", role: "Destination" },
        "PC C": { name: "PC C", x: 80, y: 230, status: "idle", segment: 1, ip: "192.168.1.20", mac: "AA:BB:CC:DD:EE:03", role: "Bystander" },
        "PC D": { name: "PC D", x: 420, y: 230, status: "idle", segment: 2, ip: "10.0.0.20", mac: "AA:BB:CC:DD:EE:04", role: "Bystander" },
        "Central Device": { name: "Central Device", x: 250, y: 150, status: "idle", segment: 1, role: "Router" },
      });
    } else if (newMode === "broadcast") {
      setServerSpawned(false);
      setLinks([]);
      setNodes({
        "PC A": { name: "PC A", x: 80, y: 70, status: "idle", segment: 1, ip: "192.168.1.10", mac: "AA:BB:CC:DD:EE:01", role: "Sender" },
        "PC B": { name: "PC B", x: 420, y: 70, status: "idle", segment: 1, ip: "192.168.1.20", mac: "AA:BB:CC:DD:EE:02", role: "Receiver" },
        "PC C": { name: "PC C", x: 80, y: 230, status: "idle", segment: 1, ip: "192.168.1.30", mac: "AA:BB:CC:DD:EE:03", role: "Receiver" },
        "PC D": { name: "PC D", x: 420, y: 230, status: "idle", segment: 1, ip: "192.168.1.40", mac: "AA:BB:CC:DD:EE:04", role: "Receiver" },
        "Central Device": { name: "Central Device", x: 250, y: 150, status: "idle", segment: 1, role: "Switch" },
      });
    } else if (newMode === "multicast") {
      setServerSpawned(false);
      setLinks([]);
      setNodes({
        "PC A": { name: "PC A", x: 80, y: 70, status: "idle", segment: 1, ip: "10.0.0.1", mac: "AA:BB:CC:DD:EE:01", role: "Multicast Source" },
        "PC B": { name: "PC B", x: 420, y: 70, status: "idle", segment: 2, ip: "192.168.1.10", mac: "AA:BB:CC:DD:EE:02", role: "Group Member" },
        "PC C": { name: "PC C", x: 80, y: 230, status: "idle", segment: 1, ip: "192.168.1.20", mac: "AA:BB:CC:DD:EE:03", role: "Group Member" },
        "PC D": { name: "PC D", x: 420, y: 230, status: "idle", segment: 2, ip: "192.168.1.30", mac: "AA:BB:CC:DD:EE:04", role: "Not Subscribed" },
        "Central Device": { name: "Central Device", x: 250, y: 150, status: "idle", segment: 1, role: "Mcast Router" },
      });
    } else if (newMode === "anycast") {
      setServerSpawned(false);
      setLinks([]);
      setNodes({
        "PC A": { name: "PC A", x: 80, y: 70, status: "idle", segment: 1, ip: "203.0.113.50", mac: "AA:BB:CC:DD:EE:01", role: "Client" },
        "PC B": { name: "PC B", x: 420, y: 70, status: "idle", segment: 2, ip: "203.0.113.1", mac: "AA:BB:CC:DD:EE:02", role: "Nearest Server" },
        "PC C": { name: "PC C", x: 80, y: 230, status: "idle", segment: 2, ip: "203.0.113.1", mac: "AA:BB:CC:DD:EE:03", role: "Farther Server" },
        "PC D": { name: "PC D", x: 420, y: 230, status: "idle", segment: 2, ip: "203.0.113.1", mac: "AA:BB:CC:DD:EE:04", role: "Farthest Server" },
        "Central Device": { name: "Central Device", x: 250, y: 150, status: "idle", segment: 1, role: "Router" },
      });
    } else {
      setServerSpawned(false);
      setLinks([]);
      const roles: Record<string, string> = {
        hub: "Hub",
        switch: "Switch",
        bridge: "Bridge",
        router: "Router",
        firewall: "Firewall",
      };
      setNodes({
        "PC A": { name: "PC A", x: 80, y: 70, status: "idle", segment: 1, ip: "192.168.1.10", mac: "000A.0001.0001", role: "Client A" },
        "PC B": { name: "PC B", x: 420, y: 70, status: "idle", segment: 2, ip: "10.0.0.10", mac: "000B.0002.0002", role: "Web Server" },
        "PC C": { name: "PC C", x: 80, y: 230, status: "idle", segment: 1, ip: "192.168.1.20", mac: "000A.0001.0003", role: "Client C" },
        "PC D": { name: "PC D", x: 420, y: 230, status: "idle", segment: 2, ip: "10.0.0.20", mac: "000B.0002.0004", role: "DB Server" },
        "Central Device": { name: "Central Device", x: 250, y: 150, status: "idle", segment: 1, role: roles[newMode] || "Hub" },
      });
    }
    addLog(`Switched to ${newMode.toUpperCase()} Mode.`);
  };

  // Y-offset to align SVG cable lines with device icon centers (icons are at top of flex-col groups)
  const LINE_Y_OFFSET_PC = -15;
  const LINE_Y_OFFSET_CENTER = -10;

  const getNodeLoc = (name: string): [number, number] => {
    const isCenterDevice = ["Central Device", "Switch 1", "Switch 2", "L2 Switch"].includes(name);
    const yOff = isCenterDevice ? LINE_Y_OFFSET_CENTER : LINE_Y_OFFSET_PC;
    const n = nodes[name];
    if (n) return [n.x, n.y + yOff];
    if (name === "PC A" || name === "Laptop A") return [80, 70 + yOff];
    if (name === "PC B" || name === "WLC") return [420, 70 + yOff];
    if (name === "PC C" || name === "Lightweight AP") return [80, 230 + yOff];
    if (name === "PC D" || name === "Server") {
      if (mode === "server") return [340, 230 + yOff];
      return [420, 230 + yOff];
    }
    if (name === "Switch 1") return [180, 150 + yOff];
    if (name === "Switch 2") return [320, 150 + yOff];
    if (name === "L2 Switch" || name === "Switch" || name === "Central Device") return [250, 150 + yOff];
    return [250, 150 + yOff];
  };

  const center = getNodeLoc(mode === "server" ? "L2 Switch" : "Central Device");
  const pcaLoc = getNodeLoc(mode === "wlc" ? "Laptop A" : "PC A");
  const pcbLoc = getNodeLoc(mode === "wlc" ? "WLC" : "PC B");
  const pccLoc = getNodeLoc(mode === "wlc" ? "Lightweight AP" : "PC C");
  const pcdLoc = getNodeLoc(mode === "server" || mode === "wlc" ? "Server" : "PC D");
  const sw1Loc = getNodeLoc("Switch 1");
  const sw2Loc = getNodeLoc("Switch 2");

  // Action: Unicast Send Frame A -> C (Intra-segment)
  const runSendLocal = () => {
    if (isSimulating) return;
    resetSimulation();
    setIsSimulating(true);
    
    addLog(`PC A (Source) sending frame to PC C (Same Segment / Subnet)`);
    setNodes(prev => ({
      ...prev,
      "PC A": { ...prev["PC A"], status: "sending" }
    }));

    const p1: PacketAnimation = {
      id: "p1",
      from: pcaLoc,
      to: center,
      color: "text-zinc-200",
      delay: 0,
      duration: 1.2,
      status: "pending"
    };
    setPackets([p1]);

    setTimeout(() => {
      if (mode === "hub") {
        addLog(`HUB (Layer 1): Floods packet out of all ports (Except incoming)...`);
        setPackets(prev => [
          ...prev.map(p => p.id === "p1" ? { ...p, status: "arrived" as const } : p),
          { id: "toB", from: center, to: pcbLoc, color: "text-zinc-200", delay: 0, duration: 1.2, status: "pending" },
          { id: "toC", from: center, to: pccLoc, color: "text-zinc-200", delay: 0, duration: 1.2, status: "pending" },
          { id: "toD", from: center, to: pcdLoc, color: "text-zinc-200", delay: 0, duration: 1.2, status: "pending" }
        ]);

        setTimeout(() => {
          setNodes(prev => ({
            ...prev,
            "PC B": { ...prev["PC B"], status: "rejected" },
            "PC C": { ...prev["PC C"], status: "accepted" },
            "PC D": { ...prev["PC D"], status: "rejected" }
          }));
          addLog(`PC C: Destination MAC match! Frame accepted.`);
          addLog(`PC B & PC D: Destination MAC mismatch! Frame ignored.`);
          setIsSimulating(false);
        }, 1300);

      } else if (mode === "switch") {
        addLog(`SWITCH (Layer 2): Destination IP is local subnet. ARP lookup matches local MAC of PC C. Forwarding local segment unicast...`);
        
        // Switch learns PC A MAC on port Fa0/1 when the packet arrives at the switch
        setCamTable(prev => {
          const updated = [...prev];
          if (!updated.some(e => e.mac === "000A.0001.0001")) {
            updated.push({ mac: "000A.0001.0001", port: "Fa0/1", vlan: "1", type: "Dynamic" });
          }
          return updated;
        });

        setPackets(prev => [
          ...prev.map(p => p.id === "p1" ? { ...p, status: "arrived" as const } : p),
          { id: "toC", from: center, to: pccLoc, color: "text-zinc-250", delay: 0, duration: 1.2, status: "pending" }
        ]);

        setTimeout(() => {
          setNodes(prev => ({
            ...prev,
            "PC C": { ...prev["PC C"], status: "accepted" }
          }));
          
          // Switch learns PC C MAC on port Fa0/3 when PC C receives/acknowledges the frame
          setCamTable(prev => {
            const updated = [...prev];
            if (!updated.some(e => e.mac === "000A.0001.0003")) {
              updated.push({ mac: "000A.0001.0003", port: "Fa0/3", vlan: "1", type: "Dynamic" });
            }
            return updated;
          });

          addLog(`PC C: Local unicast received successfully! No packets sent to Segment 2.`);
          setIsSimulating(false);
        }, 1300);

      } else if (mode === "router") {
        addLog(`ROUTER (Layer 3): Destination IP is local subnet. ARP lookup matches local MAC of PC C. Forwarding local segment unicast...`);

        setPackets(prev => [
          ...prev.map(p => p.id === "p1" ? { ...p, status: "arrived" as const } : p),
          { id: "toC", from: center, to: pccLoc, color: "text-zinc-250", delay: 0, duration: 1.2, status: "pending" }
        ]);

        setTimeout(() => {
          setNodes(prev => ({
            ...prev,
            "PC C": { ...prev["PC C"], status: "accepted" }
          }));
          addLog(`PC C: Local unicast received successfully! No packets sent to Segment 2.`);
          setIsSimulating(false);
        }, 1300);

      } else if (mode === "bridge") {
        addLog(`BRIDGE (Layer 2): Inspects destination MAC of PC C. Recognizes it belongs to Segment 1.`);
        addLog(`Bridge Action: Filters frame. BLOCKS it from crossing segment divider to Segment 2.`);

        setPackets(prev => [
          ...prev.map(p => p.id === "p1" ? { ...p, status: "arrived" as const } : p),
          { id: "toC", from: center, to: pccLoc, color: "text-zinc-200", delay: 0, duration: 1.2, status: "pending" }
        ]);

        setTimeout(() => {
          setNodes(prev => ({
            ...prev,
            "PC C": { ...prev["PC C"], status: "accepted" }
          }));
          addLog(`PC C: Local frame accepted. Bridge isolated traffic to Left segment.`);
          setIsSimulating(false);
        }, 1300);
      }
    }, 1200);
  };

  // Action: Route Packet A -> B (Inter-subnet / Cross-bridge)
  const runRouteCross = () => {
    if (isSimulating) return;
    resetSimulation();
    setIsSimulating(true);

    if (mode === "router") {
      addLog(`[Layer 3 Routing] PC A (${nodes["PC A"].ip}) sending packet to PC B (${nodes["PC B"].ip})`);
      addLog(`[PC A] Target is on different subnet. Sending packet to default gateway Router (192.168.1.1)`);
      addLog(`[Layer 2 Header] Src MAC: 000A.0001.0001 | Dst MAC: Router (000R.0000.0001)`);
      
      setNodes(prev => ({
        ...prev,
        "PC A": { ...prev["PC A"], status: "sending" }
      }));

      // A to Router
      setPackets([{ id: "p1", from: pcaLoc, to: center, color: "text-zinc-200", delay: 0, duration: 1.2, status: "pending" }]);

      setTimeout(() => {
        addLog(`[Router] Packet received. Decapsulating Layer 2 frame.`);
        addLog(`[Router] Checking routing table. Destination IP 10.0.0.10 matches subnet 10.0.0.0/24 on Interface GigabitEthernet0/1.`);
        addLog(`[Router] Decrementing TTL by 1. Performing ARP lookup for 10.0.0.10.`);
        addLog(`[Router] Rewriting L2 frame: Src MAC: Router (000R.0000.0001) | Dst MAC: PC B (000B.0002.0002).`);
        
        // Router to B
        setPackets(prev => [
          ...prev.map(p => p.id === "p1" ? { ...p, status: "arrived" as const } : p),
          { id: "toB", from: center, to: pcbLoc, color: "text-zinc-200", delay: 0, duration: 1.2, status: "pending" }
        ]);

        setTimeout(() => {
          setNodes(prev => ({
            ...prev,
            "PC B": { ...prev["PC B"], status: "accepted" }
          }));
          addLog(`PC B: Layer 3 packet received successfully! MAC rewritten hop-by-hop, IP addresses remained constant.`);
          setIsSimulating(false);
        }, 1300);
      }, 1200);

    } else if (mode === "bridge") {
      addLog(`[Bridge Forward] PC A sending packet to PC B across the segment boundary`);
      addLog(`[Bridge] Inspects destination MAC (PC B). Matches Right segment database.`);
      addLog(`[Bridge Action] Permitted crossover. Forwarding frame to Segment 2.`);

      setNodes(prev => ({
        ...prev,
        "PC A": { ...prev["PC A"], status: "sending" }
      }));

      setPackets([{ id: "p1", from: pcaLoc, to: center, color: "text-zinc-200", delay: 0, duration: 1.2, status: "pending" }]);

      setTimeout(() => {
        setPackets(prev => [
          ...prev.map(p => p.id === "p1" ? { ...p, status: "arrived" as const } : p),
          // Floods right segment (PC B and PC D) since bridge segment is shared media
          { id: "toB", from: center, to: pcbLoc, color: "text-zinc-200", delay: 0, duration: 1.2, status: "pending" },
          { id: "toD", from: center, to: pcdLoc, color: "text-zinc-200", delay: 0, duration: 1.2, status: "pending" }
        ]);

        setTimeout(() => {
          setNodes(prev => ({
            ...prev,
            "PC B": { ...prev["PC B"], status: "accepted" },
            "PC D": { ...prev["PC D"], status: "rejected" }
          }));
          addLog(`PC B: Destination MAC match. Accepted.`);
          addLog(`PC D: MAC mismatch. Ignored.`);
          setIsSimulating(false);
        }, 1300);
      }, 1200);
    }
  };

  // Action: Firewall Rule Test (Permit HTTP Port 80 vs Deny SSH Port 22)
  const runFirewallTest = (port: 80 | 22) => {
    if (isSimulating) return;
    resetSimulation();
    setIsSimulating(true);

    const isHttp = port === 80;
    addLog(`[Firewall Test] Client A initiating TCP Connection to Web Server on Port ${port} (${isHttp ? "HTTP" : "SSH"})`);
    
    setNodes(prev => ({
      ...prev,
      "PC A": { ...prev["PC A"], status: "sending" }
    }));

    setPackets([{ id: "p1", from: pcaLoc, to: center, color: "text-zinc-200", delay: 0, duration: 1.2, status: "pending" }]);

    setTimeout(() => {
      addLog(`[Firewall] Packet inspected at Security Boundary.`);
      setActiveAclSeq(isHttp ? 10 : 20);
      
      if (isHttp) {
        addLog(`[Firewall] ACL Rule Match: 'Permit TCP port 80'. Packet matches security parameters.`);
        addLog(`[Firewall Action] Forwarding connection to Web Server...`);

        setPackets(prev => [
          ...prev.map(p => p.id === "p1" ? { ...p, status: "arrived" as const } : p),
          { id: "toB", from: center, to: pcbLoc, color: "text-zinc-200", delay: 0, duration: 1.2, status: "pending" }
        ]);

        setTimeout(() => {
          setNodes(prev => ({
            ...prev,
            "PC B": { ...prev["PC B"], status: "accepted" }
          }));
          addLog(`Web Server: HTTP Port 80 connection established successfully.`);
          setIsSimulating(false);
        }, 1300);

      } else {
        addLog(`[Firewall] ACL Rule Match: 'Deny TCP port 22'. Traffic violates security parameters!`);
        addLog(`[Firewall Action] BLOCKED! Terminating packet.`);

        setFirewallBlocked(true);
        setPackets([]);
        
        // Return block/reset signal to A
        setPackets([{ id: "rst", from: center, to: pcaLoc, color: "text-rose-500", delay: 0, duration: 0.8, status: "pending" }]);

        setTimeout(() => {
          setNodes(prev => ({
            ...prev,
            "PC A": { ...prev["PC A"], status: "collided" }
          }));
          addLog(`Client A: Connection terminated by security firewall.`);
          setIsSimulating(false);
        }, 900);
      }
    }, 1200);
  };

  // Action: WLC CAPWAP Wireless Forwarding Simulation (Laptop A to Internet Server)
  const runCapwapSimulation = () => {
    if (isSimulating) return;
    resetSimulation();
    setIsSimulating(true);

    addLog(`[WLC Lab] Laptop A sending data packet to Internet Server (8.8.8.8)`);
    addLog(`[Laptop A] Sending standard 802.11 wireless frame to Lightweight AP (SSID: NetAcademy)`);
    
    setNodes(prev => ({
      ...prev,
      "Laptop A": { ...prev["Laptop A"], status: "sending" }
    }));

    // Step 1: Laptop A to AP (80, 70) to (80, 230)
    setPackets([{ id: "p1", from: pcaLoc, to: pccLoc, color: "text-cyan-400", delay: 0, duration: 1.0, status: "pending" }]);

    setTimeout(() => {
      addLog(`[Lightweight AP] Wireless frame received.`);
      addLog(`[Lightweight AP] Split-MAC Action: Encapsulating frame inside CAPWAP Data Tunnel (UDP 5247).`);
      addLog(`[CAPWAP Encapsulation] Outer Src IP: AP (192.168.1.5) | Outer Dst IP: WLC (192.168.1.250).`);
      
      setNodes(prev => ({
        ...prev,
        "Lightweight AP": { ...prev["Lightweight AP"], status: "sending" }
      }));

      // Step 2: AP to Switch (80, 230) to (250, 150)
      setPackets(prev => [
        ...prev.map(p => p.id === "p1" ? { ...p, status: "arrived" as const } : p),
        { id: "p2", from: pccLoc, to: center, color: "text-zinc-100", delay: 0, duration: 1.0, status: "pending" }
      ]);

      setTimeout(() => {
        addLog(`[L3 Switch] Forwarding encapsulated CAPWAP tunnel packet to WLC (Controller) on VLAN 10.`);
        
        // Step 3: Switch to WLC (250, 150) to (420, 70)
        setPackets(prev => [
          ...prev.map(p => p.id === "p2" ? { ...p, status: "arrived" as const } : p),
          { id: "p3", from: center, to: pcbLoc, color: "text-zinc-100", delay: 0, duration: 1.0, status: "pending" }
        ]);

        setTimeout(() => {
          addLog(`[WLC] CAPWAP packet arrived at controller. Decapsulating CAPWAP header.`);
          addLog(`[WLC] Decapsulated original Ethernet frame. Processing L2/L3 parameters, mapping VLAN 20, and forwarding back to switch.`);
          
          setNodes(prev => ({
            ...prev,
            "WLC": { ...prev["WLC"], status: "sending" }
          }));

          // Step 4: WLC to Switch (420, 70) to (250, 150)
          setPackets(prev => [
            ...prev.map(p => p.id === "p3" ? { ...p, status: "arrived" as const } : p),
            { id: "p4", from: pcbLoc, to: center, color: "text-emerald-400", delay: 0, duration: 1.0, status: "pending" }
          ]);

          setTimeout(() => {
            addLog(`[L3 Switch] Swapping headers. Forwarding decapsulated frame to Internet Gateway.`);
            
            // Step 5: Switch to Server (250, 150) to (420, 230)
            setPackets(prev => [
              ...prev.map(p => p.id === "p4" ? { ...p, status: "arrived" as const } : p),
              { id: "p5", from: center, to: pcdLoc, color: "text-emerald-400", delay: 0, duration: 1.0, status: "pending" }
            ]);

            setTimeout(() => {
              setNodes(prev => ({
                ...prev,
                "Server": { ...prev["Server"], status: "accepted" }
              }));
              addLog(`Server: Standard L2 frame delivered successfully! Split-MAC architecture and CAPWAP tunneling confirmed.`);
              setIsSimulating(false);
            }, 1100);
          }, 1100);
        }, 1100);
      }, 1100);
    }, 1100);
  };

  // Action: Collision Test (A+B)
  const runCollisionTest = () => {
    if (isSimulating) return;
    resetSimulation();
    setIsSimulating(true);

    addLog(`Collision Test: PC A and PC B transmitting simultaneously...`);

    setNodes(prev => ({
      ...prev,
      "PC A": { ...prev["PC A"], status: "sending" },
      "PC B": { ...prev["PC B"], status: "sending" }
    }));

    // Packets head to center from both sides
    const pA: PacketAnimation = { id: "pA", from: pcaLoc, to: center, color: "text-rose-500", delay: 0, duration: 1.2, status: "pending" };
    const pB: PacketAnimation = { id: "pB", from: pcbLoc, to: center, color: "text-rose-500", delay: 0, duration: 1.2, status: "pending" };

    setPackets([pA, pB]);

    setTimeout(() => {
      if (mode === "hub") {
        addLog(`COLLISION DETECTED! Hub does not support microsegmentation or buffer storage.`);
        addLog(`Layer 1 collision: signals overlap and corrupt in the shared collision domain.`);
        
        setShowCollision(true);
        setPackets([]);
        setNodes(prev => ({
          ...prev,
          "PC A": { ...prev["PC A"], status: "collided" },
          "PC B": { ...prev["PC B"], status: "collided" },
          "PC C": { ...prev["PC C"], status: "collided" },
          "PC D": { ...prev["PC D"], status: "collided" },
        }));

        // Send Jam signal (flooding collision)
        setPackets([
          { id: "jamA", from: center, to: pcaLoc, color: "text-rose-600", delay: 0, duration: 0.8, status: "pending" },
          { id: "jamB", from: center, to: pcbLoc, color: "text-rose-600", delay: 0, duration: 0.8, status: "pending" },
          { id: "jamC", from: center, to: pccLoc, color: "text-rose-600", delay: 0, duration: 0.8, status: "pending" },
          { id: "jamD", from: center, to: pcdLoc, color: "text-rose-600", delay: 0, duration: 0.8, status: "pending" }
        ]);

        setTimeout(() => {
          addLog(`Ethernet CSMA/CD triggered: Backoff timers initiated on all nodes.`);
          setIsSimulating(false);
        }, 900);

      } else if (mode === "switch") {
        addLog(`NO COLLISION! Switch has independent collision domains per interface.`);
        addLog(`Switch buffer memory queues packet requests sequentially.`);
        
        // Switch learns PC A and PC B MAC addresses
        setCamTable(prev => {
          let updated = [...prev];
          if (!updated.some(e => e.mac === "000A.0001.0001")) {
            updated.push({ mac: "000A.0001.0001", port: "Fa0/1", vlan: "1", type: "Dynamic" });
          }
          if (!updated.some(e => e.mac === "000B.0002.0002")) {
            updated.push({ mac: "000B.0002.0002", port: "Fa0/2", vlan: "1", type: "Dynamic" });
          }
          return updated;
        });

        setPackets(prev => [
          ...prev.map(p => ({ ...p, status: "arrived" as const })),
          { id: "fwdA", from: center, to: pccLoc, color: "text-zinc-200", delay: 0, duration: 1.2, status: "pending" },
          { id: "fwdB", from: center, to: pcdLoc, color: "text-zinc-200", delay: 0, duration: 1.2, status: "pending" }
        ]);

        setTimeout(() => {
          setNodes(prev => ({
            ...prev,
            "PC C": { ...prev["PC C"], status: "accepted" },
            "PC D": { ...prev["PC D"], status: "accepted" },
          }));

          // Switch learns PC C and PC D MAC addresses
          setCamTable(prev => {
            let updated = [...prev];
            if (!updated.some(e => e.mac === "000A.0001.0003")) {
              updated.push({ mac: "000A.0001.0003", port: "Fa0/3", vlan: "1", type: "Dynamic" });
            }
            if (!updated.some(e => e.mac === "000B.0002.0004")) {
              updated.push({ mac: "000B.0002.0004", port: "Fa0/4", vlan: "1", type: "Dynamic" });
            }
            return updated;
          });

          addLog(`PC C and PC D received both frames successfully. Collision domains are microsegmented.`);
          setIsSimulating(false);
        }, 1300);

      } else if (mode === "router") {
        addLog(`NO COLLISION! Router has independent collision domains per interface.`);
        addLog(`Router buffer memory queues packet requests sequentially.`);
        
        setPackets(prev => [
          ...prev.map(p => ({ ...p, status: "arrived" as const })),
          { id: "fwdA", from: center, to: pccLoc, color: "text-zinc-200", delay: 0, duration: 1.2, status: "pending" },
          { id: "fwdB", from: center, to: pcdLoc, color: "text-zinc-200", delay: 0, duration: 1.2, status: "pending" }
        ]);

        setTimeout(() => {
          setNodes(prev => ({
            ...prev,
            "PC C": { ...prev["PC C"], status: "accepted" },
            "PC D": { ...prev["PC D"], status: "accepted" },
          }));
          addLog(`PC C and PC D received both frames successfully. Collision domains are microsegmented.`);
          setIsSimulating(false);
        }, 1300);

      } else if (mode === "bridge") {
        addLog(`COLLISION DETECTED ON SEGMENTS!`);
        addLog(`Bridges isolate collision domains *between* segments, but inside Segment 1 & Segment 2, they remain shared collision domains.`);
        
        setShowCollision(true);
        setPackets([]);
        setNodes(prev => ({
          ...prev,
          "PC A": { ...prev["PC A"], status: "collided" },
          "PC B": { ...prev["PC B"], status: "collided" },
        }));

        setTimeout(() => {
          addLog(`CSMA/CD backoff initiated on collision domains.`);
          setIsSimulating(false);
        }, 1000);
      }
    }, 1200);
  };

  const runVlanUnicast = () => {
    if (isSimulating) return;
    resetSimulation();
    setIsSimulating(true);

    addLog("[VLAN Unicast] PC A (VLAN 10) initiating frame transmission to PC B (VLAN 10)");
    setNodes(prev => ({
      ...prev,
      "PC A": { ...prev["PC A"], status: "sending" }
    }));

    // Step 1: PC A to Switch 1
    setPackets([
      { id: "v1", from: pcaLoc, to: sw1Loc, color: "text-zinc-250", delay: 0, duration: 0.8, status: "pending" }
    ]);

    // Step 2: Switch 1 to Switch 2 (Tagged)
    setTimeout(() => {
      addLog("[Switch 1] Received untagged frame on Access Port Fa0/1 (VLAN 10).");
      addLog("[Switch 1] Forwarding out Trunk Link (Gig0/1). Inserting 802.1Q tag: VLAN ID 10.");

      setCamTable(prev => {
        const updated = [...prev];
        if (!updated.some(e => e.mac === "000A.0001.0010")) {
          updated.push({ mac: "000A.0001.0010", port: "Fa0/1", vlan: "10", type: "Dynamic" });
        }
        return updated;
      });

      setPackets(prev => [
        ...prev.map(p => p.id === "v1" ? { ...p, status: "arrived" as const } : p),
        { id: "v2", from: sw1Loc, to: sw2Loc, color: "text-zinc-100", delay: 0, duration: 0.8, status: "pending", label: "VLAN 10 Tag" }
      ]);

      // Step 3: Switch 2 to PC B (Untagged)
      setTimeout(() => {
        addLog("[Switch 2] Received tagged frame on Trunk (Gig0/1). Matches VLAN 10 database.");
        addLog("[Switch 2] Stripping 802.1Q header. Forwarding untagged frame to Access Port Fa0/2 (VLAN 10).");

        setPackets(prev => [
          ...prev.map(p => p.id === "v2" ? { ...p, status: "arrived" as const } : p),
          { id: "v3", from: sw2Loc, to: pcbLoc, color: "text-zinc-250", delay: 0, duration: 0.8, status: "pending" }
        ]);

        // Step 4: PC B accepts
        setTimeout(() => {
          setNodes(prev => ({
            ...prev,
            "PC B": { ...prev["PC B"], status: "accepted" }
          }));

          setCamTable(prev => {
            const updated = [...prev];
            if (!updated.some(e => e.mac === "000B.0002.0020")) {
              updated.push({ mac: "000B.0002.0020", port: "Fa0/2", vlan: "10", type: "Dynamic" });
            }
            return updated;
          });

          addLog("[PC B] Destination MAC matches interface. Frame received and accepted successfully!");
          setIsSimulating(false);
        }, 900);

      }, 900);

    }, 900);
  };

  const runVlanBroadcast = () => {
    if (isSimulating) return;
    resetSimulation();
    setIsSimulating(true);

    addLog("[VLAN Broadcast] PC A (VLAN 10) sending broadcast frame (Dst MAC: FFFF.FFFF.FFFF)");
    setNodes(prev => ({
      ...prev,
      "PC A": { ...prev["PC A"], status: "sending" }
    }));

    // Step 1: PC A to Switch 1
    setPackets([
      { id: "v1", from: pcaLoc, to: sw1Loc, color: "text-zinc-250", delay: 0, duration: 0.8, status: "pending" }
    ]);

    // Step 2: Switch 1 floods only VLAN 10 ports (Trunk)
    setTimeout(() => {
      addLog("[Switch 1] Received broadcast frame on VLAN 10.");
      addLog("[Switch 1] Flooding to all VLAN 10 interfaces. Switchport Fa0/3 (PC C) is in VLAN 20 - SKIPPED.");
      addLog("[Switch 1] Tagging broadcast with VLAN 10 and sending across Trunk Gig0/1.");

      setCamTable(prev => {
        const updated = [...prev];
        if (!updated.some(e => e.mac === "000A.0001.0010")) {
          updated.push({ mac: "000A.0001.0010", port: "Fa0/1", vlan: "10", type: "Dynamic" });
        }
        return updated;
      });

      setPackets(prev => [
        ...prev.map(p => p.id === "v1" ? { ...p, status: "arrived" as const } : p),
        { id: "v2", from: sw1Loc, to: sw2Loc, color: "text-zinc-100", delay: 0, duration: 0.8, status: "pending", label: "VLAN 10 Tag" }
      ]);

      // Step 3: Switch 2 receives tagged broadcast, strips it, and floods to VLAN 10 ports
      setTimeout(() => {
        addLog("[Switch 2] Received VLAN 10 tagged broadcast on Trunk. Stripping 802.1Q header.");
        addLog("[Switch 2] Flooding to VLAN 10 access ports. PC B (VLAN 10) receives frame. PC D (VLAN 20) - SKIPPED.");

        setPackets(prev => [
          ...prev.map(p => p.id === "v2" ? { ...p, status: "arrived" as const } : p),
          { id: "v3", from: sw2Loc, to: pcbLoc, color: "text-zinc-250", delay: 0, duration: 0.8, status: "pending" }
        ]);

        // Step 4: PC B accepts, PC C & D stay idle
        setTimeout(() => {
          setNodes(prev => ({
            ...prev,
            "PC B": { ...prev["PC B"], status: "accepted" },
            "PC C": { ...prev["PC C"], status: "rejected" },
            "PC D": { ...prev["PC D"], status: "rejected" }
          }));

          setCamTable(prev => {
            const updated = [...prev];
            if (!updated.some(e => e.mac === "000B.0002.0020")) {
              updated.push({ mac: "000B.0002.0020", port: "Fa0/2", vlan: "10", type: "Dynamic" });
            }
            return updated;
          });

          addLog("[VLAN Broadcast] PC B accepted broadcast. VLAN isolation verified: VLAN 20 devices remained unaffected.");
          setIsSimulating(false);
        }, 900);

      }, 900);

    }, 900);
  };

  const runNatSimulation = () => {
    if (isSimulating) return;
    resetSimulation();
    setIsSimulating(true);

    addLog("[NAT/PAT] PC A initiating web connection (HTTP Get) to Public Web Server (8.8.8.8:80)");
    setNodes(prev => ({
      ...prev,
      "PC A": { ...prev["PC A"], status: "sending" }
    }));

    // Step 1: PC A to NAT Router
    setPackets([
      { id: "n1", from: pcaLoc, to: center, color: "text-zinc-250", delay: 0, duration: 0.9, status: "pending", label: "192.168.1.10:49152" }
    ]);

    // Step 2: Router translates and forwards
    setTimeout(() => {
      addLog("[NAT Router] Received private packet from Inside Local network.");
      addLog("[NAT Router] Performing PAT: mapping 192.168.1.10:49152 to Inside Global 203.0.113.1:50001.");
      
      setNatTable([
        { localIp: "192.168.1.10", localPort: 49152, globalIp: "203.0.113.1", globalPort: 50001, destIp: "8.8.8.8", destPort: 80 }
      ]);

      setPackets(prev => [
        ...prev.map(p => p.id === "n1" ? { ...p, status: "arrived" as const } : p),
        { id: "n2", from: center, to: pcbLoc, color: "text-zinc-100", delay: 0, duration: 0.9, status: "pending", label: "203.0.113.1:50001" }
      ]);

      // Step 3: Server processes request and returns response
      setTimeout(() => {
        addLog("[Web Server] Received HTTP GET request. Responding back to 203.0.113.1:50001.");
        setNodes(prev => ({
          ...prev,
          "PC B": { ...prev["PC B"], status: "accepted" }
        }));

        setPackets(prev => [
          ...prev.map(p => p.id === "n2" ? { ...p, status: "arrived" as const } : p),
          { id: "n3", from: pcbLoc, to: center, color: "text-zinc-100", delay: 0, duration: 0.9, status: "pending", label: "To: 203.0.113.1:50001" }
        ]);

        // Step 4: Router translates back and forwards to PC A
        setTimeout(() => {
          addLog("[NAT Router] Received return packet on outside port 50001.");
          addLog("[NAT Router] NAT Match found! Rewriting destination back to Inside Local: 192.168.1.10:49152.");

          setPackets(prev => [
            ...prev.map(p => p.id === "n3" ? { ...p, status: "arrived" as const } : p),
            { id: "n4", from: center, to: pcaLoc, color: "text-zinc-250", delay: 0, duration: 0.9, status: "pending", label: "To: 192.168.1.10:49152" }
          ]);

          // Step 5: PC A accepts
          setTimeout(() => {
            setNodes(prev => ({
              ...prev,
              "PC A": { ...prev["PC A"], status: "accepted" }
            }));
            addLog("[PC A] HTTP Connection successful! Dynamic translation table successfully mapped.");
            setIsSimulating(false);
          }, 1000);

        }, 1000);

      }, 1000);

    }, 1000);
  };

  const runDhcpDora = () => {
    if (isSimulating) return;
    resetSimulation();
    setIsSimulating(true);

    addLog("[DHCP DORA] PC A (IP: 0.0.0.0) sending broadcast request for IP assignment...");
    setNodes(prev => ({
      ...prev,
      "PC A": { ...prev["PC A"], status: "sending", ip: "0.0.0.0" }
    }));

    // Discover: PC A -> Switch -> Flooding
    setPackets([
      { id: "dh1", from: pcaLoc, to: center, color: "text-amber-500", delay: 0, duration: 0.8, status: "pending", label: "DHCP Discover (Broadcast)" }
    ]);

    setTimeout(() => {
      addLog("[L2 Switch] DHCP Discover is broadcast. Flooding out all active interfaces...");
      
      setPackets(prev => [
        ...prev.map(p => p.id === "dh1" ? { ...p, status: "arrived" as const } : p),
        { id: "dh1_floodB", from: center, to: pcbLoc, color: "text-amber-500", delay: 0, duration: 0.8, status: "pending" },
        { id: "dh1_floodC", from: center, to: pccLoc, color: "text-amber-500", delay: 0, duration: 0.8, status: "pending" },
        { id: "dh1_floodD", from: center, to: pcdLoc, color: "text-amber-500", delay: 0, duration: 0.8, status: "pending" }
      ]);

      // Offer: DHCP Server (PC C) -> Switch -> PC A
      setTimeout(() => {
        addLog("[DHCP Server] Discover received. Offering IP lease 192.168.1.50/24.");
        setNodes(prev => ({
          ...prev,
          "PC B": { ...prev["PC B"], status: "rejected" },
          "PC C": { ...prev["PC C"], status: "sending" },
          "PC D": { ...prev["PC D"], status: "rejected" }
        }));

        setPackets(prev => [
          ...prev.filter(p => p.id === "dh1"),
          { id: "dh2", from: pccLoc, to: center, color: "text-zinc-250", delay: 0, duration: 0.8, status: "pending", label: "DHCP Offer (192.168.1.50)" }
        ]);

        setTimeout(() => {
          setPackets(prev => [
            ...prev.map(p => p.id === "dh2" ? { ...p, status: "arrived" as const } : p),
            { id: "dh2_fwd", from: center, to: pcaLoc, color: "text-zinc-250", delay: 0, duration: 0.8, status: "pending" }
          ]);

          // Request: PC A -> Switch -> Broadcast Flood
          setTimeout(() => {
            addLog("[PC A] Received DHCP Offer. Broadcasting Request to confirm lease reservation.");
            setNodes(prev => ({
              ...prev,
              "PC A": { ...prev["PC A"], status: "sending" },
              "PC C": { ...prev["PC C"], status: "idle" }
            }));

            setPackets([
              { id: "dh3", from: pcaLoc, to: center, color: "text-amber-500", delay: 0, duration: 0.8, status: "pending", label: "DHCP Request" }
            ]);

            setTimeout(() => {
              setPackets(prev => [
                ...prev.map(p => p.id === "dh3" ? { ...p, status: "arrived" as const } : p),
                { id: "dh3_floodB", from: center, to: pcbLoc, color: "text-amber-500", delay: 0, duration: 0.8, status: "pending" },
                { id: "dh3_floodC", from: center, to: pccLoc, color: "text-amber-500", delay: 0, duration: 0.8, status: "pending" },
                { id: "dh3_floodD", from: center, to: pcdLoc, color: "text-amber-500", delay: 0, duration: 0.8, status: "pending" }
              ]);

              // ACK: DHCP Server -> Switch -> PC A
              setTimeout(() => {
                addLog("[DHCP Server] Lease confirmed. Committing IP lease table allocation.");
                setNodes(prev => ({
                  ...prev,
                  "PC C": { ...prev["PC C"], status: "sending" }
                }));

                setPackets(prev => [
                  ...prev.filter(p => p.id === "dh3"),
                  { id: "dh4", from: pccLoc, to: center, color: "text-zinc-250", delay: 0, duration: 0.8, status: "pending", label: "DHCP Ack" }
                ]);

                setTimeout(() => {
                  setPackets(prev => [
                    ...prev.map(p => p.id === "dh4" ? { ...p, status: "arrived" as const } : p),
                    { id: "dh4_fwd", from: center, to: pcaLoc, color: "text-zinc-250", delay: 0, duration: 0.8, status: "pending" }
                  ]);

                  // Complete assignment
                  setTimeout(() => {
                    setNodes(prev => ({
                      ...prev,
                      "PC A": { ...prev["PC A"], status: "accepted", ip: "192.168.1.50" },
                      "PC C": { ...prev["PC C"], status: "accepted" }
                    }));
                    setDhcpLeases(prev => {
                      const updated = prev.filter(e => e.client !== "PC A");
                      updated.push({ client: "PC A", mac: "000A.0001.0001", ip: "192.168.1.50", lease: "86400s", status: "Active" });
                      return updated;
                    });
                    addLog("[PC A] DHCP lease configured! IP: 192.168.1.50 | Subnet: /24 | Gateway: 192.168.1.254 | DNS: 192.168.1.253");
                    setIsSimulating(false);
                  }, 900);

                }, 900);

              }, 900);

            }, 900);

          }, 900);

        }, 900);

      }, 900);

    }, 900);
  };

  const runDnsQuery = () => {
    if (isSimulating) return;
    
    // Check if PC A has an IP address (must not be 0.0.0.0)
    if (nodes["PC A"].ip === "0.0.0.0") {
      addLog("[Warning] PC A IP is 0.0.0.0. Host cannot communicate without an IP address! Run DHCP DORA first.");
      alert("PC A is currently unconfigured (0.0.0.0). Run the DHCP DORA Flow first to lease an IP address!");
      return;
    }

    resetSimulation();
    setIsSimulating(true);

    addLog("[DNS Resolution] PC A sending query for 'academy.cisco' to DNS Server 192.168.1.253");
    setNodes(prev => ({
      ...prev,
      "PC A": { ...prev["PC A"], status: "sending" }
    }));

    // Step 1: DNS Query PC A -> Switch -> DNS Server (PC D)
    setPackets([
      { id: "d1", from: pcaLoc, to: center, color: "text-zinc-250", delay: 0, duration: 0.8, status: "pending", label: "DNS Query (academy.cisco)" }
    ]);

    setTimeout(() => {
      setPackets(prev => [
        ...prev.map(p => p.id === "d1" ? { ...p, status: "arrived" as const } : p),
        { id: "d1_fwd", from: center, to: pcdLoc, color: "text-zinc-250", delay: 0, duration: 0.8, status: "pending" }
      ]);

      // Step 2: DNS Server Reply DNS Server -> Switch -> PC A
      setTimeout(() => {
        addLog("[DNS Server] Resolution complete. Host 'academy.cisco' is at IP 10.10.10.10.");
        setNodes(prev => ({
          ...prev,
          "PC D": { ...prev["PC D"], status: "accepted" }
        }));

        setPackets(prev => [
          ...prev.filter(p => p.id === "d1" || p.id === "d1_fwd"),
          { id: "d2", from: pcdLoc, to: center, color: "text-zinc-250", delay: 0, duration: 0.8, status: "pending", label: "DNS Resolve: 10.10.10.10" }
        ]);

        setTimeout(() => {
          setPackets(prev => [
            ...prev.map(p => p.id === "d2" ? { ...p, status: "arrived" as const } : p),
            { id: "d2_fwd", from: center, to: pcaLoc, color: "text-zinc-250", delay: 0, duration: 0.8, status: "pending" }
          ]);

          // Step 3: PC A HTTP GET PC A -> Switch -> Web Server (PC B)
          setTimeout(() => {
            addLog("[PC A] IP address resolved. Initiating HTTP GET connection to 10.10.10.10.");
            setNodes(prev => ({
              ...prev,
              "PC A": { ...prev["PC A"], status: "sending" }
            }));

            setPackets([
              { id: "h1", from: pcaLoc, to: center, color: "text-emerald-400", delay: 0, duration: 0.8, status: "pending", label: "HTTP GET" }
            ]);

            setTimeout(() => {
              setPackets(prev => [
                ...prev.map(p => p.id === "h1" ? { ...p, status: "arrived" as const } : p),
                { id: "h1_fwd", from: center, to: pcbLoc, color: "text-emerald-400", delay: 0, duration: 0.8, status: "pending" }
              ]);

              // Step 4: Web Server HTTP 200 OK Web Server -> Switch -> PC A
              setTimeout(() => {
                addLog("[Web Server] HTTP Request matching local socket. Returning index page HTTP 200 OK.");
                setNodes(prev => ({
                  ...prev,
                  "PC B": { ...prev["PC B"], status: "accepted" }
                }));

                setPackets(prev => [
                  ...prev.filter(p => p.id === "h1" || p.id === "h1_fwd"),
                  { id: "h2", from: pcbLoc, to: center, color: "text-emerald-400", delay: 0, duration: 0.8, status: "pending", label: "HTTP 200 OK (Webpage)" }
                ]);

                setTimeout(() => {
                  setPackets(prev => [
                    ...prev.map(p => p.id === "h2" ? { ...p, status: "arrived" as const } : p),
                    { id: "h2_fwd", from: center, to: pcaLoc, color: "text-emerald-400", delay: 0, duration: 0.8, status: "pending" }
                  ]);

                  // Step 5: Completed
                  setTimeout(() => {
                    setNodes(prev => ({
                      ...prev,
                      "PC A": { ...prev["PC A"], status: "accepted" }
                    }));
                    addLog("[PC A] Web application rendered! Dynamic network services verified.");
                    setIsSimulating(false);
                  }, 900);

                }, 900);

              }, 900);

            }, 900);

          }, 900);

        }, 900);

      }, 900);

    }, 900);
  };

  // ─── Networking Cast Simulations ───────────────────────────────────────────

  // Unicast: A → Router → B only
  const runUnicastSim = () => {
    if (isSimulating) return;
    resetSimulation();
    setIsSimulating(true);
    addLog("[Unicast] PC A initiating point-to-point unicast to 10.0.0.10 (PC B)...");
    addLog("[Router] Performing longest-prefix match on destination IP 10.0.0.10 → via Fa0/1");
    setNodes(prev => ({ ...prev, "PC A": { ...prev["PC A"], status: "sending" } }));
    setPackets([{ id: "u1", from: pcaLoc, to: center, color: "text-violet-400", delay: 0, duration: 1.0, status: "pending", label: "Dst: 10.0.0.10" }]);
    setTimeout(() => {
      addLog("[Router] Route matched. Unicast forwarding to PC B (10.0.0.10) only.");
      addLog("[PC C, PC D] No copy delivered — unicast is one-to-one.");
      setNodes(prev => ({ ...prev, "Central Device": { ...prev["Central Device"], status: "sending" } }));
      setPackets(prev => [
        ...prev.map(p => p.id === "u1" ? { ...p, status: "arrived" as const } : p),
        { id: "u2", from: center, to: pcbLoc, color: "text-violet-400", delay: 0, duration: 1.0, status: "pending", label: "→ PC B only" }
      ]);
      setTimeout(() => {
        setNodes(prev => ({
          ...prev,
          "PC A": { ...prev["PC A"], status: "accepted" },
          "PC B": { ...prev["PC B"], status: "accepted" },
          "Central Device": { ...prev["Central Device"], status: "accepted" },
        }));
        addLog("[PC B] Frame received and accepted! Unicast delivery complete.");
        addLog("[PC C & PC D] Not addressed — silently ignored.");
        setIsSimulating(false);
      }, 1100);
    }, 1100);
  };

  // Broadcast: A → Switch → B, C, D all receive
  const runBroadcastSim = () => {
    if (isSimulating) return;
    resetSimulation();
    setIsSimulating(true);
    addLog("[Broadcast] PC A sending broadcast frame — Dst MAC: FF:FF:FF:FF:FF:FF, Dst IP: 255.255.255.255");
    addLog("[Switch] Broadcast received — flooding out of ALL ports in broadcast domain.");
    setNodes(prev => ({ ...prev, "PC A": { ...prev["PC A"], status: "sending" } }));
    setPackets([{ id: "b1", from: pcaLoc, to: center, color: "text-amber-400", delay: 0, duration: 0.9, status: "pending", label: "FF:FF:FF:FF:FF:FF" }]);
    setTimeout(() => {
      setNodes(prev => ({ ...prev, "Central Device": { ...prev["Central Device"], status: "sending" } }));
      setPackets(prev => [
        ...prev.map(p => p.id === "b1" ? { ...p, status: "arrived" as const } : p),
        { id: "bB", from: center, to: pcbLoc, color: "text-amber-400", delay: 0, duration: 0.9, status: "pending" },
        { id: "bC", from: center, to: pccLoc, color: "text-amber-400", delay: 0, duration: 0.9, status: "pending" },
        { id: "bD", from: center, to: pcdLoc, color: "text-amber-400", delay: 0, duration: 0.9, status: "pending" },
      ]);
      setTimeout(() => {
        setNodes(prev => ({
          ...prev,
          "PC A": { ...prev["PC A"], status: "accepted" },
          "PC B": { ...prev["PC B"], status: "accepted" },
          "PC C": { ...prev["PC C"], status: "accepted" },
          "PC D": { ...prev["PC D"], status: "accepted" },
          "Central Device": { ...prev["Central Device"], status: "accepted" },
        }));
        addLog("[PC B, PC C, PC D] Broadcast received! All L3 stacks process the frame.");
        addLog("[Note] Every device in the broadcast domain consumed CPU time — no targeting.");
        setIsSimulating(false);
      }, 1000);
    }, 1000);
  };

  // Multicast: A → Mcast Router → B and C only (D not subscribed)
  const runMulticastSim = () => {
    if (isSimulating) return;
    resetSimulation();
    setIsSimulating(true);
    addLog("[Multicast] PC A sending stream to multicast group 224.0.0.5 (OSPF Hello).");
    addLog("[IGMP] PC B and PC C subscribed via IGMPv3 Join. PC D has NOT joined.");
    setNodes(prev => ({ ...prev, "PC A": { ...prev["PC A"], status: "sending" } }));
    setPackets([{ id: "m1", from: pcaLoc, to: center, color: "text-teal-400", delay: 0, duration: 0.9, status: "pending", label: "Grp: 224.0.0.5" }]);
    setTimeout(() => {
      addLog("[Mcast Router] Consulting IGMP membership table — forwarding to B and C only.");
      setNodes(prev => ({ ...prev, "Central Device": { ...prev["Central Device"], status: "sending" } }));
      setPackets(prev => [
        ...prev.map(p => p.id === "m1" ? { ...p, status: "arrived" as const } : p),
        { id: "mB", from: center, to: pcbLoc, color: "text-teal-400", delay: 0, duration: 0.9, status: "pending", label: "Subscribed ✓" },
        { id: "mC", from: center, to: pccLoc, color: "text-teal-400", delay: 0, duration: 0.9, status: "pending", label: "Subscribed ✓" },
      ]);
      setTimeout(() => {
        setNodes(prev => ({
          ...prev,
          "PC A": { ...prev["PC A"], status: "accepted" },
          "PC B": { ...prev["PC B"], status: "accepted" },
          "PC C": { ...prev["PC C"], status: "accepted" },
          "PC D": { ...prev["PC D"], status: "rejected" },
          "Central Device": { ...prev["Central Device"], status: "accepted" },
        }));
        addLog("[PC B] Multicast frame received! Stream playback started.");
        addLog("[PC C] Multicast frame received! Stream playback started.");
        addLog("[PC D] Not in group 224.0.0.5 — packet NOT forwarded. Bandwidth conserved!");
        setIsSimulating(false);
      }, 1000);
    }, 1000);
  };

  // Anycast: A → Router → nearest server (B) wins by lowest metric
  const runAnyCastSim = () => {
    if (isSimulating) return;
    resetSimulation();
    setIsSimulating(true);
    addLog("[Anycast] PC A querying anycast IP 203.0.113.1 (shared by PC B, PC C, PC D).");
    addLog("[Router] Evaluating routing table metrics: PC B=1 hop, PC C=3 hops, PC D=5 hops.");
    setNodes(prev => ({ ...prev, "PC A": { ...prev["PC A"], status: "sending" } }));
    setPackets([{ id: "a1", from: pcaLoc, to: center, color: "text-pink-400", delay: 0, duration: 1.0, status: "pending", label: "Dst: 203.0.113.1" }]);
    setTimeout(() => {
      addLog("[Router] Best route → PC B (metric 1). Routing packet to NEAREST anycast node.");
      setNodes(prev => ({ ...prev, "Central Device": { ...prev["Central Device"], status: "sending" } }));
      setPackets(prev => [
        ...prev.map(p => p.id === "a1" ? { ...p, status: "arrived" as const } : p),
        { id: "a2", from: center, to: pcbLoc, color: "text-pink-400", delay: 0, duration: 1.0, status: "pending", label: "Nearest (1 hop)" },
      ]);
      setTimeout(() => {
        setNodes(prev => ({
          ...prev,
          "PC A": { ...prev["PC A"], status: "accepted" },
          "PC B": { ...prev["PC B"], status: "accepted" },
          "PC C": { ...prev["PC C"], status: "rejected" },
          "PC D": { ...prev["PC D"], status: "rejected" },
          "Central Device": { ...prev["Central Device"], status: "accepted" },
        }));
        addLog("[PC B] Anycast request served! Lowest metric server responded.");
        addLog("[PC C & PC D] Same anycast IP, but farther away — not selected by router.");
        addLog("[Use cases] DNS root servers, CDN edge nodes, IPv6 mandatory anycast.");
        setIsSimulating(false);
      }, 1100);
    }, 1100);
  };

  // Mouse Drag and Drop Handlers
  const handleMouseDown = (nodeName: string) => {
    if (cableMode) {
      // Cabling click flow
      if (!cableSource) {
        setCableSource(nodeName);
        addLog(`[Cable Tool] Start point selected: ${nodeName}. Click destination device to connect.`);
      } else {
        if (cableSource === nodeName) {
          addLog(`[Cable Tool] Cancelled. Start and destination cannot be the same device.`);
          setCableSource(null);
          setCableMode(false);
          return;
        }
        // Add link
        const exists = links.some(l => 
          (l.from === cableSource && l.to === nodeName) || 
          (l.from === nodeName && l.to === cableSource)
        );
        if (exists) {
          addLog(`[Cable Tool] Link already exists between ${cableSource} and ${nodeName}.`);
        } else {
          setLinks(prev => [...prev, { from: cableSource, to: nodeName }]);
          addLog(`[Cable Tool] Cable connected successfully: ${cableSource} <---> ${nodeName}`);
        }
        setCableSource(null);
        setCableMode(false);
      }
    } else {
      // Normal drag flow
      setDraggingNode(nodeName);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;
    
    // Always track mouse position for cursor cabling line
    setMousePos({ x: Math.round(rawX), y: Math.round(rawY) });

    if (!draggingNode) return;

    // Constrain coordinates to canvas bounds
    const x = Math.min(Math.max(Math.round(rawX), 40), rect.width - 40);
    const y = Math.min(Math.max(Math.round(rawY), 40), rect.height - 40);

    setNodes(prev => {
      if (!prev[draggingNode]) return prev;
      return {
        ...prev,
        [draggingNode]: {
          ...prev[draggingNode],
          x,
          y
        }
      };
    });
  };

  const handleMouseUp = () => {
    setDraggingNode(null);
  };

  const spawnServer = () => {
    if (serverSpawned) return;
    setServerSpawned(true);
    addLog("[Toolbox] CCNA Server spawned on canvas. Move it and connect a cable to the L2 Switch.");
  };

  const toggleCableMode = () => {
    setCableMode(!cableMode);
    setCableSource(null);
    addLog(`[Cable Tool] Cable Connection mode toggled ${!cableMode ? "ON" : "OFF"}. Click first node, then second node.`);
  };

  // Server Testing Simulator Logic
  const runServerDhcpTest = () => {
    if (isSimulating) return;
    resetSimulation();
    
    // Check link between Server and L2 Switch
    const isLinked = links.some(l => 
      (l.from === "Server" && l.to === "L2 Switch") || 
      (l.from === "L2 Switch" && l.to === "Server")
    );

    if (!serverSpawned) {
      addLog("[Error] Server is not spawned! Drag or add the server from the toolbox first.");
      alert("Please spawn the Server from the toolbox first!");
      return;
    }

    if (!isLinked) {
      addLog("[Link Error] Discover Packet Dropped. No physical cable connects the Switch and the Server.");
      alert("Physical Link is DOWN! Use the Cable Tool to connect the L2 Switch and the Server.");
      
      // Animate PC A sending discover, dropping at Switch
      setIsSimulating(true);
      setNodes(prev => ({ ...prev, "PC A": { ...prev["PC A"], status: "sending" } }));
      const pcaLocCurrent = getNodeLoc("PC A");
      setPackets([{ id: "dh_err", from: pcaLocCurrent, to: center, color: "text-amber-500", delay: 0, duration: 0.8, status: "pending", label: "DHCP Discover" }]);
      
      setTimeout(() => {
        setPackets([]);
        setNodes(prev => ({
          ...prev,
          "PC A": { ...prev["PC A"], status: "collided" }
        }));
        addLog("[L2 Switch] Discover broadcast received, but no DHCP Server is cabled. Packet discarded.");
        setIsSimulating(false);
      }, 950);
      return;
    }

    setIsSimulating(true);
    addLog("[DHCP Test] Client PC A sending DHCP Discover broadcast...");
    setNodes(prev => ({
      ...prev,
      "PC A": { ...prev["PC A"], status: "sending", ip: "0.0.0.0" }
    }));

    const pcaLocCurrent = getNodeLoc("PC A");
    const serverLocCurrent = getNodeLoc("Server");

    // Discover: PC A -> Switch -> Server
    setPackets([
      { id: "s_dh1", from: pcaLocCurrent, to: center, color: "text-amber-500", delay: 0, duration: 0.8, status: "pending", label: "DHCP Discover" }
    ]);

    setTimeout(() => {
      addLog("[L2 Switch] Flooding Discover broadcast out of all ports...");
      setPackets(prev => [
        ...prev.map(p => p.id === "s_dh1" ? { ...p, status: "arrived" as const } : p),
        { id: "s_dh1_fwd", from: center, to: serverLocCurrent, color: "text-amber-500", delay: 0, duration: 0.8, status: "pending" }
      ]);

      setTimeout(() => {
        // Check if DHCP Service is enabled on Server
        if (!dhcpEnabled) {
          addLog("[DHCP Error] Server received Discover, but DHCP Service is OFF. Request dropped.");
          setNodes(prev => ({
            ...prev,
            "PC A": { ...prev["PC A"], status: "rejected" },
            "Server": { ...prev["Server"], status: "rejected" }
          }));
          setIsSimulating(false);
          return;
        }

        addLog(`[DHCP Server] Request verified. Offering IP address ${dhcpStart} from lease pool.`);
        setNodes(prev => ({
          ...prev,
          "Server": { ...prev["Server"], status: "sending" }
        }));

        // Offer: Server -> Switch -> PC A
        setPackets([
          { id: "s_dh2", from: serverLocCurrent, to: center, color: "text-zinc-250", delay: 0, duration: 0.8, status: "pending", label: `DHCP Offer: ${dhcpStart}` }
        ]);

        setTimeout(() => {
          setPackets(prev => [
            ...prev.map(p => p.id === "s_dh2" ? { ...p, status: "arrived" as const } : p),
            { id: "s_dh2_fwd", from: center, to: pcaLocCurrent, color: "text-zinc-250", delay: 0, duration: 0.8, status: "pending" }
          ]);

          // Request: PC A -> Switch -> Server
          setTimeout(() => {
            addLog(`[PC A] Offer received. Requesting lease confirmation for ${dhcpStart}...`);
            setNodes(prev => ({
              ...prev,
              "PC A": { ...prev["PC A"], status: "sending" },
              "Server": { ...prev["Server"], status: "idle" }
            }));

            setPackets([
              { id: "s_dh3", from: pcaLocCurrent, to: center, color: "text-amber-500", delay: 0, duration: 0.8, status: "pending", label: "DHCP Request" }
            ]);

            setTimeout(() => {
              setPackets(prev => [
                ...prev.map(p => p.id === "s_dh3" ? { ...p, status: "arrived" as const } : p),
                { id: "s_dh3_fwd", from: center, to: serverLocCurrent, color: "text-amber-500", delay: 0, duration: 0.8, status: "pending" }
              ]);

              // ACK: Server -> Switch -> PC A
              setTimeout(() => {
                addLog("[DHCP Server] Committing lease. Sending DHCP Acknowledgment.");
                setNodes(prev => ({
                  ...prev,
                  "Server": { ...prev["Server"], status: "sending" }
                }));

                setPackets([
                  { id: "s_dh4", from: serverLocCurrent, to: center, color: "text-zinc-250", delay: 0, duration: 0.8, status: "pending", label: "DHCP Ack" }
                ]);

                setTimeout(() => {
                  setPackets(prev => [
                    ...prev.map(p => p.id === "s_dh4" ? { ...p, status: "arrived" as const } : p),
                    { id: "s_dh4_fwd", from: center, to: pcaLocCurrent, color: "text-zinc-250", delay: 0, duration: 0.8, status: "pending" }
                  ]);

                  // Complete assignment
                  setTimeout(() => {
                    setNodes(prev => ({
                      ...prev,
                      "PC A": { ...prev["PC A"], status: "accepted", ip: dhcpStart },
                      "Server": { ...prev["Server"], status: "accepted" }
                    }));
                    setDhcpLeases(prev => {
                      const updated = prev.filter(e => e.client !== "PC A");
                      updated.push({ client: "PC A", mac: "000A.0001.0001", ip: dhcpStart, lease: "86400s", status: "Active" });
                      return updated;
                    });
                    addLog(`[PC A] DHCP Lease successful! Assigned IP: ${dhcpStart} | Mask: 255.255.255.0 | Gateway: ${serverGateway} | DNS: ${serverIp}`);
                    setIsSimulating(false);
                  }, 900);

                }, 900);

              }, 900);

            }, 900);

          }, 900);

        }, 900);

      }, 900);

    }, 900);
  };

  const runServerDnsTest = () => {
    if (isSimulating) return;

    if (nodes["PC A"].ip === "0.0.0.0") {
      addLog("[Warning] PC A IP is 0.0.0.0. Client needs an IP address before resolving DNS. Run DHCP first.");
      alert("PC A is currently unconfigured. Please run the DHCP DORA Flow first to lease an IP address!");
      return;
    }

    resetSimulation();
    
    // Check link between Server and L2 Switch
    const isLinked = links.some(l => 
      (l.from === "Server" && l.to === "L2 Switch") || 
      (l.from === "L2 Switch" && l.to === "Server")
    );

    if (!isLinked) {
      addLog("[Link Error] DNS Query dropped. Server is disconnected from L2 Switch.");
      alert("Physical Link is DOWN! Cable the Server to L2 Switch first.");
      return;
    }

    setIsSimulating(true);
    addLog("[DNS Resolution] PC A querying DNS for 'academy.cisco'...");
    setNodes(prev => ({
      ...prev,
      "PC A": { ...prev["PC A"], status: "sending" }
    }));

    const pcaLocCurrent = getNodeLoc("PC A");
    const serverLocCurrent = getNodeLoc("Server");

    // DNS Request PC A -> Switch -> Server
    setPackets([
      { id: "s_d1", from: pcaLocCurrent, to: center, color: "text-zinc-250", delay: 0, duration: 0.8, status: "pending", label: "DNS Query: academy.cisco" }
    ]);

    setTimeout(() => {
      setPackets(prev => [
        ...prev.map(p => p.id === "s_d1" ? { ...p, status: "arrived" as const } : p),
        { id: "s_d1_fwd", from: center, to: serverLocCurrent, color: "text-zinc-250", delay: 0, duration: 0.8, status: "pending" }
      ]);

      setTimeout(() => {
        // Check DNS service
        if (!dnsEnabled) {
          addLog("[DNS Error] Server received query, but DNS Service is disabled. Drop.");
          setNodes(prev => ({
            ...prev,
            "PC A": { ...prev["PC A"], status: "rejected" },
            "Server": { ...prev["Server"], status: "rejected" }
          }));
          setIsSimulating(false);
          return;
        }

        // Look up records
        const record = dnsRecords.find(r => r.domain === "academy.cisco");
        if (!record) {
          addLog("[DNS Resolution Fail] No record match found for 'academy.cisco'.");
          setNodes(prev => ({
            ...prev,
            "PC A": { ...prev["PC A"], status: "rejected" },
            "Server": { ...prev["Server"], status: "accepted" }
          }));
          setIsSimulating(false);
          return;
        }

        addLog(`[DNS Server] Name resolved! 'academy.cisco' matches IP ${record.ip}. Returning A-record response.`);
        setNodes(prev => ({
          ...prev,
          "Server": { ...prev["Server"], status: "sending" }
        }));

        // DNS Response Server -> Switch -> PC A
        setPackets([
          { id: "s_d2", from: serverLocCurrent, to: center, color: "text-zinc-250", delay: 0, duration: 0.8, status: "pending", label: `A-Record: ${record.ip}` }
        ]);

        setTimeout(() => {
          setPackets(prev => [
            ...prev.map(p => p.id === "s_d2" ? { ...p, status: "arrived" as const } : p),
            { id: "s_d2_fwd", from: center, to: pcaLocCurrent, color: "text-zinc-250", delay: 0, duration: 0.8, status: "pending" }
          ]);

          setTimeout(() => {
            setNodes(prev => ({
              ...prev,
              "PC A": { ...prev["PC A"], status: "accepted" },
              "Server": { ...prev["Server"], status: "accepted" }
            }));
            addLog("[PC A] DNS name resolution complete. A-record stored in local cache.");
            setIsSimulating(false);
          }, 900);

        }, 900);

      }, 900);

    }, 900);
  };

  const runServerHttpTest = () => {
    if (isSimulating) return;

    if (nodes["PC A"].ip === "0.0.0.0") {
      addLog("[Warning] PC A IP is 0.0.0.0. Web request requires an IP address. Run DHCP first.");
      alert("PC A is currently unconfigured. Run the DHCP DORA Flow first to lease an IP address!");
      return;
    }

    resetSimulation();
    
    // Check link between Server and L2 Switch
    const isLinked = links.some(l => 
      (l.from === "Server" && l.to === "L2 Switch") || 
      (l.from === "L2 Switch" && l.to === "Server")
    );

    if (!isLinked) {
      addLog("[Link Error] HTTP Connection dropped. Physical link is down.");
      alert("Physical Link is DOWN! Connect the Server to the Switch first.");
      return;
    }

    setIsSimulating(true);
    addLog(`[HTTP Web Request] PC A sending TCP SYN / HTTP GET to Web Server (${serverIp}:80)...`);
    setNodes(prev => ({
      ...prev,
      "PC A": { ...prev["PC A"], status: "sending" }
    }));

    const pcaLocCurrent = getNodeLoc("PC A");
    const serverLocCurrent = getNodeLoc("Server");

    // HTTP Request PC A -> Switch -> Server
    setPackets([
      { id: "s_h1", from: pcaLocCurrent, to: center, color: "text-emerald-400", delay: 0, duration: 0.8, status: "pending", label: "HTTP GET" }
    ]);

    setTimeout(() => {
      setPackets(prev => [
        ...prev.map(p => p.id === "s_h1" ? { ...p, status: "arrived" as const } : p),
        { id: "s_h1_fwd", from: center, to: serverLocCurrent, color: "text-emerald-400", delay: 0, duration: 0.8, status: "pending" }
      ]);

      setTimeout(() => {
        // Check HTTP Service status
        if (!httpEnabled) {
          addLog(`[HTTP Error] Connection refused on port 80. HTTP Service is OFF.`);
          setNodes(prev => ({
            ...prev,
            "PC A": { ...prev["PC A"], status: "collided" },
            "Server": { ...prev["Server"], status: "rejected" }
          }));
          setIsSimulating(false);
          return;
        }

        addLog(`[HTTP Server] HTTP GET accepted. Serving configured home page index.html.`);
        setNodes(prev => ({
          ...prev,
          "Server": { ...prev["Server"], status: "sending" }
        }));

        // HTTP GET Reply Server -> Switch -> PC A
        setPackets([
          { id: "s_h2", from: serverLocCurrent, to: center, color: "text-emerald-400", delay: 0, duration: 0.8, status: "pending", label: "HTTP 200 OK (index.html)" }
        ]);

        setTimeout(() => {
          setPackets(prev => [
            ...prev.map(p => p.id === "s_h2" ? { ...p, status: "arrived" as const } : p),
            { id: "s_h2_fwd", from: center, to: pcaLocCurrent, color: "text-emerald-400", delay: 0, duration: 0.8, status: "pending" }
          ]);

          setTimeout(() => {
            setNodes(prev => ({
              ...prev,
              "PC A": { ...prev["PC A"], status: "accepted" },
              "Server": { ...prev["Server"], status: "accepted" }
            }));
            addLog(`[PC A] HTTP Response resolved. Page Render: "${httpHtml}"`);
            alert(`[PC A - Web Browser]\nSuccessfully loaded index.html from ${serverIp}:\n\n${httpHtml.replace(/<[^>]*>/g, "")}`);
            setIsSimulating(false);
          }, 900);

        }, 900);

      }, 900);

    }, 900);
  };

  const getThemeColor = () => {
    if (mode === "hub") return { hex: "#f59e0b", border: "border-amber-500/20", glow: "shadow-[0_0_30px_rgba(245,158,11,0.04)]", text: "text-amber-400" };
    if (["switch", "bridge", "vlan"].includes(mode)) return { hex: "#0ea5e9", border: "border-sky-500/20", glow: "shadow-[0_0_30px_rgba(14,165,233,0.04)]", text: "text-sky-400" };
    if (["router", "nat", "unicast"].includes(mode)) return { hex: "#a855f7", border: "border-violet-500/20", glow: "shadow-[0_0_30px_rgba(168,85,247,0.04)]", text: "text-violet-400" };
    if (mode === "broadcast") return { hex: "#f97316", border: "border-orange-500/20", glow: "shadow-[0_0_30px_rgba(249,115,22,0.04)]", text: "text-orange-400" };
    if (mode === "multicast") return { hex: "#14b8a6", border: "border-teal-500/20", glow: "shadow-[0_0_30px_rgba(20,184,166,0.04)]", text: "text-teal-400" };
    if (mode === "anycast") return { hex: "#ec4899", border: "border-pink-500/20", glow: "shadow-[0_0_30px_rgba(236,72,153,0.04)]", text: "text-pink-400" };
    return { hex: "#10b981", border: "border-emerald-500/20", glow: "shadow-[0_0_30px_rgba(16,185,129,0.04)]", text: "text-emerald-400" };
  };
  
  const theme = getThemeColor();

  return (
    <div className="flex w-full h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-zinc-800/80 px-6 flex items-center justify-between bg-zinc-900/40 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-base text-zinc-200">Network Devices Lab</h2>
          </div>
          
          <div className="flex bg-zinc-900/60 p-1 rounded-xl border border-zinc-700/50">
            <button
              onClick={() => setActiveTab("simulator")}
              className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                activeTab === "simulator" 
                  ? "bg-zinc-950 text-white font-bold border border-zinc-800/50 shadow-sm" 
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Interactive Simulator
            </button>
            <button
              onClick={() => setActiveTab("notebook")}
              className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                activeTab === "notebook" 
                  ? "bg-zinc-950 text-white font-bold border border-zinc-800/50 shadow-sm" 
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Study Notebook
            </button>
          </div>
        </header>

        {/* Tab Contents */}
        <div className="flex-1 p-6 max-w-6xl mx-auto w-full flex flex-col gap-6 overflow-hidden min-h-0">
          {activeTab === "simulator" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden min-h-0">
              
              {/* Simulator Column */}
              <div className={`lg:col-span-2 flex flex-col bg-zinc-900/25 border ${theme.border} ${theme.glow} rounded-2xl p-6 glow-card transition-all duration-500 overflow-hidden min-h-0 relative`}>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-extrabold text-sm tracking-wide text-zinc-100 flex items-center gap-2">
                      Devices Simulation Canvas
                      <span className={`px-2 py-0.5 rounded text-xs font-extrabold uppercase border ${theme.border} ${theme.text} bg-zinc-950/80`}>
                        {mode === "hub" ? "Layer 1" : ["switch", "bridge", "vlan", "broadcast"].includes(mode) ? "Layer 2" : ["router", "nat", "unicast", "multicast", "anycast"].includes(mode) ? "Layer 3" : "Layer 7"}
                      </span>
                    </h3>
                    <p className="text-sm text-zinc-400 mt-1">
                      Visualize data routing, flooding, filtering, firewall rules, and CAPWAP tunneling in real-time.
                    </p>
                  </div>
                  <button 
                    onClick={resetSimulation}
                    className="p-2 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-850 rounded-xl transition-all"
                    title="Reset Simulator"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                {/* Canvas Area */}
                <div 
                  className={`relative h-[340px] shrink-0 border ${theme.border} bg-zinc-950/80 rounded-xl overflow-hidden flex items-center justify-center p-4 blueprint-canvas transition-all duration-500 mb-4 ${
                    mode === "server" 
                      ? cableMode 
                        ? "cursor-crosshair" 
                        : draggingNode 
                          ? "cursor-grabbing" 
                          : "cursor-default"
                      : ""
                  }`}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  {/* Grid overlay */}
                  <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

                  {/* Segment boundary overlay */}
                  {mode === "bridge" && (
                    <div className="absolute inset-y-0 left-1/2 w-0.5 border-l border-dashed border-zinc-800 flex items-center justify-center pointer-events-none">
                      <span className="absolute top-2 -translate-x-1/2 bg-zinc-900 text-xs font-bold text-zinc-500 px-2 py-0.5 rounded border border-zinc-855 uppercase tracking-wider">
                        Segment Boundary
                      </span>
                    </div>
                  )}

                  {/* Router Subnet Divider */}
                  {mode === "router" && (
                    <div className="absolute inset-y-0 left-1/2 w-0.5 border-l border-dashed border-zinc-800 flex items-center justify-center pointer-events-none">
                      <span className="absolute top-2 -translate-x-1/2 bg-zinc-900 text-xs font-bold text-zinc-500 px-2.5 py-0.5 rounded border border-zinc-850 uppercase tracking-wider">
                        Subnet Boundary
                      </span>
                      <span className="absolute bottom-4 left-4 -translate-x-full text-xs text-zinc-500 font-bold bg-zinc-900/60 px-2 py-0.5 rounded border border-zinc-850">
                        Subnet A: 192.168.1.0/24
                      </span>
                      <span className="absolute bottom-4 right-4 translate-x-full text-xs text-zinc-500 font-bold bg-zinc-900/60 px-2 py-0.5 rounded border border-zinc-850">
                        Subnet B: 10.0.0.0/24
                      </span>
                    </div>
                  )}

                  {/* WLC Wireless Boundary */}
                  {mode === "wlc" && (
                    <div className="absolute inset-y-0 left-1/4 w-0.5 border-l border-dashed border-zinc-800/40 flex items-center justify-center pointer-events-none">
                      <span className="absolute top-2 -translate-x-1/2 bg-zinc-900 text-xs font-bold text-zinc-500 px-2 py-0.5 rounded border border-zinc-850 uppercase tracking-wider">
                        Wireless Boundary
                      </span>
                    </div>
                  )}

                  {/* SVG paths representing Ethernet connections */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {/* Connections */}
                    {(() => {
                      const isLinkActive = (x1: number, y1: number, x2: number, y2: number) => {
                        return isSimulating && packets.some(p => p.status === "pending" && 
                          ((p.from[0] === x1 && p.from[1] === y1 && p.to[0] === x2 && p.to[1] === y2) ||
                           (p.from[0] === x2 && p.from[1] === y2 && p.to[0] === x1 && p.to[1] === y1)));
                      };

                      if (mode === "wlc") {
                        const activeAP = isLinkActive(pccLoc[0], pccLoc[1], center[0], center[1]);
                        const activeWLC = isLinkActive(pcbLoc[0], pcbLoc[1], center[0], center[1]);
                        const activeServer = isLinkActive(pcdLoc[0], pcdLoc[1], center[0], center[1]);
                        return (
                          <>
                            {/* Laptop A to AP wireless wave connection */}
                            <line x1={pcaLoc[0]} y1={pcaLoc[1]} x2={pccLoc[0]} y2={pccLoc[1]} stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 2" className="animate-wireless opacity-75" />
                            <circle cx={(pcaLoc[0] + pccLoc[0]) / 2} cy={(pcaLoc[1] + pccLoc[1]) / 2} r="12" stroke="#10b981" strokeWidth="1" fill="none" opacity="0.3" className="animate-ring-pulse" />
                            <circle cx={(pcaLoc[0] + pccLoc[0]) / 2} cy={(pcaLoc[1] + pccLoc[1]) / 2} r="24" stroke="#10b981" strokeWidth="1" fill="none" opacity="0.15" className="animate-ring-pulse" style={{ animationDelay: "1s" }} />
                            
                            {/* Physical lines to Switch */}
                            {/* AP to Switch */}
                            <g>
                              {activeAP && <line x1={pccLoc[0]} y1={pccLoc[1]} x2={center[0]} y2={center[1]} stroke="#10b981" strokeWidth="6" opacity="0.15" />}
                              <line x1={pccLoc[0]} y1={pccLoc[1]} x2={center[0]} y2={center[1]} stroke={activeAP ? "#10b981" : "#71717a"} strokeWidth={activeAP ? "2.5" : "2"} className={activeAP ? "animate-data-flow" : ""} />
                            </g>
                            {/* WLC to Switch */}
                            <g>
                              {activeWLC && <line x1={pcbLoc[0]} y1={pcbLoc[1]} x2={center[0]} y2={center[1]} stroke="#10b981" strokeWidth="6" opacity="0.15" />}
                              <line x1={pcbLoc[0]} y1={pcbLoc[1]} x2={center[0]} y2={center[1]} stroke={activeWLC ? "#10b981" : "#71717a"} strokeWidth={activeWLC ? "2.5" : "2"} className={activeWLC ? "animate-data-flow" : ""} />
                            </g>
                            {/* Server to Switch */}
                            <g>
                              {activeServer && <line x1={pcdLoc[0]} y1={pcdLoc[1]} x2={center[0]} y2={center[1]} stroke="#10b981" strokeWidth="6" opacity="0.15" />}
                              <line x1={pcdLoc[0]} y1={pcdLoc[1]} x2={center[0]} y2={center[1]} stroke={activeServer ? "#10b981" : "#71717a"} strokeWidth={activeServer ? "2.5" : "2"} className={activeServer ? "animate-data-flow" : ""} />
                            </g>
                          </>
                        );
                      } else if (mode === "vlan") {
                        const isTrunkActive = isSimulating && packets.some(p => p.status === "pending" && 
                          ((p.from[0] === sw1Loc[0] && p.to[0] === sw2Loc[0]) || (p.from[0] === sw2Loc[0] && p.to[0] === sw1Loc[0])));
                        const actA = isLinkActive(pcaLoc[0], pcaLoc[1], sw1Loc[0], sw1Loc[1]);
                        const actC = isLinkActive(pccLoc[0], pccLoc[1], sw1Loc[0], sw1Loc[1]);
                        const actB = isLinkActive(pcbLoc[0], pcbLoc[1], sw2Loc[0], sw2Loc[1]);
                        const actD = isLinkActive(pcdLoc[0], pcdLoc[1], sw2Loc[0], sw2Loc[1]);
                        return (
                          <>
                            <g>
                              {actA && <line x1={pcaLoc[0]} y1={pcaLoc[1]} x2={sw1Loc[0]} y2={sw1Loc[1]} stroke="#0ea5e9" strokeWidth="6" opacity="0.15" />}
                              <line x1={pcaLoc[0]} y1={pcaLoc[1]} x2={sw1Loc[0]} y2={sw1Loc[1]} stroke={actA ? "#0ea5e9" : "#71717a"} strokeWidth={actA ? "2.5" : "2"} className={actA ? "animate-data-flow" : ""} />
                            </g>
                            <g>
                              {actC && <line x1={pccLoc[0]} y1={pccLoc[1]} x2={sw1Loc[0]} y2={sw1Loc[1]} stroke="#0ea5e9" strokeWidth="6" opacity="0.15" />}
                              <line x1={pccLoc[0]} y1={pccLoc[1]} x2={sw1Loc[0]} y2={sw1Loc[1]} stroke={actC ? "#0ea5e9" : "#71717a"} strokeWidth={actC ? "2.5" : "2"} className={actC ? "animate-data-flow" : ""} />
                            </g>
                            <g>
                              {actB && <line x1={pcbLoc[0]} y1={pcbLoc[1]} x2={sw2Loc[0]} y2={sw2Loc[1]} stroke="#0ea5e9" strokeWidth="6" opacity="0.15" />}
                              <line x1={pcbLoc[0]} y1={pcbLoc[1]} x2={sw2Loc[0]} y2={sw2Loc[1]} stroke={actB ? "#0ea5e9" : "#71717a"} strokeWidth={actB ? "2.5" : "2"} className={actB ? "animate-data-flow" : ""} />
                            </g>
                            <g>
                              {actD && <line x1={pcdLoc[0]} y1={pcdLoc[1]} x2={sw2Loc[0]} y2={sw2Loc[1]} stroke="#0ea5e9" strokeWidth="6" opacity="0.15" />}
                              <line x1={pcdLoc[0]} y1={pcdLoc[1]} x2={sw2Loc[0]} y2={sw2Loc[1]} stroke={actD ? "#0ea5e9" : "#71717a"} strokeWidth={actD ? "2.5" : "2"} className={actD ? "animate-data-flow" : ""} />
                            </g>
                            {/* Trunk line */}
                            <g>
                              {isTrunkActive && <line x1={sw1Loc[0]} y1={sw1Loc[1]} x2={sw2Loc[0]} y2={sw2Loc[1]} stroke="#0ea5e9" strokeWidth="8" opacity="0.25" />}
                              <line x1={sw1Loc[0]} y1={sw1Loc[1]} x2={sw2Loc[0]} y2={sw2Loc[1]} stroke={isTrunkActive ? "#0ea5e9" : "#71717a"} strokeWidth={isTrunkActive ? "3.5" : "2.5"} strokeDasharray="4 2" className={isTrunkActive ? "animate-data-flow" : ""} />
                            </g>
                          </>
                        );
                      } else if (mode === "server") {
                        const serverLinks = links.map((link, idx) => {
                          const [x1, y1] = getNodeLoc(link.from);
                          const [x2, y2] = getNodeLoc(link.to);
                          const isLineActive = isSimulating && packets.some(p => p.status === "pending" && 
                            ((p.from[0] === x1 && p.from[1] === y1 && p.to[0] === x2 && p.to[1] === y2) ||
                             (p.from[0] === x2 && p.from[1] === y2 && p.to[0] === x1 && p.to[1] === y1)));
                          return (
                            <g key={idx}>
                              {isLineActive && <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#10b981" strokeWidth="6" opacity="0.15" />}
                              <line
                                x1={x1}
                                y1={y1}
                                x2={x2}
                                y2={y2}
                                stroke={isLineActive ? "#10b981" : "#71717a"}
                                strokeWidth={isLineActive ? "2.5" : "2"}
                                className={isLineActive ? "animate-data-flow" : ""}
                              />
                            </g>
                          );
                        });
                        return (
                          <>
                            {serverLinks}
                            {/* Dynamic cursor cable line */}
                            {cableMode && cableSource && (
                              <g>
                                <line
                                  x1={nodes[cableSource]?.x}
                                  y1={nodes[cableSource]?.y}
                                  x2={mousePos.x}
                                  y2={mousePos.y}
                                  stroke="#10b981"
                                  strokeWidth="1.5"
                                  strokeDasharray="4 4"
                                />
                                <circle cx={mousePos.x} cy={mousePos.y} r="3" fill="#10b981" className="animate-ping" />
                              </g>
                            )}
                          </>
                        );
                      } else {
                        const themeColor = getThemeColor().hex;
                        return Object.values(nodes)
                          .filter(node => node.name !== "Central Device")
                          .map((node) => {
                            const [nlX, nlY] = getNodeLoc(node.name);
                            const isLineActive = isSimulating && 
                              packets.some(p => p.status === "pending" && 
                                ((p.from[0] === nlX && p.from[1] === nlY) || 
                                 (p.to[0] === nlX && p.to[1] === nlY)));

                            return (
                              <g key={node.name}>
                                {isLineActive && <line x1={nlX} y1={nlY} x2={center[0]} y2={center[1]} stroke={themeColor} strokeWidth="6" opacity="0.15" />}
                                <line
                                  x1={nlX}
                                  y1={nlY}
                                  x2={center[0]}
                                  y2={center[1]}
                                  stroke={isLineActive ? themeColor : "#71717a"}
                                  strokeWidth={isLineActive ? "2.5" : "2"}
                                  className={isLineActive ? "animate-data-flow" : ""}
                                />
                              </g>
                            );
                          });
                      }
                    })()}
                  </svg>

                  {/* Animated packets */}
                  {packets.map((pkt) => {
                    const style: React.CSSProperties = {
                      position: "absolute",
                      left: pkt.from[0],
                      top: pkt.from[1],
                      transform: "translate(-50%, -50%)",
                      transition: `all ${pkt.duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
                      transitionDelay: `${pkt.delay}s`,
                    };

                    return (
                      <div
                        key={pkt.id}
                        style={style}
                        className={`w-3 h-3 rounded-full flex items-center justify-center pointer-events-none z-10 ${pkt.color}`}
                        ref={(el) => {
                          if (el && isSimulating) {
                            requestAnimationFrame(() => {
                              el.style.left = `${pkt.to[0]}px`;
                              el.style.top = `${pkt.to[1]}px`;
                            });
                          }
                        }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-current relative">
                          {pkt.label && (
                            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-zinc-950 border border-zinc-800 text-xs font-bold text-zinc-300 px-1 py-0.5 rounded whitespace-nowrap shadow-md z-30">
                              {pkt.label}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Collision Explosion */}
                  {showCollision && (
                    <div 
                      className="absolute z-20 text-rose-500 pointer-events-none"
                      style={{ left: center[0], top: center[1], transform: "translate(-50%, -50%)" }}
                    >
                      <div className="w-12 h-12 rounded-full border border-rose-500 flex items-center justify-center animate-explosion">
                        <CollisionIcon size={24} className="text-rose-500" />
                      </div>
                    </div>
                  )}

                  {/* Firewall block alert indicator */}
                  {firewallBlocked && (
                    <div 
                      className="absolute z-20 text-rose-500 pointer-events-none"
                      style={{ left: center[0], top: center[1], transform: "translate(-50%, -50%)" }}
                    >
                      <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center animate-pulse">
                        <ShieldAlert className="w-5 h-5 text-rose-500" />
                      </div>
                    </div>
                  )}

                  {/* Devices UI Overlay */}
                  {mode !== "vlan" && mode !== "server" ? (
                    <div 
                      className="absolute flex flex-col items-center z-10 cursor-grab hover:scale-105 active:cursor-grabbing transition-transform select-none"
                      style={{ left: center[0], top: center[1], transform: "translate(-50%, -50%)" }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleMouseDown("Central Device");
                      }}
                    >
                      <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl flex items-center justify-center">
                        {mode === "hub" && <HubIcon size={38} className="text-zinc-200" />}
                        {mode === "switch" && <SwitchIcon size={38} className="text-zinc-200" />}
                        {mode === "bridge" && <BridgeIcon size={38} className="text-zinc-200" />}
                        {mode === "router" && <RouterIcon size={38} className="text-zinc-200" />}
                        {mode === "firewall" && <ShieldAlert size={38} className="text-zinc-400" />}
                        {mode === "wlc" && <Cpu size={38} className="text-zinc-200" />}
                        {mode === "nat" && <RouterIcon size={38} className="text-zinc-200" />}
                        {mode === "dhcp" && <SwitchIcon size={38} className="text-zinc-200" />}
                        {mode === "unicast" && <RouterIcon size={38} className="text-violet-400" />}
                        {mode === "broadcast" && <HubIcon size={38} className="text-amber-400" />}
                        {mode === "multicast" && <RouterIcon size={38} className="text-teal-400" />}
                        {mode === "anycast" && <RouterIcon size={38} className="text-pink-400" />}
                      </div>
                      <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-2 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-850">
                        {mode === "wlc" ? "L3 SWITCH" : mode === "nat" ? "NAT ROUTER" : mode === "dhcp" ? "L2 SWITCH" : mode === "multicast" ? "MCAST ROUTER" : mode === "anycast" ? "ROUTER" : mode === "broadcast" ? "SWITCH" : mode === "unicast" ? "ROUTER" : mode.toUpperCase()}
                      </span>
                    </div>
                  ) : mode === "vlan" ? (
                    <>
                      {/* Switch 1 */}
                      <div 
                        className="absolute flex flex-col items-center z-10 cursor-grab hover:scale-105 active:cursor-grabbing transition-transform select-none"
                        style={{ left: sw1Loc[0], top: sw1Loc[1], transform: "translate(-50%, -50%)" }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleMouseDown("Switch 1");
                        }}
                      >
                        <div className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl flex items-center justify-center">
                          <SwitchIcon size={28} className="text-zinc-200" />
                        </div>
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1 bg-zinc-950 px-1 py-0.5 rounded border border-zinc-850 whitespace-nowrap">
                          Switch 1
                        </span>
                      </div>
                      {/* Switch 2 */}
                      <div 
                        className="absolute flex flex-col items-center z-10 cursor-grab hover:scale-105 active:cursor-grabbing transition-transform select-none"
                        style={{ left: sw2Loc[0], top: sw2Loc[1], transform: "translate(-50%, -50%)" }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleMouseDown("Switch 2");
                        }}
                      >
                        <div className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl flex items-center justify-center">
                          <SwitchIcon size={28} className="text-zinc-200" />
                        </div>
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1 bg-zinc-950 px-1 py-0.5 rounded border border-zinc-850 whitespace-nowrap">
                          Switch 2
                        </span>
                      </div>
                    </>
                  ) : null}

                  {/* Endpoints PCs */}
                  {Object.values(nodes)
                    .filter(node => node.name !== "Central Device" && node.name !== "Switch 1" && node.name !== "Switch 2")
                    .map((node) => {
                      const statusColorMap = {
                        idle: "border-zinc-800 text-zinc-500 bg-zinc-950/40 hover:border-zinc-700",
                        sending: "border-white text-white bg-zinc-900/60 sending-glow animate-pulse",
                        accepted: "border-emerald-500/60 text-emerald-400 bg-emerald-950/20 accepted-glow",
                        rejected: "border-zinc-700/50 text-zinc-500 bg-zinc-950/30 rejected-glow",
                        collided: "border-rose-500/60 text-rose-400 bg-rose-950/20 collided-glow"
                      };

                      // Hide Server node if not spawned yet in server mode
                      if (mode === "server" && node.name === "Server" && !serverSpawned) {
                        return null;
                      }

                      const isNodeIdle = node.status === "idle" && !isSimulating;
                      return (
                        <div
                          key={node.name}
                          className={`absolute flex flex-col items-center select-none ${
                            cableMode
                              ? "cursor-crosshair"
                              : draggingNode === node.name
                                ? "cursor-grabbing"
                                : "cursor-grab hover:scale-105 transition-transform"
                          }`}
                          style={{ left: node.x, top: node.y, transform: "translate(-50%, -50%)" }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            handleMouseDown(node.name);
                          }}
                          onClick={() => {
                            if (mode === "server" && node.name === "Server" && !cableMode) {
                              setSelectedConfigDevice("Server");
                              addLog("[Server OS] Connected to Server OS console.");
                            }
                          }}
                        >
                          <div className={`flex flex-col items-center ${isNodeIdle ? "animate-float" : ""}`}>
                            <div className={`p-2 rounded-lg border transition-all duration-250 flex items-center justify-center relative ${statusColorMap[node.status]}`}>
                              {node.name === "Laptop A" ? (
                                <Wifi size={20} />
                              ) : node.name === "Server" || node.name === "WLC" || (node.role && node.role.toLowerCase().includes("server")) ? (
                                <Server size={20} />
                              ) : node.name === "L2 Switch" || node.role === "Switch" ? (
                                <SwitchIcon size={20} className="text-zinc-200" />
                              ) : (
                                <PCIcon size={20} />
                              )}
                              
                              {/* Success/error status indicator dots */}
                              {node.status === "accepted" && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-zinc-950 block" />
                              )}
                              {node.status === "rejected" && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-zinc-650 border-2 border-zinc-950 block" />
                              )}
                              {node.status === "collided" && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-zinc-950 block" />
                              )}
                            </div>
                          
                            <span className="text-xs font-bold text-zinc-400 mt-1.5">
                              {["firewall", "nat", "dhcp", "vlan"].includes(mode) && node.role ? node.role : node.name}
                            </span>
                            
                            {node.ip && (
                              <span className="text-xs font-mono text-zinc-500 mt-0.5">
                                {mode === "server" && node.name === "PC A" && node.ip === "0.0.0.0"
                                  ? "UNCONFIGURED (0.0.0.0)"
                                  : node.ip}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                  })}

                  {/* Toolbox Shelf in Server Mode */}
                  {mode === "server" && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-zinc-900/90 border border-zinc-800 rounded-xl p-2 flex items-center gap-3 shadow-xl z-20 backdrop-blur-sm">
                      <button
                        onClick={spawnServer}
                        disabled={serverSpawned}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                          serverSpawned
                            ? "bg-zinc-950 text-zinc-500 border-zinc-900 cursor-not-allowed"
                            : "bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900"
                        }`}
                      >
                        <Server className="w-3 h-3" />
                        + Add Server
                      </button>
                      
                      <button
                        onClick={toggleCableMode}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                          cableMode
                            ? "bg-zinc-100 text-zinc-950 border-white font-black"
                            : "bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900"
                        }`}
                      >
                        <Wifi className="w-3 h-3 rotate-90" />
                        ⚡ Cable Tool
                      </button>
                    </div>
                  )}

                  {/* Floating Server OS Console */}
                  {mode === "server" && selectedConfigDevice === "Server" && (
                    <div className="absolute top-3 right-3 bottom-3 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl flex flex-col z-30 overflow-hidden font-sans backdrop-blur-md">
                      {/* Window Header */}
                      <div className="bg-zinc-950 px-3 py-2 flex items-center justify-between border-b border-zinc-800">
                        <div className="flex items-center gap-2">
                          <Server className="w-3.5 h-3.5 text-zinc-400" />
                          <span className="text-xs font-bold tracking-wider uppercase text-zinc-300">Server OS - Desktop</span>
                        </div>
                        <button
                          onClick={() => setSelectedConfigDevice(null)}
                          className="text-zinc-400 hover:text-zinc-200 text-sm font-bold transition-all px-1.5 py-0.5 rounded hover:bg-zinc-850"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Tab Bar */}
                      <div className="flex bg-zinc-950/60 p-1 border-b border-zinc-800/80">
                        {(["ip", "http", "dns", "dhcp"] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => setActiveServerTab(t)}
                            className={`flex-1 py-1 text-xs font-extrabold uppercase tracking-wider rounded transition-all ${
                              activeServerTab === t
                                ? "bg-zinc-905 text-zinc-100 border border-zinc-800"
                                : "text-zinc-500 hover:text-zinc-300"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>

                      {/* Tab Body */}
                      <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-zinc-900/60">
                        {activeServerTab === "ip" && (
                          <div className="space-y-2.5">
                            <div>
                              <label className="text-xs text-zinc-500 block mb-1 uppercase font-bold tracking-wider">IP Address</label>
                              <input
                                type="text"
                                value={serverIp}
                                onChange={(e) => setServerIp(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-sm text-zinc-300 focus:outline-none focus:border-zinc-700 font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-zinc-500 block mb-1 uppercase font-bold tracking-wider">Subnet Mask</label>
                              <input
                                type="text"
                                value={serverSubnet}
                                onChange={(e) => setServerSubnet(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-sm text-zinc-300 focus:outline-none focus:border-zinc-700 font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-zinc-500 block mb-1 uppercase font-bold tracking-wider">Default Gateway</label>
                              <input
                                type="text"
                                value={serverGateway}
                                onChange={(e) => setServerGateway(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-sm text-zinc-300 focus:outline-none focus:border-zinc-700 font-mono"
                              />
                            </div>
                          </div>
                        )}

                        {activeServerTab === "http" && (
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between bg-zinc-950/40 p-2 rounded border border-zinc-800">
                              <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">HTTP Service</span>
                              <button
                                onClick={() => {
                                  setHttpEnabled(!httpEnabled);
                                  addLog(`[Server Service] HTTP service toggled ${!httpEnabled ? "ON" : "OFF"}`);
                                }}
                                className={`px-2.5 py-1 text-xs font-extrabold uppercase rounded border transition-all ${
                                  httpEnabled
                                    ? "bg-zinc-100 text-zinc-950 border-white"
                                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                                }`}
                              >
                                {httpEnabled ? "ON" : "OFF"}
                              </button>
                            </div>
                            <div>
                              <label className="text-xs text-zinc-500 block mb-1 uppercase font-bold tracking-wider">index.html (Homepage)</label>
                              <textarea
                                value={httpHtml}
                                onChange={(e) => setHttpHtml(e.target.value)}
                                rows={4}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-sm text-zinc-300 focus:outline-none focus:border-zinc-700 font-mono resize-none"
                              />
                            </div>
                          </div>
                        )}

                        {activeServerTab === "dns" && (
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between bg-zinc-950/40 p-2 rounded border border-zinc-800">
                              <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">DNS Service</span>
                              <button
                                onClick={() => {
                                  setDnsEnabled(!dnsEnabled);
                                  addLog(`[Server Service] DNS service toggled ${!dnsEnabled ? "ON" : "OFF"}`);
                                }}
                                className={`px-2.5 py-1 text-xs font-extrabold uppercase rounded border transition-all ${
                                  dnsEnabled
                                    ? "bg-zinc-100 text-zinc-950 border-white"
                                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                                }`}
                              >
                                {dnsEnabled ? "ON" : "OFF"}
                              </button>
                            </div>
                            
                            {/* Add record form */}
                            <div className="bg-zinc-950/40 p-2 rounded border border-zinc-800/80 space-y-2">
                              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider block">Add DNS Mapping</span>
                              <div className="grid grid-cols-2 gap-1.5">
                                <input
                                  type="text"
                                  placeholder="Domain (academy.cisco)"
                                  value={newDnsDomain}
                                  onChange={(e) => setNewDnsDomain(e.target.value)}
                                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-1.5 py-0.5 text-sm text-zinc-300 focus:outline-none focus:border-zinc-700 font-mono"
                                />
                                <input
                                  type="text"
                                  placeholder="IP Address"
                                  value={newDnsIp}
                                  onChange={(e) => setNewDnsIp(e.target.value)}
                                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-1.5 py-0.5 text-sm text-zinc-300 focus:outline-none focus:border-zinc-700 font-mono"
                                />
                              </div>
                              <button
                                onClick={() => {
                                  if (!newDnsDomain || !newDnsIp) return;
                                  setDnsRecords(prev => [...prev, { domain: newDnsDomain, ip: newDnsIp }]);
                                  addLog(`[DNS Database] Added record: ${newDnsDomain} -> ${newDnsIp}`);
                                  setNewDnsDomain("");
                                  setNewDnsIp("");
                                }}
                                className="w-full py-1 text-xs font-bold uppercase bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 hover:text-white text-zinc-400 rounded transition-all"
                              >
                                Add Record
                              </button>
                            </div>

                            {/* Records list */}
                            <div className="space-y-1.5 max-h-[90px] overflow-y-auto pr-1">
                              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider block">Active Records</span>
                              {dnsRecords.map((r, i) => (
                                <div key={i} className="flex items-center justify-between bg-zinc-950 p-1.5 rounded border border-zinc-850 text-xs font-mono text-zinc-400">
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-zinc-300">{r.domain}</span>
                                    <span className="text-xs text-zinc-500">IP: {r.ip}</span>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setDnsRecords(prev => prev.filter(rec => rec.domain !== r.domain));
                                      addLog(`[DNS Database] Deleted record: ${r.domain}`);
                                    }}
                                    className="text-rose-500 hover:text-rose-400 transition-all font-bold px-1 py-0.5"
                                  >
                                    Del
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {activeServerTab === "dhcp" && (
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between bg-zinc-950/40 p-2 rounded border border-zinc-800">
                              <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">DHCP Service</span>
                              <button
                                onClick={() => {
                                  setDhcpEnabled(!dhcpEnabled);
                                  addLog(`[Server Service] DHCP service toggled ${!dhcpEnabled ? "ON" : "OFF"}`);
                                }}
                                className={`px-2.5 py-1 text-xs font-extrabold uppercase rounded border transition-all ${
                                  dhcpEnabled
                                    ? "bg-zinc-100 text-zinc-950 border-white"
                                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                                }`}
                              >
                                {dhcpEnabled ? "ON" : "OFF"}
                              </button>
                            </div>
                            <div>
                              <label className="text-xs text-zinc-500 block mb-1 uppercase font-bold tracking-wider">Start IP address pool</label>
                              <input
                                type="text"
                                value={dhcpStart}
                                onChange={(e) => setDhcpStart(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-sm text-zinc-300 focus:outline-none focus:border-zinc-700 font-mono"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Controls & Log Column */}
              <div className="flex flex-col gap-6 min-h-0 overflow-hidden">
                
                {/* Controls Card */}
                <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 flex flex-col gap-5 overflow-y-auto flex-1 min-h-0">
                  <h4 className="font-extrabold text-xs tracking-wider uppercase text-zinc-500">
                    Configuration Console
                  </h4>
                  
                  {/* OSI Layer Mode Selector */}
                   <div className="space-y-3">
                     <label className="text-xs text-zinc-500 block font-bold uppercase tracking-wider">
                       Select OSI Layer / Device Mode
                     </label>
                     
                     <div className="space-y-2.5">
                       {[
                         {
                           title: "Layer 1 - Physical (Amber)",
                           modes: [
                             { id: "hub", name: "Hub" }
                           ],
                           activeColorClass: "border-amber-500/50 bg-amber-500/5 text-amber-400 font-extrabold shadow-[0_0_10px_rgba(245,158,11,0.05)]",
                           inactiveColorClass: "text-zinc-400 hover:text-zinc-250 hover:bg-zinc-900/40 border-transparent",
                           labelClass: "text-amber-500/75"
                         },
                         {
                           title: "Layer 2 - Data Link (Sky Blue)",
                           modes: [
                             { id: "switch", name: "Switch" },
                             { id: "bridge", name: "Bridge" },
                             { id: "vlan", name: "VLAN Trunk" }
                           ],
                           activeColorClass: "border-sky-500/50 bg-sky-500/5 text-sky-400 font-extrabold shadow-[0_0_10px_rgba(14,165,233,0.05)]",
                           inactiveColorClass: "text-zinc-400 hover:text-zinc-250 hover:bg-zinc-900/40 border-transparent",
                           labelClass: "text-sky-500/75"
                         },
                         {
                           title: "Layer 3 - Network (Violet)",
                           modes: [
                             { id: "router", name: "Router" },
                             { id: "nat", name: "NAT/PAT" }
                           ],
                           activeColorClass: "border-violet-500/50 bg-violet-500/5 text-violet-400 font-extrabold shadow-[0_0_10px_rgba(168,85,247,0.05)]",
                           inactiveColorClass: "text-zinc-400 hover:text-zinc-250 hover:bg-zinc-900/40 border-transparent",
                           labelClass: "text-violet-500/75"
                         },
                         {
                           title: "Layer 4-7 - Services & Security (Emerald)",
                           modes: [
                             { id: "firewall", name: "Firewall" },
                             { id: "wlc", name: "WLC AP" },
                             { id: "dhcp", name: "DHCP/DNS" },
                             { id: "server", name: "Config Server" }
                           ],
                           activeColorClass: "border-emerald-500/50 bg-emerald-500/5 text-emerald-400 font-extrabold shadow-[0_0_10px_rgba(16,185,129,0.05)]",
                           inactiveColorClass: "text-zinc-400 hover:text-zinc-250 hover:bg-zinc-900/40 border-transparent",
                           labelClass: "text-emerald-500/75"
                         },
                         {
                           title: "Networking Cast (Orange)",
                           modes: [
                             { id: "unicast", name: "Unicast" },
                             { id: "broadcast", name: "Broadcast" },
                             { id: "multicast", name: "Multicast" },
                             { id: "anycast", name: "Anycast" }
                           ],
                           activeColorClass: "border-orange-500/50 bg-orange-500/5 text-orange-400 font-extrabold shadow-[0_0_10px_rgba(249,115,22,0.05)]",
                           inactiveColorClass: "text-zinc-400 hover:text-zinc-250 hover:bg-zinc-900/40 border-transparent",
                           labelClass: "text-orange-500/75"
                         }
                       ].map((grp, gIdx) => (
                         <div key={gIdx} className="bg-zinc-950/40 p-2 rounded-xl border border-zinc-850/80">
                           <span className={`text-xs font-extrabold uppercase tracking-widest block mb-1.5 ${grp.labelClass}`}>
                             {grp.title}
                           </span>
                           <div className="grid grid-cols-3 gap-1.5">
                             {grp.modes.map((m) => (
                               <button
                                 key={m.id}
                                 disabled={isSimulating}
                                 onClick={() => handleModeChange(m.id as DeviceMode)}
                                 className={`py-1.5 text-[8.5px] font-bold rounded-lg uppercase tracking-wider border transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
                                   mode === m.id ? grp.activeColorClass : grp.inactiveColorClass
                                 }`}
                               >
                                 {m.name}
                               </button>
                             ))}
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>

                  {/* Contextual Description Box */}
                  <div className="bg-zinc-950/40 p-4 rounded-xl border border-zinc-855 text-sm text-zinc-350 leading-relaxed min-h-[90px]">
                    {mode === "hub" && (
                      <p>
                        <strong className="text-zinc-200 font-bold block mb-1">Hub (Layer 1 Physical)</strong>
                        Floods all traffic out of all active ports. Causes collisions in half-duplex environments.
                      </p>
                    )}
                    {mode === "switch" && (
                      <p>
                        <strong className="text-zinc-200 font-bold block mb-1">Switch (Layer 2 Data Link)</strong>
                        Forwards frames directly to matching destination ports using a CAM/MAC Address Table.
                      </p>
                    )}
                    {mode === "bridge" && (
                      <p>
                        <strong className="text-zinc-200 font-bold block mb-1">Bridge (Layer 2 Filtering)</strong>
                        Divides network into two shared media segments. Filters local frames and permits segment crossovers.
                      </p>
                    )}
                    {mode === "router" && (
                      <p>
                        <strong className="text-zinc-200 font-bold block mb-1">Router (Layer 3 Network)</strong>
                        Connects separate subnets. Rewrites MAC headers (Layer 2) hop-by-hop while keeping IP addresses (Layer 3) constant.
                      </p>
                    )}
                    {mode === "firewall" && (
                      <p>
                        <strong className="text-zinc-200 font-bold block mb-1">Firewall (L3/L4 Security Boundary)</strong>
                        Inspects ports and protocols. Blocks unauthorized traffic (e.g. Denying SSH Port 22 while Permitting HTTP Port 80).
                      </p>
                    )}
                    {mode === "wlc" && (
                      <p>
                        <strong className="text-zinc-200 font-bold block mb-1">WLC & AP (CAPWAP Tunneling)</strong>
                        Simulates Split-MAC controller based wireless architecture. Lightweight APs tunnel all user data inside **CAPWAP frames** directly to the WLC.
                      </p>
                    )}
                    {mode === "vlan" && (
                      <p>
                        <strong className="text-zinc-200 font-bold block mb-1">VLAN & Trunking (Layer 2 Trunk)</strong>
                        Segments switches into separate logical broadcast domains. Outbound trunk traffic is tagged with an 802.1Q VLAN header.
                      </p>
                    )}
                    {mode === "nat" && (
                      <p>
                        <strong className="text-zinc-200 font-bold block mb-1">NAT / PAT (Layer 3 PAT)</strong>
                        Maps multiple private IP addresses to a single public IP address using unique source port numbers, keeping records in a NAT table.
                      </p>
                    )}
                    {mode === "dhcp" && (
                      <p>
                        <strong className="text-zinc-200 font-bold block mb-1">DHCP & DNS Client Flow (Layer 7 Services)</strong>
                        Obtains an IP via DHCP DORA, queries the DNS Server for IP resolution, and sends HTTP requests.
                      </p>
                    )}
                    {mode === "server" && (
                      <p>
                        <strong className="text-zinc-200 font-bold block mb-1">Server Configurator Lab (Layer 7 Services)</strong>
                        Drag nodes to organize the topology. Cable the Server to the Switch, configure services in the Server OS, and execute test queries from PC A.
                      </p>
                    )}
                    {mode === "unicast" && (
                      <p>
                        <strong className="text-zinc-200 font-bold block mb-1">Unicast (Point-to-Point)</strong>
                        One-to-one delivery. A sender directs packets to a single destination device using its specific, unique IP and MAC address.
                      </p>
                    )}
                    {mode === "broadcast" && (
                      <p>
                        <strong className="text-zinc-200 font-bold block mb-1">Broadcast (One-to-All)</strong>
                        One-to-all delivery. Sent to a broadcast address (e.g. 255.255.255.255). All hosts in the broadcast domain receive and process the packet.
                      </p>
                    )}
                    {mode === "multicast" && (
                      <p>
                        <strong className="text-zinc-200 font-bold block mb-1">Multicast (One-to-Group)</strong>
                        One-to-many delivery. Delivers traffic only to hosts that have joined a specific multicast group (e.g. 224.0.0.5) via IGMP.
                      </p>
                    )}
                    {mode === "anycast" && (
                      <p>
                        <strong className="text-zinc-200 font-bold block mb-1">Anycast (One-to-Nearest)</strong>
                        One-to-nearest delivery. Multiple servers share the same IP address. Routers deliver packets to the topologically closest server.
                      </p>
                    )}
                  </div>

                  

{/* Dynamic Overlays inside Canvas Container */}
                  {/* 1. Switch CAM Table */}
                  {mode === "switch" && (
                    <div className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-4 text-xs font-mono mt-4 space-y-2 shadow-inner">
                      <span className="font-extrabold text-zinc-400 block text-xs tracking-wider uppercase border-b border-zinc-900 pb-1">MAC Address Table (CAM)</span>
                      {camTable.length === 0 ? (
                        <span className="text-zinc-500 italic block py-0.5">No entries learned yet. Run simulation to populate.</span>
                      ) : (
                        <table className="w-full text-left">
                          <thead>
                            <tr className="text-zinc-600 font-bold uppercase text-xs border-b border-zinc-900 pb-0.5">
                              <th className="pr-2">VLAN</th>
                              <th className="pr-2">MAC Address</th>
                              <th className="pr-2">Port</th>
                              <th>Type</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-900/40">
                            {camTable.map((e, idx) => (
                              <tr key={idx} className="text-zinc-300">
                                <td className="pr-2">{e.vlan}</td>
                                <td className="pr-2 text-sky-400 font-bold">{e.mac}</td>
                                <td className="pr-2 font-semibold">{e.port}</td>
                                <td className="text-zinc-500">{e.type}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}

                  {/* 2. Bridge Filtering DB */}
                  {mode === "bridge" && (
                    <div className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-4 text-xs font-mono mt-4 space-y-2 shadow-inner">
                      <span className="font-extrabold text-zinc-400 block text-xs tracking-wider uppercase border-b border-zinc-900 pb-1">Bridge Filtering Database</span>
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-zinc-600 font-bold uppercase text-xs border-b border-zinc-900 pb-0.5">
                            <th className="pr-2">MAC Address</th>
                            <th className="pr-2">Port</th>
                            <th>Segment</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { mac: "000A.0001.0001", port: "Port 1", seg: "Left (1)" },
                            { mac: "000A.0001.0003", port: "Port 1", seg: "Left (1)" },
                            { mac: "000B.0002.0002", port: "Port 2", seg: "Right (2)" },
                            { mac: "000B.0002.0004", port: "Port 2", seg: "Right (2)" }
                          ].map((e, idx) => (
                            <tr key={idx} className="text-zinc-300">
                              <td className="pr-2 text-sky-400 font-bold">{e.mac}</td>
                              <td className="pr-2 font-semibold">{e.port}</td>
                              <td className="text-zinc-500">{e.seg}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* 3. Router Routing Table */}
                  {mode === "router" && (
                    <div className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-4 text-xs font-mono mt-4 space-y-2 shadow-inner">
                      <span className="font-extrabold text-zinc-400 block text-xs tracking-wider uppercase border-b border-zinc-900 pb-1">Router Routing Table</span>
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-zinc-600 font-bold uppercase text-xs border-b border-zinc-900 pb-0.5">
                            <th className="pr-2">Network</th>
                            <th className="pr-2">Gateway</th>
                            <th className="pr-2">Interface</th>
                            <th>Type</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { net: "192.168.1.0/24", gw: "0.0.0.0", int: "Fa0/0", type: "Direct" },
                            { net: "10.0.0.0/24", gw: "0.0.0.0", int: "Fa0/1", type: "Direct" }
                          ].map((e, idx) => (
                            <tr key={idx} className="text-zinc-300">
                              <td className="pr-2 text-violet-400 font-bold">{e.net}</td>
                              <td className="pr-2">{e.gw}</td>
                              <td className="pr-2 font-semibold">{e.int}</td>
                              <td className="text-zinc-500">{e.type}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* 4. VLAN Port Database */}
                  {mode === "vlan" && (
                    <div className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-4 text-xs font-mono mt-4 space-y-2 shadow-inner">
                      <span className="font-extrabold text-zinc-400 block text-xs tracking-wider uppercase border-b border-zinc-900 pb-1">VLAN Database</span>
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-zinc-600 font-bold uppercase text-xs border-b border-zinc-900 pb-0.5">
                            <th className="pr-2">Port</th>
                            <th className="pr-2">VLAN</th>
                            <th className="pr-2">Name</th>
                            <th>Mode</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { port: "Fa0/1", vlan: "10", name: "HR", mode: "Access" },
                            { port: "Fa0/2", vlan: "10", name: "HR", mode: "Access" },
                            { port: "Fa0/3", vlan: "20", name: "IT", mode: "Access" },
                            { port: "Fa0/4", vlan: "20", name: "IT", mode: "Access" },
                            { port: "Gi0/1", vlan: "10,20", name: "Trunk", mode: "Trunk" }
                          ].map((e, idx) => (
                            <tr key={idx} className="text-zinc-300">
                              <td className="pr-2 font-bold text-sky-400">{e.port}</td>
                              <td className="pr-2">{e.vlan}</td>
                              <td className="pr-2 text-zinc-500">{e.name}</td>
                              <td className="text-zinc-500">{e.mode}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* 5. Firewall ACL Rules */}
                  {mode === "firewall" && (
                    <div className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-4 text-xs font-mono mt-4 space-y-2 shadow-inner">
                      <span className="font-extrabold text-zinc-400 block text-xs tracking-wider uppercase border-b border-zinc-900 pb-1">Firewall Access Rules (ACL)</span>
                      <div className="space-y-1">
                        {[
                          { seq: 10, act: "PERMIT", prot: "tcp", src: "192.168.1.0/24", dst: "any", port: "80 (HTTP)" },
                          { seq: 20, act: "DENY", prot: "tcp", src: "192.168.1.0/24", dst: "any", port: "22 (SSH)" },
                          { seq: 30, act: "DENY", prot: "ip", src: "any", dst: "any", port: "any" }
                        ].map((r) => (
                          <div 
                            key={r.seq}
                            className={`p-1 rounded border text-xs leading-tight flex justify-between items-center transition-all ${
                              activeAclSeq === r.seq
                                ? r.act === "PERMIT"
                                  ? "bg-emerald-950/40 border-emerald-500/70 text-emerald-300 font-bold"
                                  : "bg-rose-950/40 border-rose-500/70 text-rose-300 font-bold"
                                : "bg-zinc-950/60 border-zinc-900/60 text-zinc-450"
                            }`}
                          >
                            <div>
                              <span className="text-zinc-500 mr-1 font-bold">{r.seq}</span>
                              <span className={`font-black mr-1.5 ${r.act === "PERMIT" ? "text-emerald-500" : "text-rose-500"}`}>{r.act}</span>
                              <span>{r.prot} {r.src} ➔ {r.port}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 6. WLC Client & AP Table */}
                  {mode === "wlc" && (
                    <div className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-4 text-xs font-mono mt-4 space-y-2 shadow-inner">
                      <span className="font-extrabold text-zinc-400 block text-xs tracking-wider uppercase border-b border-zinc-900 pb-1">WLC Controller Status</span>
                      <div className="space-y-1.5 text-xs text-zinc-450">
                        <div>
                          <span className="text-zinc-450 font-bold block uppercase tracking-wide">AP Registration</span>
                          <div className="flex justify-between mt-0.5 text-zinc-300">
                            <span>AP-01 (Fa0/5)</span>
                            <span className="text-emerald-400 font-bold">Joined (192.168.1.5)</span>
                          </div>
                        </div>
                        <div className="border-t border-zinc-900/60 pt-1">
                          <span className="text-zinc-450 font-bold block uppercase tracking-wide">Active Clients</span>
                          <div className="flex justify-between mt-0.5 text-zinc-300">
                            <span>Laptop A (Wifi)</span>
                            <span className="text-emerald-400 font-bold">Associated</span>
                          </div>
                          <div className="text-xs text-zinc-450 pl-1 mt-0.5 font-sans leading-none">
                            SSID: NetAcademy | IP: 192.168.10.50 | Tunnel: CAPWAP Active
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 7. DHCP Leases Table */}
                  {mode === "dhcp" && (
                    <div className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-4 text-xs font-mono mt-4 space-y-2 shadow-inner">
                      <span className="font-extrabold text-zinc-400 block text-xs tracking-wider uppercase border-b border-zinc-900 pb-1">DHCP Leases DB</span>
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-zinc-600 font-bold uppercase text-xs border-b border-zinc-900 pb-0.5">
                            <th className="pr-2">Client</th>
                            <th className="pr-2">MAC Address</th>
                            <th className="pr-2">Leased IP</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dhcpLeases.map((e, idx) => (
                            <tr key={idx} className="text-zinc-300">
                              <td className="pr-2">{e.client}</td>
                              <td className="pr-2 text-emerald-400 font-bold">{e.mac}</td>
                              <td className="pr-2">{e.ip}</td>
                              <td className={e.status === "Active" ? "text-emerald-500 font-bold" : "text-zinc-500"}>{e.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* 8. Server Services Monitor */}
                  {mode === "server" && (
                    <div className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-4 text-xs font-mono mt-4 space-y-2 shadow-inner">
                      <span className="font-extrabold text-zinc-400 block text-xs tracking-wider uppercase border-b border-zinc-900 pb-1">Server Services Status</span>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${dhcpEnabled ? "bg-emerald-500" : "bg-zinc-700"}`} />
                          <span className="text-zinc-300">DHCP Daemon: {dhcpEnabled ? `ON (Pool: ${dhcpStart})` : "OFF"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${dnsEnabled ? "bg-emerald-500" : "bg-zinc-700"}`} />
                          <span className="text-zinc-300">DNS Daemon: {dnsEnabled ? `ON (${dnsRecords.length} Records)` : "OFF"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${httpEnabled ? "bg-emerald-500" : "bg-zinc-700"}`} />
                          <span className="text-zinc-300">HTTP Server: {httpEnabled ? "ON (Port 80)" : "OFF"}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 9. NAT Translation Table */}
                  {mode === "nat" && natTable.length > 0 && (
                    <div className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-4 text-xs font-mono mt-4 space-y-2 shadow-inner">
                      <span className="font-extrabold text-zinc-400 block text-xs tracking-wider uppercase border-b border-zinc-900 pb-1">NAT Translation Table</span>
                      <div className="space-y-1">
                        <div className="grid grid-cols-3 gap-2 text-zinc-600 font-bold uppercase text-xs border-b border-zinc-900 pb-0.5">
                          <span>Inside Local</span>
                          <span>Inside Global</span>
                          <span>Outside Global</span>
                        </div>
                        {natTable.map((row, i) => (
                          <div key={i} className="grid grid-cols-3 gap-2 text-zinc-300">
                            <span>{row.localIp}:{row.localPort}</span>
                            <span className="text-violet-400 font-bold">{row.globalIp}:{row.globalPort}</span>
                            <span>{row.destIp}:{row.destPort}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cast Modes Overlays */}
                  {mode === "unicast" && (
                    <div className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-4 text-xs font-mono mt-4 space-y-2 shadow-inner">
                      <span className="font-extrabold text-zinc-400 block text-xs tracking-wider uppercase border-b border-zinc-900 pb-1">Unicast Routing Info</span>
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-zinc-600 font-bold uppercase text-xs border-b border-zinc-900 pb-0.5">
                            <th className="pr-2">Destination</th>
                            <th className="pr-2">Next Hop</th>
                            <th className="pr-2">Interface</th>
                            <th>Metric</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { dst: "10.0.0.10 (PC B)", gw: "10.0.0.10", int: "Fa0/1", metric: "1" },
                            { dst: "10.0.0.20 (PC D)", gw: "10.0.0.20", int: "Fa0/1", metric: "1" },
                            { dst: "192.168.1.0/24", gw: "0.0.0.0", int: "Fa0/0", metric: "0" }
                          ].map((e, idx) => (
                            <tr key={idx} className="text-zinc-300">
                              <td className="pr-2 text-violet-400 font-bold">{e.dst}</td>
                              <td className="pr-2">{e.gw}</td>
                              <td className="pr-2 font-semibold">{e.int}</td>
                              <td className="text-zinc-500">{e.metric}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {mode === "broadcast" && (
                    <div className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-4 text-xs font-mono mt-4 space-y-2 shadow-inner">
                      <span className="font-extrabold text-zinc-400 block text-xs tracking-wider uppercase border-b border-zinc-900 pb-1">Broadcast Domain Map</span>
                      <div className="space-y-1 text-xs text-zinc-450">
                        <div className="flex justify-between">
                          <span>Broadcast Address:</span>
                          <span className="font-mono text-orange-400 font-bold">FF:FF:FF:FF:FF:FF</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Target Subnet:</span>
                          <span className="font-mono">192.168.1.255 /24</span>
                        </div>
                        <div className="border-t border-zinc-900/60 pt-1">
                          <span className="text-zinc-500 font-bold block uppercase tracking-wide">Flooding Ports</span>
                          <div className="grid grid-cols-2 gap-1 mt-0.5 text-zinc-300">
                            <span>Fa0/1 (PC A)</span>
                            <span>Fa0/2 (PC B)</span>
                            <span>Fa0/3 (PC C)</span>
                            <span>Fa0/4 (PC D)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {mode === "multicast" && (
                    <div className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-4 text-xs font-mono mt-4 space-y-2 shadow-inner">
                      <span className="font-extrabold text-zinc-400 block text-xs tracking-wider uppercase border-b border-zinc-900 pb-1">IGMP Group Membership</span>
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-zinc-600 font-bold uppercase text-xs border-b border-zinc-900 pb-0.5">
                            <th className="pr-2">Group IP</th>
                            <th className="pr-2">Member</th>
                            <th className="pr-2">Interface</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { grp: "224.0.0.5", member: "PC B", int: "Fa0/2", status: "Active" },
                            { grp: "224.0.0.5", member: "PC C", int: "Fa0/3", status: "Active" },
                            { grp: "224.0.0.5", member: "PC D", int: "Fa0/4", status: "Not Joined" }
                          ].map((e, idx) => (
                            <tr key={idx} className={e.status === "Active" ? "text-zinc-300" : "text-zinc-450"}>
                              <td className="pr-2 text-teal-400 font-bold">{e.grp}</td>
                              <td className="pr-2">{e.member}</td>
                              <td className="pr-2 font-semibold">{e.int}</td>
                              <td className={e.status === "Active" ? "text-teal-500 font-bold" : "text-zinc-500"}>{e.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {mode === "anycast" && (
                    <div className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-4 text-xs font-mono mt-4 space-y-2 shadow-inner">
                      <span className="font-extrabold text-zinc-400 block text-xs tracking-wider uppercase border-b border-zinc-900 pb-1">Anycast Routing Table</span>
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-zinc-600 font-bold uppercase text-xs border-b border-zinc-900 pb-0.5">
                            <th className="pr-2">Shared IP</th>
                            <th className="pr-2">Server</th>
                            <th className="pr-2">Metric (Hops)</th>
                            <th>Path Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { ip: "203.0.113.1", node: "PC B (Nearest)", hops: "1", status: "Active (Nearest)" },
                            { ip: "203.0.113.1", node: "PC C (Farther)", hops: "3", status: "Backup" },
                            { ip: "203.0.113.1", node: "PC D (Farthest)", hops: "5", status: "Backup" }
                          ].map((e, idx) => (
                            <tr key={idx} className="text-zinc-300">
                              <td className="pr-2 text-pink-400 font-bold">{e.ip}</td>
                              <td className="pr-2">{e.node}</td>
                              <td className="pr-2 font-semibold text-center">{e.hops}</td>
                              <td className={e.status.includes("Nearest") ? "text-pink-500 font-bold animate-pulse" : "text-zinc-450"}>{e.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* IP Lease Summary Badge in DHCP / Server modes */}
                  {(mode === "dhcp" || mode === "server") && (
                    <div className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-4 text-xs font-mono mt-4 space-y-2 shadow-inner">
                      <span className="font-extrabold text-zinc-400 block mb-0.5 tracking-wider uppercase text-xs">IP Lease Status</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${nodes["PC A"]?.ip === "0.0.0.0" ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
                        <span className="text-zinc-300">
                          PC A: {nodes["PC A"]?.ip === "0.0.0.0" ? "UNCONFIGURED (0.0.0.0)" : `LEASED (${nodes["PC A"]?.ip})`}
                        </span>
                      </div>
                    </div>
                  )}

{/* Contextual Action Buttons */}
                  <div className="flex flex-col gap-2.5 mt-1">
                    {!["router", "firewall", "wlc", "vlan", "nat", "dhcp", "server"].includes(mode) && (
                      <>
                        <button
                          onClick={runSendLocal}
                          disabled={isSimulating}
                          className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-300 font-bold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Send Frame (A to C)
                        </button>
                        <button
                          onClick={runCollisionTest}
                          disabled={isSimulating}
                          className="w-full bg-zinc-950 border border-zinc-850 hover:border-zinc-800 text-zinc-500 font-semibold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Collision Test (A + B)
                        </button>
                      </>
                    )}

                    {mode === "router" && (
                      <>
                        <button
                          onClick={runSendLocal}
                          disabled={isSimulating}
                          className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-300 font-bold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Intra-Subnet (A to C)
                        </button>
                        <button
                          onClick={runRouteCross}
                          disabled={isSimulating}
                          className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-300 font-bold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Inter-Subnet (A to B)
                        </button>
                      </>
                    )}

                    {mode === "firewall" && (
                      <>
                        <button
                          onClick={() => runFirewallTest(80)}
                          disabled={isSimulating}
                          className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-300 font-bold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          HTTP (Port 80) - Allow
                        </button>
                        <button
                          onClick={() => runFirewallTest(22)}
                          disabled={isSimulating}
                          className="w-full bg-zinc-950 border border-zinc-800 hover:border-rose-950/60 hover:bg-rose-950/10 text-rose-500 font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          SSH (Port 22) - Deny
                        </button>
                      </>
                    )}

                    {mode === "wlc" && (
                      <button
                        onClick={runCapwapSimulation}
                        disabled={isSimulating}
                        className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-300 font-bold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Simulate CAPWAP Tunnel
                      </button>
                    )}

                    {mode === "vlan" && (
                      <>
                        <button
                          onClick={runVlanUnicast}
                          disabled={isSimulating}
                          className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-300 font-bold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          VLAN Unicast (A to B)
                        </button>
                        <button
                          onClick={runVlanBroadcast}
                          disabled={isSimulating}
                          className="w-full bg-zinc-950 border border-zinc-805 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-300 font-bold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          VLAN Broadcast (A)
                        </button>
                      </>
                    )}

                    {mode === "nat" && (
                      <button
                        onClick={runNatSimulation}
                        disabled={isSimulating}
                        className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-300 font-bold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Simulate PAT (HTTP to Web)
                      </button>
                    )}

                    {mode === "dhcp" && (
                      <>
                        <button
                          onClick={runDhcpDora}
                          disabled={isSimulating}
                          className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-300 font-bold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          1. DHCP DORA Flow
                        </button>
                        <button
                          onClick={runDnsQuery}
                          disabled={isSimulating}
                          className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-300 font-bold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          2. DNS & HTTP GET
                        </button>
                      </>
                    )}

                    {mode === "server" && (
                      <>
                        <button
                          onClick={runServerDhcpTest}
                          disabled={isSimulating}
                          className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-300 font-bold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          1. Request DHCP (DORA)
                        </button>
                        <button
                          onClick={runServerDnsTest}
                          disabled={isSimulating}
                          className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-300 font-bold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          2. Run DNS Query (academy.cisco)
                        </button>
                        <button
                          onClick={runServerHttpTest}
                          disabled={isSimulating}
                          className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-300 font-bold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          3. HTTP Web Request (academy.cisco)
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Event Log Card */}
                <div className="h-[180px] shrink-0 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 flex flex-col">
                  <h4 className="font-extrabold text-xs tracking-wider uppercase text-zinc-500 mb-3">
                    Active Event Log
                  </h4>
                  <div className="flex-1 bg-zinc-950 rounded-xl p-3 border border-zinc-855 font-mono text-xs text-zinc-500 overflow-y-auto space-y-2">
                    {logs.map((log, index) => {
                      const timeMatch = log.match(/^\[\d{2}:\d{2}:\d{2} [AP]M\]/);
                      let timeStr = "";
                      let remaining = log;
                      
                      if (timeMatch) {
                        timeStr = timeMatch[0];
                        remaining = log.slice(timeStr.length).trim();
                      }
                      
                      const tagMatch = remaining.match(/^\[(.*?)\]/);
                      let tagStr = "";
                      let message = remaining;
                      
                      if (tagMatch) {
                        tagStr = tagMatch[1];
                        message = remaining.slice(tagMatch[0].length).trim();
                      }
                      
                      let tagColorClass = "bg-zinc-900/60 text-zinc-400 border-zinc-800/80";
                      if (tagStr.toLowerCase().includes("error") || tagStr.toLowerCase().includes("fail") || tagStr.toLowerCase().includes("blocked") || tagStr.toLowerCase().includes("collision")) {
                        tagColorClass = "bg-rose-950/30 text-rose-400 border-rose-900/40";
                      } else if (tagStr.toLowerCase().includes("success") || tagStr.toLowerCase().includes("established") || tagStr.toLowerCase().includes("ack") || tagStr.toLowerCase().includes("confirm") || tagStr.toLowerCase().includes("match")) {
                        tagColorClass = "bg-emerald-950/30 text-emerald-400 border-emerald-900/40";
                      } else if (tagStr.toLowerCase().includes("dhcp") || tagStr.toLowerCase().includes("dns") || tagStr.toLowerCase().includes("http") || tagStr.toLowerCase().includes("nat") || tagStr.toLowerCase().includes("pat") || tagStr.toLowerCase().includes("vlan") || tagStr.toLowerCase().includes("wlc") || tagStr.toLowerCase().includes("capwap")) {
                        tagColorClass = "bg-sky-950/30 text-sky-400 border-sky-900/40";
                      } else if (tagStr.toLowerCase().includes("router")) {
                        tagColorClass = "bg-violet-950/30 text-violet-400 border-violet-900/40";
                      } else if (tagStr.toLowerCase().includes("firewall")) {
                        tagColorClass = "bg-amber-950/30 text-amber-400 border-amber-900/40";
                      }
                      
                      let textHighlightClass = "text-zinc-500";
                      if (log.toLowerCase().includes("collision") || log.toLowerCase().includes("blocked") || log.toLowerCase().includes("error") || log.toLowerCase().includes("mismatch")) {
                        textHighlightClass = "text-rose-450 font-semibold";
                      } else if (log.toLowerCase().includes("established") || log.toLowerCase().includes("match") || log.toLowerCase().includes("delivered") || log.toLowerCase().includes("successful")) {
                        textHighlightClass = "text-zinc-200 font-semibold";
                      } else if (log.toLowerCase().includes("sending") || log.toLowerCase().includes("forwarding") || log.toLowerCase().includes("transmitting")) {
                        textHighlightClass = "text-zinc-400";
                      }

                      return (
                        <div key={index} className="flex items-start gap-1.5 leading-relaxed text-[8.5px] border-b border-zinc-900/40 pb-1.5 last:border-0 font-mono">
                          {timeStr && <span className="text-zinc-500 shrink-0 select-none">{timeStr}</span>}
                          {tagStr && (
                            <span className={`px-1 py-0.5 rounded text-xs font-extrabold uppercase border shrink-0 ${tagColorClass}`}>
                              {tagStr}
                            </span>
                          )}
                          <span className={textHighlightClass}>{message}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>
          ) : (
            /* Notebook Section */
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 flex-1 glow-card overflow-hidden min-h-0">
              
              {/* Notebook Left Nav */}
              <div className="md:col-span-1 flex flex-col gap-1.5 border-r border-zinc-800/40 pr-6 overflow-y-auto min-h-0">
                <h3 className="font-extrabold text-xs tracking-wider text-zinc-500 uppercase mb-4 pl-2">
                  Notebook Sections
                </h3>
                {[
                  { id: "all", name: "Comparison Matrix" },
                  { id: "hub", name: "Network Hubs" },
                  { id: "switch", name: "Network Switches" },
                  { id: "bridge", name: "Network Bridges" },
                  { id: "router", name: "Network Routers" },
                  { id: "firewall", name: "Network Firewalls" },
                  { id: "wlc", name: "Wireless WLC & AP" },
                  { id: "vlan", name: "VLANs & Trunking" },
                  { id: "nat", name: "NAT & PAT Address" },
                  { id: "dhcp", name: "DHCP & DNS Flow" },
                  { id: "server", name: "Server Configurator" },
                ].map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => setNotebookTab(sec.id as any)}
                    className={`text-left px-3 py-2 text-sm font-semibold rounded-lg transition-all ${
                      notebookTab === sec.id 
                        ? "bg-zinc-950 text-white border border-zinc-800" 
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/20"
                    }`}
                  >
                    {sec.name}
                  </button>
                ))}
              </div>

              {/* Notebook Content Panels */}
              <div className="md:col-span-3 text-sm text-zinc-350 leading-relaxed overflow-y-auto max-h-[550px] pr-2 space-y-6">
                {notebookTab === "all" && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-extrabold text-base text-zinc-200 flex items-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4" />
                        Comparison Matrix
                      </h4>
                      <p className="text-sm text-zinc-500">
                        Understanding how Layer 1, 2, 3, and security/wireless devices process frames, packets, and tunnels.
                      </p>
                    </div>

                    <div className="overflow-x-auto border border-zinc-850 rounded-xl bg-zinc-950/20">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="bg-zinc-900/80 border-b border-zinc-850 font-bold text-zinc-300">
                            <th className="p-3">Device</th>
                            <th className="p-3">OSI Layer</th>
                            <th className="p-3">PDU</th>
                            <th className="p-3">Addressing Scheme</th>
                            <th className="p-3">Primary Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-850/80">
                          <tr>
                            <td className="p-3 font-semibold text-zinc-200">Hub</td>
                            <td className="p-3">Layer 1 (Physical)</td>
                            <td className="p-3">Bits</td>
                            <td className="p-3 text-zinc-500">None</td>
                            <td className="p-3">Electrical Repeater (Floods)</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-semibold text-zinc-200">Bridge</td>
                            <td className="p-3">Layer 2 (Data Link)</td>
                            <td className="p-3">Frame</td>
                            <td className="p-3 font-mono">MAC Address</td>
                            <td className="p-3">Filters segments (Software)</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-semibold text-zinc-200">Switch</td>
                            <td className="p-3">Layer 2 (Data Link)</td>
                            <td className="p-3">Frame</td>
                            <td className="p-3 font-mono">MAC Address</td>
                            <td className="p-3">ASIC Microsegmentation (Unicast)</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-semibold text-zinc-200 font-bold">VLAN Trunk</td>
                            <td className="p-3">Layer 2 (Data Link)</td>
                            <td className="p-3">802.1Q Frame</td>
                            <td className="p-3 font-mono">VLAN ID Tag (12-bit)</td>
                            <td className="p-3">Logical broadcast segmentation over single link</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-semibold text-zinc-200 font-bold">Router</td>
                            <td className="p-3">Layer 3 (Network)</td>
                            <td className="p-3">Packet</td>
                            <td className="p-3 font-mono">IP Address</td>
                            <td className="p-3">Path Determination (L2 rewrite)</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-semibold text-zinc-200">NAT Router</td>
                            <td className="p-3">Layer 3 (Network)</td>
                            <td className="p-3">IP Packet</td>
                            <td className="p-3 font-mono">IP Address & Port Table</td>
                            <td className="p-3">Translates Private IP to Public IP (PAT)</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-semibold text-zinc-200">Firewall</td>
                            <td className="p-3">Layers 3-4 (Session/App)</td>
                            <td className="p-3">Packet/Segments</td>
                            <td className="p-3">IP / Port Protocols</td>
                            <td className="p-3">Access Control List filtering</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-semibold text-zinc-200 font-bold">WLC & AP</td>
                            <td className="p-3">Layer 2-3 (Controller)</td>
                            <td className="p-3">CAPWAP Frame</td>
                            <td className="p-3">IP / Wireless BSSID</td>
                            <td className="p-3">Split-MAC control & CAPWAP data tunnels</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-semibold text-zinc-200 font-bold">DHCP/DNS Serv.</td>
                            <td className="p-3">Layer 7 (Application)</td>
                            <td className="p-3">UDP Messages</td>
                            <td className="p-3 font-mono">IP Leases / Host Records</td>
                            <td className="p-3">Dynamic client auto-config & name lookup</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {notebookTab === "hub" && (
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-sm text-zinc-200">Network Hubs (Layer 1)</h4>
                    <p>
                      Hubs simply duplicate incoming bits. They operate entirely on Layer 1 electrical signals. Because they flood all ports indiscriminately, they create a single shared collision domain, requiring CSMA/CD to control collisions.
                    </p>
                    <div className="pt-2">
                      <a 
                        href="https://www.youtube.com/watch?v=1z0ULvg_pW8" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-bold text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all uppercase tracking-wider"
                      >
                        <Play className="w-3 h-3 text-zinc-450 fill-zinc-600" />
                        Watch Tutorial Video
                        <ExternalLink className="w-3 h-3 text-zinc-500" />
                      </a>
                    </div>
                  </div>
                )}

                {notebookTab === "switch" && (
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-sm text-zinc-200">Network Switches (Layer 2)</h4>
                    <p>
                      Switches read destination MAC addresses and forward frames using a CAM table. Each switch port is an independent collision domain, meaning full-duplex connections are collision-free.
                    </p>
                    <div className="pt-2">
                      <a 
                        href="https://www.youtube.com/watch?v=S254s92U5P0" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-bold text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all uppercase tracking-wider"
                      >
                        <Play className="w-3 h-3 text-zinc-450 fill-zinc-600" />
                        Watch Tutorial Video
                        <ExternalLink className="w-3 h-3 text-zinc-500" />
                      </a>
                    </div>
                  </div>
                )}

                {notebookTab === "bridge" && (
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-sm text-zinc-200">Network Bridges (Layer 2)</h4>
                    <p>
                      Bridges are software-based Layer 2 segment filters. They examine MAC addresses to block local traffic from crossing segments, reducing overall collision domains.
                    </p>
                    <div className="pt-2">
                      <a 
                        href="https://www.youtube.com/watch?v=uS3V_a8t39w" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-bold text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all uppercase tracking-wider"
                      >
                        <Play className="w-3 h-3 text-zinc-450 fill-zinc-600" />
                        Watch Tutorial Video
                        <ExternalLink className="w-3 h-3 text-zinc-500" />
                      </a>
                    </div>
                  </div>
                )}

                {notebookTab === "router" && (
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-sm text-zinc-200">Network Routers (Layer 3)</h4>
                    <p>
                      Routers operate at Layer 3 of the OSI model. They read Layer 3 logical IP addresses to forward packets across different subnets.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850">
                        <span className="font-bold text-zinc-250 block mb-1">Header Decapsulation</span>
                        <span className="text-xs text-zinc-500">
                          When a router receives a frame, it strips off the Layer 2 header (Source and Destination MAC addresses) to inspect the Layer 3 Destination IP address inside.
                        </span>
                      </div>
                      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850">
                        <span className="font-bold text-zinc-250 block mb-1">MAC Address Rewrite</span>
                        <span className="text-xs text-zinc-500">
                          Before forwarding the packet, the router encapsulates it in a new Layer 2 frame. The Source MAC is updated to the router exit port MAC, and Destination MAC becomes the next-hop router or end host MAC.
                        </span>
                      </div>
                    </div>
                    <div className="pt-2">
                      <a 
                        href="https://www.youtube.com/watch?v=Ofj7ReU5404" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-bold text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all uppercase tracking-wider"
                      >
                        <Play className="w-3 h-3 text-zinc-450 fill-zinc-600" />
                        Watch Tutorial Video
                        <ExternalLink className="w-3 h-3 text-zinc-500" />
                      </a>
                    </div>
                  </div>
                )}

                {notebookTab === "firewall" && (
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-sm text-zinc-200">Network Firewalls (Security Boundary)</h4>
                    <p>
                      Firewalls inspect traffic at boundary points. They match traffic properties against an Access Control List (ACL) composed of Permit and Deny rules based on source IP, destination IP, protocol (TCP/UDP), and destination port numbers.
                    </p>
                    <div className="pt-2">
                      <a 
                        href="https://www.youtube.com/watch?v=kDEX1HXy550" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-bold text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all uppercase tracking-wider"
                      >
                        <Play className="w-3 h-3 text-zinc-450 fill-zinc-600" />
                        Watch Tutorial Video
                        <ExternalLink className="w-3 h-3 text-zinc-500" />
                      </a>
                    </div>
                  </div>
                )}

                {notebookTab === "wlc" && (
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-sm text-zinc-200">Wireless Controller (WLC) & AP (Split-MAC)</h4>
                    <p>
                      In enterprise networks, Wireless Access Points operate as lightweight devices (LAPs) under the management of a centralized Wireless LAN Controller (WLC).
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850">
                        <span className="font-bold text-zinc-250 block mb-1">Split-MAC Architecture</span>
                        <span className="text-xs text-zinc-500">
                          The AP handles real-time Layer 1/2 wireless functions (beacons, probe responses, wireless frames), while the WLC processes upper-level tasks like client authentication, security policies, and roaming configurations.
                        </span>
                      </div>
                      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850">
                        <span className="font-bold text-zinc-250 block mb-1">CAPWAP Tunneling</span>
                        <span className="text-xs text-zinc-500">
                          Control and Provisioning of Wireless Access Points. Encapsulates wireless client payloads inside a UDP tunnel (port 5247) from the AP to WLC, routing user traffic back to the central controller for security enforcement before forwarding to the core switch.
                        </span>
                      </div>
                    </div>
                    <div className="pt-2">
                      <a 
                        href="https://www.youtube.com/watch?v=UqQc4YV_16U" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-bold text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all uppercase tracking-wider"
                      >
                        <Play className="w-3 h-3 text-zinc-450 fill-zinc-600" />
                        Watch Tutorial Video
                        <ExternalLink className="w-3 h-3 text-zinc-500" />
                      </a>
                    </div>
                  </div>
                )}

                {notebookTab === "vlan" && (
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-sm text-zinc-200">VLANs & 802.1Q Trunking</h4>
                    <p>
                      Virtual Local Area Networks (VLANs) segment a physical switch into multiple logical broadcast domains at Layer 2. To carry traffic from multiple VLANs over a single physical link between switches, we use **Trunk Links** configured with the IEEE **802.1Q** protocol.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850">
                        <span className="font-bold text-zinc-250 block mb-1">Broadcast Domain Isolation</span>
                        <span className="text-xs text-zinc-500">
                          Without VLANs, a broadcast frame from one device floods the entire switch. With VLANs, the switch isolates broadcasts to ports belonging to the same VLAN ID, preventing unnecessary network congestion.
                        </span>
                      </div>
                      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850">
                        <span className="font-bold text-zinc-250 block mb-1">802.1Q Frame Tagging</span>
                        <span className="text-xs text-zinc-500">
                          When a frame crosses a trunk link, Switch 1 inserts a 4-byte 802.1Q tag into the Ethernet header, which contains a 12-bit VLAN ID. Switch 2 reads this tag, strips it off, and forwards the frame only to matching VLAN access ports.
                        </span>
                      </div>
                    </div>
                    <div className="pt-2">
                      <a 
                        href="https://www.youtube.com/watch?v=M5M97Kip7S8" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-bold text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all uppercase tracking-wider"
                      >
                        <Play className="w-3 h-3 text-zinc-450 fill-zinc-600" />
                        Watch Tutorial Video
                        <ExternalLink className="w-3 h-3 text-zinc-500" />
                      </a>
                    </div>
                  </div>
                )}

                {notebookTab === "nat" && (
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-sm text-zinc-200">NAT & Port Address Translation (PAT)</h4>
                    <p>
                      Network Address Translation (NAT) conserves the IPv4 public address space by allowing inside hosts with private IP addresses (RFC 1918) to share a single or pool of public IP addresses for communication on the internet.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850">
                        <span className="font-bold text-zinc-250 block mb-1">PAT (NAT Overload)</span>
                        <span className="text-xs text-zinc-500">
                          Port Address Translation (PAT) maps multiple private IP addresses to a single public IP address by assigning unique source port numbers to each outbound connection. This dynamic lookup is kept inside the NAT Translation Table.
                        </span>
                      </div>
                      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850">
                        <span className="font-bold text-zinc-250 block mb-1">Address Terminology</span>
                        <span className="text-xs text-zinc-500">
                          - <strong>Inside Local:</strong> Private IP of the client inside the network.<br />
                          - <strong>Inside Global:</strong> Public IP representing the client on the Internet.<br />
                          - <strong>Outside Global:</strong> Public IP of the destination server on the Internet.
                        </span>
                      </div>
                    </div>
                    <div className="pt-2">
                      <a 
                        href="https://www.youtube.com/watch?v=QBqPz8fB9W4" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-bold text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all uppercase tracking-wider"
                      >
                        <Play className="w-3 h-3 text-zinc-450 fill-zinc-600" />
                        Watch Tutorial Video
                        <ExternalLink className="w-3 h-3 text-zinc-500" />
                      </a>
                    </div>
                  </div>
                )}

                {notebookTab === "dhcp" && (
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-sm text-zinc-200">DHCP & DNS Client Integration</h4>
                    <p>
                      Hosts need dynamic configurations to attach to the network. Dynamic Host Configuration Protocol (DHCP) automatically assigns IP parameters, while Domain Name System (DNS) resolves human-readable URLs to IP addresses.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850">
                        <span className="font-bold text-zinc-250 block mb-1">DHCP DORA Exchange</span>
                        <span className="text-xs text-zinc-500">
                          - <strong>Discover:</strong> Client broadcasts looking for server.<br />
                          - <strong>Offer:</strong> Server offers an IP configuration lease.<br />
                          - <strong>Request:</strong> Client requests the offered IP configuration.<br />
                          - <strong>Acknowledgment:</strong> Server commits lease to the client.
                        </span>
                      </div>
                      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850">
                        <span className="font-bold text-zinc-250 block mb-1">DNS Lookup Process</span>
                        <span className="text-xs text-zinc-500">
                          Before sending an HTTP request, a client must resolve the target host name (e.g. `academy.cisco`) by querying a DNS server. The DNS server translates this URL to its numerical IP address, which the client then uses to encapsulate its packets.
                        </span>
                      </div>
                    </div>
                    <div className="pt-2">
                      <a 
                        href="https://www.youtube.com/watch?v=0k5G6F0eBkw" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-bold text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all uppercase tracking-wider"
                      >
                        <Play className="w-3 h-3 text-zinc-450 fill-zinc-600" />
                        Watch Tutorial Video
                        <ExternalLink className="w-3 h-3 text-zinc-500" />
                      </a>
                    </div>
                  </div>
                )}

                {notebookTab === "server" && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-extrabold text-sm text-zinc-200">Server Services & Configuration Theory</h4>
                      <p className="mt-1 text-xs text-zinc-400">
                        In client-server network architectures, a host relies on centralized application services to obtain settings, resolve names, and fetch website assets. These include Layer 7 protocols like DHCP, DNS, and HTTP.
                      </p>
                    </div>

                    {/* Step-by-Step Drawing Flow Diagram */}
                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850/80">
                      <span className="font-bold text-xs text-zinc-200 block mb-2 uppercase tracking-wider">
                        Protocol Exchange Diagram (DHCP ➔ DNS ➔ HTTP)
                      </span>
                      <pre className="text-xs font-mono text-zinc-500 overflow-x-auto leading-relaxed whitespace-pre select-all">
{`+-------------------+       +---------------+       +------------------+
| PC A (DHCP Client)|       |  L2 Switch    |       |   CCNA Server    |
+---------+---------+       +-------+-------+       +--------+---------+
          |                         |                        |
          |  1. DHCP Discover (BC)  |                        |
          |========================>|                        |
          |                         |  1. Forward Discover   |
          |                         |=======================>|
          |                         |                        |
          |                         |  2. DHCP Offer (Unic)  |
          |                         |<=======================|
          |  2. Forward Offer       |                        |
          |<========================|                        |
          |                         |                        |
          |  3. DHCP Request (BC)   |                        |
          |========================>|                        |
          |                         |  3. Forward Request    |
          |                         |=======================>|
          |                         |                        |
          |                         |  4. DHCP Ack (Unicast) |
          |                         |<=======================|
          |  4. Forward Ack         |                        |
          |<========================|                        |
          | [IP: 192.168.1.50 Assigned]                      |
          |                         |                        |
          |==================================================|
          |                         |                        |
          |  5. DNS Query           |                        |
          |========================>|                        |
          |                         |  5. Forward Query      |
          |                         |=======================>|
          |                         |                        |
          |                         |  6. DNS Resolved IP    |
          |                         |<=======================|
          |  6. Forward Response    |                        |
          |<========================|                        |
          | [academy.cisco -> 192.168.1.254]                 |
          |                         |                        |
          |==================================================|
          |                         |                        |
          |  7. HTTP GET (Port 80)  |                        |
          |========================>|                        |
          |                         |  7. Forward GET        |
          |                         |=======================>|
          |                         |                        |
          |                         |  8. HTTP 200 OK (HTML) |
          |                         |<=======================|
          |  8. Forward index.html  |                        |
          |<========================|                        |
          +                         +                        +`}
                      </pre>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850">
                        <span className="font-bold text-zinc-250 block mb-1">Interactive Topology & Physical Cable Dependency</span>
                        <span className="text-xs text-zinc-500">
                          A local link is not established until a physical connection is made. In this lab simulator, cabling a Switch to a Server represents Cisco Packet Tracer physical topology design. If a client attempts to lease an IP or query a DNS domain before the cable is connected, the requests will fail due to the link-down state.
                        </span>
                      </div>
                      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850">
                        <span className="font-bold text-zinc-250 block mb-1">Server OS Desktop Services</span>
                        <span className="text-xs text-zinc-500">
                          - <strong>IP Configuration:</strong> Binds static IP parameters (\`192.168.1.254\`) directly to the server NIC.<br />
                          - <strong>HTTP Service:</strong> Listens on TCP Port 80 to serve HTML documents like \`index.html\`. <br />
                          - <strong>DNS Database:</strong> Maps domain hosts (e.g. \`academy.cisco\`) to resolved IP addresses. <br />
                          - <strong>DHCP Pool:</strong> Manages dynamic IP address ranges (e.g., beginning at \`192.168.1.50\`) to lease to client endpoints.
                        </span>
                      </div>
                    </div>

                    {/* Troubleshooting Scenarios */}
                    <div className="space-y-3">
                      <span className="font-bold text-xs text-zinc-500 uppercase tracking-wider block">
                        Common Lab Troubleshooting Scenarios
                      </span>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="bg-zinc-955 p-4 rounded-xl border border-zinc-850">
                          <strong className="text-zinc-300 font-bold block mb-1 text-xs">Scenario A: The APIPA Fallback (No DHCP Response)</strong>
                          <p className="text-xs text-zinc-500 leading-relaxed">
                            <strong>Problem:</strong> If a client sends a DHCP Discover broadcast but receives no response (either the server is cabled down or the DHCP daemon is offline), the client fails to obtain an IP lease. <br />
                            <strong>Result:</strong> Windows/Linux adapters fallback to <strong>APIPA (Automatic Private IP Addressing)</strong>, assigning a link-local address in the range <code>169.254.0.0/16</code>. APIPA prevents routing beyond the local subnet segment.
                          </p>
                        </div>
                        <div className="bg-zinc-955 p-4 rounded-xl border border-zinc-850">
                          <strong className="text-zinc-300 font-bold block mb-1 text-xs">Scenario B: DNS IP Configuration Mismatch</strong>
                          <p className="text-xs text-zinc-500 leading-relaxed">
                            <strong>Problem:</strong> A client successfully leases an IP from a DHCP pool, but the DHCP pool settings hold an incorrect DNS server address. <br />
                            <strong>Result:</strong> When typing <code>academy.cisco</code>, the client queries the wrong DNS IP. The resolution fails, and the browser cannot resolve the web host address, even if the web server itself is reachable.
                          </p>
                        </div>
                        <div className="bg-zinc-955 p-4 rounded-xl border border-zinc-850">
                          <strong className="text-zinc-300 font-bold block mb-1 text-xs">Scenario C: HTTP Socket Connection Refused</strong>
                          <p className="text-xs text-zinc-500 leading-relaxed">
                            <strong>Problem:</strong> The client successfully leases an IP and resolves the domain host <code>academy.cisco</code> to <code>192.168.1.254</code>. However, the HTTP service daemon on the server is disabled. <br />
                            <strong>Result:</strong> The client sends a TCP SYN packet requesting a connection on Port 80. The server receives it but responds with a TCP RST (Reset) flag, refusing the connection. The browser displays a connection refused socket error.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2">
                      <a 
                        href="https://www.youtube.com/watch?v=Jm3UoM2tMsk" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-bold text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all uppercase tracking-wider"
                      >
                        <Play className="w-3 h-3 text-zinc-450 fill-zinc-600" />
                        Watch Tutorial Video
                        <ExternalLink className="w-3 h-3 text-zinc-500" />
                      </a>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}
