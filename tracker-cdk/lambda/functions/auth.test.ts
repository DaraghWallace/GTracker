import { getGroups, isInGroup } from "./auth";

//if claim is undefined, = []	false
test("undefined claims gives no groups", () => {
  expect(getGroups(undefined)).toEqual([]);
  expect(isInGroup(undefined, "admins")).toBe(false);
});

//if claim is {}, (no groups claim)	= []	false
test("empty claim gives no group", () => {
  expect(getGroups({})).toEqual([]);
  expect(isInGroup({}, "admins")).toBe(false);
});

test("dud string claim gives no group", () => {
  expect(getGroups({"cognito:groups":""})).toEqual([]);
  expect(isInGroup({"cognito:groups":""}, "admins")).toBe(false);
});


//if claim is { "cognito:groups": "admins" },	["admins"]	true
test("admin claim gives admin group", () => {
  expect(getGroups({ "cognito:groups": "admins" })).toEqual(["admins"]);
  expect(isInGroup({"cognito:groups": "admins" }, "admins")).toBe(true);
});

//if claim is { "cognito:groups": "admins,trainers" } =	["admins","trainers"]	true
test("correct claim returns group", () => {
  expect(getGroups({ "cognito:groups": "admins,trainers" })).toEqual(["admins","trainers"]);
  expect(isInGroup({ "cognito:groups": "admins,trainers" }, "admins")).toBe(true);
});

//if claim is { "cognito:groups": "not-admins" } = ["not-admins"]	false
test("incorrect claim containg correct claim does not returns group", () => {
  expect(getGroups({ "cognito:groups": "not-admins" })).toEqual(["not-admins"]);
  expect(isInGroup({  "cognito:groups": "not-admins"  }, "admins")).toBe(false);
});