import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';

export const StoreContactPage: React.FC = () => {
  const { storeSettings, addToast } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Consulta sobre tallas y stock');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSubmitted(true);
    addToast('success', 'Mensaje enviado', 'Nuestro equipo de atención al cliente responderá pronto.');
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      <div className="pb-6 border-b border-zinc-200">
        <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-red-600">
          Atención Personalizada
        </div>
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-zinc-950 mt-1">
          Contacto & Boutique Flagship
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1 max-w-2xl">
          Asesoría de estilo, consultas sobre pedidos online o compras corporativas en {storeSettings.storeName}.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 bg-zinc-950 text-white rounded-2xl p-7 space-y-6 border border-zinc-800">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-red-500">
              Sede Principal
            </div>
            <h2 className="font-editorial text-2xl font-bold mt-1">{storeSettings.storeName}</h2>
            <p className="text-xs text-zinc-400 mt-1 font-mono">RUC {storeSettings.ruc}</p>
          </div>

          <div className="space-y-4 text-xs text-zinc-300">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-white">Dirección</div>
                <div className="text-zinc-400 mt-0.5">{storeSettings.address}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-white">Central Telefónica</div>
                <div className="text-zinc-400 mt-0.5">{storeSettings.phone}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-white">Correo de Atención</div>
                <div className="text-zinc-400 mt-0.5">{storeSettings.email}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-white">Horario de Atención</div>
                <div className="text-zinc-400 mt-0.5">
                  Lunes a Domingo · 10:00 a.m. – 9:00 p.m.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8">
          {submitted ? (
            <div className="py-10 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-950">
                Consulta recibida correctamente
              </h3>
              <p className="text-xs text-zinc-600 max-w-md mx-auto">
                Un asesor de NOVAStyle se pondrá en contacto contigo al correo proporcionado en un plazo máximo de 24 horas hábiles.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="px-5 py-2.5 bg-zinc-950 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition"
              >
                Enviar otra consulta
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <h2 className="text-base font-bold text-zinc-950">Envíanos un mensaje</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre completo"
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:outline-none focus:border-red-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Correo *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nombre@correo.com"
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Asunto</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg"
                >
                  <option>Consulta sobre tallas y stock</option>
                  <option>Seguimiento de pedido online</option>
                  <option>Cambios y devoluciones</option>
                  <option>Compras corporativas</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Mensaje *</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Cuéntanos en qué podemos ayudarte..."
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:outline-none focus:border-red-600"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition"
              >
                <Send className="w-4 h-4" />
                <span>Enviar Consulta</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
