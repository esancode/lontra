export function formatDate(data) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(data));
}