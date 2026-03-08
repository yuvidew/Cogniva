"use client"

import { useState, useCallback, useEffect } from 'react'
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
import { useSuspenseAgent, useUpdateAgent } from '../hooks/use-agents'
import { formatDateWithMonth } from '@/lib/utils'
import { AgentModelProvider } from '@/generated/prisma/enums'
import { Spinner } from '@/components/ui/spinner'

/** Emoji options the user can pick as the agent's avatar */
const avatarEmoji = ['🤖', '👩‍💻', '🧠', '🚀', '💡', '📊', '🎯', '🔍', '⚡', '🌟']

/**
 * `aiModels` — display list for the AI model selector.
 * Values must match the `AgentModelProvider` enum in the Prisma schema.
 */
const aiModels: { value: AgentModelProvider; label: string }[] = [
    { value: AgentModelProvider.google, label: 'Gemini (Google)' },
    // { value: AgentModelProvider.openai, label: 'OpenAI' },
    // { value: AgentModelProvider.anthropic, label: 'Anthropic (Claude)' },
]

/** Max character limits matching the Prisma schema VarChar constraints */
const NAME_MAX = 100
const DESC_MAX = 300
const PROMPT_MAX = 4000

/**
 * UpdateSection
 *
 * Settings form that loads the current agent's configuration from the
 * `getOne` tRPC procedure and allows the user to edit and persist changes
 * via the `update` tRPC procedure.
 *
 * - All fields are initialised from the real agent data on mount.
 * - "Save Changes" calls `useUpdateAgent` and shows a success/error toast.
 * - "Discard" resets every field back to the last fetched agent values.
 * - Uses `useSuspenseAgent` so data is always available (parent has Suspense).
 */
export const UpdateSection = () => {
    /**
     * `agent` — real agent data fetched via `useSuspenseAgent`.
     * Guaranteed to be non-null because of the Suspense boundary higher up.
     */
    const { data: agent } = useSuspenseAgent()

    /**
     * `updateAgent` — mutation hook that persists form changes to the DB.
     * `updateAgent.isPending` disables the Save button while in-flight.
     */
    const updateAgent = useUpdateAgent()

    // ── Form state ─────────────────────────────────────────────────────────

    /** Currently selected emoji avatar */
    const [selectedAvatar, setSelectedAvatar] = useState(agent?.avatar ?? '🤖')

    /** Agent display name — max `NAME_MAX` chars */
    const [agentName, setAgentName] = useState(agent?.name ?? '')

    /** Selected AI model provider — must be an `AgentModelProvider` enum value */
    const [aiModel, setAiModel] = useState<AgentModelProvider>(
        (agent?.model as AgentModelProvider) ?? AgentModelProvider.google
    )

    /** Short description of the agent — max `DESC_MAX` chars */
    const [description, setDescription] = useState(agent?.description ?? '')

    /** System prompt that defines the agent's behaviour — max `PROMPT_MAX` chars */
    const [systemPrompt, setSystemPrompt] = useState(agent?.systemPrompt ?? '')

    /** Creativity/precision slider value, stored as a single-element array for the Slider component */
    const [temperature, setTemperature] = useState<number[]>([agent?.temperature ?? 0.4])

    /** Whether the agent is accepting new conversations */
    const [agentActive, setAgentActive] = useState(agent?.isActive ?? true)

    /** Whether the Files tab is shown and users can upload to the knowledge base */
    const [fileUploads, setFileUploads] = useState(agent?.fileUploadEnabled ?? false)

    /** Whether the agent is allowed to run web searches */
    const [webSearch, setWebSearch] = useState(agent?.webSearchEnabled ?? false)

    /**
     * Sync effect — re-initialises all form state if the fetched agent data
     * changes (e.g. after a successful save invalidates the query and brings
     * back fresh data from the server).
     */
    useEffect(() => {
        if (!agent) return
        setSelectedAvatar(agent.avatar ?? '🤖')
        setAgentName(agent.name)
        setAiModel(agent.model as AgentModelProvider)
        setDescription(agent.description)
        setSystemPrompt(agent.systemPrompt)
        setTemperature([agent.temperature])
        setAgentActive(agent.isActive)
        setFileUploads(agent.fileUploadEnabled)
        setWebSearch(agent.webSearchEnabled)
    }, [agent])

    // ── Handlers ───────────────────────────────────────────────────────────

    /**
     * `handleDiscard` — resets every form field back to the current values
     * from the fetched agent data, discarding any unsaved changes.
     */
    const handleDiscard = useCallback(() => {
        if (!agent) return
        setSelectedAvatar(agent.avatar ?? '🤖')
        setAgentName(agent.name)
        setAiModel(agent.model as AgentModelProvider)
        setDescription(agent.description)
        setSystemPrompt(agent.systemPrompt)
        setTemperature([agent.temperature])
        setAgentActive(agent.isActive)
        setFileUploads(agent.fileUploadEnabled)
        setWebSearch(agent.webSearchEnabled)
    }, [agent])

    /**
     * `handleSave` — collects the current form state and fires the `update`
     * mutation. The hook handles toast feedback and query invalidation.
     */
    const handleSave = useCallback(async () => {
        if (!agent) return
        await updateAgent.mutateAsync({
            id: agent.id,
            name: agentName,
            description,
            avatar: selectedAvatar,
            systemPrompt,
            model: aiModel,
            temperature: temperature[0],
            isActive: agentActive,
            fileUploadEnabled: fileUploads,
            webSearchEnabled: webSearch,
        })
    }, [agent, updateAgent, agentName, description, selectedAvatar, systemPrompt, aiModel, temperature, agentActive, fileUploads, webSearch])

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
                                className={`size-11 rounded-xl flex items-center justify-center transition-all text-xl bg-muted/50 ${isSelected
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
                    <Select value={aiModel} onValueChange={(v) => setAiModel(v as AgentModelProvider)}>
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

            {/* Status */}
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
                    Last saved:{' '}
                    <span className="font-mono">
                        {agent ? formatDateWithMonth(new Date(agent.updatedAt)) : '—'}
                    </span>
                </p>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={handleDiscard}
                        disabled={updateAgent.isPending}
                    >
                        Discard
                    </Button>
                    <Button
                        className="gap-2"
                        onClick={handleSave}
                        disabled={updateAgent.isPending || !agentName.trim() || !systemPrompt.trim()}
                    >
                        {updateAgent.isPending ?
                            <>
                                <Spinner />{" "}
                                Save Changes
                            </>
                            :
                            <>

                                <CheckCircle2Icon className="size-4" />
                                Save Changes
                            </>}
                    </Button>
                </div>
            </div>
        </section>
    )
}
