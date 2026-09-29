import React from 'react';

interface GuardianProps {
  type: 'cartographer' | 'astrolabe' | 'chronicler' | 'archivist';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const GuardianRobot: React.FC<GuardianProps> = ({ type, size = 'md', className = '' }) => {
  const dimensions = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
  }[size];

  if (type === 'cartographer') {
    // Robot carrying scrolls & maps
    return (
      <div className={`relative inline-flex items-center justify-center ${dimensions} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          {/* Antenna / Sensor */}
          <line x1="50" y1="20" x2="50" y2="10" stroke="#C89B52" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="50" cy="8" r="3.5" fill="#D9C28F" className="animate-pulse" />

          {/* Brass Robot Head */}
          <rect x="36" y="20" width="28" height="22" rx="5" fill="#6E5A3B" stroke="#C89B52" strokeWidth="2" />
          {/* Glowing Optical Lens Eyes */}
          <circle cx="44" cy="30" r="3.5" fill="#D9C28F" />
          <circle cx="44" cy="30" r="1.5" fill="#243B36" />
          <circle cx="56" cy="30" r="3.5" fill="#D9C28F" />
          <circle cx="56" cy="30" r="1.5" fill="#243B36" />
          {/* Mechanical Mouth Grille */}
          <line x1="43" y1="37" x2="57" y2="37" stroke="#3A2E1E" strokeWidth="2" strokeLinecap="round" />

          {/* Brass Gear Neck */}
          <rect x="46" y="42" width="8" height="4" fill="#8C6B40" />

          {/* Wooden & Bronze Torso */}
          <rect x="32" y="46" width="36" height="32" rx="6" fill="#243B36" stroke="#C89B52" strokeWidth="2" />
          <circle cx="50" cy="60" r="7" fill="#18221F" stroke="#6E5A3B" strokeWidth="1.5" />
          {/* Mini chest cog */}
          <path
            d="M 50 55 L 50 65 M 45 60 L 55 60 M 46.5 56.5 L 53.5 63.5 M 46.5 63.5 L 53.5 56.5"
            stroke="#D9C28F"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Left Arm carrying blueprint scroll */}
          <path d="M 32 52 L 20 62 L 24 72" fill="none" stroke="#6E5A3B" strokeWidth="3" strokeLinecap="round" />
          {/* Rolled parchment scroll */}
          <rect x="14" y="66" width="18" height="8" rx="2" fill="#EEE7D4" stroke="#C89B52" strokeWidth="1.5" transform="rotate(-15 23 70)" />

          {/* Right Arm */}
          <path d="M 68 52 L 78 62 L 74 72" fill="none" stroke="#6E5A3B" strokeWidth="3" strokeLinecap="round" />

          {/* Brass Joint Rivets */}
          <circle cx="36" cy="50" r="2" fill="#D9C28F" />
          <circle cx="64" cy="50" r="2" fill="#D9C28F" />
          <circle cx="36" cy="74" r="2" fill="#D9C28F" />
          <circle cx="64" cy="74" r="2" fill="#D9C28F" />

          {/* Legs & Brass treads */}
          <rect x="38" y="78" width="8" height="10" rx="2" fill="#6E5A3B" />
          <rect x="54" y="78" width="8" height="10" rx="2" fill="#6E5A3B" />
          <rect x="34" y="88" width="16" height="5" rx="2.5" fill="#3A2E1E" stroke="#C89B52" strokeWidth="1" />
          <rect x="50" y="88" width="16" height="5" rx="2.5" fill="#3A2E1E" stroke="#C89B52" strokeWidth="1" />
        </svg>
      </div>
    );
  }

  if (type === 'astrolabe') {
    // Robot holding glowing crystal / astrolabe
    return (
      <div className={`relative inline-flex items-center justify-center ${dimensions} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          {/* Dual Brass Antennas */}
          <line x1="42" y1="20" x2="36" y2="10" stroke="#C89B52" strokeWidth="2" strokeLinecap="round" />
          <circle cx="35" cy="9" r="2.5" fill="#D9C28F" />
          <line x1="58" y1="20" x2="64" y2="10" stroke="#C89B52" strokeWidth="2" strokeLinecap="round" />
          <circle cx="65" cy="9" r="2.5" fill="#D9C28F" />

          {/* Head */}
          <rect x="34" y="20" width="32" height="22" rx="6" fill="#557A72" stroke="#C89B52" strokeWidth="2" />
          {/* Monocle Lens with Gold Dial */}
          <circle cx="45" cy="31" r="5.5" fill="#18221F" stroke="#C89B52" strokeWidth="2" />
          <circle cx="45" cy="31" r="2.5" fill="#D9C28F" className="animate-pulse" />
          <circle cx="59" cy="31" r="3" fill="#D9C28F" />

          {/* Neck Joint */}
          <circle cx="50" cy="44" r="3" fill="#6E5A3B" />

          {/* Body Chassis */}
          <rect x="30" y="46" width="40" height="32" rx="7" fill="#243B36" stroke="#C89B52" strokeWidth="2" />

          {/* Astrolabe / Glowing Dependency Ring held in hands */}
          <circle cx="50" cy="62" r="11" fill="none" stroke="#D9C28F" strokeWidth="1.5" strokeDasharray="3 2" />
          <polygon points="50,54 57,66 43,66" fill="#C89B52" opacity="0.85" />
          <circle cx="50" cy="62" r="3" fill="#FFF9E6" className="animate-ping" />

          {/* Mechanical Hands clutching the ring */}
          <path d="M 28 54 L 38 62" stroke="#6E5A3B" strokeWidth="3" strokeLinecap="round" />
          <path d="M 72 54 L 62 62" stroke="#6E5A3B" strokeWidth="3" strokeLinecap="round" />

          {/* Treads */}
          <rect x="34" y="78" width="32" height="12" rx="4" fill="#3A2E1E" stroke="#C89B52" strokeWidth="1.5" />
          <circle cx="40" cy="84" r="3" fill="#6E5A3B" />
          <circle cx="50" cy="84" r="3" fill="#6E5A3B" />
          <circle cx="60" cy="84" r="3" fill="#6E5A3B" />
        </svg>
      </div>
    );
  }

  if (type === 'chronicler') {
    // Robot writing into antique ledger
    return (
      <div className={`relative inline-flex items-center justify-center ${dimensions} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          {/* Eyepiece / Spectacle Arm */}
          <rect x="36" y="20" width="28" height="22" rx="5" fill="#6E5A3B" stroke="#C89B52" strokeWidth="2" />
          <circle cx="44" cy="30" r="4" fill="#D9C28F" />
          <circle cx="56" cy="30" r="4" fill="#D9C28F" />
          {/* Glasses bridge */}
          <line x1="48" y1="30" x2="52" y2="30" stroke="#C89B52" strokeWidth="2" />

          {/* Torso */}
          <rect x="32" y="45" width="36" height="34" rx="6" fill="#1E2B27" stroke="#8C6B40" strokeWidth="2" />
          <line x1="50" y1="45" x2="50" y2="79" stroke="#C89B52" strokeWidth="1.5" strokeDasharray="4 2" />

          {/* Left Arm holding open book ledger */}
          <rect x="22" y="60" width="18" height="14" rx="2" fill="#EEE7D4" stroke="#6E5A3B" strokeWidth="1.5" transform="rotate(-10 31 67)" />
          <line x1="25" y1="64" x2="35" y2="62" stroke="#24302C" strokeWidth="1" />
          <line x1="25" y1="68" x2="35" y2="66" stroke="#24302C" strokeWidth="1" />

          {/* Right Arm with Quill Stylus */}
          <path d="M 68 52 L 58 64" stroke="#6E5A3B" strokeWidth="3" strokeLinecap="round" />
          <path d="M 58 64 L 52 70" stroke="#D9C28F" strokeWidth="2" strokeLinecap="round" />
          {/* Feather quill plume */}
          <path d="M 60 62 Q 72 50 78 40 Q 70 54 58 64" fill="#557A72" />

          {/* Base */}
          <rect x="36" y="79" width="28" height="12" rx="3" fill="#3A2E1E" stroke="#C89B52" strokeWidth="1.5" />
        </svg>
      </div>
    );
  }

  // Archivist / Machine Operator
  return (
    <div className={`relative inline-flex items-center justify-center ${dimensions} ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        {/* Crown gear trim on head */}
        <path d="M 38 20 L 42 14 L 46 20 L 50 14 L 54 20 L 58 14 L 62 20 Z" fill="#C89B52" />
        <rect x="36" y="20" width="28" height="22" rx="4" fill="#243B36" stroke="#C89B52" strokeWidth="2" />
        {/* Glowing visor */}
        <rect x="41" y="28" width="18" height="6" rx="3" fill="#D9C28F" className="animate-pulse" />

        {/* Grand Chest Archive Gauge */}
        <rect x="30" y="44" width="40" height="34" rx="7" fill="#18221F" stroke="#C89B52" strokeWidth="2" />
        <circle cx="50" cy="58" r="8" fill="#243B36" stroke="#D9C28F" strokeWidth="1.5" />
        <line x1="50" y1="58" x2="55" y2="54" stroke="#D9C28F" strokeWidth="2" strokeLinecap="round" />

        {/* Levers & Dials */}
        <line x1="36" y1="50" x2="36" y2="66" stroke="#6E5A3B" strokeWidth="2" />
        <circle cx="36" cy="54" r="2.5" fill="#C89B52" />
        <line x1="64" y1="50" x2="64" y2="66" stroke="#6E5A3B" strokeWidth="2" />
        <circle cx="64" cy="62" r="2.5" fill="#C89B52" />

        {/* Base Pedestal */}
        <rect x="32" y="78" width="36" height="13" rx="4" fill="#6E5A3B" stroke="#C89B52" strokeWidth="1.5" />
        <circle cx="50" cy="85" r="3" fill="#D9C28F" />
      </svg>
    </div>
  );
};
