const delay= time=> new Promise(resolve=>setTimeout(resolve, time));

class ValidationError extends Error{
    constructor(errors){
        super('Validation Error');
        this.errors=errors;
    }
}


module.exports={
    delay,
    ValidationError
}


