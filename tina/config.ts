import { defineConfig } from "tinacms";

const clientId = process.env.NEXT_PUBLIC_TINA_CLIENT_ID;
const token = process.env.TINA_TOKEN;

export default defineConfig({
  branch: process.env.TINA_BRANCH ?? "main",
  clientId,
  token,
  contentApiUrlOverride: !clientId
    ? "http://localhost:4001/graphql"
    : undefined,
  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      mediaRoot: "public/uploads",
      publicFolder: "public",
    },
  },
  schema: {
    collections: [
      {
        name: "learnMore",
        label: "Learn More Pages",
        path: "content/learnMore",
        format: "md",
        fields: [
          { type: "string", name: "title", label: "Title", isTitle: true, required: true },
          {
            type: "string",
            name: "category",
            label: "Category",
            options: ["drug", "pokemon"],
            required: true,
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
      },
    ],
  },
});
