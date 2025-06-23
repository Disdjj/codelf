
// define project info context info tools
import { z } from "zod";
import { promises as fs } from "fs";
import * as path from "path";

const GET_PROJECT_TEMPLATE = `
This is the current project details, include project structure:

{{S}}

Keep in mind:
1. after you finish modifying code to stisfy user requirements, you have to call 'update-project-info' which help you ensure the document remains up to date.
2. follow the response of 'update-project-info' to update .codelf/*.yaml files.
`;

export const getProjectInfo = (server: any) => {
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
        async ({ rootPath }: { rootPath: string }) => {
            const content = await fs
                .readdir(path.join(rootPath, ".codelf"))
                .then(async (files) => {
                    const yamlFiles = files.filter((f) => f.endsWith(".yaml"));
                    const contents = await Promise.all(
                        yamlFiles.map(async (file) => {
                            // ignore files start with "_", like _changelog.yaml
                            if (file.startsWith("_")) {
                                return "";
                            }
                            const content = await fs.readFile(
                                path.join(rootPath, ".codelf", file),
                                "utf-8"
                            );
                            const name = path.basename(file, ".yaml");
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

}
