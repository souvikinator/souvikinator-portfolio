---
title: 'Understanding Golang Goroutines & Channels Visually'
date: 2024-12-20T05:30:47+05:30
draft: false
tags: ['golang', 'concurrency', 'goroutines', 'channels']
description: "Master Go's concurrency model through visual examples and hands-on"
image: './cover.png'
---

In this first installment of our **"Mastering Go Concurrency"** series, we'll discuss:

- The lifespan of goroutines and how they function
- Goroutines' channel communication Use cases for buffered channels Real-world illustrations and instances Beginning with the fundamentals,

- How goroutines work and their lifecycle
- Channel communication between goroutines
- Buffered channels and their use cases
- Practical examples and visualizations

Beginning with the fundamentals, we will gradually advance while cultivating our intuition for their efficient use.

It's going to be a bit long, rather very long so gear up.

![gear up](https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDh2ZXlydW1leXF3b2NxYXl1ZnZhcXgyZ3NhdGgyYTN2Nnd2ZmxucyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/npWrkuZObVAZ5Gp4m2/giphy.gif)

we'll be hands on through out the process

## Understanding Goroutines

Let's start with a simple program that downloads multiple files.

```go
package main

import (
	"fmt"
	"time"
)

func downloadFile(filename string) {
	fmt.Printf("Starting download: %s\n", filename)
	// Simulate file download with sleep
	time.Sleep(2 * time.Second)
	fmt.Printf("Finished download: %s\n", filename)
}

func main() {
	fmt.Println("Starting downloads...")

	startTime := time.Now()

	downloadFile("file1.txt")
	downloadFile("file2.txt")
	downloadFile("file3.txt")

	elapsedTime := time.Since(startTime)

	fmt.Printf("All downloads completed! Time elapsed: %s\n", elapsedTime)
}
```

![go routines execution](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/lil5qb8an87cdzpnhnl7.png)

The program takes 6 seconds total because each 2-second download must finish before the next one begins, the application takes a total of 6 seconds. Let's picture this:

![go routines execution](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/gvk264asppq57vghg61i.png)

We can lower this time, let's modify our program to use **go routines**:

> notice: `go` keyword before function call

```go
package main

import (
    "fmt"
    "time"
)

func downloadFile(filename string) {
    fmt.Printf("Starting download: %s\n", filename)
    // Simulate file download with sleep
    time.Sleep(2 * time.Second)
    fmt.Printf("Finished download: %s\n", filename)
}

func main() {
    fmt.Println("Starting downloads...")

    // Launch downloads concurrently
    go downloadFile("file1.txt")
    go downloadFile("file2.txt")
    go downloadFile("file3.txt")

    fmt.Println("All downloads completed!")
}
```

wait what? nothing got printed? Why?

![go routines execution](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/c3bi0jvp44nggljcf4ps.png)

Let's visualize this to understand what might be happening.

![go routines execution](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/60swv7otxq49wsandqcx.png)

from the above visualization, we understand that the main function exists before the goroutines are finished. One observation is that all goroutine's lifecycle is dependent on the main function.

> Note: `main` function in itself is a goroutine ;)

To fix this, we need a way to make the main goroutine wait for the other goroutines to complete. There are several ways to do this:

1. wait for few seconds (hacky way)
2. Using `WaitGroup` (proper way, next up)
3. Using **channels** (we'll cover this down below)

Let's **wait for few seconds** for the go routines to complete.

```go
package main

import (
	"fmt"
	"time"
)

func downloadFile(filename string) {
	fmt.Printf("Starting download: %s\n", filename)
	// Simulate file download with sleep
	time.Sleep(2 * time.Second)
	fmt.Printf("Finished download: %s\n", filename)
}

func main() {
	fmt.Println("Starting downloads...")

	startTime := time.Now() // Record start time

	go downloadFile("file1.txt")
	go downloadFile("file2.txt")
	go downloadFile("file3.txt")

	// Wait for goroutines to finish
	time.Sleep(3 * time.Second)

	elapsedTime := time.Since(startTime)

	fmt.Printf("All downloads completed! Time elapsed: %s\n", elapsedTime)
}
```

Problem with this is, we might not know how much time a **goroutine** might take. In out case we have constant time for each but in real scenarios we are aware that download time varies.

### Using sync.WaitGroup

A `sync.WaitGroup` in Go is a concurrency control mechanism used to wait for a collection of goroutines to finish executing.

here let's see this in action and visualize:

```go
package main

import (
    "fmt"
    "sync"
    "time"
)

func downloadFile(filename string, wg *sync.WaitGroup) {
    // Tell WaitGroup we're done when this function exits
    defer wg.Done()

    fmt.Printf("Starting download: %s\n", filename)
    time.Sleep(2 * time.Second)
    fmt.Printf("Finished download: %s\n", filename)
}

func main() {
    fmt.Println("Starting downloads...")

    var wg sync.WaitGroup

    // Tell WaitGroup we're about to launch 3 goroutines
    wg.Add(3)

    go downloadFile("file1.txt", &wg)
    go downloadFile("file2.txt", &wg)
    go downloadFile("file3.txt", &wg)

    // Wait for all downloads to complete
    wg.Wait()

    fmt.Println("All downloads completed!")
}
```

![go routines execution](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/ujfwktvge6ir2gcjuk2i.png)

Let's visualize this and understand the working of `sync.WaitGroup`:

![go routines execution](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/y4etpzzmtzocfu0qdmdf.png)

**Counter Mechanism:**

- `WaitGroup` maintains an internal counter
- `wg.Add(n)` increases the counter by `n`
- `wg.Done()` decrements the counter by `1`
- `wg.Wait()` blocks until the counter reaches `0`

**Synchronization Flow:**

- Main goroutine calls `Add(3)` before launching goroutines
- Each goroutine calls `Done()` when it completes
- Main goroutine is blocked at `Wait()` until counter hits `0`
- When counter reaches `0`, program continues and exits cleanly

<details>
<summary>Common pitfalls to avoid</summary>

```go
// DON'T do this - Add after launching goroutine
go downloadFile("file1.txt", &wg)
wg.Add(1)  // Wrong order!

// DON'T do this - Wrong count
wg.Add(2)  // Wrong number!
go downloadFile("file1.txt", &wg)
go downloadFile("file2.txt", &wg)
go downloadFile("file3.txt", &wg)

// DON'T do this - Forgetting Done()
func downloadFile(filename string, wg *sync.WaitGroup) {
    // Missing Done() - WaitGroup will never reach zero!
    fmt.Printf("Downloading: %s\n", filename)
}
```

</details>

## Communicating with Channels

So we got a good understanding of how the goroutines work. No how does two go routines communicate? This is where channel comes in.

> **Channels** in Go are a powerful concurrency primitive used for communication between goroutines. They provide a way for goroutines to safely share data.
>
> **Think of channels as pipes**: one goroutine can send data into a channel, and another can receive it.

here are some properties:

1. Channels are blocking by nature.
2. A **send to channel** operation `ch <- value` **blocks** until some other goroutine receives from the channel.
3. A **receive from channel** operation `<-ch` **blocks** until some other goroutine sends to the channel.

```go
package main

import "fmt"

func main() {
    // Create a channel
    ch := make(chan string)

    // Send value to channel (this will block main)
    ch <- "hello"  // This line will cause deadlock!

    // Receive value from channel
    msg := <-ch
    fmt.Println(msg)
}
```

![go routines and channels](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/hkvarnbihcef2onf0m0w.png)

why will `ch <- "hello"` cause deadlock? Since channels are blocking in nature and here we are passing `"hello"` it'll block the main goroutine until there is a receiver and since there is not receiver so it'll be stuck.

![go routines and channels](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/zj77wmyifqhm838k4nc8.png)

Let's fix this by adding a goroutine

```go
package main

import "fmt"

func main() {
    ch := make(chan string)

    // sender in separate goroutine
    go func() {
        ch <- "hello"  // will no longer block the main goroutine
    }()

    // Receive in main goroutine
    msg := <-ch  // This blocks until message is received
    fmt.Println(msg)
}
```

Let's visualize this:

![go routines and channels](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/6saaivcfe5vk5bxmy04a.png)

This time message is being _sent from different goroutine so the main is not blocked_ while sending to channel so it moves to `msg := <-ch` where it blocks the main goroutine to until it receives the message.

### Waiting for Goroutines using Channels

Now let's use channel to fix the file downloader issue (main doesn't wait for others to finish).

```go
package main

import (
	"fmt"
	"time"
)

func downloadFile(filename string, done chan bool) {
	fmt.Printf("Starting download: %s\n", filename)
	time.Sleep(2 * time.Second)
	fmt.Printf("Finished download: %s\n", filename)

	done <- true // Signal completion
}

func main() {
	fmt.Println("Starting downloads...")

	startTime := time.Now() // Record start time

	// Create a channel to track goroutine completion
	done := make(chan bool)

	go downloadFile("file1.txt", done)
	go downloadFile("file2.txt", done)
	go downloadFile("file3.txt", done)

	// Wait for all goroutines to signal completion
	for i := 0; i < 3; i++ {
		<-done // Receive a signal for each completed goroutine
	}

	elapsedTime := time.Since(startTime)
	fmt.Printf("All downloads completed! Time elapsed: %s\n", elapsedTime)
}
```

![go routines and channels](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/pk4wc543tcyuvv8lbq86.png)

visualizing it:

![go routines and channels](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/uio144z8vv0gpay1logj.png)

Let's do a dry run to have a better understanding:

**Program Start**:

Main goroutine creates done channel
Launches three download goroutines
Each goroutine gets a reference to the same channel

**Download Execution**:

1. All three downloads run concurrently
2. Each takes 2 seconds
3. They might finish in any order

**Channel Loop**:

1. Main goroutine enters loop: `for i := 0; i < 3; i++`
2. Each `<-done` blocks until a value is received
3. The loop ensures we wait for all three completion signals

![go routines and channels](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/f3p65vsngx60kmxuqdhc.png)

**Loop Behavior**:

1. **Iteration 1**: Blocks until first download completes
2. **Iteration 2**: Blocks until second download completes
3. **Iteration 3**: Blocks until final download completes

Order of completion doesn't matter!

> **Observations**:
> ⭐ Each send (done <- true) has exactly one receive (<-done)
> ⭐ Main goroutine coordinates everything through the loop

### Goroutine-to-Goroutine Communication

We have already seen how two goroutines can communicate. When? All this while. **Let's not forget main function is also a goroutine**.

```go
package main

import (
	"fmt"
	"time"
)

func sender(ch chan string, done chan bool) {
	for i := 1; i <= 3; i++ {
		ch <- fmt.Sprintf("message %d", i)
		time.Sleep(100 * time.Millisecond)
	}
	close(ch) // Close the channel when done sending
	done <- true
}

func receiver(ch chan string, done chan bool) {
        // runs until the channel is closed
	for msg := range ch {
		fmt.Println("Received:", msg)
	}
	done <- true
}

func main() {
	ch := make(chan string)
	senderDone := make(chan bool)
	receiverDone := make(chan bool)

	go sender(ch, senderDone)
	go receiver(ch, receiverDone)

	// Wait for both sender and receiver to complete
	<-senderDone
	<-receiverDone

	fmt.Println("All operations completed!")
}
```

Let's visualize this and dry run this:

![go routines and channels](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/ftgqgo66rhhm3x363vqs.png)

<details>
<summary>dry run:</summary>

**Program Start (t=0ms)**

- The main goroutine initializes three channels:
  - `ch`: for messages.
  - `senderDone`: to signal sender completion.
  - `receiverDone`: to signal receiver completion.
- The main goroutine launches two goroutines:
  - `sender`.
  - `receiver`.
- The main goroutine blocks, waiting for a signal from `<-senderDone`.

**First Message (t=1ms)**

1. The `sender` sends `"message 1"` to the `ch` channel.
2. The `receiver` wakes up and processes the message:
   - Prints: **"Received: message 1"**.
3. The `sender` sleeps for 100ms.

**Second Message (t=101ms)**

1. The `sender` wakes up and sends `"message 2"` to the `ch` channel.
2. The `receiver` processes the message:
   - Prints: **"Received: message 2"**.
3. The `sender` sleeps for another 100ms.

**Third Message (t=201ms)**

1. The `sender` wakes up and sends `"message 3"` to the `ch` channel.
2. The `receiver` processes the message:
   - Prints: **"Received: message 3"**.
3. The `sender` sleeps for the final time.

**Channel Close (t=301ms)**

1. The `sender` finishes sleeping and closes the `ch` channel.
2. The `sender` sends a `true` signal to the `senderDone` channel to indicate completion.
3. The `receiver` detects that the `ch` channel has been closed.
4. The `receiver` exits its `for-range` loop.

**Completion (t=302-303ms)**

1. The main goroutine receives the signal from `senderDone` and stops waiting.
2. The main goroutine begins waiting for a signal from `receiverDone`.
3. The `receiver` sends a completion signal to the `receiverDone` channel.
4. The main goroutine receives the signal and prints:
   - **"All operations completed!"**.
5. The program exits.

</details>

## Understanding Buffered Channels

**Why do we need buffered channels?**
Unbuffered channels block both the sender and receiver until the other side is ready. When high-frequency communication is required, unbuffered channels can become a bottleneck as both goroutines must pause to exchange data.

**Buffered channels properties:**

1. FIFO (First In, First Out, similar to queue)
2. Fixed size, set at creation
3. Blocks sender when the buffer is full
4. Blocks receiver when the buffer is empty

![go routines and channels](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/j9rj38owqkbir65bhx2k.png)

We see it in action:

```go
package main

import (
    "fmt"
    "time"
)

func main() {
    // Create a buffered channel with capacity of 2
    ch := make(chan string, 2)

    // Send two messages (won't block because buffer has space)
    ch <- "first"
    fmt.Println("Sent first message")
    ch <- "second"
    fmt.Println("Sent second message")

    // Try to send a third message (this would block!)
    // ch <- "third"  // Uncomment to see blocking behavior

    // Receive messages
    fmt.Println(<-ch)  // "first"
    fmt.Println(<-ch)  // "second"
}
```

output (before uncommenting the `ch<-"third"`)

![go routines and channels](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/j64y8yeg3wb82hvbojrx.png)

Why didn't it block the main goroutine?

1. A buffered channel <u>allows sending up to its capacity without blocking</u> the sender.

2. The channel has a capacity of 2, meaning it can hold two values in its buffer before blocking.

3. The buffer is already full with "first" and "second." Since there's no concurrent receiver to consume these values, the send operation blocks indefinitely.

4. Because the main goroutine is also responsible for sending and there are no other active goroutines to receive values from the channel, the program enters a deadlock when trying to send the third message.

Uncommenting the third message leads to deadlock as the capacity is full now and the 3rd message will block until buffer frees up.

![go routines and channels](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/tfrtyz59arturt8f26l2.png)

### Buffered vs. Unbuffered Channels: When to Use Which

| **Aspect**                | **Buffered Channels**                                       | **Unbuffered Channels**                                    |
| ------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------- |
| **Purpose**               | For decoupling sender and receiver timing.                  | For immediate synchronization between sender and receiver. |
| **When to Use**           | - When the sender can proceed without waiting for receiver. | - When sender and receiver must synchronize directly.      |
|                           | - When buffering improves performance or throughput.        | - When you want to enforce message-handling immediately.   |
| **Blocking Behavior**     | Blocks only when buffer is full.                            | Sender blocks until receiver is ready, and vice versa.     |
| **Performance**           | Can improve performance by reducing synchronization.        | May introduce latency due to synchronization.              |
| **Example Use Cases**     | - Logging with rate-limited processing.                     | - Simple signaling between goroutines.                     |
|                           | - Batch processing where messages are queued temporarily.   | - Hand-off of data without delay or buffering.             |
| **Complexity**            | Requires careful buffer size tuning to avoid overflows.     | Simpler to use; no tuning needed.                          |
| **Overhead**              | Higher memory usage due to the buffer.                      | Lower memory usage; no buffer involved.                    |
| **Concurrency Pattern**   | Asynchronous communication between sender and receiver.     | Synchronous communication; tight coupling.                 |
| **Error-Prone Scenarios** | Deadlocks if buffer size is mismanaged.                     | Deadlocks if no goroutine is ready to receive or send.     |

### Key takeaways

**Use <u>Buffered</u> Channels if**:

1. You need to decouple the timing of the sender and receiver.
2. Performance can benefit from batching or queuing messages.
3. The application can tolerate delays in processing messages when the buffer is full.

**Use <u>Unbuffered</u> Channels if**:

1.  Synchronization is critical between goroutines.
2.  You want simplicity and immediate hand-off of data.
3.  The interaction between sender and receiver must happen instantaneously.

---

These fundamentals set the stage for more advanced concepts. In our upcoming posts, we'll explore:

Next Post:

1. Concurrency Patterns
2. Mutex and Memory Synchronization

Stay tuned as we continue building our understanding of Go's powerful concurrency features!

![giphy](https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExZGV2amM2cHdycmx2MHZvNGJiM3hmc2dnaDEwcDViZ21rM2YxbHduciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/YWojXqYpxcl7S5ogYJ/giphy.gif)
