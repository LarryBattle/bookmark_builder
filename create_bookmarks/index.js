// node src/index.js --project_id <Your-Project-ID>
// node src/index.js fetch_github_repo_data --project_id <Your-GitHub-Project-ID>
// node src/index.js --props='{"key":"value"}' --templates=github,bitbucket
// node src/index.js --props_file=./props.json --templates=github,bitbucket

const BookmarkBuilder = require('./BookmarkBuilder');
const githubTemplate = require('./github');

const fs = require('fs');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const winston = require('winston');
const { execSync } = require('child_process');

// Logging Setup
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

// Function to check if a CLI tool is installed
function can_run(command) {
    try {
        execSync(`${command} --version`, { stdio: 'ignore' });
        return true;
    } catch (error) {
        return false;
    }
}

function get_missing_binary_for_template(templates) {
    const templateToBinaryMap = {
        'github': 'gh',
        'bitbucket': 'bitbucket'  // Replace with the actual Bitbucket CLI command if different
    };

    return templates.filter(template => {
        const binary = templateToBinaryMap[template];
        if (!binary) {
            logger.warn(`Unknown template: ${template}`);
            return false;
        }
        return !can_run(binary);
    }).map(template => templateToBinaryMap[template]);
}

function generate_bookmark_json(argv) {
    const props = getProps(argv);
    const bookmarks = processTemplates(argv, props); // Assuming processTemplates returns the bookmarks
    return bookmarks;
}

const index_html_path = 'index.html';

// Function to generate HTML bookmarks
function generate_bookmark_html(argv) {
    // Delete existing index.html if it exists
    if (fs.existsSync(index_html_path)) {
        try {
            fs.unlinkSync(index_html_path);
            logger.info(`Successfully deleted existing ${index_html_path}`);
        } catch (err) {
            logger.error(`Error deleting existing ${index_html_path}: ${err}`);
            process.exit(1);
        }
    }

    const jsonOutput = generate_bookmark_json(argv);
    if (argv['output-json']) {
        console.log(JSON.stringify(jsonOutput, null, 2));
    } else {
        const htmlContent = jsonToHtml(jsonOutput);  // Implement this function to convert JSON to HTML
        fs.writeFileSync(index_html_path, htmlContent);
    }
}

// Define yargs commands corresponding to steps
const argv = yargs(hideBin(process.argv))
    .command('fetch_github_repo_data', 'Fetch GitHub repository data', {}, (argv) => {
        const githubData = fetch_github_repo_data(argv.project_id);
        if (githubData) {
            logger.info(`Fetched GitHub data: ${JSON.stringify(githubData)}`);
        }
    })
    .command('fetch_bitbucket_repo_data', 'Fetch Bitbucket repository data', {}, (argv) => {
        const bitbucketData = fetch_bitbucket_repo_data(argv.project_id);
        if (bitbucketData) {
            logger.info(`Fetched Bitbucket data: ${JSON.stringify(bitbucketData)}`);
        }
    })
    .command('precheck', 'Check required binaries are installed', {}, (argv) => {
        const missingBinary = get_missing_binary_for_template(argv.templates);
        if (missingBinary && 0 < missingBinary.length) {
            logger.error(`Missing binaries to run template. Binary: ${missingBinary.join(", ")}`);
            process.exit(1);
        } else {
            logger.info('All required binaries are installed.');
        }
    })
    .command('generate_bookmark_json', 'Generate JSON bookmarks', {}, (argv) => {
        const jsonOutput = generate_bookmark_json(argv);
        if (argv['output-json']) {
            console.log(JSON.stringify(jsonOutput, null, 2));
        }
    })
    .command('generate_bookmark_html', 'Generate HTML bookmarks', {}, (argv) => {
        const jsonOutput = generate_bookmark_json(argv);
        if (argv['output-json']) {
            console.log(JSON.stringify(jsonOutput, null, 2));
        } else {
            const htmlContent = jsonToHtml(jsonOutput); // Implement this function to convert JSON to HTML
            fs.writeFileSync('index.html', htmlContent);
        }
    })
    .option('output-json', {
        description: 'Output JSON data for debugging',
        type: 'boolean',
    })
    .option('project_id', {
        description: 'The project ID for GitHub or Bitbucket',
        type: 'string',
    })
    .option('props', {
        description: 'Additional JSON metadata',
        type: 'string',
    })
    .option('props_file', {
        description: 'File containing additional JSON metadata',
        type: 'string',
    })
    .option('templates', {
        description: 'Comma-separated list of templates to use',
        type: 'array',
    })

    .help()
    .argv;

