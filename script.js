class SalesInsightApp {
    constructor() {
        this.fileInput = document.getElementById('fileInput');
        this.sampleBtn = document.getElementById('sampleData');

        this.heroSales = document.getElementById('heroSales');
        this.heroTrend = document.getElementById('heroTrend');
        this.heroPoints = document.getElementById('heroPoints');

        this.totalSalesEl = document.getElementById('totalSales');
        this.avgOrderEl = document.getElementById('avgOrder');
        this.orderCountEl = document.getElementById('orderCount');
        this.avgPriceEl = document.getElementById('avgPrice');
        this.totalQtyEl = document.getElementById('totalQty');
        this.topRegionEl = document.getElementById('topRegion');
        this.topProductEl = document.getElementById('topProduct');
        this.topCategoryEl = document.getElementById('topCategory');
        this.dataStatusEl = document.getElementById('dataStatus');

        this.trendList = document.getElementById('trendList');
        this.trendLabel = document.getElementById('trendLabel');
        this.rankingTable = document.getElementById('rankingTable');
        this.rankingLabel = document.getElementById('rankingLabel');
        this.insightList = document.getElementById('insightList');

        this.previewHead = document.getElementById('previewHead');
        this.previewBody = document.getElementById('previewBody');
        this.previewLabel = document.getElementById('previewLabel');

        this.data = [];
        this.initEvents();
    }

    initEvents() {
        this.fileInput.addEventListener('change', (e) => {
            const file = e.target.files?.[0];
            if (file) this.readFile(file);
        });

        this.sampleBtn.addEventListener('click', () => {
            this.loadSampleData();
        });
    }

    readFile(file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
            const data = new Uint8Array(evt.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
            this.handleRows(rows);
        };
        reader.readAsArrayBuffer(file);
    }

    loadSampleData() {
        const sample = [
            { 日付: '2024-05-02', 商品名: 'プレミアムノートPC', カテゴリ: 'PC', 地域: '東京', 売上: 280000, 数量: 4 },
            { 日付: '2024-05-03', 商品名: 'ワイヤレスイヤホン', カテゴリ: '周辺機器', 地域: '大阪', 売上: 72000, 数量: 9 },
            { 日付: '2024-05-07', 商品名: 'プレミアムノートPC', カテゴリ: 'PC', 地域: '名古屋', 売上: 210000, 数量: 3 },
            { 日付: '2024-06-02', 商品名: 'ゲーミングマウス', カテゴリ: '周辺機器', 地域: '東京', 売上: 54000, 数量: 6 },
            { 日付: '2024-06-05', 商品名: '4Kモニター', カテゴリ: 'モニター', 地域: '福岡', 売上: 190000, 数量: 5 },
            { 日付: '2024-06-12', 商品名: 'ワイヤレスイヤホン', カテゴリ: '周辺機器', 地域: '札幌', 売上: 64000, 数量: 8 },
            { 日付: '2024-06-15', 商品名: '4Kモニター', カテゴリ: 'モニター', 地域: '東京', 売上: 210000, 数量: 6 },
            { 日付: '2024-07-01', 商品名: 'ノートPCスタンド', カテゴリ: 'アクセサリ', 地域: '大阪', 売上: 32000, 数量: 10 },
            { 日付: '2024-07-02', 商品名: 'プレミアムノートPC', カテゴリ: 'PC', 地域: '東京', 売上: 320000, 数量: 5 },
            { 日付: '2024-07-03', 商品名: 'ワイヤレスイヤホン', カテゴリ: '周辺機器', 地域: '東京', 売上: 76000, 数量: 10 },
        ];
        this.handleRows(sample);
    }

    handleRows(rawRows) {
        const rows = rawRows
            .map((row) => this.normalizeRow(row))
            .filter((row) => row.date && !Number.isNaN(row.amount));

        this.data = rows;
        this.updateUI();
    }

    normalizeRow(row) {
        const getValue = (keys) => {
            const entry = Object.entries(row).find(([key]) => keys.includes(key.trim().toLowerCase()));
            return entry ? entry[1] : undefined;
        };

        const date = getValue(['日付', 'date', '注文日', '購入日']);
        const product = getValue(['商品名', 'product', 'アイテム']);
        const category = getValue(['カテゴリ', 'カテゴリー', 'category']);
        const region = getValue(['地域', 'エリア', 'region']);
        const amountRaw = getValue(['売上', 'amount', 'sales', '金額', 'revenue']);
        const qtyRaw = getValue(['数量', 'qty', 'quantity', '個数']);

        const amount = Number(amountRaw) || 0;
        const quantity = Number(qtyRaw) || 1;
        const parsedDate = date ? new Date(date) : null;
        const monthKey = parsedDate && !isNaN(parsedDate) ? `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}` : '不明';

        return {
            date: parsedDate,
            monthKey,
            product: product || '不明',
            category: category || '未分類',
            region: region || '不明',
            amount,
            quantity,
        };
    }

    updateUI() {
        if (!this.data.length) return;

        const totalSales = this.data.reduce((sum, row) => sum + row.amount, 0);
        const totalQty = this.data.reduce((sum, row) => sum + row.quantity, 0);
        const orderCount = this.data.length;
        const avgOrder = totalSales / orderCount;
        const avgPrice = totalSales / totalQty;

        const byProduct = this.aggregateBy(this.data, 'product');
        const byCategory = this.aggregateBy(this.data, 'category');
        const byRegion = this.aggregateBy(this.data, 'region');
        const byMonth = this.aggregateBy(this.data, 'monthKey', 'key');

        const topProduct = byProduct[0];
        const topCategory = byCategory[0];
        const topRegion = byRegion[0];

        const monthTrend = byMonth.slice(0, 3);

        this.totalSalesEl.textContent = this.formatCurrency(totalSales);
        this.totalQtyEl.textContent = `${totalQty.toLocaleString()} 個`;
        this.orderCountEl.textContent = `取引件数: ${orderCount.toLocaleString()}`;
        this.avgOrderEl.textContent = this.formatCurrency(avgOrder);
        this.avgPriceEl.textContent = `平均単価: ${this.formatCurrency(avgPrice)}`;
        this.topProductEl.textContent = topProduct ? `${topProduct.label}` : '--';
        this.topCategoryEl.textContent = topCategory ? `${topCategory.label}` : '--';
        this.topRegionEl.textContent = topRegion ? `${topRegion.label}` : '--';
        this.dataStatusEl.textContent = `${orderCount}件を読込済み`;

        const monthlyAvg = this.calculateMonthlyAverage(byMonth);
        this.heroSales.textContent = this.formatCurrency(monthlyAvg || totalSales);
        this.heroTrend.textContent = monthTrend[0] ? `${monthTrend[0].label}が直近のピーク` : 'データを確認してください';
        this.heroPoints.innerHTML = this.buildHeroPoints(topProduct, topCategory, topRegion);

        this.renderTrend(monthTrend);
        this.renderRanking(byProduct, byCategory);
        this.renderInsights({ topProduct, topCategory, topRegion, byMonth, byRegion });
        this.renderPreview();
    }

    aggregateBy(data, key, sort = 'amount') {
        const map = new Map();
        data.forEach((row) => {
            const current = map.get(row[key]) || { amount: 0, quantity: 0 };
            map.set(row[key], {
                amount: current.amount + row.amount,
                quantity: current.quantity + row.quantity,
            });
        });

        const list = [...map.entries()].map(([label, value]) => ({ label, ...value }));
        if (sort === 'key') {
            return list.sort((a, b) => b.label.localeCompare(a.label));
        }
        return list.sort((a, b) => b.amount - a.amount);
    }

    calculateMonthlyAverage(byMonth) {
        if (!byMonth.length) return 0;
        const total = byMonth.reduce((sum, item) => sum + item.amount, 0);
        return total / byMonth.length;
    }

    formatCurrency(value) {
        if (!isFinite(value)) return '--';
        return `¥${Math.round(value).toLocaleString()}`;
    }

    buildHeroPoints(topProduct, topCategory, topRegion) {
        const points = [
            topProduct ? `🔥 好調: ${topProduct.label}（${this.formatCurrency(topProduct.amount)}）` : null,
            topCategory ? `🏷️ 伸びているカテゴリ: ${topCategory.label}` : null,
            topRegion ? `🗺️ 強い地域: ${topRegion.label}` : null,
        ].filter(Boolean);

        return points.map((p) => `<li>${p}</li>`).join('');
    }

    renderTrend(monthTrend) {
        this.trendList.innerHTML = '';
        if (!monthTrend.length) {
            this.trendList.innerHTML = '<li>データが不足しています</li>';
            return;
        }

        this.trendLabel.textContent = `${monthTrend.length}ヶ月分`;
        monthTrend.forEach((item) => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${item.label}</strong><br><small>${this.formatCurrency(item.amount)} / ${item.quantity.toLocaleString()}個</small>`;
            this.trendList.appendChild(li);
        });
    }

    renderRanking(byProduct, byCategory) {
        const rows = [...byProduct.slice(0, 5), ...byCategory.slice(0, 3)];
        this.rankingTable.innerHTML = '';
        if (!rows.length) {
            this.rankingTable.innerHTML = '<tr><td colspan="3">データが不足しています</td></tr>';
            this.rankingLabel.textContent = '0件表示';
            return;
        }

        rows.forEach((row) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.label}</td>
                <td>${this.formatCurrency(row.amount)}</td>
                <td>${row.quantity.toLocaleString()}個</td>
            `;
            this.rankingTable.appendChild(tr);
        });
        this.rankingLabel.textContent = `${rows.length}件表示`;
    }

    renderInsights({ topProduct, topCategory, topRegion, byMonth, byRegion }) {
        const insights = [];

        if (topProduct) {
            insights.push({
                title: `${topProduct.label}を軸に粗利最大化`,
                detail: '広告/販促枠を重点配分し、在庫と供給計画を優先確保。関連商品をバンドルして客単価を上げましょう。',
            });
        }

        if (byRegion.length > 1) {
            const weakest = byRegion[byRegion.length - 1];
            insights.push({
                title: `${weakest.label}は伸びしろ大`,
                detail: '配送リードタイムや販促経路を見直し、地域限定キャンペーンで需要喚起を検証。',
            });
        }

        if (byMonth.length >= 2) {
            const diff = byMonth[0].amount - byMonth[1].amount;
            const direction = diff >= 0 ? '増加' : '減少';
            insights.push({
                title: `直近月は${direction}傾向`,
                detail: `前月比で${this.formatCurrency(Math.abs(diff))}の${direction}。要因となる商品/地域を深掘りしましょう。`,
            });
        }

        if (topCategory) {
            insights.push({
                title: `${topCategory.label}カテゴリの深耕`,
                detail: 'セット販売・アップセル・リピート施策を短期実装。レビュー改善と返品要因のケアでCVRを上げます。',
            });
        }

        if (!insights.length) {
            insights.push({
                title: 'データが不足しています',
                detail: 'まずは日付・商品名・カテゴリ・地域・売上・数量を含むファイルをアップロードしてください。',
            });
        }

        this.insightList.innerHTML = insights
            .map((i) => `<div class="insight"><strong>${i.title}</strong><small>${i.detail}</small></div>`)
            .join('');
    }

    renderPreview() {
        const slice = this.data.slice(-6);
        if (!slice.length) {
            this.previewHead.innerHTML = '';
            this.previewBody.innerHTML = '<tr><td colspan="6">データがありません</td></tr>';
            this.previewLabel.textContent = '--';
            return;
        }

        this.previewLabel.textContent = `${slice.length}行表示中`;
        const headers = ['日付', '商品名', 'カテゴリ', '地域', '売上', '数量'];
        this.previewHead.innerHTML = `<tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>`;
        this.previewBody.innerHTML = slice
            .map((row) => `
                <tr>
                    <td>${row.date ? row.date.toISOString().slice(0, 10) : '---'}</td>
                    <td>${row.product}</td>
                    <td>${row.category}</td>
                    <td>${row.region}</td>
                    <td>${this.formatCurrency(row.amount)}</td>
                    <td>${row.quantity}</td>
                </tr>
            `)
            .join('');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SalesInsightApp();
});
