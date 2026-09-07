export function calculateEmi(principal, annualRate, months) {
  const amount = Number(principal);
  const instalments = Number(months);
  const monthlyRate = Number(annualRate) / 1200;
  if (!amount || !instalments || monthlyRate < 0) return { emi: 0, principal: amount || 0, interest: 0, total: amount || 0 };
  const factor = (1 + monthlyRate) ** instalments;
  const emi = monthlyRate === 0 ? amount / instalments : amount * monthlyRate * factor / (factor - 1);
  const total = emi * instalments;
  return { emi, principal: amount, interest: total - amount, total };
}

export function calculateFixedDeposit(principal, annualRate, months) {
  const invested = Number(principal) || 0;
  const returns = invested * (Number(annualRate) || 0) * (Number(months) || 0) / 1200;
  return { invested, returns, maturity: invested + returns };
}

export function calculateRecurringDeposit(monthlyInvestment, annualRate, months) {
  const monthly = Number(monthlyInvestment) || 0;
  const duration = Number(months) || 0;
  const invested = monthly * duration;
  const returns = monthly * ((Number(annualRate) || 0) / 1200) * duration * (duration + 1) / 2;
  return { invested, returns, maturity: invested + returns };
}

export function formatRupees(value) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.round(value || 0));
}
