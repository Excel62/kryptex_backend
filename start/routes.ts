/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import AdminController from '#controllers/admin_controller'
import TransactionsController from '#controllers/transactions_controller'
import UsersController from '#controllers/users_controller'
import router from '@adonisjs/core/services/router'


router.post('/sign-up', [UsersController, 'signUp'])
router.post('/sign-in', [UsersController, 'signIn'])
router.post('/generate-reset-token', [UsersController, 'generate_reset_token'])
router.get('/user/getinstance', [UsersController, 'getUserInsatnce'])




// Transactions Related Routes

router.post('/deposit', [TransactionsController, 'createDeposit'])
router.post('/withdrawal', [TransactionsController, 'withdrawRequest'])


// Admin related routes

router.post('/admin/sign-up', [AdminController, 'signUp'])
router.post('/admin/sign-in', [AdminController, 'signIn'])
router.get('/admin/users', [AdminController, 'fetchAllUsers'])
router.delete('/admin/users/:id', [AdminController, 'deleteUser'])
router.get('/admin/deposits', [AdminController, 'fetchAllDeposits'])
router.post('/admin/approve-deposit/:id', [AdminController, 'approveDeposit'])
router.get('/admin/reject-deposit/:id', [AdminController, 'rejectDeposit'])
router.post('/admin/subtract-balance', [AdminController, 'subtractUserBalance'])
router.post('/admin/add-balance', [AdminController, 'addUserBalance'])
router.get('/admin/withdrawals', [AdminController, 'fetchAllWithdrawals'])
router.post('/admin/approve-withdrawal', [AdminController, 'approveWithdrawal'])
router.post('/admin/reject-withdrawal', [AdminController, 'rejectWithdrawal'])