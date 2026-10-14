// Set of cute cartoon animal avatars encoded as SVG Data URIs

const toDataUrl = (svg) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

export const ANIMAL_AVATARS = [
  {
    id: 'cat',
    name: 'Playful Cat',
    category: 'Feline',
    dataUrl: toDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="58" fill="#FCE7F3" stroke="#F472B6" stroke-width="3"/>
        <!-- Ears -->
        <polygon points="30,42 16,12 48,26" fill="#FDBA74" stroke="#EA580C" stroke-width="2"/>
        <polygon points="28,38 20,18 42,27" fill="#FDA4AF"/>
        <polygon points="90,42 104,12 72,26" fill="#FDBA74" stroke="#EA580C" stroke-width="2"/>
        <polygon points="92,38 100,18 78,27" fill="#FDA4AF"/>
        <!-- Head -->
        <ellipse cx="60" cy="65" rx="38" ry="32" fill="#FED7AA"/>
        <!-- Cheeks -->
        <ellipse cx="40" cy="74" rx="6" ry="3.5" fill="#FDA4AF" opacity="0.6"/>
        <ellipse cx="80" cy="74" rx="6" ry="3.5" fill="#FDA4AF" opacity="0.6"/>
        <!-- Eyes -->
        <ellipse cx="45" cy="58" rx="4.5" ry="6" fill="#1E293B"/>
        <ellipse cx="75" cy="58" rx="4.5" ry="6" fill="#1E293B"/>
        <circle cx="43.5" cy="55.5" r="2" fill="#FFFFFF"/>
        <circle cx="73.5" cy="55.5" r="2" fill="#FFFFFF"/>
        <!-- Nose & Mouth -->
        <polygon points="60,67 56,63 64,63" fill="#F43F5E"/>
        <path d="M 56 68 Q 60 73 60 70 Q 60 73 64 68" stroke="#78350F" stroke-width="2" fill="none" stroke-linecap="round"/>
        <!-- Whiskers -->
        <line x1="24" y1="67" x2="10" y2="65" stroke="#9A3412" stroke-width="1.8" stroke-linecap="round"/>
        <line x1="24" y1="72" x2="12" y2="74" stroke="#9A3412" stroke-width="1.8" stroke-linecap="round"/>
        <line x1="96" y1="67" x2="110" y2="65" stroke="#9A3412" stroke-width="1.8" stroke-linecap="round"/>
        <line x1="96" y1="72" x2="108" y2="74" stroke="#9A3412" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    `)
  },
  {
    id: 'dog',
    name: 'Happy Puppy',
    category: 'Canine',
    dataUrl: toDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="58" fill="#FEF08A" stroke="#EAB308" stroke-width="3"/>
        <!-- Floppy Ears -->
        <ellipse cx="24" cy="54" rx="12" ry="24" fill="#92400E" transform="rotate(-15 24 54)"/>
        <ellipse cx="96" cy="54" rx="12" ry="24" fill="#92400E" transform="rotate(15 96 54)"/>
        <!-- Head -->
        <ellipse cx="60" cy="62" rx="38" ry="34" fill="#FDE047"/>
        <!-- White patch -->
        <ellipse cx="60" cy="68" rx="20" ry="18" fill="#FEF9C3"/>
        <!-- Eyes -->
        <circle cx="44" cy="54" r="5" fill="#1E293B"/>
        <circle cx="76" cy="54" r="5" fill="#1E293B"/>
        <circle cx="42.5" cy="52" r="1.8" fill="#FFFFFF"/>
        <circle cx="74.5" cy="52" r="1.8" fill="#FFFFFF"/>
        <!-- Nose -->
        <ellipse cx="60" cy="66" rx="6" ry="4.5" fill="#0F172A"/>
        <!-- Mouth & Tongue -->
        <path d="M 54 72 Q 60 76 66 72" stroke="#451A03" stroke-width="2" fill="none" stroke-linecap="round"/>
        <path d="M 57 74 C 57 82 63 82 63 74 Z" fill="#F43F5E"/>
        <!-- Cheeks -->
        <circle cx="36" cy="66" r="4.5" fill="#FBBF24" opacity="0.6"/>
        <circle cx="84" cy="66" r="4.5" fill="#FBBF24" opacity="0.6"/>
      </svg>
    `)
  },
  {
    id: 'panda',
    name: 'Chubby Panda',
    category: 'Bear',
    dataUrl: toDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="58" fill="#DCFCE7" stroke="#4ADE80" stroke-width="3"/>
        <!-- Ears -->
        <circle cx="28" cy="28" r="14" fill="#1E293B"/>
        <circle cx="92" cy="28" r="14" fill="#1E293B"/>
        <circle cx="28" cy="28" r="8" fill="#334155"/>
        <circle cx="92" cy="28" r="8" fill="#334155"/>
        <!-- Head -->
        <ellipse cx="60" cy="65" rx="38" ry="34" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
        <!-- Eye Patches -->
        <ellipse cx="43" cy="58" rx="10" ry="13" fill="#1E293B" transform="rotate(-15 43 58)"/>
        <ellipse cx="77" cy="58" rx="10" ry="13" fill="#1E293B" transform="rotate(15 77 58)"/>
        <!-- Eyes -->
        <circle cx="44" cy="57" r="4" fill="#FFFFFF"/>
        <circle cx="76" cy="57" r="4" fill="#FFFFFF"/>
        <circle cx="44" cy="57" r="2.5" fill="#0F172A"/>
        <circle cx="76" cy="57" r="2.5" fill="#0F172A"/>
        <circle cx="43" cy="56" r="1" fill="#FFFFFF"/>
        <circle cx="75" cy="56" r="1" fill="#FFFFFF"/>
        <!-- Nose & Smile -->
        <ellipse cx="60" cy="72" rx="5" ry="3.5" fill="#0F172A"/>
        <path d="M 54 77 Q 60 82 66 77" stroke="#334155" stroke-width="2" fill="none" stroke-linecap="round"/>
        <!-- Cheeks -->
        <circle cx="34" cy="74" r="5" fill="#FDA4AF" opacity="0.6"/>
        <circle cx="86" cy="74" r="5" fill="#FDA4AF" opacity="0.6"/>
      </svg>
    `)
  },
  {
    id: 'bear',
    name: 'Cozy Bear',
    category: 'Bear',
    dataUrl: toDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="58" fill="#FFEDD5" stroke="#FB923C" stroke-width="3"/>
        <!-- Ears -->
        <circle cx="28" cy="30" r="13" fill="#9A3412"/>
        <circle cx="92" cy="30" r="13" fill="#9A3412"/>
        <circle cx="28" cy="30" r="7" fill="#FDBA74"/>
        <circle cx="92" cy="30" r="7" fill="#FDBA74"/>
        <!-- Head -->
        <ellipse cx="60" cy="64" rx="38" ry="34" fill="#C2410C"/>
        <!-- Snout -->
        <ellipse cx="60" cy="72" rx="18" ry="14" fill="#FED7AA"/>
        <!-- Eyes -->
        <circle cx="44" cy="54" r="4.5" fill="#1E293B"/>
        <circle cx="76" cy="54" r="4.5" fill="#1E293B"/>
        <circle cx="43" cy="52.5" r="1.5" fill="#FFFFFF"/>
        <circle cx="75" cy="52.5" r="1.5" fill="#FFFFFF"/>
        <!-- Nose -->
        <ellipse cx="60" cy="68" rx="6" ry="4" fill="#431407"/>
        <path d="M 55 75 Q 60 79 65 75" stroke="#7C2D12" stroke-width="2" fill="none" stroke-linecap="round"/>
        <!-- Cheeks -->
        <circle cx="36" cy="68" r="4" fill="#FB923C" opacity="0.5"/>
        <circle cx="84" cy="68" r="4" fill="#FB923C" opacity="0.5"/>
      </svg>
    `)
  },
  {
    id: 'rabbit',
    name: 'Sweet Bunny',
    category: 'Lagomorph',
    dataUrl: toDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="58" fill="#F3E8FF" stroke="#C084FC" stroke-width="3"/>
        <!-- Tall Ears -->
        <ellipse cx="44" cy="24" rx="9" ry="24" fill="#FFFFFF" stroke="#E9D5FF" stroke-width="2" transform="rotate(-6 44 24)"/>
        <ellipse cx="44" cy="24" rx="5" ry="18" fill="#F472B6" transform="rotate(-6 44 24)"/>
        <ellipse cx="76" cy="24" rx="9" ry="24" fill="#FFFFFF" stroke="#E9D5FF" stroke-width="2" transform="rotate(6 76 24)"/>
        <ellipse cx="76" cy="24" rx="5" ry="18" fill="#F472B6" transform="rotate(6 76 24)"/>
        <!-- Head -->
        <ellipse cx="60" cy="70" rx="36" ry="30" fill="#FFFFFF" stroke="#E9D5FF" stroke-width="2"/>
        <!-- Cheeks -->
        <ellipse cx="36" cy="76" rx="6" ry="4" fill="#F472B6" opacity="0.6"/>
        <ellipse cx="84" cy="76" rx="6" ry="4" fill="#F472B6" opacity="0.6"/>
        <!-- Eyes -->
        <ellipse cx="46" cy="64" rx="4" ry="5.5" fill="#581C87"/>
        <ellipse cx="74" cy="64" rx="4" ry="5.5" fill="#581C87"/>
        <circle cx="44.5" cy="62" r="1.8" fill="#FFFFFF"/>
        <circle cx="72.5" cy="62" r="1.8" fill="#FFFFFF"/>
        <!-- Nose & Mouth -->
        <polygon points="60,73 57,70 63,70" fill="#EC4899"/>
        <path d="M 56 75 Q 60 79 60 76 Q 60 79 64 75" stroke="#7E22CE" stroke-width="1.8" fill="none" stroke-linecap="round"/>
        <!-- Whiskers -->
        <line x1="28" y1="73" x2="16" y2="72" stroke="#A855F7" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="28" y1="77" x2="18" y2="79" stroke="#A855F7" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="92" y1="73" x2="104" y2="72" stroke="#A855F7" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="92" y1="77" x2="102" y2="79" stroke="#A855F7" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    `)
  },
  {
    id: 'fox',
    name: 'Clever Fox',
    category: 'Canine',
    dataUrl: toDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="58" fill="#E0F2FE" stroke="#38BDF8" stroke-width="3"/>
        <!-- Ears -->
        <polygon points="24,42 12,12 46,24" fill="#EA580C"/>
        <polygon points="26,38 18,18 42,26" fill="#1E293B"/>
        <polygon points="96,42 108,12 74,24" fill="#EA580C"/>
        <polygon points="94,38 102,18 78,26" fill="#1E293B"/>
        <!-- Head -->
        <polygon points="60,88 20,48 100,48" fill="#F97316"/>
        <!-- White cheeks -->
        <polygon points="60,88 20,48 44,68" fill="#FFFFFF"/>
        <polygon points="60,88 100,48 76,68" fill="#FFFFFF"/>
        <!-- Eyes -->
        <ellipse cx="44" cy="54" rx="4" ry="5.5" fill="#1E293B" transform="rotate(10 44 54)"/>
        <ellipse cx="76" cy="54" rx="4" ry="5.5" fill="#1E293B" transform="rotate(-10 76 54)"/>
        <circle cx="43" cy="52" r="1.5" fill="#FFFFFF"/>
        <circle cx="75" cy="52" r="1.5" fill="#FFFFFF"/>
        <!-- Nose -->
        <ellipse cx="60" cy="85" rx="5" ry="4" fill="#0F172A"/>
      </svg>
    `)
  },
  {
    id: 'koala',
    name: 'Sleepy Koala',
    category: 'Marsupial',
    dataUrl: toDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="58" fill="#CCFBF1" stroke="#2DD4BF" stroke-width="3"/>
        <!-- Big Round Ears -->
        <circle cx="22" cy="40" r="16" fill="#94A3B8"/>
        <circle cx="22" cy="40" r="10" fill="#E2E8F0"/>
        <circle cx="98" cy="40" r="16" fill="#94A3B8"/>
        <circle cx="98" cy="40" r="10" fill="#E2E8F0"/>
        <!-- Head -->
        <ellipse cx="60" cy="65" rx="38" ry="32" fill="#CBD5E1"/>
        <!-- Big Oval Nose -->
        <ellipse cx="60" cy="65" rx="10" ry="15" fill="#334155"/>
        <ellipse cx="58" cy="61" rx="3" ry="5" fill="#475569"/>
        <!-- Eyes -->
        <circle cx="40" cy="56" r="4.5" fill="#0F172A"/>
        <circle cx="80" cy="56" r="4.5" fill="#0F172A"/>
        <circle cx="39" cy="54.5" r="1.5" fill="#FFFFFF"/>
        <circle cx="79" cy="54.5" r="1.5" fill="#FFFFFF"/>
        <!-- Cheeks -->
        <circle cx="32" cy="68" r="4.5" fill="#FDA4AF" opacity="0.6"/>
        <circle cx="88" cy="68" r="4.5" fill="#FDA4AF" opacity="0.6"/>
        <path d="M 54 83 Q 60 86 66 83" stroke="#64748B" stroke-width="2" fill="none" stroke-linecap="round"/>
      </svg>
    `)
  },
  {
    id: 'penguin',
    name: 'Waddle Penguin',
    category: 'Bird',
    dataUrl: toDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="58" fill="#E0E7FF" stroke="#818CF8" stroke-width="3"/>
        <!-- Head Hood -->
        <ellipse cx="60" cy="64" rx="38" ry="35" fill="#1E293B"/>
        <!-- White Face -->
        <ellipse cx="48" cy="64" rx="15" ry="18" fill="#FFFFFF"/>
        <ellipse cx="72" cy="64" rx="15" ry="18" fill="#FFFFFF"/>
        <!-- Eyes -->
        <circle cx="47" cy="59" r="4.5" fill="#0F172A"/>
        <circle cx="73" cy="59" r="4.5" fill="#0F172A"/>
        <circle cx="46" cy="57.5" r="1.5" fill="#FFFFFF"/>
        <circle cx="72" cy="57.5" r="1.5" fill="#FFFFFF"/>
        <!-- Beak -->
        <polygon points="60,76 52,66 68,66" fill="#F59E0B"/>
        <!-- Cheeks -->
        <circle cx="37" cy="68" r="4.5" fill="#FDA4AF" opacity="0.7"/>
        <circle cx="83" cy="68" r="4.5" fill="#FDA4AF" opacity="0.7"/>
      </svg>
    `)
  },
  {
    id: 'lion',
    name: 'Brave Cub',
    category: 'Feline',
    dataUrl: toDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="58" fill="#FEF3C7" stroke="#FBBF24" stroke-width="3"/>
        <!-- Fluffy Mane -->
        <circle cx="60" cy="62" r="44" fill="#D97706"/>
        <!-- Ears -->
        <circle cx="32" cy="30" r="11" fill="#F59E0B"/>
        <circle cx="88" cy="30" r="11" fill="#F59E0B"/>
        <circle cx="32" cy="30" r="6" fill="#FEF3C7"/>
        <circle cx="88" cy="30" r="6" fill="#FEF3C7"/>
        <!-- Head -->
        <circle cx="60" cy="64" r="32" fill="#FDE68A"/>
        <!-- Snout -->
        <ellipse cx="60" cy="72" rx="14" ry="10" fill="#FEF9C3"/>
        <!-- Eyes -->
        <circle cx="46" cy="57" r="4.5" fill="#1E293B"/>
        <circle cx="74" cy="57" r="4.5" fill="#1E293B"/>
        <circle cx="45" cy="55.5" r="1.5" fill="#FFFFFF"/>
        <circle cx="73" cy="55.5" r="1.5" fill="#FFFFFF"/>
        <!-- Nose & Smile -->
        <polygon points="60,70 56,66 64,66" fill="#B45309"/>
        <path d="M 55 74 Q 60 78 65 74" stroke="#78350F" stroke-width="1.8" fill="none" stroke-linecap="round"/>
        <!-- Cheeks -->
        <circle cx="38" cy="68" r="4" fill="#F59E0B" opacity="0.5"/>
        <circle cx="82" cy="68" r="4" fill="#F59E0B" opacity="0.5"/>
      </svg>
    `)
  },
  {
    id: 'hamster',
    name: 'Tiny Hamster',
    category: 'Rodent',
    dataUrl: toDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="58" fill="#FFE4E6" stroke="#FB7185" stroke-width="3"/>
        <!-- Tiny Ears -->
        <circle cx="32" cy="32" r="11" fill="#FB923C"/>
        <circle cx="32" cy="32" r="6" fill="#FDA4AF"/>
        <circle cx="88" cy="32" r="11" fill="#FB923C"/>
        <circle cx="88" cy="32" r="6" fill="#FDA4AF"/>
        <!-- Head -->
        <ellipse cx="60" cy="66" rx="38" ry="32" fill="#FED7AA"/>
        <!-- Chubby Cheeks -->
        <ellipse cx="36" cy="74" rx="10" ry="8" fill="#FFEDD5"/>
        <ellipse cx="84" cy="74" rx="10" ry="8" fill="#FFEDD5"/>
        <circle cx="36" cy="74" r="5" fill="#FDA4AF" opacity="0.6"/>
        <circle cx="84" cy="74" r="5" fill="#FDA4AF" opacity="0.6"/>
        <!-- Eyes -->
        <circle cx="46" cy="58" r="4.5" fill="#1E293B"/>
        <circle cx="74" cy="58" r="4.5" fill="#1E293B"/>
        <circle cx="45" cy="56" r="1.5" fill="#FFFFFF"/>
        <circle cx="73" cy="56" r="1.5" fill="#FFFFFF"/>
        <!-- Nose & Mouth -->
        <polygon points="60,67 57,64 63,64" fill="#F43F5E"/>
        <path d="M 57 70 Q 60 73 63 70" stroke="#7C2D12" stroke-width="1.8" fill="none" stroke-linecap="round"/>
        <!-- Tiny Buck Teeth -->
        <rect x="58.5" y="70" width="3" height="3" fill="#FFFFFF" stroke="#7C2D12" stroke-width="0.8"/>
      </svg>
    `)
  }
];

export default ANIMAL_AVATARS;
