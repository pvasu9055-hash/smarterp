const calculateGST = (taxableAmount, gstPercent, supplyType = 'intra') => {
  const totalGST = (taxableAmount * gstPercent) / 100;

  if (supplyType === 'inter') {
    return { cgst: 0, sgst: 0, igst: totalGST, totalTax: totalGST };
  }

  const half = totalGST / 2;
  return { cgst: half, sgst: half, igst: 0, totalTax: totalGST };
};

const getGSTRates = (gstPercent) => {
  return {
    cgst: gstPercent / 2,
    sgst: gstPercent / 2,
    igst: gstPercent
  };
};

module.exports = { calculateGST, getGSTRates };