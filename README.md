Introduction
Welcome to MCP DocGen, an open-source tool designed to automatically generate documentation for Model Context Protocol (MCP) servers. 
This README provides all the information you need to install, use, and contribute to the project.

Installation
To get started, ensure you have Python 3.6 or higher installed. Then, install MCP DocGen using pip with the following command:
pip install mcp-docgen

Usage
MCP DocGen is a command-line tool that works with both local and remote MCP servers. 
Here are examples of how to use it:
For Local Servers:
Run mcp-docgen --local-server-path /path/to/your/server.py --output docs/mcp_tools.md to generate documentation from a local server script.
For Remote Servers:
Use mcp-docgen --remote-server-url https://your-remote-server.com --output docs/mcp_tools.md for a remote server, and the documentation will be saved in the specified output file.

Contributing
We welcome contributions! If you find a bug or have a feature request, please open an issue or submit a pull request on GitHub. For detailed guidelines, check our CONTRIBUTING.md file.

Support and License
For help, open an issue on GitHub or reach out to the maintainer at @masterthefly on X. This project is licensed under the MIT License—see the LICENSE file for details.

Acknowledgements
This project was inspired by the MCP Inspector and relies on the MCP Python SDK. Special thanks to the Anthropic team for developing the Model Context Protocol.
Note: This project is currently under active development. While it is functional, there may be bugs or missing features. Your feedback and contributions are highly appreciated!
