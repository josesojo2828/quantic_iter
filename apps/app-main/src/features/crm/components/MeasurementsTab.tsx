'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  TrendingUp, 
  Calendar, 
  Loader2, 
  Scale, 
  Info,
  CheckCircle2
} from 'lucide-react';
import { apiClient } from '@/core/api/api.client';
import { toast } from 'react-hot-toast';

interface Measurement {
  id: string;
  type: string;
  value: number;
  unit: string;
  notes?: string;
  date: string;
  createdAt: string;
}

interface MeasurementsTabProps {
  menteeId: string;
}

const BODY_PARTS = [
  { id: 'WEIGHT', label: 'Peso', unit: 'kg', desc: 'Peso corporal total en kilogramos.' },
  { id: 'HEIGHT', label: 'Altura', unit: 'cm', desc: 'Altura total del mentoriado en centímetros.' },
  { id: 'NECK', label: 'Cuello', unit: 'cm', desc: 'Medida alrededor de la base del cuello, justo sobre la nuez de Adán.' },
  { id: 'CHEST', label: 'Pecho', unit: 'cm', desc: 'Medida alrededor de la parte más ancha del pecho.' },
  { id: 'WAIST', label: 'Cintura', unit: 'cm', desc: 'Medida en la parte más estrecha del torso (generalmente sobre el ombligo).' },
  { id: 'HIPS', label: 'Cadera', unit: 'cm', desc: 'Medida en la parte más ancha de los glúteos.' },
  { id: 'BICEPS_LEFT', label: 'Bíceps Izquierdo', unit: 'cm', desc: 'Medida en el punto medio entre el codo y el hombro.' },
  { id: 'BICEPS_RIGHT', label: 'Bíceps Derecho', unit: 'cm', desc: 'Medida en el punto medio entre el codo y el hombro.' },
  { id: 'FOREARM_LEFT', label: 'Antebrazo Izquierdo', unit: 'cm', desc: 'Medida en la parte más ancha del antebrazo.' },
  { id: 'FOREARM_RIGHT', label: 'Antebrazo Derecho', unit: 'cm', desc: 'Medida en la parte más ancha del antebrazo.' },
  { id: 'THIGH_LEFT', label: 'Muslo Izquierdo', unit: 'cm', desc: 'Medida en la parte superior del muslo, justo debajo de la línea del glúteo.' },
  { id: 'THIGH_RIGHT', label: 'Muslo Derecho', unit: 'cm', desc: 'Medida en la parte superior del muslo, justo debajo de la línea del glúteo.' },
  { id: 'CALF_LEFT', label: 'Pantorrilla Izquierda', unit: 'cm', desc: 'Medida en la sección más ancha del músculo de la pantorrilla.' },
  { id: 'CALF_RIGHT', label: 'Pantorrilla Derecha', unit: 'cm', desc: 'Medida en la sección más ancha del músculo de la pantorrilla.' },
];

