"use client";

import { create } from "zustand";
import { PHOTO_COUNT } from "./photos";

/**
 * The seven states of the print cycle, in order.
 * See creative-direction.md §4 for per-state narrative and art direction.
 */
export type DarkroomState =
  | "setup"
  | "expose"
  | "develop"
  | "stop"
  | "fix"
  | "wash"
  | "dry";

/**
 * Duration of each state in seconds — only used by the develop-emergence
 * shader to drive progress. Visitor-controlled pacing via arrows or tap
 * targets overrides this for actual state transitions.
 */
export const STATE_DURATIONS: Record<DarkroomState, number> = {
  setup: 2,
  expose: 8,
  develop: 18,
  stop: 5,
  fix: 10,
  wash: 8,
  dry: 6,
};

export const STATE_ORDER: readonly DarkroomState[] = [
  "setup",
  "expose",
  "develop",
  "stop",
  "fix",
  "wash",
  "dry",
] as const;

/**
 * Short caption shown in the hero overlay during each state.
 * Typeset per creative-direction.md §5d (plate-caption register).
 */
export const STATE_CAPTION: Record<DarkroomState, string> = {
  setup: "Safelight on. Trays filled. Paper box closed.",
  expose: "Enlarger open. Timer set 00:08.",
  develop: "Paper in developer. Agitate gently.",
  stop: "Paper in stop bath. Ten seconds.",
  fix: "Paper in fixer. Two minutes.",
  wash: "Running wash. Five minutes.",
  dry: "Line drying. Inspection beat.",
};

/**
 * Names the hero prop that advances the state machine when tapped.
 * Rim-highlight and tap handlers are keyed against these tokens.
 */
export type TriggerProp = "timer" | "tongs" | "paper";

export const TRIGGER_FOR_STATE: Record<DarkroomState, TriggerProp> = {
  setup: "timer",
  expose: "tongs",
  develop: "tongs",
  stop: "tongs",
  fix: "tongs",
  wash: "tongs",
  dry: "paper",
};

export type RoomMode = "room" | "darkroom";

interface DarkroomStore {
  current: DarkroomState;
  /** performance.now() at the moment the current state became active. */
  stateStartTime: number;
  /** Index into the photo array for the print currently being developed. */
  currentPhotoIndex: number;
  /** Indices of photos that have completed a full cycle and are hung on the line. */
  completedPhotos: number[];
  /** Lighting mode — darkroom is the default; room mode is a peek at the room
   *  under overhead lights. Does not interrupt the cycle. */
  roomMode: RoomMode;
  /** Whether the visitor has ever flipped the switch — used to quiet the
   *  pulsing hint on first interaction. */
  hasToggledLights: boolean;
  advance: () => void;
  reverse: () => void;
  setState: (state: DarkroomState) => void;
  reset: () => void;
  toggleRoomMode: () => void;
}

export const useDarkroom = create<DarkroomStore>((set, get) => ({
  current: "setup",
  stateStartTime:
    typeof performance !== "undefined" ? performance.now() : 0,
  currentPhotoIndex: 0,
  completedPhotos: [],
  roomMode: "darkroom",
  hasToggledLights: false,
  advance: () => {
    const { current, currentPhotoIndex, completedPhotos } = get();
    const i = STATE_ORDER.indexOf(current);

    // End-of-cycle: dry → setup records the completed print and advances
    // the photo index. When completedPhotos reaches PHOTO_COUNT, further
    // cycles still work but don't add more prints (line stays full).
    if (current === "dry") {
      const next = completedPhotos.length < PHOTO_COUNT
        ? [...completedPhotos, currentPhotoIndex]
        : completedPhotos;
      set({
        current: "setup",
        stateStartTime: performance.now(),
        completedPhotos: next,
        currentPhotoIndex: (currentPhotoIndex + 1) % PHOTO_COUNT,
      });
      return;
    }

    const next = STATE_ORDER[(i + 1) % STATE_ORDER.length];
    set({ current: next, stateStartTime: performance.now() });
  },
  reverse: () => {
    const { current } = get();
    const i = STATE_ORDER.indexOf(current);
    if (i <= 0) return;
    set({
      current: STATE_ORDER[i - 1],
      stateStartTime: performance.now(),
    });
  },
  setState: (state) =>
    set({ current: state, stateStartTime: performance.now() }),
  reset: () =>
    set({
      current: "setup",
      stateStartTime: performance.now(),
      currentPhotoIndex: 0,
      completedPhotos: [],
    }),
  toggleRoomMode: () =>
    set((s) => ({
      roomMode: s.roomMode === "darkroom" ? "room" : "darkroom",
      hasToggledLights: true,
    })),
}));
