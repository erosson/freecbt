# Contributing to FreeCBT

If you like FreeCBT, you're welcome to submit a PR, throw down an issue, or otherwise contribute to the project.

## Psychiatrists, Therapists, Researchers and other experts

If you're interested in giving expert advice to FreeCBT or would like to use it for your patients, I'd love to talk to you.

FreeCBT is currently _not made_ with any expert involvement (I used Quirk's experise, which they say was "just a whole bunch of [NIH searching](https://www.ncbi.nlm.nih.gov/pmc/)"). But I'd very much welcome expert opinions or consultations.

Feel free to shoot me an email:

```
freecbt at erosson.org
```

## Development

* Install the Expo client on your phone: https://docs.expo.io/get-started/installation/#2-mobile-app-expo-client-for-ios
* Build the code using an Expo server:

    yarn
    yarn start

* Run the code on your phone, in the Expo client: https://docs.expo.io/get-started/create-a-new-app/#opening-the-app-on-your-phonetablet

## Versioning and Beta Testing

FreeCBT follows a [continuous deployment](https://en.wikipedia.org/wiki/Continuous_delivery) model: everything committed to the `master` branch is shipped to production immediately and automatically. These releases are done using [`expo publish`](https://docs.expo.io/workflow/publishing/), and have no associated version number. For beta testing and unreleased code, we use *feature switches* to enable and disable new features.

There is a *secret* debug screen, allowing anyone to try out any feature switch: go to the settings screen, then tap the empty space just below the privacy/tos links 5 times.

To add your own feature switches, see `src/feature.ts`. The `debugVisible` feature switch is an example: switching it on makes the debug link on the settings screen visible, instead of invisible.

Most new features should begin life with an associated feature switch, default false. The switch can default to true once we're ready for most users to see the feature, and the switch can be removed once the feature is battle-tested and we're confident it won't need to be turned off.

## Storefront

Currently, we use Fastlane to download metadata for the Google Play and Apple Appstore storefronts, and keep them in source control. This gives us a record of how the stores looked, and makes internationalization much easier.

(I don't trust fastlane quite enough to use it for *uploading* store metadata yet. Maybe that will change with time.)

### Google

https://docs.fastlane.tools/getting-started/android/setup/ , https://docs.fastlane.tools/actions/supply/

Setup: `cd android; bundle install`, auth key setup from above links

After updating the store UI: `rm -rf fastlane/metadata/android; bundle exec fastlane supply init`

### Apple

https://docs.fastlane.tools/actions/deliver/

Setup: `cd ios; bundle install; FASTLANE_PASSWORD=<the-password>`

After updating the Apple store UI: `rm -rf fastlane/{Deliverfile,screenshots,metadata}; bundle exec fastlane deliver init`
