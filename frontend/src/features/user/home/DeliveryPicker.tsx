import { Check, Clock3, SunMedium, Sunset } from 'lucide-react'
import { useState } from 'react'

export function DeliveryPicker() {
  const [delivery, setDelivery] = useState<'morning' | 'afternoon'>('morning')

  return (
    <section id="delivery" className="mt-6 max-md:mt-4" aria-labelledby="delivery-heading">
      <div className="flex items-center gap-3 text-brand max-md:gap-2"><Clock3 size={28} className="max-md:size-6" /><h2 id="delivery-heading" className="m-0 font-heading text-[clamp(2rem,4vw,3rem)] leading-tight tracking-[-0.035em] text-[#1d4f29]">เลือกช่วงเวลาจัดส่ง</h2></div>
      <div className="mt-5 grid grid-cols-2 gap-6 max-md:mt-4 max-md:grid-cols-1 max-md:gap-3">
        <button className={`relative grid min-h-[202px] place-items-center content-center overflow-hidden rounded-[20px] border-[1.5px] p-5 text-[#1b2b31] transition hover:-translate-y-0.5 hover:shadow-lg ${delivery === 'morning' ? 'border-[#77b7ed] bg-gradient-to-br from-morning to-[#f7fcff] ring-4 ring-[#77b7ed]/65 shadow-[0_0_24px_6px_#77b7ed66]' : 'border-[#77b7ed] bg-gradient-to-br from-morning to-[#f7fcff]'}`} type="button" onClick={() => setDelivery('morning')} aria-pressed={delivery === 'morning'}>
          <span className={`absolute right-3 top-3 grid size-14 place-items-center rounded-full border-2 border-[#338ad7] text-[#338ad7] ${delivery === 'morning' ? 'opacity-100' : 'opacity-0'}`}><Check size={24} strokeWidth={2.5} /></span><SunMedium size={46} className="text-[#338ad7] max-md:size-[38px]" /><strong className="mt-2.5 font-heading text-[22px]">ช่วงเช้า</strong><b className="text-xl font-semibold">08:00 – 11:00</b><small className="mt-2.5 rounded-md bg-[#c8e7fb]/60 px-3 py-1 text-lg font-bold text-[#4f7595]">จัดส่งช่วงเช้า</small>
        </button>
        <button className={`relative grid min-h-[202px] place-items-center content-center overflow-hidden rounded-[20px] border-[1.5px] p-5 text-[#1b2b31] transition hover:-translate-y-0.5 hover:shadow-lg ${delivery === 'afternoon' ? 'border-[#f2b866] bg-gradient-to-br from-afternoon to-[#fffaf2] ring-4 ring-[#f2b866]/65 shadow-[0_0_24px_6px_#f2b86666]' : 'border-[#f2b866] bg-gradient-to-br from-afternoon to-[#fffaf2]'}`} type="button" onClick={() => setDelivery('afternoon')} aria-pressed={delivery === 'afternoon'}>
          <span className={`absolute right-3 top-3 grid size-14 place-items-center rounded-full border-2 border-[#c88434] text-[#c88434] ${delivery === 'afternoon' ? 'opacity-100' : 'opacity-0'}`}><Check size={24} strokeWidth={2.5} /></span><Sunset size={46} className="text-[#c88434] max-md:size-[38px]" /><strong className="mt-2.5 font-heading text-[22px]">ช่วงบ่าย</strong><b className="text-xl font-semibold">14:00 – 17:00</b><small className="mt-2.5 rounded-md bg-[#ffe1b4]/50 px-3 py-1 text-lg font-bold text-[#9b713f]">จัดส่งช่วงบ่าย</small>
        </button>
      </div>
    </section>
  )
}
