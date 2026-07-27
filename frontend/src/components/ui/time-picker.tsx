import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { cn } from '@/utils/twMerge'

type TimePickerProps = {
  value: string
  onValueChange: (value: string) => void
  ariaLabel: string
  className?: string
  disabled?: boolean
}

const hours = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'))
const minutes = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, '0'))

function splitTime(value: string) {
  const [hour = '00', minute = '00'] = value.split(':')
  return { hour: hours.includes(hour) ? hour : '00', minute: minutes.includes(minute) ? minute : '00' }
}

export function TimePicker({ value, onValueChange, ariaLabel, className, disabled = false }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const popupId = useId()
  const { hour, minute } = splitTime(value)

  useEffect(() => {
    function closeWhenClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('mousedown', closeWhenClickOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeWhenClickOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  function selectTime(nextHour: string, nextMinute: string) {
    onValueChange(`${nextHour}:${nextMinute}`)
  }

  return <div ref={containerRef} className={cn('admin-time-picker', className)}>
    <button type="button" className="admin-time-picker-trigger" aria-label={ariaLabel} aria-haspopup="dialog" aria-expanded={isOpen} aria-controls={popupId} disabled={disabled} onClick={() => setIsOpen((open) => !open)}>
      <span>{hour}:{minute}</span><ChevronDown size={18} aria-hidden="true" />
    </button>
    {isOpen && <div id={popupId} className="admin-time-picker-popover" role="dialog" aria-label={ariaLabel}>
      <div className="admin-time-picker-heading"><span>เลือกเวลา</span><button type="button" aria-label="ปิดตัวเลือกเวลา" onClick={() => setIsOpen(false)}><ChevronRight size={17} aria-hidden="true" /></button></div>
      <div className="admin-time-picker-columns">
        <div className="admin-time-picker-column" aria-label="ชั่วโมง"><strong>ชั่วโมง</strong><div>{hours.map((item) => <button key={item} type="button" className={item === hour ? 'is-selected' : ''} aria-pressed={item === hour} onClick={() => selectTime(item, minute)}>{item}</button>)}</div></div>
        <div className="admin-time-picker-column" aria-label="นาที"><strong>นาที</strong><div>{minutes.map((item) => <button key={item} type="button" className={item === minute ? 'is-selected' : ''} aria-pressed={item === minute} onClick={() => selectTime(hour, item)}>{item}</button>)}</div></div>
      </div>
      <button type="button" className="admin-time-picker-done" onClick={() => setIsOpen(false)}><ChevronLeft size={16} aria-hidden="true" />เสร็จสิ้น</button>
    </div>}
  </div>
}
