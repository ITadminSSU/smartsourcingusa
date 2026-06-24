import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { InvoiceLine, InvoiceRecord } from "./invoices";

export type InvoicePdfData = {
  invoice: InvoiceRecord;
  lines: InvoiceLine[];
  employeeName: string;
  // Full (unmasked) bank details for the payment document; null if unavailable.
  bankName: string | null;
  bankAccount: string | null;
};

const BRAND = "#2c84c4";
const INK = "#111827";
const MUTED = "#6b7280";
const LINE = "#e5e7eb";

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 56,
    paddingHorizontal: 44,
    fontSize: 10,
    color: INK,
    fontFamily: "Helvetica",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  brand: { fontSize: 18, fontFamily: "Helvetica-Bold", color: BRAND },
  brandSub: { fontSize: 9, color: MUTED, marginTop: 2 },
  invoiceTitle: { fontSize: 22, fontFamily: "Helvetica-Bold", color: INK },
  invoiceNo: { fontSize: 11, color: MUTED, marginTop: 2 },
  metaRight: { textAlign: "right" },
  metaLine: { fontSize: 9, color: MUTED, marginBottom: 2 },
  metaValue: { color: INK, fontFamily: "Helvetica-Bold" },
  twoCol: { flexDirection: "row", justifyContent: "space-between", marginBottom: 22 },
  metaRowWrap: { flexDirection: "row", marginBottom: 2 },
  colLabel: {
    fontSize: 8,
    color: MUTED,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
    letterSpacing: 0.5,
  },
  strong: { fontFamily: "Helvetica-Bold", color: INK },
  mono: { fontFamily: "Courier" },
  table: { borderTopWidth: 1, borderTopColor: LINE, marginBottom: 16 },
  thRow: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    borderBottomWidth: 1,
    borderBottomColor: LINE,
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  tr: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: LINE,
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  th: { fontSize: 8, color: MUTED, fontFamily: "Helvetica-Bold", textTransform: "uppercase" },
  cDesc: { width: "34%" },
  cTrade: { width: "16%" },
  cClient: { width: "16%" },
  cHours: { width: "11%", textAlign: "right" },
  cRate: { width: "11%", textAlign: "right" },
  cAmount: { width: "12%", textAlign: "right" },
  totals: { flexDirection: "row", justifyContent: "flex-end" },
  totalsBox: { width: "42%" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  totalLabel: { color: MUTED },
  grandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: LINE,
    paddingTop: 6,
    marginTop: 3,
  },
  grandText: { fontSize: 12, fontFamily: "Helvetica-Bold", color: INK },
  statusPill: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    backgroundColor: BRAND,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 3,
    textTransform: "uppercase",
  },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 44,
    right: 44,
    fontSize: 8,
    color: MUTED,
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: LINE,
    paddingTop: 8,
  },
});

function money(n: string | number | null): string {
  if (n === null || n === undefined) return "-";
  return Number(n).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function statusColor(status: string): string {
  if (status === "paid") return "#16a34a";
  if (status === "approved") return BRAND;
  return "#d97706";
}

function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

// Renders "Label: value" as two sibling Text nodes. Avoids a @react-pdf v4
// quirk where a nested <Text>{expr}</Text> inside another <Text> can render
// empty (this was causing blank dates on the PDF).
function MetaRow({ label, value }: { label: string; value: string | null }) {
  return (
    <View style={styles.metaRowWrap}>
      <Text style={styles.metaLine}>{label}: </Text>
      <Text style={[styles.metaLine, styles.metaValue]}>{value ?? "-"}</Text>
    </View>
  );
}

function InvoiceDocument({ data }: { data: InvoicePdfData }) {
  const { invoice, lines } = data;
  return (
    <Document
      title={`Invoice ${invoice.invoice_no}`}
      author="Smart Sourcing USA"
      subject={`Invoice for ${data.employeeName}`}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.brand}>Smart Sourcing USA</Text>
            <Text style={styles.brandSub}>Staff Payroll</Text>
          </View>
          <View style={styles.metaRight}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNo}>{invoice.invoice_no}</Text>
            <Text style={[styles.statusPill, { backgroundColor: statusColor(invoice.status), marginTop: 6 }]}>
              {invoice.status}
            </Text>
          </View>
        </View>

        <View style={styles.twoCol}>
          <View style={{ width: "48%" }}>
            <Text style={styles.colLabel}>Bill To</Text>
            <Text style={styles.strong}>{invoice.bill_to}</Text>
          </View>
          <View style={{ width: "48%", alignItems: "flex-end" }}>
            <MetaRow label="Invoice date" value={invoice.invoice_date} />
            {invoice.coverage_start && invoice.coverage_end && (
              <MetaRow
                label="Coverage"
                value={`${invoice.coverage_start} - ${invoice.coverage_end}`}
              />
            )}
            {invoice.pay_date && <MetaRow label="Pay date" value={invoice.pay_date} />}
            <MetaRow label="Type" value={capitalize(invoice.type)} />
          </View>
        </View>

        <View style={styles.twoCol}>
          <View style={{ width: "48%" }}>
            <Text style={styles.colLabel}>Payee</Text>
            <Text style={styles.strong}>{data.employeeName}</Text>
          </View>
          <View style={{ width: "48%", alignItems: "flex-end" }}>
            <Text style={styles.colLabel}>Remit To</Text>
            {data.bankName ? (
              <>
                <Text style={styles.strong}>{data.bankName}</Text>
                <Text style={styles.mono}>{data.bankAccount ?? "-"}</Text>
              </>
            ) : (
              <Text style={{ color: "#b45309" }}>Bank details not on file</Text>
            )}
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.thRow}>
            <Text style={[styles.th, styles.cDesc]}>Description</Text>
            <Text style={[styles.th, styles.cTrade]}>Trade</Text>
            <Text style={[styles.th, styles.cClient]}>Client</Text>
            <Text style={[styles.th, styles.cHours]}>Hours</Text>
            <Text style={[styles.th, styles.cRate]}>Rate</Text>
            <Text style={[styles.th, styles.cAmount]}>Amount</Text>
          </View>
          {lines.map((l) => (
            <View key={l.id} style={styles.tr} wrap={false}>
              <Text style={styles.cDesc}>
                {l.description ?? "-"}
                {l.line_type !== "regular" ? `  (${l.line_type})` : ""}
              </Text>
              <Text style={styles.cTrade}>{l.trade ?? "-"}</Text>
              <Text style={styles.cClient}>{l.client ?? "-"}</Text>
              <Text style={styles.cHours}>{l.hours != null ? Number(l.hours).toFixed(2) : "-"}</Text>
              <Text style={styles.cRate}>{money(l.rate)}</Text>
              <Text style={styles.cAmount}>{money(l.amount)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text>{money(invoice.subtotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Bank fee (1%)</Text>
              <Text>{money(invoice.bank_fee)}</Text>
            </View>
            <View style={styles.grandRow}>
              <Text style={styles.grandText}>Total Due</Text>
              <Text style={styles.grandText}>{money(invoice.total_due)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer} fixed>
          Smart Sourcing USA - {invoice.invoice_no} - Generated {invoice.created_at}
        </Text>
      </Page>
    </Document>
  );
}

export async function renderInvoicePdf(data: InvoicePdfData): Promise<Buffer> {
  return renderToBuffer(<InvoiceDocument data={data} />);
}
