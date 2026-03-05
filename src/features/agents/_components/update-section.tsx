"use client"

import { useState, useCallback } from 'react'
import {
    CheckCircle2Icon,
    InfoIcon,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

const avatarEmoji = ['🤖', '👩‍💻', '🧠', '🚀', '💡', '📊', '🎯', '🔍', '⚡', '🌟']

const aiModels = [
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    { value: 'claude-3-opus', label: 'Claude 3 Opus' },
    { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
]

const NAME_MAX = 50
const DESC_MAX = 250
const PROMPT_MAX = 4000

export const UpdateSection = () => {
    const [selectedAvatar, setSelectedAvatar] = useState('🤖')
    const [agentName, setAgentName] = useState('Sales Assistant')
    const [aiModel, setAiModel] = useState('gpt-4o')
    const [description, setDescription] = useState(
        'Handles inbound sales queries, qualifies leads, and books product demos automatically for your team. Optimized for high conversion and seamless handoff to human reps.'
    )
    const [systemPrompt, setSystemPrompt] = useState(
        `You are a professional sales assistant for AgentForge. Your role is to:

• Greet visitors warmly and understand their needs
• Qualify leads by asking about team size, budget, and timeline
• Book demos — never fabricate pricing or features
• Escalate complex technical queries to engineering

Tone: Friendly, confident, and concise.`
    )
    const [temperature, setTemperature] = useState([0.4])
    const [maxTokens, setMaxTokens] = useState('1024')
    const [agentActive, setAgentActive] = useState(true)
    const [fileUploads, setFileUploads] = useState(true)
    const [webSearch, setWebSearch] = useState(true)

    const handleDiscard = useCallback(() => {
        setSelectedAvatar('🤖')
        setAgentName('Sales Assistant')
        setAiModel('gpt-4o')
        setDescription(
            'Handles inbound sales queries, qualifies leads, and books product demos automatically for your team. Optimized for high conversion and seamless handoff to human reps.'
        )
        setSystemPrompt(
            `You are a professional sales assistant for AgentForge. Your role is to:

• Greet visitors warmly and understand their needs
• Qualify leads by asking about team size, budget, and timeline
• Book demos — never fabricate pricing or features
• Escalate complex technical queries to engineering

Tone: Friendly, confident, and concise.`
        )
        setTemperature([0.4])
        setMaxTokens('1024')
        setAgentActive(true)
        setFileUploads(true)
        setWebSearch(true)
    }, [])

    return (
        <section className="flex flex-col gap-8 border p-4 rounded-md">
            {/* Header */}
            <div>
                <h2 className="text-lg font-bold">Update Configuration</h2>
                <p className="text-sm text-muted-foreground">
                    Changes apply to new conversations immediately after saving.
                </p>
            </div>

            {/* Agent Avatar */}
            <div className="flex flex-col gap-3">
                <Label className="text-sm font-semibold">Agent Avatar</Label>
                <div className="flex items-center gap-3">
                    {avatarEmoji.map((emoji) => {
                        const isSelected = selectedAvatar === emoji
                        return (
                            <button
                                key={emoji}
                                type="button"
                                onClick={() => setSelectedAvatar(emoji)}
                                className={`size-11 rounded-xl flex items-center justify-center transition-all text-xl bg-muted/50 ${
                                    isSelected
                                        ? 'ring-2 ring-primary ring-offset-2'
                                        : 'hover:ring-2 hover:ring-muted-foreground/30 hover:ring-offset-1'
                                }`}
                            >
                                {emoji}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Agent Name + AI Model */}
            <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                    <Label className="text-sm font-semibold">
                        Agent Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={agentName}
                        onChange={(e) => {
                            if (e.target.value.length <= NAME_MAX) setAgentName(e.target.value)
                        }}
                        placeholder="Enter agent name"
                        className="h-11"
                    />
                    <span className="text-xs text-muted-foreground text-right">
                        {agentName.length} / {NAME_MAX}
                    </span>
                </div>

                <div className="flex flex-col gap-2">
                    <Label className="text-sm font-semibold">AI Model</Label>
                    <Select value={aiModel} onValueChange={setAiModel}>
                        <SelectTrigger className="h-11 w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {aiModels.map((model) => (
                                <SelectItem key={model.value} value={model.value}>
                                    {model.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
                <Label className="text-sm font-semibold">Description</Label>
                <Textarea
                    value={description}
                    onChange={(e) => {
                        if (e.target.value.length <= DESC_MAX) setDescription(e.target.value)
                    }}
                    placeholder="Describe what this agent does..."
                    className="min-h-24 resize-y"
                />
                <span className="text-xs text-muted-foreground text-right">
                    {description.length} / {DESC_MAX}
                </span>
            </div>

            {/* System Prompt */}
            <div className="flex flex-col gap-2">
                <Label className="text-sm font-semibold">System Prompt</Label>
                <Textarea
                    value={systemPrompt}
                    onChange={(e) => {
                        if (e.target.value.length <= PROMPT_MAX) setSystemPrompt(e.target.value)
                    }}
                    placeholder="Define the agent's behavior, tone, and rules..."
                    className="min-h-44 resize-y font-mono text-sm"
                />
                <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <InfoIcon className="size-3" />
                        Be specific about tone, rules, and what the agent should never do.
                    </p>
                    <span className="text-xs text-muted-foreground">
                        {systemPrompt.length} / {PROMPT_MAX}
                    </span>
                </div>
            </div>

            {/* Temperature */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <div>
                        <Label className="text-sm font-semibold">Temperature</Label>
                        <span className="text-sm text-muted-foreground ml-2">— precision vs. creativity</span>
                    </div>
                    <span className="text-sm font-mono font-bold text-primary">{temperature[0].toFixed(1)}</span>
                </div>
                <Slider
                    value={temperature}
                    onValueChange={setTemperature}
                    min={0}
                    max={1}
                    step={0.1}
                    className="w-full"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <span className="size-2 rounded-full bg-blue-500" />
                        Precise
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="size-2 rounded-full bg-orange-500" />
                        Creative
                    </span>
                </div>
            </div>

            {/* Max Tokens + Status */}
            <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                    <Label className="text-sm font-semibold">Max Tokens</Label>
                    <Input
                        type="number"
                        value={maxTokens}
                        onChange={(e) => setMaxTokens(e.target.value)}
                        min={100}
                        max={8000}
                        className="h-11"
                    />
                    <span className="text-xs text-muted-foreground">Range: 100–8,000</span>
                </div>

                <div className="flex flex-col gap-4">
                    <Label className="text-sm font-semibold">Status</Label>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Agent Active</p>
                            <p className="text-xs text-muted-foreground">Pause to stop accepting new conversations</p>
                        </div>
                        <Switch checked={agentActive} onCheckedChange={setAgentActive} />
                    </div>
                </div>
            </div>

            {/* Toggle Settings */}
            <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold">File Uploads Enabled</p>
                        <p className="text-xs text-muted-foreground">
                            Show Files tab and allow users to upload to knowledge base
                        </p>
                    </div>
                    <Switch checked={fileUploads} onCheckedChange={setFileUploads} />
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold">Web Search Enabled</p>
                        <p className="text-xs text-muted-foreground">
                            Allow agent to search for real-time information
                        </p>
                    </div>
                    <Switch checked={webSearch} onCheckedChange={setWebSearch} />
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                    Last saved: <span className="font-mono">Mar 02, 2026 · 3:14 PM</span>
                </p>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={handleDiscard}>
                        Discard
                    </Button>
                    <Button className="gap-2">
                        <CheckCircle2Icon className="size-4" />
                        Save Changes
                    </Button>
                </div>
            </div>
        </section>
    )
}
