import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Parse the form data from Twilio
    const formData = await req.formData();
    
    // Get the sender's phone number
    const from = formData.get("From") as string;
    
    // Get the image URL - Twilio sends MMS images as MediaUrl0, MediaUrl1, etc.
    const mediaUrl = formData.get("MediaUrl0") as string;
    const numMedia = parseInt(formData.get("NumMedia") as string || "0");
    
    console.log("Received message from:", from);
    console.log("Number of media attachments:", numMedia);
    
    if (numMedia === 0 || !mediaUrl) {
      // Respond to the user if no image was sent
      const twiml = `
        <?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Message>Please send a photo of your receipt.</Message>
        </Response>
      `;
      
      return new NextResponse(twiml, {
        headers: { "Content-Type": "text/xml" }
      });
    }
    
    console.log("Processing image from URL:", mediaUrl);
    
    // In a real implementation, you would process the receipt image here
    // and save it to your database
    
    // Respond to the user
    const twiml = `
      <?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Message>Thanks! We've received your receipt and are processing it.</Message>
      </Response>
    `;
    
    return new NextResponse(twiml, {
      headers: { "Content-Type": "text/xml" }
    });
  } catch (error) {
    console.error("Error handling Twilio webhook:", error);
    
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}