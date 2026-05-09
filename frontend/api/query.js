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

      default:
        return res.status(400).json({ error: 'Unknown operation' })
    }
  } catch (err) {
    console.error('API Error:', err)
    return res.status(500).json({ error: err.message })
  }
}
