import { expect, test } from "vitest";
import { isCSAskingMoreContext, phaseChecker } from "./conversation-grader";
import { AIMessage, HumanMessage } from "@langchain/core/messages";

test('Expecting "yes" when agent ask for faulty product info', async () => {
  const messages = [
    new AIMessage("Hello", { from: "ai" }),
    new HumanMessage("Hello, how can I help you?"),
    new AIMessage("My product is faulty, please give me a refund"),
    new HumanMessage("Hello, may I know what's product you bought?"),
  ];

  expect(await isCSAskingMoreContext(messages)).toBe("yes");
  const phase = await phaseChecker(messages);
  expect(phase).toBe("2");
});

test('Expecting "yes" after greetings', async () => {
  const messages = [
    new AIMessage("Hello", { from: "ai" }),
    new HumanMessage("Hello, how can I help you?"),
  ];

  expect(await isCSAskingMoreContext(messages)).toBe("yes");
  expect(await phaseChecker(messages)).toBe("1");
});

test('Expecting "yes" after if just get angry without provide context', async () => {
  const messages = [
    new AIMessage("Hello"),
    new HumanMessage("Hello, how can I help you?"),
    new AIMessage(
      "Help me? Really? I've been trying to get help for the past week and no one seems to care about my problem!"
    ),
    new HumanMessage(
      "I'm really sorry to hear that you're frustrated. Can you please tell me more about the issue you're experiencing so I can assist you?"
    ),
  ];

  expect(await isCSAskingMoreContext(messages)).toBe("yes");
  expect(await phaseChecker(messages)).toBe("2");
});

test('Expecting "no" even after a resolution provided', async () => {
  const messages = [
    new AIMessage("Hello"),
    new HumanMessage("Hello, how can I help you?"),
    new AIMessage(
      "Help me? Really? I've been trying to get help for the past week and no one seems to care about my problem!"
    ),
    new HumanMessage(
      "I see that there have been several tickets opened for your issue. It looks like a technician was scheduled to come to your house, but there was a miscommunication, and they didn't show up. I'm very sorry about that. Let me reschedule this for the earliest possible time."
    ),
  ];
  const action = await isCSAskingMoreContext(messages);
  console.log("re-assurance action", action);

  expect(action).toBe("no");
  expect(await phaseChecker(messages)).toBe("3");
});

test('Expecting "no" even after 1st time re-assurance provided', async () => {
  const messages = [
    new AIMessage("Hello"),
    new HumanMessage("Hello, how can I help you?"),
    new AIMessage(
      "Help me? Really? I've been trying to get help for the past week and no one seems to care about my problem!"
    ),
    new HumanMessage(
      "I see that there have been several tickets opened for your issue. It looks like a technician was scheduled to come to your house, but there was a miscommunication, and they didn't show up. I'm very sorry about that. Let me reschedule this for the earliest possible time."
    ),
    new AIMessage(
      "A miscommunication? That's what you're calling it? This is unacceptable. I want this fixed today!"
    ),
    new HumanMessage(
      "I completely understand your frustration. I will do everything I can to expedite this for you. Unfortunately, our earliest available appointment is tomorrow morning. I will personally ensure that a technician comes out first thing in the morning. Additionally, I will apply a credit to your account for the downtime you've experienced."
    ),
    new AIMessage(
      "Tomorrow? I've heard that before. How do I know this won't be another no-show?"
    ),
    new HumanMessage(
      " I assure you, I will follow up personally to make sure the technician arrives as scheduled. I will also give you my direct line so you can contact me if there are any further issues."
    ),
    new AIMessage(
      "Tomorrow? Are you kidding me? You're telling me that after a week of waiting and multiple no-shows, the earliest I can get a technician is tomorrow? That's unacceptable. I've already wasted a week of my time, and now you're telling me I have to wait another day? What's to stop this technician from not showing up again? I want a guarantee that this technician will actually show up and fix my issue today. If not, I'm taking my business elsewhere. And what's with the credit to my account? Is that supposed to make up for the inconvenience and frustration I've experienced? It's not enough. I want a real solution, not just a Band-Aid fix. Fix my problem today, or I'm taking my business elsewhere."
    ),
    new HumanMessage(
      "I am deeply apologize for the frustration. But I can assure you that the technician will come by tomorrow. I will make sure of it."
    ),
  ];
  const action = await isCSAskingMoreContext(messages);
  console.log("re-assurance action 2", action);

  expect(action).toBe("no");
  expect(await phaseChecker(messages)).toBe("3");
});
