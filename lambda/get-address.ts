// import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { DynamoDBClient, GetItemCommand, ScanCommand} from '@aws-sdk/client-dynamodb';
import { marshall,unmarshall } from '@aws-sdk/util-dynamodb';
import { AttributeValue } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyHandler} from 'aws-lambda';
const dynamoDbClient = new DynamoDBClient({ region: 'us-east-1' });

const tableName = process.env.ADDRESS_TABLE;

export const getAddressHandler = async (event: any) => {
    

    
    console.info("request:", JSON.stringify(event, undefined, 2));
    
    //Converting the JSON String -> JSON Object
    // const queryStringParameters = JSON.parse(event.queryStringParameters);

    const userId = event.queryStringParameters["userId"];
    const suburb = event.queryStringParameters["suburb"];
    const postcode = event.queryStringParameters['postcode'];

    console.info(event.queryStringParameters);

    let params = {
        TableName: tableName,
        FilterExpression: 'userId = :userId',
        ExpressionAttributeValues:
        marshall({
            ':userId': userId
          })
        }
   
        if (suburb && postcode) {
            params.FilterExpression += ' AND suburb = :suburb AND postcode = :postcode';
            params.ExpressionAttributeValues = marshall({':userId': userId , ':suburb': suburb, ':postcode': postcode})
           
        }
       
        else if (suburb) {
            params.FilterExpression += ' AND suburb = :suburb';
            params.ExpressionAttributeValues = marshall({':userId': userId , ':suburb': suburb})
           
        }
        
        else if (postcode) {
            params.FilterExpression += ' AND postcode = :postcode';
            params.ExpressionAttributeValues = marshall({':userId': userId , ':postcode': postcode})
           
        }
        
        

    try {
        const Item  =  await dynamoDbClient.send(new ScanCommand(params));
        const unmarshalledItem = Item.Items?.map(item => unmarshall(item));

        return {
            statusCode: 200,
            body: JSON.stringify(unmarshalledItem),
            
        };
    }

    catch(error)
        {
            console.error('Error getting address:', error);
            
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Error getting address' }),
                
            };
        }    
    
    
}
