import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  type Interaction,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { prisma } from "../../../core/db/prisma";
import { makeCommand } from "../../../gogo/scraper/debug";
import { domain } from "../../../gogo/scraper/utils";
import { getCommands } from "../../routers/commands";
import {
  ButtonAction,
  type ButtonActionFormat,
  Colors,
  type Command,
  SelectAction,
} from "../../types";

const pageSize = 25;

export const subscriptions = {
  data: new SlashCommandBuilder()
    .setName("subscriptions")
    .setDescription("View your subscription list"),
  async execute(interaction: Interaction) {
    if (!interaction.isRepliable()) {
      return;
    }

    return await interaction.reply({
      ...(await createSubScriptionList(interaction.user.id)),
      ephemeral: interaction.inGuild(),
    });
  },
} satisfies Command;

export async function createSubScriptionList(
  userDiscordId: string,
  rawPage = 1,
) {
  const commands = await getCommands();
  const totalCount = await prisma.animeSubscription.count({
    where: {
      userDiscordId,
    },
  });

  const page = Math.max(1, Math.min(Math.ceil(totalCount / pageSize), rawPage));

  const subscriptions = await prisma.animeSubscription.findMany({
    where: {
      userDiscordId,
    },
    include: {
      anime: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: pageSize,
    skip: (page - 1) * pageSize,
  });

  if (!subscriptions.length) {
    const subscribeCommand = commands.get("subscribe");

    if (!subscribeCommand) {
      throw new Error("Subscribe command not found");
    }

    return {
      embeds: [
        new EmbedBuilder()
          .setTitle("You have no subscriptions")
          .setColor(Colors.Info)
          .setDescription(
            `Use ${makeCommand(
              "subscribe",
              subscribeCommand.id,
            )} to subscribe to an anime or click the subscribe button below.`,
          ),
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId(`${ButtonAction.ShowSubscribeModal}+void`)
            .setLabel("Subscribe")
            .setStyle(ButtonStyle.Primary),
        ),
      ],
    };
  }

  const embed = new EmbedBuilder()
    .setTitle("Subscriptions")
    .setColor(Colors.Info)
    .setDescription(
      [
        subscriptions
          .slice(0, pageSize)
          .map(
            (sub) => `- [${sub.anime.nameDisplay}](
          ${new URL(sub.anime.slug, `https://${domain.host}`)}
        )`,
          )
          .join("\n"),
      ].join("\n\n"),
    )
    .setFooter({
      text: `Showing ${(page - 1) * pageSize + 1}-${
        (page - 1) * pageSize + subscriptions.length
      } of ${totalCount}`,
    });

  const row = new ActionRowBuilder<ButtonBuilder>();

  row.addComponents(
    new ButtonBuilder()
      .setCustomId(
        `${ButtonAction.SubscriptionListChangePage}+${
          page - 1
        }` satisfies ButtonActionFormat,
      )
      .setEmoji("⬅️")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 1),
  );

  row.addComponents(
    new ButtonBuilder()
      .setCustomId(
        `${ButtonAction.SubscriptionListChangePage}+${
          page + 1
        }` satisfies ButtonActionFormat,
      )
      .setEmoji("➡️")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled((page - 1) * pageSize + subscriptions.length >= totalCount),
  );

  const secondRow =
    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(SelectAction.UnsubscribeFromSubscriptions)
        .setPlaceholder("Unsubscribe from anime")
        .setMinValues(1)
        .addOptions(
          ...subscriptions.map((sub) =>
            new StringSelectMenuOptionBuilder()
              .setLabel(sub.anime.nameDisplay)
              .setValue(`${sub.anime.id.toString()}+${page}`),
          ),
        ),
    );

  return {
    embeds: [embed],
    components: [row, secondRow],
  };
}
