export interface Question {
  id: string;
  domain: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export const ccnaQuestions: Question[] = [
  {
    id: "fund-1",
    domain: "Network Fundamentals",
    question: "Which OSI layer is responsible for translating data between the application format and a common network format, including encryption and compression?",
    options: [
      "Application Layer (Layer 7)",
      "Presentation Layer (Layer 6)",
      "Session Layer (Layer 5)",
      "Transport Layer (Layer 4)"
    ],
    answerIndex: 1,
    explanation: "The Presentation Layer (Layer 6) is responsible for formatting, translating, compressing, and encrypting data so that it can be correctly interpreted by the Application Layer on the receiving system."
  },
  {
    id: "fund-2",
    domain: "Network Fundamentals",
    question: "A network engineer needs to connect two switches. Which cable type should be used if auto-MDIX is disabled and the switches do not support auto-crossover?",
    options: [
      "Straight-through cable",
      "Crossover cable",
      "Rollover cable",
      "Fiber patch cord"
    ],
    answerIndex: 1,
    explanation: "Switches operate at the same layer (Layer 2). Connecting like devices (Switch-to-Switch, Router-to-Router, PC-to-PC) requires a crossover cable when auto-MDIX is disabled. Straight-through cables are used for unlike devices (PC-to-Switch, Switch-to-Router)."
  },
  {
    id: "fund-3",
    domain: "Network Fundamentals",
    question: "Which of the following describes a key characteristic of UDP compared to TCP?",
    options: [
      "UDP is connection-oriented and guarantees delivery of packets.",
      "UDP utilizes a 3-way handshake to establish a connection before sending data.",
      "UDP has lower overhead because it does not include sequence numbers, flow control, or retransmissions.",
      "UDP is primarily used for file transfers where data integrity is the highest priority."
    ],
    answerIndex: 2,
    explanation: "UDP is connectionless and has very low overhead compared to TCP because it does not guarantee delivery, track sequences, perform flow control, or use retransmissions. This makes it ideal for real-time traffic like VoIP and streaming video."
  },
  {
    id: "access-1",
    domain: "Network Access",
    question: "What is the primary purpose of the IEEE 802.1Q standard?",
    options: [
      "To enable link aggregation between multiple physical ports.",
      "To define port-security metrics on access ports.",
      "To support VLAN tagging on trunk links.",
      "To automate IP addressing on switch virtual interfaces (SVIs)."
    ],
    answerIndex: 2,
    explanation: "IEEE 802.1Q is the industry-standard encapsulation protocol for tagging frames on trunk links, allowing multiple VLANs to share a single physical interface between switches."
  },
  {
    id: "access-2",
    domain: "Network Access",
    question: "In Rapid Spanning Tree Protocol (RSTP, 802.1w), which port states exist?",
    options: [
      "Blocking, Listening, Learning, Forwarding",
      "Discarding, Learning, Forwarding",
      "Disabled, Blocking, Forwarding",
      "Blocking, Learning, Forwarding"
    ],
    answerIndex: 1,
    explanation: "RSTP (802.1w) condenses the five legacy 802.1D STP port states (Disabled, Blocking, Listening, Learning, Forwarding) into three operational states: Discarding, Learning, and Forwarding."
  },
  {
    id: "access-3",
    domain: "Network Access",
    question: "Which command would you use to group interfaces GigabitEthernet0/1 and GigabitEthernet0/2 into a dynamic EtherChannel using LACP?",
    options: [
      "channel-group 1 mode active",
      "channel-group 1 mode desirable",
      "channel-group 1 mode auto",
      "channel-group 1 mode on"
    ],
    answerIndex: 0,
    explanation: "LACP (IEEE standard) uses 'active' and 'passive' modes to form a dynamic EtherChannel. PAgP (Cisco proprietary) uses 'desirable' and 'auto'. 'On' mode establishes an unconditional manual EtherChannel without negotiation."
  },
  {
    id: "conn-1",
    domain: "IP Connectivity",
    question: "R1 has learned a route to 10.10.10.0/24 from OSPF (cost 110), EIGRP (metric 281600), and a static route configured with default parameters. Which route will R1 install in its routing table?",
    options: [
      "The EIGRP route, because it has the lowest metric.",
      "The OSPF route, because cost is evaluated first.",
      "The static route, because it has the lowest Administrative Distance (AD).",
      "All three routes will be installed to load-balance traffic."
    ],
    answerIndex: 2,
    explanation: "Administrative Distance (AD) is evaluated first to determine the reliability of the routing source. The source with the lowest AD wins. Static routes have an AD of 1, EIGRP has 90, and OSPF has 110. Therefore, the static route is chosen."
  },
  {
    id: "conn-2",
    domain: "IP Connectivity",
    question: "What is the default Administrative Distance of an OSPF internal route?",
    options: [
      "90",
      "110",
      "120",
      "115"
    ],
    answerIndex: 1,
    explanation: "OSPF has a default Administrative Distance of 110. For comparison, Connected is 0, Static is 1, EIGRP is 90, and RIP is 120."
  },
  {
    id: "conn-3",
    domain: "IP Connectivity",
    question: "Which wild card mask corresponds to the subnet mask 255.255.255.240?",
    options: [
      "0.0.0.15",
      "0.0.0.240",
      "0.0.0.7",
      "0.0.0.31"
    ],
    answerIndex: 0,
    explanation: "To find the wildcard mask, subtract the subnet mask from 255.255.255.255: (255-255).(255-255).(255-255).(255-240) = 0.0.0.15."
  },
  {
    id: "serv-1",
    domain: "IP Services",
    question: "Which type of NAT maps a single private IP address to a single public IP address from a pool?",
    options: [
      "Dynamic NAT",
      "Static NAT",
      "Port Address Translation (PAT)",
      "NAT Overload"
    ],
    answerIndex: 1,
    explanation: "Static NAT provides a one-to-one permanent mapping between a specific local private address and a specific global public address. Dynamic NAT maps local addresses to a pool of public addresses dynamically."
  },
  {
    id: "serv-2",
    domain: "IP Services",
    question: "A network engineer wants to configure a Cisco router to act as a DHCP server. Which command excludes the IP addresses 192.168.1.1 through 192.168.1.10 from being leased?",
    options: [
      "ip dhcp exclude-address 192.168.1.1 192.168.1.10",
      "ip dhcp excluded-address 192.168.1.1 10",
      "ip dhcp excluded-address 192.168.1.1 192.168.1.10",
      "no ip dhcp pool leases 192.168.1.1-192.168.1.10"
    ],
    answerIndex: 2,
    explanation: "The correct global configuration command is 'ip dhcp excluded-address <start-ip> <end-ip>'. This prevents the DHCP server from assigning these IPs to clients (typically reserved for routers, switches, and servers)."
  },
  {
    id: "serv-3",
    domain: "IP Services",
    question: "What is the primary role of the Network Time Protocol (NTP)?",
    options: [
      "To map hostnames to IP addresses across the enterprise.",
      "To synchronize timekeeping clocks among a set of distributed routers and servers.",
      "To capture network packet traces for auditing.",
      "To discover neighboring Cisco devices dynamically."
    ],
    answerIndex: 1,
    explanation: "NTP (Network Time Protocol) synchronizes clocks across network devices, ensuring consistent timestamping of syslog events and security logs, which is vital for correlation and troubleshooting."
  },
  {
    id: "sec-1",
    domain: "Security Fundamentals",
    question: "Which feature mitigates MAC address flooding attacks by limiting the number of MAC addresses allowed on a switch port?",
    options: [
      "DHCP Snooping",
      "BPDU Guard",
      "Dynamic ARP Inspection (DAI)",
      "Port Security"
    ],
    answerIndex: 3,
    explanation: "Port Security is a Layer 2 feature that restricts input to an interface by limiting and identifying MAC addresses of workstations allowed to access the port, preventing MAC flooding and unauthorized devices."
  },
  {
    id: "sec-2",
    domain: "Security Fundamentals",
    question: "Which encryption algorithm is used by WPA3 to provide stronger security than WPA2's 4-way handshake?",
    options: [
      "Wired Equivalent Privacy (WEP)",
      "Pre-Shared Key (PSK)",
      "Simultaneous Authentication of Equals (SAE)",
      "Temporal Key Integrity Protocol (TKIP)"
    ],
    answerIndex: 2,
    explanation: "WPA3 replaces the Pre-Shared Key (PSK) 4-way handshake of WPA2 with Simultaneous Authentication of Equals (SAE) (also known as Dragonfly key exchange), providing protection against offline dictionary attacks."
  },
  {
    id: "sec-3",
    domain: "Security Fundamentals",
    question: "An access control list (ACL) contains the line: 'access-list 101 permit tcp 172.16.0.0 0.0.255.255 any eq 80'. What does this line permit?",
    options: [
      "Any TCP traffic from 172.16.0.0/16 to any destination on port 80 (HTTP).",
      "Only UDP traffic on port 80 to the subnet 172.16.0.0/16.",
      "Any web browsing (HTTP) originating from the internet going to 172.16.0.0/16.",
      "HTTPS traffic (port 443) from 172.16.0.0/24."
    ],
    answerIndex: 0,
    explanation: "Access-list 101 is an extended ACL. The line permits TCP traffic with a source IP in the 172.16.0.0/16 subnet (wildcard 0.0.255.255), going to any destination IP on destination port 80 (eq 80, which is HTTP)."
  },
  {
    id: "auto-1",
    domain: "Automation and Programmability",
    question: "Which of the following is a key characteristic of controller-based networking (Software-Defined Networking) compared to traditional architecture?",
    options: [
      "SDN requires configuring each device individually via CLI.",
      "In SDN, the control plane and data plane are decoupled, and control is centralized.",
      "SDN relies entirely on hardware switches and removes routers from the topology.",
      "Automation scripts must run on each switch locally."
    ],
    answerIndex: 1,
    explanation: "In software-defined networking, the control plane (routing decisions) is separated from the data plane (packet forwarding) and centralized on a controller, enabling network-wide automated orchestration."
  },
  {
    id: "auto-2",
    domain: "Automation and Programmability",
    question: "Which HTTP method is used to create a new resource on a REST API server?",
    options: [
      "GET",
      "PUT",
      "POST",
      "DELETE"
    ],
    answerIndex: 2,
    explanation: "In RESTful APIs, POST is used to create a new resource, GET is used to retrieve data, PUT or PATCH is used to update an existing resource, and DELETE is used to remove a resource."
  },
  {
    id: "auto-3",
    domain: "Automation and Programmability",
    question: "Which format is syntactically correct JSON?",
    options: [
      "{'interface': 'GigabitEthernet1', 'status': 'up'}",
      "{\"interface\": \"GigabitEthernet1\", \"status\": \"up\"}",
      "interface: GigabitEthernet1, status: up",
      "[interface = \"GigabitEthernet1\", status = \"up\"]"
    ],
    answerIndex: 1,
    explanation: "JSON syntax requires double quotes for keys and string values. Single quotes are not valid in standard JSON, and keys must be enclosed in double quotes."
  },
  {
    id: "fund-4",
    domain: "Network Fundamentals",
    question: "What is the correct hexadecimal representation of the IPv6 address 2001:0db8:0000:0000:0000:ff00:0042:8329 in its most compressed form?",
    options: [
      "2001:db8::ff00:42:8329",
      "2001:0db8::ff:42:8329",
      "2001:db8:0:0:0:ff00:42:8329",
      "2001:db8::ff00:0042:8329"
    ],
    answerIndex: 0,
    explanation: "Leading zeros in each hextet can be omitted (e.g. 0db8 becomes db8, 0042 becomes 42). A single contiguous block of consecutive zero hextets can be replaced with '::'. Thus, 2001:db8::ff00:42:8329 is the most compressed form."
  },
  {
    id: "access-4",
    domain: "Network Access",
    question: "What is the primary role of a Native VLAN on an 802.1Q trunk link?",
    options: [
      "To carry management traffic like Telnet/SSH only.",
      "To transmit untagged frames received on either side of the trunk link.",
      "To act as the routing gateway between all standard VLANs.",
      "To block loops on switches that do not run Spanning Tree."
    ],
    answerIndex: 1,
    explanation: "The Native VLAN is the VLAN on an 802.1Q trunk link that transmits and receives frames without an 802.1Q tag. By default, this is VLAN 1, but it should be changed in production for security."
  },
  {
    id: "conn-4",
    domain: "IP Connectivity",
    question: "R1 has three routes to destination 192.168.1.50: a static route to 192.168.1.0/24 (AD 1), a static route to 192.168.1.32/27 (AD 1), and an EIGRP route to 192.168.1.48/29 (AD 90). Which route will R1 use to forward the packet?",
    options: [
      "The static route to 192.168.1.0/24, because it covers the largest address space.",
      "The EIGRP route, because 192.168.1.48/29 is the longest prefix match.",
      "The static route to 192.168.1.32/27, because it has an AD of 1 which is better than EIGRP.",
      "The packet will be dropped due to routing conflicts."
    ],
    answerIndex: 1,
    explanation: "When forwarding packets, a router always prioritizes the Longest Prefix Match (most specific subnet mask/longest CIDR) first, regardless of Administrative Distance. /29 is longer than /27 and /24. Therefore, the EIGRP route is selected."
  },
  {
    id: "serv-4",
    domain: "IP Services",
    question: "In SNMP, what does a Managed Device use to unsolicitedly notify the SNMP Manager of a critical event?",
    options: [
      "SNMP GET",
      "SNMP SET",
      "SNMP Trap",
      "SNMP Poll"
    ],
    answerIndex: 2,
    explanation: "An SNMP Trap is an unsolicited, asynchronous message sent by an SNMP agent on a managed device to the SNMP manager to report an event or alert instantly (e.g. link down, high CPU)."
  },
  {
    id: "sec-4",
    domain: "Security Fundamentals",
    question: "Which of the following is a symmetric encryption algorithm commonly used in VPN tunnels?",
    options: [
      "AES",
      "RSA",
      "Diffie-Hellman",
      "SHA-256"
    ],
    answerIndex: 0,
    explanation: "AES (Advanced Encryption Standard) is a symmetric encryption algorithm. RSA and Diffie-Hellman are asymmetric (public key) algorithms. SHA-256 is a hashing algorithm used for integrity, not encryption."
  },
  {
    id: "auto-4",
    domain: "Automation and Programmability",
    question: "Which Cisco software controller is designed to manage and orchestrate an enterprise campus LAN fabric under Software-Defined Access (SD-Access)?",
    options: [
      "Cisco vManage",
      "Cisco DNA Center (Catalyst Center)",
      "Cisco APIC (Application Policy Infrastructure Controller)",
      "Cisco Meraki Dashboard"
    ],
    answerIndex: 1,
    explanation: "Cisco DNA Center (now Catalyst Center) is the enterprise campus LAN fabric manager. APIC is used in ACI (Application Centric Infrastructure) in data centers. vManage is used for SD-WAN."
  },
  {
    id: "fund-5",
    domain: "Network Fundamentals",
    question: "What is the purpose of the Address Resolution Protocol (ARP) in an IPv4 network?",
    options: [
      "To map a known domain name to an IP address.",
      "To dynamically assign IP addresses to hosts.",
      "To map a known IP address to a physical MAC address.",
      "To verify link integrity using echo requests."
    ],
    answerIndex: 2,
    explanation: "ARP (Address Resolution Protocol) resolves a known Layer 3 IP address to a Layer 2 MAC address on the local segment so frames can be properly addressed and delivered."
  },
  {
    id: "conn-5",
    domain: "IP Connectivity",
    question: "What is the default Administrative Distance of a route learned via external BGP (eBGP)?",
    options: [
      "20",
      "200",
      "170",
      "110"
    ],
    answerIndex: 0,
    explanation: "External BGP (eBGP) has an Administrative Distance of 20. Internal BGP (iBGP) has an AD of 200."
  },
  {
    id: "sec-5",
    domain: "Security Fundamentals",
    question: "To secure a Cisco router CLI from brute-force attacks, which line configuration command would you run to lock the login screen after consecutive failed attempts?",
    options: [
      "login block-for 120 attempts 3 within 60",
      "security block login after 3",
      "line vty login lock 3",
      "username admin lock-out 3"
    ],
    answerIndex: 0,
    explanation: "The command 'login block-for <seconds> attempts <number> within <seconds>' blocks login attempts for a specified duration if a set number of failed logins occur within a certain timeframe."
  },
  {
    id: "access-5",
    domain: "Network Access",
    question: "What is the main advantage of configuring a trunk port with the command 'switchport nonegotiate'?",
    options: [
      "It disables DTP (Dynamic Trunking Protocol) frames to prevent VLAN hopping attacks.",
      "It disables Spanning Tree Protocol (STP) on the trunk port to speed up convergence.",
      "It allows untagged traffic to traverse the trunk link on VLAN 1.",
      "It aggregates the interface into a PAgP EtherChannel automatically."
    ],
    answerIndex: 0,
    explanation: "'switchport nonegotiate' stops the port from sending Dynamic Trunking Protocol (DTP) negotiation frames. Disabling DTP is a security best practice to prevent rogue switches from establishing trunk connections (VLAN hopping)."
  },
  {
    id: "serv-5",
    domain: "IP Services",
    question: "Which of the following IPv6 features allows a host to configure its own IPv6 address and default gateway without using a DHCPv6 server?",
    options: [
      "DHCPv6 Statefully",
      "SLAAC (Stateless Address Autoconfiguration)",
      "DNS IPv6 Translation",
      "IPv6 Dynamic Overload"
    ],
    answerIndex: 1,
    explanation: "SLAAC (Stateless Address Autoconfiguration) allows devices to join a network and configure their own IPv6 address and default gateway by listening to Router Advertisement (RA) packets sent by the local router."
  },
  {
    id: "auto-5",
    domain: "Automation and Programmability",
    question: "In Ansible, which file formats are typically used to write playbooks?",
    options: [
      "JSON",
      "XML",
      "YAML",
      "Python scripts"
    ],
    answerIndex: 2,
    explanation: "Ansible playbooks are configuration files written in YAML format, which are human-readable and use indentation to represent structure."
  }
];
