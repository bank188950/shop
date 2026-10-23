/**
 * เก็บ event `beforeinstallprompt` ไว้ใช้ตอนลูกค้ากดไอคอนบ้านบน header
 * browser ส่ง event นี้มาครั้งเดียวตั้งแต่โหลดหน้า ก่อน component จะ mount จึงต้องดักไว้ระดับ module (import ไว้ใน main.tsx)
 * มีเฉพาะ Chrome/Edge บน Android และต้องเปิดผ่าน HTTPS; Safari บน iPhone ไม่มี event นี้ ต้องสอนวิธีเพิ่มเอง
 */
type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void>, userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }

let deferredPrompt: BeforeInstallPromptEvent | null = null

/**
 * Chrome ไม่ส่ง beforeinstallprompt ซ้ำเมื่อติดตั้งแล้ว เว็บจึงต้องจำเองว่าเคยติดตั้ง ไว้บอกลูกค้าแทนการสอนวิธีซ้ำ
 * เก็บใน localStorage ซึ่งอาจอ่านไม่ได้ในโหมดส่วนตัว จึงครอบ try/catch ทุกครั้ง
 */
const installedKey = 'shop-home-screen-installed'

function setInstalledFlag(isInstalled: boolean) {
  try {
    if (isInstalled) localStorage.setItem(installedKey, '1')
    else localStorage.removeItem(installedKey)
  } catch { /* เก็บไม่ได้ก็แค่สอนวิธีแทนการบอกว่าติดตั้งแล้ว */ }
}

window.addEventListener('beforeinstallprompt', (event) => {
  // กันไม่ให้ browser แสดงแถบติดตั้งเอง ให้ลูกค้ากดจากไอคอนบ้านแทน
  event.preventDefault()
  deferredPrompt = event as BeforeInstallPromptEvent
  // Chrome ส่ง event นี้ได้แปลว่ายังไม่ได้ติดตั้ง หรือลูกค้าลบไอคอนออกไปแล้ว จึงล้างค่าที่จำไว้
  setInstalledFlag(false)
})
window.addEventListener('appinstalled', () => {
  deferredPrompt = null
  setInstalledFlag(true)
})

/** เคยเพิ่มร้านไว้ที่หน้าจอหลักจากเบราว์เซอร์นี้แล้ว */
export function isMarkedInstalled() {
  try {
    return localStorage.getItem(installedKey) === '1'
  } catch {
    return false
  }
}

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
  const { outcome } = await prompt.userChoice
  if (outcome === 'accepted') setInstalledFlag(true)
  return true
}
