import type { Exercise } from "../types";

export const dsaAddJsToolkit: Exercise[] = [
  {
    "id": "ex-js-make-grid",
    "chapter": "dsa-js-toolkit",
    "level": "beginner",
    "title": "Make a grid whose rows are separate",
    "brief": "<p>Write <code>makeGrid(rows, cols, value)</code>, which returns an array of <code>rows</code> arrays, each holding <code>cols</code> copies of <code>value</code>.</p><ul><li>Changing one cell must never change any other cell, so <b>every row has to be its own array</b></li><li><code>makeGrid(0, 5, 1)</code> is <code>[]</code>, and <code>makeGrid(2, 0, 1)</code> is <code>[[], []]</code></li><li>The value is a number, string, boolean or <code>null</code>, never an object</li><li>The rows must hold real elements, not empty slots</li></ul>",
    "starter": "function makeGrid(rows, cols, value) {\n  // TODO: build rows separate arrays of cols copies of value\n}\n",
    "hints": [
      "Array(rows).fill(someArray) puts the very same array in every slot. Think about what that means once you write to g[0][0].",
      "You need a fresh row every time. A function that is called once per row can create one: Array.from({ length: rows }, () => ...).",
      "Inside that function, new Array(cols).fill(value) is safe, because the value is a primitive and is copied into each cell."
    ],
    "solution": "function makeGrid(rows, cols, value) {\n  return Array.from({ length: rows }, () => new Array(cols).fill(value));\n}\n",
    "tests": [
      {
        "name": "builds a rows by cols grid of the value",
        "body": "assert.deepEqual(makeGrid(2, 3, 0), [[0, 0, 0], [0, 0, 0]]);\nassert.deepEqual(makeGrid(1, 1, 'x'), [['x']]);\nassert.deepEqual(makeGrid(3, 1, 7), [[7], [7], [7]]);"
      },
      {
        "name": "changing one cell leaves every other cell alone",
        "body": "const g = makeGrid(3, 3, 0);\ng[0][0] = 9;\nassert.equal(g[1][0], 0);\nassert.equal(g[2][0], 0);\nassert.equal(g[0][1], 0);\nassert.deepEqual(g, [[9, 0, 0], [0, 0, 0], [0, 0, 0]]);"
      },
      {
        "name": "every row is a different array",
        "body": "const g = makeGrid(4, 2, 1);\nfor (let i = 0; i < 4; i++) {\n  for (let j = i + 1; j < 4; j++) assert.notEqual(g[i], g[j]);\n}"
      },
      {
        "name": "zero rows gives an empty grid",
        "body": "assert.deepEqual(makeGrid(0, 5, 1), []);\nassert.deepEqual(makeGrid(0, 0, 1), []);"
      },
      {
        "name": "zero columns gives separate empty rows",
        "body": "const g = makeGrid(2, 0, 1);\nassert.deepEqual(g, [[], []]);\nassert.notEqual(g[0], g[1]);"
      },
      {
        "name": "rows hold real elements, not holes",
        "body": "const g = makeGrid(2, 3, 0);\nassert.ok(0 in g[0] && 1 in g[0] && 2 in g[0]);\nassert.equal(g[1].filter(() => true).length, 3);\nassert.equal(g[0].every((v) => v === 0), true);"
      },
      {
        "name": "works with null, false and strings as the value",
        "body": "assert.deepEqual(makeGrid(1, 2, null), [[null, null]]);\nassert.deepEqual(makeGrid(2, 1, false), [[false], [false]]);\nassert.deepEqual(makeGrid(2, 2, ''), [['', ''], ['', '']]);"
      },
      {
        "name": "a large grid stays independent",
        "body": "const g = makeGrid(500, 500, 7);\nassert.equal(g.length, 500);\nassert.equal(g[499].length, 500);\ng[10][10] = 0;\nlet sevens = 0;\nfor (const row of g) for (const v of row) if (v === 7) sevens++;\nassert.equal(sevens, 500 * 500 - 1);"
      }
    ]
  },
  {
    "id": "ex-js-rank-players",
    "chapter": "dsa-js-toolkit",
    "level": "beginner",
    "title": "Rank players with a two-key comparator",
    "brief": "<p>Write <code>rankPlayers(players)</code>. Each player is <code>{ id, name, score }</code>. Return the <b>ids</b> in ranked order: the highest score first, and among equal scores the name that comes first when compared with <code>&lt;</code> and <code>&gt;</code> (code unit order, so <code>'B'</code> comes before <code>'a'</code>).</p><ul><li>Players with the same score and the same name keep their input order</li><li>Do not change the input array; return a new one</li><li>Scores may be negative or zero</li><li>An empty list returns <code>[]</code></li></ul>",
    "starter": "function rankPlayers(players) {\n  // TODO: sort a copy with a comparator that uses two keys, then return the ids\n}\n",
    "hints": [
      "sort() changes the array it is called on, so sort a copy: [...players] or players.slice().",
      "A comparator returns a number: negative puts the first argument first. For scores high to low use b.score - a.score.",
      "Chain the keys with ||. A score difference of 0 is falsy, so the name comparison only runs on ties. Compare names with a < b ? -1 : a > b ? 1 : 0. The sort is stable, so full ties keep input order without extra code."
    ],
    "solution": "function rankPlayers(players) {\n  return [...players]\n    .sort((a, b) => b.score - a.score || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))\n    .map((p) => p.id);\n}\n",
    "tests": [
      {
        "name": "highest score first",
        "body": "const players = [{ id: 1, name: 'ann', score: 5 }, { id: 2, name: 'bob', score: 9 }, { id: 3, name: 'cy', score: 7 }];\nassert.deepEqual(rankPlayers(players), [2, 3, 1]);"
      },
      {
        "name": "a tie is broken by name, ascending",
        "body": "const players = [{ id: 1, name: 'zed', score: 4 }, { id: 2, name: 'amy', score: 4 }, { id: 3, name: 'bob', score: 4 }];\nassert.deepEqual(rankPlayers(players), [2, 3, 1]);"
      },
      {
        "name": "names compare in code unit order, capitals first",
        "body": "const players = [{ id: 1, name: 'b', score: 1 }, { id: 2, name: 'B', score: 1 }, { id: 3, name: 'a', score: 1 }, { id: 4, name: 'A', score: 1 }];\nassert.deepEqual(rankPlayers(players), [4, 2, 3, 1]);"
      },
      {
        "name": "equal score and name keep their input order",
        "body": "const players = [{ id: 1, name: 'x', score: 1 }, { id: 2, name: 'x', score: 1 }, { id: 3, name: 'w', score: 1 }, { id: 4, name: 'x', score: 1 }];\nassert.deepEqual(rankPlayers(players), [3, 1, 2, 4]);"
      },
      {
        "name": "does not change the input",
        "body": "const players = [{ id: 1, name: 'b', score: 1 }, { id: 2, name: 'a', score: 3 }];\nconst before = JSON.stringify(players);\nconst result = rankPlayers(players);\nassert.equal(JSON.stringify(players), before);\nassert.deepEqual(result, [2, 1]);"
      },
      {
        "name": "negative and zero scores",
        "body": "const players = [{ id: 1, name: 'a', score: -3 }, { id: 2, name: 'b', score: 0 }, { id: 3, name: 'c', score: -10 }, { id: 4, name: 'd', score: 0 }];\nassert.deepEqual(rankPlayers(players), [2, 4, 1, 3]);"
      },
      {
        "name": "scores are compared as numbers, not text",
        "body": "const players = [{ id: 1, name: 'a', score: 9 }, { id: 2, name: 'b', score: 10 }, { id: 3, name: 'c', score: 100 }];\nassert.deepEqual(rankPlayers(players), [3, 2, 1]);"
      },
      {
        "name": "empty and single",
        "body": "assert.deepEqual(rankPlayers([]), []);\nassert.deepEqual(rankPlayers([{ id: 7, name: 'solo', score: 2 }]), [7]);"
      }
    ]
  },
  {
    "id": "ex-js-sort-versions",
    "chapter": "dsa-js-toolkit",
    "level": "beginner",
    "title": "Sort version numbers",
    "brief": "<p>Write <code>sortVersions(versions)</code>, which takes strings such as <code>'1.10.2'</code> and returns a <b>new</b> array in ascending version order.</p><ul><li>Compare part by part as <b>numbers</b>: <code>'1.9'</code> comes before <code>'1.10'</code></li><li>A missing part counts as 0, so <code>'1'</code>, <code>'1.0'</code> and <code>'1.0.0'</code> are equal</li><li>Leading zeros do not matter: <code>'1.01'</code> equals <code>'1.1'</code></li><li>Equal versions keep their input order</li><li>Do not change the input array</li></ul>",
    "starter": "function sortVersions(versions) {\n  // TODO: split on '.', compare the parts as numbers, pad with zeros\n}\n",
    "hints": [
      "The default sort compares text, and '1.10' < '1.9' as text. You need your own comparator.",
      "Turn each version into an array of numbers first: v.split('.').map(Number). Compare the two arrays position by position up to the longer length.",
      "For a position that one array does not have, use 0. Return the difference at the first position where they differ, and 0 if there is none. A stable sort then keeps equal versions in input order."
    ],
    "solution": "function sortVersions(versions) {\n  const parts = (v) => v.split('.').map(Number);\n  return [...versions].sort((a, b) => {\n    const x = parts(a);\n    const y = parts(b);\n    const length = Math.max(x.length, y.length);\n    for (let i = 0; i < length; i++) {\n      const diff = (x[i] ?? 0) - (y[i] ?? 0);\n      if (diff !== 0) return diff;\n    }\n    return 0;\n  });\n}\n",
    "tests": [
      {
        "name": "1.10 comes after 1.9",
        "body": "assert.deepEqual(sortVersions(['1.10', '1.9', '1.2.1']), ['1.2.1', '1.9', '1.10']);"
      },
      {
        "name": "missing parts count as zero and equal versions keep input order",
        "body": "assert.deepEqual(sortVersions(['1.0', '1', '1.0.0', '0.9']), ['0.9', '1.0', '1', '1.0.0']);\nassert.deepEqual(sortVersions(['1.0.0', '1.0', '1']), ['1.0.0', '1.0', '1']);"
      },
      {
        "name": "leading zeros are ignored",
        "body": "assert.deepEqual(sortVersions(['1.2', '1.01', '1.1', '1.001']), ['1.01', '1.1', '1.001', '1.2']);"
      },
      {
        "name": "single numbers sort numerically",
        "body": "assert.deepEqual(sortVersions(['10', '9', '100', '1']), ['1', '9', '10', '100']);"
      },
      {
        "name": "a longer version with a larger early part",
        "body": "assert.deepEqual(sortVersions(['2.0.0', '1.99.99', '1.100', '1.99.100']), ['1.99.99', '1.99.100', '1.100', '2.0.0']);"
      },
      {
        "name": "large parts",
        "body": "assert.deepEqual(sortVersions(['1.100000', '1.99999', '1.5']), ['1.5', '1.99999', '1.100000']);"
      },
      {
        "name": "does not change the input",
        "body": "const input = ['3', '1.5', '2'];\nconst before = input.slice();\nconst result = sortVersions(input);\nassert.deepEqual(input, before);\nassert.deepEqual(result, ['1.5', '2', '3']);"
      },
      {
        "name": "empty and single",
        "body": "assert.deepEqual(sortVersions([]), []);\nassert.deepEqual(sortVersions(['4.2']), ['4.2']);"
      }
    ]
  },
  {
    "id": "ex-js-word-counts",
    "chapter": "dsa-js-toolkit",
    "level": "beginner",
    "title": "Count words without a plain object",
    "brief": "<p>Write <code>wordCounts(text)</code>. Split the text on whitespace and count the words exactly as written, so <code>'The'</code> and <code>'the'</code> are different words. Return an array of <code>[word, count]</code> pairs, sorted by count from high to low and, among equal counts, by word ascending in code unit order.</p><ul><li>Several spaces, tabs and newlines in a row are one separator, and leading or trailing whitespace is ignored</li><li>Words can be <code>constructor</code>, <code>toString</code>, <code>__proto__</code> or <code>hasOwnProperty</code>, and must be counted like any other</li><li>An empty text, or one with only whitespace, returns <code>[]</code></li><li>Return an array of arrays, not a <code>Map</code></li></ul>",
    "starter": "function wordCounts(text) {\n  // TODO: count with a Map, then sort the entries\n}\n",
    "hints": [
      "Split with text.trim().split(/\\s+/), and watch the empty string: ''.split(/\\s+/) gives [''] rather than an empty list.",
      "A plain object breaks on the word 'constructor', because counts['constructor'] already exists on every object. A Map has no inherited keys.",
      "Count with map.set(w, (map.get(w) ?? 0) + 1), spread the Map into an array of pairs, and sort with b[1] - a[1] || (a[0] < b[0] ? -1 : 1)."
    ],
    "solution": "function wordCounts(text) {\n  const trimmed = text.trim();\n  if (trimmed === '') return [];\n  const counts = new Map();\n  for (const word of trimmed.split(/\\s+/)) {\n    counts.set(word, (counts.get(word) ?? 0) + 1);\n  }\n  return [...counts].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));\n}\n",
    "tests": [
      {
        "name": "counts and orders a short text",
        "body": "assert.deepEqual(wordCounts('the cat the dog'), [['the', 2], ['cat', 1], ['dog', 1]]);"
      },
      {
        "name": "ignores extra whitespace",
        "body": "assert.deepEqual(wordCounts('  a\\tb \\n a  '), [['a', 2], ['b', 1]]);"
      },
      {
        "name": "case matters, and capitals sort first",
        "body": "assert.deepEqual(wordCounts('The the THE'), [['THE', 1], ['The', 1], ['the', 1]]);"
      },
      {
        "name": "equal counts are ordered by word",
        "body": "assert.deepEqual(wordCounts('b a c a b'), [['a', 2], ['b', 2], ['c', 1]]);"
      },
      {
        "name": "words that exist on every object are counted normally",
        "body": "const result = wordCounts('constructor toString constructor __proto__ hasOwnProperty valueOf __proto__ constructor');\nassert.deepEqual(result, [['constructor', 3], ['__proto__', 2], ['hasOwnProperty', 1], ['toString', 1], ['valueOf', 1]]);"
      },
      {
        "name": "empty and whitespace-only text",
        "body": "assert.deepEqual(wordCounts(''), []);\nassert.deepEqual(wordCounts('   \\t\\n '), []);"
      },
      {
        "name": "words that look like numbers are still words",
        "body": "assert.deepEqual(wordCounts('10 9 10 1e3 9'), [['10', 2], ['9', 2], ['1e3', 1]]);"
      },
      {
        "name": "returns an array of pairs",
        "body": "const result = wordCounts('a b a');\nassert.equal(Array.isArray(result), true);\nassert.equal(Array.isArray(result[0]), true);\nassert.equal(result.length, 2);"
      },
      {
        "name": "a long text",
        "body": "const text = 'a '.repeat(50000) + 'b '.repeat(50000) + 'c';\nassert.deepEqual(wordCounts(text), [['a', 50000], ['b', 50000], ['c', 1]]);"
      }
    ]
  },
  {
    "id": "ex-js-distinct-cells",
    "chapter": "dsa-js-toolkit",
    "level": "beginner",
    "title": "Count distinct cells",
    "brief": "<p>Write <code>countDistinctCells(cells)</code>, where <code>cells</code> is an array of <code>[row, col]</code> pairs of integers between <code>-1000000</code> and <code>1000000</code>. Return how many different cells it holds.</p><ul><li>A cell is the pair, so <code>[1, 23]</code> and <code>[12, 3]</code> are different cells</li><li>Rows and columns can be negative</li><li>Two arrays with the same numbers are the same cell even though they are different objects</li><li>Aim for O(n)</li></ul>",
    "starter": "function countDistinctCells(cells) {\n  // TODO: turn each pair into one key that cannot collide, and count the keys\n}\n",
    "hints": [
      "new Set(cells).size will not work: two different arrays are never equal keys, even with the same contents.",
      "Turn the pair into one primitive. Glueing the two numbers with nothing between them makes (1, 23) and (12, 3) the same string.",
      "Use a delimiter: `${r},${c}`. That works for negatives too. The number r * 1000 + c would collide here, because c can be far larger than 1000."
    ],
    "solution": "function countDistinctCells(cells) {\n  const seen = new Set();\n  for (const [r, c] of cells) seen.add(`${r},${c}`);\n  return seen.size;\n}\n",
    "tests": [
      {
        "name": "counts repeated cells once",
        "body": "assert.equal(countDistinctCells([[1, 2], [1, 2], [2, 1]]), 2);"
      },
      {
        "name": "digits glued together do not collide",
        "body": "assert.equal(countDistinctCells([[1, 23], [12, 3]]), 2);\nassert.equal(countDistinctCells([[11, 1], [1, 11]]), 2);"
      },
      {
        "name": "negative rows and columns",
        "body": "assert.equal(countDistinctCells([[-1, 2], [1, -2], [-1, -2], [1, 2], [-1, 2]]), 4);"
      },
      {
        "name": "a small multiplier would collide",
        "body": "assert.equal(countDistinctCells([[0, 1000], [1, 0]]), 2);\nassert.equal(countDistinctCells([[0, 1000000], [1, 0]]), 2);\nassert.equal(countDistinctCells([[5, -1], [4, 999]]), 2);"
      },
      {
        "name": "empty and single",
        "body": "assert.equal(countDistinctCells([]), 0);\nassert.equal(countDistinctCells([[0, 0]]), 1);"
      },
      {
        "name": "zero and negative zero are the same cell",
        "body": "assert.equal(countDistinctCells([[0, 0], [-0, 0], [0, -0]]), 1);"
      },
      {
        "name": "extreme values",
        "body": "assert.equal(countDistinctCells([[1000000, -1000000], [-1000000, 1000000], [1000000, -1000000]]), 2);"
      },
      {
        "name": "a hundred thousand cells, each given twice",
        "body": "const cells = [];\nfor (let i = 0; i < 100000; i++) cells.push([i % 1000, Math.floor(i / 1000)]);\nconst doubled = cells.concat(cells.map(([r, c]) => [r, c]));\nassert.equal(countDistinctCells(doubled), 100000);"
      }
    ]
  },
  {
    "id": "ex-js-floor-div-mod",
    "chapter": "dsa-js-toolkit",
    "level": "beginner",
    "title": "Floor division and a non-negative remainder",
    "brief": "<p>Write <code>floorDivMod(a, b)</code> for an integer <code>a</code> (any sign, up to <code>10^15</code> in size) and an integer <code>b</code> from <code>1</code> to <code>10^9</code>. Return <code>[q, r]</code> where <code>q</code> is <code>a / b</code> rounded <b>down</b> and <code>r</code> is the remainder, always from <code>0</code> to <code>b - 1</code>, so that <code>q * b + r === a</code>.</p><ul><li><code>floorDivMod(-17, 5)</code> is <code>[-4, 3]</code>, not <code>[-3, -2]</code></li><li>Neither value may be <code>-0</code>: <code>Object.is(r, 0)</code> must be true when the remainder is zero</li><li>The bit operators <code>| 0</code> and <code>&gt;&gt;</code> only work on 32 bits, and <code>a</code> can be larger</li></ul>",
    "starter": "function floorDivMod(a, b) {\n  // TODO: return [q, r] with q rounded down and 0 <= r < b\n}\n",
    "hints": [
      "Math.floor rounds toward negative infinity, which is the rounding the quotient needs. Math.trunc and | 0 round toward zero.",
      "a % b has the sign of a, so for a negative a it is zero or negative. Add b and take % b again to land in 0..b-1: ((a % b) + b) % b.",
      "Check the multiples: -15 % 5 is -0 in JavaScript, and -0 + 5 is 5, and 5 % 5 is 0. Going through the second % is what turns -0 into a plain 0."
    ],
    "solution": "function floorDivMod(a, b) {\n  const q = Math.floor(a / b);\n  const r = ((a % b) + b) % b;\n  return [q, r];\n}\n",
    "tests": [
      {
        "name": "positive numbers",
        "body": "assert.deepEqual(floorDivMod(17, 5), [3, 2]);\nassert.deepEqual(floorDivMod(4, 9), [0, 4]);"
      },
      {
        "name": "a negative dividend rounds down",
        "body": "assert.deepEqual(floorDivMod(-17, 5), [-4, 3]);\nassert.deepEqual(floorDivMod(-1, 3), [-1, 2]);\nassert.deepEqual(floorDivMod(-6, 7), [-1, 1]);"
      },
      {
        "name": "an exact multiple gives a remainder of positive zero",
        "body": "const [q, r] = floorDivMod(-15, 5);\nassert.equal(q, -3);\nassert.ok(Object.is(r, 0), 'the remainder must be 0, not -0');\nconst [q2, r2] = floorDivMod(15, 5);\nassert.equal(q2, 3);\nassert.ok(Object.is(r2, 0));"
      },
      {
        "name": "zero",
        "body": "const [q, r] = floorDivMod(0, 7);\nassert.ok(Object.is(q, 0), 'the quotient must be 0, not -0');\nassert.ok(Object.is(r, 0));"
      },
      {
        "name": "dividing by one",
        "body": "const [q, r] = floorDivMod(-9, 1);\nassert.equal(q, -9);\nassert.ok(Object.is(r, 0));"
      },
      {
        "name": "values beyond 32 bits",
        "body": "const cases = [[-30000000001, 7], [30000000001, 7], [-1000000000000000, 999999937], [999999999999999, 1000000000], [-4294967296, 3]];\nfor (const [a, b] of cases) {\n  let q = BigInt(a) / BigInt(b);\n  let r = BigInt(a) % BigInt(b);\n  if (r < 0n) {\n    r += BigInt(b);\n    q -= 1n;\n  }\n  assert.deepEqual(floorDivMod(a, b), [Number(q), Number(r)], 'a = ' + a + ', b = ' + b);\n}"
      },
      {
        "name": "q * b + r rebuilds a, and r stays in range",
        "body": "function lcg(seed) {\n  let s = seed;\n  return (n) => {\n    s = (Math.imul(s, 1103515245) + 12345) & 0x7fffffff;\n    return s % n;\n  };\n}\nconst next = lcg(7);\nfor (let i = 0; i < 300; i++) {\n  const a = next(2000000001) * 500000 - 500000000000000;\n  const b = 1 + next(1000000000);\n  const [q, r] = floorDivMod(a, b);\n  assert.ok(r >= 0 && r < b, 'remainder out of range for ' + a + ', ' + b);\n  assert.equal(q * b + r, a);\n}"
      },
      {
        "name": "no -0 anywhere in a small table",
        "body": "for (let a = -20; a <= 20; a++) {\n  for (let b = 1; b <= 5; b++) {\n    const [q, r] = floorDivMod(a, b);\n    assert.ok(!Object.is(q, -0) && !Object.is(r, -0), 'got -0 for ' + a + ', ' + b);\n    assert.ok(r >= 0 && r < b);\n    assert.equal(q * b + r, a);\n  }\n}"
      }
    ]
  },
  {
    "id": "ex-js-multiply-mod",
    "chapter": "dsa-js-toolkit",
    "level": "beginner",
    "title": "Multiply modulo m without losing digits",
    "brief": "<p>Write <code>mulMod(a, b, m)</code>, which returns <code>(a * b) % m</code> as an ordinary number. The inputs are integers with <code>0 &lt;= a, b &lt; m</code> and <code>1 &lt;= m &lt;= 2^53 - 1</code>.</p><ul><li>The product <code>a * b</code> can be far beyond the largest integer a number holds exactly, so <code>(a * b) % m</code> gives wrong answers</li><li><code>mulMod(999999999, 999999998, 1000000007)</code> is <code>72</code></li><li>The result is below <code>m</code>, so it is safe to return as a number</li></ul>",
    "starter": "function mulMod(a, b, m) {\n  // TODO: multiply exactly, reduce, return a number\n}\n",
    "hints": [
      "Try (999999999 * 999999998) % 1000000007 in a console. The product is about 10^18, which a double cannot hold exactly.",
      "BigInt holds integers of any size exactly. Convert all three inputs with BigInt(...), multiply and take the remainder in BigInt.",
      "You cannot mix BigInt and numbers in arithmetic. Convert the reduced result back with Number(...), which is exact because it is below m."
    ],
    "solution": "function mulMod(a, b, m) {\n  return Number((BigInt(a) * BigInt(b)) % BigInt(m));\n}\n",
    "tests": [
      {
        "name": "the example from the chapter",
        "body": "assert.equal(mulMod(999999999, 999999998, 1000000007), 72);"
      },
      {
        "name": "small numbers",
        "body": "assert.equal(mulMod(3, 4, 5), 2);\nassert.equal(mulMod(6, 6, 7), 1);\nassert.equal(mulMod(0, 9, 7), 0);\nassert.equal(mulMod(9, 0, 10), 0);"
      },
      {
        "name": "modulus one",
        "body": "assert.equal(mulMod(0, 0, 1), 0);"
      },
      {
        "name": "the square of m - 1 is 1 for a modulus near 2^53",
        "body": "const m = 9007199254740881;\nassert.equal(mulMod(m - 1, m - 1, m), 1);\nassert.equal(mulMod(m - 1, 2, m), m - 2);"
      },
      {
        "name": "returns a number",
        "body": "assert.equal(typeof mulMod(5, 6, 7), 'number');"
      },
      {
        "name": "agrees with BigInt on many large cases",
        "body": "const mods = [1000000007, 998244353, 2147483647, 1099511627791, 4503599627370499, 9007199254740881, 9007199254740991];\nconst fractions = [0.05, 0.1, 0.37, 0.5, 0.73, 0.91, 0.999];\nfor (const m of mods) {\n  for (const f of fractions) {\n    for (const g of fractions) {\n      const a = Math.floor((m - 1) * f);\n      const b = Math.floor((m - 1) * g);\n      const expected = Number((BigInt(a) * BigInt(b)) % BigInt(m));\n      assert.equal(mulMod(a, b, m), expected, 'a = ' + a + ', b = ' + b + ', m = ' + m);\n    }\n  }\n}"
      },
      {
        "name": "the result is always below the modulus",
        "body": "for (let a = 0; a < 20; a++) {\n  for (let b = 0; b < 20; b++) {\n    const r = mulMod(a, b, 13);\n    assert.ok(r >= 0 && r < 13);\n    assert.equal(r, (a * b) % 13);\n  }\n}"
      }
    ]
  },
  {
    "id": "ex-js-factorial-string",
    "chapter": "dsa-js-toolkit",
    "level": "beginner",
    "title": "Exact factorial as a string",
    "brief": "<p>Write <code>factorialString(n)</code> for an integer <code>0 &lt;= n &lt;= 100</code>. Return <code>n!</code> as a string of digits, exactly.</p><ul><li><code>factorialString(25)</code> is <code>'15511210043330985984000000'</code></li><li><code>0!</code> and <code>1!</code> are <code>'1'</code></li><li>An ordinary number is only guaranteed exact up to <code>18!</code> (the safe integer range) and gives wrong digits from <code>23!</code> on, so the product has to be built another way</li></ul>",
    "starter": "function factorialString(n) {\n  // TODO: multiply 2 * 3 * ... * n exactly and return the digits\n}\n",
    "hints": [
      "19! is already past the safe integer range, and from 23! on a Number holds wrong digits. A Number cannot be trusted to hold the product.",
      "Start from 1n and multiply by BigInt(i) for each i from 2 to n. A BigInt never loses digits.",
      "Return result.toString(). Do not convert back with Number(...), and do not print with a template literal that adds an n."
    ],
    "solution": "function factorialString(n) {\n  let result = 1n;\n  for (let i = 2; i <= n; i++) result *= BigInt(i);\n  return result.toString();\n}\n",
    "tests": [
      {
        "name": "0! and 1!",
        "body": "assert.equal(factorialString(0), '1');\nassert.equal(factorialString(1), '1');"
      },
      {
        "name": "small values",
        "body": "assert.equal(factorialString(5), '120');\nassert.equal(factorialString(10), '3628800');"
      },
      {
        "name": "20!, which is past the safe integer range",
        "body": "assert.equal(factorialString(20), '2432902008176640000');"
      },
      {
        "name": "25!",
        "body": "assert.equal(factorialString(25), '15511210043330985984000000');"
      },
      {
        "name": "30!",
        "body": "assert.equal(factorialString(30), '265252859812191058636308480000000');"
      },
      {
        "name": "50!",
        "body": "assert.equal(factorialString(50), '30414093201713378043612608166064768844377641568960512000000000000');"
      },
      {
        "name": "100! has 158 digits",
        "body": "const s = factorialString(100);\nassert.equal(typeof s, 'string');\nassert.equal(s.length, 158);\nassert.equal(s, '93326215443944152681699238856266700490715968264381621468592963895217599993229915608941463976156518286253697920827223758251185210916864000000000000000000000000');"
      },
      {
        "name": "each value is the previous one times n",
        "body": "let previous = 1n;\nfor (let n = 1; n <= 100; n++) {\n  previous *= BigInt(n);\n  assert.equal(factorialString(n), previous.toString(), 'n = ' + n);\n}"
      }
    ]
  },
  {
    "id": "ex-js-bit-mask",
    "chapter": "dsa-js-toolkit",
    "level": "beginner",
    "title": "A mask of the low k bits",
    "brief": "<p>Write <code>lowBitsMask(k)</code> for an integer <code>0 &lt;= k &lt;= 32</code>. Return the non-negative number whose lowest <code>k</code> bits are 1 and all other bits 0.</p><ul><li><code>lowBitsMask(0)</code> is <code>0</code>, <code>lowBitsMask(8)</code> is <code>255</code></li><li><code>lowBitsMask(31)</code> is <code>2147483647</code> and <code>lowBitsMask(32)</code> is <code>4294967295</code></li><li>The result must never be negative</li></ul>",
    "starter": "function lowBitsMask(k) {\n  // TODO: return the number with k low bits set\n}\n",
    "hints": [
      "The textbook formula is (1 << k) - 1. Try it with k = 31 and k = 32 and look at what comes out.",
      "The shift operators work on a 32-bit signed integer and use the shift count modulo 32, so 1 << 31 is negative and 1 << 32 is 1.",
      "Arithmetic is not limited to 32 bits: 2 ** k - 1 is exact for every k up to 53."
    ],
    "solution": "function lowBitsMask(k) {\n  return 2 ** k - 1;\n}\n",
    "tests": [
      {
        "name": "small widths",
        "body": "assert.equal(lowBitsMask(0), 0);\nassert.equal(lowBitsMask(1), 1);\nassert.equal(lowBitsMask(8), 255);\nassert.equal(lowBitsMask(16), 65535);"
      },
      {
        "name": "30 bits",
        "body": "assert.equal(lowBitsMask(30), 1073741823);"
      },
      {
        "name": "31 bits is not negative",
        "body": "assert.equal(lowBitsMask(31), 2147483647);"
      },
      {
        "name": "32 bits is the largest unsigned 32-bit value",
        "body": "assert.equal(lowBitsMask(32), 4294967295);"
      },
      {
        "name": "every width from 0 to 32",
        "body": "let expected = 0;\nfor (let k = 0; k <= 32; k++) {\n  assert.equal(lowBitsMask(k), expected, 'k = ' + k);\n  expected = expected * 2 + 1;\n}"
      },
      {
        "name": "never negative and always a number",
        "body": "for (let k = 0; k <= 32; k++) {\n  const mask = lowBitsMask(k);\n  assert.equal(typeof mask, 'number');\n  assert.ok(mask >= 0, 'negative for k = ' + k);\n}"
      },
      {
        "name": "the mask keeps exactly the low k bits",
        "body": "const value = 4294967295;\nfor (let k = 1; k <= 31; k++) {\n  assert.equal(value % (lowBitsMask(k) + 1), lowBitsMask(k));\n}"
      }
    ]
  },
  {
    "id": "ex-js-reachable-nodes",
    "chapter": "dsa-js-toolkit",
    "level": "beginner",
    "title": "Count reachable nodes without recursion",
    "brief": "<p>Write <code>countReachable(n, edges, start)</code>. The graph has nodes <code>0..n-1</code> and undirected <code>edges</code>, each <code>[a, b]</code>. Return how many nodes can be reached from <code>start</code>, counting <code>start</code> itself.</p><ul><li><code>n</code> can be 200,000 and the graph can be one long path, so a recursive depth-first search throws <code>RangeError</code></li><li>Use an explicit stack or a queue with a head index</li><li>Edges may repeat, and an edge may join a node to itself</li><li>Nodes with no edges are valid</li></ul>",
    "starter": "function countReachable(n, edges, start) {\n  // TODO: build adjacency lists, then walk with your own stack\n}\n",
    "hints": [
      "Build adj = Array.from({ length: n }, () => []) and push both directions of every edge.",
      "Keep a seen array and a stack (or a queue plus a head index). Mark a node as seen when you push it, so it enters at most once.",
      "Loop while the stack is not empty: pop a node, count it, push every unseen neighbour. The count at the end is the answer."
    ],
    "solution": "function countReachable(n, edges, start) {\n  const adj = Array.from({ length: n }, () => []);\n  for (const [a, b] of edges) {\n    adj[a].push(b);\n    adj[b].push(a);\n  }\n  const seen = new Uint8Array(n);\n  const stack = [start];\n  seen[start] = 1;\n  let count = 0;\n  while (stack.length > 0) {\n    const node = stack.pop();\n    count++;\n    for (const next of adj[node]) {\n      if (seen[next] === 0) {\n        seen[next] = 1;\n        stack.push(next);\n      }\n    }\n  }\n  return count;\n}\n",
    "tests": [
      {
        "name": "two components",
        "body": "assert.equal(countReachable(5, [[0, 1], [1, 2], [3, 4]], 0), 3);\nassert.equal(countReachable(5, [[0, 1], [1, 2], [3, 4]], 3), 2);"
      },
      {
        "name": "a node with no edges",
        "body": "assert.equal(countReachable(3, [], 1), 1);\nassert.equal(countReachable(1, [], 0), 1);"
      },
      {
        "name": "a ring",
        "body": "assert.equal(countReachable(4, [[0, 1], [1, 2], [2, 3], [3, 0]], 2), 4);"
      },
      {
        "name": "repeated edges and self-loops",
        "body": "assert.equal(countReachable(3, [[0, 0], [0, 1], [0, 1], [1, 0]], 0), 2);\nassert.equal(countReachable(3, [[0, 0], [0, 1], [0, 1], [1, 0]], 2), 1);"
      },
      {
        "name": "a path of 200,000 nodes, from either end and the middle",
        "body": "const n = 200000;\nconst edges = [];\nfor (let i = 0; i < n - 1; i++) edges.push([i, i + 1]);\nassert.equal(countReachable(n, edges, 0), n);\nassert.equal(countReachable(n, edges, n - 1), n);\nassert.equal(countReachable(n, edges, 100000), n);"
      },
      {
        "name": "a star with 100,000 leaves",
        "body": "const n = 100001;\nconst edges = [];\nfor (let i = 1; i < n; i++) edges.push([0, i]);\nassert.equal(countReachable(n, edges, 0), n);\nassert.equal(countReachable(n, edges, 77), n);"
      },
      {
        "name": "random graphs agree with union-find",
        "body": "function lcg(seed) {\n  let s = seed;\n  return (n) => {\n    s = (Math.imul(s, 1103515245) + 12345) & 0x7fffffff;\n    return s % n;\n  };\n}\nconst next = lcg(99);\nfor (let t = 0; t < 200; t++) {\n  const n = 1 + next(12);\n  const edges = [];\n  const m = next(14);\n  for (let i = 0; i < m; i++) edges.push([next(n), next(n)]);\n  const parent = Array.from({ length: n }, (_, i) => i);\n  const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));\n  for (const [a, b] of edges) parent[find(a)] = find(b);\n  const start = next(n);\n  let expected = 0;\n  for (let v = 0; v < n; v++) if (find(v) === find(start)) expected++;\n  assert.equal(countReachable(n, edges, start), expected);\n}"
      },
      {
        "name": "a long path with a branch at the end",
        "body": "const n = 50000;\nconst edges = [];\nfor (let i = 0; i < n - 1; i++) edges.push([i, i + 1]);\nedges.push([n - 1, n], [n - 1, n + 1]);\nassert.equal(countReachable(n + 2, edges, 0), n + 2);"
      }
    ]
  },
  {
    "id": "ex-js-heap-class",
    "chapter": "dsa-js-toolkit",
    "level": "intermediate",
    "title": "Write a heap with a comparator",
    "brief": "<p>JavaScript has no priority queue. Write a class <code>Heap</code>.</p><ul><li><code>new Heap(compare)</code>: <code>compare(a, b)</code> works like the comparator of <code>sort</code>, and a negative result means <code>a</code> comes out before <code>b</code>. The default is ascending numbers, <code>(a, b) =&gt; a - b</code></li><li><code>push(item)</code> adds an item</li><li><code>pop()</code> removes and returns the item that comes first, or <code>undefined</code> when the heap is empty</li><li><code>peek()</code> returns it without removing, or <code>undefined</code> when empty</li><li><code>size</code> is a <b>getter</b>, used as <code>heap.size</code>, with no parentheses</li><li><code>push</code> and <code>pop</code> must be O(log n); the tests push and pop a hundred thousand items</li></ul>",
    "starter": "class Heap {\n  constructor(compare = (a, b) => a - b) {\n    // TODO: keep the items in an array\n  }\n\n  get size() {\n    // TODO\n  }\n\n  peek() {\n    // TODO\n  }\n\n  push(item) {\n    // TODO: add at the end, then sift up\n  }\n\n  pop() {\n    // TODO: move the last item to the root, then sift down\n  }\n}\n",
    "hints": [
      "Store the tree level by level in one array. The children of index i are at 2i + 1 and 2i + 2, and the parent is at (i - 1) >> 1.",
      "push: append the item, then swap it with its parent while compare(item, parent) < 0. pop: take items[0], put the last item at index 0, then swap it with the better child while that child compares lower.",
      "In sift-down pick the better of the two children first: take the right child only if it exists and compare(right, left) < 0. Remember pop on an empty heap must return undefined, and a heap with one item must not try to sift."
    ],
    "solution": "class Heap {\n  #items;\n  #compare;\n\n  constructor(compare = (a, b) => a - b) {\n    this.#compare = compare;\n    this.#items = [];\n  }\n\n  get size() {\n    return this.#items.length;\n  }\n\n  peek() {\n    return this.#items[0];\n  }\n\n  push(item) {\n    this.#items.push(item);\n    let i = this.#items.length - 1;\n    while (i > 0) {\n      const parent = (i - 1) >> 1;\n      if (this.#compare(this.#items[i], this.#items[parent]) >= 0) break;\n      [this.#items[i], this.#items[parent]] = [this.#items[parent], this.#items[i]];\n      i = parent;\n    }\n  }\n\n  pop() {\n    const items = this.#items;\n    if (items.length === 0) return undefined;\n    const top = items[0];\n    const last = items.pop();\n    if (items.length > 0) {\n      items[0] = last;\n      let i = 0;\n      while (true) {\n        let best = i;\n        const left = 2 * i + 1;\n        const right = left + 1;\n        if (left < items.length && this.#compare(items[left], items[best]) < 0) best = left;\n        if (right < items.length && this.#compare(items[right], items[best]) < 0) best = right;\n        if (best === i) break;\n        [items[i], items[best]] = [items[best], items[i]];\n        i = best;\n      }\n    }\n    return top;\n  }\n}\n",
    "tests": [
      {
        "name": "pops in ascending order by default",
        "body": "const h = new Heap();\n[5, 3, 8, 1, 9, 2].forEach((x) => h.push(x));\nconst out = [];\nwhile (h.size > 0) out.push(h.pop());\nassert.deepEqual(out, [1, 2, 3, 5, 8, 9]);"
      },
      {
        "name": "peek and size do not change the heap",
        "body": "const h = new Heap();\nh.push(4);\nh.push(2);\nassert.equal(h.peek(), 2);\nassert.equal(h.peek(), 2);\nassert.equal(h.size, 2);\nassert.equal(h.pop(), 2);\nassert.equal(h.size, 1);\nassert.equal(h.peek(), 4);"
      },
      {
        "name": "an empty heap",
        "body": "const h = new Heap();\nassert.equal(h.size, 0);\nassert.equal(h.pop(), undefined);\nassert.equal(h.peek(), undefined);\nh.push(1);\nh.pop();\nassert.equal(h.pop(), undefined);\nassert.equal(h.size, 0);"
      },
      {
        "name": "a comparator makes it a max-heap",
        "body": "const h = new Heap((a, b) => b - a);\n[4, 9, 2, 7, 9].forEach((x) => h.push(x));\nconst out = [];\nwhile (h.size > 0) out.push(h.pop());\nassert.deepEqual(out, [9, 9, 7, 4, 2]);"
      },
      {
        "name": "pairs ordered by the first field with a tie-break",
        "body": "const h = new Heap((a, b) => a[0] - b[0] || a[1] - b[1]);\nh.push([3, 1]);\nh.push([1, 9]);\nh.push([1, 2]);\nh.push([2, 5]);\nassert.deepEqual(h.pop(), [1, 2]);\nassert.deepEqual(h.pop(), [1, 9]);\nassert.deepEqual(h.pop(), [2, 5]);\nassert.deepEqual(h.pop(), [3, 1]);"
      },
      {
        "name": "strings with a three-way comparator",
        "body": "const h = new Heap((a, b) => (a < b ? -1 : a > b ? 1 : 0));\n['pear', 'apple', 'fig', 'Zed', 'banana'].forEach((s) => h.push(s));\nconst out = [];\nwhile (h.size > 0) out.push(h.pop());\nassert.deepEqual(out, ['Zed', 'apple', 'banana', 'fig', 'pear']);"
      },
      {
        "name": "zero and negative values are real items",
        "body": "const h = new Heap();\nh.push(0);\nh.push(-1);\nh.push(0);\nassert.equal(h.pop(), -1);\nassert.equal(h.pop(), 0);\nassert.equal(h.size, 1);\nassert.equal(h.pop(), 0);\nassert.equal(h.size, 0);"
      },
      {
        "name": "two heaps do not share items",
        "body": "const a = new Heap();\nconst b = new Heap();\na.push(1);\nb.push(2);\nassert.equal(a.size, 1);\nassert.equal(a.pop(), 1);\nassert.equal(b.peek(), 2);"
      },
      {
        "name": "interleaved pushes and pops match a sorted model",
        "body": "function lcg(seed) {\n  let s = seed;\n  return (n) => {\n    s = (Math.imul(s, 1103515245) + 12345) & 0x7fffffff;\n    return s % n;\n  };\n}\nconst next = lcg(2024);\nconst h = new Heap();\nconst model = [];\nfor (let step = 0; step < 6000; step++) {\n  if (next(3) < 2) {\n    const v = next(50) - 25;\n    h.push(v);\n    model.push(v);\n    model.sort((a, b) => a - b);\n  } else {\n    assert.equal(h.pop(), model.shift());\n  }\n  assert.equal(h.size, model.length);\n  assert.equal(h.peek(), model[0]);\n}"
      },
      {
        "name": "a hundred thousand items stay fast and ordered",
        "body": "function lcg(seed) {\n  let s = seed;\n  return (n) => {\n    s = (Math.imul(s, 1103515245) + 12345) & 0x7fffffff;\n    return s % n;\n  };\n}\nconst next = lcg(5);\nconst h = new Heap();\nfor (let i = 0; i < 100000; i++) h.push(next(1000000));\nassert.equal(h.size, 100000);\nlet previous = -1;\nfor (let i = 0; i < 100000; i++) {\n  const v = h.pop();\n  assert.ok(v >= previous, 'out of order at ' + i);\n  previous = v;\n}\nassert.equal(h.size, 0);"
      }
    ]
  },
  {
    "id": "ex-js-deque-class",
    "chapter": "dsa-js-toolkit",
    "level": "beginner",
    "title": "Write a deque with a ring buffer",
    "brief": "<p>Write a class <code>Deque</code> that adds and removes at both ends in O(1) amortized time.</p><ul><li><code>pushFront(x)</code> and <code>pushBack(x)</code> add an item</li><li><code>popFront()</code> and <code>popBack()</code> remove and return an item, or return <code>undefined</code> when the deque is empty</li><li><code>peekFront()</code> and <code>peekBack()</code> return an item without removing it, or <code>undefined</code> when empty</li><li><code>size</code> is a <b>getter</b>, used as <code>d.size</code></li><li>The tests do 500,000 <code>pushFront</code> calls in a row, so <code>unshift</code> on a plain array is too slow</li></ul>",
    "starter": "class Deque {\n  constructor() {\n    // TODO: a small array, a head index and a size\n  }\n\n  get size() {\n    // TODO\n  }\n\n  pushFront(x) {\n    // TODO: move head back one slot (wrapping) and write there\n  }\n\n  pushBack(x) {\n    // TODO: write at slot (head + size) % capacity\n  }\n\n  popFront() {\n    // TODO\n  }\n\n  popBack() {\n    // TODO\n  }\n\n  peekFront() {\n    // TODO\n  }\n\n  peekBack() {\n    // TODO\n  }\n}\n",
    "hints": [
      "Keep an array used as a ring, plus head (the slot of the front item) and size. The item at position i from the front lives in slot (head + i) % capacity.",
      "pushBack writes to slot (head + size) % capacity. pushFront first moves head back with (head - 1 + capacity) % capacity, then writes there. The + capacity keeps the index from going negative.",
      "When size equals the capacity, allocate an array twice as big, copy the items in order starting at slot 0 and set head to 0. Do this before writing, not after."
    ],
    "solution": "class Deque {\n  #buf = new Array(4);\n  #head = 0;\n  #size = 0;\n\n  get size() {\n    return this.#size;\n  }\n\n  #slot(i) {\n    return (this.#head + i) % this.#buf.length;\n  }\n\n  #grow() {\n    const bigger = new Array(this.#buf.length * 2);\n    for (let i = 0; i < this.#size; i++) bigger[i] = this.#buf[this.#slot(i)];\n    this.#buf = bigger;\n    this.#head = 0;\n  }\n\n  pushBack(x) {\n    if (this.#size === this.#buf.length) this.#grow();\n    this.#buf[this.#slot(this.#size)] = x;\n    this.#size++;\n  }\n\n  pushFront(x) {\n    if (this.#size === this.#buf.length) this.#grow();\n    this.#head = (this.#head - 1 + this.#buf.length) % this.#buf.length;\n    this.#buf[this.#head] = x;\n    this.#size++;\n  }\n\n  popFront() {\n    if (this.#size === 0) return undefined;\n    const x = this.#buf[this.#head];\n    this.#buf[this.#head] = undefined;\n    this.#head = this.#slot(1);\n    this.#size--;\n    return x;\n  }\n\n  popBack() {\n    if (this.#size === 0) return undefined;\n    const slot = this.#slot(this.#size - 1);\n    const x = this.#buf[slot];\n    this.#buf[slot] = undefined;\n    this.#size--;\n    return x;\n  }\n\n  peekFront() {\n    return this.#size === 0 ? undefined : this.#buf[this.#head];\n  }\n\n  peekBack() {\n    return this.#size === 0 ? undefined : this.#buf[this.#slot(this.#size - 1)];\n  }\n}\n",
    "tests": [
      {
        "name": "push at both ends and read from the front",
        "body": "const d = new Deque();\nd.pushBack(1);\nd.pushBack(2);\nd.pushFront(0);\nd.pushFront(-1);\nassert.equal(d.size, 4);\nassert.equal(d.peekFront(), -1);\nassert.equal(d.peekBack(), 2);\nassert.deepEqual([d.popFront(), d.popFront(), d.popFront(), d.popFront()], [-1, 0, 1, 2]);"
      },
      {
        "name": "pop from the back",
        "body": "const d = new Deque();\n[1, 2, 3].forEach((x) => d.pushBack(x));\nassert.equal(d.popBack(), 3);\nassert.equal(d.popBack(), 2);\nassert.equal(d.size, 1);\nassert.equal(d.peekBack(), 1);\nassert.equal(d.peekFront(), 1);"
      },
      {
        "name": "an empty deque returns undefined",
        "body": "const d = new Deque();\nassert.equal(d.size, 0);\nassert.equal(d.popFront(), undefined);\nassert.equal(d.popBack(), undefined);\nassert.equal(d.peekFront(), undefined);\nassert.equal(d.peekBack(), undefined);\nd.pushBack(5);\nd.popBack();\nassert.equal(d.popFront(), undefined);\nassert.equal(d.size, 0);"
      },
      {
        "name": "it grows past its first capacity in both directions",
        "body": "const d = new Deque();\nfor (let i = 0; i < 20; i++) d.pushBack(i);\nfor (let i = 1; i <= 20; i++) d.pushFront(-i);\nassert.equal(d.size, 40);\nconst out = [];\nwhile (d.size > 0) out.push(d.popFront());\nconst expected = [];\nfor (let i = -20; i < 20; i++) expected.push(i);\nassert.deepEqual(out, expected);"
      },
      {
        "name": "it keeps working after the live items wrap around the end",
        "body": "const d = new Deque();\nconst expected = [];\nfor (let round = 0; round < 50; round++) {\n  d.pushBack(round);\n  d.pushBack(round + 100);\n  expected.push(round, round + 100);\n  assert.equal(d.popFront(), expected.shift());\n}\nassert.equal(d.size, 50);\nassert.equal(d.peekFront(), expected[0]);\nassert.equal(d.peekBack(), 149);"
      },
      {
        "name": "falsy values are real items",
        "body": "const d = new Deque();\nd.pushBack(0);\nd.pushBack(null);\nd.pushFront(false);\nd.pushBack('');\nassert.equal(d.size, 4);\nassert.equal(d.popFront(), false);\nassert.equal(d.popFront(), 0);\nassert.equal(d.popFront(), null);\nassert.equal(d.popFront(), '');"
      },
      {
        "name": "random operations match an array",
        "body": "function lcg(seed) {\n  let s = seed;\n  return (n) => {\n    s = (Math.imul(s, 1103515245) + 12345) & 0x7fffffff;\n    return s % n;\n  };\n}\nconst next = lcg(31337);\nconst d = new Deque();\nconst model = [];\nfor (let step = 0; step < 8000; step++) {\n  const op = next(8);\n  if (op < 2) {\n    const v = next(1000);\n    d.pushBack(v);\n    model.push(v);\n  } else if (op < 4) {\n    const v = next(1000);\n    d.pushFront(v);\n    model.unshift(v);\n  } else if (op === 4) assert.equal(d.popFront(), model.shift());\n  else if (op === 5) assert.equal(d.popBack(), model.pop());\n  else {\n    assert.equal(d.peekFront(), model[0]);\n    assert.equal(d.peekBack(), model[model.length - 1]);\n  }\n  assert.equal(d.size, model.length);\n}"
      },
      {
        "name": "500,000 pushes at the front stay fast",
        "body": "const d = new Deque();\nconst n = 500000;\nfor (let i = 0; i < n; i++) d.pushFront(i);\nassert.equal(d.size, n);\nfor (let i = 0; i < n; i++) assert.equal(d.popBack(), i);\nassert.equal(d.size, 0);"
      }
    ]
  },
  {
    "id": "ex-js-sorted-list-class",
    "chapter": "dsa-js-toolkit",
    "level": "intermediate",
    "title": "Write a small ordered set",
    "brief": "<p>JavaScript has no ordered set. Write a class <code>SortedList</code> that keeps its items sorted in an array.</p><ul><li><code>new SortedList(compare)</code>, with the same comparator convention as <code>sort</code>; the default is ascending numbers</li><li><code>add(x)</code> inserts an item. Equal items are allowed, so it is a multiset</li><li><code>remove(x)</code> removes <b>one</b> item equal to <code>x</code> and returns <code>true</code>, or returns <code>false</code> if there is none</li><li><code>has(x)</code> returns whether an equal item exists</li><li><code>floor(x)</code> returns the largest item that is <code>&lt;= x</code>, and <code>ceiling(x)</code> the smallest that is <code>&gt;= x</code>, or <code>undefined</code> if there is none</li><li><code>size</code> is a <b>getter</b></li><li>Find positions with a binary search, not a scan</li></ul>",
    "starter": "class SortedList {\n  constructor(compare = (a, b) => a - b) {\n    // TODO\n  }\n\n  get size() {\n    // TODO\n  }\n\n  add(x) {\n    // TODO: binary search for the position, then splice it in\n  }\n\n  remove(x) {\n    // TODO\n  }\n\n  has(x) {\n    // TODO\n  }\n\n  floor(x) {\n    // TODO\n  }\n\n  ceiling(x) {\n    // TODO\n  }\n}\n",
    "hints": [
      "Write one helper that returns the first index whose item is not before x (compare(items[i], x) >= 0). add, has, remove and ceiling all start from it.",
      "For floor you need the index just after the last item that is <= x. That is a second binary search where the test is compare(items[mid], x) <= 0, and floor is the item one position before the answer.",
      "has and remove must check that the item at the found index really equals x (compare is 0) and that the index is inside the array. Reading past the end gives undefined, which is the right answer for floor and ceiling."
    ],
    "solution": "class SortedList {\n  #items = [];\n  #compare;\n\n  constructor(compare = (a, b) => a - b) {\n    this.#compare = compare;\n  }\n\n  get size() {\n    return this.#items.length;\n  }\n\n  #firstNotBefore(x) {\n    let lo = 0;\n    let hi = this.#items.length;\n    while (lo < hi) {\n      const mid = (lo + hi) >> 1;\n      if (this.#compare(this.#items[mid], x) < 0) lo = mid + 1;\n      else hi = mid;\n    }\n    return lo;\n  }\n\n  #firstAfter(x) {\n    let lo = 0;\n    let hi = this.#items.length;\n    while (lo < hi) {\n      const mid = (lo + hi) >> 1;\n      if (this.#compare(this.#items[mid], x) <= 0) lo = mid + 1;\n      else hi = mid;\n    }\n    return lo;\n  }\n\n  add(x) {\n    this.#items.splice(this.#firstAfter(x), 0, x);\n  }\n\n  has(x) {\n    const i = this.#firstNotBefore(x);\n    return i < this.#items.length && this.#compare(this.#items[i], x) === 0;\n  }\n\n  remove(x) {\n    const i = this.#firstNotBefore(x);\n    if (i === this.#items.length || this.#compare(this.#items[i], x) !== 0) return false;\n    this.#items.splice(i, 1);\n    return true;\n  }\n\n  floor(x) {\n    return this.#items[this.#firstAfter(x) - 1];\n  }\n\n  ceiling(x) {\n    return this.#items[this.#firstNotBefore(x)];\n  }\n}\n",
    "tests": [
      {
        "name": "floor and ceiling between items",
        "body": "const s = new SortedList();\n[5, 1, 9, 5].forEach((x) => s.add(x));\nassert.equal(s.floor(6), 5);\nassert.equal(s.ceiling(6), 9);\nassert.equal(s.floor(5), 5);\nassert.equal(s.ceiling(5), 5);\nassert.equal(s.floor(100), 9);\nassert.equal(s.ceiling(0), 1);"
      },
      {
        "name": "outside the range there is nothing",
        "body": "const s = new SortedList();\n[5, 1, 9].forEach((x) => s.add(x));\nassert.equal(s.size, 3);\nassert.equal(s.floor(0), undefined);\nassert.equal(s.ceiling(10), undefined);\nconst empty = new SortedList();\nassert.equal(empty.floor(1), undefined);\nassert.equal(empty.ceiling(1), undefined);"
      },
      {
        "name": "has and remove",
        "body": "const s = new SortedList();\n[3, 1, 2].forEach((x) => s.add(x));\nassert.equal(s.has(2), true);\nassert.equal(s.has(4), false);\nassert.equal(s.remove(2), true);\nassert.equal(s.has(2), false);\nassert.equal(s.remove(2), false);\nassert.equal(s.remove(99), false);\nassert.equal(s.size, 2);"
      },
      {
        "name": "duplicates are kept and removed one at a time",
        "body": "const s = new SortedList();\ns.add(5);\ns.add(5);\ns.add(5);\nassert.equal(s.size, 3);\nassert.equal(s.remove(5), true);\nassert.equal(s.remove(5), true);\nassert.equal(s.has(5), true);\nassert.equal(s.remove(5), true);\nassert.equal(s.has(5), false);\nassert.equal(s.remove(5), false);\nassert.equal(s.size, 0);"
      },
      {
        "name": "negative numbers and zero",
        "body": "const s = new SortedList();\n[0, -5, 3, -1].forEach((x) => s.add(x));\nassert.equal(s.floor(-2), -5);\nassert.equal(s.ceiling(-2), -1);\nassert.equal(s.floor(0), 0);\nassert.equal(s.ceiling(1), 3);"
      },
      {
        "name": "a custom comparator on pairs",
        "body": "const s = new SortedList((a, b) => a[0] - b[0]);\n[[3, 'c'], [1, 'a'], [2, 'b']].forEach((p) => s.add(p));\nassert.deepEqual(s.floor([2.5]), [2, 'b']);\nassert.deepEqual(s.ceiling([2.5]), [3, 'c']);\nassert.equal(s.has([1]), true);\nassert.equal(s.has([4]), false);"
      },
      {
        "name": "random operations match a brute-force model",
        "body": "function lcg(seed) {\n  let s = seed;\n  return (n) => {\n    s = (Math.imul(s, 1103515245) + 12345) & 0x7fffffff;\n    return s % n;\n  };\n}\nconst next = lcg(77);\nfor (let trial = 0; trial < 60; trial++) {\n  const s = new SortedList();\n  const model = [];\n  for (let step = 0; step < 120; step++) {\n    const op = next(3);\n    const v = next(30);\n    if (op === 0) {\n      s.add(v);\n      model.push(v);\n      model.sort((a, b) => a - b);\n    } else if (op === 1) {\n      const i = model.indexOf(v);\n      assert.equal(s.remove(v), i >= 0);\n      if (i >= 0) model.splice(i, 1);\n    } else {\n      assert.equal(s.has(v), model.includes(v));\n      assert.equal(s.floor(v), model.filter((x) => x <= v).pop());\n      assert.equal(s.ceiling(v), model.find((x) => x >= v));\n    }\n    assert.equal(s.size, model.length);\n  }\n}"
      },
      {
        "name": "thirty thousand inserts and queries stay fast",
        "body": "function lcg(seed) {\n  let s = seed;\n  return (n) => {\n    s = (Math.imul(s, 1103515245) + 12345) & 0x7fffffff;\n    return s % n;\n  };\n}\nconst next = lcg(8);\nconst s = new SortedList();\nfor (let i = 0; i < 30000; i++) s.add(next(1000000));\nassert.equal(s.size, 30000);\nlet hits = 0;\nfor (let i = 0; i < 30000; i++) {\n  const f = s.floor(next(1000000));\n  if (f !== undefined) hits++;\n}\nassert.ok(hits > 29000);"
      }
    ]
  }
];
