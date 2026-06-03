export type NotificationKind = "info" | "success" | "warning";

export type AppNotification = {
  id: string;
  title: string;
  description?: string;
  kind: NotificationKind;
  href?: string;
  createdAt: number;
  read: boolean;
};

export type PushNotificationInput = {
  title: string;
  description?: string;
  kind: NotificationKind;
  href?: string;
};
