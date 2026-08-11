export type IkonNamn =
  | "tass"
  | "kalender"
  | "kurva"
  | "dokument"
  | "flock"
  | "prat"
  | "hjarta"
  | "check"
  | "plus"
  | "gava"
  | "brev";

const BANOR: Record<IkonNamn, React.ReactNode> = {
  tass: (
    <>
      <ellipse cx="12" cy="15.5" rx="4.2" ry="3.6" />
      <ellipse cx="6.2" cy="10.4" rx="1.9" ry="2.4" transform="rotate(-18 6.2 10.4)" />
      <ellipse cx="10" cy="6.8" rx="1.9" ry="2.5" transform="rotate(-6 10 6.8)" />
      <ellipse cx="14.6" cy="6.9" rx="1.9" ry="2.5" transform="rotate(8 14.6 6.9)" />
      <ellipse cx="18.2" cy="10.7" rx="1.9" ry="2.4" transform="rotate(20 18.2 10.7)" />
    </>
  ),
  kalender: (
    <>
      <rect x="3.5" y="5" width="17" height="16" rx="3" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
      <path d="M8.5 14.5h.01M12 14.5h.01M15.5 14.5h.01M8.5 17.5h.01M12 17.5h.01" />
    </>
  ),
  kurva: (
    <>
      <path d="M4 4v14a2 2 0 0 0 2 2h14" />
      <path d="M7.5 15.5c2.5-.5 3.5-4 5-6.5s3-3.5 6.5-4" />
    </>
  ),
  dokument: (
    <>
      <path d="M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5z" />
      <path d="M14 3.5V8.5h5M9 13h6M9 16.5h4" />
    </>
  ),
  flock: (
    <>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M3.5 19.5c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5" />
      <path d="M15.5 5.8a3.2 3.2 0 0 1 0 5.9M17.5 14.9c1.6.7 2.7 2.2 3 4.6" />
    </>
  ),
  prat: (
    <>
      <path d="M20.5 11.5a8.5 8.5 0 1 0-3.6 6.9L20.5 20l-.9-3.9a8.4 8.4 0 0 0 .9-4.6z" />
      <path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" />
    </>
  ),
  hjarta: (
    <path d="M12 20.5s-7.5-4.5-9-9.5C2 7.5 4 4.5 7.5 4.5c2 0 3.5 1 4.5 2.7 1-1.7 2.5-2.7 4.5-2.7 3.5 0 5.5 3 4.5 6.5-1.5 5-9 9.5-9 9.5z" />
  ),
  check: <path d="M4.5 12.5l5 5 10-11" />,
  plus: <path d="M12 5v14M5 12h14" />,
  gava: (
    <>
      <rect x="4" y="9.5" width="16" height="11" rx="2" />
      <path d="M12 9.5v11M4 13.5h16" />
      <path d="M12 9.5c-1.5-1.5-4.5-1.5-5.5-3.5S8 2.5 9.5 4 12 9.5 12 9.5zm0 0c1.5-1.5 4.5-1.5 5.5-3.5S16 2.5 14.5 4 12 9.5 12 9.5z" />
    </>
  ),
  brev: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <path d="M4.5 7.5l7.5 6 7.5-6" />
    </>
  ),
};

export default function Ikon({
  namn,
  storlek = 22,
  className,
}: {
  namn: IkonNamn;
  storlek?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={storlek}
      height={storlek}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {BANOR[namn]}
    </svg>
  );
}
