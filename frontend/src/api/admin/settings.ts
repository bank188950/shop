import api from '@/lib/axios'

export type AdminSettings = { morningCutoff: string, morningDelivery: string, afternoonCutoff: string, afternoonDelivery: string, noticeMessage: string, isNoticePopupEnabled: boolean, advertisementTexts: string[], isAdvertisementVisible: boolean }

function settingsBody(input: AdminSettings) {
  return new URLSearchParams({ morning_order_cutoff: input.morningCutoff, morning_delivery: input.morningDelivery, afternoon_order_cutoff: input.afternoonCutoff, afternoon_delivery: input.afternoonDelivery, notice_popup_message: input.noticeMessage.trim(), is_notice_popup_enabled: input.isNoticePopupEnabled ? '1' : '0', advertisements: JSON.stringify(input.advertisementTexts.map((text) => text.trim())), is_advertisement_visible: input.isAdvertisementVisible ? '1' : '0' })
}

export async function getAdminSettings() { const response = await api.get<{ data: AdminSettings }>('/admin/settings'); return response.data.data }
export async function updateAdminSettings(input: AdminSettings) { const response = await api.post<{ data: AdminSettings }>('/admin/settings', settingsBody(input)); return response.data.data }
