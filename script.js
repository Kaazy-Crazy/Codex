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
            { 受注No: 'A-101', 担当営業: '佐藤', 得意先名: '株式会社ブルーム', 受注日: '2024-07-02', 売上請求日: '2024-07-05', デザイン有: '有', 企画構成有: '無', 品名: 'ブランドLP制作', 数量: 1, 社内売上: 480000 },
            { 受注No: 'A-102', 担当営業: '佐藤', 得意先名: '株式会社ブルーム', 受注日: '2024-07-10', 売上請求日: '2024-07-12', デザイン有: '有', 企画構成有: '有', 品名: 'SNS動画セット', 数量: 3, 社内売上: 360000 },
            { 受注No: 'B-201', 担当営業: '鈴木', 得意先名: 'アクティブ商事', 受注日: '2024-07-04', 売上請求日: '2024-07-06', デザイン有: '無', 企画構成有: '無', 品名: '製品カタログ増刷', 数量: 800, 社内売上: 240000 },
            { 受注No: 'B-202', 担当営業: '鈴木', 得意先名: 'アクティブ商事', 受注日: '2024-07-15', 売上請求日: '2024-07-18', デザイン有: '有', 企画構成有: '無', 品名: '展示会パネル', 数量: 20, 社内売上: 180000 },
            { 受注No: 'C-301', 担当営業: '高橋', 得意先名: 'メディカルリンク', 受注日: '2024-07-08', 売上請求日: '2024-07-11', デザイン有: '無', 企画構成有: '有', 品名: '採用パンフ制作', 数量: 2, 社内売上: 520000 },
            { 受注No: 'D-401', 担当営業: '田中', 得意先名: 'ミライテック', 受注日: '2024-07-01', 売上請求日: '2024-07-03', デザイン有: '有', 企画構成有: '有', 品名: '新製品ロゴ開発', 数量: 1, 社内売上: 280000 },
            { 受注No: 'D-402', 担当営業: '田中', 得意先名: 'ミライテック', 受注日: '2024-07-14', 売上請求日: '2024-07-17', デザイン有: '無', 企画構成有: '無', 品名: 'パッケージ改訂', 数量: 1, 社内売上: 120000 },
            { 受注No: 'E-501', 担当営業: '山本', 得意先名: 'サンライト電機', 受注日: '2024-07-05', 売上請求日: '2024-07-09', デザイン有: '無', 企画構成有: '無', 品名: '取扱説明書印刷', 数量: 1200, 社内売上: 300000 },
            { 受注No: 'F-601', 担当営業: '山本', 得意先名: '北斗物流', 受注日: '2024-07-18', 売上請求日: '2024-07-19', デザイン有: '有', 企画構成有: '無', 品名: '車両マーキング', 数量: 12, 社内売上: 210000 },
            { 受注No: 'G-701', 担当営業: '佐藤', 得意先名: 'リーフ食品', 受注日: '2024-07-09', 売上請求日: '2024-07-13', デザイン有: '無', 企画構成有: '有', 品名: 'キャンペーンPOP', 数量: 300, 社内売上: 260000 },
        ];
        this.handleRows(sample);
    }

    handleRows(rawRows) {
        const rows = rawRows
            .map((row) => this.normalizeRow(row))
            .filter((row) => row.billingDate && !Number.isNaN(row.amount));

        this.data = rows;
        this.updateUI();
    }

    normalizeRow(row) {
        const normalizeKey = (key) => key.trim().toLowerCase();
        const entries = Object.entries(row).map(([k, v]) => [normalizeKey(k), v]);
        const getValue = (keys) => {
            const entry = entries.find(([key]) => keys.includes(key));
            return entry ? entry[1] : undefined;
        };

        const orderNo = getValue(['受注no', '注文番号', 'order']);
        const rep = getValue(['担当営業', '営業', 'sales']);
        const client = getValue(['得意先名', '顧客', 'client', 'customer']);
        const orderDate = getValue(['受注日', '注文日', 'date']);
        const billingDate = getValue(['売上請求日', '請求日', 'billing', 'invoice']);
        const design = getValue(['デザイン有', 'デザイン', 'design']);
        const planning = getValue(['企画構成有', '企画', 'planning']);
        const item = getValue(['品名', '商品', 'item', 'product']);
        const qtyRaw = getValue(['数量', 'qty', '数量(個)', '数量(部)']);
        const amountRaw = getValue(['社内売上', '売上', 'sales', 'amount']);

        const amount = Number(amountRaw) || 0;
        const quantity = Number(qtyRaw) || 1;
        const parsedBilling = billingDate ? new Date(billingDate) : null;
        const billingValid = parsedBilling && !isNaN(parsedBilling);
        const monthKey = billingValid ? `${parsedBilling.getFullYear()}-${String(parsedBilling.getMonth() + 1).padStart(2, '0')}` : '不明';
        const weekKey = billingValid ? `週${Math.ceil(parsedBilling.getDate() / 7)}` : '不明';

        return {
            orderNo: orderNo || '不明',
            rep: rep || '未割当',
            client: client || '不明',
            orderDate: orderDate ? new Date(orderDate) : null,
            billingDate: billingValid ? parsedBilling : null,
            monthKey,
            weekKey,
            designIncluded: `${design}`.includes('有'),
            planningIncluded: `${planning}`.includes('有'),
            item: item || '未記入',
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

        const byClient = this.aggregateBy(this.data, 'client', { includeFlags: true });
        const byRep = this.aggregateBy(this.data, 'rep');
        const byItem = this.aggregateBy(this.data, 'item');
        const byMonth = this.aggregateBy(this.data, 'monthKey', { sort: 'key' });
        const byWeek = this.aggregateBy(this.data, 'weekKey');

        const topClient = byClient[0];
        const topRep = byRep[0];
        const topItem = byItem[0];

        const weekTrend = byWeek.slice(0, 4);

        this.totalSalesEl.textContent = this.formatCurrency(totalSales);
        this.totalQtyEl.textContent = `${totalQty.toLocaleString()} 個`;
        this.orderCountEl.textContent = `取引件数: ${orderCount.toLocaleString()}`;
        this.avgOrderEl.textContent = this.formatCurrency(avgOrder);
        this.avgPriceEl.textContent = `平均単価: ${this.formatCurrency(avgPrice)}`;
        this.topProductEl.textContent = topClient ? `${topClient.label}` : '--';
        this.topCategoryEl.textContent = topItem ? `${topItem.label}` : '--';
        this.topRegionEl.textContent = topRep ? `${topRep.label}` : '--';
        this.dataStatusEl.textContent = `${orderCount}件を読込済み`;

        const monthlyAvg = this.calculateMonthlyAverage(byMonth);
        this.heroSales.textContent = this.formatCurrency(monthlyAvg || totalSales);
        this.heroTrend.textContent = weekTrend[0] ? `${weekTrend[0].label}の請求が直近のピーク` : 'データを確認してください';
        this.heroPoints.innerHTML = this.buildHeroPoints(topClient, topRep, topItem);

        this.renderTrend(weekTrend);
        this.renderRanking(byClient, byItem);
        this.renderInsights({ byClient, byRep, byWeek });
        this.renderPreview();
    }

    aggregateBy(data, key, options = {}) {
        const { sort = 'amount', includeFlags = false } = typeof options === 'string' ? { sort: options } : options;
        const map = new Map();
        data.forEach((row) => {
            const current = map.get(row[key]) || { amount: 0, quantity: 0 };
            map.set(row[key], {
                amount: current.amount + row.amount,
                quantity: current.quantity + row.quantity,
                orderCount: (current.orderCount || 0) + 1,
                designCount: includeFlags ? (current.designCount || 0) + (row.designIncluded ? 1 : 0) : undefined,
                planningCount: includeFlags ? (current.planningCount || 0) + (row.planningIncluded ? 1 : 0) : undefined,
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

    buildHeroPoints(topClient, topRep, topItem) {
        const points = [
            topClient ? `🤝 取引拡大余地: ${topClient.label}（${this.formatCurrency(topClient.amount)}）` : null,
            topItem ? `📦 主要品目: ${topItem.label}` : null,
            topRep ? `👤 受注リーダー: ${topRep.label}` : null,
        ].filter(Boolean);

        return points.map((p) => `<li>${p}</li>`).join('');
    }

    renderTrend(weekTrend) {
        this.trendList.innerHTML = '';
        if (!weekTrend.length) {
            this.trendList.innerHTML = '<li>データが不足しています</li>';
            return;
        }

        this.trendLabel.textContent = `${weekTrend.length}週分`;
        weekTrend.forEach((item) => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${item.label}</strong><br><small>${this.formatCurrency(item.amount)} / ${item.quantity.toLocaleString()}個</small>`;
            this.trendList.appendChild(li);
        });
    }

    renderRanking(byClient, byItem) {
        const rows = [
            ...byClient.slice(0, 5).map((row) => ({ ...row, type: '顧客' })),
            ...byItem.slice(0, 3).map((row) => ({ ...row, type: '品目' })),
        ];
        this.rankingTable.innerHTML = '';
        if (!rows.length) {
            this.rankingTable.innerHTML = '<tr><td colspan="3">データが不足しています</td></tr>';
            this.rankingLabel.textContent = '0件表示';
            return;
        }

        rows.forEach((row) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.type ? `[${row.type}] ` : ''}${row.label}</td>
                <td>${this.formatCurrency(row.amount)}</td>
                <td>${row.quantity.toLocaleString()}個</td>
            `;
            this.rankingTable.appendChild(tr);
        });
        this.rankingLabel.textContent = `${rows.length}件表示`;
    }

    renderInsights({ byClient, byRep, byWeek }) {
        const insights = [];

        const topClient = byClient[0];
        if (topClient) {
            const designRate = topClient.designCount && topClient.orderCount
                ? Math.round((topClient.designCount / topClient.orderCount) * 100)
                : 0;
            insights.push({
                title: `${topClient.label}：重点維持とクロスセル`,
                detail: `請求合計 ${this.formatCurrency(topClient.amount)}。デザイン付帯率${designRate}%なので、企画・動画など非付帯領域の提案で単価引き上げを狙いましょう。`,
            });
        }

        const lowTouch = byClient.find((c) => c.orderCount === 1 && c.amount > 0);
        if (lowTouch) {
            insights.push({
                title: `${lowTouch.label}：初回フォロー必須`,
                detail: `取引1件 ${this.formatCurrency(lowTouch.amount)}。納品後ヒアリングで継続案件を確認し、次の制作メニューをカタログで提示。`,
            });
        }

        const noDesignClients = byClient.filter((c) => c.designCount === 0 && c.amount > 0).slice(0, 1);
        if (noDesignClients.length) {
            insights.push({
                title: `${noDesignClients[0].label}：デザイン提案の余地`,
                detail: 'デザイン未付帯。販促物のリブランディングやテンプレート提案で付加価値を追加し、単価改善を提案。',
            });
        }

        const repGap = byRep.length >= 2 ? byRep[0].amount - byRep[byRep.length - 1].amount : 0;
        if (repGap > 0 && byRep.length >= 2) {
            insights.push({
                title: `営業間の実績差を共有`,
                detail: `${byRep[0].label} と ${byRep[byRep.length - 1].label} で差額 ${this.formatCurrency(repGap)}。案件組成プロセス・提案資料を横展開し底上げ。`,
            });
        }

        if (byWeek.length >= 2) {
            const diff = byWeek[0].amount - byWeek[1].amount;
            const direction = diff >= 0 ? '増加' : '減少';
            insights.push({
                title: `直近週は${direction}傾向`,
                detail: `前週比で${this.formatCurrency(Math.abs(diff))}の${direction}。案件発生日と担当を照合し、再現性/注意点を洗い出してください。`,
            });
        }

        if (!insights.length) {
            insights.push({
                title: 'データが不足しています',
                detail: '「得意先名」「売上請求日」「品名」「数量」「社内売上」が含まれるExcel/CSVをアップロードしてください。',
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
            this.previewBody.innerHTML = '<tr><td colspan="8">データがありません</td></tr>';
            this.previewLabel.textContent = '--';
            return;
        }

        this.previewLabel.textContent = `${slice.length}行表示中`;
        const headers = ['売上請求日', '得意先名', '品名', '数量', '社内売上', '担当営業', 'デザイン有', '企画構成有'];
        this.previewHead.innerHTML = `<tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>`;
        this.previewBody.innerHTML = slice
            .map((row) => `
                <tr>
                    <td>${row.billingDate ? row.billingDate.toISOString().slice(0, 10) : '---'}</td>
                    <td>${row.client}</td>
                    <td>${row.item}</td>
                    <td>${row.quantity}</td>
                    <td>${this.formatCurrency(row.amount)}</td>
                    <td>${row.rep}</td>
                    <td>${row.designIncluded ? '有' : '無'}</td>
                    <td>${row.planningIncluded ? '有' : '無'}</td>
                </tr>
            `)
            .join('');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SalesInsightApp();
});
