import {create} from "zustand";

/**
 * Interface for the Agent Form state management.
 *
 * @param {boolean} isOpen - Whether the agent form is currently open.
 * @param {() => void} openForm - Function to open the agent form.
 * @param {() => void} closeForm - Function to close the agent form.
 */
interface AgentFormState {
    isOpen: boolean;
    openForm: () => void;
    closeForm: () => void;
}

/**
 * Zustand store hook for managing the Agent Form open/close state.
 *
 * @returns {AgentFormState} The agent form state and actions.
 *
 * @example
 * ```tsx
 * import { useAgentForm } from "@/features/dashboard/zustand-state/use-agent-form";
 *
 * function AgentFormToggle() {
 *   const { isOpen, openForm, closeForm } = useAgentForm();
 *
 *   return (
 *     <div>
 *       <p>Form is {isOpen ? "open" : "closed"}</p>
 *       <button onClick={openForm}>Open</button>
 *       <button onClick={closeForm}>Close</button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useAgentForm = create<AgentFormState>((set) => ({
    isOpen: false,
    openForm: () => set({ isOpen: true }),
    closeForm: () => set({ isOpen: false }),
}));