export interface Flashcard {
  id: string;
  domain: string;
  term: string;
  definition: string;
  explanation: string;
  scenario: string;
}

export const ccnaFlashcards: Flashcard[] = [
  // Network Fundamentals
  {
    id: "fc-fund-1",
    domain: "Network Fundamentals",
    term: "OSI Model Layers",
    definition: "7 Layers: Application, Presentation, Session, Transport, Network, Data Link, Physical. (Mnemonic: Please Do Not Throw Sausage Pizza Away).",
    explanation: "The OSI model divides network communications into seven logical layers to simplify troubleshooting and standardise vendor interactions. Each layer has specific roles: L1-L4 focus on transport (bits, frames, packets, segments), while L5-L7 focus on application and data formatting.",
    scenario: "Troubleshooting a PC that cannot access a website: You first ping the gateway (Layer 3 connectivity). If successful, you verify if a TCP connection on port 80/443 can be established (Layer 4). Finally, you check if the server is returning a valid HTTP page (Layer 7)."
  },
  {
    id: "fc-fund-2",
    domain: "Network Fundamentals",
    term: "TCP vs UDP",
    definition: "TCP is connection-oriented, reliable, utilizes a 3-way handshake, flow control, and sequence numbers. UDP is connectionless, unreliable, has low overhead, and is fast (used for voice/video).",
    explanation: "TCP establishes a session before sending data, ensuring all packets arrive intact and in order through acknowledgments (ACKs) and retransmissions. UDP is a 'best-effort' protocol with no session setup or recovery, making it faster and ideal for real-time traffic.",
    scenario: "A user downloads a file via HTTP (TCP) while on a Zoom call (UDP). If packets are dropped on the link, TCP retransmits the missing pieces so the file isn't corrupted, whereas Zoom ignores the lost packets to avoid audio/video delay, resulting in a brief glitch."
  },
  {
    id: "fc-fund-3",
    domain: "Network Fundamentals",
    term: "IPv6 Global Unicast Address (GUA)",
    definition: "Equivalent to public IPv4. Range starts with 2000::/3. Used for routing on the public internet.",
    explanation: "GUAs are globally unique and routable. A typical address is structured into a /48 Global Routing Prefix (from the ISP), a 16-bit Subnet ID, and a 64-bit Interface ID (host portion). Because IPv6 has a massive address space, NAT is generally not required.",
    scenario: "An administrator configures a web server with GUA `2001:db8:acad:1::100/64`. Clients worldwide can reach this server directly over the internet without needing network address translation at the gateway router."
  },
  {
    id: "fc-fund-4",
    domain: "Network Fundamentals",
    term: "IPv6 Link-Local Address (LLA)",
    definition: "Used for communications on a single local link. Always starts with fe80::/10. Automatically configured on every IPv6-enabled interface.",
    explanation: "Link-Local addresses are automatically generated (often using EUI-64 or random identifiers) as soon as IPv6 is enabled. They are non-routable, meaning routers will not forward packets with link-local source or destination addresses outside the local subnet.",
    scenario: "Two routers are connected directly via a serial link. Even without manual IP configuration, they automatically generate `fe80::` addresses, allowing them to exchange OSPFv3 routing updates and keepalive packets immediately."
  },
  {
    id: "fc-fund-5",
    domain: "Network Fundamentals",
    term: "MAC Address Structure",
    definition: "48-bit physical address. First 24 bits: Organizationally Unique Identifier (OUI) assigned to vendors. Last 24 bits: Vendor-assigned unique device ID.",
    explanation: "MAC addresses are written as 12 hexadecimal digits (e.g., 00:00:0C:12:34:56). The IEEE assigns the first 24 bits (OUI) to manufacturers. The vendor then guarantees that the remaining 24 bits are unique to each network interface card (NIC) they produce.",
    scenario: "A security alert reports malicious traffic originating from MAC `00:15:5D:AB:12:34`. The network admin checks the OUI database and finds `00:15:5D` belongs to Microsoft (Hyper-V virtual NICs), identifying the source as a virtual machine."
  },
  {
    id: "fc-fund-6",
    domain: "Network Fundamentals",
    term: "CSMA/CD",
    definition: "Carrier Sense Multiple Access with Collision Detection. Used in half-duplex Ethernet networks to detect and manage data collisions.",
    explanation: "In a half-duplex network, a device listens to the cable (Carrier Sense). If clear, it transmits. If another device transmits at the same time, a collision occurs. Both devices detect this, send a jam signal, and wait a random backoff time before retransmitting.",
    scenario: "In an old office using an Ethernet hub (half-duplex), PC-A and PC-B send data at the exact same instant. The hub mixes the signals, creating a collision. Both PCs detect the signal corruption, halt transmission, and retry after a random interval."
  },
  {
    id: "fc-fund-7",
    domain: "Network Fundamentals",
    term: "Collimated Beam / Multi-mode Fiber",
    definition: "Multi-mode fiber uses LED light sources, wider core (50-62.5 microns), suffers high modal dispersion, suitable for short runs. Single-mode uses laser, narrow core (9 microns), long distances.",
    explanation: "Multi-mode fiber allows light to travel in multiple angles (modes) down its wide core, causing signals to spread out (modal dispersion) and limits distance. Single-mode fiber uses a laser to shoot a single straight (collimated) beam through a tiny core, minimizing dispersion.",
    scenario: "A campus network design uses OM4 Multi-mode fiber to connect switches within a data closet 150 meters away (cheaper transceivers). However, it uses OS2 Single-mode fiber to connect a building 8 kilometers away to the main core switch."
  },
  {
    id: "fc-fund-8",
    domain: "Network Fundamentals",
    term: "Network Bridge (Layer 2)",
    definition: "A legacy Layer 2 forwarding device that connects two physical LAN segments, filtering traffic based on MAC addresses.",
    explanation: "A traditional network bridge analyzes incoming frame MAC addresses to dynamically build a MAC address table. It divides a network into separate collision domains (unlike a Hub) but maintains a single broadcast domain. Modern Ethernet switches are essentially multi-port bridges with hardware-based forwarding (ASICs).",
    scenario: "A legacy office has two separate coaxial Thinnet segments. The admin installs a 2-port network bridge to connect them. Traffic between PC-1 and PC-2 on Segment A is blocked from crossing to Segment B, reducing unnecessary collisions."
  },
  {
    id: "fc-fund-9",
    domain: "Network Fundamentals",
    term: "Virtual Bridge Network",
    definition: "A software-defined Layer 2 bridge (virtual switch) in a hypervisor that connects virtual machines to a physical network interface.",
    explanation: "In virtualization and container environments (e.g., VMware, Hyper-V, Docker), a virtual bridge connects virtual network adapters of VMs/containers to a physical network interface card (pNIC) on the host. This places virtual machines on the same physical broadcast domain and subnet as the host.",
    scenario: "An engineer deploys three VMs on an ESXi host. They attach the VMs to the default virtual switch (vSwitch0) which acts as a bridge. The VMs automatically obtain IP addresses from the physical office DHCP server and communicate with external servers."
  },
  {
    id: "fc-fund-10",
    domain: "Network Fundamentals",
    term: "Hub vs Bridge vs Switch",
    definition: "Hub (L1, half-duplex, 1 collision domain). Bridge (L2, software, 2+ collision domains). Switch (L2, hardware ASICs, microsegmentation).",
    explanation: "Hubs replicate incoming electrical signals on all ports, resulting in a single shared collision domain. Bridges filter frames using software, dividing the network into multiple collision domains. Switches are high-performance multi-port bridges that dedicate a collision domain to each port (microsegmentation) using hardware ASICs.",
    scenario: "Upgrading a legacy office network by replacing a 24-port Ethernet hub with a 24-port Catalyst switch. This eliminates all Layer 2 collisions and allows full-duplex operation for all connected computers."
  },

  // Network Access
  {
    id: "fc-access-1",
    domain: "Network Access",
    term: "VLAN (Virtual LAN)",
    definition: "A logical segmentation of a physical network at Layer 2 to isolate broadcast domains, increase security, and improve performance.",
    explanation: "VLANs divide a physical switch into multiple logical switches. Hosts on different VLANs cannot talk at Layer 2 (even if plugged into the same switch) and must route through a Layer 3 device (router or L3 switch) to communicate.",
    scenario: "To isolate network traffic, an administrator assigns physical ports 1-10 to VLAN 10 (Finance Subnet: 192.168.10.0/24) and ports 11-20 to VLAN 20 (Guest Wi-Fi: 192.168.20.0/24). Guest users cannot sniff or access Finance network traffic."
  },
  {
    id: "fc-access-2",
    domain: "Network Access",
    term: "Trunk Port (802.1Q)",
    definition: "A port configured to carry traffic for multiple VLANs across switches. Inserts a 4-byte 802.1Q tag into the frame header.",
    explanation: "When a frame traverses a trunk link, the switch inserts an 802.1Q tag containing the VLAN ID. The receiving switch reads this ID, strips the tag, and forwards the original frame to access ports belonging to that specific VLAN.",
    scenario: "Switch-1 is connected to Switch-2. To allow VLAN 10 (Sales) and VLAN 20 (HR) hosts on both switches to communicate, the port connecting the two switches is configured with `switchport mode trunk`, carrying tagged frames for both VLANs."
  },
  {
    id: "fc-access-3",
    domain: "Network Access",
    term: "Spanning Tree Protocol (STP)",
    definition: "IEEE 802.1D protocol that prevents logical Layer 2 loops on redundant switched topologies by blocking specific ports.",
    explanation: "Redundancy is critical to prevent network downtime, but loop-free paths are necessary at Layer 2 since Ethernet frames do not have a TTL (Time to Live) limit. STP elects a central Root Bridge and disables redundant links by placing backup ports into a Blocking state.",
    scenario: "A loop is formed when two switches are connected by two separate Ethernet cables. STP elects one switch as the Root Bridge, and puts one of the redundant ports on the second switch into Blocking mode. If the primary cable is cut, STP transitions the blocked port to Forwarding."
  },
  {
    id: "fc-access-4",
    domain: "Network Access",
    term: "RSTP (802.1w) Port Roles",
    definition: "Root Port (best path to Root Bridge), Designated Port (forwards traffic), Alternate Port (backup root port, blocking), Backup Port (backup designated port, blocking).",
    explanation: "RSTP improves convergence times from STP's 30-50 seconds to under 2 seconds. The Alternate port acts as an active backup for the Root port, and the Backup port acts as an active backup for the Designated port, transitioning to forwarding instantly when failures occur.",
    scenario: "Switch-3 has two uplink connections to the core switch (Root Bridge). Link-A (1 Gbps) becomes the Root Port. Link-B (100 Mbps) becomes the Alternate Port. If Link-A goes down, Link-B immediately transitions to Root Port without waiting for traditional timer delays."
  },
  {
    id: "fc-access-5",
    domain: "Network Access",
    term: "LACP vs PAgP",
    definition: "LACP (IEEE 802.3ad standard; modes: Active/Passive) is vendor-neutral link aggregation. PAgP (Cisco proprietary; modes: Desirable/Auto) aggregates Cisco switches.",
    explanation: "Both protocols automatically bundle multiple physical interfaces into a single logical channel (EtherChannel) to increase bandwidth and provide link redundancy. Active/Desirable modes actively negotiate the bundle, while Passive/Auto modes only respond.",
    scenario: "An engineer bundles four 1 Gbps links between a Cisco switch and a server from HP. Since it is a multi-vendor setup, they use LACP by configuring `channel-group 1 mode active` on the Cisco switch and enabling LACP on the server."
  },
  {
    id: "fc-access-6",
    domain: "Network Access",
    term: "WLAN Controller (WLC)",
    definition: "A centralized hardware/software system that manages, configures, and secures multiple Lightweight Access Points (LAPs) using CAPWAP.",
    explanation: "WLCs remove the management overhead of configuring hundreds of access points individually. Lightweight APs (LAPs) boot up, discover the controller, and tunnel all wireless control and user traffic back to the WLC using CAPWAP encapsulation.",
    scenario: "An admin needs to update the Wi-Fi security keys for an entire building. Instead of logging into 50 different access points, they make a single configuration change on the central WLC dashboard, which instantly updates all connected LAPs."
  },

  // IP Connectivity
  {
    id: "fc-conn-1",
    domain: "IP Connectivity",
    term: "Administrative Distance (AD)",
    definition: "The trustworthiness of a routing source. Lower AD is preferred. Connected: 0, Static: 1, EIGRP: 90, OSPF: 110, RIP: 120, External BGP: 20.",
    explanation: "When a router learns about the exact same subnet prefix from different protocols, it uses AD to determine which route is more reliable. The path with the lowest AD is selected and written into the IP routing table.",
    scenario: "A router learns a route to `10.5.0.0/24` from both OSPF (AD 110) and a Static Route (AD 1). Even if the OSPF path has better metrics, the router installs the Static Route because its AD of 1 is more trustworthy than OSPF's AD of 110."
  },
  {
    id: "fc-conn-2",
    domain: "IP Connectivity",
    term: "OSPF Cost Metric",
    definition: "OSPF metric calculation: Reference Bandwidth / Interface Bandwidth. Reference Bandwidth is 10^8 bps (100 Mbps) by default. Custom reference bandwidth configured with 'auto-cost reference-bandwidth'.",
    explanation: "OSPF determines the best path by calculating the cumulative cost of links. Because the default reference bandwidth is 100 Mbps, any link of 100 Mbps or faster (e.g., 1 Gbps, 10 Gbps) receives a cost of 1. Networks should update this reference to avoid sub-optimal routing.",
    scenario: "A router has a Gigabit (1 Gbps) link and a FastEthernet (100 Mbps) link. By default, both have a cost of 1. The admin configures `auto-cost reference-bandwidth 10000` (10 Gbps) on all OSPF routers, making the FastEthernet cost 100 and the Gigabit cost 10, prioritizing the faster link."
  },
  {
    id: "fc-conn-3",
    domain: "IP Connectivity",
    term: "OSPF Router ID Selection",
    definition: "1. Manually configured 'router-id'. 2. Highest active Loopback IP. 3. Highest active physical interface IP at OSPF boot time.",
    explanation: "The OSPF Router ID uniquely identifies each router in the OSPF routing domain. OSPF checks the manual configuration first. If not set, it chooses the highest Loopback IP. If no loopbacks exist, it falls back to the highest IP among its active physical interfaces.",
    scenario: "A router runs OSPF with interfaces Loopback 0 (`1.1.1.1`), Gigabit 0/0 (`192.168.1.100`), and Gigabit 0/1 (`172.16.50.1`). If OSPF starts and `router-id` is not configured, the router selects `1.1.1.1` as its Router ID because loopbacks are preferred."
  },
  {
    id: "fc-conn-4",
    domain: "IP Connectivity",
    term: "OSPF Area 0",
    definition: "The backbone area. All other non-zero areas in OSPF must connect physically or logically to Area 0 to route inter-area traffic.",
    explanation: "OSPF is built hierarchically to reduce routing table updates and contain topology changes within localized areas. All traffic moving between areas (inter-area routing) must pass through Area 0, preventing loop conditions across areas.",
    scenario: "In a company, Area 10 (Sales) and Area 20 (Finance) need to exchange routing updates. OSPF requires both Area 10 and Area 20 to have Area Border Routers (ABRs) directly connected to the backbone Area 0, which distributes the routes between them."
  },
  {
    id: "fc-conn-5",
    domain: "IP Connectivity",
    term: "Longest Prefix Match",
    definition: "The rule where routers compare destination IP to routing table entries and select the route with the most specific mask (longest CIDR) first, before AD.",
    explanation: "When forwarding packets, a router compares the destination IP against its routing table. The matching entry with the longest prefix (most network bits) is chosen first because it represents the most specific route, overriding any differences in protocol AD.",
    scenario: "A router has OSPF route `192.168.1.0/24` (AD 110) and EIGRP route `192.168.0.0/16` (AD 90). When forwarding a packet to `192.168.1.50`, the router selects the OSPF path (`/24`) because it has a longer subnet mask than the EIGRP path (`/16`), despite OSPF having a higher AD."
  },
  {
    id: "fc-conn-6",
    domain: "IP Connectivity",
    term: "Floating Static Route",
    definition: "A backup static route configured with a higher Administrative Distance (e.g. AD 150) than the primary dynamic route (e.g. OSPF AD 110), so it only active if the primary fails.",
    explanation: "Static routes are usually installed over dynamic routes because their default AD is 1. By overriding this default with a higher AD value (higher than the active dynamic protocol), the static route stays in standby mode and is only placed in the routing table if the primary path is lost.",
    scenario: "An admin configures `ip route 0.0.0.0 0.0.0.0 203.0.113.2 150` as a backup internet gateway. The primary default route is learned via OSPF (AD 110). If the OSPF adjacency drops, the static route (AD 150) instantly takes over to route traffic to the backup gateway."
  },

  // IP Services
  {
    id: "fc-serv-1",
    domain: "IP Services",
    term: "DHCP 4-Step Process (DORA)",
    definition: "1. Discover (Client broadcast) 2. Offer (Server unicast/broadcast) 3. Request (Client broadcast) 4. Acknowledgment (Server unicast/broadcast).",
    explanation: "DHCP allows clients to dynamically obtain IP settings. The process begins with a broadcast Discover packet from the client. The DHCP server responds with an Offer. The client requests that offered address via a Request broadcast, and the server confirms with an Acknowledgment (ACK).",
    scenario: "When a laptop boots up and connects to the office network, it sends a broadcast to `255.255.255.255` seeking a DHCP server. The router relays the request, the server offers `10.1.10.45`, the client requests it, and the server acknowledges, leasing the address."
  },
  {
    id: "fc-serv-2",
    domain: "IP Services",
    term: "DNS (Domain Name System)",
    definition: "Translates human-readable domain names (e.g. cisco.com) into numerical IP addresses. Runs on UDP/TCP port 53.",
    explanation: "DNS acts as the phonebook of the internet. When a domain is queried, standard DNS lookups occur over UDP port 53 for speed. If a response exceeds 512 bytes or a zone transfer is performed, TCP port 53 is used for reliable data transmission.",
    scenario: "A user types `netacad.com` into a browser. The PC queries the configured local DNS server on UDP port 53. The DNS server resolves the query and returns `104.18.23.15`, allowing the PC to establish an HTTPS session with the target web server."
  },
  {
    id: "fc-serv-3",
    domain: "IP Services",
    term: "NAT Overload (PAT)",
    definition: "Port Address Translation. Maps multiple private IP addresses to a single public IP address using unique source port numbers.",
    explanation: "PAT translates internal private RFC 1918 IPv4 addresses into a single public routable IP. The router tracks sessions by appending unique source port numbers to the public IP in a translation table, enabling thousands of devices to share one public IP.",
    scenario: "Multiple users inside a corporate office visit different websites. The router translates their private source IPs (e.g., `192.168.1.50`, `192.168.1.75`) to the public IP `203.0.113.10` but assigns unique port numbers (e.g., 50021, 50022), returning replies to the correct user."
  },
  {
    id: "fc-serv-4",
    domain: "IP Services",
    term: "HSRP (Hot Standby Router Protocol)",
    definition: "Cisco proprietary Layer 3 redundancy protocol (FHRP) that provides a virtual gateway IP to hosts, active/standby routers share a virtual MAC address.",
    explanation: "HSRP allows multiple routers to present a single virtual IP and MAC address (`0000.0c07.acXX`) to the LAN. The 'Active' router processes all packets sent to the gateway, while the 'Standby' router monitors hello messages and takes over if the Active router fails.",
    scenario: "Router-A (Priority 110) and Router-B (Priority 100) are configured in HSRP Group 1 sharing IP `192.168.1.1`. Router-A handles all outgoing traffic. If Router-A's LAN link goes down, Router-B transitions to active, taking over the virtual IP without disrupting the clients."
  },
  {
    id: "fc-serv-5",
    domain: "IP Services",
    term: "QoS - Classification & Marking",
    definition: "Identifying traffic types (Voice, Video, Data) and writing values in header fields (CoS at Layer 2, DSCP at Layer 3 IP Type of Service) to prioritize traffic.",
    explanation: "Classification inspects traffic characteristics to identify its type. Marking modifies bits in the frame/packet header (like L2 CoS or L3 DSCP/Type of Service). Later network hops read these marks to apply QoS rules (like putting voice in priority queues).",
    scenario: "An IP phone sends voice traffic. The switch classifies the voice packets and marks the Layer 3 IP header with a DSCP value of 46 (Expedited Forwarding - EF). The WAN router reads the EF mark and pushes it to a high-priority low-latency queue ahead of web traffic."
  },

  // Security Fundamentals
  {
    id: "fc-sec-1",
    domain: "Security Fundamentals",
    term: "Standard ACL",
    definition: "Numbered 1-99 and 1300-1999. Filters traffic based on source IP address only. Should be placed as close to the destination as possible.",
    explanation: "Standard ACLs evaluate only the source IP. Because they cannot filter based on destination or protocol, placing a Standard ACL near the source might inadvertently block all traffic from that source. Placing it near the destination prevents over-blocking.",
    scenario: "You want to block Host `192.168.1.5` from accessing a database server (`10.1.1.200`). You create `access-list 10 deny host 192.168.1.5` and apply it to the interface closest to the server subnet (outbound on the router interface connected to the `10.1.1.0/24` LAN)."
  },
  {
    id: "fc-sec-2",
    domain: "Security Fundamentals",
    term: "Extended ACL",
    definition: "Numbered 100-199 and 2000-2699. Filters based on Source/Destination IP, Protocol, and Source/Destination Port. Should be placed close to the source.",
    explanation: "Extended ACLs provide granular filtering by examining source/destination IPs, protocols (IP, TCP, UDP, ICMP), and ports. Placing them close to the traffic source minimizes unnecessary network traversal and saves bandwidth.",
    scenario: "To prevent PC `192.168.1.10` from accessing Web Server `10.2.2.5` via HTTP while allowing pings, write: `access-list 100 deny tcp host 192.168.1.10 host 10.2.2.5 eq 80`. Apply it inbound on the router interface where the PC's subnet enters."
  },
  {
    id: "fc-sec-3",
    domain: "Security Fundamentals",
    term: "DHCP Snooping",
    definition: "A Layer 2 security feature that filters untrusted DHCP messages and builds a binding database. Only allows DHCP server replies on trusted ports.",
    explanation: "DHCP Snooping prevents rogue DHCP servers from handing out incorrect network settings (MitM attack). Switch ports facing legitimate DHCP servers are marked as Trusted. Access ports are Untrusted. If a DHCP Offer or ACK enters an Untrusted port, the port is disabled.",
    scenario: "An employee connects a consumer wireless router to an office wall outlet. The router's DHCP server attempts to issue IP settings to neighboring PCs. The corporate switch intercepts these Offers on the untrusted port, drops them, and generates an alert."
  },
  {
    id: "fc-sec-4",
    domain: "Security Fundamentals",
    term: "Dynamic ARP Inspection (DAI)",
    definition: "Layer 2 security feature that validates ARP packets in a network by matching source IP/MAC addresses against the DHCP Snooping binding table.",
    explanation: "DAI mitigates ARP poisoning/spoofing attacks. The switch intercepts all ARP requests and responses on untrusted ports, validating their IP-to-MAC association against the DHCP Snooping database. If the mapping is invalid, the switch drops the ARP packet.",
    scenario: "An attacker runs ARP poisoning tools to spoof the default gateway IP `192.168.1.1` to route all subnet traffic through their laptop MAC. DAI intercepts the fake ARP, compares it to the DHCP Snooping table, sees the mismatch, and discards the packet."
  },
  {
    id: "fc-sec-5",
    domain: "Security Fundamentals",
    term: "TACACS+ vs RADIUS",
    definition: "TACACS+ (Cisco proprietary, TCP port 49) encrypts the entire packet and separates Authentication, Authorization, and Accounting. RADIUS (open standard, UDP) encrypts password only.",
    explanation: "TACACS+ is used for device administration, allowing granular authorization of specific terminal commands. RADIUS is designed for network access control (e.g., 802.1X, VPNs), combining authentication and authorization into single response packets.",
    scenario: "A network engineer logs into a core router. The router uses TACACS+ to authenticate their credentials. When they type `configure terminal`, the router sends a request to the TACACS+ server to verify if this specific engineer is authorized to enter configuration mode."
  },
  {
    id: "fc-sec-6",
    domain: "Security Fundamentals",
    term: "Site-to-Site VPN",
    definition: "Connects entire networks over the public internet. Uses IPsec (Internet Protocol Security) to provide confidentiality, integrity, and authentication.",
    explanation: "A Site-to-Site VPN provides a secure tunnel over an unsecure public network. IPsec achieves security using: IKE (Internet Key Exchange) to establish SA tunnels, AES for encryption (Confidentiality), SHA/HMAC for integrity, and Pre-Shared Keys or Certificates for authentication.",
    scenario: "A branch office in Chicago needs access to applications in the central datacenter in Dallas. The edge routers in both sites establish an IPsec VPN tunnel, allowing PCs in Chicago to access resources in Dallas securely over the public internet."
  },
  {
    id: "fc-sec-7",
    domain: "Security Fundamentals",
    term: "IDS vs IPS",
    definition: "IDS is passive, monitors traffic out-of-band via port mirroring/SPAN, and triggers alerts. IPS is active, deployed inline, and actively blocks threats in real-time.",
    explanation: "An Intrusion Detection System (IDS) analyses a copy of network traffic; it has no ability to stop a threat directly but logs alerts. An Intrusion Prevention System (IPS) is situated directly in the traffic flow (inline), inspecting all packets passing through it, and can discard packets or drop connections instantly if a signature match is detected.",
    scenario: "An office network undergoes an SQL injection attack. An IDS detects the threat from a mirrored port, logging an alert in the SIEM dashboard, but the attack payload still reaches the web server. If an IPS were deployed inline at the WAN edge, it would have blocked the TCP connection instantly, neutralizing the attack before it reached the server."
  },

  // Automation and Programmability
  {
    id: "fc-auto-1",
    domain: "Automation and Programmability",
    term: "Control Plane vs Data Plane",
    definition: "Control Plane: Brain of the device (routing protocols, STP, ARP) that determines forwarding paths. Data Plane: Moves packets through the device ports.",
    explanation: "The Control Plane builds the structures (Routing tables, ARP tables, STP topologies) that dictate how packets should be handled. The Data Plane (or Forwarding Plane) uses these tables to quickly switch packets from inbound to outbound ports in hardware ASICs.",
    scenario: "A router runs OSPF, exchanges LSAs, and builds its IP routing table (Control Plane activity). A packet then enters Gigabit 0/0. The router matches the destination IP to CEF in hardware and forwards it out Gigabit 0/1 within microseconds (Data Plane activity)."
  },
  {
    id: "fc-auto-2",
    domain: "Automation and Programmability",
    term: "Northbound vs Southbound APIs",
    definition: "Northbound: APIs exposing controllers to management applications (e.g. REST). Southbound: APIs between the controller and network devices (e.g. NETCONF, OpenFlow).",
    explanation: "SDN controllers centralize network control. Northbound APIs allow developers/admins to programmatically write scripts or interfaces to control the network. Southbound APIs are used by the controller to manage and program the configurations into the network devices.",
    scenario: "A network admin runs a Python script that makes a REST call (Northbound API) to an SDN controller to deploy a new VLAN. The controller receives this and uses NETCONF (Southbound API) to push the VLAN configuration to 10 core switches."
  },
  {
    id: "fc-auto-3",
    domain: "Automation and Programmability",
    term: "REST API Constraints",
    definition: "Client-server architecture, Statelessness, Cacheability, Uniform Interface, Layered System, and Code on Demand (optional).",
    explanation: "REST is an API architecture style. 'Statelessness' requires each HTTP request from a client to contain all the context and credentials needed to complete it. The server does not store user session data on its side.",
    scenario: "An automation tool requests a list of switch configurations. It sends a `GET` request to `https://controller/api/v1/devices` with an authorization token in the headers. The controller responds and forgets the connection; the next request must send credentials again."
  },
  {
    id: "fc-auto-4",
    domain: "Automation and Programmability",
    term: "Ansible, Puppet, Chef",
    definition: "Ansible (Agentless, uses SSH/YAML, push-based). Puppet (Agent-based, uses Ruby/DSL, pull-based). Chef (Agent-based, uses Ruby, pull-based).",
    explanation: "These tools automate network configurations at scale. Ansible is agentless and connects to routers via SSH/NETCONF to 'push' settings. Puppet and Chef are agent-based, requiring software on devices to periodically 'pull' configurations from a central server.",
    scenario: "An admin wants to configure standard login banners on 200 routers. They write an Ansible playbook in YAML, list the router IPs in a hosts inventory file, and execute the playbook. Ansible uses SSH to push the banner settings to all 200 routers."
  },
  {
    id: "fc-auto-5",
    domain: "Automation and Programmability",
    term: "JSON Data Types",
    definition: "Strings (in double quotes), Numbers, Objects (key-value maps), Arrays (ordered lists), Booleans (true/false), and Null.",
    explanation: "JSON is a common data format for REST APIs. String values and keys must always be wrapped in double quotes. Objects are delimited by curly braces, and arrays (ordered lists) are defined using square brackets.",
    scenario: "A REST API returns this data representing a switch port: `{\"interface\": \"Gig1/1\", \"active\": true, \"vlans\": [10, 20], \"speed_mbps\": 1000}`. Here we have a String, a Boolean, an Array of Numbers, and a Number."
  }
];
