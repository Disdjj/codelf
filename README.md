# Codelf

> By DJJ & Dannielee

[![CN](https://img.shields.io/badge/语言-中文版-red.svg)](./README_CN.md)

Codelf is a powerful AI-assisted coding tool that provides better code understanding and modification capabilities for AI agents through the Model Context Protocol (MCP).

## MCP Setup

add mcp settings
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

1. Initialize codelf in Cursor/Windsurf agent mode by sending the command:
```
do init-codelf and follow the instructions
```

1. In most cases, prompts will be automatically assembled by codelf

2. After the agent completes writing, you can prompt:

```
do update-project-info
```

## Cursor Setup

1. goto `Settings` -> `Rules` -> `User Rules`
2. add Content 
```
Before responding or modifying the code, one should first obtain comprehensive information via `get-project-info` before making any decisions.
Everytime you finish editing code, you must call `update-project-info` and follow the instructions from the response
```
3. if you are in windows, add 
    ```I am currently under the Windows system. Use like "C:\Users\..." to send Path```

## Windsurf Setup

1. goto `Settings` -> `cascade` -> `Memories and Rules` -> `Global rules`
2. add Content
```
Before responding or modifying the code, one should first obtain comprehensive information via `get-project-info` before making any decisions.
Everytime you finish editing code, you must call `update-project-info` and follow the instructions from the response
```
3. if you are in windows, add 
```
I am currently under the Windows system. Use like "C:\\Users\\..." to send Path
```

## Core Features

### AI IDE Friendly
- Automatically analyzes project language/structure/purpose
- Reads code blocks in Edit/Agent mode
- Records each LLM request for traceability

### MCP Support
- Comprehensive project structure
- Complete code standards

### Adaptive Changes
- File tree
- Project structure changes
- Code standard validation
