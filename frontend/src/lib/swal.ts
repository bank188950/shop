import Swal from 'sweetalert2'
import type { SweetAlertOptions } from 'sweetalert2'

/** sweetalert2 ตั้ง font-size ของปุ่มมาเองจาก inline style ปรับผ่าน class ไม่ได้ จึงต้องเขียนทับตอน popup เปิด */
export function enlargeAlertButtons() {
  const title = Swal.getTitle()
  const actions = Swal.getActions()
  if (title) {
    title.style.fontFamily = 'Sarabun, Noto Sans Thai, system-ui, sans-serif'
    title.style.fontWeight = '800'
  }
  if (actions) actions.style.marginTop = '32px'

  const buttons = [Swal.getConfirmButton(), Swal.getCancelButton()]
  buttons.filter((button): button is HTMLButtonElement => Boolean(button)).forEach((button) => {
    button.style.fontFamily = 'Sarabun, Noto Sans Thai, system-ui, sans-serif'
    button.style.fontSize = '1.25rem'
    button.style.lineHeight = '1'
  })
}

/** หน้าตา popup กลางของฝั่งลูกค้า popup ที่ไม่ต้องให้ยกเลิกให้ส่ง showCancelButton เป็น false ทับ */
export const swalBaseOptions: SweetAlertOptions = {
  showCancelButton: true,
  showCloseButton: true,
  cancelButtonText: 'ยกเลิก',
  buttonsStyling: false,
  didOpen: enlargeAlertButtons,
  customClass: {
    popup: 'rounded-2xl p-8 sm:p-10',
    title: 'font-heading text-3xl text-ink sm:text-4xl',
    htmlContainer: 'mt-3 text-xl font-bold text-[#455048]',
    closeButton: 'absolute top-4 right-4 grid size-11 place-items-center rounded-full text-muted hover:bg-[#e1f3e5] hover:text-brand',
    actions: 'mt-8 gap-4',
    confirmButton: 'min-h-14 rounded-full bg-brand px-10 font-heading text-2xl font-extrabold text-white hover:bg-brand-dark',
    cancelButton: 'min-h-14 rounded-full bg-[#6b7280] px-10 font-heading text-2xl font-extrabold text-white hover:bg-[#4b5563]',
  },
}
