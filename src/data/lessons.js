// Each lesson introduces a new consonant. Playing "up to lesson X" includes
// all words from lessons 1..X, so kids practice previously learned letters too.

export const DEFAULT_LESSONS = [
  { id: 'vocales', name: 'Lección vocales',  newLetters: ['a','e','i','o','u'], order: 1 },
  { id: 'ojo',    name: 'Lección ojo',       newLetters: ['j'],                order: 2 },
  { id: 'mama',   name: 'Lección mamá',      newLetters: ['m'],                order: 3 },
  { id: 'mano',   name: 'Lección mano',      newLetters: ['n'],                order: 4 },
  { id: 'lana',   name: 'Lección lana',      newLetters: ['l'],                order: 5 },
  { id: 'loro',   name: 'Lección loro',      newLetters: ['r'],                order: 6 },
  { id: 'nido',   name: 'Lección nido',      newLetters: ['d'],                order: 7 },
  { id: 'pino',   name: 'Lección pino',      newLetters: ['p'],                order: 8 },
  { id: 'pato',   name: 'Lección pato',      newLetters: ['t'],                order: 9 },
  { id: 'gato',   name: 'Lección gato',      newLetters: ['g'],                order: 10 },
]

// Helper: returns all lessons with order <= the given lesson's order
export function getLessonsUpTo(lessons, lessonId) {
  const target = lessons.find(l => l.id === lessonId)
  if (!target) return lessons
  return lessons.filter(l => l.order <= target.order)
}

function w(id, text, type, lesson_id) {
  return { id, text, type, lesson_id, active: true }
}

