import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { SNSEntryData } from "../interfaces/betting";

// Initialize SNS client
const snsClient = new SNSClient({
  region: process.env.AWS_REGION,
});

/**
 * Publish entry event to SNS topic for Bet360 processing
 */
export async function publishEntryToSNS(entryData: SNSEntryData): Promise<void> {
  try {
    const message = JSON.stringify(entryData);

    const command = new PublishCommand({
      TopicArn: process.env.SNS_TOPIC_ARN,
      Message: message,
      Subject: "Betwiz Entry Created",
      MessageAttributes: {
        eventType: {
          DataType: "String",
          StringValue: "ENTRY_CREATED",
        },
        userId: {
          DataType: "String",
          StringValue: entryData.userId || "",
        },
      },
    });

    await snsClient.send(command);
  } catch (error) {
    console.error("❌ Failed to publish to SNS:", error);
    // Don't throw - we don't want to fail the entry creation if SNS fails
    // Consider adding retry logic or alerting here
  }
}
