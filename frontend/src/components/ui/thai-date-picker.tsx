import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/utils/twMerge'

type ThaiDatePickerMode = 'date' | 'month'

type ThaiDatePickerProps = {
  value: string
  onValueChange: (value: string) => void
  mode?: ThaiDatePickerMode
  ariaLabel: string
  className?: string
  disabled?: boolean
}

const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
const thaiWeekdays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']

function parseValue(value: string, mode: ThaiDatePickerMode) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year || new Date().getFullYear(), (month || 1) - 1, mode === 'date' ? day || 1 : 1)
}

function toIsoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function toIsoMonth(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function formatDisplay(value: string, mode: ThaiDatePickerMode) {
  const date = parseValue(value, mode)
  return mode === 'date' ? `${date.getDate()} ${thaiMonths[date.getMonth()]} ${date.getFullYear() + 543}` : `${thaiMonths[date.getMonth()]} ${date.getFullYear() + 543}`
}

export function ThaiDatePicker({ value, onValueChange, mode = 'date', ariaLabel, className, disabled = false }: ThaiDatePickerProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [viewDate, setViewDate] = useState(() => parseValue(value, mode))
  const selectedDate = useMemo(() => parseValue(value, mode), [mode, value])
  const today = new Date()
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
  const days = Array.from({ length: firstDay.getDay() + new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate() }, (_, index) => index < firstDay.getDay() ? null : new Date(viewDate.getFullYear(), viewDate.getMonth(), index - firstDay.getDay() + 1))

  useEffect(() => {
    setViewDate(parseValue(value, mode))
  }, [mode, value])

  useEffect(() => {
    if (!isOpen) return
    const closeOnOutsidePointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsidePointer)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsidePointer)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [isOpen])

  function selectDate(date: Date) {
    onValueChange(mode === 'date' ? toIsoDate(date) : toIsoMonth(date))
    setIsOpen(false)
  }

  function changeView(amount: number) {
    setViewDate((current) => mode === 'date' ? new Date(current.getFullYear(), current.getMonth() + amount, 1) : new Date(current.getFullYear() + amount, current.getMonth(), 1))
  }

  return <div ref={rootRef} className="thai-date-picker">
    <button type="button" className={cn('thai-date-picker-trigger', className)} onClick={() => setIsOpen((current) => !current)} aria-label={ariaLabel} aria-haspopup="dialog" aria-expanded={isOpen} disabled={disabled}><CalendarDays size={18} aria-hidden="true" /><span>{formatDisplay(value, mode)}</span></button>
    {isOpen && <section className="thai-date-picker-popover" role="dialog" aria-label={ariaLabel}>
      <header><button type="button" onClick={() => changeView(-1)} aria-label={mode === 'date' ? 'เดือนก่อนหน้า' : 'ปีก่อนหน้า'}><ChevronLeft size={18} aria-hidden="true" /></button><strong>{mode === 'date' ? `${thaiMonths[viewDate.getMonth()]} ${viewDate.getFullYear() + 543}` : String(viewDate.getFullYear() + 543)}</strong><button type="button" onClick={() => changeView(1)} aria-label={mode === 'date' ? 'เดือนถัดไป' : 'ปีถัดไป'}><ChevronRight size={18} aria-hidden="true" /></button></header>
      {mode === 'date' ? <div className="thai-date-picker-days"><div className="thai-date-picker-weekdays">{thaiWeekdays.map((day) => <span key={day}>{day}</span>)}</div><div className="thai-date-picker-grid">{days.map((date, index) => date ? <button key={toIsoDate(date)} type="button" className={cn(date.toDateString() === selectedDate.toDateString() && 'is-selected', date.toDateString() === today.toDateString() && 'is-today')} onClick={() => selectDate(date)}>{date.getDate()}</button> : <span key={`empty-${index}`} aria-hidden="true" />)}</div></div> : <div className="thai-month-picker-grid">{thaiMonths.map((monthName, index) => <button key={monthName} type="button" className={index === selectedDate.getMonth() && viewDate.getFullYear() === selectedDate.getFullYear() ? 'is-selected' : ''} onClick={() => selectDate(new Date(viewDate.getFullYear(), index, 1))}>{monthName}</button>)}</div>}
    </section>}
  </div>
}
