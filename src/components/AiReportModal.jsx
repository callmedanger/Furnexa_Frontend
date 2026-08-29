import { useState, useRef, useEffect, useMemo } from 'react';
import { X, Sparkles, Download, RefreshCw, AlertCircle, Send } from 'lucide-react';
import jsPDF from 'jspdf';
import { generateAIReport, chatWithAI } from '../api/reportService';
import {
  PieChart, Pie, Cell, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, ResponsiveContainer,
} from 'recharts';

const STATUS_COLORS = {
  Delivered: '#5C7A54',
  Cancelled: '#C1694F',
  Pending: '#A99A82',
  Dispatched: '#C98A3D',
  Other: '#8A7C68',
};

// Order status ko normalize karo (jaisay backend mein karte hain — "Deliverd" ko "Delivered" bana do)
function normalizeStatus(raw) {
  const s = (raw || 'Pending').trim().toLowerCase();
  if (s.startsWith('deliv')) return 'Delivered';
  if (s.startsWith('cancel')) return 'Cancelled';
  if (s.startsWith('pend')) return 'Pending';
  if (s.startsWith('dispatch')) return 'Dispatched';
  return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : 'Other';
}

function getOrderDate(o) {
  const raw = o.createdAt || o.orderDate || o.date;
  return raw ? new Date(raw) : null;
}

