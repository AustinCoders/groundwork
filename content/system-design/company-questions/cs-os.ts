import type { CsSet } from "./cs-types";

export const set: CsSet = {
  id: "os",
  title: "Operating systems",
  intro:
    "Operating systems questions reported in interviews at product and fintech companies, grouped by theme. Try each aloud first, then open the model answer and its usual follow-up.",
  themes: [
    {
      id: "processes",
      name: "Processes and threads",
    },
    {
      id: "scheduling",
      name: "CPU scheduling",
    },
    {
      id: "memory",
      name: "Memory management",
    },
    {
      id: "sync",
      name: "Synchronisation and deadlock",
    },
    {
      id: "kernel",
      name: "Kernel, IPC and boot",
    },
  ],
  chapters: [
    {
      href: "/os",
      label: "Operating systems notes",
    },
    {
      href: "/networks",
      label: "Computer networks notes",
    },
    {
      href: "/mock",
      label: "Mock interviews",
    },
  ],
  questions: [
    {
      id: "os-process-vs-thread",
      theme: "processes",
      q: "How does a process differ from a thread in memory, switching cost and communication?",
      a: "<p>A process is a running program with its own address space, file descriptor table and resources. A thread is a unit of execution inside a process: threads of one process share its code, heap and open files, but each has its own stack, registers and program counter.</p><ul><li><b>Memory</b>: processes are isolated by the MMU; threads can read and write each other's data, so they need locks.</li><li><b>Cost</b>: creating and switching threads is cheaper because there is no address space switch, so page tables and TLB entries stay useful.</li><li><b>Communication</b>: threads use shared variables; processes need IPC such as pipes, sockets or shared memory.</li><li><b>Failure</b>: a wild pointer in one thread can take down the whole process, while a crashed process leaves others alone.</li></ul><p>Example: a browser runs tabs as separate processes for isolation, and each tab uses threads for its work. Follow-up: what is saved on a thread switch, and how user-level threads differ from kernel threads.</p>",
      level: "Core",
      companies: ["amazon", "razorpay", "atlassian", "juspay", "zomato"],
      evidence: "several",
      sources: [
        {
          label: "Amazon Interview Experience For SDE Intern (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-for-sde-intern-8/",
          kind: "candidate-report",
        },
        {
          label: "Razorpay PSE Intern Interview Experience (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/razorpay-pse-intern-interview-experience-on-campus-2025/",
          kind: "candidate-report",
          year: 2025,
        },
        {
          label: "Atlassian Interview Experience (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/atlassian-interview-experience/",
          kind: "candidate-report",
        },
        {
          label: "Amazon Interview Experience for SDE-1 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-for-sde-1-23/",
          kind: "candidate-report",
        },
        {
          label: "Juspay Interview Experience for Internship | On-Campus 2020 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/juspay-interview-experience-for-internship-on-campus-2020/",
          kind: "candidate-report",
          year: 2020,
        },
        {
          label: "Atlassian Interview Experience | On-Campus August 2020 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/atlassian-interview-experience-on-campus-august-2020/",
          kind: "candidate-report",
          year: 2020,
        },
        {
          label: "Zomato Interview Experience | SDE (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/zomato-interview-experience-sde/",
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
          href: "/os",
          label: "Operating systems notes",
        },
      ],
    },
    {
      id: "os-concurrency-vs-parallelism",
      theme: "processes",
      q: "What is the difference between concurrency and parallelism, and between multithreading and multiprocessing?",
      a: "<p><b>Concurrency</b> means structuring a program as several tasks that are in progress at overlapping times; on one core it is done by interleaving. <b>Parallelism</b> means tasks literally executing at the same instant on several cores. You can have either without the other.</p><ul><li><b>Multithreading</b>: threads share one address space, so sharing data is cheap, but it needs synchronisation and one bug can corrupt everything. In standard CPython builds the global interpreter lock stops threads from running Python bytecode in parallel.</li><li><b>Multiprocessing</b>: separate address spaces give isolation, fault containment and true parallelism even under such a lock, but processes are heavier and data crosses through IPC.</li></ul><p>Rule of thumb: I/O-bound work benefits from concurrency (threads or async I/O), CPU-bound work needs parallelism across cores. Follow-up: Amdahl's law, which caps the speedup by the fraction of work that stays serial.</p>",
      level: "Core",
      companies: ["zomato", "razorpay", "swiggy"],
      evidence: "several",
      sources: [
        {
          label: "Zomato Interview Experience | SDE (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/zomato-interview-experience-sde/",
          kind: "candidate-report",
        },
        {
          label: "Razorpay Interview Experience for SDE-1 (On-Campus 2020) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/razorpay-interview-experience-for-sde-1-on-campus-2020/",
          kind: "candidate-report",
          year: 2020,
        },
        {
          label: "Swiggy Interview experience for SDE-3 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/swiggy-interview-experience-for-sde-3/",
          kind: "candidate-report",
        },
      ],
    },
    {
      id: "os-fork-output",
      theme: "processes",
      q: "Given code with several fork calls, how do you work out how many processes exist and what it prints?",
      a: '<p><code>fork()</code> creates a child that is a copy of the caller. It returns 0 in the child, the child\'s pid in the parent and -1 on failure, and both processes continue from the next statement. Modern systems copy memory lazily with copy-on-write.</p><p>Counting rule: every existing process executes each <code>fork()</code>, so n unconditional calls in sequence give 2^n processes in total, including the original, and 2^n - 1 new ones. Example: <code>fork(); fork(); printf("x");</code> prints x four times. A loop that forks three times also ends with 8 processes.</p><p>Conditions change the count. In <code>if (fork() == 0) fork();</code> only the child forks again, giving three processes. Output order between processes is not deterministic, and a buffered stdout copied into the child can make text appear twice when no newline flushed it first.</p><p>Follow-up: how wait, exec and zombie processes fit in.</p>',
      level: "Core",
      companies: ["zomato"],
      evidence: "one",
      sources: [
        {
          label: "Zomato Interview Experience | SDE (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/zomato-interview-experience-sde/",
          kind: "candidate-report",
        },
      ],
    },
    {
      id: "os-cpu-scheduling",
      theme: "scheduling",
      q: "Compare FCFS, SJF, round robin and priority scheduling, and say which suits which workload.",
      a: "<p>A CPU scheduler picks which ready process runs next. The goals pull against each other: throughput, turnaround time, waiting time, response time and fairness.</p><ul><li><b>FCFS</b>: a plain queue, non-preemptive. One long job delays everything behind it (the convoy effect).</li><li><b>SJF</b>: running the shortest next burst first minimises average waiting time when burst lengths are known, but they must be predicted and long jobs can starve. The preemptive form is shortest remaining time first.</li><li><b>Round robin</b>: each process gets a time quantum, then goes to the back of the queue, which gives good response time. A tiny quantum wastes time on context switches; a huge one degrades into FCFS.</li><li><b>Priority</b>: the highest priority runs first, and low priorities can starve unless aging raises them over time.</li></ul><p>Interactive systems favour round robin or multilevel feedback queues; batch systems favour SJF-like policies. Follow-up: implement round robin with a queue, or explain how Linux's CFS picks the task with the smallest virtual runtime from a red-black tree (kernel 6.6 and later moved to its successor, EEVDF).</p>",
      level: "Core",
      companies: ["amazon", "myntra", "ola", "razorpay", "zomato", "microsoft", "atlassian"],
      evidence: "several",
      sources: [
        {
          label: "Amazon Interview Experience | On-Campus (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-on-campus-4/",
          kind: "candidate-report",
        },
        {
          label: "Amazon Interview Experience | Support Engineer | 6 month Internship (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-support-engineer-6-month-internship/",
          kind: "candidate-report",
        },
        {
          label: "Amazon Interview Experience for SDE-1 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-for-sde-1-23/",
          kind: "candidate-report",
        },
        {
          label: "Myntra Interview Experience | Set 6 (On-Campus For Software Engineer) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/myntra-interview-experience-set-6-on-campus-for-software-engineer/",
          kind: "candidate-report",
        },
        {
          label: "OLA Cabs Interview Experience | Set 2 (For Android - 1.5 Years) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/ola-cabs-interview-experience-set-2-android-1-5-years/",
          kind: "candidate-report",
        },
        {
          label: "Razorpay PSE Intern Interview Experience (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/razorpay-pse-intern-interview-experience-on-campus-2025/",
          kind: "candidate-report",
          year: 2025,
        },
        {
          label: "Zomato Interview Experience | SDE (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/zomato-interview-experience-sde/",
          kind: "candidate-report",
        },
        {
          label: "Microsoft Interview | Set 5 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/microsoft-interview-set-5/",
          kind: "candidate-report",
        },
        {
          label: "Atlassian Interview Experience (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/atlassian-interview-experience/",
          kind: "candidate-report",
        },
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
        {
          label: "Member Of Technical Staff (MTS) Interview Questions and Answers (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/member-of-technical-staff-mts-interview-questions-and-answers/",
          kind: "prep-guide",
        },
      ],
      links: [
        {
          href: "/os",
          label: "Operating systems notes",
        },
      ],
    },
    {
      id: "os-context-switch-dispatcher",
      theme: "scheduling",
      q: "What happens in a context switch, and how does the dispatcher differ from the scheduler?",
      a: "<p>A <b>context switch</b> saves the state of the running process (registers, program counter, stack pointer and memory-management information) into its process control block and loads the saved state of the next one. It is pure overhead: no useful work runs during it, and the new process starts with colder caches and TLB entries. A process switch costs more than a switch between threads of one process because the address space changes.</p><p>The <b>scheduler</b> makes the policy decision: which ready process runs next. The <b>dispatcher</b> carries it out. It performs the context switch, switches the CPU to user mode and jumps to the right instruction in the new process. The time this takes is the <b>dispatch latency</b>.</p><p>Switches happen when a time slice expires, when a process blocks on I/O, on an interrupt, or when a higher priority process becomes ready. Follow-up: why a very small quantum in round robin hurts throughput.</p>",
      level: "Core",
      companies: [],
      evidence: "guide",
      sources: [
        {
          label: "PhonePe Interview Questions (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/gfg-academy/phonepe-interview-questions/",
          kind: "prep-guide",
        },
      ],
    },
    {
      id: "os-virtual-memory",
      theme: "memory",
      q: "What is virtual memory, and how does paging map a virtual address to a physical one?",
      a: "<p>Virtual memory gives each process its own large address space that looks contiguous, and the OS and MMU map it onto physical RAM with disk as backing store. It matters for isolation, for running programs larger than RAM, and for allocating memory lazily.</p><p>With paging, virtual memory is split into fixed-size pages (commonly 4 KB) and RAM into frames of the same size. A virtual address is a page number plus an offset. The page table maps the page number to a frame number and holds valid, dirty and protection bits. The MMU translates every access and caches recent translations in the TLB. If the page is not present, the access raises a page fault and the OS loads it.</p><p>Example: with 4 KB pages the low 12 bits of the address are the offset and the remaining bits select the page. Large address spaces use multi-level page tables so no huge flat table is needed. Follow-up: how a page fault is handled.</p>",
      level: "Core",
      companies: ["amazon", "meesho", "microsoft", "atlassian"],
      evidence: "several",
      sources: [
        {
          label: "Amazon Interview Experience | SDE-I (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-sde-i/",
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
          label: "Microsoft Interview Experience for SWE Intern (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/microsoft-interview-experience-for-swe-intern-1/",
          kind: "candidate-report",
        },
        {
          label: "Atlassian Interview Experience (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/atlassian-interview-experience/",
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
          href: "/os",
          label: "Operating systems notes",
        },
      ],
    },
    {
      id: "os-page-faults-replacement-thrashing",
      theme: "memory",
      q: "How are page faults handled, which page replacement policies exist, and what is thrashing?",
      a: "<p>A page fault occurs when a process touches a page that is not mapped to a frame. The CPU traps, the OS checks the access is legal, finds a free frame or evicts a victim, reads the page from disk, updates the page table and restarts the instruction. A disk read takes milliseconds against nanoseconds for RAM, so the fault rate dominates performance.</p><ul><li><b>FIFO</b>: evict the oldest page. Simple, but it can show Belady's anomaly, where more frames cause more faults.</li><li><b>Optimal</b>: evict the page whose next use is furthest away. It is a benchmark and cannot be implemented.</li><li><b>LRU</b>: evict the least recently used page. It is close to optimal but costly to track exactly, so systems approximate it with the clock algorithm and a reference bit.</li></ul><p><b>Thrashing</b> is when processes lack enough frames for their working sets, so the system spends most of its time faulting and CPU utilisation collapses. Fixes: working-set or fault-frequency control, running fewer processes, more RAM. Follow-up: implement an LRU cache with a hash map and a doubly linked list.</p>",
      level: "Core",
      companies: ["uber", "amazon", "swiggy"],
      evidence: "several",
      sources: [
        {
          label: "Uber Interview Experience | Software Engineer 1 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/uber-interview-experience-software-engineer-1/",
          kind: "candidate-report",
        },
        {
          label: "Amazon Interview Experience | SDE-I (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-sde-i/",
          kind: "candidate-report",
        },
        {
          label: "Amazon Interview Experience for SDE-1 (Amazon Wow drive) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-for-sde-1-amazon-wow-drive/",
          kind: "candidate-report",
        },
        {
          label: "Swiggy Interview Experience | Set 2 (On-Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/swiggy-interview-experience-set-2-on-campus/",
          kind: "candidate-report",
        },
        {
          label: "PhonePe Interview Questions (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/gfg-academy/phonepe-interview-questions/",
          kind: "prep-guide",
        },
      ],
      links: [
        {
          href: "/os",
          label: "Operating systems notes",
        },
      ],
    },
    {
      id: "os-stack-vs-heap",
      theme: "memory",
      q: "What is the difference between stack and heap memory, and what happens on a stack overflow?",
      a: "<p>The <b>stack</b> holds a thread's call frames: return addresses, arguments and local variables. Allocation is a pointer move and memory is released when the function returns, so it is fast and cache friendly, but each thread's stack is small and fixed in size, often 1 to 8 MB. The <b>heap</b> is a shared region for objects whose size or lifetime is not known at compile time. An allocator such as <code>malloc</code> or a garbage collector manages it, so allocation is slower, fragmentation can occur and objects live until freed.</p><p>Example: a local <code>int x</code> lives on the stack; the buffer returned by <code>malloc</code> lives on the heap and only its pointer is on the stack.</p><p>A stack overflow happens when the stack grows past its limit, usually through unbounded or very deep recursion. In C and C++ on Linux it hits a guard page and the process receives SIGSEGV; Java throws StackOverflowError instead. Fix it by bounding depth or by turning recursion into iteration with an explicit stack on the heap. Follow-up: what a memory leak is.</p>",
      level: "Core",
      companies: ["phonepe", "myntra", "atlassian"],
      evidence: "several",
      sources: [
        {
          label: "PhonePe Interview Experience for Software Engineer (On-Campus) Aug 2022 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/phonepe-interview-experience-for-software-engineer-on-campus-aug-2022/",
          kind: "candidate-report",
          year: 2022,
        },
        {
          label: "Myntra Interview Experience | Set 3 (On-Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/myntra-interview-experience-set-3-campus/",
          kind: "candidate-report",
        },
        {
          label: "Atlassian Interview Experience | On-Campus FTE (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/atlassian-interview-experience-on-campus-fte/",
          kind: "candidate-report",
        },
      ],
    },
    {
      id: "os-cache-and-tlb",
      theme: "memory",
      q: "What are the CPU cache and the TLB, and what is each used for?",
      a: "<p>A <b>CPU cache</b> is small, fast memory (L1, L2, L3) between the CPU and RAM that keeps recently used data. It relies on temporal locality (data is reused soon) and spatial locality (neighbouring addresses are used soon). Data moves in cache lines, typically 64 bytes. A hit costs a few cycles, while a miss goes to RAM and typically costs on the order of a hundred cycles.</p><p>The <b>TLB</b> (translation lookaside buffer) is a small cache in the MMU that holds recent virtual-to-physical page translations. Without it every memory access would first need extra reads to walk the page table. On a hit the translation is almost free; on a miss the hardware or the OS walks the page table and fills an entry. On a process context switch the TLB is flushed or its entries are tagged with address-space IDs.</p><p>Effective access time = hit rate x hit time + miss rate x miss time. Follow-up: designing an LRU cache in software, which uses the same eviction idea.</p>",
      level: "Core",
      companies: ["swiggy"],
      evidence: "one",
      sources: [
        {
          label: "Swiggy Interview Experience | Set 2 (On-Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/swiggy-interview-experience-set-2-on-campus/",
          kind: "candidate-report",
        },
      ],
    },
    {
      id: "os-fragmentation-allocation",
      theme: "memory",
      q: "What are internal and external fragmentation, and how do allocation strategies and paging deal with them?",
      a: "<p>Fragmentation is memory that is free but cannot be used.</p><ul><li><b>Internal</b>: an allocated block is larger than the request and the rest is wasted inside it. Fixed-size partitions and the last page of a paged process cause it.</li><li><b>External</b>: enough memory is free in total but scattered in holes that are each too small. Contiguous allocation, segmentation and general heap allocators cause it.</li></ul><p>Contiguous allocation chooses a hole by strategy: <b>first fit</b> takes the first hole that is big enough and is fast, <b>best fit</b> takes the smallest hole that fits and leaves tiny unusable slivers, and <b>worst fit</b> takes the largest hole and usually performs poorly.</p><p>External fragmentation is cured by compaction, which moves blocks and is costly, or by paging, where fixed-size frames mean any free frame fits, at the price of a little internal waste. Allocators such as malloc coalesce adjacent free blocks and use size classes; the buddy system splits blocks into powers of two. Follow-up: paging versus segmentation.</p>",
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
    },
    {
      id: "os-deadlock",
      theme: "sync",
      q: "What is a deadlock, which four conditions cause it, and how do you prevent, avoid or detect it?",
      a: "<p>A deadlock is a state in which every process in a set holds a resource and waits for one held by another process in the set, so none can ever proceed. The stuck work never recovers on its own, and the rest of the system slowly fills with blocked threads.</p><p>Four conditions must hold together: <b>mutual exclusion</b>, <b>hold and wait</b>, <b>no preemption</b> and <b>circular wait</b>. Removing any one prevents deadlock.</p><ul><li><b>Prevention</b>: negate a condition. The practical choice is acquiring locks in one global order, which removes circular wait.</li><li><b>Avoidance</b>: grant a request only if the resulting state is safe (Banker's algorithm).</li><li><b>Detection and recovery</b>: build a wait-for graph with an edge from each process to the one holding what it wants. A cycle means deadlock when each resource has a single instance. Recover by killing a victim or rolling back.</li></ul><p>Example: thread A holds lock 1 and wants lock 2 while thread B holds lock 2 and wants lock 1. Follow-up: write cycle detection on a directed graph with DFS.</p>",
      level: "Core",
      companies: ["amazon", "atlassian", "swiggy", "phonepe", "zomato"],
      evidence: "several",
      sources: [
        {
          label: "Amazon Interview Experience | SDE-I (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-sde-i/",
          kind: "candidate-report",
        },
        {
          label: "Amazon Interview Experience | On-Campus (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-on-campus-4/",
          kind: "candidate-report",
        },
        {
          label: "Amazon Interview Experience | SDET (Off-Campus 2020) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-sdet-off-campus-2020/",
          kind: "candidate-report",
          year: 2020,
        },
        {
          label: "Amazon Interview Experience for SDE-1 (Amazon Wow drive) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-for-sde-1-amazon-wow-drive/",
          kind: "candidate-report",
        },
        {
          label: "Amazon Interview Experience | Set 270 (Off-campus SDE-1) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-set-270-off-campus-sde-1/",
          kind: "candidate-report",
        },
        {
          label: "Amazon Interview Experience for SDE-1 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-for-sde-1-23/",
          kind: "candidate-report",
        },
        {
          label: "Atlassian Interview Experience | On-Campus August 2020 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/atlassian-interview-experience-on-campus-august-2020/",
          kind: "candidate-report",
          year: 2020,
        },
        {
          label: "Swiggy Interview Experience | Set 2 (On-Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/swiggy-interview-experience-set-2-on-campus/",
          kind: "candidate-report",
        },
        {
          label: "PhonePe Interview Experience for Software Engineer (On-Campus) Aug 2022 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/phonepe-interview-experience-for-software-engineer-on-campus-aug-2022/",
          kind: "candidate-report",
          year: 2022,
        },
        {
          label: "Zomato (District) Software Developer 1 interview, Apr 2025 (CodingKaro, mirrors LeetCode Discuss)",
          url: "https://www.codingkaro.in/jobs-internships/leetcode-interview-experience/Zomato",
          kind: "candidate-report",
          year: 2025,
        },
        {
          label: "Juspay Interview Questions for Technical Profiles (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/juspay-interview-questions-for-technical-profiles/",
          kind: "prep-guide",
        },
      ],
      links: [
        {
          href: "/os",
          label: "Operating systems notes",
        },
      ],
    },
    {
      id: "os-semaphore-vs-mutex",
      theme: "sync",
      q: "What is the difference between a semaphore and a mutex, and how do they provide mutual exclusion?",
      a: "<p>A <b>mutex</b> is a lock with ownership: only the thread that locked it should unlock it, and it guards a critical section so one thread at a time runs it. A <b>semaphore</b> is an integer counter with two atomic operations: wait (P) decrements and blocks if the value would go below zero, and signal (V) increments and wakes a waiter. Atomicity comes from hardware support such as test-and-set or compare-and-swap, or from disabling interrupts inside the kernel.</p><ul><li>A binary semaphore looks like a mutex but has no owner, so any thread can signal it. That suits signalling between threads, not protecting data.</li><li>A counting semaphore limits access to N identical resources, such as a pool of 10 connections.</li></ul><p>Example: start a semaphore at 3 so at most three workers use a resource at once. Follow-up: priority inversion, which mutexes can address with priority inheritance, and why forgetting to release causes a deadlock.</p>",
      level: "Core",
      companies: ["swiggy", "meesho", "microsoft", "amazon", "uber"],
      evidence: "several",
      sources: [
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
          label: "Microsoft Interview Experience | Set 176 (On-Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/microsoft-interview-experience-set-176-on-campus/",
          kind: "candidate-report",
        },
        {
          label: "Microsoft Interview Experience | Set 59 (On-Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/microsoft-interview-experience-set-59-on-campus/",
          kind: "candidate-report",
        },
        {
          label: "Amazon Interview Experience | Set 270 (Off-campus SDE-1) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-set-270-off-campus-sde-1/",
          kind: "candidate-report",
        },
        {
          label: "Amazon Interview Experience for SDE-1 (Amazon Wow drive) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-for-sde-1-amazon-wow-drive/",
          kind: "candidate-report",
        },
        {
          label: "Uber Interview Experience for SWE Intern (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/uber-interview-experience-for-swe-intern/",
          kind: "candidate-report",
        },
      ],
    },
    {
      id: "os-race-conditions-thread-safety",
      theme: "sync",
      q: "What is a race condition, what is a critical section, and how do you make code thread safe?",
      a: "<p>A race condition is a bug where the result depends on the unpredictable interleaving of threads that touch shared state. The code touching that state is the critical section and must run with mutual exclusion. The classic case is <code>counter++</code>, which is really read, add, write: two threads can both read 5 and both write 6, losing an update.</p><p>Ways to make code thread safe:</p><ul><li>Lock the critical section with a mutex, keep it short, and take several locks in one fixed order.</li><li>Use atomic operations or compare-and-swap for simple counters and flags.</li><li>Avoid sharing: thread-local data, immutable objects or message passing.</li></ul><p>Typical coding follow-ups are a thread-safe singleton (initialise under a lock or with a once primitive), a hash map guarded by a mutex, and printing 1 to 100 from three threads in turn with condition variables. Follow-up: what a read-write lock buys you and why one coarse lock limits throughput.</p>",
      level: "Core",
      companies: ["microsoft", "zomato", "juspay", "groww"],
      evidence: "several",
      sources: [
        {
          label: "Microsoft Interview Experience | Set 176 (On-Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/microsoft-interview-experience-set-176-on-campus/",
          kind: "candidate-report",
        },
        {
          label: "Microsoft Interview Experience for SDE 2 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/microsoft-interview-experience-for-sde-2-5/",
          kind: "candidate-report",
        },
        {
          label: "Zomato Interview Experience | SDE (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/zomato-interview-experience-sde/",
          kind: "candidate-report",
        },
        {
          label: "Juspay Interview Experience | Product Engineer | (On-campus 2024) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/juspay-interview-experience-product-engineer-on-campus-2024/",
          kind: "candidate-report",
          year: 2024,
        },
        {
          label: "Juspay On-Campus Interview Experience for Batch 2025 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/juspay-on-campus-interview-experience-for-batch-2025/",
          kind: "candidate-report",
          year: 2025,
        },
        {
          label: "Groww SDE Intern Interview Experience (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/groww-sde-intern-interview-experience-1/",
          kind: "candidate-report",
        },
      ],
    },
    {
      id: "os-bankers-algorithm-starvation",
      theme: "sync",
      q: "How does the Banker's algorithm work, and what are starvation and aging?",
      a: "<p>The Banker's algorithm is deadlock avoidance. Each process declares its maximum need in advance. The OS keeps Available, Max, Allocation and Need = Max - Allocation. On a request it checks the request is within Need and Available, pretends to grant it, and runs the <b>safety check</b>: find a process whose Need fits in Work (initially Available), assume it finishes and returns its allocation to Work, and repeat. If every process can finish in some order, the state is safe and the request is granted; otherwise the process waits.</p><p>A safe state cannot deadlock; an unsafe state might. The limits are that maximum claims must be known up front, the set of processes must be fixed, and the check costs O(m n^2) for m resource types and n processes, so general-purpose systems rarely use it.</p><p><b>Starvation</b> is a process waiting indefinitely while the system makes progress, for example low priority jobs behind a steady stream of high priority ones. <b>Aging</b> fixes it by raising a waiting process's priority over time.</p>",
      level: "Deep",
      companies: ["amazon"],
      evidence: "several",
      sources: [
        {
          label: "Amazon Interview Experience for SDE-1 (Amazon Wow drive) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-for-sde-1-amazon-wow-drive/",
          kind: "candidate-report",
        },
        {
          label: "PhonePe Interview Questions (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/gfg-academy/phonepe-interview-questions/",
          kind: "prep-guide",
        },
      ],
    },
    {
      id: "os-producer-consumer",
      theme: "sync",
      q: "How do you solve the producer-consumer problem, and how does it extend to many producers and consumers?",
      a: "<p>Producers add items to a bounded buffer and consumers remove them. A producer must wait when the buffer is full, a consumer must wait when it is empty, and buffer access must be mutually exclusive.</p><p>The classic solution uses three semaphores: <code>empty</code> starts at the buffer size N, <code>full</code> at 0 and <code>mutex</code> at 1. Producer: wait(empty), wait(mutex), insert, signal(mutex), signal(full). Consumer: wait(full), wait(mutex), remove, signal(mutex), signal(empty).</p><p>The order matters. If a producer took the mutex before waiting on <code>empty</code> while the buffer is full, it would sleep holding the lock, no consumer could enter, and the system would deadlock.</p><p>The same code works for many producers and consumers, because the mutex serialises buffer access and the counting semaphores track free and filled slots. In practice use a blocking queue, or a mutex with two condition variables. Follow-up: shutdown handling, and the readers-writers and dining philosophers problems.</p>",
      level: "Deep",
      companies: ["amazon"],
      evidence: "one",
      sources: [
        {
          label: "Amazon Interview Experience | Set 270 (Off-campus SDE-1) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-set-270-off-campus-sde-1/",
          kind: "candidate-report",
        },
      ],
    },
    {
      id: "os-kernel-user-space-syscalls",
      theme: "kernel",
      q: "What separates kernel space from user space, how does a system call work, and how do monolithic and microkernels differ?",
      a: "<p>The kernel runs in privileged mode (ring 0 on x86) with full access to hardware and memory. User programs run in unprivileged mode in their own address spaces, so a buggy application cannot corrupt the kernel or other programs. A <b>system call</b> is the controlled gateway: the program puts the call number and arguments in registers and executes a trap instruction. The CPU switches to kernel mode, runs the handler and returns to user mode. Examples are read, write, fork and mmap.</p><ul><li><b>Monolithic kernel</b> (Linux): file systems, drivers and networking all run in kernel space. It is fast because calls are plain function calls, but a faulty driver can crash the system.</li><li><b>Microkernel</b> (Minix, QNX): typically only scheduling, basic memory management and IPC stay in the kernel, and other services run as user processes. It is more robust and modular but slower because of message passing.</li></ul><p>Follow-up: why a mode switch costs more than an ordinary function call.</p>",
      level: "Core",
      companies: ["atlassian"],
      evidence: "several",
      sources: [
        {
          label: "Atlassian Interview Experience (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/atlassian-interview-experience/",
          kind: "candidate-report",
        },
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
          href: "/os",
          label: "Operating systems notes",
        },
      ],
    },
    {
      id: "os-inter-process-communication",
      theme: "kernel",
      q: "How do processes communicate: shared memory versus message passing, and how do pipes work?",
      a: "<p>Processes have separate address spaces, so the OS provides channels for them to exchange data. The two models are shared memory and message passing.</p><ul><li><b>Shared memory</b>: the kernel maps one region into both processes. After setup it is the fastest option because there is no copy or system call per transfer, but the processes must synchronise themselves with semaphores or mutexes, otherwise races occur.</li><li><b>Message passing</b>: data goes through the kernel with send and receive. It is simpler and safer and also works across machines, but pays a copy and a system call per message.</li></ul><p>Concrete mechanisms: an anonymous <b>pipe</b> is a one-way byte stream between related processes (<code>ls | grep x</code>), a named pipe (FIFO) connects unrelated ones, and there are also message queues, Unix domain sockets, network sockets and signals.</p><p>Follow-up: choose shared memory for large, frequent transfers on one machine and message passing for loose coupling or distribution.</p>",
      level: "Core",
      companies: ["atlassian", "amazon"],
      evidence: "several",
      sources: [
        {
          label: "Atlassian Interview Experience (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/atlassian-interview-experience/",
          kind: "candidate-report",
        },
        {
          label: "Amazon Interview Experience | Set 270 (Off-campus SDE-1) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-set-270-off-campus-sde-1/",
          kind: "candidate-report",
        },
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
        {
          label: "Member Of Technical Staff (MTS) Interview Questions and Answers (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/member-of-technical-staff-mts-interview-questions-and-answers/",
          kind: "prep-guide",
        },
      ],
    },
    {
      id: "os-signals-and-kill-9",
      theme: "kernel",
      q: "What are signals, and what exactly happens when you run kill -9 on a process?",
      a: "<p>A signal is a small asynchronous notification the kernel delivers to a process for events such as Ctrl+C (SIGINT), a termination request (SIGTERM), a bad memory access (SIGSEGV) or a child exiting (SIGCHLD). A process can handle most signals with a handler, ignore them or take the default action.</p><p><code>kill -9</code> sends SIGKILL, which cannot be caught, blocked or ignored. The kernel ends the process without running its handlers or cleanup, so user-space buffers are not flushed and temporary files and lock files stay behind. The kernel still frees its memory, closes its file descriptors and passes its children to init. The parent gets SIGCHLD and must reap the exit status; until then the dead process is a zombie. A process in uninterruptible sleep (state D, for example blocked on a dead network mount) may not die until the I/O returns.</p><p>Send SIGTERM first so the program can shut down cleanly, and SIGKILL as a last resort. SIGSTOP also cannot be caught. Follow-up: zombie versus orphan processes.</p>",
      level: "Deep",
      companies: ["swiggy"],
      evidence: "one",
      sources: [
        {
          label: "Swiggy Interview experience for SDE-3 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/swiggy-interview-experience-for-sde-3/",
          kind: "candidate-report",
        },
      ],
    },
    {
      id: "os-boot-process-device-drivers",
      theme: "kernel",
      q: "Walk through the OS boot process and explain what a device driver does.",
      a: "<p>On power-on the CPU starts executing firmware (BIOS or UEFI) from a fixed address. The firmware runs a power-on self test, initialises basic hardware and finds a boot device. It loads the bootloader (for example GRUB), which loads the kernel image and often an initial RAM disk into memory and jumps to the kernel. The kernel initialises memory management, interrupts, the scheduler and drivers, mounts the root file system and starts the first user process (on Linux, init or systemd as PID 1), which brings up services and the login prompt.</p><p>A <b>device driver</b> is kernel code, often a loadable module, that knows one device's registers and protocol and exposes it through a uniform interface such as read and write on a device file. The rest of the OS and applications then do not depend on the hardware details. On a monolithic kernel drivers run in kernel mode, so a bug can crash the system. Follow-up: what an interrupt handler does, and the top half and bottom half split.</p>",
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
    },
  ],
};
