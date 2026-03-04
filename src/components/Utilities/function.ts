 export const formatCurrency = (value: number | string): string => {
  if (typeof value === 'string') {
    value = parseFloat(value);
  }
  if (isNaN(value)) {
    return '';
  }
   return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0
  }).format(value) 
}