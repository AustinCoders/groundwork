export const code: Record<string, string> = {
  "binary-search-classic": `#include &lt;vector&gt;

int binarySearch(const std::vector&lt;int&gt;&amp; sorted, int target) {
    int lo = 0, hi = (int)sorted.size() - 1;
    while (lo &lt;= hi) {              <span class="c">// note: &lt;=, not &lt;</span>
        int mid = lo + (hi - lo) / 2; <span class="c">// avoids overflow, unlike (lo + hi) / 2</span>
        if (sorted[mid] == target) return mid;
        if (sorted[mid] &lt; target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1; <span class="c">// not found</span>
}`,
  "answer-search-bananas": `#include &lt;algorithm&gt;
#include &lt;vector&gt;

<span class="c">// minimum "speed" to eat all bananas within h hours — classic answer-space search</span>
int minEatingSpeed(const std::vector&lt;int&gt;&amp; piles, int h) {
    auto hoursNeeded = [&amp;](int speed) {
        long long hours = 0;
        for (int pile : piles) hours += (pile + speed - 1LL) / speed;
        return hours;
    };

    int lo = 1, hi = *std::max_element(piles.begin(), piles.end());
    while (lo &lt; hi) {
        int mid = lo + (hi - lo) / 2;
        if (hoursNeeded(mid) &lt;= h) hi = mid;   <span class="c">// mid works — answer could be smaller</span>
        else lo = mid + 1;                     <span class="c">// mid too slow — need bigger speed</span>
    }
    return lo;
}`,
  "lower-bound": `#include &lt;vector&gt;

<span class="c">// leftmost index where nums[i] &gt;= target — the building block for
   // "find first occurrence" and most boundary-search variants</span>
int lowerBound(const std::vector&lt;int&gt;&amp; nums, int target) {
    int lo = 0, hi = (int)nums.size(); <span class="c">// note: hi = length, not length-1, here</span>
    while (lo &lt; hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] &lt; target) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}`,
};
