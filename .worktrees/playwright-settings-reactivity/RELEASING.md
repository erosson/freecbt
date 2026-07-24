# Releasing

Notes on how to release changes.

Last updated 2023/08/29

## Typescript changes/`expo publish`able:

- Verify the continous deployment github-action is working. It should auto-publish the changes. https://github.com/erosson/freecbt/actions/workflows/deploy.yml
  - That is, _do nothing_: the master branch is auto-published.
- You can also manually run `yarn deploy`

## Complex changes/not `expo publish`able:

Releasing a new build with big updates/that requires a new appstore deployment

* In `app.json`, increment `expo.android.versionCode`, `expo.ios.buildNumber`, and `expo.version` as needed.
* Push your changes to the `appstore-build` git branch. The CI robot will build and publish everything there to the app stores.
* Visit the app store websites, test manually, and launch.
  * https://play.google.com/console/
  * https://appstoreconnect.apple.com/apps/1516063390/testflight/ios
* Follow the `apk` steps below; the automation there is broken

### Manually publishing


relevant documentation: https://docs.expo.dev/submit/introduction/

- android
  - increment `expo.android.versionCode` in `app.json`. submit to git. do this _before_ building
  - `yarn buildsubmit:android` to build + upload to play console
    - or `yarn build:android` + `yarn submit:android`, for separate steps
  - https://play.google.com/console/
  - requires api key, service account. relevant docs: https://github.com/expo/fyi/blob/main/creating-google-service-account.md
- ios
  - `yarn buildsubmit:ios` to build + upload to play console
    - or `yarn build:ios` + `yarn submit:ios`, for separate steps
    - `submit` replaces my old macincloud shenanigans. Thanks Expo!
  - result at https://appstoreconnect.apple.com/apps/1516063390/testflight/ios - manually test and launch
  - requires api key. relevant auth docs: https://github.com/expo/fyi/blob/main/creating-asc-api-key.md
- android apk (non-appstore)
  - `yarn build:apk`
  - Upload to the releases page. https://github.com/erosson/freecbt/releases
  - There's a github-action that should automate this, but it's been broken for a while (since our big expo 47 update). https://github.com/erosson/freecbt/blob/master/.github/workflows/apk.yml
