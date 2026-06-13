"use client";

import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { 
  BookOpen, 
  Search, 
  Copy, 
  Check, 
  Layers, 
  Award, 
  ListFilter, 
  Terminal, 
  ShieldCheck, 
  ExternalLink,
  Sparkles
} from "lucide-react";
import Link from "next/link";

// Types
interface CommandItem {
  command: string;
  description: string;
  category: string;
}

interface VocabItem {
  term: string;
  definition: string;
  category: string;
}

interface TopologyItem {
  id: string;
  name: string;
  objective: string;
  explanation: string;
  configCommands: string;
  verificationCommands: string;
}

// 1. Curated Syllabus Data
const syllabusDomains = [
  {
    title: "1.0 Network Fundamentals",
    weight: "20%",
    topics: [
      "1.1 Explain the role and function of network components (routers, switches, firewalls, APs, WLCs, endpoints, servers)",
      "1.2 Describe characteristics of network topology architectures (2-tier, 3-tier, spine-leaf, WAN, SOHO, cloud, on-premises)",
      "1.3 Compare physical interface and cabling types (fiber, copper, connections, speed, duplex)",
      "1.4 Identify interface and cable issues (collisions, errors, mismatch duplex, speed)",
      "1.5 Compare TCP to UDP (connection-oriented vs connectionless, reliability, headers)",
      "1.6 Configure and verify IPv4 addressing and subnetting",
      "1.7 Describe private IPv4 addressing (RFC 1918 ranges)",
      "1.8 Configure and verify IPv6 addressing and prefix",
      "1.9 Describe IPv6 address types (unicast, multicast, link-local, loopback, unique local, global unicast)",
      "1.10 Verify IP parameters for Client OS (Windows, Mac OS, Linux)",
      "1.11 Describe wireless principles (SSID, RF, channels, encryption, basic AP configurations)",
      "1.12 Explain virtualization fundamentals (hypervisors, virtual machines, containers, VRFs)",
      "1.13 Describe switching concepts (MAC learning, aging, frame switching, flood/filter)"
    ]
  },
  {
    title: "2.0 Network Access",
    weight: "20%",
    topics: [
      "2.1 Configure and verify VLANs (normal range) spanning multiple switches",
      "2.2 Configure and verify interswitch connectivity (trunk ports, native VLANs, allowed VLANs)",
      "2.3 Configure and verify Layer 2 discovery protocols (Cisco Discovery Protocol and LLDP)",
      "2.4 Configure and verify (Layer 2 / Layer 3) EtherChannel (LACP)",
      "2.5 Interpret basic operations of Rapid PVST+ Spanning Tree Protocol (root bridge election, port roles/states)",
      "2.6 Describe Wireless Architectures and AP modes",
      "2.7 Describe physical infrastructure connections of WLAN components (AP, WLC, access/trunk ports, LAG)",
      "2.8 Describe network device management access (Telnet, SSH, HTTP, HTTPS, console, TACACS+/RADIUS, cloud managed)",
      "2.9 Interpret the wireless LAN GUI configuration for client connectivity (WLAN creation, security, QoS, advanced)"
    ]
  },
  {
    title: "3.0 IP Connectivity",
    weight: "25%",
    topics: [
      "3.1 Interpret the components of a routing table (protocol codes, AD, metric, prefix, next-hop, gateway of last resort)",
      "3.2 Determine how a router makes a forwarding decision by default (longest prefix match, AD, routing protocol metric)",
      "3.3 Configure and verify IPv4 and IPv6 static routing (default, network, host, floating)",
      "3.4 Configure and verify single area OSPFv2 (neighbor adjacencies, point-to-point, broadcast, DR/BDR election)",
      "3.5 Describe the purpose, functions, and concepts of first hop redundancy protocols (HSRP, VRRP, GLBP)"
    ]
  },
  {
    title: "4.0 IP Services",
    weight: "10%",
    topics: [
      "4.1 Configure and verify inside source NAT using static and pools",
      "4.2 Configure and verify NTP operating in a client and server mode",
      "4.3 Explain the role of DHCP and DNS within the network",
      "4.4 Explain the function of SNMP in network operations",
      "4.5 Describe the use of syslog features including facilities and levels",
      "4.6 Configure and verify DHCP client and relay",
      "4.7 Explain the forwarding per-hop behavior (PHB) for QoS (classification, marking, queuing, congestion, policing, shaping)",
      "4.8 Configure network devices for remote access using SSH",
      "4.9 Describe the capabilities and functions of TFTP/FTP in the network"
    ]
  },
  {
    title: "5.0 Security Fundamentals",
    weight: "15%",
    topics: [
      "5.1 Define key security concepts (threats, vulnerabilities, exploits, and mitigation techniques)",
      "5.2 Describe security program elements (user awareness, training, physical access control)",
      "5.3 Configure and verify device access control using local passwords",
      "5.4 Describe security password policies elements (complexity, management, alternatives like MFA, biometrics)",
      "5.5 Describe IPsec remote access and site-to-site VPNs",
      "5.6 Configure and verify access control lists (Standard and Extended)",
      "5.7 Configure and verify Layer 2 security features (DHCP snooping, dynamic ARP inspection, and port security)",
      "5.8 Compare AAA (authentication, authorization, and accounting) concepts",
      "5.9 Describe wireless security protocols (WPA, WPA2, WPA3)",
      "5.10 Configure and verify WLAN within the GUI using WPA2 PSK"
    ]
  },
  {
    title: "6.0 Automation and Programmability",
    weight: "10%",
    topics: [
      "6.1 Explain how automation impacts network management",
      "6.2 Compare traditional networks with controller-based networking",
      "6.3 Describe controller-based, software defined architecture (overlay, underlay, fabric)",
      "6.4 Explain AI (generative and predictive) and machine learning in network operations",
      "6.5 Describe characteristics of REST-based APIs (auth types, CRUD, HTTP verbs, and data encoding JSON/XML)",
      "6.6 Recognize the capabilities of configuration management mechanisms (Ansible, Puppet, Chef, Terraform)",
      "6.7 Recognize components of JSON-encoded data"
    ]
  }
];

// 2. Full Vocabulary List
const vocabPool: VocabItem[] = [
  { term: "APIs & REST APIs", definition: "Application Programming Interfaces. Published vendor instructions that enable developers to send programmatic requests for service or data and receive structured outputs.", category: "Automation" },
  { term: "Attack Surface", definition: "A collection of all potential entry paths or vulnerabilities that an attacker or malicious application can exploit to compromise system data.", category: "Security" },
  { term: "AAA & RADIUS", definition: "Authentication, Authorization, and Accounting. Framework to control network access, enforce permissions, and audit user activity.", category: "Security" },
  { term: "CI/CD Pipeline", definition: "Continuous Integration / Continuous Development. Automated system to build, test, and merge code changes in small increments, minimizing deployment errors.", category: "Automation" },
  { term: "Data Formats", definition: "Structured data representations (XML, JSON, YAML) that are both human-readable and machine-readable, widely used in API communications.", category: "Automation" },
  { term: "DevOps", definition: "The combination of Development and Operations. Focuses on automation, CI/CD, and coding infrastructure changes (Infrastructure as Code) to align business speed with network stability.", category: "Automation" },
  { term: "DNS", definition: "Domain Name Service. Layer 7 protocol that translates human-readable domain names (e.g. facebook.com) into numerical IP addresses.", category: "IP Services" },
  { term: "Virtualization & Containers", definition: "Virtual Machines emulate physical hardware systems using a hypervisor. Containers isolate specific software runtimes and dependencies, package-sharing the host OS kernel.", category: "Fundamentals" },
  { term: "IP Address & OSI Stack", definition: "IP addresses are Layer 3 logical coordinates. The OSI Model is a 7-Layer theoretical framework; TCP/IP is a 4-Layer practical network stack.", category: "Fundamentals" },
  { term: "Malware Analysis", definition: "The process of determining the functionality, origin, security footprint, and overall potential threat vector of malicious code.", category: "Security" },
  { term: "NAT", definition: "Network Address Translation. Maps private IP addresses (RFC 1918) to public IP addresses, conserving IPv4 space and providing security routing boundaries.", category: "IP Services" },
  { term: "YANG, RESTCONF, NETCONF", definition: "YANG is a data modeling language used to structure configuration and state data. NETCONF (SSH-based) and RESTCONF (HTTP-based) are protocols to send/modify YANG data.", category: "Automation" },
  { term: "Packet", definition: "A Layer 3 Protocol Data Unit (PDU) composed of routing headers (source/destination IPs), checksums, and payload data.", category: "Fundamentals" },
  { term: "Python", definition: "Interpreted programming language emphasizing readability. The primary script language used to run scripts, interact with REST APIs, and drive network automation.", category: "Automation" },
  { term: "Role-Based Access Control (RBAC)", definition: "Restricting system access and execution permissions to authorized users based on their defined job title and responsibilities.", category: "Security" },
  { term: "Router", definition: "A Layer 3 device that connects separate logical subnets, makes forwarding decisions based on IP addresses, and decrements packet TTL.", category: "Fundamentals" },
  { term: "Routing Protocols (OSPF/EIGRP/BGP)", definition: "Dynamic algorithms that map networks and exchange route advertisements to dynamically calculate optimal forwarding tables.", category: "IP Connectivity" },
  { term: "SIEM", definition: "Security Information and Event Management. Centralized system that aggregates, correlates, and analyzes security logs from multiple network devices to generate alerts.", category: "Security" },
  { term: "SOAR", definition: "Security Orchestration, Automation, and Response. Automated system that integrates with SIEM to execute security incident response workflows without human intervention.", category: "Security" },
  { term: "SDK", definition: "Software Development Kit. Collection of developer tools, code libraries, and documentation used to write applications targeting a specific API platform.", category: "Automation" },
  { term: "Switch", definition: "A Layer 2 device that builds a MAC Address Table and filters or forwards frames within a local area network (VLAN segment).", category: "Fundamentals" },
  { term: "Threat Hunting", definition: "The proactive process of searching across network hosts and security databases to detect advanced, undetected threats.", category: "Security" },
  { term: "VLAN", definition: "Virtual Local Area Network. A logical segmentation of a physical network at Layer 2 to isolate broadcast domains and control access.", category: "Network Access" }
];

