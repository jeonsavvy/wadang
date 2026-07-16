"use client";

import { useEffect, useState } from "react";

function currentUnixTime() {
  return BigInt(Math.floor(Date.now() / 1000));
}

export function useCurrentUnixTime() {
  const [now, setNow] = useState(currentUnixTime);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(currentUnixTime()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  return now;
}
