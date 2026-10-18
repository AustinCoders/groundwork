function idleConsumers(partitions: number, consumers: number): string {
  return String(Math.max(0, consumers - partitions));
}

function workersToBreakEven(messagesPerSecond: number, millisPerMessage: number): string {
  const perWorkerPerSecond = 1000 / millisPerMessage;
  return String(Math.ceil(messagesPerSecond / perWorkerPerSecond));
}

export const estimates: Record<string, () => string> = {
  "mq-idle-consumers": () => idleConsumers(24, 40),
  "mq-workers-to-break-even": () => workersToBreakEven(3000, 50),
};
