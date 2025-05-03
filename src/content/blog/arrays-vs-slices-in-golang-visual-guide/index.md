---
title: 'Arrays vs Slices in Golang: A Detailed Visual Guide'
date: 2024-12-16T05:30:47+05:30
draft: false
tags: ['golang', 'data structures', 'memory management']
description: 'Visually explore Go array & slice internals: memory layout, growth, semantics, performance.'
image: './cover.png'
---

![mickey packing bag huge](https://i.pinimg.com/originals/2c/e1/a3/2ce1a3d69cfd67f90e3bbb6108df7eb7.gif)

Have you ever tried packing for a trip without knowing how long you'll be there? That's precisely what happens when we store data in Go. Sometimes, like when packing for a weekend trip, we know exactly how many things we need to store; other times, such as, when packing for a trip where we say, "I'll return when I'm ready," we don't.

Let's take a deep dive into the world of Go arrays and slice internals through simple illustrations. We will look into:

1. Memory layouts
2. Growth mechanisms
3. Reference semantics
4. Performance implications

By the end of this read, you'll be able to understand when to use arrays versus when to use slices with the help of real world examples and memory diagrams

## Arrays: The Fixed-Size Container 📦

Think of an array as a single block of memory where each element sits next to each other, like a row of perfectly arranged boxes.

When you declare var numbers [5]int, Go reserves exactly enough contiguous memory to hold 5 integers, no more, no less.

![array memory layout in golang](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/n5uxcosto4hdmyz1x2t0.png)

Since they have contiguous fixed memory it can't be sized during runtime.

```go
func main() {
    // Zero-value initialization
    var nums [3]int    // Creates [0,0,0]

    // Fixed size
    nums[4] = 1       // Runtime panic: index out of range

    // Sized during compilation
    size := 5
    var dynamic [size]int  // Won't compile: non-constant array bound
}
```

![size is part of type in golang arrays](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/0ndfpyi2ewd0r7c53gqg.png)

**The size is part of the array's type**. This means `[5]int` and `[6]int` are completely different types, just like `int` and `string` are different.

```go
func main() {
    // Different types!
    var a [5]int
    var b [6]int

    // This won't compile
    a = b // compile error: cannot use b (type [6]int) as type [5]int

    // But this works
    var c [5]int
    a = c // Same types, allowed
}
```

### Why Array is Copy By Default?

When you assign or pass arrays in Go, they create copies by default. This ensures data isolation and prevents unexpected mutations.

![array pass by reference vs pass by value](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/lkpqkono3k13eerqjf1z.png)

```go
func modifyArrayCopy(arr [5]int) {
    arr[0] = 999    // Modifies the copy, not original
}

func modifyArray(arr *[5]int){
    arr[0] = 999  // Modifies the original, since reference is passed
}

func main() {
    numbers := [5]int{1, 2, 3, 4, 5}

    modifyArrayCopy(numbers)
    fmt.Println(numbers[0])  // prints 1, not 999

    modifyArray(&numbers)
    fmt.Println(numbers[0])  // prints 999
}
```

## Slices

Alright so you can't do `var dynamic [size]int` to set dynamic size, this is where **slice** comes into play.

### Slices under the hood

The magic lies in how it maintains this flexibility while keeping operations fast.

Every slice in Go consists of three critical components:

![slice memory layout and internal structure](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/eex0pq4hcuun5x64bqwc.png)

```go
type slice struct {
    array unsafe.Pointer // Points to the actual data
    len   int           // Current number of elements
    cap   int           // Total available space
}
```

**What's `unsafe.Pointer`??**

The `unsafe.Pointer` is Go's way of handling raw memory addresses without type safety constraints. It's **<u>"unsafe"</u>** because it bypasses Go's type system, allowing direct memory manipulation.

> Think of it as Go's equivalent to C's void pointer.

**What's that `array`?**

When you create a slice, Go allocates a contiguous block of memory in the heap (unlike arrays) called backing array. Now the `array` in slice struct points to the start of that memory block.

The `array` field uses `unsafe.Pointer` because:

1. It needs to point to raw memory without type information
2. It allows Go to implement slices for any type T without generating separate code for each type.

### The dynamic mechanism of slice

let's try developing intuition for the actual algorithm under the hood.

![intuition behind the dynamic mechanism of slice](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/2dbfx333dws7ft97cmll.png)

If we go by **intuition** we can do two things:

1. We could set aside space so large and can use it as and when required
   pros: Handles growing needs till a certain point
   cons: Memory wastage, practically might hit limit

2. We could set a random size initially and as the elements are appended we can reallocate the memory on each append
   pros: Handles the previous case, can grow as per the need
   cons: reallocation is expensive and on every append it's going to get worst

We cannot avoid the reallocation as when the capacity hits one needs to grow. We can minimize the reallocation so that the subsequent inserts/appends cost is constant (`O(1)`). This is called [amortized cost](https://dev.to/souvikinator/the-wardrobe-strategy-how-shopping-in-bulk-explains-amortized-cost-50o1).

**How can we go about it?**

till Go version **v1.17** following formula was being used:

```bash
// Old growth pattern
capacity = oldCapacity * 2  // Simple doubling
```

from Go version **v1.18**:

```bash
// New growth pattern
if capacity < 256 {
    capacity = capacity * 2
} else {
    capacity = capacity + capacity/4  // 25% growth
}
```

since doubling a large slice is waste of memory so as the slice size increases the growth factor is decreased.

### Let's get a better understanding from usage perspective

![visually showing slice append in golang](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/q09bp3tcoi1s2ko8uvd8.png)

```go
numbers := make([]int, 3, 5) // length=3 capacity

// Memory Layout after creation:
Slice Header:
{
    array: 0xc0000b2000    // Example memory address
    len:   3
    cap:   5
}

Backing Array at 0xc0000b2000:
[0|0|0|unused|unused]
```

let's add some elements to our slice

```go
numbers = append(numbers, 10)
```

Since we have capacity (5) > length (3), Go:

Uses existing backing array
Places 10 at index 3
Increases length by 1

```go
// Memory Layout after first append:
Slice Header:
{
    array: 0xc0000b2000    // Same memory address!
    len:   4               // Increased
    cap:   5               // Same
}

Backing Array at 0xc0000b2000:
[0|0|0|10|unused]
```

Let's hit the limit

```go
numbers = append(numbers, 20)  // Uses last slot
numbers = append(numbers, 30)  // Needs to grow!
```

When the capacity is reached (cap = 5, len = 5):

Go creates a new, larger backing array.
Copies elements from the old array.
Appends the new element (30).
Updates the slice header's array pointer, len, and cap.

```go
// Memory Layout after reallocation:
Slice Header:
{
    array: 0xc0000d4000    // New memory address!
    len:   6               // Increased
    cap:   10              // Doubled (assuming old cap was 5)
}

New Backing Array at 0xc0000d4000:
[0|0|0|10|20|30|unused|unused|unused|unused]
```

The old backing array becomes garbage and will be cleaned up by Go's garbage collector.

## Array vs Slice Performance

| **Operation**      | **Array**                             | **Slice**                                                                                   |
| ------------------ | ------------------------------------- | ------------------------------------------------------------------------------------------- |
| **Access (Read)**  | O(1) – Direct memory access           | O(1) – Direct memory access via pointer                                                     |
| **Access (Write)** | O(1) – Direct memory modification     | O(1) – Direct memory modification via pointer                                               |
| **Append**         | N/A (Fixed size)                      | O(1) amortized – Fast when capacity exists, O(n) during reallocation (copying elements)     |
| **Pass to Func**   | O(n) – Copies the entire array        | O(1) – Copies only the slice header (pointer, len, cap)                                     |
| **Memory**         | Stack allocated (usually), fixed size | Header on stack, Backing array on heap (usually), potentially larger than needed due to cap |

**Key Takeaways:**

- **Read/Write:** Both are extremely fast (O(1)).
- **Appending:** Slices are efficient on average (O(1) amortized), but reallocations can cause temporary performance hits (O(n)). Arrays can't append.
- **Function Calls:** Passing slices is much cheaper (O(1)) than passing arrays (O(n)) because only the small slice header is copied, not the entire underlying data.

## When to Choose Which?

**Use Arrays When:**

- **Fixed Size Known:** You know the exact number of elements at compile time.
- **Performance Critical:** You need guaranteed stack allocation and absolutely no overhead from pointer indirection or potential reallocations (though slice access is also O(1)).
- **Value Semantics Needed:** You want automatic copying when passing or assigning to ensure data isolation. Example: Representing fixed-size data like RGB colors ([3]uint8) or coordinates ([2]float64).

**Use Slices When:**

- **Dynamic Size:** The number of elements is unknown or changes during runtime. This is the most common case.
- **Function Parameters/Returns:** You want to pass collections efficiently without copying large amounts of data.
- **Working with Subsets:** You need to easily create views into parts of an array or another slice. Example: Processing lines from a file, handling user input, building web API responses.

**In short: Default to slices unless you have a specific reason to use an array.** Slices offer the flexibility needed for most programming tasks in Go.