function buildChartData({ orders = [], products = [] }) {
  // Order status pie data
  const statusCounts = orders.reduce((acc, o) => {
    const status = normalizeStatus(o.orderStatus);
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  // Top products bar data
  const productData = [...products]
    .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
    .slice(0, 5)
    .map((p) => ({
      name: (p.title || p.author || 'Untitled').length > 14
        ? (p.title || p.author).slice(0, 14) + '…'
        : (p.title || p.author || 'Untitled'),
      sales: p.salesCount || 0,
    }));

  // Revenue trend (month-wise)
  const monthMap = {};
  orders.forEach((o) => {
    const d = getOrderDate(o);
    if (!d || isNaN(d)) return;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthMap[key] = (monthMap[key] || 0) + (o.totalPrice || 0);
  });
  const revenueData = Object.entries(monthMap)
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([key, revenue]) => {
      const [y, m] = key.split('-');
      const label = new Date(Number(y), Number(m) - 1).toLocaleString('en', { month: 'short' });
      return { name: label, revenue };
    });

  return { statusData, productData, revenueData };
}

const AiReportModal = ({ isOpen, onClose, data }) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState('');
  const [error, setError] = useState(false);
  const [showCharts, setShowCharts] = useState(false);

  // Chat wali state (sirf report aane ke baad use hoti hai)
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState(false);
  const scrollRef = useRef(null);

  const chartData = useMemo(() => buildChartData(data || {}), [data]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, chatLoading]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setError(false);
    setShowCharts(false); // jab tak response na aaye, charts hide rahengi
    setMessages([]);
    setChatError(false);
    try {
      const result = await generateAIReport(data);
      setReport(result.report);
      setShowCharts(true); // response aane ke baad hi charts + report ek sath show hongi
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || chatLoading) return;

    const nextMessages = [...messages, { role: 'user', content: trimmed }];
    setMessages(nextMessages);
    setInput('');
    setChatLoading(true);
    setChatError(false);

    try {
      const result = await chatWithAI({ messages: nextMessages, ...data });
      setMessages((prev) => [...prev, { role: 'assistant', content: result.reply }]);
    } catch (err) {
      console.error(err);
      setChatError(true);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSend = () => sendMessage(input);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const maxWidth = pageWidth - margin * 2;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Furnexa — Business Report', margin, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`Generated: ${new Date().toLocaleString('en-GB')}`, margin, 27);

    doc.setTextColor(30);
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(report, maxWidth);

    let y = 38;
    const lineHeight = 6;
    const pageHeight = doc.internal.pageSize.getHeight();

    lines.forEach((line) => {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, margin, y);
      y += lineHeight;
    });

    doc.save(`furnexa-report-${Date.now()}.pdf`);
  };

  const quickPrompts = [
    'Which orders need attention?',
    'How are we doing on revenue?',
    'Top performing products?',
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#2A1F16] rounded-2xl shadow-xl border border-[#EDE6DA] dark:border-white/10 w-full max-w-2xl h-[85vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#EDE6DA] dark:border-white/10 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-[#C98A3D]" />
              <h2 className="text-lg font-serif text-[#2E2118] dark:text-[#F0EAE0]">AI Business Report</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full text-[#8A7C68] hover:bg-[#F6F2EC] dark:hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            {!showCharts && !loading && !error && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Sparkles size={28} className="text-[#C98A3D] mb-3" />
                <p className="text-sm text-[#5C4A3A] dark:text-[#C9BBA4] max-w-sm">
                  Generate an AI-written summary of your current orders, revenue, customers, products, and feedback.
                </p>
              </div>
            )}

            {/* Charts turant dikhao jab tak AI text load ho raha ho */}
            {showCharts && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  {/* Order Status pie chart */}
                  <div className="bg-[#FAF7F2] dark:bg-white/5 rounded-xl p-3">
                    <p className="text-xs font-medium text-[#8A7C68] dark:text-[#A99A82] mb-2">Order Status</p>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie
                          data={chartData.statusData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={35}
                          outerRadius={60}
                          paddingAngle={2}
                        >
                          {chartData.statusData.map((entry, idx) => (
                            <Cell key={idx} fill={STATUS_COLORS[entry.name] || STATUS_COLORS.Other} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-1">
                      {chartData.statusData.map((entry, idx) => (
                        <div key={idx} className="flex items-center gap-1 text-[10px] text-[#5C4A3A] dark:text-[#C9BBA4]">
                          <span
                            className="w-2 h-2 rounded-full inline-block"
                            style={{ backgroundColor: STATUS_COLORS[entry.name] || STATUS_COLORS.Other }}
                          />
                          {entry.name} ({entry.value})
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Products bar chart */}
                  <div className="bg-[#FAF7F2] dark:bg-white/5 rounded-xl p-3">
                    <p className="text-xs font-medium text-[#8A7C68] dark:text-[#A99A82] mb-2">Top Products (Sales)</p>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={chartData.productData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#EDE6DA" />
                        <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={40} />
                        <YAxis tick={{ fontSize: 9 }} />
                        <Tooltip />
                        <Bar dataKey="sales" fill="#C98A3D" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Revenue Trend line chart */}
                {chartData.revenueData.length > 0 && (
                  <div className="bg-[#FAF7F2] dark:bg-white/5 rounded-xl p-3">
                    <p className="text-xs font-medium text-[#8A7C68] dark:text-[#A99A82] mb-2">Revenue Trend</p>
                    <ResponsiveContainer width="100%" height={160}>
                      <LineChart data={chartData.revenueData} margin={{ top: 5, right: 15, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#EDE6DA" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="revenue" stroke="#5C7A54" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-9 h-9 border-2 border-[#C98A3D] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm font-medium text-[#2E2118] dark:text-[#F0EAE0] mb-1">Analyzing your business data...</p>
                <p className="text-xs text-[#A99A82]">This includes orders, revenue, customers, products, and feedback.</p>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle size={24} className="text-[#C1694F] mb-2" />
                <p className="text-sm text-[#2E2118] dark:text-[#F0EAE0]">Something went wrong.</p>
              </div>
            )}

            {report && !loading && (
              <>
                <pre className="whitespace-pre-wrap text-sm text-[#5C4A3A] dark:text-[#C9BBA4] font-sans leading-relaxed">
                  {report}
                </pre>

                {/* Report ke neeche divider aur chat section */}
                <div className="border-t border-[#EDE6DA] dark:border-white/10 pt-4 mt-2 space-y-3">
                  <p className="text-xs font-medium text-[#8A7C68] dark:text-[#A99A82] uppercase tracking-wide">
                    Ask a follow-up question
                  </p>

                  {messages.length === 0 && (
                    <div className="flex flex-wrap gap-2">
                      {quickPrompts.map((q) => (
                        <button
                          key={q}
                          onClick={() => sendMessage(q)}
                          className="text-xs px-3 py-1.5 rounded-full border border-[#EDE6DA] dark:border-white/10 text-[#5C4A3A] dark:text-[#C9BBA4] hover:bg-[#F6F2EC] dark:hover:bg-white/5 transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}

                  {messages.map((m, idx) => (
                    <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed ${
                          m.role === 'user'
                            ? 'bg-[#C98A3D] text-white'
                            : 'bg-[#F6F2EC] dark:bg-white/5 text-[#2E2118] dark:text-[#F0EAE0]'
                        }`}
                      >
                        {m.content}
                      </div>
                    </div>
                  ))}

                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-[#F6F2EC] dark:bg-white/5 rounded-2xl px-4 py-3 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#A99A82] animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#A99A82] animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#A99A82] animate-bounce" />
                      </div>
                    </div>
                  )}

                  {chatError && (
                    <div className="flex items-center gap-2 text-sm text-[#C1694F] justify-center">
                      <AlertCircle size={15} />
                      Something went wrong. Try again.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer: report ke bina Generate button, report ke baad chat input */}
          {report ? (
            <div className="border-t border-[#EDE6DA] dark:border-white/10 px-5 py-3.5 flex-shrink-0 space-y-2.5">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-1.5 text-xs font-medium text-[#5C4A3A] dark:text-[#C9BBA4] hover:text-[#C98A3D] transition-colors"
                >
                  <Download size={13} />
                  Download PDF
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="flex items-center gap-1.5 text-xs font-medium text-[#5C4A3A] dark:text-[#C9BBA4] hover:text-[#C98A3D] disabled:opacity-50 transition-colors"
                >
                  <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                  Regenerate
                </button>
              </div>
              <div className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about orders, revenue, customers..."
                  rows={1}
                  className="flex-1 resize-none bg-[#F6F2EC] dark:bg-white/5 rounded-lg px-3.5 py-2.5 text-sm outline-none text-[#2E2118] dark:text-[#E8DFD3] placeholder:text-[#A99A82] max-h-24"
                />
                <button
                  onClick={handleSend}
                  disabled={chatLoading || !input.trim()}
                  className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg bg-[#C98A3D] hover:bg-[#A8672A] text-white disabled:opacity-50 transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[#EDE6DA] dark:border-white/10 flex-shrink-0">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="flex items-center gap-1.5 text-sm font-medium text-white bg-[#C98A3D] hover:bg-[#A8672A] px-4 py-2 rounded-lg disabled:opacity-50 transition-colors"
              >
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                Generate Report
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
    
export default AiReportModal;