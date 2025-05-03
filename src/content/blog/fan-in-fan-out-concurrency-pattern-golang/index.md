---
title: 'Fan-in Fan-out Concurrency Pattern in Go: Visual Guide'
date: 2025-01-05T00:00:00+05:30
draft: false
tags: ['golang', 'concurrency', 'goroutines', 'design pattern', 'channels']
description: "Learn Golang's fan-in fan-out concurrency pattern with visual explanations and real-world examples"
image: './cover.png'
---

In our previous post, we explored the [Pipeline concurrency pattern](/blog/pipeline-concurrency-pattern-golang), the building blocks of **Fan-In** & **Fan-Out** concurrency patterns.

In this post we'll cover **Fan-in & Fan-out Pattern** and will try to visualize them. So let's gear up as we'll be hands on through out the process.

![gear up](https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDh2ZXlydW1leXF3b2NxYXl1ZnZhcXgyZ3NhdGgyYTN2Nnd2ZmxucyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/npWrkuZObVAZ5Gp4m2/giphy.gif)

## Evolution from Pipeline Pattern

The fan-in fan-out pattern is a natural evolution of the pipeline pattern. While a pipeline processes data sequentially through stages, fan-in fan-out introduces parallel processing capabilities. Let's visualize how this evolution happens:

![evolution of pipeline concurrency pattern to fan in & fan out concurrency pattern](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/hhdyhvbsthbmxg3wuep9.png)

## Fan-In Fan-Out Pattern

Imagine a restaurant kitchen during busy hours. When orders come in, multiple cooks work on different dishes simultaneously (fan-out). As they complete dishes, they come together at the service counter (fan-in).

![Fan in Fan out concurrency pattern visualized](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/tqlipbk5pqwhqp4m6n1g.png)

### Understanding Fan-out

Fan-out is distributing work across multiple goroutines to process data in parallel. Think of it as splitting a big task into smaller pieces that can be worked on simultaneously. Here's a simple example:

```go
func fanOut(input <-chan int, workers int) []<-chan int {
    // Create a slice to hold our output channels
    outputs := make([]<-chan int, workers)

    for i := 0; i < workers; i++ {
        // Each worker gets its own output channel
        outputs[i] = worker(input)
    }

    return outputs
}

func worker(input <-chan int) <-chan int {
    output := make(chan int)

    go func() {
        defer close(output)
        // Each worker reads from the same input channel
        for num := range input {
            // Simulate work with complex computation
            result := complexComputation(num)
            output <- result
        }
    }()

    return output
}

func complexComputation(n int) int {
    time.Sleep(100 * time.Millisecond) // Simulate work
    return n * n
}
```

### Understanding Fan-in

Fan-in is the opposite of fan-out - it combines multiple input channels into a single channel. It's like a funnel that collects results from all workers into one stream. Here's how we implement it:

```go
func fanIn(inputs ...<-chan int) <-chan int {
    // Create a channel to combine all results
    output := make(chan int)
    var wg sync.WaitGroup

    // Start a goroutine for each input channel
    for _, input := range inputs {
        wg.Add(1)
        // Create closure to capture current input channel
        go func(ch <-chan int) {
            defer wg.Done()
            // Forward all values from this channel to output
            for val := range ch {
                output <- val
            }
        }(input)
    }

    // Close output channel when all input channels are done
    go func() {
        wg.Wait()
        close(output)
    }()

    return output
}
```

Let's put it all together with a complete example that processes numbers in parallel:

```go
func main() {
    // Create our input channel
    input := make(chan int)

    // Start sending numbers
    go func() {
        defer close(input)
        for i := 1; i <= 10; i++ {
            input <- i
        }
    }()

    // Fan-out to 3 workers
    workers := fanOut(input, 3)

    // Fan-in the results
    results := fanIn(workers...)

    // Collect and print results
    for result := range results {
        fmt.Printf("Got result: %d\n", result)
    }
}
```

## Why Use Fan-in Fan-out Pattern?

**Optimal Resource Utilization**

The pattern naturally distributes work across available resources, this prevents idle resources,maximizing throughput.

```go
// Worker pool size adapts to system resources
numWorkers := runtime.NumCPU()
if numWorkers > maxWorkers {
    numWorkers = maxWorkers // Prevent over-allocation
}
```

**Improved Performance Through Parallelization**

- In the sequential approach, tasks are processed one after another, creating a linear execution time. If each task takes 1 second, processing 4 tasks takes 4 seconds.
- This parallel processing reduces total execution time to approximately (total tasks / number of workers) + overhead. In our example, with 4 workers, we process all tasks in about 1.2 seconds instead of 4 seconds.

