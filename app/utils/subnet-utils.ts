export interface SubnetDetails {
  ip: string;
  cidr: number;
  subnetMask: string;
  wildcardMask: string;
  networkAddress: string;
  broadcastAddress: string;
  firstUsable: string;
  lastUsable: string;
  usableHosts: number;
  ipBinary: string;
  maskBinary: string;
  networkBinary: string;
  ipClass: string;
  ipType: "Public" | "Private" | "Loopback" | "Link-Local" | "Multicast" | "Experimental";
}

export function validateIp(ip: string): boolean {
  const parts = ip.trim().split(".");
  if (parts.length !== 4) return false;
  return parts.every(part => {
    const num = parseInt(part, 10);
    return !isNaN(num) && num >= 0 && num <= 255 && part === num.toString();
  });
}

function ipToLong(ip: string): number {
  return ip.split(".").reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

function longToIp(long: number): string {
  return [
    (long >>> 24) & 255,
    (long >>> 16) & 255,
    (long >>> 8) & 255,
    long & 255
  ].join(".");
}

export function ipToBinary(ip: string): string {
  if (!validateIp(ip)) return "";
  return ip.split(".")
    .map(octet => parseInt(octet, 10).toString(2).padStart(8, "0"))
    .join(".");
}

export function cidrToSubnetMask(cidr: number): string {
  if (cidr === 0) return "0.0.0.0";
  const mask = (0xffffffff << (32 - cidr)) >>> 0;
  return longToIp(mask);
}

export function getWildcardMask(cidr: number): string {
  const mask = (0xffffffff << (32 - cidr)) >>> 0;
  const wildcard = ~mask >>> 0;
  return longToIp(wildcard);
}

export function calculateSubnetDetails(ip: string, cidr: number): SubnetDetails | null {
  if (!validateIp(ip) || cidr < 1 || cidr > 32) return null;

  const ipLong = ipToLong(ip);
  const maskLong = (cidr === 32 ? 0xffffffff : (0xffffffff << (32 - cidr)) >>> 0);
  const wildcardLong = ~maskLong >>> 0;

  const networkLong = (ipLong & maskLong) >>> 0;
  const broadcastLong = (networkLong | wildcardLong) >>> 0;

  const subnetMask = longToIp(maskLong);
  const wildcardMask = longToIp(wildcardLong);
  const networkAddress = longToIp(networkLong);
  const broadcastAddress = longToIp(broadcastLong);

  let firstUsable = "";
  let lastUsable = "";
  let usableHosts = 0;

  if (cidr === 32) {
    firstUsable = networkAddress;
    lastUsable = networkAddress;
    usableHosts = 1;
  } else if (cidr === 31) {
    firstUsable = networkAddress;
    lastUsable = broadcastAddress;
    usableHosts = 2;
  } else {
    firstUsable = longToIp(networkLong + 1);
    lastUsable = longToIp(broadcastLong - 1);
    usableHosts = broadcastLong - networkLong - 1;
  }

  // Determine IP Class
  const firstOctet = parseInt(ip.split(".")[0], 10);
  let ipClass = "Unknown";
  if (firstOctet >= 1 && firstOctet <= 126) ipClass = "Class A";
  else if (firstOctet === 127) ipClass = "Class A (Loopback)";
  else if (firstOctet >= 128 && firstOctet <= 191) ipClass = "Class B";
  else if (firstOctet >= 192 && firstOctet <= 223) ipClass = "Class C";
  else if (firstOctet >= 224 && firstOctet <= 239) ipClass = "Class D (Multicast)";
  else if (firstOctet >= 240 && firstOctet <= 255) ipClass = "Class E (Experimental)";

  // Determine IP Type
  let ipType: SubnetDetails["ipType"] = "Public";
  if (firstOctet === 10) {
    ipType = "Private";
  } else if (firstOctet === 172) {
    const secondOctet = parseInt(ip.split(".")[1], 10);
    if (secondOctet >= 16 && secondOctet <= 31) {
      ipType = "Private";
    }
  } else if (firstOctet === 192) {
    const secondOctet = parseInt(ip.split(".")[1], 10);
    if (secondOctet === 168) {
      ipType = "Private";
    }
  } else if (firstOctet === 127) {
    ipType = "Loopback";
  } else if (firstOctet === 169) {
    const secondOctet = parseInt(ip.split(".")[1], 10);
    if (secondOctet === 254) {
      ipType = "Link-Local";
    }
  } else if (firstOctet >= 224 && firstOctet <= 239) {
    ipType = "Multicast";
  } else if (firstOctet >= 240) {
    ipType = "Experimental";
  }

  return {
    ip,
    cidr,
    subnetMask,
    wildcardMask,
    networkAddress,
    broadcastAddress,
    firstUsable,
    lastUsable,
    usableHosts,
    ipBinary: ipToBinary(ip),
    maskBinary: ipToBinary(subnetMask),
    networkBinary: ipToBinary(networkAddress),
    ipClass,
    ipType
  };
}

export interface SubnetQuestion {
  question: string;
  correctAnswer: string;
  options: string[];
  explanation: string;
}

export function generateSubnetQuestion(): SubnetQuestion {
  const types = ["network_id", "broadcast", "first_usable", "last_usable", "host_count", "wildcard"];
  const selectedType = types[Math.floor(Math.random() * types.length)];

  // Generate random IP and CIDR
  const cidr = Math.floor(Math.random() * 23) + 8; // CIDR /8 to /30
  const octets = [
    Math.floor(Math.random() * 223) + 1, // Avoid multicast/class E
    Math.floor(Math.random() * 255),
    Math.floor(Math.random() * 255),
    Math.floor(Math.random() * 255)
  ];
  if (octets[0] === 127) octets[0] = 126; // Avoid loopback
  const ip = octets.join(".");

  const details = calculateSubnetDetails(ip, cidr);
  if (!details) {
    // Fallback if details are null
    return {
      question: "What is the subnet mask for a /24 subnet?",
      correctAnswer: "255.255.255.0",
      options: ["255.255.255.0", "255.255.255.128", "255.255.240.0", "255.255.0.0"],
      explanation: "A /24 subnet mask contains 24 network bits set to 1, yielding 255.255.255.0."
    };
  }

  let question = "";
  let correctAnswer = "";
  let explanation = "";
  const options: string[] = [];

  switch (selectedType) {
    case "network_id":
      question = `What is the network ID (subnet address) for the host IP ${ip}/${cidr}?`;
      correctAnswer = details.networkAddress;
      explanation = `To find the network address, perform a bitwise AND on the IP address (${ip}) and the subnet mask (${details.subnetMask}). The resulting network address is ${details.networkAddress}.`;
      
      options.push(correctAnswer);
      // Distractors
      options.push(longToIp((ipToLong(details.networkAddress) + (1 << (32 - cidr))) >>> 0));
      options.push(longToIp((ipToLong(details.networkAddress) - (1 << (32 - cidr))) >>> 0));
      options.push(details.broadcastAddress);
      break;

    case "broadcast":
      question = `What is the broadcast address for the subnet containing host ${ip}/${cidr}?`;
      correctAnswer = details.broadcastAddress;
      explanation = `The broadcast address is the highest address in the subnet. It can be found by adding the wildcard mask (${details.wildcardMask}) to the network address (${details.networkAddress}). Result: ${details.broadcastAddress}.`;
      
      options.push(correctAnswer);
      options.push(details.networkAddress);
      options.push(longToIp((ipToLong(details.broadcastAddress) - 1) >>> 0));
      options.push(longToIp((ipToLong(details.broadcastAddress) + 1) >>> 0));
      break;

    case "first_usable":
      question = `What is the first usable host IP address in the subnet of host ${ip}/${cidr}?`;
      correctAnswer = details.firstUsable;
      explanation = `The first usable host address in a subnet is one address higher than the network address (${details.networkAddress}). Result: ${details.firstUsable}.`;
      
      options.push(correctAnswer);
      options.push(details.networkAddress);
      options.push(details.broadcastAddress);
      options.push(longToIp((ipToLong(details.firstUsable) + 1) >>> 0));
      break;

    case "last_usable":
      question = `What is the last usable host IP address in the subnet of host ${ip}/${cidr}?`;
      correctAnswer = details.lastUsable;
      explanation = `The last usable host address is one address lower than the broadcast address (${details.broadcastAddress}). Result: ${details.lastUsable}.`;
      
      options.push(correctAnswer);
      options.push(details.broadcastAddress);
      options.push(details.networkAddress);
      options.push(longToIp((ipToLong(details.lastUsable) - 1) >>> 0));
      break;

    case "host_count":
      question = `How many usable host IP addresses are available in a /${cidr} subnet?`;
      correctAnswer = details.usableHosts.toLocaleString();
      explanation = `The number of usable host addresses is calculated using the formula 2^(32 - CIDR) - 2. For a /${cidr} subnet, we have ${32 - cidr} host bits. 2^${32 - cidr} - 2 = ${details.usableHosts}.`;
      
      options.push(correctAnswer);
      options.push((details.usableHosts + 2).toLocaleString()); // 2^n
      options.push((details.usableHosts - 2).toLocaleString());
      options.push((details.usableHosts * 2).toLocaleString());
      break;

    case "wildcard":
      question = `What is the wildcard mask corresponding to a /${cidr} subnet?`;
      correctAnswer = details.wildcardMask;
      explanation = `The wildcard mask is the inverse of the subnet mask (${details.subnetMask}). It is calculated by subtracting each octet of the subnet mask from 255. Result: ${details.wildcardMask}.`;
      
      options.push(correctAnswer);
      options.push(details.subnetMask);
      options.push(longToIp(~(ipToLong(details.wildcardMask)) >>> 0));
      options.push("0.0.0.255");
      break;
  }

  // Filter out any duplicate options or invalid IPs that distractors might make, and shuffle
  const uniqueOptions = Array.from(new Set(options.map(opt => opt || "0.0.0.0")));
  while (uniqueOptions.length < 4) {
    // Fill up with dummy distractors if needed
    const dummy = longToIp(Math.floor(Math.random() * 0xffffffff));
    if (!uniqueOptions.includes(dummy)) {
      uniqueOptions.push(dummy);
    }
  }
  
  // Shuffle options
  const shuffled = uniqueOptions.sort(() => Math.random() - 0.5);

  return {
    question,
    correctAnswer,
    options: shuffled,
    explanation
  };
}
