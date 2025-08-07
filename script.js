class TodoApp {
    constructor() {
        this.todos = this.loadTodos();
        this.todoIdCounter = this.getNextId();
        
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.totalCount = document.getElementById('totalCount');
        this.completedCount = document.getElementById('completedCount');
        this.remainingCount = document.getElementById('remainingCount');
        this.clearCompletedBtn = document.getElementById('clearCompleted');
        this.clearAllBtn = document.getElementById('clearAll');
        
        this.initEventListeners();
        this.render();
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
    }
    
    addTodo() {
        const text = this.todoInput.value.trim();
        if (!text) return;
        
        const todo = {
            id: this.todoIdCounter++,
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.todos.push(todo);
        this.todoInput.value = '';
        this.saveTodos();
        this.render();
    }
    
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    }
    
    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveTodos();
        this.render();
    }
    
    clearCompleted() {
        if (confirm('完了済みのTODOを全て削除しますか？')) {
            this.todos = this.todos.filter(t => !t.completed);
            this.saveTodos();
            this.render();
        }
    }
    
    clearAll() {
        if (confirm('全てのTODOを削除しますか？')) {
            this.todos = [];
            this.saveTodos();
            this.render();
        }
    }
    
    render() {
        this.renderTodoList();
        this.renderStats();
    }
    
    renderTodoList() {
        this.todoList.innerHTML = '';
        
        if (this.todos.length === 0) {
            this.renderEmptyState();
            return;
        }
        
        this.todos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            
            li.innerHTML = `
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
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
        emptyDiv.innerHTML = `
            <span class="emoji">📝</span>
            <p>まだTODOがありません</p>
            <small>上の入力欄から新しいTODOを追加してみましょう</small>
        `;
        this.todoList.appendChild(emptyDiv);
    }
    
    renderStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const remaining = total - completed;
        
        this.totalCount.textContent = `合計: ${total}`;
        this.completedCount.textContent = `完了: ${completed}`;
        this.remainingCount.textContent = `残り: ${remaining}`;
    }
    
    loadTodos() {
        try {
            const saved = localStorage.getItem('todos');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('TODOの読み込みに失敗しました:', e);
            return [];
        }
    }
    
    saveTodos() {
        try {
            localStorage.setItem('todos', JSON.stringify(this.todos));
        } catch (e) {
            console.error('TODOの保存に失敗しました:', e);
            alert('データの保存に失敗しました。ブラウザの容量不足の可能性があります。');
        }
    }
    
    getNextId() {
        if (this.todos.length === 0) return 1;
        return Math.max(...this.todos.map(t => t.id)) + 1;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// アプリケーションの初期化
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});