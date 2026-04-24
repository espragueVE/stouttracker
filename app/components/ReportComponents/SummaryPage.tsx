import React from "react";

interface SummaryTotals {
  receiptsUnitemized: number;
  receiptsItemized: number;
  receiptsLoansReceived: number;
  receiptsInterestReceived: number;
  disbursementsExpenditures: number;
  disbursementsLoanPayments: number;
  disbursementsObligationPayments: number;
  inKindUnitemized: number;
  inKindItemized: number;
  obligationsOutstanding: number;
}

interface SummaryPageProps {
  candidateOrCommitteeName?: string;
  reportStartDate?: string;
  reportEndDate?: string;
  totals: SummaryTotals;
}

const styles = {
  sheet: {
    width: "816px",
    minHeight: "1056px",
    margin: "0 auto",
    background: "#ffffff",
    color: "#111111",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "12.4px",
    lineHeight: 1.12,
    boxSizing: "border-box" as const,
    padding: "30px 44px 16px 44px",
    display: "flex",
    flexDirection: "column" as const,
  },
  bodyWrap: {
    flex: 1,
  },
  title: {
    textAlign: "center" as const,
    fontSize: "21px",
    fontWeight: 800,
    margin: "0 0 8px 0",
    textTransform: "uppercase" as const,
    letterSpacing: "0.2px",
  },
  thickRule: {
    borderBottom: "2px solid #111111",
    margin: "6px 0 8px 0",
  },
  row: {
    display: "flex",
    alignItems: "baseline",
    gap: "6px",
    fontSize: "14px",
    marginBottom: "8px",
    whiteSpace: "nowrap" as const,
  },
  label: {
    fontWeight: 600,
  },
  line: {
    borderBottom: "1px solid #111111",
    minHeight: "22px",
    display: "inline-flex",
    alignItems: "flex-end",
    justifyContent: "flex-end",
    padding: "0 4px",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  sectionHeading: {
    fontWeight: 700,
    fontSize: "16px",
    margin: "10px 0 4px 0",
  },
  lineItem: {
    display: "flex",
    alignItems: "baseline",
    gap: "6px",
    marginBottom: "4px",
    fontSize: "13px",
  },
  prefix: {
    width: "28px",
    textAlign: "right" as const,
    marginRight: "4px",
  },
  dots: {
    flex: 1,
    borderBottom: "1px dotted #111111",
    transform: "translateY(-2px)",
    margin: "0 4px",
  },
  amountWrap: {
    display: "inline-flex",
    alignItems: "baseline",
    gap: "3px",
    minWidth: "182px",
    justifyContent: "flex-end",
  },
  amountLine: {
    borderBottom: "1px solid #111111",
    minWidth: "150px",
    textAlign: "right" as const,
    padding: "0 4px",
  },
};

function asText(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function formatDate(value: string | null | undefined) {
  if (!value) return "";
  const parts = value.split(/[-/]/g).filter(Boolean);
  if (parts.length >= 3) {
    const [y, m, d] = parts;
    if (y.length === 4) {
      return `${m.padStart(2, "0")}/${d.padStart(2, "0")}/${y}`;
    }
  }

  const compact = value.replace(/\D/g, "");
  if (compact.length === 8) {
    return `${compact.slice(4, 6)}/${compact.slice(6, 8)}/${compact.slice(0, 4)}`;
  }

  return value;
}

function formatMoney(value: number | string | null | undefined) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(parsed)) {
    return "0.00";
  }

  return parsed.toFixed(2);
}

function LineField({ value, width }: { value?: string | number | null; width: string }) {
  return <span style={{ ...styles.line, width }}>{asText(value)}</span>;
}

function AmountLine({ value }: { value: number }) {
  return (
    <span style={styles.amountWrap}>
      <span>$</span>
      <span style={styles.amountLine}>{formatMoney(value)}</span>
    </span>
  );
}

