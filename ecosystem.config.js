module.exports = {
  apps: [{
    name: 'honscript-api',
    script: './server.js'
  }],
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'honscript.com',
      key: '~/.ssh/honscript.pem',
      ref: 'origin/master',
      repo: 'git@github.com:WillAiemi/honscript-api.git',
      path: '/home/ubuntu/honscript-api',
      'post-deploy': 'npm install && pm2 startOrRestart ecosystem.config.js'
    }
  }
}