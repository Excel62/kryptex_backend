import user from '#models/user'
import PasswordResetToken from '#models/password_reset_token';
import { createUserValidator } from '#validators/user';
import type { HttpContext } from '@adonisjs/core/http';
import Balance from '#models/balance';
import env from '#start/env';
import mail from '@adonisjs/mail/services/main'
import Withdrawal from '#models/withdrawal';



export default class UsersController {

    async signUp({ request, response }: HttpContext) {
        // const { fullName, email, password } = request.all()

        try {
            const validatedData = await request.validateUsing(createUserValidator)
            const User = await user.create(validatedData)

            mail.send((message) => {
                message
                    .to(User.email)
                    .from(env.get('SMTP_USERNAME'))
                    .subject('Welcome to Kryptex')
                    .htmlView('email/welcome', {
                        user: User.fullName,
                    })
            })
            return response.status(201).json({
                message: 'User created successfully',
                user: User,
            })
        } catch (error) {
            return response.status(501).json({
                message: 'Validation failed',
                errors: error.messages,
            })
        }

    }

    async signIn({ request, response}: HttpContext) {

        const { email, password } = request.all()
        try {
    
            const userInstance = await user.findByOrFail('email', email)
            const isValidPassword = await userInstance.verifyPassword(password)

           
            if (!isValidPassword) {
                return response.status(401).json({
                    message: 'Invalid credentials',
                })
            }

            // Generate access token or session here
            const AcessToken = await user.accessTokens.create(userInstance, ["*"], {
                expiresIn: '1h'
            })

            return response.status(200).json({
                message: 'User signed in successfully',
                user: [userInstance, AcessToken],
            })
        } catch (error) {
            return response.status(404).json({
                message: 'User not found',
                errors: error.message,
            })
        }
    }

    async getUserInsatnce({response, auth}: HttpContext){
        const isAuthenticated = await auth.check()

        if(isAuthenticated && auth.user){
            const userInstance = auth.user

            // getting User balance using the id
            const userBalance = await Balance.query().where('userId', userInstance.id).first()
            const withdrawals = await Withdrawal.query().where('userId', userInstance.id)
            let sumWithdraws = 0

            if(withdrawals.length > 0){
                for (let index = 0; index < withdrawals.length; index++) {
                    const element = withdrawals[index];
                    sumWithdraws += Number(element.amount)
                }
            }

            
            return response.status(200).json({
                user: userInstance,
                balance: userBalance? userBalance.amount : 0.00,
                sumWithdrawal : sumWithdraws
            })
        }else{
            return response.status(404).json({
                messages: false
            })
        }
    }

    async generate_reset_token({ request, response }: HttpContext) {
        const { email } = request.all()

        try {
            const userInstance = await user.findByOrFail('email', email)

            // Check if a token already exists for this user
            const existingToken = await PasswordResetToken.findBy('id', userInstance.id)
            if (existingToken) {
                existingToken.token = + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
                await existingToken.save()
                // Optionally, send an email with the new token
                await mail.send((message) => {
                    message
                        .to(userInstance.email)
                        .from(env.get('SMTP_USERNAME'))
                        .subject('Password Reset Token')
                        .htmlView('email/resetpassword', {
                            token: existingToken.token,
                            user: userInstance.fullName,
                        })
                })
            } else {
                const newToken = await PasswordResetToken.create({
                    id: userInstance.id,
                    token: + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                    email: userInstance.email,
                })

                return response.status(201).json({
                    message: 'Password reset token generated successfully',
                    token: newToken.token
                })
            }
            // Generate a unique token for password reset

        } catch (error) {
            return response.status(404).json({
                // message: 'User not found',
                errors: error.message,
            })
        }
    }

    async resetPassword({ request, response }: HttpContext) {
        const {token, newPassword} = request.all()
        try {
            const resetToken = await PasswordResetToken.findByOrFail('token', token)

            // Find the user associated with the token
            const userInstance = await user.findOrFail(resetToken.id)

            // Update the user's password
            userInstance.password = newPassword
            await userInstance.save()

            // Optionally, delete the token after use
            await resetToken.delete()

            return response.status(200).json({
                message: 'Password reset successfully',
                user: userInstance,
            })
        } catch (error) {
            return response.status(404).json({
                message: 'Invalid token or user not found',
                errors: error.message,
            })
        }
    }

}