export const DEFAULT_WORDS = [
  // ── Lección vocales ────────────────────────────────────────────────────────
  w('vocales_0',  'a',   'silaba', 'vocales'),
  w('vocales_1',  'e',   'silaba', 'vocales'),
  w('vocales_2',  'i',   'silaba', 'vocales'),
  w('vocales_3',  'o',   'silaba', 'vocales'),
  w('vocales_4',  'u',   'silaba', 'vocales'),
  w('vocales_5',  'ae',  'silaba', 'vocales'),
  w('vocales_6',  'ai',  'silaba', 'vocales'),
  w('vocales_7',  'ao',  'silaba', 'vocales'),
  w('vocales_8',  'au',  'silaba', 'vocales'),
  w('vocales_9',  'ea',  'silaba', 'vocales'),
  w('vocales_10', 'ei',  'silaba', 'vocales'),
  w('vocales_11', 'eo',  'silaba', 'vocales'),
  w('vocales_12', 'eu',  'silaba', 'vocales'),
  w('vocales_13', 'ia',  'silaba', 'vocales'),
  w('vocales_14', 'ie',  'silaba', 'vocales'),
  w('vocales_15', 'io',  'silaba', 'vocales'),
  w('vocales_16', 'iu',  'silaba', 'vocales'),
  w('vocales_17', 'oa',  'silaba', 'vocales'),
  w('vocales_18', 'oe',  'silaba', 'vocales'),
  w('vocales_19', 'oi',  'silaba', 'vocales'),
  w('vocales_20', 'ua',  'silaba', 'vocales'),
  w('vocales_21', 'ue',  'silaba', 'vocales'),
  w('vocales_22', 'ui',  'silaba', 'vocales'),
  w('vocales_23', 'uo',  'silaba', 'vocales'),

  // ── Lección ojo (+J) ───────────────────────────────────────────────────────
  w('ojo_0', 'ají',  'palabra', 'ojo'),
  w('ojo_1', 'ojo',  'palabra', 'ojo'),
  w('ojo_2', 'ajo',  'palabra', 'ojo'),
  w('ojo_3', 'eje',  'palabra', 'ojo'),

  // ── Lección mamá (+M) ──────────────────────────────────────────────────────
  w('mama_0',  'mamá',             'palabra', 'mama'),
  w('mama_1',  'mima',             'palabra', 'mama'),
  w('mama_2',  'memo',             'palabra', 'mama'),
  w('mama_3',  'mina',             'palabra', 'mama'),
  w('mama_4',  'amé',              'palabra', 'mama'),
  w('mama_5',  'amo',              'palabra', 'mama'),
  w('mama_6',  'mía',              'palabra', 'mama'),
  w('mama_7',  'miau',             'palabra', 'mama'),
  w('mama_8',  'mimo',             'palabra', 'mama'),
  w('mama_9',  'mama',             'palabra', 'mama'),
  w('mama_10', 'mame',             'palabra', 'mama'),
  w('mama_11', 'mío',              'palabra', 'mama'),
  w('mama_12', 'moai',             'palabra', 'mama'),
  w('mama_13', 'moja',             'palabra', 'mama'),
  w('mama_14', 'mojo',             'palabra', 'mama'),
  w('mama_15', 'momia',            'palabra', 'mama'),
  w('mama_16', 'mi mamá',          'frase',   'mama'),
  w('mama_17', 'mojo a mi moai',   'frase',   'mama'),

  // ── Lección mano (+N) ──────────────────────────────────────────────────────
  w('mano_0',  'mono',            'palabra', 'mano'),
  w('mano_1',  'mina',            'palabra', 'mano'),
  w('mano_2',  'maní',            'palabra', 'mano'),
  w('mano_3',  'enano',           'palabra', 'mano'),
  w('mano_4',  'ajeno',           'palabra', 'mano'),
  w('mano_5',  'manojo',          'palabra', 'mano'),
  w('mano_6',  'enojo',           'palabra', 'mano'),
  w('mano_7',  'jamón',           'palabra', 'mano'),
  w('mano_8',  'monja',           'palabra', 'mano'),
  w('mano_9',  'enojón',          'palabra', 'mano'),
  w('mano_10', 'mi mano',         'frase',   'mano'),
  w('mano_11', 'una monja',       'frase',   'mano'),
  w('mano_12', 'un mono enano',   'frase',   'mano'),

  // ── Lección lana (+L) ──────────────────────────────────────────────────────
  w('lana_0', 'lila',  'palabra', 'lana'),
  w('lana_1', 'luna',  'palabra', 'lana'),
  w('lana_2', 'lija',  'palabra', 'lana'),
  w('lana_3', 'jalea', 'palabra', 'lana'),
  w('lana_4', 'mula',  'palabra', 'lana'),
  w('lana_5', 'ola',   'palabra', 'lana'),
  w('lana_6', 'milo',  'palabra', 'lana'),

  // ── Lección loro (+R) ──────────────────────────────────────────────────────
  w('loro_0',  'aro',                        'palabra', 'loro'),
  w('loro_1',  'marino',                     'palabra', 'loro'),
  w('loro_2',  'mora',                       'palabra', 'loro'),
  w('loro_3',  'lirio',                      'palabra', 'loro'),
  w('loro_4',  'naranja',                    'palabra', 'loro'),
  w('loro_5',  'número',                     'palabra', 'loro'),
  w('loro_6',  'oreja',                      'palabra', 'loro'),
  w('loro_7',  'memoria',                    'palabra', 'loro'),
  w('loro_8',  'jurel',                      'palabra', 'loro'),
  w('loro_9',  'mamá mira mi muela',         'frase',   'loro'),
  w('loro_10', 'el minero mira la mina',     'frase',   'loro'),
  w('loro_11', 'el aro en la oreja',         'frase',   'loro'),

  // ── Lección nido (+D) ──────────────────────────────────────────────────────
  w('nido_0',  'dedal',                                        'palabra', 'nido'),
  w('nido_1',  'día',                                          'palabra', 'nido'),
  w('nido_2',  'dilema',                                       'palabra', 'nido'),
  w('nido_3',  'dominó',                                       'palabra', 'nido'),
  w('nido_4',  'mudo',                                         'palabra', 'nido'),
  w('nido_5',  'mundial',                                      'palabra', 'nido'),
  w('nido_6',  'nada',                                         'palabra', 'nido'),
  w('nido_7',  'marido',                                       'palabra', 'nido'),
  w('nido_8',  'duende',                                       'palabra', 'nido'),
  w('nido_9',  'la marejada dejó un jurel en la arena',        'frase',   'nido'),
  w('nido_10', 'al duende le duele el oído',                   'frase',   'nido'),

  // ── Lección pino (+P) ──────────────────────────────────────────────────────
  w('pino_0',  'apuro',                                       'palabra', 'pino'),
  w('pino_1',  'papel',                                       'palabra', 'pino'),
  w('pino_2',  'pipa',                                        'palabra', 'pino'),
  w('pino_3',  'pulmón',                                      'palabra', 'pino'),
  w('pino_4',  'pala',                                        'palabra', 'pino'),
  w('pino_5',  'pepino',                                      'palabra', 'pino'),
  w('pino_6',  'paloma',                                      'palabra', 'pino'),
  w('pino_7',  'pino',                                        'palabra', 'pino'),
  w('pino_8',  'pera',                                        'palabra', 'pino'),
  w('pino_9',  'pulmonía',                                    'palabra', 'pino'),
  w('pino_10', 'peral',                                       'palabra', 'pino'),
  w('pino_11', 'emparedado',                                  'palabra', 'pino'),
  w('pino_12', 'el puma empuja al pudú',                      'frase',   'pino'),
  w('pino_13', 'me da pena el pájaro en la pajarera',         'frase',   'pino'),

  // ── Lección pato (+T) ──────────────────────────────────────────────────────
  w('pato_0',  'temario',                                                     'palabra', 'pato'),
  w('pato_1',  'tela',                                                        'palabra', 'pato'),
  w('pato_2',  'atuendo',                                                     'palabra', 'pato'),
  w('pato_3',  'jote',                                                        'palabra', 'pato'),
  w('pato_4',  'lata',                                                        'palabra', 'pato'),
  w('pato_5',  'mate',                                                        'palabra', 'pato'),
  w('pato_6',  'lenteja',                                                     'palabra', 'pato'),
  w('pato_7',  'puente',                                                      'palabra', 'pato'),
  w('pato_8',  'diente',                                                      'palabra', 'pato'),
  w('pato_9',  'pelota',                                                      'palabra', 'pato'),
  w('pato_10', 'tina',                                                        'palabra', 'pato'),
  w('pato_11', 'tomate',                                                      'palabra', 'pato'),
  w('pato_12', 'patín',                                                       'palabra', 'pato'),
  w('pato_13', 'en la maleta meten la paleta, la pelota y la pala',           'frase',   'pato'),
  w('pato_14', 'la marioneta anda en patineta en el patio',                   'frase',   'pato'),

  // ── Lección gato (+G) ──────────────────────────────────────────────────────
  w('gato_0',  'agua',                                        'palabra', 'gato'),
  w('gato_1',  'golpe',                                       'palabra', 'gato'),
  w('gato_2',  'pegamento',                                   'palabra', 'gato'),
  w('gato_3',  'goma',                                        'palabra', 'gato'),
  w('gato_4',  'nogal',                                       'palabra', 'gato'),
  w('gato_5',  'mango',                                       'palabra', 'gato'),
  w('gato_6',  'lenguaje',                                    'palabra', 'gato'),
  w('gato_7',  'elegante',                                    'palabra', 'gato'),
  w('gato_8',  'garantía',                                    'palabra', 'gato'),
  w('gato_9',  'laguna',                                      'palabra', 'gato'),
  w('gato_10', 'galope',                                      'palabra', 'gato'),
  w('gato_11', 'el orangután mira el nogal',                  'frase',   'gato'),
  w('gato_12', 'la iguana tomó la última gota de agua',       'frase',   'gato'),
]
