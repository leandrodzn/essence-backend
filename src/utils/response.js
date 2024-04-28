module.exports = class Response {
  constructor(data, status, name, message, details) {
    this.data = data;
    this.status = status;
    this.name = name;
    this.message = message;
    this.details = details;
  }

  getMessage() {
    return {
      status: this.status ?? 0,
      name: this.name ?? "",
      message: this.message ?? "Error",
      details: this.details ?? {},
      data: this.data,
    };
  }
};
