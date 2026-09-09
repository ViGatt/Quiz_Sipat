// Formatação apenas para EXIBIÇÃO. A importação da planilha do RH grava o
// CPF sem pontuação, e busca/consulta/check-in continuam usando o valor cru
// — nunca troque essas comparações pelo resultado desta função.
export function formatarCpf(cpf: string): string {
  const digitos = (cpf || '').replace(/\D/g, '');
  if (digitos.length !== 11) return cpf;
  return digitos.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}
