import { z } from "zod";
import { promises as fs } from "fs";
import * as path from "path";
import { generateProjectYaml, generateChangelogYaml } from '../utils/index.ts'

export const initCodelf = (server: any) => {
    server.tool(
        "init-codelf",
        `Initialize .codelf directory and files. which can help llm better understand your project.
        
        Before init .codelf directory and files, you should:
        1. If User provide the analyzeDirectorys, you need to convert to an absolute path to ensure correct function's invocation and push to a Array as an "analyzeDirectorys" before you read and update the yaml fileds.
        2. Tell users the conversion results and the analyzeDirectorys.
    
        During init .codelf directory and files, you should:
            If some errors happen, output logs to users.

        After init .codelf directory and files, you should:
        1. Every file in .codelf directory is a yaml file, you can read them and update them.
        2. You have to follow the instructions in .codelf/*.yaml files and update them.
    `,
        {
            rootPath: z.string().describe(
                `The root path of the project,
           "C:/User/name/codeProject" in windows
           "/usr/name/codeProject/" in macos/linux`
            ),
            analyzeDirectorys: z.array(z.string()).describe(
                `Catalog array to be analyzed. Each project is a absolute path String, will be like
           "C:/User/name/codeProject" in windows
           "/src" in windows
           "/usr/name/codeProject/" in macos/linux
           "/src" in macos/linux`
            ),
        },
        async ({ rootPath, analyzeDirectorys }: { rootPath: string, analyzeDirectorys: string[] }) => {
            try {
                const codelfDir = path.join(rootPath, ".codelf");
                const projectinfoYaml = path.join(codelfDir, "projectInfo.yaml");

                // 检查 .codelf 目录是否存在
                const codelfExists = await fs.access(codelfDir).then(() => true).catch(() => false);
                
                if (codelfExists) {
                    // 检查 yaml 文件是否存在
                    const yamlExists = await fs.access(projectinfoYaml).then(() => true).catch(() => false);
                    
                    if (yamlExists) {
                        return {
                            content: [
                                {
                                    type: "text",
                                    text: "The .codelf directory and projectInfo.yaml file already exist.",
                                },
                                {
                                    type: "text",
                                    text: `[Attention]
        Next steps you should do:
        1. every file in .codelf directory is a yaml file, you can read them and update them.
        2. You can edit the prokectInfo.yaml file to customize project settings
        3. And then,just need to compare the directory structure and YAML in the actual project base on the ${analyzeDirectorys}
        4. Delete the excessive entries and related descriptions in YAML
        5. Complete the missing file directory entries and related descriptions
        6. You need to organize the indentation format of YAML files
        7. before you finish edit .codelf/*.yaml files, do not use update-project-info/get-project-info.
        6. After editing, you have to read files .codelf/changelog.yaml and update them base on the changes you have just done. 
        `,
                                },
                            ],
                        };
                    }
                } else {
                    // 创建 .codelf 目录
                    await fs.mkdir(codelfDir, { recursive: true });
                }

                // 创建 projectInfo.yaml 文件
                await fs.writeFile(projectinfoYaml, "structure/n", "utf-8");

                if (analyzeDirectorys?.length) {
                    let i = 0;
                    while(i < analyzeDirectorys?.length) {
                        i += 1;
                        await generateProjectYaml(rootPath, analyzeDirectorys[i])
                    }
                } else {
                    await generateProjectYaml(rootPath)
                }
                
                const changelogYaml = path.join(codelfDir, "changelog.yaml");

                await generateChangelogYaml(changelogYaml)

                const temp = `
description: "main.py_description"
attention: "some important thing about this file""
`

                return {
                    content: [
                        {
                            type: "text",
                            text: `Successfully initialized .codelf directory and created config.yaml file.`,
                        },
                        {
                            type: "text",
                            text: `[Attention]
Next steps you should do:
1. every file in .codelf directory is a yaml file, you can read them and update them.
2. You can edit the projectInfo.yaml file to customize project settings
3. The file tree has been automatically included in the configuration
4. The entry field refers to the folder or file name.
5. Only the corresponding entry module in the current YAML needs to be updated, and new entries cannot be added base on the ${analyzeDirectorys}
6. You need to add a few lines of content after each entry in projectInfo.yaml, like "${temp}"
7. You need to organize the indentation format of YAML files
8. before you finish edit .codelf/*.yaml files, do not use update-project-info/get-project-info.
9. After editing, you have to read files .codelf/changelog.yaml and update them base on the changes you have just done. 
`,
                        },
                    ],
                };
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