export function MeasurementsTab({ menteeId }: MeasurementsTabProps) {
  const [selectedPart, setSelectedPart] = useState<string>('CHEST');
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [value, setValue] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);

  const fetchMeasurements = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<Measurement[]>(`/mentor/measurements/mentee/${menteeId}`);
      setMeasurements(data || []);
    } catch (err: any) {
      console.error('Error fetching measurements:', err);
      toast.error('Error al cargar el historial de mediciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (menteeId) {
      fetchMeasurements();
    }
  }, [menteeId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value || isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
      toast.error('Por favor ingresá un valor numérico válido.');
      return;
    }

    setSaving(true);
    try {
      const selectedDef = BODY_PARTS.find(p => p.id === selectedPart);
      await apiClient.post('/mentor/measurements', {
        menteeId,
        type: selectedPart,
        value: parseFloat(value),
        unit: selectedDef?.unit || 'cm',
        notes: notes || undefined,
        date: new Date(date).toISOString(),
      });
      toast.success('Medición registrada con éxito');
      setValue('');
      setNotes('');
      fetchMeasurements();
    } catch (err: any) {
      console.error('Error saving measurement:', err);
      toast.error(err.message || 'Error al guardar la medición');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que querés eliminar este registro?')) return;

    try {
      await apiClient.delete(`/mentor/measurements/${id}`);
      toast.success('Registro eliminado');
      fetchMeasurements();
    } catch (err: any) {
      console.error('Error deleting measurement:', err);
      toast.error('Error al eliminar la medición');
    }
  };

  const getPartMeasurements = (partId: string) => {
    return measurements
      .filter(m => m.type === partId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const currentPartDef = BODY_PARTS.find(p => p.id === selectedPart);
  const currentPartLabel = currentPartDef?.label || selectedPart;
  const currentPartDesc = currentPartDef?.desc || '';
  const currentPartMeasurements = getPartMeasurements(selectedPart);
  const latestMeasurement = currentPartMeasurements[currentPartMeasurements.length - 1];

  // Helper to render custom native SVG Chart
  const renderChart = () => {
    if (currentPartMeasurements.length < 2) {
      return (
        <div className="h-40 flex flex-col items-center justify-center text-center p-4 bg-slate-50 border border-slate-100 rounded-xl">
          <TrendingUp className="w-6 h-6 text-slate-400 mb-2" />
          <p className="text-xs font-semibold text-slate-500">No hay suficientes datos</p>
          <p className="text-[10px] text-slate-400">Registrá al menos 2 mediciones en distintas fechas para ver la curva de evolución.</p>
        </div>
      );
    }

    const width = 450;
    const height = 180;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const values = currentPartMeasurements.map(m => m.value);
    const minVal = Math.min(...values) * 0.95; // 5% offset below min
    const maxVal = Math.max(...values) * 1.05; // 5% offset above max
    const valRange = maxVal - minVal || 1;

    const points = currentPartMeasurements.map((m, index) => {
      const x = paddingLeft + (index / (currentPartMeasurements.length - 1)) * (width - paddingLeft - paddingRight);
      const y = height - paddingBottom - ((m.value - minVal) / valRange) * (height - paddingTop - paddingBottom);
      return { x, y, val: m.value, date: new Date(m.date).toLocaleDateString('es-ES', { month: 'short', day: '2-digit' }) };
    });

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    
    // Path for gradient area fill
    const areaPath = `
      ${linePath} 
      L ${points[points.length - 1].x} ${height - paddingBottom} 
      L ${points[0].x} ${height - paddingBottom} 
      Z
    `;

    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm w-full">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
            Curva de Evolución: {currentPartLabel}
          </h4>
          <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold px-2 py-0.5 rounded-full">
            Avance ({currentPartMeasurements.length} med.)
          </span>
        </div>

        <div className="relative overflow-x-auto">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8A94F4" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#8A94F4" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            <line x1={paddingLeft} y1={paddingTop} x2={width - paddingRight} y2={paddingTop} stroke="#F1F5F9" strokeWidth="1" />
            <line x1={paddingLeft} y1={(height - paddingBottom + paddingTop) / 2} x2={width - paddingRight} y2={(height - paddingBottom + paddingTop) / 2} stroke="#F1F5F9" strokeWidth="1" />
            <line x1={paddingLeft} y1={height - paddingBottom} x2={width - paddingRight} y2={height - paddingBottom} stroke="#E2E8F0" strokeWidth="1" />

            {/* Y-Axis labels */}
            <text x={paddingLeft - 8} y={paddingTop + 4} textAnchor="end" className="text-[9px] fill-slate-400 font-bold">{maxVal.toFixed(1)}</text>
            <text x={paddingLeft - 8} y={(height - paddingBottom + paddingTop) / 2 + 4} textAnchor="end" className="text-[9px] fill-slate-400 font-bold">{((maxVal + minVal) / 2).toFixed(1)}</text>
            <text x={paddingLeft - 8} y={height - paddingBottom + 4} textAnchor="end" className="text-[9px] fill-slate-400 font-bold">{minVal.toFixed(1)}</text>

            {/* Gradient Area */}
            <path d={areaPath} fill="url(#chartGradient)" />

            {/* Line Path */}
            <path d={linePath} fill="none" stroke="#8A94F4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Markers & Labels */}
            {points.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="4" fill="#FFFFFF" stroke="#8A94F4" strokeWidth="2" />
                {/* Value tooltip label */}
                <text 
                  x={p.x} 
                  y={p.y - 8} 
                  textAnchor="middle" 
                  className="text-[9px] fill-indigo-600 font-extrabold"
                >
                  {p.val}
                </text>
                {/* X-Axis labels */}
                <text 
                  x={p.x} 
                  y={height - paddingBottom + 16} 
                  textAnchor="middle" 
                  className="text-[9px] fill-slate-400 font-semibold"
                >
                  {p.date}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Interactive Silhouette & Chips Selector */}
        <div className="lg:col-span-5 flex flex-col items-center gap-4 bg-slate-50/50 p-4 border border-slate-100 rounded-xl shadow-inner">
          <div className="text-center">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Silueta Interactiva</h4>
            <p className="text-[10px] text-slate-400">Seleccioná una parte del cuerpo para cargar sus registros.</p>
          </div>

          {/* Interactive SVG Human Outline (Front) */}
          <div className="relative w-64 h-96">
            <svg viewBox="0 0 200 400" className="w-full h-full select-none overflow-visible">
              {/* HEAD */}
              <circle 
                cx="100" 
                cy="35" 
                r="18" 
                className="fill-slate-200 dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-700" 
              />
              
              {/* NECK */}
              <rect 
                x="95" 
                y="53" 
                width="10" 
                height="15" 
                rx="3" 
                onClick={() => setSelectedPart('NECK')}
                className={`transition-all duration-300 cursor-pointer ${
                  selectedPart === 'NECK'
                    ? 'fill-indigo-500/30 stroke-indigo-500 stroke-[2.5px] drop-shadow-[0_0_8px_rgba(138,148,244,0.6)]'
                    : 'fill-slate-100 hover:fill-indigo-500/10 stroke-slate-300 hover:stroke-indigo-400'
                }`}
              />

              {/* CHEST */}
              <path
                d="M 72 68 C 85 66, 115 66, 128 68 C 124 90, 122 105, 120 115 L 80 115 C 78 105, 76 90, 72 68 Z"
                onClick={() => setSelectedPart('CHEST')}
                className={`transition-all duration-300 cursor-pointer ${
                  selectedPart === 'CHEST'
                    ? 'fill-indigo-500/30 stroke-indigo-500 stroke-[2.5px] drop-shadow-[0_0_8px_rgba(138,148,244,0.6)]'
                    : 'fill-slate-100 hover:fill-indigo-500/10 stroke-slate-300 hover:stroke-indigo-400'
                }`}
              />

              {/* BICEPS LEFT */}
              <path
                d="M 70 70 L 58 75 L 50 125 L 62 120 Z"
                onClick={() => setSelectedPart('BICEPS_LEFT')}
                className={`transition-all duration-300 cursor-pointer ${
                  selectedPart === 'BICEPS_LEFT'
                    ? 'fill-indigo-500/30 stroke-indigo-500 stroke-[2.5px] drop-shadow-[0_0_8px_rgba(138,148,244,0.6)]'
                    : 'fill-slate-100 hover:fill-indigo-500/10 stroke-slate-300 hover:stroke-indigo-400'
                }`}
              />

              {/* BICEPS RIGHT */}
              <path
                d="M 130 70 L 142 75 L 150 125 L 138 120 Z"
                onClick={() => setSelectedPart('BICEPS_RIGHT')}
                className={`transition-all duration-300 cursor-pointer ${
                  selectedPart === 'BICEPS_RIGHT'
                    ? 'fill-indigo-500/30 stroke-indigo-500 stroke-[2.5px] drop-shadow-[0_0_8px_rgba(138,148,244,0.6)]'
                    : 'fill-slate-100 hover:fill-indigo-500/10 stroke-slate-300 hover:stroke-indigo-400'
                }`}
              />

              {/* FOREARM LEFT */}
              <path
                d="M 50 127 L 42 185 L 50 185 L 62 122 Z"
                onClick={() => setSelectedPart('FOREARM_LEFT')}
                className={`transition-all duration-300 cursor-pointer ${
                  selectedPart === 'FOREARM_LEFT'
                    ? 'fill-indigo-500/30 stroke-indigo-500 stroke-[2.5px] drop-shadow-[0_0_8px_rgba(138,148,244,0.6)]'
                    : 'fill-slate-100 hover:fill-indigo-500/10 stroke-slate-300 hover:stroke-indigo-400'
                }`}
              />

              {/* FOREARM RIGHT */}
              <path
                d="M 150 127 L 158 185 L 150 185 L 138 122 Z"
                onClick={() => setSelectedPart('FOREARM_RIGHT')}
                className={`transition-all duration-300 cursor-pointer ${
                  selectedPart === 'FOREARM_RIGHT'
                    ? 'fill-indigo-500/30 stroke-indigo-500 stroke-[2.5px] drop-shadow-[0_0_8px_rgba(138,148,244,0.6)]'
                    : 'fill-slate-100 hover:fill-indigo-500/10 stroke-slate-300 hover:stroke-indigo-400'
                }`}
              />

              {/* WAIST */}
              <path
                d="M 80 117 L 120 117 L 118 145 L 82 145 Z"
                onClick={() => setSelectedPart('WAIST')}
                className={`transition-all duration-300 cursor-pointer ${
                  selectedPart === 'WAIST'
                    ? 'fill-indigo-500/30 stroke-indigo-500 stroke-[2.5px] drop-shadow-[0_0_8px_rgba(138,148,244,0.6)]'
                    : 'fill-slate-100 hover:fill-indigo-500/10 stroke-slate-300 hover:stroke-indigo-400'
                }`}
              />

              {/* HIPS */}
              <path
                d="M 82 147 L 118 147 L 124 185 L 76 185 Z"
                onClick={() => setSelectedPart('HIPS')}
                className={`transition-all duration-300 cursor-pointer ${
                  selectedPart === 'HIPS'
                    ? 'fill-indigo-500/30 stroke-indigo-500 stroke-[2.5px] drop-shadow-[0_0_8px_rgba(138,148,244,0.6)]'
                    : 'fill-slate-100 hover:fill-indigo-500/10 stroke-slate-300 hover:stroke-indigo-400'
                }`}
              />

              {/* THIGH LEFT */}
              <path
                d="M 76 187 L 98 187 L 93 270 L 79 270 Z"
                onClick={() => setSelectedPart('THIGH_LEFT')}
                className={`transition-all duration-300 cursor-pointer ${
                  selectedPart === 'THIGH_LEFT'
                    ? 'fill-indigo-500/30 stroke-indigo-500 stroke-[2.5px] drop-shadow-[0_0_8px_rgba(138,148,244,0.6)]'
                    : 'fill-slate-100 hover:fill-indigo-500/10 stroke-slate-300 hover:stroke-indigo-400'
                }`}
              />

              {/* THIGH RIGHT */}
              <path
                d="M 102 187 L 124 187 L 121 270 L 107 270 Z"
                onClick={() => setSelectedPart('THIGH_RIGHT')}
                className={`transition-all duration-300 cursor-pointer ${
                  selectedPart === 'THIGH_RIGHT'
                    ? 'fill-indigo-500/30 stroke-indigo-500 stroke-[2.5px] drop-shadow-[0_0_8px_rgba(138,148,244,0.6)]'
                    : 'fill-slate-100 hover:fill-indigo-500/10 stroke-slate-300 hover:stroke-indigo-400'
                }`}
              />

              {/* CALF LEFT */}
              <path
                d="M 79 272 L 93 272 L 89 360 L 81 360 Z"
                onClick={() => setSelectedPart('CALF_LEFT')}
                className={`transition-all duration-300 cursor-pointer ${
                  selectedPart === 'CALF_LEFT'
                    ? 'fill-indigo-500/30 stroke-indigo-500 stroke-[2.5px] drop-shadow-[0_0_8px_rgba(138,148,244,0.6)]'
                    : 'fill-slate-100 hover:fill-indigo-500/10 stroke-slate-300 hover:stroke-indigo-400'
                }`}
              />

              {/* CALF RIGHT */}
              <path
                d="M 107 272 L 121 272 L 119 360 L 111 360 Z"
                onClick={() => setSelectedPart('CALF_RIGHT')}
                className={`transition-all duration-300 cursor-pointer ${
                  selectedPart === 'CALF_RIGHT'
                    ? 'fill-indigo-500/30 stroke-indigo-500 stroke-[2.5px] drop-shadow-[0_0_8px_rgba(138,148,244,0.6)]'
                    : 'fill-slate-100 hover:fill-indigo-500/10 stroke-slate-300 hover:stroke-indigo-400'
                }`}
              />

              {/* HANDS & FEET (Non-interactive cosmetic details) */}
              {/* Hand L */}
              <circle cx="38" cy="188" r="4" className="fill-slate-200 stroke-slate-300" />
              {/* Hand R */}
              <circle cx="162" cy="188" r="4" className="fill-slate-200 stroke-slate-300" />
              {/* Foot L */}
              <path d="M 77 360 L 89 360 L 86 372 L 72 370 Z" className="fill-slate-200 stroke-slate-300" />
              {/* Foot R */}
              <path d="M 123 360 L 111 360 L 114 372 L 128 370 Z" className="fill-slate-200 stroke-slate-300" />
            </svg>
          </div>

          {/* General Metrics */}
          <div className="w-full">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Métricas Generales</label>
            <div className="flex gap-2">
              {BODY_PARTS.filter(p => p.id === 'WEIGHT' || p.id === 'HEIGHT').map(part => (
                <button
                  key={part.id}
                  onClick={() => setSelectedPart(part.id)}
                  className={`flex-1 py-2 text-xs font-bold border rounded-lg transition-all active:scale-[0.98] ${
                    selectedPart === part.id
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {part.label} ({part.unit})
                </button>
              ))}
            </div>
          </div>

          {/* Quick Fallback Selector (Mobile & Ergonomic) */}
          <div className="w-full mt-2 border-t border-slate-200/60 pt-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Zonas del Cuerpo</label>
            <div className="flex flex-wrap gap-1">
              {BODY_PARTS.filter(p => p.id !== 'WEIGHT' && p.id !== 'HEIGHT').map(part => (
                <button
                  key={part.id}
                  onClick={() => setSelectedPart(part.id)}
                  className={`px-2.5 py-1 text-[10px] font-semibold border rounded-lg transition-all active:scale-[0.98] ${
                    selectedPart === part.id
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {part.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Register, Chart & List */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Header Panel with selected part description */}
          <div className="bg-slate-50 border border-slate-150 rounded-xl p-5 flex items-start gap-4">
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-600 shrink-0">
              <Scale className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-md font-bold text-slate-800">{currentPartLabel}</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">{currentPartDesc}</p>
              {latestMeasurement && (
                <p className="text-xs text-indigo-600 font-bold mt-1.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 fill-current" />
                  Último registro: {latestMeasurement.value} {latestMeasurement.unit} ({new Date(latestMeasurement.date).toLocaleDateString('es-ES', { month: 'short', day: '2-digit', year: 'numeric' })})
                </p>
              )}
            </div>
          </div>

          {/* Evolution Chart */}
          {renderChart()}

          {/* Registration Form */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-indigo-600" />
              Nueva Medición para {currentPartLabel}
            </h4>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Medida ({currentPartDef?.unit || 'cm'})</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      required
                      placeholder="0.0"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all pr-8"
                    />
                    <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">{currentPartDef?.unit || 'cm'}</span>
                  </div>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Fecha de Medición</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Notas u Observaciones (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ej. Después del entrenamiento, con buena hidratación..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 active:scale-[0.98]"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      Guardar Medida
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Historical List */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
              Historial de Mediciones
            </h4>

            {loading ? (
              <div className="py-10 flex justify-center">
                <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
              </div>
            ) : currentPartMeasurements.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-3 font-semibold">Fecha</th>
                      <th className="pb-3 font-semibold">Medida</th>
                      <th className="pb-3 font-semibold">Notas</th>
                      <th className="pb-3 font-semibold text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs">
                    {currentPartMeasurements.slice().reverse().map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/50 group transition-all">
                        <td className="py-3 font-semibold text-slate-700">
                          {new Date(m.date).toLocaleDateString('es-ES', { 
                            day: '2-digit', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </td>
                        <td className="py-3">
                          <span className="font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                            {m.value} {m.unit}
                          </span>
                        </td>
                        <td className="py-3 text-slate-500 font-medium max-w-xs truncate">
                          {m.notes || <span className="text-slate-300 italic">Sin notas</span>}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleDelete(m.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                            title="Eliminar registro"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 opacity-50">
                <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center">
                   <Info className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">Sin registros para {currentPartLabel}</p>
                  <p className="text-[10px] text-slate-400">Ingresá el valor en el formulario de arriba para iniciar el historial.</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
