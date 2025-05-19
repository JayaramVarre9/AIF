import { CognitoIdentityProviderClient, AdminGetUserCommand } from "@aws-sdk/client-cognito-identity-provider";

export async function POST(req: Request) {
  const { username } = await req.json();

  const client = new CognitoIdentityProviderClient({ region: "us-east-1" });

  try {
    const user = await client.send(new AdminGetUserCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID!,
      Username: username,
    }));

    // Extract user attributes
    const attributes = user.UserAttributes || [];

    const emailVerified = attributes.find(attr => attr.Name === "email_verified")?.Value === "true";
    //const phoneVerified = attributes.find(attr => attr.Name === "phone_number_verified")?.Value === "true";

    if (!emailVerified /*&& !phoneVerified*/) {
      return new Response(
        JSON.stringify({
          error: "User exists but hasn't completed initial setup. Please log in once using the temporary password.",
        }),
        { status: 403 }
      );
    }

    return new Response(JSON.stringify({ exists: true }), { status: 200 });

} catch (err) {
    // 👇 Type-safe way to check if the error is a Cognito error
    if (typeof err === "object" && err !== null && "name" in err) {
      if ((err as { name: string }).name === "UserNotFoundException") {
        return new Response(JSON.stringify({ exists: false }), { status: 200 });
      }
    }

    console.error("Error checking user:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500 });
  }
}