export const code: Record<string, string> = {
  "two-pointers-opposite-ends": `#include &lt;vector&gt;

<span class="c">// Two Sum on a SORTED array — O(n) time, O(1) space</span>
std::vector&lt;int&gt; twoSumSorted(const std::vector&lt;int&gt;&amp; nums, int target) {
    int left = 0, right = (int)nums.size() - 1;
    while (left &lt; right) {
        long long sum = (long long)nums[left] + nums[right];
        if (sum == target) return {left, right};
        if (sum &lt; target) left++;   <span class="c">// need bigger → drop the smaller end</span>
        else right--;               <span class="c">// need smaller → drop the bigger end</span>
    }
    return {-1, -1};
}`,
};
