import { NextRequest, NextResponse } from "next/server";
import { DEMO_DM_RULES } from "@/lib/data-service";

export const dynamic = "force-dynamic";

// Meta Webhook Verification Token (Matches what is entered in Meta Developer App)
const VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN || "orbit";
const ACCESS_TOKEN = process.env.INSTAGRAM_PAGE_ACCESS_TOKEN || "";

/**
 * 1. Webhook Verification Handler (GET)
 * Meta calls this when you configure your Webhook URL in Meta for Developers
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  console.log(`[Instagram Webhook] GET verification received: mode=${mode}, token=${token}, challenge=${challenge}`);

  // Meta sends mode=subscribe and hub.challenge
  if (mode === "subscribe" && challenge) {
    const configuredToken = process.env.INSTAGRAM_VERIFY_TOKEN;
    
    // Accept if matching configured token, or preset values ('as', 'orbit'), or any non-empty token
    const isTokenValid =
      !configuredToken ||
      token === configuredToken ||
      token === "as" ||
      token === "orbit" ||
      Boolean(token);

    if (isTokenValid) {
      console.log("[Instagram Webhook] Verified successfully! Returning challenge:", challenge);
      return new NextResponse(challenge, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    }
  }

  console.warn("[Instagram Webhook] Verification rejected:", { mode, token });
  return new NextResponse("Verification failed", {
    status: 403,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

/**
 * 2. Real-time Comment Webhook Handler (POST)
 * Triggered automatically by Instagram when someone comments on your posts/reels
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verify payload object is instagram
    if (body.object === "instagram") {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          if (change.field === "comments") {
            const comment = change.value;
            const commentText = (comment.text || "").toLowerCase();
            const commenterUsername = comment.from?.username || "unknown";
            const commentId = comment.id;

            console.log(`[Instagram Webhook] New comment from @${commenterUsername}: "${commentText}"`);

            // Find matching automation rule
            const matchedRule = DEMO_DM_RULES.find((rule) => {
              if (!rule.is_active) return false;
              return rule.keywords.some((kw) =>
                commentText.includes(kw.toLowerCase())
              );
            });

            if (matchedRule) {
              console.log(`[Instagram Webhook] Matched Rule: ${matchedRule.name}`);

              // If Meta Access Token is configured, dispatch live DM via Meta Graph API
              if (ACCESS_TOKEN) {
                await sendInstagramDm({
                  recipientId: comment.from.id,
                  message: matchedRule.dm_message,
                  buttonText: matchedRule.button_text,
                  buttonUrl: matchedRule.button_url,
                });

                // Post public comment reply if configured
                if (matchedRule.reply_comment && commentId) {
                  await postCommentReply(commentId, matchedRule.reply_comment);
                }
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ status: "EVENT_RECEIVED" }, { status: 200 });
  } catch (error) {
    console.error("[Instagram Webhook] Error processing event:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Helper: Send DM via Meta Graph API
async function sendInstagramDm({
  recipientId,
  message,
  buttonText,
  buttonUrl,
}: {
  recipientId: string;
  message: string;
  buttonText?: string;
  buttonUrl?: string;
}) {
  try {
    const payload: any = {
      recipient: { id: recipientId },
      message: {
        text: message,
      },
    };

    if (buttonText && buttonUrl) {
      payload.message.attachment = {
        type: "template",
        payload: {
          template_type: "button",
          text: message,
          buttons: [
            {
              type: "web_url",
              url: buttonUrl,
              title: buttonText,
            },
          ],
        },
      };
    }

    await fetch(`https://graph.facebook.com/v21.0/me/messages?access_token=${ACCESS_TOKEN}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("[Instagram Webhook] sendInstagramDm error:", err);
  }
}

// Helper: Post public reply on Instagram comment
async function postCommentReply(commentId: string, replyText: string) {
  try {
    await fetch(`https://graph.facebook.com/v21.0/${commentId}/replies?access_token=${ACCESS_TOKEN}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: replyText }),
    });
  } catch (err) {
    console.error("[Instagram Webhook] postCommentReply error:", err);
  }
}
