# WamsChat - Client-side AMQP Stream Chat Application

This project demonstrates a client-side chat application using AMQP streams over WebSockets without requiring traditional backend infrastructure.

## Project Structure
- **src/**: Main application source code
  - **js/**: JavaScript modules for AMQP connection, channel management, UI, and main app
  - **styles/**: Modern CSS with Discord-inspired design
  - **index.html**: Main HTML structure
- **test/**: Vitest test files
- **mock-amqp-server.js**: Mock WebSocket AMQP server for development

## Key Features
- Pure client-side architecture using AMQP streams
- Real-time messaging across multiple channels
- Modern JavaScript with ES modules
- Custom CSS without frameworks
- Development server with Vite
- Testing with Vitest
- Code quality with ESLint and Prettier

## Development
- Run `npm run dev` to start development server
- Run `npm run dev:with-mock` to include mock AMQP server
- Run `npm test` for testing
- Run `npm run lint` for code quality checks

The application is currently running at http://localhost:3000e this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->
- [x] Verify that the copilot-instructions.md file in the .github directory is created.

- [x] Clarify Project Requirements
	<!-- Client-side chat application using AMQP streams, vanilla JS, modern CSS, ESLint, Prettier, Vite, Vitest -->

- [x] Scaffold the Project
	<!--
	Ensure that the previous step has been marked as completed.
	Call project setup tool with projectType parameter.
	Run scaffolding command to create project files and folders.
	Use '.' as the working directory.
	If no appropriate projectType is available, search documentation using available tools.
	Otherwise, create the project structure manually using available file creation tools.
	-->

- [ ] Customize the Project
	<!--
	Verify that all previous steps have been completed successfully and you have marked the step as completed.
	Develop a plan to modify codebase according to user requirements.
	Apply modifications using appropriate tools and user-provided references.
	Skip this step for "Hello World" projects.
	-->

- [ ] Install Required Extensions
	<!-- ONLY install extensions provided mentioned in the get_project_setup_info. Skip this step otherwise and mark as completed. -->

- [ ] Compile the Project
	<!--
	Verify that all previous steps have been completed.
	Install any missing dependencies.
	Run diagnostics and resolve any issues.
	Check for markdown files in project folder for relevant instructions on how to do this.
	-->

- [ ] Create and Run Task
	<!--
	Verify that all previous steps have been completed.
	Check https://code.visualstudio.com/docs/debugtest/tasks to determine if the project needs a task. If so, use the create_and_run_task to create and launch a task based on package.json, README.md, and project structure.
	Skip this step otherwise.
	 -->

- [ ] Launch the Project
	<!--
	Verify that all previous steps have been completed.
	Prompt user for debug mode, launch only if confirmed.
	 -->

- [ ] Ensure Documentation is Complete
	<!--
	Verify that all previous steps have been completed.
	Verify that README.md and the copilot-instructions.md file in the .github directory exists and contains current project information.
	Clean up the copilot-instructions.md file in the .github directory by removing all HTML comments.
	 -->
