export const REALTIME_EVENTS = {
  STREAM_CONNECTED: "stream.connected",
  TRANSACTION_CREATED: "transaction.created",
  SCORE_UPDATED: "score.updated",
  FRAUD_ALERT: "fraud.alert",
  LOAN_DISBURSED: "loan.disbursed"
} as const;

export type RealtimeEventName = typeof REALTIME_EVENTS[keyof typeof REALTIME_EVENTS];
