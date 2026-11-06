"use client";

import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Card, Button, Select } from "@/components/ui";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>

      <Card className="space-y-4">
        <h2 className="font-semibold">Appearance</h2>
        <div className="max-w-xs">
          <Select value={theme ?? "system"} onChange={(e) => setTheme(e.target.value)}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </Select>
        </div>
      </Card>

      <Card className="space-y-3">
        <h2 className="font-semibold">Notifications</h2>
        {["Email notifications", "Deadline reminders", "Application reminders", "Productivity reminders"].map((labelText, i) => (
          <label key={labelText} className="flex items-center gap-2 text-sm">
            <input type="checkbox" defaultChecked={i < 3} /> {labelText}
          </label>
        ))}
        <Button variant="secondary" onClick={() => toast.success("Preferences saved")}>Save</Button>
      </Card>

      <Card className="space-y-3">
        <h2 className="font-semibold">Privacy</h2>
        <Select className="max-w-xs" defaultValue="public">
          <option value="public">Profile visibility: Public</option>
          <option value="private">Profile visibility: Private</option>
        </Select>
      </Card>

      <Card className="space-y-3 border-red-200 dark:border-red-900">
        <h2 className="font-semibold text-red-600">Danger zone</h2>
        <p className="text-sm text-slate-500">Deleting your account removes all your data permanently.</p>
        <Button variant="danger" onClick={() => toast.error("Account deletion is disabled in the demo.")}>Delete account</Button>
      </Card>
    </div>
  );
}
