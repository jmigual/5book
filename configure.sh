# This script installs and configures the environment, requirements in PATH:
# - bower
OLDP=$PWD
cd public/
bower install
cd $OLDP
