const jwt = require('jsonwebtoken')

/**
 * Extrait et vérifie le compte connecté à partir du cookie de session.
 * Retourne { accountId, prenom } ou null si non connecté / session invalide.
 */
function getSessionAccount(event) {
  const cookieHeader = event.headers.cookie || ''
  const match = cookieHeader.match(/session=([^;]+)/)
  if (!match) return null

  try {
    const payload = jwt.verify(match[1], process.env.SESSION_SECRET)
    return { accountId: payload.accountId, prenom: payload.prenom }
  } catch {
    return null // token invalide ou expiré
  }
}

module.exports = { getSessionAccount }
