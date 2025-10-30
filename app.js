// ========================================
// グローバル変数とデータ構造
// ========================================

let clients = [];
let currentClientId = null;
let currentPage = 'dashboard';
let charts = {
    weight: null,
    bodyFat: null,
    muscleMass: null
};

// Google API関連
let googleAccessToken = null;
let gapiInited = false;
let gisInited = false;

const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID'; // ユーザーが設定する必要があります
const GOOGLE_API_KEY = 'YOUR_GOOGLE_API_KEY'; // ユーザーが設定する必要があります
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest', 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive.file';

// トレーニング種目リスト
const EXERCISE_LIST = [
    'ベンチプレス',
    'スクワット',
    'デッドリフト',
    'ラットプルダウン',
    'ショルダープレス',
    'バーベルロウ',
    'レッグプレス',
    'レッグカール',
    'レッグエクステンション',
    'チェストフライ',
    'ケーブルクロスオーバー',
    'ダンベルカール',
    'トライセップスエクステンション',
    'サイドレイズ',
    'フロントレイズ',
    'リアデルトフライ',
    'シュラッグ',
    'アブドミナルクランチ',
    'プランク',
    'レッグレイズ',
    'ケーブルクランチ',
    'バイセップスカール',
    'ハンマーカール',
    'プリーチャーカール',
    'トライセップスプッシュダウン',
    'ディップス',
    'プルアップ',
    'チンアップ',
    'インクラインベンチプレス',
    'デクラインベンチプレス',
    'ダンベルプレス',
    'ダンベルフライ',
    'ペックデック',
    'ケーブルフライ',
    'ワンハンドダンベルロウ',
    'Tバーロウ',
    'シーテッドロウ',
    'フェイスプル',
    'アップライトロウ',
    'ブルガリアンスクワット',
    'ランジ',
    'レッグアダクション',
    'レッグアブダクション',
    'カーフレイズ',
    'シーテッドカーフレイズ',
    'グッドモーニング',
    'ヒップスラスト',
    'バックエクステンション',
    'サイドプランク',
    'マウンテンクライマー',
    'バーピー',
    'ボックスジャンプ',
    'バトルロープ',
    'ケトルベルスイング',
    'ダンベルスナッチ',
    'バーベルクリーン',
    'プッシュアップ',
    'ワイドグリッププルアップ',
    '腹筋ローラー',
    'バイシクルクランチ',
    'ロシアンツイスト',
    'その他'
];

// ========================================
// 初期化
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('アプリケーション起動中...');

    // LocalStorageからデータ読み込み
    loadFromLocalStorage();

    // イベントリスナー設定
    setupEventListeners();

    // 初期画面描画
    renderDashboard();
    renderClientsGrid();
    updateStats();

    // 通知権限をリクエスト
    requestNotificationPermission();

    console.log('アプリケーション準備完了');
});

// ========================================
// イベントリスナー設定
// ========================================

function setupEventListeners() {
    // サイドバーナビゲーション
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            navigateToPage(page);
        });
    });

    // サイドバートグル（モバイル）
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('active');
        });
    }

    // 新規顧客登録ボタン
    document.getElementById('addClientBtn').addEventListener('click', openAddClientModal);

    // モーダルクローズボタン
    document.getElementById('modalClose').addEventListener('click', closeClientModal);
    document.getElementById('sessionModalClose').addEventListener('click', closeSessionModal);
    document.getElementById('ticketModalClose').addEventListener('click', closeTicketModal);

    // キャンセルボタン
    document.getElementById('cancelBtn').addEventListener('click', closeClientModal);
    document.getElementById('sessionCancelBtn').addEventListener('click', closeSessionModal);
    document.getElementById('ticketCancelBtn').addEventListener('click', closeTicketModal);

    // フォーム送信
    document.getElementById('clientForm').addEventListener('submit', handleClientFormSubmit);
    document.getElementById('sessionForm').addEventListener('submit', handleSessionFormSubmit);
    document.getElementById('ticketForm').addEventListener('submit', handleTicketFormSubmit);

    // 削除ボタン
    document.getElementById('deleteBtn').addEventListener('click', deleteClient);

    // モーダルタブ
    document.querySelectorAll('.modal-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchModalTab(tabName);
        });
    });

    // セッション記録ボタン
    document.getElementById('addSessionBtn').addEventListener('click', openSessionModal);

    // チケット購入ボタン
    document.getElementById('addTicketBtn').addEventListener('click', openTicketModal);

    // エクササイズ追加ボタン
    document.getElementById('addExerciseBtn').addEventListener('click', addExerciseEntry);

    // レーティングスライダー
    const ratingSlider = document.getElementById('sessionRating');
    if (ratingSlider) {
        ratingSlider.addEventListener('input', function() {
            document.getElementById('ratingValue').textContent = this.value;
        });
    }

    // パーソナルを受ける目的で「その他」選択時の処理
    const trainingPurposeSelect = document.getElementById('trainingPurpose');
    if (trainingPurposeSelect) {
        trainingPurposeSelect.addEventListener('change', function() {
            const otherPurposeGroup = document.getElementById('otherPurposeGroup');
            if (this.value === 'その他') {
                otherPurposeGroup.style.display = 'block';
            } else {
                otherPurposeGroup.style.display = 'none';
                document.getElementById('otherPurpose').value = '';
            }
        });
    }

    // 検索・フィルター
    document.getElementById('searchInput').addEventListener('input', filterClients);
    document.getElementById('statusFilter').addEventListener('change', filterClients);

    // CSV エクスポート/インポート
    document.getElementById('exportBtn').addEventListener('click', exportToCSV);
    document.getElementById('importBtn').addEventListener('click', () => {
        document.getElementById('importCsv').click();
    });
    document.getElementById('importCsv').addEventListener('change', importFromCSV);

    // レポート印刷
    document.getElementById('printReportBtn').addEventListener('click', printClientReport);

    // Google認証
    document.getElementById('googleAuthBtn').addEventListener('click', handleGoogleAuth);

    // カレンダー同期
    document.getElementById('syncCalendarBtn').addEventListener('click', syncWithGoogleCalendar);

    // バックアップ・復元
    document.getElementById('backupToDrive').addEventListener('click', backupToGoogleDrive);
    document.getElementById('restoreFromDrive').addEventListener('click', restoreFromGoogleDrive);

    // 通知設定
    document.getElementById('notificationToggle').addEventListener('change', toggleNotifications);

    // 目標達成アニメーション閉じるボタン
    document.getElementById('goalAchievedClose').addEventListener('click', () => {
        document.getElementById('goalAchievedOverlay').classList.remove('active');
    });

    // モーダル外クリックで閉じる
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeAllModals();
        }
    });
}

