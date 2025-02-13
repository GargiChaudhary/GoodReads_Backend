const { StatusCodes } = require('http-status-codes');
const { UserRepository } = require('../repositories/index');
const { ClientError } = require('../utils/errors');
const ValidationError = require('../utils/errors/validation-error');

class UserService {
    constructor() {
        this.userRepository = new UserRepository();
    }

    signup = async (data) => {
        try {
            const response = await this.userRepository.create(data);
            return response;
        } catch(error) {
            if(error.name == 'ValidationError') {
                throw new ValidationError({
                    errors: error.errors,
                    message: error.message,
                });
            }
            throw error;
        }
    }

    signin = async (data) => {
        try {
            const user = await this.userRepository.getUserByEmail(data.email);
            if(!user) {
                throw new ClientError({
                    message: 'Invalid data sent from the client',
                    explanation: 'No registered user found for the given email'
                }, StatusCodes.NOT_FOUND);
            }
            const passwordMatch = user.comparePassword(data.password);
            if(!passwordMatch) {
                throw new ClientError({
                    message: 'Invalid data sent from the client',
                    explanation: 'Password given is not correct, please try again!'
                })
            }
            const jwtToken = user.generateJWT();
            return jwtToken;
        } catch(error) {
            throw error;
        }
    }
}

module.exports = UserService;