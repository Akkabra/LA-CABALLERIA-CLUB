import { Activity, HorseProfile, Benefit, GalleryPhoto, ClassType, Instructor } from '../types';

export const CLUB_INFO = {
  name: 'LA CABALLERÍA',
  descriptor: 'Club de Equitación',
  slogan: 'Formando jinetes, creando experiencias.',
  website: 'www.caballeriaclub.com',
  officialEmail: 'contacto@caballeriaclub.com',
  officialPhonePlaceholder: '+34 600 000 000',
  whatsappDefaultMessage: 'Hola La Caballería Club de Equitación, deseo confirmar información sobre mi reserva de clase.',
  colors: {
    red: '#D21923',
    black: '#141416',
    white: '#FFFFFF',
  },
  logoUrl: '/assets/aistudio/Emblema_ecuestre_La_Caballer_a-removebg-preview_9a0b4ef1.png',
};

export const CLASS_TYPES: ClassType[] = [
  {
    id: 'iniciacion-infantil',
    name: 'Iniciación y Primer Contacto',
    duration: '50 min',
    targetAudience: 'Niños a partir de 4 años y principiantes',
    description: 'Enfoque lúdico y 100% seguro. Familiarización con el caballo, cepillado asistido, postura básica y primeros pasos pie a tierra y al paso.',
    focus: 'Confianza mutua, equilibrio y pérdida del miedo.',
    recommendedAge: '4 a 14 años',
    badge: 'Más solicitada para niños',
  },
  {
    id: 'clase-formativa',
    name: 'Clase Formativa de Equitación',
    duration: '60 min',
    targetAudience: 'Jóvenes y adultos en progresión',
    description: 'Técnica de asiento clásico, control de ayudas sutiles (piernas, peso, riendas) y transición fluida entre paso, trote y trabajo en pista.',
    focus: 'Técnica postural, coordinación motriz y disciplina deportiva.',
    recommendedAge: 'A partir de 8 años',
    badge: 'Progresión deportiva',
  },
  {
    id: 'manejo-y-vinculo',
    name: 'Taller de Manejo, Cuidado y Vínculo Equino',
    duration: '45 min',
    targetAudience: 'Alumnos, familias y amantes de los animales',
    description: 'Aprender a entender al caballo antes de montar: lenguaje corporal equino, colocación de cabezadas, aseo de cascos y preparación integral.',
    focus: 'Empatía, bienestar animal y hábitos de responsabilidad.',
    recommendedAge: 'Todas las edades',
    badge: 'Filosofía del club',
  },
  {
    id: 'experiencia-familiar',
    name: 'Sesión Ecuestre Familiar',
    duration: '60 min',
    targetAudience: 'Padres e hijos en conjunto',
    description: 'Una experiencia compartida al aire libre para disfrutar del entorno natural del club, interactuar con los caballos y vivir una jornada formativa enriquecedora.',
    focus: 'Convivencia familiar, naturaleza y desconexión digital.',
    recommendedAge: 'Toda la familia',
    badge: 'Vivencia compartida',
  },
  {
    id: 'evaluacion-diagnostico',
    name: 'Diagnóstico de Nivel & Asesoría Formativa',
    duration: '40 min',
    targetAudience: 'Jinetes con experiencia previa',
    description: 'Evaluación técnica personalizada con un instructor senior para determinar el nivel actual, hábitos posturales y plan formativo recomendado.',
    focus: 'Diagnóstico técnico y orientación personalizada.',
    recommendedAge: 'A partir de 10 años',
    badge: 'Evaluación técnica',
  },
];

