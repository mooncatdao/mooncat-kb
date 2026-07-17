#!/usr/bin/env bash

# Save GitLab OIDC JWT to a local file
echo "${FIREBASE_ID_TOKEN}" > "/tmp/gitlab_oidc_token"

# Configuration file telling the Firebase CLI tools how to use that token
export GOOGLE_APPLICATION_CREDENTIALS="${PWD}/clientLibraryConfig-gitlab.json"

# Deploy to Firebase
npm i firebase-tools
export NODE_ENV="production"

#npx firebase projects:list
npx firebase deploy
