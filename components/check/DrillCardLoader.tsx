"use client";

import dynamic from "next/dynamic";

export const DrillCard = dynamic(() => import("./DrillCard").then((module) => module.DrillCard));
