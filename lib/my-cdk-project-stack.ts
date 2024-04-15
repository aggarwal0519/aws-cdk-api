import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';

export class MyCdkProjectStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const addressTable = new dynamodb.Table(this, 'AddressTable', {
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
    });

    //Lambda function for storing addresses
    const storeAddressLambda = new lambda.Function(this, 'StoreAddressLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      handler: 'store-address.storeAddressHandler',
      environment: {
        ADDRESS_TABLE: addressTable.tableName,
      },
    });
    addressTable.grantWriteData(storeAddressLambda);

    // Lambda function for retrieving addresses
    const getAddressLambda = new lambda.Function(this, 'GetAddressLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      handler: 'get-address.getAddressHandler',
      environment: {
        ADDRESS_TABLE: addressTable.tableName,
      },
    });
    addressTable.grantReadData(getAddressLambda);

     // REST API Gateway
     const api = new apigateway.RestApi(this, 'address-api');

     //To store Address 
     const storeAddressIntegration = new apigateway.LambdaIntegration(storeAddressLambda);
      api.root.addMethod("POST", storeAddressIntegration);
      

      // To get Address
      const getAddressIntegration  = new apigateway.LambdaIntegration(getAddressLambda);
      api.root
      .addResource('users')
      .addMethod("GET", getAddressIntegration);

      
      new cdk.CfnOutput(this, "API URL",{
        value: api.url ?? "Something went wrong"
      })
  }
}
