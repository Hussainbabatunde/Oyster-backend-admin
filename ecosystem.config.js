module.exports = {
  apps: [
    {
      name: 'oyster-backend',
      script: 'dist/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 5002, // Adjust port if 5001 is used by another service
      },
    },
  ],
};
