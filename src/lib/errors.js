export class AppError extends Error {
  constructor (message, status) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
    this.status = status || 500
  }
}

export class NotFoundError extends AppError {
  constructor (message) {
    super(message || 'Not found', 404)
  }
}

export class MissingParameterError extends AppError {
  constructor (param) {
    super(`Missing parameter ${param}`, 400)
  }
}

export class ForbiddenError extends AppError {
  constructor (message) {
    super(message || `You're not allowed to do that`, 403)
  }
}

export class ConflictError extends AppError {
  constructor (message) {
    super(message, 409)
  }
}

export class UnauthorizedError extends AppError {
  constructor (message) {
    super(message || `You're not allowed to do that`, 401)
  }
}

export default AppError
