---
title: 'Mastering the Generator Concurrency Pattern in Golang'
date: 2024-12-25T05:30:47+05:30
draft: false
tags: ['golang', 'concurrency', 'goroutines', 'channels', 'design pattern']
description: 'Learn about Generator Concurrency Pattern in Go through practical examples and clear explanations.'
image: './cover.png'
---

In our previous post, we explored and visualized the [basics of goroutines and channels](/blog/understanding-goroutines-and-channels-in-golang/), the building blocks of Go's concurrency.
Now, let's look at how these primitives combine to form powerful patterns that solve real-world problems.

In this post we'll cover **Generator Pattern** and will try to visualize them. So let's gear up as we'll be hands on through out the process.

![gear up](https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDh2ZXlydW1leXF3b2NxYXl1ZnZhcXgyZ3NhdGgyYTN2Nnd2ZmxucyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/npWrkuZObVAZ5Gp4m2/giphy.gif)

## Generator Pattern

> A generator is like a fountain that continuously produces values that we can consume whenever needed.

In Go, it's a function that produces a stream of values and sends them through a channel, allowing other parts of our program to receive these values on demand.

![golang generator pattern](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/2iec1c5wzc08l2d42sge.png)

Let's look at an example:

```go
// generateNumbers creates a generator that produces numbers from 1 to max
func generateNumbers(max int) chan int {
    // Create a channel to send numbers
    out := make(chan int)

    // Launch a goroutine to generate numbers
    go func() {
        // Important: Always close the channel when done
        defer close(out)

        for i := 1; i <= max; i++ {
            out <- i  // Send number to channel
        }
    }()

    // Return channel immediately
    return out
}

// Using the generator
func main() {
    // Create a generator that produces numbers 1-5
    numbers := generateNumbers(5)

    // Receive values from the generator
    for num := range numbers {
        fmt.Println("Received:", num)
    }
}
```

In this example, our generator function does three key things:

1. Creates a channel to send values
2. Launches a goroutine to generate values
3. Returns the channel immediately for consumers to use

### Why Use Generators?

1. Separate value production from consumption
2. Generate values on-demand (lazy evaluation)
3. Can represent infinite sequences without consuming infinite memory
4. Allow concurrent production and consumption of values

### Real-world Use Case

Reading large files line by line:

```go
func generateLines(filename string) chan string {
    out := make(chan string)
    go func() {
        defer close(out)
        file, err := os.Open(filename)
        if err != nil {
            return
        }
        defer file.Close()

        scanner := bufio.NewScanner(file)
        for scanner.Scan() {
            out <- scanner.Text()
        }
    }()
    return out
}
```

You must be thinking, what sets this apart? We can generate sequence of data as well as read it line by line without goroutines. Let's try to visualize both cases:

**Without the goroutines**

```go
// Traditional approach
func getNumbers(max int) []int {
    numbers := make([]int, max)
    for i := 1; i <= max; i++ {
        numbers[i-1] = i
        // Imagine some heavy computation here
        time.Sleep(100 * time.Millisecond)
    }
    return numbers
}
```

Here you have to wait for everything to be ready before you can start processing.

**With goroutines**

```go
// Generator approach
func generateNumbers(max int) chan int {
    out := make(chan int)
    go func() {
        defer close(out)
        for i := 1; i <= max; i++ {
            out <- i
            // Same heavy computation
            time.Sleep(100 * time.Millisecond)
        }
    }()
    return out
}
```

You can start processing the data while the data is still being generated.

![Generator pattern golang vs regular pattern](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/7ddiww4yazjyckzq1cjl.png)

### Key Benefits of Generator Pattern:

1. **Non-Blocking Execution**: Generation and processing happen simultaneously

2. **Memory Efficiency**: Can generate and process one value at a time, no need to store in the memory right away

3. **Infinite Sequences**: Can generate infinite sequences without memory issues

4. **Backpressure Handling**: If your consumer is slow, the generator naturally slows down (due to channel blocking), preventing memory overload.

```go
// Generator naturally handles slow consumers (backpressure handling)
for line := range generateLines(bigFile) {
    // Take our time processing each line
    // Generator won't overwhelm us with data
    processSlowly(line)
}
```

### Common Pitfalls and Solutions

1. Forgetting to Close Channels

```go
// Wrong ❌
func badGenerator() chan int {
    out := make(chan int)
    go func() {
        for i := 1; i <= 5; i++ {
            out <- i
        }
        // Channel never closed!
    }()
    return out
}

// Right ✅
func goodGenerator() chan int {
    out := make(chan int)
    go func() {
        defer close(out)  // Always close when done
        for i := 1; i <= 5; i++ {
            out <- i
        }
    }()
    return out
}
```

2. Not Handling Errors

```go
// Better approach with error handling
func generateWithErrors() (chan int, chan error) {
    out := make(chan int)
    errc := make(chan error, 1)  // Buffered channel for error

    go func() {
        defer close(out)
        defer close(errc)
        for i := 1; i <= 5; i++ {
            if i == 3 {
                errc <- fmt.Errorf("Something went wrong at %d", i)
                return
            }
            out <- i
        }
    }()
    return out, errc
}

// Using the generator with error handling
numbers, errs := generateWithErrors()
for {
    select {
    case num, ok := <-numbers:
        if !ok {
            numbers = nil // Channel closed
        } else {
            fmt.Println("Received:", num)
        }
    case err, ok := <-errs:
        if !ok {
            errs = nil // Error channel closed
        } else {
            fmt.Println("Error:", err)
            // Optionally stop consuming numbers
            return
        }
    }
    // Exit loop when both channels are closed
    if numbers == nil && errs == nil {
        break
    }
}
```

Next we'll look at **pipeline** concurrency pattern
