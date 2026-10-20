import type { CsSet } from "./cs-types";

export const set: CsSet = {
  id: "networks",
  title: "Computer networks",
  intro:
    "Networking questions reported in interviews: layers, DNS, HTTP, load balancing and TLS, with model answers. Open a theme, try the answer aloud first, then check it against the model.",
  themes: [
    {
      id: "layers",
      name: "Layers and addressing",
    },
    {
      id: "dns",
      name: "DNS and the page load",
    },
    {
      id: "traffic",
      name: "Traffic and gateways",
    },
    {
      id: "http",
      name: "HTTP and APIs",
    },
    {
      id: "security",
      name: "Security in transit",
    },
  ],
  chapters: [
    {
      href: "/networks",
      label: "Computer networks guide",
    },
    {
      href: "/system-design",
      label: "System design track",
    },
    {
      href: "/mock",
      label: "Mock interviews",
    },
  ],
  questions: [
    {
      id: "networks-osi-and-tcp-ip-layers",
      theme: "layers",
      q: "Explain the OSI model and the TCP/IP model, and say which layer common protocols belong to.",
      a: "<p>The <b>OSI model</b> splits networking into seven layers: physical, data link, network, transport, session, presentation and application. The <b>TCP/IP model</b> collapses this into four layers (some texts count five): link, internet, transport and application. Each layer talks to the same layer on the peer and offers a service to the layer above, so data is wrapped in a new header at every step down (encapsulation).</p><ul><li>Ethernet and Wi-Fi frames, MAC addresses, switches: data link</li><li>IP, ICMP, routers: network (internet)</li><li><code>TCP</code> and <code>UDP</code>: transport</li><li>HTTP, DNS, SMTP: application</li></ul><p>TLS has no clean home; it sits between transport and application. A typical follow-up asks where a switch, a router and a firewall operate (layers 2, 3 and 3 to 7).</p>",
      level: "Core",
      companies: ["uber", "amazon", "meesho", "juspay", "phonepe"],
      evidence: "several",
      sources: [
        {
          label: "Uber Interview Experience | Software Engineer 1 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/uber-interview-experience-software-engineer-1/",
          kind: "candidate-report",
        },
        {
          label: "Amazon Interview Experience For SDE Intern (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-for-sde-intern-8/",
          kind: "candidate-report",
        },
        {
          label: "Meesho Interview Experience for SDE-1 | On-Campus (Virtual) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/meesho-interview-experience-for-sde-1-on-campus-virtual/",
          kind: "candidate-report",
        },
        {
          label: "Juspay Interview Experience for Internship | On-Campus 2020 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/juspay-interview-experience-for-internship-on-campus-2020/",
          kind: "candidate-report",
          year: 2020,
        },
        {
          label: "Phonepe Interview Experience (On-campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/phonepe-interview-experience-on-campus-1/",
          kind: "candidate-report",
        },
        {
          label: "PhonePe Interview Questions (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/gfg-academy/phonepe-interview-questions/",
          kind: "prep-guide",
        },
        {
          label: "Member Of Technical Staff (MTS) Interview Questions and Answers (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/member-of-technical-staff-mts-interview-questions-and-answers/",
          kind: "prep-guide",
        },
      ],
      links: [
        {
          href: "/networks",
          label: "Computer networks guide",
        },
      ],
    },
    {
      id: "networks-tcp-vs-udp",
      theme: "layers",
      q: "How do TCP and UDP differ, and when would you pick each?",
      a: "<p><b>TCP</b> is connection-oriented. It opens with a three-way handshake and gives a reliable, ordered byte stream using sequence numbers, acknowledgements, retransmission, flow control and congestion control. <b>UDP</b> is connectionless: it sends independent datagrams with an 8 byte header and offers no delivery, ordering or retransmission guarantee.</p><ul><li>Choose TCP when every byte must arrive in order: web pages, file transfer, email, database connections.</li><li>Choose UDP when freshness beats completeness or the application handles loss itself: DNS lookups, voice and video calls, games, and QUIC, which builds reliability on top of UDP.</li></ul><p>The usual follow-up is head-of-line blocking: one lost TCP segment stalls every stream multiplexed behind it, which is one reason HTTP/3 moved to QUIC.</p>",
      level: "Core",
      companies: ["amazon", "uber", "zomato", "razorpay", "phonepe"],
      evidence: "several",
      sources: [
        {
          label: "Amazon Interview Experience | SDE-I (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-sde-i/",
          kind: "candidate-report",
        },
        {
          label: "Uber Interview Experience | Software Engineer 1 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/uber-interview-experience-software-engineer-1/",
          kind: "candidate-report",
        },
        {
          label: "Zomato x Blinkit Interview Experience for SDE-I | On-Campus 2024 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/zomato-x-blinkit-interview-experience-for-sde-i-on-campus-2024/",
          kind: "candidate-report",
          year: 2024,
        },
        {
          label: "Razorpay PSE Intern Interview Experience (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/razorpay-pse-intern-interview-experience-on-campus-2025/",
          kind: "candidate-report",
          year: 2025,
        },
        {
          label: "Phonepe Interview Experience (On-campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/phonepe-interview-experience-on-campus-1/",
          kind: "candidate-report",
        },
        {
          label: "Member Of Technical Staff (MTS) Interview Questions and Answers (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/member-of-technical-staff-mts-interview-questions-and-answers/",
          kind: "prep-guide",
        },
      ],
      links: [
        {
          href: "/networks",
          label: "Computer networks guide",
        },
      ],
    },
    {
      id: "networks-ip-addressing-subnetting",
      theme: "layers",
      q: "How does IP addressing work, and what does subnetting with CIDR do?",
      a: "<p>An IPv4 address is 32 bits (IPv6 uses 128). <b>CIDR</b> notation such as <code>192.168.10.0/24</code> says the first 24 bits identify the network and the remaining 8 identify the host. A /24 holds 256 addresses, of which 254 are usable because the all-zeros host is the network address and the all-ones host is the broadcast address.</p><p><b>Subnetting</b> borrows host bits to cut a block into smaller networks: a /26 gives 64 addresses (62 hosts), so one /24 splits into four /26 subnets. It limits broadcast traffic and lets you apply separate policies per subnet.</p><p>Private ranges are <code>10.0.0.0/8</code>, <code>172.16.0.0/12</code> and <code>192.168.0.0/16</code>. A follow-up: routers pick the matching route with the longest prefix.</p>",
      level: "Core",
      companies: ["swiggy"],
      evidence: "several",
      sources: [
        {
          label: "Swiggy Interview Experience | Set 2 (On-Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/swiggy-interview-experience-set-2-on-campus/",
          kind: "candidate-report",
        },
        {
          label: "Juspay Interview Questions for Technical Profiles (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/juspay-interview-questions-for-technical-profiles/",
          kind: "prep-guide",
        },
        {
          label: "Member Of Technical Staff (MTS) Interview Questions and Answers (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/member-of-technical-staff-mts-interview-questions-and-answers/",
          kind: "prep-guide",
        },
      ],
      links: [
        {
          href: "/networks",
          label: "Computer networks guide",
        },
      ],
    },
    {
      id: "networks-ip-vs-mac-address",
      theme: "layers",
      q: "What is the difference between an IP address and a MAC address?",
      a: "<p>A <b>MAC address</b> is a 48 bit layer 2 identifier assigned to a network interface, usually by the manufacturer, and written as six hex pairs. It only matters on the local link. An <b>IP address</b> is a layer 3 logical address tied to where the host sits in the network, and it can change when the host moves or a DHCP lease renews.</p><p>On a path through routers the source and destination IP stay the same end to end (ignoring NAT), while the MAC addresses are rewritten at every hop: each router strips the old frame and builds a new one for the next link.</p><p>You need both because IP gives routable, hierarchical addressing and MAC gives delivery on a shared medium. The follow-up is how a host learns the MAC for a given IP, which is ARP.</p>",
      level: "Core",
      companies: [],
      evidence: "guide",
      sources: [
        {
          label: "Juspay Interview Questions for Technical Profiles (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/juspay-interview-questions-for-technical-profiles/",
          kind: "prep-guide",
        },
      ],
      links: [
        {
          href: "/networks",
          label: "Computer networks guide",
        },
      ],
    },
    {
      id: "networks-arp",
      theme: "layers",
      q: "What does ARP do and how does a host use it to send a packet?",
      a: '<p><b>ARP</b> (Address Resolution Protocol) maps an IPv4 address to a MAC address on the same local network. A host that wants to reach <code>192.168.1.20</code> broadcasts "who has this IP?" to <code>ff:ff:ff:ff:ff:ff</code>. The owner replies with a unicast message carrying its MAC, and the asker stores the pair in its ARP cache for a short time.</p><p>If the destination is on another subnet, the host does not ARP for it; it ARPs for the default gateway and sends the frame there, leaving the IP destination untouched.</p><p>ARP has no authentication, so a host can lie in its replies (ARP spoofing) and redirect traffic. IPv6 replaces ARP with Neighbor Discovery. Interviewers often follow up with how a switch learns which port holds which MAC.</p>',
      level: "Core",
      companies: ["meesho"],
      evidence: "one",
      sources: [
        {
          label: "Meesho Interview Experience for SDE-1 | On-Campus (Virtual) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/meesho-interview-experience-for-sde-1-on-campus-virtual/",
          kind: "candidate-report",
        },
      ],
      links: [
        {
          href: "/networks",
          label: "Computer networks guide",
        },
      ],
    },
    {
      id: "networks-dns-resolution",
      theme: "dns",
      q: "How does DNS resolve a domain name, and what are the common record types?",
      a: "<p>DNS is a distributed, hierarchical database that maps names to records. For <code>www.example.com</code> the app asks the OS stub resolver, which asks a <b>recursive resolver</b> (your ISP or a public one). On a cache miss it walks down: a root server points to the <code>.com</code> TLD servers, which point to the domain's <b>authoritative</b> server, which returns the answer. Every answer is cached for its <b>TTL</b>.</p><ul><li><code>A</code> and <code>AAAA</code>: IPv4 and IPv6 address</li><li><code>CNAME</code>: alias to another name</li><li><code>MX</code>: mail servers</li><li><code>NS</code>: delegation; <code>TXT</code>: free text such as SPF</li></ul><p>Queries normally use UDP port 53, falling back to TCP for large replies. A follow-up is how you would design DNS: hierarchy, replication, anycast and caching.</p>",
      level: "Core",
      companies: ["zomato", "swiggy", "meesho", "amazon", "apple", "atlassian"],
      evidence: "several",
      sources: [
        {
          label: "Zomato x Blinkit Interview Experience for SDE-I | On-Campus 2024 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/zomato-x-blinkit-interview-experience-for-sde-i-on-campus-2024/",
          kind: "candidate-report",
          year: 2024,
        },
        {
          label: "Swiggy Interview Experience | Set 2 (On-Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/swiggy-interview-experience-set-2-on-campus/",
          kind: "candidate-report",
        },
        {
          label: "Meesho Interview Experience for SDE-1 | On-Campus (Virtual) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/meesho-interview-experience-for-sde-1-on-campus-virtual/",
          kind: "candidate-report",
        },
        {
          label: "Amazon Interview Experience For SDE Intern (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-for-sde-intern-8/",
          kind: "candidate-report",
        },
        {
          label: "Apple Interview Experience (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/apple-interview-experience/",
          kind: "candidate-report",
        },
        {
          label: "Atlassian Interview Experience for Product Security Engineer (On-Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/atlassian-interview-experience-for-product-security-engineer-on-campus/",
          kind: "candidate-report",
        },
        {
          label: "PhonePe Interview Questions (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/gfg-academy/phonepe-interview-questions/",
          kind: "prep-guide",
        },
        {
          label: "Member Of Technical Staff (MTS) Interview Questions and Answers (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/member-of-technical-staff-mts-interview-questions-and-answers/",
          kind: "prep-guide",
        },
      ],
      links: [
        {
          href: "/networks",
          label: "Computer networks guide",
        },
      ],
    },
    {
      id: "networks-url-in-browser",
      theme: "dns",
      q: "What happens between typing a URL in the browser and seeing the page?",
      a: "<ol><li>The browser parses the URL and checks its caches and the HSTS list.</li><li>DNS resolves the host name to an IP address.</li><li>A TCP connection opens with the three-way handshake (QUIC over UDP for HTTP/3).</li><li>For HTTPS, the TLS handshake agrees on keys and verifies the server certificate.</li><li>The browser sends the HTTP request. It may pass a CDN and a load balancer before reaching an application server, which can query a database and build the response.</li><li>The browser parses the HTML into the DOM, discovers CSS, JavaScript and images, fetches them (often over the same connection), builds the render tree, then lays out and paints.</li></ol><p>Strong answers add where caching shortcuts each step. The usual follow-up is to dig into one stage, often DNS or TLS.</p>",
      level: "Core",
      companies: ["myntra", "swiggy", "apple"],
      evidence: "several",
      sources: [
        {
          label: "Myntra Interview Experience | Set 9 (On Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/myntra-interview-experience-set-9-campus/",
          kind: "candidate-report",
        },
        {
          label: "Swiggy Interview Experience for SDE-1 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/swiggy-interview-experience-for-sde-1/",
          kind: "candidate-report",
        },
        {
          label: "Apple Interview Experience (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/apple-interview-experience/",
          kind: "candidate-report",
        },
      ],
      links: [
        {
          href: "/networks",
          label: "Computer networks guide",
        },
      ],
    },
    {
      id: "networks-cdn",
      theme: "dns",
      q: "What is a CDN and why would a system put one in front of its origin?",
      a: "<p>A <b>content delivery network</b> is a set of edge servers spread across regions that cache content close to users. Requests reach a nearby edge through DNS-based or anycast routing. On a hit the edge answers directly; on a miss it fetches from the origin and stores the copy according to <code>Cache-Control</code> headers and TTLs.</p><ul><li>Lower latency, because the round trip is shorter.</li><li>Less load and bandwidth at the origin.</li><li>Better absorption of traffic spikes and some denial-of-service attacks.</li></ul><p>It suits static assets such as images, scripts and video segments. Personalised responses should not be cached publicly. A common follow-up is invalidation: how to purge or version (content-hashed file names) assets after a deploy.</p>",
      level: "Core",
      companies: ["dream11"],
      evidence: "one",
      sources: [
        {
          label: "Dream11 Interview Experience for SDE II (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/dream11-interview-experience-for-sde-ii-2/",
          kind: "candidate-report",
        },
      ],
      links: [
        {
          href: "/system-design",
          label: "System design track",
        },
      ],
    },
    {
      id: "networks-load-balancer",
      theme: "traffic",
      q: "What is a load balancer and how does it spread traffic across servers?",
      a: "<p>A <b>load balancer</b> sits in front of a pool of servers, accepts client traffic and forwards each request or connection to a healthy backend. This adds capacity, removes a single server as a point of failure and enables rolling deploys.</p><ul><li><b>Layer 4</b> balancers route on IP and port; <b>layer 7</b> balancers read HTTP and can route by path, header or cookie and terminate TLS.</li><li>Algorithms: round robin, weighted round robin, least connections, IP hash, consistent hashing.</li><li>Health checks take failing nodes out of rotation.</li></ul><p>Sticky sessions pin a user to one backend, but keeping servers stateless is better. The balancer itself must not be a single point of failure, so it runs as a redundant pair or behind anycast. Expect a follow-up on how you scale it.</p>",
      level: "Core",
      companies: ["swiggy", "zomato", "flipkart", "dream11"],
      evidence: "several",
      sources: [
        {
          label: "Swiggy Interview Experience for SDE-1 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/swiggy-interview-experience-for-sde-1/",
          kind: "candidate-report",
        },
        {
          label: "Zomato x Blinkit Interview Experience for SDE-I | On-Campus 2024 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/zomato-x-blinkit-interview-experience-for-sde-i-on-campus-2024/",
          kind: "candidate-report",
          year: 2024,
        },
        {
          label: "Flipkart Interview Experience For SDE-2 (Off-Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/flipkart-interview-experience-for-sde-2-off-campus/",
          kind: "candidate-report",
        },
        {
          label: "Dream11 Interview Experience for SDE II (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/dream11-interview-experience-for-sde-ii-2/",
          kind: "candidate-report",
        },
        {
          label: "PhonePe Interview Questions (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/gfg-academy/phonepe-interview-questions/",
          kind: "prep-guide",
        },
        {
          label: "Member Of Technical Staff (MTS) Interview Questions and Answers (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/member-of-technical-staff-mts-interview-questions-and-answers/",
          kind: "prep-guide",
        },
        {
          label: "Microsoft Theoretical Interview Questions (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/microsofts-asked-interview-questions/",
          kind: "prep-guide",
        },
      ],
      links: [
        {
          href: "/system-design",
          label: "System design track",
        },
      ],
    },
    {
      id: "networks-proxy-and-vpn",
      theme: "traffic",
      q: "What is the difference between a forward proxy, a reverse proxy and a VPN?",
      a: "<p>A <b>forward proxy</b> sits in front of clients and makes requests on their behalf, so servers see the proxy's address. It is used for filtering, caching and anonymity. A <b>reverse proxy</b> sits in front of servers: clients talk to it as if it were the site, and it handles TLS termination, caching, compression and load balancing while hiding the backends.</p><p>A <b>VPN</b> builds an encrypted tunnel (IPsec, WireGuard, OpenVPN) between a device and a gateway and sends all selected traffic through it, usually at the network layer. It protects data on untrusted networks and gives access to a private network. A proxy usually works at the application level for particular protocols (HTTP, or SOCKS for general TCP) and need not encrypt anything.</p><p>A common follow-up is split tunnelling, which sends only some traffic through the VPN.</p>",
      level: "Core",
      companies: ["atlassian"],
      evidence: "several",
      sources: [
        {
          label: "Atlassian Interview Experience for Product Security Engineer (On-Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/atlassian-interview-experience-for-product-security-engineer-on-campus/",
          kind: "candidate-report",
        },
        {
          label: "PhonePe Interview Questions (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/gfg-academy/phonepe-interview-questions/",
          kind: "prep-guide",
        },
        {
          label: "Member Of Technical Staff (MTS) Interview Questions and Answers (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/member-of-technical-staff-mts-interview-questions-and-answers/",
          kind: "prep-guide",
        },
      ],
      links: [
        {
          href: "/networks",
          label: "Computer networks guide",
        },
      ],
    },
    {
      id: "networks-firewall-and-nat",
      theme: "traffic",
      q: "What do a firewall and NAT do, and how does NAT let many devices share one public IP?",
      a: "<p>A <b>firewall</b> allows or drops traffic by rule, ideally with a default deny. A stateless filter judges each packet on addresses, ports and protocol. A stateful one tracks connections, so replies to an allowed outbound request pass automatically. Application-layer firewalls and WAFs inspect HTTP content.</p><p><b>NAT</b> rewrites addresses at a router. The common form, port address translation, maps each private <code>IP:port</code> to the single public IP with a unique source port and records the mapping in a table, so replies return to the right device. This eases IPv4 shortage and hides internal addressing.</p><p>The cost is that unsolicited inbound connections have nowhere to go, so servers behind NAT need port forwarding. NAT is not a security control by itself. A follow-up is how peer-to-peer apps traverse NAT.</p>",
      level: "Core",
      companies: [],
      evidence: "guide",
      sources: [
        {
          label: "PhonePe Interview Questions (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/gfg-academy/phonepe-interview-questions/",
          kind: "prep-guide",
        },
        {
          label: "Juspay Interview Questions for Technical Profiles (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/juspay-interview-questions-for-technical-profiles/",
          kind: "prep-guide",
        },
      ],
      links: [
        {
          href: "/networks",
          label: "Computer networks guide",
        },
      ],
    },
    {
      id: "networks-devices-and-topologies",
      theme: "traffic",
      q: "Compare a hub, a switch and a router, and name the common network topologies.",
      a: "<p>A <b>hub</b> works at layer 1 and repeats every signal to all ports, so all ports share one collision domain; it is obsolete. A <b>switch</b> works at layer 2: it learns which MAC address is behind which port and forwards frames only there, giving each port its own collision domain. A <b>router</b> works at layer 3: it joins different networks, forwards by routing table and splits broadcast domains.</p><ul><li><b>Bus</b>: one shared cable, cheap but fragile.</li><li><b>Star</b>: every node to a central switch; the standard today, with the centre as single point of failure.</li><li><b>Ring</b>: each node linked to two neighbours.</li><li><b>Mesh</b>: many links, resilient; a full mesh of n nodes needs n(n-1)/2 links.</li></ul><p>A follow-up is the difference between collision and broadcast domains.</p>",
      level: "Core",
      companies: [],
      evidence: "guide",
      sources: [
        {
          label: "Juspay Interview Questions for Technical Profiles (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/juspay-interview-questions-for-technical-profiles/",
          kind: "prep-guide",
        },
        {
          label: "Member Of Technical Staff (MTS) Interview Questions and Answers (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/member-of-technical-staff-mts-interview-questions-and-answers/",
          kind: "prep-guide",
        },
      ],
      links: [
        {
          href: "/networks",
          label: "Computer networks guide",
        },
      ],
    },
    {
      id: "networks-http-vs-https",
      theme: "http",
      q: "What is the difference between HTTP and HTTPS, and what does the S add?",
      a: "<p><b>HTTP</b> sends requests and responses as plain text, by default on port 80. <b>HTTPS</b> is the same protocol carried inside a TLS session, by default on port 443. TLS adds three guarantees:</p><ul><li><b>Confidentiality</b>: traffic is encrypted, so people on the path cannot read it.</li><li><b>Integrity</b>: tampering is detected.</li><li><b>Authentication</b>: the server proves its identity with a certificate signed by a trusted CA.</li></ul><p>The cost is an extra handshake, mostly hidden by TLS 1.3, session resumption and keep-alive connections. HTTPS does not hide the destination IP or, without extras such as ECH, the host name, and it does not mean the site is trustworthy. HSTS tells browsers to always use HTTPS. The follow-up is usually how the handshake works.</p>",
      level: "Core",
      companies: ["phonepe"],
      evidence: "one",
      sources: [
        {
          label: "Phonepe Interview Experience (On-campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/phonepe-interview-experience-on-campus-1/",
          kind: "candidate-report",
        },
      ],
      links: [
        {
          href: "/networks",
          label: "Computer networks guide",
        },
      ],
    },
    {
      id: "networks-http-methods-status-codes",
      theme: "http",
      q: "Describe the format of an HTTP request and response, the main methods and the common status codes.",
      a: "<p>In HTTP/1.1 a request is a request line (method, path, version), headers, a blank line and an optional body. A response is a status line, headers, a blank line and a body.</p><ul><li><code>GET</code> reads and is safe and idempotent; <code>POST</code> creates or triggers an action and is not idempotent; <code>PUT</code> replaces a resource and is idempotent; <code>PATCH</code> applies a partial change; <code>DELETE</code> removes and is idempotent.</li><li>2xx success: 200, 201 Created, 204 No Content.</li><li>3xx redirect: 301, 302, 304 Not Modified.</li><li>4xx client error: 400, 401 (not authenticated), 403 (not allowed), 404, 429.</li><li>5xx server error: 500, 502, 503, 504.</li></ul><p>Expect the follow-up PUT versus POST: PUT targets a known URL and is safe to retry, POST is not.</p>",
      level: "Core",
      companies: ["phonepe", "ola", "paytm"],
      evidence: "several",
      sources: [
        {
          label: "Phonepe Interview Experience (On-campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/phonepe-interview-experience-on-campus-1/",
          kind: "candidate-report",
        },
        {
          label: "PhonePe interview experience (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/phonepe-interview-experience-1/",
          kind: "candidate-report",
        },
        {
          label: "Ola Interview Experience (1 Year Experienced) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/ola-interview-experience-1-year-experienced/",
          kind: "candidate-report",
        },
        {
          label: "Paytm Interview Experience For Java Backend (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/paytm-interview-experience-for-java-backend/",
          kind: "candidate-report",
        },
        {
          label: "Juspay Interview Questions for Technical Profiles (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/juspay-interview-questions-for-technical-profiles/",
          kind: "prep-guide",
        },
      ],
      links: [
        {
          href: "/networks",
          label: "Computer networks guide",
        },
      ],
    },
    {
      id: "networks-rest-statelessness",
      theme: "http",
      q: "Are REST APIs stateful or stateless, and what does that mean in practice?",
      a: '<p>REST is <b>stateless</b>: each request must carry everything the server needs to handle it, such as the auth token, identifiers and parameters. The server keeps no client session context between requests. Resource state still lives in the database; "stateless" only refers to the conversation.</p><p>Benefits: any server can answer any request, so you scale horizontally behind a load balancer and recover from failures without losing session data; stateless requests are also easier to cache and retry. The costs are repeated metadata on every call and the need for tokens instead of server-held sessions.</p><p>REST models <em>resources</em> as nouns addressed by URL and manipulated through HTTP methods. A follow-up is how to log users in without server sessions, which leads to tokens such as JWT.</p>',
      level: "Core",
      companies: ["paytm"],
      evidence: "one",
      sources: [
        {
          label: "Paytm Interview Experience For Java Backend (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/paytm-interview-experience-for-java-backend/",
          kind: "candidate-report",
        },
      ],
      links: [
        {
          href: "/networks",
          label: "Computer networks guide",
        },
      ],
    },
    {
      id: "networks-graphql-vs-rest",
      theme: "http",
      q: "How does GraphQL compare with REST, particularly over-fetching and under-fetching?",
      a: "<p>REST exposes a fixed response per endpoint. That causes <b>over-fetching</b> (the payload has fields the screen never uses) and <b>under-fetching</b> (one screen needs several calls, for example a user, then their orders, then each order's items). <b>GraphQL</b> exposes a typed schema through one endpoint, and the client sends a query naming exactly the fields and nested relations it wants, getting them in one round trip.</p><p>Trade-offs: HTTP caching by URL is harder because queries usually go as <code>POST</code> to one path; a naive resolver causes N+1 database queries (batching tools such as DataLoader fix it); and deep or expensive queries need depth and cost limits. Errors often come back with status 200 plus an errors array.</p><p>It pays off for varied clients such as mobile and web.</p>",
      level: "Deep",
      companies: ["phonepe"],
      evidence: "one",
      sources: [
        {
          label: "PhonePe interview experience (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/phonepe-interview-experience-1/",
          kind: "candidate-report",
        },
      ],
      links: [
        {
          href: "/networks",
          label: "Computer networks guide",
        },
      ],
    },
    {
      id: "networks-websockets-vs-request-response",
      theme: "http",
      q: "How do WebSockets differ from plain HTTP request-response, and what are the alternatives for real-time updates?",
      a: "<p>HTTP is request-response: the client asks, the server answers, and the server cannot speak first. A <b>WebSocket</b> starts as an HTTP request with <code>Upgrade: websocket</code>; the server replies <code>101 Switching Protocols</code>, and the TCP connection stays open as a full-duplex channel with small frames in both directions. That suits chat, live scores and collaborative editing.</p><p>Alternatives: short polling (simple, wasteful), long polling (the server holds the request until data exists) and <b>server-sent events</b> (one-way push over HTTP).</p><p>The cost is stateful, long-lived connections. They tie up memory and file descriptors, need heartbeats and reconnection logic, and require a load balancer that handles upgrades. Fanning messages across servers needs a pub/sub layer. That scaling story is the usual follow-up.</p>",
      level: "Deep",
      companies: ["atlassian"],
      evidence: "one",
      sources: [
        {
          label: "Atlassian Interview Experience | On-Campus FTE (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/atlassian-interview-experience-on-campus-fte/",
          kind: "candidate-report",
        },
      ],
      links: [
        {
          href: "/networks",
          label: "Computer networks guide",
        },
        {
          href: "/system-design",
          label: "System design track",
        },
      ],
    },
    {
      id: "networks-encryption-vs-hashing",
      theme: "security",
      q: "How do encryption and hashing differ, and how do symmetric and asymmetric encryption compare?",
      a: "<p><b>Encryption</b> is reversible: with the right key, ciphertext turns back into the plaintext, giving confidentiality. A <b>hash</b> is a one-way function that maps input to a fixed-size digest, used for integrity checks and password storage. Passwords need a slow, salted hash such as bcrypt, scrypt or Argon2, not plain SHA-256.</p><ul><li><b>Symmetric</b> (AES, ChaCha20): one shared key, fast, good for bulk data, but the key must be shared safely.</li><li><b>Asymmetric</b> (RSA, elliptic curves): a public and private key pair. The public key encrypts or verifies, the private key decrypts or signs. It is slower, so it mostly exchanges keys and signs.</li></ul><p>Real protocols are hybrid. The follow-up is how TLS combines them.</p>",
      level: "Core",
      companies: ["phonepe", "atlassian"],
      evidence: "several",
      sources: [
        {
          label: "Phonepe Interview Experience (On-campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/phonepe-interview-experience-on-campus-1/",
          kind: "candidate-report",
        },
        {
          label: "Atlassian Interview Experience for Product Security Engineer (On-Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/atlassian-interview-experience-for-product-security-engineer-on-campus/",
          kind: "candidate-report",
        },
      ],
      links: [
        {
          href: "/networks",
          label: "Computer networks guide",
        },
      ],
    },
    {
      id: "networks-tls-handshake",
      theme: "security",
      q: "Walk through the TLS handshake and explain how the client trusts the server.",
      a: "<p>After the TCP handshake, in TLS 1.3 the client sends a <b>ClientHello</b> with supported cipher suites, the server name and a key share. The server answers with its own key share, its <b>certificate chain</b> and a signature over the handshake. Both sides now compute the same session keys with an ephemeral Diffie-Hellman exchange, then switch to symmetric encryption such as AES-GCM. That takes one round trip; TLS 1.2 needs two.</p><p>The client trusts the server by validating the chain up to a CA in its trust store, checking the host name, the validity dates and the signature, which proves the server holds the private key.</p><p>Ephemeral keys give forward secrecy: stealing the server key later cannot decrypt old traffic. A follow-up is session resumption and 0-RTT replay risk.</p>",
      level: "Deep",
      companies: ["atlassian"],
      evidence: "one",
      sources: [
        {
          label: "Atlassian Interview Experience for Product Security Engineer (On-Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/atlassian-interview-experience-for-product-security-engineer-on-campus/",
          kind: "candidate-report",
        },
      ],
      links: [
        {
          href: "/networks",
          label: "Computer networks guide",
        },
      ],
    },
    {
      id: "networks-sessions-cookies-jwt",
      theme: "security",
      q: "Compare cookie-based sessions with JWT authentication, including their security trade-offs.",
      a: "<p>With <b>sessions</b>, the server stores the login state and gives the browser an opaque session ID in a cookie. Each request is looked up in a store such as Redis. Revoking a session is easy, but all servers need that shared store. A <b>JWT</b> is a signed token (<code>header.payload.signature</code>) holding claims such as the user id and expiry. Servers verify the signature without a lookup, which fits stateless APIs.</p><p>JWT trade-offs: the payload is only base64url-encoded, not encrypted, so keep secrets out; revocation is hard, so use short expiry plus refresh tokens; and the verifier must pin the algorithm.</p><p>Store tokens in <code>HttpOnly</code>, <code>Secure</code>, <code>SameSite</code> cookies to reduce XSS token theft and CSRF. A follow-up is how to log out a JWT user.</p>",
      level: "Deep",
      companies: ["atlassian"],
      evidence: "one",
      sources: [
        {
          label: "Atlassian Interview Experience for Product Security Engineer (On-Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/atlassian-interview-experience-for-product-security-engineer-on-campus/",
          kind: "candidate-report",
        },
      ],
      links: [
        {
          href: "/networks",
          label: "Computer networks guide",
        },
      ],
    },
  ],
};
