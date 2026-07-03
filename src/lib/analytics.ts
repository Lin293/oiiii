import { supabase } from "./supabase";

function getDeviceId() {
  let id = localStorage.getItem("device_id");

  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("device_id", id);
  }

  return id;
}

export async function trackTranslate(text: string) {
  try {
    const { error } = await supabase.from("usage_logs").insert({
      device_id: getDeviceId(),
      action: "translate",
      text_length: text.length,
      app_version: "0.1.0",
    });

    if (error) {
      console.error(error);
    }
  } catch (e) {
    console.error(e);
  }
}