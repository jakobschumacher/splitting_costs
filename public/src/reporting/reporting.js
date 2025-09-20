export const minimizePayments = (paymentMatrix) => {
  const transactions = [];

  if (!paymentMatrix.length) return transactions;

  // Separate payers (positive obligations) and receivers (negative obligations)
  const payers = paymentMatrix
    .filter((p) => p.netObligation > 0)
    .map((p) => ({ element: p.element, amount: p.netObligation }))
    .sort((a, b) => b.amount - a.amount);

  const receivers = paymentMatrix
    .filter((p) => p.netObligation < 0)
    .map((p) => ({ element: p.element, amount: Math.abs(p.netObligation) }))
    .sort((a, b) => a.amount - b.amount);

  // Handle exact matches first
  for (let i = payers.length - 1; i >= 0; i -= 1) {
    for (let j = receivers.length - 1; j >= 0; j -= 1) {
      if (Math.abs(payers[i].amount - receivers[j].amount) < 0.01) {
        transactions.push({
          from: payers[i].element,
          to: receivers[j].element,
          amount: Math.round(payers[i].amount * 100) / 100,
        });
        payers.splice(i, 1);
        receivers.splice(j, 1);
        break;
      }
    }
  }

  // Handle remaining obligations
  let payerIndex = 0;
  let receiverIndex = 0;

  while (payerIndex < payers.length && receiverIndex < receivers.length) {
    const payerAmount = payers[payerIndex].amount;
    const receiverAmount = receivers[receiverIndex].amount;
    const transferAmount = Math.min(payerAmount, receiverAmount);

    transactions.push({
      from: payers[payerIndex].element,
      to: receivers[receiverIndex].element,
      amount: Math.round(transferAmount * 100) / 100,
    });

    payers[payerIndex].amount -= transferAmount;
    receivers[receiverIndex].amount -= transferAmount;

    if (payers[payerIndex].amount < 0.01) payerIndex += 1;
    if (receivers[receiverIndex].amount < 0.01) receiverIndex += 1;
  }

  return transactions;
};

export const generateTransactionList = (transactions) => transactions.map((t) => {
  const amount = t.amount.toFixed(2);
  return `${t.from} pays ${t.to} €${amount}`;
});

export const generateSummaryReport = (paymentMatrix, summary) => {
  const totalParticipants = paymentMatrix.length;
  const { totalPaid } = summary;
  const totalOwed = summary.totalShould;
  const balanceCheck = Math.abs(totalPaid - totalOwed) < 0.01;

  // Categorize participants by payment status
  const overpaid = paymentMatrix.filter((p) => p.netObligation < -0.01);
  const underpaid = paymentMatrix.filter((p) => p.netObligation > 0.01);
  const balanced = paymentMatrix.filter((p) => Math.abs(p.netObligation) <= 0.01);

  // Activity breakdown
  const activities = Object.keys(summary.activities).map((activity) => ({
    name: activity,
    totalPaid: summary.activities[activity].totalPaid,
    totalShares: summary.activities[activity].totalWeightedShares,
    costPerUnit: Math.round(summary.activities[activity].costPerUnit * 100) / 100,
    paidBy: summary.activities[activity].paidBy,
    charges: summary.activities[activity].charges,
  }));

  return {
    totalParticipants,
    totalPaid,
    totalOwed,
    balanceCheck,
    activities,
    paymentStatus: {
      overpaid: overpaid.map((p) => ({
        name: p.element,
        excess: Math.abs(p.netObligation),
      })),
      underpaid: underpaid.map((p) => ({
        name: p.element,
        deficit: p.netObligation,
      })),
      balanced: balanced.map((p) => p.element),
    },
  };
};

export const generateCompleteReport = (calculationResult) => {
  const { paymentMatrix, summary } = calculationResult;

  const summaryReport = generateSummaryReport(paymentMatrix, summary);
  const transactions = minimizePayments(paymentMatrix);
  const instructions = generateTransactionList(transactions);

  return {
    paymentMatrix,
    summary: summaryReport,
    transactions,
    instructions,
    metadata: {
      generatedAt: new Date().toISOString(),
      totalTransactions: transactions.length,
      algorithm: 'Minimized payment transactions',
    },
  };
};
