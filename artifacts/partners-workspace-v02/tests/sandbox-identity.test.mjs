import assert from "node:assert/strict";
import test from "node:test";
import { sandboxOwner } from "../lib/sandbox-identity.mts";

test("production requires a runtime owner", () => {
  for (const props of [undefined, {}, { SPORTIX_SANDBOX_OWNER: "" },
    { SPORTIX_SANDBOX_OWNER: " owner-a " }, { SPORTIX_SANDBOX_OWNER: 42 }]) {
    assert.equal(sandboxOwner(props), null);
  }
});

test("the sandbox preserves distinct verified owner keys", () => {
  assert.equal(sandboxOwner({ SPORTIX_SANDBOX_OWNER: "owner-a" }), "owner-a");
  assert.equal(sandboxOwner({ SPORTIX_SANDBOX_OWNER: "owner-b" }), "owner-b");
});

test("only explicit local preview enables its fixed synthetic owner", () => {
  assert.equal(sandboxOwner({}, true), "local-preview-owner");
  assert.equal(sandboxOwner({}, false), null);
});
