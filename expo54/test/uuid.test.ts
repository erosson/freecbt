// the uuid package has given me all kinds of trouble. this is mocked in jest - see jest-setup.ts
import { v4 as uuidv4 } from "uuid";
// const { v4: uuidv4 } = require("uuid");

test("simplest possible uuid", () => {
  const id = uuidv4();
  expect(id).not.toBeNull();
});
