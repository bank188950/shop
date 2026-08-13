export const userLoginDialogOpenEvent = 'user-login-dialog:open'

export function openUserLoginDialog() {
  document.dispatchEvent(new Event(userLoginDialogOpenEvent))
}
