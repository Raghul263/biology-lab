import { useRef } from 'react';
import useStore from './store';

/**
 * Centralized interaction hook for all 3D lab components.
 *
 * Interaction model:
 *  - Left-click  → pick up (if not locked) / drop (if held)
 *  - Right-click → TOGGLE lock/unlock in place
 *  - No double-click required — right-click is a single unified toggle
 *
 * When LOCKED:
 *  - Component is fixed to its current position
 *  - Left-click does nothing (or triggers tool interaction via options.onInteraction)
 *  - Right-click again → unlocks and allows free movement
 */
export function useComponentInteraction(id, isHeld, options = {}) {
  const { toggleComponentLock, lockedComponents, setHeldTool } = useStore();
  const isLocked = !!lockedComponents[id];
  // Prevent pointer-down from firing right after a context-menu lock
  const lockedJustNow = useRef(false);

  // ── LEFT CLICK ────────────────────────────────────────────────────────────
  const handlePointerDown = (e) => {
    e.stopPropagation();

    // Ignore if the right-click just fired (prevents immediate pick-up after unlock)
    if (lockedJustNow.current) {
      lockedJustNow.current = false;
      return;
    }

    if (isLocked) {
      // Locked component: allow tool interactions (e.g. scalpel on onion)
      if (options.onInteraction) options.onInteraction(e);
      return;
    }

    if (isHeld) {
      // Drop it
      if (options.onDrop) options.onDrop(e);
      else setHeldTool(null);
    } else {
      // Check if we're currently holding another tool
      const activeTool = useStore.getState().heldTool;
      if (activeTool && activeTool !== id) {
        // We're holding something else, so this is an interaction attempt, not a pickup
        if (options.onInteraction) options.onInteraction(e);
        return;
      }

      // Pick it up
      if (options.onPickup) options.onPickup(e);
      else setHeldTool(id);
    }
  };

  // ── RIGHT CLICK → TOGGLE LOCK ────────────────────────────────────────────
  const handleContextMenu = (e) => {
    // R3F ThreeEvent: use nativeEvent for DOM-level prevention
    if (e.nativeEvent && typeof e.nativeEvent.preventDefault === 'function') {
      e.nativeEvent.preventDefault();
    }
    e.stopPropagation();

    lockedJustNow.current = true;
    setTimeout(() => { lockedJustNow.current = false; }, 300);

    // If currently held and we right-click, drop first then lock
    if (isHeld) {
      if (options.onDrop) options.onDrop(e);
      else setHeldTool(null);
    }

    // Toggle: locked → free, free → locked
    toggleComponentLock(id);
  };

  return {
    onPointerDown: handlePointerDown,
    onContextMenu: handleContextMenu,
    isLocked,
  };
}