export const INSTRUCTORS: Instructor[] = [
  {
    id: 'inst-cualquiera',
    name: 'Cualquier Profesor Disponible',
    title: 'Asignación óptima según horario',
    specialty: 'Selección automática del equipo pedagógico de La Caballería',
    bio: 'El equipo del club asignará al instructor idóneo para el perfil y nivel del alumno.',
    photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
    availableDays: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
    focusPillars: ['Disponibilidad flexible', 'Equipo colegiado'],
  },
  {
    id: 'inst-valentina',
    name: 'Prof. Valentina Morales',
    title: 'Instructora Formativa Infantil & Iniciación',
    specialty: 'Especialista en psicología infantil ecuestre y generación de confianza temprana',
    bio: 'Dedicada a crear un entorno cálido y paciente donde los niños descubren el amor por los caballos sin presiones ni temores.',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    availableDays: ['Martes', 'Miércoles', 'Viernes', 'Sábado', 'Domingo'],
    focusPillars: ['Paciencia pedagógica', 'Seguridad infantil', 'Juegos formativos'],
  },
  {
    id: 'inst-carlos',
    name: 'Prof. Carlos Mendoza',
    title: 'Maestro de Equitación & Asiento Clásico',
    specialty: 'Perfeccionamiento biomecánico, postura atlética y control de aires',
    bio: 'Enfocado en la disciplina deportiva y la armonía motriz entre el jinete y el caballo, transmitiendo la técnica con serenidad y rigor.',
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80',
    availableDays: ['Lunes', 'Miércoles', 'Jueves', 'Sábado', 'Domingo'],
    focusPillars: ['Técnica de pista', 'Equilibrio postural', 'Disciplina deportiva'],
  },
  {
    id: 'inst-andrea',
    name: 'Prof. Andrea Salcedo',
    title: 'Especialista en Manejo y Etología Equina',
    specialty: 'Vínculo pie a tierra, comunicación no verbal y bienestar del animal',
    bio: 'Apasionada por enseñar a los alumnos que el verdadero jinete cuida, respeta y comprende los estados anímicos de su compañero equino.',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
    availableDays: ['Martes', 'Jueves', 'Viernes', 'Sábado'],
    focusPillars: ['Lenguaje del caballo', 'Manejo en establo', 'Vínculo emocional'],
  },
];

export const TIME_SLOTS = [
  { time: '08:30 - 09:30', period: 'Mañana', popular: false },
  { time: '09:45 - 10:45', period: 'Mañana', popular: true },
  { time: '11:00 - 12:00', period: 'Mañana', popular: true },
  { time: '15:30 - 16:30', period: 'Tarde', popular: false },
  { time: '16:45 - 17:45', period: 'Tarde', popular: true },
  { time: '18:00 - 19:00', period: 'Tarde', popular: false },
];

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'iniciacion-ecuestre',
    name: 'Iniciación y Primer Contacto',
    shortDescription: 'Un acercamiento seguro, progresivo y respetuoso para niños y jóvenes que desean iniciarse en el mundo del caballo.',
    fullDescription: 'Diseñado especialmente para alumnos sin experiencia previa. El objetivo central es generar un vínculo de confianza mutua con el caballo, aprender nociones básicas de postura, equilibrio sobre la montura y primeros pasos al paso y trote suave con acompañamiento constante del instructor.',
    targetAudience: 'Niños a partir de 4 años, jóvenes y adultos principiantes',
    duration: '50 min de atención personalizada',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Joven jinete recibiendo guía formativa junto a su caballo',
    status: 'confirmado',
  },
  {
    id: 'clases-formativas',
    name: 'Clases Formativas de Equitación',
    shortDescription: 'Desarrollo técnico estructurado de las habilidades ecuestres, postura deportiva, control y disciplina en pista.',
    fullDescription: 'Formación progresiva enfocada en la armonía entre el jinete y el caballo. Se profundiza en el asiento profundo, uso sutil de las ayudas (riendas, piernas, peso corporal), control de aires (paso, trote, galope) y principios formativos de la equitación clásica.',
    targetAudience: 'Alumnos en proceso de formación y perfeccionamiento',
    duration: 'Sesiones de 60 min por niveles',
    imageUrl: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Jinete practicando técnica y postura ecuestre en pista de arena',
    status: 'confirmado',
  },
  {
    id: 'manejo-y-cuidado',
    name: 'Manejo, Cuidado y Bienestar Equino',
    shortDescription: 'Porque aprender también es entender las necesidades, higiene, alimentación y respeto que merece el caballo.',
    fullDescription: 'Fieles a nuestro lema "Formando jinetes, creando experiencias", esta actividad enseña el cuidado integral del caballo antes y después de la monta: cepillado, limpieza de cascos, colocación de cabezadas y monturas, y lectura del lenguaje corporal equino.',
    targetAudience: 'Alumnos de todas las edades y familias',
    duration: 'Taller formativo integrado a las sesiones',
    imageUrl: 'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Alumno realizando cepillado y cuidado consciente de un caballo en el establo',
    status: 'confirmado',
  },
  {
    id: 'equitacion-familiar',
    name: 'Experiencia Ecuestre Familiar',
    shortDescription: 'Espacios formativos para que padres e hijos compartan el amor por los caballos y la naturaleza en un entorno seguro.',
    fullDescription: 'Una vivencia diseñada para fortalecer los lazos familiares a través de una actividad deportiva noble, al aire libre y en estrecha convivencia con los animales, fomentando valores como la paciencia, la empatía y el trabajo colaborativo.',
    targetAudience: 'Familias, padres e hijos en conjunto',
    duration: 'Jornadas de 60 min programadas',
    imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Familia compartiendo una tarde al aire libre en instalaciones ecuestres',
    status: 'confirmado',
  },
];

