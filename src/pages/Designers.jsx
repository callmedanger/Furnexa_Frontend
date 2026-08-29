import { useEffect, useState } from 'react';
import { Plus, Trash2, Mail, Star, Palette, UserCheck, Award } from 'lucide-react';
import { fetchDesigners, createDesigner, toggleDesignerAvailability, deleteDesigner } from '../api/designerService';
import Loader from '../components/Loader';
import AddPersonModal from '../components/AddPersonModal';

const Designers = () => {
  const [designers, setDesigners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    loadDesigners();
  }, []);

  const loadDesigners = async () => {
    try {
      const data = await fetchDesigners();
      setDesigners(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (payload) => {
    await createDesigner(payload);
    await loadDesigners();
  };

  const handleToggle = async (id, currentStatus) => {
    setTogglingId(id);
    try {
      await toggleDesignerAvailability(id, !currentStatus);
      setDesigners((prev) => prev.map((d) => (d.id === id ? { ...d, isAvailable: !currentStatus } : d)));
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove designer "${name}"?`)) return;
    setDeletingId(id);
    try {
      await deleteDesigner(id);
      setDesigners((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete designer.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <Loader full />;

  const availableCount = designers.filter((d) => d.isAvailable).length;
  const avgRating = designers.length
    ? (designers.reduce((sum, d) => sum + (Number(d.rating) || 0), 0) / designers.length).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-serif text-[#2E2118] dark:text-[#F0EAE0]">Designers</h1>
          <p className="text-sm text-[#A99A82] mt-1">Interior design team management</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-[#C98A3D] hover:bg-[#A8672A] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm"
        >
          <Plus size={16} />
          Add Designer
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-[#2A1F16] rounded-2xl p-5 border border-[#EDE6DA] dark:border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#A99A82]">Total Designers</p>
              <h3 className="text-2xl font-semibold mt-2 text-[#2E2118] dark:text-[#F0EAE0]">{designers.length}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#F3E8FB] dark:bg-[#7C3FA8]/15 flex items-center justify-center">
              <Palette size={18} className="text-[#7C3FA8]" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#2A1F16] rounded-2xl p-5 border border-[#EDE6DA] dark:border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#A99A82]">Online</p>
              <h3 className="text-2xl font-semibold mt-2 text-[#7A9B76]">{availableCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#EAF2E9] dark:bg-[#7A9B76]/15 flex items-center justify-center">
              <UserCheck size={18} className="text-[#7A9B76]" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#2A1F16] rounded-2xl p-5 border border-[#EDE6DA] dark:border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#A99A82]">Avg. Rating</p>
              <h3 className="text-2xl font-semibold mt-2 text-[#C98A3D]">{avgRating} ★</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#FBEEDC] dark:bg-[#C98A3D]/15 flex items-center justify-center">
              <Award size={18} className="text-[#C98A3D]" />
            </div>
          </div>
        </div>
      </div>

      {designers.length === 0 ? (
        <div className="bg-white dark:bg-[#2A1F16] rounded-2xl border border-[#EDE6DA] dark:border-white/10 py-16 text-center text-[#A99A82]">
          No designers yet. Add your first one.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {designers.map((designer) => (
            <div
              key={designer.id}
              className="group relative bg-white dark:bg-[#2A1F16] rounded-2xl overflow-hidden shadow-sm border border-[#EDE6DA] dark:border-white/10 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="h-1 bg-gradient-to-r from-[#7C3FA8] to-[#A776C9]" />

              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7C3FA8] to-[#5A2E7D] flex items-center justify-center text-white font-semibold text-lg shadow-sm">
                        {designer.name?.[0]?.toUpperCase() || 'D'}
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ring-2 ring-white dark:ring-[#2A1F16] ${
                          designer.isAvailable ? 'bg-[#7A9B76]' : 'bg-[#C1694F]'
                        }`}
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-[#2E2118] dark:text-[#F0EAE0]">{designer.name}</p>
                      <p className="text-xs text-[#A99A82] flex items-center gap-1 mt-0.5">
                        <Mail size={11} /> {designer.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(designer.id, designer.name)}
                    disabled={deletingId === designer.id}
                    className="text-[#A99A82] hover:text-white hover:bg-[#C1694F] p-1.5 rounded-lg transition-colors disabled:opacity-50 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {designer.specialty && (
                  <div className="mt-3 inline-block bg-[#F3E8FB] dark:bg-[#7C3FA8]/15 text-[#7C3FA8] text-xs font-medium px-2.5 py-1 rounded-full">
                    {designer.specialty}
                  </div>
                )}

                <div className="flex items-center gap-1 mt-3 text-[#C98A3D]">
                  <Star size={14} fill="#C98A3D" />
                  <span className="text-sm font-semibold text-[#2E2118] dark:text-[#F0EAE0]">{designer.rating || 0}</span>
                  <span className="text-xs text-[#A99A82]">rating</span>
                </div>
a
                {/* Toggle row */}
                <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-[#F0EAE0] dark:border-white/10">
                  <span className={`text-xs font-medium ${designer.isAvailable ? 'text-[#7A9B76]' : 'text-[#C1694F]'}`}>
                    {designer.isAvailable ? '● Online' : '● Offline'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggle(designer.id, designer.isAvailable)}
                    disabled={togglingId === designer.id}
                    aria-label={designer.isAvailable ? 'Set designer offline' : 'Set designer online'}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full border border-transparent p-0.5 shadow-inner transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#C98A3D]/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                      designer.isAvailable ? 'bg-[#7A9B76]' : 'bg-[#D8CCB8] dark:bg-white/15'
                    } overflow-hidden`}
                  >
                    <span
                      className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out ${
                        designer.isAvailable ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <AddPersonModal type="designer" onClose={() => setModalOpen(false)} onSubmit={handleAdd} />
      )}
    </div>
  );
};

export default Designers;