"use client";

import { cn } from "@/lib/utils";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { useAgentForm } from "../zustand-state/use-agent-form";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CpuIcon, MessageCircleIcon, PlusIcon, SettingsIcon, SparklesIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AgentModalSelectItem } from "./agent-modal-select-item";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useCreateAgent } from "@/features/common/hooks/use-agents";
import { Spinner } from "@/components/ui/spinner";

export const agentFormSchema = z.object({
    name: z
        .string()
        .min(3, "Agent name must be at least 3 characters")
        .max(100, "Agent name must be under 100 characters"),

    description: z
        .string()
        .min(10, "Description must be at least 10 characters")
        .max(300, "Description must be under 300 characters"),

    avatar: z.string().optional(),

    systemPrompt: z
        .string()
        .min(20, "System prompt must be at least 20 characters"),

    model: z.enum(["openai", "anthropic", "google"], {
        message: "Please select a model",
    }),

    temperature: z
        .number()
        .min(0, "Temperature must be between 0 and 1")
        .max(1, "Temperature must be between 0 and 1"),

    memoryEnabled: z.boolean(),

    webSearchEnabled: z.boolean(),

    fileUploadEnabled: z.boolean(),

    strictMode: z.boolean(),
});

const avatarEmoji = ["🤖", "👩‍💻", "🧠", "🚀", "💡", "📊", "🎯", "🔍", "⚡", "🌟"]

const promptTemplates = [
    {
        icon: "👩‍💼",
        label: "Sales",
        prompt: "You are a professional sales assistant. Help customers find the right products, answer pricing questions, and guide them through the purchase process. Be persuasive yet honest, and always prioritize the customer's needs.",
    },
    {
        icon: "🐱",
        label: "Support",
        prompt: "You are a friendly customer support agent. Help users troubleshoot issues, answer frequently asked questions, and escalate complex problems when needed. Always be patient, empathetic, and solution-oriented.",
    },
    {
        icon: "📝",
        label: "Content",
        prompt: "You are a creative content writer. Help users draft blog posts, social media captions, email newsletters, and marketing copy. Adapt your tone and style based on the target audience and platform.",
    },
    {
        icon: "🔍",
        label: "Research",
        prompt: "You are a thorough research assistant. Help users gather information, summarize findings, compare options, and provide well-structured analysis. Always cite sources when possible and present balanced viewpoints.",
    },
]

type AgentFormValue = z.infer<typeof agentFormSchema>

