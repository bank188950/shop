/**
 * เลือกวิธีสอนลูกค้าเพิ่มร้านไว้ที่หน้าจอหลักตามเครื่องและเบราว์เซอร์ที่เปิดอยู่
 * ใช้เมื่อ browser เปิดหน้าต่างติดตั้งให้ไม่ได้ (ดู `promptInstall`) เช่น iPhone ทุกกรณี หรือ Android ที่ยังไม่พร้อมติดตั้ง
 * Chrome บน Android และ Safari บน iPhone มีเมนูเพิ่มไปที่หน้าจอหลักแน่นอน จึงให้ย้ายไปสองเบราว์เซอร์นี้เมื่อเปิดจากที่อื่น
 */
export type HomeScreenGuide = 'android-chrome' | 'ios-safari' | 'open-in-chrome' | 'open-in-safari' | 'in-app' | 'android-desktop-mode' | 'desktop'

export function homeScreenGuide(userAgent: string, maxTouchPoints: number): HomeScreenGuide {
  // iPad รุ่นใหม่รายงานตัวเองเป็น Mac จึงเช็กจอสัมผัสร่วมด้วย
  const isIos = /iphone|ipad|ipod/i.test(userAgent) || (/macintosh/i.test(userAgent) && maxTouchPoints > 1)
  const isAndroid = /android/i.test(userAgent)
  // โหมด "เว็บไซต์เวอร์ชันเดสก์ท็อป" ของ Chrome บน Android แจ้งตัวเป็น Linux ไม่มีคำว่า Android แต่ยังมีจอสัมผัส
  // คอม Linux จริงแทบไม่มีจอสัมผัส ส่วน Chromebook มีคำว่า CrOS จึงตัดออก
  if (!isIos && !isAndroid && maxTouchPoints > 0 && /linux/i.test(userAgent) && !/cros/i.test(userAgent)) return 'android-desktop-mode'
  if (!isIos && !isAndroid) return 'desktop'
  // browser ในแอปเหล่านี้ไม่มีเมนูเพิ่มไปที่หน้าจอหลัก ต้องเปิดในเบราว์เซอร์ของเครื่องก่อน
  if (/line\/|fban|fbav|fb_iab|instagram|messenger|tiktok|bytedance/i.test(userAgent)) return 'in-app'
  if (isIos) return /crios|fxios|edgios|opios/i.test(userAgent) ? 'open-in-safari' : 'ios-safari'
  // Chrome บน Android มีคำว่า Chrome แต่เบราว์เซอร์อื่นที่สร้างจาก Chromium ก็มีด้วย จึงตัดตัวที่รู้จักออก
  if (/samsungbrowser|firefox|edga|opr\/|ucbrowser|miuibrowser|huaweibrowser|vivobrowser|heytapbrowser|yabrowser|; wv\)/i.test(userAgent) || !/chrome\//i.test(userAgent)) return 'open-in-chrome'
  return 'android-chrome'
}
