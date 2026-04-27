import SysCounter from "../models/sys_counter.js";

function toYYMMDD(date) {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}${mm}${dd}`;
}

export async function generateDailyCode(prefix, opts = {}) {
  const now = opts.date instanceof Date ? opts.date : new Date();
  const yymmdd = toYYMMDD(now);
  const counterKey = `${prefix}-${yymmdd}`;

  const doc = await SysCounter.findOneAndUpdate(
    { _id: counterKey },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const width = typeof opts.width === "number" ? opts.width : 4;
  const running = String(doc.seq).padStart(width, "0");
  return `${prefix}-${yymmdd}-${running}`;
}