// ========================================
// ページナビゲーション
// ========================================

function navigateToPage(pageName) {
    currentPage = pageName;

    // 全ページを非表示
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // ナビゲーションアイテムのアクティブ状態を更新
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-page') === pageName) {
            item.classList.add('active');
        }
    });

    // 選択されたページを表示
    const pageElement = document.getElementById(pageName + 'Page');
    if (pageElement) {
        pageElement.classList.add('active');
    }

    // ページごとの処理
    switch(pageName) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'clients':
            renderClientsGrid();
            break;
        case 'calendar':
            renderCalendar();
            break;
        case 'settings':
            // 設定ページは静的なのでレンダリング不要
            break;
    }

    updateStats();
}

// ========================================
// ダッシュボード
// ========================================

function renderDashboard() {
    renderAlerts();
    renderUpcomingAppointments();
}

function renderAlerts() {
    const container = document.getElementById('alertsContainer');
    container.innerHTML = '';

    const alerts = [];
    const now = new Date();
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    clients.forEach(client => {
        // チケット残数が少ない顧客
        if (client.tickets && client.tickets.remaining <= 2 && client.tickets.remaining > 0) {
            alerts.push({
                type: 'warning',
                client: client,
                message: `チケット残り${client.tickets.remaining}回`,
                icon: 'warning'
            });
        }

        // 前回セッションから2週間以上経過
        if (client.sessions && client.sessions.length > 0) {
            const lastSession = client.sessions[0];
            const lastSessionDate = new Date(lastSession.date);
            if (lastSessionDate < twoWeeksAgo) {
                alerts.push({
                    type: 'danger',
                    client: client,
                    message: `最終セッションから${Math.floor((now - lastSessionDate) / (24 * 60 * 60 * 1000))}日経過`,
                    icon: 'alert'
                });
            }
        }
    });

    if (alerts.length === 0) {
        container.innerHTML = '<div class="alert-item"><p>現在、フォローアップが必要な顧客はいません。</p></div>';
        return;
    }

    alerts.forEach(alert => {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert-item ${alert.type}`;
        alertDiv.innerHTML = `
            <div>
                <strong>${alert.client.name}</strong>
                <p>${alert.message}</p>
            </div>
            <button class="btn btn-secondary btn-small" onclick="openClientDetail('${alert.client.id}')">詳細</button>
        `;
        alertDiv.style.cursor = 'pointer';
        alertDiv.addEventListener('click', (e) => {
            if (!e.target.classList.contains('btn')) {
                openClientDetail(alert.client.id);
            }
        });
        container.appendChild(alertDiv);
    });
}

function renderUpcomingAppointments() {
    const container = document.getElementById('upcomingAppointments');
    container.innerHTML = '';

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    tomorrow.setHours(23, 59, 59, 999);

    const appointments = [];

    clients.forEach(client => {
        if (client.nextAppointment) {
            const appointmentDate = new Date(client.nextAppointment);
            if (appointmentDate >= now && appointmentDate <= tomorrow) {
                appointments.push({
                    client: client,
                    date: appointmentDate
                });
            }
        }
    });

    // 日時順にソート
    appointments.sort((a, b) => a.date - b.date);

    if (appointments.length === 0) {
        container.innerHTML = '<div class="appointment-item"><p>今日・明日の予約はありません。</p></div>';
        return;
    }

    appointments.forEach(appt => {
        const apptDiv = document.createElement('div');
        apptDiv.className = 'appointment-item';
        const timeStr = formatDateTime(appt.date);
        apptDiv.innerHTML = `
            <div>
                <strong>${appt.client.name}</strong>
                <p>${timeStr}</p>
            </div>
            <button class="btn btn-primary btn-small" onclick="openClientDetail('${appt.client.id}')">詳細</button>
        `;
        container.appendChild(apptDiv);
    });
}

// ========================================
// 統計情報の更新
// ========================================

function updateStats() {
    const total = clients.length;
    document.getElementById('totalClients').textContent = total;

    // 今月の売上
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let monthlyRevenue = 0;
    let monthlySessions = 0;

    clients.forEach(client => {
        if (client.ticketHistory) {
            client.ticketHistory.forEach(purchase => {
                const purchaseDate = new Date(purchase.date);
                if (purchaseDate.getMonth() === currentMonth &&
                    purchaseDate.getFullYear() === currentYear &&
                    purchase.paymentStatus === '支払済み') {
                    monthlyRevenue += purchase.price;
                }
            });
        }

        if (client.sessions) {
            client.sessions.forEach(session => {
                const sessionDate = new Date(session.date);
                if (sessionDate.getMonth() === currentMonth &&
                    sessionDate.getFullYear() === currentYear) {
                    monthlySessions++;
                }
            });
        }
    });

    document.getElementById('monthlyRevenue').textContent = '¥' + monthlyRevenue.toLocaleString();
    document.getElementById('monthlySessions').textContent = monthlySessions;

    // チケット残数が少ない顧客
    const lowTicketClients = clients.filter(c =>
        c.tickets && c.tickets.remaining <= 2 && c.tickets.remaining > 0
    ).length;
    document.getElementById('lowTicketClients').textContent = lowTicketClients;
}

// ========================================
// 顧客一覧グリッド
// ========================================

function renderClientsGrid() {
    const grid = document.getElementById('clientsGrid');
    grid.innerHTML = '';

    if (clients.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px;">顧客データがありません。新規顧客を登録してください。</p>';
        return;
    }

    clients.forEach(client => {
        const card = createClientCard(client);
        grid.appendChild(card);
    });
}

function createClientCard(client) {
    const card = document.createElement('div');
    card.className = 'client-card';

    // ステータスクラス
    let statusClass = 'active';
    if (client.status === '休会中') statusClass = 'suspended';
    if (client.status === '退会') statusClass = 'withdrawn';

    // チケット残数バッジ
    let ticketBadgeHTML = '';
    if (client.tickets) {
        let ticketClass = 'high';
        if (client.tickets.remaining === 0) ticketClass = 'low';
        else if (client.tickets.remaining <= 2) ticketClass = 'medium';

        ticketBadgeHTML = `
            <div class="ticket-badge-large ${ticketClass}">
                <div class="ticket-count">${client.tickets.remaining}</div>
                <div class="ticket-label">回分残り</div>
            </div>
        `;
    }

    // 特記事項警告
    let medicalWarningHTML = '';
    if (client.medicalNotes && client.medicalNotes.trim() !== '') {
        medicalWarningHTML = `
            <div class="medical-warning">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                ${client.medicalNotes}
            </div>
        `;
    }

    // 次回予約日
    let nextApptHTML = '';
    if (client.nextAppointment) {
        nextApptHTML = `<p class="next-appointment"><strong>次回予約:</strong> ${formatDateTime(new Date(client.nextAppointment))}</p>`;
    }

    card.innerHTML = `
        <div class="client-card-body">
            <div class="client-card-header">
                <div>
                    <div class="client-name">${client.name}</div>
                    <small>${client.phone}</small>
                </div>
                <span class="client-status ${statusClass}">${client.status || 'アクティブ'}</span>
            </div>
            ${nextApptHTML}
            ${medicalWarningHTML}
        </div>
        ${ticketBadgeHTML}
    `;

    card.addEventListener('click', () => openClientDetail(client.id));

    return card;
}

function filterClients() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;

    let filtered = clients;

    // 検索フィルタ
    if (searchTerm) {
        filtered = filtered.filter(c =>
            (c.name && c.name.toLowerCase().includes(searchTerm)) ||
            (c.phone && c.phone.includes(searchTerm)) ||
            (c.email && c.email.toLowerCase().includes(searchTerm))
        );
    }

    // ステータスフィルタ
    if (statusFilter !== 'all') {
        filtered = filtered.filter(c => (c.status || 'アクティブ') === statusFilter);
    }

    // グリッドを再描画
    const grid = document.getElementById('clientsGrid');
    grid.innerHTML = '';

    if (filtered.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px;">該当する顧客が見つかりません。</p>';
        return;
    }

    filtered.forEach(client => {
        const card = createClientCard(client);
        grid.appendChild(card);
    });
}

// ========================================
// 顧客詳細モーダル
// ========================================

function openAddClientModal() {
    currentClientId = null;
    document.getElementById('modalTitle').textContent = '新規顧客登録';
    document.getElementById('clientForm').reset();
    document.getElementById('clientId').value = generateClientId();
    document.getElementById('deleteBtn').style.display = 'none';

    // 医療アラート非表示
    document.getElementById('medicalAlert').style.display = 'none';

    // 基本情報タブに切り替え
    switchModalTab('info');

    // モーダルを表示
    document.getElementById('clientModal').classList.add('active');
}

function openClientDetail(clientId) {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    currentClientId = clientId;
    document.getElementById('modalTitle').textContent = client.name + ' - 顧客情報';
    document.getElementById('deleteBtn').style.display = 'inline-flex';

    // 基本情報を設定
    document.getElementById('clientId').value = client.id;
    document.getElementById('name').value = client.name || '';
    document.getElementById('furigana').value = client.furigana || '';
    document.getElementById('gender').value = client.gender || '男性';
    document.getElementById('birthdate').value = client.birthdate || '';
    document.getElementById('phone').value = client.phone || '';
    document.getElementById('email').value = client.email || '';
    document.getElementById('address').value = client.address || '';
    document.getElementById('emergencyContact').value = client.emergencyContact || '';
    document.getElementById('emergencyPhone').value = client.emergencyPhone || '';
    document.getElementById('goalDate').value = client.goalDate || '';
    document.getElementById('goalWeight').value = client.goalWeight || '';
    document.getElementById('goalBodyFat').value = client.goalBodyFat || '';
    document.getElementById('goal').value = client.goal || '';
    document.getElementById('medicalNotes').value = client.medicalNotes || '';

    // 特記事項の警告表示
    if (client.medicalNotes && client.medicalNotes.trim() !== '') {
        document.getElementById('medicalAlert').style.display = 'flex';
        document.getElementById('medicalAlertText').textContent = client.medicalNotes;
    } else {
        document.getElementById('medicalAlert').style.display = 'none';
    }

    // セッション履歴を描画
    renderSessionsList(client);

    // グラフを描画
    renderProgressCharts(client);

    // チケット情報を描画
    renderTicketsInfo(client);

    // 基本情報タブに切り替え
    switchModalTab('info');

    // モーダルを表示
    document.getElementById('clientModal').classList.add('active');
}

function closeClientModal() {
    document.getElementById('clientModal').classList.remove('active');
    currentClientId = null;
}

function switchModalTab(tabName) {
    // 全タブの非アクティブ化
    document.querySelectorAll('.modal-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // 選択されたタブをアクティブ化
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(tabName + 'Tab').classList.add('active');

    // グラフタブの場合、グラフを再描画
    if (tabName === 'progress' && currentClientId) {
        const client = clients.find(c => c.id === currentClientId);
        if (client) {
            setTimeout(() => renderProgressCharts(client), 100);
        }
    }
}

function handleClientFormSubmit(e) {
    e.preventDefault();

    // パーソナルを受ける目的
    const trainingPurpose = document.getElementById('trainingPurpose').value;
    const otherPurpose = document.getElementById('otherPurpose').value;
    const finalPurpose = trainingPurpose === 'その他' && otherPurpose ? otherPurpose : trainingPurpose;

    const clientData = {
        id: document.getElementById('clientId').value,
        name: document.getElementById('name').value,
        furigana: document.getElementById('furigana').value,
        gender: document.getElementById('gender').value,
        birthdate: document.getElementById('birthdate').value,
        age: calculateAge(document.getElementById('birthdate').value),
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        address: document.getElementById('address').value,
        emergencyContact: document.getElementById('emergencyContact').value,
        emergencyPhone: document.getElementById('emergencyPhone').value,
        trainingPurpose: finalPurpose,
        goalDate: document.getElementById('goalDate').value,
        goalWeight: parseFloat(document.getElementById('goalWeight').value) || null,
        goalBodyFat: parseFloat(document.getElementById('goalBodyFat').value) || null,
        goal: document.getElementById('goal').value,
        alcoholConsumption: document.getElementById('alcoholConsumption').value,
        smokingHabit: document.getElementById('smokingHabit').value,
        medicalNotes: document.getElementById('medicalNotes').value,
        status: 'アクティブ'
    };

    if (currentClientId) {
        // 更新
        const index = clients.findIndex(c => c.id === currentClientId);
        // 既存のデータを保持
        const existingClient = clients[index];
        clients[index] = {
            ...existingClient,
            ...clientData
        };
    } else {
        // 新規追加
        clientData.tickets = { remaining: 0, total: 0 };
        clientData.sessions = [];
        clientData.ticketHistory = [];

        // 初回身体測定データを取得
        const initialWeight = parseFloat(document.getElementById('initialWeight').value);
        const initialBodyFat = parseFloat(document.getElementById('initialBodyFat').value);
        const initialMuscleMass = parseFloat(document.getElementById('initialMuscleMass').value);
        const initialBasalMetabolism = parseFloat(document.getElementById('initialBasalMetabolism').value);

        // 初回測定データがあれば最初のセッションを自動作成
        if (initialWeight || initialBodyFat || initialMuscleMass) {
            const initialSession = {
                id: 'session_' + Date.now(),
                date: new Date().toISOString().split('T')[0],
                weight: initialWeight || null,
                bodyFat: initialBodyFat || null,
                muscleMass: initialMuscleMass || null,
                basalMetabolism: initialBasalMetabolism || null,
                exercises: [],
                rating: 5,
                notes: '初回測定'
            };
            clientData.sessions.push(initialSession);
        }

        clients.push(clientData);
    }

    saveToLocalStorage();
    renderDashboard();
    renderClientsGrid();
    updateStats();
    closeClientModal();

    showNotification('顧客情報を保存しました');
}

function deleteClient() {
    if (!currentClientId) return;

    const client = clients.find(c => c.id === currentClientId);
    if (!client) return;

    if (confirm(`${client.name}さんのデータを削除してもよろしいですか？この操作は取り消せません。`)) {
        clients = clients.filter(c => c.id !== currentClientId);
        saveToLocalStorage();
        renderDashboard();
        renderClientsGrid();
        updateStats();
        closeClientModal();
        showNotification('顧客データを削除しました');
    }
}

// ========================================
// セッション記録
// ========================================

function openSessionModal() {
    if (!currentClientId) return;

    const client = clients.find(c => c.id === currentClientId);
    if (!client) return;

    // フォームリセット
    document.getElementById('sessionForm').reset();
    document.getElementById('sessionRating').value = 5;
    document.getElementById('ratingValue').textContent = '5';

    // エクササイズリストをクリア
    document.getElementById('exercisesList').innerHTML = '';
    addExerciseEntry(); // 最初のエクササイズを追加

    // 特記事項の警告表示
    if (client.medicalNotes && client.medicalNotes.trim() !== '') {
        document.getElementById('sessionMedicalAlert').style.display = 'flex';
        document.getElementById('sessionMedicalAlertText').textContent = client.medicalNotes;
    } else {
        document.getElementById('sessionMedicalAlert').style.display = 'none';
    }

    // モーダルを表示
    document.getElementById('sessionModal').classList.add('active');
}

function closeSessionModal() {
    document.getElementById('sessionModal').classList.remove('active');
}

function addExerciseEntry() {
    const container = document.getElementById('exercisesList');
    const entryDiv = document.createElement('div');
    entryDiv.className = 'exercise-entry';

    const entryId = 'exercise_' + Date.now();

    entryDiv.innerHTML = `
        <button type="button" class="exercise-remove" onclick="removeExerciseEntry('${entryId}')">削除</button>
        <div class="form-group">
            <label>種目</label>
            <select class="exercise-select">
                ${EXERCISE_LIST.map(ex => `<option value="${ex}">${ex}</option>`).join('')}
            </select>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>セット数</label>
                <input type="number" class="exercise-sets" min="0">
            </div>
            <div class="form-group">
                <label>回数</label>
                <input type="number" class="exercise-reps" min="0">
            </div>
            <div class="form-group">
                <label>重量 (kg)</label>
                <input type="number" class="exercise-weight" step="0.5" min="0">
            </div>
        </div>
    `;

    entryDiv.id = entryId;
    container.appendChild(entryDiv);
}

function removeExerciseEntry(entryId) {
    const entry = document.getElementById(entryId);
    if (entry) {
        entry.remove();
    }
}

// 基礎代謝を計算（LBM使用）
function calculateBasalMetabolism(weight, bodyFat) {
    if (!weight || !bodyFat) return null;

    // 除脂肪体重（LBM）= 体重 - (体重 × 体脂肪率 / 100)
    const lbm = weight - (weight * bodyFat / 100);

    // 基礎代謝 = LBM × 28.5
    const bmr = lbm * 28.5;

    return Math.round(bmr);
}

function handleSessionFormSubmit(e) {
    e.preventDefault();

    if (!currentClientId) return;

    const client = clients.find(c => c.id === currentClientId);
    if (!client) return;

    // エクササイズデータを収集
    const exercises = [];
    document.querySelectorAll('.exercise-entry').forEach(entry => {
        const exercise = {
            name: entry.querySelector('.exercise-select').value,
            sets: parseInt(entry.querySelector('.exercise-sets').value) || 0,
            reps: parseInt(entry.querySelector('.exercise-reps').value) || 0,
            weight: parseFloat(entry.querySelector('.exercise-weight').value) || 0
        };
        exercises.push(exercise);
    });

    // 体重・体脂肪率取得
    const weight = parseFloat(document.getElementById('sessionWeight').value);
    const bodyFat = parseFloat(document.getElementById('sessionBodyFat').value) || null;

    // 基礎代謝を自動計算（初回セッションに基礎代謝データがある場合は初回値を基準にする）
    let basalMetabolism = null;
    if (client.sessions && client.sessions.length > 0) {
        const firstSession = client.sessions[client.sessions.length - 1];
        if (firstSession.basalMetabolism) {
            // 初回に実測値がある場合は、体重・体脂肪率から自動計算
            basalMetabolism = calculateBasalMetabolism(weight, bodyFat);
        }
    }

    // セッションデータ
    const sessionData = {
        id: 'session_' + Date.now(),
        date: new Date().toISOString(),
        weight: weight,
        bodyFat: bodyFat,
        muscleMass: parseFloat(document.getElementById('sessionMuscleMass').value) || null,
        basalMetabolism: basalMetabolism,
        sleepHours: document.getElementById('sessionSleepHours').value || null,
        exercises: exercises,
        rating: parseInt(document.getElementById('sessionRating').value),
        notes: document.getElementById('sessionNotes').value,
        nextAppointment: document.getElementById('nextAppointment').value || null
    };

    // セッション配列がなければ作成
    if (!client.sessions) {
        client.sessions = [];
    }

    // セッションを先頭に追加（新しいものが上）
    client.sessions.unshift(sessionData);

    // チケット残数を減らす
    if (client.tickets && client.tickets.remaining > 0) {
        client.tickets.remaining--;
    }

    // 次回予約日を更新
    if (sessionData.nextAppointment) {
        client.nextAppointment = sessionData.nextAppointment;
    }

    // 目標達成チェック
    checkGoalAchievement(client, sessionData);

    // 保存
    saveToLocalStorage();

    // UI更新
    renderSessionsList(client);
    renderProgressCharts(client);
    updateStats();
    renderDashboard();
    renderClientsGrid();

    closeSessionModal();
    showNotification('セッションを記録しました');

    // Google Calendarに予約を追加
    if (sessionData.nextAppointment && googleAccessToken) {
        addToGoogleCalendar(client, sessionData.nextAppointment);
    }
}

function renderSessionsList(client) {
    const container = document.getElementById('sessionsList');
    container.innerHTML = '';

    if (!client.sessions || client.sessions.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: #888;">セッション履歴がありません</p>';
        return;
    }

    client.sessions.forEach(session => {
        const sessionDiv = document.createElement('div');
        sessionDiv.className = 'session-item';

        const exercisesHTML = session.exercises.map(ex => {
            let details = '';
            if (ex.sets) details += `${ex.sets}セット `;
            if (ex.reps) details += `${ex.reps}回 `;
            if (ex.weight) details += `${ex.weight}kg`;
            return `<div class="exercise-item">${ex.name} ${details}</div>`;
        }).join('');

        sessionDiv.innerHTML = `
            <div class="session-header">
                <div class="session-date">${formatDate(new Date(session.date))}</div>
                <div class="session-rating">⭐ ${session.rating}/10</div>
            </div>
            <div class="session-body">
                <div class="session-measurements">
                    <div class="measurement-item">
                        <span class="measurement-label">体重:</span>
                        <span class="measurement-value">${session.weight}kg</span>
                    </div>
                    ${session.bodyFat ? `
                        <div class="measurement-item">
                            <span class="measurement-label">体脂肪率:</span>
                            <span class="measurement-value">${session.bodyFat}%</span>
                        </div>
                    ` : ''}
                    ${session.muscleMass ? `
                        <div class="measurement-item">
                            <span class="measurement-label">筋肉量:</span>
                            <span class="measurement-value">${session.muscleMass}kg</span>
                        </div>
                    ` : ''}
                </div>
                ${session.exercises.length > 0 ? `
                    <div class="session-exercises">
                        <strong>トレーニング種目:</strong>
                        ${exercisesHTML}
                    </div>
                ` : ''}
                ${session.notes ? `<p><strong>メモ:</strong> ${session.notes}</p>` : ''}
            </div>
        `;

        container.appendChild(sessionDiv);
    });
}

// ========================================
// 進捗グラフ
// ========================================

function renderProgressCharts(client) {
    if (!client.sessions || client.sessions.length === 0) {
        document.getElementById('progressTab').innerHTML = '<p style="text-align: center; padding: 40px; color: #888;">グラフ表示にはセッションデータが必要です</p>';
        return;
    }

    // データを古い順にソート
    const sortedSessions = [...client.sessions].reverse();

    // 目標期日までのデータを抽出
    let sessionsToShow = sortedSessions;
    if (client.goalDate) {
        const goalDate = new Date(client.goalDate);
        sessionsToShow = sortedSessions.filter(s => new Date(s.date) <= goalDate);
    }

    const labels = sessionsToShow.map(s => formatDate(new Date(s.date)));
    const weights = sessionsToShow.map(s => s.weight);
    const bodyFats = sessionsToShow.map(s => s.bodyFat).filter(v => v !== null);
    const muscleMasses = sessionsToShow.map(s => s.muscleMass).filter(v => v !== null);

    // 体重グラフ
    const weightCtx = document.getElementById('weightChart');
    if (weightCtx) {
        if (charts.weight) charts.weight.destroy();

        const datasets = [{
            label: '体重 (kg)',
            data: weights,
            borderColor: '#4a90e2',
            backgroundColor: 'rgba(74, 144, 226, 0.1)',
            tension: 0.4,
            fill: true
        }];

        // 目標体重のライン
        if (client.goalWeight) {
            datasets.push({
                label: '目標体重',
                data: new Array(weights.length).fill(client.goalWeight),
                borderColor: '#d4af37',
                borderDash: [5, 5],
                pointRadius: 0,
                fill: false
            });
        }

        charts.weight = new Chart(weightCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    title: {
                        display: true,
                        text: '体重の推移',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        display: true
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    }

    // 体脂肪率グラフ
    const bodyFatCtx = document.getElementById('bodyFatChart');
    if (bodyFatCtx && bodyFats.length > 0) {
        if (charts.bodyFat) charts.bodyFat.destroy();

        const bodyFatLabels = sessionsToShow.filter(s => s.bodyFat !== null).map(s => formatDate(new Date(s.date)));

        const datasets = [{
            label: '体脂肪率 (%)',
            data: bodyFats,
            borderColor: '#f39c12',
            backgroundColor: 'rgba(243, 156, 18, 0.1)',
            tension: 0.4,
            fill: true
        }];

        // 目標体脂肪率のライン
        if (client.goalBodyFat) {
            datasets.push({
                label: '目標体脂肪率',
                data: new Array(bodyFats.length).fill(client.goalBodyFat),
                borderColor: '#d4af37',
                borderDash: [5, 5],
                pointRadius: 0,
                fill: false
            });
        }

        charts.bodyFat = new Chart(bodyFatCtx, {
            type: 'line',
            data: {
                labels: bodyFatLabels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    title: {
                        display: true,
                        text: '体脂肪率の推移',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        display: true
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    }

    // 筋肉量グラフ
    const muscleMassCtx = document.getElementById('muscleMassChart');
    if (muscleMassCtx && muscleMasses.length > 0) {
        if (charts.muscleMass) charts.muscleMass.destroy();

        const muscleMassLabels = sessionsToShow.filter(s => s.muscleMass !== null).map(s => formatDate(new Date(s.date)));

        charts.muscleMass = new Chart(muscleMassCtx, {
            type: 'line',
            data: {
                labels: muscleMassLabels,
                datasets: [{
                    label: '筋肉量 (kg)',
                    data: muscleMasses,
                    borderColor: '#2ecc71',
                    backgroundColor: 'rgba(46, 204, 113, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    title: {
                        display: true,
                        text: '筋肉量の推移',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        display: true
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    }
}

// ========================================
// チケット管理
// ========================================

function openTicketModal() {
    if (!currentClientId) return;

    document.getElementById('ticketForm').reset();
    document.querySelector('input[name="ticketType"][value="4"]').checked = true;
    document.getElementById('ticketModal').classList.add('active');
}

function closeTicketModal() {
    document.getElementById('ticketModal').classList.remove('active');
}

function handleTicketFormSubmit(e) {
    e.preventDefault();

    if (!currentClientId) return;

    const client = clients.find(c => c.id === currentClientId);
    if (!client) return;

    const selectedTicket = document.querySelector('input[name="ticketType"]:checked');
    const ticketCount = parseInt(selectedTicket.value);
    const ticketPrice = parseInt(selectedTicket.getAttribute('data-price'));

    const purchaseData = {
        id: 'purchase_' + Date.now(),
        date: new Date().toISOString(),
        count: ticketCount,
        price: ticketPrice,
        paymentMethod: document.getElementById('ticketPaymentMethod').value,
        paymentStatus: document.getElementById('ticketPaymentStatus').value
    };

    // チケット履歴に追加
    if (!client.ticketHistory) {
        client.ticketHistory = [];
    }
    client.ticketHistory.unshift(purchaseData);

    // チケット残数を更新
    if (!client.tickets) {
        client.tickets = { remaining: 0, total: 0 };
    }
    client.tickets.remaining += ticketCount;
    client.tickets.total += ticketCount;

    // 保存
    saveToLocalStorage();

    // UI更新
    renderTicketsInfo(client);
    updateStats();
    renderDashboard();
    renderClientsGrid();

    closeTicketModal();
    showNotification(`${ticketCount}回チケットを追加しました`);
}

function renderTicketsInfo(client) {
    // 現在のチケット情報
    const currentTicketsDiv = document.getElementById('currentTickets');
    currentTicketsDiv.innerHTML = '';

    if (!client.tickets) {
        client.tickets = { remaining: 0, total: 0 };
    }

    const ticketCard = document.createElement('div');
    ticketCard.className = 'ticket-info-card';
    ticketCard.innerHTML = `
        <div class="ticket-count">${client.tickets.remaining}</div>
        <div class="ticket-label">残りチケット数</div>
    `;
    currentTicketsDiv.appendChild(ticketCard);

    // チケット購入履歴
    const historyDiv = document.getElementById('ticketHistory');
    historyDiv.innerHTML = '<h3 style="margin-bottom: 16px;">購入履歴</h3>';

    if (!client.ticketHistory || client.ticketHistory.length === 0) {
        historyDiv.innerHTML += '<p style="text-align: center; padding: 20px; color: #888;">購入履歴がありません</p>';
        return;
    }

    client.ticketHistory.forEach(purchase => {
        const historyItem = document.createElement('div');
        historyItem.className = 'ticket-history-item';

        const statusClass = purchase.paymentStatus === '支払済み' ? 'paid' : 'unpaid';

        historyItem.innerHTML = `
            <div>
                <strong>${purchase.count}回チケット</strong>
                <p>${formatDate(new Date(purchase.date))} - ¥${purchase.price.toLocaleString()}</p>
                <small>${purchase.paymentMethod}</small>
            </div>
            <span class="payment-status ${statusClass}">${purchase.paymentStatus}</span>
        `;

        historyDiv.appendChild(historyItem);
    });
}

// ========================================
// 目標達成チェック
// ========================================

function checkGoalAchievement(client, sessionData) {
    let achieved = false;
    let achievementMessage = '';

    // 体重目標
    if (client.goalWeight && sessionData.weight <= client.goalWeight) {
        achieved = true;
        achievementMessage = `目標体重 ${client.goalWeight}kg を達成しました！現在の体重: ${sessionData.weight}kg`;
    }

    // 体脂肪率目標
    if (client.goalBodyFat && sessionData.bodyFat && sessionData.bodyFat <= client.goalBodyFat) {
        achieved = true;
        achievementMessage = `目標体脂肪率 ${client.goalBodyFat}% を達成しました！現在の体脂肪率: ${sessionData.bodyFat}%`;
    }

    if (achieved) {
        showGoalAchievement(client.name, achievementMessage);
    }
}

function showGoalAchievement(clientName, message) {
    const overlay = document.getElementById('goalAchievedOverlay');
    const textElement = document.getElementById('goalAchievedText');

    textElement.textContent = `${clientName}さんが${message}`;
    overlay.classList.add('active');

    // 紙吹雪アニメーション（簡易版）
    createConfetti();
}

function createConfetti() {
    // 簡易的な紙吹雪エフェクト
    const colors = ['#d4af37', '#4a90e2', '#2ecc71', '#f39c12', '#e74c3c'];
    const confettiContainer = document.querySelector('.confetti');

    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'absolute';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = Math.random() * 100 + '%';
        confetti.style.opacity = Math.random();
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        confettiContainer.appendChild(confetti);

        // アニメーション
        setTimeout(() => {
            confetti.style.transition = 'all 3s ease-out';
            confetti.style.top = '100%';
            confetti.style.opacity = '0';
        }, 100);
    }
}

// ========================================
// カレンダー
// ========================================

function renderCalendar() {
    const calendarView = document.getElementById('calendarView');
    calendarView.innerHTML = '<h3>予約一覧</h3>';

    // 予約のある顧客を収集
    const appointments = [];
    clients.forEach(client => {
        if (client.nextAppointment) {
            appointments.push({
                client: client,
                date: new Date(client.nextAppointment)
            });
        }
    });

    // 日時順にソート
    appointments.sort((a, b) => a.date - b.date);

    if (appointments.length === 0) {
        calendarView.innerHTML += '<p style="text-align: center; padding: 40px; color: #888;">予約がありません</p>';
        return;
    }

    const listDiv = document.createElement('div');
    listDiv.style.display = 'grid';
    listDiv.style.gap = '16px';
    listDiv.style.marginTop = '20px';

    appointments.forEach(appt => {
        const apptDiv = document.createElement('div');
        apptDiv.className = 'appointment-item';
        apptDiv.innerHTML = `
            <div>
                <strong>${appt.client.name}</strong>
                <p>${formatDateTime(appt.date)}</p>
            </div>
            <button class="btn btn-primary btn-small" onclick="openClientDetail('${appt.client.id}')">詳細</button>
        `;
        listDiv.appendChild(apptDiv);
    });

    calendarView.appendChild(listDiv);
}

// ========================================
// Google連携
// ========================================

function handleGoogleAuth() {
    if (googleAccessToken) {
        // ログアウト
        googleAccessToken = null;
        document.getElementById('googleAuthText').textContent = 'Google連携';
        showNotification('Googleアカウントからログアウトしました');
    } else {
        // ログイン
        showNotification('Google連携機能は準備中です。Google Cloud Consoleでプロジェクトを作成し、CLIENT_IDとAPI_KEYを設定してください。');
        // 実際の実装では、Google OAuth2.0フローを実装
    }
}

function syncWithGoogleCalendar() {
    if (!googleAccessToken) {
        showNotification('先にGoogle連携を行ってください');
        return;
    }

    showNotification('カレンダーと同期中...');
    // 実際の実装では、Google Calendar APIを使用
}

function addToGoogleCalendar(client, appointmentDateTime) {
    if (!googleAccessToken) return;

    // Google Calendar APIを使用して予約を追加
    // 実装は省略（実際にはGoogle Calendar APIを呼び出す）
    console.log('Adding to Google Calendar:', client.name, appointmentDateTime);
}

function backupToGoogleDrive() {
    if (!googleAccessToken) {
        showNotification('先にGoogle連携を行ってください');
        return;
    }

    const dataToBackup = JSON.stringify(clients, null, 2);
    const blob = new Blob([dataToBackup], { type: 'application/json' });

    showNotification('Google Driveにバックアップ中...');
    // 実際の実装では、Google Drive APIを使用
    // 実装は省略
}

function restoreFromGoogleDrive() {
    if (!googleAccessToken) {
        showNotification('先にGoogle連携を行ってください');
        return;
    }

    showNotification('Google Driveから復元中...');
    // 実際の実装では、Google Drive APIを使用
    // 実装は省略
}

// ========================================
// 通知
// ========================================

function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

function toggleNotifications(e) {
    const enabled = e.target.checked;
    localStorage.setItem('notificationsEnabled', enabled);

    if (enabled) {
        showNotification('通知が有効になりました');
        scheduleNotifications();
    } else {
        showNotification('通知が無効になりました');
    }
}

function scheduleNotifications() {
    // 予約のリマインダー通知をスケジュール
    // Service Workerと連携して実装
    // 実装は省略
}

function showNotification(message) {
    // 簡易的なトースト通知
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.background = '#1a2332';
    toast.style.color = 'white';
    toast.style.padding = '16px 24px';
    toast.style.borderRadius = '10px';
    toast.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)';
    toast.style.zIndex = '10000';
    toast.style.animation = 'slideInRight 0.4s ease';
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.4s ease';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 400);
    }, 3000);
}

// ========================================
// レポート印刷
// ========================================

function printClientReport() {
    if (!currentClientId) return;

    const client = clients.find(c => c.id === currentClientId);
    if (!client) return;

    const printReport = document.getElementById('printReport');

    // 最新と最古のセッションデータ
    let latestSession = null;
    let oldestSession = null;

    if (client.sessions && client.sessions.length > 0) {
        latestSession = client.sessions[0];
        oldestSession = client.sessions[client.sessions.length - 1];
    }

    // 変化量を計算
    let weightChange = '';
    let bodyFatChange = '';

    if (latestSession && oldestSession) {
        const weightDiff = latestSession.weight - oldestSession.weight;
        weightChange = `${weightDiff > 0 ? '+' : ''}${weightDiff.toFixed(1)}kg`;

        if (latestSession.bodyFat && oldestSession.bodyFat) {
            const bodyFatDiff = latestSession.bodyFat - oldestSession.bodyFat;
            bodyFatChange = `${bodyFatDiff > 0 ? '+' : ''}${bodyFatDiff.toFixed(1)}%`;
        }
    }

    // レポートHTML生成
    printReport.innerHTML = `
        <div style="max-width: 800px; margin: 0 auto; font-family: sans-serif;">
            <h1 style="text-align: center; border-bottom: 3px solid #1a2332; padding-bottom: 10px;">
                トレーニング進捗レポート
            </h1>

            <div style="margin: 30px 0;">
                <h2 style="color: #1a2332;">基本情報</h2>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd; background: #f8f9fa;"><strong>氏名</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${client.name}</td>
                        <td style="padding: 8px; border: 1px solid #ddd; background: #f8f9fa;"><strong>性別</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${client.gender}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd; background: #f8f9fa;"><strong>電話番号</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${client.phone}</td>
                        <td style="padding: 8px; border: 1px solid #ddd; background: #f8f9fa;"><strong>年齢</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${client.age || '-'}歳</td>
                    </tr>
                </table>
            </div>

            <div style="margin: 30px 0;">
                <h2 style="color: #1a2332;">目標</h2>
                <div style="padding: 15px; background: #f8f9fa; border-radius: 8px;">
                    <p><strong>目標期日:</strong> ${client.goalDate ? formatDate(new Date(client.goalDate)) : '未設定'}</p>
                    <p><strong>目標体重:</strong> ${client.goalWeight ? client.goalWeight + 'kg' : '未設定'}</p>
                    <p><strong>目標体脂肪率:</strong> ${client.goalBodyFat ? client.goalBodyFat + '%' : '未設定'}</p>
                    <p><strong>目標内容:</strong> ${client.goal || '未設定'}</p>
                </div>
            </div>

            ${client.medicalNotes ? `
                <div style="margin: 30px 0; padding: 15px; background: #fff3e0; border-left: 4px solid #f39c12; border-radius: 8px;">
                    <h3 style="color: #f39c12; margin-top: 0;">⚠️ 特記事項</h3>
                    <p>${client.medicalNotes}</p>
                </div>
            ` : ''}

            <div style="margin: 30px 0;">
                <h2 style="color: #1a2332;">進捗データ</h2>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="background: #1a2332; color: white;">
                        <th style="padding: 12px; border: 1px solid #ddd;">項目</th>
                        <th style="padding: 12px; border: 1px solid #ddd;">開始時</th>
                        <th style="padding: 12px; border: 1px solid #ddd;">現在</th>
                        <th style="padding: 12px; border: 1px solid #ddd;">変化量</th>
                    </tr>
                    ${latestSession && oldestSession ? `
                        <tr>
                            <td style="padding: 10px; border: 1px solid #ddd; background: #f8f9fa;"><strong>体重</strong></td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${oldestSession.weight}kg</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${latestSession.weight}kg</td>
                            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">${weightChange}</td>
                        </tr>
                        ${latestSession.bodyFat && oldestSession.bodyFat ? `
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd; background: #f8f9fa;"><strong>体脂肪率</strong></td>
                                <td style="padding: 10px; border: 1px solid #ddd;">${oldestSession.bodyFat}%</td>
                                <td style="padding: 10px; border: 1px solid #ddd;">${latestSession.bodyFat}%</td>
                                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">${bodyFatChange}</td>
                            </tr>
                        ` : ''}
                    ` : '<tr><td colspan="4" style="padding: 20px; text-align: center;">セッションデータがありません</td></tr>'}
                </table>
            </div>

            <div style="margin: 30px 0;">
                <h2 style="color: #1a2332;">直近のセッション履歴</h2>
                ${client.sessions && client.sessions.length > 0 ? client.sessions.slice(0, 5).map(session => `
                    <div style="padding: 15px; margin-bottom: 10px; background: #f8f9fa; border-radius: 8px;">
                        <p><strong>${formatDate(new Date(session.date))}</strong> - 評価: ⭐${session.rating}/10</p>
                        <p>体重: ${session.weight}kg ${session.bodyFat ? `/ 体脂肪率: ${session.bodyFat}%` : ''}</p>
                        ${session.exercises.length > 0 ? `
                            <p><strong>種目:</strong> ${session.exercises.map(ex => ex.name).join(', ')}</p>
                        ` : ''}
                    </div>
                `).join('') : '<p>セッション履歴がありません</p>'}
            </div>

            <div style="margin-top: 50px; padding-top: 20px; border-top: 2px solid #ddd; text-align: center; color: #888;">
                <p>発行日: ${formatDate(new Date())}</p>
                <p>PT Manager - パーソナルトレーナー顧客管理システム</p>
            </div>
        </div>
    `;

    // DOMの更新を待ってから印刷実行
    setTimeout(() => {
        window.print();
    }, 100);
}

// ========================================
// CSV エクスポート/インポート
// ========================================

function exportToCSV() {
    const headers = ['顧客ID', '氏名', 'ふりがな', '性別', '生年月日', '年齢', '電話番号', 'メールアドレス',
                     '住所', 'ステータス', '目標期日', '目標体重', '目標体脂肪率', '目標内容', '特記事項'];

    const csvContent = [
        headers.join(','),
        ...clients.map(c => [
            c.id, c.name, c.furigana, c.gender, c.birthdate, c.age, c.phone, c.email,
            c.address, c.status, c.goalDate, c.goalWeight, c.goalBodyFat, c.goal, c.medicalNotes
        ].map(field => `"${field || ''}"`).join(','))
    ].join('\n');

    // BOM付きUTF-8でエンコード
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `顧客データ_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification('CSVファイルをエクスポートしました');
}

function importFromCSV(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const lines = text.split('\n');
        const newClients = [];

        // ヘッダー行をスキップ
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;

            const values = parseCSVLine(lines[i]);
            if (values.length < 2) continue;

            newClients.push({
                id: values[0] || generateClientId(),
                name: values[1] || '',
                furigana: values[2] || '',
                gender: values[3] || '男性',
                birthdate: values[4] || '',
                age: values[5] || calculateAge(values[4]),
                phone: values[6] || '',
                email: values[7] || '',
                address: values[8] || '',
                status: values[9] || 'アクティブ',
                goalDate: values[10] || '',
                goalWeight: parseFloat(values[11]) || null,
                goalBodyFat: parseFloat(values[12]) || null,
                goal: values[13] || '',
                medicalNotes: values[14] || '',
                tickets: { remaining: 0, total: 0 },
                sessions: [],
                ticketHistory: []
            });
        }

        if (confirm(`${newClients.length}件のデータをインポートしますか？\n既存のデータは上書きされます。`)) {
            clients = newClients;
            saveToLocalStorage();
            renderDashboard();
            renderClientsGrid();
            updateStats();
            showNotification('インポートが完了しました');
        }
    };

    reader.readAsText(file, 'UTF-8');
    event.target.value = '';
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current.trim());
    return result;
}

