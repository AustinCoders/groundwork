/**
 * The room and the debrief as lazy chunks. Kept in one place so the lobby can
 * start fetching the room's code while the reader is still deciding, and the
 * dynamic() calls in MockApp resolve from the same module cache.
 */
export const loadRoom = () => import("@/app/mock/Room");
export const loadScorecard = () => import("@/app/mock/Scorecard");
