import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface Props {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string,
    options ?: { value: string; label: string }[]
}

/**
 * Lightweight filter input for selecting entity options.
 * @param value Current selected value.
 * @param onChange Callback fired with the updated value.
 * @param options Array of options to display in the filter dropdown.
 * @param [placeholder="Select"] Optional input placeholder.
 * @example
 * ```tsx
 * <EntityFilter value={selectedValue} onChange={setSelectedValue} placeholder="Select an option" options={[
 *   { value: "option1", label: "Option 1" },
 *   { value: "option2", label: "Option 2" },
 *   { value: "option3", label: "Option 3" },
 * ]} />
 * ```
 */
export const EntityFilter = ({
    value,
    onChange,
    placeholder = "Select an option",
    options = [
        { value: "option1", label: "Option 1" },
        { value: "option2", label: "Option 2" },
        { value: "option3", label: "Option 3" },
    ]
}: Props) => {
    return (
        <Select onValueChange={onChange} defaultValue={value}>
            <SelectTrigger className="w-45">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}
