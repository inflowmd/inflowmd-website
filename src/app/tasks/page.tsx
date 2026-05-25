import type { Metadata } from "next";
import TasksClient from "./TasksClient";

export const metadata: Metadata = {
  title: "Task Board | InflowMD",
  description: "Internal task board.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://inflowmd.vercel.app/tasks" },
};

export default function TasksPage() {
  return <TasksClient />;
}
