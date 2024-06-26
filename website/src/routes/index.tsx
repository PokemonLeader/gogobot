import { component$ } from "@builder.io/qwik";
import { type DocumentHead, Link } from "@builder.io/qwik-city";
import Button from "~/components/button";

export default component$(() => {
  return (
    <div class="h-full flex justify-center items-center relative">
      <div class="w-[min(100%_-_48px,500px)] relative">
        <h1 class="font-bold text-4xl text-center">GoGoBot</h1>
        <div class="h-10" />
        <p class="text-center">
          Multi-purpose Discord bot.{" "}
          <Link href="/about" class="link">
            Learn more
          </Link>
        </p>
        <div class="h-3" />
        <div class="flex justify-center gap-1">
          <Button href="https://discord.com/oauth2/authorize?client_id=805075861463367710">
            Invite bot
          </Button>
          <Button appearance="ghost" href="https://discord.gg/kyVfcGuCCQ">
            Support server
          </Button>
          <Button appearance="ghost" href="https://github.com/TheUndo/gogobot/">
            GitHub
          </Button>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "GoGoBot",
  meta: [
    {
      name: "description",
      content: "The best economy/clan/anime Discord bot!",
    },
    {
      property: "og:title",
      content: "GoGoBot",
    },
    {
      property: "og:description",
      content: "GoGoBot is an economy/clan/anime Discord bot!",
    },
    {
      property: "og:image",
      content: "/logo-small.png",
    },
    {
      property: "og:image:alt",
      content: "GoGoBot logo",
    },
  ],
};
