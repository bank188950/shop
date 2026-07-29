import { useQuery } from '@tanstack/react-query'
import { getAnnouncements } from '@/api/user/announcements'

export const announcementKeys = { all: ['user', 'announcements'] as const }

export function useAnnouncements() {
  return useQuery({ queryKey: announcementKeys.all, queryFn: getAnnouncements })
}