// 3. Complete IOS commands list
const commandsPool: CommandItem[] = [
  { command: "enable", description: "Moves from User EXEC mode (Router>) to Privileged EXEC mode (Router#) to view stats.", category: "Device Access" },
  { command: "disable", description: "Returns from Privileged EXEC mode to User EXEC mode.", category: "Device Access" },
  { command: "configure terminal", description: "Enters global configuration mode (Router(config)#).", category: "Device Access" },
  { command: "exit", description: "Exits current configuration mode, going back one level in CLI hierarchy.", category: "Device Access" },
  { command: "end", description: "Immediately returns to privileged EXEC mode from any configuration level.", category: "Device Access" },
  { command: "line console 0", description: "Enters console port configuration mode to apply local line settings.", category: "Line Config" },
  { command: "line vty 0 4", description: "Enters virtual terminal (VTY) mode for remote Telnet/SSH access limits.", category: "Line Config" },
  { command: "password <password>", description: "Sets a password for console or VTY line access.", category: "Security" },
  { command: "login", description: "Instructs the line interface to prompt for a password at login.", category: "Security" },
  { command: "logging synchronous", description: "Prevents console system logging updates from interrupting active typing.", category: "Line Config" },
  { command: "transport input {all | ssh | telnet}", description: "Restricts line access to specified connection protocols (SSH recommended).", category: "Security" },
  { command: "service password-encryption", description: "Encrypts plain-text passwords in the running configuration file.", category: "Security" },
  { command: "enable secret <password>", description: "Applies a highly-secure MD5/SHA encrypted password for privileged access.", category: "Security" },
  { command: "hostname <name>", description: "Configures the logical identity/hostname of the switch or router.", category: "Basic Config" },
  { command: "banner motd # <msg> #", description: "Applies a login message banner (delimited by # symbol).", category: "Basic Config" },
  { command: "no ip domain-lookup", description: "Disables DNS host lookup resolution on mistyped commands to prevent CLI lockups.", category: "Basic Config" },
  { command: "interface <type> <num>", description: "Enters configuration mode for a physical/logical interface.", category: "Interfaces" },
  { command: "ip address <ip> <mask>", description: "Binds an IP address and subnet mask to the active interface.", category: "Interfaces" },
  { command: "no shutdown", description: "Enables and boots up the active interface.", category: "Interfaces" },
  { command: "shutdown", description: "Disables and shuts down the active interface.", category: "Interfaces" },
  { command: "description <text>", description: "Adds a descriptive label metadata text to an interface.", category: "Interfaces" },
  { command: "switchport mode access", description: "Sets the switchport to operate as an access port connected to endpoints.", category: "VLANs & Trunking" },
  { command: "switchport mode trunk", description: "Sets the port as an 802.1Q trunk link to carry multiple VLAN tags.", category: "VLANs & Trunking" },
  { command: "switchport access vlan <vlan-id>", description: "Assigns the access switchport to a specific VLAN membership.", category: "VLANs & Trunking" },
  { command: "switchport trunk allowed vlan <vlan-list>", description: "Defines which VLANs are permitted to travel across the trunk link.", category: "VLANs & Trunking" },
  { command: "switchport trunk native vlan <vlan-id>", description: "Defines the untagged VLAN framework for native trunk traffic.", category: "VLANs & Trunking" },
  { command: "vlan <vlan-id>", description: "Creates a VLAN database ID and enters VLAN config mode.", category: "VLANs & Trunking" },
  { command: "name <vlan-name>", description: "Assigns a custom name tag to the active VLAN.", category: "VLANs & Trunking" },
  { command: "interface vlan <vlan-id>", description: "Creates or enters a Switch Virtual Interface (SVI) for routing / management.", category: "Interfaces" },
  { command: "ip default-gateway <ip>", description: "Configures default gateway IP for Layer 2 switches to allow remote management.", category: "Basic Config" },
  { command: "ip route <net> <mask> {hop|int}", description: "Configures a static route pointing to a destination subnet.", category: "Routing" },
  { command: "ip route 0.0.0.0 0.0.0.0 {hop|int}", description: "Configures a default gateway route (gateway of last resort).", category: "Routing" },
  { command: "router ospf <proc-id>", description: "Enables OSPFv2 dynamic routing protocol.", category: "Routing" },
  { command: "network <ip> <wildcard> area <id>", description: "Advertises a subnet range to OSPF neighbors.", category: "Routing" },
  { command: "passive-interface <int-name>", description: "Blocks OSPF hello messages from exiting an interface while still advertising the subnet.", category: "Routing" },
  { command: "show ip protocols", description: "Displays diagnostic stats of active dynamic routing protocols.", category: "Troubleshooting" },
  { command: "show running-config", description: "Displays active configuration currently running in volatile RAM.", category: "Troubleshooting" },
  { command: "show startup-config", description: "Displays startup configuration stored in non-volatile NVRAM.", category: "Troubleshooting" },
  { command: "show ip interface brief", description: "Prints a concise summary table of interface status and IP bindings.", category: "Troubleshooting" },
  { command: "show ip route", description: "Displays the active Layer 3 routing forwarding table.", category: "Troubleshooting" },
  { command: "show cdp neighbors", description: "Displays directly-connected Cisco neighbor devices.", category: "Troubleshooting" },
  { command: "show vlan brief", description: "Displays switch VLAN database and port mappings.", category: "Troubleshooting" },
  { command: "show mac address-table", description: "Displays Layer 2 learned MAC address bindings on switch ports.", category: "Troubleshooting" },
  { command: "show interface trunk", description: "Displays active trunk links, encapsulations, and native VLANs.", category: "Troubleshooting" },
  { command: "show version", description: "Displays device uptime, hardware info, and active IOS software version.", category: "Troubleshooting" },
  { command: "ping <ip-address>", description: "Sends ICMP echo requests to verify network connectivity.", category: "Troubleshooting" },
  { command: "traceroute <ip-address>", description: "Traces the Layer 3 path hops a packet takes to reach a destination.", category: "Troubleshooting" }
];

