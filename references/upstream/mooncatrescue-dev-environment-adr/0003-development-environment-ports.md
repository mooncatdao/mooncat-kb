# 0003 - Development Environment Ports
**Updated:** 26 Aug 2023

## Status
<!-- Proposed | Accepted | Rejected | Deprecated | Superseded -->
Accepted

## Context
<!-- What is the issue that we’re seeing, that is motivating this decision or change -->
With all the different micro-services that MoonCat​Rescue is creating, it’s likely that a developer will have lots of local services running to test and compare them. If all services are using the same port, only one can be “up” locally at a time, which limits testing options. If each are different, keeping track of which is which is hard, and if picked randomly (to avoid colliding with other services), then become hard to remember.

## Decision
<!-- What is the change that we’re actually proposing or doing. -->
It would be good to have an overall port assignment mapping, to have some consistency/expectation across development environments. Therefore, when developers are running all the applications on one host, they know where to find the different parts consistently, and they can bring up any of the items in combination, without worrying about ports colliding.

Each individual project SHOULD have as part of its `docker-compose.yml` file a default port, and the ability to override it, by setting the `LOCAL_WEB_PORT` environment variable within the application container. For example:

```yaml
services:
  web:
    ports:
      - "${LOCAL_WEB_PORT:-8080}:80"
```

This example config file uses 8080 as the default port to access the service on, but if a developer needed to, they could start it up with `LOCAL_WEB_PORT=8081 docker-compose up web` (or specify `LOCAL_WEB_PORT` in [an `.env` file](https://docs.docker.com/compose/environment-variables/#the-env-file)) and it would use 8081 instead.

Ports in the 1024 to 49151 range are valid ports to claim, and since the number “25600” has special meaning for the MoonCat project, let’s start there. For each *standalone* application/website, we reserve 10 ports. For each project, its first port is for the public website (if it has one), and then the rest are for different back-end services.

- 25600: MoonCat​Rescue original website (`origin.mooncatrescue.com`)
- 25601: MoonCat​Rescue data back-end
- 25602: ChainStation website (`mooncatrescue.com`)
- 25603: ChainStation Firestore
- 25604: ChainStation Functions
- 25605: ChainStation Emulator Suite UI
- 25606: ChainStation Emulator UI websocket
----
- 25610: MoonCat Community website (`mooncat.community`)
- 25611: Data API server (`api.mooncat.community` and `api.mooncatrescue.com`)
- 25613: Data API Firestore
- 25614: Data API Functions
- 25615: Data API Emulator Suite UI
- 25616: Data API Emulator UI websocket
----
- 25620: Temporary/micro services†
----
- 25640: MoonCat Pop website (`pop.mooncat.community`)
----
- 25650: Smart Contract Tester
----
- 25660: JumpPort website (`jumpport.mooncat.community`)
----
- 29990: Local Ethereum node (Hardhat)

_†Applications that will not be deployed on their own, but will be part of a larger application (e.g. the Acclimator interface, which is a separate repository, but its final deploy form would be inside the MoonCat Community website) shall use the “25620” through “25629” range. These may overlap with other micro-applications that don’t need their own port range, but that’s okay based on how they’d be developed and used._

## Consequences
<!-- Outcomes, both positive and negative -->
Whenever a new project is added, this ADR will need to be updated to claim a new set of ports for that project.
