    import { useState } from 'react';
    import { X } from 'lucide-react';

    const AddPersonModal = ({ type, onClose, onSubmit }) => {
    const [form, setForm] = useState({ name: '', email: '', specialty: '', rating: '' });
    const [submitting, setSubmitting] = useState(false);

    const isDesigner = type === 'designer';

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.email.trim()) return;

        setSubmitting(true);
        try {
        const payload = isDesigner
            ? { name: form.name, email: form.email, specialty: form.specialty, rating: Number(form.rating) || 0 }
            : { name: form.name, email: form.email };
        await onSubmit(payload);
        onClose();
        } catch (err) {
        console.error(err);
        alert('Failed to add. Please try again.');
        } finally {
        setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
        <div className="bg-white dark:bg-[#2A1F16] rounded-2xl w-full max-w-md p-6 relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-[#A99A82] hover:text-[#5C4A3A] dark:hover:text-white">
            <X size={18} />
            </button>
            <h3 className="text-lg font-semibold text-[#2E2118] dark:text-[#F0EAE0] mb-4">
            Add {isDesigner ? 'Designer' : 'Rider'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
            <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Full name"
                required
                className="w-full bg-[#F6F2EC] dark:bg-white/5 rounded-lg px-3.5 py-2.5 text-sm outline-none text-[#2E2118] dark:text-[#E8DFD3] placeholder:text-[#A99A82]"
            />
            <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                required
                className="w-full bg-[#F6F2EC] dark:bg-white/5 rounded-lg px-3.5 py-2.5 text-sm outline-none text-[#2E2118] dark:text-[#E8DFD3] placeholder:text-[#A99A82]"
            />
            {isDesigner && (
                <>
                <input
                    name="specialty"
                    value={form.specialty}
                    onChange={handleChange}
                    placeholder="Specialty (e.g. Interior Design)"
                    className="w-full bg-[#F6F2EC] dark:bg-white/5 rounded-lg px-3.5 py-2.5 text-sm outline-none text-[#2E2118] dark:text-[#E8DFD3] placeholder:text-[#A99A82]"
                />
                <input
                    name="rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={form.rating}
                    onChange={handleChange}
                    placeholder="Rating (0-5)"
                    className="w-full bg-[#F6F2EC] dark:bg-white/5 rounded-lg px-3.5 py-2.5 text-sm outline-none text-[#2E2118] dark:text-[#E8DFD3] placeholder:text-[#A99A82]"
                />
                </>
            )}

            <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#C98A3D] hover:bg-[#A8672A] text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-50 transition-colors mt-2"
            >
                {submitting ? 'Adding...' : `Add ${isDesigner ? 'Designer' : 'Rider'}`}
            </button>
            </form>
        </div>
        </div>
    );
    };

    export default AddPersonModal;