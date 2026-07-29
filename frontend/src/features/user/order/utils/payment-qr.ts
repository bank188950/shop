const paymentQrPlaceholder = 'LOOKCHIN_LOR_LUEAN_PAYMENT_TEMPLATE'

/** ค่าที่ฝังใน QR Code ต้องเหมือนกันทุกหน้า ไม่งั้นสแกนจากคนละหน้าจะได้คนละบิล */
export function paymentQrValue(orderNumber: string, totalAmount: number) {
  return `${paymentQrPlaceholder}|${orderNumber}|${totalAmount}`
}

/** ต้องเป็น QRCodeCanvas เท่านั้น เพราะ QRCodeSVG แปลงเป็นไฟล์รูปตรง ๆ ไม่ได้ */
export function downloadPaymentQr(canvas: HTMLCanvasElement | null, orderNumber: string) {
  if (!canvas) return
  const link = document.createElement('a')
  link.href = canvas.toDataURL('image/png')
  link.download = `qr-${orderNumber}.png`
  link.click()
}
