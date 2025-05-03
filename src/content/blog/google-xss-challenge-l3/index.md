---
title: 'Solving Google XSS Challenge L3: Escaping JavaScript'
date: 2022-06-13T01:17:57+05:30
draft: false
tags: ['ctf', 'xss', 'security', 'google xss challenge']
description: "Tackle Google's Level 3 XSS challenge by escaping JavaScript string contexts. Learn techniques to break out of script blocks and execute arbitrary code."
image: './cover.png'
---

## Prerequisite

Before getting started one should be familiar with XSS or at least have an idea about it. Here is a good article which you may give a read to understand what is XSS. [Read](https://portswigger.net/web-security/cross-site-scripting)!

Also, I assume that readers are at least familiar with JavaScript. If not then I'll suggest to spend some time with JS and get comfortable with the basics. You can refer to [javascript.info](https://javascript.info/) and [MDN](https://developer.mozilla.org/en-US/docs/Web) which are extremely helpful.

> 💡 Also in this whole series we'll not even roll our eyes on **Hints** and **Toggle Code** as in real-world bug hunting no one will give you hints or non-obfuscator source code so you have to figure out things yourself.

## Mission Description

As you've seen in the previous level, some common JS functions are execution sinks which mean that they will cause the browser to execute any scripts that appear in their input. Sometimes this fact is hidden by higher-level APIs which use one of these functions under the hood.

The application on this level is using one such hidden sink.

## Mission Objective

As before, inject a script to pop up a JavaScript alert() in the app.

Since you can't enter your payload anywhere in the application, you will have to manually edit the address in the URL bar below.

## Breaking In

Let's jump right into it and see what is this application all about. As you click on the tabs `Image 1`, `Image 2`, `Image 3` the image changes. Notice anything else as well? Yep! the URL.

If we click on `Image 1` the URL is `level3/frame#1`, `Image 2` => `level3/frame#2`. Looks like the number followed by `#` is referring to the tab number. We'll try passing some other number to see how it behaves.

`level3/frame#100`

[![xss-level-3-test-1.png](https://i.postimg.cc/Kvg5D216/xss-level-3-test-1.png)](https://postimg.cc/rKMWq7Cj)

the thing to notice is that what we enter after `#` in URL gets displayed on the page. There is a possibility that we can insert some script on the page.

**Information (so far)**:

1. Entry point: URL

2. Input in URL gets displayed on the page.

**Payload** : `level3/frame#<h1>hello</h1>`

which shows **Image NaN** on the page. Hmm NaN (not a number), usually returned by a function that expects a number as input but here we provided string. There may be a possibility that the code uses `ParseInt`. Let's give it a search in dev tools.

[![xss-level-3-search.png](https://i.postimg.cc/P5sQ6RZP/xss-level-3-search.png)](https://postimg.cc/Mv5BHt9S)

In the upper frame line number _16_, _17_, _18_ are the star of the show. When we entered a string, it was passed to `parseInt` which returned _NaN_ at line _16_. However there is a flaw. `parseInt` saved the application from XSS but here the `num` is still being used in line _17_ and this time no `parseInt` and of course line _18_ insects the HTML in the page.

Let's create our payload keeping line _17_ in mind.

line 17: ` html += "<img src='/static/level3/cloud" + num + ".jpg' />";`

> _NOTE_: another thing we have to keep in mind that this application uses _JQuery_ and at line _18_ `.html()` is equivalent to `innerHTML` in vanilla JavaScript, so even if we insert a script it won't work.

so if you have solved [level 2 of XSS challenge](/blog/google-xss-challenge-l2) then you know you can manipulate the `onerror` attribute of `img` tag and the best part is at line _17_ there is already an `img` tag so all we need to do is _properly_ inject `onerror` to the element.

**Payload**: `' onerror="alert(/xss/)" '`

The image tag will look something like this after injecting the payload:

`<img src='/static/level3/cloud` `' onerror="alert(/xss/)" '` `.jpg' />`

the first `'` in payload closes the string in `src` which makes it an invalid image URL (`/static/level3/cloud`) and will certainly lead to an error that triggers `onerror` and rest you know.

this payload can be further condensed to `'onerror="alert(/xss/)"`. The above payload was to explain the logic behind it.

[![xss-level-3-payload-res.png](https://i.postimg.cc/d3hjXM4T/xss-level-3-payload-res.png)](https://postimg.cc/xNSmJZr0)

Go ahead and look for some other payload and think what else you can do apart from popping an alert.

We are not done yet!! We have 3 more levels of Google XSS challenges to complete so head over to the [blog section](http://souvikinator.netlify.app/tags/google-xss-challenge/) and checkout walkthroughs.

🥳 So it's time to wrap up the post with a quote

> "For the things we have to learn before we can do them, we learn by doing them." ― Aristotle
 