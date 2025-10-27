# Manual test plan

After big changes, test these things manually, in both ios and android.

* With a preview build, not in Expo Go:
  * [ ] is saved data persisted from the old version? (Expo Go's behavior is inconsistent here)
  * [ ] does the splash screen work? (Expo Go uses a fake one after expo53)
* From the create-thought form:
  * [ ] create an empty thought
  * [ ] create a non-empty thought
  * [ ] select/deselect a distortion
  * [ ] open the help screen
* From the help screen:
  * [ ] view the onboarding screen
  * [ ] ios: enable reminders from the onboarding screen
* from the finished-thought screen:
  * [ ] edit the thought
  * [ ] close the thought and view the list
  * [ ] open a feedback email
* from the list of thoughts:
  * [ ] view a thought
  * [ ] delete a thought
  * [ ] delete the last thought, so the list is empty
  * [ ] open the settings screen
* from the settings screen:
  * [ ] enable a lock code. close and reopen the app, enter the code
  * [ ] update a lock code. close and reopen the app, verify code changed
  * [ ] clear the lock code. close and reopen the app, verify it's gone
  * [ ] change + verify the language
  * [ ] change + verify the history button labels
  * [ ] open the debug screen
* from the backup screen:
  * [ ] save a backup file
  * [ ] delete a few thoughts, load the above backup file, see its changes
* from the export screen:
  * [ ] export a markdown file. paste it into github, it should look sane
  * [ ] export a csv file. paste it into google sheets, it should look sane
  * [ ] export a json file. `JSON.parse` it, it shouldn't break

last updated 2022/12/19

last run 2022/12/19
