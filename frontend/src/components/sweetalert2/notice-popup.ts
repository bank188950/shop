import Swal from 'sweetalert2'

const escapeHtml = (value: string) => value.replace(/[&<>"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[character] ?? character)

/**
 * ข้อความมาจาก textarea ในหน้าตั้งค่า จึงต้อง escape ก่อนแล้วแปลงบรรทัดใหม่เป็น <br> ให้ขึ้นบรรทัดตามที่แอดมินพิมพ์
 * ถ้ายังไม่ได้กรอกข้อความก็ยังแสดง popup แต่เหลือเฉพาะหัวข้อ ไม่เว้นช่องว่างของเนื้อหาไว้
 */
export function showNoticePopup(message: string) {
  return Swal.fire({
    title: 'ประกาศแจ้งเตือนจากทางร้าน',
    html: message ? escapeHtml(message).replace(/\r?\n/g, '<br>') : undefined,
    iconHtml: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/></svg>',
    icon: 'info',
    // ปิดด้วยปุ่มกากบาท คลิกนอก popup หรือกด Escape จึงไม่ต้องมีปุ่มยืนยัน
    showConfirmButton: false,
    showCloseButton: true,
    // ไม่มีปุ่มยืนยัน sweetalert2 จึงโฟกัสปุ่มกากบาทให้ตั้งแต่เปิดและขึ้นกรอบโฟกัส ย้ายโฟกัสไปที่ตัว popup แทน แต่ยังคงอยู่ใน popup เพื่อให้กด Escape และ Tab ต่อได้
    didOpen: () => Swal.getPopup()?.focus(),
    customClass: {
      popup: 'notice-popup',
      icon: 'notice-alert-icon',
      title: 'font-heading text-3xl text-ink sm:text-4xl',
      htmlContainer: 'mt-3 text-xl font-bold text-[#455048]',
      closeButton: 'absolute top-4 right-4 grid size-11 place-items-center rounded-full text-muted hover:bg-[#e1f3e5] hover:text-brand',
    },
  })
}