function jsonToHtml(jsonData) {
    let htmlContent = "<html><body>";

    function traverse(node) {
        if (node.isFolder) {
            htmlContent += `<div class="folder">${node.name}`;
            node.children.forEach(traverse);
            htmlContent += `</div>`;
        } else {
            htmlContent += `<a href="${node.href}">${node.name}</a>`;
        }
    }

    jsonData.forEach(traverse);
    htmlContent += "</body></html>";

    return htmlContent;
}


// Function to fetch GitHub data
function fetch_github_repo_data(project_id) {
    try {
        const output = execSync(`gh repo view ${project_id} --json name,url`, { encoding: 'utf-8' });
        return JSON.parse(output);
    } catch (error) {
        logger.error(`Failed to fetch GitHub data for project ID ${project_id}. Reason: ${error.message}`);
        return null;
    }
}

// Function to fetch Bitbucket data
function fetch_bitbucket_repo_data(project_id) {
    try {
        const output = execSync(`bitbucket repo view ${project_id} --json`, { encoding: 'utf-8' });
        return JSON.parse(output);
    } catch (error) {
        logger.error(`Failed to fetch Bitbucket data for project ID ${project_id}. Reason: ${error.message}`);
        return null;
    }
}


function getProps(argv) {
    let props = {};
    if (argv.props) {
        try {
            props = JSON.parse(argv.props);
        } catch (e) {
            logger.error('Invalid JSON in --props');
            process.exit(1);
        }
    } else if (argv.props_file) {
        try {
            const propsData = require('fs').readFileSync(argv.props_file, 'utf-8');
            props = JSON.parse(propsData);
        } catch (e) {
            logger.error('Could not read or parse --props_file');
            process.exit(1);
        }
    }
    return props;
}

function githubTemplate(bookmarkBuilder, props, githubData) {
    // Assuming githubData is an array of repositories
    githubData.forEach(repo => {
        bookmarkBuilder.goToRoot().addFolder(props.projectId).addFolder('GitHub').addFolder(repo.name);
        bookmarkBuilder.addLink('Pull Requests', `${repo.url}/pulls`);
        bookmarkBuilder.addLink('Branch: main', `${repo.url}/tree/main`);
        bookmarkBuilder.addLink('Branch: develop', `${repo.url}/tree/develop`);
    });

    return bookmarkBuilder.build();
}

function bitbucketTemplate(bookmarkBuilder, props, bitbucketData) {
    // Assuming bitbucketData is an array of repositories
    bitbucketData.forEach(repo => {
        bookmarkBuilder.goToRoot().addFolder(props.projectId).addFolder('Bitbucket').addFolder(repo.name);
        bookmarkBuilder.addLink('Pull Requests', `${repo.url}/pull-requests`);
        bookmarkBuilder.addLink('Branch: main', `${repo.url}/branch/main`);
        bookmarkBuilder.addLink('Branch: develop', `${repo.url}/branch/develop`);
    });

    return bookmarkBuilder.build();
}


function processTemplates(argv, props) {
    const templates = argv.templates || [];

    const results = []; // To collect results if needed

    templates.forEach((template) => {
        const bookmarkBuilder = new BookmarkBuilder();
        let result;
        if (template === 'github') {
            const githubData = fetch_github_repo_data(argv.project_id);
            result = githubTemplate(bookmarkBuilder, props, githubData);
        } else if (template === 'bitbucket') {
            const bitbucketData = fetch_bitbucket_repo_data(argv.project_id); // Assuming you have this function
            result = bitbucketTemplate(bookmarkBuilder, props, bitbucketData); // Assuming you have a bitbucketTemplate
        } else {
            logger.warn(`Unknown template: ${template}`);
        }

        if (result) {
            results.push(result); // Collecting results if needed
        }
    });

    return results; // Returning results if needed
}

function init() {
    const argv = yargs(hideBin(process.argv)).argv;
    const props = getProps(argv);
    const results = processTemplates(argv, props, githubData, bitbucketData);
    // Log to console and file
    logger.info('Application started');
    console.log('Command-line arguments:', argv);
}

init();
