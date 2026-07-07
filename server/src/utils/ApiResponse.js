// Centralized success response envelope, mirroring ApiError's shape so the
// frontend Axios layer always sees the same top-level keys regardless of
// success or failure: { success, message, data, errors }.

class ApiResponse {
  constructor(statusCode, data = null, message = 'Success') {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.errors = [];
  }

  send(res) {
    return res.status(this.statusCode).json(this);
  }
}

export default ApiResponse;