// 4. CCNA Topology List
const topologiesPool: TopologyItem[] = [
  {
    id: "vlan-routing",
    name: "Router-on-a-Stick (Inter-VLAN)",
    objective: "Configure subinterfaces on Router R1 to route packets between VLAN 10 (Sales: 192.168.10.0/24) and VLAN 20 (Marketing: 192.168.20.0/24) over a single physical 802.1Q trunk link.",
    explanation: "Switches segment broadcast domains at Layer 2, meaning VLAN 10 and VLAN 20 hosts cannot communicate directly. To perform Inter-VLAN routing, Router R1 connects to Switch SW1 via a single physical interface (Gig0/0) configured as a trunk. By configuring logical subinterfaces (Gig0/0.10 and Gig0/0.20) with 802.1Q encapsulation, each subinterface acts as a default gateway for its respective VLAN subnet. SW1 tags outgoing traffic and forwards it to R1, which decapsulates, routes, re-encapsulates with the destination VLAN tag, and returns it to the switch.",
    configCommands: `! ==========================================
! SWITCH (SW1) CONFIGURATION
! ==========================================
vlan 10
 name Sales
vlan 20
 name Marketing
exit

! Configure access ports for endpoints
interface FastEthernet0/1
 switchport mode access
 switchport access vlan 10
 no shutdown

interface FastEthernet0/2
 switchport mode access
 switchport access vlan 20
 no shutdown

! Configure trunk link to Router
interface GigabitEthernet0/1
 switchport mode trunk
 switchport trunk allowed vlan 10,20
 no shutdown

! ==========================================
! ROUTER (R1) CONFIGURATION
! ==========================================
! Enable the physical interface (no IP assigned)
interface GigabitEthernet0/0
 no shutdown

! Configure subinterface for VLAN 10
interface GigabitEthernet0/0.10
 encapsulation dot1Q 10
 ip address 192.168.10.1 255.255.255.0

! Configure subinterface for VLAN 20
interface GigabitEthernet0/0.20
 encapsulation dot1Q 20
 ip address 192.168.20.1 255.255.255.0`,
    verificationCommands: `! Verify router interface statuses & subinterface bindings
show ip interface brief

! View the router's active routing table
show ip route

! View switch's active trunk links
show interface trunk

! View switch's VLAN database
show vlan brief`
  },
  {
    id: "ospf-routing",
    name: "Single-Area OSPFv2 Routing",
    objective: "Establish a Single-Area OSPFv2 dynamic routing adjacency in Area 0 between R1 and R2, and advertise local loopback prefixes.",
    explanation: "OSPF is a link-state routing protocol. Routers R1 and R2 send Hello packets to multicast address 224.0.0.5 (or IP protocol 89) to discover neighbors. After achieving a FULL state, they swap Link State Advertisements (LSAs) to form an identical database of the network topology. Using Dijkstra's Shortest Path First (SPF) algorithm, each router independently computes the path with the lowest cumulative cost (Reference Bandwidth / Interface Bandwidth) and installs those paths into the IP routing table.",
    configCommands: `! ==========================================
! ROUTER R1 CONFIGURATION
! ==========================================
interface Loopback0
 ip address 1.1.1.1 255.255.255.255

interface GigabitEthernet0/0
 ip address 10.1.12.1 255.255.255.252
 no shutdown

! Configure OSPF process 1
router ospf 1
 router-id 1.1.1.1
 ! Advertise serial interface subnet
 network 10.1.12.0 0.0.0.3 area 0
 ! Advertise Loopback prefix
 network 1.1.1.1 0.0.0.0 area 0

! ==========================================
! ROUTER R2 CONFIGURATION
! ==========================================
interface Loopback0
 ip address 2.2.2.2 255.255.255.255

interface GigabitEthernet0/0
 ip address 10.1.12.2 255.255.255.252
 no shutdown

! Configure OSPF process 1
router ospf 1
 router-id 2.2.2.2
 network 10.1.12.0 0.0.0.3 area 0
 network 2.2.2.2 0.0.0.0 area 0`,
    verificationCommands: `! Verify OSPF neighbor adjacencies (should show FULL)
show ip ospf neighbor

! View OSPF learned routes in the routing table
show ip route ospf

! Inspect the OSPF Link-State Database (LSDB)
show ip ospf database

! Verify interface cost and parameters
show ip ospf interface`
  },
  {
    id: "nat-pat",
    name: "NAT Overload (PAT)",
    objective: "Configure Port Address Translation (PAT) on Router R1 to translate inside LAN private hosts (192.168.1.0/24) to a single public IP address (203.0.113.1) assigned to its outside WAN interface.",
    explanation: "Private RFC 1918 addresses are not routable on the public Internet. NAT Overload (PAT) allows thousands of internal hosts to access public resources using a single public IP. When a client sends a packet, R1 intercepts it, changes the source IP from the private address to R1's public WAN IP, and maps the connection by generating a unique source port. R1 records this in its Translation Table. When a reply arrives, R1 checks the destination port, translates it back to the private client IP, and forwards the packet inbound.",
    configCommands: `! ==========================================
! ROUTER R1 CONFIGURATION
! ==========================================
! Define NAT inside interface
interface GigabitEthernet0/0
 ip address 192.168.1.1 255.255.255.0
 ip nat inside
 no shutdown

! Define NAT outside interface (WAN)
interface GigabitEthernet0/1
 ip address 203.0.113.1 255.255.255.252
 ip nat outside
 no shutdown

! Define ACL to permit LAN traffic to be translated
access-list 1 permit 192.168.1.0 0.0.0.255

! Apply PAT mapping access-list 1 to WAN interface with overload
ip nat inside source list 1 interface GigabitEthernet0/1 overload

! Add default route pointing to ISP Gateway
ip route 0.0.0.0 0.0.0.0 203.0.113.2`,
    verificationCommands: `! View active translation sessions (displays port maps)
show ip nat translations

! Inspect NAT statistics, hits, and interface configurations
show ip nat statistics

! Trace IP translation in real time (caution: verbose!)
debug ip nat`
  },
  {
    id: "hsrp-redundancy",
    name: "HSRP Gateway Redundancy",
    objective: "Configure HSRP (Hot Standby Router Protocol) Group 1 between R1 (Active) and R2 (Standby) to provide default gateway high availability (Virtual IP: 192.168.1.1) to clients on the subnet.",
    explanation: "HSRP is a Cisco-proprietary Layer 3 First Hop Redundancy Protocol (FHRP). Routers R1 and R2 are grouped into a virtual router sharing Virtual IP 192.168.1.1 and Virtual MAC 0000.0c07.ac01. R1 has a higher priority (110) and is elected 'Active' to forward packets. R2 (Priority 100) becomes 'Standby'. If R1 fails or loses connection, R2 ceases to receive multicast HSRP hello packets, transitions to the 'Active' state, and assumes the Virtual IP/MAC. Preemption is enabled to let R1 reclaim the Active role if it recovers.",
    configCommands: `! ==========================================
! ROUTER R1 (ACTIVE GATEWAY)
! ==========================================
interface GigabitEthernet0/0
 ip address 192.168.1.2 255.255.255.0
 no shutdown
 ! Enable HSRP Group 1 & set Virtual IP
 standby 1 ip 192.168.1.1
 ! Set priority higher than default (100)
 standby 1 priority 110
 ! Allow R1 to take back Active role after recovering
 standby 1 preempt

! ==========================================
! ROUTER R2 (STANDBY GATEWAY)
! ==========================================
interface GigabitEthernet0/0
 ip address 192.168.1.3 255.255.255.0
 no shutdown
 standby 1 ip 192.168.1.1
 standby 1 priority 100
 standby 1 preempt`,
    verificationCommands: `! View HSRP status, active/standby state, virtual IP/MAC
show standby

! Print a concise summary of active standby groups
show standby brief

! Verify client's ARP cache contains virtual MAC (0000.0c07.ac01)
arp -a (on Client OS)`
  },
  {
    id: "virtual-bridge",
    name: "Virtual Bridge Network",
    objective: "Configure a Virtual Switch (vSwitch) on a Linux KVM Hypervisor to bridge virtual machines VM-A (192.168.1.10) and VM-B (192.168.1.20) directly to the physical LAN interface (eth0).",
    explanation: "In modern cloud and virtualization setups, virtual machines require access to the physical network. A Virtual Bridge (vSwitch) operates at Layer 2 in software. By creating a bridge interface (e.g. br0) and binding the physical Ethernet interface (eth0) along with virtual machine tap adapters (vnet0, vnet1) to it, we form a single broadcast domain. Frames entering the bridge from the VMs are forwarded to the physical switch using MAC address learning, allowing virtual machines to communicate directly with physical DHCP servers, routers, and other hosts on the same physical subnet without NAT.",
    configCommands: `# ==========================================
# HYPERVISOR (LINUX KVM) BRIDGE CONFIG
# ==========================================
# 1. Create the bridge interface (br0)
sudo ip link add name br0 type bridge

# 2. Add physical interface (eth0) to the bridge
sudo ip link set dev eth0 master br0

# 3. Bring up the bridge and physical interface
sudo ip link set dev br0 up
sudo ip link set dev eth0 up

# 4. (Optional) Move host IP from eth0 to br0 for management
sudo ip addr del 192.168.1.100/24 dev eth0
sudo ip addr add 192.168.1.100/24 dev br0
sudo ip route add default via 192.168.1.1 dev br0

# 5. Bind VM interfaces (vnet0, vnet1) to the bridge
sudo ip link set dev vnet0 master br0
sudo ip link set dev vnet1 master br0`,
    verificationCommands: `# View active bridges and their bound interfaces
ip link show type bridge
bridge link show

# Check Learned MAC addresses on the bridge
bridge fdb show br br0

# Verify connectivity from a VM
ping -c 4 192.168.1.1 (Gateway IP)`
  },
  {
    id: "ids-ips",
    name: "IDS vs IPS Deployment",
    objective: "Configure SPAN (Port Mirroring) on a Cisco Switch to redirect a copy of LAN traffic to a passive IDS for threat analysis, and configure a Cisco IPS in inline mode to intercept and actively drop malicious packets.",
    explanation: "Network Security devices can be deployed in two primary configurations:\n\n1. **IDS (Intrusion Detection System)**: Deployed **Out-of-Band (Passive)**. A Cisco Switch uses SPAN (Switch Port Analyzer) to mirror all traffic from source ports (e.g. Gig0/1) to a destination port connected to the IDS. The IDS analyses the duplicate frames. If an intrusion is detected, it logs an alert or sends a syslog warning, but **cannot block the threat in real-time**.\n\n2. **IPS (Intrusion Prevention System)**: Deployed **Inline (Active)**. All network traffic flows physically *through* the IPS sensor. If a packet matches a threat signature, the IPS immediately drops the packet and blocks the source IP, **preventing the threat from reaching the target network**.",
    configCommands: `! ==========================================
! IDS SETUP: CISCO SPAN (PORT MIRRORING)
! ==========================================
! 1. Define traffic source port (monitored interface)
monitor session 1 source interface GigabitEthernet0/1 both

! 2. Define destination port (connected to IDS sensor)
monitor session 1 destination interface GigabitEthernet0/24

! ==========================================
! IPS SETUP: INLINE INTERFACE CONFIG
! (Cisco IPS / Firepower Threat Defense)
! ==========================================
! Configure pair of interfaces in inline mode (Bridge Group)
interface GigabitEthernet0/2
 description INLINE INGRESS (From WAN)
 bridge-group 1
 no shutdown

interface GigabitEthernet0/3
 description INLINE EGRESS (To Inside LAN)
 bridge-group 1
 no shutdown

interface bvi 1
 ip address 192.168.1.5 255.255.255.0
 no shutdown`,
    verificationCommands: `! Verify SPAN monitor session details on switch
show monitor session 1

! View active threat signature hits on Firepower/IPS
show ips statistics
show service-policy interface`
  }
];

