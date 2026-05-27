export const site = {
  name: 'Veterinaria Petropolis',
  tagline: 'Zona de Mascotas',
  description:
    'Veterinaria y centro de grooming en Ciudad de Guatemala. Atención profesional con trato familiar para tu mascota.',
  url: 'https://petropolis.example.com',
  locale: 'es_GT',
  whatsapp: {
    raw: '+50245867364',
    digits: '50245867364',
    pretty: '+502 4586-7364',
    base: 'https://wa.me/50245867364',
  },
  location: {
    plusCode: 'MCWC+J8Q',
    city: 'Ciudad de Guatemala',
    addressLine: 'Plus Code MCWC+J8Q, Ciudad de Guatemala',
    lat: 14.696417,
    lng: -90.579278,
    googleMapsUrl: 'https://maps.google.com/?q=14.696417,-90.579278',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=14.696417,-90.579278',
  },
  hours: {
    weekdays: 'Lun–Sáb',
    closing: '6:00 PM',
    fullText: 'Lunes a sábado, hasta las 6:00 PM',
    note: 'Horario placeholder — confirmar con el cliente',
  },
  rating: { value: 4.5, count: 27 },
  messages: {
    general: '¡Hola! Vi su página web y quisiera más información',
    grooming: '¡Hola! Me gustaría agendar grooming para mi mascota',
    vet: '¡Hola! Quisiera consultar sobre servicios veterinarios',
    products: '¡Hola! Quisiera consultar sobre concentrados y accesorios',
    emergency: '¡Hola! Tengo una emergencia con mi mascota',
  },
  services: {
    grooming: [
      'Baño tibio',
      'Secado y cepillado',
      'Corte de pelo',
      'Corte de uñas',
      'Limpieza de orejas',
      'Drenaje de glándulas anales',
      'Loción',
      'Accesorios',
    ],
    vet: [
      'Vacunas',
      'Pipetas y collares antipulgas',
      'Desparasitantes',
      'Concentrados',
      'Atención médica',
      'Accesorios para mascotas',
    ],
  },
} as const;

export type MessageKey = keyof typeof site.messages;
