// Mock data — replace with real API calls (see src/api/).

export const rooms = [
  {
    id: '204',
    number: '204',
    type: 'Familiar',
    title: 'Habitación Familiar 204',
    capacity: 4,
    price: 142,
    status: 'Disponible',
    description: 'Amplia, vista al jardín, cama king + sofá cama, capacidad 4 personas.',
  },
  {
    id: '108',
    number: '108',
    type: 'Individual',
    title: 'Habitación Individual 108',
    capacity: 1,
    price: 78,
    status: 'Ocupada',
    description: 'Cómoda y luminosa, ideal para viajes de trabajo, escritorio incluido.',
  },
  {
    id: '301',
    number: '301',
    type: 'Familiar',
    title: 'Habitación Familiar 301',
    capacity: 4,
    price: 196,
    status: 'Disponible',
    description:
      'Suite superior con terraza privada y vista a la piscina, decorada en tonos cálidos y neutros. Cama king, sofá cama para dos, baño con bañera y set de amenities de cortesía.',
  },
  {
    id: '112',
    number: '112',
    type: 'Individual',
    title: 'Habitación Individual 112',
    capacity: 1,
    price: 82,
    status: 'Mantenimiento',
    description: 'En mantenimiento preventivo.',
  },
];

export const myBookings = [
  { id: 'b1', roomTitle: 'Habitación Familiar 301', dates: '14–17 ago 2026', nights: 3, total: 588, status: 'Confirmada' },
  { id: 'b2', roomTitle: 'Habitación Individual 108', dates: '2–4 jun 2026', nights: 2, total: 156, status: 'Completada' },
  { id: 'b3', roomTitle: 'Habitación Familiar 204', dates: '20–21 mar 2026', nights: 1, total: 142, status: 'Cancelada' },
];

export const adminBookings = [
  { id: 'r1', client: 'Ana Torres', room: '301 · Familiar', dates: '14–17 ago', total: 588, status: 'Confirmada' },
  { id: 'r2', client: 'Luis Prada', room: '108 · Individual', dates: '2–4 jun', total: 156, status: 'Completada' },
  { id: 'r3', client: 'Marta Ibáñez', room: '204 · Familiar', dates: '20–21 mar', total: 142, status: 'Cancelada' },
];
