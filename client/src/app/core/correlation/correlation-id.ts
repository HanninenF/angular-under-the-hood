export function createCorrelationId(prefix: string): string {
  const now = new Date();
  console.log('new Date():', now);

  const time =
    now.getHours().toString().padStart(2, '0') +
    now.getMinutes().toString().padStart(2, '0') +
    now.getSeconds().toString().padStart(2, '0') +
    now.getMilliseconds().toString();

  console.log(
    "now.getHours().toString().padStart(2, '0'): ",
    now.getHours().toString().padStart(2, '0'),
  );
  console.log(
    "now.getMinutes().toString().padStart(2, '0'): ",
    now.getMinutes().toString().padStart(2, '0'),
  );
  console.log(
    "now.getSeconds().toString().padStart(2, '0'): ",
    now.getSeconds().toString().padStart(2, '0'),
  );

  const random = Math.random().toString(36).slice(2, 6);

  return `${prefix}-${time}-${random}`;
}

export function getShortCorrelationId(id: string): string {
  const parts = id.split('-');

  if (parts.length < 2) {
    return id;
  }

  return `${parts[0]}-${parts.at(-1)}`;
}
