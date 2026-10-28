// <form data-apply="join|community"> を /api/apply に送る
export function initApplyForms(root: ParentNode = document) {
  root.querySelectorAll<HTMLFormElement>("form[data-apply]").forEach((form) => {
    if (form.dataset.ready) return;
    form.dataset.ready = "1";
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const msg = form.querySelector<HTMLElement>("[data-msg]")!;
      const btn = form.querySelector<HTMLButtonElement>("button[type=submit]")!;
      const body: Record<string, string> = {};
      new FormData(form).forEach((v, k) => (body[k] = String(v)));
      body.kind = form.dataset.apply!;
      if (form.dataset.community) body.community = form.dataset.community;
      btn.disabled = true;
      msg.textContent = "送信しています…";
      try {
        const res = await fetch("/api/apply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error || "送信できませんでした。時間をおいてもう一度試してください。");
        msg.textContent = body.kind === "community"
          ? `${body.community}への申し込みを受け付けました。主催者からメールで連絡が届きます。`
          : `${body.name}さんの「${body.like}」を受け取りました。運営メンバーからメールで連絡します。`;
        form.querySelectorAll<HTMLInputElement>("input,select,textarea").forEach((el) => (el.disabled = true));
      } catch (err) {
        msg.textContent = (err as Error).message;
        btn.disabled = false;
      }
    });
  });
}
