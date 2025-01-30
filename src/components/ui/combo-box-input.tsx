"use client"
import * as React from "react"
import { Check, Plus, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function ComboboxInput({ 
  values, 
  defaultValue="", 
  placeholder="",
  onValueChange
}: { 
  values: string[], 
  defaultValue?: string;
  placeholder?: string;
  onValueChange?: (value: string) => void;
}) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState(defaultValue)
  const [inputValue, setInputValue] = React.useState("")

  const handleSelect = (currentValue: string) => {
    setValue(currentValue === value ? "" : currentValue)
    setOpen(false)
    onValueChange?.(currentValue === value ? "" : currentValue)
  }

  const filteredValues = React.useMemo(() => {
    return values.filter((v) =>
      v.toLowerCase().includes(inputValue.toLowerCase())
    )
  }, [values, inputValue])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value || placeholder}
          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput 
            placeholder={placeholder}
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            {filteredValues.length === 0 && inputValue && (
              <CommandGroup>
                <CommandItem
                  onSelect={() => handleSelect(inputValue)}
                  className="flex items-center gap-2 text-sm"
                >
                  <Plus className="h-4 w-4" />
                  Create "{inputValue}"
                </CommandItem>
              </CommandGroup>
            )}
            <CommandGroup>
              {filteredValues.map((v) => (
                <CommandItem
                  key={v}
                  value={v}
                  onSelect={() => handleSelect(v)}
                  className="flex items-center justify-between"
                >
                  {v}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === v ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default ComboboxInput