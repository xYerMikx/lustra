import { baseConfig } from '@lumira/config/eslint.base.mjs'

export default [...baseConfig, { ignores: ['prisma/migrations/**'] }]
