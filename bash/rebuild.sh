# rebuild code, gen everything, upload everything

# https://devimalplanet.com/using-nvm-in-cron-jobs
# Load nvm
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# setup env
nvm use 10.16.0
export GOOGLE_APPLICATION_CREDENTIALS="gcp-key.json"

# https://github.com/npm/npm/issues/17722
npm install
git checkout -- package-lock.json

npm run cron-code && npm run cron-json
