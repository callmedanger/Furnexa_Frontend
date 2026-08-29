const StatCard = ({ title, value, icon: Icon, gradient, sub }) => {
  return (
    <div className={`rounded-2xl p-5 text-white shadow-sm ${gradient}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-white/80">{title}</p>
          <h3 className="text-2xl font-semibold mt-2">{value}</h3>
        </div>
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <Icon size={18} />
        </div>
      </div>
      {sub && <p className="text-xs text-white/75 mt-4">{sub}</p>}
    </div>
  );
};

export default StatCard;