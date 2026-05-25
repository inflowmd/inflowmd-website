import type { Metadata } from "next";
import tasksData from "@/data/tasks.json";
import TasksClient, { type TasksData } from "./TasksClient";

export const metadata: Metadata = {
  title: "Task Board | InflowMD",
  description: "Internal task board.",
  robots: { index: false, follow: false },
};

// Force dynamic rendering — middleware gates this route on a cookie.
export const dynamic = "force-dynamic";

export default function TasksPage() {
  return <TasksClient data={tasksData as TasksData} />;
}
