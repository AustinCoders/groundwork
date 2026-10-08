export const code: Record<string, string> = {
  "binary-search-classic": `def binary_search(sorted_nums, target):
    lo, hi = 0, len(sorted_nums) - 1
    while lo &lt;= hi:              <span class="c"># note: &lt;=, not &lt;</span>
        mid = lo + (hi - lo) // 2  <span class="c"># avoids overflow in fixed-width integer languages</span>
        if sorted_nums[mid] == target:
            return mid
        if sorted_nums[mid] &lt; target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1  <span class="c"># not found</span>`,
  "answer-search-bananas": `<span class="c"># minimum "speed" to eat all bananas within h hours — classic answer-space search</span>
def min_eating_speed(piles, h):
    def hours_needed(speed):
        hours = 0
        for pile in piles:
            hours += (pile + speed - 1) // speed
        return hours

    lo, hi = 1, max(piles)
    while lo &lt; hi:
        mid = lo + (hi - lo) // 2
        if hours_needed(mid) &lt;= h:
            hi = mid   <span class="c"># mid works — answer could be smaller</span>
        else:
            lo = mid + 1   <span class="c"># mid too slow — need bigger speed</span>
    return lo`,
  "lower-bound": `<span class="c"># leftmost index where nums[i] &gt;= target — the building block for
# "find first occurrence" and most boundary-search variants</span>
def lower_bound(nums, target):
    lo, hi = 0, len(nums)  <span class="c"># note: hi = length, not length-1, here</span>
    while lo &lt; hi:
        mid = lo + (hi - lo) // 2
        if nums[mid] &lt; target:
            lo = mid + 1
        else:
            hi = mid
    return lo`,
};
