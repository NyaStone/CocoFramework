// dependencies
const fs = require('fs');

// config variables
const ignore_prefix = '__';


/**
 * Recursive function to read the directories and output an object containing all the classes for this module
 * @param {string} path - Path of the directory to recurisively require the js modules for
 * @returns {object} Object containing all the classes of this dependencie module
 */
function read_dir( path ) {
    // init the content object of this directory
    const content = {};
    // reading the directory
    const raw_content = fs.readdirSync(path, { withFileTypes: true });
    // looping though the content
    raw_content.forEach(direntity => {
        // if the entity is a file and shoudln't be ignored
        if (direntity.isFile() && direntity.name.endsWith('.js') && !direntity.name.startsWith(ignore_prefix)) {
            // requiring the content of the file
            const file_content = require(`${path}/${direntity.name}`);
            // adding the read class to the content object
            content[file_content.name] = file_content;
        }
        // if the entity is a dirrectory and shouldn't be ignored
        else if (direntity.isDirectory() && !direntity.name.startsWith(ignore_prefix)) {
            // recursively call this function to add it's content to this object
            content[direntity.name] = read_dir(`${path}/${direntity.name}`);
        }
        // ignore the rest of the content for sanity
    });
    // return the content
    return content;
}

// Exporting the module
module.exports = read_dir(__dirname);