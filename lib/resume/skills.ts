export type SkillKind = "language" | "frontend" | "backend" | "data" | "cloud" | "practice" | "cs";

export interface Skill {
  id: string;
  name: string;
  kind: SkillKind;
  pattern: RegExp;
  topic?: string;
  rounds?: string[];
}

const w = (source: string) => new RegExp(`(?<![A-Za-z0-9])(?:${source})(?![A-Za-z0-9])`, "i");

export const SKILLS: readonly Skill[] = [
  {
    id: "javascript",
    name: "JavaScript",
    kind: "language",
    pattern: w("javascript|ecmascript|es6|es2015"),
    topic: "js",
    rounds: ["r3"],
  },
  {
    id: "typescript",
    name: "TypeScript",
    kind: "language",
    pattern: w("typescript"),
    topic: "typescript",
    rounds: ["r3ts"],
  },
  { id: "python", name: "Python", kind: "language", pattern: w("python"), topic: "python" },
  { id: "java", name: "Java", kind: "language", pattern: w("java(?!\\s*script)"), topic: "java" },
  { id: "go", name: "Go", kind: "language", pattern: w("golang|go\\s+lang"), topic: "go" },
  { id: "cpp", name: "C++", kind: "language", pattern: /(?<![A-Za-z0-9])c\+\+/i, topic: "cpp" },
  { id: "csharp", name: "C#", kind: "language", pattern: /(?<![A-Za-z0-9])c#|\.net(?![A-Za-z0-9])/i },
  { id: "rust", name: "Rust", kind: "language", pattern: w("rust"), topic: "rust" },
  { id: "ruby", name: "Ruby", kind: "language", pattern: w("ruby|rails"), topic: "ruby" },
  { id: "php", name: "PHP", kind: "language", pattern: w("php|laravel") },
  { id: "kotlin", name: "Kotlin", kind: "language", pattern: w("kotlin") },
  { id: "swift", name: "Swift", kind: "language", pattern: w("swift(?:ui)?") },
  { id: "html", name: "HTML", kind: "frontend", pattern: w("html5?"), topic: "html" },
  {
    id: "css",
    name: "CSS",
    kind: "frontend",
    pattern: w("css3?|scss|sass|tailwind(?:\\s*css)?|styled-components"),
    topic: "css",
  },
  {
    id: "react",
    name: "React",
    kind: "frontend",
    pattern: w("react(?:\\.js|js)?(?!\\s*native)"),
    topic: "react",
    rounds: ["r4"],
  },
  { id: "react-native", name: "React Native", kind: "frontend", pattern: w("react\\s*native") },
  {
    id: "nextjs",
    name: "Next.js",
    kind: "frontend",
    pattern: w("next\\.?js|next\\s+js|app\\s+router"),
    topic: "nextjs",
    rounds: ["r4"],
  },
  { id: "redux", name: "Redux", kind: "frontend", pattern: w("redux(?:\\s*toolkit)?|zustand|recoil|mobx") },
  { id: "angular", name: "Angular", kind: "frontend", pattern: w("angular(?:js)?") },
  { id: "vue", name: "Vue", kind: "frontend", pattern: w("vue(?:\\.js|js)?|nuxt") },
  { id: "webpack", name: "Build tools", kind: "frontend", pattern: w("webpack|vite|babel|esbuild|rollup|turbopack") },
  { id: "accessibility", name: "Accessibility", kind: "frontend", pattern: w("accessibility|a11y|wcag|aria") },
  {
    id: "web-performance",
    name: "Web performance",
    kind: "frontend",
    pattern: w("core web vitals|lighthouse|lcp|cls|inp|web performance|page speed"),
  },
  {
    id: "node",
    name: "Node.js",
    kind: "backend",
    pattern: w("node(?:\\.js|js)?|express(?:\\.js|js)?|fastify|koa"),
    topic: "node",
    rounds: ["r5"],
  },
  {
    id: "nestjs",
    name: "NestJS",
    kind: "backend",
    pattern: w("nest\\.?js|nest\\s+js"),
    topic: "nestjs",
    rounds: ["r5"],
  },
  { id: "django", name: "Django", kind: "backend", pattern: w("django|flask|fastapi") },
  { id: "spring", name: "Spring", kind: "backend", pattern: w("spring(?:\\s*boot)?|hibernate") },
  { id: "rest", name: "REST APIs", kind: "backend", pattern: w("restful|rest\\s*apis?|api design|openapi|swagger") },
  { id: "graphql", name: "GraphQL", kind: "backend", pattern: w("graphql|apollo|federation"), topic: "graphql" },
  { id: "grpc", name: "gRPC", kind: "backend", pattern: w("grpc|protobuf|protocol buffers") },
  {
    id: "websockets",
    name: "WebSockets",
    kind: "backend",
    pattern: w("websockets?|socket\\.io|real-time|realtime|server-sent events|sse"),
  },
  {
    id: "microservices",
    name: "Microservices",
    kind: "backend",
    pattern: w("micro-?services?|service mesh|event-driven|domain-driven|ddd"),
  },
  {
    id: "auth",
    name: "Auth",
    kind: "backend",
    pattern: w("oauth2?|jwt|openid|oidc|sso|authentication|authorization|rbac"),
  },
  {
    id: "payments",
    name: "Payments",
    kind: "backend",
    pattern: w("stripe|razorpay|payment gateway|payments?|upi|idempotency"),
  },
  {
    id: "queues",
    name: "Queues and events",
    kind: "backend",
    pattern: w("kafka|rabbitmq|sqs|sns|bullmq|bull|pub/?sub|message queues?|event bus|kinesis"),
  },
  {
    id: "sql",
    name: "SQL",
    kind: "data",
    pattern: w("sql|joins?|indexes|indexing|query optimization|query optimisation"),
    topic: "databases",
    rounds: ["r6"],
  },
  {
    id: "postgres",
    name: "PostgreSQL",
    kind: "data",
    pattern: w("postgres(?:ql)?|psql|aurora"),
    topic: "databases",
    rounds: ["r6"],
  },
  { id: "mysql", name: "MySQL", kind: "data", pattern: w("mysql|mariadb"), topic: "databases", rounds: ["r6"] },
  {
    id: "mongodb",
    name: "MongoDB",
    kind: "data",
    pattern: w("mongo(?:db)?|mongoose"),
    topic: "mongodb",
    rounds: ["r6"],
  },
  {
    id: "redis",
    name: "Redis",
    kind: "data",
    pattern: w("redis|memcached|elasticache"),
    topic: "redis",
    rounds: ["r6"],
  },
  { id: "orm", name: "ORMs", kind: "data", pattern: w("prisma|typeorm|sequelize|drizzle|kysely|knex") },
  { id: "dynamodb", name: "DynamoDB", kind: "data", pattern: w("dynamo(?:db)?|cassandra|nosql") },
  { id: "elasticsearch", name: "Search", kind: "data", pattern: w("elastic(?:search)?|opensearch|algolia|solr") },
  {
    id: "data-pipelines",
    name: "Data pipelines",
    kind: "data",
    pattern: w("etl|airflow|spark|databricks|snowflake|bigquery|data pipeline"),
  },
  {
    id: "aws",
    name: "AWS",
    kind: "cloud",
    pattern: w("aws|amazon web services|ec2|s3|lambda|ecs|eks|cloudfront|rds|cloudwatch"),
    topic: "cloud-devops",
    rounds: ["r9"],
  },
  {
    id: "gcp",
    name: "GCP",
    kind: "cloud",
    pattern: w("gcp|google cloud|cloud run|firebase"),
    topic: "cloud-devops",
    rounds: ["r9"],
  },
  { id: "azure", name: "Azure", kind: "cloud", pattern: w("azure"), topic: "cloud-devops", rounds: ["r9"] },
  {
    id: "docker",
    name: "Docker",
    kind: "cloud",
    pattern: w("docker|containers?|containerized|containerised"),
    topic: "docker",
    rounds: ["r9"],
  },
  {
    id: "kubernetes",
    name: "Kubernetes",
    kind: "cloud",
    pattern: w("kubernetes|k8s|helm"),
    topic: "kubernetes",
    rounds: ["r9"],
  },
  {
    id: "ci-cd",
    name: "CI/CD",
    kind: "cloud",
    pattern: w(
      "ci/cd|cicd|github actions|gitlab ci|jenkins|circleci|argo\\s*cd|(?:ci|build|deployment|deploy|release)\\s+pipelines?|continuous (?:integration|delivery|deployment)"
    ),
    topic: "cloud-devops",
    rounds: ["r9"],
  },
  {
    id: "terraform",
    name: "Infrastructure as code",
    kind: "cloud",
    pattern: w("terraform|cloudformation|cdk|pulumi|serverless framework"),
  },
  {
    id: "observability",
    name: "Observability",
    kind: "cloud",
    pattern: w("observability|monitoring|logging|tracing|datadog|grafana|prometheus|sentry|new relic|opentelemetry"),
  },
  { id: "linux", name: "Linux", kind: "cloud", pattern: w("linux|bash|shell scripting|nginx") },
  { id: "git", name: "Git", kind: "practice", pattern: w("git|github|gitlab|bitbucket"), topic: "git" },
  {
    id: "testing",
    name: "Testing",
    kind: "practice",
    pattern: w("jest|vitest|mocha|cypress|playwright|selenium|unit tests?|integration tests?|e2e|tdd|testing library"),
    topic: "testing",
  },
  {
    id: "security",
    name: "Web security",
    kind: "practice",
    pattern: w("owasp|xss|csrf|security|encryption|ssl|tls|https"),
    topic: "security",
  },
  { id: "agile", name: "Agile", kind: "practice", pattern: w("agile|scrum|kanban|jira|sprint") },
  {
    id: "mentoring",
    name: "Leading people",
    kind: "practice",
    pattern: w("mentor(?:ed|ing)?|led a team|team lead|tech lead|hiring panels?|interviewed candidates|code reviews?"),
  },
  {
    id: "ai",
    name: "AI and LLMs",
    kind: "practice",
    pattern: w("llms?|openai|gpt|claude|gemini|langchain|rag|embeddings|vector database|machine learning|ml|ai"),
    topic: "ai",
  },
  {
    id: "system-design",
    name: "System design",
    kind: "cs",
    pattern: w(
      "system design|scalable|scalability|high availability|distributed systems?|load balancer|load balancing|sharding|replication|architecture"
    ),
    topic: "system-design",
    rounds: ["r8", "s2"],
  },
  {
    id: "dsa",
    name: "Data structures and algorithms",
    kind: "cs",
    pattern: w("data structures?|algorithms?|dsa|leetcode|competitive programming|codeforces|codechef"),
    topic: "dsa",
    rounds: ["r7", "s1"],
  },
  {
    id: "lld",
    name: "Low-level design",
    kind: "cs",
    pattern: w("low-level design|lld|design patterns?|solid principles|object-oriented|oop"),
  },
  {
    id: "dbms",
    name: "DBMS",
    kind: "cs",
    pattern: w("dbms|normalization|normalisation|transactions?|acid|isolation levels?"),
    topic: "dbms",
  },
  {
    id: "os",
    name: "Operating systems",
    kind: "cs",
    pattern: w("operating systems?|concurrency|multi-?threading|deadlocks?"),
    topic: "os",
  },
  {
    id: "networks",
    name: "Networking",
    kind: "cs",
    pattern: w("networking|tcp|udp|dns|http/?2|http/?3|cdn"),
    topic: "networks",
  },
];

const BY_ID = new Map(SKILLS.map((s) => [s.id, s]));

export function skillById(id: string): Skill | undefined {
  return BY_ID.get(id);
}

export function skillsIn(text: string): string[] {
  return SKILLS.filter((s) => s.pattern.test(text)).map((s) => s.id);
}

export function skillCounts(text: string): Map<string, number> {
  const counts = new Map<string, number>();
  for (const skill of SKILLS) {
    const global = new RegExp(skill.pattern.source, "gi");
    const found = text.match(global)?.length ?? 0;
    if (found > 0) counts.set(skill.id, found);
  }
  return counts;
}
