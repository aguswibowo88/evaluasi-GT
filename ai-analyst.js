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

  function showAnswer(text) {
    answer.textContent = text;
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
    return [...new Set((String(question || "").match(/\b20\d{2}\b/g) || []).map(Number))];
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
    const years = [...new Set(data.map((row) => row.year).filter(Boolean))].sort((a, b) => a - b);
    const latestYear = years[years.length - 1];
    const priorYear = years.length > 1 ? years[years.length - 2] : null;
    const ytd = data.filter((row) => row.year === latestYear);
    const stores = ranked(ytd, "platform", 6);
    const brands = ranked(ytd, "brand", 4);
    const items = ranked(ytd, "item", 3);
    const yearly = years.slice(-4).map((year) => year + " " + rupiah(total(data.filter((row) => row.year === year))));
    const latestTotal = total(ytd);
    const priorTotal = priorYear ? total(data.filter((row) => row.year === priorYear)) : 0;
    const growth = priorTotal ? Math.round(((latestTotal - priorTotal) / priorTotal) * 1000) / 10 : null;
    const growthText = growth == null ? "" : " Perubahan dibanding " + priorYear + " " + (growth > 0 ? "naik " : growth < 0 ? "turun " : "sama ") + String(Math.abs(growth)).replace(".", ",") + "%.";
    const leadStore = stores[0] || ["-", 0];
    const leadBrand = brands[0] || ["-", 0];
    const leadItem = items[0] || ["-", 0];
    return {
      summary: "Pada " + latestYear + ", toko terbesar adalah " + leadStore[0] + " (" + rupiah(leadStore[1]) + "), merek terbesar " + leadBrand[0] + " (" + rupiah(leadBrand[1]) + "), dan item terbesar " + leadItem[0] + " (" + rupiah(leadItem[1]) + "). " + SOURCE_LINE,
      key_findings: [
        "Omset DIKIRIM " + latestYear + ": " + rupiah(latestTotal) + "." + growthText,
        "Toko teratas " + latestYear + ": " + stores.map((row) => row[0] + " " + rupiah(row[1])).join("; ") + ".",
        "Merek teratas " + latestYear + ": " + brands.map((row) => row[0] + " " + rupiah(row[1])).join("; ") + ".",
      ],
      trend_analysis: "Omset DIKIRIM per tahun dari Google Sheet: " + yearly.join("; ") + ".",
      platform_analysis: "Enam toko terbesar " + latestYear + ": " + stores.map((row) => row[0] + " " + rupiah(row[1])).join("; ") + ".",
      brand_analysis: "Merek terbesar " + latestYear + ": " + brands.map((row) => row[0] + " " + rupiah(row[1])).join("; ") + ".",
      product_analysis: "Item terbesar " + latestYear + ": " + items.map((row) => row[0] + " " + rupiah(row[1])).join("; ") + ".",
      anomalies: ["Tidak ditemukan anomali di luar angka yang tercatat pada Google Sheet."],
      possible_explanations: ["Sheet hanya berisi tahun, bulan, toko, merek, item, status, qty, dan brutto, sehingga penyebab di luar angka penjualan tidak dapat ditentukan."],
      recommendations: [
        "Jaga pasokan " + leadItem[0] + " karena item ini terbesar pada " + latestYear + ".",
        "Kurangi ketergantungan pada " + leadStore[0] + " bila porsi tokonya terlalu besar.",
      ],
    };
  }

  function answerFromSheet(question, rows) {
    const data = shipped(rows);
    const years = yearsInQuestion(question);
    const scoped = inYears(data, years);
    const stores = mentioned(question, uniqueNames(data, "platform"));
    const brands = mentioned(question, uniqueNames(data, "brand"));
    const items = mentioned(question, uniqueNames(data, "item")).slice(0, 3);
    const asksWhy = /(mengapa|kenapa|penyebab|why)/.test(String(question || "").toLowerCase());
    const parts = [];
    stores.slice(0, 3).forEach((name) => {
      parts.push(lineFor("Omset toko", name, total(scoped.filter((row) => row.platform === name)), years));
    });
    brands.slice(0, 3).forEach((name) => {
      parts.push(lineFor("Omset merek", name, total(scoped.filter((row) => row.brand === name)), years));
    });
    items.forEach((name) => {
      parts.push(lineFor("Omset item", name, total(scoped.filter((row) => row.item === name)), years));
    });
    if (!parts.length && years.length >= 2) {
      years.forEach((year) => {
        parts.push("Omset DIKIRIM tahun " + year + " adalah " + rupiah(total(data.filter((row) => row.year === year))) + ".");
      });
    }
    if (!parts.length) {
      const latestYear = Math.max(...data.map((row) => Number(row.year) || 0));
      const topStore = ranked(data.filter((row) => row.year === latestYear), "platform", 1)[0];
      const topBrand = ranked(data.filter((row) => row.year === latestYear), "brand", 1)[0];
      if (topStore) parts.push("Toko terbesar " + latestYear + " adalah " + topStore[0] + " sebesar " + rupiah(topStore[1]) + ".");
      if (topBrand) parts.push("Merek terbesar " + latestYear + " adalah " + topBrand[0] + " sebesar " + rupiah(topBrand[1]) + ".");
    }
    if (asksWhy) parts.push("Google Sheet hanya berisi angka penjualan, jadi penyebab di luar data itu tidak dapat ditentukan.");
    parts.push(SOURCE_LINE);
    return parts.join(" ");
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
