class CheckinApp {
    constructor() {
        this.attendees = [];
        this.statusFilter = 'all';
        this.searchQuery = '';

        this.cacheElements();
        this.bindEvents();
        this.loadAttendees();
    }

    cacheElements() {
        this.form = document.getElementById('attendeeForm');
        this.nameInput = document.getElementById('name');
        this.emailInput = document.getElementById('email');
        this.phoneInput = document.getElementById('phone');
        this.ticketTypeSelect = document.getElementById('ticketType');
        this.guestsInput = document.getElementById('guests');
        this.noteInput = document.getElementById('note');
        this.attendeeList = document.getElementById('attendeeList');
        this.template = document.getElementById('attendeeTemplate');
        this.searchInput = document.getElementById('searchInput');
        this.statusButtons = Array.from(document.querySelectorAll('#statusFilters .segmented__btn'));

        this.statTotal = document.getElementById('statTotal');
        this.statCheckedIn = document.getElementById('statCheckedIn');
        this.statWaiting = document.getElementById('statWaiting');
    }

    bindEvents() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        this.statusButtons.forEach((btn) => {
            btn.addEventListener('click', () => {
                this.statusButtons.forEach((b) => b.classList.remove('active'));
                btn.classList.add('active');
                this.statusFilter = btn.dataset.status;
                this.render();
            });
        });

        this.searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.render();
        });
    }

    async loadAttendees() {
        try {
            const res = await fetch('/api/attendees');
            this.attendees = await res.json();
            this.render();
        } catch (error) {
            console.error('読み込みに失敗しました', error);
            this.showInlineMessage('来場者リストの読み込みに失敗しました。サーバーを確認してください。');
        }
    }

    async handleSubmit() {
        const payload = {
            name: this.nameInput.value.trim(),
            email: this.emailInput.value.trim(),
            phone: this.phoneInput.value.trim(),
            ticketType: this.ticketTypeSelect.value,
            guests: Number(this.guestsInput.value) || 1,
            note: this.noteInput.value.trim()
        };

        if (!payload.name) {
            this.showInlineMessage('氏名は必須です。');
            return;
        }

        try {
            const res = await fetch('/api/attendees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.errors ? data.errors.join(' ') : '登録に失敗しました。');
            }

            const attendee = await res.json();
            this.attendees = [attendee, ...this.attendees];
            this.form.reset();
            this.guestsInput.value = 1;
            this.ticketTypeSelect.value = 'standard';
            this.render();
        } catch (error) {
            this.showInlineMessage(error.message);
        }
    }

    async toggleCheckin(id, checkedIn) {
        try {
            const res = await fetch(`/api/attendees/${id}/checkin`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ checkedIn })
            });

            if (!res.ok) {
                throw new Error('ステータスの更新に失敗しました。');
            }

            const updated = await res.json();
            this.attendees = this.attendees.map((item) => (item.id === updated.id ? updated : item));
            this.render();
        } catch (error) {
            this.showInlineMessage(error.message);
        }
    }

    async deleteAttendee(id) {
        const confirmed = confirm('この来場者をリストから削除しますか？');
        if (!confirmed) return;

        try {
            const res = await fetch(`/api/attendees/${id}`, { method: 'DELETE' });
            if (!res.ok && res.status !== 204) {
                throw new Error('削除に失敗しました。');
            }
            this.attendees = this.attendees.filter((item) => item.id !== id);
            this.render();
        } catch (error) {
            this.showInlineMessage(error.message);
        }
    }

    showInlineMessage(message) {
        const node = document.createElement('div');
        node.className = 'empty';
        node.textContent = message;
        this.attendeeList.prepend(node);
        setTimeout(() => node.remove(), 2500);
    }

    filterAttendees() {
        return this.attendees
            .filter((attendee) => {
                if (this.statusFilter === 'checked') return attendee.checkedIn;
                if (this.statusFilter === 'waiting') return !attendee.checkedIn;
                return true;
            })
            .filter((attendee) => {
                if (!this.searchQuery) return true;
                const keyword = this.searchQuery;
                return (
                    attendee.name.toLowerCase().includes(keyword) ||
                    attendee.email.toLowerCase().includes(keyword)
                );
            });
    }

    render() {
        this.renderStats();
        this.renderList();
    }

    renderStats() {
        const total = this.attendees.length;
        const checked = this.attendees.filter((a) => a.checkedIn).length;
        const waiting = total - checked;

        this.statTotal.textContent = `${total} 名`;
        this.statCheckedIn.textContent = `${checked} 名`;
        this.statWaiting.textContent = `${waiting} 名`;
    }

    renderList() {
        this.attendeeList.innerHTML = '';
        const list = this.filterAttendees();

        if (list.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'empty';
            empty.textContent = '表示できる来場者がまだいません。登録フォームから追加してください。';
            this.attendeeList.appendChild(empty);
            return;
        }

        list.forEach((attendee) => {
            const node = this.template.content.cloneNode(true);
            const card = node.querySelector('.attendee-card');
            card.dataset.id = attendee.id;

            card.querySelector('.eyebrow').textContent = `#${attendee.id}`;
            card.querySelector('.attendee-card__name').textContent = attendee.name;
            card.querySelector('.attendee-card__contact').textContent = this.composeContact(attendee);
            card.querySelector('.attendee-card__note').textContent = attendee.note || 'メモなし';
            card.querySelector('.chip--type').textContent = this.getTicketLabel(attendee.ticketType);
            card.querySelector('.chip--guests').textContent = `${attendee.guests} 名`;

            const statusChip = card.querySelector('.chip--status');
            statusChip.textContent = attendee.checkedIn ? 'チェックイン済み' : '未入場';
            statusChip.classList.toggle('checked', attendee.checkedIn);
            statusChip.classList.toggle('waiting', !attendee.checkedIn);

            const timestamp = card.querySelector('.timestamp');
            timestamp.textContent = attendee.checkedIn
                ? `入場: ${this.formatDate(attendee.checkedInAt)}`
                : `登録: ${this.formatDate(attendee.createdAt)}`;

            const checkinBtn = card.querySelector('.checkin-btn');
            checkinBtn.textContent = attendee.checkedIn ? '未入場に戻す' : 'チェックイン';
            checkinBtn.addEventListener('click', () => this.toggleCheckin(attendee.id, !attendee.checkedIn));

            const deleteBtn = card.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => this.deleteAttendee(attendee.id));

            this.attendeeList.appendChild(node);
        });
    }

    formatDate(value) {
        if (!value) return '—';
        const date = new Date(value);
        return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date
            .getMinutes()
            .toString()
            .padStart(2, '0')}`;
    }

    composeContact(attendee) {
        const email = attendee.email ? `📧 ${attendee.email}` : '';
        const phone = attendee.phone ? `☎️ ${attendee.phone}` : '';
        return [email, phone].filter(Boolean).join(' / ') || '連絡先未登録';
    }

    getTicketLabel(type) {
        const map = {
            standard: '一般',
            vip: 'VIP',
            vendor: '出店者',
            staff: 'スタッフ'
        };
        return map[type] || '一般';
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new CheckinApp();
});
