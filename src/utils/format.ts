export const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

export const formatNumber = (value: number): string => {
  return value.toLocaleString('pt-BR');
};