```go
func fanOut(tasks []Task) {
    numWorkers := runtime.NumCPU() // Utilize all available CPU cores
    workers := make([]<-chan Result, numWorkers)

    for i := 0; i < numWorkers; i++ {
        workers[i] = processTask(tasks[i::numWorkers]) // Each worker takes a subset of tasks
    }
    // ... fan-in code ...
}
```

## Real-World Use Cases

**Image Processing Pipeline**

It's like a upgrade from our pipeline pattern post, we need to process faster and have dedicated go routines from each process:

![image processing pipeline with fan in and fan out pattern](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/yvyqyxbgd6ndrraoe6rb.png)

**Web Scraper Pipeline**
Web scraping is another perfect use case for fan-in fan-out.

![Web scraping is another perfect use case for fan-in fan-out](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/6eyorysca17qjdyqidtn.png)

The fan-in fan-out pattern really shines in these scenarios because it:

- Manages concurrency automatically through Go's channel mechanics
- Provides natural backpressure when processing is slower than ingestion
- Allows for easy scaling by adjusting the number of workers
- Keeps the system resilient through isolated error handling

## Error Handling Principles

### Fail Fast: Detect and handle errors early in the pipeline

Try to perform all sort of validations before or at the start of the pipeline to make sure it doesn't fail down the line as it prevents wasting resources on invalid work that would fail later. It's especially crucial in fan-in fan-out patterns because invalid data could block workers or waste parallel processing capacity.

However it's not a hard rule and heavily depends on the business logic. Here is how we can implement it in out real-world examples:

```go
func imageProcessor(tasks <-chan ImageTask) <-chan ProcessedImage {
    results := make(chan ProcessedImage)
    go func() {
        defer close(results)
        for task := range tasks {
            // Validate early before processing
            if err := validateImage(task); err != nil {
                results <- ProcessedImage{
                    ID:    task.ID,
                    Error: fmt.Errorf("validation failed: %w", err),
                }
                continue
            }
            // Process if validation passes
            processImage(task)
        }
    }()
    return results
}
```

and

```go
// Web Scraping Example
func scrapeWorker(task ScrapeTask) (*ScrapedData, error) {
    // Validate URL before making request
    if _, err := url.Parse(task.URL); err != nil {
        return nil, fmt.Errorf("invalid URL format: %w", err)
    }
    // Continue with scraping if URL is valid
    return performScrape(task)
}
```

Notice! error in one worker the other do not stop, they keep processing and that brings us to 2nd principle

### Isolate Failures: One worker's error shouldn't affect others

In a parallel processing system, one bad task shouldn't bring down the entire system. Each worker should be independent.

```go
// Image Processing Example
func fanOutImageProcessing(tasks []ImageTask) {
    workers := make([]<-chan ProcessedImage, numWorkers)
    for i := 0; i < numWorkers; i++ {
        workers[i] = func(id int) <-chan ProcessedImage {
            results := make(chan ProcessedImage)
            go func() {
                defer close(results)
                for task := range tasks {
                    result := ProcessedImage{ID: task.ID}
                    // Error in one worker doesn't affect others
                    if processedData, err := safeProcess(task); err != nil {
                        result.Error = err
                    } else {
                        result.Data = processedData
                    }
                    results <- result
                }
            }()
            return results
        }(i)
    }
}

// Web Scraping Example
func scrapeWorkerPool(urls []string) {
    errorChan := make(chan error, len(urls)) // Separate channel for errors
    for i := 0; i < numWorkers; i++ {
        go func() {
            for url := range urls {
                if err := scrape(url); err != nil {
                    errorChan <- err
                    // Continue processing other URLs
                    continue
                }
            }
        }()
    }
}
```

### Resource Cleanup: Proper cleanup on errors

Resource leaks in parallel processing can quickly escalate into system-wide issues. Proper cleanup is essential.

---

That wraps up our deep dive into the Fan-In & Fan-Out pattern! Coming up next, we'll explore the **Worker Pools concurrency pattern**, which we got a glimpse of in this post. Like I said we are moving progressively clearing up dependencies before moving to the next one.

If you found this post helpful, have any questions, or want to share your own experiences with this pattern - I'd love to hear from you in the comments below. Your insights and questions help make these explanations even better for everyone.

If you missed the post on [visual guide to golang's goroutines and channels](/blog/understanding-goroutines-and-channels-golang) then check it out :)

Stay tuned for more Go concurrency patterns! 🚀

![adios](https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExdWpvNXA4MnVpeHdlYXlnb3Y3cHN1czFlbDN4ZTJsanJnNGEwdHllYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ZBVhKIDgts1eHYdT7u/giphy.gif)
