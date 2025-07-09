import Admin from '#models/admin'
import Balance from '#models/balance'
import Deposit from '#models/deposit'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
// import { app } from '@adonisjs/core/services/app';
import Withdrawal from '#models/withdrawal'


export default class AdminController {

    async signUp({ request, response }: HttpContext) {
        const { fullName, email, password } = request.all()

        try {
            // Validate input data
            if (!fullName || !email || !password) {
                return response.status(400).json({
                    message: 'Missing required fields',
                })
            }

            // Create a new admin record
            const admin = await Admin.create({
                fullName,
                email,
                password: await hash.make(password), // Hash the password
            })

            return response.status(201).json({
                message: 'Admin created successfully',
                admin,
            })
        } catch (error) {
            console.error(error)
            return response.status(500).json({
                message: 'Failed to create admin',
                errors: error.message,
            })
        }
    }

    async signIn({ request, response }: HttpContext) {
        const { email, password } = request.all()

        try {
            // Assuming you have an Admin model to handle admin authentication
            const adminInstance = await Admin.findByOrFail('email', email)
            const isValidPassword = await hash.verify(adminInstance.password, password)

            if (!isValidPassword) {
                return response.status(401).json({
                    message: 'Invalid credentials',
                })
            }

            // Generate access token or session here
            // const AccessToken = await adminInstance.accessTokens.create(adminInstance, ["*"], {
            //     expiresIn: '1h'
            // })

            return response.status(200).json({
                message: 'Admin signed in successfully',
                // admin: [adminInstance, AccessToken],
            })
        } catch (error) {
            return response.status(404).json({
                message: 'Admin not found',
                errors: error.message,
            })
        }
    }


    async fetchAllUsers({ response }: HttpContext) {
        try {
            const users = await User.all()
            return response.status(200).json({
                message: 'Users fetched successfully',
                users,
            })
        } catch (error) {
            return response.status(500).json({
                message: 'Failed to fetch users',
                errors: error.message,
            })
        }
    }
    async deleteUser({ request, response }: HttpContext) {
        const { userId } = request.all()

        try {
            const user = await User.findOrFail(userId)
            await user.delete()

            return response.status(200).json({
                message: 'User deleted successfully',
            })
        } catch (error) {
            return response.status(404).json({
                message: 'User not found',
                errors: error.message,
            })
        }
    }

    async fetchAllDeposits({ response }: HttpContext) {
        try {
            const deposits = await Deposit.all()
            return response.status(200).json({
                message: 'Deposits fetched successfully',
                deposits,
            })
        } catch (error) {
            return response.status(500).json({
                message: 'Failed to fetch deposits',
                errors: error.message,
            })
        }
    }


    async approveDeposit({ request, response, params }: HttpContext) {
        const id = params.id
        const { userId } = request.all()

        try {
            const deposit = await Deposit.findBy('id', id)
            if (!deposit) {
                return response.status(404).json({
                    message: 'Deposit nott found',
                })
            }
            deposit.status = 'complete' // Update status to completed
            const intergerAmount = parseInt(String(deposit.amount))
            await deposit.save()

            // Optionally, update user's balance here
            const alreadyBalance = await Balance.findBy('user_id', userId)


            if (!alreadyBalance) {
                console.log('No balance found for user, creating a new one')
                await Balance.create({
                    userId,
                    amount: intergerAmount,
                    currency: deposit.currency,
                })

            }

            if (alreadyBalance) {
                console.log('Balance found for user, updating existing balance')
                // const upddatedB = parseInt(alreadyBalance.amount) + parseInt(deposit.amount)
                // console.log(upddatedB)
                alreadyBalance.amount = parseInt(String(alreadyBalance.amount)) + parseInt(String(deposit.amount))
                await alreadyBalance.save()

                return response.status(200).json({
                    message: 'Deposit approved and balance updated successfully',
                })
            } else {
                // If no balance exists for the user, create a new balance record
                await Balance.create({
                    userId,
                    amount: deposit.amount,
                    currency: deposit.currency,
                })
                return response.status(201).json({
                    message: 'Deposit approved',
                })
            }
        } catch (error) {
            return response.status(404).json({
                message: 'Deposit not found',
                errors: error.message,
                error
            })
        }
    }


