export const gitHeroFigure = `
<figure>
    <svg
      viewBox="0 0 960 272"
      class="dg"
      role="img"
      aria-label="A commit graph showing a main branch, a feature branch that merges back in, and a hotfix branch."
    >
      <g class="rough">
        <path class="ln" d="M60 165 H820" />
        <path
          class="lng"
          d="M220 165 C260 165 260 85 300 85 H520 C560 85 560 165 600 165"
        />
        <path
          class="lnr"
          d="M440 165 C470 165 470 225 500 225 H620 C660 225 660 165 700 165"
        />
      </g>
      <g class="rough">
        <circle cx="60" cy="165" r="7" style="fill: var(--ink)" />
        <circle cx="220" cy="165" r="7" style="fill: var(--ink)" />
        <circle cx="440" cy="165" r="7" style="fill: var(--ink)" />
        <circle cx="820" cy="165" r="9" style="fill: var(--ink)" />
        <circle
          cx="600"
          cy="165"
          r="9"
          style="fill: var(--sheet); stroke: var(--ink); stroke-width: 3"
        />
        <circle
          cx="700"
          cy="165"
          r="9"
          style="fill: var(--sheet); stroke: var(--red); stroke-width: 3"
        />
        <circle cx="300" cy="85" r="7" style="fill: var(--green)" />
        <circle cx="410" cy="85" r="7" style="fill: var(--green)" />
        <circle cx="520" cy="85" r="7" style="fill: var(--green)" />
        <circle cx="500" cy="225" r="7" style="fill: var(--red)" />
        <circle cx="620" cy="225" r="7" style="fill: var(--red)" />
      </g>
      <text class="sm" x="60" y="200" text-anchor="middle">a3f9c1</text>
      <text class="sm" x="220" y="200" text-anchor="middle">7d21e0</text>
      <text class="sm" x="440" y="200" text-anchor="middle">c04b8a</text>
      <text class="sm" x="600" y="200" text-anchor="middle">merge</text>
      <text class="lbl gr" x="300" y="62" text-anchor="middle">feature/checkout</text>
      <text class="lbl rd" x="500" y="252" text-anchor="middle">hotfix/login</text>
      <text class="lbl" x="836" y="169">main ← HEAD</text>
    </svg>
    <figcaption>
      Time flows left to right. Every circle is a commit; every
      commit remembers its parent. A branch name is only a label on
      one of these circles — that single fact explains most of Git.
    </figcaption>
  </figure>
`;
