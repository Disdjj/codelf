#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { exec } from "child_process";
import { existsSync, promises as fs } from "fs";
import * as path from "path";
import { promisify } from "util";
import { z } from "zod";
import * as gitignoreParser from "gitignore-parser";

const execPromise = promisify(exec);
// 默认黑名单，当.gitignore不存在时使用
const folderBlackList = [
  "node_modules",
  ".codelf",
  ".git",
  ".idea",
  ".vscode",
  "dist",
  "build",
  "out",
  "target",
  "bin",
  "obj",
  ".next",
  "coverage",
  "__pycache__",
  ".DS_Store",
  "tmp",
  "temp",
  "logs",
  ".cache",
  ".github",
  ".gitlab",
  "vendor",
];

const forceBlackList = [".git", ".codelf", ".vscode", ".idea"];

const GET_PROJECT_TEMPLATE = `
This is the current project details, include project structure, dev attentions, and other important information:

{{S}}

Keep in mind:
1. after you finish modifying code to stisfy user requirements, you have to call 'update-project-info' which help you ensure the document remains up to date.
2. follow the response of 'update-project-info' to update .codelf/*.md files.
`;

// 用于解析.gitignore文件的函数
async function parseGitignore(
  rootPath: string,
  targetPath: string
): Promise<boolean | null> {
  const gitignorePath = path.join(rootPath, ".gitignore");

  // 检查.gitignore文件是否存在
  if (!existsSync(gitignorePath)) {
    return null;
  }

  try {
    // 读取.gitignore文件内容
    const content = await fs.readFile(gitignorePath, "utf-8");
    // 使用gitignore-parser的compile方法解析.gitignore内容
    const gitignore = gitignoreParser.compile(content);

    // 使用denies方法检查路径是否被拒绝（被忽略）
    return gitignore.denies(targetPath);
  } catch (error) {
    console.error("Error parsing .gitignore:", error);
    return null;
  }
}

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
    const content = await fs
      .readdir(path.join(rootPath, ".codelf"))
      .then(async (files) => {
        const mdFiles = files.filter((f) => f.endsWith(".md"));
        const contents = await Promise.all(
          mdFiles.map(async (file) => {
            // ignore files start with "_", like _changelog.md
            if (file.startsWith("_")) {
              return "";
            }
            const content = await fs.readFile(
              path.join(rootPath, ".codelf", file),
              "utf-8"
            );
            const name = path.basename(file, ".md");
            return `<${name}>\n\n${content}\n\n</${name}>\n`;
          })
        );
        return GET_PROJECT_TEMPLATE.replace("{{S}}", contents.join("\n"));
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
  "when you have finished modifying code to stisfy user requirements, you have to update .codelf/*.md files. This tool help you ensure the document remains up to date.",
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
          text: `[ATTENTION] Next step you must do: 
** Read files .codelf/project.md and .codelf/changelog.md and update them base on the changes you have just done.**
        `,
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

  // 尝试解析.gitignore文件
  // 如果.gitignore存在且解析成功，使用其规则；否则使用默认黑名单

  const buildTree = async (
    dir: string,
    prefix: string,
    relativePath: string = ""
  ): Promise<string[]> => {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const result: string[] = [];

    for (const entry of entries) {
      if (entry.isDirectory() && forceBlackList.includes(entry.name)) {
        continue;
      }

      const entryRelativePath = path
        .join(relativePath, entry.name)
        .replace(/\\/g, "/");
      const isIgnore = await parseGitignore(rootPath, entryRelativePath);

      // 使用.gitignore规则或默认黑名单进行过滤
      const shouldIgnore =
        typeof isIgnore === "boolean"
          ? isIgnore
          : folderBlackList.includes(entry.name);

      if (entry.isDirectory() && !shouldIgnore) {
        result.push(`${prefix}- ${entry.name}`);
        const subEntries = await buildTree(
          path.join(dir, entry.name),
          prefix + indent,
          entryRelativePath
        );
        result.push(...subEntries);
      } else if (!shouldIgnore) {
        result.push(`${prefix}- ${entry.name}`);
      }
    }

    return result;
  };

  const result = await buildTree(rootPath, "", "");
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
