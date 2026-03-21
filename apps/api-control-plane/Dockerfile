FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps ./apps
COPY packages ./packages
COPY tsconfig.base.json ./

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @mobility-os/env-config build
RUN pnpm --filter @mobility-os/authz-model build
RUN pnpm --filter @mobility-os/tenancy-domain build
RUN pnpm --filter @mobility-os/domain-config build
RUN pnpm --filter @mobility-os/billing-domain build
RUN pnpm --filter @mobility-os/api-control-plane db:generate
RUN pnpm --filter @mobility-os/api-control-plane build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable

COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/turbo.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps ./apps
COPY --from=builder /app/packages ./packages

EXPOSE 3100

CMD ["pnpm", "--filter", "@mobility-os/api-control-plane", "start"]
