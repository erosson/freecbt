<p align="center">
<h1 align="center">✨🐙 FreeCBT. </h1>
</p>
<div align="center"><i>(A fork of <a href="https://github.com/Flaque/quirk">Quirk</a>)</i></div>
<p align="center">
  <a href="https://apps.apple.com/us/app/freecbt/id1516063390">Download iOS</a> •
  <a href="https://play.google.com/store/apps/details?id=org.erosson.freecbt">Download Android</a> •
  <a href="mailto:freecbt+readme@erosson.org">Contact</a> •
  <a href="./CHANGELOG.md">Changelog</a>
<br><br>
</p>

[![Publish production Typescript changes (`yarn deploy`/`eas update`)](https://github.com/erosson/freecbt/actions/workflows/publish-ts.yml/badge.svg)](https://github.com/erosson/freecbt/actions/workflows/publish-ts.yml)
[![Build app, submit to appstores, tag git (`yarn buildsubmit:all`/`eas build --auto-submit`)](https://github.com/erosson/freecbt/actions/workflows/appstore-build.yml/badge.svg)](https://github.com/erosson/freecbt/actions/workflows/appstore-build.yml)
[![Netlify Status](https://api.netlify.com/api/v1/badges/eef93f1b-dc96-423f-ae61-a9f6d5ff0af5/deploy-status)](https://app.netlify.com/sites/gifted-kowalevski-9b804a/deploys)

FreeCBT (a fork of [Quirk](https://github.com/Flaque/quirk)) is a crossplatform, GPL-licensed, [Cognitive Behavioral Therapy (CBT)](https://en.wikipedia.org/wiki/Cognitive_behavioral_therapy)
app built in React Native / Expo.

Unlike many CBT apps, it's fairly unbiased in what you use it for; it doesn't ask about your mood or ask you
to do depression-specific CBT exercises. That makes it fairly quick and discreet to use, especially in a public
setting.

<img src="https://user-images.githubusercontent.com/5942769/54972305-4081d180-4f48-11e9-91d8-7e8117668418.gif" alt="quirk screenshot" />

## Contributors

Some amazing folks have helped build the FreeCBT you see today.

- [@innerspace777](https://github.com/innerspace777) for the updated [German translation](https://github.com/erosson/freecbt/pull/693) 🇩🇪
- [@magnulu](https://github.com/magnulu) for the updated [Norsk Bokmål translation](https://github.com/erosson/freecbt/pull/692) 🇳🇴
- [@1K2S](https://github.com/1Git2Clone) for the [Bulgarian translation](https://github.com/erosson/freecbt/pull/691) 🇧🇬
- [@cacado0](https://github.com/cacado0) for the updated [Russian translation](https://github.com/erosson/freecbt/pull/690) 🇷🇺
- [@xRahul](https://github.com/xRahul) for the [Hindi translation](https://github.com/erosson/freecbt/pull/688) 🇮🇳
- [@miguelmf](https://github.com/miguelmf) for the updated [European Portuguese translation](https://github.com/erosson/freecbt/pull/683) 🇵🇹
- [@ali73](https://github.com/ali73) for the [Farsi translation](https://github.com/erosson/freecbt/pull/686) 🇮🇷
- [@marcomuccio](https://github.com/marcomuccio) for the [Italian translation](https://github.com/erosson/freecbt/pull/283) 🇮🇹

And others helped build Quirk, the original app FreeCBT is built on.

- [@Flaque](https://github.com/Flaque) for creating Quirk 🔥🔥
- [@devinroche](https://github.com/devinroche) for setting up translation and stepping up as a core maintainer 🔥
- [@devilcius](https://github.com/devilcius) for the amazing Spanish translation 🇪🇸
- [@idnovic](https://github.com/idnovic) for the amazing German translation 🇩🇪 (and the iPad support!)
- [@kwierbol](https://github.com/kwierbol) for the amazing Polish translation 🇵🇱
- [@Walther](https://github.com/Walther) for the amazing Finnish translation 🇫🇮
- [@Jos512](https://github.com/Jos512) for the amazing Dutch translation 🇳🇱
- [@jinto](https://github.com/jinto) for the amazing Korean translation 🇰🇷
- [@briankung](https://github.com/briankung) for the Chinese 🇨🇳 localization, internationalization support and helping guide the entire translation effort. 🎉
- [@akinariobi](https://github.com/akinariobi) for the Russian translation 🇷🇺
- [@miguelmf](https://github.com/miguelmf) for the European Portuguese translation 🇵🇹
- [@comradekingu](https://github.com/comradekingu) for the Norweigan Bokmål translation 🇳🇴
- [@micheleriva](https://github.com/micheleriva) for the Italian translation 🇮🇹
- [@Jolg42](https://github.com/jolg42) for the French translation 🇫🇷
- [@Buricescu](https://github.com/Buricescu) for the Romanian translation 🇷🇴

## Running Locally

FreeCBT is built on React Native and therefore assumes you have [node](https://nodejs.org/en/) installed.
[Yarn](https://yarnpkg.com/en/) is preferred over NPM as a package manager.

```sh
# clone the project and cd into it
git clone git@github.com:erosson/freecbt.git; cd ./freecbt

# install dependencies
yarn

# start development environment
yarn start
```

You'll then be in the [expo development environment](https://docs.expo.io/versions/latest/).
If you already have XCode installed with a simulator, you can just press `i` to start it.

See [CONTRIBUTING.md](https://github.com/erosson/freecbt/blob/master/CONTRIBUTING.md) for more details!

# Can I help?

Of course!

**If you like the app,** go give it 5 stars! It helps more people find the app.

**If you're a mental health professional,** audit [the descriptions](https://github.com/erosson/freecbt/blob/master/src/locals/en.json) of the cognitive distortions. If you have suggestions, let me know and we'll change stuff!

**If you can draw** and can make digital illustrations of the little blobs, let me know and I'll find a place to stick them in the app!

**If you know a language other than English,** help [us translate the app!](/TRANSLATIONS.md)

# FreeCBT and Quirk

FreeCBT is based on [Quirk](https://github.com/Flaque/quirk)'s code. Why did I create a fork?

- **Keep Quirk alive.** Quirk is a well-designed piece of software that is, sadly, [no longer maintained](https://github.com/Flaque/quirk). The single most important reason this fork exists is so a Quirk-like app can continue to exist.
- **Zero cost, zero ads.** FreeCBT will be _free_. I want FreeCBT to help as many people as possible, the way Quirk helped me. Ads and tracking would risk hurting vulnerable people more than helping; a paywall would sharply reduce the number of people this app helps.

  The obvious trade-off is that FreeCBT makes its maintainer no money. _I think FreeCBT is important enough to work on anyway._ There is a less obvious trade-off that affects you: I can spend less time/energy/money working on FreeCBT than [Quirk's developer](https://github.com/Flaque) spent working on Quirk, which leads to...

- **No major new features.** Quirk already works very well. I want to keep things working well, avoid bloat, and - as explained above - keep development time/costs low. Every new feature puts those things at risk.

# Design

FreeCBT's - originally Quirk's - goal is to be both inviting and focused. It should be _really_ easy to enter in a thought; people frequently enter these in public settings and need to do it fairly quickly. It also should not cause any increased frustration.

## Design Logic

FreeCBT is built with two main goals in mind:

- Don't be bloated
- Don't be evil

### Don't be bloated

**Don't include features for one particular condition at the expense of other conditions.** For example, don't couple mood tracking to thought tracking. If a user _has_ to enter a mood in order to track a thought, then the entire app is ruined for people who use it for panic, OCD or another condition where mood isn't the primary focus.

**Don't include non-CBT related treatments without good reason.** No relaxation audio tracks or meditation guides. It's a CBT app, keep it focused on CBT.

**Don't include things that could be better accomplished by another app.** No one needs an in-app diary when a diary works just fine. No one needs an in-app heart rate tracker when a heart rate tracker works just fine.

**Be quick and efficient.** Thoughts shouldn't take 5 minutes to enter and you should be able to skip fields if it's reasonable. Don't let the perfect be the enemy of the good.

### Don't be Evil

**Thoughts are more valuable than passwords, treat them that way.** Most people would rather give over their passwords than their CBT thoughts. They're incredibly private, occasionally involve other people, and frequently are embarrassing.

**Don't have \$200 dollar in app purchases.** I'm looking at you CBT Thought Diary. I get it, developers need to make money. It costs a lot to just keep the app on the app store. But you're preying on vulnerable people. Very few people of rational mind will purposely spend \$200s for a dark mode.

**Don't have dumb notifications.** Scheduling is fine, abusing push notifications so your app has better traffic is scummy and gross.

**Be open.** Not every app has to be open source; it's a hard choice to make. But be clear and obvious within the app about what's going on with the user's data. Don't be sending it to some server without making that clear within the app, especially if it's not providing any extra utility to the user.

**Don't push people to be unhappy.** Do not purposefully or accidentally force people to be unhappy to use their app. Don't force people to state their unhappy in order to access a feature. It's easy for this to sneak up in the design, if a user has to rate their happiness below average in order to access the CBT features, you're asking them to be unhappy to use your app.

**Be extremely cautious about making engagement your core metric.** User engagement is fine to be concerned about. We all want people who need help to be actually engaging in the help. But holy moly becareful about this. You _do not_ want to drive something that is for many people a treatment into a self-perpetuating engagement loop. A ruthless focus on engagement has caused many a product to become skinner boxes. _No one should ever be addicted to your mental health app._

# Engineering Logic

FreeCBT _must not_ lose user data. The entire point of the app is to record your thoughts, so if you lost them it would be pretty bad. As stated in [one study](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6010839/):

> While an app failure in general can be inconvenient and annoying, it can have serious consequences in the context of mental health apps—someone who has come to rely on an app for emotional support can find a failure “devastating.”

Therefore, data management should be given a higher priority than any other part of the app.

## Taxonomy and Order of Data Failure Cases

The following is a list of extremely _bad_ behaviors and states that could happen in order of severity.

### 1 - Large Scale Data Corruption

All thoughts have been corrupted somehow. For example, the JSON format of every item is wrong. This is put at the top because not only can a user not access the data, but it may spiral out can cause continuing errors forcing the app to be "bricked."

### 2 - Large Scale Data Loss

All thoughts have been deleted without any hope of recovery.

### 3 - Small Scale Data Loss

A small amount of data has been deleted without any hope of recovery.

### 4 - Small Scale Data Corruption

A small amount of data has been corrupted in a recoverable way. The user still has lost data, but the app does not crash, and this is potentially fixable via an update.

# License

FreeCBT is licensed under the [GPL](https://en.wikipedia.org/wiki/GNU_General_Public_License), which guarantees end users the freedom to study, share, and modify the software.

Note that this license **does not** give free reign to redistribute the name and branding of FreeCBT. So if you'd like to publish your own version, please rename it to avoid end-user confusion.
