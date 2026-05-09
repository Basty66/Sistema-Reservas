const API = '/api/query'

async function callApi(operation, body = {}) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operation, ...body }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Error en la consulta')
  }
  return res.json()
}

// =============================================
// PLANES
// =============================================
export function getPlanes() {
  return callApi('getPlanes')
}

// =============================================
// RESERVAS
// =============================================
export function getReservas() {
  return callApi('getReservas')
}

export function getReservasFechas() {
  return callApi('getReservasFechas')
}

export function createReserva(data) {
  return callApi('createReserva', { data })
}

export function updateReservaEstado(id, estado) {
  return callApi('updateReservaEstado', { id, estado })
}

export function deleteReserva(id) {
  return callApi('deleteReserva', { id })
}

// =============================================
// GASTOS
// =============================================
export function getGastos() {
  return callApi('getGastos')
}

export function createGasto(data) {
  return callApi('createGasto', { data })
}

export function deleteGasto(id) {
  return callApi('deleteGasto', { id })
}

// =============================================
// FECHAS BLOQUEADAS
// =============================================
export function getFechasBloqueadas() {
  return callApi('getFechasBloqueadas')
}

export function createFechaBloqueada(fecha, motivo) {
  return callApi('createFechaBloqueada', { fecha, motivo })
}

export function deleteFechaBloqueada(id) {
  return callApi('deleteFechaBloqueada', { id })
}
