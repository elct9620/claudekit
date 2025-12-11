---
name: Testing Quality
paths: **/tests/**/*.{ts,js}
---

# Testing Quality

This document outlines the criteria for evaluating the quality of tests. For each test, we assert its quality passed over 80% rubric score.

## Criteria

Following are the criteria used to evaluate the quality of tests, review step by step and give reasoning to explain why implementation can get the score.

### Test Case Naming (1 points)

The `vitest` outputs `feature > context > scenario` format, that means our test case should naming like this:

```ts
describe("Review Reminder", () => {
  describe("when rubric config is provided", () => {
    it("is expected to allow with additional context", () => {
      // test implementation
    });
  });
});
```

- Use `when` to describe the context or condition under which the test is executed.
- Use `is expected to` to describe the expected outcome or behavior of the test.

### Behavior-Driven Development (BDD) Style Step (1 points)

To make each test case more readable, we split the details into `tests/stpes` folder, and use BDD style to name the step function, like:

```ts
import { reviewReminderAction } from "@/handlers/hook/ReviewReminder"; // The action to be tested, the naming is allowed to be different

it("is expected to allow with additional context", async () => {
  await givenHookInput({});
  await reviewReminderAction();
  await thenHookOutputShouldBeEmpty();
});
```

- The `given` step is used to set up the initial state or context for the test.
- The `when` step usually import from `src/handlers` folder, which is the action to be tested.
- The `then` step is used to assert the expected outcome or behavior of the test.

### Mock or Stub When Necessary (1 points)

We prefer to cover more realistic scenarios, so we only mock when necessary for low-level components which hard to setup or control, like `fs`, `path`, `child_process`, etc.

For example, we use dependency injection to create a `JsonConfigService` stub because it read config from file system:

```ts
export async function givenConfig(config: ConfigSchema) {
  const jsonConfig = container.resolve(JsonConfigService);

  const spy = vi.spyOn(jsonConfig, "load").mockImplementation(async () => {
    return config;
  });
  container.register(IConfigService, {
    useValue: jsonConfig,
  });

  return spy;
}
```

For other high-level components, we prefer to use real implementation to cover more realistic scenarios.

- Use DI (Dependency Injection) to inject mock or stub implementations of dependencies.
- Minimize the use of mocking to only when necessary for low-level components.

## Scoring

Each criterion only get the point when it is fully satisfied, otherwise get 0 point.
