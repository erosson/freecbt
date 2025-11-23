import { Settings } from ".";

const empty: Settings.Json = {
  [Settings.pincodeKey]: null,
  [Settings.historyLabelsKey]: null,
  [Settings.localeKey]: null,
  [Settings.themeKey]: null,
  [Settings.existingUserKey]: null,
};

test("parse + serialize empty json", () => {
  const s = Settings.fromJson.decode(empty);
  expect(s.pincode).toBe(null);
  expect(s.historyLabels).toBe("alternative-thought");
  expect(s.locale).toBe(null);
  expect(s.existingUser).toBe(false);
  const j = Settings.fromJson.encode(s);
  expect(j).toEqual(empty);
});

test("parse + serialize nonempty json", () => {
  const j0 = {
    [Settings.pincodeKey]: "1234",
    [Settings.historyLabelsKey]: "automatic-thought",
    [Settings.localeKey]: "de",
    [Settings.themeKey]: "dark",
    [Settings.existingUserKey]: null,
  };
  const s = Settings.fromJson.decode(j0);
  expect(s.pincode).toBe("1234");
  expect(s.historyLabels).toBe("automatic-thought");
  expect(s.locale).toBe("de");
  expect(s.existingUser).toBe(false);
  const j = Settings.fromJson.encode(s);
  expect(j).toEqual(j0);
});

test("parse + serialize onboarding (boolean json)", () => {
  const j0 = {
    ...empty,
    [Settings.existingUserKey]: "1",
  };
  const s = Settings.fromJson.decode(j0);
  expect(s.existingUser).toBe(true);
  const j = Settings.fromJson.encode(s);
  expect(j).toEqual(j0);
});

test("parse invalid json, with errors replaced by defaults", () => {
  const j0 = {
    ...empty,
    [Settings.pincodeKey]: "12345",
  };
  const s = Settings.fromJson.decode(j0);
  expect(s.pincode).toBe(null); // replaced by a default value!
  expect(s.historyLabels).toBe("alternative-thought");
  expect(s.locale).toBe(null);
  const j = Settings.fromJson.encode(s);
  expect(j).not.toEqual(j0);
  expect(j).toEqual(empty);
});