// Helper to render interactive SVGs
function renderTopologySvg(id: string) {
  switch (id) {
    case "vlan-routing":
      return (
        <svg viewBox="0 0 400 240" className="w-full max-w-[400px] h-full" xmlns="http://www.w3.org/2000/svg">
          <style>{`
            .flow-v10 { stroke: #22d3ee; stroke-dasharray: 5 5; animation: dataFlow 2.5s infinite linear; }
            .flow-v20 { stroke: #fb7185; stroke-dasharray: 5 5; animation: dataFlow 2.5s infinite linear reverse; }
            .node-router { fill: #0f172a; stroke: #06b6d4; stroke-width: 2; }
            .node-switch { fill: #0f172a; stroke: #64748b; stroke-width: 2; }
            .vlan10-node { fill: #083344; stroke: #22d3ee; stroke-width: 1.5; }
            .vlan20-node { fill: #4c0519; stroke: #fb7185; stroke-width: 1.5; }
            @keyframes dataFlow { to { stroke-dashoffset: -20; } }
          `}</style>
          <path d="M 200 50 L 200 120" stroke="#06b6d4" strokeWidth="3" />
          <path d="M 197 50 L 197 120" className="flow-v10" strokeWidth="1.5" />
          <path d="M 203 120 L 203 50" className="flow-v20" strokeWidth="1.5" />
          
          <path d="M 200 120 L 100 190" stroke="#22d3ee" strokeWidth="2" />
          <path d="M 200 120 L 100 190" className="flow-v10" strokeWidth="1" />
          
          <path d="M 200 120 L 300 190" stroke="#fb7185" strokeWidth="2" />
          <path d="M 300 190 L 200 120" className="flow-v20" strokeWidth="1" />
          
          <g transform="translate(180, 20)">
            <rect x="0" y="5" width="40" height="20" rx="10" className="node-router" />
            <ellipse cx="20" cy="5" rx="20" ry="5" fill="#0e7490" stroke="#06b6d4" strokeWidth="2" />
            <ellipse cx="20" cy="25" rx="20" ry="5" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
            <text x="20" y="17" fill="#e0f7fa" fontFamily="monospace" fontSize="8" fontWeight="bold" textAnchor="middle">R1</text>
          </g>
          <text x="235" y="70" fill="#06b6d4" fontFamily="monospace" fontSize="7" fontWeight="bold">Gig0/0.10 &amp; .20</text>
          <text x="235" y="80" fill="#475569" fontFamily="monospace" fontSize="6">(Trunk: 802.1Q)</text>
          
          <g transform="translate(180, 105)">
            <rect x="0" y="0" width="40" height="30" rx="4" className="node-switch" />
            <path d="M 5 15 L 35 15 M 10 10 L 5 15 L 10 20 M 30 10 L 35 15 L 30 20" stroke="#94a3b8" strokeWidth="1" fill="none" />
            <path d="M 20 5 L 20 25 M 15 10 L 20 5 L 25 10 M 15 20 L 20 25 L 25 20" stroke="#94a3b8" strokeWidth="1" fill="none" />
            <text x="20" y="38" fill="#94a3b8" fontFamily="monospace" fontSize="7" fontWeight="bold" textAnchor="middle">SW1</text>
          </g>
          
          <g transform="translate(80, 180)">
            <rect x="0" y="0" width="40" height="22" rx="3" className="vlan10-node" />
            <polygon points="10,22 30,22 35,28 5,28" className="vlan10-node" />
            <rect x="18" y="22" width="4" height="6" fill="#22d3ee" />
            <text x="20" y="14" fill="#e0f7fa" fontFamily="monospace" fontSize="8" fontWeight="bold" textAnchor="middle">PC-A</text>
            <text x="20" y="38" fill="#22d3ee" fontFamily="sans-serif" fontSize="7" fontWeight="bold" textAnchor="middle">VLAN 10</text>
            <text x="20" y="47" fill="#475569" fontFamily="monospace" fontSize="6" textAnchor="middle">192.168.10.50</text>
          </g>
          
          <g transform="translate(280, 180)">
            <rect x="0" y="0" width="40" height="22" rx="3" className="vlan20-node" />
            <polygon points="10,22 30,22 35,28 5,28" className="vlan20-node" />
            <rect x="18" y="22" width="4" height="6" fill="#fb7185" />
            <text x="20" y="14" fill="#ffe4e6" fontFamily="monospace" fontSize="8" fontWeight="bold" textAnchor="middle">PC-B</text>
            <text x="20" y="38" fill="#fb7185" fontFamily="sans-serif" fontSize="7" fontWeight="bold" textAnchor="middle">VLAN 20</text>
            <text x="20" y="47" fill="#475569" fontFamily="monospace" fontSize="6" textAnchor="middle">192.168.20.50</text>
          </g>
          <text x="122" y="150" fill="#22d3ee" fontFamily="monospace" fontSize="7" fontWeight="bold">Fa0/1</text>
          <text x="265" y="150" fill="#fb7185" fontFamily="monospace" fontSize="7" fontWeight="bold">Fa0/2</text>
        </svg>
      );
    case "ospf-routing":
      return (
        <svg viewBox="0 0 400 240" className="w-full max-w-[400px] h-full" xmlns="http://www.w3.org/2000/svg">
          <style>{`
            .link-cable { stroke: #3f3f46; stroke-width: 3; }
            .ospf-cloud { fill: rgba(16, 185, 129, 0.03); stroke: rgba(16, 185, 129, 0.2); stroke-dasharray: 4 4; stroke-width: 1.5; }
            .hello-pulse { fill: #10b981; stroke: #34d399; stroke-width: 1; animation: helloFlow 4s infinite linear; }
            .node-router { fill: #022c22; stroke: #10b981; stroke-width: 2; }
            .loopback { stroke: #10b981; fill: none; stroke-width: 1; stroke-dasharray: 2 2; }
            @keyframes helloFlow {
              0% { cx: 110; cy: 120; opacity: 0; }
              10% { opacity: 1; }
              45% { cx: 200; cy: 120; }
              55% { cx: 200; cy: 120; }
              90% { opacity: 1; }
              100% { cx: 290; cy: 120; opacity: 0; }
            }
          `}</style>
          <path d="M 80 120 C 80 70, 120 60, 200 60 C 280 60, 320 70, 320 120 C 320 170, 280 180, 200 180 C 120 180, 80 170, 80 120 Z" className="ospf-cloud" />
          <text x="200" y="80" fill="#34d399" fontFamily="sans-serif" fontSize="9" fontWeight="bold" textAnchor="middle" letterSpacing="1">OSPFv2 AREA 0</text>
          <line x1="110" y1="120" x2="290" y2="120" className="link-cable" />
          <text x="200" y="112" fill="#71717a" fontFamily="monospace" fontSize="8" textAnchor="middle">10.1.12.0/30</text>
          <circle cx="110" cy="120" r="4" className="hello-pulse" />
          <text x="200" y="137" fill="#10b981" fontFamily="sans-serif" fontSize="7" fontWeight="bold" textAnchor="middle" opacity="0.8">OSPF Hello (Protocol 89)</text>
          
          <g transform="translate(70, 100)">
            <rect x="0" y="5" width="40" height="20" rx="10" className="node-router" />
            <ellipse cx="20" cy="5" rx="20" ry="5" fill="#047857" stroke="#10b981" strokeWidth="2" />
            <ellipse cx="20" cy="25" rx="20" ry="5" fill="#022c22" stroke="#10b981" strokeWidth="2" />
            <text x="20" y="17" fill="#d1fae5" fontFamily="monospace" fontSize="8" fontWeight="bold" textAnchor="middle">R1</text>
            <text x="20" y="-8" fill="#10b981" fontFamily="monospace" fontSize="8" fontWeight="bold" textAnchor="middle">RID: 1.1.1.1</text>
            <text x="45" y="32" fill="#475569" fontFamily="monospace" fontSize="6">Gig0/0 (.1)</text>
            <circle cx="-10" cy="15" r="8" className="loopback" />
            <circle cx="-10" cy="15" r="2" fill="#10b981" />
            <text x="-10" y="31" fill="#475569" fontFamily="monospace" fontSize="6" textAnchor="middle">Lo0 (1.1.1.1)</text>
          </g>
          
          <g transform="translate(290, 100)">
            <rect x="0" y="5" width="40" height="20" rx="10" className="node-router" />
            <ellipse cx="20" cy="5" rx="20" ry="5" fill="#047857" stroke="#10b981" strokeWidth="2" />
            <ellipse cx="20" cy="25" rx="20" ry="5" fill="#022c22" stroke="#10b981" strokeWidth="2" />
            <text x="20" y="17" fill="#d1fae5" fontFamily="monospace" fontSize="8" fontWeight="bold" textAnchor="middle">R2</text>
            <text x="20" y="-8" fill="#10b981" fontFamily="monospace" fontSize="8" fontWeight="bold" textAnchor="middle">RID: 2.2.2.2</text>
            <text x="-5" y="32" fill="#475569" fontFamily="monospace" fontSize="6" textAnchor="end">(.2) Gig0/0</text>
            <circle cx="50" cy="15" r="8" className="loopback" />
            <circle cx="50" cy="15" r="2" fill="#10b981" />
            <text x="50" y="31" fill="#475569" fontFamily="monospace" fontSize="6" textAnchor="middle">Lo0 (2.2.2.2)</text>
          </g>
        </svg>
      );
    case "nat-pat":
      return (
        <svg viewBox="0 0 400 240" className="w-full max-w-[400px] h-full" xmlns="http://www.w3.org/2000/svg">
          <style>{`
            .inside-flow { fill: #38bdf8; stroke: #0284c7; stroke-width: 1; animation: natInFlow 3.5s infinite linear; }
            .outside-flow { fill: #f43f5e; stroke: #be123c; stroke-width: 1; animation: natOutFlow 3.5s infinite linear; }
            .node-router { fill: #18181b; stroke: #71717a; stroke-width: 2; }
            .node-pc { fill: #0f172a; stroke: #38bdf8; stroke-width: 1.5; }
            .node-isp { fill: #1c1917; stroke: #57534e; stroke-width: 1.5; }
            @keyframes natInFlow {
              0% { cx: 70; cy: 120; opacity: 0; }
              10% { opacity: 1; }
              50% { cx: 180; cy: 120; opacity: 1; }
              51% { opacity: 0; }
              100% { cx: 180; cy: 120; opacity: 0; }
            }
            @keyframes natOutFlow {
              0% { cx: 220; cy: 120; opacity: 0; }
              50% { cx: 220; cy: 120; opacity: 0; }
              51% { opacity: 1; }
              90% { opacity: 1; }
              100% { cx: 330; cy: 120; opacity: 0; }
            }
          `}</style>
          <line x1="200" y1="20" x2="200" y2="220" stroke="#27272a" strokeDasharray="4 4" strokeWidth="1" />
          <text x="100" y="30" fill="#38bdf8" fontFamily="sans-serif" fontSize="8" fontWeight="bold" textAnchor="middle">INSIDE (Private LAN)</text>
          <text x="300" y="30" fill="#f43f5e" fontFamily="sans-serif" fontSize="8" fontWeight="bold" textAnchor="middle">OUTSIDE (Public WAN)</text>
          <line x1="70" y1="120" x2="180" y2="120" stroke="#38bdf8" strokeWidth="2" />
          <line x1="220" y1="120" x2="330" y2="120" stroke="#f43f5e" strokeWidth="2" />
          <circle cx="70" cy="120" r="4.5" className="inside-flow" />
          <circle cx="220" cy="120" r="4.5" className="outside-flow" />
          <g transform="translate(60, 55)">
            <rect x="-10" y="0" width="100" height="28" rx="4" fill="rgba(9, 9, 11, 0.9)" stroke="#38bdf8" strokeWidth="0.5" />
            <text x="40" y="10" fill="#e0f2fe" fontFamily="monospace" fontSize="6" textAnchor="middle">Original Packet</text>
            <text x="40" y="20" fill="#38bdf8" fontFamily="monospace" fontSize="6" textAnchor="middle">Src: 192.168.1.50:5012</text>
          </g>
          <g transform="translate(250, 55)">
            <rect x="-10" y="0" width="100" height="28" rx="4" fill="rgba(9, 9, 11, 0.9)" stroke="#f43f5e" strokeWidth="0.5" />
            <text x="40" y="10" fill="#ffe4e6" fontFamily="monospace" fontSize="6" textAnchor="middle">NAT Translated</text>
            <text x="40" y="20" fill="#f43f5e" fontFamily="monospace" fontSize="6" textAnchor="middle">Src: 203.0.113.1:5012</text>
          </g>
          
          <g transform="translate(30, 105)">
            <rect x="0" y="0" width="40" height="22" rx="3" className="node-pc" />
            <polygon points="10,22 30,22 35,28 5,28" className="node-pc" />
            <text x="20" y="14" fill="#e0f2fe" fontFamily="monospace" fontSize="8" fontWeight="bold" textAnchor="middle">PC-A</text>
            <text x="20" y="42" fill="#475569" fontFamily="monospace" fontSize="6" textAnchor="middle">192.168.1.50</text>
          </g>
          
          <g transform="translate(180, 100)">
            <rect x="0" y="5" width="40" height="20" rx="10" className="node-router" />
            <ellipse cx="20" cy="5" rx="20" ry="5" fill="#52525b" stroke="#71717a" strokeWidth="2" />
            <ellipse cx="20" cy="25" rx="20" ry="5" fill="#18181b" stroke="#71717a" strokeWidth="2" />
            <text x="20" y="17" fill="#f4f4f5" fontFamily="monospace" fontSize="8" fontWeight="bold" textAnchor="middle">R1</text>
            <text x="-5" y="32" fill="#38bdf8" fontFamily="monospace" fontSize="6" textAnchor="end">inside</text>
            <text x="45" y="32" fill="#f43f5e" fontFamily="monospace" fontSize="6">outside (.1)</text>
          </g>
          
          <g transform="translate(330, 100)">
            <rect x="0" y="0" width="40" height="30" rx="3" className="node-isp" />
            <line x1="0" y1="10" x2="40" y2="10" stroke="#57534e" />
            <circle cx="20" cy="5" r="2.5" fill="#ef4444" />
            <text x="20" y="21" fill="#f5f5f4" fontFamily="monospace" fontSize="8" fontWeight="bold" textAnchor="middle">ISP</text>
            <text x="20" y="43" fill="#475569" fontFamily="monospace" fontSize="6" textAnchor="middle">8.8.8.8 (Web)</text>
          </g>
        </svg>
      );
    case "hsrp-redundancy":
      return (
        <svg viewBox="0 0 400 240" className="w-full max-w-[400px] h-full" xmlns="http://www.w3.org/2000/svg">
          <style>{`
            .hsrp-active { stroke: #10b981; stroke-width: 2.5; fill: none; }
            .hsrp-standby { stroke: #f59e0b; stroke-width: 1.5; stroke-dasharray: 2 2; fill: none; }
            .flow-active { fill: #10b981; stroke: #047857; stroke-width: 1; animation: activeFlow 2.5s infinite linear; }
            .node-router-act { fill: #064e3b; stroke: #10b981; stroke-width: 2; }
            .node-router-stby { fill: #78350f; stroke: #f59e0b; stroke-width: 2; }
            .node-switch { fill: #0f172a; stroke: #475569; stroke-width: 2; }
            @keyframes activeFlow {
              0% { cx: 200; cy: 190; opacity: 0; }
              10% { opacity: 1; }
              50% { cx: 200; cy: 120; }
              100% { cx: 130; cy: 50; opacity: 0; }
            }
          `}</style>
          <g transform="translate(180, 10)">
            <rect x="-30" y="0" width="100" height="28" rx="4" fill="rgba(9, 9, 11, 0.9)" stroke="#06b6d4" strokeWidth="1" />
            <text x="20" y="10" fill="#e0f7fa" fontFamily="sans-serif" fontSize="7" fontWeight="bold" textAnchor="middle">VIRTUAL ROUTER</text>
            <text x="20" y="20" fill="#06b6d4" fontFamily="monospace" fontSize="7" textAnchor="middle">IP: 192.168.1.1</text>
          </g>
          <path d="M 200 120 L 130 50" className="hsrp-active" />
          <circle cx="200" cy="190" r="4.5" className="flow-active" />
          <path d="M 200 120 L 270 50" className="hsrp-standby" />
          <path d="M 200 120 L 200 190" stroke="#475569" strokeWidth="2" />
          
          <g transform="translate(110, 30)">
            <rect x="0" y="5" width="40" height="20" rx="10" className="node-router-act" />
            <ellipse cx="20" cy="5" rx="20" ry="5" fill="#047857" stroke="#10b981" strokeWidth="2" />
            <ellipse cx="20" cy="25" rx="20" ry="5" fill="#022c22" stroke="#10b981" strokeWidth="2" />
            <text x="20" y="17" fill="#d1fae5" fontFamily="monospace" fontSize="8" fontWeight="bold" textAnchor="middle">R1</text>
            <text x="20" y="-8" fill="#10b981" fontFamily="sans-serif" fontSize="7" fontWeight="bold" textAnchor="middle">ACTIVE (110)</text>
            <text x="20" y="37" fill="#475569" fontFamily="monospace" fontSize="6" textAnchor="middle">192.168.1.2</text>
          </g>
          
          <g transform="translate(250, 30)">
            <rect x="0" y="5" width="40" height="20" rx="10" className="node-router-stby" />
            <ellipse cx="20" cy="5" rx="20" ry="5" fill="#b45309" stroke="#f59e0b" strokeWidth="2" />
            <ellipse cx="20" cy="25" rx="20" ry="5" fill="#78350f" stroke="#f59e0b" strokeWidth="2" />
            <text x="20" y="17" fill="#fef3c7" fontFamily="monospace" fontSize="8" fontWeight="bold" textAnchor="middle">R2</text>
            <text x="20" y="-8" fill="#f59e0b" fontFamily="sans-serif" fontSize="7" fontWeight="bold" textAnchor="middle">STANDBY (100)</text>
            <text x="20" y="37" fill="#475569" fontFamily="monospace" fontSize="6" textAnchor="middle">192.168.1.3</text>
          </g>
          
          <g transform="translate(180, 105)">
            <rect x="0" y="0" width="40" height="30" rx="4" className="node-switch" />
            <text x="20" y="38" fill="#94a3b8" fontFamily="monospace" fontSize="7" fontWeight="bold" textAnchor="middle">SW1</text>
          </g>
          
          <g transform="translate(180, 180)">
            <rect x="0" y="0" width="40" height="22" rx="3" fill="#09090b" stroke="#475569" strokeWidth="1.5" />
            <polygon points="10,22 30,22 35,28 5,28" fill="#09090b" stroke="#475569" strokeWidth="1.5" />
            <text x="20" y="14" fill="#f4f4f5" fontFamily="monospace" fontSize="8" fontWeight="bold" textAnchor="middle">Client</text>
            <text x="20" y="42" fill="#475569" fontFamily="monospace" fontSize="6" textAnchor="middle">GW: 192.168.1.1</text>
          </g>
        </svg>
      );
    case "virtual-bridge":
      return (
        <svg viewBox="0 0 400 240" className="w-full max-w-[400px] h-full" xmlns="http://www.w3.org/2000/svg">
          <style>{`
            .vm-node { fill: #172554; stroke: #3b82f6; stroke-width: 1.5; }
            .vbridge-box { fill: #0f172a; stroke: #06b6d4; stroke-width: 2; }
            .pnic-box { fill: #18181b; stroke: #71717a; stroke-width: 1.5; }
            .cable-wire { stroke: #3f3f46; stroke-width: 2; fill: none; }
            .active-wire { stroke: #06b6d4; stroke-width: 2; fill: none; }
            .data-dot { fill: #06b6d4; stroke: #22d3ee; stroke-width: 1; animation: bridgeFlow 3.5s infinite linear; }
            .host-border { fill: none; stroke: #27272a; stroke-width: 2; stroke-dasharray: 4 4; }
            @keyframes bridgeFlow {
              0% { cx: 120; cy: 60; opacity: 0; }
              10% { opacity: 1; }
              40% { cx: 120; cy: 115; }
              60% { cx: 200; cy: 115; }
              85% { cx: 200; cy: 155; }
              100% { cx: 200; cy: 220; opacity: 0; }
            }
          `}</style>
          
          <rect x="50" y="20" width="300" height="150" rx="8" className="host-border" />
          <text x="60" y="32" fill="#71717a" fontFamily="sans-serif" fontSize="7" fontWeight="bold">HYPERVISOR HOST (192.168.1.100)</text>
          
          <path d="M 120 70 L 120 100" className="active-wire" />
          <path d="M 280 70 L 280 100" stroke="#3f3f46" strokeWidth="2" />
          <path d="M 200 130 L 200 150" className="active-wire" />
          <path d="M 200 165 L 200 210" className="active-wire" />
          
          <circle cx="120" cy="70" r="4.5" className="data-dot" />
          
          <g transform="translate(120, 55)">
            <rect x="-20" y="0" width="40" height="20" rx="3" className="vm-node" />
            <text x="0" y="12" fill="#eff6ff" fontFamily="monospace" fontSize="8" fontWeight="bold" textAnchor="middle">VM-A</text>
            <text x="0" y="-4" fill="#3b82f6" fontFamily="monospace" fontSize="6" textAnchor="middle">192.168.1.10</text>
          </g>
          
          <g transform="translate(280, 55)">
            <rect x="-20" y="0" width="40" height="20" rx="3" className="vm-node" style={{ fill: "#1e1b4b", stroke: "#6366f1" }} />
            <text x="0" y="12" fill="#e0e7ff" fontFamily="monospace" fontSize="8" fontWeight="bold" textAnchor="middle">VM-B</text>
            <text x="0" y="-4" fill="#6366f1" fontFamily="monospace" fontSize="6" textAnchor="middle">192.168.1.20</text>
          </g>
          
          <g transform="translate(100, 100)">
            <rect x="0" y="0" width="200" height="30" rx="6" className="vbridge-box" />
            <text x="100" y="18" fill="#e0f7fa" fontFamily="sans-serif" fontSize="8" fontWeight="bold" textAnchor="middle" letterSpacing="0.5">VIRTUAL BRIDGE (br0)</text>
            <text x="15" y="19" fill="#06b6d4" fontFamily="monospace" fontSize="6">vnet0</text>
            <text x="185" y="19" fill="#06b6d4" fontFamily="monospace" fontSize="6" textAnchor="end">vnet1</text>
          </g>
          
          <g transform="translate(180, 150)">
            <rect x="0" y="0" width="40" height="15" rx="2" className="pnic-box" />
            <text x="20" y="10" fill="#a1a1aa" fontFamily="monospace" fontSize="7" fontWeight="bold" textAnchor="middle">eth0</text>
            <text x="45" y="11" fill="#71717a" fontFamily="sans-serif" fontSize="6">Phys NIC</text>
          </g>
          
          <g transform="translate(180, 210)">
            <rect x="-20" y="0" width="80" height="25" rx="3" fill="#09090b" stroke="#475569" strokeWidth="1.5" />
            <text x="20" y="15" fill="#f4f4f5" fontFamily="monospace" fontSize="8" fontWeight="bold" textAnchor="middle">PHYS SWITCH (SW1)</text>
          </g>
        </svg>
      );
    case "ids-ips":
      return (
        <svg viewBox="0 0 400 240" className="w-full max-w-[400px] h-full" xmlns="http://www.w3.org/2000/svg">
          <style>{`
            .net-node { fill: #0f172a; stroke: #475569; stroke-width: 1.5; }
            .node-ids { fill: #1e1b4b; stroke: #818cf8; stroke-width: 2; }
            .node-ips { fill: #4c0519; stroke: #f43f5e; stroke-width: 2; }
            .cable-wire { stroke: #3f3f46; stroke-width: 2; fill: none; }
            .span-wire { stroke: #818cf8; stroke-width: 1.5; stroke-dasharray: 3 3; fill: none; }
            .active-wire { stroke: #10b981; stroke-width: 2; fill: none; }
            .blocked-wire { stroke: #f43f5e; stroke-width: 1.5; stroke-dasharray: 3 3; fill: none; }
            
            .ids-normal-packet { fill: #06b6d4; animation: idsNormalFlow 3s infinite linear; }
            .ids-copied-packet { fill: #818cf8; animation: idsCopyFlow 3s infinite linear; }
            .ids-alert-bubble { animation: idsAlertPop 3s infinite ease-out; opacity: 0; }
            
            .ips-threat-packet { fill: #f43f5e; animation: ipsThreatFlow 3s infinite linear; }
            .ips-blocked-x { stroke: #ef4444; stroke-width: 2.5; fill: none; animation: ipsBlockShow 3s infinite ease-out; opacity: 0; }

            @keyframes idsNormalFlow {
              0% { cx: 50; cy: 70; opacity: 0; }
              10% { opacity: 1; }
              50% { cx: 100; cy: 140; }
              90% { opacity: 1; }
              100% { cx: 150; cy: 70; opacity: 0; }
            }
            @keyframes idsCopyFlow {
              0% { cx: 50; cy: 70; opacity: 0; }
              10% { opacity: 0; }
              50% { cx: 100; cy: 140; opacity: 1; }
              90% { cx: 50; cy: 190; opacity: 1; }
              100% { cx: 50; cy: 190; opacity: 0; }
            }
            @keyframes idsAlertPop {
              0%, 80% { opacity: 0; transform: scale(0.6) translate(0px, 0px); }
              85% { opacity: 1; transform: scale(1.1) translate(-2px, -2px); }
              90%, 100% { opacity: 1; transform: scale(1) translate(0px, 0px); }
            }
            @keyframes ipsThreatFlow {
              0% { cx: 250; cy: 70; opacity: 0; }
              10% { opacity: 1; }
              50% { cx: 300; cy: 130; opacity: 1; }
              51%, 100% { cx: 300; cy: 130; opacity: 0; }
            }
            @keyframes ipsBlockShow {
              0%, 45% { opacity: 0; transform: scale(0.5); }
              50% { opacity: 1; transform: scale(1.2); }
              60%, 100% { opacity: 1; transform: scale(1); }
            }
          `}</style>
          
          <line x1="200" y1="10" x2="200" y2="230" stroke="#27272a" strokeDasharray="4 4" strokeWidth="1" />
          <text x="100" y="25" fill="#818cf8" fontFamily="sans-serif" fontSize="8" fontWeight="bold" textAnchor="middle">IDS (Out-of-Band / Passive)</text>
          <text x="300" y="25" fill="#f43f5e" fontFamily="sans-serif" fontSize="8" fontWeight="bold" textAnchor="middle">IPS (Inline / Active)</text>

          <path d="M 50 70 L 100 140 L 150 70" className="cable-wire" />
          <path d="M 100 140 L 50 190" className="span-wire" />
          
          <circle cx="50" cy="70" r="4" className="ids-normal-packet" />
          <circle cx="50" cy="70" r="4" className="ids-copied-packet" />

          <g transform="translate(30, 50)">
            <rect x="0" y="0" width="40" height="20" rx="3" className="net-node" />
            <text x="20" y="12" fill="#94a3b8" fontFamily="monospace" fontSize="7" fontWeight="bold" textAnchor="middle">Client</text>
          </g>
          <g transform="translate(130, 50)">
            <rect x="0" y="0" width="40" height="20" rx="3" className="net-node" />
            <text x="20" y="12" fill="#94a3b8" fontFamily="monospace" fontSize="7" fontWeight="bold" textAnchor="middle">Server</text>
          </g>
          <g transform="translate(80, 125)">
            <rect x="0" y="0" width="40" height="30" rx="4" className="net-node" style={{ stroke: "#64748b" }} />
            <text x="20" y="18" fill="#94a3b8" fontFamily="monospace" fontSize="7" fontWeight="bold" textAnchor="middle">SW</text>
            <text x="20" y="38" fill="#818cf8" fontFamily="monospace" fontSize="6" fontWeight="bold" textAnchor="middle">SPAN Port</text>
          </g>
          <g transform="translate(30, 175)">
            <rect x="0" y="0" width="40" height="30" rx="3" className="node-ids" />
            <text x="20" y="18" fill="#e0e7ff" fontFamily="monospace" fontSize="8" fontWeight="bold" textAnchor="middle">IDS</text>
            <text x="20" y="38" fill="#818cf8" fontFamily="sans-serif" fontSize="6" textAnchor="middle">Passive</text>
            
            <g className="ids-alert-bubble" style={{ transformOrigin: "45px 5px" }}>
              <circle cx="45" cy="5" r="7" fill="#ef4444" />
              <text x="45" y="8" fill="#fff" fontFamily="sans-serif" fontSize="9" fontWeight="bold" textAnchor="middle">!</text>
            </g>
          </g>

          <path d="M 250 70 L 300 130" className="cable-wire" />
          <path d="M 300 130 L 350 70" className="cable-wire" />
          
          <circle cx="250" cy="70" r="4" className="ips-threat-packet" />

          <g transform="translate(230, 50)">
            <rect x="0" y="0" width="40" height="20" rx="3" className="net-node" />
            <text x="20" y="12" fill="#94a3b8" fontFamily="monospace" fontSize="7" fontWeight="bold" textAnchor="middle">Attacker</text>
          </g>
          <g transform="translate(330, 50)">
            <rect x="0" y="0" width="40" height="20" rx="3" className="net-node" />
            <text x="20" y="12" fill="#94a3b8" fontFamily="monospace" fontSize="7" fontWeight="bold" textAnchor="middle">Target</text>
          </g>
          <g transform="translate(280, 115)">
            <rect x="0" y="0" width="40" height="30" rx="3" className="node-ips" />
            <text x="20" y="18" fill="#ffe4e6" fontFamily="monospace" fontSize="8" fontWeight="bold" textAnchor="middle">IPS</text>
            <text x="20" y="38" fill="#f43f5e" fontFamily="sans-serif" fontSize="6" textAnchor="middle">Inline</text>
            
            <g className="ips-blocked-x" style={{ transformOrigin: "20px 15px" }}>
              <circle cx="20" cy="15" r="10" stroke="#ef4444" strokeWidth="2" fill="rgba(239, 68, 68, 0.1)" />
              <line x1="15" y1="10" x2="25" y2="20" />
              <line x1="25" y1="10" x2="15" y2="20" />
            </g>
          </g>
        </svg>
      );
    default:
      return null;
  }
}

