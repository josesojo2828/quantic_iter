import Image from 'next/image';
import {
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  Target,
  Users,
  Award,
  Layers,
  CheckCircle2,
  Activity,
  BookOpen,
  Heart,
  Briefcase,
} from 'lucide-react';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

const problems = [
  {
    badge: 'Falta de Consistencia',
    title: 'La brecha de la rutina diaria',
    description: 'La gran mayoría de los programas de acompañamiento fracasan porque los participantes abandonan las rutinas a las dos semanas. ITER lo resuelve integrando un registro diario de hábitos directo con el mentor.',
    metric: '82%',
    metricLabel: 'Abandono promedio de rutinas y planes formativos',
    reference: 'Estudio de Persistencia de Hábitos, Harvard Business Review',
  },
  {
    badge: 'Cero Visibilidad',
    title: 'Falta de datos sobre el progreso real',
    description: 'Los directores de capacitación no tienen idea de quién está progresando realmente. Nuestra plataforma automatiza el seguimiento de metas mediante hitos semanales validados por mentores.',
    metric: '100%',
    metricLabel: 'Trazabilidad de objetivos e hitos clave del estudiante',
    reference: 'Modelo ITER de Auditoría de Metas y Aprendizaje Activo',
  },
  {
    badge: 'Compromiso Bajo',
    title: 'Poca motivación y constancia',
    description: 'Las asignaciones se perciben como una obligación más. Al reconocer cada entrega y rutina mediante niveles de logro y constancia, mantenemos el compromiso al tope durante todo el trayecto.',
    metric: '3.5x',
    metricLabel: 'Mayor interacción y tasa de completitud de metas',
    reference: 'Reporte de Incentivos Educativos y Feedback Inmediato, MIT Media Lab',
  },
];

const useCases = [
  {
    icon: Heart,
    title: 'Rutinas de Acondicionamiento Físico',
    description: 'Diseña programas de entrenamiento semanal. Permite a los participantes registrar check-ins de sus sesiones de ejercicio, hábitos de hidratación, descanso y consistencia física.',
  },
  {
    icon: BookOpen,
    title: 'Capacitación y Aprendizaje Técnico',
    description: 'Estructura planes de estudio divididos en fases. Los mentores pueden programar tareas teóricas y prácticas que requieran subir evidencias directas para su validación.',
  },
  {
    icon: Activity,
    title: 'Hábitos de Bienestar y Enfoque',
    description: 'Fomenta el balance personal creando hábitos diarios de meditación, lectura o pausas activas. Visualiza rachas de constancia semanales para incentivar la disciplina.',
  },
  {
    icon: Briefcase,
    title: 'Onboarding y Adaptación Laboral',
    description: 'Facilita la inducción de nuevos integrantes a tu equipo mediante guías paso a paso, hitos de integración y tareas progresivas de aprendizaje.',
  },
];

const steps = [
  {
    num: '01',
    phase: 'DISEÑO FORMATIVO',
    title: 'Diseña programas estructurados en fases y metas claras',
    description: 'Define la ruta de crecimiento ideal para tus alumnos o colaboradores. Segmenta el trayecto en fases dinámicas, establece tareas clave de impacto y asocia entregas de evidencia que los mentores puedan revisar y aprobar de forma centralizada.',
    bullets: [
      'Creación ágil de rutas desde plantillas preestablecidas',
      'Asignación directa de mentores a grupos de alumnos',
      'Definición de metas cuantitativas y cualitativas por fase',
    ],
    image: '/assets/3d/programs.png',
  },
  {
    num: '02',
    phase: 'CONSOLIDAR CONSTANCIA',
    title: 'Automatiza el registro de hábitos diarios',
    description: 'La teoría no genera cambios reales sin constancia. ITER permite configurar hábitos obligatorios o sugeridos dentro de cada programa. Los alumnos registran sus avances diariamente en una interfaz visualmente intuitiva.',
    bullets: [
      'Registro de hábitos simplificado en un solo clic',
      'Monitoreo preventivo para mentores ante caídas de racha',
      'Correlación directa entre rutinas diarias y cumplimiento de metas',
    ],
    image: '/assets/3d/habits.png',
  },
  {
    num: '03',
    phase: 'RECONOCER EL ESFUERZO',
    title: 'Incentiva el avance con perfiles de logro',
    description: 'Transforma el esfuerzo en progreso tangible. Cada check-in de hábito y cada tarea completada otorga puntos de constancia que elevan el nivel del alumno. Visualiza de manera interactiva su evolución y compromiso acumulado.',
    bullets: [
      'Niveles de constancia y acumulación de experiencia acumulada',
      'Historial consolidado de logros e hitos superados',
      'Reportes de participación listos para directores de programa',
    ],
    image: '/assets/3d/students.png',
  },
];

