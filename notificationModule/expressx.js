

function jsonBody(request, response, next) {

    if(['get','delete'].includes(request.method.toLowerCase())) {
        console.log('Not a body request');
        return next();
    }
    
    

    if(!request.get('Content-Type').includes('/json')){
        console.log('Not a JSON request');
        return next(); //skip 
    }

    let body = "";
    request
        .on('data', buffer => body += buffer.toString())
        .on('end', () => {
            try {
  
                request.body = JSON.parse(body);
                
                 
            } catch (e) {
                //body can't be parsed.
                //It is optional to have a JSON body
                //so we will ignore this error.
                //console.log('invalid json',body);
                
            }
            next();
        });
}

function logRequestInfo(request,response,next){
    console.log(`${request.method} ${request.path}`);
    console.log('request.path',request.path);
    console.log('request.params',request.params);
    console.log('request.query',request.query);
    console.log('request.body',request.body);
    console.log();
    
    
    next();
    
}



module.exports={
    jsonBody: jsonBody,
    logRequestInfo
};
