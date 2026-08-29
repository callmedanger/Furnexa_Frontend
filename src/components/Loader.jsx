const Loader = ({ full = false, label = 'Loading dashboard' }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3.5 ${
        full ? 'h-screen' : 'h-full py-16'
      }`}
      style={{ backgroundColor: full ? '#FBF8F3' : 'transparent' }}
    >
      <svg width="90" height="90" viewBox="0 0 100 100" role="img" aria-label="Loading">
        <title>Loading</title>
        <circle cx="50" cy="50" r="46" fill="none" stroke="#E8DFD3" strokeWidth="1.5" />

        <rect x="30" y="60" width="9" height="16" rx="1.5" fill="#C98A3D">
          <animate
            attributeName="height"
            values="16;36;16"
            keyTimes="0;0.5;1"
            dur="1.2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="y"
            values="60;40;60"
            keyTimes="0;0.5;1"
            dur="1.2s"
            repeatCount="indefinite"
          />
        </rect>

        <rect x="45.5" y="50" width="9" height="26" rx="1.5" fill="#C98A3D">
          <animate
            attributeName="height"
            values="26;46;26"
            keyTimes="0;0.5;1"
            dur="1.2s"
            begin="0.15s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="y"
            values="50;30;50"
            keyTimes="0;0.5;1"
            dur="1.2s"
            begin="0.15s"
            repeatCount="indefinite"
          />
        </rect>

        <rect x="61" y="44" width="9" height="32" rx="1.5" fill="#C98A3D">
          <animate
            attributeName="height"
            values="32;52;32"
            keyTimes="0;0.5;1"
            dur="1.2s"
            begin="0.3s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="y"
            values="44;24;44"
            keyTimes="0;0.5;1"
            dur="1.2s"
            begin="0.3s"
            repeatCount="indefinite"
          />
        </rect>
      </svg>

      {label && (
        <p
          className="text-[13px] font-medium uppercase text-[#8A6A3D]"
          style={{ letterSpacing: '0.08em' }}
        >
          {label}
        </p>
      )}
    </div>
  );
};

export default Loader;