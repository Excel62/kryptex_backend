import type { HttpContext } from '@adonisjs/core/http'

import Deposit from "#models/deposit"
import Withdrawal from '#models/withdrawal'
import Balance from '#models/balance'

export default class TransactionsController {


    async createDeposit({ request, response }: HttpContext) {
        const { userId, amount, currency } = request.all()
        try {
        // Validate input data
        if (!userId || !amount || !currency) {
            return response.status(400).json({
            message: 'Missing required fields',
            })
        }
    
        // Create a new deposit record
        const deposit = await Deposit.create({
            userId,
            amount,
            currency,
            status: 'pending', // Initial status
        })
    
        return response.status(201).json({
            message: 'Deposit created successfully',
            deposit,
        })
        } catch (error) {
        console.error(error)
        return response.status(500).json({
            message: 'Failed to create deposit',
            errors: error.message,
        })
        }
    }

    async withdrawRequest({ request, response }: HttpContext) {
        const { userId, amount, currency } = request.all()
    
        try {
            // Validate input data
            if (!userId || !amount || !currency) {
                return response.status(400).json({
                    message: 'Missing required fields',
                })
            }
            
            const userBalance = await Balance.query().where('userId', userId).first()
            
            if (!userBalance || userBalance.amount < amount) {
                return response.status(400).json({
                    message: 'Insufficient balance for withdrawal',
                })
            }
            // Create a new withdrawal request record
            const withdrawalRequest = await Withdrawal.create({
                userId,
                amount,
                currency,
                status: 'pending', // Initial status
            })
    
            return response.status(201).json({
                message: 'Withdrawal request created successfully',
                withdrawalRequest,
            })
        } catch (error) {
            console.error(error)
            return response.status(500).json({
                message: 'Failed to create withdrawal request',
                errors: error.message,
            })
        }
    }
}