---
title: 'Notes: In love, war, and open-source—never give up'
date: '2021-01-03'
---

Hey there,

I’ll never forget launching my first open-source project and sharing it on Reddit…

I had spent a couple of days at my parents’ place over Christmas that year and decided to use some of my spare time to work on a Python library I christened Schedule.

The idea behind Schedule was very simple and had a narrow focus (I find that that that’s always a good idea for libraries by the way):

Developers would use it like a timer to periodically call a function inside their Python programs.

The kicker was that Schedule used a funky “natural sounding” syntax to specify the timer interval. For example, if you wanted to run a function every 10 minutes you’d do this:

schedule.every(10).minutes.do(myfunc)
Or, if you wanted to run a particular task every day at 10:30 in the morning, you’d do this:

schedule.every().day.at('10:30').do(mytask)
Because I was so frustrated with Cron’s syntax I thought this approach was really cool. And so I decided this would be the first Python module I’d release as open-source.

I cleaned up the code and spent some time coming up with a nice README file—because that’s really the first thing that your potential users will see when they check out your library.

Once I had my module available on PyPI and the source code on GitHub I decided to call some attention to the project. The same night I posted a link to the repository to Reddit and a couple of other sites.

I still remember that I had shaky hands when I clicked the “submit” button…

It’s scary to put your work out there for the whole world to judge! Also, I didn’t know what to expect.

Would people call me stupid for writing a "simple" library like that?

Would they think my code wasn’t good enough?

Would they find all kinds of bugs and publicly shame me for them? I felt almost a physical sense of dread about pushing the “submit” button on Reddit that night!

The next morning I woke up and immediately checked my email. Were there any comments? Yes, about twenty or so!

I started reading through all of them, faster and faster—

And of course my still frightful mind immediately zoomed in on the negative ones, like

“Cool idea, but not particularly useful”,

and

“The documentation is not enough”,

and

“Not a big fan of the pseudo-english syntax. Way too clever and gimmicky.”

At this point I was starting to feel a *little* discouraged… This was just something I wrote in a couple of hours and gave away for free!

The comment that really made my stomach churn was one from a particularly well known member of the Python community:

“And another library with global state :-( … Such an API should not even exist. It sets a bad example.”
