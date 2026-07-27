import api from '@/lib/axios'

export type AdminSettings = {
  morningOrderCutoff: string
  morningDeliveryStart: string
  morningDeliveryEnd: string
  afternoonOrderCutoff: string
  afternoonDeliveryStart: string
  afternoonDeliveryEnd: string
  noticePopupMessage: string
  isNoticePopupEnabled: boolean
  advertisements: string[]
  isAdvertisementVisible: boolean
}

export type SettingsSaveInput = AdminSettings

function settingsBody(input: SettingsSaveInput) {
  return new URLSearchParams({
    morning_order_cutoff: input.morningOrderCutoff,
    morning_delivery_start: input.morningDeliveryStart,
    morning_delivery_end: input.morningDeliveryEnd,
    afternoon_order_cutoff: input.afternoonOrderCutoff,
    afternoon_delivery_start: input.afternoonDeliveryStart,
    afternoon_delivery_end: input.afternoonDeliveryEnd,
    notice_popup_message: input.noticePopupMessage.trim(),
    is_notice_popup_enabled: input.isNoticePopupEnabled ? '1' : '0',
    advertisements: JSON.stringify(input.advertisements.map((message) => message.trim())),
    is_advertisement_visible: input.isAdvertisementVisible ? '1' : '0',
  })
}

export async function getAdminSettings() {
  const response = await api.get<{ data: AdminSettings }>('/admin/settings')
  return response.data.data
}

export async function updateAdminSettings(input: SettingsSaveInput) {
  const response = await api.post<{ data: AdminSettings }>('/admin/settings', settingsBody(input))
  return response.data.data
}
