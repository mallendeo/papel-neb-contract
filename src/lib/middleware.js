import { UnauthorizedError } from './errors'

export const checkRoles = app => (role = 'admin') => {
  if (app.admin.store.admin === app.from) return true
  if (!app.user.roles) throw UnauthorizedError()

  const found = app.user.roles.find(r => r === role)
  if (!found) throw UnauthorizedError()
  return true
}
