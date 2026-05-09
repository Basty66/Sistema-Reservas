import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    color: '#1e293b',
    fontSize: 10,
  },
  header: {
    borderBottom: 2,
    borderColor: '#d4a853',
    paddingBottom: 15,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0c1222',
  },
  subtitle: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  companyInfo: {
    textAlign: 'right',
    fontSize: 9,
    color: '#475569',
    lineHeight: 1.4,
  },
  companyName: {
    fontWeight: 'bold',
    color: '#d4a853',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    backgroundColor: '#faf8f5',
    padding: 7,
    marginBottom: 10,
    marginTop: 15,
    color: '#0c1222',
    borderLeft: 3,
    borderLeftColor: '#d4a853',
    borderLeftStyle: 'solid',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 10,
    color: '#64748b',
    width: 130,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 10,
    color: '#0c1222',
    flex: 1,
  },
  table: {
    marginTop: 10,
    border: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: 1,
    borderBottomColor: '#e2e8f0',
    padding: 8,
  },
  tableHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#475569',
    textTransform: 'uppercase',
  },
  tableCell: {
    fontSize: 10,
    color: '#0c1222',
  },
  totalRow: {
    backgroundColor: '#faf8f5',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTop: 2,
    borderTopColor: '#d4a853',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0c1222',
    marginRight: 15,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0c1222',
  },
  clauses: {
    marginTop: 20,
    fontSize: 8.5,
    color: '#475569',
    lineHeight: 1.6,
    textAlign: 'justify',
    padding: 10,
    backgroundColor: '#faf8f5',
    borderRadius: 4,
  },
  signatures: {
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  signatureBlock: {
    alignItems: 'center',
    width: '40%',
  },
  signatureLine: {
    borderTop: 1,
    borderColor: '#0c1222',
    width: '100%',
    marginBottom: 5,
  },
  signatureText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0c1222',
  },
  signatureSub: {
    fontSize: 8,
    color: '#64748b',
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
    borderTop: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
})

const ContratoPDF = ({ datos, servicios = [] }) => {
  const serviciosTotal = servicios.reduce((sum, s) => sum + (s.precio || 0), 0)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>CONTRATO DE ARRIENDO</Text>
            <Text style={styles.subtitle}>Documento Oficial de Reserva</Text>
          </View>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>PISCINA OASIS</Text>
            <Text>Las Camelias 123, Villa Alegre</Text>
            <Text>contacto@piscinaoasis.cl</Text>
            <Text>+56 9 2812 2947</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>1. DATOS DEL ARRENDATARIO</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Nombre / Representante:</Text>
          <Text style={styles.value}>{datos.nombre_cliente}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Correo Electrónico:</Text>
          <Text style={styles.value}>{datos.email_cliente}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Teléfono de Contacto:</Text>
          <Text style={styles.value}>{datos.telefono_cliente}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Empresa / Institución:</Text>
          <Text style={styles.value}>{datos.empresa || 'Persona Natural'}</Text>
        </View>

        <Text style={styles.sectionTitle}>2. DETALLES DE LA RESERVA</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Fecha del Evento:</Text>
          <Text style={styles.value}>{datos.fecha_evento}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Horario de Arriendo:</Text>
          <Text style={styles.value}>09:00 hrs a 20:00 hrs</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Cantidad de Asistentes:</Text>
          <Text style={styles.value}>Máximo {datos.num_personas} personas permitidas</Text>
        </View>

        <Text style={styles.sectionTitle}>3. COTIZACIÓN Y PAGOS</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, { backgroundColor: '#f8fafc' }]}>
            <Text style={[styles.tableHeader, { flex: 3 }]}>Descripción</Text>
            <Text style={[styles.tableHeader, { flex: 1, textAlign: 'center' }]}>Cant.</Text>
            <Text style={[styles.tableHeader, { flex: 1, textAlign: 'right' }]}>Subtotal</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 3 }]}>Arriendo de Parcela e Instalaciones</Text>
            <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>1</Text>
            <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>
              ${(datos.total_cotizado - serviciosTotal).toLocaleString('es-CL')}
            </Text>
          </View>
          {servicios.map((srv, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>{srv.nombre}</Text>
              <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>1</Text>
              <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>
                ${srv.precio.toLocaleString('es-CL')}
              </Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL A PAGAR:</Text>
            <Text style={styles.totalValue}>${datos.total_cotizado.toLocaleString('es-CL')} CLP</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>4. TÉRMINOS Y CONDICIONES</Text>
        <View style={styles.clauses}>
          <Text style={{ marginBottom: 4 }}>
            • Para confirmar definitivamente esta reserva y bloquear la fecha, el arrendatario debe transferir el 50% del Total a Pagar en un plazo máximo de 24 horas tras la emisión de este documento.
          </Text>
          <Text style={{ marginBottom: 4 }}>
            • El saldo restante (50%) deberá ser cancelado a más tardar 3 días antes de la fecha del evento.
          </Text>
          <Text style={{ marginBottom: 4 }}>
            • En caso de cancelación por parte del arrendatario, la reserva del 50% no será reembolsable, quedando como indemnización por perjuicios de fecha perdida.
          </Text>
          <Text style={{ marginBottom: 4 }}>
            • El arrendatario se hace responsable por cualquier daño o avería a la infraestructura, piscina, áreas verdes o mobiliario durante su estadía.
          </Text>
          <Text>
            • Al firmar este documento, el arrendatario acepta todas las condiciones estipuladas y el reglamento interno de Piscina Oasis.
          </Text>
        </View>

        <View style={styles.signatures}>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureText}>FIRMA ARRENDATARIO</Text>
            <Text style={styles.signatureSub}>{datos.nombre_cliente}</Text>
            <Text style={styles.signatureSub}>RUT: ___________________</Text>
          </View>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureText}>FIRMA ARRENDADOR</Text>
            <Text style={styles.signatureSub}>Administración</Text>
            <Text style={styles.signatureSub}>Piscina Oasis</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Documento generado automáticamente por el Sistema de Reservas Piscina Oasis — {new Date().toLocaleDateString('es-CL')}
        </Text>
      </Page>
    </Document>
  )
}

export default ContratoPDF
