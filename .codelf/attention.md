## Language: TypeScript
> The project uses TypeScript as the main development language, adopting a modular structure, and using the Node.js runtime environment.

**Formatter Library:**
- TypeScript (v5.7.3)
- ESLint/TSLint (implicitly used)

**Usable Utilities and Components:**
> List the directories of existing common methods and components in the current project, along with a brief description of their functions.
```
- index.ts // Main entry file, containing MCP server implementation and all tool functions
```

**Coding Conventions:**
> Clear separation of code responsibilities: routing, business logic, and utility functions are organized independently.
```
- Tool functions // Defined in index.ts, including get-project-info, update-project-info, and init-codelf tools
- File operations // Using the fs module for file read and write operations
- Server logic // Using @modelcontextprotocol/sdk to create and run the MCP server
```

**Folder and Variable Naming Conventions:**
- Semantic naming
- Using camelCase for variable and function names
- Using PascalCase for class and interface names
- Reasonable length constraints

**Error Monitoring and Logging:**
> Proper use of console for logging, ensuring removal of unnecessary debugging statements before production.
> Adding appropriate comments to enhance readability, but avoiding excessive annotation.

**Special Considerations:**
- The project uses the folderBlackList array to define folders to be ignored when generating the file tree
- Using the Zod library for parameter validation
- Using TypeScript's type system to ensure type safety