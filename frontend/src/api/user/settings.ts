import api from '@/lib/axios'

export type DeliveryPeriodSetting = {
  cutoff: string
  deliveryStart: string
  deliveryEnd: string
  isOpen: boolean
}

export type DeliverySettings = {
  morning: DeliveryPeriodSetting
  afternoon: DeliveryPeriodSetting
  paymentMinutes: number
}

export async function getDeliverySettings() {
  const response = await api.get<{ data: DeliverySettings }>('/user/delivery-settings')
  return response.data.data
}