export const SummaryPage: React.FC<SummaryPageProps> = ({
  candidateOrCommitteeName = "",
  reportStartDate = "",
  reportEndDate = "",
  totals,
}) => {
  const totalReceipts =
    totals.receiptsUnitemized +
    totals.receiptsItemized +
    totals.receiptsLoansReceived +
    totals.receiptsInterestReceived;

  const totalDisbursements =
    totals.disbursementsExpenditures +
    totals.disbursementsLoanPayments +
    totals.disbursementsObligationPayments;

  const totalInKind = totals.inKindUnitemized + totals.inKindItemized;

  return (
    <div style={styles.sheet}>
      <div style={styles.bodyWrap}>
        <h1 style={styles.title}>SUMMARY PAGE - CANDIDATE</h1>
        <div style={styles.thickRule} />

        <div style={styles.row}>
          <span style={styles.label}>13. Name of Candidate or Committee:</span>
          <LineField value="Darrin Stout For Sheriff" width="420px" />
        </div>

        <div style={styles.row}>
          <span style={styles.label}>14. Reporting Period:</span>
          <span style={styles.label}>Start Date:</span>
          <LineField value={formatDate(reportStartDate)} width="150px" />
          <span style={styles.label}>End Date:</span>
          <LineField value={formatDate(reportEndDate)} width="150px" />
        </div>

        <div style={styles.sectionHeading}>15. Receipts:</div>
        <div style={styles.lineItem}>
          <span style={styles.prefix}>a.</span>
          <span>Unitemized Contributions ($100 or less from each source this period)</span>
          <span style={styles.dots} />
          <AmountLine value={totals.receiptsUnitemized} />
        </div>
        <div style={styles.lineItem}>
          <span style={styles.prefix}>b.</span>
          <span>Itemized Contributions (over $100 from each source this period)</span>
          <span style={styles.dots} />
          <AmountLine value={totals.receiptsItemized} />
        </div>
        <div style={styles.lineItem}>
          <span style={styles.prefix}>c.</span>
          <span>Loans Received This Reporting Period</span>
          <span style={styles.dots} />
          <AmountLine value={totals.receiptsLoansReceived} />
        </div>
        <div style={styles.lineItem}>
          <span style={styles.prefix}>d.</span>
          <span>Interest Received This Reporting Period</span>
          <span style={styles.dots} />
          <AmountLine value={totals.receiptsInterestReceived} />
        </div>
        <div style={styles.lineItem}>
          <span style={styles.prefix}>e.</span>
          <span>Total Receipts (add 15a, 15b, 15c, and 15d)</span>
          <span style={styles.dots} />
          <AmountLine value={totalReceipts} />
        </div>

        <div style={styles.sectionHeading}>16. Disbursements:</div>
        <div style={styles.lineItem}>
          <span style={styles.prefix}>a.</span>
          <span>Total Expenditures (other than loan payments)</span>
          <span style={styles.dots} />
          <AmountLine value={totals.disbursementsExpenditures} />
        </div>
        <div style={styles.lineItem}>
          <span style={styles.prefix}>b.</span>
          <span>Loan Payments Made This Period</span>
          <span style={styles.dots} />
          <AmountLine value={totals.disbursementsLoanPayments} />
        </div>
        <div style={styles.lineItem}>
          <span style={styles.prefix}>c.</span>
          <span>Total Obligation Payments Made This Period</span>
          <span style={styles.dots} />
          <AmountLine value={totals.disbursementsObligationPayments} />
        </div>
        <div style={styles.lineItem}>
          <span style={styles.prefix}>d.</span>
          <span>Total Disbursements (add 16a, 16b, and 16c)</span>
          <span style={styles.dots} />
          <AmountLine value={totalDisbursements} />
        </div>

        <div style={styles.sectionHeading}>17. In-Kind Contributions:</div>
        <div style={styles.lineItem}>
          <span style={styles.prefix}>a.</span>
          <span>Unitemized In-Kind Contributions Received This Period</span>
          <span style={styles.dots} />
          <AmountLine value={totals.inKindUnitemized} />
        </div>
        <div style={styles.lineItem}>
          <span style={styles.prefix}>b.</span>
          <span>Itemized In-Kind Contributions Received This Period</span>
          <span style={styles.dots} />
          <AmountLine value={totals.inKindItemized} />
        </div>
        <div style={styles.lineItem}>
          <span style={styles.prefix}>c.</span>
          <span>Total In-Kind Contributions Received This Period</span>
          <span style={styles.dots} />
          <AmountLine value={totalInKind} />
        </div>

        <div style={styles.sectionHeading}>18. Obligations:</div>
        <div style={styles.lineItem}>
          <span style={styles.prefix}>a.</span>
          <span>Total Obligations Outstanding</span>
          <span style={styles.dots} />
          <AmountLine value={totals.obligationsOutstanding} />
        </div>
      </div>
    </div>
  );
};

export default SummaryPage;
