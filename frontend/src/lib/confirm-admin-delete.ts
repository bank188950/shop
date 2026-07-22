import Swal from 'sweetalert2'

export async function confirmAdminDelete(itemName: string) {
  const result = await Swal.fire({
    title: 'ยืนยันการลบ?',
    text: `ต้องการลบ ${itemName} หรือไม่`,
    icon: 'warning',
    iconHtml: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>',
    showCancelButton: true,
    confirmButtonText: 'ลบ',
    cancelButtonText: 'ยกเลิก',
    confirmButtonColor: '#bd3b35',
    cancelButtonColor: '#607168',
    reverseButtons: true,
    focusCancel: true,
    customClass: { icon: 'admin-delete-alert-icon' },
  })

  return result.isConfirmed
}
