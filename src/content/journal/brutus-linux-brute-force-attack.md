---
title: 'What I Learned from Investigating a Linux Brute-Force Attack'
description: 'What a Hack The Box investigation taught me about authentication logs, binary data, and persistence on compromised systems.'
date: 2026-11-17
tags: ['cyber security', 'forensics', 'python', 'learning']
issue: 7
epigraph: 'There is nothing more deceptive than an obvious fact.'
epigraphAuthor: 'Sherlock Holmes'
---

![Sherlock holmes brutus](/images/sherlock-holmes-brutus.png)

I recently completed the **Brutus Sherlock investigation** on Hack The Box, and it was a genuinely interesting experience. Beyond solving the individual tasks, I gained a better appreciation of Linux authentication logs, binary data representation, Python's `struct` library, and how attackers establish persistence on compromised systems.

What made the exercise particularly interesting was that not all the information I needed was immediately readable. Some of the log data was stored in a binary format, which meant I had to look beyond the usual approach of simply reading text files.

This quote captures one of the most interesting lessons from the investigation. In cybersecurity, the presence of information does not necessarily mean its meaning is obvious. A log file may appear readable, yet contain structured binary data that requires further interpretation. A series of failed authentication attempts may look like ordinary login activity until you recognise the pattern. Even a successful login may reveal very little until you connect it to subsequent events.

The danger is not always the absence of information, but the assumption that we already understand what we are looking at. Sometimes, the most important discoveries come from questioning what appears obvious.

## Identifying the Source of the Brute-Force Attack

The first task was to analyze the authentication logs and identify the IP address from which the attacker was conducting a brute-force attack.

My approach was straightforward. I examined the authentication logs, looking for repeated, consecutive failed login attempts against a particular account. What I noticed was a pattern of unsuccessful authentication attempts originating from the same IP address.

The IP address was:

**65.2.161.68**

This was my first finding, and it established the source of the brute-force activity.

## Identifying the Compromised Account

The second task was to determine whether the brute-force attempts were successful and, if so, identify the account the attacker managed to access.

After examining the authentication records, I established that the attacker successfully gained access to the server using the `root` account.

The root account is the superuser account on Linux systems. It has extensive administrative privileges, meaning that gaining access to it gives an attacker considerable control over the compromised system.

This was an important finding because it established that the incident had progressed beyond unsuccessful login attempts to an actual system compromise.

## Determining the First Successful Login Time

The third task involved identifying when the attacker successfully logged in.

One thing I found interesting was the distinction between authentication time and login time. Although these events are closely related and may occur within seconds or milliseconds of each other, they represent different stages of the authentication process.

By examining the relevant records, I identified the first successful login time as:

**6 March 2024, 06:32:45.**

## Identifying the Attacker's Session

Next, I needed to identify the session associated with the attacker's initial access through the root account.

Linux authentication and session records provide useful information about login sessions, allowing investigators to associate authentication events with particular sessions.

The session identifier I found was:

**Session 37.**

## Discovering the Account Created by the Attacker

The next stage involved investigating whether the attacker had established another means of accessing the compromised system.

After gaining access through the root account, the attacker created another local account.

The account was named:

**Cyber Junkie.**

This was particularly interesting because it demonstrated a persistence technique. Rather than relying exclusively on the credentials initially compromised, an attacker can create another account to maintain access to a system.

## Understanding MITRE ATT&CK and Persistence

One of the tasks required identifying the MITRE ATT&CK sub-technique associated with the attacker's account creation.

MITRE ATT&CK is a globally accessible knowledge base that documents adversary tactics, techniques, and procedures (TTPs) based on real-world observations of cyber threats.

The technique identified in this investigation was:

**T1136.001 – Create Account: Local Account.**

This technique falls under the Persistence tactic.

According to the MITRE ATT&CK framework, adversaries may create local accounts to maintain access to compromised systems. These accounts can provide an alternative means of accessing a machine, particularly when the attacker risks losing access to the initially compromised account.

## Investigating the Attacker's Subsequent Activity

Another task required identifying when the attacker first accessed the system following the relevant account activity and determining the command executed.

The timestamp I identified was:

**6 March 2024, 06:37:24.**

The command involved retrieving a file hosted on GitHub's user-content infrastructure.

This demonstrated how authentication logs and subsequent system activity can be used together to reconstruct an attacker's actions after obtaining access.

## My Biggest Technical Takeaway: Python's struct Library

Perhaps the most interesting technical discovery I made during this exercise was the use of Python's `struct` library.

While examining the log data, I encountered information that was not stored as ordinary, human-readable text. Instead, some of the data was represented in binary form.

Initially, I found this interesting because the information was technically present in the file, but reading it directly did not reveal the actual values I needed.

This introduced me to Python's `struct` library, particularly its `unpack()` function.

The `struct` library allows Python to interpret binary data according to a specified format. It provides a way to convert packed binary representations into Python values such as integers and other data types.

For example, a sequence of bytes might represent an integer, a timestamp, or a collection of structured fields. Using the appropriate format string, `struct.unpack()` can interpret those bytes and return their corresponding values.

This is different from simply converting binary data into text. The program needs to know how the data was originally structured before it can interpret the individual fields correctly.

This is something I want to explore further.

I still need to understand the relationship between `struct.pack()` and `struct.unpack()`, how format characters work, how byte ordering affects interpretation, and how binary data is organised into structures.

## Final Thoughts

Overall, the Brutus investigation was a valuable learning experience.

It reinforced something important about cybersecurity investigations: information is not always presented in a format that is immediately understandable. Sometimes, you have to investigate how the information was stored, how it was represented, and how to interpret it before you can extract anything meaningful.

I also gained a better understanding of how authentication logs can help reconstruct an attack, from the initial brute-force attempts to successful authentication, session creation, account creation, and subsequent activity.

My next step is to explore Python's `struct` library more deeply, particularly `pack()` and `unpack()`. I also want to understand binary data representation and how it is used in log files and other system-level operations.

The investigation may have been about identifying an attacker's activities, but one of my biggest takeaways was discovering another layer of how computers represent and process information.

And perhaps that is the most fitting lesson to take away from a Sherlock investigation: never mistake what is immediately visible for everything there is to know.
