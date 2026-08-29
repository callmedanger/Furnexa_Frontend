import { useEffect, useState } from 'react';
import { Users, ShoppingBag, Wallet, TrendingUp, Star, UserPlus, Repeat, Sparkles } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell,
} from 'recharts';
import { fetchUsers } from '../api/userService';
import { fetchOrders } from '../api/orderService';
import { fetchFeedbacks } from '../api/feedbackService';
import { fetchProducts } from '../api/productService';
import StatCard from '../components/StatCard';
import Loader from '../components/Loader';
import AiReportModal from '../components/AiReportModal';

const STATUS_COLORS = {
  Delivered: '#7A9B76',
  Pending: '#C98A3D',
  Cancelled: '#C1694F',
  Processing: '#5C86A8',
};

const ROLE_COLORS = {
  admin: '#A14E38',
  designer: '#7C3FA8',
  seller: '#4E7A4A',
  rider: '#B8790E',
  user: '#3E6284',
};

const CATEGORY_COLORS = ['#C98A3D', '#5C86A8', '#7A9B76', '#C1694F', '#7C3FA8', '#B8790E'];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const toDate = (ts) => (ts?._seconds ? new Date(ts._seconds * 1000) : new Date(ts));

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [products, setProducts] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData, ordersData, feedbacksData, productsData] = await Promise.all([
          fetchUsers(),
          fetchOrders(),
          fetchFeedbacks(),
          fetchProducts(),
        ]);
        setUsers(usersData);
        setOrders(ordersData);
        setFeedbacks(feedbacksData);
        setProducts(productsData);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <Loader full />;

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const receivedAmount = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const dueAmount = totalRevenue - receivedAmount;
  const avgOrderValue = orders.length ? Math.round(totalRevenue / orders.length) : 0;

  const currentMonth = new Date().getMonth();
  const monthlyRevenue = MONTHS.slice(0, currentMonth + 1).map((month, idx) => {
    const monthOrders = orders.filter((o) => toDate(o.createdAt).getMonth() === idx);
    const revenue = monthOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const received = monthOrders
      .filter((o) => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    return { month, revenue, received };
  });

  const statusCounts = orders.reduce((acc, o) => {
    const status = o.orderStatus || 'Pending';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const weeklyData = last7Days.map((date) => {
    const dayOrders = orders.filter((o) => toDate(o.createdAt).toDateString() === date.toDateString());
    const revenue = dayOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    return { day: WEEKDAYS[date.getDay()], orders: dayOrders.length, revenue: Math.round(revenue / 1000) };
  });

  const recentOrders = [...orders]
    .sort((a, b) => toDate(b.createdAt) - toDate(a.createdAt))
    .slice(0, 5);

  const topProducts = [...products].sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0)).slice(0, 5);
  const maxSales = Math.max(...topProducts.map((p) => p.salesCount || 0), 1);

  const categoryCounts = products.reduce((acc, p) => {
    const cat = p.genere || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));

  const hasInventoryData = products.some((p) => 'stock' in p || 'quantity' in p);

  const customerUsers = users.filter((u) => (u.role || 'user').toLowerCase() === 'user');
  const newCustomersThisMonth = customerUsers.filter((u) => {
    const d = toDate(u.createdAt);
    return d.getMonth() === currentMonth && d.getFullYear() === new Date().getFullYear();
  }).length;

  const ordersByCustomer = orders.reduce((acc, o) => {
    if (o.userId) acc[o.userId] = (acc[o.userId] || 0) + 1;
    return acc;
  }, {});
  const returningCustomers = Object.values(ordersByCustomer).filter((count) => count > 1).length;

  const avgRating = feedbacks.length
    ? (feedbacks.reduce((sum, f) => sum + (Number(f.rating) || 5), 0) / feedbacks.length).toFixed(1)
    : '0.0';

  const roleCounts = users.reduce((acc, u) => {
    const role = (u.role || 'user').toLowerCase();
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});
  const roleData = Object.entries(roleCounts).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-serif text-[#2E2118] dark:text-[#F0EAE0]">Dashboard</h1>
          <p className="text-sm text-[#A99A82] mt-1">Furnexa business overview</p>
        </div>
        <button
          onClick={() => setShowReportModal(true)}
          className="flex items-center gap-1.5 text-sm font-medium text-white bg-[#C98A3D] hover:bg-[#A8672A] px-4 py-2 rounded-lg transition-colors"
        >
          <Sparkles size={15} />
          AI Report
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Revenue"
          value={`Rs. ${totalRevenue.toLocaleString()}`}
          icon={Wallet}
          gradient="bg-gradient-to-br from-[#7A9B76] to-[#5A7A56]"
          sub={`Rs. ${receivedAmount.toLocaleString()} received`}
        />
        <StatCard
          title="Total Orders"
          value={orders.length}
          icon={ShoppingBag}
          gradient="bg-gradient-to-br from-[#5C86A8] to-[#3E6284]"
          sub={`${statusCounts.Delivered || 0} delivered`}
        />
        <StatCard
          title="Total Customers"
          value={customerUsers.length}
          icon={Users}
          gradient="bg-gradient-to-br from-[#C98A3D] to-[#A8672A]"
          sub={`${newCustomersThisMonth} new this month`}
        />
        <StatCard
          title="Avg. Order Value"
          value={`Rs. ${avgOrderValue.toLocaleString()}`}
          icon={TrendingUp}
          gradient="bg-gradient-to-br from-[#C1694F] to-[#A14E38]"
          sub="Per order, all time"
        />
      </div>

      {/* Payments Overview + Order Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white dark:bg-[#2A1F16] rounded-2xl p-5 shadow-sm border border-[#EDE6DA] dark:border-white/10">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-semibold text-[#2E2118] dark:text-[#F0EAE0]">Payments Overview</h3>
            <TrendingUp size={16} className="text-[#7A9B76]" />
          </div>
          <p className="text-xs text-[#A99A82] mb-4">Revenue vs amount received, monthly</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyRevenue}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C98A3D" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#C98A3D" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="receivedFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7A9B76" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#7A9B76" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDE6DA" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#A99A82' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#A99A82' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #EDE6DA', fontSize: 12 }}
                formatter={(value) => `Rs. ${value.toLocaleString()}`}
              />
              <Area type="monotone" dataKey="revenue" stroke="#C98A3D" strokeWidth={2} fill="url(#revenueFill)" name="Total Revenue" />
              <Area type="monotone" dataKey="received" stroke="#7A9B76" strokeWidth={2} fill="url(#receivedFill)" name="Received" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#F0EAE0] dark:border-white/10">
            <div>
              <p className="text-xs text-[#A99A82]">Received Amount</p>
              <p className="text-lg font-semibold text-[#7A9B76] mt-1">Rs. {receivedAmount.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#A99A82]">Due Amount</p>
              <p className="text-lg font-semibold text-[#C1694F] mt-1">Rs. {dueAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#2A1F16] rounded-2xl p-5 shadow-sm border border-[#EDE6DA] dark:border-white/10">
          <h3 className="text-base font-semibold text-[#2E2118] dark:text-[#F0EAE0] mb-4">Order Status</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={70} paddingAngle={3}>
                {statusData.map((entry, idx) => (
                  <Cell key={idx} fill={STATUS_COLORS[entry.name] || '#B8AA97'} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-3">
            {statusData.map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[entry.name] || '#B8AA97' }} />
                  <span className="text-[#5C4A3A] dark:text-[#C9BBA4]">{entry.name}</span>
                </div>
                <span className="text-[#A99A82] font-medium">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Performance + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-[#2A1F16] rounded-2xl p-5 shadow-sm border border-[#EDE6DA] dark:border-white/10">
          <h3 className="text-base font-semibold text-[#2E2118] dark:text-[#F0EAE0] mb-1">This Week's Performance</h3>
          <div className="flex items-center gap-4 mb-4">
            <span className="flex items-center gap-1.5 text-xs text-[#5C4A3A] dark:text-[#C9BBA4]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C98A3D]" /> Orders
            </span>
            <span className="flex items-center gap-1.5 text-xs text-[#5C4A3A] dark:text-[#C9BBA4]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#5C86A8]" /> Revenue (k)
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDE6DA" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#A99A82' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#A99A82' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #EDE6DA', fontSize: 12 }} />
              <Bar dataKey="orders" fill="#C98A3D" radius={[4, 4, 0, 0]} barSize={12} />
              <Bar dataKey="revenue" fill="#5C86A8" radius={[4, 4, 0, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-[#2A1F16] rounded-2xl p-5 shadow-sm border border-[#EDE6DA] dark:border-white/10">
          <h3 className="text-base font-semibold text-[#2E2118] dark:text-[#F0EAE0] mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-[#A99A82] text-center py-6">No orders yet.</p>
            ) : (
              recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between py-2 border-b border-[#F0EAE0] dark:border-white/10 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-[#2E2118] dark:text-[#F0EAE0]">{o.FullName || 'Customer'}</p>
                    <p className="text-xs text-[#A99A82]">{o.items?.length || 0} item(s) · Rs. {o.totalPrice?.toLocaleString() || 0}</p>
                  </div>
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${STATUS_COLORS[o.orderStatus] || '#B8AA97'}20`,
                      color: STATUS_COLORS[o.orderStatus] || '#5C4A3A',
                    }}
                  >
                    {o.orderStatus || 'Pending'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="bg-white dark:bg-[#2A1F16] rounded-2xl p-5 shadow-sm border border-[#EDE6DA] dark:border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-[#2E2118] dark:text-[#F0EAE0]">Top Selling Products</h3>
          <Star size={16} className="text-[#C98A3D]" />
        </div>
        {topProducts.length === 0 ? (
          <p className="text-sm text-[#A99A82] py-6 text-center">No product sales data yet.</p>
        ) : (
          <div className="space-y-4">
            {topProducts.map((p, idx) => (
              <div key={p.id} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#F6F2EC] dark:bg-white/5 flex-shrink-0">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-[#A99A82]">{idx + 1}</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#2E2118] dark:text-[#F0EAE0] truncate">{p.title || p.author}</p>
                  <p className="text-xs text-[#A99A82]">{p.genere || 'Product'} · Rs. {p.price?.toLocaleString() || 0}</p>
                </div>
                <div className="w-32 flex-shrink-0">
                  <div className="w-full h-2 bg-[#F0EAE0] dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#C98A3D] to-[#A8672A]"
                      style={{ width: `${((p.salesCount || 0) / maxSales) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-semibold text-[#2E2118] dark:text-[#F0EAE0] w-16 text-right flex-shrink-0">
                  {p.salesCount || 0} sold
                </span>
              </div>
            ))}
          </div>
        )}
        {!hasInventoryData && (
          <p className="text-xs text-[#A99A82] mt-4 pt-4 border-t border-[#F0EAE0] dark:border-white/10">
            Inventory (stock levels) isn't tracked in the products data yet — add a stock field to see low/out-of-stock alerts here.
          </p>
        )}
      </div>

      {/* Category Breakdown + Customer Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-[#2A1F16] rounded-2xl p-5 shadow-sm border border-[#EDE6DA] dark:border-white/10">
          <h3 className="text-base font-semibold text-[#2E2118] dark:text-[#F0EAE0] mb-4">Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={70} paddingAngle={3}>
                {categoryData.map((entry, idx) => (
                  <Cell key={idx} fill={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-3 max-h-24 overflow-y-auto">
            {categoryData.map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }} />
                  <span className="text-[#5C4A3A] dark:text-[#C9BBA4]">{entry.name}</span>
                </div>
                <span className="text-[#A99A82]">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-[#2A1F16] rounded-2xl p-5 shadow-sm border border-[#EDE6DA] dark:border-white/10">
          <h3 className="text-sm font-medium text-[#5C4A3A] dark:text-[#C9BBA4] mb-4">Customer Insights</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-xl bg-[#F6F2EC] dark:bg-white/5">
              <Users size={16} className="text-[#C98A3D] mx-auto mb-1.5" />
              <p className="text-lg font-semibold text-[#2E2118] dark:text-[#F0EAE0]">{customerUsers.length}</p>
              <p className="text-xs text-[#A99A82] mt-0.5">Total</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-[#F6F2EC] dark:bg-white/5">
              <UserPlus size={16} className="text-[#7A9B76] mx-auto mb-1.5" />
              <p className="text-lg font-semibold text-[#2E2118] dark:text-[#F0EAE0]">{newCustomersThisMonth}</p>
              <p className="text-xs text-[#A99A82] mt-0.5">New</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-[#F6F2EC] dark:bg-white/5">
              <Repeat size={16} className="text-[#5C86A8] mx-auto mb-1.5" />
              <p className="text-lg font-semibold text-[#2E2118] dark:text-[#F0EAE0]">{returningCustomers}</p>
              <p className="text-xs text-[#A99A82] mt-0.5">Returning</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback + Team Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-[#2A1F16] rounded-2xl p-5 shadow-sm border border-[#EDE6DA] dark:border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-[#5C4A3A] dark:text-[#C9BBA4]">Feedback & Ratings</h3>
            <p className="text-xs text-[#A99A82] mt-1">{feedbacks.length} reviews from customers</p>
          </div>
          <div className="flex items-center gap-1.5 text-[#C98A3D]">
            <Star size={18} fill="#C98A3D" />
            <span className="text-xl font-semibold text-[#2E2118] dark:text-[#F0EAE0]">{avgRating}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#2A1F16] rounded-2xl p-5 shadow-sm border border-[#EDE6DA] dark:border-white/10">
          <h3 className="text-sm font-medium text-[#5C4A3A] dark:text-[#C9BBA4] mb-3">Team Breakdown</h3>
          <div className="space-y-2.5">
            {roleData.map((entry, idx) => {
              const percent = users.length ? Math.round((entry.value / users.length) * 100) : 0;
              return (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-xs text-[#5C4A3A] dark:text-[#C9BBA4] capitalize w-16 flex-shrink-0">{entry.name}s</span>
                  <div className="flex-1 h-1.5 bg-[#F0EAE0] dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${percent}%`, backgroundColor: ROLE_COLORS[entry.name] || '#B8AA97' }}
                    />
                  </div>
                  <span className="text-xs text-[#A99A82] w-8 text-right flex-shrink-0">{entry.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <AiReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        data={{ users, orders, products, feedbacks }}
      />
    </div>
  );
};

export default Dashboard;