// Persistencia mínima de sesión. Guardamos el JWT propio de la app (no el token
// de Google) y los datos públicos del usuario para pintarlos en la UI.
const TOKEN_KEY = 'om.accessToken'
const USER_KEY = 'om.user'

export function setSession(accessToken, user) {
  localStorage.setItem(TOKEN_KEY, accessToken)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY)
  return raw ? JSON.parse(raw) : null
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
