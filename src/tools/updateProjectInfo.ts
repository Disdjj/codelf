import { z } from "zod";

export const updateProjectInfo = (server: any) => {
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
        async ({ rootPath }: { rootPath: string }) => {
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
}