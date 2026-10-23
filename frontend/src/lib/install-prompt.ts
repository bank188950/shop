/**
 * เก็บ event `beforeinstallprompt` ไว้ใช้ตอนลูกค้ากดไอคอนบ้านบน header
 * browser ส่ง event นี้มาครั้งเดียวตั้งแต่โหลดหน้า ก่อน component จะ mount จึงต้องดักไว้ระดับ module (import ไว้ใน main.tsx)
 * มีเฉพาะ Chrome/Edge บน Android และต้องเปิดผ่าน HTTPS; Safari บน iPhone ไม่มี event นี้ ต้องสอนวิธีเพิ่มเอง
 */
type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void>, userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }

let deferredPrompt: BeforeInstallPromptEvent | null = null

window.addEventListener('beforeinstallprompt', (event) => {
  // กันไม่ให้ browser แสดงแถบติดตั้งเอง ให้ลูกค้ากดจากไอคอนบ้านแทน
  event.preventDefault()
  deferredPrompt = event as BeforeInstallPromptEvent
})
window.addEventListener('appinstalled', () => { deferredPrompt = null })

/** เปิดจากไอคอนบนหน้าจอหลักแล้ว ไม่ต้องแสดงไอคอนบ้านอีก */
export function isRunningAsInstalledApp() {
  return window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true
}

/** คืน `true` เมื่อเปิดหน้าต่างติดตั้งของ browser ได้ ถ้าคืน `false` ให้สอนวิธีเพิ่มเองแทน */
export async function promptInstall() {
  if (!deferredPrompt) return false
  const prompt = deferredPrompt
  // event ใช้ได้ครั้งเดียว ถ้าลูกค้ากดยกเลิก browser จะส่ง event ใหม่มาเองเมื่อพร้อม
  deferredPrompt = null
  await prompt.prompt()
  await prompt.userChoice
  return true
}
