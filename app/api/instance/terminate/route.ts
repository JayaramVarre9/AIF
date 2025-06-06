import { EC2Client, TerminateInstancesCommand } from "@aws-sdk/client-ec2";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { instance_id } = await req.json();
  if (!instance_id) return NextResponse.json({ error: "Missing instance_id" }, { status: 400 });

  const ec2 = new EC2Client({ region: "us-east-1" }); // or your cluster's region

  try {
    const terminateCommand = new TerminateInstancesCommand({
      InstanceIds: [instance_id],
    });

    const response = await ec2.send(terminateCommand);
    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error("Termination failed", error);
    return NextResponse.json({ error: "Failed to terminate instance" }, { status: 500 });
  }
}
