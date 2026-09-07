import React from './i18n/react';
import { useMemo, useState } from 'react';
import { calculateEmi, calculateFixedDeposit, calculateRecurringDeposit, formatRupees } from './calculator-utils';

function RangeField({ id, label, value, min, max, step, onChange, suffix = '', readOnly = false }) {
  const numeric = Number(value);
  const percent = max === min ? 100 : ((numeric - min) / (max - min)) * 100;
  return <div className={`calc-field ${readOnly ? 'is-readonly' : ''}`}>
    <div className="calc-field-head"><label htmlFor={`${id}-number`}>{label}</label>{readOnly && <span>Published rate</span>}</div>
    <div className="calc-value-wrap"><input id={`${id}-number`} type="number" inputMode="decimal" min={min} max={max} step={step} value={value} readOnly={readOnly} onChange={event => onChange(Number(event.target.value))} /><span>{suffix}</span></div>
    {!readOnly && <input id={`${id}-range`} className="calc-range" aria-label={`${label} slider`} type="range" min={min} max={max} step={step} value={value} style={{ '--range-progress': `${percent}%` }} onChange={event => onChange(Number(event.target.value))} />}
  </div>;
}

function ResultRing({ invested, returns, label }) {
  const total = invested + returns;
  const share = total ? Math.max(0, Math.min(100, invested / total * 100)) : 100;
  return <div className="result-ring" style={{ '--principal-share': `${share}%` }} aria-label={`${label}: ${share.toFixed(1)} percent principal and ${(100 - share).toFixed(1)} percent estimated return or interest`}>
    <div><span>{label}</span><strong>{Math.round(100 - share)}%</strong><small>growth share</small></div>
  </div>;
}

function ResultRows({ items }) {
  return <dl className="calc-results">{items.map(([label, value, emphasis]) => <div className={emphasis ? 'is-total' : ''} key={label}><dt>{label}</dt><dd key={`${label}-${Math.round(value)}`}>{formatRupees(value)}</dd></div>)}</dl>;
}

const loanPlans = [
  { id: 'personal', name: 'Personal Loan', amountMin: 10000, amountMax: 100000, amount: 75000, tenureMin: 12, tenureMax: 24, tenure: 18, rate: 18 },
  { id: 'mortgage', name: 'Mortgage Loan', amountMin: 100000, amountMax: 500000, amount: 300000, tenureMin: 24, tenureMax: 36, tenure: 30, rate: 18 },
];

export function LoanCalculator() {
  const [planIndex, setPlanIndex] = useState(0);
  const plan = loanPlans[planIndex];
  const [amounts, setAmounts] = useState(loanPlans.map(item => item.amount));
  const [tenures, setTenures] = useState(loanPlans.map(item => item.tenure));
  const amount = amounts[planIndex];
  const tenure = tenures[planIndex];
  const result = useMemo(() => calculateEmi(amount, plan.rate, tenure), [amount, plan.rate, tenure]);
  const setAmount = value => setAmounts(values => values.map((item, index) => index === planIndex ? Math.max(plan.amountMin, Math.min(plan.amountMax, value || plan.amountMin)) : item));
  const setTenure = value => setTenures(values => values.map((item, index) => index === planIndex ? Math.max(plan.tenureMin, Math.min(plan.tenureMax, value || plan.tenureMin)) : item));
  return <section className="financial-calculator loan-calculator product-reveal" aria-labelledby="loan-calculator-title">
    <div className="calculator-intro"><span className="product-kicker">PLAN THE REPAYMENT</span><h2 id="loan-calculator-title">See the monthly<br /><em>shape of your loan.</em></h2><p>Choose a Sakhi loan with a published rate, then adjust the amount and tenure within its published limits.</p><div className="calc-plan-tabs" role="tablist" aria-label="Loan to estimate">{loanPlans.map((item, index) => <button key={item.id} role="tab" aria-selected={index === planIndex} onClick={() => setPlanIndex(index)}>{item.name}<span>{item.rate}%</span></button>)}</div></div>
    <div className="calculator-workspace">
      <div className="calculator-controls">
        <RangeField id="loan-amount" label="Loan Amount" value={amount} min={plan.amountMin} max={plan.amountMax} step={5000} onChange={setAmount} suffix="₹" />
        <RangeField id="loan-rate" label="Annual Interest Rate" value={plan.rate} min={plan.rate} max={plan.rate} step={0.1} onChange={() => {}} suffix="%" readOnly />
        <RangeField id="loan-tenure" label="Loan Tenure" value={tenure} min={plan.tenureMin} max={plan.tenureMax} step={1} onChange={setTenure} suffix="months" />
      </div>
      <div className="calculator-visual"><ResultRing invested={result.principal} returns={result.interest} label="Interest" /><ResultRows items={[["Monthly EMI", result.emi, true], ["Principal Amount", result.principal], ["Total Interest", result.interest], ["Total Amount Payable", result.total, true]]} /></div>
    </div>
    <p className="calculator-disclaimer">Illustrative estimate only. Actual eligibility, rates and repayment terms may vary.</p>
  </section>;
}

