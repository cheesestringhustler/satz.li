#!/bin/bash

(cd frontend && npm run dev &)
(cd backend && deno run --env=.env.local dev)