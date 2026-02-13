import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, ComposedChart, ScatterChart, Scatter, ZAxis, Treemap, Cell, ReferenceLine
} from 'recharts';
import {
    Building2, Home, Map as MapIcon, Filter,
    ChevronDown, ChevronUp, Download, Info,
    TrendingUp, Activity, Layers, Calendar,
    AlertCircle, RefreshCw, CheckCircle2,
    BarChart3, Database, Globe, Search, Menu, X, Camera, Ruler, XCircle, Layout, Clock, Target, Box, PieChart as PieIcon
} from 'lucide-react';

// --- CONFIGURACIÓN ---
// El ID de la planilla se obtiene de las variables de entorno para mayor seguridad
const SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET_ID;
const SHEET_NAME = 'BD';
const LOGO_URL = 'https://cchc.cl/documents/431409/0/logoCChC.png/002fea99-2039-beec-02a7-a92335532d6f?t=1695346405910';

const CCHC_COLORS = {
    primary: '#0056b3',
    secondary: '#00a6ce',
    accent1: '#e6007e',
    accent2: '#f39200',
    accent3: '#ffcc00',
    accent4: '#70b33e',
    dark: '#1e293b',
    light: '#f8fafc'
};

const COLOR_PALETTE = [
    '#0056b3', '#00a6ce', '#e6007e', '#f39200', '#70b33e',
    '#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e'
];

const MONTHS_ES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const ROMAN_QUARTERS = { "1": "I", "2": "II", "3": "III", "4": "IV" };
const INV_ROMAN_QUARTERS = { "I": 1, "II": 2, "III": 3, "IV": 4 };

// --- LISTA DE COORDENADAS DE RESPALDO (FALLBACK) ---
const COMMUNE_COORDS = {
    "Iquique": [-20.2307, -70.1357],
    "Alto Hospicio": [-20.2676, -70.1066],
    "Pozo Almonte": [-20.2597, -69.7865],
    "Pica": [-20.4897, -69.3307],
    "Huara": [-19.9972, -69.7709],
    "Camiña": [-19.3135, -69.4243],
    "Colchane": [-19.2764, -68.6394],
    "Arica": [-18.4783, -70.3126],
    "Camarones": [-19.0134, -69.8656],
    "Putre": [-18.1950, -69.5597],
    "General Lagos": [-17.6564, -69.6300],
    "Antofagasta": [-23.6509, -70.3975],
    "Mejillones": [-23.1042, -70.4507],
    "Sierra Gorda": [-22.8953, -69.3164],
    "Taltal": [-25.4053, -70.4851],
    "Calama": [-22.4544, -68.9292],
    "San Pedro de Atacama": [-22.9087, -68.1997],
    "Tocopilla": [-22.0917, -70.1986],
    "Maria Elena": [-22.3448, -69.6592],
    "Copiapó": [-27.3668, -70.3323],
    "Caldera": [-27.0673, -70.8249],
    "Tierra Amarilla": [-27.4815, -70.2625],
    "Chañaral": [-26.3475, -70.6225],
    "Diego de Almagro": [-26.3920, -70.0469],
    "Vallenar": [-28.5756, -70.7606],
    "Alto del Carmen": [-28.7594, -70.4878],
    "Freirina": [-28.5083, -71.0858],
    "Huasco": [-28.4725, -71.2231],
    "La Serena": [-29.9027, -71.2520],
    "Coquimbo": [-29.9533, -71.3395],
    "Andacollo": [-30.2295, -71.0848],
    "La Higuera": [-29.5103, -71.2056],
    "Paihuano": [-30.0353, -70.5186],
    "Vicuña": [-30.0319, -70.7081],
    "Ovalle": [-30.5983, -71.2003],
    "Combarbalá": [-31.1833, -71.0000],
    "Monte Patria": [-30.6919, -70.9428],
    "Punitaqui": [-30.8333, -71.2667],
    "Río Hurtado": [-30.2667, -70.6500],
    "Illapel": [-31.6308, -71.1653],
    "Canela": [-31.3972, -71.4567],
    "Los Vilos": [-31.9117, -71.5122],
    "Salamanca": [-31.7792, -70.9639],
    "Valparaíso": [-33.0472, -71.6127],
    "Viña del Mar": [-33.0246, -71.5518],
    "Concón": [-32.9228, -71.5173],
    "Quilpué": [-33.0494, -71.4394],
    "Villa Alemana": [-33.0428, -71.3736],
    "Casablanca": [-33.3155, -71.4081],
    "Juan Fernández": [-33.6361, -78.8317],
    "Quintero": [-32.7797, -71.5332],
    "Puchuncaví": [-32.7231, -71.4111],
    "San Antonio": [-33.5937, -71.6097],
    "Cartagena": [-33.5539, -71.6072],
    "El Tabo": [-33.4547, -71.6669],
    "El Quisco": [-33.3976, -71.6967],
    "Algarrobo": [-33.3676, -71.6698],
    "Santo Domingo": [-33.6369, -71.6289],
    "Isla de Pascua": [-27.1127, -109.3497],
    "Los Andes": [-32.8339, -70.5975],
    "Calle Larga": [-32.8558, -70.6272],
    "Rinconada": [-32.8792, -70.7103],
    "San Esteban": [-32.8000, -70.5833],
    "San Felipe": [-32.7505, -70.7258],
    "Catemu": [-32.7833, -70.9667],
    "Llaillay": [-32.8417, -70.9500],
    "Panquehue": [-32.7667, -70.8333],
    "Putaendo": [-32.6283, -70.7167],
    "Santa María": [-32.7500, -70.6667],
    "Quillota": [-32.8794, -71.2464],
    "La Calera": [-32.7876, -71.2075],
    "Hijuelas": [-32.8000, -71.1333],
    "La Cruz": [-32.8278, -71.2269],
    "Limache": [-33.0134, -71.2662],
    "Nogales": [-32.7333, -71.2000],
    "Olmué": [-33.0039, -71.1843],
    "Santiago": [-33.4489, -70.6693],
    "Cerrillos": [-33.5008, -70.7256],
    "Cerro Navia": [-33.4219, -70.7431],
    "Conchalí": [-33.3839, -70.6756],
    "El Bosque": [-33.5583, -70.6750],
    "Estación Central": [-33.4619, -70.6975],
    "Huechuraba": [-33.3742, -70.6367],
    "Independencia": [-33.4144, -70.6653],
    "La Cisterna": [-33.5358, -70.6642],
    "La Florida": [-33.5222, -70.5793],
    "La Granja": [-33.5350, -70.6225],
    "La Pintana": [-33.5856, -70.6289],
    "La Reina": [-33.4430, -70.5367],
    "Las Condes": [-33.4117, -70.5813],
    "Lo Barnechea": [-33.3528, -70.5186],
    "Lo Espejo": [-33.5225, -70.6931],
    "Lo Prado": [-33.4447, -70.7303],
    "Macul": [-33.4925, -70.6053],
    "Maipú": [-33.5106, -70.7572],
    "Ñuñoa": [-33.4569, -70.6036],
    "Pedro Aguirre Cerda": [-33.4839, -70.6811],
    "Peñalolén": [-33.4864, -70.5481],
    "Providencia": [-33.4314, -70.6097],
    "Pudahuel": [-33.4419, -70.7675],
    "Quilicura": [-33.3636, -70.7297],
    "Quinta Normal": [-33.4300, -70.6942],
    "Recoleta": [-33.4072, -70.6408],
    "Renca": [-33.4069, -70.7050],
    "San Joaquín": [-33.4939, -70.6289],
    "San Miguel": [-33.4950, -70.6558],
    "San Ramón": [-33.5417, -70.6419],
    "Vitacura": [-33.3986, -70.5819],
    "Puente Alto": [-33.6117, -70.5758],
    "Pirque": [-33.6339, -70.5714],
    "San José de Maipo": [-33.6433, -70.3508],
    "Colina": [-33.2036, -70.6789],
    "Lampa": [-33.2847, -70.8753],
    "Tiltil": [-33.0847, -70.9264],
    "San Bernardo": [-33.5933, -70.6992],
    "Buin": [-33.7317, -70.7419],
    "Calera de Tango": [-33.6156, -70.7850],
    "Paine": [-33.8153, -70.7397],
    "Melipilla": [-33.6875, -71.2153],
    "Alhué": [-34.0322, -71.0994],
    "Curacaví": [-33.4061, -71.1344],
    "María Pinto": [-33.5186, -71.1189],
    "San Pedro": [-33.9167, -71.4667],
    "Talagante": [-33.6644, -70.9281],
    "El Monte": [-33.6806, -70.9767],
    "Isla de Maipo": [-33.7511, -70.9000],
    "Padre Hurtado": [-33.5700, -70.8167],
    "Peñaflor": [-33.6067, -70.8764],
    "Rancagua": [-34.1708, -70.7444],
    "Machalí": [-34.1764, -70.6489],
    "Graneros": [-34.0667, -70.7167],
    "San Fernando": [-34.5839, -70.9892],
    "Santa Cruz": [-34.6386, -71.3667],
    "Pichilemu": [-34.3872, -72.0039],
    "Talca": [-35.4264, -71.6554],
    "Constitución": [-35.3333, -72.4117],
    "Curicó": [-34.9856, -71.2394],
    "Linares": [-35.8453, -71.5975],
    "Cauquenes": [-35.9672, -72.3153],
    "Chillán": [-36.6064, -72.1025],
    "Chillán Viejo": [-36.6264, -72.1283],
    "San Carlos": [-36.4239, -71.9575],
    "Concepción": [-36.8270, -73.0503],
    "Talcahuano": [-36.7247, -73.1167],
    "San Pedro de la Paz": [-36.8406, -73.1067],
    "Chiguayante": [-36.9167, -73.0167],
    "Coronel": [-37.0167, -73.1333],
    "Lota": [-37.0833, -73.1500],
    "Tomé": [-36.6167, -72.9500],
    "Penco": [-36.7333, -72.9833],
    "Hualpén": [-36.7917, -73.0917],
    "Los Ángeles": [-37.4697, -72.3536],
    "Lebu": [-37.6083, -73.6500],
    "Temuco": [-38.7359, -72.5904],
    "Padre Las Casas": [-38.7617, -72.5958],
    "Villarrica": [-39.2833, -72.2333],
    "Pucón": [-39.2833, -71.9667],
    "Angol": [-37.7972, -72.7119],
    "Valdivia": [-39.8142, -73.2459],
    "La Unión": [-40.2917, -73.0833],
    "Puerto Montt": [-41.4693, -72.9424],
    "Puerto Varas": [-41.3167, -72.9833],
    "Osorno": [-40.5739, -73.1336],
    "Castro": [-42.4722, -73.7731],
    "Ancud": [-41.8667, -73.8333],
    "Coyhaique": [-45.5712, -72.0685],
    "Aysén": [-45.4000, -72.7000],
    "Punta Arenas": [-53.1627, -70.9081],
    "Puerto Natales": [-51.7333, -72.5167],
    "Porvenir": [-53.2961, -70.3703]
};

