# Codelf

> 由 DJJ 和 Dannielee 开发

[![EN](https://img.shields.io/badge/Language-English-blue.svg)](./README.md)

Codelf 是一个强大的AI辅助编码工具，通过模型上下文协议（Model Context Protocol，MCP）为AI代理提供更好的代码理解和修改能力。

## MCP 设置

添加 MCP 设置
```
{
  "mcpServers": {
    "codelf": {
      "command": "npx",
      "args": ["codelf"]
    }
  }
}
```

1. 在Cursor/Windsurf代理模式下通过发送以下命令初始化codelf：
```
do init-codelf and follow the instructions
```

2. 在大多数情况下，提示将由codelf自动组装

3. 当代理完成编写后，你可以提示：
```
do update-project-info
```

## Cursor 设置

1. 进入 `设置` -> `规则` -> `用户规则`
2. 添加内容
```
在回应或修改代码之前，应首先通过`get-project-info`获取全面信息，然后再做决定。
```
3. 添加内容
```
每次完成代码编辑后，调用`update-project-info`并按照响应中的指示进行操作
```
4. 如果你使用的是Windows系统，添加
```
我当前使用的是Windows系统。使用类似"C:\Users\..."的路径格式
```

## Windsurf 设置

1. 进入 `设置` -> `cascade` -> `记忆和规则` -> `全局规则`
2. 添加内容
```
在回应或修改代码之前，应首先通过`get-project-info`获取全面信息，然后再做决定。
每次完成代码编辑后，调用`update-project-info`并按照响应中的指示进行操作
```
3. 如果你使用的是Windows系统，添加
```
我当前使用的是Windows系统。使用类似"C:\\Users\\..."的路径格式
```

## 核心功能

### AI IDE 友好
- 自动分析项目语言/结构/目的
- 在编辑/代理模式下读取代码块
- 记录每个LLM请求以便追踪

### MCP 支持
- 全面的项目结构
- 完整的代码标准

### 自适应变化
- 文件树
- 项目结构变更
- 代码标准验证

## 项目结构

项目使用TypeScript开发，主要文件结构如下：

- `.codelf` - 项目文档目录，存放项目相关的说明文档
- `index.ts` - 主入口文件，包含MCP服务器实现和工具函数定义
- `package.json` - 项目配置文件，定义依赖和脚本
- `tsconfig.json` - TypeScript配置文件

## 技术栈

- TypeScript（v5.7.3）
- Node.js
- @modelcontextprotocol/sdk（v1.5.0）
- Zod（v3.24.2）

## 主要功能

该项目是一个MCP（Model Context Protocol）服务器实现，主要提供以下工具功能：

1. `get-project-info` - 获取项目详细信息，帮助AI更好地理解代码
2. `update-project-info` - 更新项目信息，维护.codelf目录下的文档
3. `init-codelf` - 初始化.codelf目录和文件，帮助建立项目文档结构
