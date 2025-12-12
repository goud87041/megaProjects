// import { Error } from "mongoose";

class ApiResponse{
    constructor(
        statusCode,data,massage = "Success"
    ){
        this.statusCode = statusCode,
        this.data = data,
        this.massage  = massage < 400
    }
}

export {ApiResponse}