import { existsSync, promises as fs } from "fs";
import * as path from "path";
import * as gitignoreParser from "gitignore-parser";

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
        const codelfPath = path.join(rootPath, ".codelf.config");
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