export const AgentForm = () => {
    const { isOpen, openForm, closeForm } = useAgentForm();

    const { mutate: createAgent, isPending } = useCreateAgent();

    const form = useForm<AgentFormValue>({
        resolver: zodResolver(agentFormSchema),
        defaultValues: {
            name: "",
            description: "",
            systemPrompt: "",
            model: "google",
            temperature: 0.7,
            memoryEnabled: false,
            webSearchEnabled: false,
            fileUploadEnabled: false,
            strictMode: false,
        },
    })

    const isEmpty = form.watch("name") === "" || form.watch("description") === "" || form.watch("systemPrompt") === "" || form.watch("temperature") === undefined || form.watch("memoryEnabled") === undefined || form.watch("webSearchEnabled") === undefined || form.watch("fileUploadEnabled") === undefined || form.watch("strictMode") === undefined;

    const onSubmit = (data: AgentFormValue) => {
        createAgent(data, {
            onSuccess: () => {
                form.reset();
                closeForm();
            },
        });
    };

    return (
        <Sheet
            open={isOpen}
            onOpenChange={(open) => open ? openForm() : closeForm()}
        >
            <SheetContent className="px-0 py-4 flex flex-col gap-6 overflow-hidden">
                <SheetHeader className="px-4 ">
                    <SheetTitle className=" text-xl">
                        Build your <span className=" text-primary">new agent</span>
                    </SheetTitle>
                    <SheetDescription>
                        Configure your AI agent's identity, model, and behavior in one place.
                    </SheetDescription>
                </SheetHeader>

                <Form {...form}>
                    <form className="flex-1 overflow-hidden flex flex-col gap-6 min-h-0" onSubmit={form.handleSubmit(onSubmit)}>
                        <ScrollArea className="h-0 flex-1 px-4">
                            <div className="flex flex-col gap-6 pb-5">
                                <Card className="p-4">
                                    <CardHeader className="p-0 border-b  py-3 pb-2!">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <Button variant={"light-blue"} size={"icon-xs"}>
                                                    <SparklesIcon />
                                                </Button>
                                                <CardTitle className=" font-normal uppercase">
                                                    Agent Identity
                                                </CardTitle>
                                            </div>

                                            <p className="text-sm text-muted-foreground">
                                                - Provide a clear and concise system prompt to guide the AI's behavior.
                                            </p>
                                        </div>

                                    </CardHeader>
                                    <div className="flex flex-col gap-6">
                                        {/* Agent name field */}
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col gap-4">
                                                    <FormLabel className=" font-normal">
                                                        Agent Name
                                                        <span className=" text-red-500 ">
                                                            *
                                                        </span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="E.g. Sales Assistant" {...field} />
                                                    </FormControl>
                                                    <div className={cn("flex items-center justify-end text-xs", field.value.length > 100 ? "text-red-500 font-medium" : "text-muted-foreground")}>
                                                        {field.value.length} / 100
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Agent description field */}

                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col gap-4">
                                                    <FormLabel className=" font-normal">
                                                        Agent Description
                                                        <span className=" text-red-500 ">
                                                            *
                                                        </span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            {...field}
                                                            placeholder="E.g. An AI agent that helps customers with product recommendations and support."
                                                            className=" resize-none h-32"
                                                        />
                                                    </FormControl>
                                                    <div className={cn("flex items-center justify-end text-xs", field.value.length > 300 ? "text-red-500 font-medium" : "text-muted-foreground")}>
                                                        {field.value.length} / 300
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Agent avatar field */}
                                        <FormField
                                            control={form.control}
                                            name="avatar"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col gap-4">
                                                    <FormLabel className=" font-normal">
                                                        Agent Avatar
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="flex flex-wrap gap-2">
                                                            {avatarEmoji.map((emoji) => (
                                                                <Button
                                                                    key={emoji}
                                                                    type="button"
                                                                    size={"icon"}
                                                                    variant={field.value === emoji ? "default" : "outline"}
                                                                    onClick={() => field.onChange(emoji)}
                                                                >
                                                                    {emoji}
                                                                </Button>
                                                            ))}
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </Card>

                                {/* Agent Modal */}

                                <Card className="p-4">
                                    <CardHeader className="p-0 border-b  py-3 pb-2!">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <Button variant={"light-green"} size={"icon-xs"}>
                                                    <CpuIcon />
                                                </Button>
                                                <CardTitle className=" font-normal uppercase">
                                                    Agent Modal
                                                </CardTitle>
                                            </div>

                                            <p className=" text-muted-foreground text-sm"> More models coming soon — stay tuned! </p>
                                        </div>

                                    </CardHeader>
                                    <FormField
                                        control={form.control}
                                        name="model"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col gap-4 mt-4">
                                                <FormLabel className=" font-normal">
                                                    Select Model
                                                    <span className=" text-red-500 ">
                                                        *
                                                    </span>
                                                </FormLabel>
                                                <FormControl>
                                                    <AgentModalSelectItem
                                                        name={field.value}
                                                        provider="Google Gemini"
                                                        category="Multimodal"
                                                        tier="Pro"
                                                        isActive
                                                        isSelected={field.value === "google"}
                                                        onClick={() => field.onChange("google")}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </Card>

                                {/* Agent system Prompt */}
                                <Card className="p-4">
                                    <CardHeader className="p-0 border-b  py-3 pb-2!">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <Button variant={"light-yellow"} size={"icon-xs"}>
                                                    <MessageCircleIcon />
                                                </Button>
                                                <CardTitle className=" font-normal uppercase">
                                                    System Prompt
                                                </CardTitle>
                                            </div>

                                            <p className="text-sm text-muted-foreground">
                                                - Provide a clear and concise system prompt to guide the AI's behavior.
                                            </p>
                                        </div>
                                    </CardHeader>
                                    <div className="flex flex-col gap-6">
                                        <FormField
                                            control={form.control}
                                            name="systemPrompt"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col gap-4 mt-4">
                                                    <FormLabel className=" font-normal">
                                                        System Prompt
                                                        <span className=" text-red-500 ">
                                                            *
                                                        </span>
                                                    </FormLabel>

                                                    <FormControl>
                                                        <Textarea
                                                            {...field}
                                                            placeholder="E.g. You are a helpful assistant for an e-commerce website. Always provide concise and accurate answers to customer inquiries, and recommend products based on customer preferences."
                                                            className=" resize-none h-52"
                                                        />
                                                    </FormControl>
                                                    <div className="flex flex-col gap-3">
                                                        <p className="text-sm text-muted-foreground">Quick Templates</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {promptTemplates.map((template) => (
                                                                <Button
                                                                    key={template.label}
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="gap-1.5"
                                                                    onClick={() => field.onChange(template.prompt)}
                                                                >
                                                                    <span>{template.icon}</span>
                                                                    {template.label}
                                                                </Button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </Card>

                                {/* Agent Advance setting  */}
                                <Card className="p-4">
                                    <CardHeader className="p-0 border-b py-3 pb-2!">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <Button variant={"light-violet"} size={"icon-xs"}>
                                                    <SettingsIcon />
                                                </Button>
                                                <CardTitle className="font-normal uppercase">
                                                    Advanced Settings
                                                </CardTitle>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <div className="flex flex-col gap-6 mt-4">
                                        {/* Temperature */}
                                        <FormField
                                            control={form.control}
                                            name="temperature"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col gap-3">
                                                    <div className="flex items-center justify-between">
                                                        <FormLabel className="font-normal">
                                                            Temperature
                                                            <span className="text-muted-foreground ml-1">— controls creativity vs. precision</span>
                                                        </FormLabel>
                                                        <span className="text-primary font-mono font-semibold text-sm">
                                                            {field.value.toFixed(1)}
                                                        </span>
                                                    </div>
                                                    <FormControl>
                                                        <Slider
                                                            min={0}
                                                            max={1}
                                                            step={0.1}
                                                            value={[field.value]}
                                                            onValueChange={(value) => field.onChange(value[0])}
                                                        />
                                                    </FormControl>
                                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                        <span>🎯 Precise</span>
                                                        <span>Balanced</span>
                                                        <span>🎨 Creative</span>
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Capabilities */}
                                        <div className="flex flex-col gap-1">
                                            <p className="text-sm font-medium">Capabilities</p>
                                        </div>

                                        {/* Web Search */}
                                        <FormField
                                            control={form.control}
                                            name="webSearchEnabled"
                                            render={({ field }) => (
                                                <FormItem className="flex items-center justify-between border-b pb-4">
                                                    <div className="flex flex-col gap-0.5">
                                                        <FormLabel className="font-medium">Web Search</FormLabel>
                                                        <p className="text-sm text-muted-foreground">Allow agent to search the internet for real-time info</p>
                                                    </div>
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />

                                        {/* Memory */}
                                        <FormField
                                            control={form.control}
                                            name="memoryEnabled"
                                            render={({ field }) => (
                                                <FormItem className="flex items-center justify-between border-b pb-4">
                                                    <div className="flex flex-col gap-0.5">
                                                        <FormLabel className="font-medium">Memory</FormLabel>
                                                        <p className="text-sm text-muted-foreground">Remember context across multiple sessions</p>
                                                    </div>
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />

                                        {/* File Uploads */}
                                        <FormField
                                            control={form.control}
                                            name="fileUploadEnabled"
                                            render={({ field }) => (
                                                <FormItem className="flex items-center justify-between border-b pb-4">
                                                    <div className="flex flex-col gap-0.5">
                                                        <FormLabel className="font-medium">File Uploads</FormLabel>
                                                        <p className="text-sm text-muted-foreground">Let users attach documents and images in chat</p>
                                                    </div>
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />

                                        {/* Strict Mode */}
                                        <FormField
                                            control={form.control}
                                            name="strictMode"
                                            render={({ field }) => (
                                                <FormItem className="flex items-center justify-between">
                                                    <div className="flex flex-col gap-0.5">
                                                        <FormLabel className="font-medium">Strict Mode</FormLabel>
                                                        <p className="text-sm text-muted-foreground">Reject off-topic messages outside agent scope</p>
                                                    </div>
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </Card>
                            </div>
                            {/* Agent Identity */}
                        </ScrollArea>

                        {/* Cancel Button and Create Button */}
                        <SheetFooter>
                            <div className="flex items-center justify-end gap-3 px-4">
                                <SheetClose asChild>
                                    <Button type="button" variant="outline" onClick={() => form.reset()}>
                                        Cancel
                                    </Button>
                                </SheetClose>
                                <Button type="submit" disabled={isEmpty || isPending}>
                                    {isPending ? (
                                        <>
                                            <Spinner />
                                            Creating...
                                        </>
                                    ) : (

                                        <>
                                            <PlusIcon /> Create Agent
                                        </>
                                    )}
                                </Button>
                            </div>
                        </SheetFooter>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    )
}