    async rejectDeposit({ request, response }: HttpContext) {
        const { depositId } = request.all()

        try {
            const deposit = await Deposit.findOrFail(depositId)
            deposit.status = 'rejected' // Update status to rejected
            await deposit.save()

            return response.status(200).json({
                message: 'Deposit rejected successfully',
                deposit,
            })
        } catch (error) {
            return response.status(404).json({
                message: 'Deposit not found',
                errors: error.message,
            })
        }
    }


    async fetchAllWithdrawals({ response }: HttpContext) {
        try {
            const withdrawals = await Withdrawal.all()
            return response.status(200).json({
                message: 'Withdrawals fetched successfully',
                withdrawals,
            })
        } catch (error) {
            return response.status(500).json({
                message: 'Failed to fetch withdrawals',
                errors: error.message,
            })
        }
    }


    async approveWithdrawal({ response, request }: HttpContext) {
        const { withdrawalId } = request.body()
        try {
            const withdrawal = await Withdrawal.findOrFail(withdrawalId)
            console.log(withdrawalId)
            withdrawal.status = 'completed' // Update status to completed
            await withdrawal.save()
            // Optionally, update user's balance here
            const userBalance = await Balance.findByOrFail('userId', withdrawalId)
            if (userBalance) {
                userBalance.amount -= withdrawal.amount
                await userBalance.save()

                return response.status(200).json({
                    message: 'Withdrawal approved and balance updated successfully',
                })
            } else {
                // If no balance exists for the user, create a new balance record
                // await Balance.create({
                //     userId,
                //     amount: -amount,
                //     currency,
                // })
                return response.status(201).json({
                    message: 'Withdrawal approved',
                })
            }
        } catch (error) {
            return response.status(404).json({
                message: 'Withdrawal not found',
                errors: error.message,
            })
        }
    }

    async rejectWithdrawal({ request, response }: HttpContext) {
        const { withdrawalId } = request.params()

        try {
            const withdrawal = await Withdrawal.findOrFail(withdrawalId)
            withdrawal.status = 'rejected' // Update status to rejected
            await withdrawal.save()

            return response.status(200).json({
                message: 'Withdrawal rejected successfully',
                withdrawal,
            })
        } catch (error) {
            return response.status(404).json({
                message: 'Withdrawal not found',
                errors: error.message,
            })
        }
    }

    async subtractUserBalance({ request, response }: HttpContext) {
        const { userId, amount } = request.all()

        try {
            // Validate input data
            if (!userId || !amount) {
                return response.status(400).json({
                    message: 'Missing required fields',
                })
            }

            // Find the user's balance record
            const userBalance = await Balance.findBy('userId', userId)

            if (userBalance) {
                // Update existing balance
                userBalance.amount -= parseInt(String(amount))
                await userBalance.save()
            } else {
                // Create a new balance record if it doesn't exist
                await Balance.create({
                    userId,
                    amount,
                
                })
            }

            return response.status(200).json({
                message: 'User balance updated successfully',
            })
        } catch (error) {
            console.error(error)
            return response.status(500).json({
                message: 'Failed to update user balance',
                errors: error.message,
            })
        }
    }

    async addUserBalance({ request, response }: HttpContext) {
        const { userId, amount } = request.all()

        try {
            // Validate input data
            if (!userId || !amount) {
                return response.status(400).json({
                    message: 'Missing required fields',
                })
            }

            // Find the user's balance record
            const userBalance = await Balance.findBy('userId', userId)

            if (userBalance) {
                // Update existing balance
                userBalance.amount += parseInt(String(amount))
                await userBalance.save()
            } else return;

            return response.status(200).json({
                message: 'User balance updated successfully',
            })
        } catch (error) {
            console.error(error)
            return response.status(500).json({
                message: 'Failed to update user balance',
                errors: error.message,
            })
        }
    }
}