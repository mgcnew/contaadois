/**
 * Formata um número para Real Brasileiro (BRL)
 */
export const formatCurrency = (value: number | string): string => {
    const amount = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(amount)) return 'R$ 0,00';
    
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(amount);
};

/**
 * Formata um número simples para exibição pt-BR (sem o símbolo R$)
 */
export const formatNumber = (value: number | string): string => {
    const amount = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(amount)) return '0,00';
    
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

/**
 * Converte uma string de input (com vírgula ou ponto) para número
 */
export const parseLocaleNumber = (value: string): number => {
    if (!value) return 0;
    // Remove tudo que não é número, vírgula ou ponto
    const cleanValue = value.replace(/[^\d.,]/g, '');
    // Se tiver vírgula, assume que é o separador decimal e remove pontos de milhar
    if (cleanValue.includes(',')) {
        return parseFloat(cleanValue.replace(/\./g, '').replace(',', '.'));
    }
    return parseFloat(cleanValue);
};

/**
 * Sanitiza o input enquanto o usuário digita (permite apenas números e uma vírgula/ponto)
 */
export const sanitizeCurrencyInput = (value: string): string => {
    // Permite apenas números e UMA ocorrência de ponto ou vírgula
    let clean = value.replace(/[^\d.,]/g, '');
    const parts = clean.split(/[.,]/);
    if (parts.length > 2) {
        clean = parts[0] + ',' + parts.slice(1).join('');
    }
    return clean;
};
