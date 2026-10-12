"use client";

import dynamic from "next/dynamic";

export const Player = dynamic(() => import("./Player").then((module) => module.Player));
