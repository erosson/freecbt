import { Action, DistortionData, Model, Settings, Thought } from ".";

const emptyReady: Model.Ready = {
  status: "ready",
  now: new Date(0),
  thoughts: new Map(),
  thoughtParseErrors: new Map(),
  deviceColorScheme: null,
  deviceLocale: "en",
  deviceWindow: { width: 1024, height: 768 },
  distortionData: DistortionData,
  sessionAuthed: false,
  settings: Settings.empty(),
};

test("basic actions", () => {
  let m: Model.Model;
  const ready = () => {
    expect(m.status).toBe("ready");
    return m as Model.Ready;
  };
  [m] = Model.init;
  expect(m).toEqual(Model.loading);
  [m] = Model.update(m, Action.modelReady(emptyReady));
  expect(m.status).toBe("ready");
  expect(ready().thoughts.size).toBe(0);
  expect(ready().settings.theme).toBe(null);
  [m] = Model.update(m, Action.createThought(Thought.emptySpec()));
  expect(ready().thoughts.size).toBe(1);
  [m] = Model.update(m, Action.setTheme("dark"));
  expect(ready().settings.theme).toBe("dark");
});
