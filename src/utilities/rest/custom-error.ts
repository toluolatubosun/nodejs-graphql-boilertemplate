class CustomError extends Error {
    msg: string;
    status: number;
    /**
     * Create custom error
     *
     * @param {*} message Error message for request response
     * @param {number} statusCode HTTP status code. Default is 400
     */
    constructor(message: string, statusCode: number) {
        super(message);
        this.msg = message;
        this.status = statusCode || 400;
        this.name = this.constructor.name;
    }
}

export default CustomError;
