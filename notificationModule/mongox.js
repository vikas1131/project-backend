require('dotenv').config();
const {MongoClient} =require('mongodb');

async function executeOnCollection(collectionName, action, urlKey='MONGODB_URL', dbName=null){
    try{
        var client = new MongoClient(process.env[urlKey]);
        var connection = await client.connect();  
        var db= dbName?connection.db(dbName): connection.db(); //default database (as per connection url)        
        const collection = await db.collection(collectionName);
       
        return await action(collection,db);
        
    }catch(err){
       console.log('err.message',err.message);
       
    }finally{
        connection.close();
    }
}

async function findAll(collectionName){
    return await executeOnCollection(collectionName,async (collection,db)=>{
        return await (collection.find()).toArray();
    });
}

async function findOne(collectionName, matcher){
    return await executeOnCollection(collectionName,async (collection,db)=>{
        return await (collection.findOne(matcher));
    });
}

async function aggregate(collectionName, ... operators){
    return await executeOnCollection(collectionName,async (collection,db)=>{
        return await ((collection.aggregate(operators))).toArray();
    });
}

module.exports={
    executeOnCollection,
    findAll,
    findOne,
    aggregate,
 
};
