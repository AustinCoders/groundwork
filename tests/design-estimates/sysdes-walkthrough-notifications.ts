function minimumSendMinutes(devices: number, quotaPerMinute: number): string {
  return String(Math.round(devices / quotaPerMinute));
}

function failedAfterQueueLimit(messages: number, segmentsPerSecond: number, queueHours: number): string {
  const sent = segmentsPerSecond * queueHours * 3600;
  return (messages - sent).toLocaleString("en-US");
}

export const estimates: Record<string, () => string> = {
  "nt-fcm-quota-minutes": () => minimumSendMinutes(20_000_000, 600_000),
  "nt-sms-queue-overflow": () => failedAfterQueueLimit(1_000_000, 1, 10),
};
