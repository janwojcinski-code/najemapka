import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  formatPolishDate,
  getCurrentBillingDueDate,
  shouldSendReminder,
} from "@/lib/billing/deadlines";
// import { sendPaymentReminderEmail } from "@/lib/email/reminders";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();

  if (!shouldSendReminder(today)) {
    return NextResponse.json({
      ok: true,
      message: "No reminder day",
    });
  }

  const dueDate = getCurrentBillingDueDate(today);
  const reminderDate = today.toISOString().slice(0, 10);

  const supabase = await createClient();

  const { data: activeAssignments, error: assignmentError } = await supabase
    .from("tenant_assignments")
    .select(
      `
      apartment_id,
      tenant_user_id,
      profiles (
        id,
        email,
        full_name,
        role
      )
    `
    )
    .is("end_date", null);

  if (assignmentError) {
    return NextResponse.json(
      { error: assignmentError.message },
      { status: 500 }
    );
  }

  const results: Array<{ email: string; status: string }> = [];

  for (const assignment of activeAssignments ?? []) {
    const profile = Array.isArray(assignment.profiles)
      ? assignment.profiles[0]
      : assignment.profiles;

    if (!profile?.email || profile.role !== "tenant") continue;

    const { data: existingReminder } = await supabase
      .from("payment_reminders")
      .select("id")
      .eq("tenant_user_id", profile.id)
      .eq("apartment_id", assignment.apartment_id)
      .eq("reminder_type", "payment_due")
      .eq("reminder_date", reminderDate)
      .maybeSingle();

    if (existingReminder) {
      results.push({ email: profile.email, status: "already_sent_today" });
      continue;
    }

    try {
      await sendPaymentReminderEmail({
        to: profile.email,
        tenantName: profile.full_name || profile.email,
        dueDateText: formatPolishDate(dueDate),
      });

      const { error: insertError } = await supabase.from("payment_reminders").insert({
        tenant_user_id: profile.id,
        apartment_id: assignment.apartment_id,
        reminder_type: "payment_due",
        reminder_date: reminderDate,
      });

      if (insertError) {
        results.push({
          email: profile.email,
          status: `email_sent_but_log_failed: ${insertError.message}`,
        });
      } else {
        results.push({ email: profile.email, status: "sent" });
      }
    } catch (error: any) {
      results.push({
        email: profile.email,
        status: `send_failed: ${error.message}`,
      });
    }
  }

  return NextResponse.json({
    ok: true,
    reminderDate,
    dueDate: dueDate.toISOString().slice(0, 10),
    results,
  });
}