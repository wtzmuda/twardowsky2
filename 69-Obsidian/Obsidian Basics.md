
### 1. Introduction to Obsidian

Obsidian is a versatile note-taking application that allows you to create, manage, and link your notes and thoughts in a unique, interconnected way. Its markdown-based system is perfect for organizing complex information, making it an excellent tool for systems engineers.

### 2. Installation

- **Download**: Visit [Obsidian's official website](https://obsidian.md/) and download the version suitable for your operating system (Windows, macOS, Linux).
- **Installation**: Follow the instructions to install Obsidian on your device.
- **Initial Setup**: Download the **TWR2** github folder to your device. Open obsidian -> open folder as vault -> select **TWR2** project you've just downloaded
- **Make sure that correct branch is selected!!** After initial setup - bottom right of the screen, make sure that there is "development" selected as Github branch - otherwise you risk overwriting the "main" branch!!

### 3. What is markdown?
Markdown is a lightweight markup language designed for formatting text on the web. It's widely appreciated for its simplicity and readability. The core principle behind Markdown is to make the text look as readable as possible in its raw form. In Markdown, you format text using simple, plain-text symbols. For instance, you use `#` for headers (`#` for a header level one, `##` for level two, and so on), `*` or `_` for emphasis (like italics), and `**` or `__` for strong emphasis (like bold). Creating lists is straightforward too, with `-` or `*` for unordered lists and numbers for ordered lists. Links are added using `[text](URL)`, and images are embedded similarly with `!` in front, like `![alt text](image URL)`. Code can be included by wrapping it in backticks 

` for inline code or triple backticks ` 

for a code block. Markdown's ease of use and readability have made it a favorite for writing documentation, notes, and even books, especially in programming and technical fields.

[[Propulsion]]

### 4. Using TWR2 Obsidian Vault

First of all, you can use Obsidian as a normal file explorer to create, update, reorganize and delete files. You can use the simple file explorer on the left to do this.

To dive deeper into enhanced functionalities that Obsidian provides, we will have to navigate to `11-System_design` folder.

#### 4.1 System Diagram.canvas

Here, you can see System Diagram `canvas` file and folder for storing systems and subsystems. The `canvas` file should be your main entry point. You can create and delete components, subsystems and interfaces here, as well as get an overview around the whole system and navigate to specific parts of the system to interact with them.

- `shift + p` to open console
	- Type `add component` to add subsystem (you can select if it is a physical - lowest level - component)
- Double click on a component to naviget to it
- To create an interface, click and drag on the side of a component
	- To add interface definition, add label to the arrow with the name of the interface
- Double click on an interface to navigate to it

#### 4.2 Using system architecture folders

Other folders contain the project's architecture. It should contain hierarchical depiction of the systems and subsystems involved in the project, with top-level systems being the top folder and lower-level subsystems being lower in the  folder hierarchy. The bottom-most files are the individual components in the system, usually depicting physical components and the smallest building blocks. Here, you can create subsystems and requirements for individual subsystems.
- `shift + p` to open command palette
	- `add component` to add a component - it will be created as a child for the current component
	- `add requirement` to add requirement

**Important**
After creating any file from the command palette, make sure that the template is filled out such that all the fields are clear and readable.

##### 4.2.1 Managing individual systems and subsystems
- Adding models

#### 4.3 Managing Requirements
In the `11-System_design` folder there is also requirements folder. You can see and manage individual requirements from there, however it is best to do this directly from the subsystems level as the number of components might be soon be unbearable!

#### 4.4 Managing interfaces
You can define new and modify interfaces in the `12-Interfaces` folder

#### 4.5 Managing Tests
Same as with interfaces, but in `05-Test_documentation`
