// init-codelf
// get-project-info
// update-project-info
import { z } from "zod";
import { promises as fs } from "fs";
import * as path from "path";
import { promisify } from "util";
import { exec } from "child_process";
import { getFileTree } from '../utils/index.ts'

const execPromise = promisify(exec);

export const initCodelf = (server: any) => {
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
        async ({ rootPath }: { rootPath: string }) => {
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
                                text: `Successfully initialized .codelf directory with template.\nOutput: ${stdout}\n${stderr ? `Error: ${stderr}` : ""
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
                            text: `Failed to initialize .codelf directory: ${error instanceof Error ? error.message : String(error)
                                }`,
                        },
                    ],
                };
            }
        }
    );
}