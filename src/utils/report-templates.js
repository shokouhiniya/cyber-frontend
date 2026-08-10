/**
 * Comprehensive report HTML template — two-column A4 layout.
 * Includes all dashboard sections in a print-friendly format.
 */

const fmtNum = (n) => {
  if (!n) return '۰';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return Number(n).toLocaleString('fa-IR');
};

const today = () => new Date().toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' });

const PERIOD_LABELS = { daily: '۲۴ ساعت گذشته', weekly: '۷ روز گذشته', monthly: '۳۰ روز گذشته', quarterly: '۹۰ روز گذشته' };

const styles = `
* { box-sizing: border-box; margin: 0; padding: 0; }
@page { size: A4; margin: 15mm 20mm; } /* Defines physical PDF page margins */
body { margin: 0; padding: 0; }
.rpt { width: 100%; max-width: 100%; padding: 10px; background: #fff; font-family: 'Vazirmatn','IRANSans',Tahoma,sans-serif; direction: rtl; color: #212B36; font-size: 10px; line-height: 1.6; overflow: hidden; }
.hdr { text-align: center; padding-bottom: 14px; margin-bottom: 16px; border-bottom: 3px solid #1e6091; }
.hdr h1 { font-size: 18px; color: #1e6091; }
.hdr .sub { font-size: 11px; color: #637381; margin-top: 2px; }
.hdr .meta { font-size: 8px; color: #919EAB; margin-top: 3px; }
.cols { display: flex; gap: 12px; width: 100%; overflow: hidden; }
.col { flex: 1; min-width: 0; overflow: hidden; }
.sec { background: #F9FAFB; border-radius: 6px; padding: 10px; margin-bottom: 10px; border: 1px solid #F4F6F8; page-break-inside: avoid; break-inside: avoid; overflow: hidden; }
.sec-t { font-size: 10px; font-weight: 700; color: #454F5B; margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px solid #EDEFF2; }
.stats { display: flex; gap: 6px; margin-bottom: 12px; width: 100%; }
.st { flex: 1; text-align: center; padding: 8px 4px; background: #F4F6F8; border-radius: 6px; }
.st .v { font-size: 14px; font-weight: 800; color: #1e6091; }
.st .l { font-size: 8px; color: #919EAB; margin-top: 1px; }
.bar { display: flex; height: 7px; border-radius: 4px; overflow: hidden; }
.tbl { width: 100%; border-collapse: collapse; font-size: 9px; table-layout: fixed; }
.tbl th { background: #F4F6F8; padding: 4px 6px; text-align: right; font-weight: 700; font-size: 8px; }
.tbl td { padding: 3px 6px; border-bottom: 1px solid #F9FAFB; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.post { padding: 6px 8px; margin: 4px 0; background: #fff; border-radius: 4px; border-right: 2px solid #1e6091; page-break-inside: avoid; break-inside: avoid; overflow: hidden; }
.post .pm { font-size: 8px; color: #919EAB; }
.post .pt { font-size: 9px; line-height: 1.7; margin-top: 2px; word-break: break-word; overflow-wrap: break-word; }
.badge { display: inline-block; padding: 1px 5px; border-radius: 3px; font-size: 7px; font-weight: 700; }
.src-row { display: flex; align-items: center; gap: 6px; padding: 2px 0; }
.src-bar { flex: 1; height: 5px; background: #EDEFF2; border-radius: 3px; overflow: hidden; }
.src-fill { height: 100%; border-radius: 3px; background: #1e6091; }
.ftr { text-align: center; color: #C4CDD5; font-size: 8px; margin-top: 16px; padding-top: 8px; border-top: 1px solid #F4F6F8; }
.crisis-dims { display: flex; gap: 4px; flex-wrap: wrap; }
.dim { flex: 1; min-width: 45%; padding: 4px 6px; background: #fff; border-radius: 4px; border: 1px solid #EDEFF2; }
.dim .dn { font-size: 8px; color: #637381; }
.dim .dv { font-size: 11px; font-weight: 800; }
.kw-cloud { display: flex; flex-wrap: wrap; gap: 4px; }
.kw { padding: 2px 6px; background: #EDF2FF; border-radius: 3px; font-size: 8px; color: #364FC7; font-weight: 600; }
`;