export function DepositCalculator() {
  const [kind, setKind] = useState('fd');
  const [amount, setAmount] = useState(100000);
  const [monthly, setMonthly] = useState(5000);
  const [rate, setRate] = useState(7.5);
  const [months, setMonths] = useState(24);
  const limits = kind === 'fd' ? { min: 5.5, max: 9 } : { min: 6.5, max: 8 };
  const changeKind = next => {
    setKind(next);
    setRate(next === 'fd' ? 7.5 : 7);
  };
  const result = useMemo(() => kind === 'fd' ? calculateFixedDeposit(amount, rate, months) : calculateRecurringDeposit(monthly, rate, months), [kind, amount, monthly, rate, months]);
  return <section className="financial-calculator deposit-calculator product-reveal" aria-labelledby="deposit-calculator-title">
    <div className="calculator-intro"><span className="product-kicker">GIVE YOUR GOAL A NUMBER</span><h2 id="deposit-calculator-title">Explore how steady<br /><em>saving can grow.</em></h2><p>Use Sakhi’s published rate ranges to create a simple illustrative estimate.</p><div className="calc-plan-tabs" role="tablist" aria-label="Deposit type">{[['fd', 'Fixed Deposit', '5.5%–9%'], ['rd', 'Recurring Deposit', '6.5%–8%']].map(([id, label, range]) => <button key={id} role="tab" aria-selected={kind === id} onClick={() => changeKind(id)}>{label}<span>{range}</span></button>)}</div></div>
    <div className="calculator-workspace">
      <div className="calculator-controls">
        {kind === 'fd' ? <RangeField id="deposit-amount" label="Investment Amount" value={amount} min={5000} max={1000000} step={5000} onChange={value => setAmount(Math.max(5000, Math.min(1000000, value || 5000)))} suffix="₹" /> : <RangeField id="monthly-investment" label="Monthly Investment" value={monthly} min={500} max={100000} step={500} onChange={value => setMonthly(Math.max(500, Math.min(100000, value || 500)))} suffix="₹" />}
        <RangeField id="deposit-rate" label="Interest Rate" value={rate} min={limits.min} max={limits.max} step={0.05} onChange={value => setRate(Math.max(limits.min, Math.min(limits.max, value || limits.min)))} suffix="%" />
        <RangeField id="deposit-tenure" label={kind === 'fd' ? 'Tenure' : 'Investment Duration'} value={months} min={6} max={120} step={1} onChange={value => setMonths(Math.max(6, Math.min(120, value || 6)))} suffix="months" />
      </div>
      <div className="calculator-visual"><ResultRing invested={result.invested} returns={result.returns} label="Returns" /><ResultRows items={[[kind === 'fd' ? 'Invested Amount' : 'Total Invested', result.invested], ['Estimated Returns', result.returns], ['Estimated Maturity Value', result.maturity, true]]} /></div>
    </div>
    <div className="calculator-disclaimer"><strong>Illustrative estimate.</strong> Uses simple interest with no compounding, taxes, charges or penalties. Recurring Deposit contributions are modelled at the beginning of each month. This is not an official maturity quotation.</div>
  </section>;
}
