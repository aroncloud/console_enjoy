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

export const formatDate = (dt:any) => {
  const date = new Date(dt);

  if (isNaN(date.getTime())) {
    return 'Date invalide';
  }

  const pad = (n:number) => (n < 10 ? '0' + n : n);

  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}