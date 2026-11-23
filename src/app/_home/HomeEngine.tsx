"use client";

import { useEffect } from "react";
import { startHome } from "./engine";

// Starts the homepage animations once the server-rendered markup is on screen.
export default function HomeEngine() {
  useEffect(() => startHome(), []);
  return null;
}
