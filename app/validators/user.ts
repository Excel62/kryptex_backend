import vine from '@vinejs/vine'

export const createUserValidator = vine.compile(
    vine.object({
        fullName: vine.string().maxLength(255).optional(),
        email: vine.string().email().maxLength(254).trim(),
        password: vine.string().minLength(6).trim(),
    })
)