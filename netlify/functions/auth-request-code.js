const { neon } = require('@netlify/neon')
const { Resend } = require('resend')

const sql = neon() // utilise automatiquement NETLIFY_DATABASE_URL
const resend = new Resend(process.env.RESEND_API_KEY)

function generateCode() {
  // Code à 6 chiffres, ex: "042817"
  return String(Math.floor(100000 + Math.random() * 900000))
}

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

  const { prenom, email } = body
  if (!prenom || !email) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Prénom et email requis' }) }
  }

  const emailNormalized = email.trim().toLowerCase()

  // 1. Trouver ou créer le compte
  let [account] = await sql`
    SELECT id, prenom FROM accounts WHERE email = ${emailNormalized}
  `
  if (!account) {
    ;[account] = await sql`
      INSERT INTO accounts (prenom, email) VALUES (${prenom.trim()}, ${emailNormalized})
      RETURNING id, prenom
    `
  }

  // 2. Générer et stocker un code, valable 15 minutes
  const code = generateCode()
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

  await sql`
    INSERT INTO otp_codes (account_id, code, expires_at)
    VALUES (${account.id}, ${code}, ${expiresAt})
  `

  // 3. Envoyer l'email
  try {
    await resend.emails.send({
      from: 'Ohé Sailing <livre-de-bord@ohe-sailing.com>',
      to: emailNormalized,
      subject: `Votre code de connexion : ${code}`,
      text: `Bonjour ${account.prenom},\n\nVotre code de connexion au livre de bord Ohé Sailing : ${code}\n\nCe code est valable 15 minutes.\n\nBonne navigation !`,
    })
  } catch (err) {
    console.error('Erreur envoi email:', err)
    return { statusCode: 500, body: JSON.stringify({ error: "Impossible d'envoyer l'email" }) }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Code envoyé par email' }),
  }
}