const benefits = [
  {
    icon: Users,
    title: 'Acompañamiento Cercano',
    description: 'Centraliza la comunicación mentor-alumno en un solo espacio. Los coaches pueden intervenir de manera preventiva al detectar inactividad.',
  },
  {
    icon: Target,
    title: 'Metas Claras y Medibles',
    description: 'Elimina las planillas de cálculo y chats desordenados. Estructura el progreso y haz que cada hito alcanzado sea auditable.',
  },
  {
    icon: Award,
    title: 'Mayor Retención Educativa',
    description: 'La combinación de hábitos diarios con reconocimiento continuo reduce el abandono del programa y fortalece el sentido de logro.',
  },
  {
    icon: Layers,
    title: 'Gestión Centralizada',
    description: 'Lanza nuevos programas en minutos usando plantillas estructuradas de forma que tu equipo pueda escalar el trayecto de aprendizaje.',
  },
];

export default function LandingPage() {
  return (
    <main className="flex flex-col min-h-screen bg-transparent text-slate-800 overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
      {/* ─── grid lines background ─── */}
      <div className="absolute inset-0 grid-pattern opacity-[0.5] pointer-events-none z-0" />
      <div className="absolute inset-x-0 top-0 h-[800px] bg-gradient-to-b from-indigo-50/30 via-transparent to-transparent pointer-events-none z-0" />

      {/* ─── Navbar ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between border border-white/50 bg-white/70 backdrop-blur-xl rounded-full px-6 py-3.5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-3">
            <Image
              src="/assets/logo_iter_vector.svg"
              alt="ITER Logo"
              width={95}
              height={26}
              className="h-6.5 w-auto select-none"
              priority
            />
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <a href="#problem" className="hover:text-slate-900 transition-colors">El Desafío</a>
            <a href="#use-cases" className="hover:text-slate-900 transition-colors">¿Qué Crear?</a>
            <a href="#showcase" className="hover:text-slate-900 transition-colors">Vistas Reales</a>
            <a href="#benefits" className="hover:text-slate-900 transition-colors">Beneficios</a>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={`${APP_URL}/login`}
              className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-950 transition-colors"
            >
              Iniciar Sesión
            </a>
            <a
              href={`${APP_URL}/register`}
              className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-[10px] font-black uppercase tracking-widest text-white rounded-full group bg-gradient-to-br from-indigo-400 to-indigo-600 hover:text-white focus:ring-4 focus:outline-none focus:ring-indigo-300 transition-all shadow-lg shadow-indigo-500/20"
            >
              <span className="relative px-6 py-2.5 transition-all ease-in duration-75 bg-[#0C0D0E]/10 rounded-full group-hover:bg-opacity-0">
                Comenzar Gratis
              </span>
            </a>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-36 pb-20 overflow-hidden noise-overlay z-10">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Hero Left Column */}
          <div className="lg:col-span-6 space-y-8 text-left">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-[0.2em] px-4.5 py-2 rounded-full border border-indigo-100">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
              La suite definitiva para programas de mentoría y hábitos
            </div>
            
            <h1 className="text-4xl sm:text-6xl md:text-7.5xl font-black tracking-tighter leading-[0.95] text-slate-950">
              Estructura la<br />
              mentoría.<br />
              <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                Consolida hábitos.
              </span>
            </h1>
            
            <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
              ITER ayuda a coordinadores y mentores a estructurar planes formativos claros, hacer seguimiento diario de los hábitos de cada participante y potenciar la constancia con mecánicas dinámicas de progreso.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <a
                href={`${APP_URL}/register`}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-br from-indigo-400 to-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-8 py-4.5 rounded-2xl hover:scale-105 transition-all shadow-lg shadow-indigo-500/20 w-full sm:w-auto"
              >
                Comenzar gratis hoy
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#showcase"
                className="inline-flex items-center justify-center gap-2 border border-slate-300 text-[10px] font-black uppercase tracking-widest px-8 py-4.5 rounded-2xl hover:bg-slate-50 active:scale-95 transition-all w-full sm:w-auto text-slate-600"
              >
                Ver plataforma
              </a>
            </div>

            {/* Business Stats row */}
            <div className="pt-8 border-t border-slate-200 grid grid-cols-3 gap-6">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Metodología</span>
                <span className="text-xs font-bold text-slate-700 block mt-1">Metas & Hábitos</span>
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Compromiso</span>
                <span className="text-xs font-bold text-slate-700 block mt-1">Avance activo</span>
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Seguimiento</span>
                <span className="text-xs font-bold text-slate-700 block mt-1">Coaches & Mentees</span>
              </div>
            </div>
          </div>

          {/* Hero Right Column (Beautiful Raw Visual Preview) */}
          <div className="lg:col-span-6 relative w-full flex justify-center">
            <div className="absolute -inset-4 bg-indigo-500/5 rounded-[40px] blur-3xl pointer-events-none" />
            
            {/* The Crisp Real Screenshot Window without MAC mocks */}
            <div className="relative w-full max-w-[540px] rounded-3xl border border-white/50 bg-white/80 p-3 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)] backdrop-blur-xl">
              <div className="rounded-2xl overflow-hidden bg-[#FAFAFC] border border-slate-100">
                <Image
                  src="/assets/3d/programs.png"
                  alt="ITER Dashboard View"
                  width={600}
                  height={380}
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── The Problem Section ─── */}
      <section id="problem" className="relative py-32 px-4 md:px-8 border-t border-slate-200/60 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-24">
            <span className="text-indigo-600 text-xs font-black uppercase tracking-[0.25em] bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
              El Desafío Operativo
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mt-6 mb-4 text-slate-950">
              Por qué fracasan la mayoría de las mentorías y capacitaciones
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed">
              La falta de acompañamiento diario y objetivos confusos diluye el impacto formativo. ITER ataca estos desvíos ofreciendo métricas claras y trazabilidad absoluta.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {problems.map((prob) => (
              <div
                key={prob.title}
                className="aura-card rounded-[32px] p-8 bg-white flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase tracking-wider inline-block">
                    {prob.badge}
                  </span>
                  <h3 className="text-xl font-bold tracking-tight text-slate-900">{prob.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {prob.description}
                  </p>
                </div>
                
                <div className="pt-8 border-t border-slate-100 mt-8 space-y-2">
                  <div className="text-4xl font-black text-indigo-600">
                    {prob.metric}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {prob.metricLabel}
                  </div>
                  <div className="text-[9px] text-slate-400 italic font-medium pt-1.5 border-t border-slate-50">
                    * {prob.reference}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── What you can build (Exercise, Wellness, Education) ─── */}
      <section id="use-cases" className="relative py-32 px-4 md:px-8 bg-white/40 border-t border-slate-200/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <span className="text-indigo-600 text-xs font-black uppercase tracking-[0.25em] bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
              Múltiples Propósitos
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mt-6 mb-4 text-slate-950">
              ¿Qué puedes estructurar con ITER?
            </h2>
            <p className="text-slate-600 text-lg max-w-xl mx-auto leading-relaxed">
              La versatilidad de nuestra suite te permite crear rutas y rutinas adaptadas a cualquier tipo de disciplina o meta.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {useCases.map((uc) => (
              <div
                key={uc.title}
                className="aura-card rounded-[32px] p-8 bg-white flex flex-col sm:flex-row gap-6 items-start"
              >
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <uc.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold tracking-tight text-slate-900">{uc.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {uc.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Product Showcase (Vistas Reales en orden cronológico) ─── */}
      <section id="showcase" className="relative py-32 px-4 md:px-8 border-t border-slate-200/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-28">
            <span className="text-indigo-600 text-xs font-black uppercase tracking-[0.25em] bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
              Vistas Reales
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mt-6 mb-4 text-slate-950">
              Cómo funciona el ecosistema ITER
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
              Un recorrido visual de tres pasos que muestra exactamente cómo nuestra plataforma facilita y potencia el aprendizaje constante.
            </p>
          </div>

          {/* Chronological Vertical Step-by-Step */}
          <div className="space-y-40 relative">
            {/* Central path line (hidden in small screens) */}
            <div className="hidden lg:block absolute left-1/2 top-10 bottom-10 w-[1px] bg-slate-200 -translate-x-1/2 z-0" />

            {steps.map((s, index) => {
              const isEven = index % 2 === 0;
              return (
                <div
                  key={s.title}
                  className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-24 relative z-10 ${
                    isEven ? '' : 'lg:flex-row-reverse'
                  }`}
                >
                  {/* Step Description Column */}
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-4">
                      <span className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-indigo-100">
                        {s.num}
                      </span>
                      <span className="text-[10px] font-black tracking-widest text-indigo-600 uppercase">
                        {s.phase}
                      </span>
                    </div>
                    
                    <h3 className="text-2xl sm:text-4.5xl font-black tracking-tight leading-tight text-slate-950">
                      {s.title}
                    </h3>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                      {s.description}
                    </p>
                    
                    <div className="h-[1px] bg-slate-200/60 my-6" />
                    
                    <ul className="space-y-3.5">
                      {s.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-2.5 text-sm text-slate-700 font-medium">
                          <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Browser Mockup Image Column without Mac wrapping dots */}
                  <div className="flex-1 w-full relative">
                    <div className="absolute -inset-4 bg-indigo-500/[0.03] rounded-[32px] blur-3xl pointer-events-none" />
                    
                    <div className="relative rounded-[32px] overflow-hidden border border-white/50 bg-white/80 p-3 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)] backdrop-blur-xl">
                      <div className="rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
                        <Image
                          src={s.image}
                          alt={s.title}
                          width={600}
                          height={400}
                          className="w-full h-auto object-cover hover:scale-[1.01] transition-transform duration-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Benefits Section ─── */}
      <section id="benefits" className="relative py-32 px-4 md:px-8 border-t border-slate-200/60 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <span className="text-indigo-600 text-xs font-black uppercase tracking-[0.25em] bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
              Valor de Negocio
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mt-6 mb-4 text-slate-950">
              Diseñado para el aprendizaje de alto impacto
            </h2>
            <p className="text-slate-600 text-lg max-w-xl mx-auto leading-relaxed">
              Consolida la oferta de mentorías dentro de tu organización y haz del crecimiento continuo un proceso estructurado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="aura-card rounded-[32px] p-8 bg-white group"
              >
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                  <benefit.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold tracking-tight mb-3 text-slate-900">{benefit.title}</h3>
                <p className="text-xs.5 text-slate-500 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Premium Call to Action (Onboarding) ─── */}
      <section className="relative py-36 px-4 md:px-8 overflow-hidden text-center border-t border-slate-200/60 bg-[#FAFAFC]">
        <div className="absolute inset-0 glow-gradient pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-500/[0.04] rounded-full blur-[140px] pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="text-4xl sm:text-6xl font-black tracking-tight mb-8 text-slate-950">
            Comienza a estructurar tus<br />
            rutas de aprendizaje con ITER
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
            Crea tu entorno privado, define programas formativos de alto nivel, planifica hábitos semanales y asigna mentores a tus alumnos desde una sola suite.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <a
              href={`${APP_URL}/register`}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-br from-indigo-400 to-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-10 py-5 rounded-2xl hover:scale-105 transition-all shadow-lg shadow-indigo-500/20 w-full"
            >
              Comenzar gratis ahora
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
          
          <div className="flex items-center justify-center gap-6 mt-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><Shield className="w-4 h-4" /> Entorno Seguro</span>
            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4" /> Configuración en 1 minuto</span>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-slate-200 py-20 px-4 md:px-8 bg-white relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="md:col-span-2 space-y-6">
              <Image
                src="/assets/logo_iter_vector.svg"
                alt="ITER Logo"
                width={100}
                height={28}
                className="h-7 w-auto select-none"
              />
              <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
                El ecosistema corporativo líder para la gestión y seguimiento de hábitos, rutinas estructuradas y mentoría gamificada.
              </p>
            </div>
            
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 text-slate-950">
                Plataforma
              </h4>
              <ul className="space-y-3.5 text-sm">
                <li>
                  <a href="#problem" className="text-slate-500 hover:text-indigo-600 transition-colors">
                    El Desafío
                  </a>
                </li>
                <li>
                  <a href="#showcase" className="text-slate-500 hover:text-indigo-600 transition-colors">
                    Vistas Reales
                  </a>
                </li>
                <li>
                  <a href={`${APP_URL}/login`} className="text-slate-500 hover:text-indigo-600 transition-colors">
                    Portal de Mentores
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 text-slate-950">
                Ecosistema
              </h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Quantic Ecosystem Inc.<br />
                Contacto y Consultas:<br />
                <span className="text-slate-800 font-semibold block mt-1 hover:underline cursor-pointer">info@quantic.com</span>
              </p>
            </div>
          </div>
          
          <div className="border-t border-slate-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} ITER - Quantic Ecosystem. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-6 text-xs text-slate-400">
              <a href="#" className="hover:text-slate-700 transition-colors">Términos de Servicio</a>
              <a href="#" className="hover:text-slate-700 transition-colors">Políticas de Privacidad</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
