const depositDocuments = ['Aadhaar card', 'PAN card', 'Three photos'];
const securedDocuments = ['Aadhaar card', 'PAN card', 'Bank details'];
const loanDocuments = [
  'Aadhaar card', 'PAN card', 'Income certificate', 'Light bill', 'Six photos',
  '2 cheques', 'Bank statement — 6 months', 'Ration card', 'NOC from family member',
];

export const deposits = [
  {
    id: 'savings-account', name: 'Savings Account', category: 'EVERYDAY SAVINGS',
    tagline: 'Do not save what is left after spending, but spend what is left after saving.',
    highlight: '3.5%', highlightLabel: 'Interest rate',
    features: ['Easy transactions', 'Mobile banking', 'QR code', 'Zero balance account if opened online'],
    rate: '3.5%', eligibility: ['No age limit', 'Any individual who is an Indian citizen'],
    documents: depositDocuments,
  },
  {
    id: 'current-account', name: 'Current Account', category: 'FOR YOUR BUSINESS',
    tagline: 'Chase the vision, not the money, the money will end up following you.',
    highlight: 'No withdrawal limit', highlightLabel: 'Everyday business convenience',
    features: ['No limit on maximum deposit amount', 'No limit on withdrawals'],
    rate: 'No interest is paid on the Current Account.',
    eligibility: ['Age limit', 'Private and public limited companies', 'Partnership companies', 'Sole proprietorship'],
    documents: [
      'Rubber Stamp: Proprietor / Private Limited / Limited Liability Partnership (LLP) / Partnership firm',
      'Aadhaar card', 'Personal and Business PAN card', 'Three photos', 'Business letterhead',
      'Form G', 'MOA & AOA', 'Certificate of Registration',
    ],
  },
  {
    id: 'recurring-deposits', name: 'Recurring Deposits', category: 'ONE STEP AT A TIME',
    tagline: 'Recurring Deposits, build your savings bit by bit.',
    highlight: '6.50% to 8.00%', highlightLabel: 'Interest rate',
    features: ['Minimum investment: Rs 500', 'No maximum amount limit'],
    rate: '6.50% to 8.00%', eligibility: ['No age limit'], documents: depositDocuments,
  },
  {
    id: 'fixed-deposits', name: 'Fixed Deposits', category: 'SAVE FOR TOMORROW',
    tagline: 'Fixed Deposit for your future.',
    highlight: '5.5% to 9%', highlightLabel: 'Interest rate',
    features: ['No maximum deposit limit'], rate: '5.5% to 9%',
    benefit: '0.25% extra on Fixed Deposit returns for Senior Citizens and Ladies',
    eligibility: ['No age limit'], documents: depositDocuments,
  },
  {
    id: 'dam-duppat-deposits', name: 'DAM Duppat Deposits', category: 'A BIGGER TOMORROW',
    tagline: 'Invest a minimum amount of Rs 5,000 and above and get double the amount in 96 months.',
    highlight: '96 months', highlightLabel: 'To double your deposit',
  },
  {
    id: 'lakhpati-deposit', name: 'Lakhpati Deposit', category: 'SAVE WITH A GOAL',
    tagline: 'Smart today for better tomorrow',
    highlight: 'Your goal, your plan', highlightLabel: 'Explore the deposit tables',
    tables: [
      { caption: 'Table A', headers: ['Deposit Amount', 'Period', 'Maturity Amount'], rows: [
        ['1,400', '60', '1,00,000'], ['2,800', '60', '2,00,000'], ['4,200', '60', '3,00,000'],
        ['5,600', '60', '4,00,000'], ['7,000', '60', '5,00,000'], ['14,000', '60', '10,00,000'],
        ['21,000', '60', '15,00,000'], ['28,000', '60', '20,00,000'], ['35,000', '60', '25,00,000'],
      ] },
      { caption: 'Table B', headers: ['Deposit Amount', 'Period', 'Maturity Amount'], rows: [
        ['8,050', '12', '1,00,000'], ['3,900', '24', '1,00,000'], ['2,510', '36', '1,00,000'],
        ['1,820', '48', '1,00,000'], ['1,400', '60', '1,00,000'], ['1,130', '72', '1,00,000'],
      ] },
    ],
  },
  {
    id: 'pension-deposits', name: 'Pension Deposits', category: 'YOUR NEXT CHAPTER',
    tagline: 'May your retirement be filled with many relaxing days and exciting new adventures. Invest now to have relaxing days.',
    highlight: '7.50% · 8.00% · 9.00%', highlightLabel: 'Interest by period',
    tables: [{ caption: 'Pension Deposit rates', headers: ['Period', 'Interest'], rows: [
      ['12', '7.50%'], ['24', '8.00%'], ['36', '9.00%'],
    ] }],
  },
  {
    id: 'daily-deposit', name: 'Daily Deposit', category: 'MAKE SAVING A HABIT',
    tagline: "If you don't make putting money away for the future a priority, you'll never get around to doing it.",
    highlight: '5% to 7%', highlightLabel: 'Interest rate',
    features: ['Can be opened with a minimum balance of Rs 50', 'No maximum deposit amount'],
    rate: '5% to 7%', eligibility: ['No age limit', 'No maximum amount limit'], documents: depositDocuments,
  },
];

