const paymentQrPlaceholder = 'LOOKCHIN_LOR_LUEAN_PAYMENT_TEMPLATE'

/** ค่าที่ฝังใน QR Code ต้องเหมือนกันทุกหน้า ไม่งั้นสแกนจากคนละหน้าจะได้คนละบิล */
export function paymentQrValue(orderNumber: string, totalAmount: number) {
  return `${paymentQrPlaceholder}|${orderNumber}|${totalAmount}`
}
