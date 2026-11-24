import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Role } from '../../types';
import { Plus, Search, Edit2, X, Shield } from 'lucide-react';
import { BRAND_MEDIA, resolveSafeAvatarUrl } from '../../assets/media';
import { ModuleHeader, StaggerSection, ModalShell } from '../ui/MotionPrimitives';

export const UsersView: React.FC = () => {
  const { users, saveUser, toggleUserStatus } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    username: string;
    email: string;
    phone: string;
    role: Role;
    status: 'ACTIVO' | 'INACTIVO';
    avatar: string;
  }>({
    name: '',
    username: '',
    email: '',
    phone: '',
    role: 'VENDEDOR',
    status: 'ACTIVO',
    avatar: BRAND_MEDIA.avatarExecutivePortrait,
  });

  const rolesList: Role[] = [
    'ADMINISTRADOR',
    'VENDEDOR',
    'CAJERO',
    'ALMACENERO',
    'COMPRADOR',
    'SUPERVISOR',
    'GERENCIA',
    'CLIENTE',
  ];

  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const handleOpenCreate = () => {
    setEditingUserId(null);
    setFormData({
      name: '',
      username: '',
      email: '',
      phone: '',
      role: 'VENDEDOR',
      status: 'ACTIVO',
      avatar: BRAND_MEDIA.avatarExecutivePortrait,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUserId(user.id);
    setFormData({
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      status: user.status,
      avatar: resolveSafeAvatarUrl(user.avatar),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveUser({
      id: editingUserId || undefined,
      ...formData,
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <ModuleHeader
        kicker="SEGURIDAD & RBAC • CUENTAS"
        title="Control de Usuarios & Roles"
        subtitle="Administración de cuentas institucionales y matriz de permisos basada en roles (RBAC)"
        actions={
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm transition active:scale-[0.98] whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Usuario</span>
          </button>
        }
      />

      {/* Search */}
      <StaggerSection className="bg-white p-4 rounded-xl border border-zinc-200 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, usuario, correo electrónico o rol institucional..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
          />
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-500 font-medium px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg">
          <Shield className="w-3.5 h-3.5 text-red-600" />
          <span className="font-mono tabular-nums font-bold text-zinc-900">{users.length}</span> cuentas
        </div>
      </StaggerSection>

      {/* Table */}
      <StaggerSection delay={0.08} className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950 text-zinc-300 border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3 font-semibold">Usuario / Perfil</th>
                <th className="px-3 py-3 font-semibold">Nombre de Usuario</th>
                <th className="px-3 py-3 font-semibold">Correo Institucional</th>
                <th className="px-3 py-3 font-semibold">Rol Asignado</th>
                <th className="px-3 py-3 font-semibold">Último Acceso</th>
                <th className="px-3 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={resolveSafeAvatarUrl(user.avatar)}
                        alt={user.name}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full object-cover border border-zinc-200"
                      />
                      <div>
                        <div className="font-semibold text-zinc-950">{user.name}</div>
                        <div className="text-[10px] text-zinc-400 font-mono tabular-nums">
                          {user.phone || '—'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 font-mono font-semibold text-red-600">@{user.username}</td>
                  <td className="px-3 py-3 text-zinc-600">{user.email}</td>
                  <td className="px-3 py-3">
                    <span className="font-bold text-[11px] text-zinc-900 px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-3 py-3 font-mono tabular-nums text-zinc-500 text-[11px]">
                    {user.lastLogin}
                  </td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => toggleUserStatus(user.id)}
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded border transition cursor-pointer ${
                        user.status === 'ACTIVO'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200'
                      }`}
                    >
                      {user.status}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(user)}
                      className="p-1.5 text-zinc-500 hover:text-red-600 hover:bg-zinc-100 rounded-lg transition"
                      title="Editar usuario y rol"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-zinc-400">
                    No se encontraron usuarios con ese filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </StaggerSection>

      {/* Modal: Crear / Editar Usuario */}
      <ModalShell isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidthClass="max-w-md">
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-950 text-white">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-red-500 block">
              Seguridad & Accesos
            </span>
            <h3 className="text-sm font-bold">
              {editingUserId ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="text-zinc-400 hover:text-white p-1 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-zinc-700 mb-1">Nombre Completo *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: David Paredes"
              className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Nombre de Usuario *</label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                placeholder="almacen"
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg font-mono font-bold focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Rol Asignado *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
              >
                {rolesList.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 mb-1">Correo Electrónico *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="usuario@novastyle.com"
              className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Teléfono</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+51 987 654 321"
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Estado</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as 'ACTIVO' | 'INACTIVO' })
                }
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
              >
                <option value="ACTIVO">ACTIVO</option>
                <option value="INACTIVO">INACTIVO</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg font-semibold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-sm transition"
            >
              Guardar Usuario
            </button>
          </div>
        </form>
      </ModalShell>
    </div>
  );
};
