const COLORS = {
  Delivered: 'bg-[#EAF2E9] text-[#4E7A4A]',
  Pending: 'bg-[#FBEEDC] text-[#A8672A]',
  Cancelled: 'bg-[#FBE9E4] text-[#A14E38]',
  Processing: 'bg-[#E7F0F6] text-[#3E6284]',
  paid: 'bg-[#EAF2E9] text-[#4E7A4A]',
  unpaid: 'bg-[#FBE9E4] text-[#A14E38]',
};

const Badge = ({ text }) => (
  <span className={`px-3 py-1 rounded-full text-xs font-medium ${COLORS[text] || 'bg-[#F0EAE0] text-[#5C4A3A]'}`}>
    {text || 'N/A'}
  </span>
);

export default Badge;