export default function Guide() {
  const [activeSubTab, setActiveSubTab] = useState<"syllabus" | "commands" | "vocabulary" | "topology" | "toolkit">("syllabus");
  
  // Search states
  const [cmdSearch, setCmdSearch] = useState("");
  const [vocabSearch, setVocabSearch] = useState("");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Filters
  const [cmdCategory, setCmdCategory] = useState("All");
  const [vocabCategory, setVocabCategory] = useState("All");

  // Topology selection
  const [selectedTopologyId, setSelectedTopologyId] = useState<string>("vlan-routing");
  const activeTopology = topologiesPool.find(t => t.id === selectedTopologyId);

  const handleCopy = (txt: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedText(txt);
    setTimeout(() => setCopiedText(null), 1500);
  };

  const commandCategories = ["All", "Device Access", "Line Config", "Basic Config", "Security", "Interfaces", "VLANs & Trunking", "Routing", "Troubleshooting"];
  const vocabCategories = ["All", "Fundamentals", "Network Access", "IP Connectivity", "IP Services", "Security", "Automation"];

  // Filtering logs
  const filteredCommands = commandsPool.filter(c => {
    const matchesSearch = c.command.toLowerCase().includes(cmdSearch.toLowerCase()) || 
                          c.description.toLowerCase().includes(cmdSearch.toLowerCase());
    const matchesCat = cmdCategory === "All" || c.category === cmdCategory;
    return matchesSearch && matchesCat;
  });

  const filteredVocab = vocabPool.filter(v => {
    const matchesSearch = v.term.toLowerCase().includes(vocabSearch.toLowerCase()) || 
                          v.definition.toLowerCase().includes(vocabSearch.toLowerCase());
    const matchesCat = vocabCategory === "All" || v.category === vocabCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="flex w-full min-h-screen bg-zinc-950 text-zinc-100">
      <Sidebar />

      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Header */}
        <header className="h-16 border-b border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md sticky top-0 z-10 flex items-center w-full">
          <div className="max-w-[1440px] mx-auto w-full px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5.5 h-5.5 text-zinc-300" />
              <h2 className="font-bold text-lg text-zinc-200">Cisco Certification Guide</h2>
            </div>

            {/* Sub Tab Controls */}
            <div className="flex bg-zinc-900/60 p-1 rounded-xl border border-zinc-800/50 text-[13px] font-bold">
              {(["syllabus", "commands", "vocabulary", "topology", "toolkit"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveSubTab(tab)}
                  className={`px-3.5 py-1.5 rounded-lg capitalize transition-all ${
                    activeSubTab === tab 
                      ? "bg-zinc-850 text-white border border-zinc-800/60 shadow-sm" 
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {tab === "commands" 
                    ? "CLI Commands" 
                    : tab === "vocabulary" 
                    ? "Glossary" 
                    : tab === "topology" 
                    ? "Topology Guide"
                    : tab === "toolkit" 
                    ? "Study Toolkit" 
                    : "Exam Syllabus"}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Content Panel */}
        <div className="flex-1 p-6 max-w-[1440px] mx-auto w-full flex flex-col gap-6">
          
          {activeSubTab === "syllabus" && (
            /* Syllabus Tab */
            <div className="space-y-5">
              <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 glow-card">
                <h3 className="font-extrabold text-base text-zinc-200 uppercase tracking-wider mb-2">
                  CCNA 200-301 Exam Blueprint
                </h3>
                <p className="text-[13px] text-zinc-500 leading-relaxed font-medium">
                  Official Cisco curriculum domains and weight distribution for the CCNA 200-301 v1.1 certification exam.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {syllabusDomains.map((domain, idx) => {
                  const domainName = domain.title.replace(/^\d\.\d\s+/, "");
                  return (
                    <div key={idx} className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-5 glow-card space-y-4">
                      <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
                        <h4 className="font-extrabold text-sm text-zinc-100">{domain.title}</h4>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/quiz?domain=${encodeURIComponent(domainName)}&autostart=true`}
                            className="text-xs font-bold text-zinc-400 hover:text-white border border-zinc-850 hover:border-zinc-700 bg-zinc-950 px-2.5 py-1 rounded-lg transition-all"
                          >
                            Start Quiz
                          </Link>
                          <span className="text-xs font-black font-mono bg-zinc-950 border border-zinc-850 px-2 py-0.5 rounded text-zinc-500">
                            {domain.weight}
                          </span>
                        </div>
                      </div>

                      <ul className="space-y-2.5 pl-1">
                        {domain.topics.map((topic, tIdx) => (
                          <li key={tIdx} className="text-sm text-zinc-400 leading-relaxed flex gap-2.5 items-start font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 mt-1.5 shrink-0" />
                            <span>{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeSubTab === "commands" && (
            /* Commands Tab */
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:max-w-xs">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-550" />
                  <input
                    type="text"
                    placeholder="Filter commands..."
                    value={cmdSearch}
                    onChange={(e) => setCmdSearch(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-sm text-zinc-300 outline-none focus:border-zinc-700 transition-all font-medium"
                  />
                </div>

                <div className="flex gap-1.5 flex-wrap">
                  {commandCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCmdCategory(cat)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                        cmdCategory === cat 
                          ? "bg-zinc-850 text-white border-zinc-800" 
                          : "bg-zinc-900/20 border-zinc-850 text-zinc-550 hover:text-zinc-300"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredCommands.length > 0 ? (
                  filteredCommands.map((item, idx) => (
                    <div key={idx} className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 flex items-center justify-between gap-3 glow-card">
                      <div className="space-y-1.5 flex-1 pr-2">
                        <div className="flex items-center gap-2">
                          <code className="text-zinc-200 font-bold font-mono text-sm select-all bg-zinc-950 px-2 py-0.5 rounded border border-zinc-850">
                            {item.command}
                          </code>
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-950/40 px-2 py-0.5 rounded border border-zinc-850/50">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-400 leading-relaxed font-sans font-medium">
                          {item.description}
                        </p>
                      </div>

                      <button
                        onClick={() => handleCopy(item.command)}
                        className="p-2 rounded-lg border border-zinc-850 hover:border-zinc-700 bg-zinc-950 text-zinc-500 hover:text-zinc-300 transition-all shrink-0"
                      >
                        {copiedText === item.command ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center p-8 text-zinc-500 text-xs font-mono">
                    No commands matched search filter.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSubTab === "vocabulary" && (
            /* Glossary Tab */
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:max-w-xs">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-550" />
                  <input
                    type="text"
                    placeholder="Search glossary terms..."
                    value={vocabSearch}
                    onChange={(e) => setVocabSearch(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-sm text-zinc-300 outline-none focus:border-zinc-700 transition-all font-medium"
                  />
                </div>

                <div className="flex gap-1.5 flex-wrap">
                  {vocabCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setVocabCategory(cat)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                        vocabCategory === cat 
                          ? "bg-zinc-850 text-white border-zinc-800" 
                          : "bg-zinc-900/20 border-zinc-850 text-zinc-550 hover:text-zinc-300"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredVocab.length > 0 ? (
                  filteredVocab.map((vocab, idx) => (
                    <div key={idx} className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between gap-3 glow-card">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-sm text-zinc-200">{vocab.term}</span>
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider bg-zinc-950 border border-zinc-850 rounded px-1.5 py-0.5">
                            {vocab.category}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-400 leading-relaxed font-sans font-medium">
                          {vocab.definition}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center p-8 text-zinc-500 text-xs font-mono">
                    No vocabulary definitions matched filter.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSubTab === "topology" && (
            /* Topology Guide Tab */
            <div className="flex flex-col md:flex-row gap-5 items-start w-full">
              {/* Topology Sidebar */}
              <div className="w-full md:w-60 shrink-0 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 flex flex-col gap-3">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-zinc-500 pl-1">
                  Select Topology
                </h3>
                <div className="flex flex-col gap-1">
                  {topologiesPool.map((top) => (
                    <button
                      key={top.id}
                      onClick={() => setSelectedTopologyId(top.id)}
                      className={`text-left px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        selectedTopologyId === top.id 
                          ? "bg-zinc-800 text-cyan-400 border border-zinc-700/50" 
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/20"
                      }`}
                    >
                      {top.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Detail Panel */}
              <div className="flex-1 min-w-0 flex flex-col gap-5">
                {activeTopology && (
                  <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 glow-card space-y-5">
                    {/* Header */}
                    <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
                      <div className="space-y-1">
                        <span className="text-xs font-extrabold text-cyan-400 uppercase tracking-wider bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                          Interactive Topology
                        </span>
                        <h3 className="font-extrabold text-base text-zinc-100">
                          {activeTopology.name}
                        </h3>
                      </div>
                    </div>

                    {/* 2-Column Details Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
                      {/* Left Column: SVG, Objective, Deep Dive */}
                      <div className="space-y-5">
                        {/* Animated SVG Diagram */}
                        <div className="bg-zinc-950 rounded-xl border border-zinc-855 p-4 flex items-center justify-center relative overflow-hidden h-60 blueprint-canvas">
                          {renderTopologySvg(activeTopology.id)}
                        </div>

                        {/* Objective */}
                        <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-850 space-y-1">
                          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                            Scenario Objective
                          </h4>
                          <p className="text-sm text-zinc-300 leading-relaxed font-semibold">
                            {activeTopology.objective}
                          </p>
                        </div>

                        {/* Deep Dive */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-zinc-550">
                            <BookOpen className="w-3.5 h-3.5 text-cyan-400/85" />
                            <h4 className="text-xs font-bold uppercase tracking-wider">
                              How it works (Deep Dive)
                            </h4>
                          </div>
                          <p className="text-sm text-zinc-400 leading-relaxed pl-5 font-medium">
                            {activeTopology.explanation}
                          </p>
                        </div>
                      </div>

                      {/* Right Column: Configuration & Verification */}
                      <div className="space-y-5">
                        {/* IOS Configuration */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-zinc-550">
                              <Terminal className="w-3.5 h-3.5 text-amber-400/85" />
                              <h4 className="text-xs font-bold uppercase tracking-wider">
                                Cisco IOS Configuration
                              </h4>
                            </div>
                            <button
                              onClick={() => handleCopy(activeTopology.configCommands)}
                              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-wider font-bold border border-zinc-850 hover:border-zinc-700 bg-zinc-950 px-2.5 py-1 rounded-lg"
                            >
                              {copiedText === activeTopology.configCommands ? "Copied" : "Copy"}
                            </button>
                          </div>
                          <pre className="bg-zinc-950/90 text-zinc-300 p-4 rounded-xl border border-zinc-850 font-mono text-xs leading-relaxed overflow-x-auto shadow-inner h-[210px] custom-scrollbar">
                            {activeTopology.configCommands}
                          </pre>
                        </div>

                        {/* Verification Section */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-zinc-550">
                              <Terminal className="w-3.5 h-3.5 text-emerald-400/85" />
                              <h4 className="text-xs font-bold uppercase tracking-wider">
                                Verification Commands
                              </h4>
                            </div>
                            <button
                              onClick={() => handleCopy(activeTopology.verificationCommands)}
                              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-wider font-bold border border-zinc-850 hover:border-zinc-700 bg-zinc-950 px-2.5 py-1 rounded-lg"
                            >
                              {copiedText === activeTopology.verificationCommands ? "Copied" : "Copy"}
                            </button>
                          </div>
                          <pre className="bg-zinc-950/90 text-zinc-300 p-4 rounded-xl border border-zinc-850 font-mono text-xs leading-relaxed overflow-x-auto shadow-inner h-[120px] custom-scrollbar">
                            {activeTopology.verificationCommands}
                          </pre>
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            </div>
          )}

          {activeSubTab === "toolkit" && (
            /* Toolkit Tab */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Vouchers & Codes */}
              <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-4 glow-card">
                <h4 className="font-extrabold text-sm text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  Cisco Press Discount Codes
                </h4>
                <p className="text-sm text-zinc-400 leading-relaxed font-sans font-medium">
                  Official promo discount codes verified in the 2025/2026 Cisco Certification Guide.
                </p>

                <div className="space-y-3 pt-1">
                  <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-855 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Portable Command Guide (5th Ed)</span>
                      <code className="text-sm font-extrabold text-zinc-200 font-mono block mt-0.5">CCNACOMM</code>
                    </div>
                    <button 
                      onClick={() => handleCopy("CCNACOMM")}
                      className="text-xs font-bold text-cyan-400 hover:text-cyan-300 uppercase tracking-wider"
                    >
                      {copiedText === "CCNACOMM" ? "Copied" : "Copy (40% Off)"}
                    </button>
                  </div>

                  <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-855 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Official Cert Guide Library</span>
                      <code className="text-sm font-extrabold text-zinc-200 font-mono block mt-0.5">CCNAGUIDE</code>
                    </div>
                    <button 
                      onClick={() => handleCopy("CCNAGUIDE")}
                      className="text-xs font-bold text-cyan-400 hover:text-cyan-300 uppercase tracking-wider"
                    >
                      {copiedText === "CCNAGUIDE" ? "Copied" : "Copy (35% Off)"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Safeguard & Resources */}
              <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-4 glow-card">
                <h4 className="font-extrabold text-sm text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Cisco Exam Safeguard
                </h4>
                <p className="text-sm text-zinc-400 leading-relaxed font-sans font-medium">
                  Cisco offers two Safeguard packages that give your CCNA exam a backup plan (Pearson VUE proctored):
                </p>

                <ul className="space-y-2.5 text-sm text-zinc-400 pl-1 font-sans font-medium">
                  <li className="flex gap-2">
                    <span className="text-zinc-500">•</span>
                    <span>**Safeguard**: Provides a second exam try at no extra cost if you don't pass your first attempt.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-zinc-500">•</span>
                    <span>**Safeguard Plus**: Adds a practice exam resource to test your readiness.</span>
                  </li>
                </ul>

                <a
                  href="https://cisco.com/go/onlinetesting"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-xs font-bold py-2 rounded-xl text-center flex items-center justify-center gap-1.5 uppercase tracking-wider transition-all mt-1"
                >
                  System Readiness Check
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}
