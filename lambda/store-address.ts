// import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
// Create DynamoDB client
const dynamoDbClient = new DynamoDBClient({ region: 'us-east-1' });
const tableName = process.env.ADDRESS_TABLE;

export const storeAddressHandler = async (event: any) => {
    //Logs to check in CloudWatch
    console.info('received', event);
    
    let requestBody;
    //Parsing the request body
    try {
      requestBody = JSON.parse(event.body);
    }
    catch (error) {
        console.log('Error parsing JSON:', error, event.body);
    }
    
    const command = new PutItemCommand({
      TableName: tableName,
      Item: marshall(requestBody)

    });
    try {
      await dynamoDbClient.send(command);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Address stored successfully' }),
      };
    } catch (error) {
      console.error('Error storing address:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Error storing address' }),
      };
    }
};
