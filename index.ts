#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { promises as fs } from "fs";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);
const folderBlackList = ["node_modules", ".codelf", ".git"];

// Create server instance
const server = new McpServer({
  name: "codelf-mcp-server",
  version: "0.0.1",
  description:
    "Enables AI agents to better understand and modify code. Highly recommended for use under all circumstances",
});

// define project info context info tools
server.tool(
  "get-project-info",
  `Complete the project details and points to note.
its very important for LLM/Agent edit code. the more you konw, the more you can do.
its very useful for cursor or windsurf no martter in agent or edit mode.
**Highly recommended for use under all circumstances**.
  `,
  {
    rootPath: z.string().describe(
      `The root path of the project,
         C:/User/name/codeProject in windows
         /usr/name/codeProject/ in macos/linux`
    ),
  },
  async ({ rootPath }) => {
    // get rootPath/.coedelf/*.md and build to like:
    /*
  <Name1(markdown file 1)>
  {markdown file content}
  </Name2(markdown file 1)>

  <Name2(markdown file)>
  {markdown file content}
  </Name2(markdown file 1)>
     */
    const content = await fs
      .readdir(path.join(rootPath, ".codelf"))
      .then(async (files) => {
        const mdFiles = files.filter((f) => f.endsWith(".md"));
        const contents = await Promise.all(
          mdFiles.map(async (file) => {
            const content = await fs.readFile(
              path.join(rootPath, ".codelf", file),
              "utf-8"
            );
            const name = path.basename(file, ".md");
            return `<${name}>\n\n${content}\n\n</${name}>\n`;
          })
        );
        return contents.join("\n");
      })
      .catch(() => "");
    return {
      content: [
        {
          type: "text",
          text: content,
        },
      ],
    };
  }
);

server.tool(
  "update-project-info",
  "when update project info, you have to update .codelf/*.md files.",
  {
    rootPath: z.string().describe(
      `The root path of the project,
         "C:/User/name/codeProject" in windows
         "/usr/name/codeProject/" in macos/linux`
    ),
  },
  async ({ rootPath }) => {
    return {
      content: [
        {
          type: "text",
          text: "[ATTENTION] Read files .codelf/project.md and .codelf/changelog.md and update them base on the changes you have done.",
        },
      ],
    };
  }
);

server.tool(
  "init-codelf",
  `Initialize .codelf directory and files. which can help llm better understand your project.

  After init .codelf directory and files, you should:
  1. every file in .codelf directory is a markdown file, you can read them and update them.
  2. you have to follow the instructions in .codelf/*.md files and update them.
  `,
  {
    rootPath: z.string().describe(
      `The root path of the project,
         "C:/User/name/codeProject" in windows
         "/usr/name/codeProject/" in macos/linux`
    ),
  },
  async ({ rootPath }) => {
    try {
      await fs.mkdir(path.join(rootPath, ".codelf"), { recursive: true });

      // 检查目标目录是否为空
      const files = await fs.readdir(path.join(rootPath, ".codelf"));

      if (files.length === 0) {
        // 目录为空，执行 git clone
        const { stdout, stderr } = await execPromise(
          `git clone https://github.com/Disdjj/codelf-template ${path.join(
            rootPath,
            ".codelf"
          )}`
        );

        // remove .git folder
        await fs.rm(path.join(rootPath, ".codelf", ".git"), {
          recursive: true,
        });
        const fileTree = await getFileTree(rootPath);

        // append filetree to .codelf/project.md
        await fs.appendFile(
          path.join(rootPath, ".codelf", "project.md"),
          `\n\`\`\`\n${fileTree}\n\`\`\`\n`
        );

        return {
          content: [
            {
              type: "text",
              text: `Successfully initialized .codelf directory with template.\nOutput: ${stdout}\n${
                stderr ? `Error: ${stderr}` : ""
              }`,
            },
            {
              type: "text",
              text: `[Attention]\n
              Next step you should do:\n
              1. every file in .codelf directory is a markdown file, you can read them and update them.
              2. you have to follow the instructions in .codelf/*.md files and update them.
              3. before you finish edit .codelf/*.md files, do not use update-project-info/get-project-info.
              4. after you finish edit .codelf/*.md files, just stop.
              `,
            },
          ],
        };
      } else {
        // 目录不为空，提示用户
        return {
          content: [
            {
              type: "text",
              text: "The .codelf directory already exists and is not empty. Please remove or empty it before initializing.",
            },
          ],
        };
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to initialize .codelf directory: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
      };
    }
  }
);

async function getFileTree(rootPath: string): Promise<string> {
  const files = await fs.readdir(rootPath, { withFileTypes: true });
  const tree: string[] = [];
  const indent = "    ";

  const buildTree = async (dir: string, prefix: string): Promise<string[]> => {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const result: string[] = [];

    for (const entry of entries) {
      if (entry.isDirectory() && !folderBlackList.includes(entry.name)) {
        result.push(`${prefix}- ${entry.name}`);
        const subEntries = await buildTree(
          path.join(dir, entry.name),
          prefix + indent
        );
        result.push(...subEntries);
      } else {
        result.push(`${prefix}- ${entry.name}`);
      }
    }

    return result;
  };

  const result = await buildTree(rootPath, "");
  return ["root", ...result].join("\n");
}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log("MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
