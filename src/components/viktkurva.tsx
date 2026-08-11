import type { Rasprofil, Viktlogg } from "@/lib/typer";

/**
 * Viktkurva som ren SVG — valpens loggade vikter mot rasens normalspann.
 */
export default function Viktkurva({
  loggar,
  rasprofil,
  fodelsedatum,
}: {
  loggar: Viktlogg[];
  rasprofil: Rasprofil | null;
  fodelsedatum: string;
}) {
  const fodd = new Date(fodelsedatum + "T00:00:00").getTime();
  const veckaFor = (datum: string) =>
    (new Date(datum + "T00:00:00").getTime() - fodd) / (7 * 24 * 3600 * 1000);

  const punkter = loggar
    .map((l) => ({ vecka: veckaFor(l.datum), kg: Number(l.vikt_kg) }))
    .filter((p) => p.vecka >= 0)
    .sort((a, b) => a.vecka - b.vecka);

  const kurva = rasprofil?.viktkurva_json ?? [];
  const maxVecka = Math.max(
    56,
    ...punkter.map((p) => p.vecka + 4),
    ...(kurva.length ? [kurva[kurva.length - 1].vecka] : [])
  );
  const maxKg =
    Math.max(
      1,
      ...punkter.map((p) => p.kg),
      ...kurva.map((k) => k.max_kg)
    ) * 1.15;

  const B = 400;
  const H = 240;
  const ML = 34;
  const MB = 26;
  const x = (vecka: number) => ML + (vecka / maxVecka) * (B - ML - 8);
  const y = (kg: number) => H - MB - (kg / maxKg) * (H - MB - 10);

  const band =
    kurva.length > 1
      ? [
          ...kurva.map((k) => `${x(k.vecka)},${y(k.max_kg)}`),
          ...kurva
            .slice()
            .reverse()
            .map((k) => `${x(k.vecka)},${y(k.min_kg)}`),
        ].join(" ")
      : null;

  const linje = punkter
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(p.vecka)},${y(p.kg)}`)
    .join(" ");

  const kgSteg = maxKg > 30 ? 10 : maxKg > 12 ? 5 : maxKg > 4 ? 2 : 1;
  const kgLinjer: number[] = [];
  for (let kg = kgSteg; kg < maxKg; kg += kgSteg) kgLinjer.push(kg);
  const veckoSteg = maxVecka > 80 ? 26 : 13;
  const veckoLinjer: number[] = [];
  for (let v = veckoSteg; v <= maxVecka; v += veckoSteg) veckoLinjer.push(v);

  return (
    <figure>
      <svg
        viewBox={`0 0 ${B} ${H}`}
        role="img"
        aria-label="Viktkurva: valpens loggade vikt jämfört med rasens normalspann"
        className="w-full"
      >
        {kgLinjer.map((kg) => (
          <g key={kg}>
            <line
              x1={ML}
              x2={B - 8}
              y1={y(kg)}
              y2={y(kg)}
              stroke="#e5dcc9"
              strokeWidth="1"
            />
            <text
              x={ML - 6}
              y={y(kg) + 4}
              textAnchor="end"
              fontSize="10"
              fill="#6b5d50"
            >
              {kg}
            </text>
          </g>
        ))}
        {veckoLinjer.map((v) => (
          <text
            key={v}
            x={x(v)}
            y={H - 8}
            textAnchor="middle"
            fontSize="10"
            fill="#6b5d50"
          >
            v{v}
          </text>
        ))}
        {band && <polygon points={band} fill="#6f7d5c" opacity="0.18" />}
        {linje && (
          <path
            d={linje}
            fill="none"
            stroke="#b05f3c"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {punkter.map((p, i) => (
          <circle
            key={i}
            cx={x(p.vecka)}
            cy={y(p.kg)}
            r="4"
            fill="#b05f3c"
            stroke="#fffdf8"
            strokeWidth="1.5"
          />
        ))}
      </svg>
      <figcaption className="mt-1 flex flex-wrap gap-4 text-xs text-blck-mjuk">
        <span>
          <span
            aria-hidden="true"
            className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-tass align-middle"
          />
          Din valp
        </span>
        {band && (
          <span>
            <span
              aria-hidden="true"
              className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-ang opacity-40 align-middle"
            />
            Rasens normalspann
          </span>
        )}
      </figcaption>
    </figure>
  );
}
