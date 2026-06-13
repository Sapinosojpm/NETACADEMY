export interface InterfaceState {
  name: string;
  shortName: string;
  ipAddress: string | null;
  subnetMask: string | null;
  isUp: boolean;
}

export interface OspfNetwork {
  network: string;
  wildcard: string;
  area: number;
}

export interface CliDeviceState {
  hostname: string;
  mode: "user" | "privileged" | "config" | "interface" | "router-ospf";
  currentInterface: string | null; // e.g. "GigabitEthernet0/0"
  currentOspfProcess: number | null;
  interfaces: Record<string, InterfaceState>;
  ospfNetworks: OspfNetwork[];
}

export const initialDeviceState = (): CliDeviceState => ({
  hostname: "Router",
  mode: "user",
  currentInterface: null,
  currentOspfProcess: null,
  interfaces: {
    "GigabitEthernet0/0": { name: "GigabitEthernet0/0", shortName: "g0/0", ipAddress: null, subnetMask: null, isUp: false },
    "GigabitEthernet0/1": { name: "GigabitEthernet0/1", shortName: "g0/1", ipAddress: null, subnetMask: null, isUp: false },
    "Loopback0": { name: "Loopback0", shortName: "lo0", ipAddress: null, subnetMask: null, isUp: false }
  },
  ospfNetworks: []
});

export function getPrompt(state: CliDeviceState): string {
  const host = state.hostname;
  switch (state.mode) {
    case "user":
      return `${host}>`;
    case "privileged":
      return `${host}#`;
    case "config":
      return `${host}(config)#`;
    case "interface": {
      const short = state.interfaces[state.currentInterface || ""]?.shortName || state.currentInterface || "";
      return `${host}(config-if)#`;
    }
    case "router-ospf":
      return `${host}(config-router)#`;
  }
}

export function parseInterfaceName(input: string): string | null {
  const lower = input.toLowerCase().trim();
  if (lower.startsWith("g0/0") || lower.startsWith("gi0/0") || lower.startsWith("gigabitethernet0/0")) {
    return "GigabitEthernet0/0";
  }
  if (lower.startsWith("g0/1") || lower.startsWith("gi0/1") || lower.startsWith("gigabitethernet0/1")) {
    return "GigabitEthernet0/1";
  }
  if (lower.startsWith("lo0") || lower.startsWith("loopback0")) {
    return "Loopback0";
  }
  return null;
}

