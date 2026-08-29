import { useEffect, useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { fetchUsers, deleteUser } from '../api/userService';
import Table from '../components/Table';
import Loader from '../components/Loader';

const formatDate = (createdAt) => {
  if (!createdAt) return '—';
  const date = createdAt._seconds ? new Date(createdAt._seconds * 1000) : new Date(createdAt);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const ROLE_COLORS = {
  designer: 'bg-[#F3E8FB] text-[#7C3FA8] dark:bg-[#7C3FA8]/20 dark:text-[#D9AFF0]',
  admin: 'bg-[#FBE9E4] text-[#A14E38] dark:bg-[#A14E38]/20 dark:text-[#E8A38C]',
  seller: 'bg-[#EAF2E9] text-[#4E7A4A] dark:bg-[#4E7A4A]/20 dark:text-[#9FC79A]',
  rider: 'bg-[#FEF3E2] text-[#B8790E] dark:bg-[#B8790E]/20 dark:text-[#F0BE7A]',
  user: 'bg-[#E7F0F6] text-[#3E6284] dark:bg-[#3E6284]/20 dark:text-[#9BC2DE]',
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(`Delete user "${name || 'this user'}"? This cannot be undone.`);
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete user. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <Loader full />;

  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase();
    return (
      u.username?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.role?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-serif text-[#2E2118] dark:text-[#F0EAE0]">Users</h1>
          <p className="text-sm text-[#A99A82] mt-1">{filteredUsers.length} of {users.length} users</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-[#2A1F16] border border-[#EDE6DA] dark:border-white/10 rounded-lg px-3 py-2 w-64">
          <Search size={16} className="text-[#A99A82]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, role..."
            className="bg-transparent outline-none text-sm w-full placeholder:text-[#A99A82] text-[#2E2118] dark:text-[#E8DFD3]"
          />
        </div>
      </div>

      <Table columns={['Username', 'Email', 'Role', 'Joined', 'Action']}>
        {filteredUsers.length === 0 ? (
          <tr>
            <td colSpan={5} className="px-5 py-8 text-center text-[#A99A82]">
              No users match your search.
            </td>
          </tr>
        ) : (
          filteredUsers.map((user) => (
            <tr key={user.id} className="hover:bg-[#F9F6F1] dark:hover:bg-white/5 transition-colors">
              <td className="px-5 py-3 font-medium text-[#2E2118] dark:text-[#F0EAE0]">{user.username || '—'}</td>
              <td className="px-5 py-3 text-[#5C4A3A] dark:text-[#C9BBA4]">{user.email || '—'}</td>
              <td className="px-5 py-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                    ROLE_COLORS[user.role?.toLowerCase()] || 'bg-[#F0EAE0] text-[#5C4A3A] dark:bg-white/10 dark:text-[#C9BBA4]'
                  }`}
                >
                  {user.role || 'user'}
                </span>
              </td>
              <td className="px-5 py-3 text-[#A99A82]">{formatDate(user.createdAt)}</td>
              <td className="px-5 py-3">
                <button
                  onClick={() => handleDelete(user.id, user.username)}
                  disabled={deletingId === user.id}
                  className="flex items-center gap-1 bg-[#C1694F] hover:bg-[#A14E38] text-white text-xs font-medium px-3 py-1.5 rounded-md disabled:opacity-50 transition-colors"
                >
                  <Trash2 size={14} />
                  {deletingId === user.id ? 'Deleting...' : 'Delete'}
                </button>
              </td>
            </tr>
          ))
        )}
      </Table>
    </div>
  );
};

export default Users;