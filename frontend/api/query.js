import { Pool } from '@neondatabase/serverless'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.VITE_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { operation, data, id, estado, fecha, motivo } = req.body

  try {
    let result

    switch (operation) {
      // PLANES
      case 'getPlanes':
        result = await pool.query('SELECT * FROM planes ORDER BY precio_base ASC')
        return res.json(result.rows)

      // RESERVAS
      case 'getReservas':
        result = await pool.query('SELECT * FROM reservas ORDER BY fecha_evento ASC')
        return res.json(result.rows)

      case 'getReservasFechas':
        result = await pool.query('SELECT fecha_evento, estado FROM reservas')
        return res.json(result.rows)

      case 'createReserva':
        result = await pool.query(
          `INSERT INTO reservas (nombre_cliente, email_cliente, telefono_cliente, empresa, fecha_evento, total_cotizado, num_personas, estado)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
          [data.nombre_cliente, data.email_cliente, data.telefono_cliente, data.empresa, data.fecha_evento, data.total_cotizado, data.num_personas, data.estado]
        )
        return res.json(result.rows[0])

      case 'updateReservaEstado':
        result = await pool.query(
          'UPDATE reservas SET estado = $1 WHERE id = $2 RETURNING *',
          [estado, id]
        )
        return res.json(result.rows[0])

      case 'deleteReserva':
        await pool.query('DELETE FROM reservas WHERE id = $1', [id])
        return res.json({ success: true })

      // GASTOS
      case 'getGastos':
        result = await pool.query('SELECT * FROM gastos ORDER BY fecha DESC')
        return res.json(result.rows)

      case 'createGasto':
        result = await pool.query(
          'INSERT INTO gastos (descripcion, monto, fecha) VALUES ($1, $2, $3) RETURNING *',
          [data.descripcion, data.monto, data.fecha]
        )
        return res.json(result.rows[0])

      case 'deleteGasto':
        await pool.query('DELETE FROM gastos WHERE id = $1', [id])
        return res.json({ success: true })

      // FECHAS BLOQUEADAS
      case 'getFechasBloqueadas':
        result = await pool.query('SELECT * FROM fechas_bloqueadas ORDER BY fecha ASC')
        return res.json(result.rows)

      case 'createFechaBloqueada':
        result = await pool.query(
          'INSERT INTO fechas_bloqueadas (fecha, motivo) VALUES ($1, $2) RETURNING *',
          [fecha, motivo]
        )
        return res.json(result.rows[0])

      case 'deleteFechaBloqueada':
        await pool.query('DELETE FROM fechas_bloqueadas WHERE id = $1', [id])
        return res.json({ success: true })

      // EMAIL (Resend)
      case 'sendApprovalEmail': {
        const { nombre_cliente, email_cliente, fecha_evento, total_cotizado } = data

        const approvalHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:system-ui,-apple-system,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08)">
      <tr><td style="background:linear-gradient(135deg,#0c1222,#1e293b);padding:32px 40px;text-align:center">
        <h1 style="margin:0;font-size:28px;font-weight:700;color:#d4a853">Piscina Oasis</h1>
        <p style="margin:4px 0 0;font-size:13px;color:#94a3b8">Villa Alegre · Sistema de Reservas</p>
      </td></tr>
      <tr><td style="padding:32px 40px 8px">
        <h2 style="margin:0 0 4px;font-size:20px;color:#0f172a">¡Reserva aprobada! ✅</h2>
        <p style="margin:0;font-size:14px;color:#64748b">Hola ${nombre_cliente}, tu reserva ha sido confirmada.</p>
      </td></tr>
      <tr><td style="padding:8px 40px">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:8px;padding:16px 20px">
          <tr><td style="font-size:12px;font-weight:600;color:#0f172a;padding-bottom:8px">DETALLES DE LA RESERVA</td></tr>
          <tr><td style="font-size:13px;color:#334155;padding:2px 0"><strong>Fecha:</strong> ${fecha_evento}</td></tr>
          <tr><td style="padding-top:8px;font-size:18px;font-weight:700;color:#d4a853">Total: $${(total_cotizado || 0).toLocaleString('es-CL')}</td></tr>
        </table>
      </td></tr>
      <tr><td style="padding:24px 40px 32px;text-align:center">
        <p style="margin:0;font-size:13px;color:#64748b">¡Nos vemos pronto! Te contactaremos para coordinar los detalles finales.</p>
      </td></tr>
      <tr><td style="background:#f1f5f9;padding:20px 40px;text-align:center">
        <p style="margin:0;font-size:12px;color:#94a3b8">Piscina Oasis — Villa Alegre</p>
        <p style="margin:4px 0 0;font-size:11px;color:#cbd5e1">Notificación automática · Sistema de Reservas</p>
      </td></tr>
    </table>
  </td></tr></table>
</body>
</html>`

        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Reservas <onboarding@resend.dev>',
            to: [email_cliente],
            subject: `Reserva aprobada — ${nombre_cliente} — Piscina Oasis`,
            html: approvalHtml,
          }),
        })

        if (!resendRes.ok) {
          const errText = await resendRes.text()
          console.error('Resend error:', resendRes.status, errText)
          return res.status(502).json({ error: `Resend error: ${errText}` })
        }

        return res.json({ success: true })
      }

      case 'sendReservationEmail': {
        const { nombre_cliente, email_cliente, fecha_evento, total_cotizado, num_personas, servicios, pdfBase64, pdfName } = data

        const clientHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:system-ui,-apple-system,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08)">
      <tr><td style="background:linear-gradient(135deg,#0c1222,#1e293b);padding:32px 40px;text-align:center">
        <h1 style="margin:0;font-size:28px;font-weight:700;color:#d4a853">Piscina Oasis</h1>
        <p style="margin:4px 0 0;font-size:13px;color:#94a3b8">Villa Alegre · Sistema de Reservas</p>
      </td></tr>
      <tr><td style="padding:32px 40px 8px">
        <h2 style="margin:0 0 4px;font-size:20px;color:#0f172a">¡Reserva recibida! 🎉</h2>
        <p style="margin:0;font-size:14px;color:#64748b">Hola ${nombre_cliente}, hemos registrado tu solicitud.</p>
      </td></tr>
      <tr><td style="padding:8px 40px">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:8px;padding:16px 20px">
          <tr><td style="font-size:12px;font-weight:600;color:#0f172a;padding-bottom:8px">DETALLES DE LA RESERVA</td></tr>
          <tr><td style="font-size:13px;color:#334155;padding:2px 0"><strong>Fecha:</strong> ${fecha_evento}</td></tr>
          <tr><td style="font-size:13px;color:#334155;padding:2px 0"><strong>Invitados:</strong> ${num_personas}</td></tr>
          ${servicios ? `<tr><td style="font-size:13px;color:#334155;padding:2px 0"><strong>Servicios:</strong> ${servicios}</td></tr>` : ''}
          <tr><td style="padding-top:8px;font-size:18px;font-weight:700;color:#d4a853">Total: $${(total_cotizado || 0).toLocaleString('es-CL')}</td></tr>
        </table>
      </td></tr>
      <tr><td style="padding:24px 40px 32px;text-align:center">
        <p style="margin:0 0 12px;font-size:13px;color:#64748b">Tu reserva está <strong>pendiente</strong>. Te contactaremos pronto para confirmar.</p>
        <p style="margin:0;font-size:13px;color:#64748b">Adjunto encontrarás tu contrato digital.</p>
      </td></tr>
      <tr><td style="background:#f1f5f9;padding:20px 40px;text-align:center">
        <p style="margin:0;font-size:12px;color:#94a3b8">Piscina Oasis — Villa Alegre</p>
        <p style="margin:4px 0 0;font-size:11px;color:#cbd5e1">Notificación automática · Sistema de Reservas</p>
      </td></tr>
    </table>
  </td></tr></table>
</body>
</html>`

        const resendPayload = {
          from: 'Reservas <onboarding@resend.dev>',
          to: [email_cliente],
          subject: `Reserva recibida — ${nombre_cliente} — Piscina Oasis`,
          html: clientHtml,
        }

        if (pdfBase64) {
          resendPayload.attachments = [{
            filename: pdfName || 'Contrato_Reserva.pdf',
            content: pdfBase64,
          }]
        }

        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(resendPayload),
        })

        if (!resendRes.ok) {
          const errText = await resendRes.text()
          console.error('Resend error:', resendRes.status, errText)
          return res.status(502).json({ error: `Resend error: ${errText}` })
        }

        return res.json({ success: true })
      }

      case 'adminLogin': {
        const { email, password } = data
        const adminPass = process.env.ADMIN_PASSWORD || 'admin123'
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@oasis.cl'
        if (password !== adminPass) {
          return res.status(401).json({ error: 'Credenciales incorrectas' })
        }
        return res.json({ success: true, user: { email: email || adminEmail } })
      }

      default:
        return res.status(400).json({ error: 'Unknown operation' })
    }
  } catch (err) {
    console.error('API Error:', err)
    return res.status(500).json({ error: err.message })
  }
}
