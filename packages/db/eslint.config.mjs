import { baseConfig } from '@lustra/config/eslint.base.mjs'

export default [...baseConfig, { ignores: ['prisma/migrations/**'] }]
