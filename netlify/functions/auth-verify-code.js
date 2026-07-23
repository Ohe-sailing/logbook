const { neon } = require('@netlify/neon')
const jwt = require('jsonwebtoken')

const sql = neon()

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Méthode non autorisée' }
  }

  let body
  try {
    body = JSON.parse(event.body)
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'JSON invalide' }) }
  }

  const { email, code } = body
  if (!email || !code) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Email et code requis' }) }
  }

  const emailNormalized = email.trim().toLowerCase()

  const [account] = await sql`
    SELECT id, prenom FROM accounts WHERE email = ${emailNormalized}
  `
  if (!account) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Compte introuvable' }) }
  }

  // Chercher un code valide, non utilisé, non expiré
  const [otp] = await sql`
    SELECT id FROM otp_codes
    WHERE account_id = ${account.id}
      AND code = ${code}
      AND used = FALSE
      AND expires_at > now()
    ORDER BY created_at DESC
    LIMIT 1
  `

  if (!otp) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Code invalide ou expiré' }) }
  }

  // Marquer le code comme utilisé (usage unique)
  await sql`UPDATE otp_codes SET used = TRUE WHERE id = ${otp.id}`

  // Créer un token de session (valable 90 jours)
  const token = jwt.sign(
    { accountId: account.id, prenom: account.prenom },
    process.env.SESSION_SECRET,
    { expiresIn: '90d' }
  )

  return {
    statusCode: 200,
    headers: {
      'Set-Cookie': `session=${token}; HttpOnly; Secure; SameSite=Lax; Max-Age=${90 * 24 * 3600}; Path=/`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prenom: account.prenom }),
  }
}
