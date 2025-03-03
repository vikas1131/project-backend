class BusinessError extends Error{
    constructor(message, errors){
        super(message|| this.constructor.name);
        this.errors=errors || {message};
        if(!this.errors.message)
            this.errors.message=message;
    }
}


class ValidationError extends BusinessError{
   
}

class NotFoundError extends BusinessError{
   
}

class AuthenticationError extends BusinessError{
   
}

class AuthorizationError extends BusinessError{
   
}

module.exports={
    BusinessError,
    ValidationError,
    NotFoundError,
    AuthenticationError,
    AuthorizationError
}