export function buildReportHtml(period, data) {
  const {
    profileName, stats, emotions, topPosts, topCommented, topForwarded,
    influencers, sourceTotals, aiSummary, crisisMetrics, hashtags,
    officialPosts, promises, macroContext, recommendations,
    userDistribution, politicalSpectrum, narrativeGap,
  } = data;

  const periodLabel = PERIOD_LABELS[period] || period;

  // Sentiment
  const emotionTotal = Object.values(emotions || {}).reduce((s, v) => s + v, 0);
  const posCount = emotions?.hope || 0;
  const negCount = emotions?.worry || 0;
  const neuCount = Math.max(0, emotionTotal - posCount - negCount);
  const posPct = emotionTotal > 0 ? Math.round((posCount / emotionTotal) * 100) : 0;
  const negPct = emotionTotal > 0 ? Math.round((negCount / emotionTotal) * 100) : 0;
  const neuPct = 100 - posPct - negPct;

  // Health score — net sentiment balance (same formula as the dashboard)
  const healthScore = emotionTotal > 0
    ? Math.min(100, Math.max(0, Math.round(50 + ((posCount - negCount) / emotionTotal) * 50)))
    : null;

  // Crisis
  const crisis = crisisMetrics || {};
  const crisisLevel = crisis.level === 'critical' ? 'بحرانی' : crisis.level === 'warning' ? 'هشدار' : 'ایمن';

  // Sources
  const srcHtml = (sourceTotals || []).slice(0, 10).map(s => {
    const max = Math.max(...(sourceTotals || []).map(x => x.count || 0), 1);
    const pct = Math.round(((s.count || 0) / max) * 100);
    return `<div class="src-row"><span style="min-width:55px;font-size:8px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${s.source}</span><div class="src-bar"><div class="src-fill" style="width:${pct}%"></div></div><span style="min-width:35px;font-size:8px;text-align:left;">${fmtNum(s.count)}</span></div>`;
  }).join('');

  // Posts helper — 500 char limit, strip URLs from post body text only
  const stripLinks = (text) => (text || '').replace(/https?:\/\/\S+/g, '').replace(/\s{2,}/g, ' ').trim();
  const postCard = (p, i) => {
    const cleanText = stripLinks(p.text || '');
    const text = cleanText.slice(0, 500) + (cleanText.length > 500 ? '...' : '');
    return `<div class="post"><div class="pm">${i + 1}. @${p.screenName || '?'} · ${p.sourceType || '?'} · ${fmtNum(p.viewCount)} بازدید</div><div class="pt">${text}</div></div>`;
  };

  // Influencers
  const supporters = (influencers || []).filter(a => a.stance === 'supporter').slice(0, 6);
  const critics = (influencers || []).filter(a => a.stance === 'critic').slice(0, 6);
  const infRow = (a, i) => `<tr><td style="width:20px;">${i + 1}</td><td>@${a.username}</td><td>${a.sourceType}</td><td>${fmtNum(a.totalViews)}</td></tr>`;

  // Keywords/topics
  const kwHtml = (hashtags || []).slice(0, 15).map(h => `<span class="kw">${h.label}</span>`).join('');

  // Promises
  const promiseHtml = (promises || []).slice(0, 5).map(p => {
    const scoreLabel = p.score >= 65 ? 'مثبت' : p.score >= 40 ? 'خنثی' : p.score !== null ? 'منفی' : '—';
    const scoreColor = p.score >= 65 ? '#2B8A3E' : p.score >= 40 ? '#E67700' : p.score !== null ? '#C92A2A' : '#868E96';
    return `<div style="padding:3px 0;border-bottom:1px solid #F4F6F8;display:flex;justify-content:space-between;"><span style="flex:1;">${(p.text || '').slice(0, 60)}</span><span class="badge" style="background:${scoreColor}15;color:${scoreColor};">${scoreLabel}</span></div>`;
  }).join('');

  // Macro context
  let macroHtml = '';
  if (macroContext) {
    try {
      const mc = typeof macroContext === 'string' ? JSON.parse(macroContext) : macroContext;
      if (mc.events) {
        macroHtml = mc.events.slice(0, 3).map(e => `<div style="padding:3px 0;border-bottom:1px solid #F4F6F8;"><strong>${e.title}</strong>: ${e.summary}</div>`).join('');
      }
    } catch { macroHtml = `<div style="font-size:9px;line-height:1.7;">${String(macroContext).slice(0, 300)}</div>`; }
  }

  // Recommendations
  const recsHtml = (recommendations || []).slice(0, 3).map(r => `<div style="padding:4px 0;border-bottom:1px solid #F4F6F8;"><strong>${r.title || ''}</strong><br/><span style="color:#637381;">${(r.description || '').slice(0, 80)}</span></div>`).join('');

  // User distribution
  const ud = userDistribution || {};

  // Political spectrum
  let spectrumHtml = '';
  if (politicalSpectrum && typeof politicalSpectrum === 'string') {
    spectrumHtml = `<div style="font-size:9px;line-height:1.7;">${politicalSpectrum.slice(0, 200)}</div>`;
  }

  // Narrative gap — parse JSON to readable text, strip English/JSON artifacts
  let gapHtml = '';
  if (narrativeGap) {
    let gapText = typeof narrativeGap === 'string' ? narrativeGap : '';
    // Try to parse as JSON and extract only Persian text values
    try {
      const parsed = JSON.parse(gapText);
      if (typeof parsed === 'object' && parsed !== null) {
        const parts = [];
        const extractText = (obj) => {
          if (typeof obj === 'string') { parts.push(obj); return; }
          if (Array.isArray(obj)) { obj.forEach(extractText); return; }
          if (typeof obj === 'object' && obj !== null) {
            Object.values(obj).forEach(extractText);
          }
        };
        extractText(parsed);
        gapText = parts.filter(t => /[\u0600-\u06FF]/.test(t)).join(' · ');
      }
    } catch { /* already a string */ }
    // Strip any remaining JSON/English artifacts
    gapText = gapText
      .replace(/[{}[\]"]/g, '')
      .replace(/\b[a-zA-Z_]+\b\s*:/g, '') // strip English keys like "object:"
      .replace(/\b(object|null|undefined|true|false|Object)\b/gi, '')
      .replace(/,\s*/g, '، ')
      .replace(/\s{2,}/g, ' ')
      .trim();
    if (gapText) {
      gapHtml = `<div style="font-size:9px;line-height:1.7;">${gapText.slice(0, 400)}</div>`;
    }
  }

  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <style>${styles}</style>
</head>
<body>
<div class="rpt">
  <div class="hdr">
    <h1>گزارش جامع تحلیل فضای مجازی</h1>
    <div class="sub">پروفایل: <strong>${profileName}</strong> | بازه: ${periodLabel}</div>
    <div class="meta">تاریخ تولید: ${today()} | سامانه رصد فضای مجازی پیشرون</div>
  </div>

  <div class="stats">
    <div class="st"><div class="v">${fmtNum(stats?.totalPosts)}</div><div class="l">پست</div></div>
    <div class="st"><div class="v">${fmtNum(stats?.totalViews)}</div><div class="l">بازدید</div></div>
    <div class="st"><div class="v">${fmtNum(stats?.totalLikes)}</div><div class="l">لایک</div></div>
    <div class="st"><div class="v">${fmtNum(stats?.totalRetweets)}</div><div class="l">بازنشر</div></div>
    ${period === 'daily' ? `<div class="st"><div class="v">${healthScore !== null ? healthScore + '%' : '—'}</div><div class="l">سلامت اعتبار</div></div>` : ''}
    ${period === 'daily' ? `<div class="st"><div class="v">${crisis.score ?? '—'}</div><div class="l">بحران (${crisisLevel})</div></div>` : ''}
  </div>

  <div class="cols">
    <div class="col">

      ${period === 'daily' && aiSummary ? `<div class="sec"><div class="sec-t">خلاصه هوش مصنوعی</div><div style="font-size:9px;line-height:1.8;">${typeof aiSummary === 'string' ? aiSummary.replace(/^[:\s]+/, '').replace(/^summary[:\s]*/i, '').replace(/[{}"]/g, '').replace(/,\s*/g, '، ').replace(/summary[:\s]*/gi, '').replace(/^[:\s،]+/, '').trim() : ''}</div></div>` : ''}

      <div class="sec">
        <div class="sec-t">توزیع احساسات</div>
        <div class="bar"><div style="flex:${posPct};background:#51CF66;"></div><div style="flex:${neuPct};background:#DFE3E8;"></div><div style="flex:${negPct};background:#FF6B6B;"></div></div>
        <div style="display:flex;justify-content:space-between;margin-top:3px;font-size:8px;">
          <span style="color:#51CF66;font-weight:700;">مثبت ${posPct}%</span>
          <span style="color:#868E96;">خنثی ${neuPct}%</span>
          <span style="color:#FF6B6B;font-weight:700;">منفی ${negPct}%</span>
        </div>
      </div>

      ${period === 'daily' && (crisis.dimensions || []).length > 0 ? `<div class="sec"><div class="sec-t">رادار بحران</div><div class="crisis-dims">${(crisis.dimensions || []).map(d => `<div class="dim"><div class="dn">${d.label}</div><div class="dv" style="color:${d.value >= 70 ? '#C92A2A' : d.value >= 50 ? '#E67700' : '#2B8A3E'};">${d.value}</div></div>`).join('')}</div></div>` : ''}

      ${srcHtml ? `<div class="sec"><div class="sec-t">خلاصه پلتفرم‌ها</div>${srcHtml}</div>` : ''}

      ${kwHtml ? `<div class="sec"><div class="sec-t">ابر واژگان هوشمند</div><div class="kw-cloud">${kwHtml}</div></div>` : ''}

      ${supporters.length > 0 ? `<div class="sec"><div class="sec-t">موافقان برتر</div><table class="tbl"><tr><th style="width:20px;">#</th><th>حساب</th><th>پلتفرم</th><th>بازدید</th></tr>${supporters.map(infRow).join('')}</table></div>` : ''}

      ${critics.length > 0 ? `<div class="sec"><div class="sec-t">مخالفان برتر</div><table class="tbl"><tr><th style="width:20px;">#</th><th>حساب</th><th>پلتفرم</th><th>بازدید</th></tr>${critics.map(infRow).join('')}</table></div>` : ''}

      ${ud.total > 0 ? `<div class="sec"><div class="sec-t">تفکیک کاربران</div><div style="display:flex;gap:8px;"><div class="st" style="flex:1;"><div class="v">${ud.influencerPercent || 0}%</div><div class="l">تأثیرگذار</div></div><div class="st" style="flex:1;"><div class="v">${ud.regularPercent || 0}%</div><div class="l">عادی</div></div><div class="st" style="flex:1;"><div class="v">${ud.suspiciousPercent || 0}%</div><div class="l">مشکوک</div></div></div></div>` : ''}

      ${promiseHtml ? `<div class="sec"><div class="sec-t">رصد وعده‌ها</div>${promiseHtml}</div>` : ''}

      ${period === 'daily' && gapHtml ? `<div class="sec"><div class="sec-t">تحلیل شکاف روایت</div>${gapHtml}</div>` : ''}

      ${period === 'daily' && recsHtml ? `<div class="sec"><div class="sec-t">پیشنهادات واکنش هوشمند</div>${recsHtml}</div>` : ''}

    </div>

    <div class="col">

      ${macroHtml ? `<div class="sec"><div class="sec-t">وضعیت کلان</div>${macroHtml}</div>` : ''}

      ${(topPosts || []).length > 0 ? `<div class="sec"><div class="sec-t">پربازدیدترین پست‌ها</div>${(topPosts || []).slice(0, 5).map(postCard).join('')}</div>` : ''}

      ${(topCommented || []).length > 0 ? `<div class="sec"><div class="sec-t">پربحث‌ترین پست‌ها</div>${(topCommented || []).slice(0, 4).map(postCard).join('')}</div>` : ''}

      ${(topForwarded || []).length > 0 ? `<div class="sec"><div class="sec-t">پرتکرارترین پست‌ها</div>${(topForwarded || []).slice(0, 4).map(postCard).join('')}</div>` : ''}

      ${period === 'daily' && spectrumHtml ? `<div class="sec"><div class="sec-t">طیف سیاسی</div>${spectrumHtml}</div>` : ''}

    </div>
  </div>

  <div class="ftr">این گزارش به صورت خودکار توسط سامانه رصد فضای مجازی پیشرون تولید شده است.</div>
</div>
</body>
</html>`;
}