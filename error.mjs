
class FurverError extends Error { }
class FurverExpressionError extends FurverError {}
class FurverInvalidSchemaError extends FurverError {}

export {
  FurverError,
  FurverExpressionError,
  FurverInvalidSchemaError
}
