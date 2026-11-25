"use client";

import { useEffect } from "react";
import { startSolutions } from "./engine";

// Starts the Solutions page animations once the server-rendered markup is on screen.
export default function SolutionsEngine() {
  useEffect(() => startSolutions(), []);
  return null;
}
