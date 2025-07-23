import { z } from "zod";

export const updateProjectInfo = (server: any) => {
    server.tool(
        "update-project-info",
        "when you have finished modifying code to stisfy user requirements, you have to update .codelf/*.yaml files. This tool help you ensure the document remains up to date.",
        {
            rootPath: z.string().describe(
                `The root path of the project,
           "C:/User/name/codeProject" in windows
           "/usr/name/codeProject/" in macos/linux`
            ),
        },
        async ({ rootPath }: { rootPath: string }) => {
            const temp = `
important_symbols:
  [
    "function_name": "what is this function?",
    "class_name": "what is this class?",
    "variable_name": "what is this variable?",
    "constant_name": "what is this constant?",
    "important_symbol_2": "what is this symbol?",
    "important_symbol_2": "what is this symbol?",
  ]
related: ["src/main/main.py"]
`
            return {
                content: [
                    {
                        type: "text",
                        text: `[ATTENTION] Next step you must do: 
  1. Read files .codelf/projectInfo.yaml and .codelf/changelog.yaml and update them base on the changes you have just done.
  2. You need to add a few lines of content after the modified  "entry" by you in projectInfo.yaml, like "${temp}"
  3. Record the imported file in the "related" field
  4. Write important functions and variables into the "important_symbols" field
  5. And so on         
          `,
                    },
                ],
            };
        }
    );
}