// ========================================
// データ管理
// ========================================

function saveToLocalStorage() {
    try {
        localStorage.setItem('ptManagerClients', JSON.stringify(clients));
        console.log('データを保存しました');
    } catch (e) {
        console.error('データ保存エラー:', e);
        showNotification('データの保存に失敗しました');
    }
}

function loadFromLocalStorage() {
    try {
        const data = localStorage.getItem('ptManagerClients');
        if (data) {
            clients = JSON.parse(data);
            console.log(`${clients.length}件の顧客データを読み込みました`);
        } else {
            // サンプルデータをロード
            loadSampleData();
        }
    } catch (e) {
        console.error('データ読み込みエラー:', e);
        clients = [];
    }
}

function loadSampleData() {
    clients = [
        {
            id: '001',
            name: '山田太郎',
            furigana: 'やまだたろう',
            gender: '男性',
            birthdate: '1985-04-15',
            age: 40,
            phone: '090-1234-5678',
            email: 'yamada@example.com',
            address: '東京都渋谷区1-2-3',
            emergencyContact: '山田花子',
            emergencyPhone: '090-8765-4321',
            status: 'アクティブ',
            goalDate: '2025-12-31',
            goalWeight: 70,
            goalBodyFat: 15,
            goal: '体重を70kgまで減量し、体脂肪率15%を目指す',
            medicalNotes: '',
            tickets: { remaining: 6, total: 8 },
            sessions: [
                {
                    id: 'session_1',
                    date: '2025-10-28T10:00:00',
                    weight: 78,
                    bodyFat: 22,
                    muscleMass: 58,
                    exercises: [
                        { name: 'ベンチプレス', sets: 3, reps: 10, weight: 60 },
                        { name: 'スクワット', sets: 3, reps: 12, weight: 80 }
                    ],
                    rating: 8,
                    notes: '調子良好'
                }
            ],
            ticketHistory: [
                {
                    id: 'purchase_1',
                    date: '2025-10-01T00:00:00',
                    count: 8,
                    price: 70000,
                    paymentMethod: 'クレジットカード',
                    paymentStatus: '支払済み'
                }
            ],
            nextAppointment: '2025-11-02T10:00:00'
        }
    ];
    saveToLocalStorage();
}

// ========================================
// ユーティリティ関数
// ========================================

function generateClientId() {
    const maxId = clients.reduce((max, c) => {
        const num = parseInt(c.id);
        return num > max ? num : max;
    }, 0);

    return String(maxId + 1).padStart(3, '0');
}

function calculateAge(birthdate) {
    if (!birthdate) return '';
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    return age;
}

function formatDate(date) {
    if (!date) return '-';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
}

function formatDateTime(date) {
    if (!date) return '-';
    const dateStr = formatDate(date);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${dateStr} ${hours}:${minutes}`;
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

// グローバル関数（HTMLから呼び出すため）
window.openClientDetail = openClientDetail;
window.removeExerciseEntry = removeExerciseEntry;

console.log('app.js loaded successfully');
