import { useEffect, useState, useMemo } from 'react';
import { Search, X, ChevronDown, RefreshCw, AlertCircle } from 'lucide-react';
import { fetchOrders } from '../api/orderService';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Loader from '../components/Loader';

const ORDER_STATUSES = ['Pending', 'Confirmed', 'Processing', 'Dispatched', 'Delivered', 'Cancelled'];
const PAYMENT_STATUSES = ['Paid', 'Pending', 'Failed', 'Refunded'];

// Normalize inconsistent/misspelled status values coming from the database into
// a fixed display set, without touching the underlying record.
const normalizeOrderStatus = (raw) => {
  if (!raw) return 'Pending';
  const key = raw.toString().trim().toLowerCase();
  const map = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    confirm: 'Confirmed',
    processing: 'Processing',
    dispatched: 'Dispatched',
    dispatch: 'Dispatched',
    shipped: 'Dispatched',
    delivered: 'Delivered',
    deliverd: 'Delivered',
    delivary: 'Delivered',
    delivery: 'Delivered',
    completed: 'Delivered',
    cancelled: 'Cancelled',
    canceled: 'Cancelled',
    cancel: 'Cancelled',
  };
  return map[key] || raw;
};

const normalizePaymentStatus = (raw) => {
  if (!raw) return 'Pending';
  const key = raw.toString().trim().toLowerCase();
  const map = {
    paid: 'Paid',
    pending: 'Pending',
    unpaid: 'Pending',
    failed: 'Failed',
    fail: 'Failed',
    refunded: 'Refunded',
    refund: 'Refunded',
  };
  return map[key] || raw;
};

