"use client";

import dynamic from "next/dynamic";

export const CheckRunner = dynamic(() => import("./CheckRunner").then((module) => module.CheckRunner));
