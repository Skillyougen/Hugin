import './foxy.css'

/**
 * Foxy — mascotte de Huginn (renard polaire), 11 humeurs animées.
 * SVG inline + @keyframes CSS (foxy.css). Aucune dépendance.
 *
 *   <Foxy mood="listening" size={220} />
 *   <Foxy mood="neutral" size={32} crop="head" />   // avatars, logo
 *
 * Garde-fou produit : Foxy ne pose jamais de diagnostic. `worried` / `alert`
 * signalent et orientent vers le médecin de bord, ils ne qualifient rien.
 */

const INK = '#1e3550'
const RIM = '#7fa9ce'
const MASK = '#fbfdff'

export const MOODS = {
  happy: {
    label: 'Foxy, heureux', eyes: 'arc', mouth: 'grin', browOpacity: 0, blush: 0.9, earL: -10, earR: 10, headY: -2,
    root: 'fx-hop .95s cubic-bezier(.34,1.3,.64,1) infinite', head: 'fx-bob .95s ease-in-out infinite',
    tail: 'fx-wag .32s ease-in-out infinite alternate', fx: ['sparks'],
  },
  neutral: {
    label: 'Foxy, au repos', eyes: 'open', mouth: 'smile', brow: 'calm', browOpacity: 0.9, blush: 0.35, earL: -3, earR: 3,
    root: 'fx-breathe 3.6s ease-in-out infinite', head: 'fx-bob 3.6s ease-in-out infinite',
    tail: 'fx-wag-lite 2.6s ease-in-out infinite alternate', blink: 'fx-blink 4.4s linear infinite', ear: 'fx-ear-twitch 7s ease-in-out infinite',
  },
  listening: {
    label: 'Foxy, à l’écoute', eyes: 'open', eyeScaleY: 1.05, mouth: 'flat', brow: 'calm', browOpacity: 0.85, blush: 0.3,
    earL: -26, earR: 26, headRot: -6,
    root: 'fx-breathe 3s ease-in-out infinite', head: 'fx-tiltloop 3s ease-in-out infinite alternate',
    tail: 'fx-wag-lite 1.9s ease-in-out infinite alternate', blink: 'fx-blink 3.6s linear infinite', ear: 'fx-ear-twitch 4.5s ease-in-out infinite',
    fx: ['waves'],
  },
  thinking: {
    label: 'Foxy, réfléchit', eyes: 'open', mouth: 'o', oW: 11, oH: 13, pupilX: 6, pupilYOff: -6,
    brow: 'quizzical', browLRot: -13, browRRot: 5, browOpacity: 0.9, blush: 0.25, earL: 9, earR: -5, headRot: 6,
    root: 'fx-breathe 3.8s ease-in-out infinite', head: 'fx-look 3.8s ease-in-out infinite alternate',
    tail: 'fx-tail-drift 3.4s ease-in-out infinite alternate', blink: 'fx-blink 5s linear infinite', fx: ['dots'],
  },
  worried: {
    label: 'Foxy, inquiet', eyes: 'open', eyeScaleY: 1.04, mouth: 'flat', brow: 'sad', browLRot: -14, browRRot: 14, browOpacity: 1,
    blush: 0.2, earL: 16, earR: -16, headRot: -3,
    root: 'fx-fret 3.2s ease-in-out infinite', head: 'fx-shake 3.2s ease-in-out infinite',
    tail: 'fx-wag-nervous .55s ease-in-out infinite alternate', blink: 'fx-blink 2.8s linear infinite', fx: ['sweat'],
  },
  alert: {
    label: 'Foxy, en alerte', eyes: 'open', eyeScaleY: 1.12, mouth: 'o', oW: 18, oH: 21,
    brow: 'sad', browLRot: -10, browRRot: 10, browOpacity: 1, blush: 0, earL: -34, earR: 34,
    root: 'fx-alert .9s cubic-bezier(.36,1.4,.6,1) infinite', head: 'fx-shake .9s ease-in-out infinite',
    tail: 'fx-wag-nervous .3s ease-in-out infinite alternate', fx: ['bang'], glow: '#ef4444',
  },
  sad: {
    label: 'Foxy, compatissant', eyes: 'open', eyeScaleY: 0.74, mouth: 'frown', brow: 'sad', browLRot: -18, browRRot: 18, browOpacity: 1,
    blush: 0.15, earL: 38, earR: -38, headY: 5,
    root: 'fx-slump 4.4s ease-in-out infinite', head: 'fx-nod 4.4s ease-in-out infinite',
    tail: 'fx-tail-drift 5s ease-in-out infinite alternate', blink: 'fx-blink 6s linear infinite', fx: ['tear'],
  },
  sleepy: {
    label: 'Foxy, endormi', eyes: 'closed', mouth: 'flat', brow: 'calm', browOpacity: 0.45, blush: 0.4,
    earL: 22, earR: -22, headRot: 9, headY: 4,
    root: 'fx-sleep 4.8s ease-in-out infinite', head: 'fx-nod 4.8s ease-in-out infinite',
    tail: 'fx-tail-drift 6s ease-in-out infinite alternate', fx: ['zzz'],
  },
  surprised: {
    label: 'Foxy, surpris', eyes: 'open', eyeScaleY: 1.26, mouth: 'o', oW: 16, oH: 19,
    brow: 'high', browLRot: -8, browRRot: 8, browOpacity: 1, blush: 0.3, earL: -38, earR: 38, headRot: -2, headY: -4,
    root: 'fx-jolt 1.8s cubic-bezier(.3,1.5,.6,1) infinite', tail: 'fx-wag-nervous .4s ease-in-out infinite alternate', fx: ['sparks'],
  },
  proud: {
    label: 'Foxy, fier', eyes: 'arc', mouth: 'grin', browOpacity: 0, blush: 0.85, earL: -16, earR: 16, headY: -4,
    root: 'fx-jump 1.35s cubic-bezier(.34,1.24,.64,1) infinite', head: 'fx-bob 1.35s ease-in-out infinite',
    tail: 'fx-wag .28s ease-in-out infinite alternate', fx: ['sparks', 'paw'], glow: '#f59e0b',
  },
  cheer: {
    label: 'Foxy, encourage', eyes: 'arc', mouth: 'grin', browOpacity: 0, blush: 0.7, earL: -12, earR: 12,
    root: 'fx-sway 2.4s ease-in-out infinite alternate', head: 'fx-bob 2.4s ease-in-out infinite',
    tail: 'fx-wag .5s ease-in-out infinite alternate', fx: ['paw', 'ring'],
  },
}