export const loans = [
  {
    id: 'personal-loan', name: 'Personal Loan', category: 'FOR LIFE’S POSSIBILITIES',
    tagline: 'Are you choosing the best personal loan for your needs?',
    highlight: 'Up to Rs 1,00,000', highlightLabel: 'Loan limit',
    features: ['Loan limit up to Rs 1,00,000', 'Tenure: 12 to 24 months', 'Easy EMI facility'],
    rate: '18%', eligibility: ['Age 21 to 55 years'], documents: loanDocuments,
  },
  {
    id: 'gold-loan', name: 'Gold Loan', category: 'UNLOCK POSSIBILITIES',
    tagline: 'A dream comes true, sponsored by your Gold.',
    highlight: 'Fast processing', highlightLabel: 'Less documentation',
    features: ['Less documentation', 'Fast processing'],
    eligibility: ['18 years and above'], documents: securedDocuments,
  },
  {
    id: 'loan-against-deposits', name: 'Loan Against Deposits', category: 'KEEP YOUR SAVINGS GROWING',
    tagline: 'Need not break Fixed Deposits; get quick disbursal of a loan against Fixed Deposits.',
    highlight: 'Keep your Fixed Deposits', highlightLabel: 'Borrow against your savings',
    rate: '2% more than the rate of returns of the deposits',
    eligibility: ['18 years and above'], documents: securedDocuments,
  },
  {
    id: 'mortgage-loan', name: 'Mortgage Loan', category: 'ROOM FOR YOUR PLANS',
    tagline: 'Mortgage. To help you build, buy or refinance.',
    highlight: 'Rs 1,00,000 to Rs 5,00,000', highlightLabel: 'Loan limit',
    features: ['Loan limit: minimum Rs 1,00,000 up to Rs 5,00,000', 'Tenure: 24 to 36 months'],
    rate: '18%',
    eligibility: ['Age 21 to 55 years', 'Registration of mortgage is mandatory for loans in branches outside Mumbai'],
    documents: [...loanDocuments.slice(0, -1), 'NOC from a family member', 'A room or flat mortgage is mandatory for the above loan'],
  },
  {
    id: 'daily-loan', name: 'Daily 100 days Loan / 200 days Loan', category: 'MOVE YOUR BUSINESS FORWARD',
    tagline: 'Need super fast approved loans?',
    highlight: '100 days / 200 days', highlightLabel: 'Daily-basis collection',
    features: ['Daily-basis collection', 'Less documentation'],
    eligibility: ['Age 20 to 57 years', 'Business oriented'],
    documents: ['Aadhaar card', 'PAN card', 'Light bill', 'Gumasta license', '2 cheques', 'Bank details and statement', 'Income certificate'],
  },
  {
    id: 'jlg-loan', name: 'JLG Loan', category: 'STRONGER TOGETHER',
    tagline: 'Behind every successful woman is a tribe of other successful women, who have her back.',
    highlight: 'Women supporting women', highlightLabel: 'A loan for a group of women',
    features: ['Only for a group of women', 'Only for married women with 2 years of marriage stability'],
    eligibility: ['Age 21 to 56 years', 'Not applicable to rented customers'],
    documents: ['Aadhaar card', 'PAN card / Voter ID', 'Light bill', 'Bank details', 'Marriage proof'],
  },
  {
    id: 'pdc-loan', name: 'PDC Loan', category: 'TAKE YOUR NEXT STEP',
    tagline: 'Stop being chained down by bad credit, we have the key to set you free.',
    highlight: 'Rs 25,000 to Rs 1,00,000', highlightLabel: 'Loan limit',
    features: ['Loan limit: Rs 25,000 up to Rs 1,00,000', 'Easy EMI facility'],
    rate: '18%', eligibility: ['Age 21 to 55 years'], documents: loanDocuments,
  },
];
