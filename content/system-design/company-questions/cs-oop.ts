import type { CsSet } from "./cs-types";

export const set: CsSet = {
  id: "oop",
  title: "Object-oriented programming",
  intro:
    "Object-oriented programming questions reported by candidates in campus and experienced hiring loops, from the four pillars to SOLID, virtual dispatch, memory and design rounds. Read each answer, then say it aloud with your own example.",
  themes: [
    {
      id: "pillars",
      name: "The four pillars",
    },
    {
      id: "dispatch",
      name: "Polymorphism and dispatch",
    },
    {
      id: "design",
      name: "SOLID, design and patterns",
    },
    {
      id: "memory",
      name: "Memory, lifetime and keywords",
    },
    {
      id: "library",
      name: "Collections, exceptions and language features",
    },
  ],
  chapters: [
    {
      href: "/interview/r2",
      label: "Machine coding round",
    },
    {
      href: "/system-design",
      label: "System design chapters",
    },
    {
      href: "/problems",
      label: "Practice problems",
    },
  ],
  questions: [
    {
      id: "oop-four-pillars",
      theme: "pillars",
      q: "What are the four pillars of object-oriented programming? Explain each with a real-world example.",
      a: "<p>The four pillars are encapsulation, abstraction, inheritance and polymorphism.</p> <ul> <li><b>Encapsulation</b>: keep data and the methods that use it together, and hide the fields behind a controlled interface. A <code>BankAccount</code> keeps <code>balance</code> private and changes it only through <code>deposit</code> and <code>withdraw</code>, which enforce the rules.</li> <li><b>Abstraction</b>: expose what an object does, not how. A caller uses <code>PaymentGateway.charge()</code> without knowing which provider sits behind it.</li> <li><b>Inheritance</b>: a subclass reuses and extends a base class, modelling an is-a relationship such as <code>SavingsAccount</code> and <code>Account</code>.</li> <li><b>Polymorphism</b>: one call, many behaviours, chosen by the object's actual type.</li> </ul> <p>The usual follow-ups are how encapsulation differs from abstraction and when composition beats inheritance.</p>",
      level: "Core",
      companies: ["zomato", "razorpay", "ola", "amazon", "phonepe", "myntra"],
      evidence: "several",
      sources: [
        {
          label: "Zomato Interview Experience (On-Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/zomato-interview-experience-on-campus/",
          kind: "candidate-report",
        },
        {
          label: "Zomato Interview Experience (On - Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/zomato-interview-experience-on-campus-2/",
          kind: "candidate-report",
        },
        {
          label: "Zomato Interview Experience for SDE (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/zomato-interview-experience-for-sde-3/",
          kind: "candidate-report",
        },
        {
          label: "Razorpay Interview Experience (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/razorpay-interview-experience/",
          kind: "candidate-report",
        },
        {
          label: "OLA Interview Experience | Set 11 ( For Internship) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/ola-interview-experience-set-11-internship/",
          kind: "candidate-report",
        },
        {
          label: "Amazon Interview Experience For SDE Summer Internship (2022) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-for-sde-summer-internship-2022/",
          kind: "candidate-report",
          year: 2022,
        },
        {
          label: "Phonepe Interview Experience (On-campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/phonepe-interview-experience-on-campus-1/",
          kind: "candidate-report",
        },
        {
          label: "Myntra Interview Experience | Set 3 (On-Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/myntra-interview-experience-set-3-campus/",
          kind: "candidate-report",
        },
        {
          label: "Microsoft Theoretical Interview Questions (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/microsofts-asked-interview-questions/",
          kind: "prep-guide",
        },
        {
          label: "Member Of Technical Staff (MTS) Interview Questions and Answers (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/member-of-technical-staff-mts-interview-questions-and-answers/",
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
      id: "oop-encapsulation-vs-abstraction",
      theme: "pillars",
      q: "How is encapsulation different from abstraction?",
      a: "<p>Both hide something, but they work at different levels and answer different problems.</p> <ul> <li><b>Encapsulation</b> is an implementation mechanism. It binds state and behaviour into one unit and restricts direct access with access modifiers, so an object can protect its own invariants. It hides <em>data</em>.</li> <li><b>Abstraction</b> is a design idea. It exposes only the essential operations and hides the complexity behind them, using interfaces and abstract classes. It hides <em>implementation</em>.</li> </ul> <p>Example: a <code>Stack</code> interface with <code>push</code> and <code>pop</code> is abstraction, because callers do not care whether an array or a linked list is used. A concrete stack with a private array and an index that <code>push</code> bounds-checks is encapsulation.</p> <p>Adding a getter and a setter for every private field is not real encapsulation, since the state is still open to anyone. Interviewers often ask this next.</p>",
      level: "Core",
      companies: ["zomato", "phonepe"],
      evidence: "several",
      sources: [
        {
          label: "Zomato Interview Experience for SDE (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/zomato-interview-experience-for-sde-3/",
          kind: "candidate-report",
        },
        {
          label: "Phonepe Interview Experience (On-campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/phonepe-interview-experience-on-campus-1/",
          kind: "candidate-report",
        },
        {
          label: "Microsoft Theoretical Interview Questions (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/microsofts-asked-interview-questions/",
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
      id: "oop-abstract-class-vs-interface",
      theme: "pillars",
      q: "What is the difference between an abstract class and an interface, and when would you pick each?",
      a: "<p>An <b>abstract class</b> is a partially built base class. It can hold fields, constructors and concrete methods next to abstract ones, and a class can extend only one in Java or C#. An <b>interface</b> is a contract of behaviour. A class can implement many, and traditionally it holds no instance state. Java 8 added <code>default</code> and <code>static</code> methods to interfaces.</p> <ul> <li>Choose an abstract class when closely related types share state and code, as in a template method where the base class fixes the steps.</li> <li>Choose an interface for a capability that unrelated classes can offer, such as <code>Comparable</code> or <code>Runnable</code>, or when you want callers to depend on a contract only.</li> </ul> <p>Example: an interface <code>PaymentMethod</code> with an abstract class <code>BaseCard</code> that shares validation. C++ has no interface keyword; a class with only pure virtual functions plays that role. A common follow-up is whether an abstract class can have a constructor. It can, and a subclass constructor calls it.</p>",
      level: "Core",
      companies: ["microsoft", "ola", "groww"],
      evidence: "several",
      sources: [
        {
          label: "Microsoft Interview Experience | Set 87 (On-Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/microsoft-interview-experience-set-87/",
          kind: "candidate-report",
        },
        {
          label: "Ola Interview Experience for Developer role (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/ola-interview-experience-for-developer-role/",
          kind: "candidate-report",
        },
        {
          label: "Groww Interview Experience for SDET Intern (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/groww-interview-experience-for-sdet-intern/",
          kind: "candidate-report",
        },
        {
          label: "Microsoft Interview Experience | Set 176 (On-Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/microsoft-interview-experience-set-176-on-campus/",
          kind: "candidate-report",
        },
        {
          label: "Member Of Technical Staff (MTS) Interview Questions and Answers (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/member-of-technical-staff-mts-interview-questions-and-answers/",
          kind: "prep-guide",
        },
      ],
    },
    {
      id: "oop-polymorphism",
      theme: "dispatch",
      q: "What is polymorphism? Compare compile-time and run-time polymorphism with examples.",
      a: "<p>Polymorphism means one interface with many behaviours: the same call does different work depending on the types involved.</p> <ul> <li><b>Compile-time</b> (static) polymorphism is resolved by the compiler. Examples are overloading, such as <code>area(int r)</code> and <code>area(int w, int h)</code>, operator overloading and C++ templates.</li> <li><b>Run-time</b> (dynamic) polymorphism is resolved while the program runs. A base-type reference calls an overridden method, so <code>shape.draw()</code> runs the <code>Circle</code> version when the object is a <code>Circle</code>.</li> </ul> <p>Run-time polymorphism needs inheritance or an interface and, in C++, a <code>virtual</code> function. In Java, instance methods that are not private, static or final are dispatched dynamically by default.</p> <p>Expect the follow-up on how dynamic dispatch works, which is normally a virtual table lookup, and why it costs slightly more than a direct call.</p>",
      level: "Core",
      companies: ["zomato", "microsoft", "ola", "myntra", "swiggy", "phonepe", "amazon"],
      evidence: "several",
      sources: [
        {
          label: "Zomato Interview Experience (On-Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/zomato-interview-experience-on-campus/",
          kind: "candidate-report",
        },
        {
          label: "Zomato Interview Experience (On - Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/zomato-interview-experience-on-campus-2/",
          kind: "candidate-report",
        },
        {
          label: "Microsoft Interview Experience | Set 59 (On-Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/microsoft-interview-experience-set-59-on-campus/",
          kind: "candidate-report",
        },
        {
          label: "OLA Interview Experience | Set 11 ( For Internship) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/ola-interview-experience-set-11-internship/",
          kind: "candidate-report",
        },
        {
          label: "Myntra Interview | Set 1 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/myntra-interview-set-1/",
          kind: "candidate-report",
        },
        {
          label: "Swiggy Interview Experience for Software Dev Engineer (On-Campus) 2021 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/swiggy-interview-experience-for-software-dev-engineer-on-campus-2021/",
          kind: "candidate-report",
          year: 2021,
        },
        {
          label: "PhonePe Interview Experience for Software Engineer 2023 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/phonepe-interview-experience-for-software-engineer-2023/",
          kind: "candidate-report",
          year: 2023,
        },
        {
          label: "Phonepe Interview Experience (On-campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/phonepe-interview-experience-on-campus-1/",
          kind: "candidate-report",
        },
        {
          label: "Amazon Interview Experience for SDE-1 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-for-sde-1-23/",
          kind: "candidate-report",
        },
        {
          label: "Microsoft Theoretical Interview Questions (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/microsofts-asked-interview-questions/",
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
      id: "oop-overloading-vs-overriding",
      theme: "dispatch",
      q: "What is the difference between method overloading and method overriding?",
      a: "<p><b>Overloading</b> means several methods with the same name but different parameter lists in the same scope. The compiler picks one from the static argument types, so it is compile-time polymorphism. A different return type alone is not enough to overload.</p> <p><b>Overriding</b> means a subclass supplies its own body for an inherited method with the same signature. The version that runs is chosen from the object's real type at run time. In Java the return type may be covariant and the access cannot be narrower; mark it with <code>@Override</code>. In C++ the base method must be <code>virtual</code>, and <code>override</code> catches mistakes.</p> <ul> <li>Pitfall: with <code>print(Object)</code> and <code>print(String)</code>, a call through an <code>Object</code>-typed variable holding a string still picks <code>print(Object)</code>, because overloads use the static type.</li> <li>Static methods are hidden, not overridden.</li> </ul>",
      level: "Core",
      companies: ["zomato", "razorpay"],
      evidence: "several",
      sources: [
        {
          label: "Zomato Interview Experience (On-Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/zomato-interview-experience-on-campus/",
          kind: "candidate-report",
        },
        {
          label: "Zomato Interview Experience (On - Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/zomato-interview-experience-on-campus-2/",
          kind: "candidate-report",
        },
        {
          label: "Razorpay Interview Experience for Product Support Engineer (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/razorpay-interview-experience-for-product-support-engineer/",
          kind: "candidate-report",
        },
        {
          label: "Microsoft Theoretical Interview Questions (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/microsofts-asked-interview-questions/",
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
      id: "oop-virtual-functions-vtable",
      theme: "dispatch",
      q: "What are virtual and pure virtual functions in C++, and how does the vtable make them work?",
      a: "<p>A <b>virtual function</b> is declared in a base class so that a call through a base pointer or reference runs the override of the object's real type. A <b>pure virtual function</b>, written <code>virtual void draw() = 0;</code>, has no required body. A class containing one is abstract and cannot be instantiated, and a derived class must override it to become concrete.</p> <p>Typical implementation: every class with virtual functions gets a <b>vtable</b>, a table of function pointers. Each object stores a hidden <b>vptr</b> to its class's table. A virtual call loads the vptr, indexes the table and jumps indirectly. That costs an extra memory load and usually prevents inlining.</p> <ul> <li>Make the base destructor virtual; deleting a derived object through a base pointer without it has no defined behaviour.</li> <li>A constructor cannot be virtual, because the object's real type is still being established while it is built.</li> </ul> <p>The follow-up is usually which function a virtual call inside a constructor reaches. It reaches the version of the class being constructed.</p>",
      level: "Deep",
      companies: ["microsoft", "phonepe", "amazon", "zomato"],
      evidence: "several",
      sources: [
        {
          label: "Microsoft Interview Experience | Set 176 (On-Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/microsoft-interview-experience-set-176-on-campus/",
          kind: "candidate-report",
        },
        {
          label: "PhonePe Interview Experience for Software Engineer (On-Campus) Aug 2022 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/phonepe-interview-experience-for-software-engineer-on-campus-aug-2022/",
          kind: "candidate-report",
          year: 2022,
        },
        {
          label: "Amazon Interview Experience for SDE-1 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-for-sde-1-23/",
          kind: "candidate-report",
        },
        {
          label: "Zomato Interview Experience (On-Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/zomato-interview-experience-on-campus/",
          kind: "candidate-report",
        },
        {
          label: "Juspay Interview Questions for Technical Profiles (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/juspay-interview-questions-for-technical-profiles/",
          kind: "prep-guide",
        },
      ],
    },
    {
      id: "oop-inheritance-diamond-constructors",
      theme: "dispatch",
      q: "What kinds of inheritance exist, what is the diamond problem, and in what order do constructors and destructors run?",
      a: "<p>Kinds: single, multilevel, multiple, hierarchical and hybrid. Java allows multiple inheritance only through interfaces.</p> <p>The <b>diamond problem</b>: <code>D</code> inherits from <code>B</code> and <code>C</code>, and both inherit from <code>A</code>. In C++ that gives <code>D</code> two copies of <code>A</code>, so <code>d.x</code> is ambiguous. Declare <code>class B : virtual public A</code> (and the same for <code>C</code>), and <code>D</code> holds one shared <code>A</code>, which the most derived class constructs. In Java, if two interfaces give conflicting default methods, the class must override and choose.</p> <ul> <li>In C++, constructors run base first, then member objects, then the derived body. Multiple bases run in declaration order.</li> <li>Destructors run in exactly the reverse order.</li> </ul> <p>Example: <code>C</code> derived from <code>B</code> derived from <code>A</code> prints A, B, C on construction and C, B, A on destruction. A common trap is guessing output when the base destructor is not virtual.</p>",
      level: "Deep",
      companies: ["microsoft", "zomato", "swiggy", "phonepe", "amazon", "ola", "meesho"],
      evidence: "several",
      sources: [
        {
          label: "Microsoft Interview Experience | Set 176 (On-Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/microsoft-interview-experience-set-176-on-campus/",
          kind: "candidate-report",
        },
        {
          label: "Zomato Interview Experience | SDE (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/zomato-interview-experience-sde/",
          kind: "candidate-report",
        },
        {
          label: "Swiggy Interview Experience for SDE-1 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/swiggy-interview-experience-for-sde-1/",
          kind: "candidate-report",
        },
        {
          label: "PhonePe Interview Experience for Software Engineer (On-Campus) Aug 2022 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/phonepe-interview-experience-for-software-engineer-on-campus-aug-2022/",
          kind: "candidate-report",
          year: 2022,
        },
        {
          label: "Amazon Interview Experience for SDE-1 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-for-sde-1-23/",
          kind: "candidate-report",
        },
        {
          label: "OLA Interview Experience | Set 11 ( For Internship) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/ola-interview-experience-set-11-internship/",
          kind: "candidate-report",
        },
        {
          label: "Microsoft Interview Experience For Internship (Off-Campus) 2024 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/microsoft-interview-experience-for-internship-off-campus-2024/",
          kind: "candidate-report",
          year: 2024,
        },
        {
          label: "Juspay Interview Questions for Technical Profiles (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/juspay-interview-questions-for-technical-profiles/",
          kind: "prep-guide",
        },
        {
          label: "Meesho Interview Experience (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/meesho-interview-experience/",
          kind: "candidate-report",
        },
      ],
    },
    {
      id: "oop-solid-principles",
      theme: "design",
      q: "What are the SOLID principles? Give a short example for each.",
      a: "<p>SOLID is five guidelines for keeping class designs easy to change.</p> <ul> <li><b>Single responsibility</b>: a class has one reason to change. Split <code>Invoice</code> from <code>InvoicePrinter</code>.</li> <li><b>Open/closed</b>: open to extension, closed to modification. Add a new <code>DiscountRule</code> class instead of editing an <code>if</code> chain.</li> <li><b>Liskov substitution</b>: a subtype must work wherever its base type is expected. A <code>Square</code> that breaks the <code>Rectangle</code> contract that width and height vary separately violates it.</li> <li><b>Interface segregation</b>: prefer small, focused interfaces so clients do not depend on methods they never use.</li> <li><b>Dependency inversion</b>: high-level code depends on abstractions, not concrete classes. An <code>OrderService</code> takes a <code>PaymentGateway</code> interface through its constructor.</li> </ul> <p>Interviewers often ask you to spot which principle a given snippet breaks, or to refactor it.</p>",
      level: "Core",
      companies: ["myntra", "meesho"],
      evidence: "several",
      sources: [
        {
          label: "Myntra Interview Experience for SDE 2 (3+ years Experienced) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/myntra-interview-experience-for-sde-2-3-years-experienced/",
          kind: "candidate-report",
        },
        {
          label: "Meesho Interview Experience for SDE Intern (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/meesho-interview-experience-for-sde-intern/",
          kind: "candidate-report",
        },
      ],
    },
    {
      id: "oop-composition-vs-inheritance",
      theme: "design",
      q: "Why is composition often preferred over inheritance?",
      a: "<p><b>Inheritance</b> models is-a and gives code reuse plus polymorphism. <b>Composition</b> models has-a: an object holds a reference to a collaborator and delegates to it.</p> <p>Inheritance couples a subclass tightly to its parent's internals, so a change in the base class can silently break children (the fragile base class problem). The relationship is also fixed at compile time and uses up the single parent slot in languages such as Java.</p> <p>Composition keeps classes small, lets you swap behaviour at run time, and makes testing easier because you can pass in a fake.</p> <p>Example: a <code>Penguin</code> that extends <code>FlyingBird</code> must disable flying. Instead give <code>Bird</code> a <code>MoveBehaviour</code>, and inject <code>Walk</code> or <code>Fly</code>. That is the strategy pattern.</p> <p>Use inheritance only when the child can truly substitute for the parent (Liskov), and the follow-up is often to name a case where inheritance is the right call.</p>",
      level: "Core",
      companies: ["swiggy"],
      evidence: "one",
      sources: [
        {
          label: "Swiggy Interview Experience for SDE-1 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/swiggy-interview-experience-for-sde-1/",
          kind: "candidate-report",
        },
      ],
    },
    {
      id: "oop-design-parking-lot-lld",
      theme: "design",
      q: "How do you approach an object-oriented design problem such as a parking lot, cab booking or vehicle rental?",
      a: "<p>Work in a fixed order so the design stays defensible under follow-ups.</p> <ol> <li>Clarify requirements and scope: vehicle types, pricing, payments, how many floors, what the caller can do.</li> <li>Take nouns as entities (<code>ParkingLot</code>, <code>Floor</code>, <code>Spot</code>, <code>Vehicle</code>, <code>Ticket</code>) and verbs as behaviours (<code>park</code>, <code>unpark</code>, <code>pay</code>).</li> <li>Decide relationships: has-a by default, is-a only where substitution holds.</li> <li>Put the parts that vary behind interfaces, such as <code>PricingStrategy</code> and <code>SpotAssignmentStrategy</code>.</li> <li>Think about concurrency: two cars must not get the same spot, so guard the allocation.</li> <li>Write a small runnable driver to prove the flow.</li> </ol> <p>The usual follow-up is to add a new vehicle type or pricing rule. If the design is right, that means adding a class, not editing old ones.</p>",
      level: "Deep",
      companies: ["phonepe", "myntra", "meesho", "flipkart", "cred", "swiggy"],
      evidence: "several",
      sources: [
        {
          label: "PhonePe Interview Experience (1.10 years experience) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/phonepe-interview-experience-1-10-years-experience/",
          kind: "candidate-report",
        },
        {
          label: "Myntra Interview Experience for SDE 2 (3+ years Experienced) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/myntra-interview-experience-for-sde-2-3-years-experienced/",
          kind: "candidate-report",
        },
        {
          label: "Meesho Interview Experience | On-Campus |SDE-1 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/meesho-interview-experience-on-campus-sde-1/",
          kind: "candidate-report",
        },
        {
          label: "Meesho Interview Experience for SDE-I 2025 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/meesho-interview-experience-for-sde-i-2025/",
          kind: "candidate-report",
          year: 2025,
        },
        {
          label: "Flipkart Interview Experience SDE 2 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/flipkart-interview-experience-sde-2/",
          kind: "candidate-report",
        },
        {
          label: "CRED interview, machine coding round on OOP design, Nov 2024 (Naukri Code360)",
          url: "https://www.naukri.com/code360/interview-experiences/cred/interview-experience-nov-2024-exp-0-2-years",
          kind: "candidate-report",
          year: 2024,
        },
        {
          label: "Interview Experience 174: PhonePe SDE2 (Roundz Newsletter, posted 30 Aug 2025)",
          url: "https://roundz.substack.com/p/interview-experience-174-phonepe-sde2",
          kind: "candidate-report",
          year: 2025,
        },
        {
          label: "Interview Experience 101: PhonePe SDE2 (Roundz Newsletter, posted 14 Jun 2025)",
          url: "https://roundz.substack.com/p/interview-experience-101-phonepe-sde2",
          kind: "candidate-report",
          year: 2025,
        },
        {
          label:
            "Swiggy interviews with LLD rounds: parking slots, cart, Splitwise (CodingKaro, mirrors LeetCode Discuss)",
          url: "https://www.codingkaro.in/jobs-internships/leetcode-interview-experience/Swiggy",
          kind: "candidate-report",
        },
      ],
      links: [
        {
          href: "/interview/r2",
          label: "Machine coding round",
        },
      ],
    },
    {
      id: "oop-design-patterns-singleton",
      theme: "design",
      q: "What are design patterns, and how do Singleton (thread-safe), Factory and Observer work?",
      a: "<p>Design patterns are named, reusable solutions to recurring design problems. They give a shared vocabulary, but forcing one where it is not needed adds noise.</p> <ul> <li><b>Singleton</b>: one instance and a global access point, using a private constructor and a static accessor. A naive lazy <code>if (instance == null)</code> can create two instances under threads. Safe options are eager initialisation, double-checked locking with a <code>volatile</code> field, a holder class, a function-local static in C++11, or a Java enum.</li> <li><b>Factory</b>: a method decides which concrete class to build and returns a common type, so callers do not name concrete classes.</li> <li><b>Observer</b>: a subject keeps subscribers and notifies them on change, as in event listeners.</li> </ul> <p>Singleton is often criticised for hiding dependencies and making tests hard, so dependency injection is the usual follow-up.</p>",
      level: "Deep",
      companies: ["phonepe", "uber", "meesho", "microsoft", "razorpay", "amazon"],
      evidence: "several",
      sources: [
        {
          label: "Phonepe Interview Experience (On-campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/phonepe-interview-experience-on-campus-1/",
          kind: "candidate-report",
        },
        {
          label: "Uber Interview Experience | Software Engineer 1 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/uber-interview-experience-software-engineer-1/",
          kind: "candidate-report",
        },
        {
          label: "Meesho Interview Experience (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/meesho-interview-experience/",
          kind: "candidate-report",
        },
        {
          label: "Microsoft Interview Experience for SDE 2 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/microsoft-interview-experience-for-sde-2-5/",
          kind: "candidate-report",
        },
        {
          label: "Razorpay : Product development Engineer - Interview. (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/razorpay-product-development-engineer-interview/",
          kind: "candidate-report",
        },
        {
          label: "Amazon Interview Experience - SDE 2 (3+ Years) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-sde-2-3-years/",
          kind: "candidate-report",
        },
        {
          label: "Interview Experience 174: PhonePe SDE2 (Roundz Newsletter, posted 30 Aug 2025)",
          url: "https://roundz.substack.com/p/interview-experience-174-phonepe-sde2",
          kind: "candidate-report",
          year: 2025,
        },
      ],
    },
    {
      id: "oop-garbage-collection-memory-model",
      theme: "memory",
      q: "How does garbage collection work, and how is memory laid out in Java compared with C++?",
      a: "<p>A garbage collector reclaims objects that are unreachable from the roots, such as stack variables and statics. The basic algorithm is <b>mark and sweep</b>: mark everything reachable, free the rest. Most JVM collectors are <b>generational</b>, because most objects die young: new objects go to a young generation collected often and cheaply by copying, and survivors are promoted to the old generation.</p> <p>In Java each thread has a <b>stack</b> for frames, locals and references, and objects live on the shared <b>heap</b>. A memory leak there means an object stays reachable, for example in a static collection or a forgotten listener. Collections can pause the application.</p> <p>C++ has no collector: objects live on the stack, the heap or in static storage, and memory is released by destructors under RAII: <code>unique_ptr</code> owns one object, and <code>shared_ptr</code> reference-counts but leaks cycles, so break them with <code>weak_ptr</code>.</p> <p>A common follow-up asks what stops the world during a collection and how to tune it.</p>",
      level: "Deep",
      companies: ["myntra", "paytm", "ola", "meesho"],
      evidence: "several",
      sources: [
        {
          label: "Myntra Interview Experience | Set 3 (On-Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/myntra-interview-experience-set-3-campus/",
          kind: "candidate-report",
        },
        {
          label: "Paytm Interview Experience For A Software Engineer (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/paytm-interview-experience-for-a-software-engineer/",
          kind: "candidate-report",
        },
        {
          label: "OLA Cabs Interview Experience | Set 2 (For Android - 1.5 Years) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/ola-cabs-interview-experience-set-2-android-1-5-years/",
          kind: "candidate-report",
        },
        {
          label: "Meesho SDE3 interview, Jul 2025 (CodingKaro, mirrors LeetCode Discuss)",
          url: "https://www.codingkaro.in/jobs-internships/leetcode-interview-experience/Meesho",
          kind: "candidate-report",
          year: 2025,
        },
      ],
    },
    {
      id: "oop-call-by-value-vs-reference",
      theme: "memory",
      q: "What is the difference between call by value and call by reference?",
      a: "<p>With <b>call by value</b> the function receives a copy of the argument, so changes to the parameter do not affect the caller. With <b>call by reference</b> the parameter is an alias of the caller's variable, so changes are visible, and no copy is made.</p> <p>C++ supports both: <code>void inc(int x)</code> leaves the caller alone, while <code>void inc(int& x)</code> changes it. A pointer passes an address by value, which lets the callee modify the object it points to.</p> <p>Java is always pass by value. For objects, the value copied is the reference, so a method can mutate the object the caller sees, but assigning a new object to the parameter does not change the caller's variable.</p> <p>The classic follow-up is to write a <code>swap</code>. It works in C++ with references or pointers, and cannot work on plain Java variables.</p>",
      level: "Core",
      companies: ["razorpay"],
      evidence: "one",
      sources: [
        {
          label: "Razorpay Interview Experience for Product Support Engineer (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/razorpay-interview-experience-for-product-support-engineer/",
          kind: "candidate-report",
        },
      ],
    },
    {
      id: "oop-static-final-volatile",
      theme: "memory",
      q: "What do the static, final and volatile keywords mean?",
      a: "<p>In Java:</p> <ul> <li><b>static</b>: a member belongs to the class, with one shared copy, not to each instance. A static method has no <code>this</code> and cannot touch instance fields directly.</li> <li><b>final</b>: a variable can be assigned once, a method cannot be overridden and a class cannot be extended. A final reference cannot be rebound, but the object it points to can still change.</li> <li><b>volatile</b>: a write by one thread is visible to others, and reads and writes are not reordered across it. It does not make compound actions atomic, so <code>count++</code> on a volatile field can still lose updates; use <code>AtomicInteger</code> or a lock.</li> </ul> <p>C++ differs: <code>const</code> is the closer match to final variables, and <code>volatile</code> does not give thread safety, so use <code>std::atomic</code>.</p> <p>A usual follow-up asks why double-checked locking needs volatile.</p>",
      level: "Deep",
      companies: ["swiggy", "groww"],
      evidence: "several",
      sources: [
        {
          label: "Swiggy Interview Experience for SDE-1 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/swiggy-interview-experience-for-sde-1/",
          kind: "candidate-report",
        },
        {
          label: "Groww Interview Experience for SDET Intern (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/groww-interview-experience-for-sdet-intern/",
          kind: "candidate-report",
        },
      ],
    },
    {
      id: "oop-string-immutability",
      theme: "memory",
      q: "How do String, StringBuilder and StringBuffer differ, and why is String immutable?",
      a: "<p>In Java, <b>String</b> is immutable: every change builds a new object. That makes it safe to share across threads, safe as a hash map key because its hash cannot change, and cacheable in the string pool. The cost is that repeated concatenation in a loop copies the text each time, which is quadratic in total.</p> <ul> <li><b>StringBuilder</b> is mutable, unsynchronised and fast. Use it for building text in one thread.</li> <li><b>StringBuffer</b> is mutable with synchronised methods, so it is thread-safe but slower, and rarely needed now.</li> </ul> <p>Example: building a result with <code>sb.append(part)</code> in a loop is linear, while <code>s = s + part</code> is not.</p> <p>To write your own immutable class, make it <code>final</code>, keep all fields <code>private final</code>, provide no setters and copy any mutable input or output. The follow-up is usually where else immutability helps, such as concurrency.</p>",
      level: "Core",
      companies: ["meesho", "amazon"],
      evidence: "several",
      sources: [
        {
          label: "Meesho Interview Experience (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/meesho-interview-experience/",
          kind: "candidate-report",
        },
        {
          label: "Amazon Interview Experience - SDE 2 (3+ Years) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-sde-2-3-years/",
          kind: "candidate-report",
        },
      ],
    },
    {
      id: "oop-hashmap-internals",
      theme: "library",
      q: "How does a HashMap work internally? Cover hashing, collisions, equals and hashCode, and resizing.",
      a: "<p>A hash map is an array of buckets. The key's <code>hashCode</code> is mixed and masked to pick a bucket index (Java uses a power-of-two capacity, so a bit mask replaces the modulo). Lookup finds the bucket, then compares keys with <code>equals</code>.</p> <ul> <li><b>Collisions</b>: keys sharing a bucket are chained in a list. Since Java 8, adding to a bucket that already holds 8 entries converts it to a red-black tree (if the table has fewer than 64 slots it resizes instead), so the worst case is O(log n).</li> <li><b>Contract</b>: equal objects must return equal hash codes. Break it, or mutate a key after insertion, and lookups fail.</li> <li><b>Resizing</b>: when size exceeds capacity times the load factor (0.75 by default), capacity doubles and entries are redistributed.</li> </ul> <p>Average get and put are O(1). HashMap is not thread-safe; use <code>ConcurrentHashMap</code>, which is the usual follow-up.</p>",
      level: "Deep",
      companies: ["ola", "razorpay", "zomato"],
      evidence: "several",
      sources: [
        {
          label: "OLA Interview Experience | Set 12 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/ola-interview-experience-set-12/",
          kind: "candidate-report",
        },
        {
          label: "OLA Cabs Interview Experience (Bangalore) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/ola-cabs-interview-experience-bangalore/",
          kind: "candidate-report",
        },
        {
          label: "Razorpay Interview Experience for SDE-1 (On-Campus 2020) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/razorpay-interview-experience-for-sde-1-on-campus-2020/",
          kind: "candidate-report",
          year: 2020,
        },
        {
          label: "Zomato Interview Experience | SDE (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/zomato-interview-experience-sde/",
          kind: "candidate-report",
        },
        {
          label: "Microsoft Theoretical Interview Questions (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/microsofts-asked-interview-questions/",
          kind: "prep-guide",
        },
      ],
      links: [
        {
          href: "/problems",
          label: "Practice problems",
        },
      ],
    },
    {
      id: "oop-java-8-streams-lambdas",
      theme: "library",
      q: "What are the main Java 8 features, and how do streams and parallel streams work?",
      a: '<p>Java 8 added lambdas, functional interfaces, method references, streams, <code>Optional</code>, default methods on interfaces and a new date and time API.</p> <p>A <b>stream</b> is a pipeline over a source: intermediate steps such as <code>filter</code> and <code>map</code> are lazy, and nothing runs until a terminal step such as <code>collect</code> or <code>sum</code>. A stream does not change its source and can be consumed once.</p> <p>Example: <code>names.stream().filter(n -> n.startsWith("A")).map(String::toUpperCase).collect(Collectors.toList())</code>.</p> <p>A <b>parallel stream</b> splits the work across the common fork-join pool. It helps with large data and independent, stateless CPU-bound operations. It can hurt with small inputs, blocking I/O or shared mutable state, and ordering needs care.</p> <p>The follow-up is usually when you would not use a parallel stream.</p>',
      level: "Deep",
      companies: ["paytm", "meesho"],
      evidence: "several",
      sources: [
        {
          label: "Paytm Interview Experience For A Software Engineer (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/paytm-interview-experience-for-a-software-engineer/",
          kind: "candidate-report",
        },
        {
          label: "Meesho SDE3 interview, Jul 2025 (CodingKaro, mirrors LeetCode Discuss)",
          url: "https://www.codingkaro.in/jobs-internships/leetcode-interview-experience/Meesho",
          kind: "candidate-report",
          year: 2025,
        },
      ],
    },
    {
      id: "oop-access-specifiers-exceptions",
      theme: "library",
      q: "What do access specifiers control, and how does exception handling work?",
      a: "<p><b>Access specifiers</b> set who may use a member. <code>private</code> means only the class itself, <code>protected</code> adds subclasses (and, in Java, the same package), and <code>public</code> means everyone. Java also has a default, package-private level. They enforce encapsulation by keeping the usable surface small.</p> <p>In Java, <b>exceptions</b> separate error handling from normal flow. Code that fails <code>throw</code>s; a <code>try</code> block with <code>catch</code> handlers deals with it; <code>finally</code> runs cleanup either way. Checked exceptions must be caught or declared, and unchecked ones (runtime errors) need not be.</p> <ul> <li>Catch the most specific type first and do not swallow errors silently.</li> <li>Do not use exceptions for ordinary control flow.</li> <li>Prefer try-with-resources, or RAII in C++, to release resources.</li> </ul> <p>A frequent follow-up is what happens if both <code>try</code> and <code>finally</code> contain <code>return</code>. The one in <code>finally</code> wins.</p>",
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