// --- UTILIDADES GLOBALES ---

const getHeaderIndex = (headers, candidateNames) => {
    const normalize = (str) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, ' ').trim();
    const normHeaders = headers.map(normalize);

    for (const name of candidateNames) {
        const idx = normHeaders.indexOf(normalize(name));
        if (idx !== -1) return idx;
    }
    return -1;
};

const formatNumber = (val) => {
    if (val === undefined || val === null || isNaN(val)) return "0";
    return Math.round(val).toLocaleString('es-CL');
};

const calculateVariation = (current, previous) => {
    if (previous === undefined || previous === null || previous === 0 || isNaN(previous)) return null;
    return ((current - previous) / previous) * 100;
};

const downloadComponentAsImage = async (elementId, title) => {
    if (!window.html2canvas) {
        alert("El módulo de captura aún se está cargando. Por favor, intente en unos segundos.");
        return;
    }

    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Elemento ${elementId} no encontrado`);
        return;
    }

    try {
        const canvas = await window.html2canvas(element, {
            useCORS: true,
            allowTaint: false,
            logging: false,
            backgroundColor: '#ffffff',
            scale: 2
        });

        const link = document.createElement('a');
        link.download = `CChC-${title.replace(/\s+/g, '_')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (err) {
        console.error("Error capturando imagen:", err);
        alert("Hubo un error al generar la imagen. Verifique que todos los elementos se hayan cargado correctamente.");
    }
};

const processTableData = (dataset) => {
    const map = {};
    const totalSurface = dataset.reduce((acc, c) => acc + c.surface, 0) || 1;
    dataset.forEach(d => {
        const key = d.destino || "Otros";
        if (!map[key]) map[key] = { name: key, permits: 0, total: 0 };
        map[key].permits += 1;
        map[key].total += d.surface;
    });
    return Object.values(map).sort((a, b) => b.total - a.total).map(r => ({
        ...r,
        percent: ((r.total / totalSurface) * 100).toFixed(1)
    }));
};

// --- COMPONENTES DE UI ---

const KPI_Card = ({ title, value, unit = "", icon: Icon, trend = null, comparisonLabel = "", momTrend = null, momLabel = "" }) => (
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start justify-between transition-all hover:bg-white hover:shadow-sm h-full">
        <div className="flex-1 overflow-hidden">
            <p className="text-slate-500 text-[9px] font-black mb-1 uppercase tracking-widest truncate">{title}</p>
            <h3 className="text-xl font-black text-slate-800 truncate">
                {formatNumber(value)}
                <span className="text-xs font-normal text-slate-400 ml-1">{unit}</span>
            </h3>
            <div className="mt-2 space-y-1">
                {trend !== null && (
                    <div className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase ${trend >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        <TrendingUp size={8} className={`mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
                        {trend >= 0 ? '+' : ''}{trend.toFixed(1)}% {comparisonLabel}
                    </div>
                )}
                {momTrend !== null && (
                    <div className={`flex items-center text-[8px] font-black uppercase ${momTrend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        <Activity size={8} className="mr-1" />
                        {momTrend >= 0 ? '+' : ''}{momTrend.toFixed(1)}% {momLabel}
                    </div>
                )}
            </div>
        </div>
        <div className="p-2 bg-white rounded-lg ml-2 shrink-0 shadow-sm border border-slate-100">
            {Icon && <Icon size={16} className="text-blue-700" />}
        </div>
    </div>
);

const ChartContainer = ({ title, icon: Icon, children, dark = false, chartId, actions }) => (
    <div id={chartId} className={`${dark ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'} p-5 md:p-8 rounded-[1.5rem] border ${dark ? 'border-slate-800 shadow-2xl' : 'border-slate-200 shadow-sm'} flex flex-col transition-all hover:shadow-lg overflow-hidden relative h-full min-h-[450px]`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 shrink-0">
            <h3 className={`text-[10px] font-black flex items-center gap-3 uppercase tracking-widest ${dark ? 'text-white' : 'text-slate-400'}`}>
                {Icon && <Icon size={16} className={dark ? 'text-blue-400' : 'text-blue-700'} />} {title}
            </h3>
            <div className="flex items-center gap-2">
                {actions}
                <button onClick={() => downloadComponentAsImage(chartId, title)} className={`p-2 rounded-lg transition-colors ${dark ? 'hover:bg-white/10 text-white/40' : 'hover:bg-slate-50 text-slate-300'}`}>
                    <Camera size={18} />
                </button>
            </div>
        </div>
        <div className="flex-1 w-full h-full min-h-0 relative">{children}</div>
    </div>
);

const DropdownSelect = ({ label, options, selected, onChange, disabled = false, isSingle = false, isComuna = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative">
            <label className="block text-[8px] font-black text-slate-400 mb-1 uppercase tracking-wider">{label}</label>
            <button
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`w-full flex items-center justify-between bg-slate-50 border ${disabled ? 'border-slate-100 opacity-50' : 'border-slate-200'} px-3 py-2 rounded-xl text-[11px] font-bold hover:border-blue-400 focus:outline-none transition-all text-left shadow-sm`}
            >
                <span className="truncate pr-1">
                    {isSingle ? (selected || "Seleccionar...") : (
                        selected.length === 0 ? "Todos" :
                            selected.length === options.length ? "Selección Completa" :
                                `${selected.length} seleccionados`
                    )}
                </span>
                {isOpen ? <ChevronUp size={12} className="text-slate-400" /> : <ChevronDown size={12} className="text-slate-400" />}
            </button>
            {isOpen && !disabled && (
                <>
                    <div className="fixed inset-0 z-[1500]" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute z-[1600] mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-2xl max-h-56 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                        {!isSingle && (
                            <div className="p-2 border-b sticky top-0 bg-white/95 backdrop-blur-sm flex justify-between items-center">
                                <button onClick={() => onChange(selected.length === options.length ? [] : [...options])} className="text-[8px] text-blue-700 font-black uppercase hover:bg-blue-50 px-2 py-1 rounded-md">
                                    {selected.length === options.length ? "Deseleccionar" : "Seleccionar Todos"}
                                </button>
                            </div>
                        )}
                        <div className="p-1">
                            {(isComuna ? options : [...options].sort((a, b) => {
                                if (label === "Trimestre") return INV_ROMAN_QUARTERS[a] - INV_ROMAN_QUARTERS[b];
                                if (typeof a === 'number') return b - a;
                                return a.toString().localeCompare(b);
                            })).map((opt, idx) => {
                                const optionLabel = typeof opt === 'object' ? opt.label : opt;
                                const optionValue = typeof opt === 'object' ? opt.value : opt;
                                const isChecked = isSingle ? selected === optionValue : selected.includes(optionValue);

                                return (
                                    <label key={`${label}-opt-${idx}`} className="flex items-center px-2 py-2 hover:bg-slate-50 rounded-lg cursor-pointer text-[10px] transition-colors group">
                                        <input type={isSingle ? "radio" : "checkbox"} name={label} checked={isChecked}
                                            onChange={() => {
                                                if (isSingle) { onChange(optionValue); setIsOpen(false); }
                                                else {
                                                    if (selected.includes(optionValue)) onChange(selected.filter(item => item !== optionValue));
                                                    else onChange([...selected, optionValue]);
                                                }
                                            }}
                                            className={`mr-2 h-4 w-4 border-slate-300 text-blue-700 focus:ring-blue-600 cursor-pointer ${isSingle ? 'rounded-full' : 'rounded'}`}
                                        />
                                        <span className="truncate font-medium text-slate-700 group-hover:text-blue-700">{optionLabel}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

// --- COMPONENTE MAPA (LEAFLET) ---

const LeafletMap = ({ mapData, mapAnalyzedVar, tabActive }) => {
    const containerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersLayerRef = useRef(null);
    const [libReady, setLibReady] = useState(false);

    useEffect(() => {
        if (window.L && typeof window.L.map === 'function') {
            setLibReady(true);
            return;
        }
        const cssId = 'leaflet-css-v1';
        const jsId = 'leaflet-js-v1';
        if (!document.getElementById(cssId)) {
            const link = document.createElement('link');
            link.id = cssId;
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
        }
        if (!document.getElementById(jsId)) {
            const script = document.createElement('script');
            script.id = jsId;
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.async = true;
            script.onload = () => {
                if (window.L && typeof window.L.map === 'function') {
                    setLibReady(true);
                }
            };
            document.head.appendChild(script);
        } else {
            const intervalId = setInterval(() => {
                if (window.L && typeof window.L.map === 'function') {
                    setLibReady(true);
                    clearInterval(intervalId);
                }
            }, 100);
            setTimeout(() => clearInterval(intervalId), 5000);
        }
    }, []);

    useEffect(() => {
        if (!libReady || !containerRef.current || !window.L || typeof window.L.map !== 'function') return;
        const L = window.L;

        if (!mapInstanceRef.current) {
            try {
                // Inicializar mapa con scrollWheelZoom desactivado por seguridad
                mapInstanceRef.current = L.map(containerRef.current, {
                    zoomControl: false,
                    attributionControl: false,
                    maxZoom: 18,
                    scrollWheelZoom: false // Importante: Deshabilitar scroll zoom por defecto
                }).setView([-35.6751, -71.543], 5);

                L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; OSM &copy; CARTO', subdomains: 'abcd', maxZoom: 20 }).addTo(mapInstanceRef.current);
                L.control.zoom({ position: 'bottomleft' }).addTo(mapInstanceRef.current);
                markersLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);

                // Habilitar scroll zoom al hacer doble click
                mapInstanceRef.current.on('dblclick', () => {
                    if (mapInstanceRef.current.scrollWheelZoom.enabled()) return;
                    mapInstanceRef.current.scrollWheelZoom.enable();
                });

                const resizeObserver = new ResizeObserver(() => { if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize(); });
                resizeObserver.observe(containerRef.current);
            } catch (e) { console.error("Error inicializando Leaflet:", e); }
        }

        const map = mapInstanceRef.current;
        if (!map) return;
        const markers = markersLayerRef.current;
        setTimeout(() => { map.invalidateSize(); }, 100);
        setTimeout(() => { map.invalidateSize(); }, 500);

        if (markers) markers.clearLayers();
        if (!mapData || mapData.length === 0) return;

        // --- CÁLCULO DINÁMICO DE TAMAÑOS ---
        const values = mapData.map(d => d.val);
        const minVal = Math.min(...values);
        const maxVal = Math.max(...values);

        const minRadius = 18;
        const maxRadius = 60;

        const bounds = [];
        mapData.forEach(com => {
            if (!com.lat || !com.lng) return;

            let radius;
            if (minVal === maxVal) {
                radius = (minRadius + maxRadius) / 2;
            } else {
                const pct = (com.val - minVal) / (maxVal - minVal);
                radius = minRadius + (pct * (maxRadius - minRadius));
            }

            const svgHtml = createPieSVG(com, radius);
            const icon = L.divIcon({ className: 'div-pie-marker', html: svgHtml, iconSize: [radius * 2, radius * 2], iconAnchor: [radius, radius] });
            const marker = L.marker([com.lat, com.lng], { icon });
            const popupContent = `
        <div style="font-family:sans-serif; min-width:180px; padding:5px; color:#333;">
          <b style="color:#0056b3; font-size:14px; text-transform:uppercase; display:block; margin-bottom:5px;">${com.comuna}</b>
          <div style="margin-top:8px;">${com.breakdown.map(b => `<div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:3px; align-items:center;"><span style="display:flex; align-items:center;"><span style="background:${b.color}; width:10px; height:10px; border-radius:50%; display:inline-block; margin-right:6px;"></span>${b.name}</span><b style="margin-left:10px;">${formatNumber(b.value)}</b></div>`).join('')}</div>
          <hr style="border:none; border-top:1px solid #eee; margin:8px 0;"><div style="display:flex; justify-content:space-between; font-weight:bold; font-size:12px;"><span>TOTAL:</span> <span>${formatNumber(com.val)} ${mapAnalyzedVar === 'surface' ? 'm²' : ''}</span></div>
        </div>`;
            marker.bindPopup(popupContent, { closeButton: false, offset: [0, -5] });
            markers.addLayer(marker);
            bounds.push([com.lat, com.lng]);
        });

        if (bounds.length > 0) map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });

        function createPieSVG(com, r) {
            const size = r * 2;
            if (com.breakdown.length === 1 || com.breakdown.some(s => s.value >= com.val * 0.999)) {
                const slice = com.breakdown.reduce((p, c) => (p.value > c.value) ? p : c, com.breakdown[0]);
                return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${r}" cy="${r}" r="${r - 1}" fill="${slice.color}" stroke="white" stroke-width="2"/></svg>`;
            }
            let currentAngle = -90;
            const paths = com.breakdown.map(slice => {
                if (slice.value <= 0) return '';
                const angle = (slice.value / com.val) * 360;
                const x1 = r + (r - 1) * Math.cos((Math.PI * currentAngle) / 180);
                const y1 = r + (r - 1) * Math.sin((Math.PI * currentAngle) / 180);
                const x2 = r + (r - 1) * Math.cos((Math.PI * (currentAngle + angle)) / 180);
                const y2 = r + (r - 1) * Math.sin((Math.PI * (currentAngle + angle)) / 180);
                const largeArcFlag = angle > 180 ? 1 : 0;
                const d = `M ${r} ${r} L ${x1} ${y1} A ${r - 1} ${r - 1} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
                currentAngle += angle;
                return `<path d="${d}" fill="${slice.color}" stroke="white" stroke-width="1" />`;
            }).join('');
            return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.3));">${paths}</svg>`;
        }
    }, [libReady, mapData, mapAnalyzedVar, tabActive]);

    return (
        <div className="w-full h-full relative bg-slate-900 rounded-[1.5rem] overflow-hidden shadow-2xl border-4 border-slate-800">
            <div ref={containerRef} className="w-full h-full absolute inset-0 z-10"></div>
            {!libReady && <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-50"><RefreshCw className="animate-spin text-blue-500" size={32} /></div>}
            <style>{`.div-pie-marker { background: transparent !important; border: none !important; } .leaflet-container { width: 100% !important; height: 100% !important; background: #0f172a; } .leaflet-popup-content-wrapper { border-radius: 12px; padding: 0; overflow: hidden; } .leaflet-popup-content { margin: 0; width: auto !important; }`}</style>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL APP ---

export default function App() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('analisis');
    const [showSegmentation, setShowSegmentation] = useState(false);
    const [showKpis, setShowKpis] = useState(false);

    const [selectedYear, setSelectedYear] = useState('');
    const [selectedRegions, setSelectedRegions] = useState([]);
    const [selectedUsos, setSelectedUsos] = useState([]);
    const [selectedDescriptions, setSelectedDescriptions] = useState([]);
    const [selectedTramos, setSelectedTramos] = useState([]);
    const [selectedTramoPermiso, setSelectedTramoPermiso] = useState([]);
    const [selectedTipos, setSelectedTipos] = useState([]);
    const [selectedProvincias, setSelectedProvincias] = useState([]);
    const [selectedQuarters, setSelectedQuarters] = useState([]);
    const [selectedPisos, setSelectedPisos] = useState([]);
    const [selectedMonths, setSelectedMonths] = useState([]);
    const [mapAnalyzedVar, setMapAnalyzedVar] = useState('permits');
    // State for permits chart mode
    const [isPermitsCumulative, setIsPermitsCumulative] = useState(false);
    const [isSurfaceCumulative, setIsSurfaceCumulative] = useState(false);

    // Inicializar html2canvas para las capturas
    useEffect(() => {
        if (!window.html2canvas) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            script.async = true;
            document.head.appendChild(script);
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&tq=SELECT%20*&sheet=${encodeURIComponent(SHEET_NAME)}`;
                const response = await fetch(url);
                const text = await response.text();
                const jsonData = JSON.parse(text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1));

                const rawHeaders = jsonData.table.cols.map(col => col.label);

                const mIdx = {
                    comuna: getHeaderIndex(rawHeaders, ['Comuna']),
                    codComuna: getHeaderIndex(rawHeaders, ['Código de comuna', 'Codigo de comuna', 'Código comuna', 'CUT']),
                    provincia: getHeaderIndex(rawHeaders, ['Provincia']),
                    trimestre: getHeaderIndex(rawHeaders, ['Trimestre']),
                    viviendas: getHeaderIndex(rawHeaders, ['Cantidad de viviendas', 'Viviendas', 'Cant. Viviendas']),
                    fecha: getHeaderIndex(rawHeaders, ['Fecha del permiso', 'Fecha']),
                    destino: getHeaderIndex(rawHeaders, ['Destino']),
                    uso: getHeaderIndex(rawHeaders, ['Uso']),
                    descripcion: getHeaderIndex(rawHeaders, ['Descripción', 'Descripcion', 'Glosa', 'Detalle']),
                    superficie: getHeaderIndex(rawHeaders, ['Superficie autorizada', 'Superficie']),
                    tramoM2: getHeaderIndex(rawHeaders, ['Tramo de superficie', 'Tramo Superficie Vivienda', 'Tramo M2 Vivienda']),
                    tramoPermiso: getHeaderIndex(rawHeaders, ['Tramo M2', 'Tramo Superficie Permiso']),
                    region1: getHeaderIndex(rawHeaders, ['Región 1', 'Region', 'Región']),
                    tipo: getHeaderIndex(rawHeaders, ['Tipo de edificación', 'Tipo']),
                    tramoPisos: getHeaderIndex(rawHeaders, ['Tramo Pisos']),
                    ubicacion: getHeaderIndex(rawHeaders, ['Ubicación', 'Ubicacion', 'Coordenadas']),
                    comuna1: getHeaderIndex(rawHeaders, ['Comuna1', 'Comuna Completa'])
                };

                const formatted = jsonData.table.rows.map((row) => {
                    const get = (idx) => (idx !== -1 && row.c[idx] ? row.c[idx].v : null);
                    const cleanNum = (val) => { if (val === undefined || val === null) return 0; if (typeof val === 'number') return val; let s = String(val).replace(/\./g, '').replace(',', '.'); return parseFloat(s) || 0; };

                    const obj = {
                        comuna: String(get(mIdx.comuna) || "N/A"),
                        codComuna: String(get(mIdx.codComuna) || "0"),
                        provincia: String(get(mIdx.provincia) || "N/A"),
                        region1: String(get(mIdx.region1) || "N/A"),
                        destino: String(get(mIdx.destino) || "N/A"),
                        uso: String(get(mIdx.uso) || "Otros"),
                        descripcion: String(get(mIdx.descripcion) || "N/A"),
                        tipo: String(get(mIdx.tipo) || "Otros"),
                        tramoM2: String(get(mIdx.tramoM2) || "N/A"),
                        tramoPermiso: String(get(mIdx.tramoPermiso) || "N/A"),
                        tramoPisos: String(get(mIdx.tramoPisos) || "N/A")
                    };

                    obj.surface = cleanNum(get(mIdx.superficie));
                    const vRaw = get(mIdx.viviendas);
                    obj.houses = vRaw ? parseInt(String(vRaw).replace(/\D/g, '')) || 0 : 0;

                    const f = get(mIdx.fecha);
                    if (f) {
                        if (f.toString().includes('Date')) { const p = f.match(/\d+/g); obj.month = parseInt(p[1]) + 1; obj.year = String(p[0]); }
                        else { const p = f.toString().split(/[/\-,]/); obj.month = parseInt(p[1]) || parseInt(p[0]) || 1; obj.year = String(p.length > 2 ? p[2] : (p[1] || "2024")); }
                    } else { obj.month = 1; obj.year = "2024"; }

                    obj.quarter = ROMAN_QUARTERS[String(get(mIdx.trimestre))] || "I";

                    const loc = get(mIdx.ubicacion);
                    let foundLat = null;
                    let foundLng = null;

                    if (loc) {
                        const cleanLoc = String(loc).replace(/\s/g, '');
                        if (cleanLoc.includes(',')) {
                            const parts = cleanLoc.split(',');
                            const lat = parseFloat(parts[0]);
                            const lng = parseFloat(parts[1]);
                            if (!isNaN(lat) && !isNaN(lng)) { foundLat = lat; foundLng = lng; }
                        }
                    }

                    if (foundLat === null && COMMUNE_COORDS[obj.comuna]) {
                        foundLat = COMMUNE_COORDS[obj.comuna][0];
                        foundLng = COMMUNE_COORDS[obj.comuna][1];
                    }

                    if (foundLat !== null) {
                        obj.lat = foundLat;
                        obj.lng = foundLng;
                    }

                    return obj;
                });
                setData(formatted);
                const years = [...new Set(formatted.map(d => d.year).filter(y => String(y).length === 4))].sort((a, b) => b - a);

                if (years.length > 0) setSelectedYear(years[0]);

            } catch (err) { console.error(err); } finally { setLoading(false); }
        };
        fetchData();
    }, []);

    const handleChartClick = (state) => {
        if (state && state.activeLabel) {
            const monthIndex = MONTHS_ES.indexOf(state.activeLabel) + 1;
            if (monthIndex > 0) setSelectedMonths(prev => prev.includes(monthIndex) ? prev.filter(m => m !== monthIndex) : [monthIndex]);
        }
    };

    const filterOptions = useMemo(() => {
        let sourceData = data;
        if (tab === 'vivienda') {
            sourceData = data.filter(d => d.destino === 'Vivienda' && d.tipo === 'Habitacional');
        }

        if (!sourceData.length) return { years: [], regions: [], usos: [], descriptions: [], tramos: [], tramosPermiso: [], provincias: [], quarters: Object.values(ROMAN_QUARTERS), pisos: [], tipos: [] };

        const getFiltered = (exclude, current) => {
            let filtered = sourceData;
            Object.keys(current).forEach(key => {
                if (key !== exclude) {
                    const val = current[key];
                    if (key === 'year' && val) filtered = filtered.filter(d => d.year === val);
                    if (key === 'region1' && val.length > 0) filtered = filtered.filter(d => val.includes(d.region1));
                    if (key === 'uso' && val.length > 0) filtered = filtered.filter(d => val.includes(d.uso));
                    if (key === 'descripcion' && val.length > 0) filtered = filtered.filter(d => val.includes(d.descripcion));
                    if (key === 'provincia' && val.length > 0) filtered = filtered.filter(d => val.includes(d.provincia));
                    if (key === 'quarter' && val.length > 0) filtered = filtered.filter(d => val.includes(d.quarter));
                    if (key === 'tramoPisos' && val.length > 0) filtered = filtered.filter(d => val.includes(d.tramoPisos));
                    if (key === 'tipo' && val.length > 0 && tab !== 'vivienda') filtered = filtered.filter(d => val.includes(d.tipo));
                    if (key === 'tramoM2' && val.length > 0) filtered = filtered.filter(d => val.includes(d.tramoM2));
                    if (key === 'tramoPermiso' && val.length > 0) filtered = filtered.filter(d => val.includes(d.tramoPermiso));

                    if (key === 'month' && val.length > 0) filtered = filtered.filter(d => val.includes(d.month));
                }
            });
            return filtered;
        };

        const current = {
            year: selectedYear,
            region1: selectedRegions,
            uso: selectedUsos,
            descripcion: selectedDescriptions,
            provincia: selectedProvincias,
            quarter: selectedQuarters,
            tramoPisos: selectedPisos,
            tipo: selectedTipos,
            tramoM2: selectedTramos,
            tramoPermiso: selectedTramoPermiso,
            month: selectedMonths
        };

        return {
            years: [...new Set(sourceData.map(d => d.year))].sort((a, b) => b - a),
            regions: [...new Set(getFiltered('region1', current).map(d => d.region1))].sort(),
            usos: [...new Set(getFiltered('uso', current).map(d => d.uso))].sort(),
            descriptions: [...new Set(getFiltered('descripcion', current).map(d => d.descripcion))].sort(),
            tramos: [...new Set(getFiltered('tramoM2', current).map(d => d.tramoM2))].sort(),
            tramosPermiso: [...new Set(getFiltered('tramoPermiso', current).map(d => d.tramoPermiso))].sort(),
            tipos: [...new Set(getFiltered('tipo', current).map(d => d.tipo))].sort(),
            pisos: [...new Set(getFiltered('tramoPisos', current).map(d => d.tramoPisos))].sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true })),
            quarters: [...new Set(getFiltered('quarter', current).map(d => d.quarter))],
            provincias: [...new Set(getFiltered('provincia', current).map(d => d.provincia))].sort()
        };
    }, [data, selectedYear, selectedRegions, selectedUsos, selectedDescriptions, selectedProvincias, selectedQuarters, selectedPisos, selectedTipos, selectedTramos, selectedTramoPermiso, selectedMonths, tab]);

    const filteredData = useMemo(() => data.filter(d => {
        const mA = !selectedYear || d.year === selectedYear;
        const mM = selectedMonths.length === 0 || selectedMonths.includes(d.month);
        const mR = selectedRegions.length === 0 || selectedRegions.includes(d.region1);
        const mU = selectedUsos.length === 0 || selectedUsos.includes(d.uso);
        const mD = selectedDescriptions.length === 0 || selectedDescriptions.includes(d.descripcion);
        const mP = selectedProvincias.length === 0 || selectedProvincias.includes(d.provincia);
        const mQ = selectedQuarters.length === 0 || selectedQuarters.includes(d.quarter);
        const mPi = selectedPisos.length === 0 || selectedPisos.includes(d.tramoPisos);
        const mT = selectedTipos.length === 0 || selectedTipos.includes(d.tipo);
        const mTr = selectedTramos.length === 0 || selectedTramos.includes(d.tramoM2);
        const mTp = selectedTramoPermiso.length === 0 || selectedTramoPermiso.includes(d.tramoPermiso);

        return mA && mM && mR && mU && mD && mP && mQ && mPi && mT && mTr && mTp;
    }), [data, selectedYear, selectedMonths, selectedRegions, selectedUsos, selectedDescriptions, selectedProvincias, selectedQuarters, selectedPisos, selectedTipos, selectedTramos, selectedTramoPermiso]);

    const trendContextData = useMemo(() => data.filter(d => {
        const mA = !selectedYear || d.year === selectedYear;
        const mR = selectedRegions.length === 0 || selectedRegions.includes(d.region1);
        const mU = selectedUsos.length === 0 || selectedUsos.includes(d.uso);
        const mD = selectedDescriptions.length === 0 || selectedDescriptions.includes(d.descripcion);
        const mP = selectedProvincias.length === 0 || selectedProvincias.includes(d.provincia);
        const mQ = selectedQuarters.length === 0 || selectedQuarters.includes(d.quarter);
        const mPi = selectedPisos.length === 0 || selectedPisos.includes(d.tramoPisos);
        const mT = selectedTipos.length === 0 || selectedTipos.includes(d.tipo);
        const mTr = selectedTramos.length === 0 || selectedTramos.includes(d.tramoM2);
        const mTp = selectedTramoPermiso.length === 0 || selectedTramoPermiso.includes(d.tramoPermiso);
        return mA && mR && mU && mD && mP && mQ && mPi && mT && mTr && mTp;
    }), [data, selectedYear, selectedRegions, selectedUsos, selectedDescriptions, selectedProvincias, selectedQuarters, selectedPisos, selectedTipos, selectedTramos, selectedTramoPermiso]);

    const prevTrendContextData = useMemo(() => {
        if (!selectedYear) return [];
        const lastYear = String(parseInt(selectedYear) - 1);
        return data.filter(d => {
            const mA = d.year === lastYear;
            const mR = selectedRegions.length === 0 || selectedRegions.includes(d.region1);
            const mU = selectedUsos.length === 0 || selectedUsos.includes(d.uso);
            const mD = selectedDescriptions.length === 0 || selectedDescriptions.includes(d.descripcion);
            const mP = selectedProvincias.length === 0 || selectedProvincias.includes(d.provincia);
            const mQ = selectedQuarters.length === 0 || selectedQuarters.includes(d.quarter);
            const mPi = selectedPisos.length === 0 || selectedPisos.includes(d.tramoPisos);
            const mT = selectedTipos.length === 0 || selectedTipos.includes(d.tipo);
            const mTr = selectedTramos.length === 0 || selectedTramos.includes(d.tramoM2);
            const mTp = selectedTramoPermiso.length === 0 || selectedTramoPermiso.includes(d.tramoPermiso);
            return mA && mR && mU && mD && mP && mQ && mPi && mT && mTr && mTp;
        });
    }, [data, selectedYear, selectedRegions, selectedUsos, selectedDescriptions, selectedProvincias, selectedQuarters, selectedPisos, selectedTipos, selectedTramos, selectedTramoPermiso]);

    const { prevFilteredData, comparisonLabel, seqFilteredData, seqLabel } = useMemo(() => {
        if (!selectedYear || data.length === 0) return { prevFilteredData: [], comparisonLabel: "", seqFilteredData: [], seqLabel: "" };
        const curYearNum = parseInt(selectedYear);
        const lastYear = String(curYearNum - 1);
        const months = selectedMonths.length > 0 ? new Set(selectedMonths) : new Set(filteredData.map(d => d.month));

        // 1. Comparativa Interanual (YoY) - Siempre presente
        const labelYoY = selectedMonths.length === 1 ? `vs ${MONTHS_ES[selectedMonths[0] - 1]} ${lastYear}` :
            selectedQuarters.length === 1 ? `vs Trim. ${selectedQuarters[0]} ${lastYear}` : `vs ${lastYear}`;
        const py = prevTrendContextData.filter(d => months.has(d.month));

        let ps = []; let sl = "";

        // 2. Comparativa Secuencial (Mes anterior o Trimestre anterior)
        if (selectedMonths.length === 1) {
            // Caso: Selección de un mes específico
            const m = selectedMonths[0]; const tm = m === 1 ? 12 : m - 1; const ty = m === 1 ? String(curYearNum - 1) : String(curYearNum);
            sl = `vs ${MONTHS_ES[tm - 1]} ${ty}`;
            // Aplicar todos los filtros al secuencial también
            ps = data.filter(d => {
                const mA = d.year === ty;
                const mM = d.month === tm;
                const mR = selectedRegions.length === 0 || selectedRegions.includes(d.region1);
                const mU = selectedUsos.length === 0 || selectedUsos.includes(d.uso);
                const mD = selectedDescriptions.length === 0 || selectedDescriptions.includes(d.descripcion);
                const mP = selectedProvincias.length === 0 || selectedProvincias.includes(d.provincia);
                const mQ = selectedQuarters.length === 0 || selectedQuarters.includes(d.quarter);
                const mPi = selectedPisos.length === 0 || selectedPisos.includes(d.tramoPisos);
                const mT = selectedTipos.length === 0 || selectedTipos.includes(d.tipo);
                const mTr = selectedTramos.length === 0 || selectedTramos.includes(d.tramoM2);
                const mTp = selectedTramoPermiso.length === 0 || selectedTramoPermiso.includes(d.tramoPermiso);
                return mA && mM && mR && mU && mD && mP && mQ && mPi && mT && mTr && mTp;
            });
        } else if (selectedQuarters.length === 1) {
            // Caso: Selección de un trimestre específico (QoQ)
            const q = selectedQuarters[0];
            const qNum = INV_ROMAN_QUARTERS[q];
            const tqNum = qNum === 1 ? 4 : qNum - 1;
            const tq = ROMAN_QUARTERS[String(tqNum)];
            const ty = qNum === 1 ? String(curYearNum - 1) : String(curYearNum);
            sl = `vs Trim. ${tq} ${ty}`;
            ps = data.filter(d => {
                const mA = d.year === ty;
                const mQ = d.quarter === tq;
                const mR = selectedRegions.length === 0 || selectedRegions.includes(d.region1);
                const mU = selectedUsos.length === 0 || selectedUsos.includes(d.uso);
                const mD = selectedDescriptions.length === 0 || selectedDescriptions.includes(d.descripcion);
                const mP = selectedProvincias.length === 0 || selectedProvincias.includes(d.provincia);
                const mPi = selectedPisos.length === 0 || selectedPisos.includes(d.tramoPisos);
                const mT = selectedTipos.length === 0 || selectedTipos.includes(d.tipo);
                const mTr = selectedTramos.length === 0 || selectedTramos.includes(d.tramoM2);
                const mTp = selectedTramoPermiso.length === 0 || selectedTramoPermiso.includes(d.tramoPermiso);
                return mA && mQ && mR && mU && mD && mP && mPi && mT && mTr && mTp;
            });
        }

        return { prevFilteredData: py, comparisonLabel: labelYoY, seqFilteredData: ps, seqLabel: sl };
    }, [data, selectedYear, selectedMonths, selectedQuarters, filteredData, selectedRegions, prevTrendContextData, selectedUsos, selectedDescriptions, selectedProvincias, selectedPisos, selectedTipos, selectedTramos, selectedTramoPermiso]);

    const metrics = useMemo(() => {
        const calc = (dataset) => {
            const p = dataset.length;
            const s = dataset.reduce((acc, c) => acc + c.surface, 0);
            const vr = dataset.filter(d => d.destino === 'Vivienda');
            const h = vr.reduce((acc, c) => acc + (c.houses || 0), 0);
            return { p, s, h, sh: h > 0 ? vr.reduce((acc, c) => acc + c.surface, 0) / h : 0 };
        };
        const c = calc(filteredData); const py = calc(prevFilteredData); const ps = calc(seqFilteredData);
        return {
            permits: { val: c.p, trend: calculateVariation(c.p, py.p), seqTrend: calculateVariation(c.p, ps.p) },
            surface: { val: c.s, trend: calculateVariation(c.s, py.s), seqTrend: calculateVariation(c.s, ps.s) },
            houses: { val: c.h, trend: calculateVariation(c.h, py.h), seqTrend: calculateVariation(c.h, ps.h) },
            surfHouse: { val: c.sh, trend: calculateVariation(c.sh, py.sh), seqTrend: calculateVariation(c.sh, ps.sh) }
        };
    }, [filteredData, prevFilteredData, seqFilteredData]);

    const mapDataGrouped = useMemo(() => {
        const all = [...new Set(data.map(d => d.destino))].sort();
        const dm = {}; all.forEach((d, i) => dm[d] = COLOR_PALETTE[i % COLOR_PALETTE.length]);
        const grouped = filteredData.reduce((acc, curr) => {
            if (!curr.lat || !curr.lng || isNaN(curr.lat) || isNaN(curr.lng)) return acc;

            const key = curr.comuna;

            if (!acc[key]) {
                acc[key] = {
                    codComuna: curr.codComuna,
                    comuna: curr.comuna,
                    lat: curr.lat,
                    lng: curr.lng,
                    totalVal: 0,
                    uses: {}
                };
            }

            let val = (mapAnalyzedVar === 'surface') ? curr.surface : (mapAnalyzedVar === 'houses' ? (curr.destino === 'Vivienda' ? curr.houses : 0) : 1);

            if (val > 0) {
                acc[key].totalVal += val;
                acc[key].uses[curr.destino] = (acc[key].uses[curr.destino] || 0) + val;
            }
            return acc;
        }, {});
        return Object.values(grouped).map(com => ({ ...com, val: com.totalVal, breakdown: Object.keys(com.uses).map(dest => ({ name: dest, value: com.uses[dest], color: dm[dest] })) })).filter(d => d.val > 0);
    }, [filteredData, mapAnalyzedVar, data]);

    const activeDestinos = useMemo(() => {
        const d = [...new Set(filteredData.map(d => d.destino))].sort();
        const a = [...new Set(data.map(item => item.destino))].sort();
        return d.map(x => ({ name: x, color: COLOR_PALETTE[a.indexOf(x) % COLOR_PALETTE.length] }));
    }, [filteredData, data]);

    const uniqueDestinations = useMemo(() => [...new Set(data.map(d => d.destino))].sort(), [data]);

    // Pre-calcular datos para gráfico de permisos
    const permitsChartData = useMemo(() => {
        const acc = {};
        uniqueDestinations.forEach(d => acc[d] = 0);

        return MONTHS_ES.map((name, i) => {
            const mNum = i + 1;
            const isVisible = selectedMonths.length === 0 || selectedMonths.includes(mNum);
            const row = { name };

            const monthlyCounts = {};
            uniqueDestinations.forEach(d => monthlyCounts[d] = 0);
            trendContextData.filter(d => d.month === mNum).forEach(d => {
                if (monthlyCounts[d.destino] !== undefined) monthlyCounts[d.destino]++;
            });

            uniqueDestinations.forEach(d => {
                acc[d] += monthlyCounts[d];
                row[d] = isVisible ? (isPermitsCumulative ? acc[d] : monthlyCounts[d]) : null;
            });

            return row;
        });
    }, [data, trendContextData, selectedMonths, isPermitsCumulative, uniqueDestinations]);

    // Datos para gráfico de superficie con acumulado y desglose
    const surfaceChartData = useMemo(() => {
        const accDest = {};
        uniqueDestinations.forEach(d => accDest[d] = 0);

        return MONTHS_ES.map((name, i) => {
            const mNum = i + 1;
            const isVisible = selectedMonths.length === 0 || selectedMonths.includes(mNum);

            const row = { name };

            const monthlyDestValues = {};
            uniqueDestinations.forEach(d => monthlyDestValues[d] = 0);

            trendContextData.filter(d => d.month === mNum).forEach(d => {
                monthlyDestValues[d.destino] = (monthlyDestValues[d.destino] || 0) + d.surface;
            });

            uniqueDestinations.forEach(d => {
                accDest[d] += monthlyDestValues[d];
                // Si es acumulativo usa accDest, sino el valor mensual. Si no es visible, null.
                row[d] = isVisible ? (isSurfaceCumulative ? accDest[d] : monthlyDestValues[d]) : null;
            });

            return row;
        });
    }, [trendContextData, selectedMonths, isSurfaceCumulative, uniqueDestinations]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
            <header className="bg-white border-b border-slate-100 px-4 md:px-8 py-3 flex items-center justify-between sticky top-0 z-[2000] shadow-sm">
                <div className="flex items-center gap-4">
                    <img src={LOGO_URL} alt="CChC" className="h-8 object-contain" />
                    <h1 className="hidden sm:block text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Monitor de P.E. Autorizados</h1>
                </div>
                <nav className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
                    {[{ id: 'analisis', Icon: BarChart3, label: 'Análisis' }, { id: 'mapa', Icon: MapIcon, label: 'Mapa' }, { id: 'vivienda', Icon: Home, label: 'Vivienda' }].map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${tab === t.id ? 'bg-white text-blue-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}>
                            <t.Icon size={14} /><span className="hidden md:inline text-[9px] font-black uppercase tracking-wider">{t.label}</span>
                        </button>
                    ))}
                </nav>
            </header>

            <main className="flex-1 p-4 md:p-8 lg:px-12 bg-white space-y-6 overflow-y-auto">
                {loading ? <div className="h-full flex flex-col items-center justify-center py-20"><RefreshCw size={40} className="text-blue-600 animate-spin mb-4" /><p className="text-slate-400 font-bold uppercase text-[10px]">Cargando Monitor CChC...</p></div> : (
                    <>
                        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm relative z-[1500]">
                            <button onClick={() => setShowSegmentation(!showSegmentation)} className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-all border-b border-slate-50 rounded-t-2xl">
                                <div className="flex items-center gap-3"><div className="p-2 bg-blue-50 text-blue-700 rounded-lg"><Filter size={16} /></div><div className="text-left"><h2 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Segmentación</h2><p className="text-[9px] text-slate-400 font-medium lowercase italic">Filtros dinámicos sincronizados</p></div></div>
                                {showSegmentation ? <ChevronUp size={18} className="text-slate-300" /> : <ChevronDown size={18} className="text-slate-300" />}
                            </button>
                            {showSegmentation && (
                                <div className="p-6 bg-slate-50/30 animate-in fade-in slide-in-from-top-1 duration-200 rounded-b-2xl">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8 gap-4">
                                        <DropdownSelect label="Año" options={filterOptions.years} selected={selectedYear} onChange={setSelectedYear} isSingle />
                                        <DropdownSelect label="Trimestre" options={filterOptions.quarters} selected={selectedQuarters} onChange={setSelectedQuarters} />
                                        <DropdownSelect label="REGIÓN" options={filterOptions.regions} selected={selectedRegions} onChange={setSelectedRegions} />
                                        {/* CAMBIO: Se muestra Provincia en lugar de Comuna */}
                                        <DropdownSelect label="Provincia" options={filterOptions.provincias} selected={selectedProvincias} onChange={setSelectedProvincias} />

                                        {tab === 'vivienda' ? (
                                            <DropdownSelect label="Tipo de vivienda" options={filterOptions.descriptions} selected={selectedDescriptions} onChange={setSelectedDescriptions} disabled={filterOptions.descriptions.length === 0} />
                                        ) : (
                                            <DropdownSelect label="Uso" options={filterOptions.usos} selected={selectedUsos} onChange={setSelectedUsos} disabled={filterOptions.usos.length === 0} />
                                        )}

                                        <DropdownSelect label="Cant. Pisos" options={filterOptions.pisos} selected={selectedPisos} onChange={setSelectedPisos} disabled={filterOptions.pisos.length === 0} />

                                        {/* CAMBIO: Tramo M2 Permiso visible en TODAS las pestañas */}
                                        <DropdownSelect
                                            label={tab === 'vivienda' ? "Tramo M2 permiso" : "Tramo M2"}
                                            options={filterOptions.tramosPermiso}
                                            selected={selectedTramoPermiso}
                                            onChange={setSelectedTramoPermiso}
                                            disabled={filterOptions.tramosPermiso.length === 0}
                                        />

                                        {/* CAMBIO: Tramo M2 Vivienda solo visible en pestaña vivienda */}
                                        {tab === 'vivienda' && (
                                            <DropdownSelect
                                                label="Tramo M2 vivienda"
                                                options={filterOptions.tramos}
                                                selected={selectedTramos}
                                                onChange={setSelectedTramos}
                                                disabled={filterOptions.tramos.length === 0}
                                            />
                                        )}

                                        {tab !== 'vivienda' && (
                                            <DropdownSelect label="Tipo" options={filterOptions.tipos} selected={selectedTipos} onChange={setSelectedTipos} disabled={filterOptions.tipos.length === 0} />
                                        )}

                                        {tab === 'mapa' && (
                                            <DropdownSelect
                                                label="Mes"
                                                options={MONTHS_ES.map((m, i) => ({ label: m, value: i + 1 }))}
                                                selected={selectedMonths}
                                                onChange={setSelectedMonths}
                                            />
                                        )}
                                    </div>
                                </div>
                            )}
                        </section>

                        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm relative z-[1000]">
                            <button onClick={() => setShowKpis(!showKpis)} className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-all border-b border-slate-50 rounded-t-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg"><Layout size={16} /></div>
                                    <div className="text-left">
                                        <h2 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Indicadores Clave</h2>
                                        <p className="text-[9px] text-slate-400 font-medium lowercase italic">Resumen anual y secuencial</p>
                                    </div>
                                </div>
                                {showKpis ? <ChevronUp size={18} className="text-slate-300" /> : <ChevronDown size={18} className="text-slate-300" />}
                            </button>
                            {showKpis && (
                                <div className="p-6 bg-slate-50/30 animate-in fade-in slide-in-from-top-1 duration-200 rounded-b-2xl">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <KPI_Card title="Permisos" value={metrics.permits.val} trend={metrics.permits.trend} comparisonLabel={comparisonLabel} momTrend={metrics.permits.seqTrend} momLabel={seqLabel} icon={Layers} />
                                        <KPI_Card title="Superficie (m²)" value={metrics.surface.val} trend={metrics.surface.trend} comparisonLabel={comparisonLabel} momTrend={metrics.surface.seqTrend} momLabel={seqLabel} icon={TrendingUp} />
                                        <KPI_Card title="Viviendas" value={metrics.houses.val} trend={metrics.houses.trend} comparisonLabel={comparisonLabel} momTrend={metrics.houses.seqTrend} momLabel={seqLabel} icon={Home} />
                                        <KPI_Card title="m²/vivienda" value={metrics.surfHouse.val} trend={metrics.surfHouse.trend} comparisonLabel={comparisonLabel} momTrend={metrics.surfHouse.seqTrend} momLabel={seqLabel} unit="m²/viv" icon={Ruler} />
                                    </div>
                                </div>
                            )}
                        </section>

                        <div className="pt-4 space-y-10 relative z-0 h-full">
                            {tab === 'analisis' && (
                                <div className="animate-in fade-in duration-500 space-y-12">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <ChartContainer
                                            chartId="chart-permisos-mensual"
                                            title={isPermitsCumulative ? "Evolución Acumulada de Permisos" : "Permisos Mensuales por Destino"}
                                            icon={Calendar}
                                            actions={
                                                <button
                                                    onClick={() => setIsPermitsCumulative(!isPermitsCumulative)}
                                                    className={`text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all ${isPermitsCumulative ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-blue-600'}`}
                                                >
                                                    {isPermitsCumulative ? "Ver Mensual" : "Ver Acumulado"}
                                                </button>
                                            }
                                        >
                                            <ResponsiveContainer width="100%" height={350}>
                                                <BarChart data={permitsChartData} onClick={handleChartClick} style={{ cursor: 'pointer' }} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                    <XAxis dataKey="name" fontSize={8} tickLine={false} axisLine={false} interval={0} tick={{ fill: '#64748b', fontWeight: 'bold' }} angle={-45} textAnchor="end" height={50} />
                                                    <YAxis fontSize={9} tickLine={false} axisLine={false} tickFormatter={(v) => v.toLocaleString('es-CL')} />
                                                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none' }} />
                                                    {uniqueDestinations.map((destino, index) => (
                                                        <Bar key={destino} dataKey={destino} stackId="a" fill={COLOR_PALETTE[index % COLOR_PALETTE.length]} />
                                                    ))}
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </ChartContainer>
                                        <ChartContainer
                                            chartId="chart-superficie-evolucion"
                                            title={isSurfaceCumulative ? "Superficie Acumulada por Destino" : "Superficie Mensual por Destino"}
                                            icon={Activity}
                                            actions={
                                                <button
                                                    onClick={() => setIsSurfaceCumulative(!isSurfaceCumulative)}
                                                    className={`text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all ${isSurfaceCumulative ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-blue-600'}`}
                                                >
                                                    {isSurfaceCumulative ? "Ver Mensual" : "Ver Acumulado"}
                                                </button>
                                            }
                                        >
                                            <ResponsiveContainer width="100%" height={350}>
                                                <ComposedChart data={surfaceChartData} onClick={handleChartClick} style={{ cursor: 'pointer' }} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                    <XAxis dataKey="name" fontSize={8} tickLine={false} axisLine={false} interval={0} tick={{ fill: '#64748b', fontWeight: 'bold' }} angle={-45} textAnchor="end" height={60} />
                                                    <YAxis fontSize={9} tickLine={false} axisLine={false} tickFormatter={(v) => v.toLocaleString('es-CL')} />
                                                    <Tooltip formatter={(v) => v.toLocaleString('es-CL')} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                                    {uniqueDestinations.map((destino, index) => (
                                                        <Bar key={destino} dataKey={destino} stackId="a" fill={COLOR_PALETTE[index % COLOR_PALETTE.length]} />
                                                    ))}
                                                </ComposedChart>
                                            </ResponsiveContainer>
                                        </ChartContainer>
                                    </div>

                                    <div className="bg-white p-6 md:p-10 rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden" id="table-destinos">
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="text-[11px] font-black text-slate-800 flex items-center gap-3 uppercase tracking-widest">
                                                <Layers size={14} className="text-blue-700" /> Detalle de Destinos Autorizados
                                            </h3>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-[10px] md:text-xs min-w-[600px]">
                                                <thead>
                                                    <tr className="bg-slate-50 text-slate-400 font-black uppercase tracking-widest border-b">
                                                        <th className="px-6 py-4">Descripción Destino</th>
                                                        <th className="px-6 py-4 text-center">Permisos</th>
                                                        <th className="px-6 py-4 text-right">Superficie Total m²</th>
                                                        <th className="px-6 py-4 text-right">% Peso</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                                                    {processTableData(filteredData).map((r, i) => (
                                                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                                            <td className="px-6 py-4 font-bold text-slate-800 uppercase">{r.name}</td>
                                                            <td className="px-6 py-4 text-center">{formatNumber(r.permits)}</td>
                                                            <td className="px-6 py-4 text-right font-black text-blue-700">{formatNumber(r.total)}</td>
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="flex items-center justify-end gap-3">
                                                                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                                        <div className="h-full bg-blue-600" style={{ width: `${r.percent}%` }}></div>
                                                                    </div>
                                                                    <span className="text-[9px] font-black text-slate-400 w-8">{r.percent}%</span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot className="bg-slate-50/50 border-t-2 border-slate-200">
                                                    <tr className="font-black text-slate-800">
                                                        <td className="px-6 py-5 uppercase text-[9px] tracking-widest">Total Consolidado</td>
                                                        <td className="px-6 py-5 text-center">{formatNumber(filteredData.length)}</td>
                                                        <td className="px-6 py-5 text-right font-black text-blue-800">{formatNumber(filteredData.reduce((acc, c) => acc + c.surface, 0))}</td>
                                                        <td className="px-6 py-5 text-right">100%</td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {tab === 'mapa' && (
                                <div className="animate-in slide-in-from-bottom-8 duration-700 h-[700px]">
                                    <ChartContainer chartId="chart-geo-leaflet" title="Cartografía Interactiva Comunal" icon={MapIcon}
                                        actions={<select value={mapAnalyzedVar} onChange={(e) => setMapAnalyzedVar(e.target.value)} className="bg-white border border-slate-200 text-[10px] font-black uppercase tracking-wider rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-blue-500 shadow-sm"> <option value="permits">Cantidad de Permisos</option> <option value="surface">Superficie Autorizada</option> <option value="houses">Cantidad de Viviendas</option> </select>}
                                    >
                                        {/* NUEVO LAYOUT FLEX COLUMNA PARA LEYENDA ABAJO */}
                                        <div className="flex flex-col h-full gap-4">
                                            {/* AUMENTO DE ALTURA MINIMA PARA QUE SE VEAN LOS CONTROLES DE ZOOM */}
                                            <div className="flex-1 relative w-full min-h-[600px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
                                                <LeafletMap mapData={mapDataGrouped} mapAnalyzedVar={mapAnalyzedVar} tabActive={tab} />
                                            </div>
                                            {/* LEYENDA ABAJO */}
                                            <div className="w-full shrink-0 bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col gap-2">
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-2 flex items-center gap-2"><PieIcon size={12} /> Leyenda Destinos</p>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2"> {/* Responsive Grid */}
                                                    {activeDestinos.map((item, idx) => (
                                                        <div key={`legend-map-${idx}`} className="flex items-center gap-2 text-[9px] text-slate-600 font-bold uppercase">
                                                            <div className="w-2.5 h-2.5 rounded-full shadow-sm shrink-0" style={{ backgroundColor: item.color }}></div>
                                                            <span className="truncate">{item.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </ChartContainer>
                                </div>
                            )}

                            {tab === 'vivienda' && (
                                <div className="animate-in fade-in duration-700">
                                    <HousingAnalysis data={data} anchorYear={selectedYear} trendContextData={trendContextData} prevTrendContextData={prevTrendContextData} selectedMonths={selectedMonths} onMonthToggle={(m) => setSelectedMonths(prev => prev.includes(m) ? prev.filter(x => x !== m) : [m])} comparisonLabel={comparisonLabel} seqLabel={seqLabel} calculateVariation={calculateVariation} />
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

const HousingAnalysis = ({ data, anchorYear, trendContextData, prevTrendContextData, selectedMonths, onMonthToggle, comparisonLabel, seqLabel, calculateVariation }) => {
    const [isCumulative, setIsCumulative] = useState(false); // Estado para el botón acumulado

    // CAMBIO: Ahora el año anterior usa prevTrendContextData que ya tiene aplicados los filtros de Segmentación
    const current = useMemo(() => trendContextData.filter(d => d.destino === 'Vivienda' && d.tipo === 'Habitacional' && (selectedMonths.length === 0 || selectedMonths.includes(d.month))), [trendContextData, selectedMonths]);
    const pyData = useMemo(() => prevTrendContextData.filter(d => d.destino === 'Vivienda' && d.tipo === 'Habitacional'), [prevTrendContextData]);

    const stats = useMemo(() => {
        const curVal = current.reduce((a, c) => a + (c.houses || 0), 0); const monthsToCompare = selectedMonths.length > 0 ? new Set(selectedMonths) : new Set(current.map(d => d.month));
        const preYoY = pyData.filter(d => monthsToCompare.has(d.month)).reduce((a, c) => a + (c.houses || 0), 0);
        // También aplicamos filtro "Habitacional" al secuencial
        let preSeq = 0; if (selectedMonths.length === 1) { const m = selectedMonths[0]; const tm = m === 1 ? 12 : m - 1; const ty = m === 1 ? String(parseInt(anchorYear) - 1) : String(anchorYear); preSeq = data.filter(d => d.destino === 'Vivienda' && d.tipo === 'Habitacional' && d.year === ty && d.month === tm).reduce((a, c) => a + (c.houses || 0), 0); }
        return { cur: curVal, pyoy: preYoY, trend: calculateVariation(curVal, preYoY), seqTrend: (selectedMonths.length === 1) ? calculateVariation(curVal, preSeq) : null };
    }, [current, pyData, selectedMonths, calculateVariation, data, anchorYear]);

    // Chart Data con lógica acumulativa
    const chartData = useMemo(() => {
        let accActual = 0;
        let accAnterior = 0;

        return MONTHS_ES.map((name, i) => {
            const mNum = i + 1;

            // Calcular valores mensuales con filtro Habitacional
            const valActual = trendContextData.filter(d => d.destino === 'Vivienda' && d.tipo === 'Habitacional' && d.month === mNum).reduce((a, c) => a + (c.houses || 0), 0);
            const valAnterior = prevTrendContextData.filter(d => d.destino === 'Vivienda' && d.tipo === 'Habitacional' && d.month === mNum).reduce((a, c) => a + (c.houses || 0), 0);

            // Actualizar acumuladores
            accActual += valActual;
            accAnterior += valAnterior;

            // CAMBIO: Lógica de visibilidad para ocultar puntos no seleccionados
            const isVisible = selectedMonths.length === 0 || selectedMonths.includes(mNum);

            return {
                name,
                actual: isVisible ? (isCumulative ? accActual : valActual) : null,
                anterior: isVisible ? (isCumulative ? accAnterior : valAnterior) : null
            };
        });
    }, [trendContextData, data, anchorYear, isCumulative, selectedMonths]);

    // --- LÓGICA PARA EL MAPA DE VIVIENDA ---
    const housingMapData = useMemo(() => {
        // 1. Usar 'current' para que el mapa responda al mes seleccionado
        // 'current' ya tiene el filtro de mes aplicado si existe
        const housingData = current; // Usamos 'current' en lugar de 'trendContextData' filtrado manualmente

        // 2. Obtener valores únicos de 'Uso' para colores
        // CAMBIO: Volvemos a usar 'uso' para la leyenda y agrupación del mapa
        const allUsos = [...new Set(housingData.map(d => d.uso))].sort();
        const usoColors = {};
        allUsos.forEach((u, i) => usoColors[u] = COLOR_PALETTE[i % COLOR_PALETTE.length]);

        // 3. Agrupar por Comuna
        const grouped = housingData.reduce((acc, curr) => {
            if (!curr.lat || !curr.lng || isNaN(curr.lat) || isNaN(curr.lng)) return acc;
            const key = curr.comuna;

            if (!acc[key]) {
                acc[key] = {
                    codComuna: curr.codComuna,
                    comuna: curr.comuna,
                    lat: curr.lat,
                    lng: curr.lng,
                    totalVal: 0,
                    uses: {}
                };
            }

            const val = curr.houses || 0; // Usamos cantidad de viviendas

            if (val > 0) {
                acc[key].totalVal += val;
                // Acumular por 'uso'
                acc[key].uses[curr.uso] = (acc[key].uses[curr.uso] || 0) + val;
            }
            return acc;
        }, {});

        // 4. Formatear para LeafletMap
        return {
            data: Object.values(grouped).map(com => ({
                ...com,
                val: com.totalVal,
                breakdown: Object.keys(com.uses).map(usoName => ({
                    name: usoName,
                    value: com.uses[usoName],
                    color: usoColors[usoName]
                })).sort((a, b) => b.value - a.value)
            })).filter(d => d.val > 0),
            legend: allUsos.map(u => ({ name: u, color: usoColors[u] }))
        };
    }, [current]); // Dependemos de 'current' ahora

    return (
        <div className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <ChartContainer
                    chartId="chart-vivienda-comparativa"
                    title={isCumulative ? "Evolución Acumulada Anual" : "Comparativa Mensual"}
                    icon={Activity}
                    actions={
                        <button
                            onClick={() => setIsCumulative(!isCumulative)}
                            className={`text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all ${isCumulative ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-blue-600'}`}
                        >
                            {isCumulative ? "Ver Mensual" : "Ver Acumulado"}
                        </button>
                    }
                >
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={chartData} onClick={(e) => e && e.activeLabel && onMonthToggle(MONTHS_ES.indexOf(e.activeLabel) + 1)} style={{ cursor: 'pointer' }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" fontSize={8} axisLine={false} tickLine={false} interval={0} tick={{ fill: '#64748b', fontWeight: 'bold' }} angle={-45} textAnchor="end" height={50} />
                            <YAxis fontSize={9} axisLine={false} tickLine={false} tickFormatter={(v) => v.toLocaleString('es-CL')} />
                            <Tooltip formatter={(v) => v.toLocaleString('es-CL')} contentStyle={{ borderRadius: '16px', border: 'none' }} />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: '9px' }} />

                            {/* CAMBIO: Línea de referencia visual para el mes seleccionado */}
                            {selectedMonths.map(mIndex => (
                                <ReferenceLine key={`ref-${mIndex}`} x={MONTHS_ES[mIndex - 1]} stroke={CCHC_COLORS.accent2} strokeDasharray="3 3" />
                            ))}

                            {/* CAMBIO: connectNulls=false para cortar la línea en periodos no seleccionados */}
                            <Line type="monotone" dataKey="actual" name={`Año ${anchorYear}`} stroke={CCHC_COLORS.primary} strokeWidth={4} connectNulls={false} dot={(props) => { const { cx, cy, payload, index } = props; const isSelected = selectedMonths.includes(MONTHS_ES.indexOf(payload.name) + 1); return <circle key={`dot-act-${index}`} cx={cx} cy={cy} r={isSelected ? 6 : 4} fill={CCHC_COLORS.primary} strokeWidth={isSelected ? 3 : 0} stroke="#fff" />; }} />
                            <Line type="monotone" dataKey="anterior" name={`Año ${parseInt(anchorYear) - 1}`} stroke={CCHC_COLORS.secondary} strokeWidth={2} strokeDasharray="5 5" connectNulls={false} dot={(props) => { const { cx, cy, index } = props; return <circle key={`dot-ant-${index}`} cx={cx} cy={cy} r={2} fill={CCHC_COLORS.secondary} />; }} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>
                <ChartContainer chartId="chart-vivienda-tramo" title="Viviendas según tramo de superficie" icon={Layers}>
                    <ResponsiveContainer width="100%" height={350}>
                        <Treemap data={useMemo(() => { const map = {}; current.forEach(d => { map[d.tramoM2 || "Otros"] = (map[d.tramoM2 || "Otros"] || 0) + (d.houses || 0); }); return Object.entries(map).map(([name, size]) => ({ name, size })); }, [current])} dataKey="size" stroke="#fff" fill={CCHC_COLORS.primary} radius={12}><Tooltip formatter={(v) => v.toLocaleString('es-CL')} /></Treemap>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>

            {/* --- NUEVA SECCIÓN DE MAPA DE VIVIENDA --- */}
            <div className="h-[750px]"> {/* Altura ajustada para contener mapa y leyenda */}
                <ChartContainer chartId="chart-vivienda-mapa" title="Distribución Geográfica de Viviendas por Uso" icon={MapIcon}>
                    <div className="flex flex-col h-full gap-4">
                        <div className="flex-1 relative w-full min-h-[500px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
                            {/* Reutilizamos LeafletMap pasando los datos específicos de vivienda */}
                            <LeafletMap mapData={housingMapData.data} mapAnalyzedVar="houses" tabActive="vivienda" />
                        </div>
                        <div className="w-full shrink-0 bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col gap-2">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-2 flex items-center gap-2">
                                <PieIcon size={12} /> Leyenda Uso (Solo Vivienda)
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                {housingMapData.legend.map((item, idx) => (
                                    <div key={`legend-housing-${idx}`} className="flex items-center gap-2 text-[9px] text-slate-600 font-bold uppercase">
                                        <div className="w-2.5 h-2.5 rounded-full shadow-sm shrink-0" style={{ backgroundColor: item.color }}></div>
                                        <span className="truncate">{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </ChartContainer>
            </div>
        </div>
    );
};