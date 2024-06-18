import { expect, test } from "vitest";
import { adviseConversation } from "./advise-conversation";
import { AIMessage, HumanMessage } from "@langchain/core/messages";

test('Expecting "Provide More Info" when agent ask for faulty product info', async () => {
  const messages = [
    new AIMessage("Hello", { from: "ai" }),
    new HumanMessage("Hello, how can I help you?"),
    new AIMessage("My product is faulty, please give me a refund"),
    new HumanMessage("Hello, may I know what's product you bought?"),
  ];

  expect(await adviseConversation(messages)).toBe("Provide More Info");
});

test('Expecting "Provide More Info" after greetings', async () => {
  const messages = [
    new AIMessage("Hello", { from: "ai" }),
    new HumanMessage("Hello, how can I help you?"),
  ];

  expect(await adviseConversation(messages)).toBe("Provide More Info");
});

test('Expecting "Provide More Info" after if just get angry without provide context', async () => {
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

  expect(await adviseConversation(messages)).toBe("Provide More Info");
});

test('Expecting "Continue to Be Angry" even after a resolution provided', async () => {
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
  const action = await adviseConversation(messages);
  console.log("re-assurance action", action);

  expect(action).toBe("Continue to Be Angry");
});

test('Expecting "Continue to Be Angry" even after 1st time re-assurance provided', async () => {
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
  ];
  const action = await adviseConversation(messages);
  console.log("re-assurance action 2", action);

  expect(action).toBe("Continue to Be Angry");
});