export function executeCliCommand(
  state: CliDeviceState,
  commandLine: string
): { nextState: CliDeviceState; output: string[] } {
  const rawCmd = commandLine.trim();
  if (!rawCmd) return { nextState: state, output: [] };

  const parts = rawCmd.split(/\s+/);
  const base = parts[0].toLowerCase();
  const args = parts.slice(1);
  const fullArgsLower = args.map(a => a.toLowerCase());

  const nextState = JSON.parse(JSON.stringify(state)) as CliDeviceState;
  const output: string[] = [];

  // Match commands based on mode
  if (base === "help" || base === "?") {
    output.push("Simulated Cisco IOS Commands:");
    output.push("  enable (en)                - Enter privileged EXEC mode");
    output.push("  disable                    - Exit privileged EXEC mode");
    output.push("  configure terminal (conf t)- Enter global configuration mode");
    output.push("  hostname <name>            - Change router hostname");
    output.push("  interface <name> (int)     - Enter interface config mode");
    output.push("  ip address <ip> <mask>     - Set IP address on current interface");
    output.push("  no shutdown (no shut)      - Enable current interface");
    output.push("  shutdown                   - Disable current interface");
    output.push("  router ospf <process-id>   - Enter OSPF configuration mode");
    output.push("  network <ip> <w_mask> area <id> - Configure OSPF networks");
    output.push("  show ip interface brief    - Show summary status of interfaces");
    output.push("  show running-config (sh run)- Show current configuration");
    output.push("  show ip route              - Show Layer 3 routing table");
    output.push("  exit                       - Go back one level");
    output.push("  end                        - Return to privileged EXEC mode");
    return { nextState, output };
  }

  // 1. User EXEC Mode Commands
  if (nextState.mode === "user") {
    if (base === "enable" || base === "en") {
      nextState.mode = "privileged";
      return { nextState, output };
    }
    if (base === "exit") {
      output.push("[Connection closed]");
      return { nextState, output };
    }
    output.push(`% Translated: "${rawCmd}" ... Unrecognized command or command privilege level.`);
    return { nextState, output };
  }

  // 2. Commands available in Privileged EXEC or higher (show commands)
  const isShow = base === "show" || base === "sh";
  if (isShow) {
    const showTarget = parts[1]?.toLowerCase();
    if (showTarget === "ip") {
      const ipTarget = parts[2]?.toLowerCase();
      if (ipTarget === "interface" || ipTarget === "int") {
        const intDetail = parts[3]?.toLowerCase();
        if (intDetail === "brief" || intDetail === "bri") {
          // show ip interface brief
          output.push(
            "Interface                  IP-Address      OK? Method Status                Protocol"
          );
          Object.values(nextState.interfaces).forEach(iface => {
            const ipStr = iface.ipAddress || "unassigned";
            const statusStr = iface.isUp ? "up" : "administratively down";
            const protocolStr = iface.isUp ? "up" : "down";
            output.push(
              `${iface.name.padEnd(26)}${ipStr.padEnd(16)}YES manual ${statusStr.padEnd(21)}${protocolStr}`
            );
          });
          return { nextState, output };
        }
      }
      if (ipTarget === "route" || ipTarget === "ro") {
        // show ip route
        output.push("Codes: C - connected, S - static, O - OSPF, R - RIP");
        output.push("Gateway of last resort is not set");
        output.push("");
        
        let hasRoutes = false;
        Object.values(nextState.interfaces).forEach(iface => {
          if (iface.isUp && iface.ipAddress && iface.subnetMask) {
            hasRoutes = true;
            // Split IP
            const ipParts = iface.ipAddress.split(".").map(Number);
            const maskParts = iface.subnetMask.split(".").map(Number);
            const netParts = ipParts.map((b, i) => b & maskParts[i]);
            const netAddress = netParts.join(".");
            
            // Calculate prefix length (rough estimate)
            const binary = maskParts.map(o => o.toString(2).padStart(8, "0")).join("");
            const cidr = binary.indexOf("0") === -1 ? 32 : binary.indexOf("0");

            output.push(`C     ${netAddress}/${cidr} is directly connected, ${iface.name}`);
            output.push(`L     ${iface.ipAddress}/32 is directly connected, ${iface.name}`);
          }
        });

        // Add OSPF simulated routes if interfaces are up
        if (nextState.ospfNetworks.length > 0) {
          nextState.ospfNetworks.forEach(net => {
            // Check if there is a simulated route to OSPF network
            // (e.g. advertising 192.168.2.0 wildcard 0.0.0.255)
            // Just display OSPF routes for visual completion
            output.push(`O     ${net.network}/24 [110/2] via 10.0.0.2, 00:04:12, GigabitEthernet0/0`);
            hasRoutes = true;
          });
        }

        if (!hasRoutes) {
          output.push("% Routing table is empty (Bring interfaces UP with 'no shutdown' first)");
        }
        return { nextState, output };
      }
    }
    if (showTarget === "running-config" || showTarget === "run") {
      output.push("Building configuration...");
      output.push("");
      output.push("Current configuration :");
      output.push("!");
      output.push(`hostname ${nextState.hostname}`);
      output.push("!");
      Object.values(nextState.interfaces).forEach(iface => {
        output.push(`interface ${iface.name}`);
        if (iface.ipAddress) {
          output.push(` ip address ${iface.ipAddress} ${iface.subnetMask}`);
        } else {
          output.push(" no ip address");
        }
        if (!iface.isUp) {
          output.push(" shutdown");
        } else {
          output.push(" no shutdown");
        }
        output.push("!");
      });
      if (nextState.currentOspfProcess || nextState.ospfNetworks.length > 0) {
        output.push(`router ospf ${nextState.currentOspfProcess || 10}`);
        nextState.ospfNetworks.forEach(net => {
          output.push(` network ${net.network} ${net.wildcard} area ${net.area}`);
        });
        output.push("!");
      }
      output.push("end");
      return { nextState, output };
    }
  }

  // 3. Privileged EXEC Mode Commands
  if (nextState.mode === "privileged") {
    if (base === "configure" && fullArgsLower[0] === "terminal") {
      nextState.mode = "config";
      return { nextState, output };
    }
    if (base === "conf" && fullArgsLower[0] === "t") {
      nextState.mode = "config";
      return { nextState, output };
    }
    if (base === "disable") {
      nextState.mode = "user";
      return { nextState, output };
    }
    if (base === "exit") {
      nextState.mode = "user";
      return { nextState, output };
    }
    output.push(`% Invalid input or command syntax error at "${base}"`);
    return { nextState, output };
  }

  // 4. Global Configuration Mode Commands
  if (nextState.mode === "config") {
    if (base === "exit") {
      nextState.mode = "privileged";
      return { nextState, output };
    }
    if (base === "end") {
      nextState.mode = "privileged";
      return { nextState, output };
    }
    if (base === "hostname") {
      if (!parts[1]) {
        output.push("% Command incomplete.");
      } else {
        nextState.hostname = parts[1];
      }
      return { nextState, output };
    }
    if (base === "interface" || base === "int") {
      if (!parts[1]) {
        output.push("% Command incomplete.");
      } else {
        const ifaceName = parseInterfaceName(parts[1]);
        if (ifaceName) {
          nextState.mode = "interface";
          nextState.currentInterface = ifaceName;
        } else {
          output.push(`% Invalid interface type or number: "${parts[1]}"`);
        }
      }
      return { nextState, output };
    }
    if (base === "router" && fullArgsLower[0] === "ospf") {
      const processId = parseInt(parts[2], 10);
      if (isNaN(processId) || processId < 1 || processId > 65535) {
        output.push("% Invalid OSPF process ID (choose 1-65535)");
      } else {
        nextState.mode = "router-ospf";
        nextState.currentOspfProcess = processId;
      }
      return { nextState, output };
    }
    output.push(`% Unrecognized command: "${rawCmd}"`);
    return { nextState, output };
  }

  // 5. Interface Configuration Mode Commands
  if (nextState.mode === "interface") {
    const curIface = nextState.currentInterface || "";
    if (base === "exit") {
      nextState.mode = "config";
      nextState.currentInterface = null;
      return { nextState, output };
    }
    if (base === "end") {
      nextState.mode = "privileged";
      nextState.currentInterface = null;
      return { nextState, output };
    }
    if (base === "shutdown") {
      if (nextState.interfaces[curIface]) {
        nextState.interfaces[curIface].isUp = false;
        output.push(`%LINK-5-CHANGED: Interface ${curIface}, changed state to administratively down`);
      }
      return { nextState, output };
    }
    if (base === "no" && fullArgsLower[0] === "shutdown") {
      if (nextState.interfaces[curIface]) {
        nextState.interfaces[curIface].isUp = true;
        output.push(`%LINK-5-CHANGED: Interface ${curIface}, changed state to up`);
        output.push(`%LINEPROTO-5-UPDOWN: Line protocol on Interface ${curIface}, changed state to up`);
      }
      return { nextState, output };
    }
    if (base === "no" && fullArgsLower[0] === "shut") {
      if (nextState.interfaces[curIface]) {
        nextState.interfaces[curIface].isUp = true;
        output.push(`%LINK-5-CHANGED: Interface ${curIface}, changed state to up`);
        output.push(`%LINEPROTO-5-UPDOWN: Line protocol on Interface ${curIface}, changed state to up`);
      }
      return { nextState, output };
    }
    if (base === "ip" && fullArgsLower[0] === "address") {
      const ip = parts[2];
      const mask = parts[3];
      if (!ip || !mask) {
        output.push("% Command incomplete.");
      } else {
        // Simple regex check for IP patterns
        const ipPattern = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
        if (!ipPattern.test(ip) || !ipPattern.test(mask)) {
          output.push("% Invalid IP address or subnet mask configuration.");
        } else {
          if (nextState.interfaces[curIface]) {
            nextState.interfaces[curIface].ipAddress = ip;
            nextState.interfaces[curIface].subnetMask = mask;
          }
        }
      }
      return { nextState, output };
    }
    if (base === "ip" && fullArgsLower[0] === "add") {
      const ip = parts[2];
      const mask = parts[3];
      if (!ip || !mask) {
        output.push("% Command incomplete.");
      } else {
        const ipPattern = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
        if (!ipPattern.test(ip) || !ipPattern.test(mask)) {
          output.push("% Invalid IP address or subnet mask configuration.");
        } else {
          if (nextState.interfaces[curIface]) {
            nextState.interfaces[curIface].ipAddress = ip;
            nextState.interfaces[curIface].subnetMask = mask;
          }
        }
      }
      return { nextState, output };
    }
    output.push(`% Unrecognized command: "${rawCmd}"`);
    return { nextState, output };
  }

  // 6. Router OSPF Mode Commands
  if (nextState.mode === "router-ospf") {
    if (base === "exit") {
      nextState.mode = "config";
      return { nextState, output };
    }
    if (base === "end") {
      nextState.mode = "privileged";
      return { nextState, output };
    }
    if (base === "network") {
      const netIp = parts[1];
      const wildcard = parts[2];
      const areaKeyword = parts[3]?.toLowerCase();
      const areaIdStr = parts[4];

      if (!netIp || !wildcard || areaKeyword !== "area" || !areaIdStr) {
        output.push("% Command incomplete or syntax error. Example: network 192.168.1.0 0.0.0.255 area 0");
      } else {
        const areaId = parseInt(areaIdStr, 10);
        if (isNaN(areaId) || areaId < 0) {
          output.push("% Invalid Area ID (choose 0 or positive integer)");
        } else {
          nextState.ospfNetworks.push({
            network: netIp,
            wildcard: wildcard,
            area: areaId
          });
        }
      }
      return { nextState, output };
    }
    output.push(`% Unrecognized command: "${rawCmd}"`);
    return { nextState, output };
  }

  output.push(`% Invalid command: "${rawCmd}"`);
  return { nextState, output };
}
