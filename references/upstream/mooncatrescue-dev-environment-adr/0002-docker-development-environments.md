# 0002 - Docker Development Environments
**Updated:** 3 Jan 2025

## Status
<!-- Proposed | Accepted | Rejected | Deprecated | Superseded -->
Accepted

## Context
<!-- What is the issue that we’re seeing, that is motivating this decision or change -->
Being an asynchronous team, the developers use their own workstations set up in their own manner, to work on shared code with the rest of the team. This leads to situations that are easy to get into a “works on my machine, but not on yours?” situation that can be hard to diagnose.

It would also be ideal to reduce developer manual work by automating as many parts of the development and deployment process as possible. Having a development environment that closely resembles the final production environment would help in testing automatic processes to have more confidence they will run properly in the production environment.

## Decision
<!-- What is the change that we’re actually proposing or doing. -->
For production deployment and for local development, we SHALL use [software “containers”](https://www.docker.com/resources/what-container/) to organize and manage the software. For local development, developers SHALL use [Docker](https://www.docker.com/) to manage those containers. Configuration files for launching development environments and final production environments using Docker SHALL be included in individual code repositories to make developer setup as streamlined as possible.

### Standard containers
For the common languages that get used in MoonCat​Rescue projects, these common configurations MUST be adhered to:

#### Node.js
Node.js is used for Hardhat contract development and React/Next front-end development, primarily. The Node.js maintainers use a [rolling release schedule](https://nodejs.org/en/about/releases/) which dictates even-numbered releases become “long term support” versions, which typically guarantee critical bugs will be fixed for 30 months from release. When using Node.js with Docker, it is possible to refer to the image as `node:lts` to get whatever the current long-term-support version is. However that requires periodically running `docker pull` to get the new version, and if there are breaking changes, it’s not possible to roll back without selecting a different image tag. So, for MoonCat​Rescue work, we SHALL define the Node.js Docker image being used by its actual version number, and rotate to a new LTS version as a recurring development task.

The current LTS version is `node:24`, and all MoonCat​Rescue projects SHOULD be using that as the Docker image if they need Node.js. A new LTS version **will be set 15 Oct 2026**, and so after that date all MoonCat​Rescue repositories MUST be updated to that new version. That update SHOULD happen **before 30 Apr 2028** (when v24 reaches end-of-life).

Additionally, for some Node.js packages, they are structured in a way that they expect to be installed globally (`npm install -g foo`), which inside a Docker container means they would get installed as root in a global context by default. This can lead to some unusual permission errors, especially when working with a mounted file folder inside the Docker container from the host filesystem. To remedy this, the maintainers of the Node.js Docker container do include a non-root user (named `node`) in the container, and [suggest it gets used](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md#non-root-user). To do that in a linux-like environment, having a user on the Docker host environment (the developer’s workstation) with a UID and GID that match the UID and GID inside the container makes things run most smoothly. For MoonCat​Rescue, we SHALL use “25600” as the UID and GID to be consistent. Ensure your local OS has a user with that UID and a group with that GID (`groupadd -g 25600 mooncat && useradd -M -u 25600 -g 25600 mooncat` if you don’t), and make the user you typically work with a member of the `mooncat` group (`usermod -a -G mooncat myUser`).

Then, update all local repositories to have their files owned by that user. To get files into that state, from within a project repository, run:
```sh
chown mooncat:mooncat -R .                        # Make everything owned by the mooncat user
chmod g+w -R .                                    # Allow all users in the mooncat group to edit
find -type d ! -perm -g+s -exec chmod g+s {} \;   # Find all folders that don’t have the ‘group’ sticky bit set and set it
find -type d ! -perm -o+rx -exec chmod o+rx {} \; # Find all folders that aren’t readable by ‘others’ and make them readable
```
This script is available as `permissions.sh` in the root of this repository.

For all MoonCat​Rescue projects, you can use the following Dockerfile as a base Node.js environment:
```dockerfile
FROM node:24
RUN groupmod -g 25600 node && usermod -u 25600 -g 25600 node
USER node
```
This shifts the `node` user in that image to use our magic 25600 UID and GID. This file is available as `Dockerfile.node` in the root of this repository. On your workstation, run `docker build -t node:mooncat .` to create `node:mooncat` locally, which then other code repositories for the team will assume is already there. To update that local image (e.g. when MoonCat​Rescue as a team upgrades to a newer LTS version of Node.js), you MUST update to the latest version of this repository (where that `Dockerfile.node` file should be up-to-date), do a `docker pull node:24` to ensure the latest updates are present locally, and then run `docker build -t node:mooncat .` again.

A sample `docker-compose.yml` for MoonCat​Rescue projects using Node.js is:

```yml
version: '3.9'

services:
  app:
    image: node:mooncat
    volumes:
      - ".:/app"
    working_dir: /app
    command: bash
```

A one-liner command to run ad-hoc to drop into a MoonCat​Rescue-style Node.js environment is `docker run -it --rm -u node -v ${PWD}:/app -w /app node:mooncat bash`.

#### Next
A sample `docker-compose.yml` for MoonCat​Rescue projects using Next is:

```yml
version: '3.9'

services:
  web:
    image: node:mooncat
    ports:
      - "${LOCAL_WEB_PORT:-25650}:3000"
    volumes:
      - ".:/app"
    working_dir: /app
    command: ['npx', 'next', 'dev']
```

## Consequences
<!-- Outcomes, both positive and negative -->
When Node.js packages rotate out of long-term support, manual changeover is needed. This takes planning, but then allows dealing with deprecations and code changes in a predictable manner.
