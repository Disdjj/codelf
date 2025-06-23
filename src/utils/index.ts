import { existsSync, promises as fs } from "fs";
import * as path from "path";
import * as gitignoreParser from "gitignore-parser";
import dayjs from "dayjs";

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


// 用于解析.gitignore文件的函数
export async function parseGitignore(
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

export async function getFileTree(rootPath: string): Promise<string> {
    const indent = "    ";

    // 递归处理单个路径（目录或文件）
    const processEntry = async (entryPath: string, displayName: string, prefix: string, relativePath: string): Promise<string[]> => {
        const stat = await fs.stat(entryPath).catch(() => null);
        const lines: string[] = [];
        if (stat && stat.isDirectory()) {
            lines.push(`${prefix}- ${displayName}`);
            const entries = await fs.readdir(entryPath, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory() && forceBlackList.includes(entry.name)) continue;
                const entryRelativePath = path.join(relativePath, entry.name).replace(/\\/g, "/");
                const subPath = path.join(entryPath, entry.name);
                lines.push(...(await processEntry(subPath, entry.name, prefix + indent, entryRelativePath)));
            }
        } else if (stat && stat.isFile()) {
            lines.push(`${prefix}- ${displayName}`);
        }
        return lines;
    };

    const buildTree = async (
        dir: string,
        prefix: string,
        relativePath: string = ""
    ): Promise<string[]> => {
        const codelfPath = path.join(dir, ".codelf.config");
        const result: string[] = [];
        const existsCodelfFile = existsSync(codelfPath) && !(await fs.stat(codelfPath)).isDirectory();

        if (existsCodelfFile && dir === rootPath) {
            // 读取 .codelf.config 文件内容
            const content = await fs.readFile(codelfPath, "utf-8");
            const lines = content
                .split(/\r?\n/)
                .map((l) => l.trim())
                .filter((l) => l && !l.startsWith("#"));
            if (lines.length) {
                for (const line of lines) {
                    const entryPath = path.join(rootPath, line);
                    result.push(...(await processEntry(entryPath, line, prefix, line.replace(/\\/g, "/"))));
                }
                return result;
            }
        }

        // 原有递归逻辑
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isDirectory() && forceBlackList.includes(entry.name)) {
                continue;
            }

            // 尝试解析.gitignore文件
            // 如果.gitignore存在且解析成功，使用其规则；否则使用默认黑名单
            const entryRelativePath = path
                .join(relativePath, entry.name)
                .replace(/\\/g, "/");
            const isIgnore = await parseGitignore(rootPath, entryRelativePath);

            // 使用.gitignore规则或默认黑名单进行过滤
            const shouldIgnore =
                typeof isIgnore === "boolean"
                    ? isIgnore
                    : folderBlackList.includes(entry.name);
            if (!shouldIgnore) {
                const entryPath = path.join(dir, entry.name);
                result.push(...(await processEntry(entryPath, entry.name, prefix, entryRelativePath)));
            }
        }

        return result;
    };

    const result = await buildTree(rootPath, "", "");
    return ["root", ...result].join("\n");
}

export async function generateProjectYaml(rootPath: string, analyzeDirectory?: string) {
    if (!rootPath) return
    console.log("rootPath", rootPath)
    try {
        // 设置默认的输出路径
        const outputPath = path.join(rootPath, ".codelf", "projectInfo.yaml");
        analyzeDirectory = analyzeDirectory || rootPath;
        
        // 递归解析目录结构
        const analyzeStructure = async (dirPath: string): Promise<any[]> => {
            const items: any[] = [];
            
            try {
                const entries = await fs.readdir(dirPath, { withFileTypes: true });
                
                for (const entry of entries) {
                    // 跳过黑名单中的文件和文件夹
                    if (forceBlackList.includes(entry.name)) {
                        continue;
                    }
                    
                    const entryPath = path.join(dirPath, entry.name);
                    const relativePath = path.relative(dirPath, entryPath).replace(/\\/g, "/");
                    
                    // 检查是否应该忽略此项
                    const isIgnore = await parseGitignore(dirPath, relativePath);
                    const shouldIgnore = typeof isIgnore === "boolean" 
                        ? isIgnore 
                        : folderBlackList.includes(entry.name);
                    
                    if (!shouldIgnore) {
                        if (entry.isDirectory()) {
                            // 处理目录
                            const subItems = await analyzeStructure(entryPath);
                            const dirItem = {
                                entry: entry.name,
                                ...(subItems.length > 0 && { subs: subItems })
                            };
                            items.push(dirItem);
                        } else if (entry.isFile()) {
                            // 处理文件
                            const fileItem = {
                                entry: entry.name,
                            };
                            items.push(fileItem);
                        }
                    }
                }
            } catch (error) {
                console.error(`Error reading directory ${dirPath}:`, error);
            }
            
            return items;
        };

        // 生成结构
        const structure = await analyzeStructure(analyzeDirectory);
        
        // 生成YAML内容
        const generateYamlContent = (obj: any, indent: number = 0): string => {
            const spaces = "  ".repeat(indent);
            let result = "";
            
            if (Array.isArray(obj)) {
                for (const item of obj) {
                    result += `${spaces}- ${generateYamlContent(item, 0).trim()}\n`;
                }
                return result;
            }
            
            if (typeof obj === "object" && obj !== null) {
                const entries = Object.entries(obj);
                for (let i = 0; i < entries.length; i++) {
                    const [key, value] = entries[i];
                    if (key === "entry" && i === 0) {
                        result += `entry: "${value}"\n`;
                    } else if (typeof value === "string") {
                        result += `${spaces}${key}: "${value}"\n`;
                    } else if (Array.isArray(value)) {
                        if (key === "subs") {
                            result += `${spaces}${key}:\n`;
                            for (const sub of value) {
                                result += `${spaces}  - ${generateYamlContent(sub, indent + 2).trim()}\n`;
                            }
                        } else {
                            result += `${spaces}${key}:\n${generateYamlContent(value, indent + 1)}`;
                        }
                    } else {
                        result += `${spaces}${key}:\n${generateYamlContent(value, indent + 1)}`;
                    }
                }
                return result;
            }
            
            return String(obj);
        };
        
        // 获取最后一级目录名
        const dirName = path.basename(analyzeDirectory);
        
        // 构造完整的YAML内容，将最后一级目录作为根entry
        console.log("outputPath", outputPath)
        const yamlContent = `- entry: "${dirName}"\n  subs:\n${generateYamlContent(structure, 2)}`;
        
        // 写入文件
        await fs.appendFile(outputPath, yamlContent, "utf-8");
        
        console.log(`项目YAML文件已生成: ${outputPath}`);
        return yamlContent;
        
    } catch (error) {
        console.error("生成项目YAML文件时出错:", error);
        throw error;
    }
}

export async function generateChangelogYaml(outputPath: string) {
    if (!outputPath) return
    const yamlContent = `
${dayjs().format("YYYY-MM-DD HH:mm:ss")}:
  title: "changelog_title"
  content: "changelog_content"
`;
    
    // 写入文件
    fs.writeFile(outputPath, yamlContent, "utf-8");
}