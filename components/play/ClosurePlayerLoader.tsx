"use client";

import dynamic from "next/dynamic";

export const ClosurePlayer = dynamic(() => import("./ClosurePlayer").then((module) => module.ClosurePlayer));
