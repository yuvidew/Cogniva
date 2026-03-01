"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BadgeCheckIcon, ChartAreaIcon, type LucideIcon, MessageCircleIcon, ZapIcon } from "lucide-react";

const checkTheLabel = (label: string, value: number): {
    icon: LucideIcon;
    buttonVariant: string;
    title: string;
    paragraph: React.ReactElement;
} => {
    switch (label) {
        case "total_agents":
            return {
                icon: ZapIcon,
                buttonVariant: "light-blue",
                title: "Total Agents",
                paragraph: (
                    <p className=" text-muted-foreground text-sm">
                        <span className=" text-green-700">{value}</span>{" "}
                        this month
                    </p>
                ),
            };
        case "total_messages":
            return {
                icon: MessageCircleIcon,
                buttonVariant: "light-yellow",
                title: "Total Messages",
                paragraph: (
                    <p className=" text-muted-foreground text-sm">
                        of {value} limit
                    </p>
                ),
            };
        case "active_agents":
            return {
                icon: ChartAreaIcon,
                buttonVariant: "light-green",
                title: "Active Agents",
                paragraph: (
                    <p className=" text-muted-foreground text-sm">
                        Resets in <span className=" font-bold">{value} days{" "}</span>
                    </p>
                ),
            };
        case "inactive_agents":
            return {
                icon: BadgeCheckIcon,
                buttonVariant: "light-violet",
                title: "Inactive Agents",
                paragraph: (
                    <p className=" text-sm text-primary">
                        Upgrade
                    </p>
                ),
            };
        default:
            return {
                icon: ZapIcon,
                buttonVariant: "light-blue",
                title: "Unknown",
                paragraph: (
                    <p className=" text-muted-foreground text-xs">Unknown</p>
                ),
            };
    }
};

const checkButtonVariant = (label: string): string => {
    switch (label) {
        case "total_agents":
            return "bg-blue-500";
        case "total_messages":
            return "bg-yellow-500";
        case "active_agents":
            return "bg-green-500";
        case "inactive_agents":
            return "bg-violet-500";
        default:
            return "bg-blue-500";
    }
};

type CheckTheLabelType = {
    label: string;
    value: number;
};

const OverViewCard = ({ label, value }: CheckTheLabelType) => {
    const { icon: Icon, buttonVariant, title, paragraph } = checkTheLabel(label, value);

    return (
        <Card className="group shadow-none px-2 py-4 gap-1 relative overflow-hidden hover:shadow-lg transition-shadow">
            <div className={cn(" w-[90%] h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 \ absolute top-0 left-1/2 -translate-x-1/2 rounded-b-full", checkButtonVariant(label))}/>
            <CardHeader className="px-2 mb-3">
                <Button size="icon-sm" variant={buttonVariant as "light-blue"}>
                    <Icon />
                </Button>
            </CardHeader>
            <CardContent className="px-2 py-0">
                <p className=" font-semibold text-muted-foreground">{title}</p>
            </CardContent>
            <CardFooter className="px-2 mt-0">
                <div className="flex flex-col gap-1">
                    <h1 className=" text-3xl font-bold">{value}</h1>
                    {paragraph}
                </div>
            </CardFooter>
        </Card>
    );
};

export const OverviewSection = () => {
    return (
        <section className=" grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-5">
            <OverViewCard label="total_agents" value={0} />
            <OverViewCard label="total_messages" value={0} />
            <OverViewCard label="active_agents" value={0} />
            <OverViewCard label="inactive_agents" value={0} />
        </section>
    );
};
