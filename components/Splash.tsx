import { SITE_NAME } from "@/lib/site";

export function Splash() {
  return (
    <div id="gw-splash" className="gw-splash" aria-hidden="true">
      <div className="gw-splash__card">
        <svg className="gw-splash__mark" viewBox="0 0 120 120">
          <path
            className="gw-splash__ring"
            pathLength={1}
            d="M61 13c26-1 47 19 47 46 0 28-20 48-47 49-28 1-48-19-49-47-1-26 18-47 45-48 3 0 6 0 8 1"
          />
          <text className="gw-splash__letter" x="60" y="61" textAnchor="middle" dominantBaseline="central">
            G
          </text>
        </svg>
        <p className="gw-splash__name">{SITE_NAME}</p>
        <p className="gw-splash__tag">The whole map, one page at a time</p>
        <span className="gw-splash__bar">
          <span />
        </span>
      </div>
    </div>
  );
}
