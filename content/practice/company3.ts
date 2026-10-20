import type { Exercise } from "../types";

export const company3: Exercise[] = [
  {
    "id": "ex-marathon-energy-drinks",
    "chapter": "dsa-heaps-priority-queues",
    "level": "advanced",
    "title": "Fewest Energy Drinks to Finish a Marathon",
    "brief": "<p>A runner starts with <code>reserve</code> calories of energy and burns <code>perMile</code> calories per mile. Each checkpoint holds one drink worth a known number of calories. <code>gaps</code> lists the miles from the start to the first checkpoint, between consecutive checkpoints, and from the last checkpoint to the finish, so it has one more entry than <code>drinks</code>.</p><p>The runner can take a drink only at a checkpoint already passed, takes the whole drink, and must not run out of energy before reaching the next point. Arriving with exactly zero is fine. Return the fewest drinks that reach the finish, or <code>-1</code> if it cannot be done.</p><ul><li>With reserve 10, perMile 1, gaps [10,10,10,30,40] and drinks [60,30,30,40] the answer is 2</li><li>Up to 100,000 checkpoints, so aim for O(n log n)</li><li>A <code>MaxHeap</code> class with <code>push</code>, <code>pop</code> and <code>size</code> is already written for you</li></ul>",
    "starter": "class MaxHeap {\n  constructor() {\n    this.items = [];\n  }\n\n  get size() {\n    return this.items.length;\n  }\n\n  push(value) {\n    const items = this.items;\n    items.push(value);\n    let child = items.length - 1;\n    while (child > 0) {\n      const parent = (child - 1) >> 1;\n      if (items[parent] >= items[child]) break;\n      [items[parent], items[child]] = [items[child], items[parent]];\n      child = parent;\n    }\n  }\n\n  pop() {\n    const items = this.items;\n    const top = items[0];\n    const last = items.pop();\n    if (items.length > 0) {\n      items[0] = last;\n      let parent = 0;\n      for (;;) {\n        const left = 2 * parent + 1;\n        const right = left + 1;\n        let largest = parent;\n        if (left < items.length && items[left] > items[largest]) largest = left;\n        if (right < items.length && items[right] > items[largest]) largest = right;\n        if (largest === parent) break;\n        [items[parent], items[largest]] = [items[largest], items[parent]];\n        parent = largest;\n      }\n    }\n    return top;\n  }\n}\n\nfunction fewestDrinks(reserve, perMile, gaps, drinks) {\n  return null;\n}\n",
    "hints": [
      "Trying every subset of checkpoints to drink at works but costs 2 to the power n. Notice that you do not have to decide at a checkpoint: a drink matters only when you would otherwise run out of energy before the next point.",
      "The pattern is greedy with a max-heap. Walk the legs in order, pushing each drink into the heap once you have passed its checkpoint. When the energy in hand is less than a leg's burn, pop the largest drink and add it, counting one, until the leg is covered.",
      "If the heap is empty while you are still short, return -1. Stall only when energy is strictly less than the burn, since arriving with exactly zero is allowed, and remember the last leg from the final checkpoint to the finish."
    ],
    "solution": "class MaxHeap {\n  constructor() {\n    this.items = [];\n  }\n\n  get size() {\n    return this.items.length;\n  }\n\n  push(value) {\n    const items = this.items;\n    items.push(value);\n    let child = items.length - 1;\n    while (child > 0) {\n      const parent = (child - 1) >> 1;\n      if (items[parent] >= items[child]) break;\n      [items[parent], items[child]] = [items[child], items[parent]];\n      child = parent;\n    }\n  }\n\n  pop() {\n    const items = this.items;\n    const top = items[0];\n    const last = items.pop();\n    if (items.length > 0) {\n      items[0] = last;\n      let parent = 0;\n      for (;;) {\n        const left = 2 * parent + 1;\n        const right = left + 1;\n        let largest = parent;\n        if (left < items.length && items[left] > items[largest]) largest = left;\n        if (right < items.length && items[right] > items[largest]) largest = right;\n        if (largest === parent) break;\n        [items[parent], items[largest]] = [items[largest], items[parent]];\n        parent = largest;\n      }\n    }\n    return top;\n  }\n}\n\nfunction fewestDrinks(reserve, perMile, gaps, drinks) {\n  const passed = new MaxHeap();\n  let energy = reserve;\n  let taken = 0;\n  for (let leg = 0; leg < gaps.length; leg++) {\n    const burn = gaps[leg] * perMile;\n    while (energy < burn) {\n      if (passed.size === 0) return -1;\n      energy += passed.pop();\n      taken++;\n    }\n    energy -= burn;\n    if (leg < drinks.length) passed.push(drinks[leg]);\n  }\n  return taken;\n}\n",
    "tests": [
      {
        "name": "the example from the brief",
        "body": "assert.deepEqual(fewestDrinks(10, 1, [10,10,10,30,40], [60,30,30,40]), 2);"
      },
      {
        "name": "the reserve already covers the course",
        "body": "assert.deepEqual(fewestDrinks(100, 1, [50,50], [10]), 0);"
      },
      {
        "name": "no checkpoints and not enough reserve",
        "body": "assert.deepEqual(fewestDrinks(1, 1, [10], []), -1);"
      },
      {
        "name": "arriving at the finish with exactly zero",
        "body": "assert.deepEqual(fewestDrinks(10, 1, [10], []), 0);"
      },
      {
        "name": "every checkpoint is needed",
        "body": "assert.deepEqual(fewestDrinks(1, 1, [1,1,1,1], [1,1,1]), 3);"
      },
      {
        "name": "the drinks run out before the finish",
        "body": "assert.deepEqual(fewestDrinks(10, 1, [5,20], [5]), -1);"
      },
      {
        "name": "a late big drink beats an early small one",
        "body": "assert.deepEqual(fewestDrinks(3, 1, [3,2,10], [2,100]), 2);"
      },
      {
        "name": "a drink worth nothing cannot help",
        "body": "assert.deepEqual(fewestDrinks(5, 1, [5,5], [0]), -1);"
      },
      {
        "name": "a faster burn rate needs both drinks",
        "body": "assert.deepEqual(fewestDrinks(10, 2, [5,5,5], [10,50]), 2);"
      },
      {
        "name": "nothing burns",
        "body": "assert.deepEqual(fewestDrinks(0, 0, [5,5], [1]), 0);"
      },
      {
        "name": "the biggest passed drink wins over the oldest or the smallest",
        "body": "assert.deepEqual(fewestDrinks(3, 1, [1,2,4], [1,4]), 1);"
      },
      {
        "name": "the biggest passed drink can also be the oldest",
        "body": "assert.deepEqual(fewestDrinks(3, 1, [2,1,4], [4,3]), 1);"
      },
      {
        "name": "one long leg can need several drinks",
        "body": "assert.deepEqual(fewestDrinks(4, 1, [1,3,3], [2,1]), 2);"
      }
    ]
  },
];
