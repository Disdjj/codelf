## Codelf
> 项目使用的技术、工具库及对应依赖版本如下：
> TypeScript（v5.7.3）、Node.js、@modelcontextprotocol/sdk（v1.5.0）、Zod（v3.24.2）

## 项目结构

> 文件级别的分析对于理解项目至关重要。

> 以下是项目的目录结构，并对重要部分进行了注释说明。

root
- .codelf                  // 项目文档目录，存放项目相关的说明文档
- .git                     // Git版本控制目录
- .gitignore               // Git忽略文件配置
- index.ts                 // 主入口文件，包含MCP服务器实现和工具函数定义
- node_modules             // Node.js依赖包目录
- package.json             // 项目配置文件，定义依赖和脚本
- pnpm-lock.yaml           // pnpm包管理器锁定文件
- README.md                // 英文版项目说明文档
- README_CN.md             // 中文版项目说明文档
- tsconfig.json            // TypeScript配置文件

### 核心功能

该项目是一个MCP（Model Context Protocol）服务器实现，主要提供以下工具功能：

1. `get-project-info` - 获取项目详细信息，帮助AI更好地理解代码
2. `update-project-info` - 更新项目信息，维护.codelf目录下的文档
3. `init-codelf` - 初始化.codelf目录和文件，帮助建立项目文档结构

项目通过Node.js实现，使用TypeScript进行开发，主要面向AI代码助手提供上下文信息。