const formatDate = (createdAt) => {
  if (!createdAt) return '—';
  const date = createdAt._seconds ? new Date(createdAt._seconds * 1000) : new Date(createdAt);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatDateTime = (ts) => {
  if (!ts) return '—';
  const date = ts._seconds ? new Date(ts._seconds * 1000) : new Date(ts);
  return date.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const toDate = (ts) => (ts?._seconds ? new Date(ts._seconds * 1000) : ts ? new Date(ts) : null);

const shortId = (id) => (id ? `#${id.toString().slice(-6).toUpperCase()}` : '—');

// Read a field from a few possible key spellings without inventing data —
// returns undefined if none of the candidates exist on the object.
const pick = (obj, keys) => {
  for (const k of keys) {
    if (obj?.[k] !== undefined && obj?.[k] !== null && obj?.[k] !== '') return obj[k];
  }
  return undefined;
};

const STATUS_STEPS = ['Pending', 'Confirmed', 'Processing', 'Dispatched', 'Delivered'];

const OrderStatusTimeline = ({ status }) => {
  if (status === 'Cancelled') {
    return (
      <div className="flex items-center gap-2 text-sm text-[#A14E38]">
        <span className="w-2.5 h-2.5 rounded-full bg-[#A14E38]" />
        Order Cancelled
      </div>
    );
  }

  const currentIdx = STATUS_STEPS.indexOf(status);

  return (
    <div className="flex items-center">
      {STATUS_STEPS.map((step, idx) => {
        const done = idx <= currentIdx;
        const isLast = idx === STATUS_STEPS.length - 1;
        return (
          <div key={step} className={`flex items-center ${isLast ? '' : 'flex-1'}`}>
            <div className="flex flex-col items-center">
              <div
                className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  done ? 'bg-[#C98A3D]' : 'bg-[#F0EAE0] dark:bg-white/10'
                }`}
              />
              <span
                className={`text-[10px] mt-1.5 whitespace-nowrap ${
                  done ? 'text-[#2E2118] dark:text-[#F0EAE0] font-medium' : 'text-[#A99A82]'
                }`}
              >
                {step}
              </span>
            </div>
            {!isLast && (
              <div className={`flex-1 h-0.5 mx-1 mb-4 ${idx < currentIdx ? 'bg-[#C98A3D]' : 'bg-[#F0EAE0] dark:bg-white/10'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

const OrderDetailsDrawer = ({ order, onClose }) => {
  if (!order) return null;

  const status = normalizeOrderStatus(order.orderStatus);
  const paymentStatus = normalizePaymentStatus(order.paymentStatus);

  const email = pick(order, ['Email', 'email']);
  const address = pick(order, ['address', 'Address', 'deliveryAddress', 'shippingAddress']);
  const deliveryCharges = pick(order, ['deliveryCharges', 'deliveryFee', 'shippingFee']);
  const subtotal = pick(order, ['subtotal', 'subTotal']);
  const transactionId = pick(order, ['transactionId', 'paymentIntentId', 'stripePaymentId', 'stripeId']);
  const paymentDate = pick(order, ['paymentDate', 'paidAt']);
  const deliveryStatus = pick(order, ['deliveryStatus']);

  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-30" onClick={onClose} />
      <div className="fixed right-0 top-0 h-screen w-full max-w-md bg-white dark:bg-[#2A1F16] shadow-xl z-40 overflow-y-auto border-l border-[#EDE6DA] dark:border-white/10">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EDE6DA] dark:border-white/10 sticky top-0 bg-white dark:bg-[#2A1F16] z-10">
          <div>
            <h2 className="text-lg font-serif text-[#2E2118] dark:text-[#F0EAE0]">Order {shortId(order.id)}</h2>
            <p className="text-xs text-[#A99A82] mt-0.5">{formatDateTime(order.createdAt)}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-[#8A7C68] hover:bg-[#F6F2EC] dark:hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Status timeline */}
          <div>
            <p className="text-xs font-medium text-[#8A7C68] uppercase tracking-wide mb-3">Order Progress</p>
            <OrderStatusTimeline status={status} />
          </div>

          {/* Customer */}
          <div>
            <p className="text-xs font-medium text-[#8A7C68] uppercase tracking-wide mb-2">Customer</p>
            <div className="bg-[#F6F2EC] dark:bg-white/5 rounded-xl p-4 space-y-1.5">
              <p className="text-sm font-medium text-[#2E2118] dark:text-[#F0EAE0]">{order.FullName || '—'}</p>
              <p className="text-sm text-[#5C4A3A] dark:text-[#C9BBA4]">{order.Phone || '—'}</p>
              {email && <p className="text-sm text-[#5C4A3A] dark:text-[#C9BBA4]">{email}</p>}
              {address && <p className="text-sm text-[#A99A82] mt-1">{address}</p>}
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="text-xs font-medium text-[#8A7C68] uppercase tracking-wide mb-2">Products</p>
            <div className="bg-[#F6F2EC] dark:bg-white/5 rounded-xl divide-y divide-[#EDE6DA] dark:divide-white/10">
              {items.length === 0 ? (
                <p className="text-sm text-[#A99A82] px-4 py-3">No item details available.</p>
              ) : (
                items.map((item, idx) => {
                  const name = pick(item, ['name', 'title', 'productName']) || 'Item';
                  const qty = pick(item, ['quantity', 'qty']) || 1;
                  const price = pick(item, ['price', 'unitPrice']);
                  return (
                    <div key={idx} className="flex items-center justify-between px-4 py-2.5 text-sm">
                      <div>
                        <p className="text-[#2E2118] dark:text-[#F0EAE0]">{name}</p>
                        <p className="text-xs text-[#A99A82]">Qty: {qty}</p>
                      </div>
                      {price !== undefined && (
                        <span className="text-[#5C4A3A] dark:text-[#C9BBA4]">Rs. {Number(price).toLocaleString()}</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="px-1 mt-3 space-y-1.5">
              {subtotal !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#A99A82]">Subtotal</span>
                  <span className="text-[#5C4A3A] dark:text-[#C9BBA4]">Rs. {Number(subtotal).toLocaleString()}</span>
                </div>
              )}
              {deliveryCharges !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#A99A82]">Delivery Charges</span>
                  <span className="text-[#5C4A3A] dark:text-[#C9BBA4]">Rs. {Number(deliveryCharges).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-semibold pt-1.5 border-t border-[#EDE6DA] dark:border-white/10">
                <span className="text-[#2E2118] dark:text-[#F0EAE0]">Total</span>
                <span className="text-[#2E2118] dark:text-[#F0EAE0]">Rs. {order.totalPrice?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div>
            <p className="text-xs font-medium text-[#8A7C68] uppercase tracking-wide mb-2">Payment</p>
            <div className="bg-[#F6F2EC] dark:bg-white/5 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#A99A82]">Status</span>
                <Badge text={paymentStatus} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#A99A82]">Method</span>
                <span className="text-[#5C4A3A] dark:text-[#C9BBA4]">{order.paymentMethod || '—'}</span>
              </div>
              {transactionId && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#A99A82]">Transaction ID</span>
                  <span className="text-[#5C4A3A] dark:text-[#C9BBA4] font-mono text-xs">{transactionId}</span>
                </div>
              )}
              {paymentDate && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#A99A82]">Paid On</span>
                  <span className="text-[#5C4A3A] dark:text-[#C9BBA4]">{formatDateTime(paymentDate)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Delivery */}
          <div>
            <p className="text-xs font-medium text-[#8A7C68] uppercase tracking-wide mb-2">Delivery</p>
            <div className="bg-[#F6F2EC] dark:bg-white/5 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#A99A82]">Rider</span>
                <span className="text-[#5C4A3A] dark:text-[#C9BBA4]">{order.assignedRiderName || 'Not assigned'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#A99A82]">Order Status</span>
                <Badge text={status} />
              </div>
              {deliveryStatus && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#A99A82]">Delivery Status</span>
                  <span className="text-[#5C4A3A] dark:text-[#C9BBA4]">{deliveryStatus}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [riderFilter, setRiderFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await fetchOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const riders = useMemo(() => {
    const names = orders.map((o) => o.assignedRiderName).filter(Boolean);
    return Array.from(new Set(names));
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const term = search.toLowerCase().trim();
    const now = new Date();

    return orders.filter((o) => {
      const status = normalizeOrderStatus(o.orderStatus);
      const payment = normalizePaymentStatus(o.paymentStatus);

      const matchesSearch =
        !term ||
        o.FullName?.toLowerCase().includes(term) ||
        o.Phone?.toLowerCase().includes(term) ||
        o.id?.toLowerCase().includes(term) ||
        status.toLowerCase().includes(term) ||
        payment.toLowerCase().includes(term) ||
        o.paymentMethod?.toLowerCase().includes(term) ||
        o.assignedRiderName?.toLowerCase().includes(term);

      const matchesStatus = statusFilter === 'All' || status === statusFilter;
      const matchesPayment = paymentFilter === 'All' || payment === paymentFilter;
      const matchesRider = riderFilter === 'All' || o.assignedRiderName === riderFilter;

      let matchesDate = true;
      if (dateFilter !== 'All') {
        const d = toDate(o.createdAt);
        if (!d) {
          matchesDate = false;
        } else {
          const diffDays = (now - d) / (1000 * 60 * 60 * 24);
          if (dateFilter === 'Today') matchesDate = d.toDateString() === now.toDateString();
          else if (dateFilter === 'Last 7 Days') matchesDate = diffDays <= 7;
          else if (dateFilter === 'Last 30 Days') matchesDate = diffDays <= 30;
        }
      }

      return matchesSearch && matchesStatus && matchesPayment && matchesRider && matchesDate;
    });
  }, [orders, search, statusFilter, paymentFilter, riderFilter, dateFilter]);

  const counts = useMemo(() => {
    const c = { Total: orders.length, Pending: 0, Processing: 0, Delivered: 0, Cancelled: 0 };
    orders.forEach((o) => {
      const status = normalizeOrderStatus(o.orderStatus);
      if (c[status] !== undefined) c[status] += 1;
    });
    return c;
  }, [orders]);

  const filtersActive =
    statusFilter !== 'All' || paymentFilter !== 'All' || riderFilter !== 'All' || dateFilter !== 'All' || search.trim() !== '';

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setPaymentFilter('All');
    setRiderFilter('All');
    setDateFilter('All');
  };

  if (loading) return <Loader full />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertCircle size={28} className="text-[#C1694F] mb-3" />
        <p className="text-sm font-medium text-[#2E2118] dark:text-[#F0EAE0]">Unable to load orders.</p>
        <button
          onClick={load}
          className="flex items-center gap-1.5 mt-4 text-sm font-medium text-[#C98A3D] hover:text-[#A8672A] transition-colors"
        >
          <RefreshCw size={14} />
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-serif text-[#2E2118] dark:text-[#F0EAE0]">Orders</h1>
          <p className="text-sm text-[#A99A82] mt-1">{filteredOrders.length} of {orders.length} orders</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-[#2A1F16] border border-[#EDE6DA] dark:border-white/10 rounded-lg px-3 py-2 w-64">
          <Search size={16} className="text-[#A99A82]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer, ID, status..."
            className="bg-transparent outline-none text-sm w-full placeholder:text-[#A99A82] text-[#2E2118] dark:text-[#E8DFD3]"
          />
        </div>
      </div>

      {/* Compact KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total Orders', value: counts.Total, color: '#5C86A8' },
          { label: 'Pending', value: counts.Pending, color: '#C98A3D' },
          { label: 'Processing', value: counts.Processing, color: '#3E6284' },
          { label: 'Delivered', value: counts.Delivered, color: '#4E7A4A' },
          { label: 'Cancelled', value: counts.Cancelled, color: '#A14E38' },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white dark:bg-[#2A1F16] border border-[#EDE6DA] dark:border-white/10 rounded-xl px-4 py-3"
          >
            <p className="text-xs text-[#A99A82]">{kpi.label}</p>
            <p className="text-lg font-semibold mt-0.5" style={{ color: kpi.color }}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <FilterSelect label="Order Status" value={statusFilter} onChange={setStatusFilter} options={['All', ...ORDER_STATUSES]} />
        <FilterSelect label="Payment" value={paymentFilter} onChange={setPaymentFilter} options={['All', ...PAYMENT_STATUSES]} />
        <FilterSelect label="Rider" value={riderFilter} onChange={setRiderFilter} options={['All', ...riders]} />
        <FilterSelect label="Date" value={dateFilter} onChange={setDateFilter} options={['All', 'Today', 'Last 7 Days', 'Last 30 Days']} />

        {filtersActive && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-[#C1694F] hover:text-[#A14E38] font-medium px-2 py-1.5 transition-colors"
          >
            <X size={13} />
            Clear filters
          </button>
        )}
      </div>

      <Table columns={['Order ID', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Rider', 'Date']}>
        {filteredOrders.length === 0 ? (
          <tr>
            <td colSpan={8} className="px-5 py-8 text-center text-[#A99A82]">
              {orders.length === 0 ? 'No orders found.' : 'No orders match your current filters.'}
            </td>
          </tr>
        ) : (
          filteredOrders.map((order) => {
            const status = normalizeOrderStatus(order.orderStatus);
            const paymentStatus = normalizePaymentStatus(order.paymentStatus);
            return (
              <tr
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="hover:bg-[#F9F6F1] dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <td className="px-5 py-3 text-[#A99A82] font-mono text-xs">{shortId(order.id)}</td>
                <td className="px-5 py-3">
                  <p className="font-medium text-[#2E2118] dark:text-[#F0EAE0]">{order.FullName}</p>
                  <p className="text-xs text-[#A99A82]">{order.Phone}</p>
                </td>
                <td className="px-5 py-3 text-[#5C4A3A] dark:text-[#C9BBA4]">{order.items?.length || 0} item(s)</td>
                <td className="px-5 py-3 font-medium text-[#2E2118] dark:text-[#F0EAE0]">
                  Rs. {order.totalPrice?.toLocaleString() || 0}
                </td>
                <td className="px-5 py-3">
                  <Badge text={paymentStatus} />
                  <p className="text-xs text-[#A99A82] mt-1">{order.paymentMethod}</p>
                </td>
                <td className="px-5 py-3">
                  <Badge text={status} />
                </td>
                <td className="px-5 py-3 text-[#5C4A3A] dark:text-[#C9BBA4]">{order.assignedRiderName || '—'}</td>
                <td className="px-5 py-3 text-[#A99A82] whitespace-nowrap">{formatDate(order.createdAt)}</td>
              </tr>
            );
          })
        )}
      </Table>

      {selectedOrder && <OrderDetailsDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </div>
  );
};

const FilterSelect = ({ label, value, onChange, options }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none bg-white dark:bg-[#2A1F16] border border-[#EDE6DA] dark:border-white/10 rounded-lg pl-3 pr-8 py-2 text-xs font-medium text-[#5C4A3A] dark:text-[#C9BBA4] cursor-pointer hover:border-[#C98A3D]/40 transition-colors focus:outline-none focus:border-[#C98A3D]/60"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt === 'All' ? `${label}: All` : opt}
        </option>
      ))}
    </select>
    <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A99A82] pointer-events-none" />
  </div>
);

export default Orders;