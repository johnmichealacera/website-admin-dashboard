'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Palette, Check } from 'lucide-react'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
  className?: string
}

// Preset color options
const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
  '#1F2937', // Dark Gray
  '#000000', // Black
]

export function ColorPicker({ value, onChange, label, className = '' }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customColor, setCustomColor] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setCustomColor(value)
  }, [value])

  const handleColorSelect = (color: string) => {
    onChange(color)
    setCustomColor(color)
    setIsOpen(false)
  }

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    setCustomColor(newColor)
    onChange(newColor)
  }

  const isValidHex = (color: string) => {
    return /^#[0-9A-F]{6}$/i.test(color)
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Label>{label}</Label>}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full h-10 justify-start gap-2"
            onClick={() => setIsOpen(true)}
          >
            <div
              className="w-4 h-4 rounded border border-gray-300"
              style={{ backgroundColor: isValidHex(value) ? value : '#000000' }}
            />
            <span className="font-mono text-sm">{value}</span>
            <Palette className="w-4 h-4 ml-auto" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-4" align="start">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Preset Colors</Label>
              <div className="grid grid-cols-6 gap-2 mt-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    className="w-8 h-8 rounded border border-gray-300 hover:scale-110 transition-transform relative"
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorSelect(color)}
                    title={color}
                  >
                    {value === color && (
                      <Check className="w-4 h-4 text-white absolute inset-0 m-auto drop-shadow-sm" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Custom Color</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  ref={inputRef}
                  value={customColor}
                  onChange={handleCustomColorChange}
                  placeholder="#000000"
                  className="font-mono text-sm"
                  maxLength={7}
                />
                <input
                  type="color"
                  value={isValidHex(customColor) ? customColor : '#000000'}
                  onChange={(e) => {
                    const newColor = e.target.value.toUpperCase()
                    setCustomColor(newColor)
                    onChange(newColor)
                  }}
                  className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                  title="Choose color"
                />
              </div>
              {!isValidHex(customColor) && customColor && (
                <p className="text-xs text-red-500 mt-1">
                  Please enter a valid hex color (e.g., #FF0000)
                </p>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
} 