import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: { padding: 40, backgroundColor: '#fff', fontFamily: 'Helvetica' },
    header: { borderBottom: 2, borderColor: '#2563eb', paddingBottom: 10, marginBottom: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
    section: { marginBottom: 15 },
    label: { fontSize: 10, color: '#64748b', uppercase: true, fontWeight: 'bold', marginBottom: 2 },
    value: { fontSize: 12, color: '#1e293b', marginBottom: 8 },
    grid: { flexDirection: 'row', justifyContent: 'space-between' },
    contractBox: { backgroundColor: '#f1f5f9', padding: 15, borderRadius: 8, marginTop: 20 },
    contractText: { fontSize: 10, italic: true, color: '#475569', lineHeight: 1.5 },
    signatureArea: { marginTop: 50, flexDirection: 'row', justifyContent: 'space-between' },
    signatureLine: { borderTopWidth: 1, borderColor: '#000', width: '40%', pt: 5, textAlign: 'center', fontSize: 10 }
});

const ContratoPDF = ({ datos }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.title}>CONTRATO DE RESERVA</Text>
                <Text style={{ fontSize: 10, color: '#2563eb' }}>Parcela de Eventos — Piscina Oasis</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Cliente / Empresa</Text>
                <Text style={styles.value}>{datos.nombre_cliente} {datos.empresa ? `(${datos.empresa})` : ''}</Text>
            </View>

            <View style={styles.grid}>
                <View style={{ width: '45%' }}>
                    <Text style={styles.label}>Fecha del Evento</Text>
                    <Text style={styles.value}>{datos.fecha_evento}</Text>
                </View>
                <View style={{ width: '45%' }}>
                    <Text style={styles.label}>Asistentes</Text>
                    <Text style={styles.value}>{datos.num_personas} personas</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Monto Total a Cotizar</Text>
                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>${datos.total_cotizado.toLocaleString('es-CL')} CLP</Text>
            </View>

            <View style={styles.contractBox}>
                <Text style={styles.contractText}>
                    "El presente documento certifica la intención de arriendo de la parcela para la fecha señalada.
                    Para confirmar la reserva, el cliente deberá transferir el 50% del total.
                    Al firmar este documento, se aceptan las normas de uso y convivencia de la propiedad."
                </Text>
            </View>

            <View style={styles.signatureArea}>
                <View style={styles.signatureLine}><Text>Firma Cliente</Text></View>
                <View style={styles.signatureLine}><Text>Administración</Text></View>
            </View>
        </Page>
    </Document>
);

export default ContratoPDF;