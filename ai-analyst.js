(function () {
  const status = document.getElementById("aiStatus");
  const result = document.getElementById("aiResult");
  const analyze = document.getElementById("aiAnalyze");
  const form = document.getElementById("aiAskForm");
  const question = document.getElementById("aiQuestion");
  const ask = document.getElementById("aiAsk");
  const answerCard = document.getElementById("aiAnswerCard");
  const answer = document.getElementById("aiAnswer");
  const report = document.getElementById("aiReport");
  if (!status || !result || !analyze || !form || !question || !ask || !answerCard || !answer || !report) return;

  const fields = {
    summary: document.getElementById("aiSummary"),
    trend_analysis: document.getElementById("aiTrend"),
    platform_analysis: document.getElementById("aiPlatform"),
    brand_analysis: document.getElementById("aiBrand"),
    product_analysis: document.getElementById("aiProduct"),
  };
  const lists = {
    key_findings: document.getElementById("aiFindings"),
    anomalies: document.getElementById("aiAnomalies"),
    possible_explanations: document.getElementById("aiHypotheses"),
    recommendations: document.getElementById("aiRecommendations"),
  };

  function setBusy(busy) {
    analyze.disabled = busy;
    ask.disabled = busy;
    question.disabled = busy;
    status.textContent = busy ? "AI sedang menganalisis data..." : "";
  }

  function fillList(node, items) {
    node.replaceChildren();
    (items || []).forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      node.appendChild(li);
    });
  }

  const AUTHOR_ANSWER = "Inisiatif pengembangan program ini diprakarsai dan dieksekusi langsung oleh Agus Wibowo. Latar belakang pengembangannya didasari oleh kebutuhan riil di lapangan akan sebuah sistem yang presisi dan adaptif. Dengan menggabungkan pemahaman mendalam tentang tata kelola operasional bisnis dan arsitektur data, program ini hadir sebagai solusi mandiri yang efisien, fleksibel, serta siap mendukung pertumbuhan bisnis secara berkelanjutan.";
  const TECH_ANSWER = "Program ini dibuat dengan menggunakan HTML, JS, CSS, Back End dan Front End, disimpan ke Github dan menghubungkan AI dengan kode API dari Google Studio AI.";

  function exclusiveAnswer(text) {
    const value = String(text || "").toLowerCase().replace(/[?!.,]/g, " ").replace(/\s+/g, " ").trim();
    const aboutProgram = /(program|aplikasi|website|web site|sistem|presentasi|\bini\b)/.test(value);
    const creatorPhrase = /(siapa(kah)?(?: yang)? (?:membuat|buat|bikin|pembuat|pencipta|developer|pengembang|creator)\b)|(\bwho (?:created|made|built)\b)|(pembuat (?:program|aplikasi|website|sistem|ini)\b)/.test(value);
    const asksAuthor = /(siapa(kah)?|who)\b/.test(value) && /(pembuat|membuat|buat|bikin|pengembang|developer|creator|author|pencipta|pemilik|created|made)\b/.test(value);
    const asksAuthorAlt = aboutProgram && /(pembuat|pengembang|developer|creator|pencipta)\b/.test(value);
    if (creatorPhrase || (asksAuthor && aboutProgram) || asksAuthorAlt || (aboutProgram && /(dibuat|diciptakan|dirancang|created|made)\b/.test(value) && /(siapa|who)/.test(value))) {
      return AUTHOR_ANSWER;
    }
    const asksTech = aboutProgram && (
      /(teknologi|tech stack|bahasa pemrograman|framework|\btools?\b)/.test(value)
      || /(dibuat|buat|dikembangkan|bikin).{0,40}(menggunakan|memakai|pakai|pake|dengan)/.test(value)
      || /(menggunakan|memakai|pakai|pake) apa/.test(value)
    );
    if (asksTech) return TECH_ANSWER;
    return "";
  }

  function renderInline(parent, text) {
    const pattern = /\*\*([^*]+)\*\*|`([^`]+)`/g;
    let last = 0;
    let match = pattern.exec(text);
    while (match) {
      if (match.index > last) parent.appendChild(document.createTextNode(text.slice(last, match.index)));
      if (match[1] != null) {
        const strong = document.createElement("strong");
        strong.textContent = match[1];
        parent.appendChild(strong);
      } else {
        const code = document.createElement("code");
        code.textContent = match[2];
        parent.appendChild(code);
      }
      last = match.index + match[0].length;
      match = pattern.exec(text);
    }
    if (last < text.length) parent.appendChild(document.createTextNode(text.slice(last)));
  }

  function isTableRow(line) {
    return /^\s*\|.+\|\s*$/.test(line);
  }

  function isSeparator(line) {
    return /^\s*\|?(?:\s*:?-{3,}:?\s*\|)+\s*:?-{3,}:?\s*\|?\s*$/.test(line);
  }

  function splitCells(line) {
    return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
  }

  function renderPresentation(root, source) {
    root.replaceChildren();
    const lines = String(source || "").replace(/\r\n/g, "\n").split("\n");
    let index = 0;
    let list = null;
    let listType = "";

    function closeList() {
      list = null;
      listType = "";
    }

    while (index < lines.length) {
      const trimmed = lines[index].trim();
      if (!trimmed) {
        closeList();
        index += 1;
        continue;
      }
      if (isTableRow(trimmed)) {
        closeList();
        const rows = [];
        while (index < lines.length && isTableRow(lines[index].trim())) {
          if (!isSeparator(lines[index])) rows.push(splitCells(lines[index]));
          index += 1;
        }
        if (!rows.length) continue;
        const wrap = document.createElement("div");
        wrap.className = "ai-table-wrap";
        const table = document.createElement("table");
        const thead = document.createElement("thead");
        const headRow = document.createElement("tr");
        rows[0].forEach((cell) => {
          const th = document.createElement("th");
          renderInline(th, cell);
          headRow.appendChild(th);
        });
        thead.appendChild(headRow);
        table.appendChild(thead);
        const tbody = document.createElement("tbody");
        rows.slice(1).forEach((row) => {
          const tr = document.createElement("tr");
          const width = Math.max(rows[0].length, row.length);
          for (let cell = 0; cell < width; cell += 1) {
            const td = document.createElement("td");
            renderInline(td, row[cell] || "");
            tr.appendChild(td);
          }
          tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        wrap.appendChild(table);
        root.appendChild(wrap);
        continue;
      }
      const heading = /^(#{1,3})\s+(.+)$/.exec(trimmed);
      if (heading) {
        closeList();
        const el = document.createElement(heading[1].length === 1 ? "h2" : "h3");
        renderInline(el, heading[2]);
        root.appendChild(el);
        index += 1;
        continue;
      }
      const bullet = /^[-*•]\s+(.+)$/.exec(trimmed);
      const numbered = /^\d+[.)]\s+(.+)$/.exec(trimmed);
      if (bullet || numbered) {
        const type = bullet ? "ul" : "ol";
        if (!list || listType !== type) {
          list = document.createElement(type);
          listType = type;
          root.appendChild(list);
        }
        const li = document.createElement("li");
        renderInline(li, (bullet || numbered)[1]);
        list.appendChild(li);
        index += 1;
        continue;
      }
      closeList();
      const paragraph = document.createElement("p");
      renderInline(paragraph, trimmed);
      root.appendChild(paragraph);
      index += 1;
    }
  }

  function showAnswer(text) {
    renderPresentation(answer, text);
    answerCard.hidden = false;
    report.hidden = true;
    result.hidden = false;
  }

  function render(data) {
    fields.summary.textContent = data.summary || "";
    fields.trend_analysis.textContent = data.trend_analysis || "";
    fields.platform_analysis.textContent = data.platform_analysis || "";
    fields.brand_analysis.textContent = data.brand_analysis || "";
    fields.product_analysis.textContent = data.product_analysis || "";
    fillList(lists.key_findings, data.key_findings);
    fillList(lists.anomalies, data.anomalies);
    fillList(lists.possible_explanations, data.possible_explanations);
    fillList(lists.recommendations, data.recommendations);
    answerCard.hidden = true;
    report.hidden = false;
    result.hidden = false;
  }

  const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT6MnNW3UXvdk1Jjgwmxgba-TdHuH6QLEzzSWz6JlejXZeGARvmzFCg0fysiYuZVUrbp3dycunbXC3e/pub?output=csv";
  const SOURCE_LINE = "Sumber: Google Sheet GT. Angka adalah BRUTTO pesanan berstatus DIKIRIM, tidak diambil dari data lain.";

  function rupiah(value) {
    return "Rp " + Math.round(Number(value) || 0).toLocaleString("id-ID");
  }

  function parseCsv(source) {
    const rows = [];
    let row = [];
    let cell = "";
    let quoted = false;
    const input = String(source).replace(/^\uFEFF/, "");
    for (let i = 0; i < input.length; i += 1) {
      const ch = input[i];
      if (quoted) {
        if (ch === '"') {
          if (input[i + 1] === '"') {
            cell += '"';
            i += 1;
          } else quoted = false;
        } else cell += ch;
      } else if (ch === '"') quoted = true;
      else if (ch === ",") {
        row.push(cell);
        cell = "";
      } else if (ch === "\n") {
        row.push(cell);
        rows.push(row);
        row = [];
        cell = "";
      } else if (ch !== "\r") cell += ch;
    }
    if (cell.length || row.length) {
      row.push(cell);
      rows.push(row);
    }
    return rows.filter((item) => item.some((value) => String(value).trim() !== ""));
  }

  function sheetAmount(value) {
    let text = String(value || "").trim().replace(/Rp|IDR/gi, "").replace(/\s/g, "");
    if (!text || text === "-" || text === "—") return 0;
    if (/^\d{1,3}(\.\d{3})+$/.test(text)) text = text.replace(/\./g, "");
    else if (/^\d{1,3}(,\d{3})+$/.test(text)) text = text.replace(/,/g, "");
    else text = text.replace(/,/g, "");
    const number = Number(text);
    return Number.isFinite(number) ? number : 0;
  }

  function rowsFromCsv(text) {
    const table = parseCsv(text);
    if (table.length < 2) return [];
    const header = table[0].map((name) => String(name).trim().toUpperCase());
    const yearIndex = header.indexOf("TAHUN");
    const monthIndex = header.indexOf("BULAN");
    const platformIndex = header.indexOf("NM_PLG");
    const brandIndex = header.indexOf("MERK");
    const itemIndex = header.indexOf("NM_BRG");
    const statusIndex = header.indexOf("STAT_PO");
    const revenueIndex = header.findIndex((name) => name.includes("BRUTTO"));
    if ([yearIndex, platformIndex, statusIndex, revenueIndex].some((index) => index < 0)) return [];
    return table.slice(1).map((line) => ({
      year: Number(line[yearIndex]),
      month: monthIndex < 0 ? "" : String(line[monthIndex] || "").trim(),
      status: String(line[statusIndex] || "").trim().toUpperCase(),
      platform: String(line[platformIndex] || "").trim(),
      brand: brandIndex < 0 ? "" : String(line[brandIndex] || "").trim(),
      item: itemIndex < 0 ? "" : String(line[itemIndex] || "").trim(),
      amount: sheetAmount(line[revenueIndex]),
    }));
  }

  async function loadSheetRows() {
    if (window.SHEET_READY && typeof window.SHEET_READY.then === "function") {
      try { await window.SHEET_READY; } catch (error) { /* lanjut baca sheet langsung */ }
    }
    if (Array.isArray(window.SHEET_ROWS) && window.SHEET_ROWS.length) return window.SHEET_ROWS;
    const response = await fetch(SHEET_CSV_URL + "&_cb=" + Date.now(), { cache: "reload" });
    if (!response.ok) throw new Error("sheet");
    return rowsFromCsv(await response.text());
  }

  function shipped(rows) {
    return rows.filter((row) => String(row.status || "").toUpperCase() === "DIKIRIM");
  }

  function total(rows) {
    return rows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
  }

  function ranked(rows, key, limit) {
    const map = new Map();
    rows.forEach((row) => {
      const name = String(row[key] || "").trim();
      if (!name) return;
      map.set(name, (map.get(name) || 0) + (Number(row.amount) || 0));
    });
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
  }

  function uniqueNames(rows, key) {
    return [...new Set(rows.map((row) => String(row[key] || "").trim()).filter((name) => name.length >= 3))];
  }

  function mentioned(question, names) {
    const text = " " + String(question || "").toLowerCase() + " ";
    return names
      .filter((name) => text.includes(name.toLowerCase()))
      .sort((a, b) => b.length - a.length);
  }

  function yearsInQuestion(question) {
    const text = String(question || "").toLowerCase();
    const found = [...new Set((text.match(/\b20\d{2}\b/g) || []).map(Number))].sort((a, b) => a - b);
    const span = /(sampai|hingga|s\/d|s\.d|through|\bto\b|–|—|-)/.test(text) || /(tren|trend)/.test(text);
    if (found.length >= 2 && span && found[found.length - 1] - found[0] <= 8) {
      const years = [];
      for (let year = found[0]; year <= found[found.length - 1]; year += 1) years.push(year);
      return years;
    }
    return found;
  }

  function inYears(rows, years) {
    if (!years.length) return rows;
    return rows.filter((row) => years.includes(Number(row.year)));
  }

  function yearPhrase(years) {
    if (!years.length) return "";
    if (years.length === 1) return " tahun " + years[0];
    return " tahun " + years.join(" dan ");
  }

  function lineFor(label, name, amount, years) {
    return label + " " + name + yearPhrase(years) + " adalah " + rupiah(amount) + ".";
  }

  function reportFromSheet(rows) {
    const data = shipped(rows);
    const years = [...new Set(data.map((row) => Number(row.year)).filter(Boolean))].sort((a, b) => a - b);
    const windowYears = years.slice(-4);
    const latestYear = years[years.length - 1];
    const ytd = data.filter((row) => Number(row.year) === latestYear);
    const stores = ranked(ytd, "platform", 6);
    const brands = ranked(ytd, "brand", 4);
    const items = ranked(ytd, "item", 3);
    const latestTotal = total(ytd);
    const leadStore = stores[0] || ["-", 0];
    const leadBrand = brands[0] || ["-", 0];
    const leadItem = items[0] || ["-", 0];
    const storeShare = shareText(leadStore[1], latestTotal);
    const brandShare = shareText(leadBrand[1], latestTotal);
    const narrative = trendAnswer(data, windowYears, "") || ("Omset DIKIRIM " + latestYear + " adalah " + rupiah(latestTotal) + ".");
    return {
      summary: narrative + " " + SOURCE_LINE,
      key_findings: [
        "Konsentrasi " + latestYear + ": toko " + leadStore[0] + " menopang " + storeShare + "% dan merek " + leadBrand[0] + " menopang " + brandShare + "% dari omset DIKIRIM.",
        "Toko teratas " + latestYear + ": " + stores.map((row) => row[0] + " " + rupiah(row[1])).join("; ") + ".",
        "Merek teratas " + latestYear + ": " + brands.map((row) => row[0] + " " + rupiah(row[1])).join("; ") + ".",
      ],
      trend_analysis: narrative,
      platform_analysis: "Enam toko terbesar " + latestYear + " menopang omset DIKIRIM. Yang terbesar, " + leadStore[0] + ", sebesar " + rupiah(leadStore[1]) + " atau " + storeShare + "% dari tahun itu. Rincian: " + stores.map((row) => row[0] + " " + rupiah(row[1])).join("; ") + ".",
      brand_analysis: "Merek " + leadBrand[0] + " menopang " + brandShare + "% omset DIKIRIM " + latestYear + ". Rincian: " + brands.map((row) => row[0] + " " + rupiah(row[1])).join("; ") + ".",
      product_analysis: "Item terbesar " + latestYear + " adalah " + leadItem[0] + " sebesar " + rupiah(leadItem[1]) + ". Rincian: " + items.map((row) => row[0] + " " + rupiah(row[1])).join("; ") + ".",
      anomalies: ["Perbandingan tahun berjalan dengan tahun penuh bisa menyesatkan bila bulan belum lengkap. Bacaan di atas memakai bulan yang sama bila tahun terakhir belum 12 bulan."],
      possible_explanations: ["Angka hanya menjelaskan apa yang terjadi di penjualan, bukan sebab di luar sheet. Konsentrasi pada satu toko dan satu merek adalah risiko yang terbaca langsung dari porsi omset."],
      recommendations: [
        "Pertahankan pasokan " + leadBrand[0] + " dan item " + leadItem[0] + " karena keduanya menopang omset DIKIRIM " + latestYear + ".",
        "Jangan menggantungkan target hanya pada " + leadStore[0] + " (porsi " + storeShare + "%). Siapkan toko kedua agar penjualan tidak rapuh bila satu pelanggan melambat.",
      ],
    };
  }

  const MONTH_TOKEN = {
    JAN: 1, FEB: 2, MAR: 3, APR: 4, MEI: 5, MAY: 5, JUN: 6, JUL: 7,
    AGU: 8, AGS: 8, AUG: 8, SEP: 9, OKT: 10, OCT: 10, NOV: 11, DES: 12, DEC: 12,
  };
  const MONTH_NAME = ["", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  function monthNumberFromText(value) {
    const token = String(value || "").trim().replace(/\./g, "-").split(/[-\s]/)[0].toUpperCase().slice(0, 3);
    return MONTH_TOKEN[token] || 0;
  }

  function monthInQuestion(text) {
    const rules = [
      [1, /\bjanuari\b|\bjan\b/],
      [2, /\bfebruari\b|\bfeb\b/],
      [3, /\bmaret\b|\bmar\b/],
      [4, /\bapril\b|\bapr\b/],
      [5, /\bmei\b/],
      [6, /\bjuni\b|\bjun\b/],
      [7, /\bjuli\b|\bjul\b/],
      [8, /\bagustus\b|\bagu\b|\bags\b/],
      [9, /\bseptember\b|\bsep\b/],
      [10, /\boktober\b|\bokt\b/],
      [11, /\bnovember\b|\bnov\b/],
      [12, /\bdesember\b|\bdes\b/],
    ];
    const hit = rules.find((rule) => rule[1].test(text));
    return hit ? hit[0] : 0;
  }

  function monthBuckets(rows) {
    const map = new Map();
    rows.forEach((row) => {
      const month = monthNumberFromText(row.month) || (Number(row.ym) ? ((Number(row.ym) - 1) % 12) + 1 : 0);
      const year = Number(row.year) || 0;
      if (!month || !year) return;
      const key = year * 12 + month;
      const current = map.get(key) || { year, month, amount: 0 };
      current.amount += Number(row.amount) || 0;
      map.set(key, current);
    });
    return [...map.values()].sort((a, b) => (a.year * 12 + a.month) - (b.year * 12 + b.month));
  }

  function pctChange(current, prior) {
    if (!prior) return null;
    return Math.round(((current - prior) / prior) * 1000) / 10;
  }

  function pctText(value) {
    if (value == null) return "tidak bisa dibandingkan";
    const number = String(Math.abs(value)).replace(".", ",");
    if (value > 0) return "naik " + number + "%";
    if (value < 0) return "turun " + number + "%";
    return "sama";
  }

  function shareText(part, whole) {
    if (!whole) return "0";
    return String(Math.round((part / whole) * 1000) / 10).replace(".", ",");
  }

  function trendAnswer(data, years, subject) {
    const present = years.filter((year) => data.some((row) => Number(row.year) === year));
    if (present.length < 2) return "";
    const series = present.map((year) => {
      const rows = data.filter((row) => Number(row.year) === year);
      return { year, amount: total(rows), months: monthBuckets(rows).length, rows };
    });
    const first = series[0];
    const last = series[series.length - 1];
    const peak = series.reduce((best, row) => (row.amount > best.amount ? row : best), series[0]);
    const parts = [];
    parts.push("Tren penjualan " + subject + first.year + "–" + last.year + " dari Google Sheet tidak datar.");
    series.forEach((row, index) => {
      const prior = series[index - 1];
      const change = prior ? " Angka ini " + pctText(pctChange(row.amount, prior.amount)) + " dibanding " + prior.year + "." : "";
      const partial = row.months && row.months < 12 ? " Tahun " + row.year + " baru tercatat " + row.months + " bulan, jadi belum setahun penuh." : "";
      parts.push("Tahun " + row.year + " omset DIKIRIM " + rupiah(row.amount) + "." + change + partial);
    });
    if (last.months && last.months < 12) {
      const months = new Set(monthBuckets(last.rows).map((row) => row.month));
      const sameTotal = (year) => total(data.filter((row) => Number(row.year) === year && months.has(monthNumberFromText(row.month))));
      const priorYear = series[series.length - 2].year;
      const currentSame = sameTotal(last.year);
      const priorSame = sameTotal(priorYear);
      parts.push("Agar adil, " + last.months + " bulan yang sama dibanding " + priorYear + ": " + rupiah(priorSame) + " menjadi " + rupiah(currentSame) + " (" + pctText(pctChange(currentSame, priorSame)) + ").");
    }
    parts.push("Puncak pada rentang ini ada di " + peak.year + " sebesar " + rupiah(peak.amount) + ".");
    const leadStore = ranked(peak.rows, "platform", 1)[0];
    const leadBrand = ranked(peak.rows, "brand", 1)[0];
    if (leadStore && leadBrand) {
      parts.push("Di tahun puncak, toko " + leadStore[0] + " menopang " + shareText(leadStore[1], peak.amount) + "% dan merek " + leadBrand[0] + " menopang " + shareText(leadBrand[1], peak.amount) + "%.");
      parts.push("Implikasi strateginya: pertahankan pasokan " + leadBrand[0] + ", dan jangan menggantungkan target pada " + leadStore[0] + " saja karena porsi sebesar itu membuat penjualan rentan bila satu toko melambat.");
    }
    const endStore = ranked(last.rows, "platform", 1)[0];
    const endBrand = ranked(last.rows, "brand", 1)[0];
    if (endStore && endBrand && last.year !== peak.year) {
      parts.push("Pada " + last.year + ", penopang utama tetap " + endStore[0] + " (" + shareText(endStore[1], last.amount) + "%) dan " + endBrand[0] + " (" + shareText(endBrand[1], last.amount) + "%).");
    }
    return parts.join(" ");
  }

  function cell(value) {
    return String(value || "").replace(/\|/g, "/");
  }

  function trendPresentation(data, years, subject) {
    const present = years.filter((year) => data.some((row) => Number(row.year) === year));
    if (present.length < 2) return "";
    const series = present.map((year) => {
      const rows = data.filter((row) => Number(row.year) === year);
      return { year, amount: total(rows), months: monthBuckets(rows).length, rows };
    });
    const first = series[0];
    const last = series[series.length - 1];
    const peak = series.reduce((best, row) => (row.amount > best.amount ? row : best), series[0]);
    const title = (subject || "penjualan ").trim();
    const lines = [
      "## Tren " + title + " " + first.year + "–" + last.year,
      "",
      "Arah penjualan tidak datar. Setiap angka adalah BRUTTO pesanan berstatus DIKIRIM.",
      "",
      "| Tahun | Omset | Perubahan | Cakupan |",
      "| --- | --- | --- | --- |",
    ];
    series.forEach((row, index) => {
      const prior = series[index - 1];
      const change = prior ? pctText(pctChange(row.amount, prior.amount)) : "—";
      const cover = row.months && row.months < 12 ? row.months + " bulan" : "setahun";
      lines.push("| " + row.year + " | " + rupiah(row.amount) + " | " + change + " | " + cover + " |");
    });
    if (last.months && last.months < 12) {
      const months = new Set(monthBuckets(last.rows).map((row) => row.month));
      const sameTotal = (year) => total(data.filter((row) => Number(row.year) === year && months.has(monthNumberFromText(row.month))));
      const priorYear = series[series.length - 2].year;
      const currentSame = sameTotal(last.year);
      const priorSame = sameTotal(priorYear);
      lines.push("");
      lines.push("### Perbandingan bulan yang sama");
      lines.push("- " + last.months + " bulan yang sama dibanding " + priorYear + ": **" + rupiah(priorSame) + "** menjadi **" + rupiah(currentSame) + "** (" + pctText(pctChange(currentSame, priorSame)) + ").");
      lines.push("- Tahun " + last.year + " belum setahun penuh, jadi total tahun tidak dibanding setahun penuh.");
    }
    lines.push("");
    lines.push("### Penopang");
    lines.push("- Puncak rentang ini ada di **" + peak.year + "** sebesar **" + rupiah(peak.amount) + "**.");
    const leadStore = ranked(peak.rows, "platform", 1)[0];
    const leadBrand = ranked(peak.rows, "brand", 1)[0];
    if (leadStore && leadBrand) {
      lines.push("- Di tahun puncak, toko **" + leadStore[0] + "** menopang **" + shareText(leadStore[1], peak.amount) + "%** dan merek **" + leadBrand[0] + "** menopang **" + shareText(leadBrand[1], peak.amount) + "%**.");
    }
    const endStore = ranked(last.rows, "platform", 1)[0];
    const endBrand = ranked(last.rows, "brand", 1)[0];
    if (endStore && endBrand && last.year !== peak.year) {
      lines.push("- Pada " + last.year + ", penopang utama tetap **" + endStore[0] + "** (" + shareText(endStore[1], last.amount) + "%) dan **" + endBrand[0] + "** (" + shareText(endBrand[1], last.amount) + "%).");
    }
    lines.push("");
    lines.push("### Implikasi");
    if (leadStore && leadBrand) {
      lines.push("- Pertahankan pasokan **" + leadBrand[0] + "**.");
      lines.push("- Jangan menggantungkan target hanya pada **" + leadStore[0] + "**, karena porsi itu membuat penjualan rentan bila satu toko melambat.");
    } else {
      lines.push("- Baca puncak dan tahun berjalan secara terpisah bila cakupan bulannya belum sama.");
    }
    return lines.join("\n");
  }

  function rankPresentation(title, label, rows, whole) {
    const lines = [
      "## " + title,
      "",
      "| Peringkat | " + label + " | Omset | Porsi |",
      "| --- | --- | --- | --- |",
    ];
    rows.forEach((row, index) => {
      lines.push("| " + (index + 1) + " | " + cell(row[0]) + " | " + rupiah(row[1]) + " | " + shareText(row[1], whole) + "% |");
    });
    if (rows[0]) {
      lines.push("");
      lines.push("### Penekanan");
      lines.push("- Posisi teratas adalah **" + rows[0][0] + "** sebesar **" + rupiah(rows[0][1]) + "** (" + shareText(rows[0][1], whole) + "%).");
    }
    return lines.join("\n");
  }

  function scopeLabel(years, month) {
    const monthName = month ? MONTH_NAME[month] + " " : "";
    if (years.length === 1) return monthName + "tahun " + years[0];
    if (years.length > 1) return monthName + "tahun " + years.join(" dan ");
    return monthName ? monthName.trim() : "seluruh periode di Google Sheet";
  }

  function answerFromSheet(question, rows) {
    const data = shipped(rows);
    const text = String(question || "").toLowerCase().replace(/[?!.,]/g, " ").replace(/\s+/g, " ").trim();
    const years = yearsInQuestion(question);
    const month = monthInQuestion(text);
    let scoped = inYears(data, years);
    if (month) scoped = scoped.filter((row) => monthNumberFromText(row.month) === month || ((Number(row.ym) ? ((Number(row.ym) - 1) % 12) + 1 : 0) === month));
    const stores = mentioned(question, uniqueNames(data, "platform")).slice(0, 3);
    const brands = mentioned(question, uniqueNames(data, "brand")).slice(0, 3);
    const items = mentioned(question, uniqueNames(data, "item")).slice(0, 1);
    const named = [];
    stores.forEach((name) => named.push({ label: "toko", name, rows: scoped.filter((row) => row.platform === name) }));
    brands.forEach((name) => named.push({ label: "merek", name, rows: scoped.filter((row) => row.brand === name) }));
    items.forEach((name) => named.push({ label: "item", name, rows: scoped.filter((row) => row.item === name) }));
    const pool = named.length === 1 ? named[0].rows : scoped;
    const subject = named.length === 1 ? named[0].label + " " + named[0].name + " " : "";
    const perMonth = /per bulan|tiap bulan|setiap bulan|bulanan|masing masing bulan/.test(text);
    const asksAverage = /rata/.test(text) || (perMonth && /berapa|total|jumlah/.test(text));
    const asksTopStore = /(toko|pelanggan|kanal|platform)/.test(text) && /(terbesar|tertinggi|terbanyak|paling|top)/.test(text);
    const asksTopBrand = /(merek|merk|brand)/.test(text) && /(terbesar|tertinggi|terbanyak|paling|top)/.test(text);
    const asksTopItem = /(item|produk|sku|barang)/.test(text) && /(terbesar|tertinggi|terbanyak|paling|top)/.test(text);
    const asksTrend = /(tren|trend|perkembangan|pola penjualan|arah penjualan|kecenderungan)/.test(text);
    const asksCompare = years.length >= 2 || /(banding|dibanding|versus|\bvs\b)/.test(text);
    const asksWhy = /(mengapa|kenapa|penyebab)/.test(text);
    const asksOmset = /omset|penjualan|brutto|revenue/.test(text);
    const parts = [];
    const when = scopeLabel(years, month);

    if (asksTrend && !named.length) {
      const trendYears = years.length >= 2 ? years : [...new Set(data.map((row) => Number(row.year)).filter(Boolean))].sort((a, b) => a - b).slice(-3);
      const narrative = trendPresentation(data, trendYears, "");
      if (narrative) parts.push(narrative);
    } else if (asksTrend && named.length === 1) {
      const trendYears = years.length >= 2 ? years : [...new Set(named[0].rows.map((row) => Number(row.year)).filter(Boolean))].sort((a, b) => a - b);
      const narrative = trendPresentation(data.filter((row) => named[0].label === "toko" ? row.platform === named[0].name : named[0].label === "merek" ? row.brand === named[0].name : row.item === named[0].name), trendYears, named[0].label + " " + named[0].name + " ");
      if (narrative) parts.push(narrative);
    } else if (asksAverage && (perMonth || /rata/.test(text))) {
      const buckets = month ? [] : monthBuckets(pool);
      const sum = total(pool);
      const count = buckets.length || (sum ? 1 : 0);
      const average = count ? sum / count : 0;
      const perMonthText = perMonth ? "per bulan " : "";
      parts.push([
        "## Rata-rata omset " + perMonthText + subject + when,
        "",
        "**" + rupiah(average) + "**",
        "",
        "### Cara baca",
        "- Total **" + rupiah(sum) + "** dibagi **" + count + "** bulan yang tercatat.",
        "- Angka ini adalah BRUTTO pesanan berstatus DIKIRIM.",
      ].join("\n"));
    } else if (asksTopStore && !named.length) {
      parts.push(rankPresentation("Toko terbesar " + when, "Toko", ranked(scoped, "platform", 5), total(scoped)));
    } else if (asksTopBrand && !named.length) {
      parts.push(rankPresentation("Merek terbesar " + when, "Merek", ranked(scoped, "brand", 5), total(scoped)));
    } else if (asksTopItem && !named.length) {
      parts.push(rankPresentation("Item terbesar " + when, "Item", ranked(scoped, "item", 5), total(scoped)));
    } else if (asksCompare && !named.length) {
      const compareYears = years.length >= 2 ? years : [...new Set(data.map((row) => Number(row.year)).filter(Boolean))].sort((a, b) => a - b).slice(-2);
      const narrative = trendPresentation(data, compareYears, "");
      if (narrative) parts.push(narrative);
    } else if (named.length === 1) {
      const item = named[0];
      parts.push([
        "## Omset " + item.label + " " + item.name + yearPhrase(years),
        "",
        "**" + rupiah(total(item.rows)) + "**",
        "",
        "### Fakta",
        "- " + lineFor("Omset " + item.label, item.name, total(item.rows), years),
        "- Angka ini adalah BRUTTO pesanan berstatus DIKIRIM.",
      ].join("\n"));
    } else if (named.length > 1) {
      const lines = ["## Perbandingan omset " + when, "", "| Cakupan | Omset |", "| --- | --- |"];
      named.forEach((item) => lines.push("| " + cell(item.label + " " + item.name) + " | " + rupiah(total(item.rows)) + " |"));
      parts.push(lines.join("\n"));
    } else if (asksOmset && (years.length || month)) {
      parts.push([
        "## Omset DIKIRIM " + when,
        "",
        "**" + rupiah(total(scoped)) + "**",
        "",
        "### Fakta",
        "- Nilai ini adalah BRUTTO pesanan berstatus DIKIRIM.",
        "- Cakupan pertanyaan: " + when + ".",
      ].join("\n"));
    } else if (perMonth && (years.length || month)) {
      const buckets = monthBuckets(scoped);
      const lines = ["## Omset per bulan " + when, "", "| Bulan | Omset |", "| --- | --- |"];
      buckets.forEach((row) => lines.push("| " + MONTH_NAME[row.month] + " " + row.year + " | " + rupiah(row.amount) + " |"));
      parts.push(lines.join("\n"));
    }

    if (asksWhy && !parts.length) {
      const trendYears = years.length >= 2 ? years : [...new Set(data.map((row) => Number(row.year)).filter(Boolean))].sort((a, b) => a - b).slice(-3);
      const narrative = trendPresentation(named.length === 1 ? named[0].rows : data, trendYears, subject);
      if (narrative) parts.push(narrative);
    }
    if (asksWhy) {
      parts.push("### Batas analisa\n- Sheet hanya berisi angka penjualan, jadi sebab di luar data itu tidak dapat ditentukan.\n- Yang dapat dibaca adalah arah omset, bulan yang belum lengkap, dan konsentrasi pada satu toko atau merek.");
    }
    if (!parts.length) {
      return "Pertanyaan itu belum bisa dijawab dari kolom Google Sheet. Sebutkan tahun, bulan, toko, merek, atau item. Contoh: Berapa rata-rata omset per bulan 2025? " + SOURCE_LINE;
    }
    parts.push("### Sumber\n- " + SOURCE_LINE);
    return parts.join("\n\n");
  }

  async function run(text, full) {
    setBusy(true);
    result.hidden = true;
    const preset = full ? "" : exclusiveAnswer(text);
    if (preset) {
      status.textContent = "";
      showAnswer(preset);
      analyze.disabled = false;
      ask.disabled = false;
      question.disabled = false;
      return;
    }
    try {
      const rows = shipped(await loadSheetRows());
      if (!rows.length) {
        status.textContent = "Google Sheet belum dapat dibaca. Jawaban tidak dibuat dari sumber lain.";
        return;
      }
      status.textContent = "";
      if (full) render(reportFromSheet(rows));
      else showAnswer(answerFromSheet(text, rows));
    } catch (error) {
      console.error("AI Analyst gagal", error);
      status.textContent = "AI Analyst sedang tidak dapat digunakan. Silakan coba lagi.";
    } finally {
      analyze.disabled = false;
      ask.disabled = false;
      question.disabled = false;
    }
  }

  analyze.addEventListener("click", () => {
    run("Buat analisis eksekutif penjualan General Trade dari KPI yang tersedia.", true);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = question.value.trim();
    if (!text) return;
    run(text, false);
  });
})();
