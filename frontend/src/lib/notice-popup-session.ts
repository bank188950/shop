/**
 * จำว่า popup ประกาศจากทางร้านแสดงไปแล้วหรือยัง โดยนับหนึ่งครั้งต่อการเปิด browser หนึ่งรอบ
 * เก็บใน sessionStorage เพราะ browser ล้างให้เองตอนปิดทุกหน้าต่าง แต่ยังอยู่ข้ามการรีเฟรช
 * sessionStorage แยกกันคนละแท็บ แท็บที่เพิ่งเปิดจึงถามแท็บอื่นผ่าน BroadcastChannel ว่ารอบนี้แสดงไปแล้วหรือยัง
 */
const shownKey = 'shop-notice-popup-shown'
const channel = 'BroadcastChannel' in window ? new BroadcastChannel('shop-notice-popup') : null

channel?.addEventListener('message', (event: MessageEvent<string>) => {
  if (event.data === 'ask' && isNoticePopupShown()) channel.postMessage('shown')
  else if (event.data === 'shown') sessionStorage.setItem(shownKey, '1')
})
channel?.postMessage('ask')

export function isNoticePopupShown() {
  return sessionStorage.getItem(shownKey) === '1'
}

export function markNoticePopupShown() {
  sessionStorage.setItem(shownKey, '1')
  // บอกแท็บอื่นที่เปิดค้างไว้ด้วย จะได้ไม่แสดงซ้ำเมื่อผู้ใช้สลับไปที่แท็บนั้น
  channel?.postMessage('shown')
}
