import { useEffect, useState } from 'react';
import { Search, Send, CheckSquare, Square, Mail, X, Users, Eye } from 'lucide-react';
import { fetchUsers } from '../api/userService';
import { sendBulkEmail } from '../api/emailService';
import Loader from '../components/Loader';
const buildPreviewHTML = (subject, message) => {
  const formattedMessage = (message || 'Your message will appear here...')
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => `<p style="margin: 0 0 16px 0;">${line}</p>`)
    .join('');

  return `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8" /></head>
  <body style="margin:0; padding:0; background-color:#EDE6DA; font-family: Georgia, 'Times New Roman', serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#EDE6DA; padding: 32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color:#ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(46,33,24,0.08);">

            <tr>
              <td style="background: linear-gradient(135deg, #2E2118, #3E2B1F); padding: 32px 36px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width:40px; height:40px; background-color:#C98A3D; border-radius:10px; text-align:center; vertical-align:middle;">
                      <span style="color:#2E2118; font-size:18px; font-weight:bold; font-family: Georgia, serif;">F</span>
                    </td>
                    <td style="padding-left:14px;">
                      <div style="color:#ffffff; font-size:20px; font-weight:600; letter-spacing:0.5px; line-height:1.2;">Furnexa</div>
                      <div style="color:#C9BBA5; font-size:10px; letter-spacing:1.5px; text-transform:uppercase; margin-top:2px;">Furniture &amp; Interiors</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="height:4px; background: linear-gradient(90deg, #C98A3D, #E0A94A, #C98A3D);"></td>
            </tr>

            <tr>
              <td style="padding: 28px 36px 0 36px;">
                <span style="display:inline-block; background-color:#FBEEDC; color:#A8672A; font-family: Arial, Helvetica, sans-serif; font-size:10px; font-weight:700; letter-spacing:1px; text-transform:uppercase; padding:5px 12px; border-radius:20px;">
                  Message from Furnexa
                </span>
              </td>
            </tr>

            <tr>
              <td style="padding: 16px 36px 8px 36px;">
                <h1 style="margin:0 0 20px 0; font-size:21px; line-height:1.35; color:#2E2118; font-weight:700; font-family: Georgia, serif;">
                  ${subject || 'Your subject line'}
                </h1>
                <div style="font-size:14px; line-height:1.75; color:#4A3B2D; font-family: Arial, Helvetica, sans-serif;">
                  ${formattedMessage}
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding: 8px 36px 32px 36px;">
                <p style="margin:0; font-size:13px; color:#4A3B2D; font-family: Arial, Helvetica, sans-serif;">
                  Warm regards,
                </p>
                <p style="margin:4px 0 0 0; font-size:13px; font-weight:700; color:#2E2118; font-family: Georgia, serif;">
                  The Furnexa Team
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding: 0 36px;">
                <div style="border-top:1px solid #EDE6DA;"></div>
              </td>
            </tr>

            <tr>
              <td style="padding: 24px 36px 28px 36px; background-color:#FAF7F2;" align="center">
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto 12px auto;">
                  <tr>
                    <td style="width:26px; height:26px; background-color:#C98A3D; border-radius:6px; text-align:center; vertical-align:middle;">
                      <span style="color:#2E2118; font-size:12px; font-weight:bold; font-family: Georgia, serif;">F</span>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 6px 0; font-size:11px; color:#A99A82; font-family: Arial, Helvetica, sans-serif; line-height:1.6;">
                  This email was sent by the Furnexa admin team.<br/>
                  If you weren't expecting this message, you can safely ignore it.
                </p>
                <p style="margin:12px 0 0 0; font-size:10px; color:#C9BBA5; font-family: Arial, Helvetica, sans-serif;">
                  © ${new Date().getFullYear()} Furnexa. All rights reserved.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};
const EmailUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchUsers();
        setUsers(data.filter((u) => u.email));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loader full />;

  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase();
    return (
      u.username?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term)
    );
  });

  const allFilteredSelected = filteredUsers.length > 0 && filteredUsers.every((u) => selectedEmails.includes(u.email));

  const toggleUser = (email) => {
    setSelectedEmails((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedEmails((prev) => prev.filter((e) => !filteredUsers.some((u) => u.email === e)));
    } else {
      const newEmails = filteredUsers.map((u) => u.email);
      setSelectedEmails((prev) => Array.from(new Set([...prev, ...newEmails])));
    }
  };

  const handleSend = async () => {
    if (selectedEmails.length === 0 || !subject.trim() || !message.trim()) return;

    setSending(true);
    setResult(null);
    try {
      const res = await sendBulkEmail({ recipients: selectedEmails, subject, message });
      setResult({ success: true, text: res.message });
      setSubject('');
      setMessage('');
      setSelectedEmails([]);
      setShowPreview(false);
    } catch (err) {
      console.error(err);
      setResult({ success: false, text: 'Failed to send emails. Please try again.' });
    } finally {
      setSending(false);
    }
  };

  const initialsOf = (user) => {
    const source = user.username || user.email || '?';
    return source.trim().charAt(0).toUpperCase();
  };
  const previewEmails = selectedEmails.slice(0, 4);
  const extraSelectedCount = selectedEmails.length - previewEmails.length;
  const canSend = !sending && selectedEmails.length > 0 && subject.trim() && message.trim();
  const canPreview = subject.trim() || message.trim();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-serif text-[#2E2118] dark:text-[#F0EAE0]">Email users</h1>
          <p className="text-sm text-[#A99A82] mt-1">
            Send an update, offer, or announcement straight to your leads.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-[#2A1F16] border border-[#EDE6DA] dark:border-white/10 rounded-lg px-3 py-2">
            <Users size={15} className="text-[#C98A3D]" />
            <span className="text-sm text-[#2E2118] dark:text-[#E8DFD3]">
              <span className="font-semibold">{selectedEmails.length}</span>
              <span className="text-[#A99A82]"> / {users.length} selected</span>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 bg-[#FBEAEA] dark:bg-[#3A2420] text-[#C1503F] dark:text-[#E8A79A] rounded-lg px-3 py-2 text-xs font-medium">
            <Mail size={14} />
            Sent via Gmail
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* Recipient list */}
        <div className="bg-white dark:bg-[#2A1F16] rounded-2xl border border-[#EDE6DA] dark:border-white/10 flex flex-col max-h-[560px]">
          <div className="p-4 border-b border-[#EDE6DA] dark:border-white/10 space-y-3">
            <div className="flex items-center gap-2 bg-[#F6F2EC] dark:bg-white/5 rounded-lg px-3 py-2 focus-within:ring-1 focus-within:ring-[#C98A3D]/50 transition-shadow">
              <Search size={15} className="text-[#A99A82] flex-shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="bg-transparent outline-none text-sm w-full placeholder:text-[#A99A82] text-[#2E2118] dark:text-[#E8DFD3]"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="text-[#A99A82] hover:text-[#2E2118] dark:hover:text-[#E8DFD3] flex-shrink-0"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={toggleSelectAll}
                disabled={filteredUsers.length === 0}
                className="flex items-center gap-2 text-sm font-medium text-[#C98A3D] hover:text-[#A8672A] disabled:text-[#C9BBA5] disabled:cursor-not-allowed transition-colors"
              >
                {allFilteredSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                {allFilteredSelected ? 'Deselect all' : 'Select all'} ({filteredUsers.length})
              </button>

              {selectedEmails.length > 0 && (
                <button
                  onClick={() => setSelectedEmails([])}
                  className="text-xs text-[#A99A82] hover:text-[#C1503F] transition-colors"
                >
                  Clear selection
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-14 px-6">
                <Search size={22} className="text-[#D9CDBB] mb-2" />
                <p className="text-sm font-medium text-[#2E2118] dark:text-[#F0EAE0]">No users found</p>
                <p className="text-xs text-[#A99A82] mt-1">Try a different name or email.</p>
              </div>
            ) : (
              filteredUsers.map((user) => {
                const checked = selectedEmails.includes(user.email);
                return (
                  <button
                    key={user.id}
                    onClick={() => toggleUser(user.email)}
                    className={`w-full flex items-center gap-3 px-4 py-3 border-b border-[#F6F2EC] dark:border-white/5 transition-colors text-left ${
                      checked
                        ? 'bg-[#FBF3E7] dark:bg-[#C98A3D]/10'
                        : 'hover:bg-[#F9F6F1] dark:hover:bg-white/5'
                    }`}
                  >
                    {checked ? (
                      <CheckSquare size={17} className="text-[#C98A3D] flex-shrink-0" />
                    ) : (
                      <Square size={17} className="text-[#A99A82] flex-shrink-0" />
                    )}

                    <div className="w-8 h-8 rounded-full bg-[#EDE6DA] dark:bg-white/10 flex items-center justify-center text-xs font-semibold text-[#A8672A] dark:text-[#E8DFD3] flex-shrink-0">
                      {initialsOf(user)}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#2E2118] dark:text-[#F0EAE0] truncate">{user.username || '—'}</p>
                      <p className="text-xs text-[#A99A82] truncate">{user.email}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Compose */}
        <div className="bg-white dark:bg-[#2A1F16] rounded-2xl border border-[#EDE6DA] dark:border-white/10 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Mail size={17} className="text-[#C98A3D]" />
              <h3 className="text-base font-semibold text-[#2E2118] dark:text-[#F0EAE0]">Compose email</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreview(true)}
                disabled={!canPreview}
                className="flex items-center gap-1.5 text-xs font-medium text-[#C98A3D] hover:text-[#A8672A] disabled:text-[#C9BBA5] disabled:cursor-not-allowed transition-colors"
              >
                <Eye size={14} />
                Preview
              </button>
              <span className="hidden sm:flex items-center gap-1.5 bg-[#FBEAEA] dark:bg-[#3A2420] text-[#C1503F] dark:text-[#E8A79A] rounded-full px-2.5 py-1 text-[11px] font-medium">
                <Mail size={12} />
                Gmail
              </span>
            </div>
          </div>

          {/* Recipient preview */}
          <div className="mb-4">
            <p className="text-xs font-medium text-[#A99A82] uppercase tracking-wide mb-2">To</p>
            {selectedEmails.length === 0 ? (
              <p className="text-sm text-[#A99A82] bg-[#F6F2EC] dark:bg-white/5 rounded-lg px-3.5 py-2.5">
                No recipients selected yet — pick users from the list on the left.
              </p>
            ) : (
              <div className="flex flex-wrap items-center gap-1.5">
                {previewEmails.map((email) => (
                  <span
                    key={email}
                    className="text-xs bg-[#F6F2EC] dark:bg-white/5 text-[#2E2118] dark:text-[#E8DFD3] rounded-full px-2.5 py-1"
                  >
                    {email}
                  </span>
                ))}
                {extraSelectedCount > 0 && (
                  <span className="text-xs bg-[#EDE6DA] dark:bg-white/10 text-[#A8672A] dark:text-[#E8DFD3] rounded-full px-2.5 py-1 font-medium">
                    +{extraSelectedCount} more
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="space-y-1 mb-3">
            <label className="text-xs font-medium text-[#A99A82] uppercase tracking-wide">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="w-full bg-[#F6F2EC] dark:bg-white/5 rounded-lg px-3.5 py-2.5 text-sm outline-none text-[#2E2118] dark:text-[#E8DFD3] placeholder:text-[#A99A82] focus:ring-1 focus:ring-[#C98A3D]/50 transition-shadow"
            />
          </div>

          <div className="space-y-1 mb-4 flex-1 flex flex-col">
            <label className="text-xs font-medium text-[#A99A82] uppercase tracking-wide">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message here..."
              rows={8}
              className="flex-1 w-full bg-[#F6F2EC] dark:bg-white/5 rounded-lg px-3.5 py-2.5 text-sm outline-none text-[#2E2118] dark:text-[#E8DFD3] placeholder:text-[#A99A82] resize-none focus:ring-1 focus:ring-[#C98A3D]/50 transition-shadow"
            />
          </div>

          {result && (
            <div
              className={`text-sm mb-3 rounded-lg px-3.5 py-2.5 ${
                result.success
                  ? 'bg-[#EEF5EC] text-[#4E7A4A] dark:bg-[#2A3A28] dark:text-[#9DC49A]'
                  : 'bg-[#FBEAEA] text-[#C1694F] dark:bg-[#3A2420] dark:text-[#E8A79A]'
              }`}
            >
              {result.text}
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={!canSend}
            className="flex items-center justify-center gap-2 bg-[#C98A3D] hover:bg-[#A8672A] text-white text-sm font-medium px-4 py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={15} />
            {sending ? 'Sending...' : `Send to ${selectedEmails.length} ${selectedEmails.length === 1 ? 'user' : 'users'}`}
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={() => setShowPreview(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#2A1F16] rounded-2xl w-full max-w-lg shadow-2xl border border-[#EDE6DA] dark:border-white/10 overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#EDE6DA] dark:border-white/10">
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-[#C98A3D]" />
                <h3 className="text-sm font-semibold text-[#2E2118] dark:text-[#F0EAE0]">Email preview</h3>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="text-[#A99A82] hover:text-white hover:bg-[#C1694F] p-1.5 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="bg-[#F6F2EC] max-h-[70vh] overflow-y-auto">
              <iframe
                title="Email preview"
                srcDoc={buildPreviewHTML(subject, message)}
                className="w-full border-0"
                style={{ height: '520px' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailUsers;