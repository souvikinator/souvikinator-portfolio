---
title: "Unveiling Google XSS Challenge L1: A Beginner's Guide"
date: 2022-06-11T16:53:47+05:30
draft: false
tags: ['ctf', 'xss', 'security', 'google xss challenge']
description: "Explore basic XSS with Google's Level 1 challenge. Learn how simple injections work and understand core concepts through hands-on practice."
image: './cover.png'
---

## Prerequisite

Before getting started one should be familiar with XSS or at least have an idea about it. Here is a good article which you may give a read to understand what is XSS. [Read](https://portswigger.net/web-security/cross-site-scripting)!

Also, I assume that readers are at least familiar with JavaScript. If not then I'll suggest to spend some time with JS and get comfortable with the basics. You can refer to [javascript.info](https://javascript.info/) and [MDN](https://developer.mozilla.org/en-US/docs/Web) which are extremely helpful.

> 💡 Also in this whole series we'll not even roll our eyes on **Hints** and **Toggle Code** as in real-world bug hunting no one will provide you with hints or non-obfuscated source code, so you have to figure out things yourself.

## Mission Description

This level demonstrates a common cause of cross-site scripting where user input is directly included in the page without proper escaping.

Interact with the vulnerable application window below and find a way to make it execute JavaScript of your choosing. You can take actions inside the vulnerable window or directly edit its URL bar.

## Mission Objective

Inject a script to pop up a JavaScript `alert()` in the frame below.

## Hints

1. Start by inspecting elements and understand what's happening. Try out few inputs in the input box.

2. How about entering some HTML 😉 Who's gonna stop you.

3. Looks like the above hint works, try out some other HTML tags.

4. Which HTML TAG executes JavaScript?

Still didn't get it? No worries I'll show you how to approach this.

## Breaking In

> I know this one is very basic and anyone familiar with _HTML_ and _JS_ can solve but still get into details to show the approach.

Usually, for XSS we need a place where we can enter our payload and execute the attack. Any website where user input is required and the user input is not sanitized or managed properly then it can be a huge risk.

Our approach will be:

- Find a place where payload can be passed (input box in this case)

- Understand what the application is doing and how it's dealing with the input

- Make a payload on the basis of your understanding of the application

So let's start by trying out some random input in the input box to understand what this thing is doing and also charge up your weapon. We will use the browser dev tool. Open the network tab.

Input: _hello_

and here we have results in the network tab:

[![xss-level-1-network-tab.gif](https://i.postimg.cc/NfhdVFvs/xss-level-1-network-tab.gif)](https://postimg.cc/nMkK9HLg)

as you can see what our query was included in the header `query=hello` and on moving to the response tab we see our query string is placed inside the `<b>` tag. How about entering some _HTML_ as a query and see how it affects the page.

Input: `<marquee>Hello!</marquee>`

and we have a moving text on the result page

[![xss-level-1-marquee.gif](https://i.postimg.cc/X7TQRJMN/xss-level-1-marquee.gif)](https://postimg.cc/gnHVRGk1)

and having a look at the response tab of this query we see that our `marquee` tag is also being rendered and that's all we want

[![xss-level-1-html-rsp-tab.png](https://i.postimg.cc/bYV6Rg3t/xss-level-1-html-rsp-tab.png)](https://postimg.cc/6TRLWrsW)

now it's very obvious that HTML tags from inputs are rendering. Which HTML tag do we need to pop an alert? Of course `<script>` and here we go:

```html
<script>
  alert('xss level 1')
</script>
```

and bang! we have an alert and we cleared the level.

## What did we learn?

1. Approach to identify XSS in a website.
2. How to use dev tools. You can refer to a more detailed tutorial here and for tricks and tips refer here

We are not done yet!! We have 5 more levels of [Google XSS challenges](http://souvikinator.netlify.app/tags/google-xss-challenge/) to complete and they are not going to be as easy as this one, so be prepared.

🥳 So it's time to wrap up the post with a quote

> "Life is short. Don't tolerate bullsh\*t. Don't wait until it's too late" -Zat Rana
