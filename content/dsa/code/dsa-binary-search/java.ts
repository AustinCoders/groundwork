export const code: Record<string, string> = {
  "binary-search-classic": `static int binarySearch(int[] sorted, int target) {
    int lo = 0, hi = sorted.length - 1;
    while (lo &lt;= hi) {              <span class="c">// note: &lt;=, not &lt;</span>
        int mid = lo + (hi - lo) / 2; <span class="c">// avoids overflow, unlike (lo + hi) / 2</span>
        if (sorted[mid] == target) return mid;
        if (sorted[mid] &lt; target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1; <span class="c">// not found</span>
}`,
  "answer-search-bananas": `<span class="c">// minimum "speed" to eat all bananas within h hours — classic answer-space search</span>
static long hoursNeeded(int[] piles, int speed) {
    long hours = 0;
    for (int pile : piles) hours += (pile + speed - 1L) / speed;
    return hours;
}

static int minEatingSpeed(int[] piles, int h) {
    int lo = 1, hi = 0;
    for (int pile : piles) hi = Math.max(hi, pile);
    while (lo &lt; hi) {
        int mid = lo + (hi - lo) / 2;
        if (hoursNeeded(piles, mid) &lt;= h) hi = mid;   <span class="c">// mid works — answer could be smaller</span>
        else lo = mid + 1;                            <span class="c">// mid too slow — need bigger speed</span>
    }
    return lo;
}`,
  "lower-bound": `<span class="c">// leftmost index where nums[i] &gt;= target — the building block for
   // "find first occurrence" and most boundary-search variants</span>
static int lowerBound(int[] nums, int target) {
    int lo = 0, hi = nums.length; <span class="c">// note: hi = length, not length-1, here</span>
    while (lo &lt; hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] &lt; target) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}`,
};
