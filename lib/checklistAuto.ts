import { supabase } from "@/lib/supabaseClient";

// شناسه آیتم تنظیم ایستگاه کار در چک‌لیست
export const SETUP_ITEM_ID = "setup_workstation";

/**
 * تیک خودکار آیتم «تنظیم ارگونومیک ایستگاه کار» را انجام می‌دهد.
 * هم در LocalStorage و هم (اگر کاربر وارد شده باشد) در Supabase ذخیره می‌کند.
 */
export async function autoCheckWorkstationSetup(): Promise<void> {
  const todayStr = new Date().toISOString().split("T")[0];

  try {
    // ۱. ثبت در LocalStorage (برای کاربران مهمان)
    const existingRaw = localStorage.getItem(`checklist_${todayStr}`);
    const existing: string[] = existingRaw ? JSON.parse(existingRaw) : [];
    if (!existing.includes(SETUP_ITEM_ID)) {
      const updated = [...existing, SETUP_ITEM_ID];
      localStorage.setItem(`checklist_${todayStr}`, JSON.stringify(updated));
    }

    // ۲. اگر کاربر وارد شده است، در Supabase هم ذخیره کن
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // وضعیت امروز را بخوان تا از بین نرود
      const { data: todayRecord } = await supabase
        .from("checklist_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", todayStr)
        .maybeSingle();

      let items: string[] = [];
      let discomfortLevel: string | null = null;

      if (todayRecord) {
        items = Array.isArray(todayRecord.completed_items)
          ? todayRecord.completed_items
          : [];
        discomfortLevel = todayRecord.discomfort_level ?? null;
      }

      if (!items.includes(SETUP_ITEM_ID)) {
        items = [...items, SETUP_ITEM_ID];
      }

      // درصد را بر مبنای ۷ آیتم اصلی چک‌لیست محاسبه کن
      const TOTAL = 7;
      const percentage = Math.round((items.length / TOTAL) * 100);

      const { error } = await supabase.from("checklist_progress").upsert(
        {
          user_id: user.id,
          date: todayStr,
          completed_items: items,
          progress_percentage: percentage,
          percentage: percentage,
          discomfort_level: discomfortLevel,
        },
        { onConflict: "user_id,date" }
      );

      if (error) console.error("خطا در تیک خودکار تنظیم ایستگاه کار:", error.message);
    }
  } catch (err) {
    console.error("خطا در تیک خودکار تنظیم ایستگاه کار:", err);
  }
}
