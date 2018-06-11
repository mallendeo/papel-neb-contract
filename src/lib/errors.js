export const AppError = (name, message, status = 500) => {
  const err = Error(message)
  err.name = name
  err.status = status

  return err
}

const ERROR_TYPES = {
  NotFoundError: 'NotFoundError',
  MissingParameterError: 'MissingParameterError',
  ForbiddenError: 'ForbiddenError',
  ConflictError: 'ConflictError',
  UnauthorizedError: 'UnauthorizedError'
}

export const NotFoundError = (message = 'Not found') =>
  AppError(ERROR_TYPES.NotFoundError, message, 404)

export const MissingParameterError = param =>
  AppError(ERROR_TYPES.MissingParameterError, `Missing parameter ${param}`, 400)

export const ForbiddenError = (message = `You're not allowed to do that`) =>
  AppError(ERROR_TYPES.ForbiddenError, message, 403)

export const ConflictError = message =>
  AppError(ERROR_TYPES.ConflictError, message, 409)

export const UnauthorizedError = (message = `You're not allowed to do that`) =>
  AppError(ERROR_TYPES.UnauthorizedError, message, 401)

export default AppError