/** Les sourcils sont quatre ordonnées sur une même courbe. */
const BROWS = {
  calm: [70, 62, 60, 64],
  sad: [76, 66, 62, 64],
  quizzical: [68, 60, 60, 66],
  high: [58, 50, 48, 52],
}

/** Pivot en coordonnées du viewBox (300 × 300). */
const at = (x, y, extra) => ({ transformBox: 'view-box', transformOrigin: `${x}px ${y}px`, ...extra })

const SPARK = (x, y, r) =>
  `M${x},${y - r} C${x + 2},${y - r * 0.35} ${x + r * 0.35},${y - 2} ${x + r},${y} C${x + r * 0.35},${y + 2} ${x + 2},${y + r * 0.35} ${x},${y + r} C${x - 2},${y + r * 0.35} ${x - r * 0.35},${y + 2} ${x - r},${y} C${x - r * 0.35},${y - 2} ${x - 2},${y - r * 0.35} ${x},${y - r} Z`

export default function Foxy({ mood = 'neutral', size = 240, crop = 'full', className = '', decorative = false }) {
  const m = MOODS[mood] ?? MOODS.neutral
  const fx = new Set(m.fx ?? [])
  const b = BROWS[m.brow ?? 'calm']
  const px = m.pupilX ?? 0
  const py = 108 + (m.pupilYOff ?? 0)
  const eyeSY = m.eyeScaleY ?? 1

  return (
    <svg
      viewBox={crop === 'head' ? '62 24 176 176' : '0 0 300 300'}
      width={size}
      height={size}
      className={className}
      style={{ display: 'block', overflow: 'visible' }}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : m.label}
    >
      {m.glow && <circle cx="150" cy="158" r="128" fill={m.glow} style={at(150, 158, { animation: 'fx-glow 1.5s ease-in-out infinite' })} />}
      {fx.has('ring') && (
        <circle cx="150" cy="158" r="140" fill="none" stroke="#10b981" strokeWidth="6" style={at(150, 158, { animation: 'fx-ring 4.6s ease-in-out infinite' })} />
      )}

      <ellipse cx="150" cy="286" rx="82" ry="11" fill={INK} opacity=".12" />

      <g style={at(150, 278, { animation: m.root })}>
        <g stroke={RIM} strokeWidth="6" strokeLinejoin="round" strokeLinecap="round">
          {/* queue */}
          <g style={at(206, 248, { animation: m.tail })}>
            <path d="M212,260 C250,262 268,242 268,210" fill="none" strokeWidth="66" />
            <path d="M212,260 C250,262 268,242 268,210" fill="none" stroke="#b7d4ee" strokeWidth="58" />
            <path d="M265,229 C267,224 268,217 268,210" fill="none" stroke="#ffffff" strokeWidth="48" />
          </g>

          {/* corps, poitrail, pattes */}
          <path d="M150,148 C110,148 84,178 80,216 C76,252 100,274 150,274 C200,274 224,252 220,216 C216,178 190,148 150,148 Z" fill="#cfe3f5" />
          <path d="M150,180 C124,180 108,206 108,234 C108,258 126,272 150,272 C174,272 192,258 192,234 C192,206 176,180 150,180 Z" fill="#ffffff" stroke="none" />
          <path d="M96,264 C96,253 106,247 119,247 C133,247 142,255 141,265 C140,275 128,279 118,279 C107,279 96,275 96,264 Z" fill="#f4faff" />
          <path d="M204,264 C204,253 194,247 181,247 C167,247 158,255 159,265 C160,275 172,279 182,279 C193,279 204,275 204,264 Z" fill="#f4faff" />
          <path d="M112,277 L112,266 M126,277 L126,266 M188,277 L188,266 M174,277 L174,266" fill="none" stroke="#bcd8ef" strokeWidth="4" />

          {/* collier de bord + croix de soin */}
          <path d="M104,180 C120,198 180,198 196,180 C202,186 202,196 196,202 C180,218 120,218 104,202 C98,196 98,186 104,180 Z" fill="#10b981" stroke="#0b8f63" />
          <circle cx="150" cy="212" r="15" fill="#ffffff" stroke="#0b8f63" />
          <path d="M150,204 L150,220 M142,212 L158,212" fill="none" stroke="#10b981" strokeWidth="5" />

          {/* tête */}
          <g style={at(150, 186, { animation: m.head ?? 'none' })}>
            <g style={at(150, 186, { transform: `rotate(${m.headRot ?? 0}deg) translateY(${m.headY ?? 0}px)` })}>
              <g style={at(110, 84, { animation: m.ear ?? 'none' })}>
                <g style={at(110, 84, { transform: `rotate(${m.earL ?? 0}deg)` })}>
                  <path d="M94,94 C80,68 82,42 98,34 C116,25 132,48 144,68 C128,86 112,92 94,94 Z" fill="#c9e0f4" />
                  <path d="M103,84 C94,62 97,45 106,40 C118,35 126,54 136,70 C124,80 112,83 103,84 Z" fill="#f3a79d" stroke="none" />
                </g>
              </g>
              <g style={at(190, 84, { animation: m.ear ?? 'none' })}>
                <g style={at(190, 84, { transform: `rotate(${m.earR ?? 0}deg)` })}>
                  <path d="M206,94 C220,68 218,42 202,34 C184,25 168,48 156,68 C172,86 188,92 206,94 Z" fill="#c9e0f4" />
                  <path d="M197,84 C206,62 203,45 194,40 C182,35 174,54 164,70 C176,80 188,83 197,84 Z" fill="#f3a79d" stroke="none" />
                </g>
              </g>

              <path d="M150,44 C116,44 88,60 78,92 C70,118 68,140 74,152 C80,166 84,172 96,176 C106,180 112,186 124,189 C134,192 142,192 150,192 C158,192 166,192 176,189 C188,186 194,180 204,176 C216,172 220,166 226,152 C232,140 230,118 222,92 C212,60 184,44 150,44 Z" fill="#dfecf9" />
              <path d="M150,82 C119,82 99,95 91,118 C83,143 91,167 110,181 C122,190 136,193 150,193 C164,193 178,190 190,181 C209,167 217,143 209,118 C201,95 181,82 150,82 Z" fill={MASK} stroke="none" />

              <ellipse cx="94" cy="140" rx="15" ry="8" fill="#f3a79d" opacity={m.blush ?? 0.3} stroke="none" />
              <ellipse cx="206" cy="140" rx="15" ry="8" fill="#f3a79d" opacity={m.blush ?? 0.3} stroke="none" />

              {/* sourcils — l'essentiel de l'émotion passe par eux */}
              <g opacity={m.browOpacity ?? 0.9} stroke={INK} strokeWidth="8" fill="none">
                <path d={`M98,${b[0]} C108,${b[1]} 124,${b[2]} 134,${b[3]}`} style={at(116, 70, { transform: `rotate(${m.browLRot ?? 0}deg)` })} />
                <path d={`M202,${b[0]} C192,${b[1]} 176,${b[2]} 166,${b[3]}`} style={at(184, 70, { transform: `rotate(${m.browRRot ?? 0}deg)` })} />
              </g>

              {m.eyes === 'open' &&
                [116, 184].map((cx) => (
                  <g key={cx} style={at(cx, 108, { animation: m.blink ?? 'none' })}>
                    <g style={at(cx, 108, { transform: `scaleY(${eyeSY})` })}>
                      <ellipse cx={cx} cy="108" rx="28" ry="29" fill="#ffffff" />
                      <ellipse cx={cx + px} cy={py} rx="17" ry="18" fill={INK} stroke="none" />
                      <circle cx={cx - 6 + px} cy={py - 6} r="6" fill="#ffffff" stroke="none" />
                    </g>
                  </g>
                ))}
              {m.eyes === 'arc' && <path d="M94,118 C102,100 130,100 138,118 M162,118 C170,100 198,100 206,118" fill="none" stroke={INK} strokeWidth="9" />}
              {m.eyes === 'closed' && <path d="M94,108 C102,126 130,126 138,108 M162,108 C170,126 198,126 206,108" fill="none" stroke={INK} strokeWidth="9" />}

              {/* museau */}
              <path d="M150,140 C142,140 136,144 136,149 C136,156 143,162 150,162 C157,162 164,156 164,149 C164,144 158,140 150,140 Z" fill={INK} stroke="none" />

              {/* gueule — le liseré clair la détache du museau */}
              {m.mouth === 'smile' && <path d="M132,171 C138,181 147,183 150,175 C153,183 162,181 168,171" fill="none" stroke={INK} strokeWidth="7" />}
              {m.mouth === 'grin' && (
                <>
                  <path d="M132,172 C143,168 157,168 168,172 C168,185 160,193 150,193 C140,193 132,185 132,172 Z" fill={INK} stroke={MASK} strokeWidth="6" />
                  <ellipse cx="150" cy="188" rx="11" ry="6" fill="#f7857a" stroke="none" />
                </>
              )}
              {m.mouth === 'frown' && <path d="M133,181 C140,170 160,170 167,181" fill="none" stroke={INK} strokeWidth="7" />}
              {m.mouth === 'o' && <ellipse cx="150" cy="180" rx={m.oW ?? 14} ry={m.oH ?? 17} fill={INK} stroke={MASK} strokeWidth="6" />}
              {m.mouth === 'flat' && <path d="M135,176 C141,172 145,180 151,177 C157,174 160,181 165,178" fill="none" stroke={INK} strokeWidth="6" />}
            </g>
          </g>

          {/* patte levée */}
          {fx.has('paw') && (
            <g style={at(198, 226, { animation: 'fx-paw .62s ease-in-out infinite alternate' })}>
              <path d="M198,226 C222,214 234,196 234,178" fill="none" strokeWidth="44" />
              <path d="M198,226 C222,214 234,196 234,178" fill="none" stroke="#ffffff" strokeWidth="38" />
            </g>
          )}
        </g>

        {/* accessoires d'état */}
        {fx.has('sweat') && (
          <g style={at(250, 74, { animation: 'fx-drip 2.4s ease-in infinite' })}>
            <path d="M250,50 C250,50 236,70 236,80 C236,88 242,94 250,94 C258,94 264,88 264,80 C264,70 250,50 250,50 Z" fill="#5eb8f0" />
            <ellipse cx="245" cy="84" rx="4" ry="5" fill="#ffffff" opacity=".75" />
          </g>
        )}
        {fx.has('tear') && (
          <path
            d="M100,134 C100,134 90,148 90,155 C90,161 94,165 100,165 C106,165 110,161 110,155 C110,148 100,134 100,134 Z"
            fill="#5eb8f0"
            style={at(100, 150, { animation: 'fx-tear 3s ease-in infinite' })}
          />
        )}
        {fx.has('zzz') &&
          [0, 1.2, 2.4].map((d, i) => (
            <text key={d} x="230" y="70" fontSize={34 - i * 6} fontWeight="700" fill="#8ba6bf" style={at(230, 70, { animation: `fx-zzz 3.6s ease-out ${d}s infinite`, opacity: 0 })}>
              Z
            </text>
          ))}
        {fx.has('bang') && (
          <g fill="#ef4444" style={at(258, 54, { animation: 'fx-bang .9s ease-in-out infinite' })}>
            <path d="M258,26 C263,26 267,30 266,35 L263,56 C263,59 260,61 258,61 C256,61 253,59 253,56 L250,35 C249,30 253,26 258,26 Z" />
            <circle cx="258" cy="72" r="6.5" />
          </g>
        )}
        {fx.has('sparks') &&
          [
            [46, 58, 14, '#f59e0b', 0],
            [262, 121, 11, '#10b981', 0.5],
            [150, 25, 11, '#f59e0b', 1],
          ].map(([x, y, r, c, d]) => (
            <path key={x} d={SPARK(x, y, r)} fill={c} style={at(x, y, { animation: `fx-spark 1.5s ease-in-out ${d}s infinite`, opacity: 0 })} />
          ))}
        {fx.has('dots') &&
          [
            [240, 108, 6, '#94b3cc', 0],
            [256, 92, 8, '#7fa4c2', 0.7],
            [272, 72, 10, '#6b97b8', 1.4],
          ].map(([x, y, r, c, d]) => (
            <circle key={x} cx={x} cy={y} r={r} fill={c} style={at(x, y, { animation: `fx-dots 2.1s ease-out ${d}s infinite`, opacity: 0 })} />
          ))}
        {fx.has('waves') && (
          <g fill="none" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round">
            {['M60,96 C50,108 48,124 54,138', 'M44,86 C30,104 28,128 38,148', 'M28,76 C10,100 8,132 22,158'].map((d, i) => (
              <path key={d} d={d} style={at(70, 117, { animation: `fx-wave-out 1.6s ease-out ${i * 0.45}s infinite`, opacity: 0 })} />
            ))}
          </g>
        )}
      </g>
    </svg>
  )
}
