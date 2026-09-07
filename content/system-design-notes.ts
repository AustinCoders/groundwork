import type { NotesFile } from "./types";
import { sysdesInterviewMentalModel } from "./system-design/sysdes-interview-mental-model";
import { sysdesClientServerBasics } from "./system-design/sysdes-client-server-basics";
import { sysdesScalingVerticalHorizontal } from "./system-design/sysdes-scaling-vertical-horizontal";
import { sysdesDatabasesInDesign } from "./system-design/sysdes-databases-in-design";
import { sysdesCachingFundamentals } from "./system-design/sysdes-caching-fundamentals";
import { sysdesApisCommunication } from "./system-design/sysdes-apis-communication";
import { sysdesWalkthroughSimple } from "./system-design/sysdes-walkthrough-simple";
import { sysdesLoadBalancingDepth } from "./system-design/sysdes-load-balancing-depth";
import { sysdesCdns } from "./system-design/sysdes-cdns";
import { sysdesMessageQueuesAsync } from "./system-design/sysdes-message-queues-async";
import { sysdesConsistencyModels } from "./system-design/sysdes-consistency-models";
import { sysdesRateLimiting } from "./system-design/sysdes-rate-limiting";
import { sysdesAvailabilityDesign } from "./system-design/sysdes-availability-design";
import { sysdesStorageSystems } from "./system-design/sysdes-storage-systems";
import { sysdesSearchSystems } from "./system-design/sysdes-search-systems";
import { sysdesWalkthroughMedium } from "./system-design/sysdes-walkthrough-medium";
import { sysdesCapTheoremDepth } from "./system-design/sysdes-cap-theorem-depth";
import { sysdesShardingPartitioning } from "./system-design/sysdes-sharding-partitioning";
import { sysdesDistributedConsensus } from "./system-design/sysdes-distributed-consensus";
import { sysdesFaultTolerance } from "./system-design/sysdes-fault-tolerance";
import { sysdesObservabilityScale } from "./system-design/sysdes-observability-scale";
import { sysdesCapacityEstimation } from "./system-design/sysdes-capacity-estimation";
import { sysdesCaseStudies } from "./system-design/sysdes-case-studies";
import { sysdesTradeoffThinking } from "./system-design/sysdes-tradeoff-thinking";

export const systemDesignNotes: NotesFile = {
  meta: {
    title: "System Design — the whole map",
    subtitle: "24 sections across three levels — beginner through advanced, all written.",
    lead: "Pick a level and you'll get these sections in the order that makes sense, from the request lifecycle to sharding, consensus and the tradeoff thinking the interview is actually scoring.",
    author: "Akshat",
    updated: "August 2026",
  },

  hero: { figure: "" },

  chapters: [
    sysdesInterviewMentalModel,
    sysdesClientServerBasics,
    sysdesScalingVerticalHorizontal,
    sysdesDatabasesInDesign,
    sysdesCachingFundamentals,
    sysdesApisCommunication,
    sysdesWalkthroughSimple,
    sysdesLoadBalancingDepth,
    sysdesCdns,
    sysdesMessageQueuesAsync,
    sysdesConsistencyModels,
    sysdesRateLimiting,
    sysdesAvailabilityDesign,
    sysdesStorageSystems,
    sysdesSearchSystems,
    sysdesWalkthroughMedium,
    sysdesCapTheoremDepth,
    sysdesShardingPartitioning,
    sysdesDistributedConsensus,
    sysdesFaultTolerance,
    sysdesObservabilityScale,
    sysdesCapacityEstimation,
    sysdesCaseStudies,
    sysdesTradeoffThinking,
  ],
};
