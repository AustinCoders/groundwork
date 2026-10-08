export const code: Record<string, string> = {
  "two-pointers-opposite-ends": `<span class="c">// Two Sum on a SORTED array — O(n) time, O(1) space</span>
static int[] twoSumSorted(int[] nums, int target) {
    int left = 0, right = nums.length - 1;
    while (left &lt; right) {
        long sum = (long) nums[left] + nums[right];
        if (sum == target) return new int[] {left, right};
        if (sum &lt; target) left++;   <span class="c">// need bigger → drop the smaller end</span>
        else right--;               <span class="c">// need smaller → drop the bigger end</span>
    }
    return new int[] {-1, -1};
}`,
};
