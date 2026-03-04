import { PlusIcon } from "lucide-react";
import { Card } from "../../../components/ui/card";

interface NewAgentCardProps {
    onOpenAgentForm: () => void;
}

export const NewAgentCard = ({ onOpenAgentForm }: NewAgentCardProps    ) => {
    return (
        <Card onClick={onOpenAgentForm} className="group shadow-none border-dashed border-2 border-muted-foreground flex items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-muted/30 transition-colors">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <div className="size-12 rounded-full border-2 border-dashed border-muted-foreground group-hover:border-primary flex items-center justify-center transition-colors">
                    <PlusIcon className="size-5 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all" />
                </div>
                <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">New Agent</span>
            </div>
        </Card>
    );
};