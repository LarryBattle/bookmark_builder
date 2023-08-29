# Create Bookmarks for your Github and Bitbucket projects

Your CLI Node.js app for generating bookmarks from GitHub and Bitbucket repositories.

## Features

- Fetch GitHub and Bitbucket repositories using their CLI tools.
- Generate an `index.html` bookmark file.
- Customizable with JSON metadata and custom templates.
- Standalone executable for Windows 10+ and Linux.

## Prerequisites

- Node.js
- GitHub CLI (gh)
- Bitbucket CLI 

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/LarryBattle/bookmark_builder.git
cd bookmark_builder
npm install
```

## Usage

Run the script with:

```bash
node create_bookmarks.js --project_id PROJECT_ID --templates=github,bitbucket
```

For a standalone executable:

```bash
./create_bookmarks --project_id PROJECT_ID --templates=github,bitbucket
```

## Build Standalone Executable with pkg

First, install `pkg` globally:

```bash
npm install -g pkg
```

Then run the following command in your project directory:

```bash
pkg create_bookmarks.js --targets node18-win-x64,node18-linux-x64
```

This will generate executable files for Windows 10+ and Linux.

## Custom Templates

To use a custom template, pass the path to the custom template JavaScript file using the `--custom_template` option.

```bash
./create_bookmarks --project_id PROJECT_ID --custom_template=path/to/your/file.js
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) (TODO) for details on our code of conduct, and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
