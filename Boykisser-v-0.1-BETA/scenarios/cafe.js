const scenarios = [
  {
    prompt: "The waiter spills a drink on your starkisser! What do you do?",
    steps: [
      {
        question: "Do you want to:",
        choices: {
          A: "Laugh it off and tip the waiter.",
          B: "Complain to the manager.",
          C: "Quietly clean up the mess.",
        },
        outcomes: {
          A: { coins: 10, xp: 5, nextStep: 1 },
          B: { coins: 20, nextStep: null },
          C: { xp: 10, nextStep: null },
        },
      },
      {
        question: "The manager offers free dessert as an apology. Do you:",
        choices: {
          A: "Accept the dessert graciously.",
          B: "Politely decline.",
        },
        outcomes: {
          A: { xp: 15, coins: 5 },
          B: { xp: 10 },
        },
      },
    ],
  },
  {
    prompt: "A romantic song starts playing, and everyone around begins to dance. What do you do?",
    steps: [
      {
        question: "Do you:",
        choices: {
          A: "Ask your starkisser to dance with you.",
          B: "Sit and enjoy the moment together.",
          C: "Feel too shy and leave the dance floor.",
        },
        outcomes: {
          A: { xp: 15, coins: 5, nextStep: 1 },
          B: { coins: 10, nextStep: null },
          C: { xp: 5, nextStep: null },
        },
      },
      {
        question: "Your starkisser pulls you onto the dance floor. Do you:",
        choices: {
          A: "Let loose and dance your heart out.",
          B: "Dance reluctantly but smile through it.",
        },
        outcomes: {
          A: { xp: 20, coins: 10 },
          B: { xp: 10 },
        },
      },
    ],
  },
];

module.exports = async (interaction, user, target, User) => {
  // Randomly select a scenario
  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];

  // Display the prompt
  await interaction.channel.send(`**Scenario:** ${scenario.prompt}`);

  // Step-by-step decision tree
  let currentStep = 0;

  const askQuestion = async () => {
    const step = scenario.steps[currentStep];
    if (!step) return; // Exit if no step is defined

    // Send the question and choices as a normal message in the channel
    await interaction.channel.send(
      `${step.question}\n\n` +
        Object.entries(step.choices)
          .map(([key, choice]) => `**${key}**: ${choice}`)
          .join("\n")
    );

    // Message collector for user input
    const filter = (response) =>
      [user.userId, target.userId].includes(response.author.id) &&
      Object.keys(step.choices).includes(response.content.toUpperCase());

    const collector = interaction.channel.createMessageCollector({
      filter,
      max: 1,
      time: 60000,
    });

    collector.on("collect", async (response) => {
      const choice = response.content.toUpperCase();
      const outcome = step.outcomes[choice];

      if (outcome) {
        // Apply rewards to the responding user
        const respondingUser = await User.findOne({
          where: { userId: response.author.id },
        });

        console.log(`Before Update - User: ${respondingUser.userId}, Coins: ${respondingUser.coinsInventory}, XP: ${JSON.stringify(respondingUser.kisserXP)}`);

        // Update coins if necessary
        if (outcome.coins) respondingUser.coinsInventory += outcome.coins;

        // Directly update the XP in the database using User.update
        if (outcome.xp) {
          const kisser = respondingUser.favouriteKisser;

          // Directly update the kisserXP field in the database
          await User.update(
            { kisserXP: { ...respondingUser.kisserXP, [kisser]: (respondingUser.kisserXP[kisser] || 0) + outcome.xp } },
            { where: { userId: respondingUser.userId } }
          );
        }

        // Log the changes to the user's data
        const updatedUser = await User.findOne({ where: { userId: respondingUser.userId } });
        console.log(`After Update - User: ${updatedUser.userId}, Coins: ${updatedUser.coinsInventory}, XP: ${JSON.stringify(updatedUser.kisserXP)}`);

        // Inform the user of their choice and rewards
        await interaction.channel.send(
          `${response.author.username} chose **${choice}** and received their rewards!`
        );

        // Proceed to the next step if available
        if (outcome.nextStep !== null) {
          currentStep = outcome.nextStep;
          askQuestion();
        } else {
          interaction.channel.send(
            `The scenario has ended! Rewards have been distributed.`
          );
        }
      }
    });

    collector.on("end", (collected) => {
      if (collected.size === 0) {
        interaction.channel.send("Time ran out! No decision was made.");
      }
    });
  };

  askQuestion(); // Start the decision tree
};
