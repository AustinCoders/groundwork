export const code: Record<string, string> = {
  "two-pointers-opposite-ends": `<span class="c"># Two Sum on a SORTED array — O(n) time, O(1) space</span>
def two_sum_sorted(nums, target):
    left, right = 0, len(nums) - 1
    while left &lt; right:
        total = nums[left] + nums[right]
        if total == target:
            return [left, right]
        if total &lt; target:
            left += 1   <span class="c"># need bigger → drop the smaller end</span>
        else:
            right -= 1  <span class="c"># need smaller → drop the bigger end</span>
    return [-1, -1]`,
};
