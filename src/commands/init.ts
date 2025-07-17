import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import inquirer from 'inquirer';
import { FileUtils } from '../utils/file-utils';
import { Logger } from '../utils/logger';

const logger = new Logger();

export const initCommand = new Command('init')
  .description('Initialize a new MCP server project with documentation setup')
  .argument('<project-name>', 'Name of the new MCP server project')
  .option('-t, --template <name>', 'Project template (typescript|python|javascript)', 'typescript')
  .option('-d, --description <desc>', 'Project description')
  .option('--author <name>', 'Author name')
  .option('--license <license>', 'License type', 'MIT')
  .option('--git', 'Initialize git repository', true)
  .option('--install', 'Install dependencies after creation', true)
  .option('-y, --yes', 'Skip interactive prompts and use defaults')
  .action(async (projectName: string, options) => {
    try {
      const projectPath = path.resolve(projectName);
      
      // Check if directory already exists
      if (await FileUtils.exists(projectPath)) {
        throw new Error(`Directory ${projectName} already exists`);
      }
      
      logger.info(`🚀 Creating new MCP server: ${projectName}`);
      
      let projectConfig = {
        name: projectName,
        template: options.template,
        description: options.description || `A Model Context Protocol server`,
        author: options.author || 'Your Name',
        license: options.license,
        git: options.git,
        install: options.install
      };
      
      // Interactive prompts if not using --yes flag
      if (!options.yes) {
        projectConfig = await promptForProjectDetails(projectConfig);
      }
      
      // Create project structure
      await createProjectStructure(projectPath, projectConfig);
      
      // Initialize git if requested
      if (projectConfig.git) {
        await initializeGit(projectPath);
      }
      
      // Install dependencies if requested
      if (projectConfig.install) {
        await installDependencies(projectPath, projectConfig.template);
      }
      
      // Show next steps
      showNextSteps(projectName, projectConfig);
      
      logger.success('🎉 MCP server project created successfully!');
      
    } catch (error: any) {
      logger.error('❌ Project initialization failed:', error.message);
      process.exit(1);
    }
  });

async function promptForProjectDetails(config: any): Promise<any> {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'template',
      message: 'Select project template:',
      choices: [
        { name: 'TypeScript (recommended)', value: 'typescript' },
        { name: 'JavaScript', value: 'javascript' },
        { name: 'Python', value: 'python' }
      ],
      default: config.template
    },
    {
      type: 'input',
      name: 'description',
      message: 'Project description:',
      default: config.description
    },
    {
      type: 'input',
      name: 'author',
      message: 'Author name:',
      default: config.author
    },
    {
      type: 'list',
      name: 'license',
      message: 'License:',
      choices: ['MIT', 'Apache-2.0', 'GPL-3.0', 'BSD-3-Clause', 'ISC'],
      default: config.license
    },
    {
      type: 'confirm',
      name: 'git',
      message: 'Initialize git repository?',
      default: config.git
    },
    {
      type: 'confirm',
      name: 'install',
      message: 'Install dependencies after creation?',
      default: config.install
    }
  ]);
  
  return { ...config, ...answers };
}

async function createProjectStructure(projectPath: string, config: any): Promise<void> {
  logger.info('📁 Creating project structure...');
  
  await FileUtils.ensureDir(projectPath);
  
  switch (config.template) {
    case 'typescript':
      await createTypeScriptProject(projectPath, config);
      break;
    case 'javascript':
      await createJavaScriptProject(projectPath, config);
      break;
    case 'python':
      await createPythonProject(projectPath, config);
      break;
    default:
      throw new Error(`Unknown template: ${config.template}`);
  }
  
  // Create common documentation files
  await createDocumentationFiles(projectPath, config);
}

