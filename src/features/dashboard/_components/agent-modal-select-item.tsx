import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

/**
 * Props for the AgentModalSelectItem component.
 *
 * @param {string} name - The display name of the model (e.g. "GPT-4o").
 * @param {string} provider - The provider of the model (e.g. "OpenAI").
 * @param {string} category - The category or capability (e.g. "Multimodal").
 * @param {"Free" | "Pro" | "Enterprise"} [tier="Free"] - The pricing tier badge to display.
 * @param {boolean} [isActive=true] - Whether the model is currently active (shows a green dot).
 * @param {boolean} [isSelected=false] - Whether this item is currently selected.
 * @param {() => void} [onClick] - Callback fired when the card is clicked.
 */
interface AgentModalSelectItemProps {
    name: string;
    provider: string;
    category: string;
    tier?: "Free" | "Pro" | "Enterprise";
    isActive?: boolean;
    isSelected?: boolean;
    onClick?: () => void;
}

/**
 * A selectable card component for displaying an AI model option
 * with status indicator, provider info, and tier badge.
 *
 * @param {AgentModalSelectItemProps} props - The component props.
 * @returns {JSX.Element} A clickable model selection card.
 *
 * @example
 * ```tsx
 * import { AgentModalSelectItem } from "@/features/dashboard/_components/agent-modal-select-item";
 *
 * function ModelSelector() {
 *   const [selected, setSelected] = useState("gpt-4o");
 *
 *   return (
 *     <div className="grid grid-cols-2 gap-3">
 *       <AgentModalSelectItem
 *         name="GPT-4o"
 *         provider="OpenAI"
 *         category="Multimodal"
 *         tier="Pro"
 *         isActive
 *         isSelected={selected === "gpt-4o"}
 *         onClick={() => setSelected("gpt-4o")}
 *       />
 *       <AgentModalSelectItem
 *         name="Claude 3.5 Sonnet"
 *         provider="Anthropic"
 *         category="Text"
 *         tier="Free"
 *         isActive
 *         isSelected={selected === "claude-3.5"}
 *         onClick={() => setSelected("claude-3.5")}
 *       />
 *     </div>
 *   );
 * }
 * ```
 */

export const AgentModalSelectItem = ({
    name,
    provider,
    category,
    tier = "Free",
    isActive = true,
    isSelected = false,
    onClick,
}: AgentModalSelectItemProps) => {
    return (
        <div
            role="button"
            onClick={onClick}
            className={cn(
                "flex flex-col gap-2 rounded-lg border p-3 cursor-pointer transition-all hover:shadow-sm",
                isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
            )}
        >
            <div className="flex items-center gap-2">
                <span
                    className={cn(
                        "size-2.5 rounded-full",
                        isActive ? "bg-green-500" : "bg-muted-foreground"
                    )}
                />
            </div>

            <div className="flex flex-col gap-0.5">
                <p className="text-sm font-semibold leading-none">{name}</p>
                <p className="text-xs text-muted-foreground">
                    {provider} · {category}
                </p>
            </div>

            <div>
                <Badge
                    variant="secondary"
                    className={cn(
                        "text-[10px] px-1.5 py-0",
                        tier === "Pro" && "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
                        tier === "Enterprise" && "bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400"
                    )}
                >
                    {tier}
                </Badge>
            </div>
        </div>
    );
};
