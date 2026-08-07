"use client";

import { useEffect } from "react";

export default function HashOpen() {
  useEffect(() => {
    const open = (hash: string) => {
      if (!hash) return;
      const id = hash.replace(/^#/, "");
      if (!id) return;
      const el = document.getElementById(id);
      if (el && el.tagName === "DETAILS") {
        (el as HTMLDetailsElement).open = true;
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    open(window.location.hash);
    const onHash = () => open(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return null;
}
