import { useEffect, useState } from 'react';
import { Plus, Trash2, Mail, Truck, UserCheck, UserX } from 'lucide-react';
import { fetchRiders, createRider, toggleRiderAvailability, deleteRider } from '../api/riderService';
import Loader from '../components/Loader';
import AddPersonModal from '../components/AddPersonModal';

const Riders = () => {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    loadRiders();
  }, []);

  const loadRiders = async () => {
    try {
      const data = await fetchRiders();
      setRiders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (payload) => {
    await createRider(payload);
    await loadRiders();
  };

  const handleToggle = async (id, currentStatus) => {
    setTogglingId(id);
    try {
      await toggleRiderAvailability(id, !currentStatus);
      setRiders((prev) => prev.map((r) => (r.id === id ? { ...r, isAvailable: !currentStatus } : r)));
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove rider "${name}"?`)) return;
    setDeletingId(id);
    try {
      await deleteRider(id);
      setRiders((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete rider.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <Loader full />;

  const availableCount = riders.filter((r) => r.isAvailable).length;
  const unavailableCount = riders.length - availableCount;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-serif text-[#2E2118] dark:text-[#F0EAE0]">Riders</h1>
          <p className="text-sm text-[#A99A82] mt-1">Delivery team management</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-[#C98A3D] hover:bg-[#A8672A] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm"
        >
          <Plus size={16} />
          Add Rider
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-[#2A1F16] rounded-2xl p-5 border border-[#EDE6DA] dark:border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#A99A82]">Total Riders</p>
              <h3 className="text-2xl font-semibold mt-2 text-[#2E2118] dark:text-[#F0EAE0]">{riders.length}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#FEF3E2] dark:bg-[#B8790E]/15 flex items-center justify-center">
              <Truck size={18} className="text-[#B8790E]" />
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
              <p className="text-sm text-[#A99A82]">Offline</p>
              <h3 className="text-2xl font-semibold mt-2 text-[#C1694F]">{unavailableCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#FBE9E4] dark:bg-[#C1694F]/15 flex items-center justify-center">
              <UserX size={18} className="text-[#C1694F]" />
            </div>
          </div>
        </div>
      </div>

      {riders.length === 0 ? (
        <div className="bg-white dark:bg-[#2A1F16] rounded-2xl border border-[#EDE6DA] dark:border-white/10 py-16 text-center text-[#A99A82]">
          No riders yet. Add your first one.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {riders.map((rider) => (
            <div
              key={rider.id}
              className="group relative bg-white dark:bg-[#2A1F16] rounded-2xl overflow-hidden shadow-sm border border-[#EDE6DA] dark:border-white/10 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="h-1 bg-gradient-to-r from-[#B8790E] to-[#E0A94A]" />

              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#B8790E] to-[#8A5C0A] flex items-center justify-center text-white font-semibold text-lg shadow-sm">
                        {rider.name?.[0]?.toUpperCase() || 'R'}
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ring-2 ring-white dark:ring-[#2A1F16] ${
                          rider.isAvailable ? 'bg-[#7A9B76]' : 'bg-[#C1694F]'
                        }`}
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-[#2E2118] dark:text-[#F0EAE0]">{rider.name}</p>
                      <p className="text-xs text-[#A99A82] flex items-center gap-1 mt-0.5">
                        <Mail size={11} /> {rider.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(rider.id, rider.name)}
                    disabled={deletingId === rider.id}
                    className="text-[#A99A82] hover:text-white hover:bg-[#C1694F] p-1.5 rounded-lg transition-colors disabled:opacity-50 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Toggle row */}
                <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-[#F0EAE0] dark:border-white/10">
                  <span className={`text-xs font-medium ${rider.isAvailable ? 'text-[#7A9B76]' : 'text-[#C1694F]'}`}>
                    {rider.isAvailable ? '● Online' : '● Offline'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggle(rider.id, rider.isAvailable)}
                    disabled={togglingId === rider.id}
                    aria-label={rider.isAvailable ? 'Set rider offline' : 'Set rider online'}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full border border-transparent p-0.5 shadow-inner transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#C98A3D]/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                      rider.isAvailable ? 'bg-[#7A9B76]' : 'bg-[#D8CCB8] dark:bg-white/15'
                    } overflow-hidden`}
                  >
                    <span
                      className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out ${
                        rider.isAvailable ? 'translate-x-5' : 'translate-x-0'
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
        <AddPersonModal type="rider" onClose={() => setModalOpen(false)} onSubmit={handleAdd} />
      )}
    </div>
  );
};

export default Riders;