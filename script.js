class TodoApp {
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';
        this.theme = this.loadTheme();

        this.todoInput = document.getElementById('todoInput');
        this.categorySelect = document.getElementById('categorySelect');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.totalCount = document.getElementById('totalCount');
        this.completedCount = document.getElementById('completedCount');
        this.remainingCount = document.getElementById('remainingCount');
        this.clearCompletedBtn = document.getElementById('clearCompleted');
        this.clearAllBtn = document.getElementById('clearAll');
        this.themeToggle = document.getElementById('themeToggle');
        this.categoryFilters = document.querySelectorAll('.category-filter');

        this.initEventListeners();
        this.applyTheme();
        this.refreshFromServer();
    }

    initEventListeners() {
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTodo();
            }
        });

        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        this.clearAllBtn.addEventListener('click', () => this.clearAll());
        this.themeToggle.addEventListener('click', () => this.toggleTheme());

        this.categoryFilters.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.category);
            });
        });
    }

    async refreshFromServer() {
        try {
            const response = await fetch('/api/tasks');
            if (!response.ok) throw new Error('タスクの取得に失敗しました');
            this.todos = await response.json();
            this.render();
        } catch (error) {
            console.error(error);
            alert('タスクの読み込みに失敗しました。サーバーを確認してください。');
        }
    }

    async addTodo() {
        const text = this.todoInput.value.trim();
        const category = this.categorySelect.value;

        if (!text) return;

        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, category })
            });

            if (!response.ok) throw new Error('追加に失敗しました');

            const newTodo = await response.json();
            this.todos.push(newTodo);
            this.todoInput.value = '';
            this.categorySelect.value = 'general';
            this.render();
        } catch (error) {
            console.error(error);
            alert('タスクの追加に失敗しました。');
        }
    }

    async toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        const completed = !todo.completed;
        try {
            const response = await fetch(`/api/tasks/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed })
            });

            if (!response.ok) throw new Error('更新に失敗しました');

            todo.completed = completed;
            this.render();
        } catch (error) {
            console.error(error);
            alert('タスクの更新に失敗しました。');
        }
    }

    async deleteTodo(id) {
        try {
            const response = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('削除に失敗しました');
            this.todos = this.todos.filter(t => t.id !== id);
            this.render();
        } catch (error) {
            console.error(error);
            alert('タスクの削除に失敗しました。');
        }
    }

    async clearCompleted() {
        if (!confirm('完了済みのTODOを全て削除しますか？')) return;

        try {
            const response = await fetch('/api/tasks?completedOnly=true', { method: 'DELETE' });
            if (!response.ok) throw new Error('削除に失敗しました');
            this.todos = this.todos.filter(t => !t.completed);
            this.render();
        } catch (error) {
            console.error(error);
            alert('完了済みタスクの削除に失敗しました。');
        }
    }

    async clearAll() {
        if (!confirm('全てのTODOを削除しますか？')) return;

        try {
            const response = await fetch('/api/tasks', { method: 'DELETE' });
            if (!response.ok) throw new Error('削除に失敗しました');
            this.todos = [];
            this.render();
        } catch (error) {
            console.error(error);
            alert('タスクの全削除に失敗しました。');
        }
    }

    setFilter(category) {
        this.currentFilter = category;
        this.categoryFilters.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });
        this.render();
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.saveTheme();
        this.applyTheme();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        this.themeToggle.textContent = this.theme === 'dark' ? '☀️' : '🌙';
    }

    getFilteredTodos() {
        if (this.currentFilter === 'all') {
            return this.todos;
        }
        return this.todos.filter(todo => todo.category === this.currentFilter);
    }

    getCategoryName(category) {
        const categoryNames = {
            general: '一般',
            work: '仕事',
            personal: 'プライベート',
            shopping: '買い物',
            health: '健康'
        };
        return categoryNames[category] || category;
    }

    render() {
        this.renderTodoList();
        this.renderStats();
    }

    renderTodoList() {
        this.todoList.innerHTML = '';
        const filteredTodos = this.getFilteredTodos();

        if (filteredTodos.length === 0) {
            this.renderEmptyState();
            return;
        }

        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;

            li.innerHTML = `
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <span class="category-badge ${todo.category}">${this.getCategoryName(todo.category)}</span>
                <button class="delete-btn" title="削除">×</button>
            `;

            const checkbox = li.querySelector('.todo-checkbox');
            const deleteBtn = li.querySelector('.delete-btn');

            checkbox.addEventListener('change', () => this.toggleTodo(todo.id));
            deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));

            this.todoList.appendChild(li);
        });
    }

    renderEmptyState() {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'empty-state';

        const message = this.currentFilter === 'all'
            ? 'まだTODOがありません'
            : `「${this.getCategoryName(this.currentFilter)}」カテゴリにTODOがありません`;

        const subMessage = this.currentFilter === 'all'
            ? '上の入力欄から新しいTODOを追加してみましょう'
            : '他のカテゴリを選択するか、新しいTODOを追加してみましょう';

        emptyDiv.innerHTML = `
            <span class="emoji">📝</span>
            <p>${message}</p>
            <small>${subMessage}</small>
        `;
        this.todoList.appendChild(emptyDiv);
    }

    renderStats() {
        const filteredTodos = this.getFilteredTodos();
        const total = filteredTodos.length;
        const completed = filteredTodos.filter(t => t.completed).length;
        const remaining = total - completed;

        const filterText = this.currentFilter === 'all' ? '' : `（${this.getCategoryName(this.currentFilter)}）`;

        this.totalCount.textContent = `合計${filterText}: ${total}`;
        this.completedCount.textContent = `完了: ${completed}`;
        this.remainingCount.textContent = `残り: ${remaining}`;
    }

    loadTheme() {
        try {
            const saved = localStorage.getItem('theme');
            return saved || 'light';
        } catch (e) {
            return 'light';
        }
    }

    saveTheme() {
        try {
            localStorage.setItem('theme', this.theme);
        } catch (e) {
            console.error('テーマの保存に失敗しました:', e);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});
