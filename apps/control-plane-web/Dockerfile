FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps ./apps
COPY packages ./packages
COPY tsconfig.base.json ./
COPY tailwind.config.ts postcss.config.js ./

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @mobility-os/domain-config build
RUN pnpm --filter @mobility-os/ui build
RUN pnpm --filter control-plane-web build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable

COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/turbo.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps ./apps
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/tailwind.config.ts /app/postcss.config.js /app/tsconfig.base.json ./

EXPOSE 3200

CMD ["pnpm", "--filter", "control-plane-web", "start", "--", "-p", "3200"]
