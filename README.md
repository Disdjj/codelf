# Codelf

> By DJJ & TigerLee

Codelf is a powerful AI-assisted coding tool that provides better code understanding and modification capabilities for AI agents through the Model Context Protocol (MCP).

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

## File Relationships

### project.md
Stores core project information, including:
- Project name (ProjectName)
- Tech stack (TechStack)
- Project structure (Structure)
- File descriptions: explains project functionality

### attention.md
Development considerations, including:
- Programming language
- Code standards

### framework.md
Framework documentation, outlining all frameworks used and key considerations

### changelog.md
AI code modifications, including:
1. Code optimization changes
2. Change overview
3. Post-change considerations

## Implementation

### MCP Implementation
- project_info: retrieves current project info/details/considerations
- update_project_info: synchronizes changes to .codelf after code updates

### Content
- project_info: project structure, programming language, best practices, public code protocol management
- file tree: file structure
- component descriptions

### Important Considerations
Key considerations, including:
- ORM
- HTTP
- Microservices
- SPA
- SSR
- CSS / TS / UI

## Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Build the project:
```bash
pnpm run build
```

3. Configure in Cursor or Claude Desktop:
   - Name: codelf
   - Type: command
   - Command: `node ABSOLUTE_PATH_TO_PROJECT/build/index.js`

## Tech Stack
- TypeScript
- @modelcontextprotocol/sdk v1.5.0
- zod v3.24.2