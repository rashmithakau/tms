import AppErrorCode from "../constants/appErrorCode";
import { HttpStatusCode } from "../constants/http";

class appError extends Error {
    constructor(
        public statusCode: HttpStatusCode,
        public message: string,
        public errorCode?: AppErrorCode,
    ){
        super(message);
    }
}

export default appError;