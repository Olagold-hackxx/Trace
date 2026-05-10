"use client";

import { AppShell } from "@/components/layout/app-shell";
import { WORKERS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { AccountCircle, Wallet, NotificationsActive, Lock } from "@mui/icons-material";
import { COLORS } from "@/lib/constants";

export default function WorkerSettingsPage() {
  const currentWorker = WORKERS[0];

  const settingsSections = [
    {
      icon: AccountCircle,
      title: "Profile Information",
      description: "Update your name, location, and skills",
      actionLabel: "Edit Profile",
    },
    {
      icon: Wallet,
      title: "Bank Details",
      description: "Manage your payout account",
      actionLabel: "Update Bank",
    },
    {
      icon: NotificationsActive,
      title: "Notifications",
      description: "Manage job alerts and messages",
      actionLabel: "Manage",
    },
    {
      icon: Lock,
      title: "Security",
      description: "Change password and 2FA settings",
      actionLabel: "Update",
    },
  ];

  return (
    <AppShell role="trader">
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">Settings</h1>
          <p className="text-text-secondary">Manage your profile and preferences</p>
        </div>

        {/* Profile Preview */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-6">
            <img
              src={currentWorker.image}
              alt={currentWorker.name}
              className="w-20 h-20 rounded-full object-cover"
            />
            <div>
              <h2 className="text-2xl font-bold text-navy">{currentWorker.name}</h2>
              <p className="text-text-secondary">{currentWorker.location}, Lagos</p>
              <p className="text-sm text-text-secondary mt-2">
                Reliability: <span className="font-semibold text-navy">{currentWorker.reliabilityScore}%</span>
              </p>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-4">
          {settingsSections.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.title}
                className="bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: `${COLORS.primary}15` }}
                  >
                    <Icon sx={{ fontSize: "24px" }} style={{ color: COLORS.primary }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy">{section.title}</h3>
                    <p className="text-sm text-text-secondary">{section.description}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  style={{
                    borderColor: COLORS.primary,
                    color: COLORS.primary,
                  }}
                >
                  {section.actionLabel}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
