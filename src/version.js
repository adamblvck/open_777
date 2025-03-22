// Import version from package.json
const { version } = require('../package.json');

// Export both the version string and a numeric version for comparisons
module.exports = {
  VERSION_STRING: version,
  VERSION: version.split('.').map(Number)
}; 