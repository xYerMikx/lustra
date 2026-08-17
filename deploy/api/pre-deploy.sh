#!/bin/sh
set -eu

pnpm db:migrate:deploy