export const INITIAL_HORSES: HorseProfile[] = [
  {
    id: 'caballo-palomo',
    name: 'Palomo',
    breed: 'Cruzado Deportivo',
    temperament: 'Noble, paciente y extraordinariamente sereno',
    role: 'Especialista en iniciación infantil y primeros pasos',
    description: 'Palomo es el compañero predilecto de los más pequeños. Su andar suave y su carácter calmado brindan una inmediata sensación de tranquilidad a los alumnos que montan por primera vez.',
    curiosities: [
      'Le fascina recibir caricias en la frente después de cada sesión.',
      'Mantiene un ritmo de paso constante y muy predecible que da máxima confianza.',
      'Compañero paciente durante los momentos de cepillado y colocación de montura.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1551884831-bbf3cdc6469e?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Caballo tordo de mirada serena en las instalaciones del club',
    levelSuitability: 'Jóvenes y Niños',
    favoriteActivity: 'Iniciación y Primer Contacto',
  },
  {
    id: 'caballo-canela',
    name: 'Canela',
    breed: 'Castellano / Mestizo Noble',
    temperament: 'Cariñosa, atenta y receptiva a las ayudas sutiles',
    role: 'Ideal para el perfeccionamiento del equilibrio y la postura',
    description: 'Canela destaca por su sensibilidad y dulzura. Enseña a los alumnos a comunicarse con suavidad y precisión, premiando la tranquilidad y la firmeza cordial del jinete.',
    curiosities: [
      'Reconoce inmediatamente la voz de los alumnos habituales.',
      'Excelente maestra para perfeccionar la transición entre paso y trote.',
      'Le encantan las manzanas frescas cortadas en cuartos.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Yegua castaña con porte elegante y noble en paddock',
    levelSuitability: 'Iniciación',
    favoriteActivity: 'Clases Formativas de Equitación',
  },
  {
    id: 'caballo-relampago',
    name: 'Relámpago',
    breed: 'Español Cruzado',
    temperament: 'Enérgico pero equilibrado, noble y disciplinado',
    role: 'Transición a aires activos y práctica deportiva',
    description: 'A pesar de su nombre dinámico, Relámpago posee una disciplina impecable. Es el compañero perfecto para aquellos alumnos que avanzan hacia el galope y buscan mayor conexión deportiva.',
    curiosities: [
      'Responde con gran precisión al peso del cuerpo y el asiento del jinete.',
      'Tiene un trote amplio y rítmico que ayuda a consolidar el asiento.',
      'Siempre curioso con el movimiento y las actividades a su alrededor.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1598974357801-cbca100e6571?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Caballo zaino imponente trotando en pista exterior',
    levelSuitability: 'Todos los niveles',
    favoriteActivity: 'Clase Formativa y Práctica Deportiva',
  },
  {
    id: 'caballo-sombra',
    name: 'Sombra',
    breed: 'Frisón Mestizo',
    temperament: 'Tranquilo, protector y de gran presencia',
    role: 'Confianza y templanza para jóvenes y adultos',
    description: 'Sombra impone respeto por su porte, pero conmueve por su mansedumbre. Es un maestro de la paciencia que enseña a los alumnos a respirar hondo y montar con serenidad.',
    curiosities: [
      'Su paso pausado ayuda a calmar cualquier nerviosismo inicial.',
      'Disfruta enormemente los baños de agua fresca en días cálidos.',
      'Excelente compañero para ejercicios de coordinación y gimkana formativa.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1588615419957-bf66d53c6b49?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Caballo negro de gran presencia y mirada atenta',
    levelSuitability: 'Todos los niveles',
    favoriteActivity: 'Taller de Manejo y Convivencia',
  },
];

export const BENEFITS: Benefit[] = [
  {
    id: 'coordinacion',
    title: 'Coordinación y Equilibrio Dinámico',
    description: 'El movimiento tridimensional del caballo sincroniza la postura, el core y la motricidad fina de manera natural.',
    iconName: 'Activity',
    highlight: 'Propiocepción y tono muscular',
  },
  {
    id: 'concentracion',
    title: 'Concentración y Atención en Pista',
    description: 'Exige estar 100% presente en cada respiración, transmitiendo foco y serenidad que benefician el desempeño escolar.',
    iconName: 'Focus',
    highlight: 'Enfoque y autorregulación',
  },
  {
    id: 'confianza',
    title: 'Confianza y Superación Personal',
    description: 'Guiar con calma y respeto a un animal de gran envergadura construye una autoestima sólida y duradera.',
    iconName: 'ShieldCheck',
    highlight: 'Autonomía y seguridad interior',
  },
  {
    id: 'respeto-animales',
    title: 'Respeto Ético por los Seres Vivos',
    description: 'Aprender que el caballo no es un vehículo ni un juguete, sino un compañero con emociones y necesidades propias.',
    iconName: 'HeartHandshake',
    highlight: 'Empatía y ética animal',
  },
  {
    id: 'empatia',
    title: 'Responsabilidad y Constancia',
    description: 'Cepillar, colocar el equipo y cuidar al caballo antes y después de montar forja una disciplina que trasciende la pista.',
    iconName: 'Smile',
    highlight: 'Compromiso genuino',
  },
  {
    id: 'naturaleza',
    title: 'Conexión Real con la Naturaleza',
    description: 'Un entorno abierto y libre de pantallas para respirar aire puro y compartir tiempo valioso en familia.',
    iconName: 'Sun',
    highlight: 'Bienestar al aire libre',
  },
];

export const GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    id: 'gal-1',
    title: 'Concentración y armonía en pista',
    category: 'alumnos',
    imageUrl: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=1200&q=80',
    caption: 'Alumna practicando equilibrio y postura sobre la montura con la supervisión cercana del instructor.',
  },
  {
    id: 'gal-2',
    title: 'El vínculo del cepillado',
    category: 'vinculo',
    imageUrl: 'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?auto=format&fit=crop&w=1200&q=80',
    caption: 'Aprender también es cuidar: cepillado consciente y preparación del caballo antes de ingresar a la arena.',
  },
  {
    id: 'gal-3',
    title: 'Momentos compartidos en familia',
    category: 'familiar',
    imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80',
    caption: 'Familias presenciando y celebrando los progresos y la autonomía de sus hijos en el club.',
  },
  {
    id: 'gal-4',
    title: 'Técnica y sutilidad de ayudas',
    category: 'tecnica',
    imageUrl: 'https://images.unsplash.com/photo-1598974357801-cbca100e6571?auto=format&fit=crop&w=1200&q=80',
    caption: 'Práctica de transiciones y manejo de riendas con suavidad y respeto hacia la boca del animal.',
  },
  {
    id: 'gal-5',
    title: 'Miradas que transmiten confianza',
    category: 'vinculo',
    imageUrl: 'https://images.unsplash.com/photo-1551884831-bbf3cdc6469e?auto=format&fit=crop&w=1200&q=80',
    caption: 'La nobleza del caballo como espejo de calma para los jinetes en formación.',
  },
  {
    id: 'gal-6',
    title: 'Primeros pasos en la pista formativa',
    category: 'alumnos',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
    caption: 'Iniciación personalizada con apoyo pie a tierra para garantizar máxima seguridad.',
  },
];

export const FAQS = [
  {
    q: '¿A partir de qué edad pueden comenzar los niños a montar?',
    a: 'En La Caballería recibimos a niños a partir de los 4 años en el programa de Iniciación y Primer Contacto, donde las actividades están especialmente adaptadas a su desarrollo psicomotriz con acompañamiento continuo pie a tierra.',
  },
  {
    q: '¿Qué indumentaria o equipamiento se necesita para la primera clase?',
    a: 'Para la primera cita es suficiente vestir pantalón largo cómodo (mallas o vaqueros flexibles) y bota o calzado cerrado sin tacón pronunciado. El club proporciona el casco homologado y chaleco protector de seguridad.',
  },
  {
    q: '¿Qué ocurre si el alumno nunca ha tenido contacto previo con un caballo?',
    a: 'Es la situación más habitual. Nuestro método "Formando jinetes, creando experiencias" comienza en el establo con el cepillado, la caricia y la comprensión del caballo, logrando que el alumno adquiera confianza de forma natural y sin prisas.',
  },
  {
    q: '¿Los padres o familiares pueden presenciar la sesión?',
    a: '¡Por supuesto! Fomentamos un ambiente familiar donde los padres pueden acompañar, observar la clase desde zonas habilitadas y compartir la experiencia formativa de sus hijos.',
  },
];
