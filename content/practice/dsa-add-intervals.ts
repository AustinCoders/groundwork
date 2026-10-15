import type { Exercise } from "../types";

export const dsaAddIntervals: Exercise[] = [
  {
    id: "ex-remove-covered-intervals",
    chapter: "dsa-intervals",
    level: "intermediate",
    title: "Remove Covered Intervals",
    brief:
      "<p>Given an array of distinct <code>[start, end]</code> intervals, remove every interval that is <b>covered</b> by another one, and return the number of intervals that remain.</p><ul><li><code>[a, b]</code> is covered by <code>[c, d]</code> when <code>c &lt;= a</code> and <code>b &lt;= d</code></li><li>No two intervals in the input are identical</li><li>Do not change the input array</li><li>Target complexity: O(n log n)</li></ul>",
    starter:
      "function removeCoveredIntervals(intervals) {\n  // TODO: sort so that anything that could cover an interval comes before it\n}\n",
    hints: [
      "If you sort by start, any interval that could cover the current one comes earlier, or has the same start.",
      "Walk the sorted list keeping the largest end seen so far. The current interval is covered when its end does not go past that maximum.",
      "For equal starts, put the longer interval first (sort by end descending), so the shorter one is seen as covered.",
    ],
    solution:
      "function removeCoveredIntervals(intervals) {\n  const sorted = [...intervals].sort((a, b) => a[0] - b[0] || b[1] - a[1]);\n  let kept = 0;\n  let maxEnd = -Infinity;\n  for (const [, end] of sorted) {\n    if (end > maxEnd) {\n      kept++;\n      maxEnd = end;\n    }\n  }\n  return kept;\n}\n",
    tests: [
      { name: "one interval is covered", body: "assert.equal(removeCoveredIntervals([[1, 4], [3, 6], [2, 8]]), 2);" },
      { name: "a shorter interval with the same start", body: "assert.equal(removeCoveredIntervals([[1, 4], [1, 6]]), 1);\nassert.equal(removeCoveredIntervals([[1, 6], [1, 4]]), 1);" },
      { name: "nothing is covered", body: "assert.equal(removeCoveredIntervals([[1, 2], [3, 4], [5, 6]]), 3);" },
      { name: "partial overlaps do not cover", body: "assert.equal(removeCoveredIntervals([[1, 3], [2, 4], [3, 5]]), 3);" },
      { name: "empty and single", body: "assert.equal(removeCoveredIntervals([]), 0);\nassert.equal(removeCoveredIntervals([[4, 9]]), 1);" },
      { name: "one interval covers all the others", body: "assert.equal(removeCoveredIntervals([[1, 100], [10, 20], [30, 40], [50, 60]]), 1);" },
      { name: "a shared end", body: "assert.equal(removeCoveredIntervals([[1, 5], [3, 5], [4, 5]]), 1);" },
      { name: "the input is not changed", body: "const input = [[3, 6], [1, 4], [2, 8]];\nremoveCoveredIntervals(input);\nassert.deepEqual(input, [[3, 6], [1, 4], [2, 8]]);" },
    ],
  },
  {
    id: "ex-interval-list-intersections",
    chapter: "dsa-intervals",
    level: "intermediate",
    title: "Interval List Intersections",
    brief:
      "<p>You are given two lists of <b>closed</b> intervals, <code>first</code> and <code>second</code>. Inside each list the intervals are sorted by start and do not overlap each other. Return the intersection of the two lists: every interval that lies inside an interval of <code>first</code> and inside an interval of <code>second</code>, as one sorted list.</p><ul><li>Intervals are closed, so <code>[1, 5]</code> and <code>[5, 9]</code> intersect in the single point <code>[5, 5]</code></li><li>Either list may be empty</li><li>Target complexity: O(n + m) time, with no sorting</li></ul>",
    starter:
      "function intervalIntersection(first, second) {\n  // TODO: walk both lists with two pointers\n}\n",
    hints: [
      "Look at the current interval from each list. Their overlap starts at the larger of the two starts and ends at the smaller of the two ends.",
      "The overlap exists when that start is not after that end. Record it when it exists.",
      "Then move the pointer of the interval that ends first: it cannot overlap anything else in the other list.",
    ],
    solution:
      "function intervalIntersection(first, second) {\n  const result = [];\n  let i = 0;\n  let j = 0;\n  while (i < first.length && j < second.length) {\n    const start = Math.max(first[i][0], second[j][0]);\n    const end = Math.min(first[i][1], second[j][1]);\n    if (start <= end) result.push([start, end]);\n    if (first[i][1] < second[j][1]) i++;\n    else j++;\n  }\n  return result;\n}\n",
    tests: [
      {
        name: "the classic example",
        body: "assert.deepEqual(intervalIntersection([[0, 2], [5, 10], [13, 23], [24, 25]], [[1, 5], [8, 12], [15, 24], [25, 26]]), [[1, 2], [5, 5], [8, 10], [15, 23], [24, 24], [25, 25]]);",
      },
      { name: "either list empty", body: "assert.deepEqual(intervalIntersection([], [[1, 3]]), []);\nassert.deepEqual(intervalIntersection([[1, 3]], []), []);\nassert.deepEqual(intervalIntersection([], []), []);" },
      { name: "no overlap at all", body: "assert.deepEqual(intervalIntersection([[1, 2], [5, 6]], [[3, 4], [7, 8]]), []);" },
      { name: "one interval contains many", body: "assert.deepEqual(intervalIntersection([[1, 10]], [[2, 3], [5, 6], [8, 12]]), [[2, 3], [5, 6], [8, 10]]);" },
      { name: "touching at a single point", body: "assert.deepEqual(intervalIntersection([[1, 5]], [[5, 9]]), [[5, 5]]);" },
      { name: "identical lists", body: "assert.deepEqual(intervalIntersection([[1, 3], [6, 9]], [[1, 3], [6, 9]]), [[1, 3], [6, 9]]);" },
      { name: "one list is a single long interval", body: "assert.deepEqual(intervalIntersection([[0, 100]], [[10, 20], [30, 40]]), [[10, 20], [30, 40]]);" },
      { name: "a long input is linear", body: "const a = Array.from({ length: 50000 }, (_, i) => [i * 4, i * 4 + 2]);\nconst b = Array.from({ length: 50000 }, (_, i) => [i * 4 + 1, i * 4 + 3]);\nconst got = intervalIntersection(a, b);\nassert.equal(got.length, 50000);\nassert.deepEqual(got[0], [1, 2]);" },
    ],
  },
  {
    id: "ex-employee-free-time",
    chapter: "dsa-intervals",
    level: "intermediate",
    title: "Employee Free Time",
    brief:
      "<p><code>schedules</code> holds one list per employee, and each list holds that employee's busy intervals as <code>[start, end]</code> pairs, sorted and non-overlapping within the employee. Return the list of finite intervals during which <b>every</b> employee is free, in increasing order.</p><ul><li>Do not report time before the earliest start or after the latest end, since that time is unbounded</li><li>Two busy intervals that touch, such as <code>[1, 3]</code> and <code>[3, 5]</code>, leave no free time between them</li><li>Every interval has <code>start &lt; end</code></li><li>If nobody is ever busy, return <code>[]</code></li></ul>",
    starter:
      "function employeeFreeTime(schedules) {\n  // TODO: merge all the busy intervals and read off the gaps\n}\n",
    hints: [
      "Everyone is free exactly when nobody is busy, so you can forget which employee owns which interval.",
      "Flatten the lists into one and sort by start. Keep the latest end seen so far.",
      "When the next interval starts after that latest end, the stretch in between is free: record it. Then update the latest end with Math.max, not by assignment.",
    ],
    solution:
      "function employeeFreeTime(schedules) {\n  const all = schedules.flat().sort((a, b) => a[0] - b[0]);\n  const free = [];\n  if (all.length === 0) return free;\n  let busyUntil = all[0][1];\n  for (let i = 1; i < all.length; i++) {\n    const [start, end] = all[i];\n    if (start > busyUntil) free.push([busyUntil, start]);\n    busyUntil = Math.max(busyUntil, end);\n  }\n  return free;\n}\n",
    tests: [
      { name: "one gap shared by everyone", body: "assert.deepEqual(employeeFreeTime([[[1, 2], [5, 6]], [[1, 3]], [[4, 10]]]), [[3, 4]]);" },
      { name: "several gaps", body: "assert.deepEqual(employeeFreeTime([[[1, 3], [6, 7]], [[2, 4]], [[2, 5], [9, 12]]]), [[5, 6], [7, 9]]);" },
      { name: "no free time", body: "assert.deepEqual(employeeFreeTime([[[1, 5]], [[5, 9]], [[2, 7]]]), []);" },
      { name: "nobody is ever busy", body: "assert.deepEqual(employeeFreeTime([[], []]), []);\nassert.deepEqual(employeeFreeTime([]), []);" },
      { name: "a short interval inside a long one does not open a gap", body: "assert.deepEqual(employeeFreeTime([[[1, 10]], [[3, 4], [11, 12]]]), [[10, 11]]);" },
      { name: "a single employee", body: "assert.deepEqual(employeeFreeTime([[[1, 2], [4, 5], [8, 9]]]), [[2, 4], [5, 8]]);" },
      { name: "touching intervals leave no gap", body: "assert.deepEqual(employeeFreeTime([[[1, 3]], [[3, 5]]]), []);" },
      { name: "the input is not changed", body: "const input = [[[4, 5]], [[1, 2]]];\nemployeeFreeTime(input);\nassert.deepEqual(input, [[[4, 5]], [[1, 2]]]);" },
    ],
  },
  {
    id: "ex-corporate-flight-bookings",
    chapter: "dsa-intervals",
    level: "intermediate",
    title: "Corporate Flight Bookings",
    brief:
      "<p>There are <code>n</code> flights numbered <code>1</code> to <code>n</code>. <code>bookings[i] = [first, last, seats]</code> reserves <code>seats</code> seats on every flight from <code>first</code> to <code>last</code>, both ends included.</p><p>Return an array <code>answer</code> of length <code>n</code> where <code>answer[i]</code> is the total number of seats reserved on flight <code>i + 1</code>.</p><ul><li>Do not add to every flight in a range one by one: use a difference array</li><li>No bookings means an array of <code>n</code> zeros</li><li>Target complexity: O(n + bookings.length)</li></ul>",
    starter:
      "function corpFlightBookings(bookings, n) {\n  // TODO: record the change at first and last + 1, then take a running sum\n}\n",
    hints: [
      "Instead of adding seats to every flight in the range, record only where the total steps up and where it steps back down.",
      "Add seats at index first, and subtract seats at index last + 1. Give the array n + 2 slots so last + 1 is always in range.",
      "A running sum over the array, from flight 1 to flight n, turns the steps into the totals.",
    ],
    solution:
      "function corpFlightBookings(bookings, n) {\n  const diff = new Array(n + 2).fill(0);\n  for (const [first, last, seats] of bookings) {\n    diff[first] += seats;\n    diff[last + 1] -= seats;\n  }\n  const answer = [];\n  let running = 0;\n  for (let flight = 1; flight <= n; flight++) {\n    running += diff[flight];\n    answer.push(running);\n  }\n  return answer;\n}\n",
    tests: [
      { name: "overlapping bookings", body: "assert.deepEqual(corpFlightBookings([[1, 2, 10], [2, 3, 20], [2, 5, 25]], 5), [10, 55, 45, 25, 25]);" },
      { name: "a booking on one flight", body: "assert.deepEqual(corpFlightBookings([[1, 1, 7]], 1), [7]);" },
      { name: "no bookings", body: "assert.deepEqual(corpFlightBookings([], 4), [0, 0, 0, 0]);" },
      { name: "a booking that ends on the last flight", body: "assert.deepEqual(corpFlightBookings([[3, 4, 5]], 4), [0, 0, 5, 5]);" },
      { name: "a booking that covers every flight", body: "assert.deepEqual(corpFlightBookings([[1, 3, 2]], 3), [2, 2, 2]);" },
      { name: "two bookings that meet but do not overlap", body: "assert.deepEqual(corpFlightBookings([[1, 2, 4], [3, 4, 6]], 4), [4, 4, 6, 6]);" },
      { name: "a large input is linear", body: "const n = 200000;\nconst bookings = Array.from({ length: n }, (_, i) => [1, i + 1, 1]);\nconst answer = corpFlightBookings(bookings, n);\nassert.equal(answer[0], n);\nassert.equal(answer[n - 1], 1);" },
    ],
  },
  {
    id: "ex-my-calendar-i",
    chapter: "dsa-intervals",
    level: "intermediate",
    title: "My Calendar I",
    brief:
      "<p>A calendar accepts bookings <code>[start, end)</code>, which include <code>start</code> and exclude <code>end</code>. A booking is accepted only if it does not overlap any booking accepted earlier. Two bookings that only meet at an endpoint, like <code>[10, 20)</code> and <code>[20, 30)</code>, do not overlap.</p><p>Write <code>myCalendarBookings(bookings)</code>. It receives the requested <code>[start, end]</code> pairs in order, and returns an array of booleans: <code>true</code> for each booking that is accepted and <code>false</code> for each that is refused.</p><ul><li>A refused booking is not stored</li><li>An empty list returns <code>[]</code></li></ul>",
    starter:
      "function myCalendarBookings(bookings) {\n  // TODO: keep the accepted bookings; accept a new one only if it overlaps none of them\n}\n",
    hints: [
      "Keep a list of the accepted bookings. For each request, check it against every one of them.",
      "Two half-open ranges [s, e) and [start, end) overlap exactly when each one starts before the other ends.",
      "So a request clashes with an accepted booking when start < e && s < end. If it clashes with none, accept and store it.",
    ],
    solution:
      "function myCalendarBookings(bookings) {\n  const booked = [];\n  const results = [];\n  for (const [start, end] of bookings) {\n    const clash = booked.some(([s, e]) => start < e && s < end);\n    results.push(!clash);\n    if (!clash) booked.push([start, end]);\n  }\n  return results;\n}\n",
    tests: [
      { name: "the classic sequence", body: "assert.deepEqual(myCalendarBookings([[10, 20], [15, 25], [20, 30]]), [true, false, true]);" },
      { name: "an empty list", body: "assert.deepEqual(myCalendarBookings([]), []);" },
      { name: "a booking inside an earlier one", body: "assert.deepEqual(myCalendarBookings([[10, 30], [15, 20]]), [true, false]);" },
      { name: "a booking that surrounds an earlier one", body: "assert.deepEqual(myCalendarBookings([[15, 20], [10, 30]]), [true, false]);" },
      { name: "an identical booking is refused", body: "assert.deepEqual(myCalendarBookings([[5, 10], [5, 10]]), [true, false]);" },
      { name: "a refused booking is not stored", body: "assert.deepEqual(myCalendarBookings([[10, 20], [15, 40], [30, 40]]), [true, false, true]);" },
      { name: "bookings that meet at endpoints", body: "assert.deepEqual(myCalendarBookings([[10, 20], [0, 10], [20, 30]]), [true, true, true]);" },
      { name: "many bookings in order", body: "const requests = Array.from({ length: 1000 }, (_, i) => [i * 2, i * 2 + 2]);\nconst out = myCalendarBookings(requests);\nassert.equal(out.every(Boolean), true);\nassert.equal(out.length, 1000);" },
    ],
  },
];
