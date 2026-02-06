export interface SuggestedProblem {
  id: number;
  title: string;
  titleSlug: string;
  difficulty: 1 | 2 | 3;
  topic: string;
}

export const SUGGESTED_PROBLEMS: SuggestedProblem[] = [
  { id: 1, title: "Two Sum", titleSlug: "two-sum", difficulty: 1, topic: "Hash Map" },
  { id: 20, title: "Valid Parentheses", titleSlug: "valid-parentheses", difficulty: 1, topic: "Stack" },
  { id: 21, title: "Merge Two Sorted Lists", titleSlug: "merge-two-sorted-lists", difficulty: 1, topic: "Linked List" },
  { id: 121, title: "Best Time to Buy and Sell Stock", titleSlug: "best-time-to-buy-and-sell-stock", difficulty: 1, topic: "Greedy" },
  { id: 125, title: "Valid Palindrome", titleSlug: "valid-palindrome", difficulty: 1, topic: "Two Pointers" },
  { id: 206, title: "Reverse Linked List", titleSlug: "reverse-linked-list", difficulty: 1, topic: "Linked List" },
  { id: 217, title: "Contains Duplicate", titleSlug: "contains-duplicate", difficulty: 1, topic: "Array" },
  { id: 242, title: "Valid Anagram", titleSlug: "valid-anagram", difficulty: 1, topic: "Strings" },
  { id: 3, title: "Longest Substring Without Repeating Characters", titleSlug: "longest-substring-without-repeating-characters", difficulty: 2, topic: "Sliding Window" },
  { id: 49, title: "Group Anagrams", titleSlug: "group-anagrams", difficulty: 2, topic: "Hash Map" },
  { id: 53, title: "Maximum Subarray", titleSlug: "maximum-subarray", difficulty: 2, topic: "Dynamic Programming" },
  { id: 98, title: "Validate Binary Search Tree", titleSlug: "validate-binary-search-tree", difficulty: 2, topic: "Trees" },
  { id: 102, title: "Binary Tree Level Order Traversal", titleSlug: "binary-tree-level-order-traversal", difficulty: 2, topic: "BFS" },
  { id: 150, title: "Evaluate Reverse Polish Notation", titleSlug: "evaluate-reverse-polish-notation", difficulty: 2, topic: "Stack" },
  { id: 200, title: "Number of Islands", titleSlug: "number-of-islands", difficulty: 2, topic: "Graph" },
  { id: 238, title: "Product of Array Except Self", titleSlug: "product-of-array-except-self", difficulty: 2, topic: "Prefix/Suffix" },
  { id: 11, title: "Container With Most Water", titleSlug: "container-with-most-water", difficulty: 2, topic: "Two Pointers" },
  { id: 15, title: "3Sum", titleSlug: "3sum", difficulty: 2, topic: "Two Pointers" },
];
