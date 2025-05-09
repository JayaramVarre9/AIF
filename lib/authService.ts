import {
    CognitoIdentityProviderClient,
    InitiateAuthCommand,
    RespondToAuthChallengeCommand,
    ConfirmForgotPasswordCommand,
    ForgotPasswordCommand,
    GetUserCommand,
    InitiateAuthCommandInput,
    RespondToAuthChallengeCommandInput,
  } from "@aws-sdk/client-cognito-identity-provider";
  import CryptoJS from "crypto-js";
  const config = {
    region: process.env.NEXT_PUBLIC_AWS_REGION!,
    clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
    clientSecret: process.env.NEXT_PUBLIC_COGNITO_CLIENT_SECRET!,
  };
  if (!config.clientId || !config.clientSecret) {
    throw new Error("Missing Cognito client ID or client secret in environment variables");
  }
  // 🟡 SDK client
  const cognitoClient = new CognitoIdentityProviderClient({
    region: config.region,
  });
  
  // 🔐 HMAC-SHA256 secret hash
  function hmacSha256Hex(secret: string, message: string): string {
    const hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, secret);
    hmac.update(message);
    return CryptoJS.enc.Base64.stringify(hmac.finalize());
  }
  
  // ✅ Sign In
  export const signIn = async (username: string, password: string) => {
    const secretHash = hmacSha256Hex(config.clientSecret, username + config.clientId);
    const params: InitiateAuthCommandInput = {
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: config.clientId,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
        SECRET_HASH: secretHash,
      },
    };
  
    const command = new InitiateAuthCommand(params);
    const response = await cognitoClient.send(command);
  
    if (response.ChallengeName === "NEW_PASSWORD_REQUIRED") {
      return { challenge: "NEW_PASSWORD_REQUIRED", session: response.Session };
    }
  
    if (response.AuthenticationResult) {
      const { AccessToken, IdToken, RefreshToken } = response.AuthenticationResult;
  
      // Optional: get user attributes (department, name, etc.)
      const user = await cognitoClient.send(
        new GetUserCommand({ AccessToken: AccessToken || "" })
      );
  
      return {
        AccessToken,
        IdToken,
        RefreshToken,
        department: user.UserAttributes?.find(attr => attr.Name === "custom:department")?.Value || "",
        name: user.UserAttributes?.find(attr => attr.Name === "name")?.Value || "",
      };
    }
  
    throw new Error("Authentication failed.");
  };
  
  // 🔁 Complete NEW_PASSWORD_REQUIRED
  export const completeNewPasswordChallenge = async (
    username: string,
    newPassword: string,
    session: string
  ) => {
    const secretHash = hmacSha256Hex(config.clientSecret, username + config.clientId);
    const params: RespondToAuthChallengeCommandInput = {
      ClientId: config.clientId,
      ChallengeName: "NEW_PASSWORD_REQUIRED",
      ChallengeResponses: {
        USERNAME: username,
        NEW_PASSWORD: newPassword,
        SECRET_HASH: secretHash,
      },
      Session: session,
    };
  
    const command = new RespondToAuthChallengeCommand(params);
    const response = await cognitoClient.send(command);
  
    if (response.AuthenticationResult) {
      return {
        AccessToken: response.AuthenticationResult.AccessToken,
        IdToken: response.AuthenticationResult.IdToken,
        RefreshToken: response.AuthenticationResult.RefreshToken,
      };
    }
  
    throw new Error("Failed to complete new password challenge.");
  };
  
  // 🔐 Forgot Password
  export const forgotPassword = async (username: string) => {
    const secretHash = hmacSha256Hex(config.clientSecret, username + config.clientId);
    const command = new ForgotPasswordCommand({
      ClientId: config.clientId,
      Username: username,
      SecretHash: secretHash,
    });
  
    return await cognitoClient.send(command);
  };
  
  // ✅ Confirm Forgot Password
  export const confirmForgotPassword = async (
    username: string,
    code: string,
    newPassword: string
  ) => {
    const secretHash = hmacSha256Hex(config.clientSecret, username + config.clientId);
    const command = new ConfirmForgotPasswordCommand({
      ClientId: config.clientId,
      Username: username,
      ConfirmationCode: code,
      Password: newPassword,
      SecretHash: secretHash,
    });
  
    return await cognitoClient.send(command);
  };
  