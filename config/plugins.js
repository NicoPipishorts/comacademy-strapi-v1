module.exports = ({ env }) => ({
  // Existing configurations
  "import-export-entries": {
    enabled: true,
    config: {
      maxSize: 104857600, // Example: 100 MB in bytes
    },
  },
  "random-sort": {
    enabled: true,
  },
});