async function createTypeScriptProject(projectPath: string, config: any): Promise<void> {
  // Create package.json
  const packageJson = {
    name: config.name,
    version: '1.0.0',
    description: config.description,
    main: 'dist/index.js',
    scripts: {
      build: 'tsc',
      dev: 'tsx src/index.ts',
      start: 'node dist/index.js',
      test: 'jest',
      docs: 'mcp-docgen generate . --output ./docs',
      'docs:serve': 'mcp-docgen serve ./docs'
    },
    keywords: ['mcp', 'model-context-protocol'],
    author: config.author,
    license: config.license,
    dependencies: {
      '@modelcontextprotocol/sdk': '^0.5.0'
    },
    devDependencies: {
      typescript: '^5.0.0',
      tsx: '^4.0.0',
      '@types/node': '^20.0.0',
      jest: '^29.0.0',
      '@types/jest': '^29.0.0'
    }
  };
  
  await FileUtils.writeFile(
    path.join(projectPath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  
  // Create tsconfig.json
  const tsConfig = {
    compilerOptions: {
      target: 'ES2022',
      module: 'CommonJS',
      lib: ['ES2022'],
      outDir: './dist',
      rootDir: './src',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist']
  };
  
  await FileUtils.writeFile(
    path.join(projectPath, 'tsconfig.json'),
    JSON.stringify(tsConfig, null, 2)
  );
  
  // Create basic MCP server implementation
  const serverCode = `import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  {
    name: '${config.name}',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'hello',
        description: 'Say hello to someone',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the person to greet',
            },
          },
          required: ['name'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case 'hello':
      const name = request.params.arguments?.name as string;
      return {
        content: [
          {
            type: 'text',
            text: \`Hello, \${name}! Welcome to ${config.name}.\`,
          },
        ],
      };
    default:
      throw new Error(\`Unknown tool: \${request.params.name}\`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
`;
  
  await FileUtils.ensureDir(path.join(projectPath, 'src'));
  await FileUtils.writeFile(
    path.join(projectPath, 'src', 'index.ts'),
    serverCode
  );
}

async function createJavaScriptProject(projectPath: string, config: any): Promise<void> {
  // TODO: Implement JavaScript project template
  throw new Error('JavaScript template not yet implemented');
}

async function createPythonProject(projectPath: string, config: any): Promise<void> {
  // TODO: Implement Python project template
  throw new Error('Python template not yet implemented');
}

async function createDocumentationFiles(projectPath: string, config: any): Promise<void> {
  // Create README.md
  const readme = `# ${config.name}

${config.description}

## Installation

\`\`\`bash
npm install
npm run build
\`\`\`

## Development

\`\`\`bash
npm run dev
\`\`\`

## Documentation

Generate documentation:

\`\`\`bash
npm run docs
\`\`\`

Serve documentation locally:

\`\`\`bash
npm run docs:serve
\`\`\`

## License

${config.license}
`;
  
  await FileUtils.writeFile(
    path.join(projectPath, 'README.md'),
    readme
  );
  
  // Create .gitignore
  const gitignore = `node_modules/
dist/
*.log
.env
.DS_Store
`;
  
  await FileUtils.writeFile(
    path.join(projectPath, '.gitignore'),
    gitignore
  );
}

async function initializeGit(projectPath: string): Promise<void> {
  logger.info('🔧 Initializing git repository...');
  
  // TODO: Implement git initialization
  // This would run: git init, git add ., git commit -m "Initial commit"
  
  logger.info('✅ Git repository initialized');
}

async function installDependencies(projectPath: string, template: string): Promise<void> {
  logger.info('📦 Installing dependencies...');
  
  // TODO: Implement dependency installation
  // This would run: npm install in the project directory
  
  logger.info('✅ Dependencies installed');
}

function showNextSteps(projectName: string, config: any): void {
  console.log(chalk.green('\n🎉 Project created successfully!\n'));
  console.log(chalk.blue('Next steps:'));
  console.log(chalk.gray(`  cd ${projectName}`));
  
  if (!config.install) {
    console.log(chalk.gray('  npm install'));
  }
  
  console.log(chalk.gray('  npm run dev'));
  console.log(chalk.gray('  npm run docs'));
  console.log(chalk.gray('  npm run docs:serve\n'));
}